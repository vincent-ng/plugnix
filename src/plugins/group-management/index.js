// 导入页面组件
import GroupListPage from './pages/GroupListPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import CreateGroupPage from './pages/CreateGroupPage';

// 导入国际化资源
import zhTranslations from './i18n/zh.json';
import enTranslations from './i18n/en.json';

// 插件注册函数 - 符合框架规范
export default function registerGroupManagementPlugin({
  registerMenuItem,
  registerRoute,
  registerI18nNamespace,
  registerPermission
}) {
  // 注册国际化命名空间
  registerI18nNamespace('groupManagement', {
    zh: zhTranslations,
    en: enTranslations
  });

  // 声明UI权限点
  registerPermission({ name: 'ui.group-management.list', description: '查看用户组列表' });
  registerPermission({ name: 'ui.group-management.create', description: '创建用户组' });
  registerPermission({ name: 'ui.group-management.edit', description: '编辑用户组' });
  registerPermission({ name: 'ui.group-management.delete', description: '删除用户组' });
  registerPermission({ name: 'ui.group-management.member-list', description: '查看用户组成员' });
  registerPermission({ name: 'ui.group-management.member-invite', description: '邀请用户组成员' });
  registerPermission({ name: 'ui.group-management.member-remove', description: '移除用户组成员' });
  registerPermission({ name: 'ui.group-management.member-role', description: '修改成员角色' });
  registerPermission({ name: 'ui.group-management.role-list', description: '查看用户组角色' });
  registerPermission({ name: 'ui.group-management.role-create', description: '创建用户组角色' });
  registerPermission({ name: 'ui.group-management.role-edit', description: '编辑用户组角色' });
  registerPermission({ name: 'ui.group-management.role-delete', description: '删除用户组角色' });

  // 声明后端数据库权限点
  registerPermission({ name: 'db.groups.select', description: '查询用户组' });
  registerPermission({ name: 'db.groups.insert', description: '创建用户组' });
  registerPermission({ name: 'db.groups.update', description: '更新用户组' });
  registerPermission({ name: 'db.groups.delete', description: '删除用户组' });
  registerPermission({ name: 'db.group_members.select', description: '查询用户组成员' });
  registerPermission({ name: 'db.group_members.insert', description: '添加用户组成员' });
  registerPermission({ name: 'db.group_members.update', description: '更新用户组成员' });
  registerPermission({ name: 'db.group_members.delete', description: '删除用户组成员' });
  registerPermission({ name: 'db.group_roles.select', description: '查询用户组角色' });
  registerPermission({ name: 'db.group_roles.insert', description: '创建用户组角色' });
  registerPermission({ name: 'db.group_roles.update', description: '更新用户组角色' });
  registerPermission({ name: 'db.group_roles.delete', description: '删除用户组角色' });
  registerPermission({ name: 'db.group_role_permissions.select', description: '查询角色权限' });
  registerPermission({ name: 'db.group_role_permissions.insert', description: '分配角色权限' });
  registerPermission({ name: 'db.group_role_permissions.update', description: '更新角色权限' });
  registerPermission({ name: 'db.group_role_permissions.delete', description: '删除角色权限' });

  // 注册管理员菜单项
  registerMenuItem({
    key: 'group-management',
    label: 'groupManagement:menu.title',
    path: '/admin/groups',
    component: GroupListPage,
    icon: 'Users',
    order: 30,
  }, 'admin');

  //   // 注册管理员菜单项
  // registerMenuItem({
  //   key: 'group-management-create',
  //   label: 'groupManagement:menu.create',
  //   path: '/admin/groups/new',
  //   component: CreateGroupPage,
  //   icon: 'Users',
  //   order: 30,
  //   permission: 'ui.group-management.create'
  // }, 'admin');

  registerRoute({
    path: '/admin/groups/new',
    component: CreateGroupPage,
  });

  registerRoute({
    path: '/admin/groups/:groupId',
    component: GroupDetailsPage,
  });

  console.log('Group Management plugin registered successfully');
}