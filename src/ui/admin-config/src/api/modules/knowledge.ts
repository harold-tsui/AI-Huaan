import { http } from '../request'
import type { 
  ApiResponse, 
  KnowledgeItem, 
  KnowledgeCategory, 
  Tag, 
  PageParams, 
  PageResult,
  SearchParams,
  SearchResult
} from '../types'

// 知识库API
export const knowledgeApi = {
  // 获取知识项列表
  getKnowledgeList(params?: PageParams & {
    category?: string
    tags?: string[]
    type?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<PageResult<KnowledgeItem>>>('/knowledge/items', { params })
  },

  // 获取单个知识项
  getKnowledgeItem(id: string) {
    return http.get<ApiResponse<KnowledgeItem>>(`/knowledge/items/${id}`)
  },

  // 创建知识项
  createKnowledgeItem(data: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) {
    return http.post<ApiResponse<KnowledgeItem>>('/knowledge/items', data)
  },

  // 更新知识项
  updateKnowledgeItem(id: string, data: Partial<KnowledgeItem>) {
    return http.put<ApiResponse<KnowledgeItem>>(`/knowledge/items/${id}`, data)
  },

  // 删除知识项
  deleteKnowledgeItem(id: string) {
    return http.delete<ApiResponse<void>>(`/knowledge/items/${id}`)
  },

  // 批量删除知识项
  batchDeleteKnowledgeItems(ids: string[]) {
    return http.delete<ApiResponse<void>>('/knowledge/items/batch', { data: { ids } })
  },

  // 批量更新知识项
  batchUpdateKnowledgeItems(updates: Array<{ id: string; data: Partial<KnowledgeItem> }>) {
    return http.put<ApiResponse<void>>('/knowledge/items/batch', { updates })
  },

  // 搜索知识项
  searchKnowledge(params: SearchParams) {
    return http.post<ApiResponse<SearchResult>>('/knowledge/search', params)
  },

  // 获取相关知识项
  getRelatedKnowledge(id: string, limit = 10) {
    return http.get<ApiResponse<KnowledgeItem[]>>(`/knowledge/items/${id}/related`, {
      params: { limit }
    })
  },

  // 导出知识项
  exportKnowledge(params?: {
    ids?: string[]
    category?: string
    format?: 'json' | 'markdown' | 'csv'
  }) {
    return http.post<Blob>('/knowledge/export', params, {
      responseType: 'blob'
    })
  },

  // 导入知识项
  importKnowledge(file: File, options?: {
    format?: 'json' | 'markdown' | 'csv'
    autoClassify?: boolean
    autoTag?: boolean
    category?: string
  }) {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      formData.append('options', JSON.stringify(options))
    }
    return http.post<ApiResponse<{
      taskId: string
      status: string
      total: number
    }>>('/knowledge/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

// 知识分类API
export const categoryApi = {
  // 获取分类树
  getCategoryTree() {
    return http.get<ApiResponse<KnowledgeCategory[]>>('/knowledge/categories/tree')
  },

  // 获取分类列表
  getCategories(params?: PageParams & { parentId?: string; search?: string }) {
    return http.get<ApiResponse<PageResult<KnowledgeCategory>>>('/knowledge/categories', { params })
  },

  // 获取单个分类
  getCategory(id: string) {
    return http.get<ApiResponse<KnowledgeCategory>>(`/knowledge/categories/${id}`)
  },

  // 创建分类
  createCategory(data: Omit<KnowledgeCategory, 'id' | 'children' | 'itemCount' | 'createdAt'>) {
    return http.post<ApiResponse<KnowledgeCategory>>('/knowledge/categories', data)
  },

  // 更新分类
  updateCategory(id: string, data: Partial<KnowledgeCategory>) {
    return http.put<ApiResponse<KnowledgeCategory>>(`/knowledge/categories/${id}`, data)
  },

  // 删除分类
  deleteCategory(id: string, moveToCategory?: string) {
    return http.delete<ApiResponse<void>>(`/knowledge/categories/${id}`, {
      params: { moveToCategory }
    })
  },

  // 移动分类
  moveCategory(id: string, parentId?: string, position?: number) {
    return http.put<ApiResponse<void>>(`/knowledge/categories/${id}/move`, {
      parentId,
      position
    })
  },

  // 获取分类统计
  getCategoryStats(id: string) {
    return http.get<ApiResponse<{
      itemCount: number
      subCategoryCount: number
      recentItems: KnowledgeItem[]
      topTags: Tag[]
    }>>(`/knowledge/categories/${id}/stats`)
  }
}

// 标签API
export const tagApi = {
  // 获取标签列表
  getTags(params?: PageParams & { search?: string; sortBy?: 'name' | 'usageCount' | 'createdAt' }) {
    return http.get<ApiResponse<PageResult<Tag>>>('/knowledge/tags', { params })
  },

  // 获取热门标签
  getPopularTags(limit = 20) {
    return http.get<ApiResponse<Tag[]>>('/knowledge/tags/popular', {
      params: { limit }
    })
  },

  // 获取单个标签
  getTag(id: string) {
    return http.get<ApiResponse<Tag>>(`/knowledge/tags/${id}`)
  },

  // 创建标签
  createTag(data: Omit<Tag, 'id' | 'usageCount' | 'createdAt'>) {
    return http.post<ApiResponse<Tag>>('/knowledge/tags', data)
  },

  // 更新标签
  updateTag(id: string, data: Partial<Tag>) {
    return http.put<ApiResponse<Tag>>(`/knowledge/tags/${id}`, data)
  },

  // 删除标签
  deleteTag(id: string, replaceWithTag?: string) {
    return http.delete<ApiResponse<void>>(`/knowledge/tags/${id}`, {
      params: { replaceWithTag }
    })
  },

  // 合并标签
  mergeTags(sourceTagIds: string[], targetTagId: string) {
    return http.post<ApiResponse<void>>('/knowledge/tags/merge', {
      sourceTagIds,
      targetTagId
    })
  },

  // 获取标签建议
  getTagSuggestions(query: string, limit = 10) {
    return http.get<ApiResponse<string[]>>('/knowledge/tags/suggestions', {
      params: { query, limit }
    })
  },

  // 自动标签
  autoTag(knowledgeId: string) {
    return http.post<ApiResponse<string[]>>(`/knowledge/items/${knowledgeId}/auto-tag`)
  },

  // 批量自动标签
  batchAutoTag(knowledgeIds: string[]) {
    return http.post<ApiResponse<{
      taskId: string
      status: string
    }>>('/knowledge/auto-tag/batch', { knowledgeIds })
  }
}

// 知识处理API
export const knowledgeProcessingApi = {
  // 提取摘要
  extractSummary(knowledgeId: string, options?: {
    maxLength?: number
    language?: string
  }) {
    return http.post<ApiResponse<string>>(`/knowledge/items/${knowledgeId}/extract-summary`, options)
  },

  // 批量提取摘要
  batchExtractSummary(knowledgeIds: string[], options?: {
    maxLength?: number
    language?: string
  }) {
    return http.post<ApiResponse<{
      taskId: string
      status: string
    }>>('/knowledge/extract-summary/batch', { knowledgeIds, options })
  },

  // 智能分类
  classifyKnowledge(knowledgeId: string) {
    return http.post<ApiResponse<{
      suggestedCategory: string
      confidence: number
      alternatives: Array<{ category: string; confidence: number }>
    }>>(`/knowledge/items/${knowledgeId}/classify`)
  },

  // 批量智能分类
  batchClassifyKnowledge(knowledgeIds: string[]) {
    return http.post<ApiResponse<{
      taskId: string
      status: string
    }>>('/knowledge/classify/batch', { knowledgeIds })
  },

  // 检测重复内容
  detectDuplicates(knowledgeId: string, threshold = 0.8) {
    return http.post<ApiResponse<{
      duplicates: Array<{
        id: string
        title: string
        similarity: number
      }>
    }>>(`/knowledge/items/${knowledgeId}/detect-duplicates`, { threshold })
  },

  // 全局重复检测
  globalDuplicateDetection(threshold = 0.8) {
    return http.post<ApiResponse<{
      taskId: string
      status: string
    }>>('/knowledge/detect-duplicates/global', { threshold })
  }
}