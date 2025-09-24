// 角色管理服务
// 提供角色的CRUD操作和权限管理

/**
 * 获取用户组的所有角色
 * @param {string} groupId - 用户组ID
 * @returns {Promise<Array>} 角色列表
 */
export async function getGroupRoles(groupId) {
  // TODO: 替换为实际的Supabase查询
  // const { data, error } = await supabase
  //   .from('group_roles')
  //   .select(`
  //     *,
  //     role_permissions (
  //       permission_id,
  //       permissions (
  //         name,
  //         description,
  //         type
  //       )
  //     )
  //   `)
  //   .eq('group_id', groupId)
  //   .order('created_at', { ascending: true });

  // 模拟数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'role_1',
          group_id: groupId,
          name: 'Owner',
          display_name: '组长',
          description: '用户组创建者，拥有所有权限',
          is_system: true,
          permissions: [
            { id: 'perm_1', name: 'ui.group.edit', description: '编辑用户组', type: 'ui' },
            { id: 'perm_2', name: 'ui.group.delete', description: '删除用户组', type: 'ui' },
            { id: 'perm_3', name: 'ui.group.member.invite', description: '邀请成员', type: 'ui' },
            { id: 'perm_4', name: 'ui.group.member.remove', description: '移除成员', type: 'ui' },
            { id: 'perm_5', name: 'ui.group.role.create', description: '创建角色', type: 'ui' },
            { id: 'perm_6', name: 'db.groups.update', description: '更新用户组', type: 'db' },
            { id: 'perm_7', name: 'ui.group-management.create', description: '创建用户组', type: 'ui' }
          ],
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 'role_2',
          group_id: groupId,
          name: 'Admin',
          display_name: '管理员',
          description: '用户组管理员，可以管理成员和角色',
          is_system: true,
          permissions: [
            { id: 'perm_1', name: 'ui.group.edit', description: '编辑用户组', type: 'ui' },
            { id: 'perm_3', name: 'ui.group.member.invite', description: '邀请成员', type: 'ui' },
            { id: 'perm_4', name: 'ui.group.member.remove', description: '移除成员', type: 'ui' },
            { id: 'perm_5', name: 'ui.group.role.create', description: '创建角色', type: 'ui' }
          ],
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 'role_3',
          group_id: groupId,
          name: 'Member',
          display_name: '成员',
          description: '普通成员，可以查看用户组信息',
          is_system: true,
          permissions: [
            { id: 'perm_7', name: 'ui.group.view', description: '查看用户组', type: 'ui' }
          ],
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 'role_4',
          group_id: groupId,
          name: 'Developer',
          display_name: '开发者',
          description: '自定义开发者角色',
          is_system: false,
          permissions: [
            { id: 'perm_1', name: 'ui.group.edit', description: '编辑用户组', type: 'ui' },
            { id: 'perm_7', name: 'ui.group.view', description: '查看用户组', type: 'ui' },
            { id: 'perm_8', name: 'db.projects.create', description: '创建项目', type: 'db' }
          ],
          created_at: '2024-01-16T14:20:00Z'
        }
      ]);
    }, 500);
  });
}

/**
 * 创建新角色
 * @param {string} groupId - 用户组ID
 * @param {Object} roleData - 角色数据
 * @returns {Promise<Object>} 创建的角色
 */
export async function createRole(groupId, roleData) {
  // TODO: 替换为实际的Supabase操作
  // const { data, error } = await supabase
  //   .from('group_roles')
  //   .insert({
  //     group_id: groupId,
  //     name: roleData.name,
  //     display_name: roleData.display_name,
  //     description: roleData.description,
  //     is_system: false
  //   })
  //   .select()
  //   .single();

  // 模拟创建
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRole = {
        id: `role_${Date.now()}`,
        group_id: groupId,
        name: roleData.name,
        display_name: roleData.display_name,
        description: roleData.description,
        is_system: false,
        permissions: roleData.permissions || [],
        created_at: new Date().toISOString()
      };
      resolve(newRole);
    }, 800);
  });
}

