import AboutPage from './AboutPage';

// About插件的翻译资源
const translations = {
  en: {
    title: 'About Us',
    description: 'This is the about page of our application. We are a team of passionate developers dedicated to creating amazing web experiences.',
    menuLabel: 'About'
  },
  zh: {
    title: '关于我们',
    description: '这是我们应用程序的关于页面。我们是一个充满激情的开发团队，致力于创造出色的网络体验。',
    menuLabel: '关于'
  }
};

export default function registerPlugin({ registerPublicMenuItem, registerRoute, registerI18nNamespace }) {
  // 注册国际化资源
  registerI18nNamespace('about', translations);

  registerPublicMenuItem({
    key: 'about',
    label: 'about:title',
    path: '/about'
  });

  registerRoute({
    path: '/about',
    component: AboutPage
  });
}