<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="appStore.sidebar.collapsed"
    :unique-opened="false"
    :collapse-transition="false"
    mode="vertical"
    router
    class="sidebar-menu"
  >
    <template v-for="route in menuRoutes" :key="route.path">
      <SidebarItem :route="route" :base-path="route.path" />
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/modules/app'
import { useUserStore } from '@/stores/modules/user'
import { asyncRoutes } from '@/router'
import SidebarItem from './SidebarItem.vue'
import { hasPermission } from '@/utils/permission'

const route = useRoute()
const appStore = useAppStore()
const userStore = useUserStore()

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  // 如果设置了activeMenu，则使用activeMenu
  if (meta?.activeMenu) {
    return meta.activeMenu
  }
  return path
})

// 过滤有权限的路由
const menuRoutes = computed(() => {
  return filterRoutes(asyncRoutes)
})

// 过滤路由
function filterRoutes(routes: any[]) {
  const res: any[] = []
  
  routes.forEach(route => {
    const tmp = { ...route }
    
    // 检查权限
    if (hasRoutePermission(tmp)) {
      // 如果有子路由，递归过滤
      if (tmp.children) {
        tmp.children = filterRoutes(tmp.children)
        
        // 如果过滤后还有子路由，或者alwaysShow为true，则显示
        if (tmp.children.length > 0 || tmp.meta?.alwaysShow) {
          res.push(tmp)
        }
      } else {
        res.push(tmp)
      }
    }
  })
  
  return res
}

// 检查路由权限
function hasRoutePermission(route: any) {
  // 如果路由设置为隐藏，则不显示
  if (route.meta?.hidden) {
    return false
  }
  
  // 如果没有设置权限，则显示
  if (!route.meta?.permission && !route.meta?.role) {
    return true
  }
  
  // 检查权限
  if (route.meta?.permission) {
    return hasPermission(route.meta.permission)
  }
  
  // 检查角色
  if (route.meta?.role) {
    const userRoles = userStore.roles || []
    const routeRoles = Array.isArray(route.meta.role) ? route.meta.role : [route.meta.role]
    return routeRoles.some(role => userRoles.includes(role))
  }
  
  return true
}
</script>

<style lang="scss" scoped>
.sidebar-menu {
  border: none;
  height: 100%;
  width: 100% !important;
  
  :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;
    
    &.is-active {
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: var(--el-color-primary);
      }
    }
  }
  
  :deep(.el-sub-menu) {
    .el-sub-menu__title {
      height: 48px;
      line-height: 48px;
    }
    
    &.is-active {
      .el-sub-menu__title {
        color: var(--el-color-primary);
      }
    }
  }
  
  // 折叠状态下的样式
  &.el-menu--collapse {
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      text-align: center;
      
      .el-icon {
        margin-right: 0;
      }
      
      span {
        display: none;
      }
    }
    
    :deep(.el-sub-menu) {
      .el-sub-menu__icon-arrow {
        display: none;
      }
    }
  }
}
</style>