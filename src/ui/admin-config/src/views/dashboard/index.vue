<template>
  <div class="dashboard-container">
    <div class="dashboard-text">欢迎使用 BASB 管理系统</div>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stats-card">
          <div class="stats-icon knowledge">
            <el-icon><Document /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.knowledgeCount }}</div>
            <div class="stats-label">知识条目</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stats-card">
          <div class="stats-icon users">
            <el-icon><User /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.userCount }}</div>
            <div class="stats-label">用户数量</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stats-card">
          <div class="stats-icon projects">
            <el-icon><Folder /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.projectCount }}</div>
            <div class="stats-label">项目数量</div>
          </div>
        </div>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <div class="stats-card">
          <div class="stats-icon tasks">
            <el-icon><List /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ stats.taskCount }}</div>
            <div class="stats-label">任务数量</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>知识增长趋势</span>
            </div>
          </template>
          <div class="chart-container" ref="knowledgeChartRef"></div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>用户活跃度</span>
            </div>
          </template>
          <div class="chart-container" ref="userChartRef"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近活动 -->
    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="activity.timestamp"
              :type="activity.type"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :lg="8">
        <el-card class="quick-actions-card">
          <template #header>
            <div class="card-header">
              <span>快速操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="createKnowledge">
              <el-icon><Plus /></el-icon>
              创建知识
            </el-button>
            <el-button type="success" @click="createProject">
              <el-icon><FolderAdd /></el-icon>
              新建项目
            </el-button>
            <el-button type="info" @click="viewAnalytics">
              <el-icon><DataAnalysis /></el-icon>
              查看分析
            </el-button>
            <el-button type="warning" @click="systemSettings">
              <el-icon><Setting /></el-icon>
              系统设置
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document,
  User,
  Folder,
  List,
  Plus,
  FolderAdd,
  DataAnalysis,
  Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const knowledgeChartRef = ref()
const userChartRef = ref()

// 统计数据
const stats = reactive({
  knowledgeCount: 1234,
  userCount: 89,
  projectCount: 45,
  taskCount: 167
})

// 最近活动
const recentActivities = ref([
  {
    id: 1,
    content: '用户 张三 创建了新的知识条目',
    timestamp: '2024-01-15 14:30',
    type: 'primary'
  },
  {
    id: 2,
    content: '项目 "AI学习计划" 已完成',
    timestamp: '2024-01-15 12:15',
    type: 'success'
  },
  {
    id: 3,
    content: '系统进行了定期备份',
    timestamp: '2024-01-15 10:00',
    type: 'info'
  },
  {
    id: 4,
    content: '用户 李四 更新了个人资料',
    timestamp: '2024-01-14 16:45',
    type: 'warning'
  }
])

// 快速操作
const createKnowledge = () => {
  router.push('/knowledge/create')
}

const createProject = () => {
  router.push('/para/projects/create')
}

const viewAnalytics = () => {
  router.push('/analytics')
}

const systemSettings = () => {
  router.push('/system/config')
}

// 初始化图表
const initCharts = () => {
  // 这里可以使用 ECharts 或其他图表库
  // 暂时用占位符
  if (knowledgeChartRef.value) {
    knowledgeChartRef.value.innerHTML = '<div style="height: 200px; display: flex; align-items: center; justify-content: center; color: #999;">知识增长趋势图表</div>'
  }
  if (userChartRef.value) {
    userChartRef.value.innerHTML = '<div style="height: 200px; display: flex; align-items: center; justify-content: center; color: #999;">用户活跃度图表</div>'
  }
}

onMounted(() => {
  initCharts()
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.dashboard-text {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 30px;
  text-align: center;
}

.stats-row {
  margin-bottom: 30px;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-2px);
  }
}

.stats-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  color: white;
  
  &.knowledge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  &.users {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  
  &.projects {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  
  &.tasks {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
}

.stats-content {
  flex: 1;
}

.stats-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 14px;
  color: #909399;
}

.chart-row {
  margin-bottom: 30px;
}

.chart-card {
  height: 300px;
  
  .chart-container {
    height: 200px;
  }
}

.activity-card {
  height: 400px;
  
  :deep(.el-card__body) {
    height: calc(100% - 60px);
    overflow-y: auto;
  }
}

.quick-actions-card {
  height: 400px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  
  .el-button {
    justify-content: flex-start;
    
    .el-icon {
      margin-right: 8px;
    }
  }
}

.card-header {
  font-weight: bold;
  color: #303133;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .stats-card {
    margin-bottom: 15px;
  }
  
  .chart-row {
    .el-col {
      margin-bottom: 20px;
    }
  }
}
</style>