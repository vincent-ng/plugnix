# 框架API详解

框架通过 `registryApi` 对象向插件暴露一组注册函数，插件可以利用这些函数将其功能集成到主应用中。所有API均通过 `src/framework/api/index.js` 提供。

*   **`registerRoute(routeObject)`**
    *   **功能**: 注册一个新路由。
    *   **参数**: `routeObject` (对象) - 包含路由信息的对象，例如 `{ path: '/my-plugin', component: MyPluginPage }`。
    *   **示例**: `registerRoute({ path: '/about', component: AboutPage });`

*   **`registerMenuItem(menuItemObject, position)`**
    *   **功能**: 在指定位置注册一个新菜单项。如果 `menuItemObject` 同时包含 `path` 和 `component` 属性，该函数还会自动注册一个对应的路由。
    *   **参数**:
        *   `menuItemObject` (对象) - 包含菜单项信息的对象。
            *   `key` (字符串) - 菜单项的唯一标识。
            *   `label` (字符串) - 菜单项显示文本，支持i18n键值。
            *   `path` (字符串, 可选) - 菜单项链接路径。
            *   `component` (React组件, 可选) - 如果提供，将自动注册为路由，并可用于渲染自定义菜单项。
            *   `icon` (字符串|React组件，可选) - 菜单项图标。
            *   `order` (数字，可选) - 菜单项排序权重，数字越小越靠前。
            *   `className` (字符串，可选) - 自定义CSS类名 (主要用于 `user` 菜单)。
            *   `onClick` (函数，可选) - 点击事件处理函数 (主要用于 `user` 菜单)。
        *   `position` (字符串) - 菜单项的注册位置。必须是以下值之一：
            *   `'admin'`: 后台管理界面的主菜单。
            *   `'public'`: 公共页面的导航菜单。
            *   `'user'`: 用户下拉菜单。
    *   **示例**:
        *   注册管理菜单项: `registerMenuItem({ key: 'users', label: 'User Management', path: '/admin/users', component: UserPage, icon: UserIcon, order: 20 }, 'admin');`
        *   注册公共菜单项: `registerMenuItem({ key: 'about', label: 'About Us', path: '/about', component: AboutPage, order: 50 }, 'public');`
        *   注册用户菜单项: `registerMenuItem({ key: 'profile', label: 'Profile', path: '/profile', component: ProfilePage, order: 10 }, 'user');`
        *   注册自定义组件用户菜单项: `registerMenuItem({ key: 'signOut', component: SignOutMenuItem, order: 999 }, 'user');`

*   **`registerI18nNamespace(pluginName, translations)`**
    *   **功能**: 为插件注册国际化（i18n）翻译资源。
    *   **参数**:
        *   `pluginName` (字符串) - 插件的唯一名称，用作命名空间。
        *   `translations` (对象) - 包含不同语言翻译的对象，例如 `{ en: { title: 'Hello' }, zh: { title: '你好' } }`。
    *   **示例**: `registerI18nNamespace('myPlugin', { en, zh });`

*   **`registerPermission(permissionObject)`**
    *   **功能**: 为插件注册权限定义，用于声明插件所需的权限。
    *   **参数**: `permissionObject` (对象) - 包含权限信息的对象
        *   `name` (字符串，必需) - 权限名称，用于权限检查。
        *   `description` (字符串，可选) - 权限描述。
    *   **示例**: `registerPermission({ name: 'ui.blog.create', description: '创建博客文章' });`