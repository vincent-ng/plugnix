// 核心Provider注册文件 - 注册框架的核心Provider
import { registryApi } from './api';
import { ThemeProvider } from './contexts/ThemeContext';

export function registerCoreProviders() {
  // 注册主题Provider - 提供主题切换功能
  registryApi.registerProvider({
    name: 'ThemeProvider',
    component: ThemeProvider,
    order: 30,
    description: '提供主题切换功能，支持明暗主题切换'
  });

  console.log('Core providers registered');
}