<template>
  <div class="context-management-settings">
    <h3>动态用户上下文管理</h3>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>兴趣图谱</span>
        </div>
      </template>
      <p>此处将显示和编辑您的兴趣图谱 (占位符)。</p>
      <el-button type="primary" @click="editInterestGraph">编辑兴趣图谱</el-button>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>当前焦点</span>
        </div>
      </template>
      <el-form :model="focusForm" label-width="120px">
        <el-form-item label="当前项目/任务">
          <el-input v-model="focusForm.currentProject" placeholder="例如: AI项目研究"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="updateFocus">更新焦点</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>隐私设置</span>
        </div>
      </template>
      <el-form :model="privacyForm" label-position="top">
        <el-form-item label="允许收集浏览历史用于上下文分析">
          <el-switch v-model="privacyForm.collectBrowsingHistory"></el-switch>
        </el-form-item>
        <el-form-item label="允许分析日历事件用于上下文">
          <el-switch v-model="privacyForm.analyzeCalendarEvents"></el-switch>
        </el-form-item>
        <el-form-item label="允许分享匿名使用数据以改进服务">
          <el-switch v-model="privacyForm.shareAnonymizedData"></el-switch>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="savePrivacySettings">保存隐私设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { ElMessage } from 'element-plus';

// Interest Graph (Placeholder)
const editInterestGraph = () => {
  ElMessage.info('编辑兴趣图谱功能待实现。');
};

// Current Focus Form
const focusForm = reactive({
  currentProject: '',
});

const updateFocus = () => {
  console.log('Current focus updated:', focusForm.currentProject);
  ElMessage.success('当前焦点已更新 (模拟)！');
};

// Privacy Settings Form
const privacyForm = reactive({
  collectBrowsingHistory: false,
  analyzeCalendarEvents: true,
  shareAnonymizedData: false,
});

const savePrivacySettings = () => {
  console.log('Privacy settings saved:', privacyForm);
  ElMessage.success('隐私设置已保存 (模拟)！');
};

</script>

<style scoped>
.context-management-settings {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  font-weight: bold;
}
.el-form-item {
  margin-bottom: 18px;
}
</style>