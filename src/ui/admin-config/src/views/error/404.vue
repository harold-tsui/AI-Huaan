<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <div class="error-title">页面不存在</div>
      <div class="error-description">
        抱歉，您访问的页面不存在或已被删除。
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
      </div>
    </div>
    <div class="error-image">
      <svg viewBox="0 0 404 404" class="error-svg">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="202" cy="202" r="200" fill="url(#gradient)" opacity="0.1"/>
        <text x="202" y="220" text-anchor="middle" font-size="120" font-weight="bold" fill="url(#gradient)">404</text>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled, Back } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
  margin-right: 50px;

  .error-code {
    font-size: 120px;
    font-weight: bold;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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