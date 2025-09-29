// 成员管理服务
// 提供用户组成员的增删改查功能

import { supabase } from '@/framework/lib/supabase';

/**
 * 获取用户组成员列表
 * @param {string} groupId - 用户组ID
 * @returns {Promise<Array>} 成员列表
 */
export const getGroupMembers = async (groupId) => {
  try {
    const { data, error } = await supabase
      .from('group_users')
      .select(`
        *,
        user:users(id, username, email, display_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data;
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
    // 1. 检查用户是否存在
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError && userError.code !== 'PGRST116') throw userError; // PGRST116 means no rows found, which is fine

    // 2. 如果用户不存在，返回邀请已发送状态，让前端处理
    if (!user) {
      console.log(`用户 ${email} 不存在，发送邀请邮件`);
      // 在实际应用中，这里可以触发一个邀请流程
      return { type: 'invitation_sent', email, role };
    }

    // 3. 如果用户存在，直接添加到用户组
    const { data, error } = await supabase
      .from('group_users')
      .insert({
        group_id: groupId,
        user_id: user.id,
        role: role,
      })
      .select()
      .single();

    if (error) throw error;
    return { type: 'member_added', data };
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
    const { error } = await supabase
      .from('group_users')
      .delete()
      .eq('id', memberId)
      .eq('group_id', groupId);

    if (error) throw error;
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
    const { data, error } = await supabase
      .from('group_users')
      .update({ role: newRole })
      .eq('id', memberId)
      .eq('group_id', groupId)
      .select()
      .single();

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('group_id', groupId)
      .order('name');

    if (error) throw error;
    return data;
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