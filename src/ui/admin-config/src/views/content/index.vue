<template>
  <div class="content-management">
    <div class="page-header">
      <h2>内容管理</h2>
      <p>管理系统中的文章、笔记和知识内容</p>
    </div>

    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索标题或内容"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="searchForm.category" placeholder="分类" clearable>
            <el-option label="全部" value="" />
            <el-option label="技术文档" value="tech" />
            <el-option label="学习笔记" value="note" />
            <el-option label="项目总结" value="project" />
            <el-option label="思考感悟" value="thinking" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="searchForm.status" placeholder="状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="已发布" value="published" />
            <el-option label="草稿" value="draft" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="3">
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </el-col>
      </el-row>
      
      <el-row style="margin-top: 15px;">
        <el-col :span="24">
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建内容
          </el-button>
          <el-button type="success" @click="handleBatchPublish" :disabled="!selectedContents.length">
            <el-icon><Check /></el-icon>
            批量发布
          </el-button>
          <el-button type="warning" @click="handleBatchArchive" :disabled="!selectedContents.length">
            <el-icon><Box /></el-icon>
            批量归档
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedContents.length">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
          <el-button type="info" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 内容列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="contentList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="content-title">
              <el-link type="primary" @click="handlePreview(row)">{{ row.title }}</el-link>
              <div class="content-meta">
                <el-tag v-for="tag in row.tags" :key="tag" size="small" class="tag-item">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">{{ getCategoryText(row.category) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="author" label="作者" width="100" />
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="viewCount" label="浏览量" width="100" align="center" />
        
        <el-table-column prop="likeCount" label="点赞数" width="100" align="center" />
        
        <el-table-column prop="updatedAt" label="更新时间" width="160" />
        
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="info" size="small" @click="handlePreview(row)">
              <el-icon><View /></el-icon>
              预览
            </el-button>
            <el-dropdown trigger="click" @command="(command: string) => handleAction(command, row)">
              <el-button size="small">
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="publish" v-if="row.status !== 'published'">
                    <el-icon><Check /></el-icon>发布
                  </el-dropdown-item>
                  <el-dropdown-item command="archive" v-if="row.status !== 'archived'">
                    <el-icon><Box /></el-icon>归档
                  </el-dropdown-item>
                  <el-dropdown-item command="copy">
                    <el-icon><CopyDocument /></el-icon>复制
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑内容对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="80%"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="contentFormRef"
        :model="contentForm"
        :rules="contentFormRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="标题" prop="title">
              <el-input v-model="contentForm.title" placeholder="请输入内容标题" />
            </el-form-item>
            
            <el-form-item label="内容" prop="content">
              <el-input
                v-model="contentForm.content"
                type="textarea"
                :rows="15"
                placeholder="请输入内容正文"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="分类" prop="category">
              <el-select v-model="contentForm.category" placeholder="请选择分类">
                <el-option label="技术文档" value="tech" />
                <el-option label="学习笔记" value="note" />
                <el-option label="项目总结" value="project" />
                <el-option label="思考感悟" value="thinking" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="标签">
              <el-select
                v-model="contentForm.tags"
                multiple
                filterable
                allow-create
                placeholder="请选择或输入标签"
              >
                <el-option
                  v-for="tag in availableTags"
                  :key="tag"
                  :label="tag"
                  :value="tag"
                />
              </el-select>
            </el-form-item>
            
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="contentForm.status">
                <el-radio label="draft">草稿</el-radio>
                <el-radio label="published">发布</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="摘要">
              <el-input
                v-model="contentForm.summary"
                type="textarea"
                :rows="4"
                placeholder="请输入内容摘要"
              />
            </el-form-item>
            
            <el-form-item label="封面图">
              <el-upload
                class="cover-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeCoverUpload"
                :http-request="handleCoverUpload"
              >
                <img v-if="contentForm.cover" :src="contentForm.cover" class="cover" />
                <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            
            <el-form-item label="排序">
              <el-input-number
                v-model="contentForm.sort"
                :min="0"
                :max="999"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button @click="handleSaveDraft" :loading="submitting">
            保存草稿
          </el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新' : '发布' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="内容预览"
      width="80%"
      @close="handlePreviewClose"
    >
      <div class="content-preview" v-if="previewContent">
        <div class="preview-header">
          <h1>{{ previewContent.title }}</h1>
          <div class="preview-meta">
            <span>作者：{{ previewContent.author }}</span>
            <span>分类：{{ getCategoryText(previewContent.category) }}</span>
            <span>创建时间：{{ previewContent.createdAt }}</span>
          </div>
          <div class="preview-tags">
            <el-tag v-for="tag in previewContent.tags" :key="tag" class="tag-item">
              {{ tag }}
            </el-tag>
          </div>
        </div>
        <el-divider />
        <div class="preview-content" v-html="formatContent(previewContent.content)"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type UploadProps } from 'element-plus'
import {
  Search,
  Plus,
  Edit,
  Delete,
  Check,
  View,
  Box,
  Download,
  ArrowDown,
  CopyDocument
} from '@element-plus/icons-vue'

interface Content {
  id: number
  title: string
  content: string
  summary: string
  category: string
  tags: string[]
  author: string
  status: string
  cover: string
  viewCount: number
  likeCount: number
  sort: number
  createdAt: string
  updatedAt: string
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const previewDialogVisible = ref(false)
const isEdit = ref(false)
const selectedContents = ref<Content[]>([])
const previewContent = ref<Content | null>(null)
const contentFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  category: '',
  status: '',
  dateRange: []
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 可用标签
const availableTags = ref([
  'Vue', 'React', 'JavaScript', 'TypeScript', 'Node.js',
  'Python', 'Java', 'Go', 'Rust', 'Docker',
  '前端', '后端', '全栈', '架构', '设计模式',
  '算法', '数据结构', '数据库', '缓存', '消息队列'
])

// 内容列表
const contentList = ref<Content[]>([
  {
    id: 1,
    title: 'Vue 3 Composition API 深度解析',
    content: '# Vue 3 Composition API 深度解析\n\nVue 3 引入了 Composition API，这是一个全新的 API 设计...',
    summary: '深入了解 Vue 3 Composition API 的设计理念和使用方法',
    category: 'tech',
    tags: ['Vue', '前端', 'JavaScript'],
    author: 'admin',
    status: 'published',
    cover: '',
    viewCount: 1250,
    likeCount: 89,
    sort: 1,
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-15 14:20:00'
  },
  {
    id: 2,
    title: '微服务架构设计思考',
    content: '# 微服务架构设计思考\n\n在现代软件开发中，微服务架构已经成为...',
    summary: '分享微服务架构设计的经验和思考',
    category: 'project',
    tags: ['架构', '微服务', '后端'],
    author: 'admin',
    status: 'published',
    cover: '',
    viewCount: 890,
    likeCount: 67,
    sort: 2,
    createdAt: '2024-01-14 16:20:00',
    updatedAt: '2024-01-14 18:30:00'
  },
  {
    id: 3,
    title: 'TypeScript 学习笔记',
    content: '# TypeScript 学习笔记\n\nTypeScript 是 JavaScript 的超集...',
    summary: 'TypeScript 基础知识和进阶技巧',
    category: 'note',
    tags: ['TypeScript', '前端', '学习'],
    author: 'editor',
    status: 'draft',
    cover: '',
    viewCount: 0,
    likeCount: 0,
    sort: 3,
    createdAt: '2024-01-13 09:15:00',
    updatedAt: '2024-01-13 11:45:00'
  }
])

// 内容表单
const contentForm = reactive({
  id: 0,
  title: '',
  content: '',
  summary: '',
  category: '',
  tags: [],
  status: 'draft',
  cover: '',
  sort: 0
})

// 表单验证规则
const contentFormRules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑内容' : '新建内容')

// 获取分类类型
const getCategoryType = (category: string) => {
  const types: Record<string, string> = {
    tech: 'primary',
    note: 'success',
    project: 'warning',
    thinking: 'info'
  }
  return types[category] || 'info'
}

// 获取分类文本
const getCategoryText = (category: string) => {
  const texts: Record<string, string> = {
    tech: '技术文档',
    note: '学习笔记',
    project: '项目总结',
    thinking: '思考感悟'
  }
  return texts[category] || category
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    published: 'success',
    draft: 'warning',
    archived: 'info'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    archived: '已归档'
  }
  return texts[status] || status
}

