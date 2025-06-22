/**
 * Local Storage Service - 本地存储服务
 * 
 * 基于文件系统的存储服务实现
 */

import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as mime from 'mime-types';
import { BaseStorageService } from './base-storage-service';
import { IStorageService, DocumentStorageResult, KnowledgeItemUpdate, KGUpdateResult, KGQueryResult, VersionHistory } from './storage.interface';
import { KnowledgeItem } from '../types/knowledge-item';
import { ServiceConfig } from '../mcp-core/types';
import { StorageProviderType, FileMetadata, DirectoryMetadata } from './types';

/**
 * 本地存储服务配置
 */
export interface LocalStorageConfig {
  rootDir: string;           // 根目录
  baseUrl?: string;          // 基础URL（用于公共访问）
  createDirs?: boolean;      // 是否自动创建目录
  tempDir?: string;          // 临时目录
  signedUrlSecret?: string;  // 签名URL密钥
}

/**
 * 本地存储服务实现
 */
export class LocalStorageService extends BaseStorageService {
  protected config: LocalStorageConfig;

  constructor(config: LocalStorageConfig) {
    const serviceConfig: ServiceConfig = {
      logLevel: 'info'
    };
    super('LocalStorageService', '1.0.0', StorageProviderType.LOCAL, config.rootDir, serviceConfig);
    this.config = config;
  }

  // KG methods are not implemented for local storage, they would typically
  // interface with a graph database like Neo4j.
  updateKnowledgeGraph(entities: any[], relationships: any[]): Promise<KGUpdateResult> {
    this.logger.warn('updateKnowledgeGraph is not implemented for LocalStorageService');
    return Promise.resolve({ success: false, errors: ['Not Implemented'] });
  }

  async queryKnowledgeGraph(query: string, params?: any): Promise<KGQueryResult> {
    this.logger.warn('queryKnowledgeGraph is not implemented for LocalStorageService');
    return Promise.resolve({});
  }

  async trackVersion(documentId: string, changes: any, userId: string, summary?: string): Promise<VersionHistory> {
    this.logger.warn('trackVersion is not implemented for LocalStorageService');
    // In a real implementation, you would store version information.
    return Promise.reject(new Error('Not Implemented'));
  }

  async getVersionHistory(documentId: string): Promise<VersionHistory[]> {
    this.logger.warn('getVersionHistory is not implemented for LocalStorageService');
    return Promise.resolve([]);
  }

