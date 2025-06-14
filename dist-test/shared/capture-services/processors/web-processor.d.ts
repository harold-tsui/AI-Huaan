/**
 * Web Processor - 网页处理器
 *
 * 处理网页类型的捕获项
 */
import { CaptureItem, CaptureItemProcessingResult, CaptureSourceType, ICaptureProcessor } from '../types';
/**
 * 网页处理器实现
 */
export declare class WebProcessor implements ICaptureProcessor {
    private logger;
    /**
     * 构造函数
     */
    constructor();
    /**
     * 处理捕获项
     */
    processCaptureItem(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 从HTML提取文本
     */
    private extractTextFromHtml;
    /**
     * 从HTML提取元数据
     */
    private extractMetadataFromHtml;
    /**
     * 从HTML提取链接
     */
    private extractLinksFromHtml;
    /**
     * 从HTML提取图片
     */
    private extractImagesFromHtml;
    /**
     * 分析网页结构
     */
    private analyzeWebPageStructure;
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
export declare const globalWebProcessor: WebProcessor;
