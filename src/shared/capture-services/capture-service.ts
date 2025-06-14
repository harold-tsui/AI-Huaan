/**
 * Capture Service - 捕获服务
 * 
 * 管理和处理捕获项的服务
 */

import { v4 as uuidv4 } from 'uuid';
import { BaseService } from '../mcp-core/base-service';
import { MCPRequest, MCPResponse, ServiceStatus } from '../mcp-core/types';
import { Logger } from '../../utils/logger';
import { IKnowledgeGraphService } from '../knowledge-graph-services/types';
import { IAIService } from '../ai-services/types';
import {
  CaptureItem,
  CaptureItemContent,
  CaptureItemMetadata,
  CaptureItemPriority,
  CaptureItemProcessingResult,
  CaptureItemQueryOptions,
  CaptureItemStatus,
  CaptureSourceType,
  CreateCaptureItemInput,
  FileCaptureOptions,
  ICaptureProcessor,
  ICaptureService,
  UpdateCaptureItemInput,
  WebCaptureOptions,
} from './types';
import { BaseCaptureProcessor } from './base-capture-processor';

/**
 * 捕获服务实现
 */
export class CaptureService extends BaseService implements ICaptureService {
  public handleRequest(request: MCPRequest): Promise<MCPResponse> {
    throw new Error('Method not implemented.');
  }
  private processors: Map<string, ICaptureProcessor>;
  private knowledgeGraphService?: IKnowledgeGraphService;
  private aiService?: IAIService;
  
  /**
   * 构造函数
   */
  constructor() {
    super('capture-service', '1.0.0', {
      maxConcurrentProcessing: 5,
      defaultPriority: CaptureItemPriority.NORMAL,
      processingTimeout: 300000, // 5分钟超时
    });
    this.processors = new Map<string, ICaptureProcessor>();
    this.logger = new Logger('CaptureService');
  }
  
  /**
   * 初始化服务
   */
  async initialize(): Promise<boolean> {
    this.logger.info('Initializing Capture Service');
    
    try {
      // 初始化依赖服务
      // 注意：实际实现中，这些服务应通过依赖注入或服务注册表获取
      
      // 设置服务状态为已初始化
      this.status = ServiceStatus.INITIALIZED;
      this.logger.info('Capture Service initialized successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize Capture Service', { error: error instanceof Error ? error : String(error) });
      this.status = ServiceStatus.ERROR;
      return false;
    }
  }
  
  /**
   * 关闭服务
   */
  async shutdown(): Promise<boolean> {
    this.logger.info('Shutting down Capture Service');
    
    try {
      // 清理资源
      this.processors.clear();
      
      // 设置服务状态为已关闭
      this.status = ServiceStatus.STOPPED;
      this.logger.info('Capture Service shut down successfully');
      return true;
    } catch (error) {
      this.logger.error('Failed to shut down Capture Service', { error: error instanceof Error ? error : String(error) });
      this.status = ServiceStatus.ERROR;
      return false;
    }
  }
  
  /**
   * 注册捕获处理器
   * @param processor 捕获处理器
   */
  registerProcessor(processor: ICaptureProcessor): void {
    const processorName = processor.getName();
    this.logger.info(`Registering capture processor: ${processorName}`);
    this.processors.set(processorName, processor);
  }
  
  /**
   * 注销捕获处理器
   * @param processorName 处理器名称
   */
  unregisterProcessor(processorName: string): boolean {
    this.logger.info(`Unregistering capture processor: ${processorName}`);
    return this.processors.delete(processorName);
  }
  
  /**
   * 获取所有注册的处理器
   */
  getProcessors(): ICaptureProcessor[] {
    return Array.from(this.processors.values());
  }
  
  /**
   * 获取支持指定源类型的处理器
   * @param sourceType 源类型
   */
  getProcessorsForSourceType(sourceType: CaptureSourceType): ICaptureProcessor[] {
    return this.getProcessors().filter(processor => 
          processor.getSupportedSourceTypes().includes(sourceType)
    );
  }
  
  /**
   * 设置知识图谱服务
   * @param service 知识图谱服务
   */
  setKnowledgeGraphService(service: IKnowledgeGraphService): void {
    this.knowledgeGraphService = service;
  }
  
  /**
   * 设置AI服务
   * @param service AI服务
   */
  setAIService(service: IAIService): void {
    this.aiService = service;
  }
  
