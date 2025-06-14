/**
 * Text Processor - 文本处理器
 *
 * 处理文本类型的捕获项
 */
import { CaptureItem, CaptureItemProcessingResult, CaptureSourceType, ICaptureProcessor } from '../types';
/**
 * 文本处理器实现
 */
export declare class TextProcessor implements ICaptureProcessor {
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
     * 生成摘要
     */
    private generateSummary;
    /**
     * 提取关键见解
     */
    private extractKeyInsights;
    /**
     * 提取实体
     */
    private extractEntities;
    /**
     * 分析情感
     */
    private analyzeSentiment;
    /**
     * 提取主题
     */
    private extractTopics;
    /**
     * 建议标签
     */
    private suggestTags;
    /**
     * 计算阅读时间（分钟）
     */
    private calculateReadingTime;
    /**
     * 计算文本复杂度（0-1）
     */
    private calculateComplexity;
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
export declare const globalTextProcessor: TextProcessor;
