import { supabase } from '@/framework/lib/supabase';

export const getGroupRoles = async (groupId) => {
  // 1. Get roles with their permissions
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select(`
      *,
      permissions:role_permissions(permission_id)
    `)
    .eq('group_id', groupId);

  if (rolesError) {
    console.error('Error fetching group roles:', rolesError);
    return [];
  }

  // 2. Get all members in the group to count them per role
  const { data: members, error: membersError } = await supabase
    .from('group_users')
    .select('role_id')
    .eq('group_id', groupId);

  if (membersError) {
    console.error('Error fetching group members for role counts:', membersError);
    // We can still return roles without member counts
    return roles.map(role => ({
      ...role,
      permissions: role.permissions || [], // ensure permissions is an array
      member_count: 0
    }));
  }

  // 3. Combine roles with member counts
  const rolesWithCounts = roles.map(role => ({
    ...role,
    permissions: role.permissions || [], // ensure permissions is an array
    member_count: members.filter(m => m.role_id === role.id).length
  }));

  return rolesWithCounts;
};

export const createRole = async (groupId, role) => {
  const { data, error } = await supabase
    .from('roles')
    .insert([{ ...role, group_id: groupId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating role:', error);
    return null;
  }
  return data;
};

export const updateRole = async (roleId, updates) => {
  const { data, error } = await supabase
    .from('roles')
    .update(updates)
    .eq('id', roleId)
    .select()
    .single();

  if (error) {
    console.error('Error updating role:', error);
    return null;
  }
  return data;
};

export const deleteRole = async (roleId) => {
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', roleId);

  if (error) {
    console.error('Error deleting role:', error);
    return false;
  }
  return true;
};

export const getAvailablePermissions = async () => {
  const { data, error } = await supabase
    .from('permissions')
    .select('id, name, description');

  if (error) {
    console.error('Error fetching available permissions:', error);
    return [];
  }
  return data;
};

export const updateRolePermissions = async (roleId, permissionIds) => {
  // First, delete existing permissions for the role
  const { error: deleteError } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role_id', roleId);

  if (deleteError) {
    console.error('Error clearing role permissions:', deleteError);
    return false;
  }

  // Then, insert the new permissions
  if (permissionIds.length > 0) {
    const newPermissions = permissionIds.map(permissionId => ({
      role_id: roleId,
      permission_id: permissionId,
    }));

    const { error: insertError } = await supabase
      .from('role_permissions')
      .insert(newPermissions);

    if (insertError) {
      console.error('Error updating role permissions:', insertError);
      return false;
    }
  }

  return true;
};