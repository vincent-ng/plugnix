import React, { useEffect, useState } from 'react';
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
import { Badge } from '@/framework/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/framework/components/ui/accordion';
import { Search, Shield, Database } from 'lucide-react';
import { getAvailablePermissions, getRolePermissions } from '../services/rolesService';
import { toast } from 'sonner';

export default function RoleEditDialog({ open, onOpenChange, role = null, onSave, mode = 'edit' }) {
  const { t } = useTranslation('group-roles');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [assignedPermissions, setAssignedPermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const isEdit = !!role;

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        display_name: role.display_name || '',
        description: role.description || '',
        permissions: role.permissions || []
      });
    } else {
      setFormData({ name: '', display_name: '', description: '', permissions: [] });
    }
  }, [role]);

  useEffect(() => {
    if (!open) return;
    if (mode === 'view' && role?.id) {
      loadAssignedPermissions(role.id);
    } else {
      loadAvailablePermissions();
    }
  }, [open, mode, role]);

  const loadAvailablePermissions = async () => {
    setLoading(true);
    try {
      const perms = await getAvailablePermissions();
      setAvailablePermissions(perms);
    } catch (error) {
      toast.error(t('messages.error'), { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedPermissions = async (roleId) => {
    setLoading(true);
    try {
      // 后端返回的是权限 ID 列表，这里将其映射到权限详情，便于在查看模式展示名称与分组
      const assignedIds = await getRolePermissions(roleId);
      const allPerms = await getAvailablePermissions();
      const assignedObjs = (allPerms || []).filter(p => assignedIds?.includes?.(p.id));
      setAssignedPermissions(assignedObjs);
    } catch (error) {
      toast.error(t('messages.error'), { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePermission = (permissionId) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permissionId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter(id => id !== permissionId)
          : [...prev.permissions, permissionId]
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        name: formData.name,
        display_name: formData.display_name,
        description: formData.description,
        permissions: formData.permissions,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(t('messages.error'), { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  const sourceList = mode === 'view' ? assignedPermissions : availablePermissions;
  const filteredPermissions = sourceList.filter(p => {
    const name = (p?.name || '').toLowerCase();
    const desc = (p?.description || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || desc.includes(term);
  });

  const grouped = filteredPermissions.reduce((acc, p) => {
    const name = p?.name || '';
    const type = name.startsWith('db.') ? 'db' : name.startsWith('ui.') ? 'ui' : 'other';
    (acc[type] || (acc[type] = [])).push(p);
    return acc;
  }, {});

  const hasUI = (grouped.ui || []).length > 0;
  const hasDB = (grouped.db || []).length > 0;
  const hasOther = (grouped.other || []).length > 0;
  const defaultOpen = [hasDB && 'db', hasOther && 'other', hasUI && 'ui'].filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'view' ? t('actions.viewPermissions') : (isEdit ? t('dialog.edit.title') : t('dialog.create.title'))}
          </DialogTitle>
          <DialogDescription>
            {mode === 'view' ? (role ? (role.display_name || role.name) : '') : t('page.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
          {mode !== 'view' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">{t('dialog.create.name')}</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" placeholder={t('dialog.create.namePlaceholder')} />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="display_name" className="text-right">Display Name</Label>
                <Input id="display_name" name="display_name" value={formData.display_name} onChange={handleInputChange} className="col-span-3" />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">{t('dialog.create.description')}</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className="col-span-3" placeholder={t('dialog.create.descPlaceholder')} />
              </div>
            </>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle>{t('dialog.permissions.title')}</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('dialog.permissions.search')} className="h-8 w-64" />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-muted-foreground">{t('messages.loading')}</div>
              ) : (
                <Accordion type="multiple" defaultValue={defaultOpen} className="w-full">
                  {hasDB && (
                    <PermissionSection
                      value="db"
                      icon={Database}
                      title={t('dialog.permissions.db')}
                      items={grouped.db || []}
                      mode={mode}
                      selectedIds={formData.permissions}
                      onToggle={togglePermission}
                    />
                  )}
                  {hasUI && (
                    <PermissionSection
                      value="ui"
                      icon={Shield}
                      title={t('dialog.permissions.ui')}
                      items={grouped.ui || []}
                      mode={mode}
                      selectedIds={formData.permissions}
                      onToggle={togglePermission}
                    />
                  )}
                  {hasOther && (
                    <PermissionSection
                      value="other"
                      icon={Shield}
                      title={'其他权限'}
                      items={grouped.other || []}
                      mode={mode}
                      selectedIds={formData.permissions}
                      onToggle={togglePermission}
                    />
                  )}
                </Accordion>
              )}
              {(!hasUI && !hasDB && !hasOther) && (
                <div className="text-sm text-muted-foreground mt-2">{t('dialog.permissions.noPermissions')}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>{t('actions.cancel')}</Button>
          {mode !== 'view' && (
            <Button onClick={handleSave} disabled={saving}>{t('actions.save')}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// 折叠分组的通用渲染组件，减少重复代码
function PermissionSection({ value, icon: Icon, title, items = [], mode, selectedIds = [], onToggle }) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4" /> {title}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-wrap gap-2">
          {items.map(p => {
            const isSelected = selectedIds.includes(p.id);
            const variant = mode === 'view'
              ? (value === 'ui' ? 'outline' : 'secondary')
              : (isSelected ? 'default' : 'secondary');
            return (
              <Badge
                key={p.id}
                variant={variant}
                title={p.description}
                className={mode === 'view' ? '' : 'cursor-pointer'}
                onClick={mode === 'view' ? undefined : () => onToggle(p.id)}
              >
                {p.name}
              </Badge>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}