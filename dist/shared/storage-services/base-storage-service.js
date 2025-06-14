"use strict";
/**
 * Base Storage Service - 基础存储服务
 *
 * 实现存储服务接口的通用功能
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
exports.BaseStorageService = void 0;
const path = __importStar(require("path"));
const base_service_1 = require("../mcp-core/base-service");
const types_1 = require("../mcp-core/types");
const logger_1 = require("../../utils/logger");
/**
 * 基础存储服务抽象类
 */
class BaseStorageService extends base_service_1.BaseService {
    /**
     * 构造函数
     * @param name 服务名称
     * @param version 服务版本
     * @param providerType 存储提供者类型
     * @param basePath 基础路径
     * @param config 服务配置
     */
    constructor(name, version, providerType, basePath = '', config = {}) {
        super(name, version, config);
        this.providerType = providerType;
        this.basePath = basePath;
        this.logger = new logger_1.Logger(`StorageService:${name}`);
    }
    /**
     * 获取存储提供者类型
     */
    getProviderType() {
        return this.providerType;
    }
    /**
     * 初始化存储服务
     */
    async initialize() {
        this.logger.info(`Initializing ${this.name} storage service`);
        try {
            // 执行特定提供者的初始化
            const initialized = await this.initializeProvider();
            if (initialized) {
                this.status = types_1.ServiceStatus.INITIALIZED;
                this.logger.info(`${this.name} storage service initialized successfully`);
            }
            else {
                this.status = types_1.ServiceStatus.ERROR;
                this.logger.error(`Failed to initialize ${this.name} storage service`);
            }
            return initialized;
        }
        catch (error) {
            this.logger.error(`Error initializing ${this.name} storage service`, { error: error instanceof Error ? error : String(error) });
            this.status = types_1.ServiceStatus.ERROR;
            return false;
        }
    }
    /**
     * 关闭存储服务
     */
    async shutdown() {
        this.logger.info(`Shutting down ${this.name} storage service`);
        try {
            // 执行特定提供者的关闭
            const shutdown = await this.shutdownProvider();
            if (shutdown) {
                this.status = types_1.ServiceStatus.STOPPED;
                this.logger.info(`${this.name} storage service shut down successfully`);
            }
            else {
                this.status = types_1.ServiceStatus.ERROR;
                this.logger.error(`Failed to shut down ${this.name} storage service`);
            }
            return shutdown;
        }
        catch (error) {
            this.logger.error(`Error shutting down ${this.name} storage service`, { error: error instanceof Error ? error : String(error) });
            this.status = types_1.ServiceStatus.ERROR;
            return false;
        }
    }
    /**
     * 处理MCP请求
     * @param request MCP请求
     */
    async handleRequest(request) {
        this.logger.info(`Handling request: ${request.action} for service ${this.name}`);
        // 检查服务状态
        if (this.status !== types_1.ServiceStatus.ACTIVE && this.status !== types_1.ServiceStatus.INITIALIZED) {
            return {
                id: request.id,
                requestId: request.id,
                service: this.name,
                version: this.version,
                action: request.action,
                status: 'error',
                error: {
                    code: types_1.MCPErrorCode.SERVICE_UNAVAILABLE,
                    message: `Service ${this.name} is not active (current status: ${this.status})`,
                },
                metadata: {
                    timestamp: new Date(),
                },
            };
        }
        try {
            // 这里应该根据请求的action分发到不同的处理方法
            // 由于存储服务的具体实现可能各不相同，这里只提供一个基本框架
            // 子类可以根据需要重写此方法
            return {
                id: request.id,
                requestId: request.id,
                service: this.name,
                version: this.version,
                action: request.action,
                status: 'error',
                error: {
                    code: types_1.MCPErrorCode.METHOD_NOT_FOUND,
                    message: `Action ${request.action} not implemented for service ${this.name}`,
                },
                metadata: {
                    timestamp: new Date(),
                },
            };
        }
        catch (error) {
            this.logger.error(`Error handling request: ${request.action}`, { error: error instanceof Error ? error : String(error) });
            return {
                id: request.id,
                requestId: request.id,
                service: this.name,
                version: this.version,
                action: request.action,
                status: 'error',
                error: {
                    code: types_1.MCPErrorCode.INTERNAL_ERROR,
                    message: `Internal error: ${error instanceof Error ? error.message : String(error)}`,
                },
                metadata: {
                    timestamp: new Date(),
                },
            };
        }
    }
    /**
     * 获取完整远程路径
     * @param remotePath 远程路径
     */
    getFullRemotePath(remotePath) {
        // 确保路径使用正斜杠
        const normalizedPath = remotePath.replace(/\\/g, '/');
        // 如果有基础路径，则合并
        if (this.basePath) {
            const normalizedBasePath = this.basePath.replace(/\\/g, '/');
            // 确保基础路径不以斜杠结尾，远程路径不以斜杠开头
            const baseWithoutTrailingSlash = normalizedBasePath.endsWith('/')
                ? normalizedBasePath.slice(0, -1)
                : normalizedBasePath;
            const remoteWithoutLeadingSlash = normalizedPath.startsWith('/')
                ? normalizedPath.slice(1)
                : normalizedPath;
            return `${baseWithoutTrailingSlash}/${remoteWithoutLeadingSlash}`;
        }
        return normalizedPath;
    }
    /**
     * 从完整路径获取相对路径
     * @param fullPath 完整路径
     */
    getRelativeRemotePath(fullPath) {
        // 确保路径使用正斜杠
        const normalizedPath = fullPath.replace(/\\/g, '/');
        // 如果有基础路径，则移除
        if (this.basePath) {
            const normalizedBasePath = this.basePath.replace(/\\/g, '/');
            // 确保基础路径以斜杠结尾
            const baseWithTrailingSlash = normalizedBasePath.endsWith('/')
                ? normalizedBasePath
                : `${normalizedBasePath}/`;
            if (normalizedPath.startsWith(baseWithTrailingSlash)) {
                return normalizedPath.slice(baseWithTrailingSlash.length);
            }
        }
        return normalizedPath;
    }
    /**
     * 获取文件名
     * @param remotePath 远程路径
     */
    getFileName(remotePath) {
        return path.basename(remotePath.replace(/\\/g, '/'));
    }
    /**
     * 获取目录名
     * @param remotePath 远程路径
     */
    getDirectoryName(remotePath) {
        const normalizedPath = remotePath.replace(/\\/g, '/');
        const dirPath = path.dirname(normalizedPath);
        return path.basename(dirPath);
    }
    /**
     * 获取父目录路径
     * @param remotePath 远程路径
     */
    getParentDirectoryPath(remotePath) {
        const normalizedPath = remotePath.replace(/\\/g, '/');
        return path.dirname(normalizedPath);
    }
    /**
     * 创建基本文件元数据
     * @param remotePath 远程路径
     * @param size 文件大小
     * @param mimeType MIME类型
     * @param isPublic 是否公开
     */
    createBasicFileMetadata(remotePath, size, mimeType, isPublic = false) {
        const now = new Date().toISOString();
        return {
            name: this.getFileName(remotePath),
            path: remotePath,
            size,
            mimeType,
            createdAt: now,
            updatedAt: now,
            isPublic,
        };
    }
    /**
     * 创建基本目录元数据
     * @param remotePath 远程路径
     * @param isPublic 是否公开
     */
    createBasicDirectoryMetadata(remotePath, isPublic = false) {
        const now = new Date().toISOString();
        return {
            name: this.getDirectoryName(remotePath),
            path: remotePath,
            createdAt: now,
            updatedAt: now,
            isPublic,
        };
    }
}
exports.BaseStorageService = BaseStorageService;
//# sourceMappingURL=base-storage-service.js.map