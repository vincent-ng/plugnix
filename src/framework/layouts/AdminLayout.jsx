import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TabProvider, useTabs } from '@/framework/contexts/TabContext.jsx';
import { registry } from '@/framework/api';
import { Authorized } from '@/framework/components/Authorized';
import { GroupSwitcher } from '@/framework/components/GroupSwitcher';
import { SidebarProvider } from '@components/ui/sidebar';
import * as lucideIcons from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { Sheet, SheetContent, SheetTrigger } from '@components/ui/sheet';
import { Button } from '@components/ui/button';
import { UserNav } from '@/framework/components/UserNav.jsx';
import { useTheme } from '@/framework/contexts/ThemeContext.jsx';
import { LanguageSwitcher } from '@/framework/components/LanguageSwitcher.jsx';
import { Separator } from '@components/ui/separator';
import { Moon, Sun } from 'lucide-react';

const IconRenderer = ({ icon, className }) => {
  if (!icon) return null;

  if (typeof icon === 'string') {
    const IconComponent = lucideIcons[icon];
    return IconComponent ? <IconComponent className={className} /> : null;
  }

  // Assuming it's a component
  const IconComponent = icon;
  return <IconComponent className={className} />;
};

const AdminLayout = () => {
  return (
    <TabProvider>
      <AdminLayoutContent />
    </TabProvider>
  );
};

const AdminLayoutContent = () => {
  const { openTab } = useTabs();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const menuItems = registry.getAdminMenuItems();

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };


  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DesktopSidebar menuItems={menuItems} isActiveRoute={isActiveRoute} openTab={openTab} navigate={navigate} />
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <MobileNav menuItems={menuItems} isActiveRoute={isActiveRoute} openTab={openTab} navigate={navigate} />
            <div className="flex-1" />
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <GroupSwitcher />
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const DesktopSidebar = ({ menuItems, isActiveRoute, openTab, navigate }) => {
  const { t } = useTranslation();
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Logo title={t('appAdminTitle')} subtitle={t('appAdminSubtitle')} linkTo="/" />
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {menuItems.map((item) => (
              <Authorized permissions={item.permissions} key={item.key}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openTab({ path: item.path, label: t(item.label) });
                    navigate(item.path);
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActiveRoute(item.path) ? 'bg-muted text-primary' : ''
                    }`}>
                  <IconRenderer icon={item.icon} className="h-4 w-4" />
                  {t(item.label)}
                </a>
              </Authorized>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <UserNav />
        </div>
      </div>
    </div>
  );
};

const MobileNav = ({ menuItems, isActiveRoute, openTab, navigate }) => {
  const { t } = useTranslation();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <lucideIcons.Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Logo title={t('appAdminTitle')} subtitle={t('appAdminSubtitle')} linkTo="/" />
          {menuItems.map((item) => (
            <Authorized permissions={item.permissions} key={item.key}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  openTab({ path: item.path, label: t(item.label) });
                  navigate(item.path);
                }}
                className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground ${isActiveRoute(item.path) ? 'bg-muted' : ''
                  }`}>
                <IconRenderer icon={item.icon} className="h-5 w-5" />
                {t(item.label)}
              </a>
            </Authorized>
          ))}
        </nav>
        <div className="mt-auto">
          <UserNav />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdminLayout;