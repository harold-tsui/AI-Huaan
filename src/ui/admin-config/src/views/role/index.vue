<template>
  <div class="role-management">
    <div class="page-header">
      <h2>角色管理</h2>
      <p>管理系统角色和权限配置</p>
    </div>

    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索角色名称或描述"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-select v-model="searchForm.status" placeholder="角色状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
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
            添加角色
          </el-button>
          <el-button type="success" @click="handleBatchEnable" :disabled="!selectedRoles.length">
            <el-icon><Check /></el-icon>
            批量启用
          </el-button>
          <el-button type="warning" @click="handleBatchDisable" :disabled="!selectedRoles.length">
            <el-icon><Close /></el-icon>
            批量禁用
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedRoles.length">
            <el-icon><Delete /></el-icon>
            批量删除
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 角色列表 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="roleList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="name" label="角色名称" min-width="120" />
        
        <el-table-column prop="code" label="角色代码" min-width="120" />
        
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        
        <el-table-column prop="userCount" label="用户数量" width="100" align="center" />
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button type="info" size="small" @click="handlePermission(row)">
              <el-icon><Key /></el-icon>
              权限
            </el-button>
            <el-button
              :type="row.status === 'enabled' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              <el-icon v-if="row.status === 'enabled'"><Close /></el-icon>
              <el-icon v-else><Check /></el-icon>
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)" :disabled="row.isSystem">
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

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        
        <el-form-item label="角色代码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色代码" :disabled="isEdit" />
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="排序">
          <el-input-number
            v-model="roleForm.sort"
            :min="0"
            :max="999"
            controls-position="right"
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

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="permissionDialogVisible"
      title="权限配置"
      width="800px"
      @close="handlePermissionDialogClose"
    >
      <div class="permission-config">
        <div class="role-info">
          <h4>{{ currentRole?.name }}</h4>
          <p>{{ currentRole?.description }}</p>
        </div>
        
        <el-divider />
        
        <div class="permission-tree">
          <el-tree
            ref="permissionTreeRef"
            :data="permissionTree"
            :props="treeProps"
            show-checkbox
            node-key="id"
            :default-checked-keys="checkedPermissions"
            @check="handlePermissionCheck"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <el-icon v-if="data.icon" class="node-icon">
                  <component :is="data.icon" />
                </el-icon>
                <span>{{ data.label }}</span>
                <el-tag v-if="data.type" size="small" class="node-tag">
                  {{ data.type }}
                </el-tag>
              </span>
            </template>
          </el-tree>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="permissionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePermission" :loading="savingPermission">
            保存权限
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type TreeInstance } from 'element-plus'
import {
  Search,
  Plus,
  Edit,
  Delete,
  Check,
  Close,
  Key,
  User,
  Setting,
  Document,
  DataAnalysis,
  Monitor
} from '@element-plus/icons-vue'

interface Role {
  id: number
  name: string
  code: string
  description: string
  userCount: number
  status: string
  isSystem: boolean
  sort: number
  createdAt: string
  permissions?: number[]
}

interface Permission {
  id: number
  label: string
  icon?: string
  type?: string
  children?: Permission[]
}

const loading = ref(false)
const submitting = ref(false)
const savingPermission = ref(false)
const dialogVisible = ref(false)
const permissionDialogVisible = ref(false)
const isEdit = ref(false)
const selectedRoles = ref<Role[]>([])
const currentRole = ref<Role | null>(null)
const checkedPermissions = ref<number[]>([])
const roleFormRef = ref<FormInstance>()
const permissionTreeRef = ref<TreeInstance>()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  status: ''
})

// 分页
const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 角色列表
const roleList = ref<Role[]>([
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有系统所有权限',
    userCount: 1,
    status: 'enabled',
    isSystem: true,
    sort: 1,
    createdAt: '2024-01-01 09:00:00',
    permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  },
  {
    id: 2,
    name: '管理员',
    code: 'admin',
    description: '拥有大部分管理权限',
    userCount: 3,
    status: 'enabled',
    isSystem: false,
    sort: 2,
    createdAt: '2024-01-02 10:00:00',
    permissions: [1, 2, 3, 4, 5, 6]
  },
  {
    id: 3,
    name: '编辑者',
    code: 'editor',
    description: '拥有内容编辑权限',
    userCount: 5,
    status: 'enabled',
    isSystem: false,
    sort: 3,
    createdAt: '2024-01-03 11:00:00',
    permissions: [1, 2, 3]
  },
  {
    id: 4,
    name: '查看者',
    code: 'viewer',
    description: '只有查看权限',
    userCount: 10,
    status: 'enabled',
    isSystem: false,
    sort: 4,
    createdAt: '2024-01-04 12:00:00',
    permissions: [1]
  }
])

