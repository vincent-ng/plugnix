import { registryApi } from '@/framework/api';
import { AuthenticationProvider } from '@/framework/contexts/AuthenticationContext';
import { TenantProvider } from '@/framework/contexts/TenantContext';

// 注册认证相关的Provider
export function registerAuthProviders() {
  // 注册认证Provider - 提供用户认证功能
  registryApi.registerProvider({
    name: 'AuthenticationProvider',
    component: AuthenticationProvider,
    order: 10,
    description: '提供用户认证功能，包括登录、注册、登出等'
  });

  // 注册租户Provider - 提供多租户支持（通过事件总线与认证解耦）
  registryApi.registerProvider({
    name: 'TenantProvider',
    component: TenantProvider,
    order: 20,
    description: '提供多租户支持，通过事件总线监听认证状态变化'
  });
}

// 插件初始化函数
export default function initializeAuthPlugin() {
  // 注册认证相关的Provider
  registerAuthProviders();
  
  console.log('认证插件已初始化');
}