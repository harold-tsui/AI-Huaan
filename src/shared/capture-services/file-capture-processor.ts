/**
 * File Capture Processor - 文件捕获处理器
 * 
 * 处理从文件捕获的内容
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as mime from 'mime-types';
import { IAIService } from '../ai-services/types';
import { MessageRole, ContentType, Message } from '../ai-services/types';
import { IKnowledgeGraphService, NodeType, RelationshipType } from '../knowledge-graph-services/types';
import {
  BaseCaptureProcessor,
} from './base-capture-processor';
import {
  CaptureItem,
  CaptureItemContent,
  CaptureItemProcessingResult,
  CaptureSourceType,
} from './types';

/**
 * 文件捕获处理器
 */
export class FileCaptureProcessor extends BaseCaptureProcessor {
  private aiService?: IAIService;
  private knowledgeGraphService?: IKnowledgeGraphService;
  
  /**
   * 构造函数
   * @param aiService AI服务
   * @param knowledgeGraphService 知识图谱服务
   */
  constructor(aiService?: IAIService, knowledgeGraphService?: IKnowledgeGraphService) {
    super(
      'file-capture-processor',
      'Processes file content by extracting text, metadata, and creating knowledge graph nodes',
      [CaptureSourceType.FILE]
    );
    
    this.aiService = aiService;
    this.knowledgeGraphService = knowledgeGraphService;
  }
  
