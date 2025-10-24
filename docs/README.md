# Plugnix - 现代化插件式Web应用框架

Plugnix 是一个支持国际化（i18n）、基于插件扩展的现代化Web应用前端框架。它采用依赖反转架构，实现清晰的关注点分离，提高代码的可维护性、可扩展性和可重用性。

## 目录

- [使用者指南](#使用者指南)
  - [快速开始](#快速开始)
  - [安装和设置](#安装和设置)
  - [使用plugnix-cli](#使用plugnix-cli)
  - [详细指令](#详细指令)
- [贡献者指南](#贡献者指南)
  - [架构原则](#架构原则)
  - [框架核心](#框架核心)
  - [插件开发](#插件开发)
  - [详细设计文档](#详细设计文档)
  - [贡献指南](#贡献指南)

---

## 使用者指南

### 快速开始

Plugnix 让您能够快速构建功能丰富的Web应用。通过插件系统，您可以轻松添加认证、博客、管理面板等功能。

### 安装和设置

1. **创建新项目**
   ```bash
   npx plugnix-cli init my-app
   cd my-app
   ```

2. **添加所需插件**
   ```bash
   npx plugnix-cli add landing auth dashboard
   ```

3. **启动开发服务器**
   ```bash
   npm i
   npm run dev
   ```

### 使用plugnix-cli

Plugnix CLI 是一个强大的命令行工具，帮助您快速创建和管理Plugnix项目。

#### 基本命令

- **初始化项目**
  ```bash
  npx plugnix-cli init <项目名称>
  ```
  这将创建一个新的Plugnix项目，包含基本的框架结构和配置文件。

- **添加插件**
  ```bash
  npx plugnix-cli add <插件名称> [其他插件...]
  ```
  向项目添加一个或多个插件。常用插件包括：
  - `landing` - 首页插件
  - `auth` - 认证插件
  - `dashboard` - 仪表盘插件
  - `blog` - 博客插件
  - `tenant` - 组织管理插件

- **列出可用插件**
  ```bash
  npx plugnix-cli list-plugins
  ```
  显示所有可用的插件及其描述。

- **移除插件**
  cli工具没有提供remove插件的命令，
  要临时禁用插件，可以编辑`plugins-disabled.json`文件，将插件目录名添加到该文件的数组中。
  要永久移除插件，只需手动删除插件目录即可。

#### 详细指令

更详细的指令说明请参考[plugnix-cli项目](https://github.com/vincent-ng/plugnix-cli)。

---

## 贡献者指南

### 架构原则

#### 模块化与自包含 (Modularity & Self-Containment)
- 每个插件都是一个独立的单元，包含其自身的业务逻辑、UI组件、样式、国际化资源和静态资产。
- 所有与插件相关的文件都聚合在其专属的目录内，降低模块间的耦合度。

#### 依赖反转 (Dependency Inversion)
- **框架代码严禁直接 `import` 任何插件的代码。**
- 框架提供一个全局的"注册中心"（Registry）对象或一组注册函数。
- 插件代码 `import` 框架提供的注册工具，并调用它们来声明自己的存在和功能。

#### 代码即配置 (Code as Configuration)
- 插件的定义和注册完全通过代码（函数调用）完成。
- **不使用**任何额外的 `plugin.json` 等声明性配置文件。

#### 自动发现 (Auto Discovery)
- 通过动态扫描插件目录，自动发现和加载所有插件，无需手动维护插件列表。
- `src/plugins-loader.js` 是实现自动发现的关键。该文件利用 Vite 的 `import.meta.glob` 功能，在构建时扫描所有 `src/plugins/*/index.{js,jsx}` 文件。
- 可以通过 `plugins-disabled.json` 配置文件来禁用特定插件。

### 框架核心

框架的职责是搭建应用的骨架，并为插件提供稳定的扩展能力。

#### 目录结构

```
.
├── src/
│   ├── framework/                  # 框架核心代码
│   │   ├── api/                    # 框架提供的API
│   │   ├── components/             # UI组件 (ui目录下是shadcn的组件)
│   │   ├── contexts/               # 全局上下文
│   │   ├── i18n/                   # 框架的国际化配置
│   │   ├── layouts/                # 页面布局组件
│   │   ├── lib/                    # 框架工具库
│   │   └── core-providers.js       # 核心或默认Provider
│   │
│   ├── plugins/                    # 所有功能插件
│   │   ├── auth/                   # 认证插件
│   │   ├── blog/                   # 博客插件
│   │   ├── tenant/                 # 集团管理插件
│   │   ├── about/                  # 关于页面插件
│   │   └── landing/                # 首页插件
│   │
│   ├── App.jsx                     # 应用根组件
│   ├── main.jsx                    # 应用主入口
│   ├── index.css                   # 全局样式
│   ├── plugins-disabled.json       # 插件禁用配置文件
│   └── plugins-loader.js           # 插件自动加载器
│
├── docs/                           # 文档目录
│   ├── design/                     # 详细设计文档
│   └── README.md                   # 本文档
│
├── vite.config.js                  # Vite 配置文件
└── package.json
```

#### 核心组件

- **注册中心 (Registry) - `src/framework/api/`**
  - **`registry.js`**: 实现了一个Registry类，管理所有插件的注册信息，包括路由、菜单项、组件和国际化资源。
  - **`index.js`**: 提供插件API接口，包括各种注册函数。

- **布局系统 (Layouts) - `src/framework/layouts/`**
  - **`AdminLayout.jsx`**: 后台管理页面布局
  - **`PublicLayout.jsx`**: 公共页面布局

- **上下文管理 (Contexts) - `src/framework/contexts/`**
  - **`AuthenticationContext.jsx`**: 认证状态管理
  - **`ThemeContext.jsx`**: 主题状态管理

- **国际化 (i18n) - `src/framework/i18n/`**
  - **`index.js`**: i18n配置和插件翻译资源的集成逻辑

### 插件开发

#### 创建新插件

1. 在 `src/plugins` 目录下创建新的插件文件夹
2. 创建插件的入口文件 `index.js`
3. 实现插件的功能组件
4. 在入口文件中注册插件的路由、菜单和权限

#### 插件结构示例

```
src/plugins/my-plugin/
├── index.js                 # 插件入口文件
├── components/              # 插件组件
├── pages/                   # 插件页面
├── i18n/                    # 国际化资源
└── docs/                    # 插件文档
```

#### 插件注册示例

```javascript
// src/plugins/my-plugin/index.js
import MyPluginPage from './pages/MyPluginPage';

export default function registerMyPlugin({ registerRoute, registerAdminMenuItem, registerPermission }) {
  // 注册Admin菜单项
  registerMenuItem({
    label: '我的插件',
    path: '/admin/my-plugin',
    component: MyPluginPage,
    position: 'admin'
  });

  // 注册权限
  registerPermission({ name: 'ui.my-plugin.view' });
  registerPermission({ name: 'ui.my-plugin.edit' });
}
```

### 详细设计文档

以下是各个专题的详细设计文档，帮助您深入了解框架的特定方面。

#### 入门与核心概念
- [**插件开发指南**](design/guide-plugin-development.md) - **（新开发者必读）** 学习如何创建、开发和集成您的第一个插件。
- [**统一权限模型**](design/feature-permission-model.md) - 深入理解框架基于"用户组"和"系统组"的统一权限设计。
- [**权限视图**](design/feature-permission-view.md) - 了解如何在前端代码里使用权限相关的组件和API。
- [**框架API参考**](design/api-reference.md) - 框架提供的所有注册函数的详细技术文档。

#### 后端与数据库
- [**数据库初始化脚本**](design/database-initialization.sql) - 包含所有核心表、函数和种子数据的统一SQL脚本。
- [**数据库设计约定**](design/database-conventions.md) - 数据库表结构、字段命名规范及权限加载机制。

#### 功能与插件设计
- [**权限管理插件**](design/plugin-permission-management.md) - "权限管理"插件的设计与实现。
- [**数据库安全插件**](design/plugin-admin-db-security.md) - "数据库安全"插件，用于管理RLS策略和安全函数。
- [**多标签页功能**](design/feature-multi-tab.md) - 后台管理界面的多Tab导航功能设计。
- [**通知中心**](design/feature-notification-center.md) - 系统通知功能的设计与实现。

#### UI/UX
- [**颜色系统指南**](design/guide-color-system.md) - 框架颜色变量使用规范，确保主题一致性。

### 贡献指南

在开发新功能或修改现有功能时，请：

1. 阅读相关的设计文档
2. 遵循框架的架构原则
3. 确保代码符合插件契约
4. 添加适当的权限控制
5. 提供完整的国际化支持
6. 编写测试用例
7. 更新相关文档

---

## 技术栈

- **构建工具**: Vite
- **UI框架**: React (使用 JavaScript 和 JSX)
- **UI组件库**: shadcn
- **国际化**: i18next 或类似的库
- **后端服务**: Supabase

---

*本文档会随着框架的发展持续更新。如有疑问或建议，请参考具体的设计文档或提出issue。*