// 格式化内容
const formatContent = (content: string) => {
  // 简单的 Markdown 转 HTML
  return content
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadContentList()
}

// 添加内容
const handleAdd = () => {
  isEdit.value = false
  resetContentForm()
  dialogVisible.value = true
}

// 编辑内容
const handleEdit = (row: Content) => {
  isEdit.value = true
  Object.assign(contentForm, row)
  dialogVisible.value = true
}

// 预览内容
const handlePreview = (row: Content) => {
  previewContent.value = row
  previewDialogVisible.value = true
}

// 操作处理
const handleAction = async (command: string, row: Content) => {
  switch (command) {
    case 'publish':
      await handlePublish(row)
      break
    case 'archive':
      await handleArchive(row)
      break
    case 'copy':
      await handleCopy(row)
      break
    case 'delete':
      await handleDelete(row)
      break
  }
}

// 发布内容
const handlePublish = async (row: Content) => {
  try {
    await ElMessageBox.confirm(
      `确定要发布内容 "${row.title}" 吗？`,
      '确认发布',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    row.status = 'published'
    row.updatedAt = new Date().toLocaleString()
    
    ElMessage({
      message: '发布成功',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 归档内容
const handleArchive = async (row: Content) => {
  try {
    await ElMessageBox.confirm(
      `确定要归档内容 "${row.title}" 吗？`,
      '确认归档',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    row.status = 'archived'
    row.updatedAt = new Date().toLocaleString()
    
    ElMessage({
      message: '归档成功',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 复制内容
const handleCopy = async (row: Content) => {
  const newContent = {
    ...row,
    id: Date.now(),
    title: `${row.title} - 副本`,
    status: 'draft',
    viewCount: 0,
    likeCount: 0,
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString()
  }
  
  contentList.value.unshift(newContent)
  
  ElMessage({
    message: '复制成功',
    type: 'success'
  })
}

// 删除内容
const handleDelete = async (row: Content) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除内容 "${row.title}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const index = contentList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      contentList.value.splice(index, 1)
    }
    
    ElMessage({
      message: '删除成功',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 选择变化
const handleSelectionChange = (selection: Content[]) => {
  selectedContents.value = selection
}

// 批量发布
const handleBatchPublish = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要发布选中的 ${selectedContents.value.length} 个内容吗？`,
      '确认发布',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    selectedContents.value.forEach(content => {
      content.status = 'published'
      content.updatedAt = new Date().toLocaleString()
    })
    
    ElMessage({
      message: '批量发布成功',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 批量归档
const handleBatchArchive = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要归档选中的 ${selectedContents.value.length} 个内容吗？`,
      '确认归档',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    selectedContents.value.forEach(content => {
      content.status = 'archived'
      content.updatedAt = new Date().toLocaleString()
    })
    
    ElMessage({
      message: '批量归档成功',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedContents.value.length} 个内容吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const selectedIds = selectedContents.value.map(content => content.id)
    contentList.value = contentList.value.filter(content => !selectedIds.includes(content.id))
    
    ElMessage({
      message: '批量删除成功',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 导出数据
const handleExport = () => {
  const data = contentList.value.map(item => ({
    标题: item.title,
    分类: getCategoryText(item.category),
    作者: item.author,
    状态: getStatusText(item.status),
    浏览量: item.viewCount,
    点赞数: item.likeCount,
    创建时间: item.createdAt,
    更新时间: item.updatedAt
  }))
  
  const csv = [Object.keys(data[0]).join(',')]
    .concat(data.map(row => Object.values(row).join(',')))
    .join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `content-export-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  
  ElMessage({
    message: '导出成功',
    type: 'success'
  })
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  loadContentList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadContentList()
}

// 封面上传前验证
const beforeCoverUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('封面只能是 JPG/PNG 格式!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('封面大小不能超过 2MB!')
    return false
  }
  return true
}

// 封面上传
const handleCoverUpload = (options: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    contentForm.cover = e.target?.result as string
  }
  reader.readAsDataURL(options.file)
}

// 保存草稿
const handleSaveDraft = async () => {
  contentForm.status = 'draft'
  await handleSubmit()
}

// 提交表单
const handleSubmit = async () => {
  if (!contentFormRef.value) return
  
  try {
    await contentFormRef.value.validate()
    
    submitting.value = true
    
    // 这里应该调用API保存内容
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEdit.value) {
      // 更新内容
      const index = contentList.value.findIndex(item => item.id === contentForm.id)
      if (index > -1) {
        Object.assign(contentList.value[index], {
          ...contentForm,
          updatedAt: new Date().toLocaleString()
        })
      }
      ElMessage({
        message: '更新成功',
        type: 'success'
      })
    } else {
      // 添加内容
      const newContent = {
        ...contentForm,
        id: Date.now(),
        author: 'admin',
        viewCount: 0,
        likeCount: 0,
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString()
      }
      contentList.value.unshift(newContent)
      ElMessage({
        message: contentForm.status === 'published' ? '发布成功' : '保存成功',
        type: 'success'
      })
    }
    
    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  resetContentForm()
  contentFormRef.value?.clearValidate()
}

// 预览对话框关闭
const handlePreviewClose = () => {
  previewContent.value = null
}

// 重置内容表单
const resetContentForm = () => {
  Object.assign(contentForm, {
    id: 0,
    title: '',
    content: '',
    summary: '',
    category: '',
    tags: [],
    status: 'draft',
    cover: '',
    sort: 0
  })
}

// 加载内容列表
const loadContentList = async () => {
  loading.value = true
  try {
    // 这里应该调用API加载内容列表
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = contentList.value.length
  } catch (error) {
    console.error('加载内容列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadContentList()
})
</script>

<style lang="scss" scoped>
.content-management {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: calc(100vh - 84px);
}

.page-header {
  margin-bottom: 20px;
  
  h2 {
    color: #303133;
    margin-bottom: 8px;
  }
  
  p {
    color: #606266;
    margin: 0;
  }
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  .pagination-wrapper {
    margin-top: 20px;
    text-align: right;
  }
}

.content-title {
  .content-meta {
    margin-top: 5px;
    
    .tag-item {
      margin-right: 5px;
    }
  }
}

.cover-uploader {
  .cover {
    width: 100px;
    height: 60px;
    border-radius: 6px;
    display: block;
    object-fit: cover;
  }
  
  .cover-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 60px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    &:hover {
      border-color: #409eff;
    }
  }
}

.content-preview {
  .preview-header {
    h1 {
      margin: 0 0 15px 0;
      color: #303133;
    }
    
    .preview-meta {
      margin-bottom: 10px;
      color: #606266;
      font-size: 14px;
      
      span {
        margin-right: 20px;
      }
    }
    
    .preview-tags {
      .tag-item {
        margin-right: 8px;
      }
    }
  }
  
  .preview-content {
    line-height: 1.8;
    color: #303133;
    
    :deep(h1), :deep(h2), :deep(h3) {
      margin: 20px 0 10px 0;
      color: #303133;
    }
    
    :deep(p) {
      margin: 10px 0;
    }
  }
}

@media (max-width: 768px) {
  .content-management {
    padding: 10px;
  }
  
  .el-table {
    font-size: 12px;
  }
  
  .pagination-wrapper {
    text-align: center;
  }
}
</style>