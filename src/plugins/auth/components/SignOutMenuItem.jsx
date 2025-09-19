import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { useAuthentication } from '@/framework/contexts/AuthenticationContext';
import { DropdownMenuItem } from '@/framework/components/ui/dropdown-menu';

/**
 * 登出菜单项组件
 * 这个组件封装了登出逻辑，避免在框架层面硬编码
 */
const SignOutMenuItem = () => {
  const { signOut } = useAuthentication();
  const navigate = useNavigate();
  const { t } = useTranslation('auth');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <DropdownMenuItem 
      onClick={handleSignOut}
      className="text-destructive"
    >
      <LogOut className="w-4 h-4 mr-2" />
      {t('common.signOut')}
    </DropdownMenuItem>
  );
};

export default SignOutMenuItem;