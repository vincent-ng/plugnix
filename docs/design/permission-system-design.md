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
*   **角色 (Role)**: 一组权限的集合 (例如 `admin`, `editor`)。
*   **用户 (User)**: 通过被赋予一个或多个角色来获得相应的权限。

**权限命名约定 (重要！)**

为了清晰地组织和区分权限，我们采用以下前缀格式：

*   `db.<table_name>.<action>`: 用于描述对数据库表的操作权限。这是后端Edge Function进行验证时使用的格式。
    *   **示例**: `db.posts.create`, `db.users.delete`
*   `ui.<plugin_name>.<feature>`: 用于描述前端UI元素的可见性或可交互性，与后端操作不直接挂钩。
    *   **示例**: `ui.dashboard.view-analytics`, `ui.settings.show-advanced-options`

---
#### **3. 系统如何工作？**

##### **第一步：数据库设置**

我们的权限模型依赖于Supabase中的四张核心表。你可以将下面的SQL脚本一次性复制到Supabase SQL Editor中执行，以完成所有表的创建和配置。

```sql
-- ==== 0. 创建一个可重用的触发器函数, 用于自动更新 updated_at 时间戳 ====
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- 将新记录的 updated_at 字段设置为当前事务的时间戳
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ==== 1. `permissions` 表: 存储所有可用的权限 ====
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON COLUMN permissions.id IS '权限的唯一标识符';
COMMENT ON COLUMN permissions.name IS '权限的唯一名称 (例如, ''db.posts.create'', ''ui.dashboard.view'')';
COMMENT ON COLUMN permissions.description IS '对该权限用途的友好描述';
COMMENT ON COLUMN permissions.created_at IS '权限创建时的时间戳';
COMMENT ON COLUMN permissions.updated_at IS '权限最后更新时的时间戳';

-- RLS Policy: 允许公开读取权限
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to permissions" ON permissions FOR SELECT USING (true);

-- Trigger: 在每次更新前调用 handle_updated_at 函数
CREATE TRIGGER on_permissions_update
  BEFORE UPDATE ON permissions
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();


-- ==== 2. `roles` 表: 存储所有角色 ====
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON COLUMN roles.id IS '角色的唯一标识符';
COMMENT ON COLUMN roles.name IS '角色的唯一名称 (例如, ''admin'', ''editor'')';
COMMENT ON COLUMN roles.description IS '对该角色用途的友好描述';
COMMENT ON COLUMN roles.created_at IS '角色创建时的时间戳';
COMMENT ON COLUMN roles.updated_at IS '角色最后更新时的时间戳';

-- RLS Policy: 允许公开读取角色
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to roles" ON roles FOR SELECT USING (true);

-- Trigger: 在每次更新前调用 handle_updated_at 函数
CREATE TRIGGER on_roles_update
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();


-- ==== 3. `role_permissions` 表: 关联角色与权限 (多对多) ====
CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

COMMENT ON COLUMN role_permissions.role_id IS '外键，引用 roles 表';
COMMENT ON COLUMN role_permissions.permission_id IS '外键，引用 permissions 表';

-- RLS Policy: 允许公开读取角色-权限关系
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to role_permissions" ON role_permissions FOR SELECT USING (true);


-- ==== 4. `user_roles` 表: 关联用户与角色 (多对多) ====
CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

COMMENT ON COLUMN user_roles.user_id IS '外键，引用 auth.users 表';
COMMENT ON COLUMN user_roles.role_id IS '外键，引用 roles 表';

-- RLS Policy: 允许用户读取自己的角色
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read their own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
```

##### **第二步：初始化系统权限 (重要！)**

为了让系统能够启动，我们需要一个拥有最高权限的`admin`角色。这个角色需要能够管理所有与权限相关的表，以便后续在前端创建权限管理插件。

请执行以下SQL语句来创建`admin`角色并授予其管理权限、角色和用户分配的初始权限：

