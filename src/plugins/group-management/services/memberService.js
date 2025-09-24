// 成员管理服务
// 提供用户组成员的增删改查功能

/**
 * 获取用户组成员列表
 * @param {string} groupId - 用户组ID
 * @returns {Promise<Array>} 成员列表
 */
export const getGroupMembers = async (groupId) => {
  try {
    // TODO: 替换为实际的Supabase查询
    // const { data, error } = await supabase
    //   .from('group_members')
    //   .select(`
    //     *,
    //     user:users(id, username, email, display_name, avatar_url)
    //   `)
    //   .eq('group_id', groupId)
    //   .order('joined_at', { ascending: false });
    
    // if (error) throw error;
    // return data;

    // 模拟数据
    return [
      {
        id: '1',
        user_id: 'user1',
        group_id: groupId,
        role: 'Owner',
        joined_at: '2024-01-15T10:30:00Z',
        last_active: '2024-01-20T14:45:00Z',
        user: {
          id: 'user1',
          username: 'alice_dev',
          email: 'alice@example.com',
          display_name: 'Alice Johnson',
          avatar_url: null
        }
      },
      {
        id: '2',
        user_id: 'user2',
        group_id: groupId,
        role: 'Admin',
        joined_at: '2024-01-16T09:15:00Z',
        last_active: '2024-01-20T11:20:00Z',
        user: {
          id: 'user2',
          username: 'bob_frontend',
          email: 'bob@example.com',
          display_name: 'Bob Smith',
          avatar_url: null
        }
      },
      {
        id: '3',
        user_id: 'user3',
        group_id: groupId,
        role: 'Developer',
        joined_at: '2024-01-17T14:20:00Z',
        last_active: '2024-01-19T16:30:00Z',
        user: {
          id: 'user3',
          username: 'carol_backend',
          email: 'carol@example.com',
          display_name: 'Carol Davis',
          avatar_url: null
        }
      },
      {
        id: '4',
        user_id: 'user4',
        group_id: groupId,
        role: 'Member',
        joined_at: '2024-01-18T11:45:00Z',
        last_active: '2024-01-20T09:10:00Z',
        user: {
          id: 'user4',
          username: 'david_mobile',
          email: 'david@example.com',
          display_name: 'David Wilson',
          avatar_url: null
        }
      }
    ];
  } catch (error) {
    console.error('获取成员列表失败:', error);
    throw error;
  }
};

/**
 * 邀请新成员加入用户组
 * @param {string} groupId - 用户组ID
 * @param {string} email - 邀请的用户邮箱
 * @param {string} role - 分配的角色
 * @returns {Promise<Object>} 邀请结果
 */
export const inviteMember = async (groupId, email, role = 'Member') => {
  try {
    // TODO: 替换为实际的Supabase操作
    // 1. 检查用户是否存在
    // const { data: user, error: userError } = await supabase
    //   .from('users')
    //   .select('id')
    //   .eq('email', email)
    //   .single();
    
    // if (userError && userError.code !== 'PGRST116') throw userError;
    
    // 2. 如果用户不存在，发送邀请邮件
    // if (!user) {
    //   // 发送邀请邮件逻辑
    //   return { type: 'invitation_sent', email, role };
    // }
    
    // 3. 如果用户存在，直接添加到用户组
    // const { data, error } = await supabase
    //   .from('group_members')
    //   .insert({
    //     group_id: groupId,
    //     user_id: user.id,
    //     role: role,
    //     joined_at: new Date().toISOString()
    //   })
    //   .select()
    //   .single();
    
    // if (error) throw error;
    // return { type: 'member_added', data };

    // 模拟邀请成功
    console.log(`邀请 ${email} 加入用户组 ${groupId}，角色: ${role}`);
    
    return {
      type: 'invitation_sent',
      email,
      role,
      message: '邀请已发送'
    };
  } catch (error) {
    console.error('邀请成员失败:', error);
    throw error;
  }
};

/**
 * 移除用户组成员
 * @param {string} groupId - 用户组ID
 * @param {string} memberId - 成员ID
 * @returns {Promise<boolean>} 是否成功移除
 */
export const removeMember = async (groupId, memberId) => {
  try {
    // TODO: 替换为实际的Supabase操作
    // const { error } = await supabase
    //   .from('group_members')
    //   .delete()
    //   .eq('id', memberId)
    //   .eq('group_id', groupId);
    
    // if (error) throw error;
    // return true;

    // 模拟移除成功
    console.log(`从用户组 ${groupId} 移除成员 ${memberId}`);
    return true;
  } catch (error) {
    console.error('移除成员失败:', error);
    throw error;
  }
};

/**
 * 修改成员角色
 * @param {string} groupId - 用户组ID
 * @param {string} memberId - 成员ID
 * @param {string} newRole - 新角色
 * @returns {Promise<Object>} 更新后的成员信息
 */
export const changeMemberRole = async (groupId, memberId, newRole) => {
  try {
    // TODO: 替换为实际的Supabase操作
    // const { data, error } = await supabase
    //   .from('group_members')
    //   .update({ role: newRole })
    //   .eq('id', memberId)
    //   .eq('group_id', groupId)
    //   .select()
    //   .single();
    
    // if (error) throw error;
    // return data;

    // 模拟角色修改成功
    console.log(`修改用户组 ${groupId} 成员 ${memberId} 的角色为 ${newRole}`);
    
    return {
      id: memberId,
      role: newRole,
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('修改成员角色失败:', error);
    throw error;
  }
};

/**
 * 获取可用的角色列表
 * @param {string} groupId - 用户组ID
 * @returns {Promise<Array>} 角色列表
 */
export const getAvailableRoles = async (groupId) => {
  try {
    // TODO: 替换为实际的Supabase查询
    // const { data, error } = await supabase
    //   .from('group_roles')
    //   .select('*')
    //   .eq('group_id', groupId)
    //   .order('name');
    
    // if (error) throw error;
    // return data;

    // 模拟角色数据
    return [
      { id: 'owner', name: 'Owner', description: '组长，拥有所有权限', system: true },
      { id: 'admin', name: 'Admin', description: '管理员，可以管理成员和角色', system: true },
      { id: 'developer', name: 'Developer', description: '开发者，可以访问开发资源', system: false },
      { id: 'member', name: 'Member', description: '普通成员，基础访问权限', system: true }
    ];
  } catch (error) {
    console.error('获取角色列表失败:', error);
    throw error;
  }
};

/**
 * 批量邀请成员
 * @param {string} groupId - 用户组ID
 * @param {Array} invitations - 邀请列表 [{email, role}]
 * @returns {Promise<Object>} 批量邀请结果
 */
export const batchInviteMembers = async (groupId, invitations) => {
  try {
    const results = {
      success: [],
      failed: []
    };

    for (const invitation of invitations) {
      try {
        const result = await inviteMember(groupId, invitation.email, invitation.role);
        results.success.push({ ...invitation, result });
      } catch (error) {
        results.failed.push({ ...invitation, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error('批量邀请成员失败:', error);
    throw error;
  }
};