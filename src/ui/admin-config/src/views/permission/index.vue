<template>
  <div class="permission-management">
    <div class="page-header">
      <h2>权限管理</h2>
      <p>管理系统权限和访问控制</p>
    </div>

    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索权限名称或代码"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="searchForm.type" placeholder="权限类型" clearable>
            <el-option label="全部" value="" />
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
            <el-option label="接口" value="api" />
          </el-select>
        </el-col>
        <el-col :xs="24" :sm="12" :md="4">
          <el-select v-model="searchForm.status" placeholder="状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
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
            新建权限
          </el-button>
          <el-button type="success" @click="handleBatchEnable" :disabled="!selectedPermissions.length">
            <el-icon><Check /></el-icon>
            批量启用
          </el-button>
          <el-button type="warning" @click="handleBatchDisable" :disabled="!selectedPermissions.length">
            <el-icon><Close /></el-icon>
            批量禁用
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedPermissions.length">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
          <el-button type="info" @click="handleRefresh">
            <el-icon><Refresh /></el-icon>
            刷新缓存
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 权限树表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="permissionList"
        @selection-change="handleSelectionChange"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="name" label="权限名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="permission-name">
              <el-icon v-if="row.type === 'menu'" class="permission-icon"><Menu /></el-icon>
              <el-icon v-else-if="row.type === 'button'" class="permission-icon"><Operation /></el-icon>
              <el-icon v-else class="permission-icon"><Link /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="code" label="权限代码" width="200" show-overflow-tooltip />
        
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ getTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="path" label="路径/接口" width="200" show-overflow-tooltip />
        
        <el-table-column prop="method" label="请求方法" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.method" :type="getMethodColor(row.method)" size="small">
              {{ row.method }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        
        <el-table-column prop="updatedAt" label="更新时间" width="160" />
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="success" size="small" @click="handleAddChild(row)" v-if="row.type === 'menu'">
              <el-icon><Plus /></el-icon>
              添加子权限
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑权限对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="permissionFormRef"
        :model="permissionForm"
        :rules="permissionFormRules"
        label-width="100px"
      >
        <el-form-item label="上级权限">
          <el-tree-select
            v-model="permissionForm.parentId"
            :data="permissionTreeData"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            placeholder="请选择上级权限（可选）"
            clearable
            check-strictly
          />
        </el-form-item>
        
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        
        <el-form-item label="权限代码" prop="code">
          <el-input v-model="permissionForm.code" placeholder="请输入权限代码，如：user:list" />
        </el-form-item>
        
        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="permissionForm.type">
            <el-radio label="menu">菜单</el-radio>
            <el-radio label="button">按钮</el-radio>
            <el-radio label="api">接口</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="路径/接口" v-if="permissionForm.type !== 'button'">
          <el-input
            v-model="permissionForm.path"
            :placeholder="permissionForm.type === 'menu' ? '请输入菜单路径，如：/user' : '请输入接口路径，如：/api/user'"
          />
        </el-form-item>
        
        <el-form-item label="请求方法" v-if="permissionForm.type === 'api'">
          <el-select v-model="permissionForm.method" placeholder="请选择请求方法">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="图标" v-if="permissionForm.type === 'menu'">
          <el-input v-model="permissionForm.icon" placeholder="请输入图标名称" />
        </el-form-item>
        
        <el-form-item label="排序">
          <el-input-number
            v-model="permissionForm.sort"
            :min="0"
            :max="999"
            controls-position="right"
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-radio-group v-model="permissionForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input
            v-model="permissionForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入权限描述"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 权限分配对话框 -->
    <el-dialog
      v-model="assignDialogVisible"
      title="权限分配"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="角色权限" name="role">
          <div class="assign-content">
            <div class="assign-left">
              <h4>角色列表</h4>
              <el-tree
                ref="roleTreeRef"
                :data="roleList"
                :props="{ label: 'name', children: 'children' }"
                node-key="id"
                show-checkbox
                :default-checked-keys="selectedRoleIds"
                @check="handleRoleCheck"
              />
            </div>
            <div class="assign-right">
              <h4>权限列表</h4>
              <el-tree
                ref="permissionTreeRef"
                :data="permissionTreeData"
                :props="{ label: 'name', children: 'children' }"
                node-key="id"
                show-checkbox
                :default-checked-keys="selectedPermissionIds"
                @check="handlePermissionCheck"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="用户权限" name="user">
          <div class="assign-content">
            <div class="assign-left">
              <h4>用户列表</h4>
              <el-input
                v-model="userSearchKeyword"
                placeholder="搜索用户"
                style="margin-bottom: 10px;"
              />
              <el-table
                :data="filteredUserList"
                @selection-change="handleUserSelectionChange"
                max-height="400"
              >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="username" label="用户名" />
                <el-table-column prop="name" label="姓名" />
              </el-table>
            </div>
            <div class="assign-right">
              <h4>权限列表</h4>
              <el-tree
                ref="userPermissionTreeRef"
                :data="permissionTreeData"
                :props="{ label: 'name', children: 'children' }"
                node-key="id"
                show-checkbox
                :default-checked-keys="selectedUserPermissionIds"
                @check="handleUserPermissionCheck"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAssignSubmit" :loading="assignSubmitting">
            保存分配
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  Search,
  Plus,
  Edit,
  Delete,
  Check,
  Close,
  Refresh,
  Menu,
  Operation,
  Link
} from '@element-plus/icons-vue'

