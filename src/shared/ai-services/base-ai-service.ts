/**
 * Base AI Service - 基础AI服务
 * 
 * 提供AI服务的基础实现，包括初始化、关闭、模型管理等通用功能。
 * 具体的AI提供商服务需要继承此类并实现相应的方法。
 */

import {
  AIModel,
  AIModelType,
  AIProvider,
  ChatOptions,
  ChatResult,
  ChatStreamEvent,
  EmbeddingOptions,
  EmbeddingResult,
  IAIService,
  Message
} from './types';

/**
 * 基础AI服务配置
 */
export interface BaseAIServiceConfig {
  // 服务名称
  serviceName: string;
  // API密钥
  apiKey?: string;
  // API基础URL
  apiBaseUrl?: string;
  // 组织ID
  organizationId?: string;
  // 默认模型
  defaultModel?: string;
  // 超时时间（毫秒）
  timeout?: number;
  // 最大重试次数
  maxRetries?: number;
  // 日志级别
  logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'none';
  // 代理URL
  proxyUrl?: string;
  // 其他配置
  [key: string]: any;
}

/**
 * 基础AI服务
 */
export abstract class BaseAIService implements IAIService {
  // 服务是否已初始化
  private _initialized: boolean = false;
  
  // 服务配置
  private _config: BaseAIServiceConfig;
  
  // 可用模型列表
  protected _models: AIModel[] = [];
  
  /**
   * 构造函数
   * 
   * @param config 服务配置
   */
  constructor(config: BaseAIServiceConfig) {
    this._config = {
      timeout: 30000,
      maxRetries: 3,
      logLevel: 'info',
      ...config
    };
  }
  
  /**
   * 获取服务配置
   */
  get config(): BaseAIServiceConfig {
    return this._config;
  }
  
  /**
   * 设置服务配置
   */
  set config(config: BaseAIServiceConfig) {
    this._config = {
      ...this._config,
      ...config
    };
  }
  
  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    if (this._initialized) {
      return;
    }
    
    try {
      // 加载模型列表
      await this.loadModels();
      
      // 执行子类特定的初始化
      await this.initializeImpl();
      
      this._initialized = true;
      this.log('info', `${this._config.serviceName} initialized successfully`);
    } catch (error) {
      this.log('error', `Failed to initialize ${this._config.serviceName}: ${error}`);
      throw error;
    }
  }
  
  /**
   * 关闭服务
   */
  async shutdown(): Promise<void> {
    if (!this._initialized) {
      return;
    }
    
    try {
      // 执行子类特定的关闭
      await this.shutdownImpl();
      
      this._initialized = false;
      this.log('info', `${this._config.serviceName} shutdown successfully`);
    } catch (error) {
      this.log('error', `Failed to shutdown ${this._config.serviceName}: ${error}`);
      throw error;
    }
  }
  
  /**
   * 服务是否已初始化
   */
  isInitialized(): boolean {
    return this._initialized;
  }
  
  /**
   * 获取可用模型列表
   */
  async getAvailableModels(): Promise<AIModel[]> {
    this.ensureInitialized();
    return this._models;
  }
  
  /**
   * 创建嵌入
   * 
   * @param text 文本
   * @param options 选项
   */
  abstract createEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;
  
  /**
   * 批量创建嵌入
   * 
   * @param texts 文本列表
   * @param options 选项
   */
  abstract createEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResult[]>;
  
  /**
   * 聊天完成
   * 
   * @param messages 消息列表
   * @param options 选项
   */
  abstract chat(messages: Message[], options?: ChatOptions): Promise<ChatResult>;
  
  /**
   * 流式聊天完成
   * 
   * @param messages 消息列表
   * @param options 选项
   */
  abstract chatStream(messages: Message[], options?: ChatOptions): AsyncGenerator<ChatStreamEvent, void, unknown>;
  
  /**
   * 计算令牌数
   * 
   * @param text 文本
   * @param model 模型
   */
  abstract countTokens(text: string, model?: string): Promise<number>;
  
  /**
   * 计算消息令牌数
   * 
   * @param messages 消息列表
   * @param model 模型
   */
  abstract countMessageTokens(messages: Message[], model?: string): Promise<number>;
  
  /**
   * 子类特定的初始化实现
   */
  protected abstract initializeImpl(): Promise<void>;
  
  /**
   * 子类特定的关闭实现
   */
  protected abstract shutdownImpl(): Promise<void>;
  
  /**
   * 加载模型列表
   */
  protected abstract loadModels(): Promise<void>;
  
  /**
   * 确保服务已初始化
   */
  protected ensureInitialized(): void {
    if (!this._initialized) {
      throw new Error(`${this._config.serviceName} is not initialized`);
    }
  }
  
  /**
   * 获取默认模型
   * 
   * @param type 模型类型
   */
  protected getDefaultModel(type: AIModelType): string | undefined {
    // 首先检查配置中的默认模型
    if (this._config.defaultModel) {
      const model = this._models.find(m => m.name === this._config.defaultModel && m.type === type);
      if (model) {
        return model.name;
      }
    }
    
    // 否则返回该类型的第一个模型
    const model = this._models.find(m => m.type === type);
    return model?.name;
  }
  
  /**
   * 记录日志
   * 
   * @param level 日志级别
   * @param message 日志消息
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string): void {
    const logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      none: 4
    };
    
    const configLevel = this._config.logLevel || 'info';
    
    if (logLevels[level] >= logLevels[configLevel]) {
      const prefix = `[${this._config.serviceName}]`;
      
      switch (level) {
        case 'debug':
          console.debug(`${prefix} ${message}`);
          break;
        case 'info':
          console.info(`${prefix} ${message}`);
          break;
        case 'warn':
          console.warn(`${prefix} ${message}`);
          break;
        case 'error':
          console.error(`${prefix} ${message}`);
          break;
      }
    }
  }
}