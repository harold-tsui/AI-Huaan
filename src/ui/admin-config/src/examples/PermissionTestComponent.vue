<template>
  <div class="permission-test">
    <h2>权限测试组件</h2>
    <div class="permission-info">
      <p><strong>用户ID:</strong> {{ userId }}</p>
      <p><strong>是否超级管理员:</strong> {{ isSuperAdmin ? '是' : '否' }}</p>
      <p><strong>是否管理员:</strong> {{ isAdmin ? '是' : '否' }}</p>
      <p><strong>拥有所有权限:</strong> {{ hasAllPermissions ? '是' : '否' }}</p>
      <p><strong>角色列表:</strong> {{ rolesList }}</p>
    </div>
    <div class="permission-test-buttons">
      <el-button type="primary" @click="checkPermissions">检查权限</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { isSuperAdmin as checkSuperAdmin, isAdmin as checkAdmin, hasPermission, permissionManager } from '@/utils/permission';
import type { Role } from '@/utils/permission';

const userId = ref('未知');
const isSuperAdminValue = ref(false);
const isAdminValue = ref(false);
const hasAllPermissions = ref(false);
const rolesList = ref('');

// 计算属性
const isSuperAdmin = isSuperAdminValue;
const isAdmin = isAdminValue;

// 检查权限状态
const checkPermissions = () => {
  isSuperAdminValue.value = checkSuperAdmin();
  isAdminValue.value = checkAdmin();
  hasAllPermissions.value = hasPermission('*');
  
  // 获取用户权限信息
  const userPermissions = permissionManager.getUserPermissions();
  if (userPermissions) {
    userId.value = userPermissions.userId || '未知';
    rolesList.value = userPermissions.roles?.map((role: Role) => role.name).join(', ') || '无';
  } else {
    userId.value = '未设置';
    rolesList.value = '无';
  }
};

onMounted(() => {
  // 组件挂载时检查权限
  checkPermissions();
});
</script>

<style scoped>
.permission-test {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.permission-info {
  margin: 20px 0;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.permission-test-buttons {
  margin-top: 20px;
}
</style>