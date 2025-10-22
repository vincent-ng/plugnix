import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { userAdminApi } from '../api/adminApi';

const UserListPage = () => {
  const { t } = useTranslation(['user']);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data: fetchedUsers, error } = await userAdminApi.listUsers();

      if (error) {
        throw error;
      }

      const formattedUsers = fetchedUsers.map(user => ({
        id: user.id,
        name: user.user_metadata?.name || user.email.split('@')[0],
        email: user.email,
        role: user.user_metadata?.role || 'user',
        status: user.email_confirmed_at ? 'active' : 'inactive',
        createdAt: new Date(user.created_at).toLocaleDateString(),
        lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A',
      }));
      
      setUsers(formattedUsers);
    } catch (err) {
      setError(t('fetchFailed'));
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await userAdminApi.updateUserMetadata(
        userId,
        { status: newStatus }
      );

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      setError('更新用户状态失败');
      console.error('Error updating user status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirmDelete'))) {
      try {
        const { error } = await userAdminApi.deleteUser(id);
        if (error) throw error;
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        setError(t('deleteFailed'));
        console.error('Error deleting user:', err);
      }
    }
  };

  // 过滤用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-muted-foreground">
          {t('common:loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">
          {t('list')}
        </h1>
        <Link
          to="/admin/users/create"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 text-sm font-medium"
        >
          {t('create')}
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 搜索和过滤 */}
      <div className="bg-card text-card-foreground p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder={t('search')}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-ring focus:border-ring bg-background text-foreground"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="">{t('allRoles')}</option>
              <option value="admin">{t('admin')}</option>
              <option value="user">{t('userRole')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-card text-card-foreground shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('role')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                   {t('lastLogin')}
                 </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                   {t('actions')}
                 </th>
              </tr>
            </thead>
            <tbody className="bg-card text-card-foreground divide-y divide-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">
                          {user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                      {user.role === 'admin' ? t('admin') : t('userRole')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleStatusToggle(user.id, user.status)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {user.status === 'active' ? t('active') : t('inactive')}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="text-primary hover:text-primary/80"
                      >
                        {t('common:view')}
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        {t('common:delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchTerm || filterRole ? '没有找到匹配的用户' : '暂无用户'}
          </div>
          {!searchTerm && !filterRole && (
            <Link
              to="/admin/users/create"
              className="mt-4 inline-block bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium"
            >
              {t('create')}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default UserListPage;