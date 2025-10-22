import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/framework/lib/supabase';
import eventBus from '@/framework/lib/eventBus';
import { AUTH_STATE_CHANGED } from '@/framework/contexts/AuthenticationContext.jsx';
import TenantContext from '@/framework/contexts/TenantContext.jsx';

export const useTenantProvider = () => {
  const [user, setUser] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [userTenants, setUserTenants] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 监听认证状态变化事件
  useEffect(() => {
    const unsubscribeAuthChange = eventBus.on(AUTH_STATE_CHANGED, (data) => {
      console.log('TenantContext received auth state change:', data);
      setUser(data.user);
    });

    // 初始获取当前用户
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting current user:', error);
        setUser(null);
      }
    };

    getCurrentUser();

    return () => {
      unsubscribeAuthChange();
    };
  }, []);

  const resetTenant = useCallback(() => {
    setCurrentTenant(null);
    setUserRole(null);
    setUserPermissions([]);
    if (user?.id) {
      localStorage.removeItem(`currentTenant_${user.id}`);
    }
  }, [user]);

  // 切换当前组织
  const switchTenant = useCallback((tenant) => {
    setCurrentTenant(tenant);
    setUserRole(tenant.role);
    setUserPermissions(tenant.permissions || []);
    
    // 保存到 localStorage
    if (user?.id) {
      localStorage.setItem(`currentTenant_${user.id}`, tenant.id);
    }
  }, [user]);

  // 获取用户的组织列表
  const refreshUserTenants = useCallback(async () => {
    console.log('Refreshing user tenants for user:', user);
    if (!user) {
      setLoading(false);
      resetTenant();
      setUserTenants([]);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tenant_users')
        .select(`
          tenant_id,
          role_id,
          tenants (
            id,
            name,
            description
          ),
          roles (
            id,
            name,
            role_permissions (
              permissions (
                id,
                name,
                description
              )
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const tenants = data.map(item => ({
        id: item.tenants.id,
        name: item.tenants.name,
        description: item.tenants.description,
        role: item.roles.name,
        permissions: item.roles?.role_permissions?.map(rp => rp.permissions?.name).filter(Boolean) || []
      }));

      console.log('Fetched user tenants:', data, tenants);
      setUserTenants(tenants);

      // 尝试从 localStorage 恢复用户上次选择的组织
      let selectedTenant = null;
      if (user?.id) {
        const savedTenantId = localStorage.getItem(`currentTenant_${user.id}`);
        if (savedTenantId) {
          selectedTenant = tenants.find(t => t.id === savedTenantId);
        }
      }

      // 如果没有保存的组织或保存的组织不存在，使用第一个组织作为默认
      if (!selectedTenant && tenants.length > 0) {
        selectedTenant = tenants[0];
      }

      if (selectedTenant) {
        switchTenant(selectedTenant);
      } else {
        resetTenant();
      }
    } catch (error) {
      console.error('Error fetching user tenants:', error);
      setUserTenants([]);
      resetTenant();
    } finally {
      setLoading(false);
    }
  }, [user, resetTenant, switchTenant]); // 添加依赖数组

  useEffect(() => {
    refreshUserTenants();
  }, [user, refreshUserTenants]);

  // 获取用户在当前组织中的角色
  const getCurrentUserRole = () => {
    return userRole;
  };

  // 检查用户是否有特定权限
  const hasPermission = (permissionName) => {
    return userPermissions.includes(permissionName);
  };

  // 检查用户是否有任一权限
  const hasAnyPermission = (permissionNames) => {
    return permissionNames.some(name => hasPermission(name));
  };

  // 检查用户是否有所有权限
  const hasAllPermissions = (permissionNames) => {
    return permissionNames.every(name => hasPermission(name));
  };

  return {
    currentTenant,
    userTenants,
    userRole,
    userPermissions,
    loading,
    setCurrentTenant: switchTenant,
    switchTenant,
    getCurrentUserRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refreshUserTenants
  };
}


export const TenantProvider = ({ children }) => {
  const tenantState = useTenantProvider();

  return (
    <TenantContext.Provider value={tenantState}>
      {children}
    </TenantContext.Provider>
  );
};