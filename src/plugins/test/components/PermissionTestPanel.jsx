import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGroup } from '@/framework/contexts/GroupContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Badge } from '@/framework/components/ui/badge';
import { Button } from '@/framework/components/ui/button';
import { Input } from '@/framework/components/ui/input';
import { Alert, AlertDescription } from '@/framework/components/ui/alert';
import { Authorized } from '@/framework/components/Authorized';
import { Shield, Info, CheckCircle, XCircle, Search } from 'lucide-react';

export default function PermissionTestPanel() {
  const { t } = useTranslation('test');
  const {
    hasPermission,
    userPermissions,
    currentGroup,
    userRole
  } = useGroup();

  const [permissionToCheck, setPermissionToCheck] = useState('ui.test.show-special-feature');
  const [checkResult, setCheckResult] = useState(null);

  const handleCheckPermission = () => {
    if (permissionToCheck.trim()) {
      const result = hasPermission(permissionToCheck.trim());
      setCheckResult(result);
    } else {
      setCheckResult(null);
    }
  };

  const getPermissionStatusInfo = (hasAccess) => {
    if (hasAccess === null) return null;
    return hasAccess
      ? {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          text: '有权限',
          className: 'text-green-600'
        }
      : {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          text: '无权限',
          className: 'text-red-600'
        };
  };

  const statusInfo = getPermissionStatusInfo(checkResult);

  return (
    <div className="space-y-6">
      {/* 1. 权限调试信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            权限调试信息
          </CardTitle>
          <CardDescription>
            当前用户的实时权限和组织信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium mb-2">当前身份</h5>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">当前组织:</span> {currentGroup?.name || '未加入任何组织'}</p>
                <p><span className="font-medium">组织内角色:</span> {userRole || '无角色'}</p>
              </div>
            </div>
            <div>
              <h5 className="font-medium mb-2">权限统计</h5>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">权限总数:</span> {userPermissions?.length || 0}</p>
                <p><span className="font-medium">UI权限:</span> {userPermissions?.filter(p => p.startsWith('ui.')).length || 0}</p>
                <p><span className="font-medium">数据库权限:</span> {userPermissions?.filter(p => p.startsWith('db.')).length || 0}</p>
              </div>
            </div>
          </div>

          {userPermissions && userPermissions.length > 0 ? (
            <div>
              <h5 className="font-medium mb-2">持有权限列表</h5>
              <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto p-2 border rounded-md">
                {userPermissions.map((permission, index) => (
                  <Badge
                    key={index}
                    variant={permission.startsWith('ui.') ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
             <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  当前用户在选定组织下没有任何权限。
                </AlertDescription>
              </Alert>
          )}
        </CardContent>
      </Card>

      {/* 2. 交互式权限检查器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            交互式权限检查器
          </CardTitle>
          <CardDescription>
            输入任意权限名称，测试当前用户是否拥有该权限。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center">
            <Input
              placeholder="输入权限名称，例如: db.posts.create"
              value={permissionToCheck}
              onChange={(e) => {
                setPermissionToCheck(e.target.value);
                setCheckResult(null); // Reset result on input change
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleCheckPermission()}
            />
            <Button onClick={handleCheckPermission}>
              <Search className="w-4 h-4 mr-2" />
              检查
            </Button>
          </div>

          {statusInfo && (
            <div className="p-4 rounded-lg border bg-muted">
              <div className="flex items-center gap-3">
                {statusInfo.icon}
                <div className='flex flex-col'>
                  <span className="font-semibold">检查结果:</span>
                  <span className={statusInfo.className}>{statusInfo.text}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* 3. Authorized 组件使用演示 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <code>{`<Authorized />`}</code> 组件演示
          </CardTitle>
          <CardDescription>
            使用上面输入的权限，动态展示或隐藏UI元素。
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm font-medium mb-2">
              测试权限: <Badge variant="outline">{permissionToCheck || '无'}</Badge>
            </p>
            <div className="p-4 border-2 border-dashed rounded-lg">
              <Authorized
                permissions={permissionToCheck.trim()}
                fallback={
                  <div className="text-center text-red-500">
                    <XCircle className="mx-auto h-8 w-8 mb-2" />
                    <p className="font-bold">无权限访问</p>
                    <p className="text-sm text-muted-foreground">这部分内容因为你缺少 <strong>{permissionToCheck}</strong> 权限而被隐藏。</p>
                  </div>
                }
              >
                <div className="text-center text-green-600">
                  <CheckCircle className="mx-auto h-8 w-8 mb-2" />
                  <p className="font-bold">✓ 内容可见</p>
                  <p className="text-sm text-muted-foreground">因为你拥有 <strong>{permissionToCheck}</strong> 权限，所以能看到这部分内容。</p>
                </div>
              </Authorized>
            </div>
        </CardContent>
      </Card>

      {/* 4. 权限使用指南 */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>权限系统说明:</strong>
          本框架使用基于角色的权限控制(RBAC)，权限分为UI权限(ui.*)和数据库权限(db.*)。
          使用 <code>{`<Authorized />`}</code> 组件可以轻松实现UI元素的权限控制。
          对于更复杂的逻辑，可以使用 <code>hasPermission</code>, <code>hasAnyPermission</code>, <code>hasAllPermissions</code> 这三个hook。
        </AlertDescription>
      </Alert>
    </div>
  );
}