  /**
   * 处理文件内容
   * @param item 捕获项
   */
  protected async processFileContent(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    this.logger.info(`Processing file content: ${item.content.filePath || 'Unknown file'}`);
    
    try {
      // 检查文件路径
      const filePath = item.content.filePath;
      if (!filePath) {
        return {
          success: false,
          message: 'No file path provided for file content',
        };
      }
      
      // 检查文件是否存在
      try {
        await fs.access(filePath);
      } catch (error) {
        return {
          success: false,
          message: `File does not exist or is not accessible: ${filePath}`,
        };
      }
      
      // 获取文件信息
      const fileInfo = await this.getFileInfo(filePath);
      
      // 根据文件类型处理内容
      let fileContent: Partial<CaptureItemContent>;
      if (fileInfo.isText) {
        fileContent = await this.processTextFile(filePath, fileInfo.mimeType);
      } else if (fileInfo.isImage) {
        fileContent = await this.processImageFile(filePath, fileInfo.mimeType);
      } else if (fileInfo.isPdf) {
        fileContent = await this.processPdfFile(filePath);
      } else {
        fileContent = {
          filePath,
        };
      }
      
      // 更新捕获项内容
      const updatedContent: CaptureItemContent = {
        ...item.content,
        ...fileContent,
        filePath,
      };
      
      // 文件元数据，不直接添加到CaptureItemContent中
      const fileMetadata = {
        mimeType: fileInfo.mimeType,
        fileSize: fileInfo.size,
        fileName: path.basename(filePath),
      };
      
      // 如果有AI服务且有文本内容，生成摘要和标签
      if (this.aiService && updatedContent.text) {
        const enrichments = await this.enrichContentWithAI(updatedContent.text, fileMetadata.fileName);
        // 不要直接将enrichments合并到updatedContent中，因为CaptureItemContent不包含summary和tags属性
      }
      
      // 如果有知识图谱服务，创建知识图谱节点
      if (this.knowledgeGraphService) {
        await this.createKnowledgeGraphNode(item, updatedContent, fileInfo);
      }
      
      // 创建处理结果
      let summary: string | undefined;
      let suggestedTags: string[] | undefined;
      
      // 如果有AI服务且有文本内容，获取摘要和标签
      if (this.aiService && updatedContent.text) {
        const enrichments = await this.enrichContentWithAI(updatedContent.text, fileMetadata.fileName);
        summary = enrichments.summary;
        suggestedTags = enrichments.tags;
      }
      
      return {
        success: true,
        message: 'File content processed successfully',
        summary,
        suggestedTags,
        extractedText: updatedContent.text,
        extractedMetadata: fileMetadata
      };
    } catch (error) {
      this.logger.error(`Error processing file content: ${error instanceof Error ? error.message : String(error)}`, { error: error instanceof Error ? error : String(error) });
      return {
        success: false,
        message: `Error processing file content: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
  
  /**
   * 获取文件信息
   * @param filePath 文件路径
   */
  private async getFileInfo(filePath: string): Promise<{
    path: string;
    name: string;
    size: number;
    mimeType: string;
    extension: string;
    isText: boolean;
    isImage: boolean;
    isPdf: boolean;
  }> {
    // 获取文件状态
    const stats = await fs.stat(filePath);
    
    // 获取文件扩展名和MIME类型
    const extension = path.extname(filePath).toLowerCase();
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    
    // 判断文件类型
    const isText = mimeType.startsWith('text/') || 
                  ['.md', '.txt', '.json', '.csv', '.xml', '.html', '.htm', '.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.less'].includes(extension);
    
    const isImage = mimeType.startsWith('image/');
    const isPdf = mimeType === 'application/pdf';
    
    return {
      path: filePath,
      name: path.basename(filePath),
      size: stats.size,
      mimeType,
      extension,
      isText,
      isImage,
      isPdf,
    };
  }
  
  /**
   * 处理文本文件
   * @param filePath 文件路径
   * @param mimeType MIME类型
   */
  private async processTextFile(filePath: string, mimeType: string): Promise<Partial<CaptureItemContent>> {
    this.logger.info(`Processing text file: ${filePath}`);
    
    try {
      // 读取文件内容
      const content = await fs.readFile(filePath, 'utf-8');
      
      // 根据文件类型处理内容
      const extension = path.extname(filePath).toLowerCase();
      
      if (extension === '.md') {
        return {
          text: content,
          markdown: content,
        };
      } else if (extension === '.html' || extension === '.htm') {
        return {
          html: content,
          text: this.extractTextFromHtml(content),
        };
      } else if (extension === '.json') {
        try {
          const jsonData = JSON.parse(content);
          return {
            text: JSON.stringify(jsonData, null, 2),
          };
        } catch (error) {
          return { text: content };
        }
      } else {
        return { text: content };
      }
    } catch (error) {
      this.logger.error(`Error processing text file: ${filePath}`, { error: error instanceof Error ? error : String(error) });
      throw new Error(`Failed to process text file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 处理图片文件
   * @param filePath 文件路径
   * @param mimeType MIME类型
   * @returns 处理后的内容
   */
  private async processImageFile(filePath: string, mimeType: string): Promise<Partial<CaptureItemContent>> {
    this.logger.info(`Processing image file: ${filePath}`);
    
    try {
      // 获取文件信息
      const stats = await fs.stat(filePath);
      
      // 如果有图像处理服务，可以在这里添加图像处理逻辑
      // 例如：生成缩略图、提取EXIF数据等
      
      // 返回符合 CaptureItemContent 接口的对象
      return {
        filePath: filePath,
      };
    } catch (error) {
      this.logger.error(`Error processing image file: ${filePath}`, { error: error instanceof Error ? error : String(error) });
      // 返回符合 CaptureItemContent 接口的对象
      return {
        filePath,
      };
    }
  }
  
  /**
   * 处理PDF文件
   * @param filePath 文件路径
   * @returns 处理后的内容
   */
  private async processPdfFile(filePath: string): Promise<Partial<CaptureItemContent>> {
    this.logger.info(`Processing PDF file: ${filePath}`);
    
    try {
      // 获取文件信息
      const stats = await fs.stat(filePath);
      
      // 如果有PDF处理服务，可以在这里添加PDF处理逻辑
      // 例如：提取文本、生成预览等
      
      // 返回符合 CaptureItemContent 接口的对象
      return {
        filePath: filePath,
        // 不要直接添加 mimeType 和 fileSize，它们应该作为元数据
      };
    } catch (error) {
      this.logger.error(`Error processing PDF file: ${filePath}`, { error: error instanceof Error ? error : String(error) });
      // 返回符合 CaptureItemContent 接口的对象
      return {
        filePath,
      };
    }
  }
  
  /**
   * 从HTML中提取文本
   * @param html HTML内容
   */
  private extractTextFromHtml(html: string): string {
    // 实际实现中，应使用专门的HTML解析库
    // 这里使用简单的正则表达式替换
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 移除脚本
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // 移除样式
      .replace(/<[^>]+>/g, ' ')                                           // 移除HTML标签
      .replace(/\s{2,}/g, ' ')                                            // 压缩空白
      .trim();                                                            // 修剪空白
  }
  
  /**
   * 使用AI服务丰富内容
   * @param text 文本内容
   * @param fileName 文件名
   */
  private async enrichContentWithAI(text: string, fileName: string): Promise<{ summary?: string; tags?: string[]; }> {
    this.logger.info(`Enriching file content with AI: ${fileName}`);
    
    if (!this.aiService) {
      return {};
    }
    
    try {
      // 限制文本长度以避免超出AI模型的上下文窗口
      const truncatedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text;
      
      // 生成摘要
      const summaryPrompt = `Please provide a concise summary (3-5 sentences) of the following file content. File name: "${fileName}"\n\nContent: ${truncatedText}`;
      const summaryResult = await this.aiService.chat([
        { role: MessageRole.SYSTEM, content: { type: ContentType.TEXT, text: 'You are a helpful assistant that creates concise, informative summaries.' } },
        { role: MessageRole.USER, content: { type: ContentType.TEXT, text: summaryPrompt } }
      ]);
      
      // 生成标签
      const tagsPrompt = `Please extract 5-8 relevant tags or keywords from the following file content. Provide them as a comma-separated list. File name: "${fileName}"\n\nContent: ${truncatedText}`;
      const tagsResult = await this.aiService.chat([
        { role: MessageRole.SYSTEM, content: { type: ContentType.TEXT, text: 'You are a helpful assistant that extracts relevant tags and keywords.' } },
        { role: MessageRole.USER, content: { type: ContentType.TEXT, text: tagsPrompt } }
      ]);
      
      // 获取消息内容
      const summaryText = this.getMessageText(summaryResult.message);
      const tagsText = this.getMessageText(tagsResult.message);
      
      // 解析标签
      const tags = tagsText
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      return {
        summary: summaryText,
        tags,
      };
    } catch (error) {
      this.logger.error(`Error enriching file content with AI: ${fileName}`, { error: error instanceof Error ? error : String(error) });
      return {};
    }
  }
  
  /**
   * 从消息中获取文本内容
   * @param message AI服务返回的消息
   * @returns 文本内容
   */
  private getMessageText(message: Message): string {
    if (!message.content) {
      return '';
    }
    
    if (typeof message.content === 'string') {
      return message.content;
    }
    
    if (Array.isArray(message.content)) {
      // 如果是数组，找到第一个文本内容
      const textContent = message.content.find(c => c.type === ContentType.TEXT);
      return textContent?.text || '';
    }
    
    // 如果是单个MessageContent对象
    if (message.content.type === ContentType.TEXT) {
      return message.content.text || '';
    }
    
    return '';
  }
  
  /**
   * 创建知识图谱节点
   * @param item 捕获项
   * @param content 内容
   * @param fileInfo 文件信息
   */
  private async createKnowledgeGraphNode(item: CaptureItem, content: CaptureItemContent, fileInfo: { path: string; name: string; extension: string; size?: number; mimeType?: string; isImage?: boolean; isPdf?: boolean }): Promise<void> {
    if (!this.knowledgeGraphService) {
      return;
    }
    
    this.logger.info(`Creating knowledge graph node for file: ${path.basename(content.filePath || '') || 'Unknown file'}`);
    
    try {
      // 确定节点类型
      let nodeType = NodeType.RESOURCE;
      if (fileInfo.isImage) {
        nodeType = NodeType.RESOURCE;
      } else if (fileInfo.isPdf) {
        nodeType = NodeType.RESOURCE;
      }
      
      // 创建文件节点
      const fileNode = await this.knowledgeGraphService.createNode({
        type: nodeType,
        label: path.basename(content.filePath || ''),
        properties: {
          title: path.basename(content.filePath || ''),
          filePath: content.filePath || '',
          mimeType: fileInfo.mimeType || '',
          fileSize: fileInfo.size || 0,
          captureDate: item.created,
          captureId: item.id,
        },
      });
      
      // 如果有标签，为每个标签创建节点并建立关系
      const tags = item.metadata.tags || [];
      if (tags.length > 0) {
        for (const tag of tags) {
          // 查找或创建标签节点
          const tagNodes = await this.knowledgeGraphService.queryNodes({
            types: [NodeType.TAG],
            properties: { name: tag },
          });
          
          let tagNode;
          if (tagNodes.length > 0) {
            tagNode = tagNodes[0];
          } else {
            tagNode = await this.knowledgeGraphService.createNode({
              type: NodeType.TAG,
              label: tag,
              properties: { name: tag },
            });
          }
          
          // 创建文件到标签的关系
          await this.knowledgeGraphService.createRelationship({
            sourceNodeId: fileNode.id,
            targetNodeId: tagNode.id,
            type: RelationshipType.HAS_TAG,
            label: 'Has Tag',
            properties: {},
          });
        }
      }
      
      this.logger.info(`Knowledge graph node created successfully: ${fileNode.id}`);
    } catch (error) {
      this.logger.error(`Error creating knowledge graph node: ${error instanceof Error ? error.message : String(error)}`, { error: error instanceof Error ? error : String(error) });
    }
  }
}