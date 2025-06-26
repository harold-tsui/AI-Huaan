import { http } from '../request'
import type { 
  ApiResponse, 
  ParaProject, 
  ParaArea, 
  ParaResource,
  PageParams, 
  PageResult
} from '../types'

// 项目管理API
export const projectApi = {
  // 获取项目列表
  getProjects(params?: PageParams & {
    status?: string
    priority?: string
    tags?: string[]
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<PageResult<ParaProject>>>('/para/projects', { params })
  },

  // 获取单个项目
  getProject(id: string) {
    return http.get<ApiResponse<ParaProject>>(`/para/projects/${id}`)
  },

  // 创建项目
  createProject(data: Omit<ParaProject, 'id' | 'createdAt' | 'updatedAt'>) {
    return http.post<ApiResponse<ParaProject>>('/para/projects', data)
  },

  // 更新项目
  updateProject(id: string, data: Partial<ParaProject>) {
    return http.put<ApiResponse<ParaProject>>(`/para/projects/${id}`, data)
  },

  // 删除项目
  deleteProject(id: string) {
    return http.delete<ApiResponse<void>>(`/para/projects/${id}`)
  },

  // 更新项目状态
  updateProjectStatus(id: string, status: ParaProject['status']) {
    return http.put<ApiResponse<ParaProject>>(`/para/projects/${id}/status`, { status })
  },

  // 更新项目进度
  updateProjectProgress(id: string, progress: number) {
    return http.put<ApiResponse<ParaProject>>(`/para/projects/${id}/progress`, { progress })
  },

  // 归档项目
  archiveProject(id: string) {
    return http.put<ApiResponse<ParaProject>>(`/para/projects/${id}/archive`)
  },

  // 恢复项目
  restoreProject(id: string) {
    return http.put<ApiResponse<ParaProject>>(`/para/projects/${id}/restore`)
  },

  // 获取项目统计
  getProjectStats() {
    return http.get<ApiResponse<{
      total: number
      active: number
      completed: number
      archived: number
      paused: number
      byPriority: Record<string, number>
      recentActivity: Array<{
        projectId: string
        projectName: string
        action: string
        timestamp: string
      }>
    }>>('/para/projects/stats')
  },

  // 获取项目时间线
  getProjectTimeline(id: string) {
    return http.get<ApiResponse<Array<{
      id: string
      type: 'created' | 'updated' | 'status_changed' | 'progress_updated'
      description: string
      timestamp: string
      metadata?: Record<string, any>
    }>>>(`/para/projects/${id}/timeline`)
  },

  // 批量操作项目
  batchUpdateProjects(updates: Array<{
    id: string
    data: Partial<ParaProject>
  }>) {
    return http.put<ApiResponse<void>>('/para/projects/batch', { updates })
  }
}

// 领域管理API
export const areaApi = {
  // 获取领域列表
  getAreas(params?: PageParams & {
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<PageResult<ParaArea>>>('/para/areas', { params })
  },

  // 获取单个领域
  getArea(id: string) {
    return http.get<ApiResponse<ParaArea>>(`/para/areas/${id}`)
  },

  // 创建领域
  createArea(data: Omit<ParaArea, 'id' | 'createdAt' | 'updatedAt'>) {
    return http.post<ApiResponse<ParaArea>>('/para/areas', data)
  },

  // 更新领域
  updateArea(id: string, data: Partial<ParaArea>) {
    return http.put<ApiResponse<ParaArea>>(`/para/areas/${id}`, data)
  },

  // 删除领域
  deleteArea(id: string) {
    return http.delete<ApiResponse<void>>(`/para/areas/${id}`)
  },

  // 获取领域相关项目
  getAreaProjects(id: string, params?: PageParams) {
    return http.get<ApiResponse<PageResult<ParaProject>>>(`/para/areas/${id}/projects`, { params })
  },

  // 获取领域相关资源
  getAreaResources(id: string, params?: PageParams) {
    return http.get<ApiResponse<PageResult<ParaResource>>>(`/para/areas/${id}/resources`, { params })
  },

  // 关联项目到领域
  linkProjectToArea(areaId: string, projectId: string) {
    return http.post<ApiResponse<void>>(`/para/areas/${areaId}/projects/${projectId}`)
  },

  // 取消项目与领域的关联
  unlinkProjectFromArea(areaId: string, projectId: string) {
    return http.delete<ApiResponse<void>>(`/para/areas/${areaId}/projects/${projectId}`)
  },

  // 获取领域统计
  getAreaStats(id: string) {
    return http.get<ApiResponse<{
      projectCount: number
      resourceCount: number
      activeProjects: number
      completedProjects: number
      recentActivity: Array<{
        type: string
        description: string
        timestamp: string
      }>
    }>>(`/para/areas/${id}/stats`)
  }
}

// 资源管理API
export const resourceApi = {
  // 获取资源列表
  getResources(params?: PageParams & {
    type?: string
    category?: string
    tags?: string[]
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    return http.get<ApiResponse<PageResult<ParaResource>>>('/para/resources', { params })
  },

  // 获取单个资源
  getResource(id: string) {
    return http.get<ApiResponse<ParaResource>>(`/para/resources/${id}`)
  },

  // 创建资源
  createResource(data: Omit<ParaResource, 'id' | 'createdAt' | 'updatedAt'>) {
    return http.post<ApiResponse<ParaResource>>('/para/resources', data)
  },

  // 更新资源
  updateResource(id: string, data: Partial<ParaResource>) {
    return http.put<ApiResponse<ParaResource>>(`/para/resources/${id}`, data)
  },

  // 删除资源
  deleteResource(id: string) {
    return http.delete<ApiResponse<void>>(`/para/resources/${id}`)
  },

  // 上传资源文件
  uploadResourceFile(file: File, metadata?: {
    name?: string
    description?: string
    category?: string
    tags?: string[]
  }) {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata))
    }
    return http.post<ApiResponse<ParaResource>>('/para/resources/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 下载资源文件
  downloadResource(id: string) {
    return http.get<Blob>(`/para/resources/${id}/download`, {
      responseType: 'blob'
    })
  },

  // 获取资源分类
  getResourceCategories() {
    return http.get<ApiResponse<Array<{
      name: string
      count: number
      description?: string
    }>>>('/para/resources/categories')
  },

  // 获取资源类型
  getResourceTypes() {
    return http.get<ApiResponse<Array<{
      type: string
      count: number
      description?: string
    }>>>('/para/resources/types')
  },

  // 批量删除资源
  batchDeleteResources(ids: string[]) {
    return http.delete<ApiResponse<void>>('/para/resources/batch', {
      data: { ids }
    })
  },

  // 批量更新资源
  batchUpdateResources(updates: Array<{
    id: string
    data: Partial<ParaResource>
  }>) {
    return http.put<ApiResponse<void>>('/para/resources/batch', { updates })
  }
}

// PARA组织统计API
export const paraStatsApi = {
  // 获取PARA总览统计
  getOverviewStats() {
    return http.get<ApiResponse<{
      projects: {
        total: number
        active: number
        completed: number
        archived: number
      }
      areas: {
        total: number
        withActiveProjects: number
      }
      resources: {
        total: number
        byType: Record<string, number>
        byCategory: Record<string, number>
      }
      recentActivity: Array<{
        type: 'project' | 'area' | 'resource'
        action: string
        target: string
        timestamp: string
      }>
    }>>('/para/stats/overview')
  },

  // 获取项目进度统计
  getProjectProgressStats(timeRange?: 'week' | 'month' | 'quarter' | 'year') {
    return http.get<ApiResponse<{
      progressTrend: Array<{
        date: string
        averageProgress: number
        completedProjects: number
      }>
      priorityDistribution: Record<string, number>
      statusDistribution: Record<string, number>
    }>>('/para/stats/project-progress', {
      params: { timeRange }
    })
  },

  // 获取资源使用统计
  getResourceUsageStats() {
    return http.get<ApiResponse<{
      mostUsedResources: Array<{
        id: string
        name: string
        usageCount: number
        lastUsed: string
      }>
      typeDistribution: Record<string, number>
      categoryDistribution: Record<string, number>
      uploadTrend: Array<{
        date: string
        count: number
      }>
    }>>('/para/stats/resource-usage')
  },

  // 导出PARA数据
  exportParaData(options?: {
    includeProjects?: boolean
    includeAreas?: boolean
    includeResources?: boolean
    format?: 'json' | 'csv' | 'excel'
    dateRange?: [string, string]
  }) {
    return http.post<Blob>('/para/export', options, {
      responseType: 'blob'
    })
  },

  // 导入PARA数据
  importParaData(file: File, options?: {
    format?: 'json' | 'csv' | 'excel'
    mergeStrategy?: 'replace' | 'merge' | 'skip'
  }) {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      formData.append('options', JSON.stringify(options))
    }
    return http.post<ApiResponse<{
      taskId: string
      status: string
      summary: {
        projects: number
        areas: number
        resources: number
      }
    }>>('/para/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}