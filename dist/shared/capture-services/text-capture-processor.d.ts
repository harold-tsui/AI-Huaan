/**
 * Text Capture Processor - 文本捕获处理器
 *
 * 处理纯文本内容
 */
import { IAIService } from '../ai-services/types';
import { IKnowledgeGraphService } from '../knowledge-graph-services/types';
import { BaseCaptureProcessor } from './base-capture-processor';
import { CaptureItem, CaptureItemProcessingResult } from './types';
/**
 * 文本捕获处理器
 */
export declare class TextCaptureProcessor extends BaseCaptureProcessor {
    private aiService?;
    private knowledgeGraphService?;
    /**
     * 构造函数
     * @param aiService AI服务
     * @param knowledgeGraphService 知识图谱服务
     */
    constructor(aiService?: IAIService, knowledgeGraphService?: IKnowledgeGraphService);
    /**
     * 处理文本内容
     * @param item 捕获项
     */
    protected processTextContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 使用AI丰富内容
     * @param text 文本内容
     * @param title 标题
     */
    private enrichContentWithAI;
    /**
     * 创建知识图谱节点
     * @param item 捕获项
     * @param content 内容
     */
    private createKnowledgeGraphNode;
    /**
     * 提取实体并创建关系
     * @param sourceNodeId 源节点ID
     * @param text 文本内容
     */
    private extractAndLinkEntities;
}
