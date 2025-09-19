// 注册中心 - 管理所有插件的注册信息
class Registry {
  constructor() {
    this.routes = [];
    this.adminMenuItems = [];
    this.publicMenuItems = [];
    this.userMenuItems = []; // 新增：用户菜单项
    this.i18nNamespaces = new Map();
    this.components = new Map();
    this.permissions = new Map(); // 新增：权限注册
  }

  // 注册路由
  registerRoute(routeObject) {
    if (!routeObject.path || !routeObject.component) {
      throw new Error('Route must have path and component');
    }
    this.routes.push(routeObject);
    console.log(`Route registered: ${routeObject.path}`);
  }

  // 注册管理菜单项
  registerAdminMenuItem(menuItem) {
    insertSorted(this.adminMenuItems, menuItem);
  }

  // 注册公共菜单项
  registerPublicMenuItem(menuItem) {
    insertSorted(this.publicMenuItems, menuItem);
  }

  // 新增：注册用户菜单项
  registerUserMenuItem(menuItem) {
    insertSorted(this.userMenuItems, menuItem);
  }

  // 注册组件
  registerComponent(name, component) {
    if (!name || !component) {
      throw new Error('Component name and component are required');
    }
    this.components.set(name, component);
    console.log(`Component registered: ${name}`);
  }

  // 注册国际化命名空间
  registerI18nNamespace(pluginName, translations) {
    if (!pluginName || !translations) {
      throw new Error('Plugin name and translations are required');
    }
    this.i18nNamespaces.set(pluginName, translations);
    console.log(`I18n namespace registered: ${pluginName}`);
  }

  // 注册权限
  registerPermission(permissionObject) {
    if (!permissionObject.name) {
      throw new Error('Permission must have a name');
    }
    
    const permission = {
      name: permissionObject.name,
      description: permissionObject.description || '',
      ...permissionObject
    };
    
    this.permissions.set(permission.name, permission);
    console.log(`Permission registered: ${permission.name}`);
  }

  // 获取所有注册的路由
  getRoutes() {
    return this.routes;
  }

  // 获取所有注册的菜单项
  getAdminMenuItems() {
    return this.adminMenuItems;
  }

  getPublicMenuItems() {
    return this.publicMenuItems;
  }

  // 新增：获取所有注册的用户菜单项
  getUserMenuItems() {
    return this.userMenuItems;
  }

  // 获取所有国际化命名空间
  getI18nNamespaces() {
    return this.i18nNamespaces;
  }

  // 获取所有注册的组件
  getComponents() {
    return this.components;
  }

  // 获取特定组件
  getComponent(name) {
    return this.components.get(name);
  }

  // 获取所有注册的权限
  getPermissions() {
    return this.permissions;
  }

  // 获取特定权限
  getPermission(name) {
    return this.permissions.get(name);
  }

}

function insertSorted(array, item) {
  const itemOrder = item.order == null ? 999 : item.order;
  const index = array.findIndex(
    (existingItem) => (existingItem.order == null ? 999 : existingItem.order) > itemOrder
  );

  if (index === -1) {
    array.push(item);
  } else {
    array.splice(index, 0, item);
  }
}

// 创建全局注册中心实例
const registry = new Registry();

export default registry;
