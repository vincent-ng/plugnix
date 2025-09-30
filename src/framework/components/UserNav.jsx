import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '@/framework/contexts/AuthenticationContext.jsx';
import { useGroup } from '@/framework/contexts/GroupContext.jsx';
import { registry } from '@/framework/api';
import { Button } from '@components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  ChevronDown,
} from 'lucide-react';

export const UserNav = ({ triggerStyle = 'avatar' }) => {
  const { t } = useTranslation('common');
  const { user, logout } = useAuthentication();
  const { hasPermission } = useGroup();
  const navigate = useNavigate();

  const userMenuItems = registry.getUserMenuItems();
  const canAccessDashboard = hasPermission('system.rpc.invoke');

  const handleDashboardClick = () => navigate('/admin');
  const handleAccountClick = () => navigate('/account');
  const handleLoginClick = () => navigate('/login');

  if (!user) {
    return <Button onClick={handleLoginClick}>{t('auth:signIn', '登录')}</Button>;
  }

  const Trigger = React.forwardRef((props, ref) => {
    if (triggerStyle === 'sidebar') {
      return (
        <Button
          ref={ref}
          variant="ghost"
          className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 w-full justify-start"
          {...props}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
              {user?.email || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      );
    }

    // Default trigger style is 'avatar'
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
            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Common Menu Items */}
        {canAccessDashboard && (
          <DropdownMenuItem onClick={handleDashboardClick}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>{t('goToConsole', '进入控制台')}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleAccountClick}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>{t('myAccount', '我的账户')}</span>
        </DropdownMenuItem>

        {/* Dynamically registered user menu items */}
        {userMenuItems.length > 0 && <DropdownMenuSeparator />}
        {userMenuItems.map((item, index) => (
          <DropdownMenuItem
            key={item.key || index}
            onClick={() => {
              if (item.onClick) item.onClick();
              else if (item.path) navigate(item.path);
            }}
            className={item.className}
          >
            {item.icon && <item.icon className="w-4 h-4 mr-2" />}
            {t(item.label)}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('auth:signOut', '退出登录')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};