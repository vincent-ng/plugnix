### **项目设计文档：模块化插件式前端架构**

#### **1. 概述**

本文档描述了一个支持国际化（i18n）、基于插件扩展的现代化Web应用前端架构。该架构旨在实现清晰的关注点分离，提高代码的可维护性、可扩展性和可重用性。

系统的核心思想是**依赖反转**：基础框架定义扩展点和接口，但不依赖任何具体插件；相反，各个功能插件依赖于框架提供的API进行自身功能（如路由、菜单、页面等）的注册，从而集成到主应用中。

所有插件的集成通过一个**手动维护的入口文件**完成，该文件明确列出所有启用的插件，无需额外的构建脚本或代码生成。

#### **2. 核心技术栈**

  * **构建工具**: Vite
  * **UI框架**: React (使用 JavaScript 和 JSX)
  * **UI组件库**: shadcn
  * **国际化**: i18next 或类似的库
  * **后端服务**: Supabase

#### **3. 核心架构原则**

  * **模块化与自包含 (Modularity & Self-Containment)**

      * 每个插件都是一个独立的单元，包含其自身的业务逻辑、UI组件、样式、国际化资源和静态资产。
      * 所有与插件相关的文件都聚合在其专属的目录内，降低模块间的耦合度。

  * **依赖反转 (Dependency Inversion)**

      * **框架代码严禁直接 `import` 任何插件的代码。**
      * 框架提供一个全局的“注册中心”（Registry）对象或一组注册函数。
      * 插件代码 `import` 框架提供的注册工具，并调用它们来声明自己的存在和功能。

  * **代码即配置 (Code as Configuration)**

      * 插件的定义和注册完全通过代码（函数调用）完成。
      * **不使用**任何额外的 `plugin.json` 等声明性配置文件。

  * **自动发现 (Auto Discovery)**

      * 通过动态扫描插件目录，自动发现和加载所有插件，无需手动维护插件列表。
      * 利用 Vite 的 `import.meta.glob` 功能在构建时优化动态导入，保持良好的性能。
      * 插件只需遵循约定（在插件目录下提供 `index.js` 入口文件），即可被自动发现和集成。

#### **4. 目录结构**

当前项目采用以下目录结构来组织代码：

```
.
├── src/
│   ├── framework/                  # 框架核心代码
│   │   ├── api/                    # 框架提供的API
│   │   ├── contexts/               # 全局上下文
│   │   ├── i18n/                   # 框架的国际化配置
│   │   └── layouts/                # 页面布局组件
│   │
│   ├── plugins/                    # 所有功能插件
│   │   ├── auth/                   # 认证插件
│   │   ├── blog/                   # 博客插件
│   │   ├── user/                   # 用户管理插件
│   │   ├── about/                  # 关于页面插件
│   │   ├── landing/                # 首页插件
│   │   └── index.js                # !! 插件的自动扫描入口 !!
│   │
│   ├── lib/                        # 工具库
│   │
│   ├── App.jsx                     # 应用根组件
│   ├── main.jsx                    # 应用主入口
│   └── index.css                   # 全局样式
│
├── vite.config.js                  # Vite 配置文件
└── package.json
```

#### **5. 框架核心 (`src/framework`)**

框架的职责是搭建应用的骨架，并为插件提供稳定的扩展能力。

  * **注册中心 (Registry) - `src/framework/api/`**

      * **`registry.js`**: 实现了一个Registry类，管理所有插件的注册信息，包括路由、菜单项、组件和国际化资源。
      * **`index.js`**: 提供插件API接口，包括以下注册函数：
        - `registerRoute(routeObject)` - 注册路由
        - `registerAdminMenuItem(menuItemObject)` - 注册管理员菜单项
        - `registerPublicMenuItem(menuItemObject)` - 注册公共菜单项
        - `registerI18nNamespace(pluginName, translations)` - 注册国际化命名空间
        - `registerComponent(name, component)` - 注册可复用组件

  * **布局系统 (Layouts) - `src/framework/layouts/`**

      * **`AdminLayout.jsx`**: 后台管理页面布局
      * **`PublicLayout.jsx`**: 公共页面布局

  * **上下文管理 (Contexts) - `src/framework/contexts/`**

      * **`AuthContext.jsx`**: 认证状态管理
      * **`ThemeContext.jsx`**: 主题状态管理

  * **国际化 (i18n) - `src/framework/i18n/`**

      * **`index.js`**: i18n配置和插件翻译资源的集成逻辑

