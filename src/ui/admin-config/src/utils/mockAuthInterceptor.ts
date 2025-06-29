/**
 * 模拟认证API拦截器
 * 用于在模拟环境中拦截认证相关请求并返回模拟响应
 */
import axios, { AxiosAdapter, AxiosRequestHeaders, AxiosHeaders } from 'axios'

// 模拟用户信息
const mockUserInfo = {
  id: 'mock-user',
  username: '模拟用户',
  email: 'mock@example.com',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  roles: ['admin'],
  permissions: ['*'],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// 模拟认证响应
const mockAuthResponses = {
  // 登录响应
  login: {
    code: 200,
    success: true,
    status: true,
    message: '模拟登录成功',
    data: {
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
      user: mockUserInfo
    }
  },
  
  // 验证token响应
  verifyToken: {
    code: 200,
    success: true,
    status: true,
    message: 'Mocked token verification successful',
    data: {
      valid: true,
      user: { id: 'mock-user-id', username: 'mockuser', roles: ['admin'] }
    }
  },
  
  // 刷新token响应
  refreshToken: {
    code: 200,
    success: true,
    status: true,
    message: 'Mocked refresh token successful',
    data: {
      accessToken: 'mock-refreshed-access-token-string',
      refreshToken: 'mock-refreshed-refresh-token-string'
    }
  },
  
  // 登出响应
  logout: {
    code: 200,
    success: true,
    status: true,
    message: '模拟登出成功',
    data: null
  },
  
  // 权限响应
  permissions: {
    code: 200,
    success: true,
    status: true,
    message: '模拟权限数据',
    data: {
      effectivePermissions: ['*'],
      roles: [{ code: 'admin', name: '管理员' }, { code: 'super_admin', name: '超级管理员' }]
    }
  }
}

/**
 * 判断是否为认证相关请求
 */
export function isAuthRequest(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/logout') ||
    url.includes('/auth/verify-token') ||
    url.includes('/auth/permissions')
  )
}

/**
 * 获取模拟响应
 */
function getMockResponse(url: string): any {
  if (url.includes('/auth/login')) {
    return mockAuthResponses.login
  } else if (url.includes('/auth/verify-token')) {
    return mockAuthResponses.verifyToken
  } else if (url.includes('/auth/refresh')) {
    return mockAuthResponses.refreshToken
  } else if (url.includes('/auth/logout')) {
    return mockAuthResponses.logout
  } else if (url.includes('/auth/permissions')) {
    return mockAuthResponses.permissions
  }
  return null
}

/**
 * 初始化模拟认证拦截器
 */
export function setupMockAuthInterceptor() {
  // 只在模拟模式下启用
  // @ts-ignore - 忽略 import.meta.env 类型错误
  const mockMode = import.meta.env.VITE_MOCK_MODE === 'true';
  // @ts-ignore - 忽略 import.meta.env 类型错误
  const mockAuth = import.meta.env.VITE_MOCK_AUTH === 'true';
  
  if (!mockMode || !mockAuth) {
    console.log('模拟认证拦截器未启用')
    return
  }
  
  console.log('初始化模拟认证拦截器...')
  
  // 不再使用适配器方式，改为使用拦截器方式
  const originalAdapter = axios.defaults.adapter as AxiosAdapter
  
  // 创建一个模拟处理器
const mockHandler = (url: string): any => {
    if (url.includes('/auth/login')) {
      console.log('模拟登录响应')
      return mockAuthResponses.login
    } else if (url.includes('/auth/verify-token')) {
      console.log('模拟验证token响应')
      return mockAuthResponses.verifyToken
    } else if (url.includes('/auth/refresh')) {
      console.log('模拟刷新token响应')
      return mockAuthResponses.refreshToken
    } else if (url.includes('/auth/logout')) {
      console.log('模拟登出响应')
      return mockAuthResponses.logout
    } else if (url.includes('/auth/permissions')) {
      console.log('模拟权限响应')
      return mockAuthResponses.permissions
    }
    return null
  }
  
  // 请求拦截器 - 处理认证请求
  const requestInterceptor = axios.interceptors.request.use(
    (config) => {
      // 检查是否是认证相关请求
      if (config.url?.includes('/auth/')) {
        console.log('请求拦截器拦截认证请求:', config.url)
        
        // 标记此请求已被模拟处理，避免重复处理
        // 确保 headers 存在并正确设置
        if (!config.headers) {
          config.headers = new AxiosHeaders()
        }
        
        // 设置模拟处理标记
        config.headers.set('X-Mock-Handled', 'true')
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )
  
  // 响应拦截器 - 处理认证请求和401错误
  const responseInterceptor = axios.interceptors.response.use(
    (response) => {
      const config = response.config
      const url = config.url || ''
      
      // 检查是否是认证相关请求且已被标记为模拟处理
      if (isAuthRequest(url) && config.headers && config.headers.get('X-Mock-Handled') === 'true') {
        console.log(`[模拟认证] 拦截响应: ${url}`)
        
        // 返回模拟响应
        const mockData = mockHandler(url)
        if (mockData) {
          console.log(`[模拟认证] 返回模拟响应: ${url}`, mockData)
          
          return {
            ...response,
            data: mockData,
            status: 200,
            statusText: 'OK'
          }
        }
      }
      
      return response
    },
    (error) => {
      // 如果请求被取消，直接返回错误
      if (axios.isCancel(error)) {
        return Promise.reject(error)
      }

      const { config, response } = error
      if (!config) {
        return Promise.reject(error)
      }

      const url = config.url || ''

      // 如果是认证相关请求且返回401错误，返回模拟响应
      if (isAuthRequest(url) && response && response.status === 401) {
        console.log(`[模拟认证] 拦截401错误: ${url}`, error)
        
        const mockData = mockHandler(url)
        if (mockData) {
          console.log(`[模拟认证] 返回模拟响应: ${url}`, mockData)
          
          return Promise.resolve({
            ...error.response,
            status: 200,
            data: mockData
          })
        }
      }

      return Promise.reject(error)
    }
  )
  
  console.log('模拟认证拦截器初始化完成')
  
  // 返回清理函数
  return () => {
    // 移除拦截器
    axios.interceptors.request.eject(requestInterceptor)
    axios.interceptors.response.eject(responseInterceptor)
    console.log('模拟认证拦截器已清理')
  }
}