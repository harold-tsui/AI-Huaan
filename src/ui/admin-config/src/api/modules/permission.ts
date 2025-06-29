import { http } from '../request'
import type { ApiResponse, PageParams, PageResult } from '../types'

// 权限API
export const permissionApi = {
  // 获取用户权限
  getUserPermissions(userId?: string) {
    const url = userId ? `/permissions/user/${userId}` : '/permissions/user'
    return http.get<ApiResponse<{
      permissions: string[]
      roles: string[]
      effectivePermissions: string[]
    }>>(url)
  },

  // 检查单个权限
  checkPermission(permission: string) {
    return http.post<ApiResponse<{ hasPermission: boolean }>>('/permissions/check', {
      permission
    })
  },

  // 批量检查权限
  checkPermissions(permissions: string[]) {
    return http.post<ApiResponse<Record<string, boolean>>>('/permissions/check-batch', {
      permissions
    })
  },

  // 获取所有可用权限
  getAllPermissions(params?: PageParams & {
    category?: string
    resource?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<PageResult<{
      id: string
      name: string
      description: string
      category: string
      resource: string
      action: string
    }>>>('/permissions', { params })
  },
  
  // 获取权限组
  getPermissionGroups() {
    return http.get<ApiResponse<Array<{
      id: string
      name: string
      description: string
      permissions: string[]
    }>>>('/permissions/groups')
  },
  
  // 获取按组分类的权限
  getPermissionsByGroup() {
    return http.get<ApiResponse<Record<string, Array<{
      id: string
      name: string
      description: string
      category: string
      resource: string
      action: string
    }>>>>('/permissions/by-group')
  },
  
  // 获取单个权限详情
  getPermission(permissionId: string) {
    return http.get<ApiResponse<{
      id: string
      name: string
      description: string
      category: string
      resource: string
      action: string
      dependencies: string[]
    }>>(`/permissions/${permissionId}`)
  },
  
  // 获取权限类别
  getPermissionCategories() {
    return http.get<ApiResponse<Array<{
      id: string
      name: string
      description: string
      count: number
    }>>>('/permissions/categories')
  },
  
  // 获取权限资源
  getPermissionResources() {
    return http.get<ApiResponse<Array<{
      id: string
      name: string
      description: string
      count: number
    }>>>('/permissions/resources')
  },
  
  // 获取权限操作
  getPermissionActions() {
    return http.get<ApiResponse<Array<{
      id: string
      name: string
      description: string
      count: number
    }>>>('/permissions/actions')
  },
  
  // 获取用户组权限
  getUserGroupPermissions(groupId: string) {
    return http.get<ApiResponse<{
      permissions: string[]
      effectivePermissions: string[]
    }>>(`/permissions/user-group/${groupId}`)
  },
  
  // 更新用户组权限
  updateUserGroupPermissions(groupId: string, permissions: string[]) {
    return http.put<ApiResponse<{
      permissions: string[]
      effectivePermissions: string[]
    }>>(`/permissions/user-group/${groupId}`, { permissions })
  }
}