// 核心Provider注册文件 - 注册框架的核心Provider
import { I18nextProvider } from 'react-i18next';
import i18n from '@/framework/i18n';

import { ErrorBoundaryProvider } from './contexts/ErrorBoundaryContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext';

export function registerCoreProviders({ registerProvider }) {

  // 注册错误边界Provider - 用于包装特定组件，捕获其渲染错误
  registerProvider({
    name: 'ErrorBoundaryProvider',
    component: ErrorBoundaryProvider,
    order: 20,
    description: '用于包装特定组件，捕获其渲染错误'
  });

  // 注册国际化Provider - 提供多语言支持
  registerProvider({
    name: 'I18nextProvider',
    component: I18nextProvider,
    order: 30,
    props: { i18n },
    description: '提供多语言支持，基于react-i18next'
  });

  // 注册主题Provider - 提供主题切换功能
  registerProvider({
    name: 'ThemeProvider',
    component: ThemeProvider,
    order: 40,
    description: '提供主题切换功能，支持明暗主题切换'
  });

}