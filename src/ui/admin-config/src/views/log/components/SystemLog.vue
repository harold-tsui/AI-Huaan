<template>
  <div class="system-log">
    <!-- 搜索和操作栏 -->
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索日志内容"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="searchForm.level" placeholder="日志级别" clearable>
            <el-option label="全部" value="" />
            <el-option label="调试" value="debug" />
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warning" />
            <el-option label="错误" value="error" />
            <el-option label="严重" value="critical" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="searchForm.module" placeholder="模块" clearable>
            <el-option label="全部" value="" />
            <el-option label="认证" value="auth" />
            <el-option label="数据库" value="database" />
            <el-option label="缓存" value="cache" />
            <el-option label="文件" value="file" />
            <el-option label="网络" value="network" />
            <el-option label="系统" value="system" />
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
          <el-button type="info" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出日志
          </el-button>
          <el-button type="success" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="warning" @click="handleCleanup">
            <el-icon><Delete /></el-icon>
            清理日志
          </el-button>
          <el-button type="primary" @click="handleShowStats">
            <el-icon><DataAnalysis /></el-icon>
            统计分析
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-section">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-icon info">
              <el-icon><InfoFilled /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.infoCount }}</div>
              <div class="stats-label">信息日志</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-icon warning">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.warningCount }}</div>
              <div class="stats-label">警告日志</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-icon danger">
              <el-icon><CircleCloseFilled /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.errorCount }}</div>
              <div class="stats-label">错误日志</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-icon critical">
              <el-icon><CircleCloseFilled /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.criticalCount }}</div>
              <div class="stats-label">严重错误</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 日志列表 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="logList"
        stripe
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">
              <el-icon class="level-icon">
                <InfoFilled v-if="row.level === 'info'" />
                <WarningFilled v-else-if="row.level === 'warning'" />
                <CircleCloseFilled v-else-if="row.level === 'error'" />
                <CircleCloseFilled v-else-if="row.level === 'critical'" />
                <Tools v-else />
              </el-icon>
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="module" label="模块" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small" plain>
              {{ getModuleText(row.module) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="message" label="消息" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="log-message">
              <span :class="`message-${row.level}`">{{ row.message }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="source" label="来源" width="150" show-overflow-tooltip />
        
        <el-table-column prop="user" label="用户" width="120">
          <template #default="{ row }">
            <span v-if="row.user">{{ row.user }}</span>
            <span v-else class="system-text">系统</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="ip" label="IP地址" width="140" />
        
        <el-table-column prop="timestamp" label="时间" width="160" />
        
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
      title="系统日志详情"
      width="900px"
      @close="handleDetailClose"
    >
      <div class="log-detail" v-if="currentLog">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志ID">{{ currentLog.id }}</el-descriptions-item>
          <el-descriptions-item label="日志级别">
            <el-tag :type="getLevelType(currentLog.level)">
              {{ getLevelText(currentLog.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="模块">{{ getModuleText(currentLog.module) }}</el-descriptions-item>
          <el-descriptions-item label="来源">{{ currentLog.source }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ currentLog.user || '系统' }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
          <el-descriptions-item label="时间" :span="2">{{ currentLog.timestamp }}</el-descriptions-item>
          <el-descriptions-item label="消息" :span="2">
            <div class="detail-message">{{ currentLog.message }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="详细信息" :span="2" v-if="currentLog.details">
            <pre class="detail-content">{{ currentLog.details }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="堆栈跟踪" :span="2" v-if="currentLog.stackTrace">
            <pre class="stack-trace">{{ currentLog.stackTrace }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="请求ID" v-if="currentLog.requestId">{{ currentLog.requestId }}</el-descriptions-item>
          <el-descriptions-item label="会话ID" v-if="currentLog.sessionId">{{ currentLog.sessionId }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-section" v-if="currentLog.context">
          <h4>上下文信息</h4>
          <el-table :data="Object.entries(currentLog.context).map(([key, value]) => ({ key, value }))" size="small">
            <el-table-column prop="key" label="键" width="200" />
            <el-table-column prop="value" label="值" show-overflow-tooltip />
          </el-table>
        </div>
        
        <div class="detail-section" v-if="currentLog.relatedLogs && currentLog.relatedLogs.length">
          <h4>相关日志</h4>
          <el-table :data="currentLog.relatedLogs" size="small">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="level" label="级别" width="100">
              <template #default="{ row }">
                <el-tag :type="getLevelType(row.level)" size="small">
                  {{ getLevelText(row.level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="消息" show-overflow-tooltip />
            <el-table-column prop="timestamp" label="时间" width="160" />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 清理对话框 -->
    <el-dialog
      v-model="cleanupDialogVisible"
      title="清理系统日志"
      width="500px"
    >
      <el-form :model="cleanupForm" label-width="120px">
        <el-form-item label="清理策略">
          <el-radio-group v-model="cleanupForm.strategy">
            <el-radio label="byTime">按时间</el-radio>
            <el-radio label="byCount">按数量</el-radio>
            <el-radio label="byLevel">按级别</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="保留天数" v-if="cleanupForm.strategy === 'byTime'">
          <el-input-number v-model="cleanupForm.days" :min="1" :max="365" />
          <span class="form-tip">天前的日志将被删除</span>
        </el-form-item>
        
        <el-form-item label="保留数量" v-if="cleanupForm.strategy === 'byCount'">
          <el-input-number v-model="cleanupForm.count" :min="100" :max="100000" :step="100" />
          <span class="form-tip">只保留最新的日志记录</span>
        </el-form-item>
        
        <el-form-item label="清理级别" v-if="cleanupForm.strategy === 'byLevel'">
          <el-checkbox-group v-model="cleanupForm.levels">
            <el-checkbox label="debug">调试</el-checkbox>
            <el-checkbox label="info">信息</el-checkbox>
            <el-checkbox label="warning">警告</el-checkbox>
          </el-checkbox-group>
          <div class="form-tip">选中的级别日志将被删除</div>
        </el-form-item>
        
        <el-form-item>
          <el-alert
            title="警告"
            description="清理操作不可逆，请谨慎操作！建议先导出重要日志。"
            type="warning"
            show-icon
            :closable="false"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cleanupDialogVisible = false">取消</el-button>
          <el-button type="danger" @click="handleConfirmCleanup">确认清理</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 统计对话框 -->
    <el-dialog
      v-model="statsDialogVisible"
      title="系统日志统计"
      width="1000px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <h4>日志级别分布</h4>
            <div id="levelChart" style="height: 300px;"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <h4>模块日志分布</h4>
            <div id="moduleChart" style="height: 300px;"></div>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <div class="chart-container">
            <h4>日志趋势图</h4>
            <div id="trendChart" style="height: 300px;"></div>
          </div>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Refresh,
  Download,
  Delete,
  View,
  InfoFilled,
  WarningFilled,
  CircleCloseFilled,
  Tools,
  DataAnalysis
} from '@element-plus/icons-vue'

interface SystemLog {
  id: number
  level: string
  module: string
  message: string
  source: string
  user: string
  ip: string
  timestamp: string
  details?: string
  stackTrace?: string
  requestId?: string
  sessionId?: string
  context?: Record<string, any>
  relatedLogs?: Array<{
    id: number
    level: string
    message: string
    timestamp: string
  }>
}

const loading = ref(false)
const detailDialogVisible = ref(false)
const cleanupDialogVisible = ref(false)
const statsDialogVisible = ref(false)
const currentLog = ref<SystemLog | null>(null)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  level: '',
  module: '',
  dateRange: []
})

// 清理表单
const cleanupForm = reactive({
  strategy: 'byTime',
  days: 30,
  count: 10000,
  levels: ['debug']
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 统计数据
const stats = reactive({
  infoCount: 2456,
  warningCount: 234,
  errorCount: 45,
  criticalCount: 3
})

// 日志列表
const logList = ref<SystemLog[]>([
  {
    id: 1,
    level: 'error',
    module: 'database',
    message: '数据库连接超时',
    source: 'DatabaseService.connect()',
    user: '',
    ip: '127.0.0.1',
    timestamp: '2024-01-15 14:30:25',
    details: 'Connection timeout after 30 seconds\nHost: localhost:3306\nDatabase: admin_system',
    stackTrace: 'java.sql.SQLException: Connection timeout\n\tat com.mysql.cj.jdbc.ConnectionImpl.connectOneTryOnly(ConnectionImpl.java:956)\n\tat com.mysql.cj.jdbc.ConnectionImpl.createNewIO(ConnectionImpl.java:826)',
    requestId: 'req_1705312225_001',
    context: {
      host: 'localhost:3306',
      database: 'admin_system',
      timeout: '30s',
      retryCount: 3
    }
  },
  {
    id: 2,
    level: 'warning',
    module: 'cache',
    message: 'Redis缓存命中率低于阈值',
    source: 'CacheMonitor.checkHitRate()',
    user: '',
    ip: '127.0.0.1',
    timestamp: '2024-01-15 14:25:10',
    details: 'Cache hit rate: 65%\nThreshold: 80%\nTotal requests: 1000\nCache hits: 650',
    context: {
      hitRate: '65%',
      threshold: '80%',
      totalRequests: 1000,
      cacheHits: 650
    }
  },
  {
    id: 3,
    level: 'info',
    module: 'auth',
    message: '用户登录成功',
    source: 'AuthController.login()',
    user: 'admin',
    ip: '192.168.1.100',
    timestamp: '2024-01-15 14:20:33',
    details: 'User login successful\nUsername: admin\nRole: administrator\nSession: sess_1705311633_admin',
    sessionId: 'sess_1705311633_admin',
    context: {
      username: 'admin',
      role: 'administrator',
      loginMethod: 'password'
    }
  },
  {
    id: 4,
    level: 'critical',
    module: 'system',
    message: '磁盘空间不足',
    source: 'SystemMonitor.checkDiskSpace()',
    user: '',
    ip: '127.0.0.1',
    timestamp: '2024-01-15 14:15:18',
    details: 'Disk space critically low\nPath: /var/log\nUsed: 95%\nAvailable: 2.1GB\nTotal: 50GB',
    context: {
      path: '/var/log',
      usedPercent: '95%',
      available: '2.1GB',
      total: '50GB'
    },
    relatedLogs: [
      {
        id: 5,
        level: 'warning',
        message: '磁盘空间使用率达到90%',
        timestamp: '2024-01-15 14:10:00'
      },
      {
        id: 6,
        level: 'warning',
        message: '磁盘空间使用率达到92%',
        timestamp: '2024-01-15 14:12:30'
      }
    ]
  },
  {
    id: 7,
    level: 'debug',
    module: 'network',
    message: 'API请求处理完成',
    source: 'ApiController.handleRequest()',
    user: 'editor',
    ip: '192.168.1.101',
    timestamp: '2024-01-15 14:10:45',
    details: 'API request processed successfully\nEndpoint: /api/users\nMethod: GET\nResponse time: 125ms',
    requestId: 'req_1705311045_002',
    context: {
      endpoint: '/api/users',
      method: 'GET',
      responseTime: '125ms',
      statusCode: 200
    }
  }
])

// 获取行类名
const getRowClassName = ({ row }: { row: SystemLog }) => {
  return `row-${row.level}`
}

// 获取级别类型
const getLevelType = (level: string) => {
  const types: Record<string, string> = {
    debug: 'info',
    info: 'primary',
    warning: 'warning',
    error: 'danger',
    critical: 'danger'
  }
  return types[level] || 'info'
}

// 获取级别文本
const getLevelText = (level: string) => {
  const texts: Record<string, string> = {
    debug: '调试',
    info: '信息',
    warning: '警告',
    error: '错误',
    critical: '严重'
  }
  return texts[level] || level
}

// 获取模块文本
const getModuleText = (module: string) => {
  const texts: Record<string, string> = {
    auth: '认证',
    database: '数据库',
    cache: '缓存',
    file: '文件',
    network: '网络',
    system: '系统'
  }
  return texts[module] || module
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
    level: '',
    module: '',
    dateRange: []
  })
  handleSearch()
}

// 查看详情
const handleViewDetail = (row: SystemLog) => {
  currentLog.value = row
  detailDialogVisible.value = true
}

// 详情对话框关闭
const handleDetailClose = () => {
  currentLog.value = null
}

// 显示统计
const handleShowStats = () => {
  statsDialogVisible.value = true
  // 这里可以初始化图表
}

// 清理日志
const handleCleanup = () => {
  cleanupDialogVisible.value = true
}

// 确认清理
const handleConfirmCleanup = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要执行清理操作吗？此操作不可逆！',
      '确认清理',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API执行清理
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    cleanupDialogVisible.value = false
    ElMessage({
      message: '日志清理成功',
      type: 'success'
    })
    
    loadLogList()
  } catch {
    // 用户取消操作
  }
}

// 导出日志
const handleExport = () => {
  const data = logList.value.map(item => ({
    ID: item.id,
    级别: getLevelText(item.level),
    模块: getModuleText(item.module),
    消息: item.message,
    来源: item.source,
    用户: item.user || '系统',
    IP地址: item.ip,
    时间: item.timestamp
  }))
  
  const csv = [Object.keys(data[0]).join(',')]
    .concat(data.map(row => Object.values(row).join(',')))
    .join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `system-log-${new Date().toISOString().slice(0, 10)}.csv`
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
.system-log {
  .search-section {
    margin-bottom: 20px;
  }
  
  .stats-section {
    margin-bottom: 20px;
    
    .stats-card {
      .stats-item {
        display: flex;
        align-items: center;
        
        .stats-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          
          .el-icon {
            font-size: 24px;
            color: white;
          }
          
          &.info {
            background: linear-gradient(135deg, #409eff, #66b1ff);
          }
          
          &.warning {
            background: linear-gradient(135deg, #e6a23c, #ebb563);
          }
          
          &.danger {
            background: linear-gradient(135deg, #f56c6c, #f78989);
          }
          
          &.critical {
            background: linear-gradient(135deg, #909399, #b1b3b8);
          }
        }
        
        .stats-content {
          .stats-number {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            line-height: 1;
          }
          
          .stats-label {
            font-size: 14px;
            color: #606266;
            margin-top: 4px;
          }
        }
      }
    }
  }
  
  .table-section {
    .level-icon {
      margin-right: 4px;
    }
    
    .log-message {
      .message-error,
      .message-critical {
        color: #f56c6c;
        font-weight: 500;
      }
      
      .message-warning {
        color: #e6a23c;
      }
      
      .message-info {
        color: #409eff;
      }
      
      .message-debug {
        color: #909399;
      }
    }
    
    .system-text {
      color: #909399;
      font-style: italic;
    }
    
    .pagination-wrapper {
      margin-top: 20px;
      text-align: right;
    }
  }
  
  .log-detail {
    .detail-message {
      padding: 10px;
      background-color: #f5f7fa;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      white-space: pre-wrap;
      word-break: break-all;
    }
    
    .detail-content,
    .stack-trace {
      padding: 10px;
      background-color: #f5f7fa;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .stack-trace {
      background-color: #fef0f0;
      color: #f56c6c;
    }
    
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
  
  .form-tip {
    margin-left: 10px;
    color: #909399;
    font-size: 12px;
  }
  
  .chart-container {
    h4 {
      margin: 0 0 15px 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
    }
  }
}

// 表格行样式
:deep(.el-table) {
  .row-error {
    background-color: #fef0f0 !important;
  }
  
  .row-critical {
    background-color: #f4f4f5 !important;
  }
  
  .row-warning {
    background-color: #fdf6ec !important;
  }
  
  .row-debug {
    background-color: #f8f9fa !important;
  }
}

@media (max-width: 768px) {
  .system-log {
    .stats-section {
      .stats-card {
        margin-bottom: 15px;
        
        .stats-item {
          .stats-icon {
            width: 40px;
            height: 40px;
            
            .el-icon {
              font-size: 20px;
            }
          }
          
          .stats-content {
            .stats-number {
              font-size: 20px;
            }
          }
        }
      }
    }
    
    .el-table {
      font-size: 12px;
    }
    
    .pagination-wrapper {
      text-align: center;
    }
  }
}
</style>