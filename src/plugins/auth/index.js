// 认证模块的翻译资源
import en from './i18n/en.json';
import zh from './i18n/zh.json';

// 导入页面组件用于路由注册
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SignOutMenuItem from './components/SignOutMenuItem';

// 导出页面组件
export { LoginPage, RegisterPage };

// 注册函数
export default function registerAuthModule({ registerI18nNamespace, registerMenuItem, registerRoute }) {
  // 注册国际化资源
  registerI18nNamespace('auth', { en, zh });
  
  // 注册路由
  registerRoute({
    path: '/login',
    component: LoginPage
  });
  
  registerRoute({
    path: '/register', 
    component: RegisterPage
  });
  
  // 注册登出菜单项组件
  registerMenuItem({
    key: 'signOut',
    component: SignOutMenuItem,
    order: 999 // 确保登出按钮在最后
  }, 'user');

  console.log('Auth module routes, i18n and user menu registered successfully');
}
