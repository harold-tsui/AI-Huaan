/**
 * Storage Services Module - 存储服务模块
 *
 * 提供文件存储服务的统一接口和实现
 */
export * from './types';
export { BaseStorageService } from './base-storage-service';
export { LocalStorageService } from './local-storage-service';
export { S3StorageService } from './s3-storage-service';
export declare const STORAGE_SERVICES_VERSION = "1.0.0";
import { IStorageService, StorageProviderType } from './types';
export declare let globalStorageService: IStorageService | null;
/**
 * 初始化存储服务
 * @param type 存储提供者类型
 * @param config 配置
 */
export declare function initializeStorageService(type?: StorageProviderType, config?: any): Promise<IStorageService>;
/**
 * 获取全局存储服务实例
 */
export declare function getStorageService(): IStorageService;
