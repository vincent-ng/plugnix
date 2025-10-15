import { supabase } from '@/framework/lib/supabase';

export const test_is_tenant_member_unauthorized = async () => {
  const unauthorizedTenantId = '00000000-0000-0000-0000-000000000000';
  const { data, error } = await supabase.rpc('is_tenant_member', { p_tenant_id: unauthorizedTenantId });
  if (error) {
    return `Correctly failed with error: ${error.message}`;
  } else if (data === false) {
    return 'Correctly returned false for unauthorized tenant';
  } else {
    throw new Error('Should have failed for unauthorized tenant but passed');
  }
};

export const test_is_tenant_member = async (tenantId) => {
  const { data, error } = await supabase.rpc('is_tenant_member', { p_tenant_id: tenantId });
  if (error) throw error;
  return `Result: ${data}`;
};

export const test_get_tenant_members = async (tenantId) => {
  const { data, error } = await supabase.rpc('get_tenant_members', { p_tenant_id: tenantId });
  if (error) throw error;
  return `Found ${data.length} members`;
};

export const test_add_member_to_tenant_by_email = async (tenantId, userEmail, roleId) => {
  const { error } = await supabase.rpc('add_member_to_tenant_by_email', { p_tenant_id: tenantId, p_user_email: userEmail, p_role_id: roleId });
  if (error) throw error;
  return 'Member added successfully';
};

export const test_add_owner_to_tenant_by_email = async (tenantId, userEmail, roleId) => {
  const { error } = await supabase.rpc('add_member_to_tenant_by_email', { p_tenant_id: tenantId, p_user_email: userEmail, p_role_id: roleId });
  if (error) {
    return `Correctly failed with error: ${error.message}`;
  } else {
    throw new Error('Should have failed for owner but passed');
  }
};

export const test_add_member_to_tenant_by_email_non_existing_user = async (tenantId, roleId) => {
  const nonExistingUserEmail = 'non-existing-user@example.com';
  const { error } = await supabase.rpc('add_member_to_tenant_by_email', { p_tenant_id: tenantId, p_user_email: nonExistingUserEmail, p_role_id: roleId });
  if (error) {
    return `Correctly failed with error: ${error.message}`;
  } else {
    throw new Error('Should have failed for non-existing user but passed');
  }
};

export const test_create_role_with_permissions_empty_role_name = async (tenantId) => {
  const mockRoleName = '';
  const mockRoleDescription = 'A role for testing purposes';
  const { data: permission, error: permissionError } = await supabase
    .from('permissions')
    .select('id')
    .eq('name', 'db.tenants.select')
    .single();
  if (permissionError || !permission) {
    throw new Error('Could not fetch permission ID');
  }

  const { error } = await supabase.rpc('create_role_with_permissions', { p_tenant_id: tenantId, p_role_name: mockRoleName, p_role_description: mockRoleDescription, p_permission_ids: [permission.id] });
  if (error) {
    return `Correctly failed with error: ${error.message}`;
  } else {
    throw new Error('Should have failed for empty role name but passed');
  }
};

export const test_create_tenant = async (name, description) => {
  const { data, error } = await supabase.rpc('create_tenant', { p_tenant_name: name, p_tenant_description: description });
  if (error) throw error;
  return { message: `Tenant '${name}' created successfully.`, tenantId: data };
};

export const test_create_tenant_empty_name = async () => {
  const { error } = await supabase.rpc('create_tenant', { p_tenant_name: '', p_tenant_description: 'test' });
  if (error) {
    return `Correctly failed with error: ${error.message}`;
  } else {
    throw new Error('Should have failed for empty tenant name but passed');
  }
};

export const test_get_tenant_by_id = async (tenantId) => {
  if (!tenantId) {
    throw new Error('No tenantId provided to get.');
  }

  const { data, error } = await supabase.from('tenants').select('*').eq('id', tenantId).single();
  if (error) {
    throw new Error(`Failed to get tenant: ${error.message}`);
  }

  if (!data) {
    throw new Error('Tenant not found.');
  }

  return `Tenant ${data.id} retrieved successfully.`;
};

