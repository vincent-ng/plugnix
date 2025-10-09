// 导入页面组件
import GroupRolesPage from './group-roles/pages/GroupRolesPage.jsx';
import GroupUsersPage from './group-users/pages/GroupUsersPage.jsx';
import AddUserToGroupPage from './group-users/pages/AddUserToGroupPage.jsx';

// 导入国际化资源
import zhRoles from './group-roles/i18n/zh.json';
import enRoles from './group-roles/i18n/en.json';
import zhUsers from './group-users/i18n/zh.json';
import enUsers from './group-users/i18n/en.json';

// 插件注册函数 - 符合框架规范
export default function registerGroupPlugin({
  registerMenuItem,
  registerRoute,
  registerI18nNamespace,
  registerPermission
}) {
  // 注册国际化命名空间
  registerI18nNamespace('group-roles', { zh: zhRoles, en: enRoles });
  registerI18nNamespace('group-users', { zh: zhUsers, en: enUsers });

  // 声明 group-roles 的 DB 权限点
  registerPermission({ name: 'db.roles.select', description: 'permissions.db.roles.select' });
  registerPermission({ name: 'db.roles.insert', description: 'permissions.db.roles.insert' });
  registerPermission({ name: 'db.roles.update', description: 'permissions.db.roles.update' });
  registerPermission({ name: 'db.roles.delete', description: 'permissions.db.roles.delete' });
  registerPermission({ name: 'db.role_permissions.select', description: 'permissions.db.role_permissions.select' });
  registerPermission({ name: 'db.role_permissions.insert', description: 'permissions.db.role_permissions.insert' });
  registerPermission({ name: 'db.role_permissions.delete', description: 'permissions.db.role_permissions.delete' });
  registerPermission({ name: 'db.permissions.select', description: 'permissions.db.permissions.select' });

  // 声明 group-users 的 UI 和 DB 权限点
  registerPermission({ name: 'ui.group-users.list', description: '查看组内用户列表' });
  registerPermission({ name: 'ui.group-users.add', description: '添加用户到组' });
  registerPermission({ name: 'ui.group-users.edit-role', description: '修改用户角色' });
  registerPermission({ name: 'ui.group-users.remove', description: '移除组内用户' });
  registerPermission({ name: 'db.group_users.select', description: '查询组用户关系' });
  registerPermission({ name: 'db.group_users.insert', description: '添加用户到组' });
  registerPermission({ name: 'db.group_users.update', description: '更新用户组关系' });
  registerPermission({ name: 'db.group_users.delete', description: '删除用户组关系' });

  // 注册管理员菜单项
  registerMenuItem({
    key: 'group',
    label: 'group:title',
    order: 1,
    children: [{
        key: 'group-users',
        label: 'group-users:menu.title',
        path: '/admin/group-users',
        component: GroupUsersPage,
        icon: 'UserCheck',
        order: 35,
      }, {
        key: 'group-roles',
        label: 'group-roles:menu.title',
        path: '/admin/group-roles',
        component: GroupRolesPage,
        icon: 'ShieldCheck',
        order: 36
      }]
  }, 'admin');

  // 注册路由
  registerRoute({
    path: '/admin/group-roles',
    component: GroupRolesPage,
    permissions: ['db.roles.select']
  });

  registerRoute({
    path: '/admin/group-users/add',
    component: AddUserToGroupPage,
  });

  console.log('Group plugin registered successfully');
}