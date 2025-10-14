import { supabase } from '@/framework/lib/supabase';

// 加载当前组织的角色列表（含权限计数）
export const getTenantRoles = async (tenantId) => {
  try {
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
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
    console.error('Load role failed:', e);
    throw e;
  }
};

export const createRoleWithPermissions = async (tenantId, role, permissionIds) => {
  try {
    const { data, error } = await supabase.rpc('create_role_with_permissions', {
      p_tenant_id: tenantId,
      p_role_name: role.name,
      p_role_description: role.description,
      p_permission_ids: permissionIds,
    });

    if (error) throw error;
    return data;
  } catch (e) {
    console.error('Create role with permissions failed:', e);
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
    console.error('Update role failed:', e);
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
    console.error('Delete role failed:', e);
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
    console.error('Load available permissions failed:', e);
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
    console.error('Load role permissions failed:', e);
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
    console.error('Set role permissions failed:', e);
    throw e;
  }
};