import { createContext, useContext } from 'react';

/**
 * AUTH_STATE_CHANGED Event Contract
 * 
 * Triggered by: Authentication providers (e.g., AuthenticationProvider)
 * Listened by: Components, contexts, or plugins that need to react to auth changes
 * 
 * When triggered:
 * - User successfully logs in
 * - User logs out
 * - Session is refreshed or updated
 * - Authentication state changes for any reason
 * 
 * Payload structure:
 * {
 *   user: Object|null,     // Current user object or null if logged out
 *   event: string,         // Event type: 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', etc.
 *   session: Object|null   // Current session object or null
 * }
 * 
 * Usage example - Listening:
 * ```javascript
 * import { eventBus, AUTH_STATE_CHANGED } from '@/framework/...';
 * 
 * const unsubscribe = eventBus.on(AUTH_STATE_CHANGED, (payload) => {
 *   try {
 *     const { user, event, session } = payload;
 *     console.log(`Auth event: ${event}`, { user, session });
 *     // Handle auth state change...
 *   } catch (error) {
 *     console.error('Error handling auth state change:', error);
 *   }
 * });
 * 
 * // Don't forget to unsubscribe when component unmounts
 * // unsubscribe();
 * ```
 * 
 * Usage example - Triggering:
 * ```javascript
 * import { eventBus, AUTH_STATE_CHANGED } from '@/framework/...';
 * 
 * // In authentication provider
 * eventBus.emit(AUTH_STATE_CHANGED, {
 *   user: currentUser,
 *   event: 'SIGNED_IN',
 *   session: currentSession
 * });
 * ```
 */
export const AUTH_STATE_CHANGED = 'auth:state-changed';

/**
 * AUTH_LOGOUT Event Contract
 * 
 * Triggered by: UI components, menu items, or plugins requesting logout
 * Listened by: Authentication providers to perform actual logout
 * 
 * When triggered:
 * - User clicks "Logout" button/menu
 * - Programmatic logout is requested
 * - Session expires and cleanup is needed
 * 
 * Payload structure:
 * {
 *   reason?: string,    // Optional reason for logout: 'user_action', 'session_expired', etc.
 *   redirect?: string   // Optional redirect URL after logout
 * }
 * 
 * Usage example - Listening (in AuthenticationProvider):
 * ```javascript
 * import { eventBus, AUTH_LOGOUT } from '@/framework/...';
 * 
 * const unsubscribe = eventBus.on(AUTH_LOGOUT, async (payload) => {
 *   try {
 *     const { reason = 'user_action', redirect } = payload || {};
 *     console.log(`Logout requested: ${reason}`);
 *     
 *     // Perform actual logout
 *     await performLogout();
 *     
 *     // Optionally handle redirect
 *     if (redirect) {
 *       window.location.href = redirect;
 *     }
 *   } catch (error) {
 *     console.error('Error during logout:', error);
 *   }
 * });
 * ```
 * 
 * Usage example - Triggering (from UI):
 * ```javascript
 * import { eventBus, AUTH_LOGOUT } from '@/framework/...';
 * 
 * // Simple logout
 * eventBus.emit(AUTH_LOGOUT, {});
 * 
 * // Logout with reason and redirect
 * eventBus.emit(AUTH_LOGOUT, {
 *   reason: 'user_action',
 *   redirect: '/login'
 * });
 * ```
 */
export const AUTH_LOGOUT = 'auth:logout';

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
const AuthenticationContext = createContext(undefined);

export const useAuthentication = () => {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error('useAuthentication must be used within an AuthenticationProvider');
  }

  // 开发模式下进行最小契约校验，帮助定位缺失字段
  if (import.meta.env?.DEV) {
    const requiredKeys = ['user', 'loading', 'login', 'logout'];
    const missing = requiredKeys.filter(k => !(k in context));
    if (missing.length > 0) {
      // 仅警告，不终止运行，避免影响页面；插件实现可逐步补齐
      console.warn('[AuthenticationContext] Missing fields in provider value:', missing);
    }
  }
  return context;
};

export default AuthenticationContext;