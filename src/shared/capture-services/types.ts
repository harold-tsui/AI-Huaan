/**
 * Capture Services Types - 捕获服务类型定义
 * 
 * 定义捕获服务相关的类型和接口
 */

// 捕获源类型枚举
export enum CaptureSourceType {
  WEB = 'web',
  FILE = 'file',
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  EMAIL = 'email',
  RSS = 'rss',
  SOCIAL = 'social',
  API = 'api',
  CUSTOM = 'custom',
}

// 捕获项状态枚举
export enum CaptureItemStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ARCHIVED = 'archived',
}

// 捕获项优先级枚举
export enum CaptureItemPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  NORMAL = "NORMAL",
}

// 捕获项元数据接口
export interface CaptureItemMetadata {
  title?: string;           // 标题
  description?: string;     // 描述
  author?: string;          // 作者
  source?: string;          // 来源
  url?: string;             // URL
  publishedDate?: string;   // 发布日期
  capturedDate: string;     // 捕获日期
  fileType?: string;        // 文件类型
  fileSize?: number;        // 文件大小（字节）
  duration?: number;        // 持续时间（秒，用于音频/视频）
  dimensions?: {            // 尺寸（用于图像/视频）
    width: number;
    height: number;
  };
  location?: {              // 位置
    latitude: number;
    longitude: number;
    name?: string;
  };
  tags?: string[];          // 标签
  customFields?: Record<string, any>; // 自定义字段
}

// 捕获项内容接口
export interface CaptureItemContent {
  file?: any;              // 文件内容
  text?: string;            // 文本内容
  html?: string;            // HTML内容
  markdown?: string;        // Markdown内容
  filePath?: string;        // 文件路径
  fileUrl?: string;         // 文件URL
  thumbnailUrl?: string;    // 缩略图URL
  previewUrl?: string;      // 预览URL
  embeddings?: number[];    // 嵌入向量
}

// 捕获项处理结果接口
export interface CaptureItemProcessingResult {
  success?: boolean;         // 是否成功
  message?: string;         // 消息
  processorName?: string;   // 处理器名称
  updatedContent?: CaptureItemContent; // 更新后的内容
  extractedText?: string;   // 提取的文本
  extractedMetadata?: Record<string, any>; // 提取的元数据
  suggestedTags?: string[]; // 建议的标签
  suggestedCategories?: string[]; // 建议的分类
  summary?: string;         // 摘要
  keyInsights?: string[];   // 关键见解
  entities?: string[];      // 实体
  sentiment?: string;       // 情感
  topics?: string[];        // 主题
  readingTime?: number;     // 阅读时间（分钟）
  complexity?: number;      // 复杂度（0-1）
}

// 捕获项接口
export interface CaptureItem {
  id: string;               // ID
  userId: string;           // 用户ID
  sourceType: CaptureSourceType; // 源类型
  status: CaptureItemStatus; // 状态
  priority: CaptureItemPriority; // 优先级
  metadata: CaptureItemMetadata; // 元数据
  content: CaptureItemContent; // 内容
  processingResult?: CaptureItemProcessingResult; // 处理结果
  created: string;          // 创建时间
  updated: string;          // 更新时间
  processed?: string;       // 处理时间
  archived?: string;        // 归档时间
}

// 捕获项创建输入接口
export interface CreateCaptureItemInput {
  status: CaptureItemStatus;
  userId: string;           // 用户ID
  sourceType: CaptureSourceType; // 源类型
  priority?: CaptureItemPriority; // 优先级
  metadata: Partial<CaptureItemMetadata>; // 元数据
  content: Partial<CaptureItemContent>; // 内容
  processImmediately?: boolean; // 是否立即处理
}

// 捕获项更新输入接口
export interface UpdateCaptureItemInput {
  status?: CaptureItemStatus; // 状态
  priority?: CaptureItemPriority; // 优先级
  metadata?: Partial<CaptureItemMetadata>; // 元数据
  content?: Partial<CaptureItemContent>; // 内容
  processingResult?: Partial<CaptureItemProcessingResult>; // 处理结果
}

// 捕获项查询选项接口
export interface CaptureItemQueryOptions {
  userId?: string;          // 用户ID
  sourceType?: CaptureSourceType; // 源类型
  status?: CaptureItemStatus; // 状态
  priority?: CaptureItemPriority; // 优先级
  tags?: string[];          // 标签
  search?: string;          // 搜索词
  startDate?: string;       // 开始日期
  endDate?: string;         // 结束日期
  sortBy?: string;          // 排序字段
  sortOrder?: 'asc' | 'desc'; // 排序顺序
  limit?: number;           // 限制
  offset?: number;          // 偏移
}

// 网页捕获选项接口
export interface WebCaptureOptions {
  url: string;              // URL
  selector?: string;        // CSS选择器（用于提取特定内容）
  includeImages?: boolean;  // 是否包含图像
  saveScreenshot?: boolean; // 是否保存截图
  waitForSelector?: string; // 等待选择器（用于动态内容）
  javascript?: string;      // 执行的JavaScript
  userAgent?: string;       // 用户代理
  timeout?: number;         // 超时（毫秒）
  proxy?: string;           // 代理
  cookies?: Record<string, string>; // Cookie
  headers?: Record<string, string>; // 请求头
}

// 文件捕获选项接口
export interface FileCaptureOptions {
  filePath?: string;        // 文件路径
  fileBuffer?: Buffer;      // 文件缓冲区
  fileUrl?: string;         // 文件URL
  extractText?: boolean;    // 是否提取文本
  extractMetadata?: boolean; // 是否提取元数据
  generateThumbnail?: boolean; // 是否生成缩略图
  maxFileSize?: number;     // 最大文件大小（字节）
  allowedFileTypes?: string[]; // 允许的文件类型
}

// 捕获处理器接口
export interface ICaptureProcessor {
  // 处理捕获项
  processCaptureItem(item: CaptureItem): Promise<CaptureItemProcessingResult>;
  
  // 支持的源类型
  getSupportedSourceTypes(): CaptureSourceType[];
  
  // 处理器名称
  getName(): string;
  
  // 处理器描述
  getDescription(): string;
}

// 捕获服务接口
export interface ICaptureService {
  // 创建捕获项
  createCaptureItem(input: CreateCaptureItemInput): Promise<CaptureItem>;
  
  // 获取捕获项
  getCaptureItem(id: string): Promise<CaptureItem | null>;
  
  // 更新捕获项
  updateCaptureItem(id: string, input: UpdateCaptureItemInput): Promise<CaptureItem | null>;
  
  // 删除捕获项
  deleteCaptureItem(id: string): Promise<boolean>;
  
  // 查询捕获项
  queryCaptureItems(options: CaptureItemQueryOptions): Promise<{
    items: CaptureItem[];
    total: number;
  }>;
  
  // 处理捕获项
  processCaptureItem(id: string): Promise<CaptureItem | null>;
  
  // 归档捕获项
  archiveCaptureItem(id: string): Promise<CaptureItem | null>;
  
  // 从网页捕获
  captureFromWeb(options: WebCaptureOptions, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
  
  // 从文件捕获
  captureFromFile(options: FileCaptureOptions, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
  
  // 从文本捕获
  captureFromText(text: string, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
  
  // 从URL捕获
  captureFromUrl(url: string, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
  
  // 注册处理器
  registerProcessor(processor: ICaptureProcessor): void;
  
  // 获取处理器
  getProcessor(name: string): ICaptureProcessor | null;
  
  // 获取所有处理器
  getAllProcessors(): ICaptureProcessor[];
}