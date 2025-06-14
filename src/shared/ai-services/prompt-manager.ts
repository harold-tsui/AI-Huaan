/**
 * Prompt Manager - 提示模板管理器
 * 
 * 管理和渲染提示模板
 */

import { v4 as uuidv4 } from 'uuid';
import { ConfigManager } from '../../utils/config';
import { Logger } from '../../utils/logger';
import { IPromptManager, PromptTemplate } from './types';

/**
 * 提示模板管理器实现
 */
export class PromptManager implements IPromptManager {
  private logger: Logger;
  private templates: Map<string, PromptTemplate>;
  private config: Record<string, unknown>;
  
  /**
   * 构造函数
   */
  constructor() {
    this.logger = new Logger('PromptManager');
    this.templates = new Map();
    this.config = ConfigManager.getInstance().getConfig() as unknown as Record<string, unknown>;
    
    // 加载默认模板
    this.loadDefaultTemplates();
  }
  
  /**
   * 加载默认提示模板
   */
  private loadDefaultTemplates(): void {
    try {
      // 从配置中加载默认模板
      const aiServices = this.config.aiServices as { promptTemplates?: PromptTemplate[] } | undefined;
      const defaultTemplates = aiServices?.promptTemplates || [];
      
      for (const template of defaultTemplates) {
        this.templates.set(template.id, {
          ...template,
          created: template.created || new Date().toISOString(),
          modified: template.modified || new Date().toISOString(),
        });
      }
      
      // 如果没有配置模板，添加一些基本模板
      if (this.templates.size === 0) {
        this.addBasicTemplates();
      }
      
      this.logger.info(`Loaded ${this.templates.size} prompt templates`);
    } catch (error) {
      this.logger.error('Failed to load default templates:', { error: error instanceof Error ? error : String(error) });
      // 添加基本模板作为备份
      this.addBasicTemplates();
    }
  }
  
  /**
   * 添加基本提示模板
   */
  private addBasicTemplates(): void {
    const now = new Date().toISOString();
    
    // 摘要模板
    const summaryTemplate: PromptTemplate = {
      id: 'summary-template',
      name: '内容摘要',
      description: '生成文本内容的简洁摘要',
      template: '请为以下内容生成一个简洁的摘要，突出最重要的信息：\n\n{{content}}',
      variables: ['content'],
      tags: ['摘要', '内容处理'],
      category: '内容处理',
      version: '1.0',
      created: now,
      modified: now,
    };
    
    // 笔记扩展模板
    const expandNoteTemplate: PromptTemplate = {
      id: 'expand-note-template',
      name: '笔记扩展',
      description: '扩展简短笔记为详细内容',
      template: '请基于以下简短笔记，扩展为更详细的内容，保持原意的同时添加相关细节、例子和解释：\n\n{{note}}',
      variables: ['note'],
      tags: ['笔记', '扩展', '内容生成'],
      category: '内容生成',
      version: '1.0',
      created: now,
      modified: now,
    };
    
    // 问题生成模板
    const generateQuestionsTemplate: PromptTemplate = {
      id: 'generate-questions-template',
      name: '问题生成',
      description: '基于内容生成深入思考的问题',
      template: '请基于以下内容，生成{{count}}个能促进深入思考的问题：\n\n{{content}}',
      variables: ['content', 'count'],
      defaultValues: { count: '5' },
      tags: ['问题', '思考', '内容分析'],
      category: '内容分析',
      version: '1.0',
      created: now,
      modified: now,
    };
    
    // 连接概念模板
    const connectConceptsTemplate: PromptTemplate = {
      id: 'connect-concepts-template',
      name: '概念连接',
      description: '找出不同概念之间的联系',
      template: '请分析以下概念之间可能存在的联系和关系，找出共同点、差异点以及如何相互补充：\n\n{{concepts}}',
      variables: ['concepts'],
      tags: ['概念', '关系', '分析'],
      category: '内容分析',
      version: '1.0',
      created: now,
      modified: now,
    };
    
    // 添加模板
    this.templates.set(summaryTemplate.id, summaryTemplate);
    this.templates.set(expandNoteTemplate.id, expandNoteTemplate);
    this.templates.set(generateQuestionsTemplate.id, generateQuestionsTemplate);
    this.templates.set(connectConceptsTemplate.id, connectConceptsTemplate);
  }
  
