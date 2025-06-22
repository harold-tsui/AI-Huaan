<template>
  <div class="knowledge-understanding-settings">
    <h3>知识理解设置</h3>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>LLM 模型配置</span>
        </div>
      </template>
      <el-form :model="llmForm" label-width="150px">
        <el-form-item label="选择 LLM 模型">
          <el-select v-model="llmForm.model" @change="handleLlmChange">
            <el-option label="OpenAI GPT-4" value="openai-gpt4"></el-option>
            <el-option label="OpenAI GPT-3.5 Turbo" value="openai-gpt3.5"></el-option>
            <el-option label="Anthropic Claude 3 Opus" value="anthropic-claude3"></el-option>
            <el-option label="本地模型 (需配置)" value="local-model"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="API 密钥">
          <el-input v-model="llmForm.apiKey" type="password" show-password></el-input>
        </el-form-item>
        <div v-if="llmForm.model === 'local-model'" class="local-llm-settings">
          <el-form-item label="本地模型 API 端点">
            <el-input v-model="llmForm.localEndpoint" placeholder="http://localhost:11434/api/generate"></el-input>
          </el-form-item>
          <el-form-item label="本地模型名称">
            <el-input v-model="llmForm.localModelName" placeholder="e.g., llama2 (可选)"></el-input>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button type="primary" @click="saveLlmSettings">保存LLM设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>内容处理偏好</span>
        </div>
      </template>
      <el-form :model="processingPrefsForm" label-width="150px">
        <el-form-item label="摘要长度偏好">
          <el-select v-model="processingPrefsForm.summaryLength">
            <el-option label="简短" value="short"></el-option>
            <el-option label="中等" value="medium"></el-option>
            <el-option label="详细" value="long"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键词提取方式">
          <el-select v-model="processingPrefsForm.keywordExtractionMethod">
            <el-option label="自动" value="auto"></el-option>
            <el-option label="TF-IDF" value="tf-idf"></el-option>
            <el-option label="RAKE" value="rake"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="提取关键词数量">
          <el-input-number v-model="processingPrefsForm.numKeywords" :min="1" :max="20"></el-input-number>
        </el-form-item>
        <el-form-item label="自动打标签">
          <el-select v-model="processingPrefsForm.autoTagging" @change="handleAutoTaggingChange">
            <el-option label="启用" value="enabled"></el-option>
            <el-option label="禁用" value="disabled"></el-option>
          </el-select>
        </el-form-item>
        <div v-if="processingPrefsForm.autoTagging === 'enabled'" class="auto-tagging-rules">
          <el-form-item label="自动打标签规则">
            <el-input
              type="textarea"
              :rows="3"
              placeholder="每行一条规则, 格式: 关键词=>标签1,标签2 (示例: 若内容包含 'AI', 添加标签 '人工智能')"
              v-model="processingPrefsForm.autoTaggingRules">
            </el-input>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button type="primary" @click="saveProcessingPrefs">保存处理偏好</el-button>
        </el-form-item>
      </el-form>
    </el-card>

  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

// LLM Form
const llmForm = reactive({
  model: 'openai-gpt4',
  apiKey: '',
  localEndpoint: 'http://localhost:11434/api/generate',
  localModelName: '',
});

const handleLlmChange = (value: string) => {
  console.log('LLM model changed to:', value);
};

const saveLlmSettings = () => {
  console.log('LLM settings saved:', llmForm);
  ElMessage.success('LLM 模型配置已保存 (模拟)！');
};

// Processing Preferences Form
const processingPrefsForm = reactive({
  summaryLength: 'medium',
  keywordExtractionMethod: 'auto',
  numKeywords: 5,
  autoTagging: 'enabled',
  autoTaggingRules: '',
});

const handleAutoTaggingChange = (value: string) => {
  console.log('Auto-tagging changed to:', value);
};

const saveProcessingPrefs = () => {
  console.log('Processing preferences saved:', processingPrefsForm);
  ElMessage.success('内容处理偏好已保存 (模拟)！');
};

</script>

<style scoped>
.knowledge-understanding-settings {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  font-weight: bold;
}
.local-llm-settings,
.auto-tagging-rules {
  margin-top: 10px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fcfcfc;
}
</style>