import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '@/framework/contexts/AuthenticationContext.jsx';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@components/ui/dropdown-menu';
import IconRenderer from '@/framework/components/IconRenderer.jsx';

// 用户菜单中的“退出登录”项：直接使用上下文调用 logout
export default function SignOutMenuItem({ item }) {
  const { t } = useTranslation('common');
  const { logout } = useAuthentication();

  const renderSeparator = (position) => {
    if (item.separator === position || item.separator === 'both') {
      return <DropdownMenuSeparator />;
    }
    return null;
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <>
      {renderSeparator('front')}
      <DropdownMenuItem onClick={handleLogout} className={item.className}>
        <IconRenderer icon={item.icon} />
        <span>{t(item.label)}</span>
      </DropdownMenuItem>
      {renderSeparator('end')}
    </>
  );
}