export const test_update_tenant = async (tenantId) => {
  if (!tenantId) {
    throw new Error('No tenantId provided to update.');
  }

  const newName = `updated-test-tenant-${Date.now()}`;
  const { error } = await supabase
    .from('tenants')
    .update({ name: newName })
    .eq('id', tenantId);

  if (error) {
    throw new Error(`Failed to update tenant: ${error.message}`);
  }

  return `Tenant ${tenantId} updated successfully.`;
};

export const test_delete_tenant = async (tenantId) => {
  if (!tenantId) {
    throw new Error('No tenantId provided to delete.');
  }

  const { error } = await supabase.from('tenants').delete().eq('id', tenantId);
  if (error) {
    throw new Error(`Failed to delete tenant: ${error.message}`);
  }

  return `Tenant ${tenantId} deleted successfully.`;
};

export const test_create_role = async (tenantId, permissions = []) => {
  if (!tenantId) {
    throw new Error('No tenantId provided to create a role.');
  }

  const roleName = `test-role-${Date.now()}`;
  const roleDescription = 'A test role created without specific permissions.';
  const { data, error } = await supabase.rpc('create_role_with_permissions', {
    p_tenant_id: tenantId,
    p_role_name: roleName,
    p_role_description: roleDescription,
    p_permission_ids: permissions
  });

  if (error) {
    throw new Error(`Failed to create role: ${error.message}`);
  }

  return { message: `Role ${roleName} created successfully.`, roleId: data.id };
};

export const test_get_role_by_id = async (roleId) => {
  if (!roleId) {
    throw new Error('No roleId provided to get.');
  }

  const { data, error } = await supabase.from('roles').select('*').eq('id', roleId).single();
  if (error) {
    throw new Error(`Failed to get role: ${error.message}`);
  }

  if (!data) {
    throw new Error('Role not found.');
  }

  return `Role ${data.id} retrieved successfully.`;
};

export const test_update_role = async (roleId) => {
  if (!roleId) {
    throw new Error('No roleId provided to update.');
  }

  const newName = `updated-test-role-${Date.now()}`;
  const { error } = await supabase
    .from('roles')
    .update({ name: newName })
    .eq('id', roleId);

  if (error) {
    throw new Error(`Failed to update role: ${error.message}`);
  }

  return `Role ${roleId} updated successfully.`;
};

export const test_delete_role = async (roleId) => {
  if (!roleId) {
    throw new Error('No roleId provided to delete.');
  }

  const { error } = await supabase.from('roles').delete().eq('id', roleId);
  if (error) {
    throw new Error(`Failed to delete role: ${error.message}`);
  }

  return `Role ${roleId} deleted successfully.`;
};

export const test_remove_member_from_tenant = async (tenantId, userEmail) => {
  if (!tenantId || !userEmail) {
    throw new Error('Tenant ID and user email are required to remove a member.');
  }

  // First, find the user's ID from their email.
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (userError) {
    throw new Error(`Failed to find user: ${userError.message}`);
  }
  if (!user) {
    throw new Error(`User with email ${userEmail} not found.`);
  }

  // Now, delete the entry from the tenant_users table.
  const { error } = await supabase
    .from('tenant_users')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to remove member from tenant: ${error.message}`);
  }

  return `Member ${userEmail} removed from tenant ${tenantId} successfully.`;
};

export const test_update_member_role = async (tenantId, userEmail, newRoleId) => {
  if (!tenantId || !userEmail || !newRoleId) {
    throw new Error('Tenant ID, user email, and new role ID are required to update a member\'s role.');
  }

  // First, find the user's ID from their email.
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (userError) {
    throw new Error(`Failed to find user: ${userError.message}`);
  }
  if (!user) {
    throw new Error(`User with email ${userEmail} not found.`);
  }

  // Now, update the role in the tenant_users table.
  const { error } = await supabase
    .from('tenant_users')
    .update({ role_id: newRoleId })
    .eq('tenant_id', tenantId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to update member role: ${error.message}`);
  }

  return `Member ${userEmail}'s role in tenant ${tenantId} updated successfully.`;
};

