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
const path = __importStar(require("path"));
const base_storage_service_1 = require("./base-storage-service");
const types_1 = require("./types");
/**
 * 本地存储服务实现
 */
class LocalStorageService extends base_storage_service_1.BaseStorageService {
    constructor(config) {
        const serviceConfig = {
            logLevel: 'info'
        };
        super('LocalStorageService', '1.0.0', types_1.StorageProviderType.LOCAL, config.rootDir, serviceConfig);
        this.config = config;
    }
    // KG methods are not implemented for local storage, they would typically
    // interface with a graph database like Neo4j.
    updateKnowledgeGraph(entities, relationships) {
        this.logger.warn('updateKnowledgeGraph is not implemented for LocalStorageService');
        return Promise.resolve({ success: false, errors: ['Not Implemented'] });
    }
    async queryKnowledgeGraph(query, params) {
        this.logger.warn('queryKnowledgeGraph is not implemented for LocalStorageService');
        return Promise.resolve({});
    }
    async trackVersion(documentId, changes, userId, summary) {
        this.logger.warn('trackVersion is not implemented for LocalStorageService');
        // In a real implementation, you would store version information.
        return Promise.reject(new Error('Not Implemented'));
    }
    async getVersionHistory(documentId) {
        this.logger.warn('getVersionHistory is not implemented for LocalStorageService');
        return Promise.resolve([]);
    }
    async storeItem(item) {
        const filePath = this.getPhysicalPath(`${item.id}.json`);
        try {
            await this.ensureDirectoryExists(path.dirname(filePath));
            await fs.writeFile(filePath, JSON.stringify(item, null, 2));
            return { status: 'success', storagePath: filePath };
        }
        catch (error) {
            return { status: 'error', error: error.message };
        }
    }
    async storeDocument(item) {
        return this.storeItem(item);
    }
    async getDocument(id) {
        return this.getItem(id);
    }
    async updateDocument(id, updates) {
        const updatedItem = await this.updateItem(id, updates);
        if (updatedItem) {
            return { status: 'success', storagePath: this.getPhysicalPath(`${id}.json`) };
        }
        return { status: 'error', error: 'Failed to update document' };
    }
    async deleteDocument(id) {
        const success = await this.deleteItem(id);
        if (success) {
            return { status: 'success', storagePath: this.getPhysicalPath(`${id}.json`) };
        }
        return { status: 'error', error: 'Failed to delete document' };
    }
    // Helper method to get physical path
    getPhysicalPath(relativePath) {
        return path.join(this.config.rootDir, relativePath);
    }
    // Helper method to ensure directory exists
    async ensureDirectoryExists(dirPath) {
        try {
            await fs.access(dirPath);
        }
        catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }
    // Required methods from IStorageService interface
    async getItem(id) {
        const filePath = this.getPhysicalPath(`${id}.json`);
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            this.logger.warn(`Item ${id} not found: ${error}`);
            return null;
        }
    }
    async updateItem(id, updates) {
        const item = await this.getItem(id);
        if (!item) {
            return null;
        }
        const updatedItem = { ...item, ...updates, updated: new Date().toISOString() };
        const result = await this.storeItem(updatedItem);
        if (result.status === 'success') {
            return updatedItem;
        }
        return null;
    }
    async deleteItem(id) {
        const filePath = this.getPhysicalPath(`${id}.json`);
        try {
            await fs.unlink(filePath);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete item ${id}: ${error}`);
            return false;
        }
    }
    async listItems(options) {
        try {
            const files = await fs.readdir(this.config.rootDir);
            const jsonFiles = files.filter(file => file.endsWith('.json'));
            const items = [];
            const limit = options?.limit || 100;
            const offset = options?.offset || 0;
            for (let i = offset; i < Math.min(offset + limit, jsonFiles.length); i++) {
                const file = jsonFiles[i];
                const id = path.basename(file, '.json');
                const item = await this.getItem(id);
                if (item) {
                    items.push(item);
                }
            }
            return items;
        }
        catch (error) {
            this.logger.error(`Failed to list items: ${error}`);
            return [];
        }
    }
    async searchItems(query, options) {
        const allItems = await this.listItems({ limit: 1000 });
        const searchTerm = query.toLowerCase();
        const matchingItems = allItems.filter(item => item.title.toLowerCase().includes(searchTerm) ||
            item.content.toLowerCase().includes(searchTerm));
        const limit = options?.limit || 50;
        return matchingItems.slice(0, limit);
    }
    getInfo() {
        return {
            id: this.name,
            name: this.name,
            version: this.version,
            status: this.getStatus(),
            description: 'Local file system storage service'
        };
    }
    // Implementation of abstract methods from BaseStorageService
    async uploadFile(localFilePath, remotePath, options) {
        const targetPath = this.getPhysicalPath(remotePath);
        await this.ensureDirectoryExists(path.dirname(targetPath));
        await fs.copyFile(localFilePath, targetPath);
        const stats = await fs.stat(targetPath);
        return {
            path: remotePath,
            size: stats.size,
            lastModified: stats.mtime,
            contentType: 'application/octet-stream'
        };
    }
    async uploadData(data, remotePath, options) {
        const targetPath = this.getPhysicalPath(remotePath);
        await this.ensureDirectoryExists(path.dirname(targetPath));
        await fs.writeFile(targetPath, data);
        const stats = await fs.stat(targetPath);
        return {
            path: remotePath,
            size: stats.size,
            lastModified: stats.mtime,
            contentType: 'application/octet-stream'
        };
    }
    async downloadFile(remotePath, localFilePath, options) {
        const sourcePath = this.getPhysicalPath(remotePath);
        await fs.copyFile(sourcePath, localFilePath);
        const stats = await fs.stat(sourcePath);
        return {
            path: remotePath,
            size: stats.size,
            lastModified: stats.mtime,
            contentType: 'application/octet-stream'
        };
    }
    async downloadData(remotePath, options) {
        const sourcePath = this.getPhysicalPath(remotePath);
        const data = await fs.readFile(sourcePath);
        const stats = await fs.stat(sourcePath);
        return {
            data,
            metadata: {
                path: remotePath,
                size: stats.size,
                lastModified: stats.mtime,
                contentType: 'application/octet-stream'
            }
        };
    }
    async getFileMetadata(remotePath) {
        const sourcePath = this.getPhysicalPath(remotePath);
        const stats = await fs.stat(sourcePath);
        return {
            path: remotePath,
            size: stats.size,
            lastModified: stats.mtime,
            contentType: 'application/octet-stream'
        };
    }
    async getDirectoryMetadata(remotePath) {
        const sourcePath = this.getPhysicalPath(remotePath);
        const stats = await fs.stat(sourcePath);
        return {
            path: remotePath,
            lastModified: stats.mtime,
            isDirectory: true
        };
    }
    async fileExists(remotePath) {
        try {
            const sourcePath = this.getPhysicalPath(remotePath);
            const stats = await fs.stat(sourcePath);
            return stats.isFile();
        }
        catch {
            return false;
        }
    }
    async directoryExists(remotePath) {
        try {
            const sourcePath = this.getPhysicalPath(remotePath);
            const stats = await fs.stat(sourcePath);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    async listDirectory(remotePath, options) {
        const sourcePath = this.getPhysicalPath(remotePath);
        const files = await fs.readdir(sourcePath, { withFileTypes: true });
        return {
            items: files.map(file => ({
                name: file.name,
                path: path.join(remotePath, file.name),
                isDirectory: file.isDirectory(),
                size: 0 // Would need additional stat call for actual size
            }))
        };
    }
    async createDirectory(remotePath, options) {
        const targetPath = this.getPhysicalPath(remotePath);
        await fs.mkdir(targetPath, { recursive: true });
        const stats = await fs.stat(targetPath);
        return {
            path: remotePath,
            lastModified: stats.mtime,
            isDirectory: true
        };
    }
    async deleteFile(remotePath) {
        try {
            const sourcePath = this.getPhysicalPath(remotePath);
            await fs.unlink(sourcePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async deleteDirectory(remotePath, recursive) {
        try {
            const sourcePath = this.getPhysicalPath(remotePath);
            await fs.rmdir(sourcePath, { recursive });
            return true;
        }
        catch {
            return false;
        }
    }
    async copyFile(sourceRemotePath, targetRemotePath, options) {
        const sourcePath = this.getPhysicalPath(sourceRemotePath);
        const targetPath = this.getPhysicalPath(targetRemotePath);
        await this.ensureDirectoryExists(path.dirname(targetPath));
        await fs.copyFile(sourcePath, targetPath);
        const stats = await fs.stat(targetPath);
        return {
            path: targetRemotePath,
            size: stats.size,
            lastModified: stats.mtime,
            contentType: 'application/octet-stream'
        };
    }
    async moveFile(sourceRemotePath, targetRemotePath, options) {
        const sourcePath = this.getPhysicalPath(sourceRemotePath);
        const targetPath = this.getPhysicalPath(targetRemotePath);
        await this.ensureDirectoryExists(path.dirname(targetPath));
        await fs.rename(sourcePath, targetPath);
        const stats = await fs.stat(targetPath);
        return {
            path: targetRemotePath,
            size: stats.size,
            lastModified: stats.mtime,
            contentType: 'application/octet-stream'
        };
    }
    async generateSignedUrl(remotePath, options) {
        // Local storage doesn't support signed URLs
        throw new Error('Signed URLs not supported for local storage');
    }
    async getPublicUrl(remotePath) {
        // Local storage doesn't support public URLs
        return null;
    }
    async setPublicAccess(remotePath, isPublic) {
        // Local storage doesn't support public access control
        const metadata = await this.getFileMetadata(remotePath);
        return metadata;
    }
    async updateFileMetadata(remotePath, metadata) {
        // Local storage doesn't support custom metadata
        const fileMetadata = await this.getFileMetadata(remotePath);
        return fileMetadata;
    }
    async initializeProvider() {
        await this.ensureDirectoryExists(this.config.rootDir);
        return true;
    }
    async shutdownProvider() {
        // No cleanup needed for local storage
        return true;
    }
}
exports.LocalStorageService = LocalStorageService;
//# sourceMappingURL=local-storage-service.js.map