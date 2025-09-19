import { supabase } from '@/framework/lib/supabase.js';

/**
 * Admin API 封装 - 通过 admin-universal-edge-function 进行安全的管理员操作
 * 所有操作都需要用户具有 admin 角色
 */

/**
 * 调用 admin-universal-edge-function
 * @param {Object} payload - 请求负载
 * @param {string} payload.operation - 操作类型: 'select' | 'insert' | 'update' | 'delete'
 * @param {string} payload.table - 表名
 * @param {Object} [payload.match] - 匹配条件
 * @param {Object|Array} [payload.data] - 数据
 * @param {string} [payload.columns] - 查询列，默认为 '*'
 * @returns {Promise<{data: any, error: any}>}
 */
const callAdminApi = async (payload) => {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase.functions.invoke('admin-api-proxy', {
      body: payload
    });

    if (error) {
      console.error('Admin API Error:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Admin API Call Failed:', err);
    return { data: null, error: err };
  }
};

/**
 * 用户管理 API
 */
export const userAdminApi = {
  /**
   * 获取所有用户列表
   * @returns {Promise<{data: Array, error: any}>}
   */
  async listUsers() {
    // 注意：这里需要根据你的实际用户表结构调整
    // 如果使用 auth.users 表，可能需要在 Edge Function 中特殊处理
    return await callAdminApi({
      operation: 'select',
      table: 'auth.users',
      columns: 'id,email,user_metadata,created_at,last_sign_in_at,email_confirmed_at'
    });
  },

  /**
   * 根据ID获取用户
   * @param {string} userId - 用户ID
   * @returns {Promise<{data: Object, error: any}>}
   */
  async getUserById(userId) {
    const result = await callAdminApi({
      operation: 'select',
      table: 'auth.users',
      match: { id: userId },
      columns: 'id,email,user_metadata,created_at,last_sign_in_at,email_confirmed_at'
    });
    
    // 返回单个用户对象而不是数组
    if (result.data && Array.isArray(result.data) && result.data.length > 0) {
      return { data: result.data[0], error: result.error };
    }
    
    return { data: null, error: result.error || new Error('User not found') };
  },

  /**
   * 创建新用户
   * @param {Object} userData - 用户数据
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @param {Object} [userData.user_metadata] - 用户元数据
   * @returns {Promise<{data: Object, error: any}>}
   */
  async createUser(userData) {
    // 注意：创建用户可能需要在 Edge Function 中使用特殊的 admin 客户端
    // 这里假设你的 Edge Function 已经处理了用户创建逻辑
    return await callAdminApi({
      operation: 'insert',
      table: 'auth.users',
      data: userData
    });
  },

  /**
   * 更新用户信息
   * @param {string} userId - 用户ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<{data: Object, error: any}>}
   */
  async updateUser(userId, updateData) {
    return await callAdminApi({
      operation: 'update',
      table: 'auth.users',
      match: { id: userId },
      data: updateData
    });
  },

  /**
   * 删除用户
   * @param {string} userId - 用户ID
   * @returns {Promise<{data: any, error: any}>}
   */
  async deleteUser(userId) {
    return await callAdminApi({
      operation: 'delete',
      table: 'auth.users',
      match: { id: userId }
    });
  },

  /**
   * 更新用户状态
   * @param {string} userId - 用户ID
   * @param {Object} metadata - 要更新的元数据
   * @returns {Promise<{data: Object, error: any}>}
   */
  async updateUserMetadata(userId, metadata) {
    return await callAdminApi({
      operation: 'update',
      table: 'auth.users',
      match: { id: userId },
      data: { user_metadata: metadata }
    });
  }
};

/**
 * 通用管理员 API
 * 可以用于其他需要管理员权限的操作
 */
export const adminApi = {
  /**
   * 通用查询
   * @param {string} table - 表名
   * @param {Object} [options] - 查询选项
   * @returns {Promise<{data: Array, error: any}>}
   */
  async select(table, options = {}) {
    return await callAdminApi({
      operation: 'select',
      table,
      ...options
    });
  },

  /**
   * 通用插入
   * @param {string} table - 表名
   * @param {Object|Array} data - 插入数据
   * @returns {Promise<{data: Array, error: any}>}
   */
  async insert(table, data) {
    return await callAdminApi({
      operation: 'insert',
      table,
      data
    });
  },

  /**
   * 通用更新
   * @param {string} table - 表名
   * @param {Object} match - 匹配条件
   * @param {Object} data - 更新数据
   * @returns {Promise<{data: Array, error: any}>}
   */
  async update(table, match, data) {
    return await callAdminApi({
      operation: 'update',
      table,
      match,
      data
    });
  },

  /**
   * 通用删除
   * @param {string} table - 表名
   * @param {Object} match - 匹配条件
   * @returns {Promise<{data: any, error: any}>}
   */
  async delete(table, match) {
    return await callAdminApi({
      operation: 'delete',
      table,
      match
    });
  }
};

export default { userAdminApi, adminApi };