/**
 * File Processor - 文件处理器
 * 
 * 处理文件类型的捕获项
 */

import { Logger } from '../../../utils/logger';
import { globalAIRoutingService } from '../../ai-services';
import { globalPromptManager } from '../../ai-services/prompt-manager';
import { ContentType, MessageRole } from '../../ai-services/types';
import { globalTextProcessor } from './text-processor';
import {
  CaptureItem,
  CaptureItemProcessingResult,
  CaptureSourceType,
  ICaptureProcessor,
} from '../types';

/**
 * 文件处理器实现
 */
export class FileProcessor implements ICaptureProcessor {
  private logger: Logger;
  
  // 支持的文本文件类型
  private readonly textFileTypes = [
    'text/plain',
    'text/markdown',
    'text/html',
    'text/css',
    'text/javascript',
    'text/csv',
    'text/xml',
    'application/json',
    'application/xml',
    'application/javascript',
    'application/typescript',
  ];
  
  // 支持的文档文件类型
  private readonly documentFileTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  ];
  
  // 支持的图片文件类型
  private readonly imageFileTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    'image/bmp',
    'image/tiff',
  ];
  
  /**
   * 构造函数
   */
  constructor() {
    this.logger = new Logger('FileProcessor');
  }
  
  /**
   * 处理捕获项
   */
  async processCaptureItem(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    this.logger.debug('Processing file capture item', { id: item.id });
    
    try {
      // 确保有文件内容
      if (!item.content.file) {
        throw new Error('No file content found in capture item');
      }
      
      const { mimeType, fileName, fileSize, fileContent } = item.content.file;
      
      // 处理结果
      const result: CaptureItemProcessingResult = {
        success: true,
        extractedMetadata: {
          fileName,
          fileSize,
          mimeType,
        },
      };
      
      // 根据文件类型进行处理
      if (this.isTextFile(mimeType)) {
        // 处理文本文件
        await this.processTextFile(item, result);
      } else if (this.isDocumentFile(mimeType)) {
        // 处理文档文件
        await this.processDocumentFile(item, result);
      } else if (this.isImageFile(mimeType)) {
        // 处理图片文件
        await this.processImageFile(item, result);
      } else {
        // 处理其他类型文件
        await this.processGenericFile(item, result);
      }
      
      return result;
    } catch (error) {
      this.logger.error('Failed to process file capture item', { id: item.id, error: error instanceof Error ? error : String(error) });
      
      return {
        success: false,
        message: `Failed to process file: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
  
  /**
   * 处理文本文件
   */
  private async processTextFile(item: CaptureItem, result: CaptureItemProcessingResult): Promise<void> {
    const { fileContent, mimeType, fileName } = item.content.file!;
    
    // 确保文件内容是字符串
    if (typeof fileContent !== 'string') {
      throw new Error('File content is not a string');
    }
    
    // 提取文本
    result.extractedText = fileContent;
    
    // 使用文本处理器处理提取的文本
    // 创建一个临时的文本捕获项
    const textItem: CaptureItem = {
      ...item,
      sourceType: CaptureSourceType.TEXT,
      content: {
        ...item.content,
        text: fileContent,
      },
    };
    
    // 使用文本处理器处理
    const textProcessingResult = await globalTextProcessor.processCaptureItem(textItem);
    
    // 合并处理结果
    result.summary = textProcessingResult.summary;
    result.keyInsights = textProcessingResult.keyInsights;
    result.entities = textProcessingResult.entities;
    result.sentiment = textProcessingResult.sentiment;
    result.topics = textProcessingResult.topics;
    result.readingTime = textProcessingResult.readingTime;
    result.complexity = textProcessingResult.complexity;
    result.suggestedTags = textProcessingResult.suggestedTags;
    
    // 根据文件类型添加特定的处理
    if (mimeType === 'text/markdown') {
      // 提取Markdown文件的结构
      result.extractedMetadata = {
        ...result.extractedMetadata,
        structure: await this.analyzeMarkdownStructure(fileContent),
      };
    } else if (mimeType === 'application/json') {
      // 分析JSON结构
      try {
        const jsonData = JSON.parse(fileContent);
        result.extractedMetadata = {
          ...result.extractedMetadata,
          jsonStructure: this.analyzeJsonStructure(jsonData),
        };
      } catch (error) {
        this.logger.error('Failed to parse JSON file', { error: error instanceof Error ? error : String(error) });
      }
    }
  }
  
  /**
   * 处理文档文件
   */
  private async processDocumentFile(item: CaptureItem, result: CaptureItemProcessingResult): Promise<void> {
    const { mimeType, fileName } = item.content.file!;
    
    // 在实际实现中，这里需要使用文档解析库（如pdf.js、mammoth.js等）
    // 由于这些库的集成超出了当前实现范围，这里只做简化处理
    
    // 如果已经有提取的文本，则使用它
    if (item.content.text) {
      result.extractedText = item.content.text;
      
      // 使用文本处理器处理提取的文本
      const textItem: CaptureItem = {
        ...item,
        sourceType: CaptureSourceType.TEXT,
        content: {
          ...item.content,
          text: item.content.text,
        },
      };
      
      // 使用文本处理器处理
      const textProcessingResult = await globalTextProcessor.processCaptureItem(textItem);
      
      // 合并处理结果
      result.summary = textProcessingResult.summary;
      result.keyInsights = textProcessingResult.keyInsights;
      result.entities = textProcessingResult.entities;
      result.sentiment = textProcessingResult.sentiment;
      result.topics = textProcessingResult.topics;
      result.readingTime = textProcessingResult.readingTime;
      result.complexity = textProcessingResult.complexity;
      result.suggestedTags = textProcessingResult.suggestedTags;
    } else {
      // 如果没有提取的文本，则添加一个提示信息
      result.message = `需要外部文档解析器来处理 ${mimeType} 类型的文件`;
    }
    
    // 添加文档特定的元数据
    result.extractedMetadata = {
      ...result.extractedMetadata,
      documentType: this.getDocumentTypeFromMimeType(mimeType),
    };
  }
  
  /**
   * 处理图片文件
   */
  private async processImageFile(item: CaptureItem, result: CaptureItemProcessingResult): Promise<void> {
    const { mimeType, fileName } = item.content.file!;
    
    // 在实际实现中，这里需要使用图像处理库和OCR库
    // 由于这些库的集成超出了当前实现范围，这里只做简化处理
    
    // 如果已经有提取的文本（例如通过OCR），则使用它
    if (item.content.text) {
      result.extractedText = item.content.text;
      
      // 使用文本处理器处理提取的文本
      const textItem: CaptureItem = {
        ...item,
        sourceType: CaptureSourceType.TEXT,
        content: {
          ...item.content,
          text: item.content.text,
        },
      };
      
      // 使用文本处理器处理
      const textProcessingResult = await globalTextProcessor.processCaptureItem(textItem);
      
      // 合并处理结果
      result.summary = textProcessingResult.summary;
      result.keyInsights = textProcessingResult.keyInsights;
      result.entities = textProcessingResult.entities;
      result.topics = textProcessingResult.topics;
      result.suggestedTags = textProcessingResult.suggestedTags;
    } else {
      // 如果没有提取的文本，则添加一个提示信息
      result.message = `需要OCR服务来处理 ${mimeType} 类型的图片文件`;
      
      // 尝试使用AI服务分析图片（假设有图片URL）
      if (item.metadata.url) {
        try {
          result.summary = await this.analyzeImageWithAI(item.metadata.url);
        } catch (error) {
          this.logger.error('Failed to analyze image with AI', { error: error instanceof Error ? error : String(error) });
        }
      }
    }
    
    // 添加图片特定的元数据
    result.extractedMetadata = {
      ...result.extractedMetadata,
      imageType: this.getImageTypeFromMimeType(mimeType),
    };
  }
  
  /**
   * 处理通用文件
   */
  private async processGenericFile(item: CaptureItem, result: CaptureItemProcessingResult): Promise<void> {
    const { mimeType, fileName } = item.content.file!;
    
    // 对于不支持的文件类型，只提供基本信息
    result.message = `不支持处理 ${mimeType} 类型的文件内容`;
    
    // 尝试从文件名和元数据中提取有用信息
    result.summary = `文件: ${fileName}\n类型: ${mimeType}\n大小: ${this.formatFileSize(item.content.file!.fileSize)}`;
    
    // 如果有标题和描述，则添加到摘要中
    if (item.metadata.title) {
      result.summary += `\n标题: ${item.metadata.title}`;
    }
    
    if (item.metadata.description) {
      result.summary += `\n描述: ${item.metadata.description}`;
    }
    
    // 尝试根据文件名和MIME类型生成标签
    result.suggestedTags = this.generateTagsFromFileInfo(fileName, mimeType);
  }
  
  /**
   * 分析Markdown结构
   */
  private async analyzeMarkdownStructure(markdown: string): Promise<{ structure?: string; headings?: string[]; codeBlocks?: string[]; links?: string[]; }> {
    try {
      // 使用AI服务分析Markdown结构
      const result = await globalAIRoutingService.chat(
        [
          { role: MessageRole.SYSTEM, content: { type: ContentType.TEXT, text: '你是一个专业的Markdown分析助手，擅长分析Markdown文档的结构和内容组织。请分析提供的Markdown文本，识别标题层次结构、列表、代码块、引用等元素。以JSON格式返回分析结果。' } },
          { role: MessageRole.USER, content: { type: ContentType.TEXT, text: `请分析以下Markdown文本的结构：\n\n${markdown.length > 8000 ? markdown.substring(0, 8000) + '...' : markdown}` } },
        ],
        { temperature: 0.2 }
      );
      
      // 尝试解析JSON响应
      try {
        const messageContent = result.message.content;
        const contentText = Array.isArray(messageContent) 
          ? messageContent[0]?.text || '{}'
          : messageContent?.text || '{}';

        return JSON.parse(contentText);
      } catch (parseError) {
        this.logger.error('Failed to parse Markdown structure response', { error: parseError instanceof Error ? parseError : String(parseError) });
        return { structure: '', headings: [], codeBlocks: [], links: [] };
      }
    } catch (error) {
      this.logger.error('Failed to analyze Markdown structure', { error: error instanceof Error ? error : String(error) });
      return { structure: '', headings: [], codeBlocks: [], links: [] };
    }
  }
  
  /**
   * 分析JSON结构
   */
  private analyzeJsonStructure(json: Record<string, unknown>): Record<string, unknown> {
    try {
      // 简单的JSON结构分析
      const structure: {
        type: string;
        length?: number;
        sampleItem?: unknown;
        properties?: Record<string, unknown>;
      } = {
        type: Array.isArray(json) ? 'array' : typeof json,
      };
      
      if (Array.isArray(json)) {
        structure.length = json.length;
        
        if (json.length > 0) {
          // 分析数组中的第一个元素
          structure.sampleItem = this.getJsonTypeInfo(json[0]);
        }
      } else if (typeof json === 'object' && json !== null) {
        // 分析对象的属性
        structure.properties = {};
        
        for (const key in json) {
          if (Object.prototype.hasOwnProperty.call(json, key)) {
            structure.properties[key] = this.getJsonTypeInfo(json[key]);
          }
        }
      }
      
      return structure;
    } catch (error) {
      this.logger.error('Failed to analyze JSON structure', { error: error instanceof Error ? error : String(error) });
      return {};
    }
  }
  
  /**
   * 获取JSON值的类型信息
   */
  private getJsonTypeInfo(value: unknown): { type: string; length?: number; keys?: string[]; sampleType?: string; propertyCount?: number; } {
    if (value === null) {
      return { type: 'null' };
    }
    
    const type = typeof value;
    
    if (type === 'object') {
      if (Array.isArray(value)) {
        return {
          type: 'array',
          length: value.length,
          sampleType: value.length > 0 ? typeof value[0] : 'unknown',
        };
      }
      
      const objValue = value as Record<string, unknown>;
      return {
        type: 'object',
        propertyCount: Object.keys(objValue).length,
      };
    }
    
    return { type };
  }
  
  /**
   * 使用AI分析图片
   */
  private async analyzeImageWithAI(imageUrl: string): Promise<string> {
    try {
      // 使用AI服务分析图片
      // 注意：这里假设AI服务支持通过URL分析图片
      // 在实际实现中，需要使用支持图片分析的AI服务
      
      const result = await globalAIRoutingService.chat(
        [
          { role: MessageRole.SYSTEM, content: { type: ContentType.TEXT, text: '你是一个专业的图片分析助手，擅长描述图片内容。请根据提供的图片URL，生成一个简短但全面的描述。' } },
          { role: MessageRole.USER, content: { type: ContentType.TEXT, text: `请分析并描述这张图片：${imageUrl}` } },
        ],
        { temperature: 0.5 }
      );
      
      const messageContent = result.message.content;
      const contentText = Array.isArray(messageContent) 
        ? messageContent[0]?.text || '无法分析图片'
        : messageContent?.text || '无法分析图片';

      return contentText;
    } catch (error) {
      this.logger.error('Failed to analyze image with AI', { error: error instanceof Error ? error : String(error) });
      return '无法分析图片';
    }
  }
  
  /**
   * 从文件信息生成标签
   */
  private generateTagsFromFileInfo(fileName: string, mimeType: string): string[] {
    const tags: string[] = [];
    
    // 从MIME类型生成标签
    const mainType = mimeType.split('/')[0];
    tags.push(mainType);
    
    const subType = mimeType.split('/')[1];
    if (subType && subType !== mainType) {
      tags.push(subType);
    }
    
    // 从文件扩展名生成标签
    const extension = fileName.split('.').pop();
    if (extension && !tags.includes(extension)) {
      tags.push(extension);
    }
    
    // 根据文件类型添加特定标签
    if (this.isTextFile(mimeType)) {
      tags.push('文本');
    } else if (this.isDocumentFile(mimeType)) {
      tags.push('文档');
    } else if (this.isImageFile(mimeType)) {
      tags.push('图片');
    }
    
    return tags;
  }
  
  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  }
  
  /**
   * 从MIME类型获取文档类型
   */
  private getDocumentTypeFromMimeType(mimeType: string): string {
    switch (mimeType) {
      case 'application/pdf':
        return 'PDF';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'Word';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'Excel';
      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return 'PowerPoint';
      default:
        return '未知文档类型';
    }
  }
  
  /**
   * 从MIME类型获取图片类型
   */
  private getImageTypeFromMimeType(mimeType: string): string {
    switch (mimeType) {
      case 'image/jpeg':
        return 'JPEG';
      case 'image/png':
        return 'PNG';
      case 'image/gif':
        return 'GIF';
      case 'image/svg+xml':
        return 'SVG';
      case 'image/webp':
        return 'WebP';
      case 'image/bmp':
        return 'BMP';
      case 'image/tiff':
        return 'TIFF';
      default:
        return '未知图片类型';
    }
  }
  
  /**
   * 判断是否为文本文件
   */
  private isTextFile(mimeType: string): boolean {
    return this.textFileTypes.includes(mimeType);
  }
  
  /**
   * 判断是否为文档文件
   */
  private isDocumentFile(mimeType: string): boolean {
    return this.documentFileTypes.includes(mimeType);
  }
  
  /**
   * 判断是否为图片文件
   */
  private isImageFile(mimeType: string): boolean {
    return this.imageFileTypes.includes(mimeType);
  }
  
  /**
   * 获取支持的源类型
   */
  getSupportedSourceTypes(): CaptureSourceType[] {
    return [CaptureSourceType.FILE];
  }
  
  /**
   * 获取处理器名称
   */
  getName(): string {
    return 'file-processor';
  }
  
  /**
   * 获取处理器描述
   */
  getDescription(): string {
    return '处理文件类型的捕获项，支持文本、文档、图片等多种文件类型';
  }
}

// 创建全局文件处理器实例
export const globalFileProcessor = new FileProcessor();