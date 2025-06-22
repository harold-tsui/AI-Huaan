import { OrganizationService } from './organization.service';
import { IStorageService } from '../../shared/storage-services/storage.interface';
import { KnowledgeItem } from '../../shared/types/knowledge-item';
import { Logger } from '../../utils/logger';

const logger = new Logger('OrganizationScheduler');

export interface ScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  applyPARA: boolean;
  classificationRules: string;
  processingScope: 'all' | 'specific_folder';
  specificFolderPath?: string;
  vaultPath?: string;
}

export class OrganizationScheduler {
  private organizationService: OrganizationService;
  private storageService: IStorageService;
  private scheduleConfig: ScheduleConfig;
  private scheduledTimer: NodeJS.Timeout | null = null;

  constructor(
    organizationService: OrganizationService,
    storageService: IStorageService,
    initialConfig: ScheduleConfig
  ) {
    this.organizationService = organizationService;
    this.storageService = storageService;
    this.scheduleConfig = initialConfig;
    
    if (this.scheduleConfig.enabled) {
      this.startScheduler();
    }
  }

  /**
   * 更新调度配置
   */
  updateConfig(config: ScheduleConfig): void {
    logger.info('[OrganizationScheduler] Updating schedule configuration', config);
    
    // 停止当前调度器
    this.stopScheduler();
    
    // 更新配置
    this.scheduleConfig = { ...this.scheduleConfig, ...config };
    
    // 如果启用，重新启动调度器
    if (this.scheduleConfig.enabled) {
      this.startScheduler();
    }
  }

  /**
   * 启动调度器
   */
  private startScheduler(): void {
    logger.info('[OrganizationScheduler] Starting scheduler with config:', this.scheduleConfig);
    
    const nextExecutionTime = this.calculateNextExecutionTime();
    const delay = nextExecutionTime.getTime() - Date.now();
    
    logger.info(`[OrganizationScheduler] Next execution scheduled for: ${nextExecutionTime.toISOString()}`);
    
    this.scheduledTimer = setTimeout(() => {
      this.executeOrganization();
      // 重新调度下一次执行
      this.startScheduler();
    }, delay);
  }

  /**
   * 停止调度器
   */
  private stopScheduler(): void {
    if (this.scheduledTimer) {
      clearTimeout(this.scheduledTimer);
      this.scheduledTimer = null;
      logger.info('[OrganizationScheduler] Scheduler stopped');
    }
  }

  /**
   * 计算下一次执行时间
   */
  private calculateNextExecutionTime(): Date {
    const now = new Date();
    const [hours, minutes] = this.scheduleConfig.time.split(':').map(Number);
    
    let nextExecution = new Date();
    nextExecution.setHours(hours, minutes, 0, 0);
    
    // 如果今天的执行时间已过，计算下一次执行时间
    if (nextExecution <= now) {
      switch (this.scheduleConfig.frequency) {
        case 'daily':
          nextExecution.setDate(nextExecution.getDate() + 1);
          break;
        case 'weekly':
          nextExecution.setDate(nextExecution.getDate() + 7);
          break;
        case 'monthly':
          nextExecution.setMonth(nextExecution.getMonth() + 1);
          break;
      }
    }
    
    return nextExecution;
  }

  /**
   * 执行组织任务
   */
  private async executeOrganization(): Promise<void> {
    try {
      logger.info('[OrganizationScheduler] Starting scheduled organization task');
      
      // 获取需要处理的知识项目
      const items = await this.getItemsToProcess();
      
      if (items.length === 0) {
        logger.info('[OrganizationScheduler] No items to process');
        return;
      }
      
      logger.info(`[OrganizationScheduler] Processing ${items.length} items`);
      
      // 执行PARA分类
      if (this.scheduleConfig.applyPARA) {
        await this.applyPARAClassification(items);
      }
      
      // 应用自定义分类规则
      if (this.scheduleConfig.classificationRules) {
        await this.applyCustomRules(items);
      }
      
      logger.info('[OrganizationScheduler] Scheduled organization task completed successfully');
      
    } catch (error) {
      logger.error('[OrganizationScheduler] Error during scheduled organization:', error);
    }
  }

  /**
   * 获取需要处理的知识项目
   */
  private async getItemsToProcess(): Promise<KnowledgeItem[]> {
    try {
      // 根据处理范围获取项目
      if (this.scheduleConfig.processingScope === 'specific_folder' && this.scheduleConfig.specificFolderPath) {
        // 获取特定文件夹的项目
        return await this.storageService.searchItems({
          path: this.scheduleConfig.specificFolderPath
        });
      } else {
        // 获取所有项目
        return await this.storageService.getAllDocuments();
      }
    } catch (error) {
      logger.error('[OrganizationScheduler] Error fetching items to process:', error);
      return [];
    }
  }

