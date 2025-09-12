// 框架API层 - 为插件提供统一的注册接口
import registry from './registry.js';

/**
 * 创建插件API实例
 * 提供版本检查、权限验证等功能的扩展点
 */
export const createPluginAPI = () => {
  return {
    // 路由注册
    registerRoute: (routeObject) => {
      // 可以在这里添加路由验证逻辑
      return registry.registerRoute(routeObject);
    },
    
    // 管理员菜单项注册
    registerAdminMenuItem: (menuItemObject) => {
      // 可以在这里添加管理员菜单项验证逻辑
      return registry.registerAdminMenuItem(menuItemObject);
    },
    
    // 公共菜单项注册
    registerPublicMenuItem: (menuItemObject) => {
      // 可以在这里添加公共菜单项验证逻辑
      return registry.registerPublicMenuItem(menuItemObject);
    },

    // 用户菜单项注册
    registerUserMenuItem: (menuItemObject) => {
      // 可以在这里添加用户菜单项验证逻辑
      return registry.registerUserMenuItem(menuItemObject);
    },
    
    // 国际化命名空间注册
    registerI18nNamespace: (pluginName, translations) => {
      // 可以在这里添加翻译资源验证逻辑
      return registry.registerI18nNamespace(pluginName, translations);
    },
    
    // 组件注册
    registerComponent: (name, component) => {
      // 可以在这里添加组件验证逻辑
      return registry.registerComponent(name, component);
    },
    
  };
};

// 导出默认的API实例
export const registryApi = createPluginAPI();

// 导出注册中心（向后兼容）
export { default as registry } from './registry.js';
