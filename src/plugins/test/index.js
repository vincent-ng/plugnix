import translations from './translations.js';
import TestPage from './TestPage.jsx';

// 注册test插件的函数
const registerTestPlugin = ({ registerRoute, registerI18nNamespace }) => {
  console.log('Registering test plugin...');

  // 注册翻译
  registerI18nNamespace('test', translations);

  // 注册路由
  registerRoute({
    path: '/test',
    component: TestPage,
    name: 'Test Page'
  });

  console.log('Test plugin registered successfully');
};

export default registerTestPlugin;