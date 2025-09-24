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
*   **组 (Group)**: 权限管理的基本单位，每个组可以定义自己的角色和权限分配。用户通过加入组并被分配角色来获得权限。
*   **角色 (Role)**: 属于特定组的权限集合。每个组可以定义自己的角色（如 `Admin`, `Owner`, `Member`），同名角色在不同组中可以有不同的权限配置。
*   **用户 (User)**: 通过在一个或多个组内被赋予特定角色来获得相应的权限。用户在每个组中只能被分配一个角色。用户的最终权限是其在所有组中角色权限的并集。
*   **系统管理 (System Administration)**: 系统级的管理权限通过特殊的系统组实现。数据库初始化时会创建一个id为 `00000000-0000-0000-0000-000000000001` 的特殊组，专门用于管理整个系统的管理员。任何被加入此系统组的用户，都将根据其在该组中的角色权限获得相应的全局管理权限。

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

执行此脚本会创建 `permissions`, `roles`, `groups`, `group_users`, `role_permissions`, `check_group_permission()` 等核心对象，并提供 `promote_user_to_admin()` 协助创建管理员角色。

##### **第二步：后端权限控制**

后端权限控制通过数据库的行级安全策略（RLS）实现。具体的实现细节请参考数据库初始化脚本和权限模型文档。作为前端插件开发者，你只需要了解权限的命名约定和前端使用方式。

##### **第三步：前端UI控制**

这是作为插件开发者，你需要直接交互的部分。

**group_id 来源说明**：
- 框架提供了 `GroupContext` 和 `GroupSwitcher` 组件来管理用户的组织切换
- 用户可以通过顶部导航栏的组织切换器选择当前工作的组织
- 权限系统会自动基于当前选中的组织（`currentGroup`）来检查用户权限
- 插件开发者无需手动处理 group_id，框架会自动处理组织上下文

**1. 声明权限 (`registerPermission`)**

在你的插件入口文件 (`index.js`) 中，你需要告诉框架你的插件会用到哪些权限。声明了的权限，会出现在权限管理界面中，组管理员可以分配这些权限，创建组角色。

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

框架会自动获取用户权限，具体的获取逻辑由框架内部处理。作为插件开发者，你只需要使用提供的权限检查方法。

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

权限系统使用字符串形式的权限名称进行检查，遵循命名约定即可。

##### **4.6 最佳实践**

1. **权限命名约定**：
   - UI 权限：`ui.<plugin>.<action>`
   - 数据库权限：`db.<table>.<action>`
   - 系统权限：`system.<action>`

2. **性能优化**：
   - 权限数据会在用户登录后缓存
   - 避免在渲染循环中频繁调用权限检查
   - 考虑使用 React.memo 优化权限相关组件

---
#### **5. 总结**

通过遵循以上步骤，你可以轻松地为你的插件集成强大而灵活的权限控制。这不仅提升了应用的安全性，也改善了不同用户角色的使用体验。