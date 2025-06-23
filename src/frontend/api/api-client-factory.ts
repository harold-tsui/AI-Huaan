/**
 * API客户端工厂
 * 
 * 提供统一的API客户端创建和管理机制
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { KnowledgeItemApiClient } from '@/frontend/api/knowledge-item-api-client';
import { IApiVersionAdapter, V1ToV2Adapter } from '@/frontend/api/api-version-adapter';

/**
 * API配置接口
 */
export interface ApiConfig {
  baseUrl: string;
  version?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * API客户端工厂类
 * 
 * 负责创建和管理各种API客户端实例
 */
export class ApiClientFactory {
  private static instance: ApiClientFactory;
  private readonly config: ApiConfig;
  private knowledgeItemApiClient: KnowledgeItemApiClient | null = null;
  private readonly apiClient: AxiosInstance;
  
  /**
   * 私有构造函数，防止直接实例化
   * @param config API配置
   */
  private constructor(config: ApiConfig) {
    this.config = {
      ...config,
      version: config.version || 'v1',
    };
    this.apiClient = axios.create({
      baseURL: this.config.baseUrl,
      ...this.createAxiosConfig(),
    });

    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * 获取工厂实例（单例模式）
   * @param config API配置
   * @returns ApiClientFactory实例
   */
  public static getInstance(config?: ApiConfig): ApiClientFactory {
    if (!ApiClientFactory.instance) {
      if (!config) {
        throw new Error('初始化ApiClientFactory需要提供配置');
      }
      ApiClientFactory.instance = new ApiClientFactory(config);
    }
    return ApiClientFactory.instance;
  }
  
  /**
   * 重置工厂实例（主要用于测试或配置变更）
   * @param config 新的API配置
   * @returns ApiClientFactory实例
   */
  public static resetInstance(config: ApiConfig): ApiClientFactory {
    ApiClientFactory.instance = new ApiClientFactory(config);
    return ApiClientFactory.instance;
  }
  
  /**
   * 创建Axios请求配置
   * @returns AxiosRequestConfig对象
   */
  private createAxiosConfig(): AxiosRequestConfig {
    return {
      timeout: this.config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(this.config.headers || {}),
      },
    };
  }
  
  /**
   * 获取知识项API客户端
   * @returns KnowledgeItemApiClient实例
   */
  public getKnowledgeItemApiClient(): KnowledgeItemApiClient {
    if (!this.knowledgeItemApiClient) {
      this.knowledgeItemApiClient = new KnowledgeItemApiClient(this);
    }
    return this.knowledgeItemApiClient;
  }
  
  private getVersionAdapter(
    fromVersion: string,
    toVersion: string
  ): IApiVersionAdapter | null {
    const adapterKey = `${fromVersion}To${toVersion}`;
    const adapters: Record<string, IApiVersionAdapter> = {
      v1Tov2: new V1ToV2Adapter(),
      // 其他适配器...
    };

    return adapters[adapterKey] || null;
  }

  public async request(config: AxiosRequestConfig, apiVersion?: string): Promise<any> {
    const clientVersion = this.config.version || 'v1';
    const targetVersion = apiVersion || clientVersion;

    config.url = `/api/${targetVersion}${config.url}`;

    if (targetVersion !== clientVersion) {
      const adapter = this.getVersionAdapter(clientVersion, targetVersion);
      if (adapter) {
        if (config.data) {
          config.data = adapter.adaptRequest(config.data);
        }

        const response = await this.apiClient.request(config);

        if (response.data) {
          response.data = adapter.adaptResponse(response.data);
        }

        return response;
      }
    }

    return this.apiClient.request(config);
  }

  /**
   * 获取当前API配置
   * @returns 当前API配置
   */
  public getConfig(): ApiConfig {
    return { ...this.config };
  }
  
  /**
   * 更新API配置
   * @param config 新的API配置
   */
  public updateConfig(config: Partial<ApiConfig>): void {
    Object.assign(this.config, config);
    this.knowledgeItemApiClient = null;

    this.apiClient.defaults.baseURL = this.config.baseUrl;
    this.apiClient.defaults.timeout = this.config.timeout || 30000;
    this.apiClient.defaults.headers = {
      ...this.apiClient.defaults.headers,
      ...(this.config.headers || {}),
    };
  }
}