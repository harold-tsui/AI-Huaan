/**
 * Local Storage Service - 本地存储服务
 *
 * 基于文件系统的存储服务实现
 */
import { BaseStorageService } from './base-storage-service';
import { CopyOptions, DirectoryMetadata, DownloadOptions, FileMetadata, ListOptions, ListResult, MoveOptions, SignedUrlOptions, UploadOptions } from './types';
/**
 * 本地存储服务配置
 */
export interface LocalStorageConfig {
    rootDir: string;
    baseUrl?: string;
    createDirs?: boolean;
    tempDir?: string;
    signedUrlSecret?: string;
}
/**
 * 本地存储服务实现
 */
export declare class LocalStorageService extends BaseStorageService {
    protected config: LocalStorageConfig;
    private initialized;
    /**
     * 构造函数
     * @param config 配置
     */
    constructor(config: LocalStorageConfig);
    /**
     * 初始化提供者
     */
    protected initializeProvider(): Promise<boolean>;
    /**
     * 关闭提供者
     */
    protected shutdownProvider(): Promise<boolean>;
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
    /**
     * 获取物理路径
     * @param remotePath 远程路径
     */
    private getPhysicalPath;
    /**
     * 确保目录存在
     * @param dirPath 目录路径
     */
    private ensureDirectoryExists;
    /**
     * 递归删除目录
     * @param dirPath 目录路径
     */
    private recursiveDeleteDirectory;
    /**
     * 构建公共URL
     * @param remotePath 远程路径
     */
    private buildPublicUrl;
    /**
     * 生成签名
     * @param data 签名数据
     */
    private generateSignature;
    /**
     * 确保服务已初始化
     */
    private ensureInitialized;
}
