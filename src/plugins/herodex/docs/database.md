本插件项目命名为：
*   **中文名：小侠成长录**
*   **英文名：Herodex**

接下来，是一套可以直接在 Supabase SQL Editor 中运行的数据库结构。这套结构会使用你选择的 `hdx_` 前缀，并采纳 Supabase/PostgreSQL 的最佳实践（如使用 `UUID` 作为主键、`TIMESTAMPTZ` 记录时间、`JSONB` 存储结构化数据等）。

---
### **表结构详细解读**

#### 1. `hdx_players` (玩家表)
*   `player_id (UUID)`: 使用 UUID 作为主键，比自增整数更安全、更适合分布式系统。
*   `total_xp (BIGINT)`: 使用 `BIGINT` 避免未来修为点数过高导致溢出。
*   **给家长看**: `player_name`
*   **给孩子看**: `game_alias`, `total_xp`, `level_title`

#### 2. `hdx_subjects` (学科表)
*   `subject_id (UUID)`: 学科的唯一标识。
*   `subject_name_real`: 给家长看的学科名称 (例如: "语文").
*   `subject_name_game`: 给孩子看的学科名称 (例如: "神州正气诀").
*   `description_real`: 给家长看的学科描述。
*   `description_game`: 给孩子看的学科描述。

#### 3. `hdx_skills` (技能定义表)
*   `thresholds_json (JSONB)`: 使用 `JSONB` 类型来存储升级阈值，这是 PostgreSQL 处理 JSON 的最高效方式。你可以轻松地查询和操作它。例如 `{"1": 50, "2": 150, ...}` 表示升到Lv2需要总熟练度50，升到Lv3需要总熟练度150。
*   `subject_id`: 关联到 `hdx_subjects` 表，表明该技能属于哪个学科。
*   **给家长看**: `skill_name_real`, `description_real`, `grade_level`
*   **给孩子看**: `skill_name_game`, `description_game`

#### 3. `hdx_player_skills` (玩家技能进度表)
*   `player_id` & `skill_id`: 两个外键，将玩家和技能关联起来。
*   `ON DELETE CASCADE` for `player_id`: 如果删除玩家，他所有的技能进度也会被一并删除。
*   `ON DELETE RESTRICT` for `skill_id`: 如果一个技能正在被玩家学习，系统会阻止你删除这个技能，防止数据不一致。
*   `status (hdx_skill_status)`: 使用自定义的 `ENUM` 类型，限制了状态只能是 `LOCKED`, `UNLOCKED`, `MASTERED` 中的一个，非常严谨。
*   `UNIQUE (player_id, skill_id)`: 唯一约束，确保不会出现一个玩家对同一个技能有多条进度记录的脏数据。

#### 4. `hdx_skill_dependencies` (技能依赖表)
*   这张表结构清晰地定义了“A技能是B技能的前置条件”。
*   `skill_id`: 待解锁的技能。
*   `prerequisite_skill_id`: 前置技能。
*   `unlock_level`: 前置技能需要达到的等级。
*   `ON DELETE CASCADE`: 如果一个技能被删除了，与之相关的所有依赖规则也应该被删除。

#### 5. `hdx_activity_log` (活动日志表)
*   这是你（家长）最常操作的表。每次“加点”就是在这里插入一条新记录。
*   `affected_skill_id`: 记录本次熟练度加在了哪个技能上。
*   `ON DELETE SET NULL`: 如果你以后决定删除某个技能，相关的日志记录不会丢失，只是`affected_skill_id`会变成空值，保留了历史操作记录。


接下来是一套覆盖1-6年级语数英三科核心知识点的初始数据，包含酷炫的武侠风名称，并直接提供可执行的SQL插入语句。

这套数据分为两个部分：
1.  **技能定义 (`hdx_skills`)**: 定义所有基础技能。
2.  **技能依赖 (`hdx_skill_dependencies`)**: 构建技能树的连接关系。

---

### **重要提示**

*   **运行环境**: 请在 Supabase 项目的 `SQL Editor` 中运行此脚本。
*   **前提**: 确保你已经运行了上一节我提供的表结构创建脚本。此脚本应在空的 `hdx_skills` 和 `hdx_skill_dependencies` 表上运行。
*   **UUID生成**: 脚本会自动调用 `uuid_generate_v4()` 生成唯一的 `skill_id`。
*   **可读性**: 我在依赖关系部分使用了子查询 `(SELECT skill_id FROM hdx_skills WHERE ...)` 来关联技能，这比手动处理UUID更清晰、更不容易出错。

