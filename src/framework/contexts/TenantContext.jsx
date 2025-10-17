import { createContext, useContext } from 'react';

/**
 * 如何开发自定义 TenantProvider（组织提供者）
 *
 * 本文件仅提供组织契约（Context + Hook），具体 Provider 由插件实现并通过注册系统注入。
 *
 * 开发步骤：
 * 1) 在你的插件目录下实现 Provider，并使用框架的 TenantContext 契约：
 *    
 *    import TenantContext from '@/framework/contexts/TenantContext.jsx';
 *    
 *    export const TenantProvider = ({ children }) => {
 *      // 这里编写你的组织逻辑（如：获取用户组织列表、切换当前组织等）
 *      const value = {
 *        currentTenant,  // 当前组织对象或 null
 *        tenants,        // 用户可用组织列表
 *        loading,        // 加载状态布尔值
 *        switchTenant,   // (tenantId) => Promise<void>
 *        loadUserTenants // () => Promise<void>（可选）
 *        // 根据需要补充更多字段/方法（如 roles、permissions 等）
 *      };
 *      return (
 *        <TenantContext.Provider value={value}>
 *          {children}
 *        </TenantContext.Provider>
 *      );
 *    };
 *
 * 2) 在插件入口（如 plugins/your-plugin/index.js）中注册该 Provider：
 *    
 *    import { registryApi } from '@/framework/api';
 *    import { TenantProvider } from '@/plugins/your-plugin/TenantProvider.jsx';
 *    
 *    registryApi.registerProvider({
 *      name: 'TenantProvider',
 *      component: TenantProvider,
 *      order: 20, // 通常依赖认证，应放在认证之后
 *      dependencies: ['AuthenticationProvider'],
 *    });
 *
 * 3) 运行时由 App.jsx 的 DynamicProviders 自动按顺序嵌套渲染，无需手动包裹。
 *
 * 约定与注意事项：
 * - 框架内通用组件（如 TenantSwitcher）使用 useTenant()，请提供至少 currentTenant、tenants、loading、switchTenant。
 * - 如你的组织模型包含权限与角色，可在 value 中扩展字段，并在相关插件中消费。
 * - 通过 dependencies 声明与认证的依赖关系，确保渲染顺序正确。
 */

// 组织上下文契约：仅定义 Context 与 Hook，具体实现由插件提供
const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export default TenantContext;