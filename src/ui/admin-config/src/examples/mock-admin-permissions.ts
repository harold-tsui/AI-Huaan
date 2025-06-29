/**
 * 示例：如何为admin账号mock权限信息
 */

import { mockAdminPermissions, isSuperAdmin, isAdmin, hasPermission } from '@/utils/permission'

// 示例函数：在开发环境中为admin账号设置mock权限
export function setupMockAdminPermissions() {
  // 仅在开发环境中启用
  if (import.meta.env.DEV) {
    console.log('正在为admin账号设置mock权限信息...')
    
    // 调用mock函数设置权限
    const permissions = mockAdminPermissions()
    
    // 打印权限信息
    console.log('已设置admin权限信息:', permissions)
    
    // 验证权限是否生效
    console.log('是否为超级管理员:', isSuperAdmin())
    console.log('是否为管理员:', isAdmin())
    console.log('是否拥有所有权限:', hasPermission('*'))
    
    return true
  }
  
  return false
}

// 示例：在应用初始化时调用
// 可以在main.ts或App.vue的created/mounted钩子中调用
// setupMockAdminPermissions()

/**
 * 示例：在登录成功后设置mock权限
 * 
 * 在登录组件或登录逻辑中：
 * 
 * import { setupMockAdminPermissions } from '@/examples/mock-admin-permissions'
 * 
 * // 登录成功后
 * if (username === 'admin') {
 *   setupMockAdminPermissions()
 * }
 */