export const test_assign_permission_to_role = async (roleId, permissionName) => {
  if (!roleId || !permissionName) {
    throw new Error('Role ID and permission name are required to assign a permission.');
  }

  // Fetch the permission ID from its name
  const { data: permission, error: permissionError } = await supabase
    .from('permissions')
    .select('id')
    .eq('name', permissionName)
    .single();

  if (permissionError || !permission) {
    throw new Error(`Could not fetch permission ID for name ${permissionName}. Error: ${permissionError?.message}`);
  }

  // Assign the permission to the role
  const { error } = await supabase.from('role_permissions').insert({ role_id: roleId, permission_id: permission.id });
  if (error) {
    throw new Error(`Failed to assign permission: ${error.message}`);
  }

  return `Permission ${permissionName} assigned to role ${roleId} successfully.`;
};

export const test_revoke_permission_from_role = async (roleId, permissionName) => {
  if (!roleId || !permissionName) {
    throw new Error('Role ID and permission name are required to revoke a permission.');
  }

  // Fetch the permission ID from its name
  const { data: permission, error: permissionError } = await supabase
    .from('permissions')
    .select('id')
    .eq('name', permissionName)
    .single();

  if (permissionError || !permission) {
    throw new Error(`Could not fetch permission ID for name ${permissionName}. Error: ${permissionError?.message}`);
  }

  // Revoke the permission from the role
  const { error } = await supabase
    .from('role_permissions')
    .delete()
    .match({ role_id: roleId, permission_id: permission.id });

  if (error) {
    throw new Error(`Failed to revoke permission: ${error.message}`);
  }

  return `Permission ${permissionName} revoked from role ${roleId} successfully.`;
};

export const test_create_duplicate_tenant = async () => {
  const tenantName = `duplicate-test-tenant-${Date.now()}`;
  const { data, error } = await supabase.rpc('create_tenant', { p_tenant_name: tenantName });
  if (error || !data) {
    throw new Error(`Failed to create first tenant: ${error?.message}`);
  }

  const tenantId = data;

  const { error: duplicateError } = await supabase.rpc('create_tenant', { p_tenant_name: tenantName });

  // Cleanup the first tenant
  await supabase.from('tenants').delete().eq('id', tenantId);

  if (!duplicateError) {
    throw new Error('Should have failed to create duplicate tenant but it passed.');
  }

  return `Correctly failed to create duplicate tenant with error: ${duplicateError.message}`;
};

export const test_create_duplicate_role = async (tenantId) => {
  if (!tenantId) {
    throw new Error('No tenantId provided to create a duplicate role.');
  }

  const roleName = `duplicate-test-role-${Date.now()}`;
  const roleDescription = 'A test role for duplicate creation test.';

  // Create the first role
  const { data, error } = await supabase.rpc('create_role_with_permissions', {
    p_tenant_id: tenantId,
    p_role_name: roleName,
    p_role_description: roleDescription,
    p_permission_ids: []
  });

  if (error || !data) {
    throw new Error(`Failed to create first role: ${error?.message}`);
  }

  const roleId = data.id;

  // Attempt to create a duplicate role
  const { error: duplicateError } = await supabase.rpc('create_role_with_permissions', {
    p_tenant_id: tenantId,
    p_role_name: roleName,
    p_role_description: roleDescription,
    p_permission_ids: []
  });

  // Cleanup the first role
  await supabase.from('roles').delete().eq('id', roleId);

  if (!duplicateError) {
    throw new Error('Should have failed to create duplicate role but it passed.');
  }

  return `Correctly failed to create duplicate role with error: ${duplicateError.message}`;
};