/**
 * Memory Capture Service - 内存捕获服务
 *
 * 基于内存的捕获服务实现，用于开发和测试
 */
import { BaseCaptureService } from './base-capture-service';
import { CaptureItem, CaptureItemContent, CaptureItemMetadata, CaptureItemQueryOptions, FileCaptureOptions, WebCaptureOptions } from './types';
/**
 * 内存捕获服务实现
 */
export declare class MemoryCaptureService extends BaseCaptureService {
    private items;
    private config;
    private tempDir;
    /**
     * 构造函数
     */
    constructor();
    /**
     * 确保临时目录存在
     */
    private ensureTempDir;
    /**
     * 保存捕获项
     */
    protected saveCaptureItem(item: CaptureItem): Promise<CaptureItem>;
    /**
     * 获取捕获项
     */
    getCaptureItem(id: string): Promise<CaptureItem | null>;
    /**
     * 删除捕获项
     */
    deleteCaptureItem(id: string): Promise<boolean>;
    /**
     * 查询捕获项
     */
    queryCaptureItems(options: CaptureItemQueryOptions): Promise<{
        items: CaptureItem[];
        total: number;
    }>;
    /**
     * 获取嵌套属性值
     */
    private getNestedProperty;
    /**
     * 执行网页捕获
     */
    protected performWebCapture(options: WebCaptureOptions): Promise<{
        metadata: Partial<CaptureItemMetadata>;
        content: Partial<CaptureItemContent>;
    }>;
    /**
     * 执行文件捕获
     */
    protected performFileCapture(options: FileCaptureOptions): Promise<{
        metadata: Partial<CaptureItemMetadata>;
        content: Partial<CaptureItemContent>;
    }>;
    /**
     * 从缓冲区获取文件类型
     */
    private getFileTypeFromBuffer;
    /**
     * 将HTML转换为Markdown
     */
    private htmlToMarkdown;
}
export declare const globalMemoryCaptureService: MemoryCaptureService;
