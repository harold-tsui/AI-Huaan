<template>
  <div class="screenfull" @click="click">
    <el-tooltip
      :content="isFullscreen ? '退出全屏' : '全屏'"
      placement="bottom"
    >
      <el-icon :size="20">
        <FullScreen v-if="!isFullscreen" />
        <Aim v-else />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { FullScreen, Aim } from '@element-plus/icons-vue'

const isFullscreen = ref(false)

const click = () => {
  if (!document.fullscreenEnabled) {
    ElMessage({
      message: '你的浏览器不支持全屏',
      type: 'warning'
    })
    return false
  }
  if (isFullscreen.value) {
    exitFullscreen()
  } else {
    requestFullscreen()
  }
}

const requestFullscreen = () => {
  const element = document.documentElement
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if ((element as any).webkitRequestFullscreen) {
    ;(element as any).webkitRequestFullscreen()
  } else if ((element as any).mozRequestFullScreen) {
    ;(element as any).mozRequestFullScreen()
  } else if ((element as any).msRequestFullscreen) {
    ;(element as any).msRequestFullscreen()
  }
}

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if ((document as any).webkitExitFullscreen) {
    ;(document as any).webkitExitFullscreen()
  } else if ((document as any).mozCancelFullScreen) {
    ;(document as any).mozCancelFullScreen()
  } else if ((document as any).msExitFullscreen) {
    ;(document as any).msExitFullscreen()
  }
}

const change = () => {
  isFullscreen.value = Boolean(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )
}

const init = () => {
  document.addEventListener('fullscreenchange', change)
  document.addEventListener('webkitfullscreenchange', change)
  document.addEventListener('mozfullscreenchange', change)
  document.addEventListener('MSFullscreenChange', change)
}

const destroy = () => {
  document.removeEventListener('fullscreenchange', change)
  document.removeEventListener('webkitfullscreenchange', change)
  document.removeEventListener('mozfullscreenchange', change)
  document.removeEventListener('MSFullscreenChange', change)
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  destroy()
})
</script>

<style lang="scss" scoped>
.screenfull {
  display: inline-block;
  cursor: pointer;
  fill: currentColor;
  width: 20px;
  height: 20px;
  vertical-align: 10px;
  transition: fill 0.3s;

  &:hover {
    color: #409eff;
  }
}
</style>