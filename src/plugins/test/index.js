import translations from './translations.js';
import TestPage from './TestPage.jsx';
import TestDbAutomation from './TestDbAutomation.jsx';
import UrlNavigationPage from './UrlNavigationPage.jsx';
import NotificationTestPage from './NotificationTestPage.jsx';

// 注册test插件的函数
const registerTestPlugin = ({ registerMenuItem, registerI18nNamespace }) => {
  // 注册翻译
  registerI18nNamespace('test', translations);

  registerMenuItem({
    key: 'test',
    label: 'test:title',
    children: [{
      key: 'test-url-navigation',
      label: 'test:url-navigation-title',
      path: '/test/url-navigation',
      component: UrlNavigationPage,
      name: 'URL Navigation Test',
      icon: '🧪',
      order: 80
    }, {
      key: 'test',
      label: 'test:title',
      path: '/test',
      component: TestPage,
      name: 'Test Page',
      icon: '🧪',
      order: 80
    }, {
      key: 'test-db-automation',
      label: 'test:db-automation-title',
      path: '/test/db-automation',
      component: TestDbAutomation,
      name: 'Database Automation Test Page',
      icon: '🧪',
      order: 80
    }, {
      key: 'test-notifications',
      label: 'test:notificationTest.title',
      path: '/test/notifications',
      component: NotificationTestPage,
      name: 'Notification Test Page',
      icon: '🔔',
      order: 80
    }],
    position: 'public'
  });

};

export default registerTestPlugin;