---

### **Herodex 初始技能树 SQL 脚本**


```sql
-- Herodex (小侠成长录) Database Schema for Supabase
-- Prefix: hdx_

-- PART 1: Custom Types
-- We create a custom ENUM type for skill status to ensure data integrity.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hdx_skill_status') THEN
        CREATE TYPE hdx_skill_status AS ENUM ('LOCKED', 'UNLOCKED', 'MASTERED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hdx_submission_status') THEN
        CREATE TYPE hdx_submission_status AS ENUM ('PENDING', 'PROCESSED', 'COMPLETED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hdx_attachment_type') THEN
        CREATE TYPE hdx_attachment_type AS ENUM ('IMAGE', 'AUDIO', 'VIDEO');
    END IF;
END$$;

-- PART 2: Main Tables

-- Table: hdx_players
-- Stores the player's (your son's) core information.
CREATE TABLE hdx_players (
    player_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name TEXT NOT NULL,
    game_alias TEXT,
    total_xp BIGINT NOT NULL DEFAULT 0,
    level_title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE hdx_players IS '玩家信息表';

-- Table: hdx_subjects
-- Stores subject information with different views for parents and children.
CREATE TABLE hdx_subjects (
    subject_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_name_real TEXT NOT NULL,
    subject_name_game TEXT NOT NULL,
    description_real TEXT,
    description_game TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE hdx_subjects IS '学科信息表';

-- Table: hdx_skills
-- The master definition table for all skills (the "武功秘籍总纲").
CREATE TABLE hdx_skills (
    skill_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_name_game TEXT NOT NULL,
    skill_name_real TEXT NOT NULL,
    description_game TEXT,
    description_real TEXT,
    subject_id UUID NOT NULL REFERENCES hdx_subjects(subject_id) ON DELETE RESTRICT,
    grade_level INT,
    max_level INT NOT NULL DEFAULT 5,
    thresholds_json JSONB, -- Example: hdx_generate_thresholds()
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE hdx_skills IS '技能定义总表';

-- Table: hdx_player_skills
-- This is the core table tracking the player's progress on each skill.
CREATE TABLE hdx_player_skills (
    player_skill_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES hdx_players(player_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES hdx_skills(skill_id) ON DELETE RESTRICT,
    current_proficiency INT NOT NULL DEFAULT 0,
    current_level INT NOT NULL DEFAULT 1,
    status hdx_skill_status NOT NULL DEFAULT 'LOCKED',
    unlocked_at TIMESTAMPTZ,
    mastered_at TIMESTAMPTZ,
    -- Ensure each player can only have one entry per skill
    UNIQUE (player_id, skill_id)
);
COMMENT ON TABLE hdx_player_skills IS '玩家技能进度表';

-- Table: hdx_skill_dependencies
-- Defines the skill tree structure (which skills are prerequisites for others).
CREATE TABLE hdx_skill_dependencies (
    dependency_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skill_id UUID NOT NULL REFERENCES hdx_skills(skill_id) ON DELETE CASCADE, -- The skill that will be unlocked
    prerequisite_skill_id UUID NOT NULL REFERENCES hdx_skills(skill_id) ON DELETE CASCADE, -- The skill that must be completed first
    unlock_level INT NOT NULL, -- The level the prerequisite skill must reach
    -- Ensure a dependency rule is unique
    UNIQUE (skill_id, prerequisite_skill_id)
);
COMMENT ON TABLE hdx_skill_dependencies IS '技能依赖关系表';

-- Table: hdx_activity_log
-- The "ledger" where the parent records all activities and awards points.
CREATE TABLE hdx_activity_log (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES hdx_players(player_id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- e.g., '作业', '预习', '考试', '家长奖励'
    xp_gained INT NOT NULL DEFAULT 0,
    proficiency_gained INT NOT NULL DEFAULT 0,
    affected_skill_id UUID REFERENCES hdx_skills(skill_id) ON DELETE SET NULL, -- If a skill is deleted, the log remains but the link is broken
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE hdx_activity_log IS '活动日志与加点记录表';

-- Table: hdx_daily_submissions
-- Stores daily homework submissions from the player.
CREATE TABLE hdx_daily_submissions (
    submission_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL REFERENCES hdx_players(player_id) ON DELETE CASCADE,
    submission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diary_text TEXT, -- This is now optional (nullable)
    status hdx_submission_status NOT NULL DEFAULT 'PENDING',
    ai_suggestion_json JSONB,
    final_log_id UUID REFERENCES hdx_activity_log(log_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (player_id, submission_date) -- Ensures one submission per player per day
);
COMMENT ON TABLE hdx_daily_submissions IS '每日功课呈报表，一次呈报可包含多份附件。';

-- Table: hdx_submission_attachments
-- Stores each attachment (image, audio, video) associated with a daily submission.
CREATE TABLE hdx_submission_attachments (
    attachment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES hdx_daily_submissions(submission_id) ON DELETE CASCADE,
    file_type hdx_attachment_type NOT NULL,
    file_path TEXT NOT NULL UNIQUE, -- Path in Supabase Storage, should be unique
    file_name TEXT,
    file_size_bytes BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE hdx_submission_attachments IS '存储每次呈报关联的附件（图片、音视频等）。';


-- Herodex (小侠成长录) Database Reset Function
-- This function will drop all tables, types, and functions prefixed with 'hdx_'.
-- WARNING: This is a DESTRUCTIVE operation and will permanently delete all data and structures.

CREATE OR REPLACE FUNCTION hdx_reset_database()
RETURNS void AS $$
DECLARE
    -- A variable to hold the name of each object during the loop
    obj_name TEXT;
BEGIN
    -- 1. Drop all tables prefixed with 'hdx_'
    RAISE NOTICE 'Dropping all tables prefixed with hdx_...';
    FOR obj_name IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name LIKE 'hdx_%'
    LOOP
        RAISE NOTICE 'Dropping table: %', obj_name;
        EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', obj_name);
    END LOOP;

    -- 2. Drop all functions prefixed with 'hdx_'
    RAISE NOTICE 'Dropping all functions prefixed with hdx_...';
    FOR obj_name IN
        SELECT p.proname
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname LIKE 'hdx_%'
    LOOP
        -- To correctly drop a function, we need its full signature (name and argument types).
        -- This is a simplified approach that works for functions without overloads.
        -- For a more robust solution, one would need to construct the full signature.
        RAISE NOTICE 'Dropping function: %', obj_name;
        EXECUTE format('DROP FUNCTION IF EXISTS %I CASCADE', obj_name);
    END LOOP;

    -- 3. Drop all custom types prefixed with 'hdx_'
    RAISE NOTICE 'Dropping all custom types prefixed with hdx_...';
    FOR obj_name IN
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typname LIKE 'hdx_%'
    LOOP
        RAISE NOTICE 'Dropping type: %', obj_name;
        EXECUTE format('DROP TYPE IF EXISTS %I CASCADE', obj_name);
    END LOOP;

    RAISE NOTICE 'Herodex database reset complete.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a comment to the function for clarity
COMMENT ON FUNCTION hdx_reset_database() IS 'Drops all tables, types, and functions prefixed with hdx_. Use with extreme caution.';

-- Function to get subject_id by its real name
CREATE OR REPLACE FUNCTION hdx_get_subject_id(p_subject_name_real TEXT)
RETURNS UUID AS $$
DECLARE
    v_subject_id UUID;
BEGIN
    SELECT subject_id INTO v_subject_id FROM hdx_subjects WHERE subject_name_real = p_subject_name_real;
    RETURN v_subject_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION hdx_get_subject_id(TEXT) IS 'Retrieves the UUID of a subject based on its real name.';

-- Function to generate dynamic level thresholds based on grade and max level
CREATE OR REPLACE FUNCTION hdx_generate_thresholds(p_max_level INT DEFAULT 5)
RETURNS JSONB AS $$
DECLARE
    thresholds JSONB := '{}'::jsonb;
    i INT;
    xp_for_level INT := 10;
    cumulative_xp INT := 0;
BEGIN
    FOR i IN 1..p_max_level LOOP
        cumulative_xp := cumulative_xp + xp_for_level;
        thresholds := jsonb_set(thresholds, ARRAY[i::text], to_jsonb(cumulative_xp));
    END LOOP;
    RETURN thresholds;
END;
$$ LANGUAGE plpgsql;
COMMENT ON FUNCTION hdx_generate_thresholds(INT) IS 'Generates a JSONB object of level thresholds based on max level.';


-- Herodex (小侠成长录) Initial Seed Data
-- This script populates the hdx_skills and hdx_skill_dependencies tables.
-- Run this script only once on a fresh database setup.

-- PART 1: Define all subjects in the hdx_subjects table.
INSERT INTO hdx_subjects (subject_name_real, subject_name_game, description_real, description_game) VALUES
('语文', '神州正气诀', '提升语言文字运用能力。', '修炼此诀，可言出法随，掌控文字之力。'),
('数学', '乾坤演算阵', '锻炼逻辑思维与解决问题的能力。', '参悟此道，可洞悉天地至理，推演万物变化。'),
('英语', '异域言灵术', '学习国际通用语言，开阔视野。', '大成此功，可无碍穿行四海，与万国交流。');

-- PART 2: Define all skills in the hdx_skills table.

INSERT INTO hdx_skills (skill_name_game, skill_name_real, description_game, description_real, subject_id, grade_level, thresholds_json) VALUES
-- =================================================================
-- 语文 (神州正气诀)
-- =================================================================
-- 年级 1
('正音心法', '拼音掌握', '内功之始，吐纳清浊，言出法随的基础。', '掌握23个声母、24个韵母及16个整体认读音节。', hdx_get_subject_id('语文'), 1, hdx_generate_thresholds()),
('象形初解', '识字300', '观天地万物之形，悟文字初生之秘。', '认识常用汉字300个。', hdx_get_subject_id('语文'), 1, hdx_generate_thresholds()),
('笔画筑基', '写字100', '一横一竖，皆是修行，稳固根基方能挥洒自如。', '会写100个汉字。', hdx_get_subject_id('语文'), 1, hdx_generate_thresholds()),
('言出法随·初式', '简单陈述句', '以“我你他”为引，驱动语言之力，描述周遭世界。', '学会用“我、你、他”等代词造简单陈述句。', hdx_get_subject_id('语文'), 1, hdx_generate_thresholds()),
-- 年级 2
('多音变幻', '多音字掌握', '一字多音，如内力流转，变化万千。', '掌握常见多音字（如“长”“发”）。', hdx_get_subject_id('语文'), 2, hdx_generate_thresholds()),
('因果联结', '关联词造句', '洞悉事物之因果，言语之间，逻辑自成。', '用“因为所以”“如果就”等关联词造句。', hdx_get_subject_id('语文'), 2, hdx_generate_thresholds()),
('神识探微', '短文信息提取', '凝神静气，于字里行间捕捉关键信息。', '理解短文中心思想，提取关键信息。', hdx_get_subject_id('语文'), 2, hdx_generate_thresholds()),
('墨染方寸', '百字短文', '汇聚笔力，于方寸之间描绘世间一角。', '尝试写50-100字的短文，描述简单事件。', hdx_get_subject_id('语文'), 2, hdx_generate_thresholds()),
-- 年级 3
('万象归宗', '成语与近反义词', '四字成言，道尽千古事；词义相对，掌控语言的平衡。', '积累成语、近义词、反义词。', hdx_get_subject_id('语文'), 3, hdx_generate_thresholds()),
('句式伸缩', '扩句与缩句', '内力收放自如，句式长短随心。', '学习扩写与缩写句子。', hdx_get_subject_id('语文'), 3, hdx_generate_thresholds()),
('总分合流', '文章结构分析', '看穿文章的筋骨脉络，领悟作者的布局之道。', '分析文章结构（如总分总），体会作者意图。', hdx_get_subject_id('语文'), 3, hdx_generate_thresholds()),
('妙笔生花·记事篇', '记叙文基础', '以时间为轴，用文字复现过往的精彩瞬间。', '写200-300字记叙文，按时间顺序描述事件。', hdx_get_subject_id('语文'), 3, hdx_generate_thresholds()),
-- 年级 4
('一字千解', '多义词理解', '领悟文字的深层含义，一词多用，意境无穷。', '理解多义词的不同含义。', hdx_get_subject_id('语文'), 4, hdx_generate_thresholds()),
('生花妙笔', '修辞手法·初级', '学会比喻与拟人，赋予文字以生命和色彩。', '掌握比喻、拟人等修辞手法。', hdx_get_subject_id('语文'), 4, hdx_generate_thresholds()),
('灵犀一点', '批注式阅读', '心与文通，笔随心动，在书页上留下思考的印记。', '学习批注式阅读，体会人物情感。', hdx_get_subject_id('语文'), 4, hdx_generate_thresholds()),
('妙笔生花·细节篇', '记叙文进阶', '注入细节，让文字拥有触感、声音和温度。', '写300-400字记叙文，加入细节描写。', hdx_get_subject_id('语文'), 4, hdx_generate_thresholds()),
-- 年级 5
('形近破妄', '形近字辨析', '修炼火眼金睛，辨析毫厘之差，识破文字的幻象。', '辨析形近字（如“辩、辨、辫”）。', hdx_get_subject_id('语文'), 5, hdx_generate_thresholds()),
('言语万钧', '修辞手法·中级', '排比如浪潮，夸张似惊雷，言语之力，足以撼动人心。', '学习排比、夸张等修辞手法。', hdx_get_subject_id('语文'), 5, hdx_generate_thresholds()),
('神游经典', '名著节选分析', '与古代豪杰对话，洞察人物性格，领悟传世智慧。', '分析名著节选，理解人物性格与主题思想。', hdx_get_subject_id('语文'), 5, hdx_generate_thresholds()),
('妙笔生花·说明篇', '说明文入门', '化身造物主，用文字清晰地描绘一种事物的构造与奥秘。', '学习写说明文（如介绍一种动物）。', hdx_get_subject_id('语文'), 5, hdx_generate_thresholds()),
-- 年级 6
('典故通晓', '谚语与典故', '掌握流传千年的智慧结晶，一言一行，皆有出处。', '积累谚语、典故。', hdx_get_subject_id('语文'), 6, hdx_generate_thresholds()),
('舌战莲花', '修辞手法·高级', '反问之力，双否之定，言辞交锋，无往不利。', '掌握反问句、双重否定句等。', hdx_get_subject_id('语文'), 6, hdx_generate_thresholds()),
('大道至简', '议论文分析', '剖析论点，审视论据，掌握以理服人的至高法门。', '分析议论文结构，理解作者观点。', hdx_get_subject_id('语文'), 6, hdx_generate_thresholds()),
('立论天下', '议论文写作', '确立己见，引经据典，以文字为剑，捍卫自己的观点。', '写500-600字议论文，学会用事例支持观点。', hdx_get_subject_id('语文'), 6, hdx_generate_thresholds()),

-- =================================================================
-- 数学 (乾坤衍算阵)
-- =================================================================
-- 年级 1
('百数归宗', '100内数认识', '万物皆数，从一到百，构建你的数字领域。', '认识1-100的数。', hdx_get_subject_id('数学'), 1, hdx_generate_thresholds()),
('加减双诀', '20以内加减法', '宇宙间的聚散离合，尽在加减二字之间。', '掌握20以内加减法。', hdx_get_subject_id('数学'), 1, hdx_generate_thresholds()),
('方圆之道', '基础图形识别', '洞悉世界的几何本源，方是规矩，圆是变化。', '识别长方形、正方形、圆等。', hdx_get_subject_id('数学'), 1, hdx_generate_thresholds()),
-- 年级 2
('九九归一诀', '乘法口诀', '九九八十一句真言，是衍算万物的核心阵法。', '学习并掌握乘法口诀。', hdx_get_subject_id('数学'), 2, hdx_generate_thresholds()),
('度量衡初探', '单位认知', '丈量时间，称量万物，掌握世界的刻度。', '认识钟表、元角分。', hdx_get_subject_id('数学'), 2, hdx_generate_thresholds()),
-- 年级 3
('万法乘一', '多位数乘一位数', '以单位之数，驱动千军万马，其势不可挡。', '掌握多位数乘一位数。', hdx_get_subject_id('数学'), 3, hdx_generate_thresholds()),
('破碎虚空', '分数初步认识', '突破整数的束缚，窥见“一”之下的无限世界。', '初步认识分数。', hdx_get_subject_id('数学'), 3, hdx_generate_thresholds()),
('阵法·面积', '长方形正方形面积', '不再满足于边界，开始掌控图形的内在空间。', '计算长方形、正方形面积。', hdx_get_subject_id('数学'), 3, hdx_generate_thresholds()),
-- 年级 4
('亿兆星辰', '大数读写', '神念可达亿万之遥，读写宇宙间的宏大数字。', '学习大数的读写。', hdx_get_subject_id('数学'), 4, hdx_generate_thresholds()),
('乾坤四象斩', '四则混合运算', '加减乘除，四象齐出，依天规而动，破万千算术迷阵。', '掌握四则混合运算顺序。', hdx_get_subject_id('数学'), 4, hdx_generate_thresholds()),
('不动如山', '三角形稳定性', '三点定一面，稳如泰山，领悟最稳定的几何之力。', '了解三角形稳定性。', hdx_get_subject_id('数学'), 4, hdx_generate_thresholds()),
-- 年级 5
('芥子须弥', '小数乘除法', '在微小的小数世界里，进行精准无比的乘除运算。', '学习小数乘除法。', hdx_get_subject_id('数学'), 5, hdx_generate_thresholds()),
('天元之术', '简易方程', '设未知为“天元”，以等式为锁，求得世间万物的答案。', '解简易方程。', hdx_get_subject_id('数学'), 5, hdx_generate_thresholds()),
('三维界域', '长方体正方体体积', '突破平面，掌控三维空间的大小。', '计算长方体、正方体表面积与体积。', hdx_get_subject_id('数学'), 5, hdx_generate_thresholds()),
-- 年级 6
('阴阳互转', '分数乘除法', '分数世界中的聚散离合，比整数更为玄妙。', '掌握分数乘除法。', hdx_get_subject_id('数学'), 6, hdx_generate_thresholds()),
('万物皆比', '比和比例', '洞悉万物间的内在联系与恒定比例。', '理解比和比例。', hdx_get_subject_id('数学'), 6, hdx_generate_thresholds()),
('天圆地方', '圆柱与圆锥', '掌握最完美的图形及其变体，计算其空间奥秘。', '认识圆柱、圆锥，计算其表面积与体积。', hdx_get_subject_id('数学'), 6, hdx_generate_thresholds()),
('虚空之数', '负数认知', '跨越“无”的界限，探寻数轴另一端的镜像世界。', '理解负数意义。', hdx_get_subject_id('数学'), 6, hdx_generate_thresholds()),

-- =================================================================
-- 英语 (异域言灵术)
-- =================================================================
-- 年级 1
('异域梵音', '26字母掌握', '构建异域法术的26个基础符文。', '掌握26个字母大小写及发音。', hdx_get_subject_id('英语'), 1, hdx_generate_thresholds()),
('言灵·启蒙', '基础词汇', '掌握第一批言灵，用以呼唤异界的基础事物。', '积累文具、颜色、数字等基础词汇。', hdx_get_subject_id('英语'), 1, hdx_generate_thresholds()),
-- 年级 2
('自然之声', '自然拼读', '掌握符文组合的发音规律，见字能读，闻声能写。', '学习元音字母和辅音组合的发音规律。', hdx_get_subject_id('英语'), 2, hdx_generate_thresholds()),
('言灵·扩展', '扩展词汇', '言灵之力增强，可呼唤家庭成员、动物等更复杂的概念。', '扩展家庭成员、动物、交通工具等词汇。', hdx_get_subject_id('英语'), 2, hdx_generate_thresholds()),
-- 年级 3
('存在咒法', 'There be句型', '凭空召唤事物的存在，描述空间的布局。', '学习 there be 句型。', hdx_get_subject_id('英语'), 3, hdx_generate_thresholds()),
('言灵·领域', '领域词汇', '言灵可触及国家、职业、季节等更广阔的领域。', '掌握国家、职业、季节等词汇。', hdx_get_subject_id('英语'), 3, hdx_generate_thresholds()),
-- 年级 4
('昨日重现', '一般过去时', '言语可回溯时光，描述已然发生的过去。', '学习一般过去时。', hdx_get_subject_id('英语'), 4, hdx_generate_thresholds()),
('万物有别', '形容词比较级', '赋予你分辨事物高下、长短、强弱的言灵之力。', '学习形容词比较级。', hdx_get_subject_id('英语'), 4, hdx_generate_thresholds()),
('异界札记', '简单短文写作', '开始用异界符文记录自己的见闻与经历。', '写5-6句话的短文，描述周末活动。', hdx_get_subject_id('英语'), 4, hdx_generate_thresholds()),
-- 年级 5
('因果之链', '现在完成时', '连接过去与现在，描述已完成并对当下产生影响的动作。', '学习现在完成时。', hdx_get_subject_id('英语'), 5, hdx_generate_thresholds()),
('傀儡法咒', '被动语态', '操控句式，使动作的承受者成为主角。', '学习被动语态。', hdx_get_subject_id('英语'), 5, hdx_generate_thresholds()),
-- 年级 6
('虚实之间', '虚拟语气', '言语可构建不存在的假设，推演未来的无限可能。', '学习虚拟语气。', hdx_get_subject_id('英语'), 6, hdx_generate_thresholds()),
('言灵·哲思', '抽象词汇', '言灵之力达到巅峰，可探讨科技、环保、文化等抽象概念。', '扩展科技、环保、文化等抽象词汇。', hdx_get_subject_id('英语'), 6, hdx_generate_thresholds()),
('异界雄辩', '观点短文写作', '用异界符文清晰地表达自己的观点，并加以论证。', '写8-10句话的短文，表达观点。', hdx_get_subject_id('英语'), 6, hdx_generate_thresholds());

-- PART 2: Define the skill dependencies in the hdx_skill_dependencies table.
-- An unlock_level of 3 means the prerequisite skill must reach "驾轻就熟" (Level 3) to unlock the next one.

INSERT INTO hdx_skill_dependencies (skill_id, prerequisite_skill_id, unlock_level)
SELECT 
    (SELECT skill_id FROM hdx_skills WHERE skill_name_real = dependent.skill_name_real) AS skill_id,
    (SELECT skill_id FROM hdx_skills WHERE skill_name_real = prerequisite.skill_name_real) AS prerequisite_skill_id,
    3 AS unlock_level
FROM (VALUES
    -- 语文依赖
    ('识字300', '拼音掌握'),
    ('写字100', '识字300'),
    ('简单陈述句', '写字100'),
    ('多音字掌握', '写字100'),
    ('关联词造句', '简单陈述句'),
    ('短文信息提取', '关联词造句'),
    ('百字短文', '短文信息提取'),
    ('成语与近反义词', '多音字掌握'),
    ('扩句与缩句', '关联词造句'),
    ('文章结构分析', '短文信息提取'),
    ('记叙文基础', '百字短文'),
    ('多义词理解', '成语与近反义词'),
    ('修辞手法·初级', '扩句与缩句'),
    ('批注式阅读', '文章结构分析'),
    ('记叙文进阶', '记叙文基础'),
    ('形近字辨析', '多义词理解'),
    ('修辞手法·中级', '修辞手法·初级'),
    ('名著节选分析', '批注式阅读'),
    ('说明文入门', '记叙文进阶'),
    ('谚语与典故', '形近字辨析'),
    ('修辞手法·高级', '修辞手法·中级'),
    ('议论文分析', '名著节选分析'),
    ('议论文写作', '说明文入门'),

    -- 数学依赖
    ('20以内加减法', '100内数认识'),
    ('基础图形识别', '100内数认识'),
    ('乘法口诀', '20以内加减法'),
    ('单位认知', '100内数认识'),
    ('多位数乘一位数', '乘法口诀'),
    ('分数初步认识', '多位数乘一位数'),
    ('长方形正方形面积', '多位数乘一位数'),
    ('大数读写', '多位数乘一位数'),
    ('四则混合运算', '多位数乘一位数'),
    ('三角形稳定性', '基础图形识别'),
    ('小数乘除法', '四则混合运算'),
    ('简易方程', '四则混合运算'),
    ('长方体正方体体积', '长方形正方形面积'),
    ('分数乘除法', '分数初步认识'),
    ('比和比例', '小数乘除法'),
    ('圆柱与圆锥', '长方体正方体体积'),
    ('负数认知', '简易方程'),
    
    -- 英语依赖
    ('基础词汇', '26字母掌握'),
    ('自然拼读', '26字母掌握'),
    ('扩展词汇', '基础词汇'),
    ('There be句型', '扩展词汇'),
    ('领域词汇', '扩展词汇'),
    ('一般过去时', 'There be句型'),
    ('形容词比较级', '领域词汇'),
    ('简单短文写作', '一般过去时'),
    ('现在完成时', '一般过去时'),
    ('被动语态', '现在完成时'),
    ('虚拟语气', '被动语态'),
    ('抽象词汇', '领域词汇'),
    ('观点短文写作', '简单短文写作')
) AS dependencies(dependent_skill_name_real, prerequisite_skill_name_real)
CROSS JOIN LATERAL (
    SELECT dependent_skill_name_real AS skill_name_real
) AS dependent
CROSS JOIN LATERAL (
    SELECT prerequisite_skill_name_real AS skill_name_real
) AS prerequisite;

```
