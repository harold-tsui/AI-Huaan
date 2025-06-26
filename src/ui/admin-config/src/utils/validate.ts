/**
 * 表单验证工具函数
 */

// 验证规则类型
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
  message?: string
}

// 验证结果
export interface ValidationResult {
  valid: boolean
  message?: string
}

// 邮箱验证
export function validateEmail(email: string): ValidationResult {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  const valid = pattern.test(email)
  return {
    valid,
    message: valid ? undefined : '请输入有效的邮箱地址'
  }
}

// 手机号验证（中国大陆）
export function validatePhone(phone: string): ValidationResult {
  const pattern = /^1[3-9]\d{9}$/
  const valid = pattern.test(phone)
  return {
    valid,
    message: valid ? undefined : '请输入有效的手机号码'
  }
}

// 身份证号验证（中国大陆）
export function validateIdCard(idCard: string): ValidationResult {
  // 18位身份证号码验证
  const pattern = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  
  if (!pattern.test(idCard)) {
    return {
      valid: false,
      message: '请输入有效的身份证号码'
    }
  }
  
  // 校验码验证
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i]
  }
  
  const checkCode = checkCodes[sum % 11]
  const valid = checkCode === idCard[17].toUpperCase()
  
  return {
    valid,
    message: valid ? undefined : '身份证号码校验位错误'
  }
}

// 密码强度验证
export function validatePassword(
  password: string,
  options: {
    minLength?: number
    maxLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
    specialChars?: string
  } = {}
): ValidationResult {
  const {
    minLength = 8,
    maxLength = 32,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
    specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  } = options
  
  // 长度检查
  if (password.length < minLength) {
    return {
      valid: false,
      message: `密码长度不能少于${minLength}位`
    }
  }
  
  if (password.length > maxLength) {
    return {
      valid: false,
      message: `密码长度不能超过${maxLength}位`
    }
  }
  
  // 大写字母检查
  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: '密码必须包含至少一个大写字母'
    }
  }
  
  // 小写字母检查
  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      message: '密码必须包含至少一个小写字母'
    }
  }
  
  // 数字检查
  if (requireNumbers && !/\d/.test(password)) {
    return {
      valid: false,
      message: '密码必须包含至少一个数字'
    }
  }
  
  // 特殊字符检查
  if (requireSpecialChars) {
    const specialCharPattern = new RegExp(`[${specialChars.replace(/[\-\]\\]/g, '\\$&')}]`)
    if (!specialCharPattern.test(password)) {
      return {
        valid: false,
        message: '密码必须包含至少一个特殊字符'
      }
    }
  }
  
  return { valid: true }
}

// 获取密码强度等级
export function getPasswordStrength(password: string): {
  level: 'weak' | 'medium' | 'strong' | 'very-strong'
  score: number
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []
  
  // 长度评分
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  
  // 字符类型评分
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('添加小写字母')
  
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('添加大写字母')
  
  if (/\d/.test(password)) score += 1
  else feedback.push('添加数字')
  
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 1
  else feedback.push('添加特殊字符')
  
  // 复杂度评分
  if (password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
    score += 1
  }
  
  // 确定强度等级
  let level: 'weak' | 'medium' | 'strong' | 'very-strong'
  if (score <= 3) level = 'weak'
  else if (score <= 5) level = 'medium'
  else if (score <= 7) level = 'strong'
  else level = 'very-strong'
  
  return { level, score, feedback }
}

// URL验证
export function validateUrl(url: string): ValidationResult {
  try {
    new URL(url)
    return { valid: true }
  } catch {
    return {
      valid: false,
      message: '请输入有效的URL地址'
    }
  }
}

// IP地址验证
export function validateIP(ip: string, version: 'v4' | 'v6' | 'both' = 'both'): ValidationResult {
  const ipv4Pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  
  let valid = false
  
  if (version === 'v4' || version === 'both') {
    valid = ipv4Pattern.test(ip)
  }
  
  if (!valid && (version === 'v6' || version === 'both')) {
    valid = ipv6Pattern.test(ip)
  }
  
  return {
    valid,
    message: valid ? undefined : `请输入有效的IPv${version === 'both' ? '4或IPv6' : version.slice(1)}地址`
  }
}

// 数字验证
export function validateNumber(
  value: string | number,
  options: {
    min?: number
    max?: number
    integer?: boolean
    positive?: boolean
    negative?: boolean
  } = {}
): ValidationResult {
  const { min, max, integer = false, positive = false, negative = false } = options
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) {
    return {
      valid: false,
      message: '请输入有效的数字'
    }
  }
  
  if (integer && !Number.isInteger(num)) {
    return {
      valid: false,
      message: '请输入整数'
    }
  }
  
  if (positive && num <= 0) {
    return {
      valid: false,
      message: '请输入正数'
    }
  }
  
  if (negative && num >= 0) {
    return {
      valid: false,
      message: '请输入负数'
    }
  }
  
  if (typeof min === 'number' && num < min) {
    return {
      valid: false,
      message: `数值不能小于${min}`
    }
  }
  
  if (typeof max === 'number' && num > max) {
    return {
      valid: false,
      message: `数值不能大于${max}`
    }
  }
  
  return { valid: true }
}

