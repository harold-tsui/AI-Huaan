/**
 * Web Capture Processor - 网页捕获处理器
 * 
 * 处理从网页捕获的内容
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import TurndownService from 'turndown';
import { IAIService, MessageRole, ContentType } from '../ai-services/types';
import { globalServiceFactory } from '../mcp-core/service-factory';
import { IKnowledgeGraphService } from '../knowledge-graph-services/types';
import { NodeType, RelationshipType } from '../knowledge-graph-services/types';
import {
  BaseCaptureProcessor,
} from './base-capture-processor';
import {
  CaptureItem,
  CaptureItemContent,
  CaptureItemProcessingResult,
  CaptureSourceType,
} from './types';

/**
 * 网页捕获处理器
 */
export class WebCaptureProcessor extends BaseCaptureProcessor {
  private aiService: IAIService | null;
  private knowledgeGraphService: IKnowledgeGraphService;

  constructor(aiService: IAIService | null, knowledgeGraphService: IKnowledgeGraphService) {
    super(
      'WebCaptureProcessor',
      'Processes web content capture items',
      [CaptureSourceType.WEB]
    );
    this.aiService = aiService;
    this.knowledgeGraphService = knowledgeGraphService;
  }
  
  /**
   * 处理网页内容
   * @param item 捕获项
   */
  async process(item: CaptureItem): Promise<CaptureItemProcessingResult> {
    if (!this.supportsSourceType(item.sourceType)) {
      return {
        success: false,
        message: `Processor ${this.getName()} cannot handle source type ${item.sourceType}`,
        processorName: this.getName(),
      };
    }

    return this.processWebContent(item, this.aiService || undefined, this.knowledgeGraphService);
  }

  protected async processWebContent(
    item: CaptureItem,
    aiService?: IAIService,
    knowledgeGraphService?: IKnowledgeGraphService
  ): Promise<CaptureItemProcessingResult> {
    this.logger.info(`Processing web content: ${item.metadata.url || 'Unknown URL'}`);
    
    try {
      // 检查URL
      const url = item.metadata.url;
      if (!url) {
        return {
          success: false,
          message: 'No URL provided for web content',
          processorName: this.getName(),
        };
      }
      
      // 获取网页内容
      let html: string;
      if (item.content.html) {
        html = item.content.html;
      } else {
        html = await this.fetchWebPage(url);
      }
      
      // 解析网页内容
      const { content: parsedContent, extractedMetadata } = await this.parseWebContent(html, url);
      
      // 更新捕获项内容
      const updatedContent: CaptureItemContent = {
        ...item.content,
        html: parsedContent.html || item.content.html,
        text: parsedContent.text || item.content.text,
        markdown: parsedContent.markdown || item.content.markdown,
        fileUrl: parsedContent.fileUrl || item.content.fileUrl,
      };
      
      let summary = '';
      let suggestedTags: string[] = [];

      if (aiService && parsedContent.text) {
        try {
          // Use chat method to generate summary
          const summaryResult = await aiService.chat([
            { role: MessageRole.USER, content: { type: ContentType.TEXT, text: `Please summarize the following text in about 200 characters: ${parsedContent.text.substring(0, 2000)}` } }
          ]);
          const summaryContent = Array.isArray(summaryResult.message.content) 
            ? summaryResult.message.content[0]?.text || ''
            : summaryResult.message.content.text || '';
          summary = summaryContent;
          
          // Use chat method to extract keywords
          const keywordsResult = await aiService.chat([
            { role: MessageRole.USER, content: { type: ContentType.TEXT, text: `Extract 10 keywords from the following text, return as comma-separated list: ${parsedContent.text.substring(0, 2000)}` } }
          ]);
          const keywordsContent = Array.isArray(keywordsResult.message.content)
            ? keywordsResult.message.content[0]?.text || ''
            : keywordsResult.message.content.text || '';
          suggestedTags = keywordsContent.split(',').map((tag: string) => tag.trim()).slice(0, 10);
        } catch (aiError) {
          this.logger.warn(`AI processing failed for ${url}: ${aiError instanceof Error ? aiError.message : String(aiError)}`);
        }
      }

      if (knowledgeGraphService) {
        try {
          await knowledgeGraphService.createNode({
            type: NodeType.WEBPAGE,
            label: extractedMetadata.title || 'Untitled Web Page',
            properties: {
              ...extractedMetadata,
              url: url,
              webPageId: `web:${url}`
            },
          });
        } catch (kgError) {
          this.logger.warn(`Knowledge graph node creation failed for ${url}: ${kgError instanceof Error ? kgError.message : String(kgError)}`);
        }
      }
      
      return {
        success: true,
        message: 'Web content processed successfully',
        processorName: this.getName(),
        updatedContent,
        extractedMetadata,
        summary,
        suggestedTags,
      };
    } catch (error) {
      this.logger.error(`Error processing web content: ${error instanceof Error ? error.message : String(error)}`, { error: error instanceof Error ? error : String(error) });
      return {
        success: false,
        message: `Error processing web content: ${error instanceof Error ? error.message : String(error)}`,
        processorName: this.getName(),
      };
    }
  }
  
