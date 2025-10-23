import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// 框架核心
import { useTranslation } from 'react-i18next';
import AdminLayout from '@/framework/layouts/AdminLayout';
import PublicLayout from '@/framework/layouts/PublicLayout';
import { Authorized } from '@/framework/components/Authorized';
import { registryApi } from '@/framework/api';
import { Toaster } from '@/framework/components/ui/sonner';

// 动态路由组件
const DynamicRoutes = () => {
  const { t } = useTranslation('common');
  const allRoutes = registryApi.getRoutes();

  // 获取注册的layout，如果没有则使用默认的
  const getRegisteredLayout = (layoutType, children) => {
    const registeredLayout = registryApi.getLayout(layoutType);
    if (registeredLayout) {
      const LayoutComponent = registeredLayout.component;
      return <LayoutComponent {...(registeredLayout.props || {})}>{children}</LayoutComponent>;
    }
    const LayoutComponent = layoutType === 'admin' ? AdminLayout : PublicLayout;
    return <LayoutComponent>{children}</LayoutComponent>;
  };

  return (
    <Routes>
      {/* 渲染所有路由，每个路由直接使用其完整的路径 */}
      {allRoutes.map(route => {
        const Element = route.component;
        const layoutType = route.layout || 'public';

        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              <Authorized permissions={route.permissions}>
                {getRegisteredLayout(layoutType, <Element />)}
              </Authorized>
            }
          />
        );
      })}

      {/* 404页面 */}
      <Route path="*" element={
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
      } />
    </Routes>
  );
};

// 动态Provider组件 - 用于渲染所有注册的Provider
const DynamicProviders = ({ children }) => {
  // 渲染所有Provider
  return registryApi.getProviders().reduce((acc, provider) => {
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