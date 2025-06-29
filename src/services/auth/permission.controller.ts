import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, requirePermission } from '../../middleware/auth.middleware';
import { Logger } from '../../utils/logger';

const logger = new Logger('PermissionController');

const router = Router();

// 模拟权限数据 (实际项目中应该从数据库获取)
const permissions = [
  { id: 'user:read', name: '查看用户', group: '用户管理', description: '允许查看用户列表和用户详情' },
  { id: 'user:write', name: '编辑用户', group: '用户管理', description: '允许创建和编辑用户信息' },
  { id: 'user:delete', name: '删除用户', group: '用户管理', description: '允许删除用户' },
  
  { id: 'role:read', name: '查看角色', group: '角色管理', description: '允许查看角色列表和角色详情' },
  { id: 'role:write', name: '编辑角色', group: '角色管理', description: '允许创建和编辑角色' },
  { id: 'role:delete', name: '删除角色', group: '角色管理', description: '允许删除角色' },
  
  { id: 'permission:read', name: '查看权限', group: '权限管理', description: '允许查看权限列表和权限详情' },
  { id: 'permission:write', name: '编辑权限', group: '权限管理', description: '允许创建和编辑权限' },
  { id: 'permission:delete', name: '删除权限', group: '权限管理', description: '允许删除权限' },
  
  { id: 'system:read', name: '查看系统设置', group: '系统管理', description: '允许查看系统设置' },
  { id: 'system:write', name: '编辑系统设置', group: '系统管理', description: '允许编辑系统设置' },
  { id: 'system:config', name: '配置系统', group: '系统管理', description: '允许配置系统参数' },
  
  { id: 'knowledge:read', name: '查看知识库', group: '知识管理', description: '允许查看知识库内容' },
  { id: 'knowledge:write', name: '编辑知识库', group: '知识管理', description: '允许创建和编辑知识库内容' },
  { id: 'knowledge:delete', name: '删除知识库', group: '知识管理', description: '允许删除知识库内容' },
  
  { id: 'dashboard:access', name: '访问仪表盘', group: '仪表盘', description: '允许访问系统仪表盘' },
  
  { id: 'admin:access', name: '访问管理后台', group: '管理后台', description: '允许访问管理后台' },
  { id: 'admin:manage', name: '管理系统', group: '管理后台', description: '允许管理整个系统' },
  
  { id: '*', name: '所有权限', group: '特殊权限', description: '拥有系统中的所有权限' }
];

// 获取所有权限列表
router.get('/', requireAuth, requirePermission('permission:read'), (req: Request, res: Response) => {
  try {
    // 按组分类权限
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.group]) {
        acc[permission.group] = [];
      }
      acc[permission.group].push(permission);
      return acc;
    }, {} as Record<string, typeof permissions>);
    
    res.json({
      code: 200,
      message: '获取权限列表成功',
      data: {
        permissions,
        groupedPermissions
      }
    });
  } catch (error) {
    logger.error('Get permissions error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '获取权限列表失败',
      data: null
    });
  }
});

// 获取单个权限详情
router.get('/:id', requireAuth, requirePermission('permission:read'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const permission = permissions.find(p => p.id === id.toString());
    
    if (!permission) {
      return res.status(404).json({
        code: 404,
        message: '权限不存在',
        data: null
      });
    }
    
    res.json({
      code: 200,
      message: '获取权限详情成功',
      data: permission
    });
  } catch (error) {
    logger.error('Get permission error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '获取权限详情失败',
      data: null
    });
  }
});

// 获取权限组列表
router.get('/groups/all', requireAuth, requirePermission('permission:read'), (req: Request, res: Response) => {
  try {
    // 提取所有权限组
    const groups = [...new Set(permissions.map(p => p.group))];
    
    res.json({
      code: 200,
      message: '获取权限组列表成功',
      data: groups
    });
  } catch (error) {
    logger.error('Get permission groups error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '获取权限组列表失败',
      data: null
    });
  }
});

// 按组获取权限
router.get('/group/:groupName', requireAuth, requirePermission('permission:read'), (req: Request, res: Response) => {
  try {
    const { groupName } = req.params;
    
    const groupPermissions = permissions.filter(p => p.group === groupName);
    
    if (groupPermissions.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '权限组不存在',
        data: null
      });
    }
    
    res.json({
      code: 200,
      message: '获取权限组权限成功',
      data: groupPermissions
    });
  } catch (error) {
    logger.error('Get permissions by group error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '获取分组权限失败',
      data: null
    });
  }
});

// 检查用户是否拥有指定权限
router.post('/check', requireAuth, (req: Request, res: Response) => {
  try {
    const { permissionId } = req.body;
    
    if (!permissionId) {
      return res.status(400).json({
        code: 400,
        message: '权限ID不能为空',
        data: null
      });
    }
    
    // 这里简化处理，实际应该检查用户的权限
    // 假设所有认证用户都有权限（仅用于演示）
    const hasPermission = true;
    
    res.json({
      code: 200,
      message: '权限检查完成',
      data: {
        hasPermission,
        permissionId
      }
    });
  } catch (error) {
    logger.error('Check permission error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '检查权限失败',
      data: null
    });
  }
});

// 批量检查用户权限
router.post('/check-batch', requireAuth, (req: Request, res: Response) => {
  try {
    const { permissionIds } = req.body;
    
    if (!permissionIds || !Array.isArray(permissionIds)) {
      return res.status(400).json({
        code: 400,
        message: '权限ID必须是数组',
        data: null
      });
    }
    
    // 这里简化处理，实际应该检查用户的权限
    // 假设所有认证用户都有权限（仅用于演示）
    const result: Record<string, boolean> = {};
    
    permissionIds.forEach((id: string) => {
      result[id] = true;
    });
    
    res.json({
      code: 200,
      message: '批量权限检查完成',
      data: result
    });
  } catch (error) {
    logger.error('Check permissions error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '批量检查权限失败',
      data: null
    });
  }
});

export default router;