import UserListPage from './pages/UserListPage.jsx';
import UserDetailPage from './pages/UserDetailPage.jsx';
import CreateUserPage from './pages/CreateUserPage.jsx';

// 用户管理插件的翻译资源
const translations = {
  en: {
    title: 'User Management',
    list: 'User List',
    detail: 'User Detail',
    create: 'Create User',
    edit: 'Edit User',
    delete: 'Delete User',
    profile: 'Profile',
    email: 'Email',
    name: 'Name',
    role: 'Role',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    admin: 'Admin',
    userRole: 'User',
    createdAt: 'Created At',
    lastLogin: 'Last Login',
    search: 'Search users by name or email...',
    allRoles: 'All Roles',
    actions: 'Actions',
    confirmDelete: 'Are you sure you want to delete this user?',
    deleteSuccess: 'User deleted successfully',
    deleteFailed: 'Failed to delete user',
    fetchFailed: 'Failed to fetch user list',
    createSuccess: 'User created successfully',
    createFailed: 'Failed to create user',
    updateSuccess: 'User updated successfully',
    updateFailed: 'Failed to update user',
    apiError: 'API request failed',
    networkError: 'Network connection error'
  },
  zh: {
    title: '用户管理',
    list: '用户列表',
    detail: '用户详情',
    create: '创建用户',
    edit: '编辑用户',
    delete: '删除用户',
    profile: '个人资料',
    email: '邮箱',
    name: '姓名',
    role: '角色',
    status: '状态',
    active: '激活',
    inactive: '未激活',
    admin: '管理员',
    userRole: '用户',
    createdAt: '创建时间',
    lastLogin: '最后登录',
    search: '搜索用户名或邮箱...',
    allRoles: '所有角色',
    actions: '操作',
    confirmDelete: '确定要删除这个用户吗？',
    deleteSuccess: '用户删除成功',
    deleteFailed: '删除用户失败',
    fetchFailed: '获取用户列表失败',
    createSuccess: '用户创建成功',
    createFailed: '创建用户失败',
    updateSuccess: '用户更新成功',
    updateFailed: '更新用户失败',
    apiError: 'API请求失败',
    networkError: '网络连接错误'
  }
};

// 用户管理插件注册函数
export default function registerUserPlugin({ registerMenuItem, registerRoute, registerI18nNamespace }) {
  // 注册国际化资源
  registerI18nNamespace('user', translations);

  // 注册菜单项和路由
  registerMenuItem({
    key: 'users',
    label: 'user:title',
    path: '/admin/users',
    component: UserListPage,
    icon: '👥',
    order: 2
  }, 'admin');

  registerRoute({
    path: '/admin/users/create',
    component: CreateUserPage,
  });

  registerRoute({
    path: '/admin/users/:id',
    component: UserDetailPage,
  });

  console.log('User management plugin registered successfully');
}