  /**
   * 创建捕获项
   * @param input 创建捕获项输入
   */
  async createCaptureItem(input: CreateCaptureItemInput): Promise<CaptureItem> {
    this.logger.info(`Creating capture item from source: ${input.sourceType}`);
    
    // 生成唯一ID
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // 创建捕获项
    const captureItem: CaptureItem = {
      id,
      userId: input.userId,
      sourceType: input.sourceType,
      content: input.content || {},
      metadata: {
        ...input.metadata,
        capturedDate: input.metadata?.capturedDate || now, // 确保 capturedDate 有值
      },
      status: CaptureItemStatus.PENDING,
      priority: input.priority || CaptureItemPriority.MEDIUM,
      created: now,
      updated: now,
    };
    
    // 如果配置了自动处理，则立即处理
    if (input.processImmediately) {
      await this.processCaptureItem(captureItem.id);
    }
    
    return captureItem;
  }
  
  /**
   * 获取捕获项
   * @param id 捕获项ID
   */
  async getCaptureItem(id: string): Promise<CaptureItem | null> {
    this.logger.info(`Getting capture item: ${id}`);
    
    // 实际实现中，应从数据库或存储中获取
    // 这里仅为示例，返回null表示未找到
    return null;
  }
  
  /**
   * 更新捕获项
   * @param id 捕获项ID
   * @param input 更新捕获项输入
   */
  async updateCaptureItem(id: string, input: UpdateCaptureItemInput): Promise<CaptureItem | null> {
    this.logger.info(`Updating capture item: ${id}`);
    
    // 获取现有捕获项
    const existingItem = await this.getCaptureItem(id);
    if (!existingItem) {
      this.logger.warn(`Capture item not found: ${id}`);
      return null;
    }
    
    // 更新捕获项
    const updatedItem: CaptureItem = {
      ...existingItem,
      content: input.content ? { ...existingItem.content, ...input.content } : existingItem.content,
      metadata: input.metadata ? { ...existingItem.metadata, ...input.metadata } : existingItem.metadata,
      status: input.status || existingItem.status,
      priority: input.priority || existingItem.priority,
      updated: new Date().toISOString(),
    };
    
    // 如果状态变为已处理，设置处理时间
    if (input.status === CaptureItemStatus.COMPLETED && !existingItem.processed) {
      updatedItem.processed = new Date().toISOString();
    }
    
    // 如果状态变为已归档，设置归档时间
    if (input.status === CaptureItemStatus.ARCHIVED && !existingItem.archived) {
      updatedItem.archived = new Date().toISOString();
    }
    
    // 实际实现中，应将更新后的项保存到数据库或存储中
    
    return updatedItem;
  }
  
  /**
   * 删除捕获项
   * @param id 捕获项ID
   */
  async deleteCaptureItem(id: string): Promise<boolean> {
    this.logger.info(`Deleting capture item: ${id}`);
    
    // 实际实现中，应从数据库或存储中删除
    // 这里仅为示例，返回true表示删除成功
    return true;
  }
  
  /**
   * 查询捕获项
   * @param options 查询选项
   */
  async queryCaptureItems(options: CaptureItemQueryOptions): Promise<{ items: CaptureItem[]; total: number; }> {
    this.logger.info('Querying capture items', options);
    
    // 实际实现中，应根据查询选项从数据库或存储中查询
    // 这里仅为示例，返回空数组
    return { items: [], total: 0 };
  }
  
  /**
   * 处理捕获项
   * @param id 捕获项ID
   */
  async processCaptureItem(id: string): Promise<CaptureItem | null> {
    this.logger.info(`Processing capture item: ${id}`);
    
    // 获取捕获项
    const item = await this.getCaptureItem(id);
    if (!item) {
      this.logger.warn(`Capture item not found: ${id}`);
      return null;
    }
    
    // 更新状态为处理中
    await this.updateCaptureItem(id, { status: CaptureItemStatus.PROCESSING });
    
    // 获取适用的处理器
    const processors = this.getProcessorsForSourceType(item.sourceType);
    if (processors.length === 0) {
      this.logger.warn(`No processors found for source type: ${item.sourceType}`);
      
      // 更新状态为错误
      return this.updateCaptureItem(id, { status: CaptureItemStatus.FAILED });
    }
    
    // 使用所有适用的处理器处理捕获项
    const results: CaptureItemProcessingResult[] = [];
    let hasSuccessfulProcessing = false;
    
    for (const processor of processors) {
      try {
        const result = await processor.processCaptureItem(item);
        results.push(result);
        
        if (result.success) {
          hasSuccessfulProcessing = true;
        }
      } catch (error) {
        this.logger.error(`Error processing capture item with ${processor.getName()}`, { error: error instanceof Error ? error : String(error) });
        results.push({
          success: false,
          message: `Processing error: ${error instanceof Error ? error.message : String(error)}`,
          processorName: processor.getName(),
        });
      }
    }
    
    // 更新状态和处理结果
    return this.updateCaptureItem(id, {
      status: hasSuccessfulProcessing ? CaptureItemStatus.COMPLETED : CaptureItemStatus.FAILED,
      processingResult: results[0], // 使用第一个处理结果
    });
  }
  
