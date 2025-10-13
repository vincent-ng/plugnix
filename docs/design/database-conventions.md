# 数据库设计约定

本文档旨在沉淀项目开发过程中形成的通用数据库设计规范和最佳实践，以确保数据库结构的一致性、可维护性和高性能。

所有本文档中提到的 SQL 函数、表结构和策略的具体实现，均可在以下位置找到；推荐使用配套工具 plugnix-cli 管理迁移拷贝与命名，减少手工操作：
- 框架（全局）正式迁移：`/supabase/migrations/20251011084243_init.sql`
- 插件参考迁移：`/src/plugins/<plugin>/docs/migrations/init.sql`

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

### **6. 迁移文件组织与命名约定**

为保证数据库变更的可追踪性与可复现性，项目区分“框架（全局）迁移”与“插件参考迁移”。请严格遵循以下约定：

#### **6.1 目录与用途**

- `supabase/migrations/`：唯一的、受控的正式迁移目录。所有在环境中实际执行的迁移脚本都应存放在此处，并由 CI/DB 工具按时间顺序执行。
- `src/plugins/<plugin>/docs/migrations/`：插件的参考迁移脚本目录，用于插件文档与开发演示。将插件落库到真实环境时，应将其中的脚本整理为正式迁移，复制到 `supabase/migrations/` 并按命名规范重命名。

示例路径：
- 全局框架初始化：`supabase/migrations/20251011084243_init.sql`
- 插件参考脚本：`src/plugins/group/docs/migrations/init.sql`

#### **6.2 命名规范**

- 正式迁移文件名采用时间戳前缀：`YYYYMMDDHH24MISS_<slug>.sql`（例如：`20251011084243_init.sql`）。
- 插件参考迁移可使用 `init.sql` 作为初始脚本；当需要演示增量变更时，建议同样使用时间戳前缀，例如：`20251012091500_add_indexes.sql`。

#### **6.3 内容结构与幂等性**

- 迁移脚本必须具备幂等性：
  - 使用 `CREATE TABLE IF NOT EXISTS`、`DROP POLICY IF EXISTS`、`CREATE OR REPLACE FUNCTION` 等模式，避免重复执行报错。
  - 对策略与触发器，先移除旧版本再创建新版本。

#### **6.4 归属与前缀约定**

- 框架级别的通用函数与工具（如 `handle_updated_at`、`add_updated_at_trigger`、`setup_rbac_rls`、`check_group_permission`）应放入全局正式迁移中进行统一发布与维护。
- 插件的业务表、视图与特定 RPC 函数建议采用插件前缀命名，以确保可读性与避免冲突：`<plugin>_<entity>`（例如：`group_members`、`herodex_monsters`）。
- 权限命名保持统一格式：`db.<table>.<action>`，插件表同样遵循此规范。例如：`db.herodex_monsters.read`、`db.group_members.update`。

#### **6.5 执行顺序与依赖**

- 执行顺序遵循时间戳：先框架迁移，后插件迁移。
- 插件迁移如依赖框架函数（如 `check_group_permission`），必须确保依赖在此前的迁移中已发布。

#### **6.6 回滚与清理**

- 每个结构性变更应提供相应的清理逻辑（在需要回滚或重跑时使用），例如：`DROP VIEW IF EXISTS ...`、`ALTER TABLE ... DROP CONSTRAINT IF EXISTS ...`。
- 对于策略与触发器，提供 `DROP POLICY IF EXISTS` 与 `DROP TRIGGER IF EXISTS` 片段以便安全更新。

#### **6.7 将插件参考迁移转为正式迁移的流程**

优先使用 plugnix-cli 自动化完成以下步骤；手工流程仅在需要自定义命名或拆并脚本时使用：
1. 在 `src/plugins/<plugin>/docs/migrations/` 中完成并验证 SQL 逻辑。
2. 使用工具进行拷贝与命名（详见第 7 节）；或手工复制到 `supabase/migrations/` 并采用时间戳命名，按 6.3 的结构整理注释与幂等性。
3. 在本地/CI 环境执行并验证：先运行框架初始化，再运行该插件迁移。
4. 如需在生产环境应用，确保权限策略与 `group_id` 归属一致，策略统一使用：
   - `USING (check_group_permission(<table>.group_id, 'db.<table>.<action>'))`

### **7. 插件迁移集成（plugnix-cli）**

为降低人工操作成本并保证路径与命名一致性，框架提供配套工具 plugnix-cli。在使用该工具添加插件时，将自动对迁移脚本执行以下处理：

- 源位置：插件的参考迁移脚本始终位于 `src/plugins/<plugin>/docs/migrations/`，工具会扫描其中的 `.sql` 文件。
- 拷贝与命名：工具会将上述脚本拷贝到 `supabase/migrations/`，并统一采用时间戳前缀命名，追加合理的 slug（通常来源于文件用途，如 `init`、`add_indexes`）。示例：`20251012091500_herodex_init.sql`。
- 顺序与幂等：拷贝后的执行顺序以时间戳为准；脚本本身应遵循 6.3 的幂等原则，工具不修改脚本内容，仅拷贝与命名。
- 依赖关系：插件迁移如依赖框架通用函数（如 `check_group_permission`、`handle_updated_at`），需保证这些函数在更早的框架迁移中已发布；工具不会注入依赖。
- 冲突处理：若目标目录中存在相同 slug 或功能重叠的迁移，工具会避免直接覆盖（具体策略以工具实现为准），开发者可在拷贝后进行人工重命名或合并。
- 灵活性：
  - 插件作者可以将参考迁移拆分为多个文件；工具将逐一拷贝并分别命名。
  - 拷贝后的文件可进行人工调整（重命名、拆并），但须保持时间戳顺序与幂等性。
  - 大型增量变更建议先在插件目录完成验证，再通过工具同步到正式迁移。

简而言之：开发者只需在插件目录维护参考迁移；使用 plugnix-cli 添加插件时，工具会自动完成拷贝与规范命名，并将正式迁移置于 `supabase/migrations/`，其余灵活性留给开发者在拷贝后按需调整。