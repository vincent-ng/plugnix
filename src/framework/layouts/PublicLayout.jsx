import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeToggleButton } from '@/framework/contexts/ThemeContext.jsx';
import { registryApi } from '@/framework/api';
import { Authorized } from '@/framework/components/Authorized';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Separator } from '@components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/framework/components/ui/sheet';
import { RecursiveAccordionMenu } from '@/framework/components/RecursiveAccordionMenu';
import { RecursiveNavigationMenu } from '@/framework/components/RecursiveNavigationMenu';
import {
  NavigationMenu,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@components/ui/navigation-menu';
import SocialLinks from '../components/SocialLinks.jsx';
import { LanguageSwitcher } from '@/framework/components/LanguageSwitcher.jsx';
import {
  Menu,
} from 'lucide-react';
import { DefaultLogo } from '@/framework/components/Logo.jsx';

const NavbarItemsRenderer = ({ items }) => {
  return items.map((item) => {
    const Comp = item.component;
    return (
      <Authorized permissions={item.permissions} key={item.key}>
        <Comp />
      </Authorized>
    );
  });
};

const PublicLayout = ({ children }) => {
  const menuItems = registryApi.getPublicMenuItems();

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <DesktopNav menuItems={menuItems} />
      <main className="flex-1 relative">
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
};


function DesktopNav({ menuItems }) {
  const location = useLocation();
  const navbarItems = registryApi.getPublicNavbarItems();

  const isActiveRoute = (path) => location.pathname === path;
  const getNavLinkClassName = (isActive) =>
    `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent text-accent-foreground' : ''}`;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="mx-auto">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          <DefaultLogo layout="public" />

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <RecursiveNavigationMenu
                menuItems={menuItems}
                getNavLinkClassName={getNavLinkClassName}
                isActiveRoute={isActiveRoute}
              />
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-3">
            <SocialLinks className="hidden sm:flex" />
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <LanguageSwitcher />
            <ThemeToggleButton className="w-8 h-8" />
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <NavbarItemsRenderer items={navbarItems} />
            <MobileNav menuItems={menuItems} />
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileNav({ menuItems }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common');
  const location = useLocation();

  const isActiveRoute = (path) => location.pathname === path;

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const getMobileNavLinkClassName = (isActive) =>
    `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent hover:text-accent-foreground'
    }`;

  const renderMobileMenuItem = (item) => (
    <Link
      to={item.path}
      onClick={handleLinkClick}
      className={getMobileNavLinkClassName(isActiveRoute(item.path))}
    >
      <span>{t(item.label)}</span>
      {isActiveRoute(item.path) && <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>}
    </Link>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <div className="flex flex-col h-full">
          <div className="pb-6 border-b border-border">
            <DefaultLogo layout="public" />
          </div>
          <nav className="flex-1 py-6">
            <RecursiveAccordionMenu menuItems={menuItems} renderItem={renderMobileMenuItem} />
          </nav>
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-foreground">{t('socialLinks')}</span>
              <SocialLinks />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default PublicLayout;