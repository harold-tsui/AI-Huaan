<template>
  <div v-if="!route.meta?.hidden">
    <!-- 如果只有一个子路由且不是alwaysShow，直接显示子路由 -->
    <template v-if="hasOneShowingChild(route.children, route) && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !route.meta?.alwaysShow">
      <AppLink v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{ 'submenu-title-noDropdown': !isNest }">
          <el-icon v-if="onlyOneChild.meta.icon">
            <component :is="onlyOneChild.meta.icon" />
          </el-icon>
          <template #title>
            <span>{{ onlyOneChild.meta.title }}</span>
          </template>
        </el-menu-item>
      </AppLink>
    </template>
    
    <!-- 有多个子路由，显示子菜单 -->
    <el-sub-menu v-else :index="resolvePath(route.path)" popper-append-to-body>
      <template #title>
        <el-icon v-if="route.meta?.icon">
          <component :is="route.meta.icon" />
        </el-icon>
        <span>{{ route.meta?.title }}</span>
      </template>
      
      <SidebarItem
        v-for="child in route.children"
        :key="child.path"
        :route="child"
        :base-path="resolvePath(child.path)"
        :is-nest="true"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isExternal } from '@/utils/validate'
import AppLink from './AppLink.vue'

interface Props {
  route: any
  basePath?: string
  isNest?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  basePath: '',
  isNest: false
})

const onlyOneChild = ref<any>({})

// 检查是否只有一个显示的子路由
function hasOneShowingChild(children: any[] = [], parent: any) {
  const showingChildren = children.filter(item => {
    if (item.meta?.hidden) {
      return false
    } else {
      // 临时设置，用于判断是否只有一个子路由
      onlyOneChild.value = item
      return true
    }
  })
  
  // 当只有一个子路由时，默认显示子路由
  if (showingChildren.length === 1) {
    return true
  }
  
  // 如果没有子路由显示，显示父路由
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true }
    return true
  }
  
  return false
}

// 解析路径
function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  return path.resolve(props.basePath, routePath)
}

// 简单的路径解析函数
const path = {
  resolve(basePath: string, targetPath: string) {
    if (targetPath.startsWith('/')) {
      return targetPath
    }
    
    const baseSegments = basePath.split('/').filter(Boolean)
    const targetSegments = targetPath.split('/').filter(Boolean)
    
    return '/' + [...baseSegments, ...targetSegments].join('/')
  }
}
</script>

<style lang="scss" scoped>
.submenu-title-noDropdown {
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid var(--el-text-color-regular);
    opacity: 0;
  }
}
</style>