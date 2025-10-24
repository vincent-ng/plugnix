/**
 * 全局导航服务
 * 允许在非组件环境中触发 React Router 导航
 */

// 存储导航函数
let navigateFunction = null;

/**
 * 初始化导航服务
 * @param {Function} navigate - React Router 的 navigate 函数
 */
export const initializeNavigation = (navigate) => {
  navigateFunction = navigate;
  console.log('[NavigationService] Initialized');
};

/**
 * 导航到指定路径
 * @param {string} path - 要导航到的路径
 * @param {Object} options - 导航选项，如 replace, state 等
 */
export const navigate = (path, options = {}) => {
  if (navigateFunction) {
    console.log(`[NavigationService] Navigating to: ${path}`, options);
    navigateFunction(path, options);
  } else {
    console.warn('[NavigationService] Not initialized, falling back to window.location');
    window.location.href = path;
  }
};

// 默认导出导航函数，方便使用
export default navigate;