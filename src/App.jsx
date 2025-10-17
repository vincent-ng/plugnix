import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 框架核心
import { useTranslation } from 'react-i18next';
import AdminLayout from '@/framework/layouts/AdminLayout';
import PublicLayout from '@/framework/layouts/PublicLayout';
import Authorized from '@/framework/components/Authorized';
import { registry } from '@/framework/api';
import { Toaster } from '@/framework/components/ui/sonner';

// 动态路由组件
const DynamicRoutes = () => {
  const { t } = useTranslation('common');
  const allRoutes = registry.getRoutes();
  const publicRoutes = allRoutes.filter(route => !route.path.startsWith('/admin'));
  const adminRoutes = allRoutes.filter(route => route.path.startsWith('/admin'));

  return (
    <Routes>
      {/* 公共路由 */}
      <Route path="/" element={<PublicLayout />}>
        {publicRoutes.map((route) => {
          const Element = route.component;

          return (
            <Route
              key={route.path}
              path={route.path === '/' ? '' : route.path.substring(1)}
              element={
                <Authorized permissions={route.permissions}>
                  <Element />
                </Authorized>
              }
              index={route.path === '/'}
            />
          );
        })}
      </Route>

      {/* 管理后台路由 */}
      <Route
        path="/admin"
        element={<AdminLayout />}
      >
        {/* 动态插件路由 */}
        {adminRoutes.map((route) => {
          const Element = route.component;
          return (
            <Route
              key={route.path}
              path={route.path.substring('/admin/'.length)}
              element={
                <Authorized permissions={route.permissions}>
                  <Element />
                </Authorized>
              }
            />
          );
        })}
      </Route>

      {/* 404 页面 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
              <p className="text-muted-foreground mb-4">{t('notFound')}</p>
              <a
                href="/"
                className="text-primary hover:text-primary/80"
              >
                {t('backToHome')}
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

// 简单排序工具：按 order 字段排序
const sortProviders = (providers) => {
  return [...providers].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
};

// 动态Provider组件 - 用于渲染所有注册的Provider
const DynamicProviders = ({ children }) => {
  const providers = registry.getProviders();
  if (providers.length === 0) return <>{children}</>;

  return providers.reduce((acc, provider) => {
    const ProviderComponent = provider.component;
    return (
      <ProviderComponent {...(provider.props || {})}>
        {acc}
      </ProviderComponent>
    );
  }, children);
};

// 主应用组件
function App() {
  return (
    <DynamicProviders>
      <Router>
        <DynamicRoutes />
        <Toaster />
      </Router>
    </DynamicProviders>
  );
}

export default App;