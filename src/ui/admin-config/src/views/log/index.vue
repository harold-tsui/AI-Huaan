<template>
  <div class="log-management">
    <div class="page-header">
      <h2>日志管理</h2>
      <p>查看和管理系统运行日志</p>
    </div>

    <!-- 日志类型标签页 -->
    <el-card class="tabs-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="操作日志" name="operation">
          <OperationLog />
        </el-tab-pane>
        <el-tab-pane label="登录日志" name="login">
          <LoginLog />
        </el-tab-pane>
        <el-tab-pane label="系统日志" name="system">
          <SystemLog />
        </el-tab-pane>
        <el-tab-pane label="错误日志" name="error">
          <ErrorLog />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import OperationLog from './components/OperationLog.vue'
import LoginLog from './components/LoginLog.vue'
import SystemLog from './components/SystemLog.vue'
import ErrorLog from './components/ErrorLog.vue'

const activeTab = ref('operation')

const handleTabChange = (tabName: string) => {
  console.log('切换到标签页:', tabName)
}
</script>

<style lang="scss" scoped>
.log-management {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.page-header {
  margin-bottom: 20px;
  
  h2 {
    color: #303133;
    margin-bottom: 8px;
  }
  
  p {
    color: #606266;
    margin: 0;
  }
}

.tabs-card {
  :deep(.el-tabs__content) {
    padding: 0;
  }
}

@media (max-width: 768px) {
  .log-management {
    padding: 10px;
  }
}
</style>