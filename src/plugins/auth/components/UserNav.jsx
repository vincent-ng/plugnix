import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '@/framework/contexts/AuthenticationContext.jsx';
import { registryApi } from '@/framework/api';
import { Button } from '@components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { RecursiveDropdownMenuItem } from '@/framework/components/RecursiveDropdownMenuItem.jsx';
import { Loader2 } from 'lucide-react';

export const UserNav = () => {
  const { t } = useTranslation('auth');
  const { user, loading } = useAuthentication();
  const navigate = useNavigate();

  const userMenuItems = registryApi.getUserMenuItems();

  const handleLoginClick = () => navigate('/login');

  // 显示加载状态
  if (loading) {
    return (
      <Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!user) {
    return <Button onClick={handleLoginClick}>{t('common.signIn')}</Button>;
  }

  const Trigger = React.forwardRef((props, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        className="relative h-8 w-8 rounded-full"
        {...props}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar_url} alt={user.email} />
          <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Button>
    );
  });

  Trigger.displayName = 'UserNavTrigger';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Trigger />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email.split('@')[0]}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Dynamically registered user menu items */}
        {userMenuItems.map((item) => (
          <RecursiveDropdownMenuItem key={item.key || item.label} item={item} />
        ))}

      </DropdownMenuContent>
    </DropdownMenu>
  );
};