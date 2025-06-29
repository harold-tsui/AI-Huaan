import { http } from '../request'
import type { ApiResponse, LoginParams, LoginResult, UserInfo } from '../types'

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
  refreshToken() {
    // 不再需要传递refreshToken参数，因为它会通过cookie自动发送
    return http.post<ApiResponse<{ token: string; refreshToken: string }>>('/auth/refresh')
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
  verifyToken() {
    // 不再需要传递token参数，因为它会通过cookie自动发送
    return http.post<ApiResponse<{ valid: boolean; user?: UserInfo }>>('/auth/verify-token')
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