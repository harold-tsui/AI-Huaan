// 通用API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success: boolean
}

// 分页参数
export interface PageParams {
  page: number
  pageSize: number
  total?: number
}

// 分页响应
export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 用户相关类型
export interface UserInfo {
  id: string
  username: string
  email: string
  avatar?: string
  roles: string[]
  permissions: string[]
  createdAt: string
  updatedAt: string
}

export interface LoginParams {
  username: string
  password: string
  captcha?: string
}

export interface LoginResult {
  token: string
  refreshToken: string
  userInfo: UserInfo
}

// 系统设置相关类型
export interface SystemConfig {
  id: string
  key: string
  value: any
  description?: string
  category: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  updatedAt: string
}

// 知识库相关类型
export interface KnowledgeItem {
  id: string
  title: string
  content: string
  summary?: string
  tags: string[]
  category: string
  type: 'note' | 'document' | 'link' | 'image' | 'video'
  source?: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, any>
}

export interface KnowledgeCategory {
  id: string
  name: string
  description?: string
  parentId?: string
  children?: KnowledgeCategory[]
  itemCount: number
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  color?: string
  description?: string
  usageCount: number
  createdAt: string
}

// PARA组织相关类型
export interface ParaProject {
  id: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived' | 'paused'
  priority: 'high' | 'medium' | 'low'
  startDate?: string
  endDate?: string
  progress: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ParaArea {
  id: string
  name: string
  description?: string
  responsibility: string
  standards: string[]
  resources: string[]
  createdAt: string
  updatedAt: string
}

export interface ParaResource {
  id: string
  name: string
  type: 'reference' | 'template' | 'tool' | 'guide'
  description?: string
  url?: string
  filePath?: string
  tags: string[]
  category: string
  createdAt: string
  updatedAt: string
}

// 知识处理相关类型
export interface ProcessingTask {
  id: string
  name: string
  type: 'import' | 'classify' | 'tag' | 'extract' | 'summarize'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  input: any
  output?: any
  error?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface ImportConfig {
  source: 'file' | 'url' | 'api' | 'obsidian' | 'notion'
  format: 'markdown' | 'html' | 'pdf' | 'docx' | 'txt' | 'json'
  options: Record<string, any>
  autoClassify: boolean
  autoTag: boolean
  extractSummary: boolean
}

// 统计数据类型
export interface DashboardStats {
  totalKnowledge: number
  totalProjects: number
  totalTags: number
  totalCategories: number
  recentActivity: ActivityItem[]
  knowledgeGrowth: ChartData[]
  categoryDistribution: ChartData[]
  tagCloud: TagCloudItem[]
}

export interface ActivityItem {
  id: string
  type: 'create' | 'update' | 'delete' | 'import' | 'export'
  target: string
  targetId: string
  description: string
  timestamp: string
}

export interface ChartData {
  name: string
  value: number
  date?: string
}

export interface TagCloudItem {
  name: string
  value: number
  color?: string
}

// 搜索相关类型
export interface SearchParams {
  query: string
  type?: 'all' | 'note' | 'document' | 'link'
  category?: string
  tags?: string[]
  dateRange?: [string, string]
  sortBy?: 'relevance' | 'date' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult {
  items: KnowledgeItem[]
  total: number
  facets: {
    categories: { name: string; count: number }[]
    tags: { name: string; count: number }[]
    types: { name: string; count: number }[]
  }
  suggestions: string[]
}