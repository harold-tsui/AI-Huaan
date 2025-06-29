import { http } from '../request'
import type { ApiResponse, PageParams, PageResult } from '../types'

// 角色API
export const roleApi = {
  // 获取角色列表
  getRoles(params?: PageParams & {
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<PageResult<{
      id: string
      name: string
      description: string
      permissions: string[]
      userCount: number
      createdAt: string
    }>>>('/roles', { params })
  },
  
  // 获取单个角色
  getRole(roleId: string) {
    return http.get<ApiResponse<{
      id: string
      name: string
      description: string
      permissions: string[]
      users: Array<{
        id: string
        username: string
        email: string
        avatar?: string
      }>
      createdAt: string
      updatedAt: string
    }>>(`/roles/${roleId}`)
  },

  // 创建角色
  createRole(data: {
    name: string
    description?: string
    permissions: string[]
  }) {
    return http.post<ApiResponse<{
      id: string
      name: string
      description: string
      permissions: string[]
    }>>('/roles', data)
  },

  // 更新角色
  updateRole(roleId: string, data: {
    name?: string
    description?: string
    permissions?: string[]
  }) {
    return http.put<ApiResponse<{
      id: string
      name: string
      description: string
      permissions: string[]
    }>>(`/roles/${roleId}`, data)
  },

  // 删除角色
  deleteRole(roleId: string) {
    return http.delete<ApiResponse<void>>(`/roles/${roleId}`)
  },

  // 分配角色给用户
  assignRoleToUser(userId: string, roleId: string) {
    return http.post<ApiResponse<void>>(`/roles/${roleId}/users/${userId}`)
  },

  // 批量分配角色给用户
  assignRoleToUsers(roleId: string, userIds: string[]) {
    return http.post<ApiResponse<{
      success: number
      failed: number
      errors: Array<{ userId: string; error: string }>
    }>>(`/roles/${roleId}/users`, { userIds })
  },

  // 移除用户角色
  removeRoleFromUser(userId: string, roleId: string) {
    return http.delete<ApiResponse<void>>(`/roles/${roleId}/users/${userId}`)
  },
  
  // 批量移除用户角色
  removeRoleFromUsers(roleId: string, userIds: string[]) {
    return http.delete<ApiResponse<{
      success: number
      failed: number
      errors: Array<{ userId: string; error: string }>
    }>>(`/roles/${roleId}/users`, { data: { userIds } })
  },
  
  // 获取用户的角色
  getUserRoles(userId: string) {
    return http.get<ApiResponse<Array<{
      id: string
      name: string
      description: string
      createdAt: string
    }>>>(`/users/${userId}/roles`)
  },
  
  // 获取角色的权限
  getRolePermissions(roleId: string) {
    return http.get<ApiResponse<{
      permissions: string[]
      effectivePermissions: string[]
    }>>(`/roles/${roleId}/permissions`)
  },
  
  // 更新角色的权限
  updateRolePermissions(roleId: string, permissions: string[]) {
    return http.put<ApiResponse<{
      permissions: string[]
      effectivePermissions: string[]
    }>>(`/roles/${roleId}/permissions`, { permissions })
  },
  
  // 获取默认角色
  getDefaultRoles() {
    return http.get<ApiResponse<Array<{
      id: string
      name: string
      description: string
      isDefault: boolean
    }>>>('/roles/default')
  },
  
  // 设置默认角色
  setDefaultRole(roleId: string, isDefault: boolean) {
    return http.put<ApiResponse<void>>(`/roles/${roleId}/default`, { isDefault })
  }
}