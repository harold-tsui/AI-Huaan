/**
 * Text Processor - 文本处理器
 * 
 * 处理文本类型的捕获项
 */

import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../utils/logger';
import { globalAIRoutingService } from '../../ai-services';
import { globalPromptManager } from '../../ai-services/prompt-manager';
import { ContentType, MessageRole } from '../../ai-services/types';
import {
  CaptureItem,
  CaptureItemProcessingResult,
  CaptureSourceType,
  ICaptureProcessor,
} from '../types';

/**
 * 文本处理器实现
 */
export class TextProcessor implements ICaptureProcessor {
  private logger: Logger;
  
  /**
   * 构造函数
   */
  constructor() {
    this.logger = new Logger('TextProcessor');
  }
  
  /**
   * 处理捕获项
   */
  async processCaptureItem(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    this.logger.debug('Processing text capture item', { id: item.id });
    
    try {
      // 确保有文本内容
      const text = item.content.text;
      if (!text) {
        throw new Error('No text content found in capture item');
      }
      
      // 处理结果
      const result: CaptureItemProcessingResult = {
        success: true,
        extractedText: text,
      };
      
      // 生成摘要
      result.summary = await this.generateSummary(text);
      
      // 提取关键见解
      result.keyInsights = await this.extractKeyInsights(text);
      
      // 提取实体
      result.entities = await this.extractEntities(text);
      
      // 分析情感
      result.sentiment = await this.analyzeSentiment(text);
      
      // 提取主题
      result.topics = await this.extractTopics(text);
      
      // 计算阅读时间
      result.readingTime = this.calculateReadingTime(text);
      
      // 计算复杂度
      result.complexity = this.calculateComplexity(text);
      
      // 建议标签
      result.suggestedTags = await this.suggestTags(text);
      
      return result;
    } catch (error) {
      this.logger.error('Failed to process text capture item', { id: item.id, error: error instanceof Error ? error : String(error) });
      
      return {
        success: false,
        message: `Failed to process text: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
  
  /**
   * 生成摘要
   */
  private async generateSummary(text: string): Promise<string> {
    try {
      // 使用提示模板
      const prompt = await globalPromptManager.renderTemplate('summary-template', {
        content: text.length > 8000 ? text.substring(0, 8000) + '...' : text,
      });
  
      if (!prompt) {
        this.logger.error('Failed to render summary template for generateSummary.');
        return '摘要生成失败 (模板渲染失败)';
      }
      
      // 使用AI服务生成摘要
      const result = await globalAIRoutingService.chat(
        [
          { role: MessageRole.SYSTEM, content: { type: ContentType.TEXT, text: '你是一个专业的文本摘要助手，擅长提取文本的核心内容并生成简洁的摘要。' } },
          { role: MessageRole.USER, content: { type: ContentType.TEXT, text: prompt } },
        ],
        { temperature: 0.3 }
      );
      
      const messageContent = result.message.content;
      const contentText = Array.isArray(messageContent) 
        ? messageContent[0]?.text || '无法生成摘要'
        : messageContent?.text || '无法生成摘要';

      return contentText;
    } catch (error) {
      this.logger.error('Failed to generate summary', { error: error instanceof Error ? error : String(error) });
      return '摘要生成失败';
    }
  }
  
  /**
   * 提取关键见解
   */
  private async extractKeyInsights(text: string): Promise<string[]> {
    try {
      // 使用AI服务提取关键见解
      const result = await globalAIRoutingService.chat(
        [
          { role: MessageRole.SYSTEM, content: { type: ContentType.TEXT, text: '你是一个专业的内容分析助手，擅长从文本中提取关键见解和重要观点。请提取5-7个关键见解，每个见解应简洁明了，不超过100字。以JSON数组格式返回结果。' } },
          { role: MessageRole.USER, content: { type: ContentType.TEXT, text: `请从以下文本中提取关键见解：\n\n${text.length > 8000 ? text.substring(0, 8000) + '...' : text}` } },
        ],
        { temperature: 0.3 }
      );
      
      // 尝试解析JSON响应
      try {
        const messageContent = result.message.content;
        const contentText = Array.isArray(messageContent) 
          ? messageContent[0]?.text || '[]'
          : messageContent?.text || '[]';

        // 查找JSON数组
        const match = contentText.match(/\[(([\s\S]*?))\]/);
        if (match) {
          return JSON.parse(`[${match[1]}]`);
        }
        return JSON.parse(contentText);
      } catch (parseError) {
        // 如果解析失败，尝试按行分割
        const messageContent = result.message.content;
        const contentText = Array.isArray(messageContent) 
          ? messageContent[0]?.text || ''
          : messageContent?.text || '';

        const lines = contentText.split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line && !line.startsWith('```') && !line.startsWith('#'));
        
        return lines.length > 0 ? lines : ['无法提取关键见解'];
      }
    } catch (error) {
      this.logger.error('Failed to extract key insights', { error: error instanceof Error ? error : String(error) });
      return ['关键见解提取失败'];
    }
  }
  
