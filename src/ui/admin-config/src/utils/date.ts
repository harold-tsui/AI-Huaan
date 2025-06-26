/**
 * 日期时间工具函数
 */

// 日期格式化选项
export interface DateFormatOptions {
  year?: 'numeric' | '2-digit'
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow'
  day?: 'numeric' | '2-digit'
  hour?: 'numeric' | '2-digit'
  minute?: 'numeric' | '2-digit'
  second?: 'numeric' | '2-digit'
  weekday?: 'long' | 'short' | 'narrow'
  timeZone?: string
  hour12?: boolean
}

// 格式化日期
export function formatDate(
  date: Date | string | number,
  format = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }
  
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const minute = d.getMinutes()
  const second = d.getSeconds()
  const millisecond = d.getMilliseconds()
  
  const formatMap: Record<string, string> = {
    'YYYY': year.toString(),
    'YY': year.toString().slice(-2),
    'MM': month.toString().padStart(2, '0'),
    'M': month.toString(),
    'DD': day.toString().padStart(2, '0'),
    'D': day.toString(),
    'HH': hour.toString().padStart(2, '0'),
    'H': hour.toString(),
    'hh': (hour % 12 || 12).toString().padStart(2, '0'),
    'h': (hour % 12 || 12).toString(),
    'mm': minute.toString().padStart(2, '0'),
    'm': minute.toString(),
    'ss': second.toString().padStart(2, '0'),
    's': second.toString(),
    'SSS': millisecond.toString().padStart(3, '0'),
    'A': hour >= 12 ? 'PM' : 'AM',
    'a': hour >= 12 ? 'pm' : 'am'
  }
  
  let result = format
  Object.keys(formatMap).forEach(key => {
    result = result.replace(new RegExp(key, 'g'), formatMap[key])
  })
  
  return result
}

// 使用Intl.DateTimeFormat格式化日期
export function formatDateIntl(
  date: Date | string | number,
  options: DateFormatOptions = {},
  locale = 'zh-CN'
): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }
  
  const defaultOptions: DateFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
  
  const finalOptions = { ...defaultOptions, ...options }
  
  return new Intl.DateTimeFormat(locale, finalOptions).format(d)
}

// 获取相对时间
export function getRelativeTime(
  date: Date | string | number,
  locale = 'zh-CN'
): string {
  const d = new Date(date)
  const now = new Date()
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }
  
  const diff = now.getTime() - d.getTime()
  const absDiff = Math.abs(diff)
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  
  if (absDiff < minute) {
    return locale === 'zh-CN' ? '刚刚' : 'just now'
  } else if (absDiff < hour) {
    const minutes = Math.floor(absDiff / minute)
    return rtf.format(diff > 0 ? -minutes : minutes, 'minute')
  } else if (absDiff < day) {
    const hours = Math.floor(absDiff / hour)
    return rtf.format(diff > 0 ? -hours : hours, 'hour')
  } else if (absDiff < week) {
    const days = Math.floor(absDiff / day)
    return rtf.format(diff > 0 ? -days : days, 'day')
  } else if (absDiff < month) {
    const weeks = Math.floor(absDiff / week)
    return rtf.format(diff > 0 ? -weeks : weeks, 'week')
  } else if (absDiff < year) {
    const months = Math.floor(absDiff / month)
    return rtf.format(diff > 0 ? -months : months, 'month')
  } else {
    const years = Math.floor(absDiff / year)
    return rtf.format(diff > 0 ? -years : years, 'year')
  }
}

// 解析日期字符串
export function parseDate(dateString: string): Date | null {
  // 尝试多种日期格式
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/, // YYYY-MM-DD HH:mm:ss
    /^(\d{4})\/(\d{2})\/(\d{2})$/, // YYYY/MM/DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/, // MM-DD-YYYY
  ]
  
  for (const format of formats) {
    const match = dateString.match(format)
    if (match) {
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }
  
  // 如果都不匹配，尝试直接解析
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

// 获取日期范围
export function getDateRange(
  type: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear',
  baseDate = new Date()
): [Date, Date] {
  const base = new Date(baseDate)
  const year = base.getFullYear()
  const month = base.getMonth()
  const date = base.getDate()
  const day = base.getDay()
  
  switch (type) {
    case 'today':
      return [
        new Date(year, month, date, 0, 0, 0),
        new Date(year, month, date, 23, 59, 59)
      ]
    
    case 'yesterday':
      return [
        new Date(year, month, date - 1, 0, 0, 0),
        new Date(year, month, date - 1, 23, 59, 59)
      ]
    
    case 'thisWeek': {
      const startOfWeek = new Date(year, month, date - day, 0, 0, 0)
      const endOfWeek = new Date(year, month, date - day + 6, 23, 59, 59)
      return [startOfWeek, endOfWeek]
    }
    
    case 'lastWeek': {
      const startOfLastWeek = new Date(year, month, date - day - 7, 0, 0, 0)
      const endOfLastWeek = new Date(year, month, date - day - 1, 23, 59, 59)
      return [startOfLastWeek, endOfLastWeek]
    }
    
    case 'thisMonth':
      return [
        new Date(year, month, 1, 0, 0, 0),
        new Date(year, month + 1, 0, 23, 59, 59)
      ]
    
    case 'lastMonth':
      return [
        new Date(year, month - 1, 1, 0, 0, 0),
        new Date(year, month, 0, 23, 59, 59)
      ]
    
    case 'thisYear':
      return [
        new Date(year, 0, 1, 0, 0, 0),
        new Date(year, 11, 31, 23, 59, 59)
      ]
    
    case 'lastYear':
      return [
        new Date(year - 1, 0, 1, 0, 0, 0),
        new Date(year - 1, 11, 31, 23, 59, 59)
      ]
    
    default:
      return [base, base]
  }
}

// 计算两个日期之间的差异
export function getDateDiff(
  date1: Date | string | number,
  date2: Date | string | number,
  unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years' = 'days'
): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return NaN
  }
  
  const diff = d2.getTime() - d1.getTime()
  
  switch (unit) {
    case 'milliseconds':
      return diff
    case 'seconds':
      return Math.floor(diff / 1000)
    case 'minutes':
      return Math.floor(diff / (1000 * 60))
    case 'hours':
      return Math.floor(diff / (1000 * 60 * 60))
    case 'days':
      return Math.floor(diff / (1000 * 60 * 60 * 24))
    case 'weeks':
      return Math.floor(diff / (1000 * 60 * 60 * 24 * 7))
    case 'months':
      return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth())
    case 'years':
      return d2.getFullYear() - d1.getFullYear()
    default:
      return Math.floor(diff / (1000 * 60 * 60 * 24))
  }
}

