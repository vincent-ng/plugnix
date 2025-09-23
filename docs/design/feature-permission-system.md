### **指引：为你的插件集成权限控制**

#### **1. 欢迎！为什么要关心权限？**

欢迎来到我们的插件式前端框架！当你开发新功能时，很快就会遇到一个问题：并非所有用户都应该能看到所有东西或做所有事。例如，只有管理员才能删除用户，只有内容编辑才能发布文章。

本指引将带你了解我们统一的权限系统。它被设计用来：
*   **保护后端API**：确保只有授权用户才能执行敏感操作（如增删改查数据）。
*   **控制前端UI**：根据用户权限动态显示或隐藏菜单、按钮、页面等界面元素。

这套系统遵循RBAC（基于角色的访问控制）模型，通过将权限分配给角色，再将角色分配给用户，实现了灵活、可扩展的权限管理。

---
#### **2. 核心概念与命名约定**

*   **权限 (Permission)**: 一个描述具体操作的、全局唯一的字符串。这是授权的最小单位。
*   **角色 (Role)**: 一组权限的集合 (例如 `Admin`, `Editor`)。
*   **用户 (User)**: 通过在某个组内被赋予一个或多个角色来获得相应的权限。
*   **系统管理 (System Administration)**: 系统级的管理权限并非源于某个特定的组名或ID，而是源于一个被授予了所有权限的特殊角色（通常命名为 `Admin`）。在系统初始化时，会创建一个用于分配此角色的特殊用户组。任何被加入该组并赋予 `Admin` 角色的用户，都将成为系统管理员。

**权限命名约定 (重要！)**

为了清晰地组织和区分权限，我们采用以下前缀格式：

*   `db.<table_name>.<action>`: 用于描述对数据库表的操作权限。这是后端Edge Function进行验证时使用的格式。
    *   **示例**: `db.posts.create`, `db.users.delete`
*   `ui.<plugin_name>.<feature>`: 用于描述前端UI元素的可见性或可交互性，与后端操作不直接挂钩。
    *   **示例**: `ui.dashboard.view-analytics`, `ui.settings.show-advanced-options`

---
#### **3. 系统如何工作？**

##### **第一步：数据库设置与初始化**

我们所有的核心数据库对象，包括权限系统的核心表、所有辅助函数以及初始的`System`组、`Admin`角色和权限数据，都已整合到一个统一的SQL脚本中。

首先，我们需要一个包含所有权限定义、角色和辅助函数的基础环境。

- [**数据库初始化脚本**](./database-initialization.sql)

执行此脚本会创建 `permissions`, `roles`, `groups`, `group_users`, `check_group_permission()` 等核心对象，并会自动创建`System`组和拥有所有权限的`Admin`角色。

##### **第二步：为普通用户组强制执行数据访问策略 (RLS)**

这是权限系统的核心应用场景：控制普通用户能看到和操作哪些数据。这是通过将 `check_group_permission()` 函数嵌入到表的RLS策略中实现的。

**工作流程示例 (用户读取文章):**

1.  **定义权限**: 首先，在 `permissions` 表中定义一个“读取文章”的权限。
    ```sql
    -- 在初始化脚本中已包含
    INSERT INTO permissions (name, description) VALUES ('db.posts.select', 'Read posts');
    ```

2.  **创建RLS策略**: 在 `posts` 表上，我们创建一个 `SELECT` 策略。这个策略的 `USING` 子句会调用 `check_group_permission()`，并传入当前记录所属的 `group_id`。
    ```sql
    -- 为 posts 表启用 RLS
    ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

    -- 创建一个策略，用户需要拥有 'db.posts.select' 权限才能读取对应组的数据
    CREATE POLICY "Allow users to read posts based on group permission"
      ON posts FOR SELECT
      USING ( check_group_permission(posts.group_id, 'db.posts.select') );
    ```

3.  **规则生效**: 设置完成后，任何用户执行 `SELECT * FROM posts;` 时，PostgreSQL都会自动在后台对每一行记录执行 `check_group_permission(posts.group_id, 'db.posts.select')`。该函数会检查用户是否是该组的成员并拥有所需权限。如果函数返回 `true`，则该行数据可见；否则，该行被过滤。如果用户在任何组中都没有权限，查询将返回一个空结果集。

