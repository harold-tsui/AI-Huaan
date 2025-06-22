<template>
  <div class="about-help-settings">
    <h3>关于与帮助</h3>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>关于应用</span>
        </div>
      </template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="应用名称">AI 第二大脑 (AI-Powered Second Brain)</el-descriptions-item>
        <el-descriptions-item label="当前版本">{{ appInfo.version }}</el-descriptions-item>
        <el-descriptions-item label="构建日期">{{ appInfo.buildDate }}</el-descriptions-item>
        <el-descriptions-item label="版权所有"> &copy; {{ new Date().getFullYear() }} Harold Tsui. All rights reserved.</el-descriptions-item>
        <el-descriptions-item label="开发者">Harold Tsui</el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 20px;">
        <el-button type="primary" @click="checkForUpdates" :loading="isCheckingUpdates">
          {{ isCheckingUpdates ? '检查中...' : '检查更新' }}
        </el-button>
      </div>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>帮助与支持</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="hover" class="help-link-card" @click="openLink(helpLinks.documentation)">
            <div class="help-link-content">
              <el-icon :size="30"><Document /></el-icon>
              <h4>官方文档</h4>
              <p>查看详细的用户手册和指南。</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="help-link-card" @click="openLink(helpLinks.faq)">
            <div class="help-link-content">
              <el-icon :size="30"><QuestionFilled /></el-icon>
              <h4>常见问题 (FAQ)</h4>
              <p>快速找到常见问题的答案。</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="help-link-card" @click="openLink(helpLinks.feedback)">
            <div class="help-link-content">
              <el-icon :size="30"><ChatDotRound /></el-icon>
              <h4>提交反馈</h4>
              <p>帮助我们改进应用。</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="box-card">
        <template #header>
            <div class="card-header">
            <span>系统信息</span>
            </div>
        </template>
        <el-descriptions :column="1" border>
            <el-descriptions-item label="操作系统">{{ systemInfo.os }}</el-descriptions-item>
            <el-descriptions-item label="浏览器">{{ systemInfo.browser }}</el-descriptions-item>
            <el-descriptions-item label="屏幕分辨率">{{ systemInfo.screenResolution }}</el-descriptions-item>
            <el-descriptions-item label="本地存储状态">{{ systemInfo.localStorageStatus }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 20px;">
            <el-button @click="copySystemInfo">复制系统信息</el-button>
        </div>
    </el-card>

  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, QuestionFilled, ChatDotRound } from '@element-plus/icons-vue';

const appInfo = reactive({
  version: '1.0.0-beta',
  buildDate: new Date().toLocaleDateString(), // Placeholder, should be actual build date
});

const systemInfo = reactive({
    os: '',
    browser: '',
    screenResolution: '',
    localStorageStatus: '可用'
});

const isCheckingUpdates = ref(false);

const helpLinks = {
  documentation: 'https://example.com/docs',
  faq: 'https://example.com/faq',
  feedback: 'https://example.com/feedback',
};

const checkForUpdates = () => {
  isCheckingUpdates.value = true;
  console.log('Checking for updates...');
  setTimeout(() => {
    isCheckingUpdates.value = false;
    // Simulate update check result
    const hasUpdate = Math.random() > 0.5;
    if (hasUpdate) {
      ElMessage.success('发现新版本！请访问官网下载。');
    } else {
      ElMessage.info('当前已是最新版本。');
    }
  }, 2000);
};

const openLink = (url: string) => {
  window.open(url, '_blank');
};

const getSystemInfo = () => {
    systemInfo.os = navigator.platform;
    systemInfo.browser = navigator.userAgent;
    systemInfo.screenResolution = `${window.screen.width}x${window.screen.height}`;
    try {
        localStorage.setItem('__test__', 'test');
        localStorage.removeItem('__test__');
        systemInfo.localStorageStatus = '可用';
    } catch (e) {
        systemInfo.localStorageStatus = '不可用或已满';
    }
};

const copySystemInfo = () => {
    const infoString = `OS: ${systemInfo.os}\nBrowser: ${systemInfo.browser}\nScreen: ${systemInfo.screenResolution}\nStorage: ${systemInfo.localStorageStatus}`;
    navigator.clipboard.writeText(infoString)
        .then(() => ElMessage.success('系统信息已复制到剪贴板'))
        .catch(err => ElMessage.error('复制失败: ' + err));
};

onMounted(() => {
    getSystemInfo();
});

</script>

<style scoped>
.about-help-settings {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  font-weight: bold;
}
.help-link-card {
  cursor: pointer;
  text-align: center;
}
.help-link-content {
  padding: 10px;
}
.help-link-content h4 {
  margin: 10px 0 5px;
}
.help-link-content p {
  font-size: 0.9em;
  color: #666;
  margin: 0;
}
</style>