import translations from './translations.js';
import LandingPage from './LandingPage.jsx';

// 注册landing插件的函数
const registerPluginLanding = ({ registerMenuItem, registerI18nNamespace }) => {
  // 注册翻译
  registerI18nNamespace('landing', translations);

  registerMenuItem({
    key: 'home',
    label: 'common:home',
    path: '/',
    component: LandingPage,
    order: 0,
    name: 'Landing Page',
    position: 'public'
  });

};

export default registerPluginLanding;