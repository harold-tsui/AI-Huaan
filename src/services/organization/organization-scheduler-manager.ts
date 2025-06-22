import { OrganizationService } from './organization.service';
import { IStorageService } from '../../shared/storage-services/storage.interface';
import { ConfigManagementService } from '../config-management/config-management.service';
import { Logger } from '../../utils/logger';
import { OrganizationScheduler, ScheduleConfig } from './scheduler.service';

const logger = new Logger('OrganizationSchedulerManager');

/**
 * 组织调度管理器
 * 负责管理PARA自动分类的调度器实例，并与配置管理服务集成
 */
export class OrganizationSchedulerManager {
  private scheduler: OrganizationScheduler | null = null;
  private organizationService: OrganizationService;
  private storageService: IStorageService;
  private configService: ConfigManagementService;

  constructor(
    organizationService: OrganizationService,
    storageService: IStorageService,
    configService: ConfigManagementService
  ) {
    this.organizationService = organizationService;
    this.storageService = storageService;
    this.configService = configService;
  }

  /**
   * 初始化调度管理器
   */
  async initialize(): Promise<void> {
    try {
      logger.info('[OrganizationSchedulerManager] Initializing scheduler manager');
      
      // 从配置服务获取当前配置
      const config = await this.configService.getPARAOrganizationConfig();
      
      // 转换配置格式
      const scheduleConfig = this.convertToScheduleConfig(config);
      
      // 创建调度器实例
      if (scheduleConfig.enabled) {
        this.createScheduler(scheduleConfig);
      }
      
      logger.info('[OrganizationSchedulerManager] Scheduler manager initialized successfully');
    } catch (error) {
      logger.error('[OrganizationSchedulerManager] Error initializing scheduler manager:', error);
    }
  }

  /**
   * 更新调度配置
   */
  async updateScheduleConfig(config: any): Promise<void> {
    try {
      logger.info('[OrganizationSchedulerManager] Updating schedule configuration');
      
      // 保存配置到配置服务
      await this.configService.savePARAOrganizationConfig(config);
      
      // 转换配置格式
      const scheduleConfig = this.convertToScheduleConfig(config);
      
      if (scheduleConfig.enabled) {
        if (this.scheduler) {
          // 更新现有调度器
          this.scheduler.updateConfig(scheduleConfig);
        } else {
          // 创建新的调度器
          this.createScheduler(scheduleConfig);
        }
      } else {
        // 禁用调度器
        this.destroyScheduler();
      }
      
      logger.info('[OrganizationSchedulerManager] Schedule configuration updated successfully');
    } catch (error) {
      logger.error('[OrganizationSchedulerManager] Error updating schedule configuration:', error);
      throw error;
    }
  }

  /**
   * 手动执行一次组织任务
   */
  async executeOnce(): Promise<void> {
    try {
      logger.info('[OrganizationSchedulerManager] Manual execution requested');
      
      if (!this.scheduler) {
        // 如果没有调度器，创建一个临时的
        const config = await this.configService.getPARAOrganizationConfig();
        const scheduleConfig = this.convertToScheduleConfig(config);
        
        const tempScheduler = new OrganizationScheduler(
          this.organizationService,
          this.storageService,
          scheduleConfig
        );
        
        await tempScheduler.executeOnce();
        tempScheduler.destroy();
      } else {
        await this.scheduler.executeOnce();
      }
      
      logger.info('[OrganizationSchedulerManager] Manual execution completed');
    } catch (error) {
      logger.error('[OrganizationSchedulerManager] Error during manual execution:', error);
      throw error;
    }
  }

  /**
   * 获取调度器状态
   */
  async getStatus(): Promise<any> {
    try {
      const config = await this.configService.getPARAOrganizationConfig();
      
      if (this.scheduler) {
        const schedulerStatus = this.scheduler.getStatus();
        return {
          ...schedulerStatus,
          isRunning: true
        };
      } else {
        return {
          enabled: config.enable_obsidian_organization || false,
          isRunning: false,
          config: this.convertToScheduleConfig(config)
        };
      }
    } catch (error) {
      logger.error('[OrganizationSchedulerManager] Error getting status:', error);
      return {
        enabled: false,
        isRunning: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 创建调度器实例
   */
  private createScheduler(config: ScheduleConfig): void {
    // 销毁现有调度器
    this.destroyScheduler();
    
    // 创建新调度器
    this.scheduler = new OrganizationScheduler(
      this.organizationService,
      this.storageService,
      config
    );
    
    logger.info('[OrganizationSchedulerManager] Scheduler created successfully');
  }

  /**
   * 销毁调度器实例
   */
  private destroyScheduler(): void {
    if (this.scheduler) {
      this.scheduler.destroy();
      this.scheduler = null;
      logger.info('[OrganizationSchedulerManager] Scheduler destroyed');
    }
  }

  /**
   * 转换配置格式
   */
  private convertToScheduleConfig(config: any): ScheduleConfig {
    return {
      enabled: config.enable_obsidian_organization && config.obsidian_organization_mode === 'scheduled',
      frequency: config.obsidian_organization_frequency || 'daily',
      time: config.obsidian_organization_time || '03:00',
      applyPARA: config.obsidian_apply_para !== false,
      classificationRules: config.obsidian_classification_rules || '',
      processingScope: config.obsidian_processing_scope || 'all',
      specificFolderPath: config.obsidian_specific_folder_path,
      vaultPath: config.obsidian_organization_vault_path
    };
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.destroyScheduler();
    logger.info('[OrganizationSchedulerManager] Scheduler manager destroyed');
  }
}