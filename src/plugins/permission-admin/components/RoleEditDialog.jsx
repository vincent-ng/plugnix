import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/framework/components/ui/dialog';
import { Button } from '@/framework/components/ui/button';
import { Input } from '@/framework/components/ui/input';
import { Label } from '@/framework/components/ui/label';
import { Textarea } from '@/framework/components/ui/textarea';
import { Checkbox } from '@/framework/components/ui/checkbox';
import { Badge } from '@/framework/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Search } from 'lucide-react';

const RoleEditDialog = ({ open, onOpenChange, role, onSave }) => {
  const { t } = useTranslation('permission-admin');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [availablePermissions, setAvailablePermissions] = useState([]);

  // 模拟权限数据
  useEffect(() => {
    // TODO: 替换为实际的API调用
    const mockPermissions = [
      { name: 'db.posts.create', description: t('mockData.permissions.db.posts.create') },
      { name: 'db.posts.read', description: t('mockData.permissions.db.posts.read') },
      { name: 'db.posts.update', description: t('mockData.permissions.db.posts.update') },
      { name: 'db.posts.delete', description: t('mockData.permissions.db.posts.delete') },
      { name: 'db.users.create', description: t('mockData.permissions.db.users.create') },
      { name: 'db.users.read', description: t('mockData.permissions.db.users.read') },
      { name: 'db.users.update', description: t('mockData.permissions.db.users.update') },
      { name: 'db.users.delete', description: t('mockData.permissions.db.users.delete') },
      { name: 'ui.admin.access', description: t('mockData.permissions.ui.admin.access') },
      { name: 'ui.dashboard.view', description: t('mockData.permissions.ui.dashboard.view') },
      { name: 'ui.settings.manage', description: t('mockData.permissions.ui.settings.manage') },
      { name: 'ui.permission.manage', description: t('mockData.permissions.ui.permission.manage') }
    ];
    setAvailablePermissions(mockPermissions);
  }, [t]);

  // 当角色数据变化时更新表单
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: []
      });
    }
    setSearchTerm('');
  }, [role, open]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permissionName) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionName)
        ? prev.permissions.filter(p => p !== permissionName)
        : [...prev.permissions, permissionName]
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert(t('roles.dialog.nameRequired'));
      return;
    }

    onSave(formData);
  };

  const filteredPermissions = availablePermissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = formData.permissions.length;
  const totalCount = availablePermissions.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {role ? t('roles.dialog.editTitle') : t('roles.dialog.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {role ? t('roles.dialog.editDescription') : t('roles.dialog.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('roles.dialog.nameLabel')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={t('roles.dialog.namePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('roles.dialog.descriptionLabel')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('roles.dialog.descriptionPlaceholder')}
                rows={3}
              />
            </div>
          </div>

          {/* 权限选择 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                {t('roles.dialog.permissionsLabel')}
                <Badge variant="secondary">
                  {selectedCount}/{totalCount}
                </Badge>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('roles.dialog.searchPermissions')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-64 overflow-auto">
              <div className="space-y-3">
                {filteredPermissions.map((permission) => (
                  <div key={permission.name} className="flex items-start space-x-3">
                    <Checkbox
                      id={permission.name}
                      checked={formData.permissions.includes(permission.name)}
                      onCheckedChange={() => handlePermissionToggle(permission.name)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={permission.name}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.name}
                      </Label>
                      {permission.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {permission.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {filteredPermissions.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    {t('roles.dialog.noPermissionsFound')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('roles.dialog.cancelButton')}
          </Button>
          <Button onClick={handleSave}>
            {t('roles.dialog.saveButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleEditDialog;