<template>
  <el-dropdown trigger="click" class="international" @command="handleSetLanguage">
    <div>
      <el-tooltip content="语言" placement="bottom">
        <el-icon :size="20">
          <Operation />
        </el-icon>
      </el-tooltip>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          :disabled="language === 'zh-cn'"
          command="zh-cn"
        >
          中文
        </el-dropdown-item>
        <el-dropdown-item
          :disabled="language === 'en'"
          command="en"
        >
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Operation } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

const language = computed(() => appStore.language)

const handleSetLanguage = (lang: string) => {
  appStore.setLanguage(lang)
  ElMessage({
    message: '切换语言成功',
    type: 'success'
  })
  // 这里可以添加国际化逻辑
  // 例如：i18n.global.locale = lang
}
</script>

<style lang="scss" scoped>
.international {
  display: inline-block;
  cursor: pointer;
  vertical-align: middle;
  
  &:hover {
    color: #409eff;
  }
}
</style>