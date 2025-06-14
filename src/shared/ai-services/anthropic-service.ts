/**
 * Anthropic Service - Anthropic服务实现
 * 
 * 提供与Anthropic API的集成
 */

import Anthropic from '@anthropic-ai/sdk';
import { ConfigManager } from '../../utils/config';
import { Logger } from '../../utils/logger';
import {
  AIModel,
  AIModelType,
  AIProvider,
  ChatOptions,
  ChatResult,
  ChatStreamEvent,
  ChatStreamEventType,
  ContentType,
  EmbeddingOptions,
  EmbeddingResult,
  FunctionCall,
  IAIService,
  Message,
  MessageContent,
  MessageRole,
} from './types';

/**
 * Anthropic服务实现
 */
export class AnthropicService implements IAIService {
  private client: Anthropic;
  private logger: Logger;
  private availableModels: AIModel[] = [];
  private apiKey: string;
  private baseURL?: string;

  /**
   * 构造函数
   */
  constructor() {
    this.logger = new Logger('AnthropicService');
    const config = ConfigManager.getInstance().getConfig();
    
    this.apiKey = config.ai?.anthropic?.apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.baseURL = config.ai?.anthropic?.baseURL || process.env.ANTHROPIC_BASE_URL;
    
    if (!this.apiKey) {
      this.logger.error('Anthropic API key is not provided');
      throw new Error('Anthropic API key is required');
    }
    
    this.client = new Anthropic({
      apiKey: this.apiKey,
      baseURL: this.baseURL,
    }) as any;
    
    this.initializeModels();
  }

  /**
   * 初始化模型列表
   */
  private async initializeModels(): Promise<void> {
    // Anthropic API目前不提供模型列表接口，使用硬编码的模型列表
    this.availableModels = [
      {
        id: 'claude-3-opus-20240229',
        provider: AIProvider.ANTHROPIC,
        type: AIModelType.CHAT,
        name: 'Claude 3 Opus',
        version: '20240229',
        contextWindow: 200000,
        maxTokens: 4096,
        description: 'Most powerful Claude model for highly complex tasks',
      },
      {
        id: 'claude-3-sonnet-20240229',
        provider: AIProvider.ANTHROPIC,
        type: AIModelType.CHAT,
        name: 'Claude 3 Sonnet',
        version: '20240229',
        contextWindow: 200000,
        maxTokens: 4096,
        description: 'Ideal balance of intelligence and speed for enterprise workloads',
      },
      {
        id: 'claude-3-haiku-20240307',
        provider: AIProvider.ANTHROPIC,
        type: AIModelType.CHAT,
        name: 'Claude 3 Haiku',
        version: '20240307',
        contextWindow: 200000,
        maxTokens: 4096,
        description: 'Fastest and most compact Claude model',
      },
      {
        id: 'claude-2.1',
        provider: AIProvider.ANTHROPIC,
        type: AIModelType.CHAT,
        name: 'Claude 2.1',
        version: '2.1',
        contextWindow: 200000,
        maxTokens: 4096,
        description: 'Improved version of Claude 2',
      },
      {
        id: 'claude-2.0',
        provider: AIProvider.ANTHROPIC,
        type: AIModelType.CHAT,
        name: 'Claude 2.0',
        version: '2.0',
        contextWindow: 100000,
        maxTokens: 4096,
        description: 'Older version of Claude 2',
      },
      {
        id: 'claude-instant-1.2',
        provider: AIProvider.ANTHROPIC,
        type: AIModelType.CHAT,
        name: 'Claude Instant 1.2',
        version: '1.2',
        contextWindow: 100000,
        maxTokens: 4096,
        description: 'Faster and more affordable version of Claude',
      },
    ];
    
    this.logger.info(`Initialized ${this.availableModels.length} Anthropic models`);
  }

  /**
   * 获取可用模型列表
   */
  async getAvailableModels(): Promise<AIModel[]> {
    return this.availableModels;
  }

  /**
   * 创建文本嵌入
   * 注意：Anthropic目前不提供嵌入API，这里抛出错误
   */
  async createEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult> {
    this.logger.error('Anthropic does not support embeddings');
    throw new Error('Anthropic does not support embeddings');
  }

  /**
   * 批量创建文本嵌入
   * 注意：Anthropic目前不提供嵌入API，这里抛出错误
   */
  async createEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResult[]> {
    this.logger.error('Anthropic does not support embeddings');
    throw new Error('Anthropic does not support embeddings');
  }