通过这种方式，我们将权限逻辑下沉到了数据库，实现了与具体应用代码无关的、统一且可靠的安全保障。

##### **第三步：为系统管理员提供全局权限**

系统管理员的权限检查已经统一到核心的权限函数中，无需特殊的RPC调用。其核心在于 `Admin` 角色，而非特定的组。

**工作流程示例 (管理员访问数据):**

1.  **管理员身份**: 管理员是在系统初始化时设立的特殊用户组中，被赋予了 `Admin` 角色的用户。

2.  **权限检查逻辑**: 当任何权限检查函数（如`check_group_permission`）被调用时，它会执行以下步骤：
    a.  首先，检查用户是否在当前操作的特定组（例如一个项目组）中拥有所需权限。
    b.  如果特定组的权限检查失败，函数会**自动回退**，检查用户是否拥有全局性的 `Admin` 角色关联的权限。
    c.  如果用户拥有该权限（作为`Admin`角色的成员），则权限检查通过。

3.  **效果**: 这意味着，一个`Admin`用户在调用 `SELECT * FROM posts;` 时，即使他们不属于任何一个拥有 `posts` 记录的普通用户组，RLS策略中的 `check_group_permission` 依然会因为 `Admin` 角色的全局权限而返回 `true`，从而允许他们查看所有 `posts` 数据。

这样，我们就统一了权限模型：
- **普通用户**: 其数据访问权限由其所在的用户组角色决定。
- **管理员**: 通过被赋予 `Admin` 角色，获得对所有资源的全局访问权限，无需为每个资源单独授权。

##### **第四步：前端UI的动态渲染**

前端UI应根据用户拥有的权限动态展示或禁用相关操作。这可以通过 `get_user_permissions()` 函数实现，该函数会返回当前登录用户的所有权限列表。

```javascript
// 示例：获取当前用户的所有权限
async function fetchUserPermissions() {
  const { data, error } = await supabase.rpc('get_user_permissions');
  if (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
  return data; // e.g., ['db.posts.select', 'db.posts.insert']
}
```

如果权限列表中包含 `db.posts.insert`，前端就可以渲染“创建新文章”的按钮。如果一个管理员的权限列表中包含 `system.rpc.invoke`，前端就可以渲染“数据库管理”的整个模块。

##### **第四步：前端UI控制**

这是作为插件开发者，你需要直接交互的部分。

**1. 声明权限 (`registerPermission`)**

在你的插件入口文件 (`index.js`) 中，你需要告诉框架你的插件会用到哪些权限。

```javascript
// src/plugins/your-plugin/index.js
export default function registerYourPlugin({ registerPermission }) {
  // 声明一个纯前端UI权限
  registerPermission({ name: 'ui.your-plugin.view', description: '允许查看你的插件页面' });
  
  // 假设你的插件也需要创建文章，相关的后端权限也在这里声明，以保持清晰
  registerPermission({ name: 'db.posts.create', description: '允许创建新文章' });
}
```

**2. 保护路由和菜单 (`permission` 属性)**

在注册路由或菜单项时，附加上 `permission` 属性。框架会自动处理：只有拥有该权限的用户才能看到菜单项或访问该路由。

```javascript
// src/plugins/your-plugin/index.js
export default function registerYourPlugin({ registerRoute, registerAdminMenuItem, ... }) {
  // ...
  registerAdminMenuItem({
    label: 'Your Plugin',
    path: '/admin/your-plugin',
    permissions: 'ui.your-plugin.view' // <-- 使用UI权限控制菜单可见性
  });

  registerRoute({
    path: '/admin/your-plugin',
    component: YourPluginPage,
    permissions: 'ui.your-plugin.view' // <-- 使用UI权限控制路由访问
  });
}
```

**3. 细粒度UI控制 (`<Authorized />` 组件)**

对于页面内部的某个按钮或特定区域，你可以使用 `<Authorized />` 组件来包裹它。

