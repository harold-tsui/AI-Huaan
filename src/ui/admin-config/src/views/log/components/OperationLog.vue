<template>
  <div class="operation-log">
    <!-- 搜索和操作栏 -->
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索操作内容或用户"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="searchForm.module" placeholder="模块" clearable>
            <el-option label="全部" value="" />
            <el-option label="用户管理" value="user" />
            <el-option label="角色管理" value="role" />
            <el-option label="权限管理" value="permission" />
            <el-option label="内容管理" value="content" />
            <el-option label="系统配置" value="system" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="searchForm.action" placeholder="操作类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="创建" value="create" />
            <el-option label="更新" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="查看" value="view" />
            <el-option label="登录" value="login" />
            <el-option label="登出" value="logout" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-col>
      </el-row>
      
      <el-row style="margin-top: 15px;">
        <el-col :span="24">
          <el-button type="warning" @click="handleCleanup">
            <el-icon><Delete /></el-icon>
            清理日志
          </el-button>
          <el-button type="info" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出日志
          </el-button>
          <el-button type="success" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 日志列表 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="logList"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="username" label="用户" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.username }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="module" label="模块" width="100">
          <template #default="{ row }">
            <el-tag :type="getModuleType(row.module)" size="small">
              {{ getModuleText(row.module) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="action" label="操作" width="100">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action)" size="small">
              {{ getActionText(row.action) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="操作描述" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="ip" label="IP地址" width="140" />
        
        <el-table-column prop="userAgent" label="用户代理" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tooltip :content="row.userAgent" placement="top">
              <span>{{ getBrowserInfo(row.userAgent) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        
        <el-table-column prop="duration" label="耗时" width="100" align="center">
          <template #default="{ row }">
            <span :class="getDurationClass(row.duration)">{{ row.duration }}ms</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="操作时间" width="160" />
        
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="操作日志详情"
      width="800px"
      @close="handleDetailClose"
    >
      <div class="log-detail" v-if="currentLog">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志ID">{{ currentLog.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentLog.username }}</el-descriptions-item>
          <el-descriptions-item label="模块">{{ getModuleText(currentLog.module) }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">{{ getActionText(currentLog.action) }}</el-descriptions-item>
          <el-descriptions-item label="操作描述" :span="2">{{ currentLog.description }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
          <el-descriptions-item label="地理位置">{{ currentLog.location }}</el-descriptions-item>
          <el-descriptions-item label="用户代理" :span="2">{{ currentLog.userAgent }}</el-descriptions-item>
          <el-descriptions-item label="请求URL" :span="2">{{ currentLog.url }}</el-descriptions-item>
          <el-descriptions-item label="请求方法">{{ currentLog.method }}</el-descriptions-item>
          <el-descriptions-item label="响应状态">{{ currentLog.responseStatus }}</el-descriptions-item>
          <el-descriptions-item label="耗时">{{ currentLog.duration }}ms</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentLog.status === 'success' ? 'success' : 'danger'">
              {{ currentLog.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作时间" :span="2">{{ currentLog.createdAt }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-section" v-if="currentLog.requestData">
          <h4>请求参数</h4>
          <el-input
            v-model="currentLog.requestData"
            type="textarea"
            :rows="6"
            readonly
          />
        </div>
        
        <div class="detail-section" v-if="currentLog.responseData">
          <h4>响应数据</h4>
          <el-input
            v-model="currentLog.responseData"
            type="textarea"
            :rows="6"
            readonly
          />
        </div>
        
        <div class="detail-section" v-if="currentLog.errorMessage">
          <h4>错误信息</h4>
          <el-alert
            :title="currentLog.errorMessage"
            type="error"
            :closable="false"
            show-icon
          />
        </div>
      </div>
    </el-dialog>

    <!-- 清理日志对话框 -->
    <el-dialog
      v-model="cleanupDialogVisible"
      title="清理日志"
      width="500px"
    >
      <el-form :model="cleanupForm" label-width="120px">
        <el-form-item label="清理策略">
          <el-radio-group v-model="cleanupForm.strategy">
            <el-radio label="days">按天数清理</el-radio>
            <el-radio label="count">按数量清理</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="保留天数" v-if="cleanupForm.strategy === 'days'">
          <el-input-number
            v-model="cleanupForm.days"
            :min="1"
            :max="365"
            controls-position="right"
          />
          <span style="margin-left: 10px; color: #606266;">天</span>
        </el-form-item>
        
        <el-form-item label="保留数量" v-if="cleanupForm.strategy === 'count'">
          <el-input-number
            v-model="cleanupForm.count"
            :min="100"
            :max="100000"
            :step="100"
            controls-position="right"
          />
          <span style="margin-left: 10px; color: #606266;">条</span>
        </el-form-item>
        
        <el-form-item label="清理模块">
          <el-checkbox-group v-model="cleanupForm.modules">
            <el-checkbox label="user">用户管理</el-checkbox>
            <el-checkbox label="role">角色管理</el-checkbox>
            <el-checkbox label="permission">权限管理</el-checkbox>
            <el-checkbox label="content">内容管理</el-checkbox>
            <el-checkbox label="system">系统配置</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cleanupDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleConfirmCleanup" :loading="cleanupLoading">
            确认清理
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Delete,
  Download,
  View
} from '@element-plus/icons-vue'

interface OperationLog {
  id: number
  username: string
  module: string
  action: string
  description: string
  ip: string
  location: string
  userAgent: string
  url: string
  method: string
  requestData: string
  responseData: string
  responseStatus: number
  duration: number
  status: string
  errorMessage: string
  createdAt: string
}

const loading = ref(false)
const cleanupLoading = ref(false)
const detailDialogVisible = ref(false)
const cleanupDialogVisible = ref(false)
const currentLog = ref<OperationLog | null>(null)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  module: '',
  action: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 清理表单
const cleanupForm = reactive({
  strategy: 'days',
  days: 30,
  count: 10000,
  modules: ['user', 'role', 'permission', 'content', 'system']
})

// 日志列表
const logList = ref<OperationLog[]>([
  {
    id: 1,
    username: 'admin',
    module: 'user',
    action: 'create',
    description: '创建用户：张三',
    ip: '192.168.1.100',
    location: '北京市',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    url: '/api/user',
    method: 'POST',
    requestData: '{"username":"zhangsan","name":"张三","email":"zhangsan@example.com"}',
    responseData: '{"code":200,"message":"创建成功","data":{"id":123}}',
    responseStatus: 200,
    duration: 156,
    status: 'success',
    errorMessage: '',
    createdAt: '2024-01-15 14:30:25'
  },
  {
    id: 2,
    username: 'editor',
    module: 'content',
    action: 'update',
    description: '更新文章：Vue 3 学习指南',
    ip: '192.168.1.101',
    location: '上海市',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    url: '/api/content/123',
    method: 'PUT',
    requestData: '{"title":"Vue 3 学习指南","content":"..."}',
    responseData: '{"code":200,"message":"更新成功"}',
    responseStatus: 200,
    duration: 89,
    status: 'success',
    errorMessage: '',
    createdAt: '2024-01-15 14:25:10'
  },
  {
    id: 3,
    username: 'user1',
    module: 'system',
    action: 'view',
    description: '查看系统配置',
    ip: '192.168.1.102',
    location: '广州市',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    url: '/api/system/config',
    method: 'GET',
    requestData: '',
    responseData: '{"code":403,"message":"权限不足"}',
    responseStatus: 403,
    duration: 45,
    status: 'failed',
    errorMessage: '用户权限不足，无法访问系统配置',
    createdAt: '2024-01-15 14:20:33'
  },
  {
    id: 4,
    username: 'admin',
    module: 'role',
    action: 'delete',
    description: '删除角色：测试角色',
    ip: '192.168.1.100',
    location: '北京市',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    url: '/api/role/456',
    method: 'DELETE',
    requestData: '',
    responseData: '{"code":200,"message":"删除成功"}',
    responseStatus: 200,
    duration: 234,
    status: 'success',
    errorMessage: '',
    createdAt: '2024-01-15 14:15:18'
  },
  {
    id: 5,
    username: 'editor',
    module: 'permission',
    action: 'update',
    description: '更新权限：内容管理权限',
    ip: '192.168.1.101',
    location: '上海市',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    url: '/api/permission/789',
    method: 'PUT',
    requestData: '{"name":"内容管理权限","code":"content:manage"}',
    responseData: '{"code":200,"message":"更新成功"}',
    responseStatus: 200,
    duration: 123,
    status: 'success',
    errorMessage: '',
    createdAt: '2024-01-15 14:10:45'
  }
])

// 获取模块类型
const getModuleType = (module: string) => {
  const types: Record<string, string> = {
    user: 'primary',
    role: 'success',
    permission: 'warning',
    content: 'info',
    system: 'danger'
  }
  return types[module] || 'info'
}

// 获取模块文本
const getModuleText = (module: string) => {
  const texts: Record<string, string> = {
    user: '用户管理',
    role: '角色管理',
    permission: '权限管理',
    content: '内容管理',
    system: '系统配置'
  }
  return texts[module] || module
}

// 获取操作类型
const getActionType = (action: string) => {
  const types: Record<string, string> = {
    create: 'success',
    update: 'warning',
    delete: 'danger',
    view: 'info',
    login: 'primary',
    logout: 'info'
  }
  return types[action] || 'info'
}

// 获取操作文本
const getActionText = (action: string) => {
  const texts: Record<string, string> = {
    create: '创建',
    update: '更新',
    delete: '删除',
    view: '查看',
    login: '登录',
    logout: '登出'
  }
  return texts[action] || action
}

// 获取浏览器信息
const getBrowserInfo = (userAgent: string) => {
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Edge'
  if (userAgent.includes('iPhone')) return 'iPhone Safari'
  if (userAgent.includes('Android')) return 'Android Browser'
  return '未知浏览器'
}

// 获取耗时样式类
const getDurationClass = (duration: number) => {
  if (duration < 100) return 'duration-fast'
  if (duration < 500) return 'duration-normal'
  return 'duration-slow'
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadLogList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    module: '',
    action: '',
    dateRange: []
  })
  handleSearch()
}

// 查看详情
const handleViewDetail = (row: OperationLog) => {
  currentLog.value = row
  detailDialogVisible.value = true
}

// 详情对话框关闭
const handleDetailClose = () => {
  currentLog.value = null
}

// 清理日志
const handleCleanup = () => {
  cleanupDialogVisible.value = true
}

// 确认清理
const handleConfirmCleanup = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清理日志吗？此操作不可恢复。',
      '确认清理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    cleanupLoading.value = true
    
    // 这里应该调用API清理日志
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    ElMessage({
      message: '日志清理成功',
      type: 'success'
    })
    
    cleanupDialogVisible.value = false
    loadLogList()
  } catch {
    // 用户取消
  } finally {
    cleanupLoading.value = false
  }
}

// 导出日志
const handleExport = () => {
  const data = logList.value.map(item => ({
    ID: item.id,
    用户名: item.username,
    模块: getModuleText(item.module),
    操作: getActionText(item.action),
    描述: item.description,
    IP地址: item.ip,
    地理位置: item.location,
    耗时: `${item.duration}ms`,
    状态: item.status === 'success' ? '成功' : '失败',
    操作时间: item.createdAt
  }))
  
  const csv = [Object.keys(data[0]).join(',')]
    .concat(data.map(row => Object.values(row).join(',')))
    .join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `operation-log-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  
  ElMessage({
    message: '导出成功',
    type: 'success'
  })
}

// 刷新
const handleRefresh = () => {
  loadLogList()
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  loadLogList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadLogList()
}

// 加载日志列表
const loadLogList = async () => {
  loading.value = true
  try {
    // 这里应该调用API加载日志列表
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = logList.value.length
  } catch (error) {
    console.error('加载日志列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadLogList()
})
</script>

<style lang="scss" scoped>
.operation-log {
  .search-section {
    margin-bottom: 20px;
  }
  
  .table-section {
    .pagination-wrapper {
      margin-top: 20px;
      text-align: right;
    }
  }
  
  .log-detail {
    .detail-section {
      margin-top: 20px;
      
      h4 {
        margin: 0 0 10px 0;
        color: #303133;
        font-size: 14px;
        font-weight: 600;
      }
    }
  }
  
  .duration-fast {
    color: #67c23a;
  }
  
  .duration-normal {
    color: #e6a23c;
  }
  
  .duration-slow {
    color: #f56c6c;
  }
}

@media (max-width: 768px) {
  .operation-log {
    .el-table {
      font-size: 12px;
    }
    
    .pagination-wrapper {
      text-align: center;
    }
  }
}
</style>