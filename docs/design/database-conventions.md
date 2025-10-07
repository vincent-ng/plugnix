# 数据库设计约定

本文档旨在沉淀项目开发过程中形成的通用数据库设计规范和最佳实践，以确保数据库结构的一致性、可维护性和高性能。

所有本文档中提到的SQL函数、表结构和策略的具体实现，都可以在统一的数据库初始化脚本中找到：
- [**数据库初始化脚本**](./database-initialization.sql)

---

### **1. 核心字段约定**

#### **1.1 时间戳 (`created_at` & `updated_at`)**

所有需要追踪创建和更新时间的表，都应包含以下两个字段：

*   `created_at`: `TIMESTAMPTZ` 类型, `DEFAULT now()`。
*   `updated_at`: `TIMESTAMPTZ` 类型, `DEFAULT now()`。

为自动化 `updated_at` 的更新，框架提供了 `add_updated_at_trigger(p_table_name TEXT)` 函数。

#### **1.2 创建者标记 (`user_id`)**

对于需要明确记录创建者的数据（例如文章、评论），表应包含一个 `user_id` 字段。

*   `user_id`: `UUID` 类型, `DEFAULT auth.uid()`。它应引用 `auth.users(id)`。

在统一权限模型下，此字段的主要作用是**审计和数据归属**（例如，在UI上显示“由...创建”），而不再是RLS策略中进行“所有权”判断的主要依据。权限检查完全由 `group_id` 和关联的权限函数处理。

### **2. 用户与权限**

#### **2.1 用户管理 (`auth.users`)**

我们直接采用Supabase内置的`auth.users`表来管理用户信息。在设计其他数据表时，如果需要关联到用户，应使用 `user_id` 字段，并将其设置为外键，引用`auth.users(id)`。

#### **2.2 权限系统设计**

关于权限系统的详细设计，包括数据表结构（`roles`, `permissions`等）、权限命名约定以及前后端集成实践，请参阅独立的详细设计文档：

- [**权限系统设计**](./feature-permission-model.md)

为减少前后端不一致的情况，项目采用统一策略：所有权限统一以 `db.<table>.<action>` 命名，并同时用于后端 RLS 校验与前端菜单/路由/按钮的显示与交互控制。历史上的 `ui.*` 仅用于纯视觉开关的场景，不再推荐作为权限名使用。

### **3. 统一权限模型：基于“用户组”与“系统组”的RLS策略**

我们最终的权限模型是一个统一的、基于RBAC的机制，它通过“用户组”管理常规协作，通过一个特殊的“系统组”管理全局管理员权限。

#### **核心思想：统一的组权限检查**

*   所有受保护的数据都必须归属于一个用户组 (`group_id`)。
*   权限检查的核心是调用 `check_group_permission(group_id, permission_name)` 函数。
*   该函数内部封装了完整的权限检查逻辑：
    1.  首先，检查用户在数据所属的用户组内是否拥有所需权限。
    2.  如果否，则回退检查用户是否在“系统组”中拥有该权限（即是否为系统管理员）。

#### **实现模式**

RLS策略的实现变得极其简单和统一，只需将权限判断完全委托给 `check_group_permission` 函数。

**示例：`posts` 表的 `UPDATE` 策略**

```sql
-- 创建一个统一的策略，权限检查完全由 check_group_permission 处理
CREATE POLICY "Allow update based on group permission"
ON public.posts
FOR UPDATE
USING (
  check_group_permission(posts.group_id, 'db.posts.update')
);
```

这个模型极大简化了策略的编写和维护。关于这个统一模型的完整设计，包括数据库结构、自动化函数和实现细节，请参阅：

- [**设计文档：基于用户组的统一权限模型**](./feature-permission-group.md)

### **4. 细粒度的表管理函数 (RPC)**

为了方便管理员通过前端UI或脚本来管理表的安全特性，框架提供了一系列细粒度的数据库RPC函数。调用这些函数需要用户拥有 `system.rpc.invoke` 权限。

#### **4.1 `updated_at` 时间戳管理**

*   `add_updated_at_trigger(p_table_name TEXT)`: 为指定表附加 `updated_at` 自动更新触发器。
*   `remove_updated_at_trigger(p_table_name TEXT)`: 移除触发器。

#### **4.2 行级安全与策略管理**

*   `setup_rbac_rls(p_table_name TEXT)`: 为指定表启用行级安全，并创建一套标准的、仅基于RBAC权限的增删查改策略。
*   `teardown_rbac_rls(p_table_name TEXT)`: 从指定表上移除标准的RBAC策略，并禁用行级安全。

**注意**: 这些辅助函数用于快速搭建基于“所有权”或简单RBAC的权限。在我们的统一权限模型中，我们推荐根据第3节的指导，手动创建基于 `check_group_permission` 的组合策略，以获得最佳的可维护性和扩展性。这些辅助函数可用于不需要集团功能的简单场景。

### **5. 核心辅助函数**

以下是支撑整个权限和自动化体系的核心函数：

*   `check_permission(permission_name TEXT)`: **[内部使用]** 检查当前用户是否在“系统组”中拥有指定权限。此函数主要被 `check_group_permission` 内部调用，一般不应在RLS策略中直接使用。
*   `check_group_permission(p_group_id UUID, p_permission_name TEXT)`: 检查当前用户在指定的用户组内是否拥有指定权限，如果否，则自动回退检查其是否拥有系统级权限。这是所有RLS策略中进行权限判断的唯一入口点。
*   `handle_updated_at()`: 一个触发器函数，用于自动更新 `updated_at` 字段。