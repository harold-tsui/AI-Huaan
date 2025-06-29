<template>
  <div style="background: red; color: white; padding: 50px; font-size: 24px; text-align: center;">
    <h1>测试页面 - 如果你看到这个，说明路由工作正常</h1>
    <p>当前路径: {{ $route.path }}</p>
    <p>当前时间: {{ new Date().toLocaleString() }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
console.log('测试页面已加载，当前路径:', route.path)
</script>