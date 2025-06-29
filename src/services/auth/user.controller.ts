import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { requirePermission } from '../../middleware/auth.middleware'
import { Logger } from '../../utils/logger'

const logger = new Logger('UserController')

// 用户接口定义
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
  loginCount: number;
  banReason?: string;
}

// 用户批量操作接口定义
interface UserOperation {
  userId: string;
  action: 'activate' | 'deactivate' | 'ban' | 'delete';
  data?: {
    reason?: string;
    [key: string]: any;
  };
}

// 操作错误接口定义
interface OperationError {
  userId: string;
  error: string;
}

// 活动日志查询参数接口
interface ActivityLogQueryParams {
  page?: number | string;
  pageSize?: number | string;
  startDate?: string;
  endDate?: string;
  type?: string;
  sortOrder?: 'asc' | 'desc';
}

// 模拟用户数据
const users: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'hashed_password', // 实际应用中应该是哈希后的密码
    roles: ['admin'],
    status: 'active',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    lastLogin: '2023-06-01T10:30:00Z',
    loginCount: 42
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    password: 'hashed_password',
    roles: ['user'],
    status: 'active',
    createdAt: '2023-02-15T00:00:00Z',
    updatedAt: '2023-02-15T00:00:00Z',
    lastLogin: '2023-05-28T14:20:00Z',
    loginCount: 15
  },
  {
    id: '3',
    username: 'user2',
    email: 'user2@example.com',
    password: 'hashed_password',
    roles: ['user'],
    status: 'inactive',
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2023-03-10T00:00:00Z',
    lastLogin: null,
    loginCount: 0
  }
]

// 模拟用户活动日志
const activityLogs = [
  {
    id: '1',
    userId: '1',
    type: 'login',
    action: 'User logged in',
    details: { ip: '192.168.1.1', userAgent: 'Chrome/90.0.4430.212' },
    createdAt: '2023-06-01T10:30:00Z'
  },
  {
    id: '2',
    userId: '1',
    type: 'settings',
    action: 'User updated profile',
    details: { fields: ['email'] },
    createdAt: '2023-05-30T15:45:00Z'
  },
  {
    id: '3',
    userId: '2',
    type: 'login',
    action: 'User logged in',
    details: { ip: '192.168.1.2', userAgent: 'Firefox/89.0' },
    createdAt: '2023-05-28T14:20:00Z'
  }
]

// 模拟用户通知
const notifications = [
  {
    id: '1',
    userId: '1',
    type: 'system',
    title: 'Welcome to the platform',
    message: 'Thank you for joining our platform!',
    read: true,
    createdAt: '2023-01-01T00:10:00Z'
  },
  {
    id: '2',
    userId: '1',
    type: 'security',
    title: 'New login detected',
    message: 'A new login was detected from Chrome on Windows.',
    read: false,
    createdAt: '2023-06-01T10:30:00Z'
  },
  {
    id: '3',
    userId: '2',
    type: 'system',
    title: 'Welcome to the platform',
    message: 'Thank you for joining our platform!',
    read: true,
    createdAt: '2023-02-15T00:10:00Z'
  }
]

// 用户控制器
class UserController {
  // 获取用户列表（管理员功能）
  async getUsers(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        pageSize = 10, 
        search, 
        role, 
        status, 
        sortBy = 'username', 
        sortOrder = 'asc' 
      } = req.query as any
      
      // 过滤用户
      let filteredUsers = [...users]
      
      if (search) {
        const searchLower = search.toLowerCase()
        filteredUsers = filteredUsers.filter(user => 
          user.username.toLowerCase().includes(searchLower) || 
          user.email.toLowerCase().includes(searchLower)
        )
      }
      
      if (role) {
        filteredUsers = filteredUsers.filter(user => 
          user.roles.includes(role)
        )
      }
      
      if (status) {
        filteredUsers = filteredUsers.filter(user => 
          user.status === status
        )
      }
      
      // 排序
      filteredUsers.sort((a, b) => {
        let aValue = a[sortBy as keyof User]
        let bValue = b[sortBy as keyof User]
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }
        
        // 处理空值情况
        if (aValue === null || aValue === undefined) return sortOrder === 'asc' ? -1 : 1
        if (bValue === null || bValue === undefined) return sortOrder === 'asc' ? 1 : -1
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
      
      // 分页
      const startIndex = (page - 1) * pageSize
      const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize)
      