```sql
-- 1. 创建一个名为 'admin' 的角色
INSERT INTO roles (name, description) VALUES ('admin', 'Super Administrator with all permissions');

-- 2. 定义管理权限系统所需的核心权限
INSERT INTO permissions (name, description) VALUES
  ('db.permissions.select', 'Read all permissions'),
  ('db.permissions.insert', 'Create new permissions'),
  ('db.permissions.update', 'Update existing permissions'),
  ('db.permissions.delete', 'Delete permissions'),
  ('db.roles.select', 'Read all roles'),
  ('db.roles.insert', 'Create new roles'),
  ('db.roles.update', 'Update existing roles'),
  ('db.roles.delete', 'Delete roles'),
  ('db.role_permissions.select', 'Read role-permission assignments'),
  ('db.role_permissions.insert', 'Assign permissions to roles'),
  ('db.role_permissions.delete', 'Remove permissions from roles'),
  ('db.user_roles.select', 'Read user-role assignments'),
  ('db.user_roles.insert', 'Assign roles to users'),
  ('db.user_roles.delete', 'Remove roles from users');

-- 3. 将上述所有权限授予 'admin' 角色
DO $$
DECLARE
  admin_role_id UUID;
  perm_id UUID;
BEGIN
  -- 获取 admin 角色的 ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';

  -- 遍历所有刚刚创建的权限并分配给 admin 角色
  FOR perm_id IN (SELECT id FROM permissions WHERE name LIKE 'db.%')
  LOOP
    INSERT INTO role_permissions (role_id, permission_id) VALUES (admin_role_id, perm_id);
  END LOOP;
END $$;
```

**注意**: 上述SQL执行后，你还需要手动将`admin`角色分配给你的管理员用户。这可以通过在`user_roles`表中插入一条记录来完成，例如：
`INSERT INTO user_roles (user_id, role_id) VALUES ('你的管理员用户ID', 'admin角色的ID');`

##### **第三步：后端API授权**

我们的通用Edge Function (`admin-api-proxy`) 会在每次接收到请求时，自动检查用户是否拥有执行操作所需的权限。它会根据请求的 `table` 和 `operation` 参数，自动在前面加上 `db.` 前缀来构建所需的权限字符串。

例如，一个删除`posts`表的请求 (`{ operation: 'delete', table: 'posts' }`) 会被转换成检查用户是否拥有 `db.posts.delete` 权限。

这个过程对插件开发者是透明的。你只需要确保你的操作有对应的权限定义，并且用户被授予了正确的角色。

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
    permission: 'ui.your-plugin.view' // <-- 使用UI权限控制菜单可见性
  });

  registerRoute({
    path: '/admin/your-plugin',
    component: YourPluginPage,
    permission: 'ui.your-plugin.view' // <-- 使用UI权限控制路由访问
  });
}
```

**3. 细粒度UI控制 (`<Authorized />` 组件)**

对于页面内部的某个按钮或特定区域，你可以使用 `<Authorized />` 组件来包裹它。

```jsx
// src/plugins/your-plugin/YourPluginPage.jsx
import { Authorized } from '@/framework/components/Authorized';
import { Button } from '@/framework/components/ui/button';

export default function YourPluginPage() {
  return (
    <div>
      <h2>Your Plugin</h2>
      
      {/* 示例1: 这个按钮的显示与否，取决于用户是否有创建文章的后端权限 */}
      <Authorized permission="db.posts.create">
        <Button>Create New Post</Button>
      </Authorized>

      <br />

      {/* 示例2: 这个区域只有拥有特定UI权限的用户才能看到 */}
      <Authorized permission="ui.your-plugin.show-special-feature">
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
#### **4. 总结**

通过遵循以上步骤，你可以轻松地为你的插件集成强大而灵活的权限控制。这不仅提升了应用的安全性，也改善了不同用户角色的使用体验。