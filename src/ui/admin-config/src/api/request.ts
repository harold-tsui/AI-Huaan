import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/modules/user'

// 用于防止多个请求同时触发token刷新
let isRefreshing = false
// 存储等待token刷新的请求队列
let refreshSubscribers: Array<(token: string) => void> = []

// 将请求添加到队列中
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback)
}

// 执行队列中的请求
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // 启用跨域请求时发送cookie
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    
    // 不再添加Authorization头，因为token会通过cookie自动发送
    // 仅在开发环境中记录请求信息，帮助调试
    if (import.meta.env.DEV) {
      if (userStore.token && config.url?.includes('/auth/')) {
        console.log('权限相关请求:', {
          url: config.url,
          method: config.method,
          hasToken: true,
          tokenExists: !!userStore.token,
          time: new Date().toISOString()
        })
      } else if (!userStore.token) {
        console.warn('请求没有认证token:', {
          url: config.url,
          method: config.method,
          time: new Date().toISOString()
        })
      }
    }
    
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse | Promise<AxiosResponse> => {
    const { data, status } = response
    
    // 请求成功
    if (status === 200) {
      // 适配后端返回格式 {code: 200, message: 'xxx', data: {...}}
      if (data.code === 200) {
        // 创建符合AxiosResponse格式的响应对象
        return {
          ...response,
          data: {
            success: true,
            status: true, // 添加status属性
            data: data.data,
            message: data.message
          }
        }
      } else {
        // 业务错误
        ElMessage.error(data.message || '请求失败')
        return Promise.reject(new Error(data.message || '请求失败'))
      }
    }
    
    // 其他状态码处理
    ElMessage.error(data.message || '请求失败')
    return Promise.reject(new Error(data.message || '请求失败'))
  },
  (error) => {
    const { response } = error
    
    // 在开发环境中，如果是权限相关的API请求，返回模拟数据
    if (import.meta.env.DEV && error.config && error.config.url) {
      // 检查是否是权限相关的API
      if (error.config.url.includes('/auth/permissions')) {
        console.log('开发环境中模拟权限API响应 - URL:', error.config.url)
        // 构造模拟响应数据，完全匹配实际后端API响应格式（双层嵌套data）
        const mockResponse = {
          data: {
            code: 200,
            success: true,
            status: true,
            message: '模拟权限数据',
            data: {
              effectivePermissions: ['*'],
              roles: [{ code: 'admin', name: '管理员' }, { code: 'super_admin', name: '超级管理员' }]
            }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        }
        
        console.log('模拟权限API响应数据结构:', JSON.stringify(mockResponse, null, 2))
        return Promise.resolve(mockResponse)
      }
    }
    
    // 记录401未授权错误的详细信息，帮助调试
    if (response && response.status === 401) {
      console.error('401未授权错误详情:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data,
        response: response.data
      })
      
      const userStore = useUserStore()
      
      // 排除登录、刷新token等认证相关请求，避免循环调用
      const isAuthRequest = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/auth/refresh') || 
                            error.config?.url?.includes('/auth/logout') ||
                            error.config?.url?.includes('/auth/verify-token')
      
      if (!isAuthRequest && userStore.refreshToken) {
        // 如果已经在刷新token，将请求加入队列
        if (isRefreshing) {
          console.log('已有token刷新请求正在进行，将当前请求加入队列')
          return new Promise((resolve) => {
            subscribeTokenRefresh((_token: string) => {
              // 不再需要设置Authorization头，因为token会通过cookie自动发送
              resolve(request(error.config))
            })
          })
        }
        
        // 标记正在刷新token
        isRefreshing = true
        console.log('尝试刷新token...')
        
        // 尝试刷新token
        return userStore.refreshAccessToken().then(success => {
          if (success) {
            console.log('Token刷新成功，重试请求')
            
            // 不再需要设置Authorization头，因为token会通过cookie自动发送
            
            // 执行队列中的请求
            onTokenRefreshed(userStore.token || '')
            
            // 重试原始请求
            return request(error.config)
          } else {
            console.error('Token刷新失败，需要重新登录')
            ElMessage.error('登录已过期，请重新登录')
            
            // 检查是否为模拟模式
            const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true'
            
            // 清除用户数据并跳转到登录页
            useUserStore().logout().then(() => {
              // 开发模式或模拟模式下禁用强制跳转
              if (import.meta.env.DEV || isMockMode) {
                console.log('🚀 开发/模拟模式：跳过登录页跳转')
                return
              }
              window.location.href = '/login'
            })
            return Promise.reject(error)
          }
        }).catch(err => {
          console.error('Token刷新出错:', err)
          ElMessage.error('登录已过期，请重新登录')
          
          // 检查是否为模拟模式
          const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true'
          
          // 清除用户数据并跳转到登录页
          useUserStore().logout().then(() => {
            // 开发模式或模拟模式下禁用强制跳转
            if (import.meta.env.DEV || isMockMode) {
              console.log('🚀 开发/模拟模式：跳过登录页跳转')
              return
            }
            window.location.href = '/login'
          })
          return Promise.reject(error)
        }).finally(() => {
          // 重置刷新状态
          isRefreshing = false
        })
      }
    }
    
    if (response) {
      const { status, data } = response
      
      switch (status) {
        case 401:
          // 检查是否为模拟模式
          const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true'
          const isMockAuth = import.meta.env.VITE_MOCK_AUTH === 'true'
          
          // 如果是认证相关请求或者已经尝试过刷新token但仍然失败，则提示用户重新登录
          const isAuthRequest = error.config?.url?.includes('/auth/login') || 
                               error.config?.url?.includes('/auth/refresh') || 
                               error.config?.url?.includes('/auth/logout') ||
                               error.config?.url?.includes('/auth/verify-token')
          
          // 在模拟模式下，对于认证请求返回401错误，不执行登出操作
          if (isMockMode && isMockAuth && isAuthRequest) {
            console.log('🚀 模拟模式：跳过认证请求401错误的登出处理')
            // 返回模拟的成功响应
            if (error.config?.url?.includes('/auth/login')) {
              return Promise.resolve({
                data: {
                  code: 200,
                  success: true,
                  status: true,
                  message: '模拟登录成功',
                  data: {
                    token: 'mock-token',
                    refreshToken: 'mock-refresh-token',
                    user: {
                      id: 'mock-user',
                      username: '模拟用户',
                      email: 'mock@example.com'
                    }
                  }
                }
              })
            } else if (error.config?.url?.includes('/auth/verify-token')) {
              return Promise.resolve({
                data: {
                  code: 200,
                  success: true,
                  status: true,
                  message: '模拟验证成功',
                  data: {
                    valid: true,
                    user: {
                      id: 'mock-user',
                      username: '模拟用户',
                      email: 'mock@example.com'
                    }
                  }
                }
              })
            }
            return Promise.reject(error)
          }
          
          if (isAuthRequest || !useUserStore().refreshToken) {
            ElMessage.error('未授权，请重新登录')
            // 清除用户数据并跳转到登录页
            useUserStore().logout().then(() => {
              // 开发模式或模拟模式下禁用强制跳转
              if (import.meta.env.DEV || isMockMode) {
                console.log('🚀 开发/模拟模式：跳过登录页跳转')
                return
              }
              window.location.href = '/login'
            })
          }
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || '请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

export default request

// 通用请求方法
export const http = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.get(url, config)
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request.post(url, data, config)
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request.put(url, data, config)
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.delete(url, config)
  },
  
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return request.patch(url, data, config)
  }
}