// 需要先安装 vue-router 依赖: npm install vue-router@4
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import CorePlatformSettings from '@/views/settings/CorePlatformSettings.vue';
import InformationCaptureSettings from '@/views/settings/InformationCaptureSettings.vue';
import KnowledgeUnderstandingSettings from '@/views/settings/KnowledgeUnderstandingSettings.vue';
import KnowledgeActivationSettings from '@/views/settings/KnowledgeActivationSettings.vue';
import ContextManagementSettings from '@/views/settings/ContextManagementSettings.vue';
import TagManagementSettings from '@/views/settings/TagManagementSettings.vue';
import DataSyncBackupSettings from '@/views/settings/DataSyncBackupSettings.vue';
import ThemeAppearanceSettings from '@/views/settings/ThemeAppearanceSettings.vue';
import ShortcutSettings from '@/views/settings/ShortcutSettings.vue';
import AboutHelp from '@/views/settings/AboutHelp.vue';
import PARAOrganizationSettings from '@/views/settings/PARAOrganizationSettings.vue';
import Layout from '@/layout/index.vue'; // Import the Layout component
// import Settings from '@/views/settings/index.vue' // Placeholder for future settings pages
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'), // Placeholder for dashboard
        meta: { title: 'Dashboard', icon: 'el-icon-s-home' }
      }
    ]
  },
  {
    path: '/config',
    component: Layout,
    redirect: '/config/core-platform',
    children: [
      {
        path: 'core-platform',
        name: 'CorePlatformSettings',
        component: CorePlatformSettings,
        meta: { title: '核心平台选择' }
      },
      {
        path: 'information-capture',
        name: 'InformationCaptureSettings',
        component: InformationCaptureSettings,
        meta: { title: '信息捕获设置' }
      },
      {
        path: 'knowledge-understanding',
        name: 'KnowledgeUnderstandingSettings',
        component: KnowledgeUnderstandingSettings,
        meta: { title: '知识理解设置' }
      },
      {
        path: 'knowledge-activation',
        name: 'KnowledgeActivationSettings',
        component: KnowledgeActivationSettings,
        meta: { title: '知识激活设置' }
      },
      {
        path: 'context-management',
        name: 'ContextManagementSettings',
        component: ContextManagementSettings,
        meta: { title: '动态用户上下文' }
      },
      {
        path: 'tag-management',
        name: 'TagManagementSettings',
        component: TagManagementSettings,
        meta: { title: '标签管理' }
      },
      {
        path: 'para-organization',
        name: 'PARAOrganizationSettings',
        component: PARAOrganizationSettings,
        meta: { title: 'PARA自动分类' }
      },
      {
        path: 'data-sync-backup',
        name: 'DataSyncBackupSettings',
        component: DataSyncBackupSettings,
        meta: { title: '数据同步与备份' }
      },
      {
        path: 'theme-appearance',
        name: 'ThemeAppearanceSettings',
        component: ThemeAppearanceSettings,
        meta: { title: '主题与外观' }
      },
      {
        path: 'shortcut-settings',
        name: 'ShortcutSettings',
        component: ShortcutSettings,
        meta: { title: '快捷键设置' }
      },
      {
        path: 'about-help',
        name: 'AboutHelp',
        component: AboutHelp,
        meta: { title: '关于与帮助' }
      }
      // Future configuration sections will be added here as child routes or separate top-level routes
      // Example:
      // {
      //   path: '/settings/information-capture',
      //   name: 'InformationCaptureSettings',
      //   component: () => import('@/views/settings/InformationCaptureSettings.vue')
      // }
    ]
  },
  // Fallback route for 404
  { 
    path: '/:pathMatch(.*)*', 
    name: 'NotFound', 
    component: () => import('@/views/error/404.vue') // Placeholder for 404 page
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;