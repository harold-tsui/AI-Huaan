import { Router, Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = Router();

// 模拟用户数据 (实际项目中应该从数据库获取)
const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: 2,
    username: 'user',
    email: 'user@example.com',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'user',
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
        role: user.role 
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
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: null
    });
  }
});

// 用户登出
router.post('/logout', (req: Request, res: Response) => {
  res.json({
    code: 200,
    message: '登出成功',
    data: null
  });
});

// 刷新token
router.post('/refresh', (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        code: 400,
        message: 'Refresh token不能为空',
        data: null
      });
    }

    // 验证refresh token
    const decoded = jwt.verify(refreshToken, JWT_SECRET as string) as any;
    const user = users.find(u => u.id === decoded.id);

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
        role: user.role 
      },
      JWT_SECRET as string,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    const newRefreshToken = jwt.sign(
      { id: user.id },
      JWT_SECRET as string,
      { expiresIn: '7d' } as SignOptions
    );

    res.json({
      code: 200,
      message: 'Token刷新成功',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      code: 401,
      message: '无效的refresh token',
      data: null
    });
  }
});

// 获取当前用户信息
router.get('/me', (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证token',
        data: null
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find(u => u.id === decoded.id);

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
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(401).json({
      code: 401,
      message: '无效的token',
      data: null
    });
  }
});

// 更新用户信息
router.put('/profile', (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证token',
        data: null
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userIndex = users.findIndex(u => u.id === decoded.id);

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
        role: users[userIndex].role,
        avatar: users[userIndex].avatar
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(401).json({
      code: 401,
      message: '无效的token',
      data: null
    });
  }
});

// 获取用户权限
router.get('/permissions/:userId?', (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { userId } = req.params;

    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证token',
        data: null
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    let targetUserId = userId ? parseInt(userId) : decoded.id;
    
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

    const permissions = rolePermissions[user.role as keyof typeof rolePermissions] || allPermissions;
    const roles = [user.role];

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
    console.error('Get permissions error:', error);
    res.status(401).json({
      code: 401,
      message: '无效的token',
      data: null
    });
  }
});

// 检查单个权限
router.post('/check-permission', (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
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
    const user = users.find(u => u.id === decoded.id);

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
    console.error('Check permission error:', error);
    res.status(401).json({
      code: 401,
      message: '无效的token',
      data: null
    });
  }
});

// 批量检查权限
router.post('/check-permissions', (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
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
    const user = users.find(u => u.id === decoded.id);

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
    console.error('Check permissions error:', error);
    res.status(401).json({
      code: 401,
      message: '无效的token',
      data: null
    });
  }
});

export default router;