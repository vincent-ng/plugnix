import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/framework/components/ui/button';
import { Input } from '@/framework/components/ui/input';
import { Badge } from '@/framework/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/framework/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import RoleEditDialog from './RoleEditDialog';
import { permissionAdminAPI } from '../services/api';

const RoleManagementTab = () => {
  const { t } = useTranslation('permission-admin');
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRole, setEditingRole] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const rolesData = await permissionAdminAPI.getRoles();
      // TODO: 获取每个角色的用户数量和权限数量
      const rolesWithCounts = rolesData.map(role => ({
        ...role,
        userCount: 0, // TODO: 从API获取实际用户数量
        permissions: [] // TODO: 从API获取实际权限列表
      }));
      
      setRoles(rolesWithCounts);
      setFilteredRoles(rolesWithCounts);
    } catch (error) {
      console.error('Failed to load roles:', error);
      // 如果API调用失败，使用mock数据作为fallback
      const mockRoles = [
        {
          id: 1,
          name: 'admin',
          description: t('mockData.roles.admin.description'),
          permissions: ['db.users.create', 'db.users.read', 'db.users.update', 'db.users.delete', 'ui.admin.access'],
          userCount: 2,
          created_at: '2024-01-15'
        },
        {
          id: 2,
          name: 'editor',
          description: t('mockData.roles.editor.description'),
          permissions: ['db.posts.create', 'db.posts.read', 'db.posts.update', 'db.posts.delete'],
          userCount: 5,
          created_at: '2024-01-16'
        },
        {
          id: 3,
          name: 'viewer',
          description: t('mockData.roles.viewer.description'),
          permissions: ['db.posts.read', 'ui.dashboard.view'],
          userCount: 12,
          created_at: '2024-01-17'
        }
      ];
      setRoles(mockRoles);
      setFilteredRoles(mockRoles);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // 加载角色数据
  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  // 搜索过滤
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRoles(roles);
    } else {
      const filtered = roles.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRoles(filtered);
    }
  }, [searchTerm, roles]);

  const handleCreateRole = () => {
    setEditingRole(null);
    setIsDialogOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setIsDialogOpen(true);
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm(t('roles.confirmDelete'))) {
      return;
    }

    try {
      await permissionAdminAPI.deleteRole(roleId);
      await loadRoles(); // 重新加载数据
    } catch (error) {
      console.error('Failed to delete role:', error);
      alert(t('roles.deleteError'));
    }
  };

  const handleSaveRole = async (roleData) => {
    try {
      if (editingRole) {
        await permissionAdminAPI.updateRole(editingRole.id, roleData);
      } else {
        await permissionAdminAPI.createRole(roleData);
      }
      
      setIsDialogOpen(false);
      await loadRoles(); // 重新加载数据
    } catch (error) {
      console.error('Failed to save role:', error);
      alert(t('roles.saveError'));
    }
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>{t('roles.title')}</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t('roles.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={handleCreateRole} className="gap-2">
              <Plus className="w-4 h-4" />
              {t('roles.createButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('roles.table.name')}</TableHead>
                  <TableHead>{t('roles.table.description')}</TableHead>
                  <TableHead>{t('roles.table.permissions')}</TableHead>
                  <TableHead>{t('roles.table.users')}</TableHead>
                  <TableHead>{t('roles.table.createdAt')}</TableHead>
                  <TableHead className="w-[100px]">{t('roles.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {role.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions?.slice(0, 3).map((permission) => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{role.userCount || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RoleEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        role={editingRole}
        onSave={handleSaveRole}
      />
    </div>
  );
};

export default RoleManagementTab;