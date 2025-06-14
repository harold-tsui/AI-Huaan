/**
 * Capture Service - 捕获服务
 *
 * 管理和处理捕获项的服务
 */
import { BaseService } from '../mcp-core/base-service';
import { MCPRequest, MCPResponse } from '../mcp-core/types';
import { IKnowledgeGraphService } from '../knowledge-graph/types';
import { IAIService } from '../ai-services/types';
import { CaptureItem, CaptureItemQueryOptions, CaptureSourceType, CreateCaptureItemInput, FileCaptureOptions, ICaptureProcessor, ICaptureService, UpdateCaptureItemInput, WebCaptureOptions } from './types';
/**
 * 捕获服务实现
 */
export declare class CaptureService extends BaseService implements ICaptureService {
    handleRequest(request: MCPRequest): Promise<MCPResponse>;
    private processors;
    private knowledgeGraphService?;
    private aiService?;
    /**
     * 构造函数
     */
    constructor();
    /**
     * 初始化服务
     */
    initialize(): Promise<boolean>;
    /**
     * 关闭服务
     */
    shutdown(): Promise<boolean>;
    /**
     * 注册捕获处理器
     * @param processor 捕获处理器
     */
    registerProcessor(processor: ICaptureProcessor): void;
    /**
     * 注销捕获处理器
     * @param processorName 处理器名称
     */
    unregisterProcessor(processorName: string): boolean;
    /**
     * 获取所有注册的处理器
     */
    getProcessors(): ICaptureProcessor[];
    /**
     * 获取支持指定源类型的处理器
     * @param sourceType 源类型
     */
    getProcessorsForSourceType(sourceType: CaptureSourceType): ICaptureProcessor[];
    /**
     * 设置知识图谱服务
     * @param service 知识图谱服务
     */
    setKnowledgeGraphService(service: IKnowledgeGraphService): void;
    /**
     * 设置AI服务
     * @param service AI服务
     */
    setAIService(service: IAIService): void;
    /**
     * 创建捕获项
     * @param input 创建捕获项输入
     */
    createCaptureItem(input: CreateCaptureItemInput): Promise<CaptureItem>;
    /**
     * 获取捕获项
     * @param id 捕获项ID
     */
    getCaptureItem(id: string): Promise<CaptureItem | null>;
    /**
     * 更新捕获项
     * @param id 捕获项ID
     * @param input 更新捕获项输入
     */
    updateCaptureItem(id: string, input: UpdateCaptureItemInput): Promise<CaptureItem | null>;
    /**
     * 删除捕获项
     * @param id 捕获项ID
     */
    deleteCaptureItem(id: string): Promise<boolean>;
    /**
     * 查询捕获项
     * @param options 查询选项
     */
    queryCaptureItems(options: CaptureItemQueryOptions): Promise<{
        items: CaptureItem[];
        total: number;
    }>;
    /**
     * 处理捕获项
     * @param id 捕获项ID
     */
    processCaptureItem(id: string): Promise<CaptureItem | null>;
    /**
     * 归档捕获项
     * @param id 捕获项ID
     */
    archiveCaptureItem(id: string): Promise<CaptureItem | null>;
    /**
     * 从网页捕获内容
     * @param options 网页捕获选项
     * @param input 附加输入
     */
    captureFromWeb(options: WebCaptureOptions, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
    /**
     * 从文件捕获内容
     * @param options 文件捕获选项
     * @param input 附加输入
     */
    captureFromFile(options: FileCaptureOptions, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
    /**
     * 从文本捕获内容
     * @param text 文本内容
     * @param input 附加输入
     */
    captureFromText(text: string, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
    /**
     * 从URL捕获内容
     * @param url URL
     * @param input 附加输入
     */
    captureFromUrl(url: string, input?: Partial<CreateCaptureItemInput>): Promise<CaptureItem>;
    /**
     * 判断URL是否为网页URL
     */
    private isWebUrl;
    /**
     * 获取处理器
     * @param name 处理器名称
     */
    getProcessor(name: string): ICaptureProcessor | null;
    /**
     * 获取所有处理器
     */
    getAllProcessors(): ICaptureProcessor[];
}
export declare const globalCaptureService: CaptureService;
