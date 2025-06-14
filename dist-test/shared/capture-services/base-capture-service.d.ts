/**
 * Base Capture Service - 基础捕获服务
 *
 * 提供捕获服务的基础实现，作为所有捕获服务实现的基类
 */
import { Logger } from '../../utils/logger';
import { CaptureItem, CaptureItemContent, CaptureItemMetadata, CaptureItemQueryOptions, CaptureSourceType, CreateCaptureItemInput, FileCaptureOptions, ICaptureProcessor, ICaptureService, UpdateCaptureItemInput, WebCaptureOptions } from './types';
/**
 * 基础捕获服务抽象类
 */
export declare abstract class BaseCaptureService implements ICaptureService {
    protected logger: Logger;
    protected processors: Map<string, ICaptureProcessor>;
    /**
     * 构造函数
     */
    constructor();
    /**
     * 创建捕获项
     */
    createCaptureItem(input: CreateCaptureItemInput): Promise<CaptureItem>;
    /**
     * 保存捕获项（由子类实现）
     */
    protected abstract saveCaptureItem(item: CaptureItem): Promise<CaptureItem>;
    /**
     * 获取捕获项（由子类实现）
     */
    abstract getCaptureItem(id: string): Promise<CaptureItem | null>;
    /**
     * 更新捕获项
     */
    updateCaptureItem(id: string, input: UpdateCaptureItemInput): Promise<CaptureItem | null>;
    /**
     * 删除捕获项（由子类实现）
     */
    abstract deleteCaptureItem(id: string): Promise<boolean>;
    /**
     * 查询捕获项（由子类实现）
     */
    abstract queryCaptureItems(options: CaptureItemQueryOptions): Promise<{
        items: CaptureItem[];
        total: number;
    }>;
    /**
     * 处理捕获项
     */
    processCaptureItem(id: string): Promise<CaptureItem | null>;
    /**
     * 归档捕获项
     */
    archiveCaptureItem(id: string): Promise<CaptureItem | null>;
    /**
     * 从网页捕获
     */
    captureFromWeb(options: WebCaptureOptions, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
    /**
     * 执行网页捕获（由子类实现）
     */
    protected abstract performWebCapture(options: WebCaptureOptions): Promise<{
        metadata: Partial<CaptureItemMetadata>;
        content: Partial<CaptureItemContent>;
    }>;
    /**
     * 从文件捕获
     */
    captureFromFile(options: FileCaptureOptions, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
    /**
     * 执行文件捕获（由子类实现）
     */
    protected abstract performFileCapture(options: FileCaptureOptions): Promise<{
        metadata: Partial<CaptureItemMetadata>;
        content: Partial<CaptureItemContent>;
    }>;
    /**
     * 从文本捕获
     */
    captureFromText(text: string, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
    /**
     * 从URL捕获
     */
    captureFromUrl(url: string, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
    /**
     * 判断URL是否为网页URL
     */
    private isWebUrl;
    /**
     * 注册处理器
     */
    registerProcessor(processor: ICaptureProcessor): void;
    /**
     * 获取处理器
     */
    getProcessor(name: string): ICaptureProcessor | null;
    /**
     * 获取所有处理器
     */
    getAllProcessors(): ICaptureProcessor[];
    /**
     * 查找适合的处理器
     */
    protected findSuitableProcessor(sourceType: CaptureSourceType): ICaptureProcessor | null;
}
