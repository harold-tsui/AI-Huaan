<template>
  <div class="theme-switch" @click="toggleTheme">
    <el-tooltip
      :content="isDark ? '切换到亮色主题' : '切换到暗色主题'"
      placement="bottom"
    >
      <el-icon :size="20">
        <Sunny v-if="isDark" />
        <Moon v-else />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

const isDark = computed(() => appStore.theme === 'dark')

const toggleTheme = () => {
  appStore.toggleTheme()
}
</script>

<style lang="scss" scoped>
.theme-switch {
  display: inline-block;
  cursor: pointer;
  transition: color 0.3s;
  
  &:hover {
    color: #409eff;
  }
}
</style>