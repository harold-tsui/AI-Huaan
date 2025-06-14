"use strict";
/**
 * File Capture Processor - 文件捕获处理器
 *
 * 处理从文件捕获的内容
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
exports.FileCaptureProcessor = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const mime = __importStar(require("mime-types"));
const types_1 = require("../ai-services/types");
const types_2 = require("../knowledge-graph/types");
const base_capture_processor_1 = require("./base-capture-processor");
const types_3 = require("./types");
/**
 * 文件捕获处理器
 */
class FileCaptureProcessor extends base_capture_processor_1.BaseCaptureProcessor {
    /**
     * 构造函数
     * @param aiService AI服务
     * @param knowledgeGraphService 知识图谱服务
     */
    constructor(aiService, knowledgeGraphService) {
        super('file-capture-processor', 'Processes file content by extracting text, metadata, and creating knowledge graph nodes', [types_3.CaptureSourceType.FILE]);
        this.aiService = aiService;
        this.knowledgeGraphService = knowledgeGraphService;
    }
    /**
     * 处理文件内容
     * @param item 捕获项
     */
    async processFileContent(item) {
        this.logger.info(`Processing file content: ${item.content.filePath || 'Unknown file'}`);
        try {
            // 检查文件路径
            const filePath = item.content.filePath;
            if (!filePath) {
                return {
                    success: false,
                    message: 'No file path provided for file content',
                };
            }
            // 检查文件是否存在
            try {
                await fs.access(filePath);
            }
            catch (error) {
                return {
                    success: false,
                    message: `File does not exist or is not accessible: ${filePath}`,
                };
            }
            // 获取文件信息
            const fileInfo = await this.getFileInfo(filePath);
            // 根据文件类型处理内容
            let fileContent;
            if (fileInfo.isText) {
                fileContent = await this.processTextFile(filePath, fileInfo.mimeType);
            }
            else if (fileInfo.isImage) {
                fileContent = await this.processImageFile(filePath, fileInfo.mimeType);
            }
            else if (fileInfo.isPdf) {
                fileContent = await this.processPdfFile(filePath);
            }
            else {
                fileContent = {
                    filePath,
                };
            }
            // 更新捕获项内容
            const updatedContent = {
                ...item.content,
                ...fileContent,
                filePath,
            };
            // 文件元数据，不直接添加到CaptureItemContent中
            const fileMetadata = {
                mimeType: fileInfo.mimeType,
                fileSize: fileInfo.size,
                fileName: path.basename(filePath),
            };
            // 如果有AI服务且有文本内容，生成摘要和标签
            if (this.aiService && updatedContent.text) {
                const enrichments = await this.enrichContentWithAI(updatedContent.text, fileMetadata.fileName);
                // 不要直接将enrichments合并到updatedContent中，因为CaptureItemContent不包含summary和tags属性
            }
            // 如果有知识图谱服务，创建知识图谱节点
            if (this.knowledgeGraphService) {
                await this.createKnowledgeGraphNode(item, updatedContent, fileInfo);
            }
            // 创建处理结果
            let summary;
            let suggestedTags;
            // 如果有AI服务且有文本内容，获取摘要和标签
            if (this.aiService && updatedContent.text) {
                const enrichments = await this.enrichContentWithAI(updatedContent.text, fileMetadata.fileName);
                summary = enrichments.summary;
                suggestedTags = enrichments.tags;
            }
            return {
                success: true,
                message: 'File content processed successfully',
                summary,
                suggestedTags,
                extractedText: updatedContent.text,
                extractedMetadata: fileMetadata
            };
        }
        catch (error) {
            this.logger.error(`Error processing file content: ${error instanceof Error ? error.message : String(error)}`, { error: error instanceof Error ? error : String(error) });
            return {
                success: false,
                message: `Error processing file content: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
    /**
     * 获取文件信息
     * @param filePath 文件路径
     */
    async getFileInfo(filePath) {
        // 获取文件状态
        const stats = await fs.stat(filePath);
        // 获取文件扩展名和MIME类型
        const extension = path.extname(filePath).toLowerCase();
        const mimeType = mime.lookup(filePath) || 'application/octet-stream';
        // 判断文件类型
        const isText = mimeType.startsWith('text/') ||
            ['.md', '.txt', '.json', '.csv', '.xml', '.html', '.htm', '.js', '.ts', '.jsx', '.tsx', '.css', '.scss', '.less'].includes(extension);
        const isImage = mimeType.startsWith('image/');
        const isPdf = mimeType === 'application/pdf';
        return {
            path: filePath,
            name: path.basename(filePath),
            size: stats.size,
            mimeType,
            extension,
            isText,
            isImage,
            isPdf,
        };
    }
    /**
     * 处理文本文件
     * @param filePath 文件路径
     * @param mimeType MIME类型
     */
    async processTextFile(filePath, mimeType) {
        this.logger.info(`Processing text file: ${filePath}`);
        try {
            // 读取文件内容
            const content = await fs.readFile(filePath, 'utf-8');
            // 根据文件类型处理内容
            const extension = path.extname(filePath).toLowerCase();
            if (extension === '.md') {
                return {
                    text: content,
                    markdown: content,
                };
            }
            else if (extension === '.html' || extension === '.htm') {
                return {
                    html: content,
                    text: this.extractTextFromHtml(content),
                };
            }
            else if (extension === '.json') {
                try {
                    const jsonData = JSON.parse(content);
                    return {
                        text: JSON.stringify(jsonData, null, 2),
                    };
                }
                catch (error) {
                    return { text: content };
                }
            }
            else {
                return { text: content };
            }
        }
        catch (error) {
            this.logger.error(`Error processing text file: ${filePath}`, { error: error instanceof Error ? error : String(error) });
            throw new Error(`Failed to process text file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 处理图片文件
     * @param filePath 文件路径
     * @param mimeType MIME类型
     * @returns 处理后的内容
     */
    async processImageFile(filePath, mimeType) {
        this.logger.info(`Processing image file: ${filePath}`);
        try {
            // 获取文件信息
            const stats = await fs.stat(filePath);
            // 如果有图像处理服务，可以在这里添加图像处理逻辑
            // 例如：生成缩略图、提取EXIF数据等
            // 返回符合 CaptureItemContent 接口的对象
            return {
                filePath: filePath,
            };
        }
        catch (error) {
            this.logger.error(`Error processing image file: ${filePath}`, { error: error instanceof Error ? error : String(error) });
            // 返回符合 CaptureItemContent 接口的对象
            return {
                filePath,
            };
        }
    }
    /**
     * 处理PDF文件
     * @param filePath 文件路径
     * @returns 处理后的内容
     */
    async processPdfFile(filePath) {
        this.logger.info(`Processing PDF file: ${filePath}`);
        try {
            // 获取文件信息
            const stats = await fs.stat(filePath);
            // 如果有PDF处理服务，可以在这里添加PDF处理逻辑
            // 例如：提取文本、生成预览等
            // 返回符合 CaptureItemContent 接口的对象
            return {
                filePath: filePath,
                // 不要直接添加 mimeType 和 fileSize，它们应该作为元数据
            };
        }
        catch (error) {
            this.logger.error(`Error processing PDF file: ${filePath}`, { error: error instanceof Error ? error : String(error) });
            // 返回符合 CaptureItemContent 接口的对象
            return {
                filePath,
            };
        }
    }
    /**
     * 从HTML中提取文本
     * @param html HTML内容
     */
    extractTextFromHtml(html) {
        // 实际实现中，应使用专门的HTML解析库
        // 这里使用简单的正则表达式替换
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 移除脚本
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // 移除样式
            .replace(/<[^>]+>/g, ' ') // 移除HTML标签
            .replace(/\s{2,}/g, ' ') // 压缩空白
            .trim(); // 修剪空白
    }
    /**
     * 使用AI服务丰富内容
     * @param text 文本内容
     * @param fileName 文件名
     */
    async enrichContentWithAI(text, fileName) {
        this.logger.info(`Enriching file content with AI: ${fileName}`);
        if (!this.aiService) {
            return {};
        }
        try {
            // 限制文本长度以避免超出AI模型的上下文窗口
            const truncatedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text;
            // 生成摘要
            const summaryPrompt = `Please provide a concise summary (3-5 sentences) of the following file content. File name: "${fileName}"\n\nContent: ${truncatedText}`;
            const summaryResult = await this.aiService.chat([
                { role: types_1.MessageRole.SYSTEM, content: { type: types_1.ContentType.TEXT, text: 'You are a helpful assistant that creates concise, informative summaries.' } },
                { role: types_1.MessageRole.USER, content: { type: types_1.ContentType.TEXT, text: summaryPrompt } }
            ]);
            // 生成标签
            const tagsPrompt = `Please extract 5-8 relevant tags or keywords from the following file content. Provide them as a comma-separated list. File name: "${fileName}"\n\nContent: ${truncatedText}`;
            const tagsResult = await this.aiService.chat([
                { role: types_1.MessageRole.SYSTEM, content: { type: types_1.ContentType.TEXT, text: 'You are a helpful assistant that extracts relevant tags and keywords.' } },
                { role: types_1.MessageRole.USER, content: { type: types_1.ContentType.TEXT, text: tagsPrompt } }
            ]);
            // 获取消息内容
            const summaryText = this.getMessageText(summaryResult.message);
            const tagsText = this.getMessageText(tagsResult.message);
            // 解析标签
            const tags = tagsText
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
            return {
                summary: summaryText,
                tags,
            };
        }
        catch (error) {
            this.logger.error(`Error enriching file content with AI: ${fileName}`, { error: error instanceof Error ? error : String(error) });
            return {};
        }
    }
    /**
     * 从消息中获取文本内容
     * @param message AI服务返回的消息
     * @returns 文本内容
     */
    getMessageText(message) {
        if (!message.content) {
            return '';
        }
        if (typeof message.content === 'string') {
            return message.content;
        }
        if (Array.isArray(message.content)) {
            // 如果是数组，找到第一个文本内容
            const textContent = message.content.find(c => c.type === types_1.ContentType.TEXT);
            return textContent?.text || '';
        }
        // 如果是单个MessageContent对象
        if (message.content.type === types_1.ContentType.TEXT) {
            return message.content.text || '';
        }
        return '';
    }
    /**
     * 创建知识图谱节点
     * @param item 捕获项
     * @param content 内容
     * @param fileInfo 文件信息
     */
    async createKnowledgeGraphNode(item, content, fileInfo) {
        if (!this.knowledgeGraphService) {
            return;
        }
        this.logger.info(`Creating knowledge graph node for file: ${path.basename(content.filePath || '') || 'Unknown file'}`);
        try {
            // 确定节点类型
            let nodeType = types_2.NodeType.RESOURCE;
            if (fileInfo.isImage) {
                nodeType = types_2.NodeType.RESOURCE;
            }
            else if (fileInfo.isPdf) {
                nodeType = types_2.NodeType.RESOURCE;
            }
            // 创建文件节点
            const fileNode = await this.knowledgeGraphService.createNode({
                type: nodeType,
                properties: {
                    title: path.basename(content.filePath || ''),
                    filePath: content.filePath || '',
                    mimeType: fileInfo.mimeType || '',
                    fileSize: fileInfo.size || 0,
                    captureDate: item.created,
                    captureId: item.id,
                },
            });
            // 如果有标签，为每个标签创建节点并建立关系
            const tags = item.metadata.tags || [];
            if (tags.length > 0) {
                for (const tag of tags) {
                    // 查找或创建标签节点
                    const tagNodes = await this.knowledgeGraphService.findNodes({
                        types: [types_2.NodeType.TAG],
                        properties: { name: tag },
                    });
                    let tagNode;
                    if (tagNodes.length > 0) {
                        tagNode = tagNodes[0];
                    }
                    else {
                        tagNode = await this.knowledgeGraphService.createNode({
                            type: types_2.NodeType.TAG,
                            properties: { name: tag },
                        });
                    }
                    // 创建文件到标签的关系
                    await this.knowledgeGraphService.createRelation({
                        sourceId: fileNode.id,
                        targetId: tagNode.id,
                        type: types_2.RelationType.TAGGED_WITH,
                        properties: {},
                    });
                }
            }
            this.logger.info(`Knowledge graph node created successfully: ${fileNode.id}`);
        }
        catch (error) {
            this.logger.error(`Error creating knowledge graph node: ${error instanceof Error ? error.message : String(error)}`, { error: error instanceof Error ? error : String(error) });
        }
    }
}
exports.FileCaptureProcessor = FileCaptureProcessor;
//# sourceMappingURL=file-capture-processor.js.map