import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '@/framework/contexts/TenantContext';
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
import { CreateTenantDialog } from './CreateTenantDialog';

export const TenantSwitcher = ({ className }) => {
  const { t } = useTranslation(['tenant', 'role']);
  const { currentTenant, userTenants, setCurrentTenant, userRole, refreshUserTenants } = useTenant();
  const [isCreateTenantOpen, setCreateTenantOpen] = useState(false);

  const handleTenantSelect = (tenant) => {
    setCurrentTenant(tenant);
  };

  const handleTenantCreated = () => {
    refreshUserTenants();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={`w-[200px] justify-between ${className}`}>
            <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
              {currentTenant ? (
                <>
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{currentTenant.name}</span>
                </>
              ) : (
                <>
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{t('tenant:personalWorkspace')}</span>
                </>
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]" align="start">
          <DropdownMenuLabel>{t('tenant:selectTenant')}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {userTenants.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              {t('tenant:noTenantsFound')}
            </div>
          ) : (
            userTenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onClick={() => handleTenantSelect(tenant)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{tenant.name}</span>
                </div>
                {tenant.id === currentTenant?.id && (
                  <Badge variant="secondary" className="text-xs">
                    {t(`tenant:${userRole?.toLowerCase()}`)}
                  </Badge>
                )}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setCreateTenantOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>{t('tenant:createNewTenant')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateTenantDialog
        isOpen={isCreateTenantOpen}
        onClose={() => setCreateTenantOpen(false)}
        onTenantCreated={handleTenantCreated}
      />
    </>
  );
};

export default TenantSwitcher;