import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/framework/components/ui/button';
import { Input } from '@/framework/components/ui/input';
import { Badge } from '@/framework/components/ui/badge';
import { Textarea } from '@/framework/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/framework/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/framework/components/ui/dialog';
import {
  Plus,
  Shield,
  Edit,
  Trash2,
  MoreHorizontal,
  Crown,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/framework/components/ui/dropdown-menu';
import Authorized from '@/framework/components/Authorized';
import RoleEditDialog from './RoleEditDialog';
import { toast } from "sonner";
import { getGroupRoles, createRole, updateRole, deleteRole } from '../services/roleService';

export default function RolesTab({ groupId, userRole }) {
  const { t } = useTranslation('group-management');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const canManageRoles = userRole === 'Owner' || userRole === 'Admin';

  // 数据加载
  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      try {
        const rolesData = await getGroupRoles(groupId);
        setRoles(rolesData);
      } catch (error) {
        toast.error(t('roles.errors.loadFailed'), {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, [groupId]);

  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setRoleDialogOpen(true);
  };

  const handleSaveRole = async (roleData) => {
    try {
      if (editingRole) {
        // 更新角色
        const updatedRole = await updateRole(editingRole.id, roleData);
        setRoles(prev => prev.map(role =>
          role.id === editingRole.id ? updatedRole : role
        ));
        toast.success(t('roles.success.update'));
      } else {
        // 创建角色
        const newRole = await createRole(groupId, roleData);
        setRoles(prev => [...prev, newRole]);
        toast.success(t('roles.success.create'));
      }
      setRoleDialogOpen(false);
      setEditingRole(null);
    } catch (error) {
      toast.error(editingRole ? t('roles.errors.updateFailed') : t('roles.errors.createFailed'), {
        description: error.message,
      });
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm(t('roles.confirmDelete'))) {
      try {
        await deleteRole(roleId);
        setRoles(prev => prev.filter(role => role.id !== roleId));
        toast.success(t('roles.success.delete'));
      } catch (error) {
        toast.error(t('roles.errors.deleteFailed'), {
          description: error.message,
        });
      }
    }
  };

  const getRoleIcon = (roleName) => {
    return roleName === 'Owner' ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />;
  };

  const getRoleBadgeVariant = (isSystem) => {
    return isSystem ? 'default' : 'secondary';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('roles.totalCount', { count: roles.length })}
        </div>

        <Authorized permissions="ui.group.role.create">
          {canManageRoles && (
            <Button onClick={handleCreateRole}>
              <Plus className="h-4 w-4 mr-2" />
              {t('roles.createRole')}
            </Button>
          )}
        </Authorized>
      </div>

      {/* 角色列表 */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('roles.role')}</TableHead>
              <TableHead>{t('roles.members')}</TableHead>
              <TableHead>{t('roles.permissions')}</TableHead>
              <TableHead>{t('roles.type')}</TableHead>
              {canManageRoles && <TableHead className="w-12"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {getRoleIcon(role.name)}
                    <div>
                      <div className="font-medium">{t(`roles.names.${role.name}`, { defaultValue: role.name })}</div>
                      <div className="text-sm text-muted-foreground">
                        {role.description}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {role.member_count} {t('roles.memberCount')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {role.permissions.length} {t('roles.permissionCount')}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(role.is_system)}>
                    {role.is_system ? t('roles.system') : t('roles.custom')}
                  </Badge>
                </TableCell>
                {canManageRoles && (
                  <TableCell>
                    {!role.is_system && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditRole(role)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('roles.editRole')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteRole(role.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('roles.deleteRole')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 角色编辑对话框 */}
      <RoleEditDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        role={editingRole}
        onSave={handleSaveRole}
      />
    </div>
  );
}