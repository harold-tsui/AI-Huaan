<template>
  <div class="knowledge-activation-settings">
    <h3>知识激活设置</h3>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>回顾提醒</span>
        </div>
      </template>
      <el-form :model="reviewForm" label-width="120px">
        <el-form-item label="回顾频率">
          <el-select v-model="reviewForm.frequency" @change="handleReviewFrequencyChange">
            <el-option label="每日" value="daily"></el-option>
            <el-option label="每周" value="weekly"></el-option>
            <el-option label="每月" value="monthly"></el-option>
            <el-option label="自定义" value="custom"></el-option>
            <el-option label="禁用" value="disabled"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="reviewForm.frequency === 'custom'" label="自定义间隔 (天)">
          <el-input-number v-model="reviewForm.customDays" :min="1" :max="365"></el-input-number>
        </el-form-item>
        <el-form-item label="提醒方式">
          <el-select v-model="reviewForm.notificationMethod">
            <el-option label="应用内通知" value="in_app"></el-option>
            <el-option label="邮件提醒" value="email"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveReviewSettings">保存回顾设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>输出与集成</span>
        </div>
      </template>
      <el-form :model="exportIntegrationForm" label-width="120px">
        <el-form-item label="默认导出格式">
          <el-select v-model="exportIntegrationForm.exportFormat">
            <el-option label="Markdown" value="markdown"></el-option>
            <el-option label="PDF" value="pdf"></el-option>
            <el-option label="HTML" value="html"></el-option>
          </el-select>
        </el-form-item>
        <h4>应用集成</h4>
        <div class="integration-item">
          <span>Google Calendar:</span>
          <el-tag :type="gcalStatus.connected ? 'success' : 'danger'" effect="dark">
            {{ gcalStatus.connected ? '已连接' : '未连接' }}
          </el-tag>
          <el-button size="small" @click="toggleGcalConnection" :type="gcalStatus.connected ? '' : 'primary'">
            {{ gcalStatus.connected ? '断开连接' : '连接' }}
          </el-button>
        </div>
        <div class="integration-item">
          <span>Todoist:</span>
          <el-tag :type="todoistStatus.connected ? 'success' : 'danger'" effect="dark">
            {{ todoistStatus.connected ? '已连接' : '未连接' }}
          </el-tag>
          <el-button size="small" @click="toggleTodoistConnection" :type="todoistStatus.connected ? '' : 'primary'">
            {{ todoistStatus.connected ? '断开连接' : '连接' }}
          </el-button>
        </div>
        <!-- Add more integrations here -->
        <el-form-item style="margin-top: 20px;">
          <el-button type="primary" @click="saveExportIntegrationSettings">保存集成设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

// Review Form
const reviewForm = reactive({
  frequency: 'weekly',
  customDays: 7,
  notificationMethod: 'in_app',
});

const handleReviewFrequencyChange = (value: string) => {
  console.log('Review frequency changed to:', value);
};

const saveReviewSettings = () => {
  console.log('Review settings saved:', reviewForm);
  ElMessage.success('回顾提醒设置已保存 (模拟)！');
};

// Export and Integration Form
const exportIntegrationForm = reactive({
  exportFormat: 'markdown',
});

const gcalStatus = reactive({ connected: false });
const todoistStatus = reactive({ connected: false });

const toggleGcalConnection = () => {
  gcalStatus.connected = !gcalStatus.connected;
  ElMessage.info(`Google Calendar ${gcalStatus.connected ? '已连接' : '已断开'} (模拟)。`);
};

const toggleTodoistConnection = () => {
  todoistStatus.connected = !todoistStatus.connected;
  ElMessage.info(`Todoist ${todoistStatus.connected ? '已连接' : '已断开'} (模拟)。`);
};

const saveExportIntegrationSettings = () => {
  console.log('Export/Integration settings saved:', exportIntegrationForm);
  console.log('Google Calendar status:', gcalStatus.connected);
  console.log('Todoist status:', todoistStatus.connected);
  ElMessage.success('输出与集成设置已保存 (模拟)！');
};

</script>

<style scoped>
.knowledge-activation-settings {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  font-weight: bold;
}
.integration-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.integration-item:last-child {
  border-bottom: none;
}
.integration-item span {
  margin-right: 10px;
}
</style>