```jsx
// src/plugins/your-plugin/YourPluginPage.jsx
import { Authorized } from '@/framework/permissions';
import { Button } from '@/framework/components/ui/button';

export default function YourPluginPage() {
  return (
    <div>
      <h2>Your Plugin</h2>
      
      {/* 示例1: 这个按钮的显示与否，取决于用户是否有创建文章的后端权限 */}
      <Authorized permissions="db.posts.create">
        <Button>Create New Post</Button>
      </Authorized>

      <br />

      {/* 示例2: 这个区域只有拥有特定UI权限的用户才能看到 */}
      <Authorized permissions="ui.your-plugin.show-special-feature">
        <div style={{ border: '1px solid grey', padding: '1rem', marginTop: '1rem' }}>
          <h3>Special Feature</h3>
          <p>This content is only visible to users with the 'ui.your-plugin.show-special-feature' permission.</p>
        </div>
      </Authorized>
    </div>
  );
}
```

---
#### **4. 前端权限系统详细使用指南**

##### **4.1 权限获取机制**

PermissionProvider 会自动按以下优先级获取用户权限：

1. **用户元数据权限** - 从 `user.user_metadata.permissions` 获取
2. **数据库权限** - 从 Supabase 数据库查询用户角色和权限
3. **模拟权限** - 当数据库查询失败时的降级方案

##### **4.2 基本使用**

```jsx
import { PermissionProvider } from '@/framework/permissions';

function App() {
  return (
    <PermissionProvider>
      <YourApp />
    </PermissionProvider>
  );
}
```

PermissionProvider 会自动：
- 监听用户登录状态变化
- 从数据库或用户元数据获取权限
- 提供权限检查方法给子组件

##### **4.3 权限检查**

```jsx
import { usePermission } from '@/framework/permissions';

function MyComponent() {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();
  
  // 单个权限检查
  const canRead = hasPermission('user.read');
  
  // 任一权限检查
  const canReadOrWrite = hasAnyPermission(['user.read', 'user.write']);
  
  // 全部权限检查
  const canManage = hasAllPermissions(['user.read', 'user.write', 'user.delete']);
  
  return (
    <div>
      {canRead && <p>可以查看用户</p>}
      {canReadOrWrite && <p>可以读取或写入</p>}
      {canManage && <p>可以完全管理用户</p>}
    </div>
  );
}
```

##### **4.4 组件级权限控制**

```jsx
import { Authorized } from '@/framework/permissions';

function MyComponent() {
  return (
    <div>
      <Authorized permissions="user.read">
        <p>只有有读取权限的用户才能看到这个内容</p>
      </Authorized>
      
      <Authorized permissions={['admin.manage', 'user.write']} mode="any">
        <p>有管理权限或写入权限的用户都能看到</p>
      </Authorized>
      
      <Authorized permissions={['user.read', 'user.write']} mode="all">
        <p>必须同时有读取和写入权限才能看到</p>
      </Authorized>
    </div>
  );
}
```

##### **4.5 权限数据结构**

权限对象应包含以下字段：

```javascript
{
  id: string,           // 权限唯一标识
  name: string,         // 权限名称（用于检查）
  resource: string,     // 资源类型
  action: string,       // 操作类型
  description?: string  // 权限描述（可选）
}
```

##### **4.6 最佳实践**

1. **权限命名约定**：
   - UI 权限：`ui.<plugin>.<action>`
   - 数据库权限：`db.<table>.<action>`
   - 系统权限：`system.<action>`

2. **外部权限传入**：
   - 如果将来需要测试场景，可以考虑重新添加此功能
   - 目前统一使用自动权限获取，保持简洁

3. **错误处理**：
   - 系统会自动降级到模拟权限
   - 生产环境建议监控权限获取失败的情况
   - 可以通过日志查看权限系统的运行状态

4. **性能优化**：
   - 权限数据会在用户登录后缓存
   - 避免在渲染循环中频繁调用权限检查
   - 考虑使用 React.memo 优化权限相关组件

---
#### **5. 总结**

通过遵循以上步骤，你可以轻松地为你的插件集成强大而灵活的权限控制。这不仅提升了应用的安全性，也改善了不同用户角色的使用体验。