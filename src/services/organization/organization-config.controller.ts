import { Router, Request, Response } from 'express';
import { globalServiceRegistry } from '../../shared/mcp-core/service-registry';
import { OrganizationSchedulerManager } from './organization-scheduler-manager';
import { ConfigManagementService } from '../config-management/config-management.service';
import { Logger } from '../../utils/logger';

const router = Router();
const logger = new Logger('OrganizationConfigController');

/**
 * 获取PARA自动分类配置
 */
const configService = new ConfigManagementService();

router.get('/config', async (req: Request, res: Response) => {
  try {
    const config = await configService.getPARAOrganizationConfig();
    res.status(200).json({ success: true, code: 200, message: '配置获取成功', data: config });
  } catch (error) {
    logger.error('Error fetching PARA organization config:', error);
    res.status(500).json({ success: false, code: 500, message: '获取配置失败', error: { type: 'InternalServerError', message: (error as Error).message } });
  }
});

/**
 * 保存PARA自动分类配置
 */
router.post('/config', async (req: Request, res: Response) => {
  try {
    const result = await configService.savePARAOrganizationConfig(req.body);
    
    // 更新调度器配置
    try {
      const schedulerManagerService = globalServiceRegistry.getService('OrganizationSchedulerManager') as any;
      if (schedulerManagerService) {
        const schedulerManager = schedulerManagerService.getSchedulerManager();
        await schedulerManager.updateScheduleConfig(req.body);
      }
    } catch (schedulerError) {
      logger.warn('Failed to update scheduler config, but configuration was saved:', schedulerError);
    }
    
    res.status(200).json({ success: true, code: 200, message: '配置保存成功', data: result });
  } catch (error) {
    logger.error('Error saving PARA organization config:', error);
    res.status(500).json({ success: false, code: 500, message: '保存配置失败', error: { type: 'InternalServerError', message: (error as Error).message } });
  }
});

/**
 * 手动执行一次PARA自动分类
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const schedulerManagerService = globalServiceRegistry.getService('OrganizationSchedulerManager') as any;
    if (!schedulerManagerService) {
      return res.status(503).json({ success: false, code: 503, message: '调度器服务不可用', error: { type: 'ServiceUnavailable', message: 'Scheduler manager not available' } });
    }

    const schedulerManager = schedulerManagerService.getSchedulerManager();
    await schedulerManager.executeOnce();
    res.status(200).json({ success: true, code: 200, message: 'PARA 组织化执行成功' });
  } catch (error) {
    logger.error('Error executing PARA organization:', error);
    res.status(500).json({ success: false, code: 500, message: '执行 PARA 组织化失败', error: { type: 'InternalServerError', message: (error as Error).message } });
  }
});

/**
 * 获取调度器状态
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const schedulerManagerService = globalServiceRegistry.getService('OrganizationSchedulerManager') as any;
    if (!schedulerManagerService) {
      return res.status(503).json({ success: false, code: 503, message: '调度器服务不可用', error: { type: 'ServiceUnavailable', message: 'Scheduler manager not available' } });
    }

    const schedulerManager = schedulerManagerService.getSchedulerManager();
    const status = await schedulerManager.getStatus();
    res.status(200).json({ success: true, code: 200, message: '获取状态成功', data: status });
  } catch (error) {
    logger.error('Error getting scheduler status:', error);
    res.status(500).json({ success: false, code: 500, message: '获取状态失败', error: { type: 'InternalServerError', message: (error as Error).message } });
  }
});

/**
 * 获取组织历史记录
 */
router.get('/history', async (req: Request, res: Response) => {
  try {
    // 这里应该从数据库或其他存储中获取历史记录
    // 目前返回模拟数据作为示例
    const mockHistory = [
      {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'success',
        message: '成功组织了25个文件到PARA结构'
      },
      {
        timestamp: '2023-06-14 03:00:00',
        status: 'success',
        message: '自动组织完成，处理了12个文件'
      },
      {
        timestamp: '2023-06-13 03:00:00',
        status: 'danger',
        message: '组织失败：无法访问Vault路径'
      }
    ];
    
    res.status(200).json({ success: true, code: 200, message: '获取历史记录成功', data: mockHistory });
  } catch (error) {
    logger.error('Error fetching organization history:', error);
    res.status(500).json({ success: false, code: 500, message: '获取历史记录失败', error: { type: 'InternalServerError', message: (error as Error).message } });
  }
});

export default router;