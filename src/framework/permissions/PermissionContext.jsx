import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthentication } from '../contexts/AuthenticationContext';
import { supabase } from '../lib/supabase.js';

const PermissionContext = createContext({});

const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

const PermissionProvider = ({ children }) => {
  const { user } = useAuthentication();
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取用户权限
  const fetchUserPermissions = async (userId) => {
    if (!userId || !supabase) {
      setUserPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 尝试从用户对象的 user_metadata 中获取权限
      if (user?.user_metadata?.permissions) {
        setUserPermissions(user.user_metadata.permissions);
        return;
      }
      
      // 尝试从数据库查询用户权限
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          role_id,
          roles (
            id,
            name,
            role_permissions (
              permission_id,
              permissions (
                id,
                name,
                resource,
                action,
                description
              )
            )
          )
        `)
        .eq('user_id', userId);

      if (rolesError) {
        console.warn('查询用户角色失败，使用模拟数据:', rolesError.message);
        // 如果数据库查询失败，使用模拟权限数据
        const mockPermissions = [
          { id: '1', name: 'user.read', resource: 'user', action: 'read', description: '查看用户' },
          { id: '2', name: 'user.create', resource: 'user', action: 'create', description: '创建用户' },
          { id: '3', name: 'ui.permission-demo.view', resource: 'ui', action: 'permission-demo.view', description: '查看权限演示' },
          { id: '4', name: 'ui.permission-demo.show-special-feature', resource: 'ui', action: 'permission-demo.show-special-feature', description: '查看特殊功能' },
          { id: '5', name: 'db.posts.create', resource: 'db', action: 'posts.create', description: '创建文章' }
        ];
        setUserPermissions(mockPermissions);
        return;
      }

      // 扁平化权限数据
      const permissions = userRoles?.flatMap(userRole => 
        userRole.roles?.role_permissions?.map(rp => rp.permissions) || []
      ) || [];
      
      setUserPermissions(permissions);
    } catch (error) {
      console.error('获取用户权限时发生错误:', error);
      setUserPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  // 当用户状态变化时重新获取权限
  useEffect(() => {
    fetchUserPermissions(user?.id);
  }, [user]);

  // 检查用户是否拥有特定权限
  const hasPermission = (permission) => {
    if (!permission) return true; // 如果没有指定权限要求，则允许访问
    return userPermissions.some(p => p.name === permission);
  };

  // 检查用户是否拥有任意一个权限（支持字符串和数组）
  const hasAnyPermission = (permissions) => {
    if (!permissions) return true;
    
    // 标准化为数组
    const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];
    if (permissionsArray.length === 0) return true;
    
    return permissionsArray.some(permission => 
      userPermissions.some(p => p.name === permission)
    );
  };

  // 检查用户是否拥有所有权限（支持字符串和数组）
  const hasAllPermissions = (permissions) => {
    if (!permissions) return true;
    
    // 标准化为数组
    const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];
    if (permissionsArray.length === 0) return true;
    
    return permissionsArray.every(permission => 
      userPermissions.some(p => p.name === permission)
    );
  };

  const value = {
    userPermissions,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    fetchUserPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

// 导出权限上下文和Hook
export { PermissionContext, usePermission, PermissionProvider };
export default PermissionContext;