  /**
   * 获取网页内容
   * @param url 网页URL
   */
  private async fetchWebPage(url: string): Promise<string> {
    this.logger.info(`Fetching web page: ${url}`);
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching web page: ${url}`, { error: error instanceof Error ? error : String(error) });
      throw new Error(`Failed to fetch web page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 解析网页内容
   * @param html HTML内容
   * @param url 网页URL
   */
  private async parseWebContent(html: string, url: string): Promise<{ content: Partial<CaptureItemContent>; extractedMetadata: Record<string, any> }> {
    this.logger.info(`Parsing web content from: ${url}`);
    
    try {
      // 使用cheerio解析HTML
      const $ = cheerio.load(html);
      
      // 提取基本元数据
      const title = $('title').text().trim() || '';
      const description = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') || '';
      const author = $('meta[name="author"]').attr('content') || '';
      
      // 使用Readability提取可读内容
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      
      // 构建内容对象
      const content: Partial<CaptureItemContent> = {
        html,
        fileUrl: url,
        text: article?.textContent || '',
        markdown: article ? this.convertToMarkdown(article) : '',
      };
      
      // 提取元数据
      const extractedMetadata = {
        title,
        description,
        author,
        url,
        publishedDate: $('meta[property="article:published_time"]').attr('content') || '',
        siteName: $('meta[property="og:site_name"]').attr('content') || '',
        favicon: this.extractFavicon($, url),
      };
      
      return { content, extractedMetadata };
    } catch (error) {
      this.logger.error(`Error parsing web content: ${url}`, { error: error instanceof Error ? error : String(error) });
      throw new Error(`Failed to parse web content: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * 将Readability文章转换为Markdown
   * @param article Readability文章
   */
  private convertToMarkdown(article: { title?: string | null; byline?: string | null; content?: string | null; textContent?: string | null; siteName?: string | null; publishedTime?: string | null; }): string {
    const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    let markdown = '';
    if (article.content) {
      markdown = turndownService.turndown(article.content);
    } else if (article.textContent) {
      // Fallback if HTML content is not available, though less ideal
      markdown = `# ${article.title || 'Untitled'}\n\n`;
      if (article.byline) {
        markdown += `*By ${article.byline}*\n\n`;
      }
      markdown += article.textContent;
    } else {
      markdown = `# ${article.title || 'Untitled'}\n\nNo content extracted.`;
    }
    return markdown;
  }
  
  /**
   * 提取网站图标
   * @param $ Cheerio实例
   * @param url 网页URL
   */
  private extractFavicon($: cheerio.CheerioAPI, url: string): string {
    // 尝试从不同的链接元素中提取favicon
    const faviconLink = $('link[rel="icon"]').attr('href') ||
                       $('link[rel="shortcut icon"]').attr('href') ||
                       $('link[rel="apple-touch-icon"]').attr('href');
    
    if (!faviconLink) {
      // 返回默认favicon路径
      return new URL('/favicon.ico', url).toString();
    }
    
    // 处理相对URL
    try {
      return new URL(faviconLink, url).toString();
    } catch (error) {
      return new URL('/favicon.ico', url).toString();
    }
  }
  
  /**
   * 使用AI服务丰富内容
   * @param text 文本内容
   * @param title 标题
   */
  private async enrichContentWithAI(text: string, title: string): Promise<{ summary: string; tags: string[] }> {
    this.logger.info(`Enriching content with AI: ${title}`);
    
    if (!this.aiService) {
      return { summary: '', tags: [] };
    }
    
    try {
      // 限制文本长度以避免超出AI模型的上下文窗口
      const truncatedText = text.length > 4000 ? text.substring(0, 4000) + '...' : text;
      
      // 生成摘要
      const summaryPrompt = `Please provide a concise summary (3-5 sentences) of the following content. Title: "${title}"\n\nContent: ${truncatedText}`;
      const summaryResult = await this.aiService.chat([
        { role: MessageRole.SYSTEM, content: { type: ContentType.TEXT, text: 'You are a helpful assistant that creates concise, informative summaries.' } },
        { role: MessageRole.USER, content: { type: ContentType.TEXT, text: summaryPrompt } }
      ]);
      
      // 生成标签
      const tagsPrompt = `Please extract 5-8 relevant tags or keywords from the following content. Provide them as a comma-separated list. Title: "${title}"\n\nContent: ${truncatedText}`;
      const tagsResult = await this.aiService.chat([
        { role: MessageRole.SYSTEM, content: { type: ContentType.TEXT, text: 'You are a helpful assistant that extracts relevant tags and keywords.' } },
        { role: MessageRole.USER, content: { type: ContentType.TEXT, text: tagsPrompt } }
      ]);
      
      // 解析标签
      const tagsContent = typeof tagsResult.message.content === 'string' 
        ? tagsResult.message.content 
        : Array.isArray(tagsResult.message.content) && tagsResult.message.content.length > 0 && tagsResult.message.content[0].text
          ? tagsResult.message.content[0].text
          : '';
          
      const tags = tagsContent
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // 解析摘要
      const summaryContent = typeof summaryResult.message.content === 'string' 
        ? summaryResult.message.content 
        : Array.isArray(summaryResult.message.content) && summaryResult.message.content.length > 0 && summaryResult.message.content[0].text
          ? summaryResult.message.content[0].text
          : '';
          
      return {
        summary: summaryContent,
        tags,
      };
    } catch (error) {
      this.logger.error(`Error enriching content with AI: ${title}`, { error: error instanceof Error ? error : String(error) });
      return { summary: '', tags: [] };
    }
  }
  
  /**
   * 创建知识图谱节点
   * @param item 捕获项
   * @param content 内容
   */
  private async createKnowledgeGraphNode(item: CaptureItem, content: CaptureItemContent): Promise<void> {
    if (!this.knowledgeGraphService) {
      return;
    }
    
    this.logger.info(`Creating knowledge graph node for: ${item.metadata.title || 'Untitled'}`);
    
    try {
      // 创建网页节点
      const contentWithExtras = content as { title?: string; url?: string; summary?: string; tags?: string[] };
      const webPageNode = await this.knowledgeGraphService.createNode({
        type: NodeType.WEBPAGE,
        label: contentWithExtras.title || item.metadata.title || 'Untitled',
        properties: {
          title: contentWithExtras.title || item.metadata.title || 'Untitled',
          url: contentWithExtras.url || item.metadata.url || '',
          summary: contentWithExtras.summary || '',
          captureDate: item.created,
          captureId: item.id,
        },
      });
      
      // 如果有标签，为每个标签创建节点并建立关系
      if (contentWithExtras.tags && Array.isArray(contentWithExtras.tags)) {
        for (const tag of contentWithExtras.tags) {
          // 查找或创建标签节点
          const tagNodes = await this.knowledgeGraphService.queryNodes({
            types: [NodeType.TAG],
            properties: { name: tag },
            limit: 1
          });
          
          let tagNode;
          if (tagNodes.length > 0) {
            tagNode = tagNodes[0];
          } else {
            tagNode = await this.knowledgeGraphService.createNode({
              type: NodeType.TAG,
              label: tag,
              properties: { name: tag },
            });
          }
          
          // 创建网页到标签的关系
          await this.knowledgeGraphService.createRelationship({
            sourceNodeId: webPageNode.id,
            targetNodeId: tagNode.id,
            type: RelationshipType.HAS_TAG,
            label: 'Has Tag',
            properties: {},
          });
        }
      }
      
      this.logger.info(`Knowledge graph node created successfully: ${webPageNode.id}`);
    } catch (error) {
      this.logger.error(`Error creating knowledge graph node: ${error instanceof Error ? error.message : String(error)}`, { error: error instanceof Error ? error : String(error) });
    }
  }
}