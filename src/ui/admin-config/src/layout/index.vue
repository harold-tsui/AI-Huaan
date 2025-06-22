<template>
  <el-container class="layout-container">
    <el-aside width="200px" class="sidebar">
      <el-scrollbar>
        <el-menu :default-openeds="['1']" :default-active="activeMenu" router>
          <el-menu-item index="/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>Dashboard</span>
          </el-menu-item>
          <el-sub-menu index="config">
            <template #title>
              <el-icon><Setting /></el-icon><span>Configuration</span>
            </template>
            <!-- Configuration items will be dynamically generated or hardcoded here -->
            <el-menu-item index="/config/core-platform">核心平台选择</el-menu-item>
            <el-menu-item index="/config/information-capture">信息捕获设置</el-menu-item>
            <el-menu-item index="/config/knowledge-understanding">知识理解设置</el-menu-item>
            <el-menu-item index="/config/knowledge-activation">知识激活设置</el-menu-item>
            <el-menu-item index="/config/context-management">动态用户上下文</el-menu-item>
            <el-menu-item index="/config/tag-management">标签管理</el-menu-item>
            <el-menu-item index="/config/para-organization">PARA自动分类</el-menu-item>
            <el-menu-item index="/config/data-sync-backup">数据同步与备份</el-menu-item>
            <el-menu-item index="/config/theme-appearance">主题与外观</el-menu-item>
            <el-menu-item index="/config/shortcut-settings">快捷键设置</el-menu-item>
            <el-menu-item index="/config/about-help">关于与帮助</el-menu-item>
            <!-- Example: <el-menu-item index="/core-platform">Core Platform</el-menu-item> -->
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div>AI Second Brain - Configuration</div>
      </el-header>

      <el-main class="main-content">
        <el-scrollbar>
          <router-view />
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Setting, HomeFilled } from '@element-plus/icons-vue'; // Import icons

const route = useRoute();
const activeMenu = computed(() => route.path);

// TODO: Populate sidebar menu items based on routes or a configuration store
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  .el-menu {
    border-right: none;
    background-color: #304156;
    .el-menu-item,
    :deep(.el-sub-menu__title) {
      color: #bfcbd9;
      &:hover {
        background-color: #263445;
      }
    }
    .el-menu-item.is-active {
      color: #409EFF;
      background-color: #1f2d3d;
    }
  }
}

.header {
  background-color: #fff;
  color: #333;
  line-height: 60px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  font-size: 1.2em;
  font-weight: bold;
}

.main-content {
  padding: 20px;
  background-color: #f0f2f5;
}
</style>