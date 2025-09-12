import DashboardPage from './DashboardPage';
import en from './i18n/en.json';
import zh from './i18n/zh.json';
import { LayoutDashboard } from 'lucide-react';

export default function register({ registerRoute, registerAdminMenuItem, registerI18nNamespace }) {
  registerI18nNamespace('dashboard', { en, zh });

  registerRoute({
    path: '/admin',
    component: DashboardPage,
  });

  registerAdminMenuItem({
    key: 'dashboard',
    label: 'dashboard:menu.title',
    path: '/admin',
    icon: LayoutDashboard,
    order: 0,
  });
}