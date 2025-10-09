import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGroup } from '@/framework/contexts/GroupContext'; // 引入 useGroup
import { Button } from '@/framework/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Input } from '@/framework/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/framework/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/framework/components/ui/table';
import { Badge } from '@/framework/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/framework/components/ui/dialog';
import { Label } from '@/framework/components/ui/label';
import { Plus, Search, Edit, Trash2, UserCheck } from 'lucide-react';
import { supabase } from '@/framework/lib/supabase';
import { toast } from 'sonner';
import Authorized from '@/framework/components/Authorized';

const GroupUsersPage = () => {
  const { t } = useTranslation('group-users');
  const { currentGroup } = useGroup(); // 使用全局的 currentGroup

  // 状态管理
  const [groupUsers, setGroupUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false); // 初始加载状态
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 对话框状态
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [editRoleDialog, setEditRoleDialog] = useState(false);
  const [removeUserDialog, setRemoveUserDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 表单状态
  const [addUserForm, setAddUserForm] = useState({
    groupId: '',
    userEmail: '',
    roleId: ''
  });
  const [editRoleForm, setEditRoleForm] = useState({
    roleId: ''
  });

  // 当 currentGroup.id 变化时，加载组数据
  useEffect(() => {
    const groupId = currentGroup?.id;

    if (!groupId) {
      setGroupUsers([]);
      setRoles([]);
      setLoading(false);
      return;
    }

    const loadRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .eq('group_id', groupId)
          .order('name');

        if (error) throw error;

        setRoles(data || []);
      } catch (error) {
        console.error('Error loading roles data:', error);
        toast.error(t('messages.loadRolesError'));
        setRoles([]);
      }
    };

    setLoading(true);
    Promise.all([loadRoles(), loadGroupMembers(groupId)]).finally(() => setLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGroup?.id]);

  const loadGroupMembers = async (groupId) => {
    try {
      setLoadingMembers(true);
      const { data, error } = await supabase.rpc('get_group_members', { p_group_id: groupId });

      if (error) throw error;

      setGroupUsers(data || []);
    } catch (error) {
      console.error('Error loading group members:', error);
      toast.error(error.message || t('messages.loadMembersError'));
      setGroupUsers([]); // 出错时清空列表
    } finally {
      setLoadingMembers(false);
    }
  };

  // 过滤数据
  const filteredGroupUsers = groupUsers.filter(item => {
    return !searchTerm ||
      item.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user_raw_user_meta_data?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // 添加用户到组
  const handleAddUser = async () => {
    if (!addUserForm.groupId || !addUserForm.userEmail || !addUserForm.roleId) {
      toast.error(t('messages.addFormInvalid'));
      return;
    }
    try {
      const { error } = await supabase.rpc('add_member_by_email', {
        p_group_id: addUserForm.groupId,
        p_user_email: addUserForm.userEmail,
        p_role_id: addUserForm.roleId
      });

      if (error) throw error;

      toast.success(t('messages.addSuccess'));
      setAddUserDialog(false);
      setAddUserForm({ groupId: currentGroup.id, userEmail: '', roleId: '' });
      loadGroupMembers(currentGroup.id); // 重新加载当前组的成员
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(error.message || t('messages.addError'));
    }
  };

  // 修改用户角色
  const handleEditRole = async () => {
    try {
      const { error } = await supabase
        .from('group_users')
        .update({ role_id: editRoleForm.roleId })
        .match({ group_id: selectedItem.group_id, user_id: selectedItem.user_id });

      if (error) throw error;

      toast.success(t('messages.updateSuccess'));
      setEditRoleDialog(false);
      setEditRoleForm({ roleId: '' });
      setSelectedItem(null);
      loadGroupMembers(currentGroup.id); // 重新加载当前组的成员
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(t('messages.updateError'));
    }
  };

  // 移除用户
  const handleRemoveUser = async () => {
    try {
      const { error } = await supabase
        .from('group_users')
        .delete()
        .match({ group_id: selectedItem.group_id, user_id: selectedItem.user_id });

      if (error) throw error;

      toast.success(t('messages.removeSuccess'));
      setRemoveUserDialog(false);
      setSelectedItem(null);
      loadGroupMembers(currentGroup.id); // 重新加载当前组的成员
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error(t('messages.removeError'));
    }
  };

  // 打开添加用户对话框
  const openAddUserDialog = () => {
    if (!currentGroup) {
      toast.error(t('messages.selectGroupPrompt'));
      return;
    }
    setAddUserForm({
      groupId: currentGroup.id || '',
      userEmail: '',
      roleId: ''
    });
    setAddUserDialog(true);
  };

  // 打开编辑角色对话框
  const openEditRoleDialog = (item) => {
    setSelectedItem(item);
    setEditRoleForm({ roleId: item.role_id });
    setEditRoleDialog(true);
  };

  // 打开移除用户对话框
  const openRemoveUserDialog = (item) => {
    setSelectedItem(item);
    setRemoveUserDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">{t('messages.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('page.title')}</h1>
        <p className="text-muted-foreground">{t('page.description')}</p>
      </div>

      {/* 操作栏 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              {currentGroup ? `${currentGroup.name} - ${t('page.title')}` : t('page.title')}
            </CardTitle>
            <Authorized permission="ui.group-users.add">
              <Button onClick={openAddUserDialog} disabled={!currentGroup}>
                <Plus className="h-4 w-4 mr-2" />
                {t('actions.addUser')}
              </Button>
            </Authorized>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和过滤 */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('filters.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* 数据表格 */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.user')}</TableHead>
                  <TableHead>{t('table.email')}</TableHead>
                  <TableHead>{t('table.role')}</TableHead>
                  <TableHead>{t('table.joinedAt')}</TableHead>
                  <TableHead className="text-right">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingMembers || loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !currentGroup ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t('messages.selectGroupPrompt')}
                    </TableCell>
                  </TableRow>
                ) : filteredGroupUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t('messages.noData')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroupUsers.map((item) => (
                    <TableRow key={item.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={item.user_avatar_url || `https://avatar.vercel.sh/${item.user_email}.png`}
                            alt={item.user_raw_user_meta_data?.name}
                            className="h-8 w-8 rounded-full"
                          />
                          <span className="font-medium">{item.user_raw_user_meta_data?.name || 'Unknown User'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.user_email || 'No Email'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {item.role_name || 'Unknown Role'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Authorized permission="ui.group-users.edit-role">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditRoleDialog(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Authorized>
                          <Authorized permission="ui.group-users.remove">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRemoveUserDialog(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Authorized>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 添加用户对话框 */}
      <Dialog open={addUserDialog} onOpenChange={setAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialog.addUser.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('dialog.addUser.selectGroup')}</Label>
            </div>
            <div>
              <Label htmlFor="user-email">{t('dialog.addUser.userEmail')}</Label>
              <Input
                id="user-email"
                placeholder={t('dialog.addUser.emailPlaceholder')}
                value={addUserForm.userEmail}
                onChange={(e) => setAddUserForm(prev => ({ ...prev, userEmail: e.target.value }))}
              />
            </div>
            <div>
              <Label>{t('dialog.addUser.selectRole')}</Label>
              <Select value={addUserForm.roleId} onValueChange={(value) =>
                setAddUserForm(prev => ({ ...prev, roleId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder={t('dialog.addUser.rolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {roles.filter(role => role.group_id === addUserForm.groupId).map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserDialog(false)}>
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={!addUserForm.groupId || !addUserForm.userEmail || !addUserForm.roleId}
            >
              {t('actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑角色对话框 */}
      <Dialog open={editRoleDialog} onOpenChange={setEditRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialog.editRole.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('dialog.editRole.currentRole')}</Label>
              <div className="p-2 bg-muted rounded">
                {selectedItem?.role_name || 'Unknown Role'}
              </div>
            </div>
            <div>
              <Label>{t('dialog.editRole.newRole')}</Label>
              <Select value={editRoleForm.roleId} onValueChange={(value) =>
                setEditRoleForm({ roleId: value })
              }>
                <SelectTrigger>
                  <SelectValue placeholder={t('dialog.editRole.rolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {roles.filter(role => role.group_id === selectedItem?.group_id).map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleDialog(false)}>
              {t('actions.cancel')}
            </Button>
            <Button
              onClick={handleEditRole}
              disabled={!editRoleForm.roleId}
            >
              {t('actions.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 移除用户对话框 */}
      <Dialog open={removeUserDialog} onOpenChange={setRemoveUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dialog.removeUser.title')}</DialogTitle>
            <DialogDescription>
              {t('dialog.removeUser.message', {
                user: selectedItem?.user_email || 'Unknown User',
                group: selectedItem?.group_name || 'Unknown Group'
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-destructive">
            {t('dialog.removeUser.warning')}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveUserDialog(false)}>
              {t('actions.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleRemoveUser}>
              {t('actions.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupUsersPage;