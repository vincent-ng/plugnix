import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/framework/contexts/ThemeContext.jsx';
import { useAuthentication } from "@/framework/contexts/AuthenticationContext.jsx";
import { registry } from '@/framework/api';
import { Authorized } from '@/framework/components/Authorized';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Card, CardContent } from '@components/ui/card';
import { Separator } from '@components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/framework/components/ui/sheet';
import { RecursiveAccordionMenu } from '@/framework/components/RecursiveAccordionMenu';
import { RecursiveNavigationMenu } from '@/framework/components/RecursiveNavigationMenu';
import {
  NavigationMenu,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@components/ui/navigation-menu';
import Logo from '../components/Logo.jsx';
import SocialLinks from '../components/SocialLinks.jsx';
import { UserNav } from '@/framework/components/UserNav.jsx';
import { LanguageSwitcher } from '@/framework/components/LanguageSwitcher.jsx';
import {
  Menu,
  Moon,
  Sun,
} from 'lucide-react';

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

const PublicLayout = () => {
  const menuItems = registry.getPublicMenuItems();

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <DesktopNav menuItems={menuItems} />
      <main className="flex-1 relative">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer menuItems={menuItems} />
    </div>
  );
};

function AuthButton({ isMobile }) {
  const { t } = useTranslation('common');
  const { user } = useAuthentication();
  const navigate = useNavigate();

  const handleLoginClick = () => navigate('/login');

  if (!user) {
    return <Button onClick={handleLoginClick} className={isMobile ? "w-full" : ''}>{t('login')}</Button>;
  }

  return <UserNav />;
}

function DesktopNav({ menuItems }) {
  const { t } = useTranslation('common');
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const navbarItems = registry.getPublicNavbarItems();

  const isActiveRoute = (path) => location.pathname === path;
  const getNavLinkClassName = (isActive) =>
    `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent text-accent-foreground' : ''}`;

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo title={t('appPublicTitle')} subtitle={t('appPublicSubtitle')} linkTo="/" />

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
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <NavbarItemsRenderer items={navbarItems} />
            <AuthButton isMobile={false} />
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
            <Logo title={t('appPublicTitle')} subtitle={t('appPublicSubtitle')} />
          </div>
          <nav className="flex-1 py-6">
            <RecursiveAccordionMenu menuItems={menuItems} renderItem={renderMobileMenuItem} />
          </nav>
          <div className="border-t border-border pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-foreground">{t('socialLinks')}</span>
              <SocialLinks />
            </div>
            <AuthButton isMobile={true} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Footer({ menuItems }) {
  const { t } = useTranslation('common');
  return (
    <footer className="bg-card border-t border-border mt-auto relative z-10">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="col-span-1 md:col-span-2 border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="mb-4">
                <Logo title={t('appPublicTitle')} subtitle={t('appPublicSubtitle')} />
              </div>
              <p className="text-sm text-muted-foreground max-w-md">{t('appDescription')}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <h3 className="text-sm font-semibold text-foreground mb-4">{t('quickLinks')}</h3>
              <ul className="space-y-2">
                {menuItems.slice(0, 4).map((item) => (
                  <li key={item.key}>
                    <Link to={item.path} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
              <h3 className="text-sm font-semibold text-foreground mb-4">{t('connect')}</h3>
              <SocialLinks className="justify-start" />
            </CardContent>
          </Card>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">{t('copyright')}</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">{t('privacyPolicy')}</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">{t('termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PublicLayout;