import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/framework/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/framework/components/ui/select';
import { Label } from '@/framework/components/ui/label';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { supabase } from '@/framework/lib/supabase';
import { toast } from 'sonner';
import Authorized from '@/framework/components/Authorized';

const AddUserToGroupPage = () => {
  const { t } = useTranslation('group-users');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // 状态管理
  const [groups, setGroups] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // 表单状态
  const [form, setForm] = useState({
    groupId: searchParams.get('groupId') || '',
    userId: '',
    roleId: ''
  });

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 当选择的组改变时，重新加载该组的角色
  useEffect(() => {
    if (form.groupId) {
      loadRolesForGroup(form.groupId);
    }
  }, [form.groupId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 并行加载组和用户数据
      const [groupsResult, usersResult] = await Promise.all([
        supabase.from('groups').select('*').order('name'),
        supabase.from('auth.users').select('id, email, raw_user_meta_data')
      ]);

      if (groupsResult.error) throw groupsResult.error;
      if (usersResult.error) throw usersResult.error;

      setGroups(groupsResult.data || []);
      setUsers(usersResult.data || []);
      
      // 如果URL中指定了组ID，加载该组的角色
      if (form.groupId) {
        await loadRolesForGroup(form.groupId);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t('messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const loadRolesForGroup = async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('group_id', groupId)
        .order('name');

      if (error) throw error;
      setRoles(data || []);
      
      // 重置角色选择
      setForm(prev => ({ ...prev, roleId: '' }));
      
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error(t('messages.loadError'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.groupId || !form.userId || !form.roleId) {
      toast.error('请填写所有必填字段');
      return;
    }

    try {
      setSubmitting(true);
      
      // 检查用户是否已经在该组中
      const { data: existingUser, error: checkError } = await supabase
        .from('group_users')
        .select('*')
        .eq('group_id', form.groupId)
        .eq('user_id', form.userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser) {
        toast.error('该用户已经在此组中');
        return;
      }

      // 添加用户到组
      const { error } = await supabase
        .from('group_users')
        .insert([{
          group_id: form.groupId,
          user_id: form.userId,
          role_id: form.roleId
        }]);

      if (error) throw error;

      toast.success(t('messages.addSuccess'));
      navigate('/admin/group-users');
      
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(t('messages.addError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
      {/* 页面标题和返回按钮 */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/group-users')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dialog.addUser.title')}</h1>
          <p className="text-muted-foreground">将用户添加到指定的用户组中</p>
        </div>
      </div>

      {/* 表单卡片 */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {t('dialog.addUser.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 选择用户组 */}
            <div className="space-y-2">
              <Label htmlFor="group">{t('dialog.addUser.selectGroup')} *</Label>
              <Select 
                value={form.groupId} 
                onValueChange={(value) => handleFormChange('groupId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dialog.addUser.groupPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                      {group.description && (
                        <span className="text-muted-foreground ml-2">
                          - {group.description}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 选择用户 */}
            <div className="space-y-2">
              <Label htmlFor="user">{t('dialog.addUser.selectUser')} *</Label>
              <Select 
                value={form.userId} 
                onValueChange={(value) => handleFormChange('userId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dialog.addUser.userPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span>{user.email}</span>
                        {user.raw_user_meta_data?.full_name && (
                          <span className="text-sm text-muted-foreground">
                            {user.raw_user_meta_data.full_name}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 选择角色 */}
            <div className="space-y-2">
              <Label htmlFor="role">{t('dialog.addUser.selectRole')} *</Label>
              <Select 
                value={form.roleId} 
                onValueChange={(value) => handleFormChange('roleId', value)}
                disabled={!form.groupId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    form.groupId 
                      ? t('dialog.addUser.rolePlaceholder')
                      : '请先选择用户组'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                      {role.description && (
                        <span className="text-muted-foreground ml-2">
                          - {role.description}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!form.groupId && (
                <p className="text-sm text-muted-foreground">
                  请先选择用户组以加载可用角色
                </p>
              )}
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/group-users')}
                disabled={submitting}
              >
                {t('actions.cancel')}
              </Button>
              <Authorized permission="ui.group-users.add">
                <Button
                  type="submit"
                  disabled={!form.groupId || !form.userId || !form.roleId || submitting}
                >
                  {submitting ? '添加中...' : t('actions.save')}
                </Button>
              </Authorized>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddUserToGroupPage;