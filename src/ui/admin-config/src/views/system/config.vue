<template>
  <div class="system-config">
    <div class="page-header">
      <h2>系统配置</h2>
      <p>管理系统的各项配置参数</p>
    </div>

    <el-row :gutter="20">
      <!-- 基础配置 -->
      <el-col :xs="24" :lg="12">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>基础配置</span>
            </div>
          </template>
          
          <el-form :model="basicConfig" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="basicConfig.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            
            <el-form-item label="系统描述">
              <el-input
                v-model="basicConfig.systemDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入系统描述"
              />
            </el-form-item>
            
            <el-form-item label="系统版本">
              <el-input v-model="basicConfig.version" placeholder="请输入版本号" />
            </el-form-item>
            
            <el-form-item label="维护模式">
              <el-switch
                v-model="basicConfig.maintenanceMode"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            
            <el-form-item label="调试模式">
              <el-switch
                v-model="basicConfig.debugMode"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 安全配置 -->
      <el-col :xs="24" :lg="12">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <el-icon><Lock /></el-icon>
              <span>安全配置</span>
            </div>
          </template>
          
          <el-form :model="securityConfig" label-width="120px">
            <el-form-item label="会话超时">
              <el-input-number
                v-model="securityConfig.sessionTimeout"
                :min="5"
                :max="1440"
                controls-position="right"
              />
              <span class="unit">分钟</span>
            </el-form-item>
            
            <el-form-item label="密码最小长度">
              <el-input-number
                v-model="securityConfig.minPasswordLength"
                :min="6"
                :max="20"
                controls-position="right"
              />
            </el-form-item>
            
            <el-form-item label="登录失败限制">
              <el-input-number
                v-model="securityConfig.maxLoginAttempts"
                :min="3"
                :max="10"
                controls-position="right"
              />
              <span class="unit">次</span>
            </el-form-item>
            
            <el-form-item label="强制HTTPS">
              <el-switch
                v-model="securityConfig.forceHttps"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
            
            <el-form-item label="双因子认证">
              <el-switch
                v-model="securityConfig.twoFactorAuth"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 邮件配置 -->
      <el-col :xs="24" :lg="12">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <el-icon><Message /></el-icon>
              <span>邮件配置</span>
            </div>
          </template>
          
          <el-form :model="emailConfig" label-width="120px">
            <el-form-item label="SMTP服务器">
              <el-input v-model="emailConfig.smtpHost" placeholder="请输入SMTP服务器地址" />
            </el-form-item>
            
            <el-form-item label="SMTP端口">
              <el-input-number
                v-model="emailConfig.smtpPort"
                :min="1"
                :max="65535"
                controls-position="right"
              />
            </el-form-item>
            
            <el-form-item label="发件人邮箱">
              <el-input v-model="emailConfig.fromEmail" placeholder="请输入发件人邮箱" />
            </el-form-item>
            
            <el-form-item label="发件人名称">
              <el-input v-model="emailConfig.fromName" placeholder="请输入发件人名称" />
            </el-form-item>
            
            <el-form-item label="启用SSL">
              <el-switch
                v-model="emailConfig.enableSsl"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 存储配置 -->
      <el-col :xs="24" :lg="12">
        <el-card class="config-card">
          <template #header>
            <div class="card-header">
              <el-icon><FolderOpened /></el-icon>
              <span>存储配置</span>
            </div>
          </template>
          
          <el-form :model="storageConfig" label-width="120px">
            <el-form-item label="存储类型">
              <el-select v-model="storageConfig.type" placeholder="请选择存储类型">
                <el-option label="本地存储" value="local" />
                <el-option label="阿里云OSS" value="aliyun" />
                <el-option label="腾讯云COS" value="tencent" />
                <el-option label="AWS S3" value="aws" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="存储路径">
              <el-input v-model="storageConfig.path" placeholder="请输入存储路径" />
            </el-form-item>
            
            <el-form-item label="最大文件大小">
              <el-input-number
                v-model="storageConfig.maxFileSize"
                :min="1"
                :max="1024"
                controls-position="right"
              />
              <span class="unit">MB</span>
            </el-form-item>
            
            <el-form-item label="允许的文件类型">
              <el-input
                v-model="storageConfig.allowedTypes"
                placeholder="如：jpg,png,pdf,doc"
              />
            </el-form-item>
            
            <el-form-item label="自动清理">
              <el-switch
                v-model="storageConfig.autoCleanup"
                active-text="开启"
                inactive-text="关闭"
              />
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" size="large" @click="saveConfig" :loading="saving">
        <el-icon><Check /></el-icon>
        保存配置
      </el-button>
      <el-button size="large" @click="resetConfig">
        <el-icon><RefreshLeft /></el-icon>
        重置配置
      </el-button>
      <el-button type="info" size="large" @click="exportConfig">
        <el-icon><Download /></el-icon>
        导出配置
      </el-button>
      <el-button type="warning" size="large" @click="importConfig">
        <el-icon><Upload /></el-icon>
        导入配置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting,
  Lock,
  Message,
  FolderOpened,
  Check,
  RefreshLeft,
  Download,
  Upload
} from '@element-plus/icons-vue'

