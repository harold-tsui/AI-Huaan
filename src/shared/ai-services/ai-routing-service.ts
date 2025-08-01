/**
 * AI Routing Service - AI服务路由
 * 
 * 管理多个AI服务提供商，根据需求选择最佳服务
 */

import { ConfigManager } from '../../utils/config';
import { Logger } from '../../utils/logger';
import { globalAnthropicService } from './anthropic-service';
import { globalOpenAIService } from './openai-service';
import {
  AIModel,
  AIModelType,
  AIProvider,
  ChatOptions,
  ChatResult,
  ChatStreamEvent,
  ContentType,
  EmbeddingOptions,
  EmbeddingResult,
  IAIRoutingService,
  IAIService,
  Message,
} from './types';

/**
 * AI服务路由实现
 * 同时实现IAIService和IAIRoutingService接口
 */
export class AIRoutingService implements IAIRoutingService, IAIService {
  private logger: Logger;
  private services: Map<AIProvider, IAIService>;
  private config: Record<string, unknown>;
  
  /**
   * 构造函数
   */
  constructor() {
    this.logger = new Logger('AIRoutingService');
    this.services = new Map();
    this.config = ConfigManager.getInstance().getConfig() as unknown as Record<string, unknown>;
    
    // 注册服务
    this.registerServices();
  }
  
  /**
   * 注册可用的AI服务
   */
  private registerServices(): void {
    try {
      // 获取AI服务配置
      const aiServices = this.config.aiServices as { 
        openai?: { apiKey?: string },
        anthropic?: { apiKey?: string }
      } | undefined;
      
      // 注册OpenAI服务
      if (aiServices?.openai?.apiKey || process.env.OPENAI_API_KEY) {
        this.services.set(AIProvider.OPENAI, globalOpenAIService);
        this.logger.info('Registered OpenAI service');
      }
      
      // 注册Anthropic服务
      if (aiServices?.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY) {
        this.services.set(AIProvider.ANTHROPIC, globalAnthropicService);
        this.logger.info('Registered Anthropic service');
      }
      
      // 注册本地模型服务（如果有）
      // TODO: 实现本地模型服务
      
      this.logger.info(`Registered ${this.services.size} AI services`);
    } catch (error) {
      this.logger.error('Failed to register AI services:', { error: error instanceof Error ? error : String(error) });
    }
  }
  
  /**
   * 根据请求选择最佳提供商
   */
  async selectProvider(modelType: AIModelType, options?: {
    preferredProvider?: AIProvider;
    costSensitive?: boolean;
    performanceSensitive?: boolean;
    qualitySensitive?: boolean;
  }): Promise<{
    provider: AIProvider;
    model: string;
  }> {
    // 如果指定了首选提供商且该提供商可用，则使用该提供商
    if (options?.preferredProvider && this.services.has(options.preferredProvider)) {
      const provider = options.preferredProvider;
      const model = await this.getDefaultModelForProvider(provider, modelType);
      if (model === null) {
        throw new Error(`无法为提供商 ${provider} 和模型类型 ${modelType} 找到可用模型`);
      }
      return { provider, model };
    }
    
    // 根据模型类型和选项选择最佳提供商
    if (modelType === AIModelType.EMBEDDING) {
      // 对于嵌入，首选OpenAI
      if (this.services.has(AIProvider.OPENAI)) {
        return {
          provider: AIProvider.OPENAI,
          model: 'text-embedding-ada-002',
        };
      }
    } else if (modelType === AIModelType.CHAT) {
      // 对于聊天，根据需求选择
      if (options?.qualitySensitive && this.services.has(AIProvider.ANTHROPIC)) {
        // 质量敏感，首选Anthropic的高质量模型
        return {
          provider: AIProvider.ANTHROPIC,
          model: 'claude-3-opus-20240229',
        };
      } else if (options?.costSensitive && this.services.has(AIProvider.OPENAI)) {
        // 成本敏感，首选OpenAI的经济模型
        return {
          provider: AIProvider.OPENAI,
          model: 'gpt-3.5-turbo',
        };
      } else if (options?.performanceSensitive) {
        // 性能敏感，首选速度快的模型
        if (this.services.has(AIProvider.ANTHROPIC)) {
          return {
            provider: AIProvider.ANTHROPIC,
            model: 'claude-3-haiku-20240307',
          };
        } else if (this.services.has(AIProvider.OPENAI)) {
          return {
            provider: AIProvider.OPENAI,
            model: 'gpt-3.5-turbo',
          };
        }
      }
      
      // 默认选择
      if (this.services.has(AIProvider.OPENAI)) {
        return {
          provider: AIProvider.OPENAI,
          model: 'gpt-4-turbo',
        };
      } else if (this.services.has(AIProvider.ANTHROPIC)) {
        return {
          provider: AIProvider.ANTHROPIC,
          model: 'claude-3-sonnet-20240229',
        };
      }
    }
    
    // 如果没有找到合适的提供商，使用第一个可用的提供商
    for (const [provider, service] of this.services.entries()) {
      const model = await this.getDefaultModelForProvider(provider, modelType);
      if (model) {
        return { provider, model };
      }
    }
    
    // 如果没有可用的提供商，抛出错误
    throw new Error(`No available AI provider for model type: ${modelType}`);
  }
  
