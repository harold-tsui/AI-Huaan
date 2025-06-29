# Admin权限模拟示例

本目录包含了如何为admin账号模拟权限信息的示例代码。这些示例主要用于开发环境，方便前端开发人员在没有后端支持的情况下测试需要权限的功能。

## 文件说明

1. `mock-admin-permissions.ts` - 基础工具函数，展示如何调用权限模拟函数
2. `MockAdminPermissionsDemo.vue` - 权限模拟演示组件，可以动态设置和查看权限状态
3. `LoginWithMockPermissions.vue` - 带有权限模拟功能的登录页面示例

## 使用方法

### 方法一：直接调用模拟函数

在需要模拟权限的地方直接导入并调用`mockAdminPermissions`函数：

```typescript
import { mockAdminPermissions } from '@/utils/permission'

// 设置admin权限
const permissions = mockAdminPermissions()
console.log('已设置权限:', permissions)
```

### 方法二：在应用初始化时设置

在`main.ts`或应用入口文件中导入并调用模拟函数：

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import { mockAdminPermissions } from '@/utils/permission'

// 仅在开发环境中模拟权限
if (import.meta.env.DEV) {
  mockAdminPermissions()
  console.log('已为admin账号设置模拟权限')
}

createApp(App).mount('#app')
```

### 方法三：在登录成功后设置

在登录逻辑中根据用户名判断并设置模拟权限：

```typescript
import { mockAdminPermissions } from '@/utils/permission'

// 登录成功后的回调函数
const onLoginSuccess = (username) => {
  // 如果是admin用户，设置模拟权限
  if (username === 'admin' && import.meta.env.DEV) {
    mockAdminPermissions()
    console.log('已为admin账号设置模拟权限')
  }
  
  // 跳转到首页或其他页面
  router.push('/')
}
```

### 方法四：使用示例组件

将`MockAdminPermissionsDemo.vue`组件集成到你的应用中，通过UI界面设置权限：

```vue
<template>
  <div>
    <h1>开发工具</h1>
    <MockAdminPermissionsDemo />
  </div>
</template>

<script setup>
import MockAdminPermissionsDemo from '@/examples/MockAdminPermissionsDemo.vue'
</script>
```

## 权限验证

设置权限后，可以使用以下函数验证权限是否生效：

```typescript
import { isSuperAdmin, isAdmin, hasPermission } from '@/utils/permission'

// 检查是否为超级管理员
console.log('是否为超级管理员:', isSuperAdmin())

// 检查是否为管理员
console.log('是否为管理员:', isAdmin())

// 检查是否有特定权限
console.log('是否有用户管理权限:', hasPermission('user:manage'))
```

## 注意事项

1. 这些模拟权限功能仅应在开发环境中使用，生产环境应使用真实的权限系统
2. 模拟权限仅在前端生效，不会影响后端的权限验证
3. 刷新页面后模拟的权限会丢失，需要重新设置
4. 建议在开发环境中添加明显的标识，提示用户当前使用的是模拟权限