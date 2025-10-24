// 核心Provider注册文件 - 注册框架的核心Provider
import { I18nextProvider } from 'react-i18next';
import i18n from '@/framework/i18n';

import { NavigationProvider } from "@/framework/lib/NavigationProvider.jsx";
import { ErrorBoundaryProvider } from './contexts/ErrorBoundaryContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { FallbackAuthenticationProvider, FallbackTenantProvider } from './contexts/FallbackProviders.jsx';

export function registerCoreProviders({ registerProvider }) {
  // 注册导航提供者
  registerProvider({
    name: 'NavigationProvider',
    component: NavigationProvider,
    order: 0, // 设置为高优先级，确保在其他提供者之前初始化
  });

  // 注册错误边界Provider - 用于包装特定组件，捕获其渲染错误
  registerProvider({
    name: 'ErrorBoundaryProvider',
    component: ErrorBoundaryProvider,
    order: 10,
    description: '用于包装特定组件，捕获其渲染错误'
  });

  // 注册国际化Provider - 提供多语言支持
  registerProvider({
    name: 'I18nextProvider',
    component: I18nextProvider,
    order: 20,
    props: { i18n },
    description: '提供多语言支持，基于react-i18next'
  });

  // 注册主题Provider - 提供主题切换功能
  registerProvider({
    name: 'ThemeProvider',
    component: ThemeProvider,
    order: 30,
    description: '提供主题切换功能，支持明暗主题切换'
  });

  // 注册Fallback AuthenticationProvider - 提供默认认证状态
  registerProvider({
    name: 'AuthenticationProvider',
    component: FallbackAuthenticationProvider,
    order: 40,
    description: 'Fallback authentication provider - provides minimal authentication state when no authentication plugin is loaded'
  });

  // 注册Fallback TenantProvider - 提供默认租户状态
  registerProvider({
    name: 'TenantProvider',
    component: FallbackTenantProvider,
    order: 50,
    dependencies: ['AuthenticationProvider'],
    description: 'Fallback tenant provider - provides minimal tenant state when no tenant plugin is loaded'
  });

}