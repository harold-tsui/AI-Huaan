/**
 * 权限管理工具函数
 */

// 权限类型定义
export interface Permission {
  id: string
  name: string
  code: string
  description?: string
  resource?: string
  action?: string
  conditions?: Record<string, any>
}

// 角色类型定义
export interface Role {
  id: string
  name: string
  code: string
  description?: string
  permissions: string[] // 权限ID数组
  level?: number
}

// 用户权限信息
export interface UserPermissions {
  userId: string
  roles: Role[]
  permissions: Permission[]
  directPermissions?: Permission[] // 直接分配的权限
}

// 权限检查选项
export interface PermissionCheckOptions {
  requireAll?: boolean // 是否需要所有权限都满足
  checkConditions?: boolean // 是否检查权限条件
  context?: Record<string, any> // 上下文信息
}

// 权限管理器类
export class PermissionManager {
  private userPermissions: UserPermissions | null = null
  private permissionCache = new Map<string, boolean>()
  
  constructor(userPermissions?: UserPermissions) {
    if (userPermissions) {
      this.setUserPermissions(userPermissions)
    }
  }
  
  // 设置用户权限信息
  setUserPermissions(userPermissions: UserPermissions): void {
    this.userPermissions = userPermissions
    this.clearCache()
  }
  
  // 清除权限缓存
  clearCache(): void {
    this.permissionCache.clear()
  }
  
  // 获取用户所有权限
  getAllPermissions(): Permission[] {
    if (!this.userPermissions) return []
    
    const allPermissions = [...this.userPermissions.permissions]
    
    // 添加直接分配的权限
    if (this.userPermissions.directPermissions) {
      allPermissions.push(...this.userPermissions.directPermissions)
    }
    
    // 去重
    const uniquePermissions = allPermissions.filter(
      (permission, index, self) => 
        self.findIndex(p => p.id === permission.id) === index
    )
    
    return uniquePermissions
  }
  
  // 检查是否有指定权限
  hasPermission(
    permissionCode: string | string[],
    options: PermissionCheckOptions = {}
  ): boolean {
    if (!this.userPermissions) return false
    
    const { requireAll = false, checkConditions = false, context = {} } = options
    const codes = Array.isArray(permissionCode) ? permissionCode : [permissionCode]
    
    // 生成缓存键
    const cacheKey = `${codes.join(',')}:${JSON.stringify(options)}`
    
    // 检查缓存
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!
    }
    
    const allPermissions = this.getAllPermissions()
    
    let result: boolean
    
    if (requireAll) {
      // 需要所有权限都满足
      result = codes.every(code => {
        const permission = allPermissions.find(p => p.code === code)
        if (!permission) return false
        
        if (checkConditions && permission.conditions) {
          return this.checkPermissionConditions(permission.conditions, context)
        }
        
        return true
      })
    } else {
      // 只需要满足其中一个权限
      result = codes.some(code => {
        const permission = allPermissions.find(p => p.code === code)
        if (!permission) return false
        
        if (checkConditions && permission.conditions) {
          return this.checkPermissionConditions(permission.conditions, context)
        }
        
        return true
      })
    }
    
    // 缓存结果
    this.permissionCache.set(cacheKey, result)
    
