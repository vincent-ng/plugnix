import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTabs } from '@/framework/contexts/TabContext';
import { Button } from '@/framework/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Badge } from '@/framework/components/ui/badge';
import { Input } from '@/framework/components/ui/input';
import { Plus, Search, Users, Crown, User, Shield } from 'lucide-react';
import Authorized from '@/framework/components/Authorized';
import { useGroup } from '@/framework/contexts/GroupContext';

const getRoleIcon = (role) => {
  if (role === 'Owner') return <Crown className="h-4 w-4" />;
  if (role === 'Admin') return <Shield className="h-4 w-4" />;
  return <User className="h-4 w-4" />;
};

export default function GroupListPage() {
  const { t } = useTranslation('group-management');
  const navigate = useNavigate();
  const { openTab } = useTabs();
  const { userGroups, loading } = useGroup();
  const [searchTerm, setSearchTerm] = useState('');

  // 过滤用户组
  const filteredGroups = userGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* 页面标题和操作栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('groupList.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('groupList.subtitle')}
          </p>
        </div>

        <Authorized permissions="">
          <Button onClick={() => {
            const path = '/admin/groups/new';
            openTab({ path, label: t('groupList.createGroup') });
          }}>
            <Plus className="h-4 w-4 mr-2" />
            {t('groupList.createGroup')}
          </Button>
        </Authorized>
      </div>

      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('common.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 用户组列表 */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card
              key={group.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                const path = `/admin/groups/${group.id}`;
                openTab({ path, label: group.name });
                navigate(path);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                  <Badge variant={group.role === 'Owner' ? 'default' : 'secondary'} className="flex items-center gap-1">
                    {getRoleIcon(group.role)}
                    {t(`roles.names.${group.role}`, { defaultValue: group.role })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {group.description || t('groupList.noDescription')}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {t('groupList.memberCount', { count: group.member_count })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t('groupList.noSearchResults')}
            </h3>
            <p className="text-muted-foreground text-sm">{t('groupList.noSearchResultsHint')}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}