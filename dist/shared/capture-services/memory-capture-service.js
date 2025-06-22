"use strict";
/**
 * Memory Capture Service - 内存捕获服务
 *
 * 基于内存的捕获服务实现，用于开发和测试
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
exports.globalMemoryCaptureService = exports.MemoryCaptureService = void 0;
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const jsdom_1 = require("jsdom");
const readability_1 = require("@mozilla/readability");
const config_1 = require("../../utils/config");
const base_capture_service_1 = require("./base-capture-service");
/**
 * 内存捕获服务实现
 */
class MemoryCaptureService extends base_capture_service_1.BaseCaptureService {
    /**
     * 构造函数
     */
    constructor() {
        super();
        this.items = new Map();
        this.config = config_1.ConfigManager.getInstance().getConfig();
        this.tempDir = this.config.captureServices?.tempDir || path.join(os.tmpdir(), 'basb-capture');
        // 确保临时目录存在
        this.ensureTempDir();
        this.logger.info('Initialized memory capture service');
    }
    /**
     * 确保临时目录存在
     */
    ensureTempDir() {
        try {
            if (!fs.existsSync(this.tempDir)) {
                fs.mkdirSync(this.tempDir, { recursive: true });
                this.logger.debug('Created temporary directory', { dir: this.tempDir });
            }
        }
        catch (error) {
            this.logger.error('Failed to create temporary directory', { error: error instanceof Error ? error : String(error) });
            // 回退到系统临时目录
            this.tempDir = os.tmpdir();
        }
    }
    /**
     * 保存捕获项
     */
    async saveCaptureItem(item) {
        this.items.set(item.id, item);
        return item;
    }
    /**
     * 获取捕获项
     */
    async getCaptureItem(id) {
        return this.items.get(id) || null;
    }
    /**
     * 删除捕获项
     */
    async deleteCaptureItem(id) {
        return this.items.delete(id);
    }
    /**
     * 查询捕获项
     */
    async queryCaptureItems(options) {
        let items = Array.from(this.items.values());
        // 应用筛选条件
        if (options.userId) {
            items = items.filter(item => item.userId === options.userId);
        }
        if (options.sourceType) {
            items = items.filter(item => item.sourceType === options.sourceType);
        }
        if (options.status) {
            items = items.filter(item => item.status === options.status);
        }
        if (options.priority) {
            items = items.filter(item => item.priority === options.priority);
        }
        if (options.tags && options.tags.length > 0) {
            items = items.filter(item => {
                if (!item.metadata.tags)
                    return false;
                return options.tags.some(tag => item.metadata.tags.includes(tag));
            });
        }
        if (options.search) {
            const search = options.search.toLowerCase();
            items = items.filter(item => {
                return ((item.metadata.title && item.metadata.title.toLowerCase().includes(search)) ||
                    (item.metadata.description && item.metadata.description.toLowerCase().includes(search)) ||
                    (item.content.text && item.content.text.toLowerCase().includes(search)) ||
                    (item.content.markdown && item.content.markdown.toLowerCase().includes(search)));
            });
        }
        if (options.startDate) {
            const startDate = new Date(options.startDate).getTime();
            items = items.filter(item => new Date(item.created).getTime() >= startDate);
        }
        if (options.endDate) {
            const endDate = new Date(options.endDate).getTime();
            items = items.filter(item => new Date(item.created).getTime() <= endDate);
        }
        // 应用排序
        if (options.sortBy) {
            const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
            items.sort((a, b) => {
                const aValue = this.getNestedProperty(a, options.sortBy);
                const bValue = this.getNestedProperty(b, options.sortBy);
                // 处理 undefined 和 null
                if (aValue === undefined && bValue === undefined)
                    return 0;
                if (aValue === undefined)
                    return -1 * sortOrder;
                if (bValue === undefined)
                    return 1 * sortOrder;
                if (aValue === null && bValue === null)
                    return 0;
                if (aValue === null)
                    return -1 * sortOrder;
                if (bValue === null)
                    return 1 * sortOrder;
                // 使用类型守卫确保类型安全的比较
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder * (aValue - bValue);
                }
                else if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder * aValue.localeCompare(bValue);
                }
                else if (aValue instanceof Date && bValue instanceof Date) {
                    return sortOrder * (aValue.getTime() - bValue.getTime());
                }
                else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
                    return sortOrder * (aValue === bValue ? 0 : aValue ? 1 : -1);
                }
                else {
                    // 转换为字符串进行比较，确保安全
                    const strA = String(aValue);
                    const strB = String(bValue);
                    return sortOrder * strA.localeCompare(strB);
                }
            });
        }
        else {
            // 默认按创建时间降序排序
            items.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        }
        // 应用分页
        const total = items.length;
        if (options.offset !== undefined && options.limit !== undefined) {
            items = items.slice(options.offset, options.offset + options.limit);
        }
        return { items, total };
    }
    /**
     * 获取嵌套属性值
     */
    getNestedProperty(obj, path) {
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[part];
        }
        return current;
    }
    /**
     * 执行网页捕获
     */
    async performWebCapture(options) {
        try {
            // 设置请求头
            const headers = {
                'User-Agent': options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                ...options.headers,
            };
            // 发送请求
            let response;
            try {
                response = await axios_1.default.get(options.url, {
                    headers,
                    timeout: options.timeout || 30000,
                    responseType: 'text',
                    ...(options.proxy ? { proxy: { host: options.proxy.split(':')[0], port: parseInt(options.proxy.split(':')[1]) || 80 } } : {}),
                });
            }
            catch (error) {
                this.logger.error(`Failed to fetch web page: ${options.url}`, { error: error instanceof Error ? error : String(error) });
                throw new Error(`Failed to fetch web page: ${error instanceof Error ? error.message : String(error)}`);
            }
            // 解析HTML
            const dom = new jsdom_1.JSDOM(response.data, { url: options.url });
            const document = dom.window.document;
            // 提取元数据
            const metadata = {
                title: document.title,
                url: options.url,
            };
            // 提取描述
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription && metaDescription.getAttribute('content')) {
                metadata.description = metaDescription.getAttribute('content') || undefined;
            }
            // 提取作者
            const metaAuthor = document.querySelector('meta[name="author"]');
            if (metaAuthor && metaAuthor.getAttribute('content')) {
                metadata.author = metaAuthor.getAttribute('content') || undefined;
            }
            // 使用Readability提取主要内容
            const reader = new readability_1.Readability(document);
            const article = reader.parse();
            // 准备内容
            const content = {
                html: response.data,
            };
            if (article) {
                content.text = article.textContent || '';
                content.markdown = article.content ? this.htmlToMarkdown(article.content) : '';
                if (!metadata.title && article.title) {
                    metadata.title = article.title || undefined;
                }
            }
            else {
                // 如果Readability失败，提取所有文本
                content.text = document.body.textContent || '';
            }
            // 保存截图（如果需要）
            if (options.saveScreenshot) {
                // 注意：这里只是一个占位符，实际实现需要使用无头浏览器如Puppeteer
                this.logger.warn('Screenshot capture not implemented in memory service');
            }
            return { metadata, content };
        }
        catch (error) {
            this.logger.error('Failed to capture web content', { url: options.url, error: error instanceof Error ? error : String(error) });
            throw new Error(`Failed to capture web content: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 执行文件捕获
     */
    async performFileCapture(options) {
        try {
            let fileBuffer = null;
            let fileName = '';
            // 从文件路径、URL或缓冲区获取文件
            if (options.fileBuffer) {
                fileBuffer = options.fileBuffer;
                fileName = 'file-' + Date.now();
            }
            else if (options.filePath) {
                fileBuffer = await fs.promises.readFile(options.filePath);
                fileName = path.basename(options.filePath);
            }
            else if (options.fileUrl) {
                const response = await axios_1.default.get(options.fileUrl, {
                    responseType: 'arraybuffer',
                });
                fileBuffer = Buffer.from(response.data);
                fileName = new URL(options.fileUrl).pathname.split('/').pop() || 'file-' + Date.now();
            }
            else {
                throw new Error('No file source provided');
            }
            // 检查文件大小
            if (options.maxFileSize && fileBuffer.length > options.maxFileSize) {
                throw new Error(`File size exceeds maximum allowed size (${fileBuffer.length} > ${options.maxFileSize})`);
            }
            // 检查文件类型
            const fileType = this.getFileTypeFromBuffer(fileBuffer) || path.extname(fileName).slice(1);
            if (options.allowedFileTypes && !options.allowedFileTypes.includes(fileType)) {
                throw new Error(`File type '${fileType}' not allowed`);
            }
            // 保存文件到临时目录
            const tempFilePath = path.join(this.tempDir, `${Date.now()}-${fileName}`);
            await fs.promises.writeFile(tempFilePath, fileBuffer);
            // 准备元数据
            const metadata = {
                title: fileName,
                fileType,
                fileSize: fileBuffer.length,
            };
            // 准备内容
            const content = {
                filePath: tempFilePath,
            };
            // 提取文本（如果需要）
            if (options.extractText) {
                // 注意：这里只是一个简单实现，实际应根据文件类型使用不同的文本提取方法
                if (['txt', 'md', 'markdown', 'html', 'htm', 'xml', 'json', 'csv'].includes(fileType.toLowerCase())) {
                    content.text = fileBuffer.toString('utf-8');
                }
                else {
                    this.logger.warn('Text extraction not implemented for this file type', { fileType });
                }
            }
            // 提取元数据（如果需要）
            if (options.extractMetadata) {
                // 注意：这里只是一个占位符，实际实现需要根据文件类型提取元数据
                this.logger.warn('Metadata extraction not fully implemented in memory service');
            }
            // 生成缩略图（如果需要）
            if (options.generateThumbnail) {
                // 注意：这里只是一个占位符，实际实现需要使用图像处理库
                this.logger.warn('Thumbnail generation not implemented in memory service');
            }
            return { metadata, content };
        }
        catch (error) {
            this.logger.error('Failed to capture file', { error: error instanceof Error ? error : String(error) });
            throw new Error(`Failed to capture file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 从缓冲区获取文件类型
     */
    getFileTypeFromBuffer(buffer) {
        // 注意：这是一个简化的实现，只检查一些常见的文件类型
        // 实际应用中应使用file-type等库进行更准确的检测
        // 检查文件头部特征
        if (buffer.length < 4)
            return null;
        // PDF: %PDF
        if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
            return 'pdf';
        }
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
            return 'png';
        }
        // JPEG: FF D8 FF
        if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
            return 'jpeg';
        }
        // GIF: GIF87a or GIF89a
        if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
            return 'gif';
        }
        // ZIP: PK
        if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
            return 'zip';
        }
        return null;
    }
    /**
     * 将HTML转换为Markdown
     */
    htmlToMarkdown(html) {
        // 注意：这是一个非常简化的实现
        // 实际应用中应使用turndown等库进行更准确的转换
        let markdown = html;
        // 替换标题
        markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
        markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
        markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
        markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
        markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n');
        markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');
        // 替换段落
        markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
        // 替换链接
        markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');
        // 替换强调
        markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
        markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
        markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
        markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
        // 替换列表
        markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, '$1\n');
        markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, '$1\n');
        markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
        // 替换图片
        markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)');
        markdown = markdown.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*>/gi, '![$1]($2)');
        markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, '![]($1)');
        // 替换代码块
        markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n');
        markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
        // 替换水平线
        markdown = markdown.replace(/<hr[^>]*>/gi, '---\n');
        // 替换引用
        markdown = markdown.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n');
        // 移除剩余的HTML标签
        markdown = markdown.replace(/<[^>]*>/g, '');
        // 解码HTML实体
        markdown = markdown.replace(/&nbsp;/g, ' ');
        markdown = markdown.replace(/&lt;/g, '<');
        markdown = markdown.replace(/&gt;/g, '>');
        markdown = markdown.replace(/&amp;/g, '&');
        markdown = markdown.replace(/&quot;/g, '"');
        // 修复多余的空行
        markdown = markdown.replace(/\n{3,}/g, '\n\n');
        return markdown.trim();
    }
}
exports.MemoryCaptureService = MemoryCaptureService;
// 创建全局内存捕获服务实例
exports.globalMemoryCaptureService = new MemoryCaptureService();
//# sourceMappingURL=memory-capture-service.js.map