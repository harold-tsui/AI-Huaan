import { http } from '../request'
import type { ApiResponse, SystemConfig, PageParams, PageResult } from '../types'

// 系统配置API
export const systemApi = {
  // 获取系统配置列表
  getConfigs(params?: PageParams & { category?: string; key?: string }) {
    return http.get<ApiResponse<PageResult<SystemConfig>>>('/system/configs', { params })
  },

  // 获取单个配置
  getConfig(id: string) {
    return http.get<ApiResponse<SystemConfig>>(`/system/configs/${id}`)
  },

  // 根据key获取配置
  getConfigByKey(key: string) {
    return http.get<ApiResponse<SystemConfig>>(`/system/configs/key/${key}`)
  },

  // 创建配置
  createConfig(data: Omit<SystemConfig, 'id' | 'updatedAt'>) {
    return http.post<ApiResponse<SystemConfig>>('/system/configs', data)
  },

  // 更新配置
  updateConfig(id: string, data: Partial<SystemConfig>) {
    return http.put<ApiResponse<SystemConfig>>(`/system/configs/${id}`, data)
  },

  // 删除配置
  deleteConfig(id: string) {
    return http.delete<ApiResponse<void>>(`/system/configs/${id}`)
  },

  // 批量更新配置
  batchUpdateConfigs(configs: Array<{ key: string; value: any }>) {
    return http.post<ApiResponse<void>>('/system/configs/batch', { configs })
  },

  // 获取配置分类
  getConfigCategories() {
    return http.get<ApiResponse<string[]>>('/system/configs/categories')
  },

  // 重置配置到默认值
  resetConfig(id: string) {
    return http.post<ApiResponse<SystemConfig>>(`/system/configs/${id}/reset`)
  },

  // 导出配置
  exportConfigs(category?: string) {
    return http.get<ApiResponse<SystemConfig[]>>('/system/configs/export', {
      params: { category }
    })
  },

  // 导入配置
  importConfigs(configs: SystemConfig[]) {
    return http.post<ApiResponse<void>>('/system/configs/import', { configs })
  }
}

// 系统信息API
export const systemInfoApi = {
  // 获取系统信息
  getSystemInfo() {
    return http.get<ApiResponse<{
      version: string
      buildTime: string
      environment: string
      uptime: number
      memory: {
        used: number
        total: number
        free: number
      }
      cpu: {
        usage: number
        cores: number
      }
      disk: {
        used: number
        total: number
        free: number
      }
    }>>('/system/info')
  },

  // 获取系统健康状态
  getHealthStatus() {
    return http.get<ApiResponse<{
      status: 'healthy' | 'warning' | 'error'
      checks: Array<{
        name: string
        status: 'pass' | 'fail' | 'warn'
        message?: string
        duration: number
      }>
      timestamp: string
    }>>('/system/health')
  },

  // 获取系统日志
  getLogs(params: {
    level?: 'error' | 'warn' | 'info' | 'debug'
    startTime?: string
    endTime?: string
    page?: number
    pageSize?: number
  }) {
    return http.get<ApiResponse<PageResult<{
      id: string
      level: string
      message: string
      timestamp: string
      source: string
      metadata?: Record<string, any>
    }>>>('/system/logs', { params })
  },

  // 清理系统日志
  clearLogs(beforeDate?: string) {
    return http.delete<ApiResponse<void>>('/system/logs', {
      params: { beforeDate }
    })
  }
}

// 系统维护API
export const systemMaintenanceApi = {
  // 备份系统数据
  createBackup(options?: {
    includeFiles?: boolean
    includeDatabase?: boolean
    includeConfigs?: boolean
    description?: string
  }) {
    return http.post<ApiResponse<{
      id: string
      filename: string
      size: number
      createdAt: string
    }>>('/system/backup', options)
  },

  // 获取备份列表
  getBackups() {
    return http.get<ApiResponse<Array<{
      id: string
      filename: string
      size: number
      description?: string
      createdAt: string
    }>>>('/system/backups')
  },

  // 恢复备份
  restoreBackup(backupId: string) {
    return http.post<ApiResponse<void>>(`/system/backups/${backupId}/restore`)
  },

  // 删除备份
  deleteBackup(backupId: string) {
    return http.delete<ApiResponse<void>>(`/system/backups/${backupId}`)
  },

  // 下载备份
  downloadBackup(backupId: string) {
    return http.get<Blob>(`/system/backups/${backupId}/download`, {
      responseType: 'blob'
    })
  },

  // 重建索引
  rebuildIndex(type?: 'knowledge' | 'tags' | 'all') {
    return http.post<ApiResponse<{
      taskId: string
      status: string
    }>>('/system/rebuild-index', { type })
  },

  // 清理缓存
  clearCache(type?: 'all' | 'api' | 'static' | 'search') {
    return http.post<ApiResponse<void>>('/system/clear-cache', { type })
  },

  // 优化数据库
  optimizeDatabase() {
    return http.post<ApiResponse<{
      taskId: string
      status: string
    }>>('/system/optimize-database')
  }
}