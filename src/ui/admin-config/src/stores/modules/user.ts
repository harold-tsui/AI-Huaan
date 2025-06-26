import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi, permissionApi } from '@/api'
import type { UserInfo, LoginParams } from '@/api/types'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>('')
  const refreshToken = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])
  const isLoading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const userName = computed(() => userInfo.value?.username || '')
  const userEmail = computed(() => userInfo.value?.email || '')
  const userAvatar = computed(() => userInfo.value?.avatar || '')
  const hasPermission = computed(() => {
    return (permission: string) => permissions.value.includes(permission)
  })
  const hasRole = computed(() => {
    return (role: string) => roles.value.includes(role)
  })
  const hasAnyPermission = computed(() => {
    return (perms: string[]) => perms.some(perm => permissions.value.includes(perm))
  })
  const hasAllPermissions = computed(() => {
    return (perms: string[]) => perms.every(perm => permissions.value.includes(perm))
  })

  // 动作
  const login = async (loginParams: LoginParams) => {
    try {
      isLoading.value = true
      const response = await authApi.login(loginParams)
      
      if (response.code === 200) {
        const { token: accessToken, refreshToken: refresh, userInfo: user } = response.data
        
        // 保存认证信息
        token.value = accessToken
        refreshToken.value = refresh
        userInfo.value = user
        
        // 保存到localStorage
        localStorage.setItem('token', accessToken)
        localStorage.setItem('refreshToken', refresh)
        localStorage.setItem('userInfo', JSON.stringify(user))
        
        // 获取用户权限
        await getUserPermissions()
        
        return Promise.resolve()
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error: any) {
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      // 调用登出API
      await authApi.logout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // 清除本地状态
      clearUserData()
      ElMessage.success('已退出登录')
    }
  }

  const clearUserData = () => {
    token.value = ''
    refreshToken.value = ''
    userInfo.value = null
    permissions.value = []
    roles.value = []
    
    // 清除localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
  }

  const refreshAccessToken = async () => {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available')
      }
      
      const response = await authApi.refreshToken(refreshToken.value)
      
      if (response.success) {
        const { token: newToken, refreshToken: newRefreshToken } = response.data
        
        token.value = newToken
        refreshToken.value = newRefreshToken
        
        localStorage.setItem('token', newToken)
        localStorage.setItem('refreshToken', newRefreshToken)
        
        return true
      } else {
        throw new Error(response.message || 'Token refresh failed')
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      clearUserData()
      return false
    }
  }

  const getCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser()
      
      if (response.success) {
        userInfo.value = response.data
        localStorage.setItem('userInfo', JSON.stringify(response.data))
        return response.data
      } else {
        throw new Error(response.message || 'Failed to get user info')
      }
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  const updateProfile = async (data: Partial<Pick<UserInfo, 'email' | 'avatar'>>) => {
    try {
      isLoading.value = true
      const response = await authApi.updateProfile(data)
      
      if (response.success) {
        userInfo.value = response.data
        localStorage.setItem('userInfo', JSON.stringify(response.data))
        ElMessage.success('个人信息更新成功')
        return true
      } else {
        ElMessage.error(response.message || '更新失败')
        return false
      }
    } catch (error: any) {
      ElMessage.error(error.message || '更新失败')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const changePassword = async (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    try {
      isLoading.value = true
      const response = await authApi.changePassword(data)
      
      if (response.success) {
        ElMessage.success('密码修改成功，请重新登录')
        await logout()
        return true
      } else {
        ElMessage.error(response.message || '密码修改失败')
        return false
      }
    } catch (error: any) {
      ElMessage.error(error.message || '密码修改失败')
      return false
    } finally {
      isLoading.value = false
    }
  }

  const getUserPermissions = async () => {
    try {
      const response = await permissionApi.getUserPermissions()
      
      if (response.success) {
        permissions.value = response.data.effectivePermissions
        roles.value = response.data.roles
        return response.data
      } else {
        console.error('Failed to get user permissions:', response.message)
        return null
      }
    } catch (error) {
      console.error('Get user permissions error:', error)
      return null
    }
  }

  const checkPermission = async (permission: string) => {
    try {
      const response = await permissionApi.checkPermission(permission)
      return response.success ? response.data.hasPermission : false
    } catch (error) {
      console.error('Check permission error:', error)
      return false
    }
  }

  const initializeFromStorage = () => {
    const storedToken = localStorage.getItem('token')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedUserInfo = localStorage.getItem('userInfo')
    
    if (storedToken && storedRefreshToken && storedUserInfo) {
      token.value = storedToken
      refreshToken.value = storedRefreshToken
      
      try {
        userInfo.value = JSON.parse(storedUserInfo)
        // 获取最新的用户权限
        getUserPermissions()
      } catch (error) {
        console.error('Failed to parse stored user info:', error)
        clearUserData()
      }
    }
  }

  const validateToken = async () => {
    if (!token.value) return false
    
    try {
      const response = await authApi.verifyToken(token.value)
      
      if (response.success && response.data.valid) {
        if (response.data.user) {
          userInfo.value = response.data.user
        }
        return true
      } else {
        // Token无效，尝试刷新
        return await refreshAccessToken()
      }
    } catch (error) {
      console.error('Token validation error:', error)
      return await refreshAccessToken()
    }
  }

  return {
    // 状态
    token: readonly(token),
    refreshToken: readonly(refreshToken),
    userInfo: readonly(userInfo),
    permissions: readonly(permissions),
    roles: readonly(roles),
    isLoading: readonly(isLoading),
    
    // 计算属性
    isLoggedIn,
    userName,
    userEmail,
    userAvatar,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    
    // 动作
    login,
    logout,
    clearUserData,
    refreshAccessToken,
    getCurrentUser,
    updateProfile,
    changePassword,
    getUserPermissions,
    checkPermission,
    initializeFromStorage,
    validateToken
  }
})