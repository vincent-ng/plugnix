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
import { ArrowLeft, Crown, User, Users, Shield, Settings, Edit, Trash2 } from 'lucide-react';
import MembersTab from '../components/MembersTab';
import RolesTab from '../components/RolesTab';
import SettingsTab from '../components/SettingsTab';
import { toast } from 'sonner';


export default function GroupDetailsPage() {
  const { t } = useTranslation('group-management');
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
          user_role: groupInContext?.role || t('roles.names.Unknown')
        });
      } catch (error) {
        toast.error(t('groupDetails.errors.loadFailed'), {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    if (groupId && !groupsLoading) {
      loadGroup();
    }
  }, [groupId, groupsLoading, userGroups]);

  const getRoleIcon = (role) => {
    if (role === 'Owner') return <Crown className="h-4 w-4" />;
    if (role === 'Admin') return <Shield className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
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
            <h2 className="text-2xl font-semibold mb-2">{t('groupDetails.notFound.title')}</h2>
            <p className="text-muted-foreground mb-4">{t('groupDetails.notFound.description')}</p>
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
                {t(`roles.names.${group.user_role}`, { defaultValue: group.user_role })}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {group.description || t('groupDetails.noDescription')}
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
        </div>
      </div>

      {/* 统计信息卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{group.member_count}</p>
              <p className="text-muted-foreground">{t('groupDetails.stats.members')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Shield className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{group.roles_count || 0}</p>
              <p className="text-muted-foreground">{t('groupDetails.stats.roles')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Settings className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{t('groupDetails.stats.active')}</p>
              <p className="text-muted-foreground">{t('groupDetails.stats.status')}</p>
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
                onGroupUpdate={setGroup}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}