    return result
  }
  
  // 检查是否有指定角色
  hasRole(roleCode: string | string[], requireAll = false): boolean {
    if (!this.userPermissions) return false
    
    const codes = Array.isArray(roleCode) ? roleCode : [roleCode]
    const userRoles = this.userPermissions.roles
    
    if (requireAll) {
      return codes.every(code => userRoles.some(role => role.code === code))
    } else {
      return codes.some(code => userRoles.some(role => role.code === code))
    }
  }
  
  // 检查权限条件
  private checkPermissionConditions(
    conditions: Record<string, any>,
    context: Record<string, any>
  ): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      const contextValue = context[key]
      
      if (typeof value === 'object' && value !== null) {
        // 复杂条件检查
        if (value.$eq !== undefined && contextValue !== value.$eq) return false
        if (value.$ne !== undefined && contextValue === value.$ne) return false
        if (value.$gt !== undefined && contextValue <= value.$gt) return false
        if (value.$gte !== undefined && contextValue < value.$gte) return false
        if (value.$lt !== undefined && contextValue >= value.$lt) return false
        if (value.$lte !== undefined && contextValue > value.$lte) return false
        if (value.$in !== undefined && !value.$in.includes(contextValue)) return false
        if (value.$nin !== undefined && value.$nin.includes(contextValue)) return false
      } else {
        // 简单相等检查
        if (contextValue !== value) return false
      }
    }
    
    return true
  }
  
  // 获取用户角色
  getUserRoles(): Role[] {
    return this.userPermissions?.roles || []
  }
  
  // 获取最高角色等级
  getHighestRoleLevel(): number {
    const roles = this.getUserRoles()
    return Math.max(...roles.map(role => role.level || 0), 0)
  }
  
  // 检查是否为超级管理员
  isSuperAdmin(): boolean {
    return this.hasRole('super_admin') || this.hasPermission('*')
  }
  
  // 检查是否为管理员
  isAdmin(): boolean {
    return this.hasRole(['admin', 'super_admin'])
  }
  
  // 过滤有权限的菜单项
  filterMenuItems<T extends { permission?: string | string[]; children?: T[] }>(
    menuItems: T[]
  ): T[] {
    return menuItems.filter(item => {
      // 检查当前项权限
      if (item.permission && !this.hasPermission(item.permission)) {
        return false
      }
      
      // 递归过滤子菜单
      if (item.children) {
        item.children = this.filterMenuItems(item.children)
      }
      
      return true
    })
  }
  
  // 检查资源操作权限
  canAccessResource(
    resource: string,
    action: string,
    context: Record<string, any> = {}
  ): boolean {
    const allPermissions = this.getAllPermissions()
    
    // 查找匹配的权限
    const matchingPermissions = allPermissions.filter(permission => {
      if (permission.resource === '*' || permission.resource === resource) {
        if (permission.action === '*' || permission.action === action) {
          return true
        }
      }
      return false
    })
    
    if (matchingPermissions.length === 0) return false
    
    // 检查权限条件
    return matchingPermissions.some(permission => {
      if (permission.conditions) {
        return this.checkPermissionConditions(permission.conditions, context)
      }
      return true
    })
  }
}

// 全局权限管理器实例
export const permissionManager = new PermissionManager()

// 权限检查函数
export function hasPermission(
  permissionCode: string | string[],
  options?: PermissionCheckOptions
): boolean {
  return permissionManager.hasPermission(permissionCode, options)
}

// 角色检查函数
export function hasRole(roleCode: string | string[], requireAll = false): boolean {
  return permissionManager.hasRole(roleCode, requireAll)
}

// 资源访问权限检查
export function canAccessResource(
  resource: string,
  action: string,
  context?: Record<string, any>
): boolean {
  return permissionManager.canAccessResource(resource, action, context)
}

// 超级管理员检查
export function isSuperAdmin(): boolean {
  return permissionManager.isSuperAdmin()
}

// 管理员检查
export function isAdmin(): boolean {
  return permissionManager.isAdmin()
}

// 权限指令工具函数（用于Vue指令）
export function checkPermissionDirective(
  el: HTMLElement,
  binding: {
    value: string | string[] | {
      permission?: string | string[]
      role?: string | string[]
      requireAll?: boolean
      context?: Record<string, any>
    }
    modifiers: Record<string, boolean>
  }
): void {
  let hasAccess = false
  
  if (typeof binding.value === 'string' || Array.isArray(binding.value)) {
    // 简单权限检查
    hasAccess = hasPermission(binding.value, {
      requireAll: binding.modifiers.all
    })
  } else if (typeof binding.value === 'object' && binding.value !== null) {
    // 复杂权限检查
    const { permission, role, requireAll, context } = binding.value
    
    if (permission) {
      hasAccess = hasPermission(permission, { requireAll, context })
    } else if (role) {
      hasAccess = hasRole(role, requireAll)
    }
  }
  
  // 根据权限结果显示/隐藏元素
  if (binding.modifiers.hide) {
    el.style.visibility = hasAccess ? 'visible' : 'hidden'
  } else {
    el.style.display = hasAccess ? '' : 'none'
  }
  
  // 禁用元素
  if (binding.modifiers.disable) {
    const element = el as HTMLInputElement | HTMLButtonElement
    element.disabled = !hasAccess
  }
}

