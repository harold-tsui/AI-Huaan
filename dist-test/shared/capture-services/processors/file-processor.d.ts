/**
 * File Processor - 文件处理器
 *
 * 处理文件类型的捕获项
 */
import { CaptureItem, CaptureItemProcessingResult, CaptureSourceType, ICaptureProcessor } from '../types';
/**
 * 文件处理器实现
 */
export declare class FileProcessor implements ICaptureProcessor {
    private logger;
    private readonly textFileTypes;
    private readonly documentFileTypes;
    private readonly imageFileTypes;
    /**
     * 构造函数
     */
    constructor();
    /**
     * 处理捕获项
     */
    processCaptureItem(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 处理文本文件
     */
    private processTextFile;
    /**
     * 处理文档文件
     */
    private processDocumentFile;
    /**
     * 处理图片文件
     */
    private processImageFile;
    /**
     * 处理通用文件
     */
    private processGenericFile;
    /**
     * 分析Markdown结构
     */
    private analyzeMarkdownStructure;
    /**
     * 分析JSON结构
     */
    private analyzeJsonStructure;
    /**
     * 获取JSON值的类型信息
     */
    private getJsonTypeInfo;
    /**
     * 使用AI分析图片
     */
    private analyzeImageWithAI;
    /**
     * 从文件信息生成标签
     */
    private generateTagsFromFileInfo;
    /**
     * 格式化文件大小
     */
    private formatFileSize;
    /**
     * 从MIME类型获取文档类型
     */
    private getDocumentTypeFromMimeType;
    /**
     * 从MIME类型获取图片类型
     */
    private getImageTypeFromMimeType;
    /**
     * 判断是否为文本文件
     */
    private isTextFile;
    /**
     * 判断是否为文档文件
     */
    private isDocumentFile;
    /**
     * 判断是否为图片文件
     */
    private isImageFile;
    /**
     * 获取支持的源类型
     */
    getSupportedSourceTypes(): CaptureSourceType[];
    /**
     * 获取处理器名称
     */
    getName(): string;
    /**
     * 获取处理器描述
     */
    getDescription(): string;
}
export declare const globalFileProcessor: FileProcessor;
