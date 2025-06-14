"use strict";
/**
 * Local Storage Service - 本地存储服务
 *
 * 基于文件系统的存储服务实现
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageService = void 0;
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const mime = __importStar(require("mime-types"));
const base_storage_service_1 = require("./base-storage-service");
const types_1 = require("./types");
/**
 * 本地存储服务实现
 */
class LocalStorageService extends base_storage_service_1.BaseStorageService {
    /**
     * 构造函数
     * @param config 配置
     */
    constructor(config) {
        super('local-storage', '1.0.0', types_1.StorageProviderType.LOCAL, '');
        this.initialized = false;
    }
    /**
     * 初始化提供者
     */
    async initializeProvider() {
        try {
            // 确保根目录存在
            await this.ensureDirectoryExists(this.config.rootDir);
            // 确保临时目录存在
            if (this.config.tempDir) {
                await this.ensureDirectoryExists(this.config.tempDir);
            }
            this.initialized = true;
            return true;
        }
        catch (error) {
            this.logger.error('Failed to initialize local storage provider', { error: error instanceof Error ? error.message : String(error) });
            return false;
        }
    }
    /**
     * 关闭提供者
     */
    async shutdownProvider() {
        // 本地存储不需要特殊关闭操作
        this.initialized = false;
        return true;
    }
    /**
     * 上传文件
     * @param localFilePath 本地文件路径
     * @param remotePath 远程路径
     * @param options 上传选项
     */
    async uploadFile(localFilePath, remotePath, options) {
        this.ensureInitialized();
        this.logger.info(`Uploading file from ${localFilePath} to ${remotePath}`);
        try {
            // 检查源文件是否存在
            await fs.access(localFilePath, fsSync.constants.R_OK);
            // 获取目标路径
            const targetPath = this.getPhysicalPath(remotePath);
            // 检查目标文件是否存在
            const targetExists = await this.fileExists(remotePath);
            if (targetExists && options?.overwrite !== true) {
                throw new Error(`File already exists at ${remotePath} and overwrite is not enabled`);
            }
            // 确保目标目录存在
            await this.ensureDirectoryExists(path.dirname(targetPath));
            // 复制文件
            await fs.copyFile(localFilePath, targetPath);
            // 获取文件信息
            const stats = await fs.stat(targetPath);
            const mimeType = options?.contentType || mime.lookup(targetPath) || 'application/octet-stream';
            // 创建元数据
            const metadata = {
                name: path.basename(remotePath),
                path: remotePath,
                size: stats.size,
                mimeType,
                createdAt: stats.birthtime.toISOString(),
                updatedAt: stats.mtime.toISOString(),
                isPublic: options?.isPublic || false,
                ...options?.metadata,
            };
            // 如果配置了基础URL且文件是公开的，添加URL
            if (this.config.baseUrl && options?.isPublic) {
                metadata.url = this.buildPublicUrl(remotePath);
            }
            return metadata;
        }
        catch (error) {
            this.logger.error(`Error uploading file to ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 上传数据
     * @param data 数据（Buffer或字符串）
     * @param remotePath 远程路径
     * @param options 上传选项
     */
    async uploadData(data, remotePath, options) {
        this.ensureInitialized();
        this.logger.info(`Uploading data to ${remotePath}`);
        try {
            // 获取目标路径
            const targetPath = this.getPhysicalPath(remotePath);
            // 检查目标文件是否存在
            const targetExists = await this.fileExists(remotePath);
            if (targetExists && options?.overwrite !== true) {
                throw new Error(`File already exists at ${remotePath} and overwrite is not enabled`);
            }
            // 确保目标目录存在
            await this.ensureDirectoryExists(path.dirname(targetPath));
            // 将数据写入文件
            const buffer = typeof data === 'string' ? Buffer.from(data) : data;
            await fs.writeFile(targetPath, buffer);
            // 获取文件信息
            const stats = await fs.stat(targetPath);
            const mimeType = options?.contentType || mime.lookup(targetPath) || 'application/octet-stream';
            // 创建元数据
            const metadata = {
                name: path.basename(remotePath),
                path: remotePath,
                size: stats.size,
                mimeType,
                createdAt: stats.birthtime.toISOString(),
                updatedAt: stats.mtime.toISOString(),
                isPublic: options?.isPublic || false,
                ...options?.metadata,
            };
            // 如果配置了基础URL且文件是公开的，添加URL
            if (this.config.baseUrl && options?.isPublic) {
                metadata.url = this.buildPublicUrl(remotePath);
            }
            return metadata;
        }
        catch (error) {
            this.logger.error(`Error uploading data to ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to upload data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 下载文件
     * @param remotePath 远程路径
     * @param localFilePath 本地文件路径
     * @param options 下载选项
     */
    async downloadFile(remotePath, localFilePath, options) {
        this.ensureInitialized();
        this.logger.info(`Downloading file from ${remotePath} to ${localFilePath}`);
        try {
            // 获取源文件路径
            const sourcePath = this.getPhysicalPath(remotePath);
            // 检查源文件是否存在
            if (!await this.fileExists(remotePath)) {
                throw new Error(`File does not exist at ${remotePath}`);
            }
            // 获取文件元数据
            const metadata = await this.getFileMetadata(remotePath);
            // 如果指定了条件下载
            if (options?.ifModifiedSince) {
                const modifiedSince = options.ifModifiedSince.getTime();
                const lastModified = new Date(metadata.updatedAt).getTime();
                if (lastModified <= modifiedSince) {
                    // 文件未修改，返回元数据但不复制文件
                    return metadata;
                }
            }
            // 确保目标目录存在
            await this.ensureDirectoryExists(path.dirname(localFilePath));
            // 如果指定了字节范围
            if (options?.range) {
                // 创建读取流和写入流
                const readStream = fsSync.createReadStream(sourcePath, {
                    start: options.range.start,
                    end: options.range.end,
                });
                const writeStream = fsSync.createWriteStream(localFilePath);
                // 使用管道复制数据
                await new Promise((resolve, reject) => {
                    readStream.pipe(writeStream)
                        .on('finish', resolve)
                        .on('error', reject);
                });
            }
            else {
                // 复制整个文件
                await fs.copyFile(sourcePath, localFilePath);
            }
            return metadata;
        }
        catch (error) {
            this.logger.error(`Error downloading file from ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to download file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 下载数据
     * @param remotePath 远程路径
     * @param options 下载选项
     */
    async downloadData(remotePath, options) {
        this.ensureInitialized();
        this.logger.info(`Downloading data from ${remotePath}`);
        try {
            // 获取源文件路径
            const sourcePath = this.getPhysicalPath(remotePath);
            // 检查源文件是否存在
            if (!await this.fileExists(remotePath)) {
                throw new Error(`File does not exist at ${remotePath}`);
            }
            // 获取文件元数据
            const metadata = await this.getFileMetadata(remotePath);
            // 如果指定了条件下载
            if (options?.ifModifiedSince) {
                const modifiedSince = options.ifModifiedSince.getTime();
                const lastModified = new Date(metadata.updatedAt).getTime();
                if (lastModified <= modifiedSince) {
                    // 文件未修改，返回空数据和元数据
                    return { data: Buffer.alloc(0), metadata };
                }
            }
            // 如果指定了字节范围
            if (options?.range) {
                // 读取部分文件内容
                const fileHandle = await fs.open(sourcePath, 'r');
                try {
                    const start = options.range.start;
                    const end = options.range.end !== undefined ? options.range.end : metadata.size - 1;
                    const length = end - start + 1;
                    const buffer = Buffer.alloc(length);
                    const { bytesRead } = await fileHandle.read(buffer, 0, length, start);
                    return { data: buffer.slice(0, bytesRead), metadata };
                }
                finally {
                    await fileHandle.close();
                }
            }
            else {
                // 读取整个文件内容
                const data = await fs.readFile(sourcePath);
                return { data, metadata };
            }
        }
        catch (error) {
            this.logger.error(`Error downloading data from ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to download data: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 获取文件元数据
     * @param remotePath 远程路径
     */
    async getFileMetadata(remotePath) {
        this.ensureInitialized();
        this.logger.info(`Getting file metadata for ${remotePath}`);
        try {
            // 获取物理路径
            const physicalPath = this.getPhysicalPath(remotePath);
            // 检查文件是否存在
            await fs.access(physicalPath, fsSync.constants.F_OK);
            // 获取文件状态
            const stats = await fs.stat(physicalPath);
            // 检查是否为文件
            if (!stats.isFile()) {
                throw new Error(`Path ${remotePath} is not a file`);
            }
            // 创建元数据
            const metadata = {
                name: path.basename(remotePath),
                path: remotePath,
                size: stats.size,
                mimeType: mime.lookup(physicalPath) || 'application/octet-stream',
                createdAt: stats.birthtime.toISOString(),
                updatedAt: stats.mtime.toISOString(),
                isPublic: false, // 默认为非公开
            };
            // 如果配置了基础URL，检查文件是否公开
            if (this.config.baseUrl) {
                // 实际实现中，应从某处获取文件的公开状态
                // 这里简单地假设所有文件都是非公开的
            }
            return metadata;
        }
        catch (error) {
            this.logger.error(`Error getting file metadata for ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 获取目录元数据
     * @param remotePath 远程路径
     */
    async getDirectoryMetadata(remotePath) {
        this.ensureInitialized();
        this.logger.info(`Getting directory metadata for ${remotePath}`);
        try {
            // 获取物理路径
            const physicalPath = this.getPhysicalPath(remotePath);
            // 检查目录是否存在
            await fs.access(physicalPath, fsSync.constants.F_OK);
            // 获取目录状态
            const stats = await fs.stat(physicalPath);
            // 检查是否为目录
            if (!stats.isDirectory()) {
                throw new Error(`Path ${remotePath} is not a directory`);
            }
            // 创建元数据
            const metadata = {
                name: path.basename(remotePath) || '/', // 根目录的basename是空字符串
                path: remotePath,
                createdAt: stats.birthtime.toISOString(),
                updatedAt: stats.mtime.toISOString(),
                isPublic: false, // 默认为非公开
            };
            return metadata;
        }
        catch (error) {
            this.logger.error(`Error getting directory metadata for ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to get directory metadata: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 检查文件是否存在
     * @param remotePath 远程路径
     */
    async fileExists(remotePath) {
        this.ensureInitialized();
        try {
            // 获取物理路径
            const physicalPath = this.getPhysicalPath(remotePath);
            // 检查路径是否存在
            await fs.access(physicalPath, fsSync.constants.F_OK);
            // 检查是否为文件
            const stats = await fs.stat(physicalPath);
            return stats.isFile();
        }
        catch (error) {
            return false;
        }
    }
    /**
     * 检查目录是否存在
     * @param remotePath 远程路径
     */
    async directoryExists(remotePath) {
        this.ensureInitialized();
        try {
            // 获取物理路径
            const physicalPath = this.getPhysicalPath(remotePath);
            // 检查路径是否存在
            await fs.access(physicalPath, fsSync.constants.F_OK);
            // 检查是否为目录
            const stats = await fs.stat(physicalPath);
            return stats.isDirectory();
        }
        catch (error) {
            return false;
        }
    }
    /**
     * 列出目录内容
     * @param remotePath 远程路径
     * @param options 列表选项
     */
    async listDirectory(remotePath, options) {
        this.ensureInitialized();
        this.logger.info(`Listing directory ${remotePath}`);
        try {
            // 获取物理路径
            const physicalPath = this.getPhysicalPath(remotePath);
            // 检查目录是否存在
            if (!await this.directoryExists(remotePath)) {
                throw new Error(`Directory does not exist at ${remotePath}`);
            }
            // 读取目录内容
            const entries = await fs.readdir(physicalPath, { withFileTypes: true });
            // 过滤和处理结果
            const items = [];
            const prefixes = [];
            // 应用前缀过滤
            const prefix = options?.prefix || '';
            const delimiter = options?.delimiter || '/';
            for (const entry of entries) {
                const entryName = entry.name;
                // 跳过以点开头的隐藏文件和目录
                if (entryName.startsWith('.')) {
                    continue;
                }
                // 应用前缀过滤
                if (prefix && !entryName.startsWith(prefix)) {
                    continue;
                }
                const entryPath = path.join(remotePath, entryName).replace(/\\/g, '/');
                if (entry.isDirectory()) {
                    // 处理目录
                    if (options?.recursive) {
                        // 递归列出子目录
                        const subResult = await this.listDirectory(entryPath, options);
                        items.push(...subResult.items);
                        prefixes.push(...(subResult.prefixes || []));
                    }
                    else if (delimiter) {
                        // 使用分隔符模式，将目录添加到前缀列表
                        prefixes.push(`${entryPath}${delimiter}`);
                    }
                    else {
                        // 将目录添加到项目列表
                        const dirMetadata = await this.getDirectoryMetadata(entryPath);
                        items.push({
                            type: types_1.StorageItemType.DIRECTORY,
                            metadata: dirMetadata,
                        });
                    }
                }
                else if (entry.isFile()) {
                    // 处理文件
                    const fileMetadata = await this.getFileMetadata(entryPath);
                    items.push({
                        type: types_1.StorageItemType.FILE,
                        metadata: fileMetadata,
                    });
                }
            }
            // 应用最大结果数限制
            const maxResults = options?.maxResults || Number.MAX_SAFE_INTEGER;
            const limitedItems = items.slice(0, maxResults);
            return {
                items: limitedItems,
                prefixes: prefixes.length > 0 ? prefixes : undefined,
            };
        }
        catch (error) {
            this.logger.error(`Error listing directory ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to list directory: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 创建目录
     * @param remotePath 远程路径
     * @param options 选项
     */
    async createDirectory(remotePath, options) {
        this.ensureInitialized();
        this.logger.info(`Creating directory ${remotePath}`);
        try {
            // 获取物理路径
            const physicalPath = this.getPhysicalPath(remotePath);
            // 创建目录
            await this.ensureDirectoryExists(physicalPath);
            // 获取目录元数据
            const stats = await fs.stat(physicalPath);
            // 创建元数据
            const metadata = {
                name: path.basename(remotePath) || '/', // 根目录的basename是空字符串
                path: remotePath,
                createdAt: stats.birthtime.toISOString(),
                updatedAt: stats.mtime.toISOString(),
                isPublic: options?.isPublic || false,
            };
            return metadata;
        }
        catch (error) {
            this.logger.error(`Error creating directory ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to create directory: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 删除文件
     * @param remotePath 远程路径
     */
    async deleteFile(remotePath) {
        this.ensureInitialized();
        this.logger.info(`Deleting file ${remotePath}`);
        try {
            // 获取物理路径
            const physicalPath = this.getPhysicalPath(remotePath);
            // 检查文件是否存在
            if (!await this.fileExists(remotePath)) {
                // 文件不存在，视为删除成功
                return true;
            }
            // 删除文件
            await fs.unlink(physicalPath);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting file ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 删除目录
     * @param remotePath 远程路径
     * @param recursive 是否递归删除
     */
    async deleteDirectory(remotePath, recursive = false) {
        this.ensureInitialized();
        this.logger.info(`Deleting directory ${remotePath} (recursive: ${recursive})`);
        try {
            // 获取物理路径
            const physicalPath = this.getPhysicalPath(remotePath);
            // 检查目录是否存在
            if (!await this.directoryExists(remotePath)) {
                // 目录不存在，视为删除成功
                return true;
            }
            if (recursive) {
                // 递归删除目录及其内容
                await this.recursiveDeleteDirectory(physicalPath);
            }
            else {
                // 检查目录是否为空
                const entries = await fs.readdir(physicalPath);
                if (entries.length > 0) {
                    throw new Error(`Directory ${remotePath} is not empty and recursive deletion is not enabled`);
                }
                // 删除空目录
                await fs.rmdir(physicalPath);
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting directory ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to delete directory: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 复制文件
     * @param sourceRemotePath 源远程路径
     * @param targetRemotePath 目标远程路径
     * @param options 复制选项
     */
    async copyFile(sourceRemotePath, targetRemotePath, options) {
        this.ensureInitialized();
        this.logger.info(`Copying file from ${sourceRemotePath} to ${targetRemotePath}`);
        try {
            // 获取源文件和目标文件的物理路径
            const sourcePhysicalPath = this.getPhysicalPath(sourceRemotePath);
            const targetPhysicalPath = this.getPhysicalPath(targetRemotePath);
            // 检查源文件是否存在
            if (!await this.fileExists(sourceRemotePath)) {
                throw new Error(`Source file does not exist at ${sourceRemotePath}`);
            }
            // 检查目标文件是否存在
            const targetExists = await this.fileExists(targetRemotePath);
            if (targetExists && options?.overwrite !== true) {
                throw new Error(`Target file already exists at ${targetRemotePath} and overwrite is not enabled`);
            }
            // 确保目标目录存在
            await this.ensureDirectoryExists(path.dirname(targetPhysicalPath));
            // 复制文件
            await fs.copyFile(sourcePhysicalPath, targetPhysicalPath);
            // 获取文件元数据
            const metadata = await this.getFileMetadata(targetRemotePath);
            // 更新元数据
            if (options?.metadata) {
                Object.assign(metadata, options.metadata);
            }
            // 设置公共访问权限
            if (options?.isPublic !== undefined) {
                metadata.isPublic = options.isPublic;
                if (options.isPublic && this.config.baseUrl) {
                    metadata.url = this.buildPublicUrl(targetRemotePath);
                }
                else {
                    delete metadata.url;
                }
            }
            return metadata;
        }
        catch (error) {
            this.logger.error(`Error copying file from ${sourceRemotePath} to ${targetRemotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 移动文件
     * @param sourceRemotePath 源远程路径
     * @param targetRemotePath 目标远程路径
     * @param options 移动选项
     */
    async moveFile(sourceRemotePath, targetRemotePath, options) {
        this.ensureInitialized();
        this.logger.info(`Moving file from ${sourceRemotePath} to ${targetRemotePath}`);
        try {
            // 获取源文件和目标文件的物理路径
            const sourcePhysicalPath = this.getPhysicalPath(sourceRemotePath);
            const targetPhysicalPath = this.getPhysicalPath(targetRemotePath);
            // 检查源文件是否存在
            if (!await this.fileExists(sourceRemotePath)) {
                throw new Error(`Source file does not exist at ${sourceRemotePath}`);
            }
            // 检查目标文件是否存在
            const targetExists = await this.fileExists(targetRemotePath);
            if (targetExists && options?.overwrite !== true) {
                throw new Error(`Target file already exists at ${targetRemotePath} and overwrite is not enabled`);
            }
            // 确保目标目录存在
            await this.ensureDirectoryExists(path.dirname(targetPhysicalPath));
            // 移动文件
            await fs.rename(sourcePhysicalPath, targetPhysicalPath);
            // 获取文件元数据
            const metadata = await this.getFileMetadata(targetRemotePath);
            return metadata;
        }
        catch (error) {
            this.logger.error(`Error moving file from ${sourceRemotePath} to ${targetRemotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to move file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 生成签名URL
     * @param remotePath 远程路径
     * @param options 签名URL选项
     */
    async generateSignedUrl(remotePath, options) {
        this.ensureInitialized();
        this.logger.info(`Generating signed URL for ${remotePath}`);
        try {
            // 检查文件是否存在
            if (!await this.fileExists(remotePath)) {
                throw new Error(`File does not exist at ${remotePath}`);
            }
            // 如果没有配置基础URL，无法生成签名URL
            if (!this.config.baseUrl) {
                throw new Error('Base URL is not configured, cannot generate signed URL');
            }
            // 计算过期时间
            const expiresAt = Math.floor(Date.now() / 1000) + options.expiration;
            // 创建签名数据
            const signatureData = {
                path: remotePath,
                method: options.method || 'GET',
                expiresAt,
                contentType: options.contentType,
                responseDisposition: options.responseDisposition,
                responseType: options.responseType,
            };
            // 生成签名
            const signature = this.generateSignature(signatureData);
            // 构建URL
            const baseUrl = this.config.baseUrl.endsWith('/') ? this.config.baseUrl : `${this.config.baseUrl}/`;
            const encodedPath = encodeURIComponent(remotePath);
            const url = new URL(`${baseUrl}${encodedPath}`);
            // 添加查询参数
            url.searchParams.append('signature', signature);
            url.searchParams.append('expires', expiresAt.toString());
            if (options.method && options.method !== 'GET') {
                url.searchParams.append('method', options.method);
            }
            if (options.contentType) {
                url.searchParams.append('content-type', options.contentType);
            }
            if (options.responseDisposition) {
                url.searchParams.append('response-disposition', options.responseDisposition);
            }
            if (options.responseType) {
                url.searchParams.append('response-type', options.responseType);
            }
            return url.toString();
        }
        catch (error) {
            this.logger.error(`Error generating signed URL for ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 获取公共URL
     * @param remotePath 远程路径
     */
    async getPublicUrl(remotePath) {
        this.ensureInitialized();
        try {
            // 检查文件是否存在
            if (!await this.fileExists(remotePath)) {
                return null;
            }
            // 获取文件元数据
            const metadata = await this.getFileMetadata(remotePath);
            // 检查文件是否公开
            if (!metadata.isPublic) {
                return null;
            }
            // 如果没有配置基础URL，无法生成公共URL
            if (!this.config.baseUrl) {
                return null;
            }
            // 构建URL
            return this.buildPublicUrl(remotePath);
        }
        catch (error) {
            this.logger.error(`Error getting public URL for ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            return null;
        }
    }
    /**
     * 设置文件公共访问权限
     * @param remotePath 远程路径
     * @param isPublic 是否公开
     */
    async setPublicAccess(remotePath, isPublic) {
        this.ensureInitialized();
        this.logger.info(`Setting public access for ${remotePath} to ${isPublic}`);
        try {
            // 检查文件是否存在
            if (!await this.fileExists(remotePath)) {
                throw new Error(`File does not exist at ${remotePath}`);
            }
            // 获取文件元数据
            const metadata = await this.getFileMetadata(remotePath);
            // 更新公共访问权限
            metadata.isPublic = isPublic;
            // 更新URL
            if (isPublic && this.config.baseUrl) {
                metadata.url = this.buildPublicUrl(remotePath);
            }
            else {
                delete metadata.url;
            }
            // 实际实现中，应将更新后的元数据保存到某处
            return metadata;
        }
        catch (error) {
            this.logger.error(`Error setting public access for ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to set public access: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 更新文件元数据
     * @param remotePath 远程路径
     * @param metadata 元数据
     */
    async updateFileMetadata(remotePath, metadata) {
        this.ensureInitialized();
        this.logger.info(`Updating metadata for ${remotePath}`);
        try {
            // 检查文件是否存在
            if (!await this.fileExists(remotePath)) {
                throw new Error(`File does not exist at ${remotePath}`);
            }
            // 获取现有元数据
            const existingMetadata = await this.getFileMetadata(remotePath);
            // 更新元数据
            Object.assign(existingMetadata, metadata);
            // 实际实现中，应将更新后的元数据保存到某处
            return existingMetadata;
        }
        catch (error) {
            this.logger.error(`Error updating metadata for ${remotePath}`, { error: error instanceof Error ? error.message : String(error) });
            throw new Error(`Failed to update metadata: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 获取物理路径
     * @param remotePath 远程路径
     */
    getPhysicalPath(remotePath) {
        // 规范化路径
        const normalizedPath = remotePath.replace(/^\//g, '').replace(/\\/g, '/');
        return path.join(this.config.rootDir, normalizedPath);
    }
    /**
     * 确保目录存在
     * @param dirPath 目录路径
     */
    async ensureDirectoryExists(dirPath) {
        try {
            await fs.access(dirPath, fsSync.constants.F_OK);
            // 目录已存在
        }
        catch (error) {
            // 目录不存在，创建它
            if (this.config.createDirs) {
                await fs.mkdir(dirPath, { recursive: true });
            }
            else {
                throw new Error(`Directory ${dirPath} does not exist and automatic creation is disabled`);
            }
        }
    }
    /**
     * 递归删除目录
     * @param dirPath 目录路径
     */
    async recursiveDeleteDirectory(dirPath) {
        // 使用fs.rm的recursive选项递归删除目录
        await fs.rm(dirPath, { recursive: true, force: true });
    }
    /**
     * 构建公共URL
     * @param remotePath 远程路径
     */
    buildPublicUrl(remotePath) {
        if (!this.config.baseUrl) {
            return '';
        }
        const baseUrl = this.config.baseUrl.endsWith('/') ? this.config.baseUrl : `${this.config.baseUrl}/`;
        const encodedPath = encodeURIComponent(remotePath);
        return `${baseUrl}${encodedPath}`;
    }
    /**
     * 生成签名
     * @param data 签名数据
     */
    generateSignature(data) {
        const jsonData = JSON.stringify(data);
        const hmac = crypto.createHmac('sha256', this.config.signedUrlSecret || '');
        hmac.update(jsonData);
        return hmac.digest('hex');
    }
    /**
     * 确保服务已初始化
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('Local storage service is not initialized');
        }
    }
}
exports.LocalStorageService = LocalStorageService;
//# sourceMappingURL=local-storage-service.js.map