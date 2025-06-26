<template>
  <div class="tabs-view">
    <el-scrollbar class="tabs-scrollbar">
      <div class="tabs-content">
        <div
          v-for="tab in appStore.tabs"
          :key="tab.path"
          class="tab-item"
          :class="{ 'is-active': tab.path === $route.path }"
          @click="handleTabClick(tab)"
          @contextmenu.prevent="handleContextMenu($event, tab)"
        >
          <span class="tab-title">{{ tab.title }}</span>
          <el-icon
            v-if="!tab.affix"
            class="tab-close"
            @click.stop="handleTabClose(tab)"
          >
            <Close />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>
    
    <!-- 右键菜单 -->
    <div class="tabs-actions">
      <el-dropdown @command="handleCommand" trigger="click">
        <el-button type="text" class="action-btn">
          <el-icon><MoreFilled /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="refresh">
              <el-icon><Refresh /></el-icon>
              刷新当前页
            </el-dropdown-item>
            <el-dropdown-item command="close-current" :disabled="currentTab?.affix">
              <el-icon><Close /></el-icon>
              关闭当前页
            </el-dropdown-item>
            <el-dropdown-item command="close-others">
              <el-icon><Remove /></el-icon>
              关闭其他页
            </el-dropdown-item>
            <el-dropdown-item command="close-all">
              <el-icon><CircleClose /></el-icon>
              关闭所有页
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <!-- 右键上下文菜单 -->
    <teleport to="body">
      <div
        v-show="contextMenu.visible"
        class="context-menu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click="hideContextMenu"
      >
        <div class="context-menu-item" @click="refreshTab(contextMenu.tab)">
          <el-icon><Refresh /></el-icon>
          刷新
        </div>
        <div 
          class="context-menu-item" 
          :class="{ disabled: contextMenu.tab?.affix }"
          @click="closeTab(contextMenu.tab)"
        >
          <el-icon><Close /></el-icon>
          关闭
        </div>
        <div class="context-menu-item" @click="closeOtherTabs(contextMenu.tab)">
          <el-icon><Remove /></el-icon>
          关闭其他
        </div>
        <div class="context-menu-item" @click="closeAllTabs">
          <el-icon><CircleClose /></el-icon>
          关闭所有
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Close,
  MoreFilled,
  Refresh,
  Remove,
  CircleClose
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

// 当前标签页
const currentTab = computed(() => {
  return appStore.tabs.find(tab => tab.path === route.path)
})

// 右键菜单状态
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  tab: null as any
})

// 点击标签页
const handleTabClick = (tab: any) => {
  if (tab.path !== route.path) {
    router.push(tab.path)
  }
}

// 关闭标签页
const handleTabClose = (tab: any) => {
  closeTab(tab)
}

// 右键菜单
const handleContextMenu = (event: MouseEvent, tab: any) => {
  contextMenu.visible = true
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.tab = tab
}

// 隐藏右键菜单
const hideContextMenu = () => {
  contextMenu.visible = false
}

// 下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'refresh':
      refreshTab(currentTab.value)
      break
    case 'close-current':
      closeTab(currentTab.value)
      break
    case 'close-others':
      closeOtherTabs(currentTab.value)
      break
    case 'close-all':
      closeAllTabs()
      break
  }
}

// 刷新标签页
const refreshTab = (tab: any) => {
  if (!tab) return
  
  // 如果是当前页面，刷新页面
  if (tab.path === route.path) {
    // 先从缓存中移除
    appStore.removeCachedView(tab.name)
    
    // 重新加载
    nextTick(() => {
      appStore.addCachedView(tab.name)
      router.replace({ path: '/redirect' + tab.path })
    })
  }
  
  hideContextMenu()
}

// 关闭标签页
const closeTab = (tab: any) => {
  if (!tab || tab.affix) {
    hideContextMenu()
    return
  }
  
  const tabs = appStore.tabs
  const currentIndex = tabs.findIndex(t => t.path === tab.path)
  
  // 移除标签页
  appStore.removeTab(tab.path)
  
  // 如果关闭的是当前页面，需要跳转到其他页面
  if (tab.path === route.path) {
    const nextTab = tabs[currentIndex] || tabs[currentIndex - 1]
    if (nextTab) {
      router.push(nextTab.path)
    } else {
      router.push('/dashboard')
    }
  }
  
  hideContextMenu()
}

// 关闭其他标签页
const closeOtherTabs = (tab: any) => {
  if (!tab) {
    hideContextMenu()
    return
  }
  
  appStore.closeOtherTabs(tab.path)
  
  // 如果当前页面不是保留的页面，跳转到保留的页面
  if (route.path !== tab.path) {
    router.push(tab.path)
  }
  
  hideContextMenu()
  ElMessage.success('已关闭其他标签页')
}

// 关闭所有标签页
const closeAllTabs = () => {
  appStore.closeAllTabs()
  router.push('/dashboard')
  hideContextMenu()
  ElMessage.success('已关闭所有标签页')
}

// 监听点击事件，隐藏右键菜单
const handleDocumentClick = () => {
  hideContextMenu()
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style lang="scss" scoped>
.tabs-view {
  display: flex;
  align-items: center;
  height: 100%;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
}

.tabs-scrollbar {
  flex: 1;
  height: 100%;
  
  :deep(.el-scrollbar__bar) {
    display: none;
  }
}

.tabs-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 8px;
}

.tab-item {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  margin-right: 4px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: var(--el-fill-color);
  }
  
  &.is-active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-7);
    color: var(--el-color-primary);
  }
  
  .tab-title {
    font-size: 12px;
    margin-right: 4px;
  }
  
  .tab-close {
    font-size: 12px;
    border-radius: 50%;
    transition: all 0.2s;
    
    &:hover {
      background: var(--el-color-info-light-8);
      color: var(--el-color-info);
    }
  }
}

.tabs-actions {
  padding: 0 8px;
  
  .action-btn {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: var(--el-fill-color-light);
    }
  }
}

.context-menu {
  position: fixed;
  z-index: 9999;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  box-shadow: var(--el-box-shadow-light);
  padding: 4px 0;
  min-width: 120px;
  
  .context-menu-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover:not(.disabled) {
      background: var(--el-fill-color-light);
    }
    
    &.disabled {
      color: var(--el-text-color-disabled);
      cursor: not-allowed;
    }
    
    .el-icon {
      margin-right: 8px;
      font-size: 14px;
    }
  }
}
</style>