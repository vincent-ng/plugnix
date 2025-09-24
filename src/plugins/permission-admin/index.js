// 权限管理插件的翻译资源
import en from './i18n/en.json';
import zh from './i18n/zh.json';

// 导入页面组件
import PermissionAdminPage from './pages/PermissionAdminPage';

// 权限管理插件注册函数
export default function registerPermissionAdminPlugin({
  registerMenuItem,
  registerPermission,
  registerI18nNamespace
}) {
  // 1. 注册国际化资源
  registerI18nNamespace('permissionAdmin', { en, zh });

  // 2. 声明插件自身需要的UI权限
  registerPermission({
    name: 'ui.permission-admin.view',
    description: '访问权限管理面板'
  });

  // 3. 注册Admin菜单项，并用UI权限保护
  registerMenuItem({
    label: 'permissionAdmin.menuLabel', // i18n key
    path: '/admin/permissions',
    component: PermissionAdminPage,
    permission: 'ui.permission-admin.view',
    order: 100 // 较高的排序值，使其出现在核心功能区域
  }, 'admin');

  // 5. 声明此插件进行管理操作所需的后端DB权限
  const tables = ['roles', 'permissions', 'role_permissions', 'user_roles'];
  const actions = ['select', 'insert', 'update', 'delete'];
  
  tables.forEach(table => {
    actions.forEach(action => {
      registerPermission({ 
        name: `db.${table}.${action}`,
        description: `${action} operations on ${table} table`
      });
    });
  });

  console.log('Permission Admin plugin registered successfully');
}