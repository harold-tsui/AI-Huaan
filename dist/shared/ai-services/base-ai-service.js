"use strict";
/**
 * Base AI Service - 基础AI服务
 *
 * 提供AI服务的基础实现，包括初始化、关闭、模型管理等通用功能。
 * 具体的AI提供商服务需要继承此类并实现相应的方法。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAIService = void 0;
/**
 * 基础AI服务
 */
class BaseAIService {
    /**
     * 构造函数
     *
     * @param config 服务配置
     */
    constructor(config) {
        // 服务是否已初始化
        this._initialized = false;
        // 可用模型列表
        this._models = [];
        this._config = {
            timeout: 30000,
            maxRetries: 3,
            logLevel: 'info',
            ...config
        };
    }
    /**
     * 获取服务配置
     */
    get config() {
        return this._config;
    }
    /**
     * 设置服务配置
     */
    set config(config) {
        this._config = {
            ...this._config,
            ...config
        };
    }
    /**
     * 初始化服务
     */
    async initialize() {
        if (this._initialized) {
            return;
        }
        try {
            // 加载模型列表
            await this.loadModels();
            // 执行子类特定的初始化
            await this.initializeImpl();
            this._initialized = true;
            this.log('info', `${this._config.serviceName} initialized successfully`);
        }
        catch (error) {
            this.log('error', `Failed to initialize ${this._config.serviceName}: ${error}`);
            throw error;
        }
    }
    /**
     * 关闭服务
     */
    async shutdown() {
        if (!this._initialized) {
            return;
        }
        try {
            // 执行子类特定的关闭
            await this.shutdownImpl();
            this._initialized = false;
            this.log('info', `${this._config.serviceName} shutdown successfully`);
        }
        catch (error) {
            this.log('error', `Failed to shutdown ${this._config.serviceName}: ${error}`);
            throw error;
        }
    }
    /**
     * 服务是否已初始化
     */
    isInitialized() {
        return this._initialized;
    }
    /**
     * 获取可用模型列表
     */
    async getAvailableModels() {
        this.ensureInitialized();
        return this._models;
    }
    /**
     * 确保服务已初始化
     */
    ensureInitialized() {
        if (!this._initialized) {
            throw new Error(`${this._config.serviceName} is not initialized`);
        }
    }
    /**
     * 获取默认模型
     *
     * @param type 模型类型
     */
    getDefaultModel(type) {
        // 首先检查配置中的默认模型
        if (this._config.defaultModel) {
            const model = this._models.find(m => m.name === this._config.defaultModel && m.type === type);
            if (model) {
                return model.name;
            }
        }
        // 否则返回该类型的第一个模型
        const model = this._models.find(m => m.type === type);
        return model?.name;
    }
    /**
     * 记录日志
     *
     * @param level 日志级别
     * @param message 日志消息
     */
    log(level, message) {
        const logLevels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            none: 4
        };
        const configLevel = this._config.logLevel || 'info';
        if (logLevels[level] >= logLevels[configLevel]) {
            const prefix = `[${this._config.serviceName}]`;
            switch (level) {
                case 'debug':
                    console.debug(`${prefix} ${message}`);
                    break;
                case 'info':
                    console.info(`${prefix} ${message}`);
                    break;
                case 'warn':
                    console.warn(`${prefix} ${message}`);
                    break;
                case 'error':
                    console.error(`${prefix} ${message}`);
                    break;
            }
        }
    }
}
exports.BaseAIService = BaseAIService;
//# sourceMappingURL=base-ai-service.js.map