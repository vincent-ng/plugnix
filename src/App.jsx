import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';

// 框架核心
import { AuthenticationProvider } from '@/framework/contexts/AuthenticationContext';
import { TenantProvider } from '@/framework/contexts/TenantContext';
import { ThemeProvider } from '@/framework/contexts/ThemeContext';
import AdminLayout from '@/framework/layouts/AdminLayout';
import PublicLayout from '@/framework/layouts/PublicLayout';
import Authorized from '@/framework/components/Authorized';
import i18n from '@/framework/i18n';
import { registry } from '@/framework/api';
import { Toaster } from '@/framework/components/ui/sonner';


// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('应用错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">应用出现错误</h1>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || '未知错误'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 动态路由组件
const DynamicRoutes = () => {
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
              <p className="text-muted-foreground mb-4">页面未找到</p>
              <a 
                href="/" 
                className="text-primary hover:text-primary/80"
              >
                返回首页
              </a>
            </div>
          </div>
        } 
      />
    </Routes>
  );
};

// 主应用组件
function App() {
  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <AuthenticationProvider>
          <TenantProvider>
            <ThemeProvider>
              <Router>
                <DynamicRoutes />
                <Toaster />
              </Router>
            </ThemeProvider>
          </TenantProvider>
        </AuthenticationProvider>
      </I18nextProvider>
    </ErrorBoundary>
  );
}

export default App;