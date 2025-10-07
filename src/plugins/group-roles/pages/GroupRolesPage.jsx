import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGroup } from '@/framework/contexts/GroupContext';
import Authorized from '@/framework/components/Authorized';
import { Button } from '@/framework/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Input } from '@/framework/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/framework/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/framework/components/ui/dropdown-menu';
import { Plus, Search, Edit, Trash2, Shield, MoreHorizontal, Eye } from 'lucide-react';
import { toast } from 'sonner';
import RoleEditDialog from '../components/RoleEditDialog';
import { createRole, deleteRole, getGroupRoles, setRolePermissions, updateRole } from '../services/rolesService';

export default function GroupRolesPage() {
  const { t } = useTranslation('group-roles');
  const { currentGroup, hasPermission } = useGroup();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [dialogMode, setDialogMode] = useState('edit');

  useEffect(() => {
    if (!currentGroup) return;
    loadRoles();
  }, [currentGroup]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const data = await getGroupRoles(currentGroup.id);
      setRoles(data);
    } catch (error) {
      toast.error(t('messages.error'), { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setEditingRole(null);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleEditClick = (role) => {
    // 预填权限：role.permissions 可能不存在，这里只用于展示编辑基础字段
    setEditingRole({ ...role, permissions: role.permissions || [] });
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm(t('actions.confirmDelete'))) return;
    try {
      await deleteRole(roleId);
      setRoles(prev => prev.filter(r => r.id !== roleId));
      toast.success(t('messages.deleteSuccess'));
    } catch (error) {
      toast.error(t('messages.error'), { description: error.message });
    }
  };

  const handleViewPermissions = (role) => {
    setEditingRole(role);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleSaveRole = async (payload) => {
    const { name, display_name, description, permissions } = payload;
    try {
      if (!editingRole) {
        const created = await createRole(currentGroup.id, { name, display_name, description });
        if (permissions && permissions.length > 0) {
          await setRolePermissions(created.id, permissions);
        }
        toast.success(t('messages.createSuccess'));
      } else {
        const updated = await updateRole(editingRole.id, { name, display_name, description });
        await setRolePermissions(updated.id, permissions || []);
        toast.success(t('messages.updateSuccess'));
      }
      await loadRoles();
    } catch (error) {
      toast.error(t('messages.error'), { description: error.message });
      throw error; // 让对话框内保持一致的错误处理
    }
  };

  const filteredRoles = roles.filter(r =>
    (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentGroup) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-muted-foreground">{t('messages.selectGroupPrompt')}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" /> {t('page.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('page.description')}</p>
        </div>

        <Authorized permissions="db.roles.insert">
          <Button onClick={handleCreateClick}>
            <Plus className="h-4 w-4 mr-2" /> {t('actions.createRole')}
          </Button>
        </Authorized>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-xl">{t('page.title')}</CardTitle>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('filters.searchPlaceholder')} className="w-64" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">{t('messages.loading')}</div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-sm text-muted-foreground">{t('messages.noData')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">{t('table.name')}</TableHead>
                  <TableHead>{t('table.description')}</TableHead>
                  <TableHead className="w-[140px]">{t('table.permissions')}</TableHead>
                  <TableHead className="w-[180px]">{t('table.createdAt')}</TableHead>
                  <TableHead className="w-[140px] text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map(role => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.display_name || role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>{role.permissions_count || 0}</TableCell>
                    <TableCell>{new Date(role.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {(() => {
                        const canEdit = hasPermission('db.roles.update');
                        const canDelete = hasPermission('db.roles.delete');
                        const canViewPerms = hasPermission('db.role_permissions.select');
                        const isTemplateRole = role.group_id == null; // 模板角色为只读

                        if (!(canEdit || canDelete || canViewPerms)) {
                          return <span className="text-muted-foreground">—</span>;
                        }

                        return (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 px-2">
                                <span className="sr-only">Actions</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Authorized permissions="db.role_permissions.select">
                                <DropdownMenuItem onClick={() => handleViewPermissions(role)}>
                                  <Eye className="h-4 w-4 mr-2" /> {t('actions.viewPermissions')}
                                </DropdownMenuItem>
                              </Authorized>
                              <Authorized permissions="db.roles.update">
                                {!isTemplateRole && (
                                  <DropdownMenuItem onClick={() => handleEditClick(role)}>
                                    <Edit className="h-4 w-4 mr-2" /> {t('actions.editRole')}
                                  </DropdownMenuItem>
                                )}
                              </Authorized>
                              <Authorized permissions="db.roles.delete">
                                {!isTemplateRole && (
                                  <DropdownMenuItem onClick={() => handleDeleteRole(role.id)} className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" /> {t('actions.deleteRole')}
                                  </DropdownMenuItem>
                                )}
                              </Authorized>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <RoleEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={editingRole}
        onSave={handleSaveRole}
        mode={dialogMode}
      />
    </div>
  );
}