/**
 * 更新角色
 * @param {string} groupId - 用户组ID
 * @param {string} roleId - 角色ID
 * @param {Object} roleData - 更新的角色数据
 * @returns {Promise<Object>} 更新后的角色
 */
export async function updateRole(groupId, roleId, roleData) {
  // TODO: 替换为实际的Supabase操作
  // const { data, error } = await supabase
  //   .from('group_roles')
  //   .update({
  //     display_name: roleData.display_name,
  //     description: roleData.description
  //   })
  //   .eq('id', roleId)
  //   .eq('group_id', groupId)
  //   .select()
  //   .single();

  // 模拟更新
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: roleId,
        group_id: groupId,
        ...roleData,
        updated_at: new Date().toISOString()
      });
    }, 600);
  });
}

/**
 * 删除角色
 * @param {string} groupId - 用户组ID
 * @param {string} roleId - 角色ID
 * @returns {Promise<void>}
 */
export async function deleteRole(groupId, roleId) {
  // TODO: 替换为实际的Supabase操作
  // const { error } = await supabase
  //   .from('group_roles')
  //   .delete()
  //   .eq('id', roleId)
  //   .eq('group_id', groupId)
  //   .eq('is_system', false); // 只能删除自定义角色

  // 模拟删除
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 400);
  });
}

/**
 * 获取所有可用权限
 * @returns {Promise<Array>} 权限列表
 */
export async function getAvailablePermissions() {
  // TODO: 替换为实际的Supabase查询
  // const { data, error } = await supabase
  //   .from('permissions')
  //   .select('*')
  //   .order('type', { ascending: true })
  //   .order('name', { ascending: true });

  // 模拟权限数据
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        // UI权限
        { id: 'perm_1', name: 'ui.group.edit', description: '编辑用户组', type: 'ui' },
        { id: 'perm_2', name: 'ui.group.delete', description: '删除用户组', type: 'ui' },
        { id: 'perm_3', name: 'ui.group.member.invite', description: '邀请成员', type: 'ui' },
        { id: 'perm_4', name: 'ui.group.member.remove', description: '移除成员', type: 'ui' },
        { id: 'perm_5', name: 'ui.group.role.create', description: '创建角色', type: 'ui' },
        { id: 'perm_6', name: 'ui.group.role.edit', description: '编辑角色', type: 'ui' },
        { id: 'perm_7', name: 'ui.group.view', description: '查看用户组', type: 'ui' },
        
        // 数据库权限
        { id: 'perm_8', name: 'db.groups.update', description: '更新用户组', type: 'db' },
        { id: 'perm_9', name: 'db.groups.delete', description: '删除用户组', type: 'db' },
        { id: 'perm_10', name: 'db.group_members.insert', description: '添加成员', type: 'db' },
        { id: 'perm_11', name: 'db.group_members.delete', description: '删除成员', type: 'db' },
        { id: 'perm_12', name: 'db.projects.create', description: '创建项目', type: 'db' },
        { id: 'perm_13', name: 'db.projects.update', description: '更新项目', type: 'db' }
      ]);
    }, 300);
  });
}

/**
 * 更新角色权限
 * @param {string} groupId - 用户组ID
 * @param {string} roleId - 角色ID
 * @param {Array} permissionIds - 权限ID列表
 * @returns {Promise<void>}
 */
export async function updateRolePermissions(groupId, roleId, permissionIds) {
  // TODO: 替换为实际的Supabase操作
  // 1. 删除现有权限关联
  // await supabase
  //   .from('role_permissions')
  //   .delete()
  //   .eq('role_id', roleId);
  
  // 2. 插入新的权限关联
  // if (permissionIds.length > 0) {
  //   const rolePermissions = permissionIds.map(permissionId => ({
  //     role_id: roleId,
  //     permission_id: permissionId
  //   }));
  //   
  //   await supabase
  //     .from('role_permissions')
  //     .insert(rolePermissions);
  // }

  // 模拟更新
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 600);
  });
}