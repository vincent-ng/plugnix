import DashboardPage from './DashboardPage';
import en from './i18n/en.json';
import zh from './i18n/zh.json';
import { LayoutDashboard } from 'lucide-react';

export default function register({ registerMenuItem, registerI18nNamespace }) {
  registerI18nNamespace('dashboard', { en, zh });

  registerMenuItem({
    key: 'dashboard',
    label: 'dashboard:menu.title',
    path: '/admin',
    component: DashboardPage,
    icon: LayoutDashboard,
    order: 0,
    position: 'admin'
  });

  registerMenuItem({
    key: 'dashboard',
    label: 'dashboard:menu.title',
    path: '/admin',
    component: DashboardPage,
    icon: LayoutDashboard,
    order: 0,
    position: 'user'
  });
}