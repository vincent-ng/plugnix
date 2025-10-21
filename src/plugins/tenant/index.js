// 导入页面组件（已重命名为 Tenant*Page）
import TenantRolesPage from './tenant-roles/pages/TenantRolesPage.jsx';
import TenantUsersPage from './tenant-users/pages/TenantUsersPage.jsx';

// 导入组织Provider（使用框架契约）
import { TenantProvider } from './providers/TenantProvider.jsx';

// 导入通用组件
import { TenantSwitcher } from './components/TenantSwitcher.jsx';
export { TenantSwitcher } from './components/TenantSwitcher.jsx';
export { CreateTenantDialog } from './components/CreateTenantDialog.jsx';

// 导入国际化资源（沿用原目录结构）
import zhRoles from './tenant-roles/i18n/zh.json';
import enRoles from './tenant-roles/i18n/en.json';
import zhUsers from './tenant-users/i18n/zh.json';
import enUsers from './tenant-users/i18n/en.json';
import zhTenant from './i18n/zh.json';
import enTenant from './i18n/en.json';

// 插件注册函数 - 符合框架规范
export default function registerTenantPlugin({
  registerMenuItem,
  registerRoute,
  registerI18nNamespace,
  registerPermission,
  registerProvider,
  registerNavbarItem,
}) {
  // 注册国际化命名空间（tenant-*）
  registerI18nNamespace('tenant', { zh: zhTenant, en: enTenant });
  registerI18nNamespace('tenant-roles', { zh: zhRoles, en: enRoles });
  registerI18nNamespace('tenant-users', { zh: zhUsers, en: enUsers });

  // 权限点声明
  registerPermission({ name: 'db.roles.select', description: 'permissions.db.roles.select' });
  registerPermission({ name: 'db.roles.insert', description: 'permissions.db.roles.insert' });
  registerPermission({ name: 'db.roles.update', description: 'permissions.db.roles.update' });
  registerPermission({ name: 'db.roles.delete', description: 'permissions.db.roles.delete' });
  registerPermission({ name: 'db.role_permissions.select', description: 'permissions.db.role_permissions.select' });
  registerPermission({ name: 'db.role_permissions.insert', description: 'permissions.db.role_permissions.insert' });
  registerPermission({ name: 'db.role_permissions.delete', description: 'permissions.db.role_permissions.delete' });
  registerPermission({ name: 'db.permissions.select', description: 'permissions.db.permissions.select' });

  registerPermission({ name: 'db.tenant_users.select', description: '查询组织用户关系' });
  registerPermission({ name: 'db.tenant_users.insert', description: '添加用户到组织' });
  registerPermission({ name: 'db.tenant_users.update', description: '更新组织用户关系' });
  registerPermission({ name: 'db.tenant_users.delete', description: '删除组织用户关系' });

  // 注册菜单项与路由
  registerMenuItem({
    key: 'tenant',
    label: 'tenant:title',
    order: 1,
    children: [
      {
        key: 'tenant-users',
        label: 'tenant-users:menu.title',
        path: '/admin/tenant-users',
        component: TenantUsersPage,
        icon: 'UserCheck',
        order: 35,
      },
      {
        key: 'tenant-roles',
        label: 'tenant-roles:menu.title',
        path: '/admin/tenant-roles',
        component: TenantRolesPage,
        icon: 'ShieldCheck',
        order: 36,
      },
    ],
  }, 'admin');

  registerRoute({
    path: '/admin/tenant-roles',
    component: TenantRolesPage,
    permissions: ['db.roles.select'],
  });

  // 注册组织Provider - 提供多组织支持（通过事件总线与认证解耦）
  registerProvider({
    name: 'TenantProvider',
    component: TenantProvider,
    order: 20,
    dependencies: ['AuthenticationProvider'],
    description: 'Provides multi-tenant support by listening to authentication state changes via event bus'
  });

  // 将 TenantSwitcher 注册到导航栏右侧插槽
  registerNavbarItem({
    key: 'tenant-switcher',
    component: TenantSwitcher,
    order: 20,
  }, 'public');

  // 将 TenantSwitcher 注册到后台导航栏右侧插槽
  registerNavbarItem({
    key: 'tenant-switcher',
    component: TenantSwitcher,
    order: 20,
  }, 'admin');

  console.log('Tenant plugin registered successfully');
}