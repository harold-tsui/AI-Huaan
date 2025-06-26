<template>
  <div class="settings">
    <div class="settings-header">
      <h2>设置</h2>
      <p>管理您的账户设置和偏好</p>
    </div>

    <el-row :gutter="20">
      <!-- 左侧菜单 -->
      <el-col :xs="24" :sm="6" :md="5">
        <el-card class="settings-menu">
          <el-menu
            v-model:default-active="activeTab"
            mode="vertical"
            @select="handleMenuSelect"
          >
            <el-menu-item index="profile">
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>安全设置</span>
            </el-menu-item>
            <el-menu-item index="notification">
              <el-icon><Bell /></el-icon>
              <span>通知设置</span>
            </el-menu-item>
            <el-menu-item index="appearance">
              <el-icon><Monitor /></el-icon>
              <span>外观设置</span>
            </el-menu-item>
            <el-menu-item index="privacy">
              <el-icon><View /></el-icon>
              <span>隐私设置</span>
            </el-menu-item>
            <el-menu-item index="advanced">
              <el-icon><Setting /></el-icon>
              <span>高级设置</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 右侧内容 -->
      <el-col :xs="24" :sm="18" :md="19">
        <el-card class="settings-content">
          <!-- 个人资料 -->
          <div v-show="activeTab === 'profile'" class="settings-section">
            <div class="section-header">
              <h3>个人资料</h3>
              <p>管理您的个人信息</p>
            </div>
            
            <el-form
              ref="profileFormRef"
              :model="profileForm"
              :rules="profileRules"
              label-width="120px"
              class="profile-form"
            >
              <div class="avatar-section">
                <el-form-item label="头像">
                  <div class="avatar-upload">
                    <el-avatar :size="80" :src="profileForm.avatar" class="avatar">
                      <el-icon><UserFilled /></el-icon>
                    </el-avatar>
                    <div class="avatar-actions">
                      <el-button size="small" @click="handleAvatarUpload">
                        <el-icon><Upload /></el-icon>
                        上传头像
                      </el-button>
                      <el-button size="small" type="danger" @click="handleAvatarRemove">
                        <el-icon><Delete /></el-icon>
                        移除
                      </el-button>
                    </div>
                  </div>
                </el-form-item>
              </div>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="用户名" prop="username">
                    <el-input v-model="profileForm.username" disabled />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="邮箱" prop="email">
                    <el-input v-model="profileForm.email" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="姓名" prop="realName">
                    <el-input v-model="profileForm.realName" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="手机号" prop="phone">
                    <el-input v-model="profileForm.phone" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="部门">
                    <el-select v-model="profileForm.department" placeholder="选择部门" style="width: 100%">
                      <el-option label="技术部" value="tech" />
                      <el-option label="产品部" value="product" />
                      <el-option label="运营部" value="operation" />
                      <el-option label="市场部" value="marketing" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="职位">
                    <el-input v-model="profileForm.position" />
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="个人简介">
                <el-input
                  v-model="profileForm.bio"
                  type="textarea"
                  :rows="4"
                  placeholder="介绍一下自己..."
                />
              </el-form-item>
              
              <el-form-item>
                <el-button type="primary" @click="handleSaveProfile">
                  <el-icon><Check /></el-icon>
                  保存更改
                </el-button>
                <el-button @click="handleResetProfile">
                  <el-icon><Refresh /></el-icon>
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 安全设置 -->
          <div v-show="activeTab === 'security'" class="settings-section">
            <div class="section-header">
              <h3>安全设置</h3>
              <p>管理您的账户安全</p>
            </div>
            
            <!-- 修改密码 -->
            <el-card class="security-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Lock /></el-icon>
                  <span>修改密码</span>
                </div>
              </template>
              
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="120px"
              >
                <el-form-item label="当前密码" prop="currentPassword">
                  <el-input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    show-password
                    placeholder="请输入当前密码"
                  />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    show-password
                    placeholder="请输入新密码"
                  />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    show-password
                    placeholder="请再次输入新密码"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleChangePassword">
                    <el-icon><Check /></el-icon>
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
            
            <!-- 两步验证 -->
            <el-card class="security-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Shield /></el-icon>
                  <span>两步验证</span>
                </div>
              </template>
              
              <div class="two-factor-section">
                <div class="two-factor-status">
                  <div class="status-info">
                    <el-icon :class="twoFactorEnabled ? 'enabled' : 'disabled'">
                      <CircleCheckFilled v-if="twoFactorEnabled" />
                      <CircleCloseFilled v-else />
                    </el-icon>
                    <div class="status-text">
                      <div class="status-title">
                        {{ twoFactorEnabled ? '已启用' : '未启用' }}
                      </div>
                      <div class="status-desc">
                        {{ twoFactorEnabled ? '您的账户已受到两步验证保护' : '启用两步验证以增强账户安全' }}
                      </div>
                    </div>
                  </div>
                  <el-button
                    :type="twoFactorEnabled ? 'danger' : 'primary'"
                    @click="handleToggleTwoFactor"
                  >
                    {{ twoFactorEnabled ? '禁用' : '启用' }}
                  </el-button>
                </div>
              </div>
            </el-card>
            
            <!-- 登录设备 -->
            <el-card class="security-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Monitor /></el-icon>
                  <span>登录设备</span>
                  <el-button size="small" @click="handleRefreshDevices">
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-button>
                </div>
              </template>
              
              <div class="devices-list">
                <div
                  v-for="device in loginDevices"
                  :key="device.id"
                  class="device-item"
                >
                  <div class="device-info">
                    <el-icon class="device-icon">
                      <Monitor v-if="device.type === 'desktop'" />
                      <Iphone v-else-if="device.type === 'mobile'" />
                      <Laptop v-else />
                    </el-icon>
                    <div class="device-details">
                      <div class="device-name">{{ device.name }}</div>
                      <div class="device-meta">
                        <span>{{ device.location }}</span>
                        <span class="separator">•</span>
                        <span>{{ device.lastActive }}</span>
                        <el-tag v-if="device.current" type="success" size="small">当前设备</el-tag>
                      </div>
                    </div>
                  </div>
                  <el-button
                    v-if="!device.current"
                    type="danger"
                    size="small"
                    @click="handleLogoutDevice(device)"
                  >
                    <el-icon><SwitchButton /></el-icon>
                    注销
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>

          <!-- 通知设置 -->
          <div v-show="activeTab === 'notification'" class="settings-section">
            <div class="section-header">
              <h3>通知设置</h3>
              <p>管理您的通知偏好</p>
            </div>
            
            <el-card class="notification-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Bell /></el-icon>
                  <span>通知偏好</span>
                </div>
              </template>
              
              <div class="notification-settings">
                <div class="notification-group">
                  <h4>系统通知</h4>
                  <div class="notification-item">
                    <div class="notification-info">
                      <div class="notification-title">系统维护通知</div>
                      <div class="notification-desc">接收系统维护和更新通知</div>
                    </div>
                    <el-switch v-model="notificationSettings.systemMaintenance" />
                  </div>
                  <div class="notification-item">
                    <div class="notification-info">
                      <div class="notification-title">安全警报</div>
                      <div class="notification-desc">接收安全相关的重要警报</div>
                    </div>
                    <el-switch v-model="notificationSettings.securityAlerts" />
                  </div>
                </div>
                
                <div class="notification-group">
                  <h4>账户通知</h4>
                  <div class="notification-item">
                    <div class="notification-info">
                      <div class="notification-title">登录通知</div>
                      <div class="notification-desc">新设备登录时发送通知</div>
                    </div>
                    <el-switch v-model="notificationSettings.loginNotification" />
                  </div>
                  <div class="notification-item">
                    <div class="notification-info">
                      <div class="notification-title">密码更改</div>
                      <div class="notification-desc">密码更改时发送确认通知</div>
                    </div>
                    <el-switch v-model="notificationSettings.passwordChange" />
                  </div>
                </div>
                
                <div class="notification-group">
                  <h4>工作通知</h4>
                  <div class="notification-item">
                    <div class="notification-info">
                      <div class="notification-title">任务分配</div>
                      <div class="notification-desc">有新任务分配时通知</div>
                    </div>
                    <el-switch v-model="notificationSettings.taskAssignment" />
                  </div>
                  <div class="notification-item">
                    <div class="notification-info">
                      <div class="notification-title">截止日期提醒</div>
                      <div class="notification-desc">任务截止日期前提醒</div>
                    </div>
                    <el-switch v-model="notificationSettings.deadlineReminder" />
                  </div>
                </div>
                
                <div class="notification-group">
                  <h4>通知方式</h4>
                  <div class="notification-methods">
                    <el-checkbox-group v-model="notificationMethods">
                      <el-checkbox label="email">邮件通知</el-checkbox>
                      <el-checkbox label="sms">短信通知</el-checkbox>
                      <el-checkbox label="push">推送通知</el-checkbox>
                      <el-checkbox label="browser">浏览器通知</el-checkbox>
                    </el-checkbox-group>
                  </div>
                </div>
              </div>
              
              <div class="notification-actions">
                <el-button type="primary" @click="handleSaveNotifications">
                  <el-icon><Check /></el-icon>
                  保存设置
                </el-button>
                <el-button @click="handleTestNotification">
                  <el-icon><Bell /></el-icon>
                  测试通知
                </el-button>
              </div>
            </el-card>
          </div>

          <!-- 外观设置 -->
          <div v-show="activeTab === 'appearance'" class="settings-section">
            <div class="section-header">
              <h3>外观设置</h3>
              <p>自定义界面外观</p>
            </div>
            
            <el-card class="appearance-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Monitor /></el-icon>
                  <span>主题设置</span>
                </div>
              </template>
              
              <div class="appearance-settings">
                <div class="theme-section">
                  <h4>主题模式</h4>
                  <el-radio-group v-model="appearanceSettings.theme" class="theme-options">
                    <el-radio-button label="light">
                      <el-icon><Sunny /></el-icon>
                      浅色
                    </el-radio-button>
                    <el-radio-button label="dark">
                      <el-icon><Moon /></el-icon>
                      深色
                    </el-radio-button>
                    <el-radio-button label="auto">
                      <el-icon><Monitor /></el-icon>
                      自动
                    </el-radio-button>
                  </el-radio-group>
                </div>
                
                <div class="color-section">
                  <h4>主题色</h4>
                  <div class="color-options">
                    <div
                      v-for="color in themeColors"
                      :key="color.name"
                      class="color-option"
                      :class="{ active: appearanceSettings.primaryColor === color.value }"
                      :style="{ backgroundColor: color.value }"
                      @click="appearanceSettings.primaryColor = color.value"
                    >
                      <el-icon v-if="appearanceSettings.primaryColor === color.value">
                        <Check />
                      </el-icon>
                    </div>
                  </div>
                </div>
                
                <div class="layout-section">
                  <h4>布局设置</h4>
                  <div class="layout-options">
                    <div class="layout-item">
                      <div class="layout-info">
                        <div class="layout-title">紧凑模式</div>
                        <div class="layout-desc">减少界面元素间距</div>
                      </div>
                      <el-switch v-model="appearanceSettings.compactMode" />
                    </div>
                    <div class="layout-item">
                      <div class="layout-info">
                        <div class="layout-title">固定头部</div>
                        <div class="layout-desc">滚动时保持头部固定</div>
                      </div>
                      <el-switch v-model="appearanceSettings.fixedHeader" />
                    </div>
                    <div class="layout-item">
                      <div class="layout-info">
                        <div class="layout-title">固定侧边栏</div>
                        <div class="layout-desc">保持侧边栏始终可见</div>
                      </div>
                      <el-switch v-model="appearanceSettings.fixedSidebar" />
                    </div>
                  </div>
                </div>
                
                <div class="font-section">
                  <h4>字体设置</h4>
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div class="font-item">
                        <label>字体大小</label>
                        <el-select v-model="appearanceSettings.fontSize" style="width: 100%">
                          <el-option label="小" value="small" />
                          <el-option label="中" value="medium" />
                          <el-option label="大" value="large" />
                        </el-select>
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="font-item">
                        <label>字体族</label>
                        <el-select v-model="appearanceSettings.fontFamily" style="width: 100%">
                          <el-option label="系统默认" value="system" />
                          <el-option label="苹方" value="pingfang" />
                          <el-option label="微软雅黑" value="yahei" />
                        </el-select>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </div>
              
              <div class="appearance-actions">
                <el-button type="primary" @click="handleSaveAppearance">
                  <el-icon><Check /></el-icon>
                  应用设置
                </el-button>
                <el-button @click="handleResetAppearance">
                  <el-icon><Refresh /></el-icon>
                  重置默认
                </el-button>
              </div>
            </el-card>
          </div>

          <!-- 隐私设置 -->
          <div v-show="activeTab === 'privacy'" class="settings-section">
            <div class="section-header">
              <h3>隐私设置</h3>
              <p>管理您的隐私和数据</p>
            </div>
            
            <el-card class="privacy-card">
              <template #header>
                <div class="card-header">
                  <el-icon><View /></el-icon>
                  <span>数据隐私</span>
                </div>
              </template>
              
              <div class="privacy-settings">
                <div class="privacy-item">
                  <div class="privacy-info">
                    <div class="privacy-title">个人资料可见性</div>
                    <div class="privacy-desc">控制其他用户能看到您的哪些信息</div>
                  </div>
                  <el-select v-model="privacySettings.profileVisibility">
                    <el-option label="公开" value="public" />
                    <el-option label="仅团队" value="team" />
                    <el-option label="私有" value="private" />
                  </el-select>
                </div>
                
                <div class="privacy-item">
                  <div class="privacy-info">
                    <div class="privacy-title">活动状态</div>
                    <div class="privacy-desc">显示您的在线状态</div>
                  </div>
                  <el-switch v-model="privacySettings.showOnlineStatus" />
                </div>
                
                <div class="privacy-item">
                  <div class="privacy-info">
                    <div class="privacy-title">数据分析</div>
                    <div class="privacy-desc">允许收集使用数据以改进服务</div>
                  </div>
                  <el-switch v-model="privacySettings.allowAnalytics" />
                </div>
                
                <div class="privacy-item">
                  <div class="privacy-info">
                    <div class="privacy-title">第三方集成</div>
                    <div class="privacy-desc">允许第三方应用访问您的数据</div>
                  </div>
                  <el-switch v-model="privacySettings.allowThirdParty" />
                </div>
              </div>
              
              <div class="privacy-actions">
                <el-button type="primary" @click="handleSavePrivacy">
                  <el-icon><Check /></el-icon>
                  保存设置
                </el-button>
                <el-button type="info" @click="handleExportData">
                  <el-icon><Download /></el-icon>
                  导出数据
                </el-button>
                <el-button type="danger" @click="handleDeleteAccount">
                  <el-icon><Delete /></el-icon>
                  删除账户
                </el-button>
              </div>
            </el-card>
          </div>

          <!-- 高级设置 -->
          <div v-show="activeTab === 'advanced'" class="settings-section">
            <div class="section-header">
              <h3>高级设置</h3>
              <p>开发者和高级用户选项</p>
            </div>
            
            <el-card class="advanced-card">
              <template #header>
                <div class="card-header">
                  <el-icon><Setting /></el-icon>
                  <span>开发者选项</span>
                </div>
              </template>
              
              <div class="advanced-settings">
                <div class="advanced-item">
                  <div class="advanced-info">
                    <div class="advanced-title">调试模式</div>
                    <div class="advanced-desc">启用详细的调试信息</div>
                  </div>
                  <el-switch v-model="advancedSettings.debugMode" />
                </div>
                
                <div class="advanced-item">
                  <div class="advanced-info">
                    <div class="advanced-title">API 访问</div>
                    <div class="advanced-desc">生成 API 密钥用于第三方集成</div>
                  </div>
                  <el-button size="small" @click="handleGenerateApiKey">
                    <el-icon><Key /></el-icon>
                    生成密钥
                  </el-button>
                </div>
                
                <div class="advanced-item">
                  <div class="advanced-info">
                    <div class="advanced-title">实验性功能</div>
                    <div class="advanced-desc">启用测试中的新功能</div>
                  </div>
                  <el-switch v-model="advancedSettings.experimentalFeatures" />
                </div>
                
                <div class="advanced-item">
                  <div class="advanced-info">
                    <div class="advanced-title">性能监控</div>
                    <div class="advanced-desc">收集性能数据用于优化</div>
                  </div>
                  <el-switch v-model="advancedSettings.performanceMonitoring" />
                </div>
              </div>
              
              <div class="advanced-actions">
                <el-button type="primary" @click="handleSaveAdvanced">
                  <el-icon><Check /></el-icon>
                  保存设置
                </el-button>
                <el-button type="warning" @click="handleClearCache">
                  <el-icon><Delete /></el-icon>
                  清除缓存
                </el-button>
                <el-button type="info" @click="handleExportSettings">
                  <el-icon><Download /></el-icon>
                  导出设置
                </el-button>
              </div>
            </el-card>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Lock,
  Bell,
  Monitor,
  View,
  Setting,
  UserFilled,
  Upload,
  Delete,
  Check,
  Refresh,
  Lock,
  CircleCheckFilled,
  CircleCloseFilled,
  SwitchButton,
  Iphone,
  Monitor,
  Sunny,
  Moon,
  Download,
  Key
} from '@element-plus/icons-vue'

