/**
 * Web Capture Processor - 网页捕获处理器
 *
 * 处理从网页捕获的内容
 */
import { IAIService } from '../ai-services/types';
import { IKnowledgeGraphService } from '../knowledge-graph-services/types';
import { BaseCaptureProcessor } from './base-capture-processor';
import { CaptureItem, CaptureItemProcessingResult } from './types';
/**
 * 网页捕获处理器
 */
export declare class WebCaptureProcessor extends BaseCaptureProcessor {
    private aiService?;
    private knowledgeGraphService?;
    /**
     * 构造函数
     * @param aiService AI服务
     * @param knowledgeGraphService 知识图谱服务
     */
    constructor(aiService?: IAIService, knowledgeGraphService?: IKnowledgeGraphService);
    /**
     * 处理网页内容
     * @param item 捕获项
     */
    protected processWebContent(item: CaptureItem): Promise<CaptureItemProcessingResult>;
    /**
     * 获取网页内容
     * @param url 网页URL
     */
    private fetchWebPage;
    /**
     * 解析网页内容
     * @param html HTML内容
     * @param url 网页URL
     */
    private parseWebContent;
    /**
     * 将Readability文章转换为Markdown
     * @param article Readability文章
     */
    private convertToMarkdown;
    /**
     * 提取网站图标
     * @param $ Cheerio实例
     * @param url 网页URL
     */
    private extractFavicon;
    /**
     * 使用AI服务丰富内容
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
}
