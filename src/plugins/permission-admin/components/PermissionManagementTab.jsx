import React, { useState, useEffect } from 'react';
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
import { RefreshCw, Search, Database, Layers } from 'lucide-react';
import { permissionAdminAPI } from '../services/api';

const PermissionManagementTab = () => {
  const { t } = useTranslation('permission-admin');
  const [permissions, setPermissions] = useState([]);
  const [filteredPermissions, setFilteredPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // 加载权限数据
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const permissionsData = await permissionAdminAPI.getPermissions();
      setPermissions(permissionsData);
      setFilteredPermissions(permissionsData);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      // 如果API调用失败，使用mock数据作为fallback
      const mockPermissions = [
        {
          id: 1,
          name: 'db.posts.create',
          description: t('mockData.permissions.db.posts.create'),
          source: 'database',
          created_at: '2024-01-15'
        },
        {
          id: 2,
          name: 'db.posts.read',
          description: t('mockData.permissions.db.posts.read'),
          source: 'database',
          created_at: '2024-01-15'
        },
        {
          id: 3,
          name: 'db.posts.update',
          description: t('mockData.permissions.db.posts.update'),
          source: 'database',
          created_at: '2024-01-15'
        },
        {
          id: 4,
          name: 'db.posts.delete',
          description: t('mockData.permissions.db.posts.delete'),
          source: 'database',
          created_at: '2024-01-15'
        },
        {
          id: 5,
          name: 'db.users.create',
          description: t('mockData.permissions.db.users.create'),
          source: 'database',
          created_at: '2024-01-15'
        },
        {
          id: 6,
          name: 'db.users.read',
          description: t('mockData.permissions.db.users.read'),
          source: 'database',
          created_at: '2024-01-15'
        },
        {
          id: 7,
          name: 'db.users.update',
          description: t('mockData.permissions.db.users.update'),
          source: 'database',
          created_at: '2024-01-15'
        },
        {
          id: 8,
          name: 'db.users.delete',
          description: t('mockData.permissions.db.users.delete'),
          source: 'database',
          created_at: '2024-01-15'
        },
        {
          id: 9,
          name: 'ui.admin.access',
          description: t('mockData.permissions.ui.admin.access'),
          source: 'ui',
          created_at: '2024-01-15'
        },
        {
          id: 10,
          name: 'ui.dashboard.view',
          description: t('mockData.permissions.ui.dashboard.view'),
          source: 'ui',
          created_at: '2024-01-15'
        },
        {
          id: 11,
          name: 'ui.settings.manage',
          description: t('mockData.permissions.ui.settings.manage'),
          source: 'ui',
          created_at: '2024-01-15'
        },
        {
          id: 12,
          name: 'ui.permission.manage',
          description: t('mockData.permissions.ui.permission.manage'),
          source: 'ui',
          created_at: '2024-01-15'
        }
      ];
      setPermissions(mockPermissions);
      setFilteredPermissions(mockPermissions);
    } finally {
      setLoading(false);
    }
  };

  // 搜索过滤
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPermissions(permissions);
    } else {
      const filtered = permissions.filter(permission =>
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPermissions(filtered);
    }
  }, [searchTerm, permissions]);

  const handleSyncPermissions = async () => {
    setSyncing(true);
    try {
      // TODO: 实现权限同步功能
      await permissionAdminAPI.syncPermissions();
      await loadPermissions(); // 重新加载数据
    } catch (error) {
      console.error('Failed to sync permissions:', error);
      alert(t('permissions.syncError'));
    } finally {
      setSyncing(false);
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case 'declared':
        return (
          <Badge variant="default" className="gap-1">
            <Code className="w-3 h-3" />
            {t('permissions.source.declared')}
          </Badge>
        );
      case 'orphaned':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {t('permissions.source.orphaned')}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Database className="w-3 h-3" />
            {t('permissions.source.unknown')}
          </Badge>
        );
    }
  };

  const getPermissionTypeIcon = (name) => {
    if (name.startsWith('db.')) {
      return <Database className="w-4 h-4 text-blue-500" />;
    } else if (name.startsWith('ui.')) {
      return <Code className="w-4 h-4 text-green-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-orange-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  const declaredCount = permissions.filter(p => p.source === 'declared').length;
  const orphanedCount = permissions.filter(p => p.source === 'orphaned').length;

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">{t('permissions.stats.declared')}</p>
                <p className="text-2xl font-bold">{declaredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">{t('permissions.stats.orphaned')}</p>
                <p className="text-2xl font-bold">{orphanedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">{t('permissions.stats.total')}</p>
                <p className="text-2xl font-bold">{permissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 权限列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>{t('permissions.title')}</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t('permissions.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button 
              onClick={handleSyncPermissions} 
              disabled={syncing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? t('permissions.syncing') : t('permissions.syncButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {permissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">{t('permissions.table.type')}</TableHead>
                  <TableHead>{t('permissions.table.name')}</TableHead>
                  <TableHead>{t('permissions.table.description')}</TableHead>
                  <TableHead className="w-[150px]">{t('permissions.table.source')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      {getPermissionTypeIcon(permission.name)}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {permission.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {permission.description || '-'}
                    </TableCell>
                    <TableCell>
                      {getSourceBadge(permission.source)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionManagementTab;