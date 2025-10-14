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
*   **组织 (Tenant)**: 权限管理的基本单位，每个组织可以定义自己的角色和权限分配。用户通过加入组织并被分配角色来获得权限。
*   **角色 (Role)**: 属于特定组织的权限集合。每个组织可以定义自己的角色（如 `Admin`, `Owner`, `Member`），同名角色在不同组织中可以有不同的权限配置。
*   **用户 (User)**: 通过在一个或多个组织内被赋予特定角色来获得相应的权限。用户在每个组织中只能被分配一个角色。用户的最终权限是其在所有组织中角色权限的并集。
*   **系统管理 (System Administration)**: 系统级的管理权限通过特殊的系统组织实现。数据库初始化时会创建一个id为 `00000000-0000-0000-0000-000000000001` 的特殊组织，专门用于管理整个系统的管理员。任何被加入此系统组织的用户，都将根据其在该组织中的角色权限获得相应的全局管理权限。

**权限命名约定 (重要！)**

涉及后端数据库的权限使用 `db.<table>.<action>` 来表达权限，既用于后端的RLS校验，也用于前端的路由与UI显示控制。这样可以避免“UI权限”和“数据库权限”两套体系造成的割裂。如果一个权限它只用了控制前端的显示，而没有涉及数据库操作，那么它可以使用 `ui.<plugin>.<element>` 来命名。

*   `db.<table>.<action>`：权威的权限命名，前后端一致。推荐动作为 `select/insert/update/delete`。
    *   **示例**：`db.roles.select`, `db.role_permissions.insert`, `db.permissions.delete`
*   `ui.<plugin>.<element>`：用于前端UI显示控制的权限命名，不涉及数据库操作。
    *   **示例**：`ui.tenant-roles.create-button`, `ui.user-permissions.menu`, `ui.roles.delete-button`

---
#### **3. 系统如何工作？**

##### **第一步：数据库设置与初始化**

我们所有的核心数据库对象，包括权限系统的核心表、所有辅助函数以及初始的`System`组、`Admin`角色和权限数据，都已整合到一个统一的SQL脚本中。

首先，我们需要一个包含所有权限定义、角色和辅助函数的基础环境。

- [**数据库初始化脚本**](./database-initialization.sql)

执行此脚本会创建 `permissions`, `roles`, `tenants`, `tenant_users`, `role_permissions`, `check_tenant_permission()` 等核心对象，并提供 `promote_user_to_admin()` 协助创建管理员角色。

##### **第二步：后端权限控制**

后端权限控制通过数据库的行级安全策略（RLS）实现。具体的实现细节请参考数据库初始化脚本和权限模型文档。作为前端插件开发者，你只需要了解权限的命名约定和前端使用方式。

##### **第三步：前端UI控制**

这是作为插件开发者，你需要直接交互的部分。

**tenant_id 来源说明**：
- 框架提供了 `TenantContext` 和 `TenantSwitcher` 组件来管理用户的组织切换
- 用户可以通过顶部导航栏的组织切换器选择当前工作的组织
- 权限系统会自动基于当前选中的组织（`currentTenant`）来检查用户权限
- 插件开发者无需手动处理 tenant_id，框架会自动处理组织上下文

**1. 声明权限 (`registerPermission`)**

在你的插件入口文件 (`index.js`) 中，你需要告诉框架你的插件会用到哪些权限。声明了的权限，会出现在权限管理界面中，组管理员可以分配这些权限，创建组角色。

```javascript
// src/plugins/your-plugin/index.js
export default function registerYourPlugin({ registerPermission }) {
  // 统一声明 DB 权限：同时用于后端RLS与前端路由/按钮显示控制
  registerPermission({ name: 'db.posts.select', description: '查看文章列表' });
  registerPermission({ name: 'db.posts.insert', description: '创建文章' });
  registerPermission({ name: 'db.posts.update', description: '编辑文章' });
  registerPermission({ name: 'db.posts.delete', description: '删除文章' });
}
```

**2. 保护路由和菜单 (`permission` 属性)**

在注册路由或菜单项时，附加上 `permission` 属性。框架会自动处理：只有拥有该权限的用户才能看到菜单项或访问该路由。

```javascript
// src/plugins/your-plugin/index.js
export default function registerYourPlugin({ registerRoute, registerMenuItem }) {
  // 使用“页面访问的最小 DB 权限”控制菜单和路由
  const pagePermission = 'db.posts.select';

  registerMenuItem({
    key: 'your-plugin',
    label: 'your-plugin:menu.title',
    path: '/admin/your-plugin',
    component: YourPluginPage,
  }, 'admin');

  registerRoute({
    path: '/admin/your-plugin',
    component: YourPluginPage,
    permissions: [pagePermission]
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

      {/* 所有 UI 显示均以 DB 权限统一控制，避免与后端割裂 */}
      <Authorized permissions="db.posts.update">
        <div style={{ border: '1px solid grey', padding: '1rem', marginTop: '1rem' }}>
          <h3>Editor Tools</h3>
          <p>Only users with 'db.posts.update' see editor tools.</p>
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

1. **权限命名约定（统一）**：
   - 数据库权限：`db.<table>.<action>`（select/insert/update/delete）。同一权限串同时用于后端与前端。
   - 不再推荐使用 `ui.*` 权限；如需纯UI开关，优先使用组件内部状态或配置。

2. **性能优化**：
   - 权限数据会在用户登录后缓存
   - 避免在渲染循环中频繁调用权限检查
   - 考虑使用 React.memo 优化权限相关组件

---
#### **5. 总结**

通过遵循以上步骤，你可以轻松地为你的插件集成强大而灵活的权限控制。这不仅提升了应用的安全性，也改善了不同用户角色的使用体验。