#### **6. 框架API详解**

框架通过 `registryApi` 对象向插件暴露一组注册函数，插件可以利用这些函数将其功能集成到主应用中。所有API均通过 `src/framework/api/index.js` 提供。

*   **`registerRoute(routeObject)`**
    *   **功能**: 注册一个新路由。
    *   **参数**: `routeObject` (对象) - 包含路由信息的对象，例如 `{ path: '/my-plugin', component: MyPluginPage }`。
    *   **示例**: `registerRoute({ path: '/about', component: AboutPage });`

*   **`registerAdminMenuItem(menuItemObject)`**
    *   **功能**: 在后台管理界面的菜单中注册一个新菜单项。
    *   **参数**: `menuItemObject` (对象) - 包含菜单项信息的对象，例如 `{ label: 'My Plugin', path: '/my-plugin', order: 100 }`。`order` 属性用于排序。
    *   **示例**: `registerAdminMenuItem({ label: 'User Management', path: '/admin/users', order: 20 });`

*   **`registerPublicMenuItem(menuItemObject)`**
    *   **功能**: 在公共页面的导航菜单中注册一个新菜单项。
    *   **参数**: `menuItemObject` (对象) - 结构与 `registerAdminMenuItem` 相同。
    *   **示例**: `registerPublicMenuItem({ label: 'About Us', path: '/about', order: 50 });`

*   **`registerUserMenuItem(menuItemObject)`**
    *   **功能**: 在用户下拉菜单中注册一个新菜单项。支持两种注册方式：
        1. **传统方式**: 提供 `label`、`path`、`icon` 等属性
        2. **组件方式**: 直接提供 `component` 属性，框架将渲染该组件
    *   **参数**: `menuItemObject` (对象) - 菜单项配置对象
        *   传统方式: `{ key, label, path, icon, className, onClick, order }`
        *   组件方式: `{ key, component, order }`
    *   **示例**: 
        *   传统方式: `registerUserMenuItem({ key: 'profile', label: 'Profile', path: '/profile', order: 10 });`
        *   组件方式: `registerUserMenuItem({ key: 'signOut', component: SignOutMenuItem, order: 999 });`

*   **`registerI18nNamespace(pluginName, translations)`**
    *   **功能**: 为插件注册国际化（i18n）翻译资源。
    *   **参数**:
        *   `pluginName` (字符串) - 插件的唯一名称，用作命名空间。
        *   `translations` (对象) - 包含不同语言翻译的对象，例如 `{ en: { title: 'Hello' }, zh: { title: '你好' } }`。
    *   **示例**: `registerI18nNamespace('myPlugin', { en, zh });`

*   **`registerComponent(name, component)`**
    *   **功能**: 注册一个可供其他插件或框架本身复用的共享组件。
    *   **参数**:
        *   `name` (字符串) - 组件的唯一名称。
        *   `component` (React组件) - 要注册的React组件。
    *   **示例**: `registerComponent('SharedButton', MySharedButton);`

#### **7. 插件契约 (`src/plugins/*`)**

每个插件都必须遵循一套统一的规范。

  * **入口文件 (`index.js`)**

      * 每个插件目录必须包含一个 `index.js` 文件。
      * 该文件必须导出一个默认函数作为插件注册函数。此函数接收框架的注册API作为参数。
      * **函数签名**: `export default function registerPluginName({ registerRoute, registerAdminMenuItem, registerPublicMenuItem, registerI18nNamespace, registerComponent }) { /* ... */ }`

  * **插件内部结构**

      * 插件的内部目录结构是**完全灵活**的。开发者可以根据插件的复杂度和个人偏好自由组织代码，例如将组件、页面、样式、国际化文件等放在不同的子目录中，或者将所有文件直接放在插件根目录下。
      * 唯一的要求是 `index.js` 文件必须能够正确导出注册函数，并处理其内部依赖。

