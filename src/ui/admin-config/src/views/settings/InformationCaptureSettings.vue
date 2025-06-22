<template>
  <div class="information-capture-settings">
    <h3>信息捕获设置</h3>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>网页剪藏</span>
        </div>
      </template>
      <el-form :model="webClipperForm" label-width="180px">
        <el-form-item label="浏览器扩展状态">
          <el-input v-model="webClipperForm.status" readonly></el-input>
        </el-form-item>
        <el-form-item label="默认保存位置">
          <el-input v-model="webClipperForm.defaultLocation" placeholder="Inbox"></el-input>
        </el-form-item>
        <el-form-item label="默认捕获模式">
          <el-select v-model="webClipperForm.captureMode">
            <el-option label="完整页面" value="full_page"></el-option>
            <el-option label="简化文章" value="article"></el-option>
            <el-option label="选中内容" value="selection"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自动添加标签">
          <el-input v-model="webClipperForm.autoTags" placeholder="clipping, web (逗号分隔)"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveWebClipperSettings">保存剪藏设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>邮件转发</span>
        </div>
      </template>
      <el-form :model="emailForwardForm" label-width="180px">
        <el-form-item label="转发至邮箱地址">
          <el-input v-model="emailForwardForm.forwardAddress" placeholder="capture@yourdomain.secondbrain.ai"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-input v-model="emailForwardForm.status" readonly></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveEmailSettings">保存邮件设置</el-button>
          <el-button @click="sendVerificationEmail" style="margin-left: 10px;">发送验证邮件</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>RSS 订阅源</span>
        </div>
      </template>
      <el-form :model="rssForm" label-width="180px">
        <el-form-item label="添加 RSS 订阅源 URL">
          <el-input v-model="rssForm.newFeedUrl" placeholder="https://example.com/feed"></el-input>
        </el-form-item>
        <el-form-item label="抓取频率">
          <el-select v-model="rssForm.fetchInterval">
            <el-option label="每15分钟" value="15"></el-option>
            <el-option label="每30分钟" value="30"></el-option>
            <el-option label="每小时" value="60"></el-option>
            <el-option label="手动" value="manual"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addRssFeed">添加订阅源</el-button>
        </el-form-item>
      </el-form>
      <h4>已订阅列表</h4>
      <el-table :data="rssFeeds" style="width: 100%">
        <el-table-column prop="url" label="订阅源 URL"></el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" type="danger" @click="removeRssFeed(scope.$index)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// Web Clipper Form
const webClipperForm = reactive({
  status: '已安装 (模拟)',
  defaultLocation: 'Inbox',
  captureMode: 'full_page',
  autoTags: 'clipping, web',
});

const saveWebClipperSettings = () => {
  console.log('Web Clipper settings saved:', webClipperForm);
  ElMessage.success('网页剪藏设置已保存 (模拟)！');
};

// Email Forward Form
const emailForwardForm = reactive({
  forwardAddress: 'capture@yourdomain.secondbrain.ai',
  status: '待验证 (模拟)',
});

const saveEmailSettings = () => {
  console.log('Email forward settings saved:', emailForwardForm);
  ElMessage.success('邮件转发设置已保存 (模拟)！');
};

const sendVerificationEmail = () => {
  ElMessage.info('验证邮件已发送 (模拟)。');
};

// RSS Form
interface RssFeedItem {
  url: string;
}
const rssForm = reactive({
  newFeedUrl: '',
  fetchInterval: '60',
});
const rssFeeds = ref<RssFeedItem[]>([
  { url: 'https://example.com/feed' }, // Sample feed
]);

const addRssFeed = () => {
  if (rssForm.newFeedUrl.trim() === '') {
    ElMessage.warning('请输入有效的 RSS 订阅源 URL。');
    return;
  }
  rssFeeds.value.push({ url: rssForm.newFeedUrl });
  rssForm.newFeedUrl = ''; // Clear input
  ElMessage.success('RSS 订阅源已添加 (模拟)！');
  console.log('RSS feeds:', rssFeeds.value);
  console.log('Fetch interval:', rssForm.fetchInterval);
};

const removeRssFeed = (index: number) => {
  ElMessageBox.confirm('确定要移除此订阅源吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    rssFeeds.value.splice(index, 1);
    ElMessage.success('订阅源已移除。');
  }).catch(() => {
    // Action cancelled
  });
};

</script>

<style scoped>
.information-capture-settings {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  font-weight: bold;
}
</style>