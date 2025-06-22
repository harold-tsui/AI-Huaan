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
    res.status(200).json(config);
  } catch (error) {
    logger.error('Error fetching PARA organization config:', error);
    res.status(500).json({ message: 'Failed to fetch PARA organization config' });
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
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error saving PARA organization config:', error);
    res.status(500).json({ message: 'Failed to save PARA organization config' });
  }
});

/**
 * 手动执行一次PARA自动分类
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const schedulerManagerService = globalServiceRegistry.getService('OrganizationSchedulerManager') as any;
    if (!schedulerManagerService) {
      return res.status(503).json({ message: 'Scheduler manager not available' });
    }

    const schedulerManager = schedulerManagerService.getSchedulerManager();
    await schedulerManager.executeOnce();
    res.status(200).json({ message: 'PARA organization executed successfully' });
  } catch (error) {
    logger.error('Error executing PARA organization:', error);
    res.status(500).json({ message: 'Failed to execute PARA organization' });
  }
});

/**
 * 获取调度器状态
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const schedulerManagerService = globalServiceRegistry.getService('OrganizationSchedulerManager') as any;
    if (!schedulerManagerService) {
      return res.status(503).json({ message: 'Scheduler manager not available' });
    }

    const schedulerManager = schedulerManagerService.getSchedulerManager();
    const status = await schedulerManager.getStatus();
    res.status(200).json(status);
  } catch (error) {
    logger.error('Error getting scheduler status:', error);
    res.status(500).json({ message: 'Failed to get scheduler status' });
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
    
    res.status(200).json(mockHistory);
  } catch (error) {
    logger.error('Error fetching organization history:', error);
    res.status(500).json({ message: 'Failed to fetch organization history' });
  }
});

export default router;