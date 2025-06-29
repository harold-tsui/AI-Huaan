/**
 * 认证中间件
 *  requirePermission as requireUserPermission } from '../../middleware/auth.middleware'
 * 用于验证JWT令牌并保护需要认证的路由
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/logger';

const logger = new Logger('AuthMiddleware');
const JWT_SECRET = process.env.JWT_SECRET || 'MY1ymBXnNy7lz2s0VCEpG4c3c4';

// 定义用户接口
interface DecodedUser {
  id: string;
  username: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

// 扩展Request接口，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: DecodedUser;
    }
  }
}

/**
 * 验证JWT令牌中间件
 * 
 * 从cookie或Authorization头中获取token，验证并解析用户信息
 * 将用户信息添加到req.user中
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  logger.debug('验证令牌中间件被调用');
  
  // 从cookie或Authorization头中获取token
  let token = req.cookies?.token;
  
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    // 检查是否是Bearer token
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }
  
  if (!token) {
    logger.debug('未提供令牌');
    return next();
  }
  
  try {
    // 验证token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    req.user = decoded;
    logger.debug(`令牌验证成功，用户ID: ${decoded.id}`);
    next();
  } catch (error) {
    logger.error('令牌验证失败:', (error as Error).message);
    // 不返回错误，只是不设置req.user
    next();
  }
};

/**
 * 要求认证中间件
 * 
 * 确保用户已经通过认证，否则返回401错误
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    logger.warn('未授权的访问尝试');
    return res.status(401).json({
      code: 401,
      message: '未授权，请先登录',
      data: null
    });
  }
  next();
};

/**
 * 要求管理员权限中间件
 * 
 * 确保用户具有管理员角色，否则返回403错误
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    logger.warn('未授权的访问尝试');
    return res.status(401).json({
      code: 401,
      message: '未授权，请先登录',
      data: null
    });
  }
  
  if (!req.user.roles.includes('admin')) {
    logger.warn(`用户 ${req.user.id} 尝试访问管理员资源`);
    return res.status(403).json({
      code: 403,
      message: '权限不足，需要管理员权限',
      data: null
    });
  }
  
  next();
};

/**
 * 要求特定权限中间件
 * 
 * 确保用户具有特定权限，否则返回403错误
 * @param permission 所需的权限
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn('未授权的访问尝试');
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录',
        data: null
      });
    }
    
    // 管理员拥有所有权限
    if (req.user.roles.includes('admin')) {
      return next();
    }
    
    // 这里应该检查用户是否具有特定权限
    // 目前简化实现，实际项目中应该从数据库或缓存中获取用户权限
    const hasPermission = true; // 临时设置为true，实际项目中应该根据用户权限判断
    
    if (!hasPermission) {
      logger.warn(`用户 ${req.user.id} 尝试访问无权限的资源: ${permission}`);
      return res.status(403).json({
        code: 403,
        message: '权限不足',
        data: null
      });
    }
    
    next();
  };
};

/**
 * 要求多个权限中的任意一个
 * 
 * 确保用户具有指定权限列表中的至少一个权限
 * @param permissions 所需的权限列表
 */
export const requireAnyPermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn('未授权的访问尝试');
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录',
        data: null
      });
    }
    
    // 管理员拥有所有权限
    if (req.user.roles.includes('admin')) {
      return next();
    }
    
    // TODO: 实现实际的权限检查逻辑
    // 这里简单模拟，实际应用中应该从数据库或缓存中获取用户权限
    const userPermissions = ['read:profile', 'update:profile'];
    
    // 检查用户是否拥有任意一个所需权限
    const hasAnyPermission = permissions.some(p => 
      userPermissions.includes(p) || userPermissions.includes('*')
    );
    
    if (hasAnyPermission) {
      return next();
    }
    
    logger.warn(`用户 ${req.user.id} 尝试访问无权限的资源`);
    return res.status(403).json({
      code: 403,
      message: '权限不足',
      data: null
    });
  };
};

/**
 * 要求所有指定的权限
 * 
 * 确保用户具有所有指定的权限
 * @param permissions 所需的权限列表
 */
export const requireAllPermissions = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.warn('未授权的访问尝试');
      return res.status(401).json({
        code: 401,
        message: '未授权，请先登录',
        data: null
      });
    }
    
    // 管理员拥有所有权限
    if (req.user.roles.includes('admin')) {
      return next();
    }
    
    // TODO: 实现实际的权限检查逻辑
    // 这里简单模拟，实际应用中应该从数据库或缓存中获取用户权限
    const userPermissions = ['read:profile', 'update:profile'];
    
    // 检查用户是否拥有通配符权限
    if (userPermissions.includes('*')) {
      return next();
    }
    
    // 检查用户是否拥有所有所需权限
    const hasAllPermissions = permissions.every(p => userPermissions.includes(p));
    
    if (hasAllPermissions) {
      return next();
    }
    
    logger.warn(`用户 ${req.user.id} 尝试访问无权限的资源`);
    return res.status(403).json({
      code: 403,
      message: '权限不足',
      data: null
    });
  };
};