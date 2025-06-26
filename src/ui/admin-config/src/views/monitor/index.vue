<template>
  <div class="monitor">
    <div class="monitor-header">
      <h2>系统监控</h2>
      <p>实时监控系统状态和性能指标</p>
      <div class="header-actions">
        <el-button-group>
          <el-button
            v-for="interval in refreshIntervals"
            :key="interval.value"
            :type="currentInterval === interval.value ? 'primary' : 'default'"
            size="small"
            @click="setRefreshInterval(interval.value)"
          >
            {{ interval.label }}
          </el-button>
        </el-button-group>
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 系统状态概览 -->
    <el-row :gutter="20" class="status-overview">
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="status-card">
          <div class="status-item">
            <div class="status-icon cpu">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-value">{{ systemStatus.cpu }}%</div>
              <div class="status-label">CPU 使用率</div>
            </div>
            <div class="status-trend">
              <el-icon :class="systemStatus.cpuTrend">
                <ArrowUp v-if="systemStatus.cpuTrend === 'up'" />
                <ArrowDown v-else-if="systemStatus.cpuTrend === 'down'" />
                <Minus v-else />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="status-card">
          <div class="status-item">
            <div class="status-icon memory">
              <el-icon><MemoryCard /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-value">{{ systemStatus.memory }}%</div>
              <div class="status-label">内存使用率</div>
            </div>
            <div class="status-trend">
              <el-icon :class="systemStatus.memoryTrend">
                <ArrowUp v-if="systemStatus.memoryTrend === 'up'" />
                <ArrowDown v-else-if="systemStatus.memoryTrend === 'down'" />
                <Minus v-else />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="status-card">
          <div class="status-item">
            <div class="status-icon disk">
              <el-icon><HardDisk /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-value">{{ systemStatus.disk }}%</div>
              <div class="status-label">磁盘使用率</div>
            </div>
            <div class="status-trend">
              <el-icon :class="systemStatus.diskTrend">
                <ArrowUp v-if="systemStatus.diskTrend === 'up'" />
                <ArrowDown v-else-if="systemStatus.diskTrend === 'down'" />
                <Minus v-else />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="12" :sm="6" :md="6" :lg="6">
        <el-card class="status-card">
          <div class="status-item">
            <div class="status-icon network">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-value">{{ systemStatus.network }}</div>
              <div class="status-label">网络状态</div>
            </div>
            <div class="status-trend">
              <el-icon class="normal">
                <CircleCheckFilled />
              </el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 性能图表 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>性能监控</span>
              <el-select v-model="selectedMetric" size="small" style="width: 120px">
                <el-option label="CPU" value="cpu" />
                <el-option label="内存" value="memory" />
                <el-option label="磁盘" value="disk" />
                <el-option label="网络" value="network" />
              </el-select>
            </div>
          </template>
          
          <div class="chart-container">
            <div ref="performanceChart" class="chart"></div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 系统信息 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="8">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
              <el-button size="small" @click="handleExportReport">
                <el-icon><Download /></el-icon>
                导出报告
              </el-button>
            </div>
          </template>
          
          <div class="system-info">
            <div class="info-item">
              <div class="info-label">操作系统</div>
              <div class="info-value">{{ systemInfo.os }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">系统版本</div>
              <div class="info-value">{{ systemInfo.version }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">运行时间</div>
              <div class="info-value">{{ systemInfo.uptime }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">CPU 型号</div>
              <div class="info-value">{{ systemInfo.cpuModel }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">CPU 核心</div>
              <div class="info-value">{{ systemInfo.cpuCores }} 核</div>
            </div>
            <div class="info-item">
              <div class="info-label">总内存</div>
              <div class="info-value">{{ systemInfo.totalMemory }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">可用内存</div>
              <div class="info-value">{{ systemInfo.availableMemory }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">总磁盘</div>
              <div class="info-value">{{ systemInfo.totalDisk }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">可用磁盘</div>
              <div class="info-value">{{ systemInfo.availableDisk }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 进程监控 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="process-card">
          <template #header>
            <div class="card-header">
              <span>进程监控</span>
              <div class="header-actions">
                <el-input
                  v-model="processSearch"
                  placeholder="搜索进程"
                  size="small"
                  style="width: 150px; margin-right: 8px"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-button size="small" @click="handleKillProcess">
                  <el-icon><Close /></el-icon>
                  结束进程
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="process-list">
            <el-table
              :data="filteredProcesses"
              size="small"
              height="300"
              @selection-change="handleProcessSelection"
            >
              <el-table-column type="selection" width="40" />
              <el-table-column prop="name" label="进程名" width="120" />
              <el-table-column prop="pid" label="PID" width="60" />
              <el-table-column prop="cpu" label="CPU%" width="60" />
              <el-table-column prop="memory" label="内存%" width="60" />
              <el-table-column prop="status" label="状态" width="60">
                <template #default="{ row }">
                  <el-tag
                    :type="row.status === 'running' ? 'success' : 'warning'"
                    size="small"
                  >
                    {{ row.status === 'running' ? '运行' : '睡眠' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      
      <!-- 网络监控 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="network-card">
          <template #header>
            <div class="card-header">
              <span>网络监控</span>
              <el-button size="small" @click="handleNetworkTest">
                <el-icon><Connection /></el-icon>
                网络测试
              </el-button>
            </div>
          </template>
          
          <div class="network-stats">
            <div class="network-item">
              <div class="network-label">上传速度</div>
              <div class="network-value">{{ networkStats.uploadSpeed }}</div>
              <div class="network-chart">
                <div class="mini-chart upload"></div>
              </div>
            </div>
            
            <div class="network-item">
              <div class="network-label">下载速度</div>
              <div class="network-value">{{ networkStats.downloadSpeed }}</div>
              <div class="network-chart">
                <div class="mini-chart download"></div>
              </div>
            </div>
            
            <div class="network-item">
              <div class="network-label">延迟</div>
              <div class="network-value">{{ networkStats.latency }}</div>
              <div class="network-status">
                <el-icon :class="getLatencyStatus(networkStats.latency)">
                  <CircleCheckFilled v-if="getLatencyStatus(networkStats.latency) === 'good'" />
                  <Warning v-else-if="getLatencyStatus(networkStats.latency) === 'warning'" />
                  <CircleCloseFilled v-else />
                </el-icon>
              </div>
            </div>
            
            <div class="network-item">
              <div class="network-label">连接数</div>
              <div class="network-value">{{ networkStats.connections }}</div>
              <div class="network-trend">
                <el-icon class="normal">
                  <TrendCharts />
                </el-icon>
              </div>
            </div>
          </div>
          
          <div class="network-interfaces">
            <h4>网络接口</h4>
            <div class="interface-list">
              <div
                v-for="networkInterface in networkInterfaces"
                :key="networkInterface.name"
                class="interface-item"
              >
                <div class="interface-info">
                  <div class="interface-name">{{ networkInterface.name }}</div>
                  <div class="interface-ip">{{ networkInterface.ip }}</div>
                </div>
                <div class="interface-status">
                  <el-tag
                    :type="networkInterface.status === 'up' ? 'success' : 'danger'"
                    size="small"
                  >
                    {{ networkInterface.status === 'up' ? '活动' : '断开' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 服务状态 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="service-card">
          <template #header>
            <div class="card-header">
              <span>服务状态</span>
              <el-button size="small" @click="handleRefreshServices">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          
          <div class="service-list">
            <div
              v-for="service in services"
              :key="service.name"
              class="service-item"
            >
              <div class="service-info">
                <div class="service-name">{{ service.name }}</div>
                <div class="service-desc">{{ service.description }}</div>
              </div>
              <div class="service-status">
                <el-tag
                  :type="service.status === 'running' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ service.status === 'running' ? '运行中' : '已停止' }}
                </el-tag>
              </div>
              <div class="service-actions">
                <el-button
                  v-if="service.status === 'stopped'"
                  type="success"
                  size="small"
                  @click="handleStartService(service)"
                >
                  启动
                </el-button>
                <el-button
                  v-else
                  type="danger"
                  size="small"
                  @click="handleStopService(service)"
                >
                  停止
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  @click="handleRestartService(service)"
                >
                  重启
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 日志监控 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="log-card">
          <template #header>
            <div class="card-header">
              <span>实时日志</span>
              <div class="header-actions">
                <el-select v-model="selectedLogLevel" size="small" style="width: 100px; margin-right: 8px">
                  <el-option label="全部" value="all" />
                  <el-option label="错误" value="error" />
                  <el-option label="警告" value="warning" />
                  <el-option label="信息" value="info" />
                </el-select>
                <el-button size="small" @click="handleClearLogs">
                  <el-icon><Delete /></el-icon>
                  清空
                </el-button>
              </div>
            </div>
          </template>
          
          <div class="log-container">
            <div class="log-list" ref="logContainer">
              <div
                v-for="(log, index) in filteredLogs"
                :key="index"
                class="log-item"
                :class="log.level"
              >
                <div class="log-time">{{ log.time }}</div>
                <div class="log-level">
                  <el-tag
                    :type="getLogLevelType(log.level)"
                    size="small"
                  >
                    {{ log.level.toUpperCase() }}
                  </el-tag>
                </div>
                <div class="log-message">{{ log.message }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 警报设置对话框 -->
    <el-dialog
      v-model="alertDialogVisible"
      title="警报设置"
      width="600px"
    >
      <el-form :model="alertForm" label-width="120px">
        <el-form-item label="监控指标">
          <el-select v-model="alertForm.metric" placeholder="选择监控指标">
            <el-option label="CPU 使用率" value="cpu" />
            <el-option label="内存使用率" value="memory" />
            <el-option label="磁盘使用率" value="disk" />
            <el-option label="网络延迟" value="latency" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="阈值">
          <el-input-number
            v-model="alertForm.threshold"
            :min="0"
            :max="100"
            placeholder="设置阈值"
          />
          <span style="margin-left: 8px">%</span>
        </el-form-item>
        
        <el-form-item label="持续时间">
          <el-input-number
            v-model="alertForm.duration"
            :min="1"
            :max="60"
            placeholder="持续时间"
          />
          <span style="margin-left: 8px">分钟</span>
        </el-form-item>
        
        <el-form-item label="通知方式">
          <el-checkbox-group v-model="alertForm.notificationMethods">
            <el-checkbox label="email">邮件</el-checkbox>
            <el-checkbox label="sms">短信</el-checkbox>
            <el-checkbox label="webhook">Webhook</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="alertDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveAlert">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Cpu,
  Monitor,
  FolderOpened,
  Connection,
  ArrowUp,
  ArrowDown,
  Minus,
  CircleCheckFilled,
  Download,
  Search,
  Close,
  Warning,
  CircleCloseFilled,
  TrendCharts,
  Delete
} from '@element-plus/icons-vue'

// 刷新间隔选项
const refreshIntervals = [
  { label: '5秒', value: 5000 },
  { label: '10秒', value: 10000 },
  { label: '30秒', value: 30000 },
  { label: '1分钟', value: 60000 }
]

const currentInterval = ref(10000)
const selectedMetric = ref('cpu')
const processSearch = ref('')
const selectedLogLevel = ref('all')
const alertDialogVisible = ref(false)

// 系统状态
const systemStatus = reactive({
  cpu: 45,
  cpuTrend: 'up',
  memory: 68,
  memoryTrend: 'down',
  disk: 32,
  diskTrend: 'stable',
  network: '正常'
})

// 系统信息
const systemInfo = reactive({
  os: 'Ubuntu 20.04 LTS',
  version: '5.4.0-74-generic',
  uptime: '15天 8小时 32分钟',
  cpuModel: 'Intel Core i7-9700K',
  cpuCores: 8,
  totalMemory: '32 GB',
  availableMemory: '10.2 GB',
  totalDisk: '1 TB',
  availableDisk: '680 GB'
})

// 网络统计
const networkStats = reactive({
  uploadSpeed: '125 KB/s',
  downloadSpeed: '2.3 MB/s',
  latency: '15ms',
  connections: 156
})

// 网络接口
const networkInterfaces = ref([
  { name: 'eth0', ip: '192.168.1.100', status: 'up' },
  { name: 'lo', ip: '127.0.0.1', status: 'up' },
  { name: 'wlan0', ip: '192.168.0.50', status: 'down' }
])

// 进程列表
const processes = ref([
  { name: 'nginx', pid: 1234, cpu: 2.5, memory: 1.2, status: 'running' },
  { name: 'mysql', pid: 5678, cpu: 15.3, memory: 8.7, status: 'running' },
  { name: 'redis', pid: 9012, cpu: 0.8, memory: 2.1, status: 'running' },
  { name: 'node', pid: 3456, cpu: 8.2, memory: 12.5, status: 'running' },
  { name: 'apache', pid: 7890, cpu: 0.0, memory: 0.5, status: 'sleeping' }
])

// 服务列表
const services = ref([
  { name: 'nginx', description: 'Web 服务器', status: 'running' },
  { name: 'mysql', description: '数据库服务', status: 'running' },
  { name: 'redis', description: '缓存服务', status: 'running' },
  { name: 'elasticsearch', description: '搜索引擎', status: 'stopped' },
  { name: 'mongodb', description: '文档数据库', status: 'running' }
])

// 日志列表
const logs = ref([
  { time: '14:32:15', level: 'info', message: '用户登录成功: admin@example.com' },
  { time: '14:31:42', level: 'warning', message: 'CPU 使用率超过 80%' },
  { time: '14:30:18', level: 'error', message: '数据库连接失败，正在重试...' },
  { time: '14:29:55', level: 'info', message: '系统备份完成' },
  { time: '14:28:33', level: 'warning', message: '磁盘空间不足，剩余 15%' }
])

// 警报表单
const alertForm = reactive({
  metric: '',
  threshold: 80,
  duration: 5,
  notificationMethods: ['email']
})

const selectedProcesses = ref<any[]>([])
let refreshTimer: NodeJS.Timeout | null = null

// 计算属性
const filteredProcesses = computed(() => {
  if (!processSearch.value) return processes.value
  return processes.value.filter(process => 
    process.name.toLowerCase().includes(processSearch.value.toLowerCase())
  )
})

const filteredLogs = computed(() => {
  if (selectedLogLevel.value === 'all') return logs.value
  return logs.value.filter(log => log.level === selectedLogLevel.value)
})

// 方法
const setRefreshInterval = (interval: number) => {
  currentInterval.value = interval
  startAutoRefresh()
}

const handleRefresh = () => {
  // 模拟数据更新
  systemStatus.cpu = Math.floor(Math.random() * 100)
  systemStatus.memory = Math.floor(Math.random() * 100)
  systemStatus.disk = Math.floor(Math.random() * 100)
  
  ElMessage({
    message: '数据已刷新',
    type: 'success'
  })
}

const handleProcessSelection = (selection: any[]) => {
  selectedProcesses.value = selection
}

const handleKillProcess = () => {
  if (selectedProcesses.value.length === 0) {
    ElMessage({
      message: '请选择要结束的进程',
      type: 'warning'
    })
    return
  }
  
  ElMessageBox.confirm(
    `确定要结束选中的 ${selectedProcesses.value.length} 个进程吗？`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage({
      message: '进程已结束',
      type: 'success'
    })
    selectedProcesses.value = []
  })
}

const handleNetworkTest = () => {
  ElMessage({
    message: '网络测试中...',
    type: 'info'
  })
  
  setTimeout(() => {
    ElMessage({
      message: '网络连接正常',
      type: 'success'
    })
  }, 2000)
}

const getLatencyStatus = (latency: string) => {
  const ms = parseInt(latency)
  if (ms < 50) return 'good'
  if (ms < 100) return 'warning'
  return 'error'
}

const handleRefreshServices = () => {
  ElMessage({
    message: '服务状态已刷新',
    type: 'success'
  })
}

const handleStartService = (service: any) => {
  service.status = 'running'
  ElMessage({
    message: `服务 ${service.name} 已启动`,
    type: 'success'
  })
}

const handleStopService = (service: any) => {
  ElMessageBox.confirm(
    `确定要停止服务 "${service.name}" 吗？`,
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    service.status = 'stopped'
    ElMessage({
      message: `服务 ${service.name} 已停止`,
      type: 'success'
    })
  })
}

const handleRestartService = (service: any) => {
  ElMessage({
    message: `服务 ${service.name} 正在重启...`,
    type: 'info'
  })
  
  setTimeout(() => {
    service.status = 'running'
    ElMessage({
      message: `服务 ${service.name} 重启完成`,
      type: 'success'
    })
  }, 2000)
}

const handleClearLogs = () => {
  ElMessageBox.confirm(
    '确定要清空所有日志吗？',
    '确认操作',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    logs.value = []
    ElMessage({
      message: '日志已清空',
      type: 'success'
    })
  })
}

const getLogLevelType = (level: string) => {
  switch (level) {
    case 'error': return 'danger'
    case 'warning': return 'warning'
    case 'info': return 'info'
    default: return 'info'
  }
}

const handleExportReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    systemStatus,
    systemInfo,
    networkStats,
    processes: processes.value,
    services: services.value
  }
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `system-report-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  
  ElMessage({
    message: '系统报告已导出',
    type: 'success'
  })
}

const handleSaveAlert = () => {
  ElMessage({
    message: '警报规则已保存',
    type: 'success'
  })
  alertDialogVisible.value = false
}

const startAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  refreshTimer = setInterval(() => {
    handleRefresh()
  }, currentInterval.value)
}

const addRandomLog = () => {
  const levels = ['info', 'warning', 'error']
  const messages = [
    '用户操作记录',
    '系统性能监控',
    '数据库查询完成',
    '缓存更新成功',
    '网络连接检查',
    '文件上传完成',
    '任务执行结束'
  ]
  
  const newLog = {
    time: new Date().toLocaleTimeString(),
    level: levels[Math.floor(Math.random() * levels.length)],
    message: messages[Math.floor(Math.random() * messages.length)]
  }
  
  logs.value.unshift(newLog)
  if (logs.value.length > 50) {
    logs.value.pop()
  }
  
  // 自动滚动到顶部
  nextTick(() => {
    const logContainer = document.querySelector('.log-list')
    if (logContainer) {
      logContainer.scrollTop = 0
    }
  })
}

onMounted(() => {
  startAutoRefresh()
  
  // 模拟实时日志
  setInterval(addRandomLog, 5000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style lang="scss" scoped>
.monitor {
  .monitor-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    
    h2 {
      margin: 0 0 8px 0;
      color: #303133;
      font-size: 24px;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }
  
  .status-overview {
    margin-bottom: 20px;
    
    .status-card {
      .status-item {
        display: flex;
        align-items: center;
        gap: 12px;
        
        .status-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .el-icon {
            font-size: 24px;
            color: white;
          }
          
          &.cpu {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          &.memory {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          
          &.disk {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          
          &.network {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
        }
        
        .status-info {
          flex: 1;
          
          .status-value {
            font-size: 24px;
            font-weight: 600;
            color: #303133;
            line-height: 1;
          }
          
          .status-label {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }
        
        .status-trend {
          .el-icon {
            font-size: 16px;
            
            &.up {
              color: #f56c6c;
            }
            
            &.down {
              color: #67c23a;
            }
            
            &.stable {
              color: #909399;
            }
            
            &.normal {
              color: #67c23a;
            }
          }
        }
      }
    }
  }
  
  .chart-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .chart-container {
      .chart {
        width: 100%;
        height: 300px;
        background: #f8f9fa;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
        font-size: 14px;
        
        &::before {
          content: '性能图表区域 (需要集成图表库)';
        }
      }
    }
  }
  
  .info-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .system-info {
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f5f7fa;
        
        &:last-child {
          border-bottom: none;
        }
        
        .info-label {
          color: #606266;
          font-size: 14px;
        }
        
        .info-value {
          color: #303133;
          font-weight: 500;
          font-size: 14px;
        }
      }
    }
  }
  
  .process-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-actions {
        display: flex;
        align-items: center;
      }
    }
    
    .process-list {
      .el-table {
        font-size: 12px;
      }
    }
  }
  
  .network-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .network-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 20px;
      
      .network-item {
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
        text-align: center;
        
        .network-label {
          font-size: 12px;
          color: #909399;
          margin-bottom: 8px;
        }
        
        .network-value {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 8px;
        }
        
        .network-chart {
          .mini-chart {
            height: 20px;
            background: #e4e7ed;
            border-radius: 4px;
            position: relative;
            overflow: hidden;
            
            &.upload {
              background: linear-gradient(90deg, #67c23a 60%, #e4e7ed 60%);
            }
            
            &.download {
              background: linear-gradient(90deg, #409eff 80%, #e4e7ed 80%);
            }
          }
        }
        
        .network-status,
        .network-trend {
          .el-icon {
            font-size: 16px;
            
            &.good {
              color: #67c23a;
            }
            
            &.warning {
              color: #e6a23c;
            }
            
            &.error {
              color: #f56c6c;
            }
            
            &.normal {
              color: #409eff;
            }
          }
        }
      }
    }
    
    .network-interfaces {
      h4 {
        margin: 0 0 12px 0;
        color: #303133;
        font-size: 14px;
        font-weight: 600;
      }
      
      .interface-list {
        .interface-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f5f7fa;
          
          &:last-child {
            border-bottom: none;
          }
          
          .interface-info {
            .interface-name {
              font-weight: 500;
              color: #303133;
            }
            
            .interface-ip {
              font-size: 12px;
              color: #909399;
              margin-top: 2px;
            }
          }
        }
      }
    }
  }
  
  .service-card {
    margin-bottom: 20px;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .service-list {
      .service-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f5f7fa;
        
        &:last-child {
          border-bottom: none;
        }
        
        .service-info {
          flex: 1;
          
          .service-name {
            font-weight: 500;
            color: #303133;
          }
          
          .service-desc {
            font-size: 12px;
            color: #909399;
            margin-top: 2px;
          }
        }
        
        .service-status {
          margin-right: 12px;
        }
        
        .service-actions {
          display: flex;
          gap: 4px;
        }
      }
    }
  }
  
  .log-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .header-actions {
        display: flex;
        align-items: center;
      }
    }
    
    .log-container {
      .log-list {
        height: 300px;
        overflow-y: auto;
        
        .log-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #f5f7fa;
          font-size: 12px;
          
          &:last-child {
            border-bottom: none;
          }
          
          .log-time {
            color: #909399;
            width: 60px;
            flex-shrink: 0;
          }
          
          .log-level {
            width: 60px;
            flex-shrink: 0;
          }
          
          .log-message {
            flex: 1;
            color: #303133;
          }
          
          &.error {
            background-color: #fef0f0;
          }
          
          &.warning {
            background-color: #fdf6ec;
          }
          
          &.info {
            background-color: #f4f4f5;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .monitor {
    .monitor-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      
      .header-actions {
        width: 100%;
        justify-content: space-between;
        
        .el-button-group {
          flex: 1;
          
          .el-button {
            flex: 1;
          }
        }
      }
    }
    
    .network-stats {
      grid-template-columns: 1fr !important;
    }
    
    .service-item {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 8px !important;
      
      .service-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  }
}
</style>