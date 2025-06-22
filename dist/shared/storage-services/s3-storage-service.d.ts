/**
 * S3 Storage Service - S3存储服务
 *
 * 基于AWS S3的存储服务实现
 */
import { BaseStorageService } from './base-storage-service';
import { CopyOptions, DirectoryMetadata, DownloadOptions, FileMetadata, ListOptions, ListResult, MoveOptions, SignedUrlOptions, UploadOptions } from './types';
/**
 * S3存储服务配置
 */
export interface S3StorageConfig {
    region: string;
    bucket: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    endpoint?: string;
    forcePathStyle?: boolean;
    baseUrl?: string;
    tempDir?: string;
    maxPartSize?: number;
    maxConcurrentUploads?: number;
}
/**
 * S3存储服务实现
 */
export declare class S3StorageService extends BaseStorageService {
    protected config: S3StorageConfig;
    private s3Client;
    private initialized;
    private readonly DEFAULT_PART_SIZE;
    private readonly DEFAULT_CONCURRENT_UPLOADS;
    /**
     * 构造函数
     * @param config 配置
     */
    constructor(s3Config: S3StorageConfig);
    /**
     * 初始化提供者
     */
    protected initializeProvider(): Promise<boolean>;
    /**
     * 关闭提供者
     */
    protected shutdownProvider(): Promise<boolean>;
    /**
     * 确保服务已初始化
     * @private
     */
    private ensureInitialized;
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
     * 上传大文件（使用分段上传）
     * @param localFilePath 本地文件路径
     * @param remotePath 远程路径
     * @param fileSize 文件大小
     * @param contentType 内容类型
     * @param options 上传选项
     * @private
     */
    private uploadLargeFile;
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
     * 构建公共访问URL
     * @param remotePath 远程路径
     * @private
     */
    private buildPublicUrl;
    /**
     * 规范化路径
     * @param remotePath 远程路径
     * @private
     */
    private normalizePath;
    /**
     * 将元数据转换为S3格式
     * @param metadata 元数据
     * @private
     */
    private convertMetadataToS3Format;
    /**
     * 将S3元数据转换为标准格式
     * @param metadata S3元数据
     * @private
     */
    private convertS3MetadataToFormat;
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
    /**
     * 确保目录存在
     * @param dirPath 目录路径
     * @private
     */
    private ensureDirectoryExists;
}