// 添加时间
export function addTime(
  date: Date | string | number,
  amount: number,
  unit: 'milliseconds' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'
): Date {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return new Date(NaN)
  }
  
  switch (unit) {
    case 'milliseconds':
      return new Date(d.getTime() + amount)
    case 'seconds':
      return new Date(d.getTime() + amount * 1000)
    case 'minutes':
      return new Date(d.getTime() + amount * 1000 * 60)
    case 'hours':
      return new Date(d.getTime() + amount * 1000 * 60 * 60)
    case 'days':
      return new Date(d.getTime() + amount * 1000 * 60 * 60 * 24)
    case 'weeks':
      return new Date(d.getTime() + amount * 1000 * 60 * 60 * 24 * 7)
    case 'months': {
      const newDate = new Date(d)
      newDate.setMonth(newDate.getMonth() + amount)
      return newDate
    }
    case 'years': {
      const newDate = new Date(d)
      newDate.setFullYear(newDate.getFullYear() + amount)
      return newDate
    }
    default:
      return d
  }
}

// 获取时区信息
export function getTimezoneInfo(): {
  name: string
  offset: number
  offsetString: string
} {
  const date = new Date()
  const offset = -date.getTimezoneOffset()
  const hours = Math.floor(Math.abs(offset) / 60)
  const minutes = Math.abs(offset) % 60
  const sign = offset >= 0 ? '+' : '-'
  
  return {
    name: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offset,
    offsetString: `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
}

// 判断是否为同一天
export function isSameDay(
  date1: Date | string | number,
  date2: Date | string | number
): boolean {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate()
}

// 判断是否为工作日
export function isWeekday(date: Date | string | number): boolean {
  const d = new Date(date)
  const day = d.getDay()
  return day >= 1 && day <= 5
}

// 判断是否为周末
export function isWeekend(date: Date | string | number): boolean {
  return !isWeekday(date)
}

// 获取月份的天数
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

// 获取年份的天数
export function getDaysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365
}

// 判断是否为闰年
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
}

// 格式化持续时间
export function formatDuration(
  milliseconds: number,
  options: {
    format?: 'long' | 'short' | 'narrow'
    units?: ('years' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds')[]
    maxUnits?: number
  } = {}
): string {
  const {
    format = 'long',
    units = ['days', 'hours', 'minutes', 'seconds'],
    maxUnits = 2
  } = options
  
  if (milliseconds < 0) {
    return '0秒'
  }
  
  const unitValues = {
    years: Math.floor(milliseconds / (1000 * 60 * 60 * 24 * 365)),
    months: Math.floor(milliseconds / (1000 * 60 * 60 * 24 * 30)),
    weeks: Math.floor(milliseconds / (1000 * 60 * 60 * 24 * 7)),
    days: Math.floor(milliseconds / (1000 * 60 * 60 * 24)),
    hours: Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((milliseconds % (1000 * 60)) / 1000)
  }
  
  const unitLabels = {
    long: {
      years: '年',
      months: '个月',
      weeks: '周',
      days: '天',
      hours: '小时',
      minutes: '分钟',
      seconds: '秒'
    },
    short: {
      years: '年',
      months: '月',
      weeks: '周',
      days: '天',
      hours: '时',
      minutes: '分',
      seconds: '秒'
    },
    narrow: {
      years: 'y',
      months: 'M',
      weeks: 'w',
      days: 'd',
      hours: 'h',
      minutes: 'm',
      seconds: 's'
    }
  }
  
  const labels = unitLabels[format]
  const parts: string[] = []
  
  for (const unit of units) {
    if (parts.length >= maxUnits) break
    
    const value = unitValues[unit]
    if (value > 0) {
      parts.push(`${value}${labels[unit]}`)
    }
  }
  
  return parts.length > 0 ? parts.join('') : '0秒'
}