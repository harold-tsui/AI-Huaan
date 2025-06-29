import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin, requirePermission } from '../../middleware/auth.middleware';
import { Logger } from '../../utils/logger';

const logger = new Logger('UserGroupController');

const router = Router();

// 模拟用户组数据 (实际项目中应该从数据库获取)
let userGroups = [
  {
    id: '1',
    name: 'administrators',
    displayName: '系统管理员组',
    description: '系统管理员用户组',
    members: ['1'], // 用户ID列表
    roles: ['admin'], // 角色名称列表
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'regular-users',
    displayName: '普通用户组',
    description: '普通用户组，拥有基本权限',
    members: ['2'], // 用户ID列表
    roles: ['user'], // 角色名称列表
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'content-editors',
    displayName: '内容编辑组',
    description: '负责内容编辑的用户组',
    members: [], // 用户ID列表
    roles: ['editor'], // 角色名称列表
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'guests',
    displayName: '访客组',
    description: '访客用户组，仅有只读权限',
    members: [], // 用户ID列表
    roles: ['guest'], // 角色名称列表
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 模拟用户数据 (实际项目中应该从数据库获取)
const users = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    roles: ['admin'],
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    roles: ['user'],
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
];

// 获取所有用户组列表
router.get('/', requireAuth, requirePermission('user:read'), (req: Request, res: Response) => {
  try {
    res.json({
      code: 200,
      message: '获取用户组列表成功',
      data: userGroups
    });
  } catch (error) {
    logger.error('Get user groups error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '获取用户组列表失败',
      data: null
    });
  }
});

// 获取单个用户组详情
router.get('/:id', requireAuth, requirePermission('user:read'), (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const groupId = id;
    
    const group = userGroups.find(g => g.id === groupId);
    
    if (!group) {
      return res.status(404).json({
        code: 404,
        message: '用户组不存在',
        data: null
      });
    }
    
    // 获取组成员详细信息
    const memberDetails = group.members.map(memberId => {
      const user = users.find(u => u.id === memberId);
      return user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        avatar: user.avatar
      } : null;
    }).filter(Boolean);
    
    res.json({
      code: 200,
      message: '获取用户组详情成功',
      data: {
        ...group,
        memberDetails
      }
    });
  } catch (error) {
    logger.error('Get user group error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '获取用户组详情失败',
      data: null
    });
  }
});

// 创建新用户组
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, displayName, description, members, roles } = req.body;
    
    // 验证必填字段
    if (!name || !displayName) {
      return res.status(400).json({
        code: 400,
        message: '用户组名称和显示名称不能为空',
        data: null
      });
    }
    
    // 检查用户组名是否已存在
    if (userGroups.some(g => g.name === name)) {
      return res.status(400).json({
        code: 400,
        message: '用户组名称已存在',
        data: null
      });
    }
    
    // 创建新用户组
    const newGroup = {
      id: String(userGroups.length + 1),
      name,
      displayName,
      description: description || '',
      members: members || [],
      roles: roles || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    userGroups.push(newGroup);
    
    res.status(201).json({
      code: 201,
      message: '创建用户组成功',
      data: newGroup
    });
  } catch (error) {
    logger.error('Create user group error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '创建用户组失败',
      data: null
    });
  }
});

// 更新用户组
router.put('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const groupId = id;
    const { displayName, description, roles } = req.body;
    
    // 查找用户组
    const groupIndex = userGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: '用户组不存在',
        data: null
      });
    }
    
    // 不允许修改内置用户组的角色
    if (userGroups[groupIndex].name === 'administrators' && roles) {
      return res.status(403).json({
        code: 403,
        message: '不允许修改管理员组的角色',
        data: null
      });
    }
    
    // 更新用户组信息
    const updatedGroup = {
      ...userGroups[groupIndex],
      displayName: displayName || userGroups[groupIndex].displayName,
      description: description !== undefined ? description : userGroups[groupIndex].description,
      roles: roles || userGroups[groupIndex].roles,
      updatedAt: new Date().toISOString()
    };
    
    userGroups[groupIndex] = updatedGroup;
    
    res.json({
      code: 200,
      message: '更新用户组成功',
      data: updatedGroup
    });
  } catch (error) {
    logger.error('Update user group error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '更新用户组失败',
      data: null
    });
  }
});

// 删除用户组
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const groupId = id;
    
    // 查找用户组
    const groupIndex = userGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: '用户组不存在',
        data: null
      });
    }
    
    // 不允许删除内置用户组
    if (['administrators', 'regular-users'].includes(userGroups[groupIndex].name)) {
      return res.status(403).json({
        code: 403,
        message: '不允许删除内置用户组',
        data: null
      });
    }
    
    // 删除用户组
    const deletedGroup = userGroups.splice(groupIndex, 1)[0];
    
    res.json({
      code: 200,
      message: '删除用户组成功',
      data: deletedGroup
    });
  } catch (error) {
    logger.error('Delete user group error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '删除用户组失败',
      data: null
    });
  }
});

// 添加用户到用户组
router.post('/:id/members', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const groupId = id;
    const { userIds } = req.body;
    
    // 验证用户ID参数
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        code: 400,
        message: '用户ID参数必须是数组',
        data: null
      });
    }
    
    // 查找用户组
    const groupIndex = userGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: '用户组不存在',
        data: null
      });
    }
    
    // 验证用户是否存在
    const validUserIds = userIds.filter(userId => users.some(u => u.id === userId));
    
    // 添加用户到用户组
    const currentMembers = new Set(userGroups[groupIndex].members);
    validUserIds.forEach(userId => currentMembers.add(userId));
    
    userGroups[groupIndex].members = Array.from(currentMembers);
    userGroups[groupIndex].updatedAt = new Date().toISOString();
    
    res.json({
      code: 200,
      message: '添加用户到用户组成功',
      data: userGroups[groupIndex]
    });
  } catch (error) {
    logger.error('Add user to group error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '添加用户到用户组失败',
      data: null
    });
  }
});

// 从用户组移除用户
router.delete('/:id/members', requireAuth, requireAdmin, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const groupId = id;
    const { userIds } = req.body;
    
    // 验证用户ID参数
    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        code: 400,
        message: '用户ID参数必须是数组',
        data: null
      });
    }
    
    // 查找用户组
    const groupIndex = userGroups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
      return res.status(404).json({
        code: 404,
        message: '用户组不存在',
        data: null
      });
    }
    
    // 从用户组移除用户
    userGroups[groupIndex].members = userGroups[groupIndex].members.filter(
      memberId => !userIds.includes(memberId.toString())
    );
    userGroups[groupIndex].updatedAt = new Date().toISOString();
    
    res.json({
      code: 200,
      message: '从用户组移除用户成功',
      data: userGroups[groupIndex]
    });
  } catch (error) {
    logger.error('Remove user from group error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '从用户组移除用户失败',
      data: null
    });
  }
});

// 获取用户所属的所有用户组
router.get('/user/:userId', requireAuth, requirePermission('user:read'), (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userIdNum = userId;
    
    // 验证用户是否存在
    const user = users.find(u => u.id === userIdNum);
    
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
        data: null
      });
    }
    
    // 查找用户所属的所有用户组
    const userGroupsForUser = userGroups.filter(group => group.members.includes(userIdNum));
    
    res.json({
      code: 200,
      message: '获取用户所属用户组成功',
      data: userGroupsForUser
    });
  } catch (error) {
    logger.error('Get user groups for user error:', (error as Error).message);
    res.status(500).json({
      code: 500,
      message: '获取用户所属用户组失败',
      data: null
    });
  }
});

export default router;