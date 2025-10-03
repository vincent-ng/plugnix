// 导入页面组件
import GroupUsersPage from './pages/GroupUsersPage';
import AddUserToGroupPage from './pages/AddUserToGroupPage';

// 导入国际化资源
import zhTranslations from './i18n/zh.json';
import enTranslations from './i18n/en.json';

// 插件注册函数 - 符合框架规范
export default function registerGroupUsersPlugin({
  registerMenuItem,
  registerRoute,
  registerI18nNamespace,
  registerPermission
}) {
  // 注册国际化命名空间
  registerI18nNamespace('group-users', {
    zh: zhTranslations,
    en: enTranslations
  });

  // 声明UI权限点
  registerPermission({ name: 'ui.group-users.list', description: '查看组内用户列表' });
  registerPermission({ name: 'ui.group-users.add', description: '添加用户到组' });
  registerPermission({ name: 'ui.group-users.edit-role', description: '修改用户角色' });
  registerPermission({ name: 'ui.group-users.remove', description: '移除组内用户' });

  // 声明后端数据库权限点
  registerPermission({ name: 'db.group_users.select', description: '查询组用户关系' });
  registerPermission({ name: 'db.group_users.insert', description: '添加用户到组' });
  registerPermission({ name: 'db.group_users.update', description: '更新用户组关系' });
  registerPermission({ name: 'db.group_users.delete', description: '删除用户组关系' });
  registerPermission({ name: 'db.roles.select', description: '查询角色信息' });

  // 注册管理员菜单项
  registerMenuItem({
    key: 'group-users',
    label: 'group-users:menu.title',
    path: '/admin/group-users',
    component: GroupUsersPage,
    icon: 'UserCheck',
    order: 35,
  }, 'admin');

  // 注册添加用户页面路由
  registerRoute({
    path: '/admin/group-users/add',
    component: AddUserToGroupPage,
  });

  console.log('Group Users plugin registered successfully');
}