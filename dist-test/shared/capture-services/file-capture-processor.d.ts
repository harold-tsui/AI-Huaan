/**
 * File Capture Processor - 文件捕获处理器
 *
 * 处理从文件捕获的内容
 */
import { IAIService } from '../ai-services/types';
import { IKnowledgeGraphService } from '../knowledge-graph/types';
import { BaseCaptureProcessor } from './base-capture-processor';
import { CaptureItem, CaptureItemProcessingResult } from './types';
/**
 * 文件捕获处理器
 */
export declare class FileCaptureProcessor extends BaseCaptureProcessor {
    private aiService?;
    private knowledgeGraphService?;
    /**
     * 构造函数
     * @param aiService AI服务
     * @param knowledgeGraphService 知识图谱服务
     */
    constructor(aiService?: IAIService, knowledgeGraphService?: IKnowledgeGraphService);
    /**
     * 处理文件内容
     * @param item 捕获项
     */
    protected processFileContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 获取文件信息
     * @param filePath 文件路径
     */
    private getFileInfo;
    /**
     * 处理文本文件
     * @param filePath 文件路径
     * @param mimeType MIME类型
     */
    private processTextFile;
    /**
     * 处理图片文件
     * @param filePath 文件路径
     * @param mimeType MIME类型
     * @returns 处理后的内容
     */
    private processImageFile;
    /**
     * 处理PDF文件
     * @param filePath 文件路径
     * @returns 处理后的内容
     */
    private processPdfFile;
    /**
     * 从HTML中提取文本
     * @param html HTML内容
     */
    private extractTextFromHtml;
    /**
     * 使用AI服务丰富内容
     * @param text 文本内容
     * @param fileName 文件名
     */
    private enrichContentWithAI;
    /**
     * 从消息中获取文本内容
     * @param message AI服务返回的消息
     * @returns 文本内容
     */
    private getMessageText;
    /**
     * 创建知识图谱节点
     * @param item 捕获项
     * @param content 内容
     * @param fileInfo 文件信息
     */
    private createKnowledgeGraphNode;
}
