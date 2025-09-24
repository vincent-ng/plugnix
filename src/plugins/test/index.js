import translations from './translations.js';
import TestPage from './TestPage.jsx';
import UrlNavigationPage from './UrlNavigationPage.jsx';

// 注册test插件的函数
const registerTestPlugin = ({ registerMenuItem, registerRoute, registerI18nNamespace }) => {
  console.log('Registering test plugin...');

  // 注册翻译
  registerI18nNamespace('test', translations);

  // 注册管理后台菜单项
  registerMenuItem({
    key: 'test',
    label: 'test:title',
    path: '/test',
    component: TestPage,
    name: 'Test Page',
    icon: '🧪',
    order: 80
  }, 'public');

  // 注册URL导航页面路由
  registerRoute({
    path: '/test/url-navigation',
    component: UrlNavigationPage,
    name: 'URL Navigation Test'
  });

  console.log('Test plugin registered successfully');
};

export default registerTestPlugin;