import { createPinia } from 'pinia'
import type { App } from 'vue'

// 创建pinia实例
const pinia = createPinia()

// 安装插件的函数
export function setupStore(app: App) {
  app.use(pinia)
}

// 导出store模块
export { useUserStore } from './modules/user'
export { useAppStore } from './modules/app'

// 导出pinia实例
export { pinia }
export default pinia