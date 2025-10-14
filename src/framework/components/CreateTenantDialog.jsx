import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/framework/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/framework/components/ui/dialog';
import { Input } from '@/framework/components/ui/input';
import { Label } from '@/framework/components/ui/label';
import { createTenant } from '@/framework/api/tenants';
import { toast } from 'sonner';

export const CreateTenantDialog = ({ isOpen, onClose, onTenantCreated }) => {
  const { t } = useTranslation();
  const [tenantName, setTenantName] = useState('');
  const [tenantDescription, setTenantDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createTenant(tenantName, tenantDescription);
      toast.success(t('tenant:tenantCreatedSuccessfully'));
      onTenantCreated();
      onClose();
    } catch (error) {
      toast.error(t('tenant:errorCreatingTenant'), {
        description: error.message,
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('tenant:createTenant')}</DialogTitle>
            <DialogDescription>
              {t('tenant:createTenantDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('tenant:tenantName')}
              </Label>
              <Input
                id="name"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t('tenant:tenantDescription')}
              </Label>
              <Input
                id="description"
                value={tenantDescription}
                onChange={(e) => setTenantDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common:cancel')}
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? t('tenant:creating') : t('common:create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};