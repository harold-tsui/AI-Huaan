<template>
  <div class="error-log">
    <!-- 搜索和操作栏 -->
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索错误信息"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="searchForm.severity" placeholder="严重程度" clearable>
            <el-option label="全部" value="" />
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="严重" value="critical" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="searchForm.status" placeholder="处理状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="未处理" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已解决" value="resolved" />
            <el-option label="已忽略" value="ignored" />
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
            导出错误
          </el-button>
          <el-button type="success" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button type="primary" @click="handleShowStats">
            <el-icon><DataAnalysis /></el-icon>
            错误分析
          </el-button>
          <el-button type="warning" @click="handleBatchResolve" :disabled="!selectedErrors.length">
            <el-icon><Check /></el-icon>
            批量解决
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-section">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-icon pending">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.pendingCount }}</div>
              <div class="stats-label">待处理</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-icon critical">
              <el-icon><WarningFilled /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.criticalCount }}</div>
              <div class="stats-label">严重错误</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-icon resolved">
              <el-icon><CircleCheckFilled /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.resolvedCount }}</div>
              <div class="stats-label">已解决</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-icon total">
              <el-icon><DocumentCopy /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.totalCount }}</div>
              <div class="stats-label">总错误数</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 错误列表 -->
    <div class="table-section">
      <el-table
        v-loading="loading"
        :data="errorList"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :row-class-name="getRowClassName"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="severity" label="严重程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getSeverityType(row.severity)" size="small">
              <el-icon class="severity-icon">
                <InfoFilled v-if="row.severity === 'low'" />
                <WarningFilled v-else-if="row.severity === 'medium'" />
                <CircleCloseFilled v-else-if="row.severity === 'high'" />
                <CircleCloseFilled v-else />
              </el-icon>
              {{ getSeverityText(row.severity) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="错误类型" width="150">
          <template #default="{ row }">
            <el-tag type="info" size="small" plain>
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="message" label="错误信息" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="error-message">
              <span :class="`message-${row.severity}`">{{ row.message }}</span>
              <el-tag v-if="row.count > 1" type="warning" size="small" class="count-tag">
                {{ row.count }}次
              </el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="source" label="来源" width="180" show-overflow-tooltip />
        
        <el-table-column prop="user" label="用户" width="120">
          <template #default="{ row }">
            <span v-if="row.user">{{ row.user }}</span>
            <span v-else class="system-text">系统</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="assignee" label="处理人" width="120">
          <template #default="{ row }">
            <span v-if="row.assignee">{{ row.assignee }}</span>
            <span v-else class="unassigned-text">未分配</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="firstOccurred" label="首次发生" width="160" />
        
        <el-table-column prop="lastOccurred" label="最后发生" width="160" />
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-dropdown trigger="click" @command="(command: string) => handleAction(command, row)">
              <el-button size="small">
                操作<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="resolve" v-if="row.status !== 'resolved'">
                    <el-icon><Check /></el-icon>标记解决
                  </el-dropdown-item>
                  <el-dropdown-item command="assign">
                    <el-icon><User /></el-icon>分配处理
                  </el-dropdown-item>
                  <el-dropdown-item command="ignore" v-if="row.status !== 'ignored'">
                    <el-icon><Hide /></el-icon>忽略
                  </el-dropdown-item>
                  <el-dropdown-item command="reopen" v-if="row.status === 'resolved' || row.status === 'ignored'">
                    <el-icon><RefreshRight /></el-icon>重新打开
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
      title="错误详情"
      width="1000px"
      @close="handleDetailClose"
    >
      <div class="error-detail" v-if="currentError">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="错误ID">{{ currentError.id }}</el-descriptions-item>
          <el-descriptions-item label="严重程度">
            <el-tag :type="getSeverityType(currentError.severity)">
              {{ getSeverityText(currentError.severity) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="错误类型">{{ currentError.type }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentError.status)">
              {{ getStatusText(currentError.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="发生次数">{{ currentError.count }}次</el-descriptions-item>
          <el-descriptions-item label="处理人">{{ currentError.assignee || '未分配' }}</el-descriptions-item>
          <el-descriptions-item label="首次发生">{{ currentError.firstOccurred }}</el-descriptions-item>
          <el-descriptions-item label="最后发生">{{ currentError.lastOccurred }}</el-descriptions-item>
          <el-descriptions-item label="错误信息" :span="2">
            <div class="detail-message">{{ currentError.message }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="来源" :span="2">{{ currentError.source }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ currentError.user || '系统' }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentError.ip }}</el-descriptions-item>
          <el-descriptions-item label="用户代理" :span="2">{{ currentError.userAgent }}</el-descriptions-item>
          <el-descriptions-item label="请求URL" :span="2">{{ currentError.url }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-section">
          <h4>堆栈跟踪</h4>
          <pre class="stack-trace">{{ currentError.stackTrace }}</pre>
        </div>
        
        <div class="detail-section" v-if="currentError.context">
          <h4>上下文信息</h4>
          <el-table :data="Object.entries(currentError.context).map(([key, value]) => ({ key, value }))" size="small">
            <el-table-column prop="key" label="键" width="200" />
            <el-table-column prop="value" label="值" show-overflow-tooltip />
          </el-table>
        </div>
        
        <div class="detail-section" v-if="currentError.occurrences && currentError.occurrences.length">
          <h4>发生记录</h4>
          <el-table :data="currentError.occurrences" size="small" max-height="300">
            <el-table-column prop="timestamp" label="时间" width="160" />
            <el-table-column prop="user" label="用户" width="120" />
            <el-table-column prop="ip" label="IP地址" width="140" />
            <el-table-column prop="url" label="URL" show-overflow-tooltip />
          </el-table>
        </div>
        
        <div class="detail-section" v-if="currentError.comments && currentError.comments.length">
          <h4>处理记录</h4>
          <el-timeline>
            <el-timeline-item
              v-for="comment in currentError.comments"
              :key="comment.id"
              :timestamp="comment.timestamp"
              placement="top"
            >
              <div class="comment-item">
                <div class="comment-header">
                  <strong>{{ comment.user }}</strong>
                  <el-tag :type="getActionType(comment.action)" size="small">
                    {{ getActionText(comment.action) }}
                  </el-tag>
                </div>
                <div class="comment-content">{{ comment.content }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleAddComment">
            <el-icon><ChatDotRound /></el-icon>
            添加备注
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配处理对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="分配处理人"
      width="400px"
    >
      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="处理人">
          <el-select v-model="assignForm.assignee" placeholder="选择处理人" style="width: 100%">
            <el-option label="张三" value="zhangsan" />
            <el-option label="李四" value="lisi" />
            <el-option label="王五" value="wangwu" />
            <el-option label="赵六" value="zhaoliu" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="assignForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请输入分配说明"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmAssign">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加备注对话框 -->
    <el-dialog
      v-model="commentDialogVisible"
      title="添加处理备注"
      width="500px"
    >
      <el-form :model="commentForm" label-width="80px">
        <el-form-item label="操作类型">
          <el-select v-model="commentForm.action" placeholder="选择操作类型">
            <el-option label="分析" value="analyze" />
            <el-option label="修复" value="fix" />
            <el-option label="测试" value="test" />
            <el-option label="备注" value="comment" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="commentForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入处理说明或备注"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="commentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmComment">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 统计对话框 -->
    <el-dialog
      v-model="statsDialogVisible"
      title="错误统计分析"
      width="1200px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <h4>错误严重程度分布</h4>
            <div id="severityChart" style="height: 300px;"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <h4>错误类型分布</h4>
            <div id="typeChart" style="height: 300px;"></div>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
          <div class="chart-container">
            <h4>错误趋势图</h4>
            <div id="trendChart" style="height: 300px;"></div>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <div class="chart-container">
            <h4>Top 10 错误来源</h4>
            <div id="sourceChart" style="height: 300px;"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <h4>处理状态分布</h4>
            <div id="statusChart" style="height: 300px;"></div>
          </div>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Search,
  Refresh,
  Download,
  View,
  Check,
  User,
  Hide,
  RefreshRight,
  ArrowDown,
  Clock,
  WarningFilled,
  CircleCheckFilled,
  DocumentCopy,
  InfoFilled,
  CircleCloseFilled,
  ChatDotRound,
  DataAnalysis
} from '@element-plus/icons-vue'

interface ErrorLog {
  id: number
  severity: string
  type: string
  message: string
  source: string
  user: string
  ip: string
  userAgent: string
  url: string
  status: string
  assignee: string
  count: number
  firstOccurred: string
  lastOccurred: string
  stackTrace: string
  context?: Record<string, any>
  occurrences?: Array<{
    timestamp: string
    user: string
    ip: string
    url: string
  }>
  comments?: Array<{
    id: number
    user: string
    action: string
    content: string
    timestamp: string
  }>
}

const loading = ref(false)
const detailDialogVisible = ref(false)
const assignDialogVisible = ref(false)
const commentDialogVisible = ref(false)
const statsDialogVisible = ref(false)
const currentError = ref<ErrorLog | null>(null)
const selectedErrors = ref<ErrorLog[]>([])

// 搜索表单
const searchForm = reactive({
  keyword: '',
  severity: '',
  status: '',
  dateRange: []
})

// 分配表单
const assignForm = reactive({
  assignee: '',
  comment: ''
})

// 备注表单
const commentForm = reactive({
  action: '',
  content: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 统计数据
const stats = reactive({
  pendingCount: 45,
  criticalCount: 8,
  resolvedCount: 156,
  totalCount: 234
})

// 错误列表
const errorList = ref<ErrorLog[]>([
  {
    id: 1,
    severity: 'critical',
    type: 'NullPointerException',
    message: '空指针异常：尝试访问null对象的属性',
    source: 'UserService.getUserInfo()',
    user: 'admin',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    url: '/api/user/info',
    status: 'pending',
    assignee: '',
    count: 15,
    firstOccurred: '2024-01-15 10:30:25',
    lastOccurred: '2024-01-15 14:30:25',
    stackTrace: 'java.lang.NullPointerException\n\tat com.example.service.UserService.getUserInfo(UserService.java:45)\n\tat com.example.controller.UserController.getUser(UserController.java:23)',
    context: {
      userId: '12345',
      requestId: 'req_1705312225_001',
      sessionId: 'sess_1705312225_admin'
    },
    occurrences: [
      {
        timestamp: '2024-01-15 14:30:25',
        user: 'admin',
        ip: '192.168.1.100',
        url: '/api/user/info'
      },
      {
        timestamp: '2024-01-15 14:25:10',
        user: 'editor',
        ip: '192.168.1.101',
        url: '/api/user/info'
      }
    ]
  },
  {
    id: 2,
    severity: 'high',
    type: 'DatabaseException',
    message: '数据库连接超时',
    source: 'DatabaseConnection.connect()',
    user: '',
    ip: '127.0.0.1',
    userAgent: '',
    url: '',
    status: 'processing',
    assignee: '张三',
    count: 8,
    firstOccurred: '2024-01-15 12:15:30',
    lastOccurred: '2024-01-15 14:20:15',
    stackTrace: 'java.sql.SQLException: Connection timeout\n\tat com.mysql.cj.jdbc.ConnectionImpl.connectOneTryOnly(ConnectionImpl.java:956)',
    context: {
      host: 'localhost:3306',
      database: 'admin_system',
      timeout: '30s'
    },
    comments: [
      {
        id: 1,
        user: '张三',
        action: 'analyze',
        content: '正在分析数据库连接问题，可能是网络延迟导致',
        timestamp: '2024-01-15 14:25:00'
      }
    ]
  },
  {
    id: 3,
    severity: 'medium',
    type: 'ValidationException',
    message: '用户输入验证失败：邮箱格式不正确',
    source: 'UserValidator.validateEmail()',
    user: 'user1',
    ip: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    url: '/api/user/register',
    status: 'resolved',
    assignee: '李四',
    count: 3,
    firstOccurred: '2024-01-15 13:45:20',
    lastOccurred: '2024-01-15 14:10:30',
    stackTrace: 'com.example.exception.ValidationException: Invalid email format\n\tat com.example.validator.UserValidator.validateEmail(UserValidator.java:15)',
    comments: [
      {
        id: 2,
        user: '李四',
        action: 'fix',
        content: '已修复邮箱验证逻辑，增强了正则表达式匹配',
        timestamp: '2024-01-15 14:15:00'
      }
    ]
  },
  {
    id: 4,
    severity: 'low',
    type: 'WarningException',
    message: '缓存未命中，使用数据库查询',
    source: 'CacheService.get()',
    user: '',
    ip: '127.0.0.1',
    userAgent: '',
    url: '',
    status: 'ignored',
    assignee: '',
    count: 25,
    firstOccurred: '2024-01-15 09:30:00',
    lastOccurred: '2024-01-15 14:00:00',
    stackTrace: 'com.example.warning.CacheWarning: Cache miss for key: user_12345\n\tat com.example.service.CacheService.get(CacheService.java:28)'
  },
  {
    id: 5,
    severity: 'high',
    type: 'SecurityException',
    message: '检测到可疑的登录尝试',
    source: 'SecurityService.checkLogin()',
    user: 'hacker',
    ip: '203.0.113.1',
    userAgent: 'curl/7.68.0',
    url: '/api/auth/login',
    status: 'pending',
    assignee: '王五',
    count: 50,
    firstOccurred: '2024-01-15 11:00:00',
    lastOccurred: '2024-01-15 14:30:00',
    stackTrace: 'com.example.exception.SecurityException: Suspicious login attempt detected\n\tat com.example.service.SecurityService.checkLogin(SecurityService.java:67)',
    context: {
      attemptCount: 50,
      timeWindow: '3 hours',
      blocked: true
    }
  }
])

// 获取行类名
const getRowClassName = ({ row }: { row: ErrorLog }) => {
  return `row-${row.severity}`
}

// 获取严重程度类型
const getSeverityType = (severity: string) => {
  const types: Record<string, string> = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    critical: 'danger'
  }
  return types[severity] || 'info'
}

// 获取严重程度文本
const getSeverityText = (severity: string) => {
  const texts: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重'
  }
  return texts[severity] || severity
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    resolved: 'success',
    ignored: 'info'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    ignored: '已忽略'
  }
  return texts[status] || status
}

// 获取操作类型
const getActionType = (action: string) => {
  const types: Record<string, string> = {
    analyze: 'primary',
    fix: 'success',
    test: 'warning',
    comment: 'info'
  }
  return types[action] || 'info'
}

// 获取操作文本
const getActionText = (action: string) => {
  const texts: Record<string, string> = {
    analyze: '分析',
    fix: '修复',
    test: '测试',
    comment: '备注'
  }
  return texts[action] || action
}

// 选择变化
const handleSelectionChange = (selection: ErrorLog[]) => {
  selectedErrors.value = selection
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadErrorList()
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    severity: '',
    status: '',
    dateRange: []
  })
  handleSearch()
}

// 查看详情
const handleViewDetail = (row: ErrorLog) => {
  currentError.value = row
  detailDialogVisible.value = true
}

// 详情对话框关闭
const handleDetailClose = () => {
  currentError.value = null
}

// 操作处理
const handleAction = (command: string, row: ErrorLog) => {
  currentError.value = row
  
  switch (command) {
    case 'resolve':
      handleResolveError(row)
      break
    case 'assign':
      assignDialogVisible.value = true
      break
    case 'ignore':
      handleIgnoreError(row)
      break
    case 'reopen':
      handleReopenError(row)
      break
  }
}

// 解决错误
const handleResolveError = async (error: ErrorLog) => {
  try {
    // 这里应该调用API标记错误为已解决
    error.status = 'resolved'
    ElMessage({
      message: '错误已标记为解决',
      type: 'success'
    })
  } catch (err) {
    console.error('解决错误失败:', err)
  }
}

// 忽略错误
const handleIgnoreError = async (error: ErrorLog) => {
  try {
    // 这里应该调用API标记错误为忽略
    error.status = 'ignored'
    ElMessage({
      message: '错误已忽略',
      type: 'success'
    })
  } catch (err) {
    console.error('忽略错误失败:', err)
  }
}

// 重新打开错误
const handleReopenError = async (error: ErrorLog) => {
  try {
    // 这里应该调用API重新打开错误
    error.status = 'pending'
    ElMessage({
      message: '错误已重新打开',
      type: 'success'
    })
  } catch (err) {
    console.error('重新打开错误失败:', err)
  }
}

// 确认分配
const handleConfirmAssign = async () => {
  try {
    if (currentError.value) {
      currentError.value.assignee = assignForm.assignee
      currentError.value.status = 'processing'
    }
    
    assignDialogVisible.value = false
    Object.assign(assignForm, {
      assignee: '',
      comment: ''
    })
    
    ElMessage({
      message: '分配成功',
      type: 'success'
    })
  } catch (err) {
    console.error('分配失败:', err)
  }
}

// 添加备注
const handleAddComment = () => {
  commentDialogVisible.value = true
}

// 确认备注
const handleConfirmComment = async () => {
  try {
    if (currentError.value && !currentError.value.comments) {
      currentError.value.comments = []
    }
    
    if (currentError.value) {
      currentError.value.comments!.push({
        id: Date.now(),
        user: '当前用户',
        action: commentForm.action,
        content: commentForm.content,
        timestamp: new Date().toLocaleString()
      })
    }
    
    commentDialogVisible.value = false
    Object.assign(commentForm, {
      action: '',
      content: ''
    })
    
    ElMessage({
      message: '备注添加成功',
      type: 'success'
    })
  } catch (err) {
    console.error('添加备注失败:', err)
  }
}

// 批量解决
const handleBatchResolve = async () => {
  try {
    selectedErrors.value.forEach(error => {
      error.status = 'resolved'
    })
    
    ElMessage({
      message: `已批量解决 ${selectedErrors.value.length} 个错误`,
      type: 'success'
    })
    
    selectedErrors.value = []
  } catch (err) {
    console.error('批量解决失败:', err)
  }
}

// 显示统计
const handleShowStats = () => {
  statsDialogVisible.value = true
  // 这里可以初始化图表
}

// 导出错误
const handleExport = () => {
  const data = errorList.value.map(item => ({
    ID: item.id,
    严重程度: getSeverityText(item.severity),
    错误类型: item.type,
    错误信息: item.message,
    来源: item.source,
    用户: item.user || '系统',
    状态: getStatusText(item.status),
    处理人: item.assignee || '未分配',
    发生次数: item.count,
    首次发生: item.firstOccurred,
    最后发生: item.lastOccurred
  }))
  
  const csv = [Object.keys(data[0]).join(',')]
    .concat(data.map(row => Object.values(row).join(',')))
    .join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `error-log-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  
  ElMessage({
    message: '导出成功',
    type: 'success'
  })
}

// 刷新
const handleRefresh = () => {
  loadErrorList()
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  loadErrorList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadErrorList()
}

// 加载错误列表
const loadErrorList = async () => {
  loading.value = true
  try {
    // 这里应该调用API加载错误列表
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = errorList.value.length
  } catch (error) {
    console.error('加载错误列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadErrorList()
})
</script>

<style lang="scss" scoped>
.error-log {
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
          
          &.pending {
            background: linear-gradient(135deg, #e6a23c, #ebb563);
          }
          
          &.critical {
            background: linear-gradient(135deg, #f56c6c, #f78989);
          }
          
          &.resolved {
            background: linear-gradient(135deg, #67c23a, #85ce61);
          }
          
          &.total {
            background: linear-gradient(135deg, #409eff, #66b1ff);
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
    .severity-icon {
      margin-right: 4px;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .message-critical,
      .message-high {
        color: #f56c6c;
        font-weight: 500;
      }
      
      .message-medium {
        color: #e6a23c;
      }
      
      .message-low {
        color: #909399;
      }
      
      .count-tag {
        flex-shrink: 0;
      }
    }
    
    .system-text {
      color: #909399;
      font-style: italic;
    }
    
    .unassigned-text {
      color: #c0c4cc;
    }
    
    .pagination-wrapper {
      margin-top: 20px;
      text-align: right;
    }
  }
  
  .error-detail {
    .detail-message {
      padding: 10px;
      background-color: #f5f7fa;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      white-space: pre-wrap;
      word-break: break-all;
    }
    
    .stack-trace {
      padding: 10px;
      background-color: #fef0f0;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 300px;
      overflow-y: auto;
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
    
    .comment-item {
      .comment-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 5px;
      }
      
      .comment-content {
        color: #606266;
        line-height: 1.5;
      }
    }
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
  .row-critical {
    background-color: #fef0f0 !important;
  }
  
  .row-high {
    background-color: #fef0f0 !important;
  }
  
  .row-medium {
    background-color: #fdf6ec !important;
  }
  
  .row-low {
    background-color: #f0f9ff !important;
  }
}

@media (max-width: 768px) {
  .error-log {
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