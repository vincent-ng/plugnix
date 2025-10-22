import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/framework/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/framework/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Badge } from '@/framework/components/ui/badge';
import { Input } from '@/framework/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/framework/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/framework/components/ui/avatar';
import { Search, MoreHorizontal, UserPlus } from 'lucide-react';
import UserRoleEditDialog from './UserRoleEditDialog';
import { permissionAdminAPI } from '../services/api';

const UserRoleAssignmentTab = () => {
  const { t } = useTranslation('permission-admin');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // 搜索过滤
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await permissionAdminAPI.getUsersWithRoles();
      // 转换数据格式以匹配组件期望的结构
      const formattedUsers = usersData.map(userRole => ({
        id: userRole.users.id,
        name: userRole.users.name || userRole.users.email,
        email: userRole.users.email,
        avatar: userRole.users.avatar_url,
        roles: userRole.roles ? [userRole.roles.name] : [],
        created_at: userRole.users.created_at || new Date().toISOString()
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      // 如果API调用失败，使用mock数据作为fallback
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: null,
          roles: ['admin', 'editor'],
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: null,
          roles: ['editor'],
          created_at: '2024-01-02T00:00:00Z'
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          avatar: null,
          roles: ['viewer'],
          created_at: '2024-01-03T00:00:00Z'
        },
        {
          id: '4',
          name: 'Alice Brown',
          email: 'alice@example.com',
          avatar: null,
          roles: ['admin'],
          created_at: '2024-01-04T00:00:00Z'
        },
        {
          id: '5',
          name: 'Charlie Wilson',
          email: 'charlie@example.com',
          avatar: null,
          roles: [],
          created_at: '2024-01-05T00:00:00Z'
        }
      ];
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  // 加载用户数据
  useEffect(() => {
    loadUsers();
  }, []);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveUserRoles = async (userId, selectedRoles) => {
    try {
      // 获取角色ID映射
      const rolesData = await permissionAdminAPI.getRoles();
      const roleIds = selectedRoles.map(roleName => {
        const role = rolesData.find(r => r.name === roleName);
        return role ? role.id : null;
      }).filter(id => id !== null);

      await permissionAdminAPI.setUserRoles(userId, roleIds);
      
      // 重新加载用户数据
      await loadUsers();
      
      // 关闭对话框
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to save user roles:', error);
      alert(t('common.error'));
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'editor':
        return 'default';
      case 'viewer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 搜索栏 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t('userRoles.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('userRoles.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? t('common.noSearchResults') : t('common.noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">{t('userRoles.table.user')}</TableHead>
                  <TableHead>{t('userRoles.table.email')}</TableHead>
                  <TableHead>{t('userRoles.table.roles')}</TableHead>
                  <TableHead className="w-[100px]">{t('userRoles.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xs">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length === 0 ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            {t('common.none')}
                          </Badge>
                        ) : (
                          user.roles.map((role) => (
                            <Badge 
                              key={role} 
                              variant={getRoleBadgeVariant(role)}
                              className="text-xs"
                            >
                              {role}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            {t('userRoles.assignRole')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 编辑用户角色对话框 */}
      <UserRoleEditDialog
        user={editingUser}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveUserRoles}
      />
    </div>
  );
};

export default UserRoleAssignmentTab;