interface Permission {
  id: number
  parentId: number | null
  name: string
  code: string
  type: string
  path: string
  method: string
  icon: string
  sort: number
  status: string
  description: string
  createdAt: string
  updatedAt: string
  children?: Permission[]
}

interface Role {
  id: number
  name: string
  children?: Role[]
}

interface User {
  id: number
  username: string
  name: string
}

const loading = ref(false)
const submitting = ref(false)
const assignSubmitting = ref(false)
const dialogVisible = ref(false)
const assignDialogVisible = ref(false)
const isEdit = ref(false)
const selectedPermissions = ref<Permission[]>([])
const permissionFormRef = ref<FormInstance>()
const roleTreeRef = ref()
const permissionTreeRef = ref()
const userPermissionTreeRef = ref()
const activeTab = ref('role')
const userSearchKeyword = ref('')

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  status: ''
})

// 权限列表
const permissionList = ref<Permission[]>([
  {
    id: 1,
    parentId: null,
    name: '系统管理',
    code: 'system',
    type: 'menu',
    path: '/system',
    method: '',
    icon: 'Setting',
    sort: 1,
    status: 'enabled',
    description: '系统管理模块',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-15 14:20:00',
    children: [
      {
        id: 2,
        parentId: 1,
        name: '用户管理',
        code: 'system:user',
        type: 'menu',
        path: '/system/user',
        method: '',
        icon: 'User',
        sort: 1,
        status: 'enabled',
        description: '用户管理页面',
        createdAt: '2024-01-15 10:30:00',
        updatedAt: '2024-01-15 14:20:00',
        children: [
          {
            id: 3,
            parentId: 2,
            name: '查看用户',
            code: 'system:user:list',
            type: 'api',
            path: '/api/user',
            method: 'GET',
            icon: '',
            sort: 1,
            status: 'enabled',
            description: '查看用户列表',
            createdAt: '2024-01-15 10:30:00',
            updatedAt: '2024-01-15 14:20:00'
          },
          {
            id: 4,
            parentId: 2,
            name: '添加用户',
            code: 'system:user:add',
            type: 'button',
            path: '',
            method: '',
            icon: '',
            sort: 2,
            status: 'enabled',
            description: '添加用户按钮',
            createdAt: '2024-01-15 10:30:00',
            updatedAt: '2024-01-15 14:20:00'
          }
        ]
      },
      {
        id: 5,
        parentId: 1,
        name: '角色管理',
        code: 'system:role',
        type: 'menu',
        path: '/system/role',
        method: '',
        icon: 'UserFilled',
        sort: 2,
        status: 'enabled',
        description: '角色管理页面',
        createdAt: '2024-01-15 10:30:00',
        updatedAt: '2024-01-15 14:20:00'
      }
    ]
  },
  {
    id: 6,
    parentId: null,
    name: '内容管理',
    code: 'content',
    type: 'menu',
    path: '/content',
    method: '',
    icon: 'Document',
    sort: 2,
    status: 'enabled',
    description: '内容管理模块',
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-15 14:20:00'
  }
])

// 角色列表
const roleList = ref<Role[]>([
  { id: 1, name: '超级管理员' },
  { id: 2, name: '管理员' },
  { id: 3, name: '编辑员' },
  { id: 4, name: '普通用户' }
])

// 用户列表
const userList = ref<User[]>([
  { id: 1, username: 'admin', name: '管理员' },
  { id: 2, username: 'editor', name: '编辑员' },
  { id: 3, username: 'user1', name: '用户1' },
  { id: 4, username: 'user2', name: '用户2' }
])

