import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/framework/components/ui/button';
import { Input } from '@/framework/components/ui/input';
import { Textarea } from '@/framework/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/framework/components/ui/card';
import { Switch } from '@/framework/components/ui/switch';
import {
  Save,
  AlertTriangle,
  Trash2,
  Users,
  Settings
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/framework/components/ui/dialog';
import Authorized from '@/framework/components/Authorized';
import { supabase } from '@/framework/lib/supabase';
import { useGroup } from '@/framework/contexts/GroupContext';
import { useTabs } from '@/framework/contexts/TabContext';
import { toast } from 'sonner';

export default function SettingsTab({ group, onGroupUpdate }) {
  const { t } = useTranslation('group-management');
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUserGroups, hasAnyPermission } = useGroup();
  const { closeTab } = useTabs();
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    is_public: group?.is_public || false,
    allow_member_invite: group?.allow_member_invite || false,
    require_approval: group?.require_approval || true
  });
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('groups')
        .update(formData)
        .eq('id', group.id);

      if (updateError) {
        throw updateError;
      }

      onGroupUpdate(prev => ({
        ...prev,
        ...formData,
        updated_at: new Date().toISOString()
      }));

      toast.success(t('settings.success.save'));

    } catch (error) {
      toast.error(t('settings.errors.updateFailed'), {
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (confirmText !== group.name) {
      return;
    }

    try {
      const { error: deleteError } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id);

      if (deleteError) {
        throw deleteError;
      }

      toast.success(t('settings.success.delete'));

      // 重定向到列表页面
      closeTab(location.pathname);
      await refreshUserGroups();
      navigate('/admin/groups');

    } catch (err) {
      toast.error(t('settings.errors.deleteFailed'), {
        description: err.message
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const canEditSettings = hasAnyPermission(['db.groups.update']);
  const hasChanges = JSON.stringify(formData) !== JSON.stringify({
    name: group?.name || '',
    description: group?.description || '',
    is_public: group?.is_public || false,
    allow_member_invite: group?.allow_member_invite || false,
    require_approval: group?.require_approval || true
  });

  return (
    <div className="space-y-6">
      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('settings.basicInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('settings.name')}
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('settings.groupNamePlaceholder')}
              disabled={!canEditSettings}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              {t('settings.description')}
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('settings.descriptionPlaceholder')}
              rows={3}
              disabled={!canEditSettings}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{t('settings.publicGroup')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('settings.publicGroupDescription')}
                </div>
              </div>
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked) => handleInputChange('is_public', checked)}
                disabled={!canEditSettings}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{t('settings.memberInvite')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('settings.memberInviteDescription')}
                </div>
              </div>
              <Switch
                checked={formData.allow_member_invite}
                onCheckedChange={(checked) => handleInputChange('allow_member_invite', checked)}
                disabled={!canEditSettings}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium">{t('settings.requireApproval')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('settings.requireApprovalDescription')}
                </div>
              </div>
              <Switch
                checked={formData.require_approval}
                onCheckedChange={(checked) => handleInputChange('require_approval', checked)}
                disabled={!canEditSettings}
              />
            </div>
          </div>

          {canEditSettings && (
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 组信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('settings.groupInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {t('settings.groupId')}
              </div>
              <div className="font-mono text-sm">{group?.id}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {t('settings.memberCount')}
              </div>
              <div>{group?.member_count || 0} {t('settings.members')}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {t('settings.createdAt')}
              </div>
              <div>{new Date(group?.created_at).toLocaleString()}</div>
            </div>

            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                {t('settings.lastUpdated')}
              </div>
              <div>{new Date(group?.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 危险操作 */}
      <Authorized permissions="db.groups.delete">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t('settings.dangerZone')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t('settings.deleteGroup')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('settings.deleteGroupDescription')}
                </div>
              </div>

              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('settings.deleteGroup')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      {t('settings.confirmDelete')}
                    </DialogTitle>
                    <DialogDescription>
                      {t('settings.deleteWarning')}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="p-4 bg-destructive/10 rounded-lg">
                      <div className="text-sm font-medium text-destructive mb-2">
                        {t('settings.deleteConsequences')}
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {t('settings.consequence1')}</li>
                        <li>• {t('settings.consequence2')}</li>
                        <li>• {t('settings.consequence3')}</li>
                      </ul>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t('settings.confirmText', { groupName: group?.name })}
                      </label>
                      <Input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder={group?.name}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setDeleteDialogOpen(false);
                      setConfirmText('');
                    }}>
                      {t('common.cancel')}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteGroup}
                      disabled={confirmText !== group?.name}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('settings.deleteGroup')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </Authorized>
    </div>
  );
}