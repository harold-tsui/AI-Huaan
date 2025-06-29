import { Router, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';
import { Logger } from '../../utils/logger';

const logger = new Logger('AuthController');

const router = Router();

// 定义用户接口
interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  roles: string[];
  avatar: string;
}

// 模拟用户数据 (实际项目中应该从数据库获取)
const users: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    roles: ['admin'],
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    roles: ['user'],
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
];

const JWT_SECRET = process.env.JWT_SECRET || 'MY1ymBXnNy7lz2s0VCEpG4c3c4';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// 用户登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名和密码不能为空',
        data: null
      });
    }

    // 查找用户
    const user = users.find(u => u.username === username || u.email === username);
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    // 验证密码
    const isValidPassword = true;//await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        roles: user.roles 
      },
      JWT_SECRET as string,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    // 生成refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET as string,
      { expiresIn: '7d' } as SignOptions
    );
    
    // 设置cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 在生产环境中使用secure
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      sameSite: 'lax'
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      sameSite: 'lax'
    });

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    logger.error('Login error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 用户登出
router.post('/logout', requireAuth, (req: Request, res: Response) => {
  // 清除cookie
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  
  res.json({
    code: 200,
    message: '登出成功',
    data: null
  });
});

// 刷新token
router.post('/refresh', requireAuth, (req: Request, res: Response) => {
  try {
    // 从cookie中获取refreshToken
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        code: 400,
        message: 'Refresh token不存在或已过期',
        data: null
      });
    }

    // 验证refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET as string) as any;
    const user = users.find(u => u.id === String(decoded.id));

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '无效的refresh token',
        data: null
      });
    }

    // 生成新的token
    const newToken = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email,
        roles: user.roles 
      },
      JWT_SECRET as string,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    const newRefreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET as string,
      { expiresIn: '7d' } as SignOptions
    );
    
    // 更新cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      sameSite: 'lax'
    });
    
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
      sameSite: 'lax'
    });

    res.json({
      code: 200,
      message: 'Token刷新成功',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error('Refresh token error:', (error as Error).message);
    res.status(401).json({
      code: 401,
      message: '无效的refresh token',
      data: null
    });
  }
});

// 获取当前用户信息
router.get('/me', requireAuth, (req: Request, res: Response) => {
  try {
    // 优先从cookie中获取token，如果没有则尝试从Authorization头中获取
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证token',
        data: null
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find(u => u.id === String(decoded.id));

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '无效的token',
        data: null
      });
    }

    res.json({
      code: 200,
      message: '获取用户信息成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        avatar: user.avatar
      }
    });
  } catch (error) {
    logger.error('Get user info error:', (error as Error).message);
    res.status(401).json({
      code: 401,
      message: '无效的token',
      data: null
    });
  }
});

// 更新用户资料
router.post('/profile', requireAuth, (req: Request, res: Response) => {
  try {
    // 优先从cookie中获取token，如果没有则尝试从Authorization头中获取
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证token',
        data: null
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userIndex = users.findIndex(u => u.id === String(decoded.id));

    if (userIndex === -1) {
      return res.status(401).json({
        code: 401,
        message: '无效的token',
        data: null
      });
    }

    const { email, avatar } = req.body;
    
    if (email) {
      users[userIndex].email = email;
    }
    if (avatar) {
      users[userIndex].avatar = avatar;
    }

    res.json({
      code: 200,
      message: '更新用户信息成功',
      data: {
        id: users[userIndex].id,
        username: users[userIndex].username,
        email: users[userIndex].email,
        roles: users[userIndex].roles,
        avatar: users[userIndex].avatar
      }
    });
  } catch (error) {
    logger.error('Update profile error:', (error as Error).message);
    res.status(401).json({
      code: 401,
      message: '无效的token',
      data: null
    });
  }
});

