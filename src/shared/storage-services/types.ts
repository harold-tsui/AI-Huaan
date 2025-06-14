/**
 * Storage Services Types - 存储服务类型定义
 * 
 * 定义存储服务相关的接口和类型
 */

/**
 * 存储提供者类型
 */
export enum StorageProviderType {
  LOCAL = 'local',   // 本地文件系统
  S3 = 's3',         // Amazon S3 或兼容S3的服务
  MINIO = 'minio',   // MinIO
  AZURE = 'azure',   // Azure Blob Storage
  GCP = 'gcp',       // Google Cloud Storage
  CUSTOM = 'custom', // 自定义存储提供者
}

/**
 * 文件元数据
 */
export interface FileMetadata {
  name: string;              // 文件名
  path: string;              // 文件路径
  size: number;              // 文件大小（字节）
  mimeType: string;          // MIME类型
  createdAt: string;         // 创建时间
  updatedAt: string;         // 更新时间
  etag?: string;             // ETag（用于缓存验证）
  isPublic?: boolean;        // 是否公开可访问
  url?: string;              // 访问URL
  thumbnailUrl?: string;     // 缩略图URL（如果适用）
  [key: string]: any;        // 其他元数据
}

/**
 * 目录元数据
 */
export interface DirectoryMetadata {
  name: string;              // 目录名
  path: string;              // 目录路径
  createdAt: string;         // 创建时间
  updatedAt: string;         // 更新时间
  isPublic?: boolean;        // 是否公开可访问
  [key: string]: any;        // 其他元数据
}

/**
 * 存储项类型
 */
export enum StorageItemType {
  FILE = 'file',             // 文件
  DIRECTORY = 'directory',   // 目录
}

/**
 * 存储项
 */
export interface StorageItem {
  type: StorageItemType;                 // 项类型
  metadata: FileMetadata | DirectoryMetadata; // 元数据
}

/**
 * 上传选项
 */
export interface UploadOptions {
  contentType?: string;      // 内容类型
  metadata?: Record<string, string>; // 自定义元数据
  isPublic?: boolean;        // 是否公开可访问
  overwrite?: boolean;       // 是否覆盖现有文件
  encryption?: boolean;      // 是否加密
  tags?: Record<string, string>; // 标签
}

/**
 * 下载选项
 */
export interface DownloadOptions {
  destination?: string;      // 下载目标路径
  range?: { start: number; end?: number }; // 字节范围
  ifModifiedSince?: Date;    // 条件下载
  ifNoneMatch?: string;      // 条件下载（ETag）
}

/**
 * 列表选项
 */
export interface ListOptions {
  recursive?: boolean;       // 是否递归列出子目录
  maxResults?: number;       // 最大结果数
  prefix?: string;           // 前缀过滤
  delimiter?: string;        // 分隔符
  pageToken?: string;        // 分页标记
}

/**
 * 列表结果
 */
export interface ListResult {
  items: StorageItem[];      // 存储项
  nextPageToken?: string;    // 下一页标记
  prefixes?: string[];       // 公共前缀（用于分层列表）
}

/**
 * 复制选项
 */
export interface CopyOptions {
  overwrite?: boolean;       // 是否覆盖目标
  metadata?: Record<string, string>; // 新元数据
  isPublic?: boolean;        // 是否公开可访问
}

/**
 * 移动选项
 */
export interface MoveOptions {
  overwrite?: boolean;       // 是否覆盖目标
}

/**
 * 签名URL选项
 */
export interface SignedUrlOptions {
  expiration: number;        // 过期时间（秒）
  method?: 'GET' | 'PUT' | 'DELETE'; // HTTP方法
  contentType?: string;      // 内容类型（用于PUT）
  responseDisposition?: string; // 响应处置
  responseType?: string;     // 响应类型
}

/**
 * 存储服务接口
 */
export interface IStorageService {
  /**
   * 获取存储提供者类型
   */
  getProviderType(): StorageProviderType;
  
