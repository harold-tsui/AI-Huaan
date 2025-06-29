import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi, permissionApi } from '@/api'
import type { UserInfo, LoginParams } from '@/api/types'
import { permissionManager } from '@/utils/permission'
import type { UserPermissions } from '@/utils/permission'
import { response } from 'express'

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
    return (permission: string) => {
      // 增加详细日志输出
      if (import.meta.env.DEV) {
        console.log(`检查权限 [${permission}]:`, {
          当前权限列表: permissions.value,
          是否拥有此权限: permissions.value.includes(permission),
          是否拥有通配符权限: permissions.value.includes('*'),
          权限管理器检查结果: permissionManager.hasPermission(permission)
        })
      }
      
      // 首先检查通配符权限
      if (permissions.value.includes('*')) {
        return true
      }
      
      return permissions.value.includes(permission) || permissionManager.hasPermission(permission)
    }
  })
  
  const hasRole = computed(() => {
    return (role: string) => {
      // 增加详细日志输出
      if (import.meta.env.DEV) {
        console.log(`检查角色 [${role}]:`, {
          当前角色列表: roles.value,
          是否拥有此角色: roles.value.includes(role),
          权限管理器检查结果: permissionManager.hasRole(role),
          是否为超级管理员: permissionManager.isSuperAdmin(),
          是否为管理员: permissionManager.isAdmin()
        })
      }
      
      // 如果是超级管理员，拥有所有角色权限
      if (permissionManager.isSuperAdmin()) {
        return true
      }
      
      return roles.value.includes(role) || permissionManager.hasRole(role)
    }
  })
  const hasAnyPermission = computed(() => {
    return (perms: string[]) => perms.some(perm => permissions.value.includes(perm))
  })
  const hasAllPermissions = computed(() => {
    return (perms: string[]) => perms.every(perm => permissions.value.includes(perm))
  })

  // 前置声明getUserPermissions函数，解决循环引用问题
  let getUserPermissions: () => Promise<any>
  
  // 动作
  const login = async (loginParams: LoginParams) => {
    try {
      isLoading.value = true
      const response = await authApi.login(loginParams)
      
      // 优先检查status属性，然后检查success属性，最后根据code判断
      const isSuccess = response.status !== undefined ? response.status : (response.success !== undefined ? response.success : (response.code === 200))
      
      if (isSuccess) {
        // 确保从正确的位置获取数据
        const responseData = response.data || response
        const { token: accessToken, refreshToken: refresh, userInfo: user } = responseData
        
        // 保存认证信息到状态中
        // 注意：token和refreshToken现在通过cookie传递，但我们仍然在状态中保存它们以便于前端逻辑判断
        token.value = accessToken
        refreshToken.value = refresh
        userInfo.value = user
        
        // 只保存userInfo到localStorage，token和refreshToken由cookie处理
        localStorage.setItem('userInfo', JSON.stringify(user))
        
        // 获取用户权限
        try {
          await getUserPermissions()
        } catch (permError) {
          // 安全地记录错误，不需要访问permError.message
          console.warn('获取用户权限失败，但登录成功:', permError)
          // 权限获取失败不应该影响登录流程
        }
        
        return Promise.resolve()
      } else {
        // 安全地获取错误消息
        let errorMessage = '登录失败';
        if (response.message) {
          errorMessage = response.message;
        } else if (response.data && typeof response.data === 'object' && 'message' in response.data) {
          errorMessage = response.data.message as string;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      // 重新抛出错误，但不需要类型断言
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    console.log('执行登出操作')
    try {
      // 调用登出API
      if (token.value) {
        await authApi.logout()
      }
    } catch (error) {
      console.error('登出API错误:', error)
      // 登出API错误不影响后续清理操作
    } finally {
      // 清除本地状态
      clearUserData()
      console.log('用户数据已清除')
      ElMessage.success('已退出登录')
    }
    return Promise.resolve()
  }

  const clearUserData = () => {
    token.value = ''
    refreshToken.value = ''
    userInfo.value = null
    permissions.value = []
    roles.value = []
    
    // 清除权限管理器
    permissionManager.clearCache()
    
    // 清除localStorage中的userInfo
    // 注意：token和refreshToken由cookie处理，会在logout API中清除
    localStorage.removeItem('userInfo')
  }

  const refreshAccessToken = async () => {
    // 刷新token不再需要传递refreshToken参数，因为它会通过cookie自动发送
    // 但我们仍然检查状态中是否有refreshToken，以便于前端逻辑判断
    if (!refreshToken.value) {
      console.error('没有可用的刷新令牌')
      return false
    }
    
    console.log('开始刷新token...')
    try {
      // 不再需要传递refreshToken参数
      const response = await authApi.refreshToken()
      
      if (response.status || response.success) {
        console.log('Token刷新成功，更新状态')
        const { token: newToken, refreshToken: newRefreshToken } = response.data
        
        // 更新状态中的token信息
        token.value = newToken
        refreshToken.value = newRefreshToken
        
        // 不再需要保存到localStorage，因为token和refreshToken由cookie处理
        
        // 记录token信息，帮助调试
        if (import.meta.env.DEV) {
          console.log('新token信息已更新，时间:', new Date().toISOString())
        }
        
        return true
      } else {
        console.error('Token刷新失败:', response)
        clearUserData()
        return false
      }
    } catch (error) {
      console.error('Token刷新出错:', error)
      clearUserData()
      return false
    }
  }

  const getCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser()
      
      if (response.status || response.success) {
        userInfo.value = response.data
        localStorage.setItem('userInfo', JSON.stringify(response.data))
        
        // 获取用户权限信息
        await getUserPermissions()
        
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
      
      if (response.status || response.success) {
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
      
      // 优先检查status属性，然后检查success属性，最后根据code判断
      const isSuccess = response.status !== undefined ? response.status : (response.success !== undefined ? response.success : (response.code === 200))
      
      if (isSuccess) {
        ElMessage.success('密码修改成功，请重新登录')
        // 调用logout方法，不需要await因为它返回void
        logout()
        return true
      } else {
        // 安全地获取错误消息
        let errorMessage = '密码修改失败';
        if (response.message) {
          errorMessage = response.message;
        }
        // response.data是void类型，不需要检查它的message属性
        ElMessage.error(errorMessage);
        return false;
      }
    } catch (error) {
      // 安全地处理错误消息
      let errorMessage = '密码修改失败';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = error.message as string;
      }
      ElMessage.error(errorMessage);
      return false
    } finally {
      isLoading.value = false
    }
  }

  getUserPermissions = async () => {
    try {
      const response = (await permissionApi.getUserPermissions())
      
      console.log('权限API响应:', response)
      
      // 优先检查status属性，然后检查success属性，最后根据code判断
      const isSuccess = response.status !== undefined ? response.status : (response.success !== undefined ? response.success : (response.code === 200))
      
      if (isSuccess) {
        // 处理嵌套的data结构
        // 根据用户提供的实际响应数据结构：response.data.data.data
        let responseData: any = response.data || response
        
        console.log('第一层响应数据:', responseData)
        
        // 处理第一层嵌套
        if (responseData && responseData.data && typeof responseData.data === 'object') {
          console.log('检测到第一层嵌套data:', responseData.data)
          responseData = responseData.data
          
          // 处理第二层嵌套
          if (responseData && responseData.data && typeof responseData.data === 'object') {
            console.log('检测到第二层嵌套data:', responseData.data)
            responseData = responseData.data
          }
        }
        
        console.log('最终处理后的响应数据:', responseData)
        
        // 确保数据结构正确
        const effectivePermissions = responseData.effectivePermissions || []
        let userRoles = responseData.roles || []
        
        // 确保权限和角色不为空
        if (effectivePermissions.length === 0 && import.meta.env.DEV) {
          console.warn('权限列表为空，在开发环境中添加默认权限')
          effectivePermissions.push('*')
        }
        
        if (userRoles.length === 0 && import.meta.env.DEV) {
          console.warn('角色列表为空，在开发环境中添加默认角色')
          userRoles.push({ code: 'admin', name: '管理员' })
          console.log('添加默认角色后:', userRoles)
        }
        
        // 在开发环境中，确保角色格式正确
        if (import.meta.env.DEV) {
          userRoles = userRoles.map((role: any) => {
            if (typeof role === 'string') {
              console.log('将字符串角色转换为对象:', role)
              return { code: role, name: role }
            }
            return role
          })
          console.log('处理后的角色列表:', userRoles)
        }
        
        console.log('处理后的权限列表:', effectivePermissions)
        console.log('处理后的角色列表:', userRoles)
        
        // 处理角色数据，确保我们有一个角色代码的数组
        const rolesCodes = userRoles.map((role: any) => {
          // 如果角色是对象，提取code属性
          if (typeof role === 'object' && role !== null && 'code' in role) {
            return role.code;
          }
          // 如果角色是字符串，直接使用
          return role;
        });
        
        // 更新状态
        permissions.value = effectivePermissions
        roles.value = rolesCodes
        
        console.log('获取到的权限信息:', {
          permissions: effectivePermissions,
          roles: rolesCodes
        })
        
        // 更新权限管理器
        const userPermissions: UserPermissions = {
          userId: userInfo.value?.id || 'dev-user',
          roles: userRoles.map((role: any) => {
            // 如果角色已经是对象格式
            if (typeof role === 'object' && role !== null && 'code' in role) {
              return {
                id: role.code,
                name: role.name || role.code,
                code: role.code,
                permissions: ['*'], // 为角色添加所有权限
                level: role.level || 100
              };
            }
            // 如果角色是字符串
            const roleCode = String(role);
            return {
              id: roleCode,
              name: roleCode,
              code: roleCode,
              permissions: ['*'], // 为角色添加所有权限
              level: 100
            };
          }),
          permissions: effectivePermissions.map((permCode: string) => ({
            id: permCode,
            name: permCode,
            code: permCode
          })),
          // 添加直接权限
          directPermissions: effectivePermissions.map((permCode: string) => ({
            id: permCode,
            name: permCode,
            code: permCode
          }))
        }
        
        console.log('更新权限管理器:', userPermissions)
        permissionManager.setUserPermissions(userPermissions)
        
        // 返回包含权限和角色的对象
        return {
          effectivePermissions,
          roles: userRoles
        }
      } else {
        // 安全地获取错误消息
        let errorMessage = '获取权限失败';
        if (response.message) {
          errorMessage = response.message;
        } else if (response.data && typeof response.data === 'object' && 'message' in response.data) {
          errorMessage = response.data.message as string;
        }
        console.error('Failed to get user permissions:', errorMessage);
        return null;
      }
    } catch (error) {
      console.error('Get user permissions error:', error)
      return null
    }
  }

  const checkPermission = async (permission: string) => {
    try {
      const response = await permissionApi.checkPermission(permission)
      
      // 优先检查status属性，然后检查success属性，最后根据code判断
      const isSuccess = response.status !== undefined ? response.status : (response.success !== undefined ? response.success : (response.code === 200))
      
      if (isSuccess) {
        // 确保从正确的位置获取数据
        const responseData = response.data || response
        return responseData.hasPermission || false
      }
      return false
    } catch (error) {
      console.error('Check permission error:', error)
      return false
    }
  }

  const initializeFromStorage = async () => {
    // 在cookie认证方式下，我们不再从localStorage获取token和refreshToken
    // 而是通过验证token接口来检查cookie中的token是否有效
    const storedUserInfo = localStorage.getItem('userInfo')
    
    try {
      // 尝试从cookie验证token
      console.log('初始化：尝试验证cookie中的token...')
      try {
        const response = await authApi.verifyToken()
        // 检查响应是否有效
        if (response && 
            ((typeof response.status !== 'undefined' && response.status) || 
             (typeof response.success !== 'undefined' && response.success)) && 
            response.data && 
            response.data.valid) {
          
          console.log('Cookie中的token有效，初始化用户状态')
          // 设置token状态，虽然我们不知道具体的token值，但我们知道它是有效的
          // 设置一个占位符值，用于前端逻辑判断
          token.value = 'valid-token-in-cookie'
          refreshToken.value = 'valid-refresh-token-in-cookie'
          
          // 如果响应中包含用户信息，则使用它
          if (response.data.user) {
            userInfo.value = response.data.user
            localStorage.setItem('userInfo', JSON.stringify(response.data.user))
          } else if (storedUserInfo) {
            // 否则尝试从localStorage获取用户信息
            userInfo.value = JSON.parse(storedUserInfo) as UserInfo
          }
          
          // 获取最新的用户权限
          getUserPermissions()
        } else if (storedUserInfo) {
          // 如果cookie中没有有效token，但有存储的用户信息，尝试恢复用户状态
          console.log('Cookie中没有有效token，但有存储的用户信息，尝试恢复用户状态')
          userInfo.value = JSON.parse(storedUserInfo) as UserInfo
        } else {
          // 清除权限管理器
          console.log('没有有效的认证信息，清除权限缓存')
          permissionManager.clearCache()
        }
      } catch (err) {
        console.log('验证token失败，可能是cookie中没有token:', err)
        
        // 如果有存储的用户信息，尝试恢复用户状态
        if (storedUserInfo) {
          console.log('尝试从localStorage恢复用户信息')
          userInfo.value = JSON.parse(storedUserInfo) as UserInfo
        } else {
          // 清除权限管理器
          console.log('没有有效的认证信息，清除权限缓存')
          permissionManager.clearCache()
        }
      }
    } catch (error: any) {
      console.error('初始化用户状态失败:', error.message)
      clearUserData()
    }
    
    // 在开发环境中，即使没有存储的用户信息，也尝试获取权限
    // 这样可以确保mockAdminPermissions能正常工作
    if (import.meta.env.DEV) {
      console.log('开发环境：尝试获取模拟权限')
      // 设置一个默认的用户ID，确保权限管理器能正常工作
      if (!userInfo.value) {
        userInfo.value = { 
          id: 'dev-user', 
          username: 'Dev User',
          email: 'dev@example.com',
          roles: [],
          permissions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as UserInfo
      }
      // 延迟一点执行，确保mockAdminPermissions已经执行
      setTimeout(() => {
        getUserPermissions()
      }, 200)
    }
  }

  const validateToken = async () => {
    // 如果前端状态中没有token，直接返回false
    if (!token.value) return false
    
    try {
      console.log('验证token有效性...')
      // 不再需要传递token参数，因为它会通过cookie自动发送
      const response = await authApi.verifyToken()
      
      if ((response.status || response.success) && response.data.valid) {
        console.log('Token验证成功')
        if (response.data.user) {
          console.log('更新用户信息')
          userInfo.value = response.data.user
        }
        return true
      } else {
        console.log('Token无效，尝试刷新')
        // Token无效，尝试刷新
        return await refreshAccessToken()
      }
    } catch (error) {
      console.error('Token验证出错:', error)
      console.log('验证出错，尝试刷新token')
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
    initializeFromStorage,
    login,
    logout,
    clearUserData,
    refreshAccessToken,
    getCurrentUser,
    updateProfile,
    changePassword,
    getUserPermissions,
    checkPermission,
    validateToken
  }
})