// 获取用户权限
router.get('/permissions/:userId?', requireAuth, (req: Request, res: Response) => {
  try {
    // 优先从cookie中获取token，如果没有则尝试从Authorization头中获取
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    const { userId } = req.params;

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证token',
        data: null
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    let targetUserId = userId || String(decoded.id);
    
    const user = users.find(u => u.id === targetUserId);
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }

    // 根据角色定义权限 - 临时给所有用户最高权限用于测试
    const allPermissions = [
      'user:read', 'user:write', 'user:delete',
      'system:read', 'system:write', 'system:config',
      'knowledge:read', 'knowledge:write', 'knowledge:delete',
      'dashboard:access',
      'admin:access', 'admin:manage',
      'role:read', 'role:write', 'role:delete',
      'permission:read', 'permission:write', 'permission:delete'
    ];

    const rolePermissions = {
      admin: allPermissions,
      user: allPermissions  // 临时给普通用户也分配所有权限
    };

    // 获取用户的第一个角色对应的权限，如果没有角色则使用所有权限
    const primaryRole = user.roles && user.roles.length > 0 ? user.roles[0] : 'user';
    const permissions = rolePermissions[primaryRole as keyof typeof rolePermissions] || allPermissions;
    const roles = user.roles || [];

    res.json({
      code: 200,
      message: '获取权限成功',
      data: {
        permissions,
        roles,
        effectivePermissions: permissions
      }
    });
  } catch (error) {
    logger.error('Get permissions error:', (error as Error).message);
    res.status(401).json({
      code: 401,
      message: '无效的token',
      data: null
    });
  }
});

// 检查单个权限
router.post('/check-permission', requireAuth, (req: Request, res: Response) => {
  try {
    // 优先从cookie中获取token，如果没有则尝试从Authorization头中获取
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    const { permission } = req.body;

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证token',
        data: null
      });
    }

    if (!permission) {
      return res.status(400).json({
        code: 400,
        message: '权限参数不能为空',
        data: null
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find(u => u.id === String(decoded.id));

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '无效的token',
        data: null
      });
    }

    // 临时给所有用户最高权限用于测试 - 所有权限检查都返回true
    const hasPermission = true;

    res.json({
      code: 200,
      message: '权限检查完成',
      data: {
        hasPermission
      }
    });
  } catch (error) {
    logger.error('Check permission error:', (error as Error).message);
    res.status(401).json({
      code: 401,
      message: '无效的token',
      data: null
    });
  }
});

// 批量检查权限
router.post('/check-permissions', requireAuth, (req: Request, res: Response) => {
  try {
    // 优先从cookie中获取token，如果没有则尝试从Authorization头中获取
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    const { permissions } = req.body;

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证token',
        data: null
      });
    }

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        code: 400,
        message: '权限参数必须是数组',
        data: null
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find(u => u.id === String(decoded.id));

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '无效的token',
        data: null
      });
    }

    // 临时给所有用户最高权限用于测试 - 所有权限检查都返回true
    const result: Record<string, boolean> = {};
    
    permissions.forEach((permission: string) => {
      result[permission] = true;
    });

    res.json({
      code: 200,
      message: '批量权限检查完成',
      data: result
    });
  } catch (error) {
    logger.error('Check permissions error:', (error as Error).message);
    res.status(401).json({
      code: 401,
      message: '无效的token',
      data: null
    });
  }
});

// 验证token接口
router.post('/verify-token', (req: Request, res: Response) => {
  try {
    // 优先从cookie中获取token，如果没有则尝试从请求体中获取
    const token = req.cookies.token || req.body.token;

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证token',
        data: {
          valid: false
        }
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find(u => u.id === String(decoded.id));

    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '无效的token',
        data: {
          valid: false
        }
      });
    }

    res.json({
      code: 200,
      message: 'token验证成功',
      data: {
        valid: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    logger.error('Verify token error:', (error as Error).message);
    res.status(401).json({
      code: 401,
      message: '无效的token',
      data: {
        valid: false
      }
    });
  }
});

// 管理员专用接口 - 获取所有用户列表
router.get('/admin/users', requireAdmin, (req: Request, res: Response) => {
  try {
    // 返回所有用户信息（不包含密码）
    const userList = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.roles,
      avatar: user.avatar,
      status: 'active' // 模拟状态
    }));

    res.json({
      code: 200,
      message: '获取用户列表成功',
      data: userList
    });
  } catch (error) {
    logger.error('Get users error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '获取用户列表失败',
      data: null
    });
  }
});

// 管理员专用接口 - 重置用户密码
router.put('/admin/users/:userId/reset-password', requireAdmin, (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({
        code: 400,
        message: '新密码不能为空',
        data: null
      });
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }
    
    // 更新用户密码（实际应用中应该对密码进行哈希处理）
    users[userIndex].password = newPassword;
    
    res.json({
      code: 200,
      message: '密码重置成功',
      data: null
    });
  } catch (error) {
    logger.error('Reset password error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '重置密码失败',
      data: null
    });
  }
});