      // 移除敏感信息
      const safeUsers = paginatedUsers.map(({ password, ...user }) => user)
      
      return res.json({
        success: true,
        data: {
          list: safeUsers,
          total: filteredUsers.length,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(filteredUsers.length / pageSize)
        }
      })
    } catch (error) {
      logger.error('Error getting users:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve users',
        error: (error as Error).message
      })
    }
  }
  
  // 获取单个用户详情（管理员功能）
  async getUser(req: Request, res: Response) {
    try {
      const { userId } = req.params
      
      const user = users.find(u => u.id === userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 移除敏感信息
      const { password, ...safeUser } = user
      
      return res.json({
        success: true,
        data: safeUser
      })
    } catch (error) {
      logger.error('Error getting user:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user',
        error: (error as Error).message
      })
    }
  }
  
  // 创建用户（管理员功能）
  async createUser(req: Request, res: Response) {
    try {
      const { username, email, password, roles = ['user'], status = 'active' } = req.body
      
      // 验证必填字段
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email and password are required'
        })
      }
      
      // 检查用户名和邮箱是否已存在
      const existingUser = users.find(
        u => u.username === username || u.email === email
      )
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists'
        })
      }
      
      // 创建新用户
      const now = new Date().toISOString()
      const newUser = {
        id: uuidv4(),
        username,
        email,
        password, // 实际应用中应该哈希密码
        roles,
        status,
        createdAt: now,
        updatedAt: now,
        lastLogin: null,
        loginCount: 0
      }
      
      users.push(newUser)
      
      // 移除敏感信息
      const { password: _, ...safeUser } = newUser
      
      return res.status(201).json({
        success: true,
        data: safeUser
      })
    } catch (error) {
      logger.error('Error creating user:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to create user',
        error: (error as Error).message
      })
    }
  }
  
  // 更新用户（管理员功能）
  async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { username, email, roles, status } = req.body
      
      const userIndex = users.findIndex(u => u.id === userId)
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 检查用户名和邮箱是否已被其他用户使用
      if (username || email) {
        const existingUser = users.find(
          u => u.id !== userId && (username && u.username === username || email && u.email === email)
        )
        
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Username or email already exists'
          })
        }
      }
      
      // 更新用户
      const updatedUser = {
        ...users[userIndex],
        ...(username && { username }),
        ...(email && { email }),
        ...(roles && { roles }),
        ...(status && { status }),
        updatedAt: new Date().toISOString()
      }
      
      users[userIndex] = updatedUser
      
      // 移除敏感信息
      const { password, ...safeUser } = updatedUser
      
      return res.json({
        success: true,
        data: safeUser
      })
    } catch (error) {
      logger.error('Error updating user:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to update user',
        error: (error as Error).message
      })
    }
  }
  
  // 删除用户（管理员功能）
  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params
      
      const userIndex = users.findIndex(u => u.id === userId)
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 删除用户
      users.splice(userIndex, 1)
      
      return res.json({
        success: true,
        message: 'User deleted successfully'
      })
    } catch (error) {
      logger.error('Error deleting user:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: (error as Error).message
      })
    }
  }
  
  // 重置用户密码（管理员功能）
  async resetUserPassword(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { newPassword } = req.body
      
      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password is required'
        })
      }
      
      const userIndex = users.findIndex(u => u.id === userId)
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 更新密码
      users[userIndex] = {
        ...users[userIndex],
        password: newPassword, // 实际应用中应该哈希密码
        updatedAt: new Date().toISOString()
      }
      
      return res.json({
        success: true,
        message: 'Password reset successfully'
      })
    } catch (error) {
      logger.error('Error resetting password:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to update password',
        error: (error as Error).message
      })
    }
  }
  
  // 禁用用户（管理员功能）
  async banUser(req: Request, res: Response) {
    try {
      const { userId } = req.params
      const { reason } = req.body
      
      const userIndex = users.findIndex(u => u.id === userId)
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 禁用用户
      users[userIndex] = {
        ...users[userIndex],
        status: 'banned',
        banReason: reason,
        updatedAt: new Date().toISOString()
      }
      
      return res.json({
        success: true,
        message: 'User banned successfully'
      })
    } catch (error) {
      logger.error('Error banning user:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to ban user',
        error: (error as Error).message
      })
    }
  }
  
  // 启用用户（管理员功能）
  async unbanUser(req: Request, res: Response) {
    try {
      const { userId } = req.params
      
      const userIndex = users.findIndex(u => u.id === userId)
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 启用用户
      users[userIndex] = {
        ...users[userIndex],
        status: 'active',
        banReason: undefined,
        updatedAt: new Date().toISOString()
      }
      
      return res.json({
        success: true,
        message: 'User unbanned successfully'
      })
    } catch (error) {
      logger.error('Error unbanning user:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to unban user',
        error: (error as Error).message
      })
    }
  }
  
  // 强制用户下线（管理员功能）
  async forceLogout(req: Request, res: Response) {
    try {
      const { userId } = req.params
      
      const user = users.find(u => u.id === userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 实际应用中，这里应该使用会话管理系统来终止用户的所有活跃会话
      // 这里只是模拟该功能
      
      return res.json({
        success: true,
        message: 'User forced to logout successfully'
      })
    } catch (error) {
      logger.error('Error forcing logout:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to force logout',
        error: (error as Error).message
      })
    }
  }
  
  // 获取用户统计（管理员功能）
  async getUserStats(req: Request, res: Response) {
    try {
      const total = users.length
      const active = users.filter(u => u.status === 'active').length
      const inactive = users.filter(u => u.status === 'inactive').length
      const banned = users.filter(u => u.status === 'banned').length
      
      // 计算本月新增用户
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const newThisMonth = users.filter(u => new Date(u.createdAt) >= startOfMonth).length
      
      // 计算登录统计
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay())
      const startOfMonthDate = new Date(today.getFullYear(), today.getMonth(), 1)
      
      const loginStats = {
        today: users.filter(u => u.lastLogin && new Date(u.lastLogin) >= today).length,
        thisWeek: users.filter(u => u.lastLogin && new Date(u.lastLogin) >= startOfWeek).length,
        thisMonth: users.filter(u => u.lastLogin && new Date(u.lastLogin) >= startOfMonthDate).length
      }
      
      // 计算角色分布
      const roleDistribution: Record<string, number> = {}
      users.forEach(user => {
        user.roles.forEach(role => {
          if (!roleDistribution[role]) {
            roleDistribution[role] = 0
          }
          roleDistribution[role]++
        })
      })
      
      return res.json({
        success: true,
        data: {
          total,
          active,
          inactive,
          banned,
          newThisMonth,
          loginStats,
          roleDistribution
        }
      })
    } catch (error) {
      logger.error('Error getting user stats:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user statistics',
        error: (error as Error).message
      })
    }
  }
  
  // 批量操作用户（管理员功能）
  // 批量更新用户信息的方法
  async batchUpdateUsers(req: Request, res: Response) {
    try {
      const { operations } = (req as Request).body as { operations: UserOperation[] }
      
      if (!operations || !Array.isArray(operations)) {
        return res.status(400).json({
          success: false,
          message: 'Operations array is required'
        })
      }
      


      const results: {
        success: number;
        failed: number;
        errors: OperationError[];
      } = {
        success: 0,
        failed: 0,
        errors: []
      }
      
      for (const op of operations) {
        const { userId, action, data } = op
        
        try {
          const userIndex = users.findIndex(u => u.id === userId)
          
          if (userIndex === -1) {
            results.failed++
            results.errors.push({
              userId,
              error: 'User not found'
            })
            continue
          }
          
          switch (action) {
            case 'activate':
              users[userIndex] = {
                ...users[userIndex],
                status: 'active',
                updatedAt: new Date().toISOString()
              }
              results.success++
              break
              
            case 'deactivate':
              users[userIndex] = {
                ...users[userIndex],
                status: 'inactive',
                updatedAt: new Date().toISOString()
              }
              results.success++
              break
              
            case 'ban':
              users[userIndex] = {
                ...users[userIndex],
                status: 'banned',
                banReason: data?.reason,
                updatedAt: new Date().toISOString()
              }
              results.success++
              break
              
            case 'delete':
              users.splice(userIndex, 1)
              results.success++
              break
              
            default:
              results.failed++
              results.errors.push({
                userId,
                error: `Unknown action: ${action}`
              })
          }
        } catch (error) {
          results.failed++
          results.errors.push({
            userId,
            error: (error as Error).message
          })
        }
      }
      
      return res.json({
        success: true,
        data: results
      })
    } catch (error) {
      logger.error('Error in batch update:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to perform batch update',
        error: (error as Error).message
      })
    }
  }
  
  // 获取用户权限（管理员功能）
  async getUserPermissions(req: Request, res: Response) {
    try {
      const userId = req.params.userId
      
      const user = users.find(u => u.id === userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 模拟获取用户权限
      // 实际应用中，应该从权限系统中获取用户的角色和权限
      const permissions: string[] = []
      const effectivePermissions: string[] = []
      
      if (user.roles.includes('admin')) {
        permissions.push('admin.access')
        effectivePermissions.push(
          'admin.access',
          'users.view',
          'users.create',
          'users.edit',
          'users.delete',
          'roles.view',
          'roles.create',
          'roles.edit',
          'roles.delete'
        )
      } else if (user.roles.includes('user')) {
        permissions.push('user.access')
        effectivePermissions.push(
          'user.access',
          'profile.view',
          'profile.edit'
        )
      }
      
      return res.json({
        success: true,
        data: {
          permissions,
          roles: user.roles,
          effectivePermissions
        }
      })
    } catch (error) {
      logger.error('Error getting user permissions:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user permissions',
        error: (error as Error).message
      })
    }
  }
  
  // 更新用户权限（管理员功能）
  async updateUserPermissions(req: Request, res: Response) {
    try {
      const userId = req.params.userId
      const { permissions } = req.body as { permissions: string[] }
      
      if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: 'Permissions array is required'
        })
      }
      
      const user = users.find(u => u.id === userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 模拟更新用户权限
      // 实际应用中，应该更新权限系统中的用户权限
      
      // 计算有效权限
      const effectivePermissions: string[] = [...permissions]
      
      // 添加基于角色的权限
      if (user.roles.includes('admin')) {
        effectivePermissions.push(
          'admin.access',
          'users.view',
          'users.create',
          'users.edit',
          'users.delete',
          'roles.view',
          'roles.create',
          'roles.edit',
          'roles.delete'
        )
      } else if (user.roles.includes('user')) {
        effectivePermissions.push(
          'user.access',
          'profile.view',
          'profile.edit'
        )
      }
      
      // 去重
      const uniqueEffectivePermissions: string[] = [...new Set(effectivePermissions)]
      
      return res.json({
        success: true,
        data: {
          permissions,
          effectivePermissions: uniqueEffectivePermissions
        }
      })
    } catch (error) {
      logger.error('Error updating user permissions:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to update user permissions',
        error: (error as Error).message
      })
    }
  }
  


  // 获取用户活动日志（管理员功能）
  async getUserActivityLogs(req: Request, res: Response) {
    try {
      const userId = req.params.userId
      const { 
        page = 1, 
        pageSize = 10, 
        startDate, 
        endDate, 
        type, 
        sortOrder = 'desc' 
      } = req.query as ActivityLogQueryParams
      
      const user = users.find(u => u.id === userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 过滤日志
      let filteredLogs = activityLogs.filter(log => log.userId === userId)
      
      if (startDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.createdAt) >= new Date(startDate)
        )
      }
      
      if (endDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.createdAt) <= new Date(endDate)
        )
      }
      
      if (type) {
        filteredLogs = filteredLogs.filter(log => 
          log.type === type
        )
      }
      
      // 排序
      filteredLogs.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      })
      
      // 分页
      const startIndex = (Number(page) - 1) * Number(pageSize)
      const paginatedLogs = filteredLogs.slice(startIndex, startIndex + Number(pageSize))
      
      return res.json({
        success: true,
        data: {
          list: paginatedLogs,
          total: filteredLogs.length,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(filteredLogs.length / Number(pageSize))
        }
      })
    } catch (error) {
      logger.error('Error getting user activity logs:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user activity logs',
        error: (error as Error).message
      })
    }
  }
  
  // 获取当前用户信息（用户功能）
  async getCurrentUser(req: Request, res: Response) {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      
      const user = users.find(u => u.id === userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 移除敏感信息
      const { password, ...safeUser } = user
      
      return res.json({
        success: true,
        data: safeUser
      })
    } catch (error) {
      logger.error('Error getting current user:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve current user',
        error: (error as Error).message
      })
    }
  }
  
  // 更新用户信息（用户功能）
  async updateProfile(req: Request, res: Response) {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      
      const { email, avatar } = req.body
      
      const userIndex = users.findIndex(u => u.id === userId)
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 检查邮箱是否已被其他用户使用
      if (email) {
        const existingUser = users.find(
          u => u.id !== userId && u.email === email
        )
        
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Email already exists'
          })
        }
      }
      
      // 更新用户
      const updatedUser = {
        ...users[userIndex],
        ...(email && { email }),
        ...(avatar && { avatar }),
        updatedAt: new Date().toISOString()
      }
      
      users[userIndex] = updatedUser
      
      // 移除敏感信息
      const { password, ...safeUser } = updatedUser
      
      return res.json({
        success: true,
        data: safeUser
      })
    } catch (error) {
      logger.error('Error updating profile:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: (error as Error).message
      })
    }
  }
  
  // 修改密码（用户功能）
  async changePassword(req: Request, res: Response) {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      
      const { currentPassword, newPassword, confirmPassword } = req.body
      
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password, new password and confirm password are required'
        })
      }
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password and confirm password do not match'
        })
      }
      
      const userIndex = users.findIndex(u => u.id === userId)
      
      if (userIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 验证当前密码
      if (users[userIndex].password !== currentPassword) { // 实际应用中应该比较哈希值
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        })
      }
      
      // 更新密码
      users[userIndex] = {
        ...users[userIndex],
        password: newPassword, // 实际应用中应该哈希密码
        updatedAt: new Date().toISOString()
      }
      
      return res.json({
        success: true,
        message: 'Password changed successfully'
      })
    } catch (error) {
      logger.error('Error changing password:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: (error as Error).message
      })
    }
  }
  
  // 获取用户的角色（用户功能）
  async getUserRoles(req: Request, res: Response) {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      
      const user = users.find(u => u.id === userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 模拟获取用户角色详情
      // 实际应用中，应该从角色系统中获取角色详情
      const roles = user.roles.map(roleName => {
        if (roleName === 'admin') {
          return {
            id: 'admin',
            name: 'Administrator',
            description: 'Full access to all system features'
          }
        } else if (roleName === 'user') {
          return {
            id: 'user',
            name: 'User',
            description: 'Standard user access'
          }
        }
        return {
          id: roleName,
          name: roleName,
          description: ''
        }
      })
      
      return res.json({
        success: true,
        data: roles
      })
    } catch (error) {
      logger.error('Error getting user roles:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user roles',
        error: (error as Error).message
      })
    }
  }
  
  // 获取用户的权限（用户功能）
  async getCurrentUserPermissions(req: Request, res: Response) {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      
      const user = users.find(u => u.id === userId)
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }
      
      // 模拟获取用户权限
      // 实际应用中，应该从权限系统中获取用户的角色和权限
      const permissions = []
      const effectivePermissions = []
      
      if (user.roles.includes('admin')) {
        permissions.push('admin.access')
        effectivePermissions.push(
          'admin.access',
          'users.view',
          'users.create',
          'users.edit',
          'users.delete',
          'roles.view',
          'roles.create',
          'roles.edit',
          'roles.delete'
        )
      } else if (user.roles.includes('user')) {
        permissions.push('user.access')
        effectivePermissions.push(
          'user.access',
          'profile.view',
          'profile.edit'
        )
      }
      
      return res.json({
        success: true,
        data: {
          permissions,
          roles: user.roles,
          effectivePermissions
        }
      })
    } catch (error) {
      logger.error('Error getting user permissions:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user permissions',
        error: (error as Error).message
      })
    }
  }
  
  // 获取用户所属的用户组（用户功能）
  async getUserGroups(req: Request, res: Response) {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      
      // 模拟获取用户所属的用户组
      // 实际应用中，应该从用户组系统中获取用户所属的用户组
      const userGroups = [
        {
          id: 'group1',
          name: 'Development Team',
          description: 'Software development team',
          joinedAt: '2023-01-15T10:00:00Z'
        },
        {
          id: 'group2',
          name: 'Project Alpha',
          description: 'Project Alpha team members',
          joinedAt: '2023-02-20T14:30:00Z'
        }
      ]
      
      return res.json({
        success: true,
        data: userGroups
      })
    } catch (error) {
      logger.error('Error getting user groups:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user groups',
        error: (error as Error).message
      })
    }
  }
  
  // 获取用户活动日志（用户功能）
  async getActivityLogs(req: Request, res: Response) {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      
      const { 
        page = 1, 
        pageSize = 10, 
        startDate, 
        endDate, 
        type, 
        sortOrder = 'desc' 
      } = req.query as any
      
      // 过滤日志
      let filteredLogs = activityLogs.filter(log => log.userId === userId)
      
      if (startDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.createdAt) >= new Date(startDate)
        )
      }
      
      if (endDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.createdAt) <= new Date(endDate)
        )
      }
      
      if (type) {
        filteredLogs = filteredLogs.filter(log => 
          log.type === type
        )
      }
      
      // 排序
      filteredLogs.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      })
      
      // 分页
      const startIndex = (page - 1) * pageSize
      const paginatedLogs = filteredLogs.slice(startIndex, startIndex + pageSize)
      
      // 移除敏感信息
      const safeLogs = paginatedLogs.map((log) => {
        const { details, ...rest } = log
        // 从 details 中移除敏感信息
        const { ip, userAgent, ...safeDetails } = details
        return { ...rest, details: safeDetails }
      })
      
      return res.json({
        success: true,
        data: {
          list: safeLogs,
          total: filteredLogs.length,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(filteredLogs.length / pageSize)
        }
      })
    } catch (error) {
      logger.error('Error getting activity logs:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve activity logs',
        error: (error as Error).message
      })
    }
  }
  
  // 获取用户通知（用户功能）
  async getNotifications(req: Request, res: Response) {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      
      const { 
        page = 1, 
        pageSize = 10, 
        read, 
        type, 
        sortOrder = 'desc' 
      } = req.query as any
      
      // 过滤通知
      let filteredNotifications = notifications.filter(notification => notification.userId === userId)
      
      if (read !== undefined) {
        const isRead = read === 'true'
        filteredNotifications = filteredNotifications.filter(notification => 
          notification.read === isRead
        )
      }
      
      if (type) {
        filteredNotifications = filteredNotifications.filter(notification => 
          notification.type === type
        )
      }
      
      // 排序
      filteredNotifications.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      })
      
      // 分页
      const startIndex = (page - 1) * pageSize
      const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + pageSize)
      
      return res.json({
        success: true,
        data: {
          list: paginatedNotifications,
          total: filteredNotifications.length,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(filteredNotifications.length / pageSize),
          unreadCount: filteredNotifications.filter(notification => !notification.read).length
        }
      })
    } catch (error) {
      logger.error('Error getting notifications:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to get notifications',
        error: (error as Error).message
      })
    }
  }
  
  // 标记通知为已读（用户功能）
  async markNotificationAsRead(req: Request, res: Response) {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      
      const { notificationId } = req.params
      
      const notificationIndex = notifications.findIndex(
        n => n.id === notificationId && n.userId === userId
      )
      
      if (notificationIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        })
      }
      
      // 标记为已读
      notifications[notificationIndex] = {
        ...notifications[notificationIndex],
        read: true
      }
      
      return res.json({
        success: true,
        message: 'Notification marked as read'
      })
    } catch (error) {
      logger.error('Error marking notification as read:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: (error as Error).message
      })
    }
  }
  
  // 标记所有通知为已读（用户功能）
  async markAllNotificationsAsRead(req: Request, res: Response) {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      
      // 标记所有通知为已读
      for (let i = 0; i < notifications.length; i++) {
        if (notifications[i].userId === userId) {
          notifications[i] = {
            ...notifications[i],
            read: true
          }
        }
      }
      
      return res.json({
        success: true,
        message: 'All notifications marked as read'
      })
    } catch (error) {
      logger.error('Error marking all notifications as read:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: (error as Error).message
      })
    }
  }
  
  // 删除通知（用户功能）
  async deleteNotification(req: Request, res: Response) {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      
      const { notificationId } = req.params
      
      const notificationIndex = notifications.findIndex(
        n => n.id === notificationId && n.userId === userId
      )
      
      if (notificationIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        })
      }
      
      // 删除通知
      notifications.splice(notificationIndex, 1)
      
      return res.json({
        success: true,
        message: 'Notification deleted successfully'
      })
    } catch (error) {
      logger.error('Error deleting notification:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: (error as Error).message
      })
    }
  }
  
  // 清空所有通知（用户功能）
  async clearAllNotifications(req: Request, res: Response) {
    try {
      // 从认证中间件获取用户ID
      const userId = req.user?.id
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        })
      }
      
      // 删除所有用户的通知
      for (let i = notifications.length - 1; i >= 0; i--) {
        if (notifications[i].userId === userId) {
          notifications.splice(i, 1)
        }
      }
      
      return res.json({
        success: true,
        message: 'All notifications cleared successfully'
      })
    } catch (error) {
      logger.error('Error clearing all notifications:', error)
      return res.status(500).json({
        success: false,
        message: 'Failed to clear all notifications',
        error: (error as Error).message
      })
    }
  }
}

