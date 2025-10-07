// group-roles 插件注册入口
import GroupRolesPage from './pages/GroupRolesPage.jsx';
import zh from './i18n/zh.json';
import en from './i18n/en.json';

export default function registerGroupRolesPlugin({
  registerMenuItem,
  registerRoute,
  registerI18nNamespace,
  registerPermission
}) {
  // 注册国际化
  registerI18nNamespace('group-roles', { zh, en });

  // 简化：改用 DB 权限表达页面与操作能力

  // 声明 DB 权限点（对应数据库初始化脚本中的检查）
  registerPermission({ name: 'db.roles.select', description: '查询角色' });
  registerPermission({ name: 'db.roles.insert', description: '创建角色' });
  registerPermission({ name: 'db.roles.update', description: '更新角色' });
  registerPermission({ name: 'db.roles.delete', description: '删除角色' });
  registerPermission({ name: 'db.role_permissions.select', description: '查询角色权限' });
  registerPermission({ name: 'db.role_permissions.insert', description: '添加角色权限' });
  registerPermission({ name: 'db.role_permissions.delete', description: '移除角色权限' });
  registerPermission({ name: 'db.permissions.select', description: '查询权限定义' });

  // 注册管理员菜单项
  registerMenuItem({
    key: 'group-roles',
    label: 'group-roles:menu.title',
    path: '/admin/group-roles',
    component: GroupRolesPage,
    icon: 'ShieldCheck',
    order: 36
  }, 'admin');

  // 额外路由（后续可扩展角色详情等）
  registerRoute({
    path: '/admin/group-roles',
    component: GroupRolesPage,
    permissions: ['db.roles.select']
  });
}