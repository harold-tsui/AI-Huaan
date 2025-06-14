/**
 * AI Services Types - AI服务类型定义
 * 
 * 定义AI服务相关的类型和接口
 */

// AI提供商枚举
export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  LOCAL = 'local',
  CUSTOM = 'custom',
}

// AI模型类型枚举
export enum AIModelType {
  EMBEDDING = 'embedding',
  COMPLETION = 'completion',
  CHAT = 'chat',
  IMAGE = 'image',
  AUDIO = 'audio',
}

// AI模型接口
export interface AIModel {
  id: string;              // 模型ID
  provider: AIProvider;    // 提供商
  type: AIModelType;       // 模型类型
  name: string;            // 模型名称
  version: string;         // 模型版本
  contextWindow: number;   // 上下文窗口大小
  maxTokens: number;       // 最大令牌数
  description?: string;    // 描述
  capabilities?: string[]; // 能力列表
  costPerToken?: number;   // 每令牌成本
}

// 消息角色枚举
export enum MessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
  FUNCTION = 'function',
}

// 消息内容类型枚举
export enum ContentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file',
}

// 消息内容接口
export interface MessageContent {
  type: ContentType;       // 内容类型
  text?: string;           // 文本内容
  url?: string;            // URL
  data?: string;           // Base64数据
  metadata?: Record<string, any>; // 元数据
}

// 消息接口
export interface Message {
  role: MessageRole;       // 角色
  content: MessageContent | MessageContent[]; // 内容
  name?: string;           // 名称（用于函数调用）
  functionCall?: FunctionCall; // 函数调用
}

// 函数定义接口
export interface FunctionDefinition {
  name: string;            // 函数名称
  description: string;     // 函数描述
  parameters: Record<string, any>; // 参数定义（JSON Schema）
  required?: string[];     // 必需参数
}

// 函数调用接口
export interface FunctionCall {
  name: string;            // 函数名称
  arguments: string;       // 参数（JSON字符串）
}

// 嵌入选项接口
export interface EmbeddingOptions {
  model?: string;          // 模型名称
  provider?: AIProvider;   // 提供商
  dimensions?: number;     // 维度
  normalize?: boolean;     // 是否归一化
}

// 嵌入结果接口
export interface EmbeddingResult {
  embedding: number[];     // 嵌入向量
  model: string;           // 使用的模型
  provider: AIProvider;    // 使用的提供商
  dimensions: number;      // 维度
  tokenCount: number;      // 令牌数
  truncated: boolean;      // 是否被截断
}

// 聊天选项接口
export interface ChatOptions {
  model?: string;          // 模型名称
  provider?: AIProvider;   // 提供商
  temperature?: number;    // 温度
  maxTokens?: number;      // 最大令牌数
  topP?: number;           // Top-P采样
  frequencyPenalty?: number; // 频率惩罚
  presencePenalty?: number;  // 存在惩罚
  stopSequences?: string[];  // 停止序列
  functions?: FunctionDefinition[]; // 函数定义
  functionCall?: 'auto' | 'none' | { name: string }; // 函数调用控制
  stream?: boolean;        // 是否流式输出
}

// 聊天结果接口
export interface ChatResult {
  message: Message;        // 回复消息
  model: string;           // 使用的模型
  provider: AIProvider;    // 使用的提供商
  promptTokens: number;    // 提示令牌数
  completionTokens: number; // 完成令牌数
  totalTokens: number;     // 总令牌数
  cost?: number;           // 成本
}

// 聊天流事件类型
export enum ChatStreamEventType {
  START = 'start',
  TOKEN = 'token',
  FUNCTION_CALL = 'function_call',
  FUNCTION_CALL_END = 'function_call_end',
  END = 'end',
  ERROR = 'error',
}

// 聊天流事件接口
export interface ChatStreamEvent {
  type: ChatStreamEventType; // 事件类型
  data?: string;           // 数据
  functionCall?: Partial<FunctionCall>; // 函数调用
  error?: Error;           // 错误
  model?: string;          // 模型
  provider?: AIProvider;   // 提供商
  stats?: {
    promptTokens: number;  // 提示令牌数
    completionTokens: number; // 完成令牌数
    totalTokens: number;   // 总令牌数
    cost?: number;         // 成本
  };
}

// AI服务接口
export interface IAIService {
  // 获取可用模型
  getAvailableModels(): Promise<AIModel[]>;
  
  // 创建嵌入
  createEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;
  
  // 批量创建嵌入
  createEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<EmbeddingResult[]>;
  
  // 聊天完成
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResult>;
  
  // 流式聊天完成
  chatStream(messages: Message[], options?: ChatOptions): AsyncGenerator<ChatStreamEvent, void, unknown>;
  
  // 计算令牌数
  countTokens(text: string, model?: string): Promise<number>;
  
  // 计算消息令牌数
  countMessageTokens(messages: Message[], model?: string): Promise<number>;
}

// AI路由服务接口
export interface IAIRoutingService {
  // 根据请求选择最佳提供商
  selectProvider(modelType: AIModelType, options?: {
    preferredProvider?: AIProvider;
    costSensitive?: boolean;
    performanceSensitive?: boolean;
    qualitySensitive?: boolean;
  }): Promise<{
    provider: AIProvider;
    model: string;
  }>;
  
  // 获取服务实例
  getService(provider: AIProvider): IAIService;
  
  // 创建嵌入（自动路由）
  createEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>;
  
  // 聊天完成（自动路由）
  chat(messages: Message[], options?: ChatOptions): Promise<ChatResult>;
  
  // 流式聊天完成（自动路由）
  chatStream(messages: Message[], options?: ChatOptions): AsyncGenerator<ChatStreamEvent, void, unknown>;
}

// 提示模板接口
export interface PromptTemplate {
  id: string;              // 模板ID
  name: string;            // 模板名称
  description: string;     // 描述
  template: string;        // 模板字符串
  variables: string[];     // 变量列表
  defaultValues?: Record<string, string>; // 默认值
  tags?: string[];         // 标签
  category?: string;       // 类别
  version: string;         // 版本
  created: string;         // 创建时间
  modified: string;        // 修改时间
}

// 提示管理器接口
export interface IPromptManager {
  // 获取模板
  getTemplate(id: string): Promise<PromptTemplate | null>;
  
  // 创建模板
  createTemplate(template: Omit<PromptTemplate, 'id' | 'created' | 'modified'>): Promise<PromptTemplate>;
  
  // 更新模板
  updateTemplate(id: string, template: Partial<Omit<PromptTemplate, 'id' | 'created' | 'modified'>>): Promise<PromptTemplate | null>;
  
  // 删除模板
  deleteTemplate(id: string): Promise<boolean>;
  
  // 列出模板
  listTemplates(options?: {
    category?: string;
    tags?: string[];
    search?: string;
  }): Promise<PromptTemplate[]>;
  
  // 渲染模板
  renderTemplate(templateIdOrString: string, variables: Record<string, string>): Promise<string>;
}