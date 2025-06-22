/**
 * Local Storage Service - 本地存储服务
 *
 * 基于文件系统的存储服务实现
 */
import { BaseStorageService } from './base-storage-service';
import { DocumentStorageResult, KnowledgeItemUpdate, KGUpdateResult, KGQueryResult, VersionHistory } from './storage.interface';
import { KnowledgeItem } from '../types/knowledge-item';
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
    constructor(config: LocalStorageConfig);
    updateKnowledgeGraph(entities: any[], relationships: any[]): Promise<KGUpdateResult>;
    queryKnowledgeGraph(query: string, params?: any): Promise<KGQueryResult>;
    trackVersion(documentId: string, changes: any, userId: string, summary?: string): Promise<VersionHistory>;
    getVersionHistory(documentId: string): Promise<VersionHistory[]>;
    storeItem(item: KnowledgeItem): Promise<DocumentStorageResult>;
    storeDocument(item: KnowledgeItem): Promise<DocumentStorageResult>;
    getDocument(id: string): Promise<KnowledgeItem | null>;
    updateDocument(id: string, updates: Partial<KnowledgeItemUpdate>): Promise<DocumentStorageResult>;
    deleteDocument(id: string): Promise<DocumentStorageResult>;
    private getPhysicalPath;
    private ensureDirectoryExists;
    getItem(id: string): Promise<KnowledgeItem | null>;
    updateItem(id: string, updates: KnowledgeItemUpdate): Promise<KnowledgeItem | null>;
    deleteItem(id: string): Promise<boolean>;
    listItems(options?: {
        limit?: number;
        offset?: number;
    }): Promise<KnowledgeItem[]>;
    searchItems(query: string, options?: {
        limit?: number;
    }): Promise<KnowledgeItem[]>;
    getInfo(): {
        id: string;
        name: string;
        version: string;
        status: import("../mcp-core/types").ServiceStatus;
        description: string;
    };
    uploadFile(localFilePath: string, remotePath: string, options?: any): Promise<any>;
    uploadData(data: Buffer | string, remotePath: string, options?: any): Promise<any>;
    downloadFile(remotePath: string, localFilePath: string, options?: any): Promise<any>;
    downloadData(remotePath: string, options?: any): Promise<{
        data: Buffer;
        metadata: any;
    }>;
    getFileMetadata(remotePath: string): Promise<any>;
    getDirectoryMetadata(remotePath: string): Promise<any>;
    fileExists(remotePath: string): Promise<boolean>;
    directoryExists(remotePath: string): Promise<boolean>;
    listDirectory(remotePath: string, options?: any): Promise<any>;
    createDirectory(remotePath: string, options?: {
        isPublic?: boolean;
    }): Promise<any>;
    deleteFile(remotePath: string): Promise<boolean>;
    deleteDirectory(remotePath: string, recursive?: boolean): Promise<boolean>;
    copyFile(sourceRemotePath: string, targetRemotePath: string, options?: any): Promise<any>;
    moveFile(sourceRemotePath: string, targetRemotePath: string, options?: any): Promise<any>;
    generateSignedUrl(remotePath: string, options: any): Promise<string>;
    getPublicUrl(remotePath: string): Promise<string | null>;
    setPublicAccess(remotePath: string, isPublic: boolean): Promise<any>;
    updateFileMetadata(remotePath: string, metadata: Partial<Record<string, string>>): Promise<any>;
    protected initializeProvider(): Promise<boolean>;
    protected shutdownProvider(): Promise<boolean>;
}
