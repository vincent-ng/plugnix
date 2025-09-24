import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/framework/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/framework/components/ui/tabs';
import { Badge } from '@/framework/components/ui/badge';
import Authorized from '@/framework/components/Authorized';
import { useGroup } from '@/framework/contexts/GroupContext';
import { supabase } from '@/framework/lib/supabase';
import { ArrowLeft, Crown, User, Edit, Trash2, Users, Shield, Settings } from 'lucide-react';
import MembersTab from '../components/MembersTab';
import RolesTab from '../components/RolesTab';
import SettingsTab from '../components/SettingsTab';


export default function GroupDetailsPage() {
  const { t } = useTranslation('groupManagement');
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const { userGroups, loading: groupsLoading } = useGroup();

  useEffect(() => {
    const loadGroup = async () => {
      setLoading(true);
      try {
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*, group_users(count)')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;

        const groupInContext = userGroups.find(g => g.id === groupId);

        setGroup({
          ...groupData,
          member_count: groupData.group_users[0]?.count || 0,
          user_role: groupInContext?.role || 'Unknown'
        });
      } catch (error) {
        console.error('Error loading group details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (groupId && !groupsLoading) {
      loadGroup();
    }
  }, [groupId, groupsLoading, userGroups]);

  const handleDeleteGroup = async () => {
    if (window.confirm(t('groupDetails.confirmDelete'))) {
      // TODO: 实现删除逻辑
      console.log('删除用户组:', groupId);
      navigate('/admin/groups');
    }
  };

  const getRoleIcon = (role) => {
    return role === 'Owner' ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />;
  };

  const getRoleBadgeVariant = (role) => {
    return role === 'Owner' ? 'default' : 'secondary';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">用户组不存在</h2>
            <p className="text-muted-foreground mb-4">您访问的用户组可能已被删除或您没有访问权限</p>
            <Button asChild>
              <Link to="/admin/groups">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/groups">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <Badge variant={getRoleBadgeVariant(group.user_role)} className="flex items-center gap-1">
                {getRoleIcon(group.user_role)}
                {t(`groupList.${group.user_role.toLowerCase()}`)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {group.description || '暂无描述'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Authorized permissions="ui.group.edit">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              {t('groupDetails.editGroup')}
            </Button>
          </Authorized>
          
          <Authorized permissions="ui.group.delete">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteGroup}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('groupDetails.deleteGroup')}
            </Button>
          </Authorized>
        </div>
      </div>

      {/* 统计信息卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{group.member_count}</p>
              <p className="text-muted-foreground">成员数量</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Shield className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-muted-foreground">自定义角色</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Settings className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">活跃</p>
              <p className="text-muted-foreground">组状态</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab 内容 */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <TabsList className="h-auto p-0 bg-transparent justify-start rounded-none border-0">
                <TabsTrigger 
                  value="members" 
                  className="flex items-center gap-2 px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <Users className="h-4 w-4" />
                  {t('groupDetails.tabs.members')}
                </TabsTrigger>
                <TabsTrigger 
                  value="roles"
                  className="flex items-center gap-2 px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <Shield className="h-4 w-4" />
                  {t('groupDetails.tabs.roles')}
                </TabsTrigger>
                <TabsTrigger 
                  value="settings"
                  className="flex items-center gap-2 px-6 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <Settings className="h-4 w-4" />
                  {t('groupDetails.tabs.settings')}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="members" className="p-6 mt-0">
              <MembersTab groupId={groupId} userRole={group.user_role} />
            </TabsContent>

            <TabsContent value="roles" className="p-6 mt-0">
              <RolesTab groupId={groupId} userRole={group.user_role} />
            </TabsContent>

            <TabsContent value="settings" className="p-6 mt-0">
              <SettingsTab 
                group={group} 
                userRole={group.user_role}
                onGroupUpdate={setGroup}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}