  /**
   * 将标准消息格式转换为Anthropic消息格式
   */
  private convertToAnthropicMessages(messages: Message[]): Array<{ role: 'user' | 'assistant', content?: string | Array<any> }> {
    return messages.map(message => {
      // Anthropic只支持user和assistant角色，将system消息转换为user消息
      let role: 'user' | 'assistant';
      if (message.role === MessageRole.SYSTEM) {
        role = 'user';
      } else if (message.role === MessageRole.ASSISTANT) {
        role = 'assistant';
      } else {
        role = 'user';
      }
      
      const anthropicMessage: { role: 'user' | 'assistant'; content?: string | Array<any> } = {
        role,
      };
      
      // 处理内容
      if (Array.isArray(message.content)) {
        anthropicMessage.content = message.content.map(content => {
          if (content.type === ContentType.TEXT) {
            return { type: 'text', text: content.text || '' };
          } else if (content.type === ContentType.IMAGE) {
            return {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg', // 假设为JPEG
                data: content.data || '',
              },
            };
          }
          // 其他类型暂不支持
          return { type: 'text', text: '' };
        });
      } else {
        // 使用类型断言确保TypeScript知道message.content是MessageContent类型
        const content = message.content as MessageContent;
        if (content.type === ContentType.TEXT) {
          anthropicMessage.content = [{ type: 'text', text: content.text || '' }];
        } else if (content.type === ContentType.IMAGE) {
          anthropicMessage.content = [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg', // 假设为JPEG
                data: content.data || '',
              },
            }
          ];
        }
      }
      