  /**
   * 初始化存储服务
   */
  initialize(): Promise<boolean>;
  
  /**
   * 关闭存储服务
   */
  shutdown(): Promise<boolean>;
  
  /**
   * 上传文件
   * @param localFilePath 本地文件路径
   * @param remotePath 远程路径
   * @param options 上传选项
   */
  uploadFile(localFilePath: string, remotePath: string, options?: UploadOptions): Promise<FileMetadata>;
  
  /**
   * 上传数据
   * @param data 数据（Buffer或字符串）
   * @param remotePath 远程路径
   * @param options 上传选项
   */
  uploadData(data: Buffer | string, remotePath: string, options?: UploadOptions): Promise<FileMetadata>;
  
  /**
   * 下载文件
   * @param remotePath 远程路径
   * @param localFilePath 本地文件路径
   * @param options 下载选项
   */
  downloadFile(remotePath: string, localFilePath: string, options?: DownloadOptions): Promise<FileMetadata>;
  
  /**
   * 下载数据
   * @param remotePath 远程路径
   * @param options 下载选项
   */
  downloadData(remotePath: string, options?: DownloadOptions): Promise<{ data: Buffer; metadata: FileMetadata }>;
  
  /**
   * 获取文件元数据
   * @param remotePath 远程路径
   */
  getFileMetadata(remotePath: string): Promise<FileMetadata>;
  
  /**
   * 获取目录元数据
   * @param remotePath 远程路径
   */
  getDirectoryMetadata(remotePath: string): Promise<DirectoryMetadata>;
  
  /**
   * 检查文件是否存在
   * @param remotePath 远程路径
   */
  fileExists(remotePath: string): Promise<boolean>;
  
  /**
   * 检查目录是否存在
   * @param remotePath 远程路径
   */
  directoryExists(remotePath: string): Promise<boolean>;
  
  /**
   * 列出目录内容
   * @param remotePath 远程路径
   * @param options 列表选项
   */
  listDirectory(remotePath: string, options?: ListOptions): Promise<ListResult>;
  
  /**
   * 创建目录
   * @param remotePath 远程路径
   * @param options 选项
   */
  createDirectory(remotePath: string, options?: { isPublic?: boolean }): Promise<DirectoryMetadata>;
  
  /**
   * 删除文件
   * @param remotePath 远程路径
   */
  deleteFile(remotePath: string): Promise<boolean>;
  
  /**
   * 删除目录
   * @param remotePath 远程路径
   * @param recursive 是否递归删除
   */
  deleteDirectory(remotePath: string, recursive?: boolean): Promise<boolean>;
  
  /**
   * 复制文件
   * @param sourceRemotePath 源远程路径
   * @param targetRemotePath 目标远程路径
   * @param options 复制选项
   */
  copyFile(sourceRemotePath: string, targetRemotePath: string, options?: CopyOptions): Promise<FileMetadata>;
  
  /**
   * 移动文件
   * @param sourceRemotePath 源远程路径
   * @param targetRemotePath 目标远程路径
   * @param options 移动选项
   */
  moveFile(sourceRemotePath: string, targetRemotePath: string, options?: MoveOptions): Promise<FileMetadata>;
  
  /**
   * 生成签名URL
   * @param remotePath 远程路径
   * @param options 签名URL选项
   */
  generateSignedUrl(remotePath: string, options: SignedUrlOptions): Promise<string>;
  
  /**
   * 获取公共URL
   * @param remotePath 远程路径
   */
  getPublicUrl(remotePath: string): Promise<string | null>;
  
  /**
   * 设置文件公共访问权限
   * @param remotePath 远程路径
   * @param isPublic 是否公开
   */
  setPublicAccess(remotePath: string, isPublic: boolean): Promise<FileMetadata>;
  
  /**
   * 更新文件元数据
   * @param remotePath 远程路径
   * @param metadata 元数据
   */
  updateFileMetadata(remotePath: string, metadata: Partial<Record<string, string>>): Promise<FileMetadata>;
}