const saving = ref(false)

// 基础配置
const basicConfig = reactive({
  systemName: 'BASB 管理系统',
  systemDescription: '基于第二大脑理念的知识管理系统',
  version: '1.0.0',
  maintenanceMode: false,
  debugMode: false
})

// 安全配置
const securityConfig = reactive({
  sessionTimeout: 30,
  minPasswordLength: 8,
  maxLoginAttempts: 5,
  forceHttps: true,
  twoFactorAuth: false
})

// 邮件配置
const emailConfig = reactive({
  smtpHost: '',
  smtpPort: 587,
  fromEmail: '',
  fromName: 'BASB系统',
  enableSsl: true
})

// 存储配置
const storageConfig = reactive({
  type: 'local',
  path: '/uploads',
  maxFileSize: 10,
  allowedTypes: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx',
  autoCleanup: true
})

// 保存配置
const saveConfig = async () => {
  saving.value = true
  try {
    // 这里应该调用API保存配置
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage({
      message: '配置保存成功',
      type: 'success'
    })
  } catch (error) {
    ElMessage({
      message: '配置保存失败',
      type: 'error'
    })
  } finally {
    saving.value = false
  }
}

// 重置配置
const resetConfig = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有配置吗？此操作不可恢复。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 重置为默认值
    Object.assign(basicConfig, {
      systemName: 'BASB 管理系统',
      systemDescription: '基于第二大脑理念的知识管理系统',
      version: '1.0.0',
      maintenanceMode: false,
      debugMode: false
    })
    
    ElMessage({
      message: '配置已重置',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 导出配置
const exportConfig = () => {
  const config = {
    basic: basicConfig,
    security: securityConfig,
    email: emailConfig,
    storage: storageConfig
  }
  
  const dataStr = JSON.stringify(config, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = 'system-config.json'
  link.click()
  
  URL.revokeObjectURL(url)
  
  ElMessage({
    message: '配置导出成功',
    type: 'success'
  })
}

// 导入配置
const importConfig = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        // 确保e.target?.result不为null或undefined再进行解析
        if (e.target?.result) {
          const config = JSON.parse(e.target.result as string)
          
          if (config.basic) Object.assign(basicConfig, config.basic)
          if (config.security) Object.assign(securityConfig, config.security)
          if (config.email) Object.assign(emailConfig, config.email)
          if (config.storage) Object.assign(storageConfig, config.storage)
        }
        
        ElMessage({
          message: '配置导入成功',
          type: 'success'
        })
      } catch {
        ElMessage({
          message: '配置文件格式错误',
          type: 'error'
        })
      }
    }
    reader.readAsText(file)
  }
  
  input.click()
}

// 加载配置
const loadConfig = async () => {
  try {
    // 这里应该调用API加载配置
    // const response = await api.getSystemConfig()
    // Object.assign(basicConfig, response.basic)
    // ...
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<style lang="scss" scoped>
.system-config {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.page-header {
  margin-bottom: 30px;
  
  h2 {
    color: #303133;
    margin-bottom: 8px;
  }
  
  p {
    color: #606266;
    margin: 0;
  }
}

.config-card {
  margin-bottom: 20px;
  
  .card-header {
    display: flex;
    align-items: center;
    font-weight: bold;
    color: #303133;
    
    .el-icon {
      margin-right: 8px;
      font-size: 18px;
    }
  }
  
  .el-form {
    .unit {
      margin-left: 8px;
      color: #909399;
      font-size: 14px;
    }
  }
}

.action-buttons {
  margin-top: 30px;
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  
  .el-button {
    margin: 0 10px;
    
    .el-icon {
      margin-right: 8px;
    }
  }
}

@media (max-width: 768px) {
  .system-config {
    padding: 10px;
  }
  
  .action-buttons {
    .el-button {
      margin: 5px;
      width: calc(50% - 10px);
    }
  }
}
</style>