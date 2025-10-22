import { supabase } from '@/framework/lib/supabase';

/**
 * 权限管理API服务层
 * 通过 Supabase 边缘函数调用数据库，确保权限控制
 * 使用官方的 supabase.functions.invoke() 方法，简化调用流程
 */
class PermissionAdminAPI {
  /**
   * 通用API调用方法 - 使用 Supabase 官方边缘函数调用
   */
  async callEdgeFunction(operation, table, options = {}) {
    try {
      const { data, error } = await supabase.functions.invoke('admin-api-proxy', {
        body: {
          operation,
          table,
          ...options
        }
      });

      if (error) {
        throw new Error(error.message || `Operation failed: ${operation} ${table}`);
      }

      return data;
    } catch (error) {
      console.error(`API call failed: ${operation} ${table}`, error);
      throw error;
    }
  }

  // ==================== 角色管理 API ====================

  /**
   * 获取所有角色
   */
  async getRoles() {
    return this.callEdgeFunction('select', 'roles', {
      columns: 'id, name, description, created_at, updated_at'
    });
  }

  /**
   * 创建新角色
   */
  async createRole(roleData) {
    return this.callEdgeFunction('insert', 'roles', {
      data: roleData
    });
  }

  /**
   * 更新角色
   */
  async updateRole(roleId, roleData) {
    return this.callEdgeFunction('update', 'roles', {
      match: { id: roleId },
      data: roleData
    });
  }

  /**
   * 删除角色
   */
  async deleteRole(roleId) {
    return this.callEdgeFunction('delete', 'roles', {
      match: { id: roleId }
    });
  }

  /**
   * 获取角色的权限
   */
  async getRolePermissions(roleId) {
    return this.callEdgeFunction('select', 'role_permissions', {
      columns: 'permissions(id, name, description)',
      match: { role_id: roleId }
    });
  }

  /**
   * 设置角色权限
   */
  async setRolePermissions(roleId, permissionIds) {
    // 先删除现有权限
    await this.callEdgeFunction('delete', 'role_permissions', {
      match: { role_id: roleId }
    });

    // 添加新权限
    if (permissionIds.length > 0) {
      const rolePermissions = permissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId
      }));

      return this.callEdgeFunction('insert', 'role_permissions', {
        data: rolePermissions
      });
    }

    return [];
  }

  // ==================== 权限管理 API ====================

  /**
   * 获取所有权限
   */
  async getPermissions() {
    return this.callEdgeFunction('select', 'permissions', {
      columns: 'id, name, description, source, created_at'
    });
  }

  /**
   * 同步权限（从代码中扫描并更新数据库）
   */
  async syncPermissions() {
    // TODO: 实现权限同步逻辑
    // 这里需要扫描代码中的权限声明并同步到数据库
    throw new Error('Permission sync not implemented yet');
  }

  // ==================== 用户角色管理 API ====================

  /**
   * 获取所有用户及其角色
   */
  async getUsersWithRoles() {
    return this.callEdgeFunction('select', 'user_roles', {
      columns: 'user_id, users(id, email, name, avatar_url), roles(id, name, description)'
    });
  }

  /**
   * 获取用户的角色
   */
  async getUserRoles(userId) {
    return this.callEdgeFunction('select', 'user_roles', {
      columns: 'roles(id, name, description)',
      match: { user_id: userId }
    });
  }

  /**
   * 设置用户角色
   */
  async setUserRoles(userId, roleIds) {
    // 先删除现有角色
    await this.callEdgeFunction('delete', 'user_roles', {
      match: { user_id: userId }
    });

    // 添加新角色
    if (roleIds.length > 0) {
      const userRoles = roleIds.map(roleId => ({
        user_id: userId,
        role_id: roleId
      }));

      return this.callEdgeFunction('insert', 'user_roles', {
        data: userRoles
      });
    }

    return [];
  }

  /**
   * 获取所有用户（用于用户选择）
   */
  async getUsers() {
    return this.callEdgeFunction('select', 'users', {
      columns: 'id, email, name, avatar_url, created_at'
    });
  }
}

// 导出单例实例
export const permissionAdminAPI = new PermissionAdminAPI();
export default permissionAdminAPI;