const activeTab = ref('profile')
const twoFactorEnabled = ref(false)

// 个人资料表单
const profileForm = reactive({
  username: 'admin',
  email: 'admin@example.com',
  realName: '管理员',
  phone: '13800138000',
  department: 'tech',
  position: '系统管理员',
  bio: '负责系统管理和维护工作',
  avatar: ''
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 通知设置
const notificationSettings = reactive({
  systemMaintenance: true,
  securityAlerts: true,
  loginNotification: true,
  passwordChange: true,
  taskAssignment: true,
  deadlineReminder: true
})

const notificationMethods = ref(['email', 'push'])

// 外观设置
const appearanceSettings = reactive({
  theme: 'light',
  primaryColor: '#409eff',
  compactMode: false,
  fixedHeader: true,
  fixedSidebar: true,
  fontSize: 'medium',
  fontFamily: 'system'
})

// 隐私设置
const privacySettings = reactive({
  profileVisibility: 'team',
  showOnlineStatus: true,
  allowAnalytics: true,
  allowThirdParty: false
})

// 高级设置
const advancedSettings = reactive({
  debugMode: false,
  experimentalFeatures: false,
  performanceMonitoring: true
})

// 主题色选项
const themeColors = [
  { name: '默认蓝', value: '#409eff' },
  { name: '成功绿', value: '#67c23a' },
  { name: '警告橙', value: '#e6a23c' },
  { name: '危险红', value: '#f56c6c' },
  { name: '信息灰', value: '#909399' },
  { name: '紫色', value: '#722ed1' },
  { name: '青色', value: '#13c2c2' },
  { name: '粉色', value: '#eb2f96' }
]

// 登录设备
const loginDevices = ref([
  {
    id: 1,
    name: 'MacBook Pro',
    type: 'desktop',
    location: '北京, 中国',
    lastActive: '当前活动',
    current: true
  },
  {
    id: 2,
    name: 'iPhone 13',
    type: 'mobile',
    location: '上海, 中国',
    lastActive: '2小时前',
    current: false
  },
  {
    id: 3,
    name: 'Chrome on Windows',
    type: 'desktop',
    location: '深圳, 中国',
    lastActive: '1天前',
    current: false
  }
])

// 表单验证规则
const profileRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 菜单选择
const handleMenuSelect = (key: string) => {
  activeTab.value = key
}

// 头像上传
const handleAvatarUpload = () => {
  // 这里应该实现文件上传逻辑
  ElMessage({
    message: '头像上传功能待实现',
    type: 'info'
  })
}

// 移除头像
const handleAvatarRemove = () => {
  profileForm.avatar = ''
  ElMessage({
    message: '头像已移除',
    type: 'success'
  })
}

// 保存个人资料
const handleSaveProfile = () => {
  ElMessage({
    message: '个人资料保存成功',
    type: 'success'
  })
}

// 重置个人资料
const handleResetProfile = () => {
  // 重置表单数据
  ElMessage({
    message: '已重置为原始数据',
    type: 'info'
  })
}

// 修改密码
const handleChangePassword = () => {
  ElMessage({
    message: '密码修改成功',
    type: 'success'
  })
  
  // 清空表单
  Object.assign(passwordForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

// 切换两步验证
const handleToggleTwoFactor = () => {
  if (twoFactorEnabled.value) {
    ElMessageBox.confirm(
      '确定要禁用两步验证吗？这将降低您账户的安全性。',
      '确认禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      twoFactorEnabled.value = false
      ElMessage({
        message: '两步验证已禁用',
        type: 'success'
      })
    })
  } else {
    twoFactorEnabled.value = true
    ElMessage({
      message: '两步验证已启用',
      type: 'success'
    })
  }
}

// 刷新设备列表
const handleRefreshDevices = () => {
  ElMessage({
    message: '设备列表已刷新',
    type: 'success'
  })
}

// 注销设备
const handleLogoutDevice = (device: any) => {
  ElMessageBox.confirm(
    `确定要注销设备 "${device.name}" 吗？`,
    '确认注销',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = loginDevices.value.findIndex(d => d.id === device.id)
    if (index > -1) {
      loginDevices.value.splice(index, 1)
    }
    ElMessage({
      message: '设备已注销',
      type: 'success'
    })
  })
}

// 保存通知设置
const handleSaveNotifications = () => {
  ElMessage({
    message: '通知设置保存成功',
    type: 'success'
  })
}

// 测试通知
const handleTestNotification = () => {
  ElMessage({
    message: '这是一条测试通知',
    type: 'info'
  })
}

// 保存外观设置
const handleSaveAppearance = () => {
  ElMessage({
    message: '外观设置已应用',
    type: 'success'
  })
}

// 重置外观设置
const handleResetAppearance = () => {
  Object.assign(appearanceSettings, {
    theme: 'light',
    primaryColor: '#409eff',
    compactMode: false,
    fixedHeader: true,
    fixedSidebar: true,
    fontSize: 'medium',
    fontFamily: 'system'
  })
  ElMessage({
    message: '已重置为默认设置',
    type: 'info'
  })
}

// 保存隐私设置
const handleSavePrivacy = () => {
  ElMessage({
    message: '隐私设置保存成功',
    type: 'success'
  })
}

// 导出数据
const handleExportData = () => {
  ElMessage({
    message: '数据导出功能待实现',
    type: 'info'
  })
}

// 删除账户
const handleDeleteAccount = () => {
  ElMessageBox.confirm(
    '删除账户是不可逆的操作，您的所有数据将被永久删除。确定要继续吗？',
    '危险操作',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    ElMessage({
      message: '账户删除功能待实现',
      type: 'info'
    })
  })
}

// 保存高级设置
const handleSaveAdvanced = () => {
  ElMessage({
    message: '高级设置保存成功',
    type: 'success'
  })
}

// 生成API密钥
const handleGenerateApiKey = () => {
  const apiKey = 'sk-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  ElMessageBox.alert(
    `您的API密钥：${apiKey}\n\n请妥善保管，密钥只显示一次。`,
    'API密钥',
    {
      confirmButtonText: '我已保存',
      type: 'success'
    }
  )
}

