import express, { Request, Response, Router } from 'express';
import { ConfigManagementService } from './config-management.service';
import { Logger } from '../../utils/logger';

const router: Router = express.Router();
const configManagementService = new ConfigManagementService();
const logger = new Logger('ConfigManagementController');

router.get('/core-platform', async (req: Request, res: Response) => {
  try {
    const config = await configManagementService.getCorePlatformConfig();
    res.status(200).json({ success: true, code: 200, message: '核心平台配置获取成功', data: config });
  } catch (error) {
    logger.error('Error fetching core platform config:', (error as Error).message);
    res.status(500).json({ success: false, code: 500, message: '获取核心平台配置失败', error: { type: 'InternalServerError', message: (error as Error).message } });
  }
});

router.post('/core-platform', async (req: Request, res: Response) => {
  try {
    const result = await configManagementService.saveCorePlatformConfig(req.body);
    res.status(200).json({ success: true, code: 200, message: '核心平台配置保存成功', data: result });
  } catch (error) {
    logger.error('Error saving core platform config:', (error as Error).message);
    res.status(500).json({ success: false, code: 500, message: '保存核心平台配置失败', error: { type: 'InternalServerError', message: (error as Error).message } });
  }
});

// PARA自动分类配置端点
router.get('/para-organization', async (req: Request, res: Response) => {
  try {
    const config = await configManagementService.getPARAOrganizationConfig();
    res.status(200).json({ success: true, code: 200, message: 'PARA组织配置获取成功', data: config });
  } catch (error) {
    logger.error('Error fetching PARA organization config:', (error as Error).message);
    res.status(500).json({ success: false, code: 500, message: '获取PARA组织配置失败', error: { type: 'InternalServerError', message: (error as Error).message } });
  }
});

router.post('/para-organization', async (req: Request, res: Response) => {
  try {
    const result = await configManagementService.savePARAOrganizationConfig(req.body);
    res.status(200).json({ success: true, code: 200, message: 'PARA组织配置保存成功', data: result });
  } catch (error) {
    logger.error('Error saving PARA organization config:', (error as Error).message);
    res.status(500).json({ success: false, code: 500, message: '保存PARA组织配置失败', error: { type: 'InternalServerError', message: (error as Error).message } });
  }
});

// 获取所有配置
router.get('/all', async (req: Request, res: Response) => {
  try {
    const configs = await configManagementService.getAllConfigs();
    res.status(200).json({ success: true, code: 200, message: '所有配置获取成功', data: configs });
  } catch (error) {
    logger.error('Error fetching all configs:', (error as Error).message);
    res.status(500).json({ success: false, code: 500, message: '获取所有配置失败', error: { type: 'InternalServerError', message: (error as Error).message } });
  }
});

export default router;