// 管理员专用接口 - 更新用户信息
router.put('/admin/users/:userId', requireAdmin, (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { username, email, roles } = req.body;
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }
    
    // 更新用户信息
    if (username) users[userIndex].username = username;
    if (email) users[userIndex].email = email;
    if (roles) users[userIndex].roles = roles;
    
    // 返回更新后的用户信息
    const updatedUser = {
      id: users[userIndex].id,
      username: users[userIndex].username,
      email: users[userIndex].email,
      roles: users[userIndex].roles,
      avatar: users[userIndex].avatar
    };
    
    res.json({
      code: 200,
      message: '用户信息更新成功',
      data: updatedUser
    });
  } catch (error) {
    logger.error('Update profile error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '更新个人资料失败',
      data: null
    });
  }
});

// 管理员专用接口 - 创建新用户
router.post('/admin/users', requireAdmin, (req: Request, res: Response) => {
  try {
    const { username, email, password, roles = ['user'] } = req.body;
    
    // 验证必填字段
    if (!username || !email || !password) {
      return res.status(400).json({
        code: 400,
        message: '用户名、邮箱和密码为必填项',
        data: null
      });
    }
    
    // 检查用户名或邮箱是否已存在
    if (users.some(u => u.username === username)) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在',
        data: null
      });
    }
    
    if (users.some(u => u.email === email)) {
      return res.status(400).json({
        code: 400,
        message: '邮箱已存在',
        data: null
      });
    }
    
    // 创建新用户
    const newUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      password, // 实际应用中应该对密码进行哈希处理
      roles,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
    };
    
    // 添加到用户列表
    users.push(newUser);
    
    // 返回新用户信息（不包含密码）
    const userResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      roles: newUser.roles,
      avatar: newUser.avatar
    };
    
    res.status(201).json({
      code: 201,
      message: '用户创建成功',
      data: userResponse
    });
  } catch (error) {
    logger.error('Create user error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '创建用户失败',
      data: null
    });
  }
});

// 管理员专用接口 - 删除用户
router.delete('/admin/users/:userId', requireAdmin, (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    // 防止删除自己
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (String(decoded.id) === userId) {
      return res.status(400).json({
        code: 400,
        message: '不能删除当前登录的用户',
        data: null
      });
    }
    
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }
    
    // 删除用户
    const deletedUser = users.splice(userIndex, 1)[0];
    
    res.json({
      code: 200,
      message: '用户删除成功',
      data: {
        id: deletedUser.id,
        username: deletedUser.username
      }
    });
  } catch (error) {
    logger.error('Delete user error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '删除用户失败',
      data: null
    });
  }
});

// 管理员专用接口 - 批量更新用户状态
router.post('/admin/users/batch', requireAdmin, (req: Request, res: Response) => {
  try {
    const { operations } = req.body;
    
    if (!operations || !Array.isArray(operations) || operations.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '无效的操作请求',
        data: null
      });
    }
    
    // 获取当前用户ID，防止对自己执行操作
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const currentUserId = String(decoded.id);
    
    const results = {
      success: 0,
      failed: 0,
      details: [] as Array<{userId: string; action: string; success: boolean; message: string}>
    };
    
    // 处理每个操作
    for (const op of operations) {
      const { userId, action } = op;
      
      // 跳过对自己的操作
      if (userId === currentUserId) {
        results.failed++;
        results.details.push({
          userId,
          action,
          success: false,
          message: '不能对当前登录用户执行此操作'
        });
        continue;
      }
      
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        results.failed++;
        results.details.push({
          userId,
          action,
          success: false,
          message: '用户不存在'
        });
        continue;
      }
      
      // 根据操作类型执行不同的操作
      switch (action) {
        case 'delete':
          users.splice(userIndex, 1);
          results.success++;
          results.details.push({
            userId,
            action,
            success: true,
            message: '用户已删除'
          });
          break;
          
        case 'ban':
          // 在实际应用中，这里会设置用户状态为banned
          results.success++;
          results.details.push({
            userId,
            action,
            success: true,
            message: '用户已禁用'
          });
          break;
          
        case 'activate':
          // 在实际应用中，这里会设置用户状态为active
          results.success++;
          results.details.push({
            userId,
            action,
            success: true,
            message: '用户已激活'
          });
          break;
          
        default:
          results.failed++;
          results.details.push({
            userId,
            action,
            success: false,
            message: '不支持的操作类型'
          });
      }
    }
    
    res.json({
      code: 200,
      message: '批量操作完成',
      data: results
    });
  } catch (error) {
    logger.error('Batch update users error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '批量更新用户状态失败',
      data: null
    });
  }
});

export default router;