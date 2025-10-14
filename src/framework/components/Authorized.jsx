import React from 'react';
import { useTenant } from '../contexts/TenantContext.jsx';

/**
 * 权限控制组件
 * 根据用户权限决定是否渲染子组件
 * 
 * @param {Object} props
 * @param {string|string[]} props.permissions - 权限名称，支持单个字符串或字符串数组
 * @param {string} props.mode - 权限检查模式: 'any' | 'all'，默认 'any'
 * @param {React.ReactNode} props.children - 子组件
 * @param {React.ReactNode} props.fallback - 无权限时显示的内容
 * @param {boolean} props.loading - 是否显示加载状态
 */
export const Authorized = ({
  permissions,
  mode = 'any',
  children,
  fallback = null,
  loading = false
}) => {
  const { hasAnyPermission, hasAllPermissions, loading: tenantLoading } = useTenant();

  // 如果正在加载权限信息
  if (tenantLoading || loading) {
    return fallback;
  }

  // 标准化权限参数为数组
  let permissionsToCheck = [];
  if (permissions) {
    if (typeof permissions === 'string') {
      permissionsToCheck = [permissions];
    } else if (Array.isArray(permissions)) {
      permissionsToCheck = permissions;
    }
  }

  // 如果没有指定权限，直接渲染子组件
  if (permissionsToCheck.length === 0) {
    return children;
  }

  // 权限检查
  let hasAccess = false;
  if (mode === 'all') {
    hasAccess = hasAllPermissions(permissionsToCheck);
  } else {
    hasAccess = hasAnyPermission(permissionsToCheck);
  }

  return hasAccess ? children : fallback;
};

export default Authorized;