/**
 * Base Capture Processor - 基础捕获处理器
 *
 * 为捕获处理器提供基础实现
 */
import { Logger } from '../../utils/logger';
import { CaptureItem, CaptureItemProcessingResult, CaptureSourceType, ICaptureProcessor } from './types';
/**
 * 基础捕获处理器抽象类
 */
export declare abstract class BaseCaptureProcessor implements ICaptureProcessor {
    protected logger: Logger;
    protected name: string;
    protected description: string;
    protected supportedSourceTypes: CaptureSourceType[];
    /**
     * 构造函数
     * @param name 处理器名称
     * @param description 处理器描述
     * @param supportedSourceTypes 支持的源类型
     */
    constructor(name: string, description: string, supportedSourceTypes: CaptureSourceType[]);
    /**
     * 获取处理器名称
     */
    getName(): string;
    /**
     * 获取处理器描述
     */
    getDescription(): string;
    /**
     * 获取支持的源类型
     */
    getSupportedSourceTypes(): CaptureSourceType[];
    /**
     * 检查是否支持指定的源类型
     * @param sourceType 源类型
     */
    supportsSourceType(sourceType: CaptureSourceType): boolean;
    /**
     * 处理捕获项
     * @param item 捕获项
     */
    processCaptureItem(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 处理网页内容
     * @param item 捕获项
     */
    protected processWebContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 处理文件内容
     * @param item 捕获项
     */
    protected processFileContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 处理文本内容
     * @param item 捕获项
     */
    protected processTextContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 处理图像内容
     * @param item 捕获项
     */
    protected processImageContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 处理音频内容
     * @param item 捕获项
     */
    protected processAudioContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 处理视频内容
     * @param item 捕获项
     */
    protected processVideoContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 处理电子邮件内容
     * @param item 捕获项
     */
    protected processEmailContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 处理RSS内容
     * @param item 捕获项
     */
    protected processRssContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 处理社交媒体内容
     * @param item 捕获项
     */
    protected processSocialContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 处理API内容
     * @param item 捕获项
     */
    protected processApiContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 处理自定义内容
     * @param item 捕获项
     */
    protected processCustomContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 获取不支持的结果
     * @param contentType 内容类型
     */
    protected getUnsupportedResult(contentType: string): CaptureItemProcessingResult;
    /**
     * 提取文本内容
     * @param item 捕获项
     */
    protected extractTextContent(item: CaptureItem): string;
}