// 创建路由
import { Router } from 'express'
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware'

const router = Router()

// 管理员用户管理路由
router.get('/', requireAuth, requirePermission('user:read'), (req: Request, res: Response) => {
  new UserController().getUsers(req, res)
})

// 固定路径路由应该在参数路由之前定义
router.get('/stats', requireAuth, requirePermission('user:read'), (req: Request, res: Response) => {
  new UserController().getUserStats(req, res)
})

router.post('/batch', requireAuth, requirePermission('user:write'), (req: Request, res: Response) => {
  new UserController().batchUpdateUsers(req, res)
})

// 用户ID参数路由
router.get('/:userId', requireAuth, requirePermission('user:read'), (req: Request, res: Response) => {
  new UserController().getUser(req, res)
})

router.post('/', requireAuth, requirePermission('user:write'), (req: Request, res: Response) => {
  new UserController().createUser(req, res)
})

router.put('/:userId', requireAuth, requirePermission('user:write'), (req: Request, res: Response) => {
  new UserController().updateUser(req, res)
})

router.delete('/:userId', requireAuth, requirePermission('user:delete'), (req: Request, res: Response) => {
  new UserController().deleteUser(req, res)
})

router.post('/:userId/reset-password', requireAuth, requirePermission('user:write'), (req: Request, res: Response) => {
  new UserController().resetUserPassword(req, res)
})

