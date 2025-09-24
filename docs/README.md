# Web插件框架设计文档

## 概述

本文档是Web插件框架的总体设计文档，描述了一个支持国际化（i18n）、基于插件扩展的现代化Web应用前端架构。该架构旨在实现清晰的关注点分离，提高代码的可维护性、可扩展性和可重用性。

系统的核心思想是**依赖反转**：基础框架定义扩展点和接口，但不依赖任何具体插件；相反，各个功能插件依赖于框架提供的API进行自身功能（如路由、菜单、页面等）的注册，从而集成到主应用中。

## 核心技术栈

- **构建工具**: Vite
- **UI框架**: React (使用 JavaScript 和 JSX)
- **UI组件库**: shadcn
- **国际化**: i18next 或类似的库
- **后端服务**: Supabase

## 架构原则

### 模块化与自包含 (Modularity & Self-Containment)
- 每个插件都是一个独立的单元，包含其自身的业务逻辑、UI组件、样式、国际化资源和静态资产。
- 所有与插件相关的文件都聚合在其专属的目录内，降低模块间的耦合度。

### 依赖反转 (Dependency Inversion)
- **框架代码严禁直接 `import` 任何插件的代码。**
- 框架提供一个全局的“注册中心”（Registry）对象或一组注册函数。
- 插件代码 `import` 框架提供的注册工具，并调用它们来声明自己的存在和功能。

### 代码即配置 (Code as Configuration)
- 插件的定义和注册完全通过代码（函数调用）完成。
- **不使用**任何额外的 `plugin.json` 等声明性配置文件。

### 自动发现 (Auto Discovery)
- 通过动态扫描插件目录，自动发现和加载所有插件，无需手动维护插件列表。
- `src/plugins/index.js` 是实现自动发现的关键。该文件利用 Vite 的 `import.meta.glob` 功能，在构建时扫描所有 `src/plugins/*/index.{js,jsx}` 文件。
- `import.meta.glob` 会创建一个模块映射，然后在应用启动时，框架可以遍历这个映射，动态地 `import` 每个插件的入口文件并执行其中的注册函数。这个过程是自动化的，开发者只需将插件放入 `plugins` 目录即可。

## 目录结构

```
.
├── src/
│   ├── framework/                  # 框架核心代码
│   │   ├── api/                    # 框架提供的API
│   │   ├── components/             # UI组件 (shadcn)
│   │   ├── contexts/               # 全局上下文
│   │   ├── i18n/                   # 框架的国际化配置
│   │   ├── layouts/                # 页面布局组件
│   │   └── lib/                    # 框架工具库
│   │
│   ├── plugins/                    # 所有功能插件
│   │   ├── auth/                   # 认证插件
│   │   ├── blog/                   # 博客插件
│   │   ├── user/                   # 用户管理插件
│   │   ├── about/                  # 关于页面插件
│   │   ├── landing/                # 首页插件
│   │   └── index.js                # 插件的自动扫描入口
│   │
│   ├── App.jsx                     # 应用根组件
│   ├── main.jsx                    # 应用主入口
│   └── index.css                   # 全局样式
│
├── docs/                           # 文档目录
│   ├── design/                     # 详细设计文档
│   └── README.md                   # 本文档
│
├── vite.config.js                  # Vite 配置文件
└── package.json
```

## 框架核心 (`src/framework`)

框架的职责是搭建应用的骨架，并为插件提供稳定的扩展能力。

  * **注册中心 (Registry) - `src/framework/api/`**

      * **`registry.js`**: 实现了一个Registry类，管理所有插件的注册信息，包括路由、菜单项、组件和国际化资源。
      * **`index.js`**: 提供插件API接口，包括各种注册函数。

  * **布局系统 (Layouts) - `src/framework/layouts/`**

      * **`AdminLayout.jsx`**: 后台管理页面布局
      * **`PublicLayout.jsx`**: 公共页面布局

  * **上下文管理 (Contexts) - `src/framework/contexts/`**

      * **`AuthenticationContext.jsx`**: 认证状态管理
      * **`ThemeContext.jsx`**: 主题状态管理

  * **国际化 (i18n) - `src/framework/i18n/`**

      * **`index.js`**: i18n配置和插件翻译资源的集成逻辑

## 首次部署：创建第一个管理员

本框架的权限系统依赖一个特殊的“系统组”和“Admin”角色来识别管理员。要让第一个用户成为系统管理员，需要一个一次性的手动引导（Bootstrapping）过程。

**前提：**

1.  您已经将项目连接到 Supabase 后端。
2.  您已经在 Supabase 的 SQL Editor 中执行了 `docs/design/database-initialization.sql` 脚本。

**操作步骤：**

1.  **获取您的用户ID (User ID)**
    *   通过您的应用注册并登录，以在 Supabase 中创建用户记录。
    *   访问 Supabase 后台的 **Authentication** > **Users** 页面。
    *   找到您的用户记录，并复制其 `ID`（一个UUID格式的字符串）。

2. **创建第一个管理员**

   框架初始化后，你需要一个管理员账户来管理系统。请按照以下步骤操作：

   - **注册一个用户**：通过你的应用前端正常注册一个新用户。
   - **提升为管理员**：在 Supabase SQL 编辑器中执行以下命令，将你刚刚注册的用户提升为管理员。你也可以不指定用户ID，函数会自动将系统中的第一个用户提升为管理员。

     ```sql
     -- 将 'YOUR_USER_ID' 替换为你的用户ID，或直接运行以自动选择第一个用户
     SELECT promote_user_to_admin('YOUR_USER_ID');
     ```

     或者，如果你想让函数自动选择第一个注册的用户：

     ```sql
     -- 函数会自动找到第一个用户并将其提升为管理员
     SELECT promote_user_to_admin();
     ```

### 详细设计文档索引

以下是各个专题的详细设计文档，帮助您深入了解框架的特定方面。

### 入门与核心概念
- [**插件开发指南**](design/guide-plugin-development.md) - **（新开发者必读）** 学习如何创建、开发和集成您的第一个插件。
- [**统一权限模型**](design/feature-permission-model.md) - 深入理解框架基于“用户组”和“系统组”的统一权限设计。
- [**权限视图**](design/feature-permission-view.md) - 了解如何在前端代码里使用权限相关的组件和API。
- [**框架API参考**](design/api-reference.md) - 框架提供的所有注册函数的详细技术文档。

### 后端与数据库
- [**数据库初始化脚本**](design/database-initialization.sql) - 包含所有核心表、函数和种子数据的统一SQL脚本。
- [**数据库设计约定**](design/database-conventions.md) - 数据库表结构、字段命名规范及权限加载机制。

### 功能与插件设计
- [**权限管理插件**](design/plugin-permission-management.md) - “权限管理”插件的设计与实现。
- [**数据库安全插件**](design/plugin-admin-db-security.md) - “数据库安全”插件，用于管理RLS策略和安全函数。
- [**多标签页功能**](design/feature-multi-tab.md) - 后台管理界面的多Tab导航功能设计。

### UI/UX
- [**颜色系统指南**](design/guide-color-system.md) - 框架颜色变量使用规范，确保主题一致性。

## 贡献指南

在开发新功能或修改现有功能时，请：

1. 阅读相关的设计文档
2. 遵循框架的架构原则
3. 确保代码符合插件契约
4. 添加适当的权限控制
5. 提供完整的国际化支持

---

*本文档会随着框架的发展持续更新。如有疑问或建议，请参考具体的设计文档或提出issue。*