  async storeItem(item: KnowledgeItem): Promise<DocumentStorageResult> {
    const filePath = this.getPhysicalPath(`${item.id}.json`);
    try {
      await this.ensureDirectoryExists(path.dirname(filePath));
      await fs.writeFile(filePath, JSON.stringify(item, null, 2));
      return { status: 'success', storagePath: filePath };
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  async storeDocument(item: KnowledgeItem): Promise<DocumentStorageResult> {
    return this.storeItem(item);
  }

  async getDocument(id: string): Promise<KnowledgeItem | null> {
    return this.getItem(id);
  }

  async updateDocument(id: string, updates: Partial<KnowledgeItemUpdate>): Promise<DocumentStorageResult> {
    const updatedItem = await this.updateItem(id, updates);
    if (updatedItem) {
      return { status: 'success', storagePath: this.getPhysicalPath(`${id}.json`) };
    }
    return { status: 'error', error: 'Failed to update document' };
  }

  async deleteDocument(id: string): Promise<DocumentStorageResult> {
    const success = await this.deleteItem(id);
    if (success) {
      return { status: 'success', storagePath: this.getPhysicalPath(`${id}.json`) };
    }
    return { status: 'error', error: 'Failed to delete document' };
  }

  // Helper method to get physical path
  private getPhysicalPath(relativePath: string): string {
    return path.join(this.config.rootDir, relativePath);
  }

  // Helper method to ensure directory exists
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  // Required methods from IStorageService interface
  async getItem(id: string): Promise<KnowledgeItem | null> {
    const filePath = this.getPhysicalPath(`${id}.json`);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as KnowledgeItem;
    } catch (error) {
      this.logger.warn(`Item ${id} not found: ${error}`);
      return null;
    }
  }

  async updateItem(id: string, updates: KnowledgeItemUpdate): Promise<KnowledgeItem | null> {
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

  async deleteItem(id: string): Promise<boolean> {
    const filePath = this.getPhysicalPath(`${id}.json`);
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete item ${id}: ${error}`);
      return false;
    }
  }

  async listItems(options?: { limit?: number; offset?: number }): Promise<KnowledgeItem[]> {
    try {
      const files = await fs.readdir(this.config.rootDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      const items: KnowledgeItem[] = [];
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
    } catch (error) {
      this.logger.error(`Failed to list items: ${error}`);
      return [];
    }
  }

  async searchItems(query: string, options?: { limit?: number }): Promise<KnowledgeItem[]> {
    const allItems = await this.listItems({ limit: 1000 });
    const searchTerm = query.toLowerCase();
    
    const matchingItems = allItems.filter(item => 
      item.title.toLowerCase().includes(searchTerm) ||
      item.content.toLowerCase().includes(searchTerm)
    );
    
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
  async uploadFile(localFilePath: string, remotePath: string, options?: any): Promise<any> {
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

  async uploadData(data: Buffer | string, remotePath: string, options?: any): Promise<any> {
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

  async downloadFile(remotePath: string, localFilePath: string, options?: any): Promise<any> {
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

  async downloadData(remotePath: string, options?: any): Promise<{ data: Buffer; metadata: any }> {
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

  async getFileMetadata(remotePath: string): Promise<any> {
    const sourcePath = this.getPhysicalPath(remotePath);
    const stats = await fs.stat(sourcePath);
    return {
      path: remotePath,
      size: stats.size,
      lastModified: stats.mtime,
      contentType: 'application/octet-stream'
    };
  }

  async getDirectoryMetadata(remotePath: string): Promise<any> {
    const sourcePath = this.getPhysicalPath(remotePath);
    const stats = await fs.stat(sourcePath);
    return {
      path: remotePath,
      lastModified: stats.mtime,
      isDirectory: true
    };
  }

  async fileExists(remotePath: string): Promise<boolean> {
    try {
      const sourcePath = this.getPhysicalPath(remotePath);
      const stats = await fs.stat(sourcePath);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  async directoryExists(remotePath: string): Promise<boolean> {
    try {
      const sourcePath = this.getPhysicalPath(remotePath);
      const stats = await fs.stat(sourcePath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async listDirectory(remotePath: string, options?: any): Promise<any> {
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

  async createDirectory(remotePath: string, options?: { isPublic?: boolean }): Promise<any> {
    const targetPath = this.getPhysicalPath(remotePath);
    await fs.mkdir(targetPath, { recursive: true });
    const stats = await fs.stat(targetPath);
    return {
      path: remotePath,
      lastModified: stats.mtime,
      isDirectory: true
    };
  }

  async deleteFile(remotePath: string): Promise<boolean> {
    try {
      const sourcePath = this.getPhysicalPath(remotePath);
      await fs.unlink(sourcePath);
      return true;
    } catch {
      return false;
    }
  }

  async deleteDirectory(remotePath: string, recursive?: boolean): Promise<boolean> {
    try {
      const sourcePath = this.getPhysicalPath(remotePath);
      await fs.rmdir(sourcePath, { recursive });
      return true;
    } catch {
      return false;
    }
  }

  async copyFile(sourceRemotePath: string, targetRemotePath: string, options?: any): Promise<any> {
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

  async moveFile(sourceRemotePath: string, targetRemotePath: string, options?: any): Promise<any> {
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

  async generateSignedUrl(remotePath: string, options: any): Promise<string> {
    // Local storage doesn't support signed URLs
    throw new Error('Signed URLs not supported for local storage');
  }

  async getPublicUrl(remotePath: string): Promise<string | null> {
    // Local storage doesn't support public URLs
    return null;
  }

  async setPublicAccess(remotePath: string, isPublic: boolean): Promise<any> {
    // Local storage doesn't support public access control
    const metadata = await this.getFileMetadata(remotePath);
    return metadata;
  }

  async updateFileMetadata(remotePath: string, metadata: Partial<Record<string, string>>): Promise<any> {
    // Local storage doesn't support custom metadata
    const fileMetadata = await this.getFileMetadata(remotePath);
    return fileMetadata;
  }

  protected async initializeProvider(): Promise<boolean> {
    await this.ensureDirectoryExists(this.config.rootDir);
    return true;
  }

  protected async shutdownProvider(): Promise<boolean> {
    // No cleanup needed for local storage
    return true;
  }
}