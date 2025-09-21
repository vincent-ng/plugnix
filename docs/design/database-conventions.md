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

#### **1.2 所有权 (`user_id`)**

对于用户可以创建和拥有的数据（例如文章、评论），表应包含一个 `user_id` 字段，用于记录创建者的唯一ID。

*   `user_id`: `UUID` 类型, `DEFAULT auth.uid()`。它应引用 `auth.users(id)`。

`DEFAULT auth.uid()` 会在 `INSERT` 时自动将当前登录用户的ID填充到该字段。

### **2. 用户与权限**

#### **2.1 用户管理 (`auth.users`)**

我们直接采用Supabase内置的`auth.users`表来管理用户信息。在设计其他数据表时，如果需要关联到用户，应使用 `user_id` 字段，并将其设置为外键，引用`auth.users(id)`。

#### **2.2 权限系统设计**

关于权限系统的详细设计，包括数据表结构（`roles`, `permissions`等）、权限命名约定以及前后端集成实践，请参阅独立的详细设计文档：

- [**权限系统设计**](./feature-permission-system.md)

### **3. RLS 策略最佳实践：所有权与 RBAC 结合**

行级安全 (RLS) 是我们权限控制的核心。我们推荐采用一种结合了“所有权”和“基于角色的访问控制 (RBAC)”的混合模式。

#### **原则**

1.  **所有者优先**: 记录的创建者（所有者）默认拥有对该记录的完全控制权（增删查改）。
2.  **管理员覆盖**: 拥有特定权限的管理员角色（例如，内容审查员）可以超越所有权限制，对所有记录进行操作。

#### **实现模式**

这两种规则可以通过在RLS策略中使用 `OR` 逻辑来优雅地结合。

**示例：`posts` 表的 `UPDATE` 策略**

```sql
-- 这是一个策略定义的示例，展示了设计思想
CREATE POLICY "Allow update for owners OR admins with permission"
ON public.posts
FOR UPDATE
USING (
  -- 条件1: 当前用户是这条记录的所有者
  auth.uid() = user_id
  OR
  -- 条件2: 当前用户拥有覆盖性的 update 权限
  check_permission('db.posts.update')
);
```

**注意**: 上述示例展示了手动创建组合策略的最佳实践。如果您选择使用框架提供的 `add_rbac_policies` 和 `add_owner_policy` 辅助函数，它们会分别为 RBAC 和所有权创建独立的策略。由于 PostgreSQL 会将同一操作的多个策略以 `OR` 逻辑组合，因此最终效果与单个组合策略是相同的。手动创建单个策略的可读性更高，而使用辅助函数则更便于自动化管理。

这个策略清晰地表达了我们的意图：**“要么你是这条帖子的主人，要么你拥有管理所有帖子的权限，否则你不能更新它。”**

同样的模式可以应用于 `SELECT`, `DELETE` 和 `INSERT` (在 `WITH CHECK` 子句中) 策略。

### **4. 细粒度的表管理函数 (RPC)**

为了方便管理员通过前端UI或脚本来管理表的安全特性，框架提供了一系列细粒度的数据库RPC函数。调用这些函数需要用户拥有 `system.rpc.invoke` 权限。

#### **4.1 `updated_at` 时间戳管理**

*   `add_updated_at_trigger(p_table_name TEXT)`: 为指定表附加 `updated_at` 自动更新触发器。
*   `remove_updated_at_trigger(p_table_name TEXT)`: 移除触发器。

#### **4.2 行级安全 (RLS)**

*   `enable_rls(p_table_name TEXT)`: 为指定表启用行级安全。
*   `disable_rls(p_table_name TEXT)`: 禁用行级安全。

#### **4.3 策略管理**

*   `add_rbac_policies(p_table_name TEXT)`: 为表创建一套标准的、仅基于RBAC权限的增删查改策略。
*   `remove_rbac_policies(p_table_name TEXT)`: 移除上述标准RBAC策略。
*   `add_owner_policy(p_table_name TEXT)`: 为表添加一个策略，允许用户完全访问自己创建的记录（基于 `user_id` 字段）。
*   `remove_owner_policy(p_table_name TEXT)`: 移除所有者访问策略。

**注意**: `add_rbac_policies` 和 `add_owner_policy` 创建的策略是独立的。对于需要同时支持所有者和管理员访问的场景，推荐根据第3节的“最佳实践”手动创建组合策略，而不是调用这些辅助函数。

### **5. 核心辅助函数**

以下是支撑整个权限和自动化体系的核心函数：

*   `check_permission(permission_name TEXT)`: 检查当前用户是否拥有指定权限。这是所有RLS策略和受保护RPC函数的核心依赖。
*   `handle_updated_at()`: 一个触发器函数，用于自动更新 `updated_at` 字段。
*   `get_user_permissions(user_id UUID)`: 获取指定用户的所有权限名称列表。