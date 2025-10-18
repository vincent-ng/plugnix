// 导入通知铃铛组件
import NotificationBell from './components/NotificationBell.jsx';

// 导入通知Provider
import { NotificationProvider } from './providers/NotificationProvider.jsx';

// 导入国际化资源
import en from './i18n/en.json';
import zh from './i18n/zh.json';

// 注册函数
export default function registerNotificationsModule({ registerI18nNamespace, registerNavbarItem, registerProvider }) {
  // 注册国际化资源
  registerI18nNamespace('notifications', { en, zh });
  
  // 注册通知Provider - 提供通知管理功能
  registerProvider({
    name: 'NotificationProvider',
    component: NotificationProvider,
    order: 50,
    description: 'Provides notification management functionality including event handling and state management'
  });

  // 注册通知铃铛到后台布局导航栏
  registerNavbarItem({
    key: 'notification-bell',
    component: NotificationBell,
    order: 10,
  }, 'admin');

  // 注册通知铃铛到公共布局导航栏
  registerNavbarItem({
    key: 'notification-bell',
    component: NotificationBell,
    order: 10,
  }, 'public');

  console.log('Notifications module registered successfully');
}