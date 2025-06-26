<template>
  <!-- 外部链接 -->
  <a v-if="isExt" :href="to" target="_blank" rel="noopener noreferrer" class="app-link">
    <slot />
  </a>
  
  <!-- 内部链接 -->
  <router-link v-else :to="to" class="app-link">
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isExternal } from '@/utils/validate'

interface Props {
  to: string
}

const props = defineProps<Props>()

// 判断是否为外部链接
const isExt = computed(() => {
  return isExternal(props.to)
})
</script>

<style lang="scss" scoped>
.app-link {
  display: block;
  text-decoration: none;
  color: inherit;
  
  &:hover {
    text-decoration: none;
    color: inherit;
  }
  
  &:focus {
    outline: none;
  }
}
</style>