import { http } from '../request'
import type { ApiResponse, UserInfo, PageParams, PageResult } from '../types'

// 用户组API
export const userGroupApi = {
  // 获取用户组列表
  getUserGroups(params?: PageParams & {
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<PageResult<{
      id: string
      name: string
      description: string
      memberCount: number
      createdAt: string
      updatedAt: string
    }>>>('/user-groups', { params })
  },

  // 获取单个用户组
  getUserGroup(id: string) {
    return http.get<ApiResponse<{
      id: string
      name: string
      description: string
      members: Array<{
        id: string
        username: string
        email: string
        avatar?: string
      }>
      createdAt: string
      updatedAt: string
    }>>(`/user-groups/${id}`)
  },

  // 创建用户组
  createUserGroup(data: {
    name: string
    description?: string
    members?: string[] // 用户ID数组
  }) {
    return http.post<ApiResponse<{
      id: string
      name: string
      description: string
      createdAt: string
    }>>('/user-groups', data)
  },

  // 更新用户组
  updateUserGroup(id: string, data: {
    name?: string
    description?: string
  }) {
    return http.put<ApiResponse<{
      id: string
      name: string
      description: string
      updatedAt: string
    }>>(`/user-groups/${id}`, data)
  },

  // 删除用户组
  deleteUserGroup(id: string) {
    return http.delete<ApiResponse<void>>(`/user-groups/${id}`)
  },

  // 添加成员到用户组
  addMemberToGroup(groupId: string, userId: string) {
    return http.post<ApiResponse<void>>(`/user-groups/${groupId}/members/${userId}`)
  },

  // 批量添加成员到用户组
  addMembersToGroup(groupId: string, userIds: string[]) {
    return http.post<ApiResponse<{
      success: number
      failed: number
      errors: Array<{ userId: string; error: string }>
    }>>(`/user-groups/${groupId}/members`, { userIds })
  },

  // 从用户组移除成员
  removeMemberFromGroup(groupId: string, userId: string) {
    return http.delete<ApiResponse<void>>(`/user-groups/${groupId}/members/${userId}`)
  },

  // 批量从用户组移除成员
  removeMembersFromGroup(groupId: string, userIds: string[]) {
    return http.delete<ApiResponse<{
      success: number
      failed: number
      errors: Array<{ userId: string; error: string }>
    }>>(`/user-groups/${groupId}/members`, { data: { userIds } })
  },

  // 获取用户所属的用户组列表
  getUserGroupsByUserId(userId: string) {
    return http.get<ApiResponse<Array<{
      id: string
      name: string
      description: string
      createdAt: string
    }>>>(`/user-groups/user/${userId}`)
  },

  // 获取用户组权限
  getUserGroupPermissions(groupId: string) {
    return http.get<ApiResponse<{
      permissions: string[]
      effectivePermissions: string[]
    }>>(`/user-groups/${groupId}/permissions`)
  },

  // 更新用户组权限
  updateUserGroupPermissions(groupId: string, permissions: string[]) {
    return http.put<ApiResponse<{
      permissions: string[]
      effectivePermissions: string[]
    }>>(`/user-groups/${groupId}/permissions`, { permissions })
  }
}