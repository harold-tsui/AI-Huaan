<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">500</div>
      <div class="error-title">服务器错误</div>
      <div class="error-description">
        抱歉，服务器遇到了一些问题。我们正在努力修复，请稍后再试。
      </div>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">
          <el-icon><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button @click="refresh">
          <el-icon><Refresh /></el-icon>
          刷新页面
        </el-button>
        <el-button type="info" @click="reportIssue">
          <el-icon><Warning /></el-icon>
          报告问题
        </el-button>
      </div>
    </div>
    <div class="error-image">
      <svg viewBox="0 0 500 500" class="error-svg">
        <defs>
          <linearGradient id="gradient500" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff9a9e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#fecfef;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="250" cy="250" r="200" fill="url(#gradient500)" opacity="0.1"/>
        <text x="250" y="270" text-anchor="middle" font-size="100" font-weight="bold" fill="url(#gradient500)">500</text>
        <!-- 服务器图标 -->
        <rect x="200" y="150" width="100" height="60" rx="5" fill="url(#gradient500)" opacity="0.3"/>
        <rect x="210" y="160" width="80" height="8" rx="2" fill="url(#gradient500)" opacity="0.5"/>
        <rect x="210" y="175" width="60" height="8" rx="2" fill="url(#gradient500)" opacity="0.5"/>
        <rect x="210" y="190" width="70" height="8" rx="2" fill="url(#gradient500)" opacity="0.5"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { HomeFilled, Refresh, Warning } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const refresh = () => {
  window.location.reload()
}

const reportIssue = () => {
  ElMessage({
    message: '问题已记录，技术团队将尽快处理',
    type: 'success',
    duration: 3000
  })
  // 这里可以添加实际的问题报告逻辑
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
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
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