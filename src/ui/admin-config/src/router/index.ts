/**
 * 路由配置
 */
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import { useAppStore } from '@/stores/modules/app'
import { createPermissionGuard } from '@/utils/permission'
import { ElMessage } from 'element-plus'

// 路由元信息类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    permission?: string | string[]
    role?: string | string[]
    requireAuth?: boolean
    hidden?: boolean
    keepAlive?: boolean
    breadcrumb?: boolean
    affix?: boolean
    activeMenu?: string
    noCache?: boolean
    alwaysShow?: boolean
  }
}

// 基础路由（不需要权限）
const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      hidden: true
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在',
      hidden: true
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/error/403.vue'),
    meta: {
      title: '无权限',
      hidden: true
    }
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/views/error/500.vue'),
    meta: {
      title: '服务器错误',
      hidden: true
    }
  }
]

// 动态路由（需要权限）
const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'Dashboard',
          affix: true,
          breadcrumb: false
        }
      }
    ]
  },
  {
    path: '/system',
    name: 'System',
    component: () => import('@/layout/index.vue'),
    redirect: '/system/config',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      permission: ['system:config:view', 'system:log:view'],
      alwaysShow: true
    },
    children: [
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/system/config.vue'),
        meta: {
          title: '系统配置',
          icon: 'Tools',
          permission: 'system:config:view'
        }
      },
      {
        path: 'logs',
        name: 'SystemLogs',
        component: () => import('@/views/log/index.vue'),
        meta: {
          title: '系统日志',
          icon: 'Document',
          permission: 'system:log:view'
        }
      },
      {
        path: 'backup',
        name: 'SystemBackup',
        component: () => import('@/views/settings/index.vue'),
        meta: {
          title: '数据备份',
          icon: 'FolderOpened',
          permission: 'system:backup:create'
        }
      },
      {
        path: 'maintenance',
        name: 'SystemMaintenance',
        component: () => import('@/views/monitor/index.vue'),
        meta: {
          title: '系统维护',
          icon: 'Tools',
          permission: 'system:maintenance'
        }
      }
    ]
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/layout/index.vue'),
    redirect: '/users/list',
    meta: {
      title: '用户管理',
      icon: 'User',
      permission: 'user:view',
      alwaysShow: true
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/user/index.vue'),
        meta: {
          title: '用户列表',
          icon: 'UserFilled',
          permission: 'user:view'
        }
      },
      {
        path: 'roles',
        name: 'UserRoles',
        component: () => import('@/views/role/index.vue'),
        meta: {
          title: '角色管理',
          icon: 'Avatar',
          permission: 'user:role:view'
        }
      },
      {
        path: 'permissions',
        name: 'UserPermissions',
        component: () => import('@/views/permission/index.vue'),
        meta: {
          title: '权限管理',
          icon: 'Key',
          permission: 'user:permission:view'
        }
      }
    ]
  },
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('@/layout/index.vue'),
    redirect: '/knowledge/list',
    meta: {
      title: '知识管理',
      icon: 'Reading',
      permission: 'knowledge:view',
      alwaysShow: true
    },
    children: [
      {
        path: 'list',
        name: 'KnowledgeList',
        component: () => import('@/views/content/index.vue'),
        meta: {
          title: '知识列表',
          icon: 'Document',
          permission: 'knowledge:view'
        }
      },
      {
        path: 'categories',
        name: 'KnowledgeCategories',
        component: () => import('@/views/content/index.vue'),
        meta: {
          title: '分类管理',
          icon: 'FolderOpened',
          permission: 'knowledge:category:view'
        }
      },
      {
        path: 'tags',
        name: 'KnowledgeTags',
        component: () => import('@/views/content/index.vue'),
        meta: {
          title: '标签管理',
          icon: 'PriceTag',
          permission: 'knowledge:tag:view'
        }
      },
      {
        path: 'processing',
        name: 'KnowledgeProcessing',
        component: () => import('@/views/content/index.vue'),
        meta: {
          title: '知识处理',
          icon: 'Cpu',
          permission: 'knowledge:process'
        }
      },
      {
        path: 'search',
        name: 'KnowledgeSearch',
        component: () => import('@/views/content/index.vue'),
        meta: {
          title: '知识搜索',
          icon: 'Search',
          permission: 'knowledge:search'
        }
      }
    ]
  },
  {
    path: '/para',
    name: 'Para',
    component: () => import('@/layout/index.vue'),
    redirect: '/para/projects',
    meta: {
      title: 'PARA管理',
      icon: 'Grid',
      permission: 'para:view',
      alwaysShow: true
    },
    children: [
      {
        path: 'projects',
        name: 'ParaProjects',
        component: () => import('@/views/para/index.vue'),
        meta: {
          title: '项目管理',
          icon: 'Briefcase',
          permission: 'para:project:view'
        }
      },
      {
        path: 'areas',
        name: 'ParaAreas',
        component: () => import('@/views/para/index.vue'),
        meta: {
          title: '领域管理',
          icon: 'MapLocation',
          permission: 'para:area:view'
        }
      },
      {
        path: 'resources',
        name: 'ParaResources',
        component: () => import('@/views/para/index.vue'),
        meta: {
          title: '资源管理',
          icon: 'Files',
          permission: 'para:resource:view'
        }
      },
      {
        path: 'archives',
        name: 'ParaArchives',
        component: () => import('@/views/para/index.vue'),
        meta: {
          title: '归档管理',
          icon: 'Box',
          permission: 'para:archive:view'
        }
      }
    ]
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: () => import('@/layout/index.vue'),
    redirect: '/analytics/overview',
    meta: {
      title: '数据分析',
      icon: 'TrendCharts',
      permission: 'analytics:view',
      alwaysShow: true
    },
    children: [
      {
        path: 'overview',
        name: 'AnalyticsOverview',
        component: () => import('@/views/monitor/index.vue'),
        meta: {
          title: '数据概览',
          icon: 'DataAnalysis',
          permission: 'analytics:view'
        }
      },
      {
        path: 'knowledge',
        name: 'AnalyticsKnowledge',
        component: () => import('@/views/monitor/index.vue'),
        meta: {
          title: '知识分析',
          icon: 'PieChart',
          permission: 'analytics:knowledge'
        }
      },
      {
        path: 'users',
        name: 'AnalyticsUsers',
        component: () => import('@/views/monitor/index.vue'),
        meta: {
          title: '用户分析',
          icon: 'UserFilled',
          permission: 'analytics:users'
        }
      },
      {
        path: 'reports',
        name: 'AnalyticsReports',
        component: () => import('@/views/monitor/index.vue'),
        meta: {
          title: '报表管理',
          icon: 'Document',
          permission: 'analytics:reports'
        }
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/layout/index.vue'),
    redirect: '/profile/info',
    meta: {
      title: '个人中心',
      icon: 'User',
      hidden: true
    },
    children: [
      {
        path: 'info',
        name: 'ProfileInfo',
        component: () => import('@/views/settings/index.vue'),
        meta: {
          title: '个人信息',
          icon: 'UserFilled',
          breadcrumb: false
        }
      },
      {
        path: 'settings',
        name: 'ProfileSettings',
        component: () => import('@/views/settings/index.vue'),
        meta: {
          title: '个人设置',
          icon: 'Setting',
          breadcrumb: false
        }
      }
    ]
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [...constantRoutes, ...asyncRoutes],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, left: 0 }
    }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - AI Second Brain Admin`
  }
  
  // 白名单路由（不需要登录）
  const whiteList = ['/login', '/404', '/403', '/500']
  
  if (whiteList.includes(to.path)) {
    next()
    return
  }
  
  // 检查登录状态
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  
  // 如果已登录但用户信息为空，获取用户信息
  if (!userStore.userInfo) {
    try {
      await userStore.getCurrentUser()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      userStore.logout()
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }
  
  // 权限检查
  const permissionGuard = createPermissionGuard()
  permissionGuard(to, from, next)
})

router.afterEach((to) => {
  const appStore = useAppStore()
  
  // 添加到标签页
  if (to.meta.title && !to.meta.hidden) {
    appStore.addTab({
      path: to.path,
      title: to.meta.title,
      closable: !(to.meta.affix || false)
    })
  }
  
  // 更新面包屑
  const breadcrumbs = generateBreadcrumbs(to)
  appStore.setBreadcrumbs(breadcrumbs)
})

// 生成面包屑
function generateBreadcrumbs(route: any) {
  const breadcrumbs: Array<{ title: string; path?: string }> = []
  
  // 添加首页
  breadcrumbs.push({ title: '首页', path: '/dashboard' })
  
  // 解析路由路径
  const pathArray = route.path.split('/').filter((item: string) => item)
  let currentPath = ''
  
  pathArray.forEach((path: string, index: number) => {
    currentPath += `/${path}`
    
    // 查找匹配的路由
    const matchedRoute = router.getRoutes().find(r => r.path === currentPath)
    
    if (matchedRoute && matchedRoute.meta?.title) {
      // 如果是最后一个路径且breadcrumb不为false，或者不是最后一个路径
      if (index === pathArray.length - 1) {
        if (route.meta?.breadcrumb !== false) {
          breadcrumbs.push({ title: matchedRoute.meta.title })
        }
      } else {
        breadcrumbs.push({
          title: matchedRoute.meta.title,
          path: currentPath
        })
      }
    }
  })
  
  return breadcrumbs
}

// 错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  ElMessage.error('页面加载失败，请刷新重试')
})

// 导出路由实例和路由配置
export default router
export { constantRoutes, asyncRoutes }