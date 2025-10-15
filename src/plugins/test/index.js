import translations from './translations.js';
import TestPage from './TestPage.jsx';
import TestDbAutomation from './TestDbAutomation.jsx';
import UrlNavigationPage from './UrlNavigationPage.jsx';

// 注册test插件的函数
const registerTestPlugin = ({ registerMenuItem, registerRoute, registerI18nNamespace }) => {
  console.log('Registering test plugin...');

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
    }]
  }, 'public');

  console.log('Test plugin registered successfully');
};

export default registerTestPlugin;