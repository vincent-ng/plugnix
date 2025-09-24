import React, { useState, useEffect } from 'react';
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
import { Separator } from '@/framework/components/ui/separator';
import { ScrollArea } from '@/framework/components/ui/scroll-area';
import { Search, Shield, Database } from 'lucide-react';
import { getAvailablePermissions } from '../services/roleService';

export default function RoleEditDialog({ 
  open, 
  onOpenChange, 
  role = null, 
  onSave 
}) {
  const { t } = useTranslation('group-management');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: []
  });

  // 是否为编辑模式
  const isEdit = !!role;

  // 初始化表单数据
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        display_name: role.display_name || '',
        description: role.description || '',
        permissions: role.permissions?.map(p => p.id) || []
      });
    } else {
      setFormData({
        name: '',
        display_name: '',
        description: '',
        permissions: []
      });
    }
  }, [role]);

  // 加载可用权限
  useEffect(() => {
    if (open) {
      loadAvailablePermissions();
    }
  }, [open]);

  const loadAvailablePermissions = async () => {
    setLoading(true);
    try {
      const permissions = await getAvailablePermissions();
      setAvailablePermissions(permissions);
    } catch (error) {
      console.error('加载权限失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理表单输入
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理权限选择
  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // 处理保存
  const handleSave = async () => {
    if (!formData.display_name.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
      // 重置表单
      setFormData({
        name: '',
        display_name: '',
        description: '',
        permissions: []
      });
    } catch (error) {
      console.error('保存角色失败:', error);
    } finally {
      setSaving(false);
    }
  };

  // 过滤权限
  const filteredPermissions = availablePermissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 按类型分组权限
  const groupedPermissions = filteredPermissions.reduce((groups, permission) => {
    const type = permission.type || 'other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(permission);
    return groups;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('roles.editRole') : t('roles.createRole')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('roles.editDescription') : t('roles.createDescription')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">{t('roles.displayName')}</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder={t('roles.displayNamePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('roles.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('roles.descriptionPlaceholder')}
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* 权限设置 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  {t('roles.permissions')}
                </Label>
                <Badge variant="secondary">
                  {formData.permissions.length} {t('roles.permissionCount')}
                </Badge>
              </div>

              {/* 权限搜索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('roles.searchPermissions')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {loading ? (
                <div className="text-center py-4 text-muted-foreground">
                  {t('common.loading')}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* UI权限 */}
                  {groupedPermissions.ui && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <Label className="font-medium">{t('roles.uiPermissions')}</Label>
                      </div>
                      <div className="grid grid-cols-1 gap-2 pl-6">
                        {groupedPermissions.ui.map(permission => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <Label 
                              htmlFor={permission.id}
                              className="text-sm cursor-pointer flex-1"
                            >
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-muted-foreground text-xs">
                                {permission.description}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 数据库权限 */}
                  {groupedPermissions.db && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-green-500" />
                        <Label className="font-medium">{t('roles.dbPermissions')}</Label>
                      </div>
                      <div className="grid grid-cols-1 gap-2 pl-6">
                        {groupedPermissions.db.map(permission => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <Label 
                              htmlFor={permission.id}
                              className="text-sm cursor-pointer flex-1"
                            >
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-muted-foreground text-xs">
                                {permission.description}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 其他权限 */}
                  {groupedPermissions.other && (
                    <div className="space-y-3">
                      <Label className="font-medium">{t('common.other')}</Label>
                      <div className="grid grid-cols-1 gap-2 pl-6">
                        {groupedPermissions.other.map(permission => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                            />
                            <Label 
                              htmlFor={permission.id}
                              className="text-sm cursor-pointer flex-1"
                            >
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-muted-foreground text-xs">
                                {permission.description}
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredPermissions.length === 0 && !loading && (
                    <div className="text-center py-4 text-muted-foreground">
                      {t('roles.noPermissions')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.display_name.trim() || saving}
          >
            {saving ? t('roles.saving') : (isEdit ? t('roles.save') : t('roles.create'))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}