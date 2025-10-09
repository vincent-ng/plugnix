import { supabase } from '@/framework/lib/supabase';

// 加载当前组的角色列表（含权限计数）
export const getGroupRoles = async (groupId) => {
  try {
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .or(`group_id.eq.${groupId},group_id.is.null`)
      .order('name');

    if (error) throw error;

    if (!roles || roles.length === 0) return [];

    // 获取每个角色的权限数量
    const roleIds = roles.map(r => r.id);
    const { data: rolePerms, error: permsError } = await supabase
      .from('role_permissions')
      .select('role_id, permission_id')
      .in('role_id', roleIds);

    if (permsError) throw permsError;

    const permCountByRole = rolePerms.reduce((acc, rp) => {
      acc[rp.role_id] = (acc[rp.role_id] || 0) + 1;
      return acc;
    }, {});

    return roles.map(r => ({
      ...r,
      permissions_count: permCountByRole[r.id] || 0,
    }));
  } catch (e) {
    console.error('加载组角色失败:', e);
    throw e;
  }
};

export const createRole = async (groupId, role) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .insert([{ ...role, group_id: groupId }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('创建角色失败:', e);
    throw e;
  }
};

export const updateRole = async (roleId, updates) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', roleId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('更新角色失败:', e);
    throw e;
  }
};

export const deleteRole = async (roleId) => {
  try {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('删除角色失败:', e);
    throw e;
  }
};

export const getAvailablePermissions = async () => {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('id, name, description');
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('加载可用权限失败:', e);
    throw e;
  }
};

export const getRolePermissions = async (roleId) => {
  try {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('permission_id')
      .eq('role_id', roleId);
    if (error) throw error;
    return (data || []).map(x => x.permission_id);
  } catch (e) {
    console.error('加载角色权限失败:', e);
    throw e;
  }
};

export const setRolePermissions = async (roleId, permissionIds) => {
  try {
    // 清空旧权限
    const { error: delErr } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);
    if (delErr) throw delErr;

    // 插入新权限
    if (permissionIds && permissionIds.length > 0) {
      const rows = permissionIds.map(pid => ({ role_id: roleId, permission_id: pid }));
      const { error: insErr } = await supabase
        .from('role_permissions')
        .insert(rows);
      if (insErr) throw insErr;
    }
    return true;
  } catch (e) {
    console.error('更新角色权限失败:', e);
    throw e;
  }
};