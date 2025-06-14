"use strict";
/**
 * Web Capture Processor - 网页捕获处理器
 *
 * 处理从网页捕获的内容
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebCaptureProcessor = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const jsdom_1 = require("jsdom");
const readability_1 = require("@mozilla/readability");
const types_1 = require("../ai-services/types");
const types_2 = require("../knowledge-graph-services/types");
const base_capture_processor_1 = require("./base-capture-processor");
const types_3 = require("./types");
/**
 * 网页捕获处理器
 */
class WebCaptureProcessor extends base_capture_processor_1.BaseCaptureProcessor {
    /**
     * 构造函数
     * @param aiService AI服务
     * @param knowledgeGraphService 知识图谱服务
     */
    constructor(aiService, knowledgeGraphService) {
        super('web-capture-processor', 'Processes web content by extracting readable content, metadata, and creating knowledge graph nodes', [types_3.CaptureSourceType.WEB]);
        this.aiService = aiService;
        this.knowledgeGraphService = knowledgeGraphService;
    }
    /**
     * 处理网页内容
     * @param item 捕获项
     */
    async processWebContent(item) {
        this.logger.info(`Processing web content: ${item.metadata.url || 'Unknown URL'}`);
        try {
            // 检查URL
            const url = item.metadata.url;
            if (!url) {
                return {
                    success: false,
                    message: 'No URL provided for web content',
                    processorName: this.getName(),
                };
            }
            // 获取网页内容
            let html;
            if (item.content.html) {
                html = item.content.html;
            }
            else {
                html = await this.fetchWebPage(url);
            }
            // 解析网页内容
            const { content: parsedContent, extractedMetadata } = await this.parseWebContent(html, url);
            // 更新捕获项内容
            const updatedContent = {
                ...item.content,
                ...parsedContent,
            };
            // 如果有知识图谱服务，创建知识图谱节点
            if (this.knowledgeGraphService) {
                await this.createKnowledgeGraphNode(item, updatedContent);
            }
            // 如果有AI服务，生成摘要和标签
            let summary = '';
            let suggestedTags = [];
            if (this.aiService && updatedContent.text) {
                const enrichments = await this.enrichContentWithAI(updatedContent.text, item.metadata.title || '');
                summary = enrichments.summary;
                suggestedTags = enrichments.tags;
            }
            return {
                success: true,
                message: 'Web content processed successfully',
                processorName: this.getName(),
                updatedContent,
                extractedMetadata,
                summary,
                suggestedTags,
            };
        }
        catch (error) {
            this.logger.error(`Error processing web content: ${error instanceof Error ? error.message : String(error)}`, { error: error instanceof Error ? error : String(error) });
            return {
                success: false,
                message: `Error processing web content: ${error instanceof Error ? error.message : String(error)}`,
                processorName: this.getName(),
            };
        }
    }
    /**
     * 获取网页内容
     * @param url 网页URL
     */
    async fetchWebPage(url) {
        this.logger.info(`Fetching web page: ${url}`);
        try {
            const response = await axios_1.default.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error fetching web page: ${url}`, { error: error instanceof Error ? error : String(error) });
            throw new Error(`Failed to fetch web page: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 解析网页内容
     * @param html HTML内容
     * @param url 网页URL
     */
    async parseWebContent(html, url) {
        this.logger.info(`Parsing web content from: ${url}`);
        try {
            // 使用cheerio解析HTML
            const $ = cheerio.load(html);
            // 提取基本元数据
            const title = $('title').text().trim() || '';
            const description = $('meta[name="description"]').attr('content') ||
                $('meta[property="og:description"]').attr('content') || '';
            const author = $('meta[name="author"]').attr('content') || '';
            // 使用Readability提取可读内容
            const dom = new jsdom_1.JSDOM(html, { url });
            const reader = new readability_1.Readability(dom.window.document);
            const article = reader.parse();
            // 构建内容对象
            const content = {
                html,
                fileUrl: url,
                text: article?.textContent || '',
                markdown: article ? this.convertToMarkdown(article) : '',
            };
            // 提取元数据
            const extractedMetadata = {
                title,
                description,
                author,
                url,
                publishedDate: $('meta[property="article:published_time"]').attr('content') || '',
                siteName: $('meta[property="og:site_name"]').attr('content') || '',
                favicon: this.extractFavicon($, url),
            };
            return { content, extractedMetadata };
        }
        catch (error) {
            this.logger.error(`Error parsing web content: ${url}`, { error: error instanceof Error ? error : String(error) });
            throw new Error(`Failed to parse web content: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 将Readability文章转换为Markdown
     * @param article Readability文章
     */
    convertToMarkdown(article) {
        // 实际实现中应使用专门的HTML到Markdown转换库
        // 这里仅为简单示例
        let markdown = `# ${article.title || 'Untitled'}\n\n`;
        if (article.byline) {
            markdown += `*By ${article.byline}*\n\n`;
        }
        // 简单地将HTML内容转换为纯文本
        const content = article.textContent || '';
        markdown += content.replace(/\n{3,}/g, '\n\n');
        return markdown;
    }
    /**
     * 提取网站图标
     * @param $ Cheerio实例
     * @param url 网页URL
     */
    extractFavicon($, url) {
        // 尝试从不同的链接元素中提取favicon
        const faviconLink = $('link[rel="icon"]').attr('href') ||
            $('link[rel="shortcut icon"]').attr('href') ||
            $('link[rel="apple-touch-icon"]').attr('href');
        if (!faviconLink) {
            // 返回默认favicon路径
            return new URL('/favicon.ico', url).toString();
        }
        // 处理相对URL
        try {
            return new URL(faviconLink, url).toString();
        }
        catch (error) {
            return new URL('/favicon.ico', url).toString();
        }
    }
    /**
     * 使用AI服务丰富内容
     * @param text 文本内容
     * @param title 标题
     */
    async enrichContentWithAI(text, title) {
        this.logger.info(`Enriching content with AI: ${title}`);
        if (!this.aiService) {
            return { summary: '', tags: [] };
        }
        try {
            // 限制文本长度以避免超出AI模型的上下文窗口
            const truncatedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text;
            // 生成摘要
            const summaryPrompt = `Please provide a concise summary (3-5 sentences) of the following content. Title: "${title}"\n\nContent: ${truncatedText}`;
            const summaryResult = await this.aiService.chat([
                { role: types_1.MessageRole.SYSTEM, content: { type: types_1.ContentType.TEXT, text: 'You are a helpful assistant that creates concise, informative summaries.' } },
                { role: types_1.MessageRole.USER, content: { type: types_1.ContentType.TEXT, text: summaryPrompt } }
            ]);
            // 生成标签
            const tagsPrompt = `Please extract 5-8 relevant tags or keywords from the following content. Provide them as a comma-separated list. Title: "${title}"\n\nContent: ${truncatedText}`;
            const tagsResult = await this.aiService.chat([
                { role: types_1.MessageRole.SYSTEM, content: { type: types_1.ContentType.TEXT, text: 'You are a helpful assistant that extracts relevant tags and keywords.' } },
                { role: types_1.MessageRole.USER, content: { type: types_1.ContentType.TEXT, text: tagsPrompt } }
            ]);
            // 解析标签
            const tagsContent = typeof tagsResult.message.content === 'string'
                ? tagsResult.message.content
                : Array.isArray(tagsResult.message.content) && tagsResult.message.content.length > 0 && tagsResult.message.content[0].text
                    ? tagsResult.message.content[0].text
                    : '';
            const tags = tagsContent
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);
            // 解析摘要
            const summaryContent = typeof summaryResult.message.content === 'string'
                ? summaryResult.message.content
                : Array.isArray(summaryResult.message.content) && summaryResult.message.content.length > 0 && summaryResult.message.content[0].text
                    ? summaryResult.message.content[0].text
                    : '';
            return {
                summary: summaryContent,
                tags,
            };
        }
        catch (error) {
            this.logger.error(`Error enriching content with AI: ${title}`, { error: error instanceof Error ? error : String(error) });
            return { summary: '', tags: [] };
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
        this.logger.info(`Creating knowledge graph node for: ${item.metadata.title || 'Untitled'}`);
        try {
            // 创建网页节点
            const contentWithExtras = content;
            const webPageNode = await this.knowledgeGraphService.createNode({
                type: types_2.NodeType.WEBPAGE,
                label: contentWithExtras.title || item.metadata.title || 'Untitled',
                properties: {
                    title: contentWithExtras.title || item.metadata.title || 'Untitled',
                    url: contentWithExtras.url || item.metadata.url || '',
                    summary: contentWithExtras.summary || '',
                    captureDate: item.created,
                    captureId: item.id,
                },
            });
            // 如果有标签，为每个标签创建节点并建立关系
            if (contentWithExtras.tags && Array.isArray(contentWithExtras.tags)) {
                for (const tag of contentWithExtras.tags) {
                    // 查找或创建标签节点
                    const tagNodes = await this.knowledgeGraphService.queryNodes({
                        types: [types_2.NodeType.TAG],
                        properties: { name: tag },
                        limit: 1
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
                    // 创建网页到标签的关系
                    await this.knowledgeGraphService.createRelationship({
                        sourceNodeId: webPageNode.id,
                        targetNodeId: tagNode.id,
                        type: types_2.RelationshipType.HAS_TAG,
                        label: 'Has Tag',
                        properties: {},
                    });
                }
            }
            this.logger.info(`Knowledge graph node created successfully: ${webPageNode.id}`);
        }
        catch (error) {
            this.logger.error(`Error creating knowledge graph node: ${error instanceof Error ? error.message : String(error)}`, { error: error instanceof Error ? error : String(error) });
        }
    }
}
exports.WebCaptureProcessor = WebCaptureProcessor;
//# sourceMappingURL=web-capture-processor.js.map