// 权限路由守卫
export function createPermissionGuard() {
  return (to: any, _from: any, next: any) => {
    // 检查路由权限
    if (to.meta?.permission) {
      if (hasPermission(to.meta.permission)) {
        next()
      } else {
        // 无权限，跳转到403页面或登录页面
        next({ name: 'Forbidden' })
      }
    } else if (to.meta?.role) {
      if (hasRole(to.meta.role)) {
        next()
      } else {
        next({ name: 'Forbidden' })
      }
    } else {
      next()
    }
  }
}

// 权限常量
export const PERMISSIONS = {
  // 系统管理
  SYSTEM_CONFIG_VIEW: 'system:config:view',
  SYSTEM_CONFIG_EDIT: 'system:config:edit',
  SYSTEM_LOG_VIEW: 'system:log:view',
  SYSTEM_BACKUP_CREATE: 'system:backup:create',
  SYSTEM_BACKUP_RESTORE: 'system:backup:restore',
  
  // 用户管理
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  USER_BAN: 'user:ban',
  
  // 知识管理
  KNOWLEDGE_VIEW: 'knowledge:view',
  KNOWLEDGE_CREATE: 'knowledge:create',
  KNOWLEDGE_EDIT: 'knowledge:edit',
  KNOWLEDGE_DELETE: 'knowledge:delete',
  KNOWLEDGE_EXPORT: 'knowledge:export',
  KNOWLEDGE_IMPORT: 'knowledge:import',
  
  // PARA管理
  PARA_VIEW: 'para:view',
  PARA_CREATE: 'para:create',
  PARA_EDIT: 'para:edit',
  PARA_DELETE: 'para:delete',
  
  // 数据分析
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export'
} as const

// 角色常量
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  GUEST: 'guest'
} as const

// 预定义角色权限映射
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'], // 超级管理员拥有所有权限
  [ROLES.ADMIN]: [
    PERMISSIONS.SYSTEM_CONFIG_VIEW,
    PERMISSIONS.SYSTEM_CONFIG_EDIT,
    PERMISSIONS.SYSTEM_LOG_VIEW,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_EDIT,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.KNOWLEDGE_VIEW,
    PERMISSIONS.KNOWLEDGE_CREATE,
    PERMISSIONS.KNOWLEDGE_EDIT,
    PERMISSIONS.KNOWLEDGE_DELETE,
    PERMISSIONS.PARA_VIEW,
    PERMISSIONS.PARA_CREATE,
    PERMISSIONS.PARA_EDIT,
    PERMISSIONS.PARA_DELETE,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.KNOWLEDGE_VIEW,
    PERMISSIONS.KNOWLEDGE_CREATE,
    PERMISSIONS.KNOWLEDGE_EDIT,
    PERMISSIONS.PARA_VIEW,
    PERMISSIONS.PARA_CREATE,
    PERMISSIONS.PARA_EDIT,
    PERMISSIONS.ANALYTICS_VIEW
  ],
  [ROLES.USER]: [
    PERMISSIONS.KNOWLEDGE_VIEW,
    PERMISSIONS.KNOWLEDGE_CREATE,
    PERMISSIONS.PARA_VIEW,
    PERMISSIONS.PARA_CREATE
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.KNOWLEDGE_VIEW,
    PERMISSIONS.PARA_VIEW
  ]
} as const