  /**
   * 归档捕获项
   * @param id 捕获项ID
   */
  async archiveCaptureItem(id: string): Promise<CaptureItem | null> {
    this.logger.info(`Archiving capture item: ${id}`);
    return this.updateCaptureItem(id, { status: CaptureItemStatus.ARCHIVED });
  }
  
  /**
   * 从网页捕获内容
   * @param options 网页捕获选项
   * @param input 附加输入
   */
  async captureFromWeb(options: WebCaptureOptions, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem> {
    const { url } = options;
    this.logger.info(`Capturing content from web: ${url}`);
    
    // 准备元数据
    const metadata: Partial<CaptureItemMetadata> = {
      title: url,
      source: url,
      capturedDate: new Date().toISOString(),
      ...(input?.metadata || {}),
    };
    
    // 准备内容
    const content: Partial<CaptureItemContent> = {
      fileUrl: url, // 使用 fileUrl 而不是 url，因为 CaptureItemContent 没有 url 属性
      ...(input?.content || {}),
    };
    
    // 创建捕获项
    return this.createCaptureItem({
      userId: input?.userId || 'system',
      sourceType: CaptureSourceType.WEB,
      content,
      metadata,
      processImmediately: input?.processImmediately ?? true,
      priority: input?.priority,
      status: input?.status || CaptureItemStatus.PENDING,
    });
  }
  
  /**
   * 从文件捕获内容
   * @param options 文件捕获选项
   * @param input 附加输入
   */
  async captureFromFile(options: FileCaptureOptions, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem> {
    this.logger.info(`Capturing content from file: ${options.filePath || options.fileUrl}`);
    
    // 准备元数据
    const metadata: Partial<CaptureItemMetadata> = {
      title: options.filePath || options.fileUrl,
      source: 'file',
      capturedDate: new Date().toISOString(),
      ...(input?.metadata || {}),
    };
    
    // 准备内容对象
    const content: Partial<CaptureItemContent> = {
      filePath: options.filePath,
      fileUrl: options.fileUrl,
      ...(input?.content || {}),
    };
    
    // 创建捕获项
    return this.createCaptureItem({
      userId: input?.userId || 'system',
      sourceType: CaptureSourceType.FILE,
      content,
      metadata,
      processImmediately: input?.processImmediately ?? true,
      priority: input?.priority,
      status: input?.status || CaptureItemStatus.PENDING,
    });
  }
  
  /**
   * 从文本捕获内容
   * @param text 文本内容
   * @param input 附加输入
   */
  async captureFromText(text: string, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem> {
    this.logger.info(`Capturing content from text: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
    
    // 准备元数据
    const metadata: Partial<CaptureItemMetadata> = {
      title: text.substring(0, 100).trim(),
      ...(input?.metadata || {}),
    };
    
    // 准备内容
    const content: Partial<CaptureItemContent> = {
      text,
      ...(input?.content || {}),
    };
    
    // 创建捕获项
    return this.createCaptureItem({
      userId: input?.userId || 'system',
      sourceType: CaptureSourceType.TEXT,
      content,
      metadata,
      processImmediately: input?.processImmediately ?? true,
      priority: input?.priority,
      status: input?.status || CaptureItemStatus.PENDING,
    });
  }
  
  /**
   * 从URL捕获内容
   * @param url URL
   * @param input 附加输入
   */
  async captureFromUrl(url: string, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem> {
    this.logger.info(`Capturing content from URL: ${url}`);
    
    // 根据URL类型选择捕获方法
    if (this.isWebUrl(url)) {
      return this.captureFromWeb({ url }, input);
    } else {
      return this.captureFromFile({ fileUrl: url }, input);
    }
  }
  
  /**
   * 判断URL是否为网页URL
   */
  private isWebUrl(url: string): boolean {
    // 简单判断：如果URL以http://或https://开头，且不以常见文件扩展名结尾，则认为是网页URL
    const isHttp = url.startsWith('http://') || url.startsWith('https://');
    const hasFileExtension = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar|7z|tar|gz|mp3|mp4|avi|mov|png|jpg|jpeg|gif|svg)$/i.test(url);
    
    return isHttp && !hasFileExtension;
  }
  
  /**
   * 获取处理器
   * @param name 处理器名称
   */
  getProcessor(name: string): ICaptureProcessor | null {
    return this.processors.get(name) || null;
  }
  
  /**
   * 获取所有处理器
   */
  getAllProcessors(): ICaptureProcessor[] {
    return this.getProcessors();
  }
}

// 创建全局捕获服务实例
export const globalCaptureService = new CaptureService();