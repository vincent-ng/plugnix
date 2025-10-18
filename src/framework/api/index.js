// 框架API层 - 为插件提供统一的注册接口
import registry from './registry.js';

/**
 * 创建插件API实例
 * 提供版本检查、权限验证等功能的扩展点
 */
export const createPluginAPI = () => {
  return {
    /**
     * @typedef {Object} RouteConfig
     * @description 路由配置对象。
     * @property {string} path - 路由路径。
     * @property {React.Component} component - 路由对应的React组件。
     * @property {string|Array<string>} [permissions] - 访问该路由所需的权限。
     */
    /**
     * 注册一个路由。
     * @param {RouteConfig} routeObject - 路由配置对象。
     * @example
     * // 注册一个独立的路由
     * registerRoute({
     *   path: '/admin/users/:id/edit',
     *   component: UserEditPage,
     *   permissions: ['user.edit']
     * });
     */
    registerRoute: (routeObject) => {
      return registry.registerRoute(routeObject);
    },

    /**
     * @typedef {Object} MenuItemConfig
     * @description 菜单项配置对象。
     * @property {string} key - 菜单项的唯一标识。
     * @property {string} label - 菜单项显示文本，支持i18n键值。
     * @property {string} [path] - 点击菜单项后导航到的路径。
     * @property {string|React.Component} [icon] - 菜单项图标。
     * @property {Array<MenuItemConfig>} [children] - 子菜单项数组，用于创建可折叠的菜单组。
     * @property {number} [order] - 菜单项排序权重，数字越小越靠前。
     * @property {string|Array<string>} [permissions] - 查看该菜单项所需的权限。
     * @property {string} [className] - 自定义 CSS 类名。
     * @property {Function} [onClick] - 点击事件处理函数。
     * @property {React.Component} [component] - 路由页面组件（与 `path` 一起使用时自动注册路由）。
     * @property {React.Component} [menuItemComponent] - 菜单项自定义渲染组件（适用于 `user` 菜单）。
     * @property {'front'|'end'|'both'} [separator] - 在菜单项前后添加分隔线。
     */
    /**
     * 注册一个菜单项到指定位置（后台、公共或用户）。
     * 如果同时提供了 `path` 和 `component`，将自动注册一个关联的路由。
     * @param {MenuItemConfig} menuItemObject - 菜单项配置对象。
     * @param {'admin' | 'public' | 'user'} position - 菜单项要注册的位置。
     * @example
     * // 注册一个带路由的后台管理菜单项
     * registerMenuItem({
     *   key: 'dashboard',
     *   label: 'Dashboard',
     *   path: '/admin/dashboard',
     *   component: DashboardPage,
     *   icon: '📊',
     *   order: 1
     * }, 'admin');
     *
     * // 注册一个公共菜单项
     * registerMenuItem({
     *   key: 'about',
     *   label: 'About Us',
     *   path: '/about',
     *   component: AboutPage,
     * }, 'public');
     *
     * // 注册一个用户下拉菜单项
     * registerMenuItem({
     *   key: 'logout',
     *   label: 'Logout',
     *   onClick: () => { console.log('logout'); }
     * }, 'user');
     * 
     * // 注册一个带分组的菜单
     * registerMenuItem({
     *   key: 'settings',
     *   label: 'Settings',
     *   icon: '⚙️',
     *   children: [
     *     {
     *       key: 'general',
     *       label: 'General',
     *       path: '/admin/settings/general',
     *       component: GeneralSettingsPage,
     *     },
     *     {
     *       key: 'account',
     *       label: 'Account',
     *       path: '/admin/settings/account',
     *       component: AccountSettingsPage,
     *     }
     *   ]
     * }, 'admin');
     */
    registerMenuItem: (menuItemObject, position) => {
      // 递归注册路由
      const registerRoutesRecursively = (item) => {
        const { path, component, permissions, children } = item;
        if (path && component) {
          registry.registerRoute({ path, component, permissions });
        }
        if (children && children.length > 0) {
          children.forEach(registerRoutesRecursively);
        }
      };

      registerRoutesRecursively(menuItemObject);
      
      return registry.registerMenuItem(menuItemObject, position);
    },

    /**
     * @typedef {Object} NavbarItemConfig
     * @description 导航栏插槽项配置对象。
     * @property {string} key - 唯一标识。
     * @property {React.Component} component - 要渲染的组件。
     * @property {number} [order] - 排序权重，越小越靠前。
     * @property {string|Array<string>} [permissions] - 查看该项所需的权限。
     */
    /**
     * 注册一个导航栏插槽项到指定位置（后台或公共）。
     * @param {NavbarItemConfig} navbarItemObject - 插槽项配置对象。
     * @param {'admin' | 'public'} position - 要注册的导航栏位置。
     */
    registerNavbarItem: (navbarItemObject, position) => {
      return registry.registerNavbarItem(navbarItemObject, position);
    },

    /**
     * 注册国际化翻译资源
     * @param {string} pluginName - 插件唯一名称，用作命名空间
     * @param {Object} translations - 翻译资源对象
     * @param {Object} translations.en - 英文翻译
     * @param {Object} translations.zh - 中文翻译
     * @example registerI18nNamespace('myPlugin', { en: { title: 'Hello' }, zh: { title: '你好' } });
     */
    registerI18nNamespace: (pluginName, translations) => {
      // 可以在这里添加翻译资源验证逻辑
      return registry.registerI18nNamespace(pluginName, translations);
    },

    /**
     * 注册权限定义
     * @param {Object} permissionObject - 权限配置对象
     * @param {string} permissionObject.name - 权限名称，用于权限检查
     * @param {string} [permissionObject.description] - 权限描述
     * @example registerPermission({ name: 'ui.blog.create', description: '创建博客文章' });
     */
    registerPermission: (permissionObject) => {
      // 可以在这里添加权限验证逻辑
      return registry.registerPermission(permissionObject);
    },

    /**
     * 注册Provider
     * @param {Object} providerObject - Provider配置对象
     * @param {string} providerObject.name - Provider名称，必须唯一
     * @param {React.Component} providerObject.component - Provider组件
     * @param {Object} [providerObject.props] - 传递给Provider的props
     * @param {number} [providerObject.order] - Provider排序权重，数字越小越靠前
     * @param {Array<string>} [providerObject.dependencies] - 依赖的其他Provider名称
     * @example registerProvider({ 
     *   name: 'MyProvider', 
     *   component: MyProvider, 
     *   props: { initialValue: 'test' },
     *   order: 10,
     *   dependencies: ['AuthenticationProvider']
     * });
     */
    registerProvider: (providerObject) => {
      // 可以在这里添加Provider验证逻辑
      return registry.registerProvider(providerObject);
    },
    
  };
};

// 导出默认的API实例
export const registryApi = createPluginAPI();

// 导出注册中心（向后兼容）
export { default as registry } from './registry.js';
