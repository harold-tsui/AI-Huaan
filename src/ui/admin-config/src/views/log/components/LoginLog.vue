<template>
  <div class="login-log">
    <!-- 搜索和操作栏 -->
    <div class="search-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名或IP"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="searchForm.status" placeholder="登录状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="searchForm.device" placeholder="设备类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="桌面端" value="desktop" />
            <el-option label="移动端" value="mobile" />
            <el-option label="平板" value="tablet" />
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
          <el-button type="primary" @click="handleShowStats">
            <el-icon><DataAnalysis /></el-icon>
            登录统计
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-section">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-icon success">
              <el-icon><Check /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.successCount }}</div>
              <div class="stats-label">成功登录</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-icon danger">
              <el-icon><Close /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.failedCount }}</div>
              <div class="stats-label">失败登录</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-icon warning">
              <el-icon><User /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.uniqueUsers }}</div>
              <div class="stats-label">活跃用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stats-card">
          <div class="stats-item">
            <div class="stats-icon info">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-number">{{ stats.uniqueIps }}</div>
              <div class="stats-label">不同IP</div>
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
      >
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="username" label="用户名" width="120">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="24" :src="row.avatar" class="user-avatar">
                {{ row.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <span>{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="ip" label="IP地址" width="140" />
        
        <el-table-column prop="location" label="地理位置" width="150">
          <template #default="{ row }">
            <div class="location-info">
              <el-icon class="location-icon"><Location /></el-icon>
              <span>{{ row.location }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="device" label="设备" width="120">
          <template #default="{ row }">
            <el-tag :type="getDeviceType(row.device)" size="small">
              <el-icon class="device-icon">
                <Monitor v-if="row.device === 'desktop'" />
                <Iphone v-else-if="row.device === 'mobile'" />
                <Notebook v-else />
              </el-icon>
              {{ getDeviceText(row.device) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="browser" label="浏览器" width="120">
          <template #default="{ row }">
            <div class="browser-info">
              <span>{{ row.browser }}</span>
              <small class="browser-version">{{ row.browserVersion }}</small>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="os" label="操作系统" width="120" />
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
              <el-icon>
                <Check v-if="row.status === 'success'" />
                <Close v-else />
              </el-icon>
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="failReason" label="失败原因" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.status === 'failed'" class="fail-reason">{{ row.failReason }}</span>
            <span v-else class="success-text">-</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="loginTime" label="登录时间" width="160" />
        
        <el-table-column prop="logoutTime" label="登出时间" width="160">
          <template #default="{ row }">
            <span v-if="row.logoutTime">{{ row.logoutTime }}</span>
            <el-tag v-else type="success" size="small">在线</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="duration" label="在线时长" width="120" align="center">
          <template #default="{ row }">
            <span v-if="row.duration">{{ formatDuration(row.duration) }}</span>
            <span v-else class="online-text">-</span>
          </template>
        </el-table-column>
        
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
      title="登录日志详情"
      width="800px"
      @close="handleDetailClose"
    >
      <div class="log-detail" v-if="currentLog">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="日志ID">{{ currentLog.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ currentLog.username }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ currentLog.ip }}</el-descriptions-item>
          <el-descriptions-item label="地理位置">{{ currentLog.location }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ getDeviceText(currentLog.device) }}</el-descriptions-item>
          <el-descriptions-item label="操作系统">{{ currentLog.os }}</el-descriptions-item>
          <el-descriptions-item label="浏览器">{{ currentLog.browser }} {{ currentLog.browserVersion }}</el-descriptions-item>
          <el-descriptions-item label="屏幕分辨率">{{ currentLog.screenResolution }}</el-descriptions-item>
          <el-descriptions-item label="用户代理" :span="2">{{ currentLog.userAgent }}</el-descriptions-item>
          <el-descriptions-item label="登录状态">
            <el-tag :type="currentLog.status === 'success' ? 'success' : 'danger'">
              {{ currentLog.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="失败原因" v-if="currentLog.status === 'failed'">
            {{ currentLog.failReason }}
          </el-descriptions-item>
          <el-descriptions-item label="登录时间">{{ currentLog.loginTime }}</el-descriptions-item>
          <el-descriptions-item label="登出时间">
            {{ currentLog.logoutTime || '仍在线' }}
          </el-descriptions-item>
          <el-descriptions-item label="在线时长" v-if="currentLog.duration">
            {{ formatDuration(currentLog.duration) }}
          </el-descriptions-item>
          <el-descriptions-item label="会话ID" :span="2">{{ currentLog.sessionId }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="detail-section" v-if="currentLog.loginAttempts && currentLog.loginAttempts.length">
          <h4>登录尝试记录</h4>
          <el-table :data="currentLog.loginAttempts" size="small">
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column prop="ip" label="IP地址" width="140" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="失败原因" show-overflow-tooltip />
          </el-table>
        </div>
      </div>
    </el-dialog>

    <!-- 统计对话框 -->
    <el-dialog
      v-model="statsDialogVisible"
      title="登录统计"
      width="1000px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="chart-container">
            <h4>每日登录趋势</h4>
            <div id="dailyChart" style="height: 300px;"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <h4>设备类型分布</h4>
            <div id="deviceChart" style="height: 300px;"></div>
          </div>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <div class="chart-container">
            <h4>地理位置分布</h4>
            <div id="locationChart" style="height: 300px;"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-container">
            <h4>浏览器分布</h4>
            <div id="browserChart" style="height: 300px;"></div>
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
  Close,
  User,
  Monitor,
  Location,
  Iphone,
  Notebook,
  DataAnalysis
} from '@element-plus/icons-vue'

interface LoginLog {
  id: number
  username: string
  avatar: string
  ip: string
  location: string
  device: string
  browser: string
  browserVersion: string
  os: string
  screenResolution: string
  userAgent: string
  status: string
  failReason: string
  loginTime: string
  logoutTime: string
  duration: number
  sessionId: string
  loginAttempts?: Array<{
    time: string
    ip: string
    status: string
    reason: string
  }>
}

const loading = ref(false)
const detailDialogVisible = ref(false)
const statsDialogVisible = ref(false)
const currentLog = ref<LoginLog | null>(null)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  device: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 统计数据
const stats = reactive({
  successCount: 1245,
  failedCount: 89,
  uniqueUsers: 156,
  uniqueIps: 234
})

// 日志列表
const logList = ref<LoginLog[]>([
  {
    id: 1,
    username: 'admin',
    avatar: '',
    ip: '192.168.1.100',
    location: '北京市',
    device: 'desktop',
    browser: 'Chrome',
    browserVersion: '120.0.0.0',
    os: 'macOS 14.2',
    screenResolution: '1920x1080',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    status: 'success',
    failReason: '',
    loginTime: '2024-01-15 14:30:25',
    logoutTime: '',
    duration: 0,
    sessionId: 'sess_1705312225_admin_001'
  },
  {
    id: 2,
    username: 'editor',
    avatar: '',
    ip: '192.168.1.101',
    location: '上海市',
    device: 'mobile',
    browser: 'Safari',
    browserVersion: '17.0',
    os: 'iOS 17.0',
    screenResolution: '390x844',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    status: 'success',
    failReason: '',
    loginTime: '2024-01-15 14:25:10',
    logoutTime: '2024-01-15 16:45:30',
    duration: 8420,
    sessionId: 'sess_1705311910_editor_002'
  },
  {
    id: 3,
    username: 'user1',
    avatar: '',
    ip: '192.168.1.102',
    location: '广州市',
    device: 'desktop',
    browser: 'Firefox',
    browserVersion: '121.0',
    os: 'Windows 11',
    screenResolution: '1366x768',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    status: 'failed',
    failReason: '密码错误',
    loginTime: '2024-01-15 14:20:33',
    logoutTime: '',
    duration: 0,
    sessionId: '',
    loginAttempts: [
      {
        time: '2024-01-15 14:18:15',
        ip: '192.168.1.102',
        status: 'failed',
        reason: '用户名不存在'
      },
      {
        time: '2024-01-15 14:19:22',
        ip: '192.168.1.102',
        status: 'failed',
        reason: '密码错误'
      },
      {
        time: '2024-01-15 14:20:33',
        ip: '192.168.1.102',
        status: 'failed',
        reason: '密码错误'
      }
    ]
  },
  {
    id: 4,
    username: 'test',
    avatar: '',
    ip: '192.168.1.103',
    location: '深圳市',
    device: 'tablet',
    browser: 'Chrome',
    browserVersion: '120.0.0.0',
    os: 'Android 14',
    screenResolution: '1024x768',
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    status: 'success',
    failReason: '',
    loginTime: '2024-01-15 14:15:18',
    logoutTime: '2024-01-15 15:30:45',
    duration: 4527,
    sessionId: 'sess_1705311318_test_003'
  },
  {
    id: 5,
    username: 'guest',
    avatar: '',
    ip: '192.168.1.104',
    location: '杭州市',
    device: 'desktop',
    browser: 'Edge',
    browserVersion: '120.0.0.0',
    os: 'Windows 10',
    screenResolution: '1920x1080',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    status: 'failed',
    failReason: '账户已被锁定',
    loginTime: '2024-01-15 14:10:45',
    logoutTime: '',
    duration: 0,
    sessionId: ''
  }
])

// 获取设备类型
const getDeviceType = (device: string) => {
  const types: Record<string, string> = {
    desktop: 'primary',
    mobile: 'success',
    tablet: 'warning'
  }
  return types[device] || 'info'
}

// 获取设备文本
const getDeviceText = (device: string) => {
  const texts: Record<string, string> = {
    desktop: '桌面端',
    mobile: '移动端',
    tablet: '平板'
  }
  return texts[device] || device
}

// 格式化时长
const formatDuration = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}秒`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小时${minutes}分钟`
  }
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
    status: '',
    device: '',
    dateRange: []
  })
  handleSearch()
}

// 查看详情
const handleViewDetail = (row: LoginLog) => {
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

// 导出日志
const handleExport = () => {
  const data = logList.value.map(item => ({
    ID: item.id,
    用户名: item.username,
    IP地址: item.ip,
    地理位置: item.location,
    设备类型: getDeviceText(item.device),
    浏览器: `${item.browser} ${item.browserVersion}`,
    操作系统: item.os,
    状态: item.status === 'success' ? '成功' : '失败',
    失败原因: item.failReason || '-',
    登录时间: item.loginTime,
    登出时间: item.logoutTime || '仍在线',
    在线时长: item.duration ? formatDuration(item.duration) : '-'
  }))
  
  const csv = [Object.keys(data[0]).join(',')]
    .concat(data.map(row => Object.values(row).join(',')))
    .join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `login-log-${new Date().toISOString().slice(0, 10)}.csv`
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
.login-log {
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
          
          &.success {
            background: linear-gradient(135deg, #67c23a, #85ce61);
          }
          
          &.danger {
            background: linear-gradient(135deg, #f56c6c, #f78989);
          }
          
          &.warning {
            background: linear-gradient(135deg, #e6a23c, #ebb563);
          }
          
          &.info {
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
    .user-info {
      display: flex;
      align-items: center;
      
      .user-avatar {
        margin-right: 8px;
      }
    }
    
    .location-info {
      display: flex;
      align-items: center;
      
      .location-icon {
        margin-right: 4px;
        color: #409eff;
      }
    }
    
    .device-icon {
      margin-right: 4px;
    }
    
    .browser-info {
      .browser-version {
        display: block;
        color: #909399;
        font-size: 12px;
      }
    }
    
    .fail-reason {
      color: #f56c6c;
    }
    
    .success-text {
      color: #909399;
    }
    
    .online-text {
      color: #67c23a;
    }
    
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

@media (max-width: 768px) {
  .login-log {
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