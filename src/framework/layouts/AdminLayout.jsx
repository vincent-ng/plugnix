import React from 'react';
import { Outlet, useNavigate, useMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TabProvider, useTabs } from '@/framework/contexts/TabContext.jsx';
import { registry } from '@/framework/api';
import { Authorized } from '@/framework/components/Authorized';
import { TenantSwitcher } from '@/framework/components/TenantSwitcher';
import { SidebarProvider } from '@components/ui/sidebar';
import Logo from '../components/Logo.jsx';
import { Sheet, SheetContent, SheetTrigger } from '@components/ui/sheet';
import { Button } from '@components/ui/button';
import { UserNav } from '@/framework/components/UserNav.jsx';
import { useTheme } from '@/framework/contexts/ThemeContext.jsx';
import { LanguageSwitcher } from '@/framework/components/LanguageSwitcher.jsx';
import { Separator } from '@components/ui/separator';
import { Sun, Menu } from 'lucide-react';
import { RecursiveAccordionMenu } from '@/framework/components/RecursiveAccordionMenu.jsx';
import IconRenderer from '@/framework/components/IconRenderer.jsx';
import TabBar from "@/framework/components/TabBar.jsx";

const AdminLayout = () => {
  return (
    <TabProvider>
      <AdminLayoutContent />
    </TabProvider>
  );
};

const AdminLayoutContent = () => {
  const { tabs, isTabActive } = useTabs();
  const { toggleTheme } = useTheme();

  const menuItems = registry.getAdminMenuItems();

  const renderMenuItem = (item) => <MenuItem item={item} />;

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DesktopSidebar menuItems={menuItems} renderMenuItem={renderMenuItem} />
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[48px] lg:px-6">
            <MobileNav menuItems={menuItems} renderMenuItem={renderMenuItem} />
            <div className="flex-1">
              {tabs.length > 0 && <TabBar />}
            </div>
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <TenantSwitcher />
          </header>
          <main className="flex-1 overflow-y-auto p-4">
            {tabs.map(tab => {
              const route = registry.findRoute(tab.path);
              if (!route) return null;
              const Element = route.component;
              return (
                <div key={tab.path} style={{ display: isTabActive(tab) ? 'block' : 'none' }}>
                  <Authorized permissions={route.permissions}>
                    <Element />
                  </Authorized>
                </div>
              );
            })}
            {tabs.length === 0 && <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const MenuItem = ({ item }) => {
  const { t } = useTranslation();
  const { openTab } = useTabs();
  const navigate = useNavigate();
  // The `end` option is important for matching nested routes correctly.
  // We want to match if the current path is the item's path or a sub-route.
  const isActive = useMatch({ path: item.path, end: item.path === '/' });

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        if (item.onClick) {
          item.onClick();
        } else if (item.path) {
          openTab({ path: item.path, label: item.label });
          navigate(item.path);
        }
      }}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${isActive ? 'bg-muted text-primary' : ''}`}
    >
      <IconRenderer icon={item.icon} />
      {t(item.label)}
    </a>
  );
};

const DesktopSidebar = ({ menuItems, renderMenuItem }) => {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[48px] lg:px-6">
          <Logo title="Plugnix" subtitle="Admin" linkTo="/" />
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <RecursiveAccordionMenu menuItems={menuItems} renderItem={(item) => (
              <Authorized permissions={item.permissions} key={item.key}>
                {renderMenuItem(item)}
              </Authorized>
            )} />
          </nav>
        </div>
        <div className="mt-auto p-4">
          <UserNav />
        </div>
      </div>
    </div>
  );
};

const MobileNav = ({ menuItems, renderMenuItem }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <nav className="grid gap-2 text-lg font-medium">
          <Logo title="Plugnix" subtitle="Admin" linkTo="/" />
          <RecursiveAccordionMenu menuItems={menuItems} renderItem={renderMenuItem} />
        </nav>
        <div className="mt-auto">
          <UserNav />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdminLayout;