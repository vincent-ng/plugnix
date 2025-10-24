// 注册中心 - 管理所有插件的注册信息
import { matchPath } from 'react-router-dom';

class Registry {
  constructor() {
    this.routes = [];
    this.adminMenuItems = [];
    this.publicMenuItems = [];
    this.userMenuItems = [];
    this.i18nNamespaces = new Map();
    this.permissions = new Map();
    this.providers = [];
    this.adminNavbarItems = [];
    this.publicNavbarItems = [];
    this.logoComponent = null;
    this.adminLayout = null;
    this.publicLayout = null;
  }

  // 统一的菜单项注册方法
  registerMenuItem(menuItem) {
    let targetArray;
    switch (menuItem.position) {
      case 'admin':
        targetArray = this.adminMenuItems;
        break;
      case 'public':
        targetArray = this.publicMenuItems;
        break;
      case 'user':
        targetArray = this.userMenuItems;
        break;
      default:
        throw new Error('errors.invalidMenuItemPosition', { position: menuItem.position });
    }
    insertSorted(targetArray, menuItem);
  }

  // 注册导航栏插槽项（按 order 排序）
  registerNavbarItem(navbarItem) {
    switch (navbarItem.position) {
      case 'admin':
        insertSorted(this.adminNavbarItems, navbarItem);
        break;
      case 'public':
        insertSorted(this.publicNavbarItems, navbarItem);
        break;
      default:
        throw new Error('errors.invalidNavbarItemPosition', { position: navbarItem.position });
    }
  }

  // 注册Logo组件
  registerLogo(logoObject) {
    this.logoComponent = {
      component: logoObject.component,
      props: logoObject.props || {}
    };

    // console.log('Logo component registered');
    return this.logoComponent;
  }

  // 注册Layout组件
  registerLayout(layoutObject) {
    const layout = {
      component: layoutObject.component,
      props: layoutObject.props || {}
    };

    switch (layoutObject.position) {
      case 'admin':
        this.adminLayout = layout;
        break;
      case 'public':
        this.publicLayout = layout;
        break;
      default:
        throw new Error('errors.invalidLayoutPosition', { position: layoutObject.position });
    }

  }

  // 注册路由
  registerRoute(route) {
    this.routes.push(route);
  }

  // 注册国际化命名空间
  registerI18nNamespace(pluginName, translations) {
    this.i18nNamespaces.set(pluginName, translations);
    // console.log(`I18n namespace registered: ${pluginName}`);
  }

  // 注册权限
  registerPermission(permissionObject) {
    const permission = {
      name: permissionObject.name,
      description: permissionObject.description || '',
      ...permissionObject
    };

    this.permissions.set(permission.name, permission);
    // console.log(`Permission registered: ${permission.name}`);
  }

  // 注册Provider
  registerProvider(providerObject) {
    const provider = {
      name: providerObject.name,
      component: providerObject.component,
      props: providerObject.props || {},
      order: providerObject.order || 999,
      dependencies: providerObject.dependencies || []
    };

    // 检查是否已存在同名Provider
    const existingIndex = this.providers.findIndex(p => p.name === provider.name);
    if (existingIndex !== -1) {
      // 替换现有Provider
      this.providers[existingIndex] = provider;
      // console.log(`Provider replaced: ${provider.name}`);
    } else {
      // 按order排序插入
      insertSorted(this.providers, provider);
      // console.log(`Provider registered: ${provider.name}`);
    }

  }

  // 获取所有注册的路由
  getRoutes() {
    return this.routes;
  }

  getRoute(path) {
    return this.routes.find(route => route.path === path);
  }

  findRoute(path) {
    for (const route of this.routes) {
      if (matchPath(route.path, path)) {
        return route;
      }
    }
    return null;
  }

  // 获取所有注册的菜单项
  getAdminMenuItems() {
    return this.adminMenuItems;
  }

  getPublicMenuItems() {
    return this.publicMenuItems;
  }

  // 获取所有注册的用户菜单项
  getUserMenuItems() {
    return this.userMenuItems;
  }

  // 获取导航栏插槽项（不区分左右）
  getAdminNavbarItems() {
    return this.adminNavbarItems;
  }

  getPublicNavbarItems() {
    return this.publicNavbarItems;
  }

  // 获取Logo组件
  getLogo() {
    return this.logoComponent;
  }

  // 获取Layout组件
  getLayout(position) {
    switch (position) {
      case 'admin':
        return this.adminLayout;
      case 'public':
        return this.publicLayout;
      default:
        throw new Error(`Invalid layout position: ${position}`);
    }
  }

  // 获取所有国际化命名空间
  getI18nNamespaces() {
    return this.i18nNamespaces;
  }

  // 获取所有注册的权限
  getPermissions() {
    return this.permissions;
  }

  // 获取特定权限
  getPermission(name) {
    return this.permissions.get(name);
  }

  // 获取所有注册的Provider
  getProviders() {
    return this.providers;
  }

  // 获取特定Provider
  getProvider(name) {
    return this.providers.find(p => p.name === name);
  }

}

function getNumberOrDefault(value, defaultValue = 999) {
  return !value && value !== 0 ? defaultValue : value;
}

function insertSorted(array, item) {
  const itemOrder = getNumberOrDefault(item.order);
  const index = array.findIndex(
    (existingItem) => getNumberOrDefault(existingItem.order) > itemOrder
  );

  if (index === -1) {
    array.push(item);
  } else {
    array.splice(index, 0, item);
  }
}

export default Registry;
