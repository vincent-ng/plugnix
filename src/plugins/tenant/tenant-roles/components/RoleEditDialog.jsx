import { useEffect, useState } from 'react';
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
  const { t } = useTranslation('tenant-roles');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const isEdit = !!role;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        permissions: role.permissions || []
      });
    } else {
      setFormData({ name: '', description: '', permissions: [] });
    }
  }, [role]);

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setLoading(true);
      try {
        // 统一加载所有可用权限
        const allPerms = await getAvailablePermissions();
        setAvailablePermissions(allPerms || []);

        let assignedIds = [];
        // 在查看或编辑模式下，加载角色已分配的权限
        if ((mode === 'view' || isEdit) && role?.id) {
          assignedIds = await getRolePermissions(role.id);
        }
        // 统一使用 formData.permissions 存储已分配/已选择的权限ID
        setFormData(prev => ({ ...prev, permissions: assignedIds || [] }));
      } catch (error) {
        toast.error(t('messages.error'), { description: error.message });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [open, role, isEdit, mode, t]);

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

  const filteredPermissions = availablePermissions.filter(p => {
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
            {mode === 'view' ? (role ? (role.name) : '') : t('page.description')}
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
  const { t } = useTranslation('tenant-roles');

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
            const isInteractive = mode !== 'view';

            let variant = 'secondary';
            if (isSelected) {
              variant = 'default';
            }

            return (
              <Badge
                key={p.id}
                variant={variant}
                title={t(p.description)}
                className={isInteractive ? 'cursor-pointer' : 'cursor-default'}
                onClick={isInteractive ? () => onToggle(p.id) : undefined}
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