# 框架API详解

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

*   **`registerPermission(permissionObject)`**
    *   **功能**: 为插件注册权限定义，用于声明插件所需的权限。
    *   **参数**: `permissionObject` (对象) - 包含权限信息的对象
        *   `name` (字符串，必需) - 权限名称，用于权限检查
        *   `description` (字符串，可选) - 权限描述
        *   其他字段会被保留在权限对象中
    *   **示例**: `registerPermission({ name: 'ui.blog.create', description: '创建博客文章' });`