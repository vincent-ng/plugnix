import AuthenticationContext from './AuthenticationContext';
import TenantContext from './TenantContext';

/**
 * FallbackAuthenticationProvider
 * 
 * 当没有注册AuthenticationProvider时使用的默认实现
 * 提供最基本的认证状态，使框架能够在没有认证功能的情况下运行
 * 
 * 这个实现：
 * - 始终返回user为null（未登录状态）
 * - 提供空的login/logout方法（仅用于满足接口契约）
 * - 不执行任何实际的认证逻辑
 * - 适用于不需要用户认证的简单landing page场景
 */
export const FallbackAuthenticationProvider = ({ children }) => {
  const value = {
    user: null,
    loading: false,
    login: async () => {
      // 空实现，仅用于满足接口契约
      console.warn('FallbackAuthenticationProvider: login() called but no authentication provider is registered');
      throw new Error('Authentication not available');
    },
    logout: async () => {
      // 空实现，仅用于满足接口契约
      console.warn('FallbackAuthenticationProvider: logout() called but no authentication provider is registered');
      throw new Error('Authentication not available');
    },
    register: async () => {
      // 空实现，仅用于满足接口契约
      console.warn('FallbackAuthenticationProvider: register() called but no authentication provider is registered');
      throw new Error('Authentication not available');
    },
    refresh: async () => {
      // 空实现，仅用于满足接口契约
      console.warn('FallbackAuthenticationProvider: refresh() called but no authentication provider is registered');
      throw new Error('Authentication not available');
    }
  };

  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
};

/**
 * FallbackTenantProvider
 * 
 * 当没有注册TenantProvider时使用的默认实现
 * 提供最基本的租户状态，使框架能够在没有多租户功能的情况下运行
 * 
 * 这个实现：
 * - 始终返回currentTenant为null（无租户状态）
 * - 提供空的租户列表和方法（仅用于满足接口契约）
 * - 权限检查方法始终返回false（无权限）
 * - 适用于不需要多租户功能的简单应用场景
 */
export const FallbackTenantProvider = ({ children }) => {
  const value = {
    currentTenant: null,
    userTenants: [],
    loading: false,
    switchTenant: async () => {
      // 空实现，仅用于满足接口契约
      console.warn('FallbackTenantProvider: switchTenant() called but no tenant provider is registered');
      throw new Error('Tenant management not available');
    },
    refreshUserTenants: async () => {
      // 空实现，仅用于满足接口契约
      console.warn('FallbackTenantProvider: refreshUserTenants() called but no tenant provider is registered');
      throw new Error('Tenant management not available');
    },
    userRole: null,
    userPermissions: [],
    hasPermission: () => false,
    hasAnyPermission: () => false,
    hasAllPermissions: () => false
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};