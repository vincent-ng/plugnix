import ProfilePage from './ProfilePage';
import en from './i18n/en';
import zh from './i18n/zh';

export default function registerPluginProfile({ registerRoute, registerUserMenuItem, registerI18nNamespace }) {
  registerRoute({
    path: '/profile',
    component: ProfilePage,
  });

  registerUserMenuItem({
    label: 'profile:profile.title',
    path: '/profile',
  });

  registerI18nNamespace('profile', { en, zh });
}