  /**
   * 应用PARA分类
   */
  private async applyPARAClassification(items: KnowledgeItem[]): Promise<void> {
    for (const item of items) {
      try {
        const result = await this.organizationService.classifyContent(item);
        
        // 更新项目的分类
        if (result.category && result.confidence > 0.5) {
          item.metadata.category = result.category as any;
          item.metadata.classificationConfidence = result.confidence;
          item.metadata.classificationReasoning = result.reasoning;
          
          // 保存更新的项目
          await this.storageService.updateDocument(item.id, item);
          
          logger.debug(`[OrganizationScheduler] Classified item ${item.id} as ${result.category} (confidence: ${result.confidence})`);
        }
      } catch (error) {
        logger.error(`[OrganizationScheduler] Error classifying item ${item.id}:`, error);
      }
    }
  }

  /**
   * 应用自定义分类规则
   */
  private async applyCustomRules(items: KnowledgeItem[]): Promise<void> {
    const rules = this.parseClassificationRules(this.scheduleConfig.classificationRules);
    
    for (const item of items) {
      try {
        for (const rule of rules) {
          if (this.matchesRule(item, rule)) {
            // 应用规则
            if (rule.targetFolder) {
              item.metadata.folder = rule.targetFolder;
            }
            if (rule.targetTags && rule.targetTags.length > 0) {
              item.metadata.tags = [...(item.metadata.tags || []), ...rule.targetTags];
            }
            
            // 保存更新的项目
            await this.storageService.updateDocument(item.id, item);
            
            logger.debug(`[OrganizationScheduler] Applied custom rule to item ${item.id}: ${rule.keyword} -> ${rule.targetFolder}`);
            break; // 只应用第一个匹配的规则
          }
        }
      } catch (error) {
        logger.error(`[OrganizationScheduler] Error applying custom rules to item ${item.id}:`, error);
      }
    }
  }

  /**
   * 解析分类规则
   */
  private parseClassificationRules(rulesText: string): Array<{
    keyword: string;
    targetFolder?: string;
    targetTags?: string[];
  }> {
    const rules: Array<{
      keyword: string;
      targetFolder?: string;
      targetTags?: string[];
    }> = [];
    
    const lines = rulesText.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      const match = line.match(/^(.+?)\s*->\s*(.+)$/);
      if (match) {
        const keyword = match[1].trim();
        const target = match[2].trim();
        
        // 检查是否是标签（以#开头）还是文件夹
        if (target.startsWith('#')) {
          rules.push({
            keyword,
            targetTags: target.split(',').map(tag => tag.trim().replace(/^#/, ''))
          });
        } else {
          rules.push({
            keyword,
            targetFolder: target
          });
        }
      }
    }
    
    return rules;
  }

  /**
   * 检查项目是否匹配规则
   */
  private matchesRule(item: KnowledgeItem, rule: { keyword: string }): boolean {
    const keyword = rule.keyword.toLowerCase();
    
    // 检查内容
    if (item.content && item.content.toLowerCase().includes(keyword)) {
      return true;
    }
    
    // 检查标题中的关键词
        if (item.title && item.title.toLowerCase().includes(keyword)) {
            return true;
        } // 检查标签
    if (item.metadata.tags) {
      for (const tag of item.metadata.tags) {
        if (tag.toLowerCase().includes(keyword)) {
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * 手动执行一次组织任务
   */
  async executeOnce(): Promise<void> {
    logger.info('[OrganizationScheduler] Manual execution triggered');
    await this.executeOrganization();
  }

  /**
   * 获取当前调度状态
   */
  getStatus(): {
    enabled: boolean;
    nextExecution?: string;
    config: ScheduleConfig;
  } {
    const status = {
      enabled: this.scheduleConfig.enabled,
      config: this.scheduleConfig
    };
    
    if (this.scheduleConfig.enabled && this.scheduledTimer) {
      const nextExecution = this.calculateNextExecutionTime();
      return {
        ...status,
        nextExecution: nextExecution.toISOString()
      };
    }
    
    return status;
  }

  /**
   * 销毁调度器
   */
  destroy(): void {
    this.stopScheduler();
    logger.info('[OrganizationScheduler] Scheduler destroyed');
  }
}