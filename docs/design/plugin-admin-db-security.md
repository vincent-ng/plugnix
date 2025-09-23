### **设计文档：数据库安全管理插件 (Database Security Admin Plugin)**

#### **1. 概述**

本文档旨在设计一个集成在Admin面板中的**数据库管理插件**。该插件为具备最高权限的系统管理员提供一个图形化界面，用于管理数据库底层安全设置，特别是针对数据表的行级安全（Row-Level Security, RLS）策略。

此插件的核心目标是：
*   提供一个清晰的视图，展示所有数据库表的RLS启用状态。
*   提供一个安全、可控的方式来调用 `setup_rbac_rls` 和 `teardown_rbac_rls` 这两个高风险的数据库函数。
*   将底层数据库管理与上层应用权限管理（由 `permission-admin` 插件负责）分离开来，实现职责分离和风险隔离。

该插件将作为 `admin-db-security` 插件存在于 `src/plugins/` 目录下，并遵循现有框架的插件契约。

---

#### **2. 功能特性 (Features)**

插件将提供以下核心功能，通过Admin面板中的一个专属页面进行访问。

*   **2.1 数据库表状态总览**
    *   **查看表列表**: 以表格形式自动发现并展示 `public` schema 下的所有数据表。
    *   **查看RLS状态**: 对于每个表，清晰地标识其行级安全（RLS）是否已启用。
    *   **查看表策略**: 展示每个表上当前应用的RLS策略详情。

*   **2.2 RLS策略管理**
    *   **启用RBAC策略**: 为选定的表提供一个“**启用RLS**”按钮，点击后将调用数据库函数 `setup_rbac_rls(table_name)`。
    *   **禁用RBAC策略**: 为选定的表提供一个“**禁用RLS**”按钮，点击后将调用数据库函数 `teardown_rbac_rls(table_name)`。
    *   **操作确认**: 所有启用/禁用操作前，都必须弹出一个带有严重警告信息的确认对话框，要求用户输入表名以确认操作，防止误操作。

---

#### **3. 架构与实现**

*   **3.1 插件注册**
    *   插件将在 `src/plugins/admin-db-security/index.js` 文件中进行注册。
    *   为了访问此插件，用户需要拥有 `ui.admin-db-security.view` 权限。
    *   为了执行RLS操作，用户需要拥有调用 `setup_rbac_rls` 和 `teardown_rbac_rls` 函数的数据库权限。

    ```javascript
    // src/plugins/admin-db-security/index.js
    import DatabaseAdminPage from './pages/DatabaseAdminPage';

    export default function registerDatabaseAdminPlugin({ registerRoute, registerAdminMenuItem, registerPermission }) {
      // 1. 声明插件自身需要的UI权限
      registerPermission({
        name: 'ui.admin-db-security.view',
        description: '访问数据库管理面板'
      });

      // 2. 注册Admin菜单项
      registerAdminMenuItem({
        label: '数据库安全', // i18n key: 'adminDbSecurity.menuLabel'
        path: '/admin/db-security',
        permission: 'ui.admin-db-security.view'
      });

      // 3. 注册路由
      registerRoute({
        path: '/admin/db-security',
        component: DatabaseAdminPage,
        permission: 'ui.admin-db-security.view'
      });

      // 4. 声明执行操作所需的RPC权限
      registerPermission({ name: 'db.rpc.setup_rbac_rls' });
      registerPermission({ name: 'db.rpc.teardown_rbac_rls' });
    }
    ```

*   **3.2 组件结构**
    *   `pages/DatabaseAdminPage.jsx`: 插件主页面，包含数据表管理的全部功能。
    *   `components/RLSActionDialog.jsx`: 用于执行启用/禁用RLS操作时弹出的确认对话框。

*   **3.3 数据流**
    *   **获取表和RLS状态**: 通过查询 `information_schema.tables` 和 `pg_tables` 来获取所有表及其RLS状态。这可以通过创建一个专门的数据库视图或函数来简化。
    *   **执行操作**: 通过Supabase客户端调用 `rpc('setup_rbac_rls', { p_table_name: '...' })` 和 `rpc('teardown_rbac_rls', { p_table_name: '...' })`。

---

#### **4. UI/UX 设计草图**

*   **主页面 (`/admin/db-security`)**
    *   一个大标题：“数据库安全管理”。
    *   一段警告文字，说明此页面的操作是高风险的。
    *   一个 `Table` 组件，列出所有数据表。
    *   **表格列**: `表名`, `RLS状态` (例如一个 "已启用" / "未启用" 的徽章), `操作`。
    *   **操作列**:
        *   如果RLS未启用，显示一个 **[启用RLS]** 按钮。
        *   如果RLS已启用，显示一个红色的 **[禁用RLS]** 按钮。
    *   点击按钮时，弹出一个模态框 (`RLSActionDialog`)，要求用户再次确认操作。

---

#### **5. 数据库交互**

获取表和RLS状态的查询示例：

```sql
-- 建议创建一个视图来封装这个逻辑
CREATE OR REPLACE VIEW tables_with_rls_status AS
SELECT
  t.tablename AS table_name,
  t.rowsecurity AS rls_enabled
FROM
  pg_tables t
WHERE
  t.schemaname = 'public';
```

前端调用RPC函数的示例：

```javascript
// 使用框架提供的 useSupabase hook 获取客户端实例
const supabase = useSupabase();

async function enableRls(tableName) {
  const { error } = await supabase.rpc('setup_rbac_rls', { p_table_name: tableName });

  if (error) {
    // RLS策略会在这里拒绝没有权限的请求
    console.error(`为 ${tableName} 启用RLS失败:`, error.message);
    // ... 显示错误提示
    return;
  }
  // ... 刷新列表
}
```

---

#### **6. 所需权限**

为了让此插件正常工作，使用此插件的超级管理员角色必须被授予以下权限：

*   `ui.admin-db-security.view` (访问UI)
*   `db.rpc.setup_rbac_rls` (执行启用操作)
*   `db.rpc.teardown_rbac_rls` (执行禁用操作)