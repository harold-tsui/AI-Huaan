/**
 * Base Capture Service - 基础捕获服务
 * 
 * 提供捕获服务的基础实现，作为所有捕获服务实现的基类
 */

import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../utils/logger';
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

/**
 * 基础捕获服务抽象类
 */
export abstract class BaseCaptureService implements ICaptureService {
  protected logger: Logger;
  protected processors: Map<string, ICaptureProcessor>;
  
  /**
   * 构造函数
   */
  constructor() {
    this.logger = new Logger(this.constructor.name);
    this.processors = new Map<string, ICaptureProcessor>();
    
    this.logger.info('Initializing base capture service');
  }
  
  /**
   * 创建捕获项
   */
  async createCaptureItem(input: CreateCaptureItemInput): Promise<CaptureItem> {
    this.logger.debug('Creating capture item', { sourceType: input.sourceType });
    
    const now = new Date().toISOString();
    
    // 创建新的捕获项
    const item: CaptureItem = {
      id: uuidv4(),
      userId: input.userId,
      sourceType: input.sourceType,
      status: input.status,
      priority: input.priority || CaptureItemPriority.MEDIUM,
      metadata: {
        capturedDate: now,
        ...input.metadata,
      },
      content: {
        ...input.content,
      },
      created: now,
      updated: now,
    };
    
    // 保存捕获项
    const savedItem = await this.saveCaptureItem(item);
    
    // 如果需要立即处理
    if (input.processImmediately && savedItem) {
      const processedItem = await this.processCaptureItem(savedItem.id);
      return processedItem || savedItem; // 如果处理失败，返回原始保存的项
    }
    
    return savedItem;
  }
  
  /**
   * 保存捕获项（由子类实现）
   */
  protected abstract saveCaptureItem(item: CaptureItem): Promise<CaptureItem>;
  
  /**
   * 获取捕获项（由子类实现）
   */
  abstract getCaptureItem(id: string): Promise<CaptureItem | null>;
  