// 权限树
const permissionTree = ref<Permission[]>([
  {
    id: 1,
    label: '仪表盘',
    icon: 'Monitor',
    type: '页面',
    children: [
      { id: 11, label: '查看仪表盘', type: '操作' }
    ]
  },
  {
    id: 2,
    label: '用户管理',
    icon: 'User',
    type: '模块',
    children: [
      { id: 21, label: '查看用户', type: '操作' },
      { id: 22, label: '添加用户', type: '操作' },
      { id: 23, label: '编辑用户', type: '操作' },
      { id: 24, label: '删除用户', type: '操作' }
    ]
  },
  {
    id: 3,
    label: '角色管理',
    icon: 'Key',
    type: '模块',
    children: [
      { id: 31, label: '查看角色', type: '操作' },
      { id: 32, label: '添加角色', type: '操作' },
      { id: 33, label: '编辑角色', type: '操作' },
      { id: 34, label: '删除角色', type: '操作' },
      { id: 35, label: '配置权限', type: '操作' }
    ]
  },
  {
    id: 4,
    label: '内容管理',
    icon: 'Document',
    type: '模块',
    children: [
      { id: 41, label: '查看内容', type: '操作' },
      { id: 42, label: '添加内容', type: '操作' },
      { id: 43, label: '编辑内容', type: '操作' },
      { id: 44, label: '删除内容', type: '操作' },
      { id: 45, label: '发布内容', type: '操作' }
    ]
  },
  {
    id: 5,
    label: '系统设置',
    icon: 'Setting',
    type: '模块',
    children: [
      { id: 51, label: '查看设置', type: '操作' },
      { id: 52, label: '修改设置', type: '操作' },
      { id: 53, label: '系统监控', type: '操作' },
      { id: 54, label: '日志管理', type: '操作' }
    ]
  },
  {
    id: 6,
    label: '数据分析',
    icon: 'DataAnalysis',
    type: '模块',
    children: [
      { id: 61, label: '查看报表', type: '操作' },
      { id: 62, label: '导出数据', type: '操作' },
      { id: 63, label: '数据统计', type: '操作' }
    ]
  }
])

// 树形组件属性
const treeProps = {
  children: 'children',
  label: 'label'
}

// 角色表单
const roleForm = reactive({
  id: 0,
  name: '',
  code: '',
  description: '',
  status: 'enabled',
  sort: 0
})

// 表单验证规则
const roleFormRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '角色名称长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '角色代码只能包含字母、数字和下划线，且以字母或下划线开头', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑角色' : '添加角色')

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadRoleList()
}

