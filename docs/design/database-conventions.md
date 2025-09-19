# 数据库设计约定

本文档旨在沉淀项目开发过程中形成的通用数据库设计规范和最佳实践，以确保数据库结构的一致性、可维护性和高性能。

---

### **1. 时间戳管理 (`created_at` & `updated_at`)**

#### **约定**

所有需要追踪创建和更新时间的表，都应包含以下两个字段：

*   `created_at`: `TIMESTAMPTZ` 类型, `DEFAULT now()`。该字段在记录创建时自动填充，之后不再改变。
*   `updated_at`: `TIMESTAMPTZ` 类型, `DEFAULT now()`。该字段在记录创建时填充，并在每次记录更新时自动更新为当前时间。

#### **实现方式**

为了自动化 `updated_at` 字段的更新，我们采用一个通用的PostgreSQL触发器函数。这种方法将更新逻辑从应用层解耦，确保了数据的一致性和准确性。

**第一步：创建可重用的触发器函数**

这个函数只需在数据库中创建一次，便可被任何需要此功能的表所使用。

```sql
-- 创建或替换一个函数，用于在行更新时自动设置 updated_at 字段
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- 将新记录的 updated_at 字段设置为当前事务的时间戳
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**第二步：在表上应用触发器**

对于任何需要自动更新 `updated_at` 的表，在创建表之后，需要为其绑定一个触发器。

```sql
-- 示例：为名为 'your_table' 的表创建触发器
CREATE TRIGGER on_your_table_update
  BEFORE UPDATE ON your_table
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

### **2. 用户设计 (`auth.users`)**

#### **约定**

我们直接采用Supabase内置的`auth.users`表来管理用户信息。此表由Supabase Auth系统自动维护，包含了用户的唯一标识符（`id`）、邮箱、密码（加密后）以及其他认证相关的数据。

在设计其他数据表时，如果需要关联到用户，应使用`user_id`字段，并将其设置为外键，引用`auth.users(id)`。

### **3. 权限设计**

关于权限系统的详细设计，包括数据表结构（`roles`, `permissions`, `role_permissions`, `user_roles`）、权限命名约定以及前后端集成实践，请参阅独立的详细设计文档：

[**权限系统设计文档 (permission-system-design.md)](./permission-system-design.md)