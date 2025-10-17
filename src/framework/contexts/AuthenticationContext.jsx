import { createContext, useContext } from 'react';

/**
 * 如何开发自定义 AuthenticationProvider（认证提供者）
 *
 * 本文件仅提供认证契约（Context + Hook），具体 Provider 由插件实现并通过注册系统注入。
 *
 * 开发步骤：
 * 1) 在你的插件目录下实现 Provider，并使用框架的 AuthenticationContext 契约：
 *    
 *    import AuthenticationContext from '@/framework/contexts/AuthenticationContext.jsx';
 *    
 *    export const AuthenticationProvider = ({ children }) => {
 *      // 这里编写你的认证逻辑（如：读取 session、登录/登出等）
 *      const value = {
 *        user,          // 当前用户对象或 null
 *        loading,       // 加载状态布尔值
 *        login,         // (credentials) => Promise<void>
 *        logout,        // () => Promise<void>
 *        register,      // (form) => Promise<void>（可选）
 *        refresh,       // () => Promise<void>（可选）
 *        // 根据需要补充更多字段/方法
 *      };
 *      return (
 *        <AuthenticationContext.Provider value={value}>
 *          {children}
 *        </AuthenticationContext.Provider>
 *      );
 *    };
 *
 * 2) 在插件入口（如 plugins/your-plugin/index.js）中注册该 Provider：
 *    
 *    import { registryApi } from '@/framework/api';
 *    import { AuthenticationProvider } from '@/plugins/your-plugin/AuthenticationProvider.jsx';
 *    
 *    registryApi.registerProvider({
 *      name: 'AuthenticationProvider',
 *      component: AuthenticationProvider,
 *      order: 10, // 控制渲染顺序（数字越小越靠外层）
 *    });
 *
 * 3) 运行时由 App.jsx 的 DynamicProviders 自动按顺序嵌套渲染，无需手动包裹。
 *
 * 约定与注意事项：
 * - 框架内通用组件（如 UserNav、Authorized）使用 useAuthentication()，请提供至少 user 与 loading 两个字段。
 * - 如你的 Provider 依赖其他 Provider，可在注册时通过 dependencies 指定：
 *   dependencies: ['SomeOtherProvider']。
 * - 请避免在框架内直接实现具体 Provider，以保持插件可插拔和依赖倒置。
 */

// 认证上下文契约：仅定义 Context 与 Hook，具体实现由插件提供
const AuthenticationContext = createContext({});

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error('useAuthentication must be used within an AuthenticationProvider');
  }
  return context;
};

export default AuthenticationContext;