// 添加角色
const handleAdd = () => {
  isEdit.value = false
  resetRoleForm()
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = (row: Role) => {
  isEdit.value = true
  Object.assign(roleForm, row)
  dialogVisible.value = true
}

// 删除角色
const handleDelete = async (row: Role) => {
  if (row.isSystem) {
    ElMessage({
      message: '系统角色不能删除',
      type: 'warning'
    })
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${row.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API删除角色
    const index = roleList.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      roleList.value.splice(index, 1)
    }
    
    ElMessage({
      message: '删除成功',
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 切换角色状态
const handleToggleStatus = async (row: Role) => {
  const newStatus = row.status === 'enabled' ? 'disabled' : 'enabled'
  const action = newStatus === 'enabled' ? '启用' : '禁用'
  
  try {
    await ElMessageBox.confirm(
      `确定要${action}角色 "${row.name}" 吗？`,
      `确认${action}`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API更新角色状态
    row.status = newStatus
    
    ElMessage({
      message: `${action}成功`,
      type: 'success'
    })
  } catch {
    // 用户取消
  }
}

// 权限配置
const handlePermission = (row: Role) => {
  currentRole.value = row
  checkedPermissions.value = row.permissions || []
  permissionDialogVisible.value = true
}

// 选择变化
const handleSelectionChange = (selection: Role[]) => {
  selectedRoles.value = selection
}

// 批量启用
const handleBatchEnable = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要启用选中的 ${selectedRoles.value.length} 个角色吗？`,
      '确认启用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API批量启用角色
    selectedRoles.value.forEach(role => {
      role.status = 'enabled'
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
      `确定要禁用选中的 ${selectedRoles.value.length} 个角色吗？`,
      '确认禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API批量禁用角色
    selectedRoles.value.forEach(role => {
      role.status = 'disabled'
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
  const systemRoles = selectedRoles.value.filter(role => role.isSystem)
  if (systemRoles.length > 0) {
    ElMessage({
      message: '选中的角色中包含系统角色，无法删除',
      type: 'warning'
    })
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRoles.value.length} 个角色吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 这里应该调用API批量删除角色
    const selectedIds = selectedRoles.value.map(role => role.id)
    roleList.value = roleList.value.filter(role => !selectedIds.includes(role.id))
    
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
  loadRoleList()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.page = page
  loadRoleList()
}

// 权限选择变化
const handlePermissionCheck = (data: Permission, checked: any) => {
  // 这里可以处理权限选择的逻辑
}

// 提交表单
const handleSubmit = async () => {
  if (!roleFormRef.value) return
  
  try {
    await roleFormRef.value.validate()
    
    submitting.value = true
    
    // 这里应该调用API保存角色
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (isEdit.value) {
      // 更新角色
      const index = roleList.value.findIndex(item => item.id === roleForm.id)
      if (index > -1) {
        Object.assign(roleList.value[index], roleForm)
      }
      ElMessage({
        message: '更新成功',
        type: 'success'
      })
    } else {
      // 添加角色
      const newRole = {
        ...roleForm,
        id: Date.now(),
        userCount: 0,
        isSystem: false,
        createdAt: new Date().toLocaleString(),
        permissions: []
      }
      roleList.value.unshift(newRole)
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

// 保存权限
const handleSavePermission = async () => {
  if (!currentRole.value || !permissionTreeRef.value) return
  
  savingPermission.value = true
  
  try {
    // 获取选中的权限
    const checkedKeys = permissionTreeRef.value.getCheckedKeys()
    const halfCheckedKeys = permissionTreeRef.value.getHalfCheckedKeys()
    const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys] as number[]
    
    // 这里应该调用API保存权限
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新角色权限
    const role = roleList.value.find(item => item.id === currentRole.value!.id)
    if (role) {
      role.permissions = allCheckedKeys
    }
    
    ElMessage({
      message: '权限保存成功',
      type: 'success'
    })
    
    permissionDialogVisible.value = false
  } catch (error) {
    console.error('保存权限失败:', error)
    ElMessage({
      message: '保存权限失败',
      type: 'error'
    })
  } finally {
    savingPermission.value = false
  }
}

// 对话框关闭
const handleDialogClose = () => {
  resetRoleForm()
  roleFormRef.value?.clearValidate()
}

// 权限对话框关闭
const handlePermissionDialogClose = () => {
  currentRole.value = null
  checkedPermissions.value = []
}

// 重置角色表单
const resetRoleForm = () => {
  Object.assign(roleForm, {
    id: 0,
    name: '',
    code: '',
    description: '',
    status: 'enabled',
    sort: 0
  })
}

// 加载角色列表
const loadRoleList = async () => {
  loading.value = true
  try {
    // 这里应该调用API加载角色列表
    await new Promise(resolve => setTimeout(resolve, 500))
    pagination.total = roleList.value.length
  } catch (error) {
    console.error('加载角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRoleList()
})
</script>

<style lang="scss" scoped>
.role-management {
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

.permission-config {
  .role-info {
    h4 {
      margin: 0 0 8px 0;
      color: #303133;
    }
    
    p {
      margin: 0;
      color: #606266;
      font-size: 14px;
    }
  }
  
  .permission-tree {
    max-height: 400px;
    overflow-y: auto;
    
    .tree-node {
      display: flex;
      align-items: center;
      
      .node-icon {
        margin-right: 8px;
        color: #409eff;
      }
      
      .node-tag {
        margin-left: 8px;
      }
    }
  }
}

@media (max-width: 768px) {
  .role-management {
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