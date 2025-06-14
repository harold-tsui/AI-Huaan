/**
 * Base Capture Processor - 基础捕获处理器
 * 
 * 为捕获处理器提供基础实现
 */

import { Logger } from '../../utils/logger';
import {
  CaptureItem,
  CaptureItemProcessingResult,
  CaptureSourceType,
  ICaptureProcessor,
} from './types';

/**
 * 基础捕获处理器抽象类
 */
export abstract class BaseCaptureProcessor implements ICaptureProcessor {
  protected logger: Logger;
  protected name: string;
  protected description: string;
  protected supportedSourceTypes: CaptureSourceType[];
  
  /**
   * 构造函数
   * @param name 处理器名称
   * @param description 处理器描述
   * @param supportedSourceTypes 支持的源类型
   */
  constructor(name: string, description: string, supportedSourceTypes: CaptureSourceType[]) {
    this.name = name;
    this.description = description;
    this.supportedSourceTypes = supportedSourceTypes;
    this.logger = new Logger(`CaptureProcessor:${name}`);
  }
  
  /**
   * 获取处理器名称
   */
  getName(): string {
    return this.name;
  }
  
  /**
   * 获取处理器描述
   */
  getDescription(): string {
    return this.description;
  }
  
  /**
   * 获取支持的源类型
   */
  getSupportedSourceTypes(): CaptureSourceType[] {
    return this.supportedSourceTypes;
  }
  
  /**
   * 检查是否支持指定的源类型
   * @param sourceType 源类型
   */
  supportsSourceType(sourceType: CaptureSourceType): boolean {
    return this.supportedSourceTypes.includes(sourceType);
  }
  
  /**
   * 处理捕获项
   * @param item 捕获项
   */
  async processCaptureItem(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    this.logger.info(`Processing capture item: ${item.id}`);
    
    // 检查是否支持该源类型
    if (!this.supportsSourceType(item.sourceType)) {
      this.logger.warn(`Unsupported source type: ${item.sourceType}`);
      return {
        success: false,
        message: `Unsupported source type: ${item.sourceType}`,
      };
    }
    
    try {
      // 根据源类型调用相应的处理方法
      switch (item.sourceType) {
        case CaptureSourceType.WEB:
          return await this.processWebContent(item);
        case CaptureSourceType.FILE:
          return await this.processFileContent(item);
        case CaptureSourceType.TEXT:
          return await this.processTextContent(item);
        case CaptureSourceType.IMAGE:
          return await this.processImageContent(item);
        case CaptureSourceType.AUDIO:
          return await this.processAudioContent(item);
        case CaptureSourceType.VIDEO:
          return await this.processVideoContent(item);
        case CaptureSourceType.EMAIL:
          return await this.processEmailContent(item);
        case CaptureSourceType.RSS:
          return await this.processRssContent(item);
        case CaptureSourceType.SOCIAL:
          return await this.processSocialContent(item);
        case CaptureSourceType.API:
          return await this.processApiContent(item);
        case CaptureSourceType.CUSTOM:
          return await this.processCustomContent(item);
        default:
          return {
            success: false,
            message: `Unknown source type: ${item.sourceType}`,
          };
      }
    } catch (error) {
      this.logger.error(`Error processing capture item: ${item.id}`, { error: error instanceof Error ? error : String(error) });
      return {
        success: false,
        message: `Processing error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
  
  /**
   * 处理网页内容
   * @param item 捕获项
   */
  protected async processWebContent(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    // 子类应重写此方法以提供实际实现
    return this.getUnsupportedResult('Web content');
  }
  
  /**
   * 处理文件内容
   * @param item 捕获项
   */
  protected async processFileContent(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    // 子类应重写此方法以提供实际实现
    return this.getUnsupportedResult('File content');
  }
  
  /**
   * 处理文本内容
   * @param item 捕获项
   */
  protected async processTextContent(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    // 子类应重写此方法以提供实际实现
    return this.getUnsupportedResult('Text content');
  }
  
  /**
   * 处理图像内容
   * @param item 捕获项
   */
  protected async processImageContent(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    // 子类应重写此方法以提供实际实现
    return this.getUnsupportedResult('Image content');
  }
  
  /**
   * 处理音频内容
   * @param item 捕获项
   */
  protected async processAudioContent(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    // 子类应重写此方法以提供实际实现
    return this.getUnsupportedResult('Audio content');
  }
  
  /**
   * 处理视频内容
   * @param item 捕获项
   */
  protected async processVideoContent(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    // 子类应重写此方法以提供实际实现
    return this.getUnsupportedResult('Video content');
  }
  
  /**
   * 处理电子邮件内容
   * @param item 捕获项
   */
  protected async processEmailContent(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    // 子类应重写此方法以提供实际实现
    return this.getUnsupportedResult('Email content');
  }
  
  /**
   * 处理RSS内容
   * @param item 捕获项
   */
  protected async processRssContent(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    // 子类应重写此方法以提供实际实现
    return this.getUnsupportedResult('RSS content');
  }
  
  /**
   * 处理社交媒体内容
   * @param item 捕获项
   */
  protected async processSocialContent(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    // 子类应重写此方法以提供实际实现
    return this.getUnsupportedResult('Social media content');
  }
  
  /**
   * 处理API内容
   * @param item 捕获项
   */
  protected async processApiContent(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    // 子类应重写此方法以提供实际实现
    return this.getUnsupportedResult('API content');
  }
  
  /**
   * 处理自定义内容
   * @param item 捕获项
   */
  protected async processCustomContent(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    // 子类应重写此方法以提供实际实现
    return this.getUnsupportedResult('Custom content');
  }
  
  /**
   * 获取不支持的结果
   * @param contentType 内容类型
   */
  protected getUnsupportedResult(contentType: string): CaptureItemProcessingResult {
    return {
      success: false,
      message: `Processing ${contentType} is not supported by ${this.name}`,
    };
  }
  
  /**
   * 提取文本内容
   * @param item 捕获项
   */
  protected extractTextContent(item: CaptureItem): string {
    // 尝试从不同字段提取文本内容
    if (item.content.text) {
      return item.content.text;
    }
    
    if (item.content.markdown) {
      // 简单地从Markdown中移除标记
      return item.content.markdown
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 替换链接
        .replace(/[*_~`]/g, '') // 移除强调标记
        .replace(/^#+\s+/gm, '') // 移除标题标记
        .replace(/^[\-*+]\s+/gm, '') // 移除列表标记
        .replace(/^>\s+/gm, '') // 移除引用标记
        .replace(/\n{2,}/g, '\n'); // 压缩多个换行
    }
    
    if (item.content.html) {
      // 简单地从HTML中移除标记（实际应用中应使用专门的HTML解析器）
      return item.content.html
        .replace(/<[^>]+>/g, '') // 移除HTML标签
        .replace(/&[a-z]+;/g, ' '); // 替换HTML实体
    }
    
    // 如果没有文本内容，返回空字符串
    return '';
  }
}