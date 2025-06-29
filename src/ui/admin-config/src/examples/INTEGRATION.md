# 权限模拟功能集成说明

本文档说明了如何在项目中集成和验证admin账号权限模拟功能。

## 已完成的集成

已经将权限模拟功能集成到项目中，具体实现如下：

1. 在`main.ts`中添加了权限模拟代码，仅在开发环境中生效：

```typescript
// 仅在开发环境中模拟权限
if (import.meta.env.DEV) {
  // 确保在用户store初始化后再模拟权限
  setTimeout(() => {
    mockAdminPermissions();
    console.log('已为admin账号设置模拟权限');
  }, 0);
}
```

2. 添加了开发环境专用路由，用于测试权限模拟功能：

```typescript
// 开发环境专用路由
...(import.meta.env.DEV ? [
  {
    path: '/dev',
    name: 'DevTools',
    component: () => import('@/layout/index.vue'),
    redirect: '/dev/permission-test',
    meta: {
      title: '开发工具',
      icon: 'Tools',
      alwaysShow: true
    },
    children: [
      {
        path: 'permission-test',
        name: 'PermissionTest',
        component: () => import('@/examples/PermissionTestComponent.vue'),
        meta: {
          title: '权限测试',
          icon: 'Key'
        }
      }
    ]
  }
] : []),
```

3. 创建了权限测试组件`PermissionTestComponent.vue`，用于验证权限模拟是否生效。

4. 修改了`request.ts`中的响应拦截器，在开发环境中模拟权限相关API的响应：

```typescript
// 在开发环境中，如果是权限相关的API请求，返回模拟数据
if (import.meta.env.DEV && error.config && error.config.url) {
  // 检查是否是权限相关的API
  if (error.config.url.includes('/auth/permissions')) {
    console.log('开发环境中模拟权限API响应');
    // 返回模拟的成功响应
    return Promise.resolve({
      data: {
        success: true,
        status: true,
        data: {
          effectivePermissions: ['*'],
          roles: ['admin', 'super_admin']
        },
        message: '模拟权限数据'
      }
    });
  }
}
```

## 如何验证

### 方法1：通过开发工具路由验证

1. 启动开发服务器：
   ```bash
   cd src/ui/admin-config
   npm run dev
   ```

2. 在浏览器中访问应用，登录后在左侧菜单中找到「开发工具」->「权限测试」。

3. 在权限测试页面中，可以看到当前用户的权限信息，包括：
   - 用户ID
   - 是否超级管理员
   - 是否管理员
   - 是否拥有所有权限
   - 角色列表

4. 点击「检查权限」按钮可以刷新权限信息。

### 方法2：通过浏览器控制台验证

1. 启动开发服务器并登录应用。

2. 打开浏览器开发者工具（F12或右键->检查）。

3. 在控制台中执行以下代码验证权限：

```javascript
// 导入权限相关函数
import('@/utils/permission').then(({ isSuperAdmin, isAdmin, hasPermission }) => {
  console.log('是否超级管理员:', isSuperAdmin());
  console.log('是否管理员:', isAdmin());
  console.log('是否拥有所有权限:', hasPermission('*'));
});
```

### 方法3：通过应用功能验证

1. 启动开发服务器并登录应用。

2. 尝试访问需要管理员权限的功能，例如「系统管理」->「系统配置」。

3. 如果能够正常访问这些功能，说明权限模拟已生效。

## 注意事项

1. 权限模拟功能仅在开发环境（`import.meta.env.DEV`为true）中生效。

2. 我们通过响应拦截器模拟了权限API的响应，解决了401未授权错误问题。

3. 如果在开发环境中仍然遇到权限相关的问题，请检查浏览器控制台是否有错误信息，并确认权限模拟代码是否正确执行。

4. 权限模拟会为当前用户设置admin和super_admin角色，并赋予所有权限（'*'）。

5. 如果在开发过程中需要测试不同权限级别的用户，可以临时注释掉`main.ts`中的权限模拟代码。

6. 在生产环境中，权限模拟代码不会执行，用户权限将由后端API返回。