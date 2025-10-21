### **设计文档：组织权限管理插件 (Tenant Permission Management Plugin)**

#### **1. 概述**

本文档旨在设计一个集成在Admin面板中的**组织权限管理插件**。该插件为系统管理员提供一个统一的图形化界面，用于管理整个系统的权限、组织以及用户与组织的关联，从而实现精细化的、基于组织的访问控制。

此插件的核心目标是：
*   简化组织权限模型的管理。
*   打通前端代码中声明的权限与后端数据库之间的同步链路。
*   提供对组织（Tenants）、权限（Permissions）、组织成员（Tenant Members）和组织权限（Tenant Permissions）的增删查改（CRUD）功能。

该插件将作为 `permission-admin` 插件存在于 `src/plugins/` 目录下，并遵循现有框架的插件契约。

---

#### **2. 功能特性 (Features)**

插件将提供以下核心功能，通过Admin面板中的一个专属页面进行访问，页面内使用标签页（Tabs）来组织不同模块。

*   **2.1 组织管理 (Tenant Management)**
    *   **查看组织列表**: 以表格形式展示系统中所有可用的组织，包括组织名称、描述和成员数量。
    *   **创建新组织**: 提供一个表单用于添加新组织，可定义其名称和描述。
    *   **编辑组织**: 修改现有组织的名称和描述。同时，在此界面中管理组织的**成员**和**权限**。
    *   **删除组织**: 从系统中删除一个组织。删除前应有确认提示。

*   **2.2 权限管理 (Permission Management)**
    *   **查看权限列表**: 以表格形式展示数据库中存储的所有权限。
    *   **权限发现与同步**:
        *   提供一个“**发现新权限**”或“**从代码同步**”的按钮。
        *   点击后，系统将从前端所有插件声明的权限中，找出数据库尚不存在的新权限，并将其插入数据库。
    *   **孤立权限标识**:
        *   在权限列表界面，系统会自动标识出那些存在于数据库，但当前已没有任何前端插件声明的“孤立权限”，以便管理员决策是否需要清理。

*   **2.3 用户管理 (User Management)**
    *   **查看用户列表**: 展示所有注册用户及其当前所属的组织。
    *   **修改用户所属组织**: 为指定用户添加或移除一个或多个组织的成员资格。

---

#### **3. 架构与实现**

*   **3.1 插件注册**
    *   插件将在 `src/plugins/permission-admin/index.js` 文件中进行注册，并声明自身运行所需的数据库权限（统一策略：以 `db.*` 为准）。
    *   为了访问此插件页面，建议以“最小 DB 权限”进行守卫，例如使用 `db.permissions.select`。

    ```javascript
    // src/plugins/permission-admin/index.js
    import PermissionAdminPage from './pages/PermissionAdminPage';

    export default function registerPermissionAdminPlugin({ registerRoute, registerAdminMenuItem, registerPermission }) {
      // 1. 使用 DB 权限作为页面与操作的统一控制来源
      const pagePermission = 'db.permissions.select';

      // 2. 注册Admin菜单项
      registerAdminMenuItem({
        label: '权限管理', // i18n key: 'permissionAdmin.menuLabel'
        path: '/admin/permissions'
      });

      // 3. 注册路由（以最小 DB 权限守卫进入）
      registerRoute({
        path: '/admin/permissions',
        component: PermissionAdminPage,
        permissions: [pagePermission]
      });

      // 4. 声明管理操作所需的后端DB权限（用于按钮、具体操作等）
      const tables = ['tenants', 'permissions', 'tenant_users', 'tenant_permissions'];
      const actions = ['select', 'insert', 'update', 'delete'];
      tables.forEach(table => {
        actions.forEach(action => {
          registerPermission({ name: `db.${table}.${action}` });
        });
      });
    }
    ```

