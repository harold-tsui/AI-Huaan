/**
 * API类型定义
 * 
 * 包含知识项API所需的枚举类型和接口
 */

/**
 * 内容类型枚举
 */
export enum ContentType {
  TEXT = 'TEXT',
  MARKDOWN = 'MARKDOWN',
  HTML = 'HTML',
  CODE = 'CODE',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  LINK = 'LINK'
}

/**
 * 来源类型枚举
 */
export enum SourceType {
  WEB = 'WEB',
  BOOK = 'BOOK',
  ARTICLE = 'ARTICLE',
  PODCAST = 'PODCAST',
  VIDEO = 'VIDEO',
  MEETING = 'MEETING',
  CONVERSATION = 'CONVERSATION',
  EMAIL = 'EMAIL',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  COURSE = 'COURSE',
  PERSONAL = 'PERSONAL',
  OTHER = 'OTHER'
}

/**
 * 安全级别枚举
 */
export enum SecurityLevel {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  CONFIDENTIAL = 'CONFIDENTIAL',
  RESTRICTED = 'RESTRICTED'
}