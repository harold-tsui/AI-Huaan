import express, { Request, Response, Router } from 'express';
import { ConfigManagementService } from './config-management.service';

const router: Router = express.Router();
const configManagementService = new ConfigManagementService();

router.get('/core-platform', async (req: Request, res: Response) => {
  try {
    const config = await configManagementService.getCorePlatformConfig();
    res.status(200).json(config);
  } catch (error) {
    console.error('[ConfigManagementController] Error fetching core platform config:', error);
    res.status(500).json({ message: 'Failed to fetch core platform config' });
  }
});

router.post('/core-platform', async (req: Request, res: Response) => {
  try {
    const result = await configManagementService.saveCorePlatformConfig(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('[ConfigManagementController] Error saving core platform config:', error);
    res.status(500).json({ message: 'Failed to save core platform config' });
  }
});

// PARA自动分类配置端点
router.get('/para-organization', async (req: Request, res: Response) => {
  try {
    const config = await configManagementService.getPARAOrganizationConfig();
    res.status(200).json(config);
  } catch (error) {
    console.error('[ConfigManagementController] Error fetching PARA organization config:', error);
    res.status(500).json({ message: 'Failed to fetch PARA organization config' });
  }
});

router.post('/para-organization', async (req: Request, res: Response) => {
  try {
    const result = await configManagementService.savePARAOrganizationConfig(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('[ConfigManagementController] Error saving PARA organization config:', error);
    res.status(500).json({ message: 'Failed to save PARA organization config' });
  }
});

// 获取所有配置
router.get('/all', async (req: Request, res: Response) => {
  try {
    const configs = await configManagementService.getAllConfigs();
    res.status(200).json(configs);
  } catch (error) {
    console.error('[ConfigManagementController] Error fetching all configs:', error);
    res.status(500).json({ message: 'Failed to fetch all configs' });
  }
});

export default router;