import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createPinia } from 'pinia';
import { useUserStore } from './stores/modules/user';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ElementPlus);

// 初始化用户store，恢复localStorage中的认证信息
const userStore = useUserStore();
userStore.initializeFromStorage();

app.mount('#app');