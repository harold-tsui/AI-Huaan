// 导出请求实例和通用方法
export { default as request, http } from './request'

// 导出类型定义
export * from './types'

// 导出API模块
export * from './modules/auth'
export * from './modules/system'
export * from './modules/knowledge'
export * from './modules/para'
export * from './modules/user-group'
export * from './modules/permission'
export * from './modules/role'
export * from './modules/user'

// 统一API对象
import { authApi } from './modules/auth'
import { systemApi, systemInfoApi, systemMaintenanceApi } from './modules/system'
import { 
  knowledgeApi, 
  categoryApi, 
  tagApi, 
  knowledgeProcessingApi 
} from './modules/knowledge'
import { 
  projectApi, 
  areaApi, 
  resourceApi, 
  paraStatsApi 
} from './modules/para'
import { userGroupApi } from './modules/user-group'
import { permissionApi } from './modules/permission'
import { roleApi } from './modules/role'
import { userManagementApi, userApi } from './modules/user'

// 统一导出所有API
export const api = {
  // 认证相关
  auth: authApi,
  userGroup: userGroupApi,
  permission: permissionApi,
  role: roleApi,
  userManagement: userManagementApi,
  user: userApi,
  
  // 系统相关
  system: systemApi,
  systemInfo: systemInfoApi,
  systemMaintenance: systemMaintenanceApi,
  
  // 知识库相关
  knowledge: knowledgeApi,
  category: categoryApi,
  tag: tagApi,
  knowledgeProcessing: knowledgeProcessingApi,
  
  // PARA相关
  project: projectApi,
  area: areaApi,
  resource: resourceApi,
  paraStats: paraStatsApi
}

// 默认导出
export default api