// 选中的角色ID
const selectedRoleIds = ref<number[]>([1, 2])
// 选中的权限ID
const selectedPermissionIds = ref<number[]>([1, 2, 3])
// 选中的用户
const selectedUsers = ref<User[]>([])
// 选中的用户权限ID
const selectedUserPermissionIds = ref<number[]>([])

// 权限表单
const permissionForm = reactive<{
  id: number
  parentId: number | null
  name: string
  code: string
  type: string
  path: string
  method: string
  icon: string
  sort: number
  status: string
  description: string
}>({
  id: 0,
  parentId: null,
  name: '',
  code: '',
  type: 'menu',
  path: '',
  method: '',
  icon: '',
  sort: 0,
  status: 'enabled',
  description: ''
})

// 表单验证规则
const permissionFormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '权限名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限代码', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9:_-]*$/, message: '权限代码格式不正确', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ]
}

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑权限' : '新建权限')

const permissionTreeData = computed(() => {
  return buildTree(permissionList.value.filter(p => p.status === 'enabled'))
})

const filteredUserList = computed(() => {
  if (!userSearchKeyword.value) return userList.value
  return userList.value.filter(user => 
    user.username.includes(userSearchKeyword.value) || 
    user.name.includes(userSearchKeyword.value)
  )
})

// 构建树形结构
const buildTree = (list: Permission[], parentId: number | null = null): Permission[] => {
  return list
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: buildTree(list, item.id)
    }))
}

// 获取类型颜色
const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    menu: 'primary',
    button: 'success',
    api: 'warning'
  }
  return colors[type] || 'info'
}

// 获取类型文本
const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    menu: '菜单',
    button: '按钮',
    api: '接口'
  }
  return texts[type] || type
}

// 获取请求方法颜色
const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: 'success',
    POST: 'primary',
    PUT: 'warning',
    DELETE: 'danger',
    PATCH: 'info'
  }
  return colors[method] || 'info'
}

// 搜索
const handleSearch = () => {
  loadPermissionList()
}

// 添加权限
const handleAdd = () => {
  isEdit.value = false
  resetPermissionForm()
  dialogVisible.value = true
}

// 添加子权限
const handleAddChild = (row: Permission) => {
  isEdit.value = false
  resetPermissionForm()
  permissionForm.parentId = row.id
  dialogVisible.value = true
}

// 编辑权限
const handleEdit = (row: Permission) => {
  isEdit.value = true
  Object.assign(permissionForm, row)
  dialogVisible.value = true
}