router.post('/:userId/ban', requireAuth, requirePermission('user:write'), (req: Request, res: Response) => {
  new UserController().banUser(req, res)
})

router.post('/:userId/unban', requireAuth, requirePermission('user:write'), (req: Request, res: Response) => {
  new UserController().unbanUser(req, res)
})

router.post('/:userId/force-logout', requireAuth, requirePermission('user:write'), (req: Request, res: Response) => {
  new UserController().forceLogout(req, res)
})

router.get('/:userId/permissions', requireAuth, requirePermission('user:read'), (req: Request, res: Response) => {
  new UserController().getUserPermissions(req, res)
})

router.put('/:userId/permissions', requireAuth, requirePermission('user:write'), (req: Request, res: Response) => {
  new UserController().updateUserPermissions(req, res)
})

router.get('/:userId/activity-logs', requireAuth, requirePermission('user:read'), (req: Request, res: Response) => {
  new UserController().getUserActivityLogs(req, res)
})

// 用户自身功能路由
router.get('/profile/me', requireAuth, (req: Request, res: Response) => {
  new UserController().getCurrentUser(req, res)
})

router.put('/profile/me', requireAuth, (req: Request, res: Response) => {
  new UserController().updateProfile(req, res)
})

router.put('/profile/me/password', requireAuth, (req: Request, res: Response) => {
  new UserController().changePassword(req, res)
})

