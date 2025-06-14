"use strict";
/**
 * Base Service - 基础服务抽象类
 *
 * 所有MCP原子服务的基础类，提供通用功能和标准化接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("../../utils/logger");
const types_1 = require("./types");
class BaseService {
    constructor(name, version, config) {
        this.id = (0, uuid_1.v4)();
        this.name = name;
        this.version = version;
        this.status = types_1.ServiceStatus.INITIALIZING;
        this.config = config;
        this.metadata = {
            createdAt: new Date(),
            updatedAt: new Date(),
            description: '',
            capabilities: [],
            dependencies: [],
        };
        this.logger = new logger_1.Logger(`${name}:${version}`);
    }
    /**
     * 初始化服务
     * 子类应该重写此方法以实现特定的初始化逻辑
     */
    async initialize() {
        this.logger.info(`Initializing service: ${this.name}@${this.version}`);
        this.status = types_1.ServiceStatus.ACTIVE;
        this.metadata.updatedAt = new Date();
        return true;
    }
    /**
     * 关闭服务
     * 子类应该重写此方法以实现特定的关闭逻辑
     */
    async shutdown() {
        try {
            this.logger.info(`Shutting down service: ${this.name}@${this.version}`);
            this.status = types_1.ServiceStatus.INACTIVE;
            this.metadata.updatedAt = new Date();
            return true;
        }
        catch (error) {
            this.logger.error(`Error shutting down service: ${this.name}@${this.version}`, { error: error instanceof Error ? error : String(error) });
            return false;
        }
    }
    /**
     * 获取服务状态
     */
    getStatus() {
        return this.status;
    }
    /**
     * 获取服务元数据
     */
    getMetadata() {
        return this.metadata;
    }
    /**
     * 获取服务配置
     */
    getConfig() {
        return this.config;
    }
    /**
     * 更新服务配置
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.metadata.updatedAt = new Date();
        this.logger.info(`Updated service config: ${this.name}@${this.version}`);
    }
    /**
     * 健康检查
     * 子类应该重写此方法以实现特定的健康检查逻辑
     */
    async healthCheck() {
        return this.status === types_1.ServiceStatus.ACTIVE;
    }
    /**
     * 获取服务信息
     */
    getInfo() {
        return {
            id: this.id,
            name: this.name,
            version: this.version,
            status: this.status,
            description: this.metadata.description,
        };
    }
    /**
     * 注册服务能力
     */
    registerCapability(capability, description) {
        if (!this.metadata.capabilities.some(cap => cap.name === capability)) {
            this.metadata.capabilities.push({
                name: capability,
                description,
                registeredAt: new Date(),
            });
            this.logger.info(`Registered capability: ${capability}`);
        }
    }
    /**
     * 注册服务依赖
     */
    registerDependency(serviceName, version, required) {
        if (!this.metadata.dependencies.some(dep => dep.name === serviceName && dep.version === version)) {
            this.metadata.dependencies.push({
                name: serviceName,
                version,
                required,
                registeredAt: new Date(),
            });
            this.logger.info(`Registered dependency: ${serviceName}@${version}`);
        }
    }
}
exports.BaseService = BaseService;
//# sourceMappingURL=base-service.js.map