  /**
   * 获取模板
   */
  async getTemplate(id: string): Promise<PromptTemplate | null> {
    return this.templates.get(id) || null;
  }
  
  /**
   * 创建模板
   */
  async createTemplate(template: Omit<PromptTemplate, 'id' | 'created' | 'modified'>): Promise<PromptTemplate> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newTemplate: PromptTemplate = {
      ...template,
      id,
      created: now,
      modified: now,
    };
    
    this.templates.set(id, newTemplate);
    this.logger.info(`Created template: ${id}`);
    
    return newTemplate;
  }
  
  /**
   * 更新模板
   */
  async updateTemplate(id: string, template: Partial<Omit<PromptTemplate, 'id' | 'created' | 'modified'>>): Promise<PromptTemplate | null> {
    const existingTemplate = this.templates.get(id);
    if (!existingTemplate) {
      return null;
    }
    
    const updatedTemplate: PromptTemplate = {
      ...existingTemplate,
      ...template,
      modified: new Date().toISOString(),
    };
    
    this.templates.set(id, updatedTemplate);
    this.logger.info(`Updated template: ${id}`);
    
    return updatedTemplate;
  }
  
  /**
   * 删除模板
   */
  async deleteTemplate(id: string): Promise<boolean> {
    const result = this.templates.delete(id);
    if (result) {
      this.logger.info(`Deleted template: ${id}`);
    }
    return result;
  }
  
  /**
   * 列出模板
   */
  async listTemplates(options?: {
    category?: string;
    tags?: string[];
    search?: string;
  }): Promise<PromptTemplate[]> {
    let templates = Array.from(this.templates.values());
    
    // 按类别筛选
    if (options?.category) {
      templates = templates.filter(template => template.category === options.category);
    }
    
    // 按标签筛选
    if (options?.tags && options.tags.length > 0) {
      templates = templates.filter(template => {
        if (!template.tags) return false;
        return options.tags!.some(tag => template.tags!.includes(tag));
      });
    }
    
    // 按搜索词筛选
    if (options?.search) {
      const search = options.search.toLowerCase();
      templates = templates.filter(template => {
        return (
          template.name.toLowerCase().includes(search) ||
          template.description.toLowerCase().includes(search) ||
          template.template.toLowerCase().includes(search)
        );
      });
    }
    
    return templates;
  }
  
  /**
   * 渲染模板
   */
  async renderTemplate(templateIdOrString: string, variables: Record<string, string>): Promise<string> {
    let templateString: string;
    let templateObj: PromptTemplate | null = null;
    
    // 检查是否为模板ID
    if (templateIdOrString.length < 100 && !templateIdOrString.includes('{{')) {
      templateObj = await this.getTemplate(templateIdOrString);
      if (!templateObj) {
        throw new Error(`Template not found: ${templateIdOrString}`);
      }
      templateString = templateObj.template;
    } else {
      // 直接使用字符串作为模板
      templateString = templateIdOrString;
    }
    
    // 应用默认值（如果有）
    if (templateObj && templateObj.defaultValues) {
      for (const [key, value] of Object.entries(templateObj.defaultValues)) {
        if (!variables[key]) {
          variables[key] = value;
        }
      }
    }
    
    // 替换变量
    let renderedTemplate = templateString;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      renderedTemplate = renderedTemplate.replace(regex, value);
    }
    
    // 检查是否有未替换的变量
    const unreplacedVariables = renderedTemplate.match(/\{\{\w+\}\}/g);
    if (unreplacedVariables) {
      this.logger.warn(`Unreplaced variables in template: ${unreplacedVariables.join(', ')}`);
    }
    
    return renderedTemplate;
  }
}

// 创建全局提示模板管理器实例
export const globalPromptManager = new PromptManager();