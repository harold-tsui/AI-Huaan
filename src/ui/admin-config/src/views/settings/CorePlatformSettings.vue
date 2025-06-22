<template>
  <div class="core-platform-settings">
    <h3>核心平台选择</h3>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>选择您的知识管理核心平台</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="平台">
          <el-select v-model="form.platform" placeholder="请选择平台" @change="handlePlatformChange">
            <el-option label="Obsidian" value="obsidian"></el-option>
            <el-option label="Notion" value="notion"></el-option>
            <el-option label="Logseq" value="logseq"></el-option>
            <el-option label="其他 (手动配置)" value="other"></el-option>
          </el-select>
        </el-form-item>

        <div v-if="form.platform === 'obsidian'" class="platform-specific-settings">
          <h4>Obsidian 配置</h4>
          <el-form-item label="Vault 路径">
            <el-input v-model="form.obsidian_vault_path" placeholder="例如: /Users/YourName/Documents/ObsidianVault"></el-input>
          </el-form-item>
          <el-form-item label="API 密钥">
            <el-input v-model="form.obsidian_api_key" placeholder="如果需要"></el-input>
          </el-form-item>
        </div>

        <div v-if="form.platform === 'notion'" class="platform-specific-settings">
          <h4>Notion 配置</h4>
          <el-form-item label="API 密钥">
            <el-input v-model="form.notion_api_key"></el-input>
          </el-form-item>
          <el-form-item label="数据库 ID">
            <el-input v-model="form.notion_database_id"></el-input>
          </el-form-item>
        </div>

        <div v-if="form.platform === 'logseq'" class="platform-specific-settings">
          <h4>Logseq 配置</h4>
          <el-form-item label="Graph 路径">
            <el-input v-model="form.logseq_graph_path" placeholder="例如: /Users/YourName/Documents/LogseqGraph"></el-input>
          </el-form-item>
        </div>
        
        <el-form-item>
          <el-button type="primary" @click="onSubmit">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const form = reactive({
  platform: 'obsidian',
  obsidian_vault_path: '',
  obsidian_api_key: '',
  notion_api_key: '',
  notion_database_id: '',
  logseq_graph_path: '',
});

const handlePlatformChange = (value: string) => {
  console.log('Platform changed to:', value);
  // Reset other platform settings if needed
};

const onSubmit = async () => {
  console.log('submit!', form);
  try {
    await axios.post('/api/config/core-platform', form);
    ElMessage.success('核心平台设置已保存！');
  } catch (error) {
    console.error('Error saving core platform settings:', error);
    ElMessage.error('保存核心平台设置失败！');
  }
};

onMounted(async () => {
  try {
    const response = await axios.get('/api/config/core-platform');
    if (response.data) {
      Object.assign(form, response.data);
      ElMessage.success('核心平台设置已加载！');
    }
  } catch (error) {
    console.error('Error loading core platform settings:', error);
    // ElMessage.error('加载核心平台设置失败！'); // Optional: display error to user
  }
});
</script>

<style scoped>
.core-platform-settings {
  padding: 20px;
}
.box-card {
  margin-top: 20px;
}
.platform-specific-settings {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fcfcfc;
}
.platform-specific-settings h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #303133;
}
</style>