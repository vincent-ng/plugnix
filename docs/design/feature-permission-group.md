# 设计文档：集团权限系统 (Group Permission)

本文档详细阐述了在现有“所有权”和“全局RBAC”权限模型的基础上，如何引入“集团”这一新的权限维度，以支持更复杂的多租户和团队协作场景。

## 1. 核心思想

集团权限的核心思想是：**用户的操作权限不仅取决于其自身的角色，还取决于其在特定数据所属的“集团”中所扮演的角色。**

这在以下三个层级上扩展了我们现有的权限模型：

1.  **个人层级 (所有权)**: 用户对自己创建的数据拥有完全控制权。
2.  **集团层级 (团队协作)**: 用户可以访问和操作其所在集团拥有的数据，具体权限由其在集团内的角色（如`group_admin`, `group_member`）决定。
3.  **全局层级 (管理员)**: 拥有全局权限的管理员（如`super_admin`）可以跨越所有集团和所有权限制，对系统内所有数据进行操作。

这三个层级通过 `OR` 逻辑组合，形成一个灵活而强大的权限判断链。

## 2. 数据库结构扩展

为了支持集团权限，我们需要对数据库进行以下扩展：

#### **2.1 `groups` 表**

用于存储集团的基本信息。

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  -- 如果需要，可以有一个集团所有者
  owner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 别忘了启用 RLS 和添加基础策略
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
-- 允许所有登录用户读取集团列表
CREATE POLICY "Allow authenticated users to read groups" ON groups FOR SELECT USING (auth.role() = 'authenticated');
-- 允许集团所有者或全局管理员修改集团信息
CREATE POLICY "Allow owner or admin to update group" ON groups FOR UPDATE USING (auth.uid() = owner_id OR check_permission('db.groups.update'));
```

#### **2.2 `user_groups` 表**

这是一个关键的关联表，用于定义用户与集团的成员关系以及其在集团内的角色。

```sql
-- 定义一个 ENUM 类型来规范集团内的角色
CREATE TYPE group_role AS ENUM ('group_admin', 'group_editor', 'group_viewer');

CREATE TABLE user_groups (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  role group_role NOT NULL DEFAULT 'group_viewer',
  PRIMARY KEY (user_id, group_id)
);

-- 启用 RLS
ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
-- 允许用户查看自己所属的集团
CREATE POLICY "Allow users to read their own group memberships" ON user_groups FOR SELECT USING (auth.uid() = user_id);
-- 允许集团管理员或全局管理员管理集团成员
CREATE POLICY "Allow group admins or global admins to manage members" ON user_groups
  FOR ALL
  USING (
    -- 检查是否是全局管理员
    check_permission('db.user_groups.manage')
    OR
    -- 检查是否是该集团的 group_admin
    EXISTS (
      SELECT 1
      FROM user_groups ug
      WHERE ug.group_id = user_groups.group_id AND ug.user_id = auth.uid() AND ug.role = 'group_admin'
    )
  );
```

#### **2.3 为数据表添加 `group_id`**

对于需要进行集团权限控制的数据表（例如 `posts`），必须添加一个 `group_id` 字段，用于标识该记录隶属于哪个集团。

```sql
ALTER TABLE posts
ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE SET NULL;
```

## 3. RLS 策略升级

这是实现集团权限的核心。我们需要将原有的两段式 `OR` 逻辑扩展为三段式。

**示例：`posts` 表的 `UPDATE` 策略**

```sql
-- 移除旧策略
DROP POLICY "Allow update for owners OR admins with permission" ON public.posts;

-- 创建新的三段式策略
CREATE POLICY "Allow update for owners, admins, or group admins"
ON public.posts
FOR UPDATE
USING (
  -- 条件1: 当前用户是这条记录的所有者 (个人层级)
  auth.uid() = user_id
  OR
  -- 条件2: 当前用户拥有覆盖性的全局 update 权限 (全局层级)
  check_permission('db.posts.update')
  OR
  -- 新增条件3: 当前用户是该记录所属集团的管理员 (集团层级)
  EXISTS (
    SELECT 1
    FROM user_groups
    WHERE
      user_groups.group_id = posts.group_id AND -- 匹配记录的集团ID
      user_groups.user_id = auth.uid() AND     -- 匹配当前用户
      user_groups.role = 'group_admin'         -- 检查集团角色
  )
);
```

同样的逻辑可以应用于 `SELECT`, `DELETE` 和 `INSERT` 策略，只需根据具体操作调整集团角色 (`group_admin`, `group_editor` 等) 的判断即可。

## 4. 前端集成与使用流程

1.  **创建/加入集团**: 应用需要提供UI让用户可以创建新的集团，或者被邀请加入一个已有的集团。
2.  **数据归属**: 当用户创建一条需要集团管理的数据时（如一篇团队博客），前端需要在创建请求中包含 `group_id`。
3.  **上下文切换**: 应用应允许用户在不同的集团上下文之间切换。当用户切换到一个集团时，前端应重新拉取该集团下的数据。由于RLS策略在数据库层面强制执行，前端只需发出标准的查询请求，数据库会自动过滤出该用户在该集团下有权查看的数据。
4.  **成员管理**: 拥有 `group_admin` 角色的用户或全局管理员，应该能看到管理集团成员的UI（添加/移除成员，变更角色）。

## 5. 总结

通过引入 `groups` 和 `user_groups` 表，并升级RLS策略以包含对集团成员角色的检查，我们成功地将权限模型从“个人 vs 管理员”的二维结构，扩展到了包含“团队协作”的三维结构。这为构建功能丰富的多租户应用奠定了坚实的基础。