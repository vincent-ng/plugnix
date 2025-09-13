import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { registry } from '../api';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Separator } from '@components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import {
  Menu, 
  X, 
  Sparkles, 
  Globe, 
  Moon, 
  Sun, 
  ChevronDown,
  ExternalLink,
  Github,
  Twitter
} from 'lucide-react';

const PublicLayout = () => {
  const { t, i18n } = useTranslation('common');
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const menuItems = registry.getPublicMenuItems();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

 return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <Link to="/" className="flex flex-col">
                <span className="text-lg font-bold text-foreground">Plugin Framework</span>
                <span className="text-xs text-muted-foreground -mt-1">Modern Web Platform</span>
              </Link>
            </div>

            {/* 桌面端导航菜单 */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {menuItems.map((item) => {
                  const isActive = isActiveRoute(item.path);
                  return (
                    <NavigationMenuItem key={item.key}>
                      <Link to={item.path}>
                        <NavigationMenuLink 
                          className={`${navigationMenuTriggerStyle()} ${
                            isActive 
                              ? 'bg-accent text-accent-foreground' 
                              : ''
                          }`}
                        >
                          {t(item.label)}
                          {isActive && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              •
                            </Badge>
                          )}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>

            {/* 右侧菜单 */}
            <div className="flex items-center gap-3">
              {/* 社交链接 */}
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6 hidden sm:block" />

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
                className="w-8 h-8"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {/* 登录按钮 */}
              <Link to="/login">
                <Button>
                  <span className="hidden sm:inline">{t('auth:signIn')}</span>
                  <span className="sm:hidden">Login</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              {/* 移动端菜单按钮 */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    {/* 移动端Logo */}
                    <div className="flex items-center gap-3 pb-6 border-b border-border">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-foreground">Plugin Framework</span>
                        <span className="text-xs text-muted-foreground">Modern Web Platform</span>
                      </div>
                    </div>

                    {/* 移动端导航菜单 */}
                    <nav className="flex-1 py-6">
                      <div className="space-y-2">
                        {menuItems.map((item) => {
                          const isActive = isActiveRoute(item.path);
                          return (
                            <Link
                              key={item.key}
                              to={item.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                  ? 'bg-accent text-accent-foreground'
                                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                              }`}
                            >
                              <span>{t(item.label)}</span>
                              {isActive && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  Active
                                </Badge>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </nav>

                    {/* 移动端底部操作 */}
                    <div className="border-t border-border pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-foreground">Social Links</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <Github className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="w-8 h-8">
                            <Twitter className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">
                          {t('auth:signIn')}
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative z-10">
            <Outlet />
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-card border-t border-border mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* 品牌信息 */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground">Plugin Framework</span>
                  <span className="text-xs text-muted-foreground">Modern Web Platform</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                A modern, extensible web application framework built with React and powered by plugins. 
                Create scalable applications with ease.
              </p>
            </div>

            {/* 快速链接 */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {menuItems.slice(0, 4).map((item) => (
                  <li key={item.key}>
                    <Link 
                      to={item.path} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t(item.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 社交媒体 */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Connect</h3>
              <div className="flex gap-3">
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Github className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Twitter className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* 版权信息 */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 Plugin Framework. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;