router.get('/profile/me/roles', requireAuth, (req: Request, res: Response) => {
  new UserController().getUserRoles(req, res)
})

router.get('/profile/me/permissions', requireAuth, (req: Request, res: Response) => {
  new UserController().getCurrentUserPermissions(req, res)
})

router.get('/profile/me/groups', requireAuth, (req: Request, res: Response) => {
  new UserController().getUserGroups(req, res)
})

router.get('/profile/me/activity-logs', requireAuth, (req: Request, res: Response) => {
  new UserController().getActivityLogs(req, res)
})

router.get('/profile/me/notifications', requireAuth, (req: Request, res: Response) => {
  new UserController().getNotifications(req, res)
})

// 固定路径通知路由应该在参数路由之前定义
router.put('/profile/me/notifications/read-all', requireAuth, (req: Request, res: Response) => {
  new UserController().markAllNotificationsAsRead(req, res)
})

router.delete('/profile/me/notifications', requireAuth, (req: Request, res: Response) => {
  new UserController().clearAllNotifications(req, res)
})

// 通知ID参数路由
router.put('/profile/me/notifications/:notificationId/read', requireAuth, (req: Request, res: Response) => {
  new UserController().markNotificationAsRead(req, res)
})

router.delete('/profile/me/notifications/:notificationId', requireAuth, (req: Request, res: Response) => {
  new UserController().deleteNotification(req, res)
})

// 导出路由
export default router

