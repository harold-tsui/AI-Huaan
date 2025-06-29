<template>
  <div class="mock-admin-permissions-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <h3>Admin权限模拟演示</h3>
        </div>
      </template>
      
      <el-alert
        v-if="!isDev"
        type="warning"
        :closable="false"
        show-icon
        title="此功能仅在开发环境可用"
        description="请在开发环境中使用此功能。"
      />
      
      <div v-else>
        <el-form label-position="top">
          <el-form-item label="用户名">
            <el-input v-model="username" placeholder="请输入用户名" />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="mockPermissions">模拟Admin权限</el-button>
            <el-button @click="checkPermissions">检查权限状态</el-button>
            <el-button type="danger" @click="clearPermissions">清除权限</el-button>
          </el-form-item>
        </el-form>
        
        <el-divider>权限状态</el-divider>
        
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户ID">
            {{ permissionStatus.userId || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="是否超级管理员">
            <el-tag :type="permissionStatus.isSuperAdmin ? 'success' : 'info'">
              {{ permissionStatus.isSuperAdmin ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="是否管理员">
            <el-tag :type="permissionStatus.isAdmin ? 'success' : 'info'">
              {{ permissionStatus.isAdmin ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="拥有的角色">
            <el-tag v-for="role in permissionStatus.roles" :key="role" class="permission-tag">
              {{ role }}
            </el-tag>
            <span v-if="!permissionStatus.roles.length">无</span>
          </el-descriptions-item>
          <el-descriptions-item label="拥有的权限">
            <div class="permissions-container">
              <el-tag v-for="perm in permissionStatus.permissions" :key="perm" class="permission-tag">
                {{ perm }}
              </el-tag>
              <span v-if="!permissionStatus.permissions.length">无</span>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { mockAdminPermissions, permissionManager, isSuperAdmin, isAdmin } from '@/utils/permission'
import type { UserPermissions } from '@/utils/permission'

// 判断是否为开发环境
const isDev = ref(import.meta.env.DEV)

// 用户名输入
const username = ref('admin')

// 权限状态
const permissionStatus = reactive({
  userId: '',
  isSuperAdmin: false,
  isAdmin: false,
  roles: [] as string[],
  permissions: [] as string[]
})

// 模拟Admin权限
const mockPermissions = () => {
  if (!isDev.value) {
    ElMessage.warning('此功能仅在开发环境可用')
    return
  }
  
  try {
    // 设置用户ID
    const userId = username.value || 'admin'
    
    // 调用mock函数设置权限
    const permissions = mockAdminPermissions()
    
    // 更新权限状态
    updatePermissionStatus(permissions)
    
    ElMessage.success(`已成功为用户 ${userId} 设置Admin权限`)
  } catch (error) {
    console.error('设置权限失败:', error)
    ElMessage.error('设置权限失败')
  }
}

// 检查权限状态
const checkPermissions = () => {
  try {
    // 获取当前权限管理器中的权限信息
    const userPermissions = permissionManager['userPermissions'] as UserPermissions | null
    
    if (userPermissions) {
      updatePermissionStatus(userPermissions)
      ElMessage.success('权限状态已更新')
    } else {
      ElMessage.warning('未设置权限信息')
      clearPermissionStatus()
    }
  } catch (error) {
    console.error('检查权限失败:', error)
    ElMessage.error('检查权限失败')
  }
}

// 清除权限
const clearPermissions = () => {
  try {
    // 清除权限管理器中的权限信息
    permissionManager.clearCache()
    // @ts-ignore - 直接访问私有属性
    permissionManager['userPermissions'] = null
    
    // 清除权限状态
    clearPermissionStatus()
    
    ElMessage.success('权限已清除')
  } catch (error) {
    console.error('清除权限失败:', error)
    ElMessage.error('清除权限失败')
  }
}

// 更新权限状态
const updatePermissionStatus = (permissions: UserPermissions) => {
  permissionStatus.userId = permissions.userId
  permissionStatus.isSuperAdmin = isSuperAdmin()
  permissionStatus.isAdmin = isAdmin()
  permissionStatus.roles = permissions.roles.map(role => role.code)
  permissionStatus.permissions = permissions.permissions.map(perm => perm.code)
}

// 清除权限状态
const clearPermissionStatus = () => {
  permissionStatus.userId = ''
  permissionStatus.isSuperAdmin = false
  permissionStatus.isAdmin = false
  permissionStatus.roles = []
  permissionStatus.permissions = []
}

// 组件挂载时检查权限状态
onMounted(() => {
  checkPermissions()
})
</script>

<style scoped>
.mock-admin-permissions-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.demo-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.permissions-container {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.permission-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}
</style>