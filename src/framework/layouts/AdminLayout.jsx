import React from 'react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from '@/framework/contexts/AuthenticationContext.jsx';
import { useTheme } from '@/framework/contexts/ThemeContext.jsx';
import { TabProvider, useTabs } from '@/framework/contexts/TabContext.jsx';
import { registry } from '@/framework/api';
import { Authorized } from '@/framework/components/Authorized';
import { GroupSwitcher } from '@/framework/components/GroupSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Button } from '@components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Badge } from '@components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@components/ui/sidebar';
import {
  Home,
  Bell,
  Search,
  Moon,
  Sun,
  Globe,
  ChevronDown
} from 'lucide-react';
import Logo from '../components/Logo.jsx';
import TabBar from '../components/TabBar.jsx';


const AdminLayoutContent = () => {
  const { t, i18n } = useTranslation('common');
  const { user } = useAuthentication();
  const { theme, toggleTheme } = useTheme();
  const { tabs, openTab } = useTabs();
  const location = useLocation();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };


  const menuItems = registry.getAdminMenuItems();
  const userMenuItems = registry.getUserMenuItems();

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };


  // 应用侧边栏组件
  const AppSidebar = () => (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-2">
          <Logo
            title={t('appAdminTitle')}
            subtitle={t('appAdminSubtitle')}
            className="text-sidebar-foreground"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('navigation:dashboard')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = isActiveRoute(item.path);

                // 如果菜单项有权限要求，使用Authorized组件包装
                const menuButton = (
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => {
                      openTab({ path: item.path, label: t(item.label) });
                      navigate(item.path);
                    }}
                  >
                    <Home className="w-4 h-4" />
                    <span>{t(item.label)}</span>
                    {isActive && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Active
                      </Badge>
                    )}
                  </SidebarMenuButton>
                );

                return (
                  <SidebarMenuItem key={item.key}>
                    <Authorized permissions={item.permissions}>
                      {menuButton}
                    </Authorized>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 w-full justify-start">
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
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* 动态渲染插件注册的用户菜单项 */}
            {userMenuItems.map((item, index) => {
              // 如果是组件类型，直接渲染组件
              if (item.component) {
                const Component = item.component;
                return <Component key={item.key || index} />;
              }

              // 否则渲染传统的菜单项
              return (
                <DropdownMenuItem
                  key={item.key || index}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  className={item.className}
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                  {t(item.label)}
                </DropdownMenuItem>
              );
            })}

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部导航栏 */}
          <header className="flex items-center justify-between px-4 py-3 bg-background border-b border-border lg:px-6">
            <div className="flex items-center gap-4">
              {/* 侧边栏切换按钮 */}
              <SidebarTrigger className="lg:hidden" />

              {/* 搜索框 */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('search')}
                  className="pl-10 pr-4 py-2 w-64 text-sm bg-muted rounded-lg border-0 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* 右侧操作区域 */}
            <div className="flex items-center gap-2">
              {/* 通知按钮 */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
                <span className="sr-only">{t('notifications')}</span>
              </Button>

              {/* 主题切换 */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
                <span className="sr-only">{t('toggleTheme')}</span>
              </Button>

              {/* 语言切换 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Globe className="w-5 h-5" />
                    <span className="sr-only">{t('changeLanguage')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => changeLanguage('en')}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage('zh')}>
                    中文
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 组织切换器 */}
              <GroupSwitcher />

            </div>
          </header>

          {/* Tab栏 */}
          <TabBar />

          {/* 页面内容 */}
          <main className="flex-1 overflow-auto p-6">
            {/* 渲染所有Tab内容，使用CSS控制显示隐藏以保持状态 */}
            {tabs.map(tab => {
              const Component = tab.component;
              // 检查当前tab是否应该被激活
              const isActive = matchPath(tab.path, location.pathname) || tab.path === location.pathname;

              return (
                <div
                  key={tab.path}
                  className="tab-content"
                  style={{
                    display: isActive ? 'block' : 'none',
                    height: '100%'
                  }}
                >
                  <Component />
                </div>
              );
            })}

            {/* 如果没有打开的Tab，显示默认内容 */}
            {tabs.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">{t('tabs:noTabsOpen')}</h2>
                  <p>{t('tabs:welcome')}</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

// 使用TabProvider包装AdminLayoutContent
const AdminLayout = () => {
  return (
    <TabProvider>
      <AdminLayoutContent />
    </TabProvider>
  );
};

export default AdminLayout;