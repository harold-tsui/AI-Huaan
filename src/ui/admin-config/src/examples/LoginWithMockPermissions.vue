<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h3>系统登录</h3>
          <el-tag v-if="isDev" type="warning">开发模式</el-tag>
        </div>
      </template>
      
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item v-if="isDev">
          <el-checkbox v-model="useMockPermissions">使用模拟权限（仅开发环境）</el-checkbox>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            class="login-button" 
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'
import { mockAdminPermissions } from '@/utils/permission'

// 判断是否为开发环境
const isDev = ref(import.meta.env.DEV)

// 是否使用模拟权限
const useMockPermissions = ref(false)

// 表单引用
const loginFormRef = ref<FormInstance>()

// 加载状态
const loading = ref(false)

// 用户store
const userStore = useUserStore()

// 路由
const router = useRouter()

// 登录表单
const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

// 表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应为6-20个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    // 表单验证
    await loginFormRef.value.validate()
    
    loading.value = true
    
    // 开发环境下使用模拟权限
    if (isDev.value && useMockPermissions.value) {
      // 模拟登录成功
      await mockLogin()
    } else {
      // 真实登录
      await realLogin()
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 真实登录
const realLogin = async () => {
  try {
    await userStore.login({
      username: loginForm.username,
      password: loginForm.password
    })
    
    ElMessage.success('登录成功')
    router.push({ path: '/' })
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  }
}

// 模拟登录（仅开发环境）
const mockLogin = async () => {
  try {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 设置模拟用户信息
    const mockUserInfo = {
      id: 'admin-mock',
      username: loginForm.username,
      email: 'admin@example.com',
      avatar: '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // 手动设置用户信息
    userStore.$patch({
      token: 'mock-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      userInfo: mockUserInfo
    })
    
    // 设置模拟权限
    mockAdminPermissions()
    
    ElMessage.success('已使用模拟权限登录成功')
    router.push({ path: '/' })
  } catch (error: any) {
    ElMessage.error(error.message || '模拟登录失败')
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-button {
  width: 100%;
}
</style>