  /**
   * 获取提供商的默认模型
   */
  private async getDefaultModelForProvider(provider: AIProvider, modelType: AIModelType): Promise<string | null> {
    const service = this.services.get(provider);
    if (!service) {
      throw new Error(`Provider not available: ${provider}`);
    }
    
    try {
      const models = await service.getAvailableModels();
      const filteredModels = models.filter(model => model.type === modelType);
      
      if (filteredModels.length === 0) {
        throw new Error(`No ${modelType} models available for provider: ${provider}`);
      }
      
      // 根据提供商和模型类型选择默认模型
      if (provider === AIProvider.OPENAI) {
        if (modelType === AIModelType.CHAT) {
          const gpt4 = filteredModels.find(model => model.id.includes('gpt-4'));
          if (gpt4) return gpt4.id;
          
          const gpt35 = filteredModels.find(model => model.id.includes('gpt-3.5'));
          if (gpt35) return gpt35.id;
        } else if (modelType === AIModelType.EMBEDDING) {
          const ada = filteredModels.find(model => model.id.includes('ada'));
          if (ada) return ada.id;
        }
      } else if (provider === AIProvider.ANTHROPIC) {
        if (modelType === AIModelType.CHAT) {
          const claude3 = filteredModels.find(model => model.id.includes('claude-3'));
          if (claude3) return claude3.id;
          
          const claude2 = filteredModels.find(model => model.id.includes('claude-2'));
          if (claude2) return claude2.id;
        }
      }
      
      // 如果没有找到特定模型，返回第一个可用的模型
      return filteredModels.length > 0 ? filteredModels[0].id : null;
    } catch (error) {
      this.logger.error(`Failed to get default model for provider ${provider}:`,{ error: error instanceof Error ? error : String(error) });
      
      // 返回硬编码的默认模型
      if (provider === AIProvider.OPENAI) {
        if (modelType === AIModelType.CHAT) {
          return 'gpt-3.5-turbo';
        } else if (modelType === AIModelType.EMBEDDING) {
          return 'text-embedding-ada-002';
        }
      } else if (provider === AIProvider.ANTHROPIC) {
        if (modelType === AIModelType.CHAT) {
          return 'claude-3-sonnet-20240229';
        }
      }
      
      return null;
    }
  }
  
  /**
   * 获取服务实例
   */
  getService(provider: AIProvider): IAIService {
    const service = this.services.get(provider);
    if (!service) {
      throw new Error(`Provider not available: ${provider}`);
    }
    return service;
  }
  
  /**
   * 创建嵌入（自动路由）
   */
  async createEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult> {
    const { provider, model } = await this.selectProvider(AIModelType.EMBEDDING, {
      preferredProvider: options?.provider,
    });
    
    const service = this.getService(provider);
    return service.createEmbedding(text, {
      ...options,
      model: options?.model || model,
    });
  }
  
  /**
   * 聊天完成（自动路由）
   */
  async chat(messages: Message[], options?: ChatOptions): Promise<ChatResult> {
    const { provider, model } = await this.selectProvider(AIModelType.CHAT, {
      preferredProvider: options?.provider,
      costSensitive: options?.temperature !== undefined && options.temperature < 0.3,
      qualitySensitive: options?.temperature !== undefined && options.temperature > 0.7,
    });
    
    const service = this.getService(provider);
    return service.chat(messages, {
      ...options,
      model: options?.model || model,
    });
  }
  