*   **3.2 组件结构**
    *   `pages/PermissionAdminPage.jsx`: 插件主页面，包含Tabs组件。
    *   `components/TenantManagementTab.jsx`: 组织管理模块。
    *   `components/PermissionManagementTab.jsx`: 权限管理模块。
    *   `components/UserManagementTab.jsx`: 用户管理模块。
    *   `components/TenantEditDialog.jsx`: 用于创建或编辑组织的对话框，内部包含成员管理和权限分配功能。

*   **3.3 数据流**
    *   所有数据交互均通过框架提供的Supabase客户端直接进行，并由后端的RLS策略保障安全。
    *   **权限同步**:
        1.  从框架API `registry.getPermissions()` 获取所有前端声明的权限。
        2.  调用后端API获取数据库中 `permissions` 表的全量数据。
        3.  在前端计算出差集（需要新增的权限）。
        4.  调用后端API批量将新权限插入 `permissions` 表。

---

#### **4. UI/UX 设计草图**

*   **主页面 (`/admin/permissions`)**
    *   一个大标题：“权限管理”。
    *   Tabs组件，包含三个标签页：
        *   `组织管理`
        *   `权限列表`
        *   `用户管理`

*   **4.1 “组织管理” 标签页**
    *   顶部有一个 **[+ 新建组织]** 按钮。
    *   下方是一个 `Table` 组件，列出所有组织。
    *   **表格列**: `组织名称`, `描述`, `成员数量`, `操作` (编辑/删除)。
    *   点击“编辑”或“新建”时，弹出一个对话框 (`TenantEditDialog`)，该对话框包含三个子标签页：
        *   **基本信息**: 组织的“名称”和“描述”输入框。
        *   **成员管理**: 一个带搜索功能的用户列表，可通过复选框将用户添加或移出当前组织。
        *   **权限设置**: 一个带搜索功能的权限列表，可通过复选框为当前组织分配或撤销权限。

*   **4.2 “权限列表” 标签页**
    *   顶部有一个 **[同步前端权限]** 按钮。
    *   下方是一个 `Table` 组件，列出 `permissions` 表中的所有权限。
    *   **表格列**: `权限名称`, `描述`, `来源` (e.g., "已在代码中声明", "孤立权限")。

*   **4.3 “用户管理” 标签页**
    *   一个 `Table` 组件，列出所有用户。
    *   **表格列**: `用户邮箱/用户名`, `所属组织` (以标签形式展示), `操作` (一个 "编辑组织" 按钮)。
    *   点击“编辑组织”时，弹出一个对话框，其中包含一个组织的多选列表，用于调整该用户的组织成员身份。

---

#### **5. 数据库交互**

该插件将完全复用 `database-initialization.sql` 中定义的组织权限模型表：
*   `permissions`
*   `tenants`
*   `tenant_users`
*   `tenant_permissions`

所有数据库操作都将通过框架提供的 Supabase 客户端直接与数据库交互。后端的行级安全（RLS）策略会确保即使用户直接访问数据库，也无法执行其未被授权的操作。RLS策略将利用 `check_permission` 和 `check_tenant_permission` 函数进行验证。

例如，要创建一个新组织，前端代码可能会像这样：

```javascript
// 使用框架提供的 useSupabase hook 获取客户端实例
const supabase = useSupabase();

async function createTenant(name, description) {
  const { data, error } = await supabase
    .from('tenants')
    .insert([{ name, description }])
    .select();

  if (error) {
    // RLS策略会在这里拒绝没有 'db.tenants.insert' 权限的请求
    console.error('创建组织失败:', error.message);
    return;
  }
  // ...
}
```

---

#### **6. 所需权限**

为了让此插件正常工作，使用此插件的管理员角色（例如 `admin`）必须被授予以下权限：

*   `db.tenants.select`, `db.tenants.insert`, `db.tenants.update`, `db.tenants.delete`
*   `db.permissions.select`, `db.permissions.insert`, `db.permissions.delete`
*   `db.tenant_users.select`, `db.tenant_users.insert`, `db.tenant_users.delete`
*   `db.tenant_permissions.select`, `db.tenant_permissions.insert`, `db.tenant_permissions.delete`

这些权限应在系统初始化时被赋予超级管理员角色。