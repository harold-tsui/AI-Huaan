import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { ElMessage } from 'element-plus'
import { systemApi } from '@/api'
import type { SystemConfig } from '@/api/types'

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
  sidebarCollapsed: boolean
  sidebarWidth: number
  showBreadcrumb: boolean
  showTabs: boolean
  showFooter: boolean
  enableAnimation: boolean
  pageSize: number
  autoSave: boolean
  autoSaveInterval: number
}

export interface LayoutSettings {
  headerHeight: number
  sidebarWidth: number
  sidebarCollapsedWidth: number
  contentPadding: number
  borderRadius: number
  boxShadow: string
}

export const useAppStore = defineStore('app', () => {
  // 应用设置状态
  const settings = ref<AppSettings>({
    theme: 'light',
    language: 'zh-CN',
    sidebarCollapsed: false,
    sidebarWidth: 240,
    showBreadcrumb: true,
    showTabs: true,
    showFooter: true,
    enableAnimation: true,
    pageSize: 20,
    autoSave: true,
    autoSaveInterval: 30000 // 30秒
  })

  // 布局设置状态
  const layoutSettings = ref<LayoutSettings>({
    headerHeight: 60,
    sidebarWidth: 240,
    sidebarCollapsedWidth: 64,
    contentPadding: 20,
    borderRadius: 6,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  })

  // 系统配置状态
  const systemConfigs = ref<Record<string, SystemConfig>>({})
  const isLoadingConfigs = ref(false)

  // 应用状态
  const isLoading = ref(false)
  const currentRoute = ref('')
  const breadcrumbs = ref<Array<{ title: string; path?: string }>>([])
  const openTabs = ref<Array<{ title: string; path: string; closable: boolean }>>([])
  const activeTab = ref('')

  // 计算属性
  const isDarkMode = computed(() => {
    if (settings.value.theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return settings.value.theme === 'dark'
  })

  const currentLanguage = computed(() => settings.value.language)
  const isSidebarCollapsed = computed(() => settings.value.sidebarCollapsed)
  const currentSidebarWidth = computed(() => 
    settings.value.sidebarCollapsed 
      ? layoutSettings.value.sidebarCollapsedWidth 
      : layoutSettings.value.sidebarWidth
  )

  // 动作
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
    saveSettingsToStorage()
  }

  const updateLayoutSettings = (newLayoutSettings: Partial<LayoutSettings>) => {
    layoutSettings.value = { ...layoutSettings.value, ...newLayoutSettings }
    saveSettingsToStorage()
  }

  const toggleSidebar = () => {
    settings.value.sidebarCollapsed = !settings.value.sidebarCollapsed
    saveSettingsToStorage()
  }

  const toggleTheme = () => {
    const themes: AppSettings['theme'][] = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(settings.value.theme)
    const nextIndex = (currentIndex + 1) % themes.length
    settings.value.theme = themes[nextIndex]
    saveSettingsToStorage()
    applyTheme()
  }

  const setLanguage = (language: AppSettings['language']) => {
    settings.value.language = language
    saveSettingsToStorage()
  }

  const applyTheme = () => {
    const html = document.documentElement
    
    if (isDarkMode.value) {
      html.classList.add('dark')
      html.setAttribute('data-theme', 'dark')
    } else {
      html.classList.remove('dark')
      html.setAttribute('data-theme', 'light')
    }
  }

  const saveSettingsToStorage = () => {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings.value))
      localStorage.setItem('layout-settings', JSON.stringify(layoutSettings.value))
    } catch (error) {
      console.error('Failed to save settings to storage:', error)
    }
  }

  const loadSettingsFromStorage = () => {
    try {
      const savedSettings = localStorage.getItem('app-settings')
      const savedLayoutSettings = localStorage.getItem('layout-settings')
      
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        settings.value = { ...settings.value, ...parsed }
      }
      
      if (savedLayoutSettings) {
        const parsed = JSON.parse(savedLayoutSettings)
        layoutSettings.value = { ...layoutSettings.value, ...parsed }
      }
      
      applyTheme()
    } catch (error) {
      console.error('Failed to load settings from storage:', error)
    }
  }

  const resetSettings = () => {
    settings.value = {
      theme: 'light',
      language: 'zh-CN',
      sidebarCollapsed: false,
      sidebarWidth: 240,
      showBreadcrumb: true,
      showTabs: true,
      showFooter: true,
      enableAnimation: true,
      pageSize: 20,
      autoSave: true,
      autoSaveInterval: 30000
    }
    
    layoutSettings.value = {
      headerHeight: 60,
      sidebarWidth: 240,
      sidebarCollapsedWidth: 64,
      contentPadding: 20,
      borderRadius: 6,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }
    
    saveSettingsToStorage()
    applyTheme()
    ElMessage.success('设置已重置为默认值')
  }

  // 系统配置相关
  const loadSystemConfigs = async () => {
    try {
      isLoadingConfigs.value = true
      const response = await systemApi.getConfigs()
      
      if (response.status || response.success) {
        const configs: Record<string, SystemConfig> = {}
        response.data.list.forEach(config => {
          configs[config.key] = config
        })
        systemConfigs.value = configs
        return configs
      } else {
        ElMessage.error(response.message || '加载系统配置失败')
        return null
      }
    } catch (error: any) {
      ElMessage.error(error.message || '加载系统配置失败')
      return null
    } finally {
      isLoadingConfigs.value = false
    }
  }

  const getSystemConfig = (key: string, defaultValue?: any) => {
    const config = systemConfigs.value[key]
    return config ? config.value : defaultValue
  }

  const updateSystemConfig = async (key: string, value: any) => {
    try {
      const config = systemConfigs.value[key]
      if (!config) {
        ElMessage.error('配置项不存在')
        return false
      }
      
      const response = await systemApi.updateConfig(config.id, { value })
      
      if (response.status || response.success) {
        systemConfigs.value[key] = response.data
        ElMessage.success('配置更新成功')
        return true
      } else {
        ElMessage.error(response.message || '配置更新失败')
        return false
      }
    } catch (error: any) {
      ElMessage.error(error.message || '配置更新失败')
      return false
    }
  }

  // 路由和导航相关
  const setCurrentRoute = (route: string) => {
    currentRoute.value = route
  }

  const setBreadcrumbs = (crumbs: Array<{ title: string; path?: string }>) => {
    breadcrumbs.value = crumbs
  }

  const addTab = (tab: { title: string; path: string; closable?: boolean }) => {
    const existingTab = openTabs.value.find(t => t.path === tab.path)
    if (!existingTab) {
      openTabs.value.push({
        title: tab.title,
        path: tab.path,
        closable: tab.closable !== false
      })
    }
    activeTab.value = tab.path
  }

  const removeTab = (path: string) => {
    const index = openTabs.value.findIndex(tab => tab.path === path)
    if (index > -1) {
      openTabs.value.splice(index, 1)
      
      // 如果关闭的是当前激活的标签，切换到其他标签
      if (activeTab.value === path && openTabs.value.length > 0) {
        const newIndex = Math.min(index, openTabs.value.length - 1)
        activeTab.value = openTabs.value[newIndex].path
      }
    }
  }

  const removeOtherTabs = (keepPath: string) => {
    openTabs.value = openTabs.value.filter(tab => tab.path === keepPath || !tab.closable)
    activeTab.value = keepPath
  }

  const removeAllTabs = () => {
    openTabs.value = openTabs.value.filter(tab => !tab.closable)
    if (openTabs.value.length > 0) {
      activeTab.value = openTabs.value[0].path
    } else {
      activeTab.value = ''
    }
  }

  const setActiveTab = (path: string) => {
    activeTab.value = path
  }

  // 初始化
  const initialize = async () => {
    loadSettingsFromStorage()
    await loadSystemConfigs()
    
    // 监听系统主题变化
    if (settings.value.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', applyTheme)
    }
  }

  return {
    // 状态
    settings: readonly(settings),
    layoutSettings: readonly(layoutSettings),
    systemConfigs: readonly(systemConfigs),
    isLoadingConfigs: readonly(isLoadingConfigs),
    isLoading: readonly(isLoading),
    currentRoute: readonly(currentRoute),
    breadcrumbs: readonly(breadcrumbs),
    openTabs: readonly(openTabs),
    activeTab: readonly(activeTab),
    
    // 计算属性
    isDarkMode,
    currentLanguage,
    isSidebarCollapsed,
    currentSidebarWidth,
    
    // 动作
    updateSettings,
    updateLayoutSettings,
    toggleSidebar,
    toggleTheme,
    setLanguage,
    applyTheme,
    resetSettings,
    loadSystemConfigs,
    getSystemConfig,
    updateSystemConfig,
    setCurrentRoute,
    setBreadcrumbs,
    addTab,
    removeTab,
    removeOtherTabs,
    removeAllTabs,
    setActiveTab,
    initialize
  }
})