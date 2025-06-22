/**
 * Prompt Manager - 提示模板管理器
 *
 * 管理和渲染提示模板
 */
import { IPromptManager, PromptTemplate } from './types';
/**
 * 提示模板管理器实现
 */
export declare class PromptManager implements IPromptManager {
    private logger;
    private templates;
    private config;
    /**
     * 构造函数
     */
    constructor();
    /**
     * 加载默认提示模板
     */
    private loadDefaultTemplates;
    /**
     * 添加基本提示模板
     */
    private addBasicTemplates;
    /**
     * 获取模板
     */
    getTemplate(id: string): Promise<PromptTemplate | null>;
    /**
     * 创建模板
     */
    createTemplate(template: Omit<PromptTemplate, 'id' | 'created' | 'modified'>): Promise<PromptTemplate>;
    /**
     * 更新模板
     */
    updateTemplate(id: string, template: Partial<Omit<PromptTemplate, 'id' | 'created' | 'modified'>>): Promise<PromptTemplate | null>;
    /**
     * 删除模板
     */
    deleteTemplate(id: string): Promise<boolean>;
    /**
     * 列出模板
     */
    listTemplates(options?: {
        category?: string;
        tags?: string[];
        search?: string;
    }): Promise<PromptTemplate[]>;
    /**
     * 渲染模板
     */
    renderTemplate(id: string, data: Record<string, any>): Promise<string | null>;
}
export declare const globalPromptManager: PromptManager;
