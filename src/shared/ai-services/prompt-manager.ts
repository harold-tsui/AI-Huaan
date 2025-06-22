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
    this.logger.info('Simplified loadDefaultTemplates: Clearing templates and calling addBasicTemplates directly.');
    this.templates.clear();
    this.addBasicTemplates(); // Simplified: Direct call, removing try/catch/finally
    this.logger.info(`Simplified loadDefaultTemplates: Loaded ${this.templates.size} prompt templates.`);
  }

  /**
   * 添加基本提示模板
   */
  private addBasicTemplates(): void { // Reverted to normal method
    this.logger.info('[DIAGNOSTIC] addBasicTemplates (normal method) called.');
    const now = new Date().toISOString();
    
    // 摘要模板
    const summaryTemplate: PromptTemplate = {
      id: 'summary-template',
      name: '内容摘要',
      description: '生成文本内容的简洁摘要',
      template: '请为以下内容生成一个简洁的摘要，突出重要的信息：\n\n{{content}}',
      variables: ['content'],
      defaultValues: {},
      tags: ['摘要', '内容处理'],
      category: '内容处理',
      version: '1.0',
      created: now,
      modified: now,
    };
    this.templates.set(summaryTemplate.id, summaryTemplate);

    // 笔记扩展模板
    const expandNoteTemplate: PromptTemplate = {
      id: 'expand-note-template',
      name: '笔记扩展',
      description: '扩展简短笔记为详细内容',
      template: '请基于以下简短笔记，扩展为更详细的内容，保持原意的同时添加相关细节、例子和解释：\n\n{{note}}',
      variables: ['note'],
      defaultValues: {},
      tags: ['笔记', '扩展', '内容生成'],
      category: '内容生成',
      version: '1.0',
      created: now,
      modified: now,
    };
    this.templates.set(expandNoteTemplate.id, expandNoteTemplate);

    // 问题生成模板
    const generateQuestionsTemplate: PromptTemplate = {
      id: 'generate-questions-template',
      name: '问题生成',
      description: '根据提供的内容生成相关问题',
      template: '请根据以下内容生成3-5个相关的问题，这些问题应该有助于更深入地理解主题：\n\n{{content}}',
      variables: ['content'],
      defaultValues: {},
      tags: ['问题生成', '理解辅助'],
      category: '学习工具',
      version: '1.0',
      created: now,
      modified: now,
    };
    this.templates.set(generateQuestionsTemplate.id, generateQuestionsTemplate);

    // 概念连接模板
    const connectConceptsTemplate: PromptTemplate = {
      id: 'connect-concepts-template',
      name: '概念连接',
      description: '识别并连接不同笔记或想法之间的相关概念',
      template: '请分析以下两个概念或笔记，并找出它们之间的潜在联系、相似之处或可以相互补充的方面：\n\n概念A：{{conceptA}}\n\n概念B：{{conceptB}}',
      variables: ['conceptA', 'conceptB'],
      defaultValues: {},
      tags: ['概念连接', '知识网络', '洞察'],
      category: '知识组织',
      version: '1.0',
      created: now,
      modified: now,
    };
    this.templates.set(connectConceptsTemplate.id, connectConceptsTemplate);

    this.logger.info(`Added ${this.templates.size} basic prompt templates`);
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

    if (options?.category) {
      templates = templates.filter(t => t.category === options.category);
    }
    if (options?.tags && options.tags.length > 0) {
      templates = templates.filter(t => 
        options.tags?.every(tag => t.tags?.includes(tag))
      );
    }
    if (options?.search) {
      const searchTerm = options.search.toLowerCase();
      templates = templates.filter(t => 
        t.name.toLowerCase().includes(searchTerm) || 
        t.description.toLowerCase().includes(searchTerm) ||
        t.template.toLowerCase().includes(searchTerm)
      );
    }

    return templates;
  }

  /**
   * 渲染模板
   */
  async renderTemplate(id: string, data: Record<string, any>): Promise<string | null> {
    const template = await this.getTemplate(id);
    if (!template) {
      this.logger.warn(`Template not found: ${id}`);
      return null;
    }

    let rendered = template.template;
    for (const variable of template.variables) {
      const value = data[variable] ?? template.defaultValues?.[variable];
      if (value === undefined) {
        this.logger.warn(`Missing variable '${variable}' for template ${id} and no default value provided.`);
        // Decide on behavior: return null, throw error, or leave placeholder
        return null; // Or: rendered = rendered.replace(new RegExp(`{{${variable}}}`, 'g'), `[MISSING_VAR:${variable}]`);
      }
      rendered = rendered.replace(new RegExp(`{{${variable}}}`, 'g'), String(value));
    }

    return rendered;
  }
}

// 创建全局提示模板管理器实例
export const globalPromptManager = new PromptManager();