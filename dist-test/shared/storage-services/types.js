"use strict";
/**
 * Storage Services Types - 存储服务类型定义
 *
 * 定义存储服务相关的接口和类型
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageItemType = exports.StorageProviderType = void 0;
/**
 * 存储提供者类型
 */
var StorageProviderType;
(function (StorageProviderType) {
    StorageProviderType["LOCAL"] = "local";
    StorageProviderType["S3"] = "s3";
    StorageProviderType["MINIO"] = "minio";
    StorageProviderType["AZURE"] = "azure";
    StorageProviderType["GCP"] = "gcp";
    StorageProviderType["CUSTOM"] = "custom";
})(StorageProviderType || (exports.StorageProviderType = StorageProviderType = {}));
/**
 * 存储项类型
 */
var StorageItemType;
(function (StorageItemType) {
    StorageItemType["FILE"] = "file";
    StorageItemType["DIRECTORY"] = "directory";
})(StorageItemType || (exports.StorageItemType = StorageItemType = {}));
//# sourceMappingURL=types.js.map