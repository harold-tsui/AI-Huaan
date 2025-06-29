import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, requirePermission } from '../../middleware/auth.middleware';
import { Logger } from '../../utils/logger';

const logger = new Logger('RoleController');

const router = Router();

// 模拟角色数据 (实际项目中应该从数据库获取)
let roles = [
  {
    id: '1',
    name: 'admin',
    displayName: '管理员',
    description: '系统管理员，拥有所有权限',
    permissions: ['*'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'user',
    displayName: '普通用户',
    description: '普通用户，拥有基本权限',
    permissions: [
      'user:read', 'user:write',
      'knowledge:read', 'knowledge:write',
      'dashboard:access'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'guest',
    displayName: '访客',
    description: '访客用户，仅拥有只读权限',
    permissions: [
      'user:read',
      'knowledge:read',
      'dashboard:access'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'editor',
    displayName: '编辑者',
    description: '内容编辑者，拥有知识管理相关权限',
    permissions: [
      'user:read',
      'knowledge:read', 'knowledge:write', 'knowledge:delete',
      'dashboard:access'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 获取所有角色列表
router.get('/', requireAuth, requirePermission('role:read'), (req: Request, res: Response) => {
  try {
    res.json({
      code: 200,
      message: '获取角色列表成功',
      data: roles
    });
  } catch (error) {
    logger.error('Get roles error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '获取角色列表失败',
      data: null
    });
  }
});

// 获取单个角色详情
router.get('/:id', requireAuth, requirePermission('role:read'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = id;
    
    const role = roles.find(r => r.id === roleId);
    
    if (!role) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在',
        data: null
      });
    }
    
    res.json({
      code: 200,
      message: '获取角色详情成功',
      data: role
    });
  } catch (error) {
    logger.error('Get role error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '获取角色详情失败',
      data: null
    });
  }
});

// 创建新角色
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, displayName, description, permissions } = req.body;
    
    // 验证必填字段
    if (!name || !displayName) {
      return res.status(400).json({
        code: 400,
        message: '角色名称和显示名称不能为空',
        data: null
      });
    }
    
    // 检查角色名是否已存在
    if (roles.some(r => r.name === name)) {
      return res.status(400).json({
        code: 400,
        message: '角色名称已存在',
        data: null
      });
    }
    
    // 创建新角色
    const newRole = {
      id: roles.length > 0 ? String(Number(roles.length) + 1) : '1',
      name,
      displayName,
      description: description || '',
      permissions: permissions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    roles.push(newRole);
    
    res.status(201).json({
      code: 201,
      message: '创建角色成功',
      data: newRole
    });
  } catch (error) {
    logger.error('Create role error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '创建角色失败',
      data: null
    });
  }
});

// 更新角色
router.put('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = id;
    const { displayName, description, permissions } = req.body;
    
    // 查找角色
    const roleIndex = roles.findIndex(r => r.id === roleId);
    
    if (roleIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在',
        data: null
      });
    }
    
    // 不允许修改内置角色的权限
    if (roles[roleIndex].name === 'admin' && permissions) {
      return res.status(403).json({
        code: 403,
        message: '不允许修改管理员角色的权限',
        data: null
      });
    }
    
    // 更新角色信息
    const updatedRole = {
      ...roles[roleIndex],
      displayName: displayName || roles[roleIndex].displayName,
      description: description !== undefined ? description : roles[roleIndex].description,
      permissions: permissions || roles[roleIndex].permissions,
      updatedAt: new Date().toISOString()
    };
    
    roles[roleIndex] = updatedRole;
    
    res.json({
      code: 200,
      message: '更新角色成功',
      data: updatedRole
    });
  } catch (error) {
    logger.error('Update role error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '更新角色失败',
      data: null
    });
  }
});

// 删除角色
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = id;
    
    // 查找角色
    const roleIndex = roles.findIndex(r => r.id === roleId);
    
    if (roleIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在',
        data: null
      });
    }
    
    // 不允许删除内置角色
    if (['admin', 'user'].includes(roles[roleIndex].name)) {
      return res.status(403).json({
        code: 403,
        message: '不允许删除内置角色',
        data: null
      });
    }
    
    // 删除角色
    const deletedRole = roles.splice(roleIndex, 1)[0];
    
    res.json({
      code: 200,
      message: '删除角色成功',
      data: deletedRole
    });
  } catch (error) {
    logger.error('Delete role error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '删除角色失败',
      data: null
    });
  }
});

// 获取所有可用权限列表
router.get('/permissions/all', requireAuth, requirePermission('permission:read'), (req: Request, res: Response) => {
  try {
    // 系统中所有可用的权限列表
    const allPermissions = [
      { id: 'user:read', name: '查看用户', group: '用户管理' },
      { id: 'user:write', name: '编辑用户', group: '用户管理' },
      { id: 'user:delete', name: '删除用户', group: '用户管理' },
      
      { id: 'role:read', name: '查看角色', group: '角色管理' },
      { id: 'role:write', name: '编辑角色', group: '角色管理' },
      { id: 'role:delete', name: '删除角色', group: '角色管理' },
      
      { id: 'permission:read', name: '查看权限', group: '权限管理' },
      { id: 'permission:write', name: '编辑权限', group: '权限管理' },
      { id: 'permission:delete', name: '删除权限', group: '权限管理' },
      
      { id: 'system:read', name: '查看系统设置', group: '系统管理' },
      { id: 'system:write', name: '编辑系统设置', group: '系统管理' },
      { id: 'system:config', name: '配置系统', group: '系统管理' },
      
      { id: 'knowledge:read', name: '查看知识库', group: '知识管理' },
      { id: 'knowledge:write', name: '编辑知识库', group: '知识管理' },
      { id: 'knowledge:delete', name: '删除知识库', group: '知识管理' },
      
      { id: 'dashboard:access', name: '访问仪表盘', group: '仪表盘' },
      
      { id: 'admin:access', name: '访问管理后台', group: '管理后台' },
      { id: 'admin:manage', name: '管理系统', group: '管理后台' },
      
      { id: '*', name: '所有权限', group: '特殊权限' }
    ];
    
    // 按组分类权限
    const groupedPermissions = allPermissions.reduce((acc, permission) => {
      if (!acc[permission.group]) {
        acc[permission.group] = [];
      }
      acc[permission.group].push(permission);
      return acc;
    }, {} as Record<string, typeof allPermissions>);
    
    res.json({
      code: 200,
      message: '获取权限列表成功',
      data: {
        permissions: allPermissions,
        groupedPermissions
      }
    });
  } catch (error) {
    logger.error('Get available permissions error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '获取可用权限列表失败',
      data: null
    });
  }
});

// 为角色分配权限
router.post('/:id/permissions', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = id;
    const { permissions } = req.body;
    
    // 验证权限参数
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        code: 400,
        message: '权限参数必须是数组',
        data: null
      });
    }
    
    // 查找角色
    const roleIndex = roles.findIndex(r => r.id === roleId);
    
    if (roleIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: '角色不存在',
        data: null
      });
    }
    
    // 不允许修改管理员角色的权限
    if (roles[roleIndex].name === 'admin') {
      return res.status(403).json({
        code: 403,
        message: '不允许修改管理员角色的权限',
        data: null
      });
    }
    
    // 更新角色权限
    roles[roleIndex].permissions = permissions;
    roles[roleIndex].updatedAt = new Date().toISOString();
    
    res.json({
      code: 200,
      message: '更新角色权限成功',
      data: roles[roleIndex]
    });
  } catch (error) {
    logger.error('Assign permissions error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '分配权限失败',
      data: null
    });
  }
});

export default router;