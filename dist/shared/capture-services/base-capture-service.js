"use strict";
/**
 * Base Capture Service - 基础捕获服务
 *
 * 提供捕获服务的基础实现，作为所有捕获服务实现的基类
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCaptureService = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("../../utils/logger");
const types_1 = require("./types");
/**
 * 基础捕获服务抽象类
 */
class BaseCaptureService {
    /**
     * 构造函数
     */
    constructor() {
        this.logger = new logger_1.Logger(this.constructor.name);
        this.processors = new Map();
        this.logger.info('Initializing base capture service');
    }
    /**
     * 创建捕获项
     */
    async createCaptureItem(input) {
        this.logger.debug('Creating capture item', { sourceType: input.sourceType });
        const now = new Date().toISOString();
        // 创建新的捕获项
        const item = {
            id: (0, uuid_1.v4)(),
            userId: input.userId,
            sourceType: input.sourceType,
            status: input.status,
            priority: input.priority || types_1.CaptureItemPriority.MEDIUM,
            metadata: {
                capturedDate: now,
                ...input.metadata,
            },
            content: {
                ...input.content,
            },
            created: now,
            updated: now,
        };
        // 保存捕获项
        const savedItem = await this.saveCaptureItem(item);
        // 如果需要立即处理
        if (input.processImmediately && savedItem) {
            const processedItem = await this.processCaptureItem(savedItem.id);
            return processedItem || savedItem; // 如果处理失败，返回原始保存的项
        }
        return savedItem;
    }
    /**
     * 更新捕获项
     */
    async updateCaptureItem(id, input) {
        this.logger.debug('Updating capture item', { id });
        // 获取现有捕获项
        const existingItem = await this.getCaptureItem(id);
        if (!existingItem) {
            this.logger.warn('Capture item not found', { id });
            return null;
        }
        // 更新捕获项
        const updatedItem = {
            ...existingItem,
            status: input.status || existingItem.status,
            priority: input.priority || existingItem.priority,
            metadata: {
                ...existingItem.metadata,
                ...(input.metadata || {}),
            },
            content: {
                ...existingItem.content,
                ...(input.content || {}),
            },
            processingResult: input.processingResult
                ? {
                    ...existingItem.processingResult,
                    ...input.processingResult,
                }
                : existingItem.processingResult,
            updated: new Date().toISOString(),
        };
        // 如果状态变为已处理，设置处理时间
        if (input.status === types_1.CaptureItemStatus.COMPLETED && !existingItem.processed) {
            updatedItem.processed = new Date().toISOString();
        }
        // 如果状态变为已归档，设置归档时间
        if (input.status === types_1.CaptureItemStatus.ARCHIVED && !existingItem.archived) {
            updatedItem.archived = new Date().toISOString();
        }
        // 保存更新后的捕获项
        return this.saveCaptureItem(updatedItem);
    }
    /**
     * 处理捕获项
     */
    async processCaptureItem(id) {
        this.logger.debug('Processing capture item', { id });
        // 获取捕获项
        const item = await this.getCaptureItem(id);
        if (!item) {
            this.logger.warn('Capture item not found', { id });
            return null;
        }
        // 更新状态为处理中
        await this.updateCaptureItem(id, { status: types_1.CaptureItemStatus.PROCESSING });
        try {
            // 查找适合的处理器
            const processor = this.findSuitableProcessor(item.sourceType);
            if (!processor) {
                throw new Error(`No suitable processor found for source type: ${item.sourceType}`);
            }
            // 处理捕获项
            const result = await processor.processCaptureItem(item);
            // 更新处理结果和状态
            return this.updateCaptureItem(id, {
                status: types_1.CaptureItemStatus.COMPLETED,
                processingResult: result,
            });
        }
        catch (error) {
            this.logger.error('Failed to process capture item', { id, error: error instanceof Error ? error : String(error) });
            // 更新状态为失败
            return this.updateCaptureItem(id, {
                status: types_1.CaptureItemStatus.FAILED,
                processingResult: {
                    success: false,
                    message: error instanceof Error ? error.message : String(error),
                },
            });
        }
    }
    /**
     * 归档捕获项
     */
    async archiveCaptureItem(id) {
        this.logger.debug('Archiving capture item', { id });
        return this.updateCaptureItem(id, { status: types_1.CaptureItemStatus.ARCHIVED });
    }
    /**
     * 从网页捕获
     */
    async captureFromWeb(options, input) {
        this.logger.debug('Capturing from web', { url: options.url });
        // 创建元数据
        const metadata = {
            title: options.url,
            source: 'web',
            url: options.url,
            capturedDate: new Date().toISOString(),
            ...(input?.metadata || {}),
        };
        // 创建内容（初始为空，将由子类实现填充）
        const content = {
            ...(input?.content || {}),
        };
        // 执行实际的网页捕获（由子类实现）
        const captureResult = await this.performWebCapture(options);
        // 合并捕获结果
        const mergedMetadata = { ...metadata, ...captureResult.metadata };
        const mergedContent = { ...content, ...captureResult.content };
        // 创建捕获项
        return this.createCaptureItem({
            userId: input?.userId || 'system',
            sourceType: types_1.CaptureSourceType.WEB,
            status: input?.status || types_1.CaptureItemStatus.PENDING,
            priority: input?.priority,
            metadata: mergedMetadata,
            content: mergedContent,
            processImmediately: input?.processImmediately,
        });
    }
    /**
     * 从文件捕获
     */
    async captureFromFile(options, input) {
        this.logger.debug('Capturing from file', {
            filePath: options.filePath,
            fileUrl: options.fileUrl,
        });
        // 创建元数据
        const metadata = {
            source: 'file',
            capturedDate: new Date().toISOString(),
            ...(input?.metadata || {}),
        };
        // 创建内容（初始为空，将由子类实现填充）
        const content = {
            ...(input?.content || {}),
        };
        // 执行实际的文件捕获（由子类实现）
        const captureResult = await this.performFileCapture(options);
        // 合并捕获结果
        const mergedMetadata = { ...metadata, ...captureResult.metadata };
        const mergedContent = { ...content, ...captureResult.content };
        // 创建捕获项
        return this.createCaptureItem({
            userId: input?.userId || 'system',
            sourceType: types_1.CaptureSourceType.FILE,
            status: input?.status || types_1.CaptureItemStatus.PENDING,
            priority: input?.priority,
            metadata: mergedMetadata,
            content: mergedContent,
            processImmediately: input?.processImmediately,
        });
    }
    /**
     * 从文本捕获
     */
    async captureFromText(text, input) {
        this.logger.debug('Capturing from text', { textLength: text.length });
        // 创建元数据
        const metadata = {
            title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
            source: 'text',
            capturedDate: new Date().toISOString(),
            ...(input?.metadata || {}),
        };
        // 创建内容
        const content = {
            text,
            ...(input?.content || {}),
        };
        // 创建捕获项
        return this.createCaptureItem({
            userId: input?.userId || 'system',
            sourceType: types_1.CaptureSourceType.TEXT,
            status: input?.status || types_1.CaptureItemStatus.PENDING,
            priority: input?.priority,
            metadata,
            content,
            processImmediately: input?.processImmediately,
        });
    }
    /**
     * 从URL捕获
     */
    async captureFromUrl(url, input) {
        this.logger.debug('Capturing from URL', { url });
        // 根据URL类型选择捕获方法
        if (this.isWebUrl(url)) {
            return this.captureFromWeb({ url }, input);
        }
        else {
            return this.captureFromFile({ fileUrl: url }, input);
        }
    }
    /**
     * 判断URL是否为网页URL
     */
    isWebUrl(url) {
        // 简单判断：如果URL以http://或https://开头，且不以常见文件扩展名结尾，则认为是网页URL
        const isHttp = url.startsWith('http://') || url.startsWith('https://');
        const hasFileExtension = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar|7z|tar|gz|mp3|mp4|avi|mov|png|jpg|jpeg|gif|svg)$/i.test(url);
        return isHttp && !hasFileExtension;
    }
    /**
     * 注册处理器
     */
    registerProcessor(processor) {
        this.logger.debug('Registering processor', { name: processor.getName() });
        this.processors.set(processor.getName(), processor);
    }
    /**
     * 获取处理器
     */
    getProcessor(name) {
        return this.processors.get(name) || null;
    }
    /**
     * 获取所有处理器
     */
    getAllProcessors() {
        return Array.from(this.processors.values());
    }
    /**
     * 查找适合的处理器
     */
    findSuitableProcessor(sourceType) {
        const processors = Array.from(this.processors.values());
        for (const processor of processors) {
            if (processor.getSupportedSourceTypes().includes(sourceType)) {
                return processor;
            }
        }
        return null;
    }
}
exports.BaseCaptureService = BaseCaptureService;
//# sourceMappingURL=base-capture-service.js.map