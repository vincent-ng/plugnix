import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/framework/components/ui/tabs';
import RoleManagementTab from '../components/RoleManagementTab';
import PermissionManagementTab from '../components/PermissionManagementTab';
import UserRoleAssignmentTab from '../components/UserRoleAssignmentTab';

const PermissionAdminPage = () => {
  const { t } = useTranslation('permissionAdmin');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('pageTitle')}</h1>
        <p className="text-muted-foreground">
          管理系统角色、权限和用户授权
        </p>
      </div>

      {/* 标签页组件 */}
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">{t('tabs.roles')}</TabsTrigger>
          <TabsTrigger value="permissions">{t('tabs.permissions')}</TabsTrigger>
          <TabsTrigger value="userRoles">{t('tabs.userRoles')}</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <RoleManagementTab />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionManagementTab />
        </TabsContent>

        <TabsContent value="userRoles" className="space-y-4">
            <UserRoleAssignmentTab />
          </TabsContent>
      </Tabs>
    </div>
  );
};

export default PermissionAdminPage;