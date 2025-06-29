<template>
  <div class="login-container">
    <div class="login-form">
      <div class="title-container">
        <h3 class="title">BASB 管理系统</h3>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form-content"
        autocomplete="on"
        label-position="left"
      >
        <el-form-item prop="username">
          <span class="svg-container">
            <el-icon><User /></el-icon>
          </span>
          <el-input
            ref="username"
            v-model="loginForm.username"
            placeholder="用户名"
            name="username"
            type="text"
            tabindex="1"
            autocomplete="on"
          />
        </el-form-item>

        <el-tooltip
          v-model:visible="capsTooltip"
          content="大写锁定已开启"
          placement="right"
          manual
        >
          <el-form-item prop="password">
            <span class="svg-container">
              <el-icon><Lock /></el-icon>
            </span>
            <el-input
              :key="passwordType"
              ref="password"
              v-model="loginForm.password"
              :type="passwordType"
              placeholder="密码"
              name="password"
              tabindex="2"
              autocomplete="on"
              @keyup="checkCapslock"
              @blur="capsTooltip = false"
              @keyup.enter="handleLogin"
            />
            <span class="show-pwd" @click="showPwd">
              <el-icon><component :is="passwordType === 'password' ? 'View' : 'Hide'" /></el-icon>
            </span>
          </el-form-item>
        </el-tooltip>

        <el-button
          :loading="loading"
          type="primary"
          style="width: 100%; margin-bottom: 30px"
          @click.prevent="handleLogin"
        >
          登录
        </el-button>

        <div class="tips">
          <span>用户名: admin</span>
          <span>密码: 任意</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, View, Hide } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const passwordType = ref('password')
const capsTooltip = ref(false)
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const validateUsername = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else {
    callback()
  }
}

const validatePassword = (rule: any, value: any, callback: any) => {
  if (value.length < 6) {
    callback(new Error('密码不能少于6位'))
  } else {
    callback()
  }
}

const loginRules = {
  username: [{ required: true, trigger: 'blur', validator: validateUsername }],
  password: [{ required: true, trigger: 'blur', validator: validatePassword }]
}

const showPwd = () => {
  if (passwordType.value === 'password') {
    passwordType.value = ''
  } else {
    passwordType.value = 'password'
  }
  nextTick(() => {
    ;(loginFormRef.value as any).$refs.password.focus()
  })
}

const checkCapslock = (e: KeyboardEvent) => {
  const { key } = e
  capsTooltip.value = !!(key && key.length === 1 && key >= 'A' && key <= 'Z')
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        console.log('开始登录...')
        await userStore.login(loginForm)
        console.log('登录成功，token:', userStore.token)
        console.log('用户信息:', userStore.userInfo)
        
        // 确保获取最新权限
        console.log('获取用户权限...')
        const permissionData = await userStore.getUserPermissions()
        console.log('权限获取结果:', permissionData)
        console.log('当前权限列表:', userStore.permissions)
        console.log('当前角色列表:', userStore.roles)
        
        ElMessage.success('登录成功')
        // 跳转到目标页面
        const redirect = route.query.redirect as string
        console.log('准备跳转到:', redirect || '/')
        await router.push(redirect || '/')
      } catch (error: any) {
        console.error('登录失败:', error)
        ElMessage.error(error.message || '登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

.login-container {
  min-height: 100vh;
  width: 100%;
  background-color: $bg;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;

    .title-container {
      position: relative;

      .title {
        font-size: 26px;
        color: $light_gray;
        margin: 0px auto 40px auto;
        text-align: center;
        font-weight: bold;
      }
    }

    .login-form-content {
      .el-input {
        display: inline-block;
        height: 47px;
        width: 85%;

        :deep(.el-input__wrapper) {
          padding: 12px 5px 12px 15px;
          color: $light_gray;
          height: 47px;
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          caret-color: $cursor;

          &:-webkit-autofill {
            box-shadow: 0 0 0px 1000px $bg inset !important;
            -webkit-text-fill-color: $cursor !important;
          }
        }
      }

      .el-form-item {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        color: #454545;
      }

      .svg-container {
        padding: 6px 5px 6px 15px;
        color: $light_gray;
        vertical-align: middle;
        width: 30px;
        display: inline-block;
      }

      .show-pwd {
        position: absolute;
        right: 10px;
        top: 7px;
        font-size: 16px;
        color: $light_gray;
        cursor: pointer;
        user-select: none;
      }

      .tips {
        font-size: 14px;
        color: #fff;
        margin-bottom: 10px;

        span {
          &:first-of-type {
            margin-right: 16px;
          }
        }
      }
    }
  }
}
</style>