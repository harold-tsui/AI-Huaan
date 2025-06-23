/**
 * Knowledge Item API Client
 * 
 * 提供与知识项API交互的客户端实现
 */

import { AxiosResponse } from 'axios';
import { ApiClientFactory } from '@/frontend/api/api-client-factory';
import { ContentType, SecurityLevel, SourceType } from '@/frontend/api/types';

/**
 * 知识项接口
 */
export interface KnowledgeItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  contentType: ContentType;
  source: Source;
  metadata: Metadata;
  securityLevel: SecurityLevel;
  createdAt: string;
  updatedAt: string;
}

/**
 * 来源接口
 */
export interface Source {
  type: SourceType;
  url?: string;
  author?: string;
}

/**
 * 元数据接口
 */
export interface Metadata {
  tags: string[];
  categories: string[];
  language: string;
  readingTime?: number;
  importance: number;
}

/**
 * 知识项过滤器接口
 */
export interface KnowledgeItemFilters {
  title?: string;
  contentType?: ContentType;
  tags?: string[];
  categories?: string[];
  createdAt?: IntRange;
  importance?: IntRange;
  sortBy?: KnowledgeItemSortField;
  sortDirection?: SortDirection;
  limit?: number;
  offset?: number;
}

/**
 * 整数范围接口
 */
export interface IntRange {
  min?: number;
  max?: number;
}

/**
 * 知识项排序字段枚举
 */
export enum KnowledgeItemSortField {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  TITLE = 'TITLE',
  IMPORTANCE = 'IMPORTANCE'
}

/**
 * 排序方向枚举
 */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

/**
 * 创建知识项输入接口
 */
export interface CreateKnowledgeItemInput {
  title: string;
  content: string;
  contentType: ContentType;
  source: Source;
  metadata: Metadata;
  securityLevel: SecurityLevel;
}

/**
 * 更新知识项输入接口
 */
export interface UpdateKnowledgeItemInput {
  title?: string;
  content?: string;
  contentType?: ContentType;
  source?: Source;
  metadata?: Metadata;
  securityLevel?: SecurityLevel;
}

/**
 * 分页结果接口
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * API响应接口
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: Record<string, any>;
}

/**
 * API错误接口
 */
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * 知识项API客户端类
 */
export class KnowledgeItemApiClient {
  private readonly factory: ApiClientFactory;
  
  constructor(factory: ApiClientFactory) {
    this.factory = factory;
  }
  
  /**
   * 获取用户的知识项列表
   * @param userId 用户ID
   * @param filters 过滤条件
   * @returns 分页知识项列表
   */
  async getKnowledgeItems(
    userId: string,
    filters?: KnowledgeItemFilters
  ): Promise<PaginatedResult<KnowledgeItem>> {
    try {
      const response: AxiosResponse<ApiResponse<PaginatedResult<KnowledgeItem>>> = await this.factory.request({
        method: 'GET',
        url: `/users/${userId}/knowledge-items`,
        params: filters,
      });

      return response.data.data as PaginatedResult<KnowledgeItem>;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  /**
   * 获取特定知识项
   * @param userId 用户ID
   * @param itemId 知识项ID
   * @returns 知识项
   */
  async getKnowledgeItem(userId: string, itemId: string): Promise<KnowledgeItem> {
    try {
      const response: AxiosResponse<ApiResponse<KnowledgeItem>> = await this.factory.request({
        method: 'GET',
        url: `/users/${userId}/knowledge-items/${itemId}`,
      });

      return response.data.data as KnowledgeItem;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  /**
   * 创建知识项
   * @param userId 用户ID
   * @param input 创建知识项输入
   * @returns 创建的知识项
   */
  async createKnowledgeItem(
    userId: string,
    input: CreateKnowledgeItemInput
  ): Promise<KnowledgeItem> {
    try {
      const response: AxiosResponse<ApiResponse<KnowledgeItem>> = await this.factory.request({
        method: 'POST',
        url: `/users/${userId}/knowledge-items`,
        data: input,
      });

      return response.data.data as KnowledgeItem;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  /**
   * 更新知识项
   * @param userId 用户ID
   * @param itemId 知识项ID
   * @param input 更新知识项输入
   * @returns 更新后的知识项
   */
  async updateKnowledgeItem(
    userId: string,
    itemId: string,
    input: UpdateKnowledgeItemInput
  ): Promise<KnowledgeItem> {
    try {
      const response: AxiosResponse<ApiResponse<KnowledgeItem>> = await this.factory.request({
        method: 'PUT',
        url: `/users/${userId}/knowledge-items/${itemId}`,
        data: input,
      });

      return response.data.data as KnowledgeItem;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  /**
   * 部分更新知识项
   * @param userId 用户ID
   * @param itemId 知识项ID
   * @param input 部分更新知识项输入
   * @returns 更新后的知识项
   */
  async patchKnowledgeItem(
    userId: string,
    itemId: string,
    input: Partial<UpdateKnowledgeItemInput>
  ): Promise<KnowledgeItem> {
    try {
      const response: AxiosResponse<ApiResponse<KnowledgeItem>> = await this.factory.request({
        method: 'PATCH',
        url: `/users/${userId}/knowledge-items/${itemId}`,
        data: input,
      });

      return response.data.data as KnowledgeItem;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  /**
   * 删除知识项
   * @param userId 用户ID
   * @param itemId 知识项ID
   * @returns 是否成功
   */
  async deleteKnowledgeItem(userId: string, itemId: string): Promise<boolean> {
    try {
      const response: AxiosResponse<ApiResponse<{ success: boolean }>> = await this.factory.request({
        method: 'DELETE',
        url: `/users/${userId}/knowledge-items/${itemId}`,
      });

      return response.data.data?.success || false;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  /**
   * 搜索知识项
   * @param userId 用户ID
   * @param query 搜索查询
   * @param filters 过滤条件
   * @returns 分页知识项列表
   */
  async searchKnowledgeItems(
    userId: string,
    query: string,
    filters?: Omit<KnowledgeItemFilters, 'title'>
  ): Promise<PaginatedResult<KnowledgeItem>> {
    try {
      const response: AxiosResponse<ApiResponse<PaginatedResult<KnowledgeItem>>> = await this.factory.request({
        method: 'GET',
        url: `/users/${userId}/knowledge-items/search`,
        params: {
          query,
          ...filters,
        },
      });

      return response.data.data as PaginatedResult<KnowledgeItem>;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  /**
   * 处理API错误
   * @param error 错误对象
   */
  private handleApiError(error: any): void {
    const apiError = error.response?.data?.error as ApiError;
    if (apiError) {
      console.error(
        `API Error: ${apiError.code} - ${apiError.message}`,
        apiError.details
      );
    } else if (error.response) {
      console.error(
        `HTTP Error: ${error.response.status} - ${error.response.statusText}`
      );
    } else {
      console.error('Network Error:', error.message);
    }
  }
}