  /**
   * 提取实体
   */
  private async extractEntities(text: string): Promise<string[]> {
    try {
      // 使用AI服务提取实体
      const result = await globalAIRoutingService.chat(
        [
          { role: MessageRole.SYSTEM, content: { type: ContentType.TEXT, text: '你是一个专业的实体识别助手，擅长从文本中识别人物、组织、地点、概念等实体。请以JSON格式返回结果，包含实体名称、类型和相关性分数（0-1）。' } },
          { role: MessageRole.USER, content: { type: ContentType.TEXT, text: `请从以下文本中识别重要实体：\n\n${text.length > 8000 ? text.substring(0, 8000) + '...' : text}` } },
        ],
        { temperature: 0.2 }
      );
      
      // 尝试解析JSON响应
      try {
        const messageContent = result.message.content;
        const contentText = Array.isArray(messageContent) 
          ? messageContent[0]?.text || '[]'
          : messageContent?.text || '[]';

        // 查找JSON数组
        const match = contentText.match(/\[(([\s\S]*?))\]/);
        let entities: { name: string; type: string; relevance: number }[] = [];
        if (match) {
          entities = JSON.parse(`[${match[1]}]`);
        } else {
          entities = JSON.parse(contentText);
        }
        
        // 将实体对象数组转换为字符串数组
        return entities.map(entity => entity.name);
      } catch (parseError) {
        this.logger.error('Failed to parse entities response', { error: parseError instanceof Error ? parseError : String(parseError) });
        return [];
      }
    } catch (error) {
      this.logger.error('Failed to extract entities', { error: error instanceof Error ? error : String(error) });
      return [];
    }
  }
  
  /**
   * 分析情感
   */
  private async analyzeSentiment(text: string): Promise<string> {
    try {
      // 使用AI服务分析情感
      const result = await globalAIRoutingService.chat(
        [
          { role: MessageRole.SYSTEM, content: { type: ContentType.TEXT, text: '你是一个专业的情感分析助手，擅长分析文本的情感倾向。请分析文本的情感，并返回一个-1到1之间的分数（-1表示极度负面，0表示中性，1表示极度正面）和一个情感标签（如"积极"、"中性"、"消极"）。以JSON格式返回结果。' } },
          { role: MessageRole.USER, content: { type: ContentType.TEXT, text: `请分析以下文本的情感：\n\n${text.length > 8000 ? text.substring(0, 8000) + '...' : text}` } },
        ],
        { temperature: 0.1 }
      );
      
      // 尝试解析JSON响应
      try {
        const messageContent = result.message.content;
        const contentText = Array.isArray(messageContent) 
          ? messageContent[0]?.text || '{"score": 0, "label": "中性"}'
          : messageContent?.text || '{"score": 0, "label": "中性"}';

        const sentiment = JSON.parse(contentText);
        return sentiment.label || '中性';
      } catch (parseError) {
        this.logger.error('Failed to parse sentiment response', { error: parseError instanceof Error ? parseError : String(parseError) });
        return '中性';
      }
    } catch (error) {
      this.logger.error('Failed to analyze sentiment', { error: error instanceof Error ? error : String(error) });
      return '情感分析失败';
    }
  }
  
  /**
   * 提取主题
   */
  private async extractTopics(text: string): Promise<string[]> {
    try {
      // 使用AI服务提取主题
      const result = await globalAIRoutingService.chat(
        [
          { role: MessageRole.SYSTEM, content: { type: ContentType.TEXT, text: '你是一个专业的主题分析助手，擅长从文本中提取主要主题和话题。请提取3-5个主题，并为每个主题提供一个相关性分数（0-1）。以JSON格式返回结果。' } },
          { role: MessageRole.USER, content: { type: ContentType.TEXT, text: `请从以下文本中提取主要主题：\n\n${text.length > 8000 ? text.substring(0, 8000) + '...' : text}` } },
        ],
        { temperature: 0.2 }
      );
      
      // 尝试解析JSON响应
      try {
        const messageContent = result.message.content;
        const contentText = Array.isArray(messageContent) 
          ? messageContent[0]?.text || '[]'
          : messageContent?.text || '[]';

        // 查找JSON数组
        const match = contentText.match(/\[(([\s\S]*?))\]/);
        let topics: { name: string; score: number }[] = [];
        if (match) {
          topics = JSON.parse(`[${match[1]}]`);
        } else {
          topics = JSON.parse(contentText);
        }
        
        // 将主题对象数组转换为字符串数组
        return topics.map(topic => topic.name);
      } catch (parseError) {
        this.logger.error('Failed to parse topics response', { error: parseError instanceof Error ? parseError : String(parseError) });
        return [];
      }
    } catch (error) {
      this.logger.error('Failed to extract topics', { error: error instanceof Error ? error : String(error) });
      return [];
    }
  }
  
