import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createPinia } from 'pinia';
import { useUserStore } from './stores/modules/user';
import { initDevMockUser, checkAutoMockUser } from './utils/devMock';
import { setupMockAuthInterceptor } from './utils/mockAuthInterceptor';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ElementPlus);

// 初始化用户store，恢复认证信息
const userStore = useUserStore();

// 检查是否为模拟模式
const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';
const isMockAuth = import.meta.env.VITE_MOCK_AUTH === 'true';

// 在开发环境或模拟模式中，先模拟用户和权限，然后再初始化路由
if (import.meta.env.DEV || isMockMode) {
  console.log('开发环境或模拟模式检测到，准备初始化...');
  
  // 初始化模拟认证拦截器
if (import.meta.env.DEV || (isMockMode && isMockAuth)) {
  console.log('初始化模拟认证拦截器...');
  setupMockAuthInterceptor();
}
  
  // 检查是否需要自动模拟用户
  checkAutoMockUser();
  
  // 在路由守卫前模拟用户和权限
  initDevMockUser().then(() => {
    console.log('模拟用户初始化完成，准备挂载应用');
    console.log('用户状态:', {
      isLoggedIn: userStore.isLoggedIn,
      userName: userStore.userName,
      roles: userStore.roles,
      permissions: userStore.permissions.length
    });
    // 挂载应用
    app.mount('#app');
  }).catch(error => {
    console.error('模拟用户初始化失败:', error);
    console.error('错误详情:', {
      message: error.message,
      stack: error.stack
    });
    // 即使失败也挂载应用
    app.mount('#app');
  });
} else {
  // 生产环境正常初始化
  (async () => {
    try {
      console.log('开始初始化用户状态...');
      await userStore.initializeFromStorage();
      console.log('用户状态初始化完成');
    } catch (error) {
      console.error('初始化用户状态失败:', error);
    } finally {
      // 挂载应用
      app.mount('#app');
    }
  })();
}

// 应用已在各条件分支内挂载