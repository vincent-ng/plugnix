import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthentication } from './AuthenticationContext';
import { supabase } from '@/framework/lib/supabase';

const GroupContext = createContext();

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};

export const useGroupProvider = () => {
  const { user } = useAuthentication();
  const [currentGroup, setCurrentGroup] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const resetGroup = () => {
    setCurrentGroup(null);
    setUserRole(null);
    setUserPermissions([]);
    if (user?.id) {
      localStorage.removeItem(`currentGroup_${user.id}`);
    }
  };

  // 切换当前组织
  const switchGroup = (group) => {
    setCurrentGroup(group);
    setUserRole(group.role);
    setUserPermissions(group.permissions || []);
    
    // 保存到 localStorage
    if (user?.id) {
      localStorage.setItem(`currentGroup_${user.id}`, group.id);
    }
  };

  // 获取用户的组织列表
  const fetchUserGroups = async () => {
    if (!user) {
      setLoading(false);
      resetGroup();
      setUserGroups([]);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('group_users')
        .select(`
          group_id,
          role_id,
          groups (
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

      const groups = data.map(item => ({
        id: item.groups.id,
        name: item.groups.name,
        description: item.groups.description,
        role: item.roles.name,
        permissions: item.roles?.role_permissions?.map(rp => rp.permissions?.name).filter(Boolean) || []
      }));

      setUserGroups(groups);

      // 尝试从 localStorage 恢复用户上次选择的组织
      let selectedGroup = null;
      if (user?.id) {
        const savedGroupId = localStorage.getItem(`currentGroup_${user.id}`);
        if (savedGroupId) {
          selectedGroup = groups.find(g => g.id === savedGroupId);
        }
      }

      // 如果没有保存的组织或保存的组织不存在，使用第一个组织作为默认
      if (!selectedGroup && groups.length > 0) {
        selectedGroup = groups[0];
      }

      if (selectedGroup) {
        switchGroup(selectedGroup);
      } else {
        resetGroup();
      }
    } catch (error) {
      console.error('Error fetching user groups:', error);
      setUserGroups([]);
      resetGroup();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, [user]);

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
    currentGroup,
    userGroups,
    userRole,
    userPermissions,
    loading,
    setCurrentGroup: switchGroup,
    switchGroup,
    getCurrentUserRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    fetchUserGroups
  };
}


export const GroupProvider = ({ children, value }) => {
  const groupState = useGroupProvider();

  return (
    <GroupContext.Provider value={value || groupState}>
      {children}
    </GroupContext.Provider>
  );
};

export default GroupContext;