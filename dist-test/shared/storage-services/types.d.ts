/**
 * Storage Services Types - 存储服务类型定义
 *
 * 定义存储服务相关的接口和类型
 */
/**
 * 存储提供者类型
 */
export declare enum StorageProviderType {
    LOCAL = "local",// 本地文件系统
    S3 = "s3",// Amazon S3 或兼容S3的服务
    MINIO = "minio",// MinIO
    AZURE = "azure",// Azure Blob Storage
    GCP = "gcp",// Google Cloud Storage
    CUSTOM = "custom"
}
/**
 * 文件元数据
 */
export interface FileMetadata {
    name: string;
    path: string;
    size: number;
    mimeType: string;
    createdAt: string;
    updatedAt: string;
    etag?: string;
    isPublic?: boolean;
    url?: string;
    thumbnailUrl?: string;
    [key: string]: any;
}
/**
 * 目录元数据
 */
export interface DirectoryMetadata {
    name: string;
    path: string;
    createdAt: string;
    updatedAt: string;
    isPublic?: boolean;
    [key: string]: any;
}
/**
 * 存储项类型
 */
export declare enum StorageItemType {
    FILE = "file",// 文件
    DIRECTORY = "directory"
}
/**
 * 存储项
 */
export interface StorageItem {
    type: StorageItemType;
    metadata: FileMetadata | DirectoryMetadata;
}
/**
 * 上传选项
 */
export interface UploadOptions {
    contentType?: string;
    metadata?: Record<string, string>;
    isPublic?: boolean;
    overwrite?: boolean;
    encryption?: boolean;
    tags?: Record<string, string>;
}
/**
 * 下载选项
 */
export interface DownloadOptions {
    destination?: string;
    range?: {
        start: number;
        end?: number;
    };
    ifModifiedSince?: Date;
    ifNoneMatch?: string;
}
/**
 * 列表选项
 */
export interface ListOptions {
    recursive?: boolean;
    maxResults?: number;
    prefix?: string;
    delimiter?: string;
    pageToken?: string;
}
/**
 * 列表结果
 */
export interface ListResult {
    items: StorageItem[];
    nextPageToken?: string;
    prefixes?: string[];
}
/**
 * 复制选项
 */
export interface CopyOptions {
    overwrite?: boolean;
    metadata?: Record<string, string>;
    isPublic?: boolean;
}
/**
 * 移动选项
 */
export interface MoveOptions {
    overwrite?: boolean;
}
/**
 * 签名URL选项
 */
export interface SignedUrlOptions {
    expiration: number;
    method?: 'GET' | 'PUT' | 'DELETE';
    contentType?: string;
    responseDisposition?: string;
    responseType?: string;
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
    downloadData(remotePath: string, options?: DownloadOptions): Promise<{
        data: Buffer;
        metadata: FileMetadata;
    }>;
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
    createDirectory(remotePath: string, options?: {
        isPublic?: boolean;
    }): Promise<DirectoryMetadata>;
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
