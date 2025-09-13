import translations from './translations.js';
import TestPage from './TestPage.jsx';

// 注册test插件的函数
const registerTestPlugin = ({ registerRoute, registerPublicMenuItem, registerI18nNamespace }) => {
  console.log('Registering test plugin...');

  // 注册翻译
  registerI18nNamespace('test', translations);

  // 注册管理后台菜单项
  registerPublicMenuItem({
    key: 'test',
    label: 'test:title',
    path: '/test',
    icon: '🧪',
    order: 80
  });

  // 注册路由
  registerRoute({
    path: '/test',
    component: TestPage,
    name: 'Test Page'
  });

  console.log('Test plugin registered successfully');
};

export default registerTestPlugin;