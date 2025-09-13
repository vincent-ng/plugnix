import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { registry } from '../api';
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
import { Separator } from '@components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@components/ui/sheet';
import { 
  Menu, 
  X, 
  Home, 
  Settings, 
  Users, 
  BarChart3, 
  FileText, 
  Bell, 
  Search,
  Moon,
  Sun,
  Globe,
  LogOut,
  ChevronDown,
  Sparkles
} from 'lucide-react';


const AdminLayout = () => {
  const { t, i18n } = useTranslation('common');
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = registry.getAdminMenuItems();
  const userMenuItems = registry.getUserMenuItems();

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // 侧边栏组件
  const Sidebar = ({ className }) => (
    <div className={`flex flex-col h-full bg-sidebar-background ${className}`}>
      {/* Logo区域 */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-sidebar-foreground">Plugin Framework</span>
          <span className="text-xs text-muted-foreground">Admin Panel</span>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = isActiveRoute(item.path);
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t(item.label)}</span>
              {isActive && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  Active
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 底部用户信息 */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
              {user?.email || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative">
      {/* 桌面端侧边栏 */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col z-10">
        <div className="flex flex-col flex-grow bg-sidebar-background border-r border-sidebar-border overflow-y-auto scrollbar-thin">
          <Sidebar />
        </div>
      </div>

      {/* 移动端侧边栏 */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* 主内容区域 */}
      <div className="lg:pl-72">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* 移动端菜单按钮 */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
                
                {/* 搜索框 */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg min-w-[300px]">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent border-none outline-none text-sm text-foreground placeholder-muted-foreground flex-1"
                  />
                </div>
              </div>

              {/* 右侧菜单 */}
              <div className="flex items-center gap-3">
                {/* 通知按钮 */}
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600">
                    3
                  </Badge>
                </Button>

                {/* 语言切换 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Globe className="w-4 h-4" />
                      <span className="hidden sm:inline">{i18n.language === 'zh' ? '中文' : 'EN'}</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => changeLanguage('zh')} className={i18n.language === 'zh' ? 'bg-accent' : ''}>
                      中文
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'bg-accent' : ''}>
                      English
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 主题切换 */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="relative"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>

                <Separator orientation="vertical" className="h-6" />

                {/* 用户菜单 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-3 px-3 py-2 h-auto">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.avatar_url} alt={user?.email} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-medium">{user?.email || 'User'}</span>
                        <span className="text-xs text-muted-foreground">Administrator</span>
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end">
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user?.avatar_url} alt={user?.email} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user?.email || 'User'}</span>
                          <span className="text-xs text-muted-foreground">Administrator</span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {userMenuItems.map((item) => (
                      <DropdownMenuItem key={item.key} asChild>
                        <Link to={item.path} className="cursor-pointer flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          {t(item.label)}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      {t('auth.signOut')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
          </div>
        </div>
      </header>

        {/* 主内容区域 */}
        <main className="flex-1 relative p-6">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;