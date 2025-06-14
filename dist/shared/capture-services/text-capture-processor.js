"use strict";
/**
 * Text Capture Processor - 文本捕获处理器
 *
 * 处理纯文本内容
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextCaptureProcessor = void 0;
const types_1 = require("../ai-services/types");
const types_2 = require("../knowledge-graph-services/types");
const base_capture_processor_1 = require("./base-capture-processor");
const types_3 = require("./types");
/**
 * 文本捕获处理器
 */
class TextCaptureProcessor extends base_capture_processor_1.BaseCaptureProcessor {
    /**
     * 构造函数
     * @param aiService AI服务
     * @param knowledgeGraphService 知识图谱服务
     */
    constructor(aiService, knowledgeGraphService) {
        super('text-capture-processor', 'Processes plain text content, analyzes it, and creates knowledge graph nodes', [types_3.CaptureSourceType.TEXT]);
        this.aiService = aiService;
        this.knowledgeGraphService = knowledgeGraphService;
    }
    /**
     * 处理文本内容
     * @param item 捕获项
     */
    async processTextContent(item) {
        this.logger.info(`Processing text content: ${item.metadata.title || 'Untitled'}`);
        try {
            // 提取文本内容
            const text = this.extractTextContent(item);
            if (!text) {
                return {
                    success: false,
                    message: 'No text content found',
                    processorName: this.getName(),
                };
            }
            // 更新捕获项内容
            let updatedContent = {
                ...item.content,
                text,
            };
            // 如果有AI服务，生成摘要、标签和Markdown格式
            let processingResult = {
                success: true,
                message: 'Text content processed successfully',
                processorName: this.getName(),
            };
            if (this.aiService) {
                processingResult = await this.enrichContentWithAI(text, item.metadata.title || '');
                // 如果AI处理成功且有更新的内容，合并到updatedContent中
                if (processingResult.success && processingResult.updatedContent) {
                    updatedContent = {
                        ...updatedContent,
                        ...processingResult.updatedContent
                    };
                }
            }
            // 如果有知识图谱服务，创建知识图谱节点
            if (this.knowledgeGraphService) {
                await this.createKnowledgeGraphNode(item, updatedContent);
            }
            return {
                ...processingResult,
                processorName: this.getName(),
                updatedContent,
            };
        }
        catch (error) {
            this.logger.error(`Error processing text content: ${error instanceof Error ? error.message : String(error)}`, { error: error instanceof Error ? error : String(error) });
            return {
                success: false,
                message: `Error processing text content: ${error instanceof Error ? error.message : String(error)}`,
                processorName: this.getName(),
            };
        }
    }
    /**
     * 使用AI丰富内容
     * @param text 文本内容
     * @param title 标题
     */
    async enrichContentWithAI(text, title) {
        this.logger.info(`Enriching text content with AI: ${title}`);
        if (!this.aiService) {
            return { success: false, message: 'AI service not available' };
        }
        try {
            // 限制文本长度以避免超出AI模型的上下文窗口
            const truncatedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text;
            // 生成摘要
            const summaryPrompt = `Please provide a concise summary (2-3 sentences) of the following text. Title: "${title || 'Untitled'}"

Text: ${truncatedText}`;
            const summaryResult = await this.aiService.chat([
                {
                    role: types_1.MessageRole.SYSTEM,
                    content: [{ type: types_1.ContentType.TEXT, text: 'You are a helpful assistant that creates concise, informative summaries.' }]
                },
                {
                    role: types_1.MessageRole.USER,
                    content: [{ type: types_1.ContentType.TEXT, text: summaryPrompt }]
                }
            ]);
            // 生成标签
            const tagsPrompt = `Please extract 3-5 relevant tags or keywords from the following text. Provide them as a comma-separated list. Title: "${title || 'Untitled'}"

Text: ${truncatedText}`;
            const tagsResult = await this.aiService.chat([
                {
                    role: types_1.MessageRole.SYSTEM,
                    content: [{ type: types_1.ContentType.TEXT, text: 'You are a helpful assistant that extracts relevant tags and keywords.' }]
                },
                {
                    role: types_1.MessageRole.USER,
                    content: [{ type: types_1.ContentType.TEXT, text: tagsPrompt }]
                }
            ]);
            // 生成Markdown格式
            const markdownPrompt = `Please convert the following plain text to well-formatted Markdown. Add appropriate headings, lists, and formatting. Title: "${title || 'Untitled'}"

Text: ${truncatedText}`;
            const markdownResult = await this.aiService.chat([
                {
                    role: types_1.MessageRole.SYSTEM,
                    content: [{ type: types_1.ContentType.TEXT, text: 'You are a helpful assistant that formats text into well-structured Markdown.' }]
                },
                {
                    role: types_1.MessageRole.USER,
                    content: [{ type: types_1.ContentType.TEXT, text: markdownPrompt }]
                }
            ]);
            // 从消息内容中提取文本
            const getTextFromContent = (content) => {
                if (Array.isArray(content)) {
                    return content
                        .filter(item => item.type === types_1.ContentType.TEXT)
                        .map(item => item.text || '')
                        .join('');
                }
                else if (content.type === types_1.ContentType.TEXT) {
                    return content.text || '';
                }
                return '';
            };
            const summaryText = getTextFromContent(summaryResult.message.content);
            const markdownText = getTextFromContent(markdownResult.message.content);
            const tagsText = getTextFromContent(tagsResult.message.content);
            // 解析标签
            const tags = tagsText
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
            return {
                success: true,
                summary: summaryText,
                suggestedTags: tags,
                message: 'Content enriched successfully',
                updatedContent: {
                    markdown: markdownText
                }
            };
        }
        catch (error) {
            this.logger.error(`Error enriching text content with AI: ${title}`, { error: error instanceof Error ? error : String(error) });
            return {
                success: false,
                message: `Error enriching content: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * 创建知识图谱节点
     * @param item 捕获项
     * @param content 内容
     */
    async createKnowledgeGraphNode(item, content) {
        if (!this.knowledgeGraphService) {
            return;
        }
        this.logger.info(`Creating knowledge graph node for text: ${item.metadata.title || 'Untitled'}`);
        try {
            // 创建文本节点
            const textNode = await this.knowledgeGraphService.createNode({
                type: types_2.NodeType.NOTE,
                label: item.metadata.title || 'Untitled Note',
                properties: {
                    title: item.metadata.title || 'Untitled Note',
                    content: content.text || '',
                    summary: item.processingResult?.summary || '',
                    captureDate: item.created,
                    captureId: item.id,
                },
            });
            // 如果有标签，为每个标签创建节点并建立关系
            if (item.metadata.tags && Array.isArray(item.metadata.tags)) {
                for (const tag of item.metadata.tags) {
                    // 查找或创建标签节点
                    const tagNodes = await this.knowledgeGraphService.queryNodes({
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
                            label: tag,
                            properties: { name: tag },
                        });
                    }
                    // 创建文本到标签的关系
                    await this.knowledgeGraphService.createRelationship({
                        sourceNodeId: textNode.id,
                        targetNodeId: tagNode.id,
                        type: types_2.RelationshipType.HAS_TAG,
                        label: 'Has Tag',
                        properties: {},
                    });
                }
            }
            // 提取实体并创建关系（如果有AI服务）
            if (this.aiService && content.text) {
                await this.extractAndLinkEntities(textNode.id, content.text);
            }
            this.logger.info(`Knowledge graph node created successfully: ${textNode.id}`);
        }
        catch (error) {
            this.logger.error(`Error creating knowledge graph node: ${error instanceof Error ? error.message : String(error)}`, { error: error instanceof Error ? error : String(error) });
        }
    }
    /**
     * 提取实体并创建关系
     * @param sourceNodeId 源节点ID
     * @param text 文本内容
     */
    async extractAndLinkEntities(sourceNodeId, text) {
        if (!this.aiService || !this.knowledgeGraphService) {
            return;
        }
        try {
            // 限制文本长度
            const truncatedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text;
            // 使用AI提取实体
            const entitiesPrompt = `Please extract key entities (people, places, organizations, concepts) from the following text. For each entity, provide the entity name and its type. Format the output as a JSON array of objects with 'name' and 'type' properties.\n\nText: ${truncatedText}`;
            const entitiesResult = await this.aiService.chat([
                { role: types_1.MessageRole.SYSTEM, content: { type: types_1.ContentType.TEXT, text: 'You are a helpful assistant that extracts named entities from text.' } },
                { role: types_1.MessageRole.USER, content: { type: types_1.ContentType.TEXT, text: entitiesPrompt } }
            ]);
            // 尝试解析JSON结果
            try {
                // 从消息中获取文本内容
                const messageContent = entitiesResult.message.content;
                const contentText = typeof messageContent === 'string' ? messageContent :
                    Array.isArray(messageContent) ? messageContent.map(c => c.text || '').join('') :
                        messageContent.text || '';
                const entities = JSON.parse(contentText);
                if (Array.isArray(entities)) {
                    for (const entity of entities) {
                        if (entity.name && entity.type) {
                            // 确定节点类型
                            let nodeType = types_2.NodeType.CONCEPT;
                            switch (entity.type.toLowerCase()) {
                                case 'person':
                                    nodeType = types_2.NodeType.PERSON;
                                    break;
                                case 'place':
                                case 'location':
                                    nodeType = types_2.NodeType.LOCATION;
                                    break;
                                case 'organization':
                                    nodeType = types_2.NodeType.ORGANIZATION;
                                    break;
                                // 其他类型默认为概念
                            }
                            // 查找或创建实体节点
                            const entityNodes = await this.knowledgeGraphService.queryNodes({
                                types: [nodeType],
                                properties: { name: entity.name },
                            });
                            let entityNode;
                            if (entityNodes.length > 0) {
                                entityNode = entityNodes[0];
                            }
                            else {
                                entityNode = await this.knowledgeGraphService.createNode({
                                    type: nodeType,
                                    label: entity.name,
                                    properties: { name: entity.name },
                                });
                            }
                            // 创建关系
                            await this.knowledgeGraphService.createRelationship({
                                sourceNodeId: sourceNodeId,
                                targetNodeId: entityNode.id,
                                type: types_2.RelationshipType.REFERENCES,
                                label: 'References',
                                properties: {},
                            });
                        }
                    }
                }
            }
            catch (error) {
                this.logger.error('Error parsing entities JSON', { error: error instanceof Error ? error : String(error) });
            }
        }
        catch (error) {
            this.logger.error('Error extracting entities', { error: error instanceof Error ? error : String(error) });
        }
    }
}
exports.TextCaptureProcessor = TextCaptureProcessor;
//# sourceMappingURL=text-capture-processor.js.map