import ProfilePage from './ProfilePage';
import en from './i18n/en';
import zh from './i18n/zh';

export default function registerPluginProfile({ registerMenuItem, registerI18nNamespace }) {
  registerMenuItem({
    label: 'profile:profile.title',
    path: '/profile',
    icon: 'User',
    component: ProfilePage,
  }, 'user');

  registerI18nNamespace('profile', { en, zh });
}