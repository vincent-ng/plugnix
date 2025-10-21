import { SignOutMenuItem } from './components/SignOutMenuItem.jsx';
import { UserNav } from './components/UserNav.jsx';

// 认证模块的翻译资源
import en from './i18n/en.json';
import zh from './i18n/zh.json';

// 导入页面组件用于路由注册
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// 导入认证Provider（使用框架契约）
import { AuthenticationProvider } from './providers/AuthenticationProvider.jsx';

// 导出页面组件
export { LoginPage, RegisterPage };

// 注册函数
export default function registerAuthModule({ registerI18nNamespace, registerMenuItem, registerRoute, registerProvider, registerNavbarItem }) {
  // 注册国际化资源
  registerI18nNamespace('auth', { en, zh });
  
  // 注册路由
  registerRoute({
    path: '/login',
    component: LoginPage,
    layout: 'public'
  });
  
  registerRoute({
    path: '/register', 
    component: RegisterPage,
    layout: 'public'
  });
  
  // 注册登出菜单项
  registerMenuItem({
    label: 'auth:common.signOut',
    icon: 'LogOut',
    menuItemComponent: SignOutMenuItem,
    separator: 'front',
    order: 9999, // 确保登出按钮在最后
    position: 'user'
  });

  // 注册认证Provider - 提供用户认证功能
  registerProvider({
    name: 'AuthenticationProvider',
    component: AuthenticationProvider,
    order: 10,
    description: 'Provides user authentication features including login, registration, and logout'
  });

  // 注册 UserNav 到后台和公共导航栏（统一显示登录/头像入口）
  registerNavbarItem({
    key: 'user-nav',
    component: UserNav,
    order: 100,
    position: 'admin'
  });

  registerNavbarItem({
    key: 'user-nav',
    component: UserNav,
    order: 100,
    position: 'public'
  });

}
