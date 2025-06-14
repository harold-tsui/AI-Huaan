/**
 * Base Storage Service - 基础存储服务
 *
 * 实现存储服务接口的通用功能
 */
import { BaseService } from '../mcp-core/base-service';
import { ServiceConfig, MCPRequest, MCPResponse } from '../mcp-core/types';
import { CopyOptions, DirectoryMetadata, DownloadOptions, FileMetadata, IStorageService, ListOptions, ListResult, MoveOptions, SignedUrlOptions, StorageProviderType, UploadOptions } from './types';
/**
 * 基础存储服务抽象类
 */
export declare abstract class BaseStorageService extends BaseService implements IStorageService {
    protected providerType: StorageProviderType;
    protected basePath: string;
    /**
     * 构造函数
     * @param name 服务名称
     * @param version 服务版本
     * @param providerType 存储提供者类型
     * @param basePath 基础路径
     * @param config 服务配置
     */
    constructor(name: string, version: string, providerType: StorageProviderType, basePath?: string, config?: ServiceConfig);
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
     * 处理MCP请求
     * @param request MCP请求
     */
    handleRequest(request: MCPRequest): Promise<MCPResponse>;
    /**
     * 上传文件
     * @param localFilePath 本地文件路径
     * @param remotePath 远程路径
     * @param options 上传选项
     */
    abstract uploadFile(localFilePath: string, remotePath: string, options?: UploadOptions): Promise<FileMetadata>;
    /**
     * 上传数据
     * @param data 数据（Buffer或字符串）
     * @param remotePath 远程路径
     * @param options 上传选项
     */
    abstract uploadData(data: Buffer | string, remotePath: string, options?: UploadOptions): Promise<FileMetadata>;
    /**
     * 下载文件
     * @param remotePath 远程路径
     * @param localFilePath 本地文件路径
     * @param options 下载选项
     */
    abstract downloadFile(remotePath: string, localFilePath: string, options?: DownloadOptions): Promise<FileMetadata>;
    /**
     * 下载数据
     * @param remotePath 远程路径
     * @param options 下载选项
     */
    abstract downloadData(remotePath: string, options?: DownloadOptions): Promise<{
        data: Buffer;
        metadata: FileMetadata;
    }>;
    /**
     * 获取文件元数据
     * @param remotePath 远程路径
     */
    abstract getFileMetadata(remotePath: string): Promise<FileMetadata>;
    /**
     * 获取目录元数据
     * @param remotePath 远程路径
     */
    abstract getDirectoryMetadata(remotePath: string): Promise<DirectoryMetadata>;
    /**
     * 检查文件是否存在
     * @param remotePath 远程路径
     */
    abstract fileExists(remotePath: string): Promise<boolean>;
    /**
     * 检查目录是否存在
     * @param remotePath 远程路径
     */
    abstract directoryExists(remotePath: string): Promise<boolean>;
    /**
     * 列出目录内容
     * @param remotePath 远程路径
     * @param options 列表选项
     */
    abstract listDirectory(remotePath: string, options?: ListOptions): Promise<ListResult>;
    /**
     * 创建目录
     * @param remotePath 远程路径
     * @param options 选项
     */
    abstract createDirectory(remotePath: string, options?: {
        isPublic?: boolean;
    }): Promise<DirectoryMetadata>;
    /**
     * 删除文件
     * @param remotePath 远程路径
     */
    abstract deleteFile(remotePath: string): Promise<boolean>;
    /**
     * 删除目录
     * @param remotePath 远程路径
     * @param recursive 是否递归删除
     */
    abstract deleteDirectory(remotePath: string, recursive?: boolean): Promise<boolean>;
    /**
     * 复制文件
     * @param sourceRemotePath 源远程路径
     * @param targetRemotePath 目标远程路径
     * @param options 复制选项
     */
    abstract copyFile(sourceRemotePath: string, targetRemotePath: string, options?: CopyOptions): Promise<FileMetadata>;
    /**
     * 移动文件
     * @param sourceRemotePath 源远程路径
     * @param targetRemotePath 目标远程路径
     * @param options 移动选项
     */
    abstract moveFile(sourceRemotePath: string, targetRemotePath: string, options?: MoveOptions): Promise<FileMetadata>;
    /**
     * 生成签名URL
     * @param remotePath 远程路径
     * @param options 签名URL选项
     */
    abstract generateSignedUrl(remotePath: string, options: SignedUrlOptions): Promise<string>;
    /**
     * 获取公共URL
     * @param remotePath 远程路径
     */
    abstract getPublicUrl(remotePath: string): Promise<string | null>;
    /**
     * 设置文件公共访问权限
     * @param remotePath 远程路径
     * @param isPublic 是否公开
     */
    abstract setPublicAccess(remotePath: string, isPublic: boolean): Promise<FileMetadata>;
    /**
     * 更新文件元数据
     * @param remotePath 远程路径
     * @param metadata 元数据
     */
    abstract updateFileMetadata(remotePath: string, metadata: Partial<Record<string, string>>): Promise<FileMetadata>;
    /**
     * 初始化提供者
     * 子类应重写此方法以提供特定实现
     */
    protected abstract initializeProvider(): Promise<boolean>;
    /**
     * 关闭提供者
     * 子类应重写此方法以提供特定实现
     */
    protected abstract shutdownProvider(): Promise<boolean>;
    /**
     * 获取完整远程路径
     * @param remotePath 远程路径
     */
    protected getFullRemotePath(remotePath: string): string;
    /**
     * 从完整路径获取相对路径
     * @param fullPath 完整路径
     */
    protected getRelativeRemotePath(fullPath: string): string;
    /**
     * 获取文件名
     * @param remotePath 远程路径
     */
    protected getFileName(remotePath: string): string;
    /**
     * 获取目录名
     * @param remotePath 远程路径
     */
    protected getDirectoryName(remotePath: string): string;
    /**
     * 获取父目录路径
     * @param remotePath 远程路径
     */
    protected getParentDirectoryPath(remotePath: string): string;
    /**
     * 创建基本文件元数据
     * @param remotePath 远程路径
     * @param size 文件大小
     * @param mimeType MIME类型
     * @param isPublic 是否公开
     */
    protected createBasicFileMetadata(remotePath: string, size: number, mimeType: string, isPublic?: boolean): FileMetadata;
    /**
     * 创建基本目录元数据
     * @param remotePath 远程路径
     * @param isPublic 是否公开
     */
    protected createBasicDirectoryMetadata(remotePath: string, isPublic?: boolean): DirectoryMetadata;
}
