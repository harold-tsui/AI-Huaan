<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <div 
      class="sidebar" 
      :class="{ 'sidebar-collapsed': appStore.isSidebarCollapsed }"
    >
      <div class="sidebar-header">
        <div class="logo">
          <img src="/logo.svg" alt="Logo" class="logo-img" />
          <span v-show="!appStore.isSidebarCollapsed" class="logo-text">
            AI Second Brain
          </span>
        </div>
      </div>
      
      <div class="sidebar-content">
        <SidebarMenu />
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 顶部导航 -->
      <div class="navbar">
        <div class="navbar-left">
          <el-button 
            type="text" 
            @click="toggleSidebar"
            class="sidebar-toggle"
          >
            <el-icon><Fold v-if="!appStore.isSidebarCollapsed" /><Expand v-else /></el-icon>
          </el-button>
          
          <!-- 面包屑 -->
          <el-breadcrumb separator="/" class="breadcrumb">
            <el-breadcrumb-item 
              v-for="item in appStore.breadcrumbs" 
              :key="item.title"
              :to="item.path"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="navbar-right">
          <!-- 全屏切换 -->
          <el-tooltip content="全屏" placement="bottom">
            <el-button type="text" @click="toggleFullscreen" class="navbar-btn">
              <el-icon><FullScreen /></el-icon>
            </el-button>
          </el-tooltip>
          
          <!-- 主题切换 -->
          <el-tooltip content="切换主题" placement="bottom">
            <el-button type="text" @click="toggleTheme" class="navbar-btn">
              <el-icon><Sunny v-if="appStore.isDarkMode" /><Moon v-else /></el-icon>
            </el-button>
          </el-tooltip>
          
          <!-- 语言切换 -->
          <el-dropdown @command="handleLanguageChange" class="language-dropdown">
            <el-button type="text" class="navbar-btn">
              <el-icon><Link /></el-icon>
              <span class="language-text">{{ currentLanguageText }}</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN" :disabled="appStore.currentLanguage === 'zh-CN'">
                  简体中文
                </el-dropdown-item>
                <el-dropdown-item command="en-US" :disabled="appStore.currentLanguage === 'en-US'">
                  English
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <!-- 用户菜单 -->
          <el-dropdown @command="handleUserCommand" class="user-dropdown">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ userStore.userInfo?.username || '用户' }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  个人设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 标签页 -->
      <div class="tabs-container" v-if="appStore.openTabs.length > 0">
        <TabsView />
      </div>
      
      <!-- 主内容 -->
      <div class="content-container">
        <router-view v-slot="{ Component, route }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive :include="cachedViews">
              <component :is="Component" :key="route.path" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Fold,
  Expand,
  FullScreen,
  Sunny,
  Moon,
  Link,
  User,
  Setting,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { useAppStore } from '@/stores/modules/app'
import SidebarMenu from './components/SidebarMenu.vue'
import TabsView from './components/TabsView.vue'

const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 计算属性
const cachedViews = computed(() => {
  return appStore.openTabs.map(tab => tab.path)
})

const currentLanguageText = computed(() => {
  return appStore.currentLanguage === 'zh-CN' ? '中文' : 'English'
})

// 切换侧边栏
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// 切换主题
const toggleTheme = () => {
  appStore.toggleTheme()
}

// 语言切换
const handleLanguageChange = (language: 'zh-CN' | 'en-US') => {
  appStore.setLanguage(language)
  ElMessage.success('语言切换成功')
}

// 用户菜单操作
const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile/info')
      break
    case 'settings':
      router.push('/profile/settings')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        await userStore.logout()
        router.push('/login')
        ElMessage.success('退出登录成功')
      } catch (error) {
        // 用户取消操作
      }
      break
  }
}

// 监听键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  // F11 全屏切换
  if (event.key === 'F11') {
    event.preventDefault()
    toggleFullscreen()
  }
}

// 生命周期
onMounted(() => {
  // 初始化应用设置
  appStore.initialize()
  
  // 监听键盘事件
  document.addEventListener('keydown', handleKeydown)
  
  // 监听全屏变化
  document.addEventListener('fullscreenchange', () => {
    // 可以在这里添加全屏状态变化的处理逻辑
  })
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss" scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s ease;
  overflow: hidden;
  
  &.sidebar-collapsed {
    width: 64px;
  }
  
  .sidebar-header {
    height: 60px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid var(--el-border-color-light);
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .logo-img {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }
      
      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        white-space: nowrap;
      }
    }
  }
  
  .sidebar-content {
    height: calc(100% - 60px);
    overflow-y: auto;
    overflow-x: hidden;
  }
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.navbar {
  height: 60px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  
  .navbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .sidebar-toggle {
      font-size: 18px;
      
      &:hover {
        background: var(--el-fill-color-light);
      }
    }
    
    .breadcrumb {
      font-size: 14px;
    }
  }
  
  .navbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .navbar-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        background: var(--el-fill-color-light);
      }
    }
    
    .language-dropdown {
      .language-text {
        margin-left: 4px;
        font-size: 12px;
      }
    }
    
    .user-dropdown {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
        
        &:hover {
          background: var(--el-fill-color-light);
        }
        
        .username {
          font-size: 14px;
          color: var(--el-text-color-primary);
        }
        
        .dropdown-icon {
          font-size: 12px;
          color: var(--el-text-color-regular);
        }
      }
    }
  }
}

.tabs-container {
  height: 40px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
}

.content-container {
  flex: 1;
  overflow: auto;
  background: var(--el-bg-color-page);
  padding: 16px;
}

// 过渡动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// 响应式设计
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    
    &.sidebar-show {
      transform: translateX(0);
    }
  }
  
  .main-container {
    margin-left: 0;
  }
  
  .navbar {
    .breadcrumb {
      display: none;
    }
  }
}
</style>