  /**
   * 建议标签
   */
  private async suggestTags(text: string): Promise<string[]> {
    try {
      // 使用AI服务建议标签
      const result = await globalAIRoutingService.chat(
        [
          { role: MessageRole.SYSTEM, content: { type: ContentType.TEXT, text: '你是一个专业的标签生成助手，擅长为文本内容生成相关标签。请生成5-10个相关标签，每个标签应简短（1-3个词）。以JSON数组格式返回结果。' } },
          { role: MessageRole.USER, content: { type: ContentType.TEXT, text: `请为以下文本生成标签：\n\n${text.length > 8000 ? text.substring(0, 8000) + '...' : text}` } },
        ],
        { temperature: 0.3 }
      );
      
      // 尝试解析JSON响应
      try {
        const messageContent = result.message.content;
        const contentText = Array.isArray(messageContent) 
          ? messageContent[0]?.text || '[]'
          : messageContent?.text || '[]';

        // 查找JSON数组
        const match = contentText.match(/\[([\s\S]*?)\]/);
        if (match) {
          return JSON.parse(`[${match[1]}]`);
        }
        return JSON.parse(contentText);
      } catch (parseError) {
        this.logger.error('Failed to parse tags response', { error: parseError instanceof Error ? parseError : String(parseError) });
        // 如果解析失败，尝试按行或逗号分割
        const messageContent = result.message.content;
        const contentText = Array.isArray(messageContent) 
          ? messageContent[0]?.text || ''
          : messageContent?.text || '';

        if (contentText.includes(',')) {
          return contentText.split(',').map((tag: string) => tag.trim()).filter(Boolean);
        } else {
          return contentText.split('\n').map((tag: string) => tag.trim()).filter(Boolean);
        }
      }
    } catch (error) {
      this.logger.error('Failed to suggest tags', { error: error instanceof Error ? error : String(error) });
      return [];
    }
  }
  
  /**
   * 计算阅读时间（分钟）
   */
  private calculateReadingTime(text: string): number {
    // 假设平均阅读速度为每分钟200个单词
    const wordCount = text.split(/\s+/).length;
    const readingTime = wordCount / 200;
    
    // 返回至少1分钟的阅读时间
    return Math.max(1, Math.round(readingTime));
  }
  
  /**
   * 计算文本复杂度（0-1）
   */
  private calculateComplexity(text: string): number {
    // 这是一个简化的复杂度计算，实际应用中可能需要更复杂的算法
    
    // 计算平均句子长度
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    const avgSentenceLength = sentences.length > 0
      ? sentences.reduce((sum, sentence) => sum + sentence.split(/\s+/).length, 0) / sentences.length
      : 0;
    
    // 计算平均单词长度
    const words = text.split(/\s+/).filter(Boolean);
    const avgWordLength = words.length > 0
      ? words.reduce((sum, word) => sum + word.length, 0) / words.length
      : 0;
    
    // 计算复杂单词比例（假设长度大于6的单词为复杂单词）
    const complexWords = words.filter(word => word.length > 6);
    const complexWordRatio = words.length > 0 ? complexWords.length / words.length : 0;
    
    // 综合计算复杂度（归一化到0-1范围）
    const sentenceComplexity = Math.min(1, avgSentenceLength / 25); // 假设平均句子长度25词为最复杂
    const wordComplexity = Math.min(1, avgWordLength / 8); // 假设平均单词长度8字符为最复杂
    
    // 加权平均
    const complexity = 0.4 * sentenceComplexity + 0.3 * wordComplexity + 0.3 * complexWordRatio;
    
    return Math.min(1, Math.max(0, complexity));
  }
  
  /**
   * 获取支持的源类型
   */
  getSupportedSourceTypes(): CaptureSourceType[] {
    return [CaptureSourceType.TEXT];
  }
  
  /**
   * 获取处理器名称
   */
  getName(): string {
    return 'text-processor';
  }
  
  /**
   * 获取处理器描述
   */
  getDescription(): string {
    return '处理文本类型的捕获项，提取关键信息、生成摘要、分析情感等';
  }
}

// 创建全局文本处理器实例
export const globalTextProcessor = new TextProcessor();