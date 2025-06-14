"use strict";
/**
 * Web Processor - 网页处理器
 *
 * 处理网页类型的捕获项
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalWebProcessor = exports.WebProcessor = void 0;
const logger_1 = require("../../../utils/logger");
const ai_services_1 = require("../../ai-services");
const types_1 = require("../../ai-services/types");
const text_processor_1 = require("./text-processor");
const types_2 = require("../types");
/**
 * 网页处理器实现
 */
class WebProcessor {
    /**
     * 构造函数
     */
    constructor() {
        this.logger = new logger_1.Logger('WebProcessor');
    }
    /**
     * 处理捕获项
     */
    async processCaptureItem(item) {
        this.logger.debug('Processing web capture item', { id: item.id });
        try {
            // 确保有HTML内容
            const html = item.content.html;
            if (!html) {
                throw new Error('No HTML content found in capture item');
            }
            // 处理结果
            const result = {
                success: true,
            };
            // 提取文本（如果尚未提取）
            if (!item.content.text) {
                result.extractedText = this.extractTextFromHtml(html);
            }
            else {
                result.extractedText = item.content.text;
            }
            // 提取元数据（如果尚未提取）
            if (!item.metadata.title || !item.metadata.description) {
                const extractedMetadata = this.extractMetadataFromHtml(html);
                result.extractedMetadata = extractedMetadata;
            }
            // 使用文本处理器处理提取的文本
            // 创建一个临时的文本捕获项
            const textItem = {
                ...item,
                sourceType: types_2.CaptureSourceType.TEXT,
                content: {
                    ...item.content,
                    text: result.extractedText,
                },
            };
            // 使用文本处理器处理
            const textProcessingResult = await text_processor_1.globalTextProcessor.processCaptureItem(textItem);
            // 合并处理结果
            result.summary = textProcessingResult.summary;
            result.keyInsights = textProcessingResult.keyInsights;
            result.entities = textProcessingResult.entities;
            result.sentiment = textProcessingResult.sentiment;
            result.topics = textProcessingResult.topics;
            result.readingTime = textProcessingResult.readingTime;
            result.complexity = textProcessingResult.complexity;
            result.suggestedTags = textProcessingResult.suggestedTags;
            // 提取链接
            result.extractedMetadata = {
                ...result.extractedMetadata,
                links: this.extractLinksFromHtml(html),
            };
            // 提取图片
            result.extractedMetadata = {
                ...result.extractedMetadata,
                images: this.extractImagesFromHtml(html),
            };
            // 分析网页结构
            result.extractedMetadata = {
                ...result.extractedMetadata,
                structure: await this.analyzeWebPageStructure(html),
            };
            return result;
        }
        catch (error) {
            this.logger.error('Failed to process web capture item', { id: item.id, error: error instanceof Error ? error : String(error) });
            return {
                success: false,
                message: `Failed to process web page: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    }
    /**
     * 从HTML提取文本
     */
    extractTextFromHtml(html) {
        try {
            // 创建一个临时的DOM元素
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            // 移除脚本和样式
            const scripts = tempDiv.getElementsByTagName('script');
            const styles = tempDiv.getElementsByTagName('style');
            for (let i = scripts.length - 1; i >= 0; i--) {
                scripts[i].parentNode?.removeChild(scripts[i]);
            }
            for (let i = styles.length - 1; i >= 0; i--) {
                styles[i].parentNode?.removeChild(styles[i]);
            }
            // 获取文本内容
            return tempDiv.textContent || tempDiv.innerText || '';
        }
        catch (error) {
            this.logger.error('Failed to extract text from HTML', { error: error instanceof Error ? error : String(error) });
            // 简单的文本提取备用方案
            return html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }
    }
    /**
     * 从HTML提取元数据
     */
    extractMetadataFromHtml(html) {
        const metadata = {};
        try {
            // 创建一个临时的DOM元素
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            // 提取标题
            const titleElement = tempDiv.querySelector('title');
            if (titleElement && titleElement.textContent) {
                metadata.title = titleElement.textContent.trim();
            }
            // 提取描述
            const descriptionElement = tempDiv.querySelector('meta[name="description"]');
            if (descriptionElement && descriptionElement.getAttribute('content')) {
                metadata.description = descriptionElement.getAttribute('content');
            }
            // 提取关键词
            const keywordsElement = tempDiv.querySelector('meta[name="keywords"]');
            if (keywordsElement && keywordsElement.getAttribute('content')) {
                const keywords = keywordsElement.getAttribute('content');
                metadata.keywords = keywords?.split(',').map(keyword => keyword.trim());
            }
            // 提取作者
            const authorElement = tempDiv.querySelector('meta[name="author"]');
            if (authorElement && authorElement.getAttribute('content')) {
                metadata.author = authorElement.getAttribute('content');
            }
            // 提取发布日期
            const publishedTimeElement = tempDiv.querySelector('meta[property="article:published_time"]');
            if (publishedTimeElement && publishedTimeElement.getAttribute('content')) {
                metadata.publishedDate = publishedTimeElement.getAttribute('content');
            }
            // 提取修改日期
            const modifiedTimeElement = tempDiv.querySelector('meta[property="article:modified_time"]');
            if (modifiedTimeElement && modifiedTimeElement.getAttribute('content')) {
                metadata.modifiedDate = modifiedTimeElement.getAttribute('content');
            }
            // 提取Open Graph元数据
            const ogTitle = tempDiv.querySelector('meta[property="og:title"]');
            const ogDescription = tempDiv.querySelector('meta[property="og:description"]');
            const ogImage = tempDiv.querySelector('meta[property="og:image"]');
            const ogType = tempDiv.querySelector('meta[property="og:type"]');
            const ogUrl = tempDiv.querySelector('meta[property="og:url"]');
            metadata.openGraph = {};
            if (ogTitle && ogTitle.getAttribute('content')) {
                metadata.openGraph.title = ogTitle.getAttribute('content');
            }
            if (ogDescription && ogDescription.getAttribute('content')) {
                metadata.openGraph.description = ogDescription.getAttribute('content');
            }
            if (ogImage && ogImage.getAttribute('content')) {
                metadata.openGraph.image = ogImage.getAttribute('content');
            }
            if (ogType && ogType.getAttribute('content')) {
                metadata.openGraph.type = ogType.getAttribute('content');
            }
            if (ogUrl && ogUrl.getAttribute('content')) {
                metadata.openGraph.url = ogUrl.getAttribute('content');
            }
            // 提取Twitter Card元数据
            const twitterCard = tempDiv.querySelector('meta[name="twitter:card"]');
            const twitterTitle = tempDiv.querySelector('meta[name="twitter:title"]');
            const twitterDescription = tempDiv.querySelector('meta[name="twitter:description"]');
            const twitterImage = tempDiv.querySelector('meta[name="twitter:image"]');
            metadata.twitterCard = {};
            if (twitterCard && twitterCard.getAttribute('content')) {
                metadata.twitterCard.card = twitterCard.getAttribute('content');
            }
            if (twitterTitle && twitterTitle.getAttribute('content')) {
                metadata.twitterCard.title = twitterTitle.getAttribute('content');
            }
            if (twitterDescription && twitterDescription.getAttribute('content')) {
                metadata.twitterCard.description = twitterDescription.getAttribute('content');
            }
            if (twitterImage && twitterImage.getAttribute('content')) {
                metadata.twitterCard.image = twitterImage.getAttribute('content');
            }
            return metadata;
        }
        catch (error) {
            this.logger.error('Failed to extract metadata from HTML', { error: error instanceof Error ? error : String(error) });
            return metadata;
        }
    }
    /**
     * 从HTML提取链接
     */
    extractLinksFromHtml(html) {
        const links = [];
        try {
            // 创建一个临时的DOM元素
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            // 提取所有链接
            const anchorElements = tempDiv.getElementsByTagName('a');
            for (let i = 0; i < anchorElements.length; i++) {
                const anchor = anchorElements[i];
                const url = anchor.getAttribute('href');
                if (url) {
                    // 判断是否为外部链接
                    const isExternal = url.startsWith('http://') || url.startsWith('https://');
                    links.push({
                        url,
                        text: anchor.textContent || '',
                        isExternal,
                    });
                }
            }
            return links;
        }
        catch (error) {
            this.logger.error('Failed to extract links from HTML', { error: error instanceof Error ? error : String(error) });
            return links;
        }
    }
    /**
     * 从HTML提取图片
     */
    extractImagesFromHtml(html) {
        const images = [];
        try {
            // 创建一个临时的DOM元素
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            // 提取所有图片
            const imgElements = tempDiv.getElementsByTagName('img');
            for (let i = 0; i < imgElements.length; i++) {
                const img = imgElements[i];
                const url = img.getAttribute('src');
                if (url) {
                    const imageInfo = {
                        url,
                        alt: img.getAttribute('alt') || '',
                    };
                    // 提取宽度和高度
                    const width = img.getAttribute('width');
                    const height = img.getAttribute('height');
                    if (width) {
                        imageInfo.width = parseInt(width, 10);
                    }
                    if (height) {
                        imageInfo.height = parseInt(height, 10);
                    }
                    images.push(imageInfo);
                }
            }
            return images;
        }
        catch (error) {
            this.logger.error('Failed to extract images from HTML', { error: error instanceof Error ? error : String(error) });
            return images;
        }
    }
    /**
     * 分析网页结构
     */
    async analyzeWebPageStructure(html) {
        try {
            // 使用AI服务分析网页结构
            const result = await ai_services_1.globalAIRoutingService.chat([
                { role: types_1.MessageRole.SYSTEM, content: { type: types_1.ContentType.TEXT, text: '你是一个专业的网页分析助手，擅长分析网页结构和内容组织。请分析提供的HTML代码，识别主要结构元素（如标题、导航、主要内容区、侧边栏、页脚等）及其层次关系。以JSON格式返回分析结果。' } },
                { role: types_1.MessageRole.USER, content: { type: types_1.ContentType.TEXT, text: `请分析以下HTML代码的结构：\n\n${html.length > 8000 ? html.substring(0, 8000) + '...' : html}` } },
            ], { temperature: 0.2 });
            // 尝试解析JSON响应
            try {
                const messageContent = result.message.content;
                const contentText = Array.isArray(messageContent)
                    ? messageContent[0]?.text || '{}'
                    : messageContent?.text || '{}';
                return JSON.parse(contentText);
            }
            catch (parseError) {
                this.logger.error('Failed to parse web page structure response', { error: parseError instanceof Error ? parseError : String(parseError) });
                return { structure: '', headings: [], mainContent: '', navigation: [] };
            }
        }
        catch (error) {
            this.logger.error('Failed to analyze web page structure', { error: error instanceof Error ? error : String(error) });
            return { structure: '', headings: [], mainContent: '', navigation: [] };
        }
    }
    /**
     * 获取支持的源类型
     */
    getSupportedSourceTypes() {
        return [types_2.CaptureSourceType.WEB];
    }
    /**
     * 获取处理器名称
     */
    getName() {
        return 'web-processor';
    }
    /**
     * 获取处理器描述
     */
    getDescription() {
        return '处理网页类型的捕获项，提取内容、链接、图片等信息';
    }
}
exports.WebProcessor = WebProcessor;
// 创建全局网页处理器实例
exports.globalWebProcessor = new WebProcessor();
//# sourceMappingURL=web-processor.js.map