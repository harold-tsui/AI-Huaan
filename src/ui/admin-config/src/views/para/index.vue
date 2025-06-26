<template>
  <div class="para-container">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <h2>PARA 组织方法</h2>
          <p class="subtitle">Projects, Areas, Resources, Archives</p>
        </div>
      </template>
      
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in paraItems" :key="item.key">
          <el-card class="para-item" shadow="hover" @click="navigateTo(item.path)">
            <div class="para-content">
              <el-icon class="para-icon" :size="40">
                <component :is="item.icon" />
              </el-icon>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { 
  Folder, 
  Collection, 
  Document, 
  Box 
} from '@element-plus/icons-vue'

const router = useRouter()

const paraItems = [
  {
    key: 'projects',
    title: 'Projects 项目',
    description: '有明确截止日期和具体成果的工作',
    icon: Folder,
    path: '/para/projects'
  },
  {
    key: 'areas',
    title: 'Areas 领域',
    description: '需要持续维护的责任领域',
    icon: Collection,
    path: '/para/areas'
  },
  {
    key: 'resources',
    title: 'Resources 资源',
    description: '未来可能有用的主题或兴趣',
    icon: Document,
    path: '/para/resources'
  },
  {
    key: 'archives',
    title: 'Archives 归档',
    description: '来自其他三个类别的非活跃项目',
    icon: Box,
    path: '/para/archives'
  }
]

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.para-container {
  padding: 20px;
}

.page-card {
  margin-bottom: 20px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.subtitle {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.para-item {
  cursor: pointer;
  transition: transform 0.2s;
  margin-bottom: 20px;
}

.para-item:hover {
  transform: translateY(-2px);
}

.para-content {
  text-align: center;
  padding: 20px;
}

.para-icon {
  color: #409EFF;
  margin-bottom: 16px;
}

.para-content h3 {
  margin: 0 0 12px 0;
  color: #303133;
  font-size: 16px;
}

.para-content p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}
</style>