  /**
   * 更新捕获项
   */
  async updateCaptureItem(id: string, input: UpdateCaptureItemInput): Promise<CaptureItem | null> {
    this.logger.debug('Updating capture item', { id });
    
    // 获取现有捕获项
    const existingItem = await this.getCaptureItem(id);
    if (!existingItem) {
      this.logger.warn('Capture item not found', { id });
      return null;
    }
    
    // 更新捕获项
    const updatedItem: CaptureItem = {
      ...existingItem,
      status: input.status || existingItem.status,
      priority: input.priority || existingItem.priority,
      metadata: {
        ...existingItem.metadata,
        ...(input.metadata || {}),
      },
      content: {
        ...existingItem.content,
        ...(input.content || {}),
      },
      processingResult: input.processingResult
        ? {
            ...existingItem.processingResult,
            ...input.processingResult,
          }
        : existingItem.processingResult,
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
    
    // 保存更新后的捕获项
    return this.saveCaptureItem(updatedItem);
  }
  
  /**
   * 删除捕获项（由子类实现）
   */
  abstract deleteCaptureItem(id: string): Promise<boolean>;
  
  /**
   * 查询捕获项（由子类实现）
   */
  abstract queryCaptureItems(options: CaptureItemQueryOptions): Promise<{
    items: CaptureItem[];
    total: number;
  }>;
  
  /**
   * 处理捕获项
   */
  async processCaptureItem(id: string): Promise<CaptureItem | null> {
    this.logger.debug('Processing capture item', { id });
    
    // 获取捕获项
    const item = await this.getCaptureItem(id);
    if (!item) {
      this.logger.warn('Capture item not found', { id });
      return null;
    }
    
    // 更新状态为处理中
    await this.updateCaptureItem(id, { status: CaptureItemStatus.PROCESSING });
    
    try {
      // 查找适合的处理器
      const processor = this.findSuitableProcessor(item.sourceType);
      if (!processor) {
        throw new Error(`No suitable processor found for source type: ${item.sourceType}`);
      }
      
      // 处理捕获项
      const result = await processor.processCaptureItem(item);
      
      // 更新处理结果和状态
      return this.updateCaptureItem(id, {
        status: CaptureItemStatus.COMPLETED,
        processingResult: result,
      });
    } catch (error) {
      this.logger.error('Failed to process capture item', { id, error: error instanceof Error ? error : String(error) });
      
      // 更新状态为失败
      return this.updateCaptureItem(id, {
        status: CaptureItemStatus.FAILED,
        processingResult: {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
  
  /**
   * 归档捕获项
   */
  async archiveCaptureItem(id: string): Promise<CaptureItem | null> {
    this.logger.debug('Archiving capture item', { id });
    
    return this.updateCaptureItem(id, { status: CaptureItemStatus.ARCHIVED });
  }
  
  /**
   * 从网页捕获
   */
  async captureFromWeb(options: WebCaptureOptions, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem> {
    this.logger.debug('Capturing from web', { url: options.url });
    
    // 创建元数据
    const metadata: Partial<CaptureItemMetadata> = {
      title: options.url,
      source: 'web',
      url: options.url,
      capturedDate: new Date().toISOString(),
      ...(input?.metadata || {}),
    };
    
    // 创建内容（初始为空，将由子类实现填充）
    const content: Partial<CaptureItemContent> = {
      ...(input?.content || {}),
    };
    
    // 执行实际的网页捕获（由子类实现）
    const captureResult = await this.performWebCapture(options);
    
    // 合并捕获结果
    const mergedMetadata = { ...metadata, ...captureResult.metadata };
    const mergedContent = { ...content, ...captureResult.content };
    
    // 创建捕获项
    return this.createCaptureItem({
      userId: input?.userId || 'system',
      sourceType: CaptureSourceType.WEB,
      status: input?.status || CaptureItemStatus.PENDING,
      priority: input?.priority,
      metadata: mergedMetadata,
      content: mergedContent,
      processImmediately: input?.processImmediately,
    });
  }
  
  /**
   * 执行网页捕获（由子类实现）
   */
  protected abstract performWebCapture(options: WebCaptureOptions): Promise<{
    metadata: Partial<CaptureItemMetadata>;
    content: Partial<CaptureItemContent>;
  }>;
  
  /**
   * 从文件捕获
   */
  async captureFromFile(options: FileCaptureOptions, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem> {
    this.logger.debug('Capturing from file', {
      filePath: options.filePath,
      fileUrl: options.fileUrl,
    });
    
    // 创建元数据
    const metadata: Partial<CaptureItemMetadata> = {
      source: 'file',
      capturedDate: new Date().toISOString(),
      ...(input?.metadata || {}),
    };
    
    // 创建内容（初始为空，将由子类实现填充）
    const content: Partial<CaptureItemContent> = {
      ...(input?.content || {}),
    };
    
    // 执行实际的文件捕获（由子类实现）
    const captureResult = await this.performFileCapture(options);
    
    // 合并捕获结果
    const mergedMetadata = { ...metadata, ...captureResult.metadata };
    const mergedContent = { ...content, ...captureResult.content };
    
    // 创建捕获项
    return this.createCaptureItem({
      userId: input?.userId || 'system',
      sourceType: CaptureSourceType.FILE,
      status: input?.status || CaptureItemStatus.PENDING,
      priority: input?.priority,
      metadata: mergedMetadata,
      content: mergedContent,
      processImmediately: input?.processImmediately,
    });
  }
  
  /**
   * 执行文件捕获（由子类实现）
   */
  protected abstract performFileCapture(options: FileCaptureOptions): Promise<{
    metadata: Partial<CaptureItemMetadata>;
    content: Partial<CaptureItemContent>;
  }>;
  
  /**
   * 从文本捕获
   */
  async captureFromText(text: string, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem> {
    this.logger.debug('Capturing from text', { textLength: text.length });
    
    // 创建元数据
    const metadata: Partial<CaptureItemMetadata> = {
      title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      source: 'text',
      capturedDate: new Date().toISOString(),
      ...(input?.metadata || {}),
    };
    
    // 创建内容
    const content: Partial<CaptureItemContent> = {
      text,
      ...(input?.content || {}),
    };
    
    // 创建捕获项
    return this.createCaptureItem({
      userId: input?.userId || 'system',
      sourceType: CaptureSourceType.TEXT,
      status: input?.status || CaptureItemStatus.PENDING,
      priority: input?.priority,
      metadata,
      content,
      processImmediately: input?.processImmediately,
    });
  }
  
  /**
   * 从URL捕获
   */
  async captureFromUrl(url: string, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem> {
    this.logger.debug('Capturing from URL', { url });
    
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
   * 注册处理器
   */
  registerProcessor(processor: ICaptureProcessor): void {
    this.logger.debug('Registering processor', { name: processor.getName() });
    
    this.processors.set(processor.getName(), processor);
  }
  
  /**
   * 获取处理器
   */
  getProcessor(name: string): ICaptureProcessor | null {
    return this.processors.get(name) || null;
  }
  
  /**
   * 获取所有处理器
   */
  getAllProcessors(): ICaptureProcessor[] {
    return Array.from(this.processors.values());
  }
  
  /**
   * 查找适合的处理器
   */
  protected findSuitableProcessor(sourceType: CaptureSourceType): ICaptureProcessor | null {
    const processors = Array.from(this.processors.values());
    for (const processor of processors) {
      if (processor.getSupportedSourceTypes().includes(sourceType)) {
        return processor;
      }
    }
    
    return null;
  }
}