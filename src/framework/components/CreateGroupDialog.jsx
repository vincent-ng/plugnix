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
import { createGroup } from '@/framework/api/groups';
import { toast } from 'sonner';

export const CreateGroupDialog = ({ isOpen, onClose, onGroupCreated }) => {
  const { t } = useTranslation(['group']);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createGroup(groupName, groupDescription);
      toast.success(t('group:groupCreatedSuccessfully'));
      onGroupCreated();
      onClose();
    } catch (error) {
      toast.error(t('group:errorCreatingGroup'), {
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
            <DialogTitle>{t('group:createGroup')}</DialogTitle>
            <DialogDescription>
              {t('group:createGroupDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('group:groupName')}
              </Label>
              <Input
                id="name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t('group:groupDescription')}
              </Label>
              <Input
                id="description"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('group:cancel')}
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? t('group:creating') : t('group:create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};