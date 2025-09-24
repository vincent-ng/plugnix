import translations from './translations.js';
import LandingPage from './LandingPage.jsx';

// 注册landing插件的函数
const registerPluginLanding = ({ registerMenuItem, registerI18nNamespace }) => {
  console.log('Registering landing plugin...');
  
  // 注册翻译
  registerI18nNamespace('landing', translations);
  
  registerMenuItem({
    key: 'home',
    label: 'common:home',
    path: '/',
    component: LandingPage,
    name: 'Landing Page'
  }, 'public');
  
  console.log('Landing plugin registered successfully');
};

export default registerPluginLanding;