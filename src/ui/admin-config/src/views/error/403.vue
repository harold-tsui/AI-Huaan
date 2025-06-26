<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">403</div>
      <div class="error-title">权限不足</div>
      <div class="error-description">
        抱歉，您没有权限访问此页面。请联系管理员获取相应权限。
      </div>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button @click="goBack">
          <el-icon><Back /></el-icon>
          返回上页
        </el-button>
        <el-button type="warning" @click="contactAdmin">
          <el-icon><Message /></el-icon>
          联系管理员
        </el-button>
      </div>
    </div>
    <div class="error-image">
      <svg viewBox="0 0 403 403" class="error-svg">
        <defs>
          <linearGradient id="gradient403" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="201.5" cy="201.5" r="200" fill="url(#gradient403)" opacity="0.1"/>
        <text x="201.5" y="220" text-anchor="middle" font-size="100" font-weight="bold" fill="url(#gradient403)">403</text>
        <path d="M150 150 L250 150 L250 180 L220 180 L220 250 L180 250 L180 180 L150 180 Z" fill="url(#gradient403)" opacity="0.3"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { HomeFilled, Back, Message } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}

const contactAdmin = () => {
  ElMessage({
    message: '请通过邮件或电话联系系统管理员',
    type: 'info',
    duration: 3000
  })
}
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
  margin-right: 50px;

  .error-code {
    font-size: 120px;
    font-weight: bold;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 20px;
    line-height: 1;
  }

  .error-title {
    font-size: 32px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 16px;
  }

  .error-description {
    font-size: 16px;
    color: #606266;
    margin-bottom: 32px;
    line-height: 1.6;
  }

  .error-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;

    .el-button {
      .el-icon {
        margin-right: 8px;
      }
    }
  }
}

.error-image {
  .error-svg {
    width: 300px;
    height: 300px;
  }
}

@media (max-width: 768px) {
  .error-page {
    flex-direction: column;
    text-align: center;
  }

  .error-content {
    margin-right: 0;
    margin-bottom: 30px;

    .error-code {
      font-size: 80px;
    }

    .error-title {
      font-size: 24px;
    }

    .error-actions {
      flex-direction: column;
      align-items: center;

      .el-button {
        width: 200px;
      }
    }
  }

  .error-image {
    .error-svg {
      width: 200px;
      height: 200px;
    }
  }
}
</style>