import { useNavigate, useMatch, useLocation, matchPath } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TabProvider, useTabs } from '@/framework/contexts/TabContext.jsx';
import { registryApi } from '@/framework/api';
import { Authorized } from '@/framework/components/Authorized';
import { SidebarProvider } from '@components/ui/sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@components/ui/sheet';
import { Button } from '@components/ui/button';
import { useTheme } from '@/framework/contexts/ThemeContext.jsx';
import { LanguageSwitcher } from '@/framework/components/LanguageSwitcher.jsx';
import { Separator } from '@components/ui/separator';
import { Sun, Menu } from 'lucide-react';
import { RecursiveAccordionMenu } from '@/framework/components/RecursiveAccordionMenu.jsx';
import IconRenderer from '@/framework/components/IconRenderer.jsx';
import TabBar from "@/framework/components/TabBar.jsx";
import { DefaultLogo } from '@/framework/components/Logo.jsx';

const AdminLayout = ({ children }) => {
  return (
    <TabProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </TabProvider>
  );
};

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

// 根据路径查找menuItem的辅助函数 - 使用matchPath实现专业路径匹配
const findMenuItemByPath = (items, targetPath) => {
  for (const item of items) {
    // 使用matchPath进行路径匹配，支持路径参数和通配符
    // 例如：menuItem.path='/admin/blog/:id' 可以匹配 '/admin/blog/1'
    if (item.path) {
      if (matchPath(item.path, targetPath)) {
        return item;
      }
    }

    if (item.children) {
      const found = findMenuItemByPath(item.children, targetPath);
      if (found) return found;
    }
  }
  return null;
};

const AdminLayoutContent = ({ children }) => {
  const { tabs, isTabActive, openTab, activeTab } = useTabs();
  const { toggleTheme } = useTheme();
  const location = useLocation();

  const menuItems = registryApi.getAdminMenuItems();
  const navbarItems = registryApi.getAdminNavbarItems();

  // 初始化tab状态 - 根据当前路径找到对应的menuItem并打开tab
  useEffect(() => {
    const currentPath = location.pathname;

    // 只在有路径且tabs为空时初始化
    if (currentPath && currentPath !== '/admin' && currentPath !== '/admin/' && tabs.length === 0) {
      const menuItem = findMenuItemByPath(menuItems, currentPath);
      if (menuItem) {
        openTab({
          path: currentPath,
          label: menuItem.label
        });
      }
    }
  }, [location.pathname, tabs.length, menuItems, openTab]);

  const renderMenuItem = (item) => <MenuItem item={item} />;

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <DesktopSidebar menuItems={menuItems} renderMenuItem={renderMenuItem} />
        <div className="flex flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-muted/40 px-4 lg:px-6">
            <MobileNav menuItems={menuItems} renderMenuItem={renderMenuItem} />
            <div className="flex-1">
              {tabs.length > 0 && <TabBar />}
            </div>
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-8 h-8">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <NavbarItemsRenderer items={navbarItems} />
          </header>
          <main className="flex-1 overflow-y-auto p-4">
            {tabs.length > 0 && tabs.map(tab => {
              const route = registryApi.findRoute(tab.path);
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
            {(tabs.length === 0 || !activeTab) && children}
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
        <div className="flex h-16 items-center border-b px-4 lg:px-6">
          <DefaultLogo layout="admin" />
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
          <DefaultLogo layout="admin" />
          <RecursiveAccordionMenu menuItems={menuItems} renderItem={renderMenuItem} />
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default AdminLayout;