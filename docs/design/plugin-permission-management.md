### **设计文档：权限管理插件 (Permission Management Plugin)**

#### **1. 概述**

本文档旨在设计一个集成在Admin面板中的**权限管理插件**。该插件为系统管理员提供一个统一的图形化界面，用于管理整个系统的权限、角色和用户分配，从而实现精细化的访问控制。

此插件的核心目标是：
*   简化RBAC（基于角色的访问控制）模型的管理。
*   打通前端代码中声明的权限与后端数据库之间的同步链路。
*   提供对角色（Roles）、权限（Permissions）和用户角色分配（User-Role Assignments）的增删查改（CRUD）功能。

该插件将作为 `permission-admin` 插件存在于 `src/plugins/` 目录下，并遵循现有框架的插件契约。

---

#### **2. 功能特性 (Features)**

插件将提供以下核心功能，通过Admin面板中的一个专属页面进行访问，页面内使用标签页（Tabs）来组织不同模块。

*   **2.1 角色管理 (Role Management)**
    *   **查看角色列表**: 以表格形式展示系统中所有可用的角色，包括角色名称和描述。
    *   **创建新角色**: 提供一个表单用于添加新角色，可定义其名称和描述。
    *   **编辑角色**: 修改现有角色的名称和描述。同时，在此界面中为角色分配或撤销权限。
    *   **删除角色**: 从系统中删除一个角色。删除前应有确认提示。

*   **2.2 权限管理 (Permission Management)**
    *   **查看权限列表**: 以表格形式展示数据库中存储的所有权限。
    *   **权限发现与同步**:
        *   提供一个“**发现新权限**”或“**从代码同步**”的按钮。
        *   点击后，系统将执行以下操作：
            1.  从框架的注册中心获取所有前端插件声明的权限列表。
            2.  与数据库中的 `permissions` 表进行比对，找出那些在代码中已声明、但在数据库中尚不存在的**新权限**。
            3.  将这些新权限**插入**到数据库中。此过程**不会删除或修改**任何现有权限。
    *   **孤立权限标识**:
        *   在权限列表界面，系统会自动检测并明确标识出那些存在于数据库中，但当前已没有任何前端插件声明的权限（即“孤立权限”）。
        *   管理员可以根据这些标识，自行判断并决定是否要手动删除这些孤立权限。删除操作会受到相应的后端权限 `db.permissions.delete` 的保护。

*   **2.3 用户角色分配 (User-Role Assignment)**
    *   **查看用户列表**: 展示所有注册用户及其当前被分配的角色。
    *   **修改用户角色**: 为指定用户添加或移除一个或多个角色。

---

#### **3. 架构与实现**

*   **3.1 插件注册**
    *   插件将在 `src/plugins/permission-admin/index.js` 文件中进行注册。
    *   它将注册一个指向 `/admin/permissions` 的路由和一个在Admin布局侧边栏的菜单项。
    *   为了访问此插件，用户需要拥有 `ui.permission-admin.view` 权限。

    ```javascript
    // src/plugins/permission-admin/index.js
    import PermissionAdminPage from './pages/PermissionAdminPage';

    export default function registerPermissionAdminPlugin({ registerRoute, registerAdminMenuItem, registerPermission }) {
      // 1. 声明插件自身需要的UI权限
      registerPermission({
        name: 'ui.permission-admin.view',
        description: '访问权限管理面板'
      });

      // 2. 注册Admin菜单项，并用UI权限保护
      registerAdminMenuItem({
        label: '权限管理', // i18n key: 'permissionAdmin.menuLabel'
        path: '/admin/permissions',
        permission: 'ui.permission-admin.view',
        order: 100 // 较高的排序值，使其出现在核心功能区域
      });

      // 3. 注册路由，并用UI权限保护
      registerRoute({
        path: '/admin/permissions',
        component: PermissionAdminPage,
        permission: 'ui.permission-admin.view'
      });

      // 4. 声明此插件进行管理操作所需的后端DB权限
      const tables = ['roles', 'permissions', 'role_permissions', 'user_roles'];
      const actions = ['select', 'insert', 'update', 'delete'];
      tables.forEach(table => {
        actions.forEach(action => {
          registerPermission({ name: `db.${table}.${action}` });
        });
      });
    }
    ```

*   **3.2 组件结构**
    *   `pages/PermissionAdminPage.jsx`: 插件主页面，包含Tabs组件，用于在不同管理模块间切换。
    *   `components/RoleManagementTab.jsx`: 角色管理模块，包含角色列表、创建/编辑模态框。
    *   `components/PermissionManagementTab.jsx`: 权限管理模块，包含权限列表和同步按钮。
    *   `components/UserRoleManagementTab.jsx`: 用户角色管理模块，包含用户列表和角色分配模态框。
    *   `components/RoleEditDialog.jsx`: 用于创建或编辑角色的对话框，内部包含一个权限分配的多选列表。

*   **3.3 数据流**
    *   所有数据交互将通过框架提供的通用API Edge Function进行，该函数已经内置了权限检查。
    *   **读取**: 组件加载时，调用API获取 `roles`, `permissions`, `users` 等数据。
    *   **写入/更新/删除**: 用户操作（如保存角色、分配权限）将触发对API的调用，传递相应的表名和操作。
    *   **权限同步**:
        1.  从框架API `registry.getPermissions()` 获取所有前端声明的权限。
        2.  调用后端API获取数据库中 `permissions` 表的全量数据。
        3.  在前端计算出差集（需要新增的权限）。
        4.  调用后端API（`operation: 'insert'`），批量将新权限插入 `permissions` 表。

---

#### **4. UI/UX 设计草图**

*   **主页面 (`/admin/permissions`)**
    *   一个大标题：“权限管理”。
    *   Tabs组件，包含三个标签页：
        *   `角色管理`
        *   `权限列表`
        *   `用户授权`

*   **4.1 “角色管理” 标签页**
    *   顶部有一个 **[+ 新建角色]** 按钮。
    *   下方是一个 `shadcn/ui` 的 `Table` 组件，列出所有角色。
    *   **表格列**:
        *   `角色名称` (e.g., "admin", "editor")
        *   `描述`
        *   `操作` (一个包含 "编辑" 和 "删除" 按钮的下拉菜单)
    *   点击“编辑”或“新建”时，弹出一个对话框 (`RoleEditDialog`)。
        *   对话框内包含角色的“名称”和“描述”输入框。
        *   下方是一个权限列表，使用带搜索功能的复选框列表，让管理员可以方便地勾选需要赋予该角色的权限。

*   **4.2 “权限列表” 标签页**
    *   顶部有一个 **[同步前端权限]** 按钮。
    *   下方是一个 `Table` 组件，列出 `permissions` 表中的所有权限。
    *   **表格列**:
        *   `权限名称` (e.g., "db.posts.create")
        *   `描述`
        *   `来源` (一个状态指示，例如 "已在代码中声明", "孤立权限")

*   **4.3 “用户授权” 标签页**
    *   一个 `Table` 组件，列出所有用户。
    *   **表格列**:
        *   `用户邮箱/用户名`
        *   `当前角色` (以标签形式展示，e.g., `[admin]`, `[editor]`)
        *   `操作` (一个 "编辑角色" 按钮)
    *   点击“编辑角色”时，弹出一个对话框，其中包含一个角色的多选列表，用于为该用户分配角色。

---

#### **5. 数据库交互**

该插件将完全复用 `permission-system-design.md` 中定义的数据库表：
*   `permissions`
*   `roles`
*   `role_permissions`
*   `user_roles`

所有数据库操作都将通过调用后端的通用API Edge Function来完成，并受到 `db.*` 系列权限的保护。例如，要创建一个新角色，前端会发起一个类似这样的请求：

```json
{
  "operation": "insert",
  "table": "roles",
  "data": { "name": "new-role", "description": "A new role." }
}
```

后端Edge Function会校验发起请求的用户是否拥有 `db.roles.insert` 权限。

---

#### **6. 所需权限**

为了让此插件正常工作，使用此插件的管理员角色（例如 `admin`）必须被授予以下权限：

*   `ui.permission-admin.view` (访问UI)
*   `db.roles.select`, `db.roles.insert`, `db.roles.update`, `db.roles.delete`
*   `db.permissions.select`, `db.permissions.insert`, `db.permissions.delete`
*   `db.role_permissions.select`, `db.role_permissions.insert`, `db.role_permissions.delete`
*   `db.user_roles.select`, `db.user_roles.insert`, `db.user_roles.delete`

这些权限应在系统初始化时被赋予超级管理员角色。