// 删除权限
const handleDelete = async (row: Permission) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除权限 "${row.name}" 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 递归删除权限及其子权限
    const deletePermission = (list: Permission[], id: number) => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          list.splice(i, 1)
          return true
        }
        if (list[i].children && deletePermission(list[i].children!, id)) {
          return true
        }
      }
      return false
    }
    
    deletePermission(permissionList.value, row.id)
    
    ElMessage({
      message: '删除成功',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 状态变化
const handleStatusChange = async (row: Permission) => {
  try {
    // 这里应该调用API更新状态
    await new Promise(resolve => setTimeout(resolve, 500))
    
    row.updatedAt = new Date().toLocaleString()
    
    ElMessage({
      message: `${row.status === 'enabled' ? '启用' : '禁用'}成功`,
      type: 'success'
    })
  } catch (error) {
    // 恢复原状态
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage({
      message: '操作失败',
      type: 'error'
    })
  }
}

// 选择变化
const handleSelectionChange = (selection: Permission[]) => {
  selectedPermissions.value = selection
}

// 批量启用
const handleBatchEnable = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要启用选中的 ${selectedPermissions.value.length} 个权限吗？`,
      '确认启用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    selectedPermissions.value.forEach(permission => {
      permission.status = 'enabled'
      permission.updatedAt = new Date().toLocaleString()
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
      `确定要禁用选中的 ${selectedPermissions.value.length} 个权限吗？`,
      '确认禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    selectedPermissions.value.forEach(permission => {
      permission.status = 'disabled'
      permission.updatedAt = new Date().toLocaleString()
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
      `确定要删除选中的 ${selectedPermissions.value.length} 个权限吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const selectedIds = selectedPermissions.value.map(permission => permission.id)
    
    // 递归删除权限
    const deletePermissions = (list: Permission[]) => {
      for (let i = list.length - 1; i >= 0; i--) {
        if (selectedIds.includes(list[i].id)) {
          list.splice(i, 1)
        } else if (list[i].children) {
          deletePermissions(list[i].children!)
        }
      }
    }
    
    deletePermissions(permissionList.value)
    
    ElMessage({
      message: '批量删除成功',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 刷新缓存
const handleRefresh = async () => {
  try {
    loading.value = true
    // 这里应该调用API刷新权限缓存
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage({
      message: '权限缓存刷新成功',
      type: 'success'
    })
  } catch (error) {
    ElMessage({
      message: '刷新失败',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 角色选择变化
const handleRoleCheck = (data: any, checked: any) => {
  selectedRoleIds.value = checked.checkedKeys
}

// 权限选择变化
const handlePermissionCheck = (data: any, checked: any) => {
  selectedPermissionIds.value = checked.checkedKeys
}

// 用户选择变化
const handleUserSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

// 用户权限选择变化
const handleUserPermissionCheck = (data: any, checked: any) => {
  selectedUserPermissionIds.value = checked.checkedKeys
}

// 提交分配
const handleAssignSubmit = async () => {
  try {
    assignSubmitting.value = true
    
    // 这里应该调用API保存权限分配
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage({
      message: '权限分配成功',
      type: 'success'
    })
    
    assignDialogVisible.value = false
  } catch (error) {
    ElMessage({
      message: '分配失败',
      type: 'error'
    })
  } finally {
    assignSubmitting.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!permissionFormRef.value) return
  
  try {
    await permissionFormRef.value.validate()
    
    submitting.value = true
    
    // 这里应该调用API保存权限
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEdit.value) {
      // 更新权限
      const updatePermission = (list: Permission[]) => {
        for (const item of list) {
          if (item.id === permissionForm.id) {
            Object.assign(item, {
              ...permissionForm,
              updatedAt: new Date().toLocaleString()
            })
            return true
          }
          if (item.children && updatePermission(item.children)) {
            return true
          }
        }
        return false
      }
      
      updatePermission(permissionList.value)
      
      ElMessage({
        message: '更新成功',
        type: 'success'
      })
    } else {
      // 添加权限
      const newPermission = {
        ...permissionForm,
        id: Date.now(),
        createdAt: new Date().toLocaleString(),
        updatedAt: new Date().toLocaleString()
      }
      
      if (permissionForm.parentId) {
        // 添加到父权限的children中
        const addToParent = (list: Permission[]) => {
          for (const item of list) {
            if (item.id === permissionForm.parentId) {
              if (!item.children) item.children = []
              item.children.push(newPermission)
              return true
            }
            if (item.children && addToParent(item.children)) {
              return true
            }
          }
          return false
        }
        
        addToParent(permissionList.value)
      } else {
        // 添加到根级
        permissionList.value.push(newPermission)
      }
      
      ElMessage({
        message: '创建成功',
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
  resetPermissionForm()
  permissionFormRef.value?.clearValidate()
}

// 重置权限表单
const resetPermissionForm = () => {
  Object.assign(permissionForm, {
    id: 0,
    parentId: null,
    name: '',
    code: '',
    type: 'menu',
    path: '',
    method: '',
    icon: '',
    sort: 0,
    status: 'enabled',
    description: ''
  })
}

// 加载权限列表
const loadPermissionList = async () => {
  loading.value = true
  try {
    // 这里应该调用API加载权限列表
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    console.error('加载权限列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPermissionList()
})
</script>

<style lang="scss" scoped>
.permission-management {
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
  .permission-name {
    display: flex;
    align-items: center;
    
    .permission-icon {
      margin-right: 8px;
      color: #409eff;
    }
  }
}

.assign-content {
  display: flex;
  gap: 20px;
  height: 500px;
  
  .assign-left,
  .assign-right {
    flex: 1;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    padding: 15px;
    
    h4 {
      margin: 0 0 15px 0;
      color: #303133;
      font-size: 14px;
      font-weight: 600;
    }
  }
  
  .assign-left {
    overflow-y: auto;
  }
  
  .assign-right {
    overflow-y: auto;
  }
}

@media (max-width: 768px) {
  .permission-management {
    padding: 10px;
  }
  
  .el-table {
    font-size: 12px;
  }
  
  .assign-content {
    flex-direction: column;
    height: auto;
    
    .assign-left,
    .assign-right {
      height: 300px;
    }
  }
}
</style>