  /**
   * 流式聊天完成（自动路由）
   */
  async *chatStream(messages: Message[], options?: ChatOptions): AsyncGenerator<ChatStreamEvent, void, unknown> {
    const { provider, model } = await this.selectProvider(AIModelType.CHAT, {
      preferredProvider: options?.provider,
      costSensitive: options?.temperature !== undefined && options.temperature < 0.3,
      qualitySensitive: options?.temperature !== undefined && options.temperature > 0.7,
    });
    
    const service = this.getService(provider);
    yield* service.chatStream(messages, {
      ...options,
      model: options?.model || model,
    });
  }

  /**
   * 获取可用模型
   * 实现IAIService接口
   */
  async getAvailableModels(): Promise<AIModel[]> {
    // 收集所有服务提供商的模型
    const allModels: AIModel[] = [];
    
    for (const service of this.services.values()) {
      try {
        const models = await service.getAvailableModels();
        allModels.push(...models);
      } catch (error) {
        this.logger.error('Failed to get models from service:',{ error: error instanceof Error ? error : String(error) });
      }
    }
    
    return allModels;
  }
  
  /**
   * 批量创建嵌入
   * 实现IAIService接口
   */
  async createEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResult[]> {
    const { provider, model } = await this.selectProvider(AIModelType.EMBEDDING, {
      preferredProvider: options?.provider,
    });
    
    const service = this.getService(provider);
    return service.createEmbeddings(texts, {
      ...options,
      model: options?.model || model,
    });
  }
  
  /**
   * 计算令牌数
   * 实现IAIService接口
   */
  async countTokens(text: string, model?: string): Promise<number> {
    // 使用OpenAI服务计算令牌数（如果可用）
    if (this.services.has(AIProvider.OPENAI)) {
      const service = this.getService(AIProvider.OPENAI);
      return service.countTokens(text, model);
    }
    
    // 如果OpenAI不可用，使用第一个可用的服务
    for (const service of this.services.values()) {
      return service.countTokens(text, model);
    }
    
    // 如果没有可用的服务，使用简单估算
    // 英文约为每4个字符1个令牌，中文约为每1.5个字符1个令牌
    const englishTokens = text.replace(/[^\x00-\x7F]/g, '').length / 4;
    const chineseTokens = text.replace(/[\x00-\x7F]/g, '').length / 1.5;
    return Math.ceil(englishTokens + chineseTokens);
  }
  
  /**
   * 计算消息令牌数
   * 实现IAIService接口
   */
  async countMessageTokens(messages: Message[], model?: string): Promise<number> {
    // 使用OpenAI服务计算令牌数（如果可用）
    if (this.services.has(AIProvider.OPENAI)) {
      const service = this.getService(AIProvider.OPENAI);
      return service.countMessageTokens(messages, model);
    }
    
    // 如果OpenAI不可用，使用第一个可用的服务
    for (const service of this.services.values()) {
      return service.countMessageTokens(messages, model);
    }
    
    // 如果没有可用的服务，使用简单估算
    // 基本消息结构开销 + 每条消息内容的令牌数
    let totalTokens = 3; // 基本开销
    
    for (const message of messages) {
      // 每条消息的角色标记开销
      totalTokens += 4;
      
      // 计算内容的令牌数
      if (Array.isArray(message.content)) {
        for (const content of message.content) {
          if (content.type === ContentType.TEXT && content.text) {
            totalTokens += await this.countTokens(content.text, model);
          } else {
            // 非文本内容的估算
            totalTokens += 20; // 假设每个非文本内容约20个令牌
          }
        }
      } else if (message.content.type === ContentType.TEXT && message.content.text) {
        totalTokens += await this.countTokens(message.content.text, model);
      } else {
        // 非文本内容的估算
        totalTokens += 20;
      }
      
      // 函数调用的令牌估算
      if (message.functionCall) {
        totalTokens += 10; // 函数名称
        totalTokens += await this.countTokens(message.functionCall.arguments, model);
      }
    }
    
    return totalTokens;
  }
}

// 创建全局AI路由服务实例
export const globalAIRoutingService = new AIRoutingService();