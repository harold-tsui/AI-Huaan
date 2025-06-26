import { http } from '../request'
import type { ApiResponse, UserInfo, LoginParams, LoginResult } from '../types'

// 认证API
export const authApi = {
  // 用户登录
  login(params: LoginParams) {
    return http.post<ApiResponse<LoginResult>>('/auth/login', params)
  },

  // 用户登出
  logout() {
    return http.post<ApiResponse<void>>('/auth/logout')
  },

  // 刷新token
  refreshToken(refreshToken: string) {
    return http.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh', {
      refreshToken
    })
  },

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

  // 忘记密码
  forgotPassword(email: string) {
    return http.post<ApiResponse<void>>('/auth/forgot-password', { email })
  },

  // 重置密码
  resetPassword(data: {
    token: string
    newPassword: string
    confirmPassword: string
  }) {
    return http.post<ApiResponse<void>>('/auth/reset-password', data)
  },

  // 验证token
  verifyToken(token: string) {
    return http.post<ApiResponse<{ valid: boolean; user?: UserInfo }>>('/auth/verify-token', {
      token
    })
  },

  // 获取登录历史
  getLoginHistory(params?: {
    page?: number
    pageSize?: number
    startDate?: string
    endDate?: string
  }) {
    return http.get<ApiResponse<{
      list: Array<{
        id: string
        ip: string
        userAgent: string
        location?: string
        loginTime: string
        success: boolean
        failureReason?: string
      }>
      total: number
    }>>('/auth/login-history', { params })
  },

  // 获取活跃会话
  getActiveSessions() {
    return http.get<ApiResponse<Array<{
      id: string
      ip: string
      userAgent: string
      location?: string
      lastActivity: string
      current: boolean
    }>>>('/auth/sessions')
  },

  // 终止会话
  terminateSession(sessionId: string) {
    return http.delete<ApiResponse<void>>(`/auth/sessions/${sessionId}`)
  },

  // 终止所有其他会话
  terminateAllOtherSessions() {
    return http.delete<ApiResponse<void>>('/auth/sessions/others')
  }
}

// 权限API
export const permissionApi = {
  // 获取用户权限
  getUserPermissions(userId?: string) {
    const url = userId ? `/auth/permissions/${userId}` : '/auth/permissions'
    return http.get<ApiResponse<{
      permissions: string[]
      roles: string[]
      effectivePermissions: string[]
    }>>(url)
  },

  // 检查权限
  checkPermission(permission: string) {
    return http.post<ApiResponse<{ hasPermission: boolean }>>('/auth/check-permission', {
      permission
    })
  },

  // 批量检查权限
  checkPermissions(permissions: string[]) {
    return http.post<ApiResponse<Record<string, boolean>>>('/auth/check-permissions', {
      permissions
    })
  },

  // 获取所有可用权限
  getAllPermissions() {
    return http.get<ApiResponse<Array<{
      id: string
      name: string
      description: string
      category: string
      resource: string
      action: string
    }>>>('/auth/permissions/all')
  },

  // 获取角色列表
  getRoles() {
    return http.get<ApiResponse<Array<{
      id: string
      name: string
      description: string
      permissions: string[]
      userCount: number
      createdAt: string
    }>>>('/auth/roles')
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
    }>>('/auth/roles', data)
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
    }>>(`/auth/roles/${roleId}`, data)
  },

  // 删除角色
  deleteRole(roleId: string) {
    return http.delete<ApiResponse<void>>(`/auth/roles/${roleId}`)
  },

  // 分配角色给用户
  assignRoleToUser(userId: string, roleId: string) {
    return http.post<ApiResponse<void>>(`/auth/users/${userId}/roles/${roleId}`)
  },

  // 移除用户角色
  removeRoleFromUser(userId: string, roleId: string) {
    return http.delete<ApiResponse<void>>(`/auth/users/${userId}/roles/${roleId}`)
  }
}

// 用户管理API（管理员功能）
export const userManagementApi = {
  // 获取用户列表
  getUsers(params?: {
    page?: number
    pageSize?: number
    search?: string
    role?: string
    status?: 'active' | 'inactive' | 'banned'
    sortBy?: 'username' | 'email' | 'createdAt' | 'lastLogin'
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<{
      list: Array<UserInfo & {
        status: 'active' | 'inactive' | 'banned'
        lastLogin?: string
        loginCount: number
      }>
      total: number
    }>>('/admin/users', { params })
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
  }
}