// 字符串长度验证
export function validateLength(
  value: string,
  options: {
    min?: number
    max?: number
    exact?: number
  } = {}
): ValidationResult {
  const { min, max, exact } = options
  const length = value.length
  
  if (typeof exact === 'number') {
    const valid = length === exact
    return {
      valid,
      message: valid ? undefined : `长度必须为${exact}位`
    }
  }
  
  if (typeof min === 'number' && length < min) {
    return {
      valid: false,
      message: `长度不能少于${min}位`
    }
  }
  
  if (typeof max === 'number' && length > max) {
    return {
      valid: false,
      message: `长度不能超过${max}位`
    }
  }
  
  return { valid: true }
}

// 日期验证
export function validateDate(
  value: string | Date,
  options: {
    min?: Date | string
    max?: Date | string
    format?: string
  } = {}
): ValidationResult {
  const { min, max } = options
  
  let date: Date
  
  if (typeof value === 'string') {
    date = new Date(value)
  } else {
    date = value
  }
  
  if (isNaN(date.getTime())) {
    return {
      valid: false,
      message: '请输入有效的日期'
    }
  }
  
  if (min) {
    const minDate = typeof min === 'string' ? new Date(min) : min
    if (date < minDate) {
      return {
        valid: false,
        message: `日期不能早于${minDate.toLocaleDateString()}`
      }
    }
  }
  
  if (max) {
    const maxDate = typeof max === 'string' ? new Date(max) : max
    if (date > maxDate) {
      return {
        valid: false,
        message: `日期不能晚于${maxDate.toLocaleDateString()}`
      }
    }
  }
  
  return { valid: true }
}

// 文件验证
export function validateFile(
  file: File,
  options: {
    maxSize?: number // 字节
    minSize?: number // 字节
    allowedTypes?: string[]
    allowedExtensions?: string[]
  } = {}
): ValidationResult {
  const { maxSize, minSize, allowedTypes, allowedExtensions } = options
  
  // 大小验证
  if (typeof maxSize === 'number' && file.size > maxSize) {
    return {
      valid: false,
      message: `文件大小不能超过${(maxSize / 1024 / 1024).toFixed(2)}MB`
    }
  }
  
  if (typeof minSize === 'number' && file.size < minSize) {
    return {
      valid: false,
      message: `文件大小不能小于${(minSize / 1024 / 1024).toFixed(2)}MB`
    }
  }
  
  // 类型验证
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: `不支持的文件类型，支持的类型：${allowedTypes.join(', ')}`
    }
  }
  
  // 扩展名验证
  if (allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        message: `不支持的文件扩展名，支持的扩展名：${allowedExtensions.join(', ')}`
      }
    }
  }
  
  return { valid: true }
}

// 通用验证器
export function validate(value: any, rules: ValidationRule[]): ValidationResult {
  for (const rule of rules) {
    // 必填验证
    if (rule.required && (value === undefined || value === null || value === '')) {
      return {
        valid: false,
        message: rule.message || '此字段为必填项'
      }
    }
    
    // 如果值为空且不是必填，跳过其他验证
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue
    }
    
    // 最小值/长度验证
    if (typeof rule.min === 'number') {
      if (typeof value === 'number' && value < rule.min) {
        return {
          valid: false,
          message: rule.message || `值不能小于${rule.min}`
        }
      }
      if (typeof value === 'string' && value.length < rule.min) {
        return {
          valid: false,
          message: rule.message || `长度不能少于${rule.min}位`
        }
      }
    }
    
    // 最大值/长度验证
    if (typeof rule.max === 'number') {
      if (typeof value === 'number' && value > rule.max) {
        return {
          valid: false,
          message: rule.message || `值不能大于${rule.max}`
        }
      }
      if (typeof value === 'string' && value.length > rule.max) {
        return {
          valid: false,
          message: rule.message || `长度不能超过${rule.max}位`
        }
      }
    }
    
    // 正则表达式验证
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return {
        valid: false,
        message: rule.message || '格式不正确'
      }
    }
    
    // 自定义验证器
    if (rule.validator) {
      const result = rule.validator(value)
      if (result !== true) {
        return {
          valid: false,
          message: typeof result === 'string' ? result : (rule.message || '验证失败')
        }
      }
    }
  }
  
  return { valid: true }
}

// 常用正则表达式
export const patterns = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^1[3-9]\d{9}$/,
  idCard: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  ipv4: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  ipv6: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  chinese: /^[\u4e00-\u9fa5]+$/,
  englishOnly: /^[a-zA-Z]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  username: /^[a-zA-Z0-9_-]{3,16}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  base64: /^[A-Za-z0-9+/]*={0,2}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
}

// 检查是否为外部链接
export function isExternal(path: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(path)
}

// 预定义验证规则
export const rules = {
  required: { required: true, message: '此字段为必填项' },
  email: { pattern: patterns.email, message: '请输入有效的邮箱地址' },
  phone: { pattern: patterns.phone, message: '请输入有效的手机号码' },
  url: { pattern: patterns.url, message: '请输入有效的URL地址' },
  chinese: { pattern: patterns.chinese, message: '只能输入中文字符' },
  englishOnly: { pattern: patterns.englishOnly, message: '只能输入英文字符' },
  alphanumeric: { pattern: patterns.alphanumeric, message: '只能输入字母和数字' },
  username: { pattern: patterns.username, message: '用户名只能包含字母、数字、下划线和连字符，长度3-16位' },
  strongPassword: { pattern: patterns.strongPassword, message: '密码必须包含大小写字母、数字和特殊字符，长度至少8位' }
}