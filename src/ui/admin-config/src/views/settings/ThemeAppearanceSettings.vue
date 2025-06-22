<template>
  <div class="theme-appearance-settings">
    <h3>主题与外观</h3>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>主题选择</span>
        </div>
      </template>
      <el-form label-width="120px">
        <el-form-item label="当前主题">
          <el-select v-model="currentTheme" placeholder="选择主题" @change="applyTheme">
            <el-option label="默认亮色" value="light"></el-option>
            <el-option label="默认暗色" value="dark"></el-option>
            <el-option label="自定义主题A" value="custom-a"></el-option>
            <el-option label="自定义主题B" value="custom-b"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="主题预览" v-if="currentTheme.startsWith('custom')">
            <div class="theme-preview" :class="currentTheme + '-preview'">
                <p>这是一个主题预览区域</p>
                <el-button type="primary">主要按钮</el-button>
                <el-button>普通按钮</el-button>
            </div>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>字体设置</span>
        </div>
      </template>
      <el-form label-width="120px">
        <el-form-item label="界面字体">
          <el-select v-model="fontSettings.uiFont" placeholder="选择界面字体">
            <el-option label="系统默认" value="system-default"></el-option>
            <el-option label="微软雅黑" value="microsoft-yahei"></el-option>
            <el-option label="苹方" value="pingfang-sc"></el-option>
            <el-option label="思源黑体" value="source-han-sans"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="内容字体">
          <el-select v-model="fontSettings.contentFont" placeholder="选择内容字体">
            <el-option label="系统默认" value="system-default"></el-option>
            <el-option label="宋体" value="simsun"></el-option>
            <el-option label="楷体" value="kaiti"></el-option>
            <el-option label="LXGW WenKai" value="lxgw-wenkai"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="字体大小">
          <el-slider v-model="fontSettings.fontSize" :min="12" :max="24" show-input></el-slider>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
        <template #header>
            <div class="card-header">
            <span>自定义CSS</span>
            </div>
        </template>
        <el-alert
            title="警告：不正确的CSS代码可能会破坏应用界面。请谨慎使用。"
            type="warning"
            show-icon
            :closable="false"
            style="margin-bottom: 15px;"
        />
        <el-input
            v-model="customCSS"
            type="textarea"
            :rows="10"
            placeholder="在此处输入自定义CSS代码..."
        />
        <div style="margin-top: 15px;">
            <el-button type="primary" @click="applyCustomCSS">应用CSS</el-button>
            <el-button @click="resetCustomCSS">重置CSS</el-button>
        </div>
    </el-card>

    <div style="margin-top: 20px; text-align: right;">
        <el-button type="primary" @click="saveAllAppearanceSettings">保存所有外观设置</el-button>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { ElMessage } from 'element-plus';

const currentTheme = ref('light');
const fontSettings = reactive({
  uiFont: 'system-default',
  contentFont: 'system-default',
  fontSize: 14,
});
const customCSS = ref('');

const applyTheme = (theme: string) => {
  // In a real app, this would dynamically load a CSS file or update CSS variables
  console.log('Applying theme:', theme);
  // Example: document.documentElement.setAttribute('data-theme', theme);
  ElMessage.success(`主题已切换为: ${theme}`);
  // For dark mode, you might toggle a class on the <html> or <body> element
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

const applyCustomCSS = () => {
    console.log('Applying custom CSS:', customCSS.value);
    // In a real app, this would inject the CSS into a <style> tag in the document head
    let styleElement = document.getElementById('custom-user-styles');
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-user-styles';
        document.head.appendChild(styleElement);
    }
    styleElement.innerHTML = customCSS.value;
    ElMessage.success('自定义CSS已应用');
};

const resetCustomCSS = () => {
    customCSS.value = '';
    let styleElement = document.getElementById('custom-user-styles');
    if (styleElement) {
        styleElement.innerHTML = '';
    }
    ElMessage.info('自定义CSS已重置');
};

const saveAllAppearanceSettings = () => {
  console.log('Saving all appearance settings:', {
    theme: currentTheme.value,
    fonts: fontSettings,
    css: customCSS.value
  });
  ElMessage.success('所有外观设置已保存');
};

// Apply initial theme (e.g., from localStorage or default)
applyTheme(currentTheme.value);

</script>

<style scoped>
.theme-appearance-settings {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  font-weight: bold;
}
.theme-preview {
    border: 1px solid #ccc;
    padding: 20px;
    border-radius: 4px;
}
.custom-a-preview {
    background-color: #e0f7fa; /* Light cyan background */
    color: #00796b; /* Dark cyan text */
}
.custom-a-preview .el-button--primary {
    background-color: #00796b;
    border-color: #00796b;
}
.custom-b-preview {
    background-color: #fff3e0; /* Light orange background */
    color: #ef6c00; /* Dark orange text */
}
.custom-b-preview .el-button--primary {
    background-color: #ef6c00;
    border-color: #ef6c00;
}
</style>