#### **8. 插件开发与集成**

本节为新开发者提供详细的插件开发步骤和集成流程。

##### **7.1 开发新插件**

1.  **创建插件目录**

    在 `src/plugins/` 目录下为你的新插件创建一个目录。

    ```bash
    mkdir src/plugins/your-plugin-name
    ```

2.  **创建插件入口文件 (`index.js`)**

    在插件目录中创建 `index.js` 文件。这是插件的唯一必需文件。它必须导出一个默认的注册函数。

    ```javascript
    // src/plugins/your-plugin-name/index.js

    // 导入该插件所需的任何组件、页面或资源
    import YourMainPage from './YourMainPage'; // 这是一个示例

    // 插件注册函数
    export default function registerYourPlugin({ registerRoute, registerPublicMenuItem }) {
      // 在这里调用框架API来注册功能
      registerRoute({
        path: '/your-path',
        component: YourMainPage
      });

      registerPublicMenuItem({
        label: 'Your Plugin',
        path: '/your-path'
      });

      console.log('Your plugin registered.');
    }
    ```

3.  **组织插件内部代码**

    插件的内部结构是完全灵活的。你可以根据需要创建子目录来组织组件、页面、样式或国际化文件，或者将所有内容都放在插件的根目录中。

    **简单插件示例:**
    ```
    src/plugins/your-plugin-name/
    ├── YourMainPage.jsx
    └── index.js
    ```

    **复杂插件示例:**
    ```
    src/plugins/your-plugin-name/
    ├── components/
    │   └── YourComponent.jsx
    ├── pages/
    │   ├── YourMainPage.jsx
    │   └── YourDetailPage.jsx
    ├── i18n/
    │   ├── en.json
    │   └── zh.json
    └── index.js
    ```

##### **7.2 集成插件到主应用**

插件集成现在完全自动化，无需手动配置。

1.  **自动发现机制**

    框架会自动扫描 `src/plugins/` 目录下的所有子目录，寻找包含 `index.js` 文件的插件。只要插件目录结构正确，就会被自动发现和加载。

    ```javascript
    // src/plugins/index.js - 自动扫描版本
    
    // 动态导入所有插件的函数
    const importAllPlugins = async () => {
      const pluginModules = import.meta.glob('./*/index.js');
      const plugins = [];
      
      for (const path in pluginModules) {
        try {
          const module = await pluginModules[path]();
          if (module.default && typeof module.default === 'function') {
            plugins.push(module.default);
          }
        } catch (error) {
          console.warn(`Failed to load plugin from ${path}:`, error);
        }
      }
      
      return plugins;
    };
    
    export default importAllPlugins;
    ```

2.  **异步插件加载**

    应用的主入口文件 `src/main.jsx` 会异步加载所有插件，并执行它们的注册函数。

    ```jsx
    // src/main.jsx (部分代码)
    import importAllPlugins from './plugins'; // 导入异步插件加载器
    
    // 异步初始化应用
    const initializeApp = async () => {
      try {
        // 动态加载所有插件
        const allPlugins = await importAllPlugins();
        
        // 执行所有插件的注册逻辑
        allPlugins.forEach(registerFunc => {
          registerFunc(registryApi);
        });
        
        // 渲染应用...
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    
    initializeApp();
    ```

3.  **插件开发流程简化**

    现在开发新插件只需要：
    - 在 `src/plugins/` 下创建插件目录
    - 创建 `index.js` 入口文件并导出注册函数
    - 插件会被自动发现和加载，无需任何额外配置

##### **7.3 最佳实践**

*   **保持自包含**: 插件应避免直接依赖其他插件。
*   **命名规范**: 插件目录使用小写和连字符，组件使用 `PascalCase`。
*   **国际化**: 所有面向用户的文本都应通过 `registerI18nNamespace` API 进行国际化。

##### **7.4 插件示例参考**

可以参考 `src/plugins/` 目录下的现有插件来了解不同的实现方式：
- **简单插件**: `about/`
- **复杂插件**: `auth/`, `blog/`