      return anthropicMessage;
    });
  }

  /**
   * 将Anthropic消息转换为标准消息格式
   */
  private convertFromAnthropicMessage(message: { role: 'user' | 'assistant'; content: string | Array<any> }): Message {
    const result: Message = {
      role: message.role === 'assistant' ? MessageRole.ASSISTANT : MessageRole.USER,
      content: { type: ContentType.TEXT, text: '' },
    };
    
    // 处理内容
    if (Array.isArray(message.content)) {
      const contents: MessageContent[] = [];
      
      for (const content of message.content) {
        if (content.type === 'text') {
          contents.push({ type: ContentType.TEXT, text: content.text });
        } else if (content.type === 'image') {
          // Anthropic响应中通常不会包含图像
          contents.push({
            type: ContentType.IMAGE,
            data: '',
          });
        }
      }
      
      if (contents.length === 1) {
        result.content = contents[0];
      } else if (contents.length > 1) {
        result.content = contents;
      }
    }
    
    // 处理工具调用（Claude 3支持）
    if ((message as any).stop_reason === 'tool_use' && (message as any).content && Array.isArray((message as any).content)) {
      // 尝试从内容中提取工具调用
      const toolUseContent = ((message as any).content as Array<any>).find(c => c.type === 'tool_use');
      if (toolUseContent && 'type' in toolUseContent && toolUseContent.type === 'tool_use') {
        result.functionCall = {
          name: toolUseContent.name,
          arguments: JSON.stringify(toolUseContent.input),
        };
      }
    }
    
    return result;
  }

  /**
   * 将标准函数定义转换为Anthropic工具定义
   */
  private convertToAnthropicTools(functions?: Array<{ name: string; description?: string; parameters?: Record<string, unknown> }>): Array<{ name: string; description?: string; input_schema?: Record<string, unknown> }> | undefined {
    if (!functions || functions.length === 0) {
      return undefined;
    }
    
    return functions.map(func => ({
      name: func.name,
      description: func.description,
      input_schema: func.parameters,
    }));
  }

  /**
   * 聊天完成
   */
  async chat(messages: Message[], options?: ChatOptions): Promise<ChatResult> {
    const model = options?.model || 'claude-3-sonnet-20240229';
    
    try {
      // 处理系统消息
      let systemPrompt: string | undefined;
      if (messages.length > 0 && messages[0].role === MessageRole.SYSTEM) {
        const systemMessage = messages[0];
        if (typeof systemMessage.content === 'object' && !Array.isArray(systemMessage.content) && systemMessage.content.type === ContentType.TEXT) {
          systemPrompt = systemMessage.content.text;
        } else if (Array.isArray(systemMessage.content)) {
          const textContent = systemMessage.content.find(c => c.type === ContentType.TEXT);
          if (textContent) {
            systemPrompt = textContent.text;
          }
        }
        // 移除系统消息，因为它将作为系统提示发送
        messages = messages.slice(1);
      }
      
      const anthropicMessages = this.convertToAnthropicMessages(messages);
      const tools = this.convertToAnthropicTools(options?.functions);
      
      const response = await (this.client as any).messages.create({
        model,
        messages: anthropicMessages,
        system: systemPrompt,
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        top_p: options?.topP,
        stop_sequences: options?.stopSequences,
        tools: tools,
      });
      
      const message = this.convertFromAnthropicMessage(response);
      
      return {
        message,
        model,
        provider: AIProvider.ANTHROPIC,
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
      };
    } catch (error) {
      this.logger.error('Failed to chat completion:', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * 流式聊天完成
   */
  async *chatStream(messages: Message[], options?: ChatOptions): AsyncGenerator<ChatStreamEvent, void, unknown> {
    const model = options?.model || 'claude-3-sonnet-20240229';
    
    try {
      // 处理系统消息
      let systemPrompt: string | undefined;
      if (messages.length > 0 && messages[0].role === MessageRole.SYSTEM) {
        const systemMessage = messages[0];
        if (typeof systemMessage.content === 'object' && !Array.isArray(systemMessage.content) && systemMessage.content.type === ContentType.TEXT) {
          systemPrompt = systemMessage.content.text;
        } else if (Array.isArray(systemMessage.content)) {
          const textContent = systemMessage.content.find(c => c.type === ContentType.TEXT);
          if (textContent) {
            systemPrompt = textContent.text;
          }
        }
        // 移除系统消息，因为它将作为系统提示发送
        messages = messages.slice(1);
      }
      
      const anthropicMessages = this.convertToAnthropicMessages(messages);
      const tools = this.convertToAnthropicTools(options?.functions);
      
      const stream = await (this.client as any).messages.create({
        model,
        messages: anthropicMessages,
        system: systemPrompt,
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        top_p: options?.topP,
        stop_sequences: options?.stopSequences,
        tools: tools,
        stream: true,
      });
      
      // 发送开始事件
      yield {
        type: ChatStreamEventType.START,
        model,
        provider: AIProvider.ANTHROPIC,
      };
      
      let functionCall: Partial<FunctionCall> | undefined;
      let content = '';
      let promptTokens = 0;
      let completionTokens = 0;
      
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text') {
          content += chunk.delta.text;
          completionTokens += this.estimateTokenCount(chunk.delta.text);
          
          yield {
            type: ChatStreamEventType.TOKEN,
            data: chunk.delta.text,
          };
        } else if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
          // 工具使用开始
          functionCall = {
            name: chunk.content_block.name,
            arguments: JSON.stringify(chunk.content_block.input),
          };
          
          yield {
            type: ChatStreamEventType.FUNCTION_CALL,
            functionCall,
          };
        } else if (chunk.type === 'message_delta' && chunk.usage) {
          // 更新令牌计数
          promptTokens = chunk.usage.input_tokens;
          completionTokens = chunk.usage.output_tokens;
        }
      }
      
      // 如果有函数调用，发送函数调用结束事件
      if (functionCall) {
        yield {
          type: ChatStreamEventType.FUNCTION_CALL_END,
          functionCall,
        };
      }
      
      // 发送结束事件
      yield {
        type: ChatStreamEventType.END,
        model,
        provider: AIProvider.ANTHROPIC,
        stats: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
      };
    } catch (error) {
      this.logger.error('Failed to chat stream:', error instanceof Error ? error : new Error(String(error)));
      
      yield {
        type: ChatStreamEventType.ERROR,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * 估算文本的令牌数
   * 注意：这是一个粗略的估计，不如Claude的tokenizer准确
   */
  private estimateTokenCount(text: string): number {
    // Claude的分词器与GPT不同，大约每4个字符为1个令牌
    return Math.ceil(text.length / 4);
  }

  /**
   * 计算文本的令牌数
   */
  async countTokens(text: string, model?: string): Promise<number> {
    // 使用估算方法
    return this.estimateTokenCount(text);
  }

  /**
   * 计算消息的令牌数
   */
  async countMessageTokens(messages: Message[], model?: string): Promise<number> {
    let totalTokens = 0;
    
    // 系统提示
    if (messages.length > 0 && messages[0].role === MessageRole.SYSTEM) {
      const systemMessage = messages[0];
      if (typeof systemMessage.content === 'object' && !Array.isArray(systemMessage.content) && systemMessage.content.type === ContentType.TEXT) {
        totalTokens += this.estimateTokenCount(systemMessage.content.text || '');
      } else if (Array.isArray(systemMessage.content)) {
        const textContent = systemMessage.content.find(c => c.type === ContentType.TEXT);
        if (textContent) {
          totalTokens += this.estimateTokenCount(textContent.text || '');
        }
      }
      // 移除系统消息，因为它已经计算过了
      messages = messages.slice(1);
    }
    
    // 其他消息
    for (const message of messages) {
      // 每条消息有一个基础令牌开销
      totalTokens += 5;
      
      // 内容
      if (Array.isArray(message.content)) {
        for (const content of message.content) {
          if (content.type === ContentType.TEXT && content.text) {
            totalTokens += this.estimateTokenCount(content.text);
          }
          // 图像令牌计算较复杂，这里简化处理
          else if (content.type === ContentType.IMAGE) {
            totalTokens += 128; // 基础图像令牌
          }
        }
      } else if (message.content.type === ContentType.TEXT && message.content.text) {
        totalTokens += this.estimateTokenCount(message.content.text);
      } else if (message.content.type === ContentType.IMAGE) {
        totalTokens += 128; // 基础图像令牌
      }
    }
    
    // Claude模型的额外开销
    totalTokens += 10;
    
    return totalTokens;
  }
}

// 创建全局Anthropic服务实例
export const globalAnthropicService = new AnthropicService();