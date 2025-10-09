import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGroup } from '@/framework/contexts/GroupContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/framework/components/ui/dropdown-menu';
import { Button } from '@/framework/components/ui/button';
import { Badge } from '@/framework/components/ui/badge';
import { ChevronDown, Building2, User, PlusCircle } from 'lucide-react';
import { CreateGroupDialog } from './CreateGroupDialog';

export const GroupSwitcher = ({ className }) => {
  const { t } = useTranslation(['group', 'role']);
  const { currentGroup, userGroups, setCurrentGroup, userRole, refreshUserGroups } = useGroup();
  const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);

  const handleGroupSelect = (group) => {
    setCurrentGroup(group);
  };

  const handleGroupCreated = () => {
    refreshUserGroups();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={`w-[200px] justify-between ${className}`}>
            <div className="flex items-center gap-2">
              {currentGroup ? (
                <>
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{currentGroup.name}</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  <span>{t('group:personalWorkspace')}</span>
                </>
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]" align="start">
          <DropdownMenuLabel>{t('group:selectGroup')}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {userGroups.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              {t('group:noGroupsFound')}
            </div>
          ) : (
            userGroups.map((group) => (
              <DropdownMenuItem
                key={group.id}
                onClick={() => handleGroupSelect(group)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{group.name}</span>
                </div>
                {group.id === currentGroup?.id && (
                  <Badge variant="secondary" className="text-xs">
                    {t(`group:${userRole?.toLowerCase()}`)}
                  </Badge>
                )}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setCreateGroupOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>{t('group:createNewGroup')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateGroupDialog
        isOpen={isCreateGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </>
  );
};

export default GroupSwitcher;