/**
 * 开发环境模拟用户和权限
 */
import { permissionManager, mockAdminPermissions } from './permission'
import { useUserStore } from '@/stores/modules/user'

// 开发环境用户信息
const devUserInfo = {
  id: 'dev-user',
  username: '开发测试用户',
  email: 'dev@example.com',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  roles: ['admin'],
  permissions: ['*'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

/**
 * 初始化开发环境的模拟用户和权限
 * 在路由守卫之前调用此函数，可以模拟一个已登录的用户
 */
export async function initDevMockUser() {
  try {
    if (!import.meta.env.DEV) {
      console.warn('initDevMockUser 只能在开发环境中使用')
      return
    }
    
    console.log('初始化开发环境模拟用户...')
    const userStore = useUserStore()
    console.log('userStore获取成功:', userStore)
    
    // 检查是否已经有用户登录
    if (userStore.isLoggedIn) {
      console.log('已有用户登录，不需要模拟')
      return
    }
    
    // 先设置cookie，确保验证token时能通过
    console.log('设置开发环境模拟token cookie')
    document.cookie = `token=dev-mock-token; path=/; max-age=86400`
    document.cookie = `refreshToken=dev-mock-refresh-token; path=/; max-age=86400`
    console.log('Cookie设置成功')
    
    // 模拟用户信息 - 使用localStorage存储，然后通过initializeFromStorage加载
    console.log('设置开发环境模拟用户信息')
    localStorage.setItem('userInfo', JSON.stringify(devUserInfo))
    console.log('localStorage设置成功')
    
    // 不能直接通过$patch设置userInfo，因为它是只读的ref对象
    // 使用clearUserData和内部方法来正确设置用户信息
    userStore.clearUserData() // 先清除现有数据
    // 然后通过localStorage和initializeFromStorage来设置
    console.log('通过初始化方法设置userStore.userInfo')
    
    // 模拟管理员权限
    console.log('设置开发环境模拟权限')
    const mockPermissions = mockAdminPermissions()
    console.log('模拟权限获取成功:', mockPermissions)
    
    // 使用permissionManager设置权限
    const userPermissions = {
      userId: devUserInfo.id,
      roles: mockPermissions.roles,
      permissions: mockPermissions.permissions,
      directPermissions: mockPermissions.directPermissions
    }
    console.log('准备设置权限管理器:', userPermissions)
    permissionManager.setUserPermissions(userPermissions)
    console.log('权限管理器设置成功')
    
    // 初始化用户状态
    console.log('准备初始化用户状态...')
    await userStore.initializeFromStorage()
    console.log('用户状态初始化完成')
    
    // 如果初始化后仍未登录，尝试再次初始化
    if (!userStore.isLoggedIn) {
      console.log('初始化后仍未登录，等待200ms后再次尝试')
      
      // 等待一段时间后再次初始化
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 不能直接通过$patch设置只读属性
      // 再次确保localStorage中有正确的用户信息
      localStorage.setItem('userInfo', JSON.stringify(devUserInfo))
      // 设置cookie以确保token验证通过
      document.cookie = `token=dev-mock-token; path=/; max-age=86400`
      document.cookie = `refreshToken=dev-mock-refresh-token; path=/; max-age=86400`
      console.log('再次设置localStorage和cookie成功')
      
      // 再次初始化
      console.log('再次初始化用户状态...')
      await userStore.initializeFromStorage()
      console.log('再次初始化完成')
    }
    
    console.log('开发环境模拟用户初始化完成:', {
      isLoggedIn: userStore.isLoggedIn,
      user: userStore.userName,
      roles: userStore.roles,
      permissions: userStore.permissions.length > 10 
        ? `${userStore.permissions.slice(0, 10).join(', ')}... (共${userStore.permissions.length}个)` 
        : userStore.permissions.join(', ')
    })
    
    return userStore
  } catch (error) {
    console.error('开发环境模拟用户初始化出错:', error)
    throw error
  }
}

/**
 * 检查是否需要自动模拟用户
 * 可以在main.ts中调用此函数，根据环境变量决定是否自动模拟用户
 */
export function checkAutoMockUser() {
  if (import.meta.env.DEV && import.meta.env.VITE_AUTO_MOCK_USER === 'true') {
    console.log('自动模拟开发环境用户已启用')
    initDevMockUser()
  }
}