// 清除缓存
const handleClearCache = () => {
  ElMessageBox.confirm(
    '确定要清除所有缓存数据吗？这可能会影响应用性能。',
    '确认清除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage({
      message: '缓存已清除',
      type: 'success'
    })
  })
}

// 导出设置
const handleExportSettings = () => {
  const settings = {
    profile: profileForm,
    notification: notificationSettings,
    appearance: appearanceSettings,
    privacy: privacySettings,
    advanced: advancedSettings
  }
  
  const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `settings-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  
  ElMessage({
    message: '设置已导出',
    type: 'success'
  })
}
</script>

<style lang="scss" scoped>
.settings {
  .settings-header {
    margin-bottom: 20px;
    
    h2 {
      margin: 0 0 8px 0;
      color: #303133;
      font-size: 24px;
      font-weight: 600;
    }
    
    p {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }
  
  .settings-menu {
    .el-menu {
      border: none;
      
      .el-menu-item {
        border-radius: 6px;
        margin-bottom: 4px;
        
        &.is-active {
          background-color: #ecf5ff;
          color: #409eff;
        }
        
        .el-icon {
          margin-right: 8px;
        }
      }
    }
  }
  
  .settings-content {
    min-height: 600px;
    
    .settings-section {
      .section-header {
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #ebeef5;
        
        h3 {
          margin: 0 0 8px 0;
          color: #303133;
          font-size: 20px;
          font-weight: 600;
        }
        
        p {
          margin: 0;
          color: #606266;
          font-size: 14px;
        }
      }
      
      .profile-form {
        .avatar-section {
          .avatar-upload {
            display: flex;
            align-items: center;
            gap: 16px;
            
            .avatar {
              border: 2px solid #ebeef5;
            }
            
            .avatar-actions {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
          }
        }
      }
      
      .security-card,
      .notification-card,
      .appearance-card,
      .privacy-card,
      .advanced-card {
        margin-bottom: 20px;
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .el-icon {
            color: #409eff;
          }
          
          span {
            font-weight: 600;
          }
          
          .el-button {
            margin-left: auto;
          }
        }
        
        .two-factor-section {
          .two-factor-status {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            background-color: #f8f9fa;
            border-radius: 8px;
            
            .status-info {
              display: flex;
              align-items: center;
              gap: 12px;
              
              .el-icon {
                font-size: 24px;
                
                &.enabled {
                  color: #67c23a;
                }
                
                &.disabled {
                  color: #f56c6c;
                }
              }
              
              .status-text {
                .status-title {
                  font-weight: 600;
                  color: #303133;
                }
                
                .status-desc {
                  font-size: 12px;
                  color: #606266;
                  margin-top: 2px;
                }
              }
            }
          }
        }
        
        .devices-list {
          .device-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            border: 1px solid #ebeef5;
            border-radius: 8px;
            margin-bottom: 12px;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            .device-info {
              display: flex;
              align-items: center;
              gap: 12px;
              
              .device-icon {
                font-size: 20px;
                color: #606266;
              }
              
              .device-details {
                .device-name {
                  font-weight: 600;
                  color: #303133;
                }
                
                .device-meta {
                  font-size: 12px;
                  color: #909399;
                  margin-top: 2px;
                  
                  .separator {
                    margin: 0 8px;
                  }
                  
                  .el-tag {
                    margin-left: 8px;
                  }
                }
              }
            }
          }
        }
        
        .notification-settings {
          .notification-group {
            margin-bottom: 24px;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            h4 {
              margin: 0 0 16px 0;
              color: #303133;
              font-size: 16px;
              font-weight: 600;
            }
            
            .notification-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 0;
              border-bottom: 1px solid #f5f7fa;
              
              &:last-child {
                border-bottom: none;
              }
              
              .notification-info {
                .notification-title {
                  font-weight: 500;
                  color: #303133;
                }
                
                .notification-desc {
                  font-size: 12px;
                  color: #606266;
                  margin-top: 2px;
                }
              }
            }
            
            .notification-methods {
              .el-checkbox-group {
                display: flex;
                flex-wrap: wrap;
                gap: 16px;
              }
            }
          }
        }
        
        .appearance-settings {
          .theme-section,
          .color-section,
          .layout-section,
          .font-section {
            margin-bottom: 24px;
            
            &:last-child {
              margin-bottom: 0;
            }
            
            h4 {
              margin: 0 0 16px 0;
              color: #303133;
              font-size: 16px;
              font-weight: 600;
            }
            
            .theme-options {
              .el-radio-button {
                .el-icon {
                  margin-right: 4px;
                }
              }
            }
            
            .color-options {
              display: flex;
              gap: 12px;
              flex-wrap: wrap;
              
              .color-option {
                width: 40px;
                height: 40px;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid transparent;
                transition: all 0.3s;
                
                &:hover {
                  transform: scale(1.1);
                }
                
                &.active {
                  border-color: #303133;
                  
                  .el-icon {
                    color: white;
                    font-size: 16px;
                  }
                }
              }
            }
            
            .layout-options {
              .layout-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #f5f7fa;
                
                &:last-child {
                  border-bottom: none;
                }
                
                .layout-info {
                  .layout-title {
                    font-weight: 500;
                    color: #303133;
                  }
                  
                  .layout-desc {
                    font-size: 12px;
                    color: #606266;
                    margin-top: 2px;
                  }
                }
              }
            }
            
            .font-item {
              label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #303133;
              }
            }
          }
        }
        
        .privacy-settings {
          .privacy-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 0;
            border-bottom: 1px solid #f5f7fa;
            
            &:last-child {
              border-bottom: none;
            }
            
            .privacy-info {
              .privacy-title {
                font-weight: 500;
                color: #303133;
              }
              
              .privacy-desc {
                font-size: 12px;
                color: #606266;
                margin-top: 2px;
              }
            }
          }
        }
        
        .advanced-settings {
          .advanced-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 0;
            border-bottom: 1px solid #f5f7fa;
            
            &:last-child {
              border-bottom: none;
            }
            
            .advanced-info {
              .advanced-title {
                font-weight: 500;
                color: #303133;
              }
              
              .advanced-desc {
                font-size: 12px;
                color: #606266;
                margin-top: 2px;
              }
            }
          }
        }
        
        .notification-actions,
        .appearance-actions,
        .privacy-actions,
        .advanced-actions {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #ebeef5;
          display: flex;
          gap: 12px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .settings {
    .settings-menu {
      margin-bottom: 20px;
      
      .el-menu {
        display: flex;
        overflow-x: auto;
        
        .el-menu-item {
          flex-shrink: 0;
          margin-right: 8px;
          margin-bottom: 0;
        }
      }
    }
    
    .settings-content {
      .settings-section {
        .security-card,
        .notification-card,
        .appearance-card,
        .privacy-card,
        .advanced-card {
          .devices-list {
            .device-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
              
              .el-button {
                align-self: flex-end;
              }
            }
          }
          
          .notification-settings {
            .notification-group {
              .notification-methods {
                .el-checkbox-group {
                  flex-direction: column;
                  gap: 8px;
                }
              }
            }
          }
          
          .appearance-settings {
            .color-section {
              .color-options {
                justify-content: center;
              }
            }
          }
          
          .notification-actions,
          .appearance-actions,
          .privacy-actions,
          .advanced-actions {
            flex-direction: column;
          }
        }
      }
    }
  }
}
</style>