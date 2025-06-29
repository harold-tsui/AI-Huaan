import { http } from '../request'
import type { ApiResponse, UserInfo, PageParams, PageResult } from '../types'

// 用户管理API（管理员功能）
export const userManagementApi = {
  // 获取用户列表
  getUsers(params?: PageParams & {
    search?: string
    role?: string
    status?: 'active' | 'inactive' | 'banned'
    sortBy?: 'username' | 'email' | 'createdAt' | 'lastLogin'
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<PageResult<UserInfo & {
      status: 'active' | 'inactive' | 'banned'
      lastLogin?: string
      loginCount: number
    }>>>('/admin/users', { params })
  },

  // 获取单个用户详情
  getUser(userId: string) {
    return http.get<ApiResponse<UserInfo & {
      status: 'active' | 'inactive' | 'banned'
      lastLogin?: string
      loginCount: number
      createdBy?: string
      updatedBy?: string
    }>>(`/admin/users/${userId}`)
  },

  // 创建用户
  createUser(data: {
    username: string
    email: string
    password: string
    roles?: string[]
    status?: 'active' | 'inactive'
  }) {
    return http.post<ApiResponse<UserInfo>>('/admin/users', data)
  },

  // 更新用户
  updateUser(userId: string, data: {
    username?: string
    email?: string
    roles?: string[]
    status?: 'active' | 'inactive' | 'banned'
  }) {
    return http.put<ApiResponse<UserInfo>>(`/admin/users/${userId}`, data)
  },

  // 删除用户
  deleteUser(userId: string) {
    return http.delete<ApiResponse<void>>(`/admin/users/${userId}`)
  },

  // 重置用户密码
  resetUserPassword(userId: string, newPassword: string) {
    return http.put<ApiResponse<void>>(`/admin/users/${userId}/reset-password`, {
      newPassword
    })
  },

  // 禁用用户
  banUser(userId: string, reason?: string) {
    return http.put<ApiResponse<void>>(`/admin/users/${userId}/ban`, { reason })
  },

  // 启用用户
  unbanUser(userId: string) {
    return http.put<ApiResponse<void>>(`/admin/users/${userId}/unban`)
  },

  // 强制用户下线
  forceLogout(userId: string) {
    return http.post<ApiResponse<void>>(`/admin/users/${userId}/force-logout`)
  },

  // 获取用户统计
  getUserStats() {
    return http.get<ApiResponse<{
      total: number
      active: number
      inactive: number
      banned: number
      newThisMonth: number
      loginStats: {
        today: number
        thisWeek: number
        thisMonth: number
      }
      roleDistribution: Record<string, number>
    }>>('/admin/users/stats')
  },

  // 批量操作用户
  batchUpdateUsers(operations: Array<{
    userId: string
    action: 'activate' | 'deactivate' | 'ban' | 'delete'
    data?: any
  }>) {
    return http.post<ApiResponse<{
      success: number
      failed: number
      errors: Array<{ userId: string; error: string }>
    }>>('/admin/users/batch', { operations })
  },
  
  // 获取用户权限
  getUserPermissions(userId: string) {
    return http.get<ApiResponse<{
      permissions: string[]
      roles: string[]
      effectivePermissions: string[]
    }>>(`/admin/users/${userId}/permissions`)
  },
  
  // 更新用户权限
  updateUserPermissions(userId: string, permissions: string[]) {
    return http.put<ApiResponse<{
      permissions: string[]
      effectivePermissions: string[]
    }>>(`/admin/users/${userId}/permissions`, { permissions })
  },
  
  // 获取用户组成员
  getUserGroupMembers(groupId: string, params?: PageParams & {
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<PageResult<{
      id: string
      username: string
      email: string
      avatar?: string
      joinedAt: string
    }>>>(`/admin/user-groups/${groupId}/members`, { params })
  },
  
  // 获取用户活动日志
  getUserActivityLogs(userId: string, params?: PageParams & {
    startDate?: string
    endDate?: string
    type?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<PageResult<{
      id: string
      userId: string
      type: string
      action: string
      details: any
      ip?: string
      userAgent?: string
      createdAt: string
    }>>>(`/admin/users/${userId}/activity-logs`, { params })
  }
}

// 用户API（用户自己的功能）
export const userApi = {
  // 获取当前用户信息
  getCurrentUser() {
    return http.get<ApiResponse<UserInfo>>('/auth/me')
  },

  // 更新用户信息
  updateProfile(data: Partial<Pick<UserInfo, 'email' | 'avatar'>>) {
    return http.put<ApiResponse<UserInfo>>('/auth/profile', data)
  },

  // 修改密码
  changePassword(data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) {
    return http.put<ApiResponse<void>>('/auth/change-password', data)
  },
  
  // 获取用户的角色
  getUserRoles() {
    return http.get<ApiResponse<Array<{
      id: string
      name: string
      description: string
    }>>>('/auth/roles')
  },
  
  // 获取用户的权限
  getUserPermissions() {
    return http.get<ApiResponse<{
      permissions: string[]
      roles: string[]
      effectivePermissions: string[]
    }>>('/auth/permissions')
  },
  
  // 获取用户所属的用户组
  getUserGroups() {
    return http.get<ApiResponse<Array<{
      id: string
      name: string
      description: string
      joinedAt: string
    }>>>('/auth/user-groups')
  },
  
  // 获取用户活动日志
  getActivityLogs(params?: PageParams & {
    startDate?: string
    endDate?: string
    type?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<PageResult<{
      id: string
      type: string
      action: string
      details: any
      createdAt: string
    }>>>('/auth/activity-logs', { params })
  },
  
  // 获取用户通知
  getNotifications(params?: PageParams & {
    read?: boolean
    type?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<PageResult<{
      id: string
      type: string
      title: string
      message: string
      read: boolean
      data?: any
      createdAt: string
    }>>>('/auth/notifications', { params })
  },
  
  // 标记通知为已读
  markNotificationAsRead(notificationId: string) {
    return http.put<ApiResponse<void>>(`/auth/notifications/${notificationId}/read`)
  },
  
  // 标记所有通知为已读
  markAllNotificationsAsRead() {
    return http.put<ApiResponse<void>>('/auth/notifications/read-all')
  },
  
  // 删除通知
  deleteNotification(notificationId: string) {
    return http.delete<ApiResponse<void>>(`/auth/notifications/${notificationId}`)
  },
  
  // 清空所有通知
  clearAllNotifications() {
    return http.delete<ApiResponse<void>>('/auth/notifications')
  }
}