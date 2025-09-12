import translations from './translations.js';
import LandingPage from './LandingPage.jsx';

// 注册landing插件的函数
const registerPluginLanding = ({ registerRoute, registerPublicMenuItem, registerI18nNamespace }) => {
  console.log('Registering landing plugin...');
  
  // 注册翻译
  registerI18nNamespace('landing', translations);
  
  // 注册路由
  registerRoute({
    path: '/',
    component: LandingPage,
    name: 'Landing Page'
  });

  registerPublicMenuItem({
    key: 'home',
    label: 'common:home',
    path: '/'
  });
  
  console.log('Landing plugin registered successfully');
};

export default registerPluginLanding;