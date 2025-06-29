<template>
  <div class="user-management">
    <div class="page-header">
      <h2>用户管理</h2>
      <p>管理系统用户信息和权限</p>
    </div>

    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名、邮箱或手机号"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-select v-model="searchForm.status" placeholder="用户状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
            <el-option label="待激活" value="pending" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-select v-model="searchForm.role" placeholder="用户角色" clearable>
            <el-option label="全部" value="" />
            <el-option label="管理员" value="admin" />
            <el-option label="编辑者" value="editor" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
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
            添加用户
          </el-button>
          <el-button type="success" @click="handleBatchEnable" :disabled="!selectedUsers.length">
            <el-icon><Check /></el-icon>
            批量启用
          </el-button>
          <el-button type="warning" @click="handleBatchDisable" :disabled="!selectedUsers.length">
            <el-icon><Close /></el-icon>
            批量禁用
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedUsers.length">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="userList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" :size="40">
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        
        <el-table-column prop="username" label="用户名" min-width="120" />
        
        <el-table-column prop="email" label="邮箱" min-width="180" />
        
        <el-table-column prop="phone" label="手机号" min-width="120" />
        
        <el-table-column prop="roles" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleType(row.roles)">{{ getRoleText(row.roles) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="lastLogin" label="最后登录" width="160" />
        
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              :type="row.status === 'active' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              <el-icon v-if="row.status === 'active'"><Close /></el-icon>
              <el-icon v-else><Check /></el-icon>
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
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

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
      >
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :http-request="handleAvatarUpload"
          >
            <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
          <el-input
            v-model="userForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="角色" prop="roles">
          <el-select v-model="userForm.roles" placeholder="请选择角色" multiple>
            <el-option label="管理员" value="admin" />
            <el-option label="编辑者" value="editor" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">正常</el-radio>
            <el-radio label="disabled">禁用</el-radio>
            <el-radio label="pending">待激活</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="userForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
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
  Close,
  User
} from '@element-plus/icons-vue'

interface User {
  id: number
  username: string
  email: string
  phone: string
  avatar: string
  roles: string[]
  status: string
  lastLogin: string
  createdAt: string
  remark?: string
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const selectedUsers = ref<User[]>([])
const userFormRef = ref<FormInstance>()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: '',
  role: '' // 保留单个角色搜索，因为搜索通常是按单个角色筛选
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 用户列表
const userList = ref<User[]>([
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar: '',
    roles: ['admin'],
    status: 'active',
    lastLogin: '2024-01-15 10:30:00',
    createdAt: '2024-01-01 09:00:00'
  },
  {
    id: 2,
    username: 'editor',
    email: 'editor@example.com',
    phone: '13800138001',
    avatar: '',
    roles: ['editor'],
    status: 'active',
    lastLogin: '2024-01-14 16:20:00',
    createdAt: '2024-01-02 10:00:00'
  },
  {
    id: 3,
    username: 'viewer',
    email: 'viewer@example.com',
    phone: '13800138002',
    avatar: '',
    roles: ['viewer'],
    status: 'disabled',
    lastLogin: '2024-01-10 14:15:00',
    createdAt: '2024-01-03 11:00:00'
  }
])

// 用户表单
const userForm = reactive({
  id: 0,
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  avatar: '',
  roles: [] as string[],
  status: 'active',
  remark: ''
})

// 表单验证规则
const userFormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value !== userForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  roles: [
    { required: true, message: '请选择角色', trigger: 'change' },
    { type: 'array', min: 1, message: '至少选择一个角色', trigger: 'change' }
  ]
}

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑用户' : '添加用户')

// 获取角色类型
const getRoleType = (roles: string[]) => {
  if (!roles || roles.length === 0) return 'info';
  const primaryRole = roles[0];
  const types: Record<string, string> = {
    admin: 'danger',
    editor: 'warning',
    viewer: 'info'
  }
  return types[primaryRole] || 'info'
}

// 获取角色文本
const getRoleText = (roles: string[]) => {
  if (!roles || roles.length === 0) return '无角色';
  
  const texts: Record<string, string> = {
    admin: '管理员',
    editor: '编辑者',
    viewer: '查看者'
  }
  
  return roles.map(role => texts[role] || role).join(', ')
}

// 获取状态类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    disabled: 'danger',
    pending: 'warning'
  }
  return types[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '正常',
    disabled: '禁用',
    pending: '待激活'
  }
  return texts[status] || status
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadUserList()
}

// 添加用户
const handleAdd = () => {
  isEdit.value = false
  resetUserForm()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row: User) => {
  isEdit.value = true
  Object.assign(userForm, row)
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.username}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API删除用户
    const index = userList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      userList.value.splice(index, 1)
    }
    
    ElMessage({
      message: '删除成功',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 切换用户状态
const handleToggleStatus = async (row: User) => {
  const newStatus = row.status === 'active' ? 'disabled' : 'active'
  const action = newStatus === 'active' ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${row.username}" 吗？`,
      `确认${action}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API更新用户状态
    row.status = newStatus
    
    ElMessage({
      message: `${action}成功`,
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 选择变化
const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

// 批量启用
const handleBatchEnable = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要启用选中的 ${selectedUsers.value.length} 个用户吗？`,
      '确认启用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API批量启用用户
    selectedUsers.value.forEach(user => {
      user.status = 'active'
    })
    
    ElMessage({
      message: '批量启用成功',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 批量禁用
const handleBatchDisable = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要禁用选中的 ${selectedUsers.value.length} 个用户吗？`,
      '确认禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API批量禁用用户
    selectedUsers.value.forEach(user => {
      user.status = 'disabled'
    })
    
    ElMessage({
      message: '批量禁用成功',
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
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API批量删除用户
    const selectedIds = selectedUsers.value.map(user => user.id)
    userList.value = userList.value.filter(user => !selectedIds.includes(user.id))
    
    ElMessage({
      message: '批量删除成功',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.size = size
  loadUserList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadUserList()
}

// 头像上传前验证
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 头像上传
const handleAvatarUpload = (options: any) => {
  // 这里应该调用API上传头像
  const reader = new FileReader()
  reader.onload = (e) => {
    userForm.avatar = e.target?.result as string
  }
  reader.readAsDataURL(options.file)
}

// 提交表单
const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  try {
    await userFormRef.value.validate()
    
    submitting.value = true
    
    // 这里应该调用API保存用户
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEdit.value) {
      // 更新用户
      const index = userList.value.findIndex(item => item.id === userForm.id)
      if (index > -1) {
        Object.assign(userList.value[index], userForm)
      }
      ElMessage({
        message: '更新成功',
        type: 'success'
      })
    } else {
      // 添加用户
      const newUser = {
        ...userForm,
        id: Date.now(),
        lastLogin: '-',
        createdAt: new Date().toLocaleString()
      }
      userList.value.unshift(newUser)
      ElMessage({
        message: '添加成功',
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
  resetUserForm()
  userFormRef.value?.clearValidate()
}

// 重置用户表单
const resetUserForm = () => {
  Object.assign(userForm, {
    id: 0,
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    avatar: '',
    roles: [],
    status: 'active',
    remark: ''
  })
}

// 加载用户列表
const loadUserList = async () => {
  loading.value = true
  try {
    // 这里应该调用API加载用户列表
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = userList.value.length
  } catch (error) {
    console.error('加载用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserList()
})
</script>

<style lang="scss" scoped>
.user-management {
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

.avatar-uploader {
  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 6px;
    display: block;
  }
  
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 80px;
    height: 80px;
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

@media (max-width: 768px) {
  .user-management {
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