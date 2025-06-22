<template>
  <div class="tag-management-settings">
    <h3>标签管理</h3>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>管理您的标签</span>
        </div>
      </template>
      <el-input v-model="searchTerm" placeholder="搜索标签..." clearable @input="filterTags" style="margin-bottom: 15px;"></el-input>

      <div class="tag-list-container">
        <el-checkbox-group v-model="selectedTags">
          <div v-for="tag in filteredTags" :key="tag.id" class="tag-item">
            <el-checkbox :label="tag.id">{{ tag.name }}</el-checkbox>
            <el-button-group size="small" style="margin-left: auto;">
                <el-button type="primary" :icon="Edit" @click="editTag(tag)"></el-button>
                <el-button type="danger" :icon="Delete" @click="deleteTag(tag.id)"></el-button>
            </el-button-group>
          </div>
        </el-checkbox-group>
        <el-empty v-if="filteredTags.length === 0 && allTags.length > 0" description="未找到匹配标签"></el-empty>
        <el-empty v-if="allTags.length === 0" description="暂无标签，请先添加"></el-empty>
      </div>

      <div style="margin-top: 20px;">
        <el-button type="primary" @click="showAddTagDialog = true">新建标签</el-button>
        <el-button type="danger" @click="deleteSelectedTags" :disabled="selectedTags.length === 0">删除选中</el-button>
      </div>
    </el-card>

    <el-dialog v-model="showAddTagDialog" :title="isEditingTag ? '编辑标签' : '新建标签'" width="30%">
      <el-form :model="tagForm" label-width="80px">
        <el-form-item label="标签名称">
          <el-input v-model="tagForm.name"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddTagDialog = false">取消</el-button>
          <el-button type="primary" @click="saveTag">{{ isEditingTag ? '保存' : '创建' }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Delete } from '@element-plus/icons-vue';

interface Tag {
  id: string;
  name: string;
}

const searchTerm = ref('');
const allTags = ref<Tag[]>([
  { id: 'ai', name: '人工智能' },
  { id: 'project', name: '项目管理' },
  { id: 'research', name: '研究' },
  { id: 'dev', name: '开发' },
]);
const selectedTags = ref<string[]>([]);
const showAddTagDialog = ref(false);
const isEditingTag = ref(false);
const tagForm = reactive<Partial<Tag>>({
  id: undefined,
  name: '',
});

const filteredTags = computed(() => {
  if (!searchTerm.value) {
    return allTags.value;
  }
  return allTags.value.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const filterTags = () => {
  // Computed property handles filtering, this can be used for other side effects if needed
};

const editTag = (tag: Tag) => {
  isEditingTag.value = true;
  tagForm.id = tag.id;
  tagForm.name = tag.name;
  showAddTagDialog.value = true;
};

const saveTag = () => {
  if (!tagForm.name?.trim()) {
    ElMessage.warning('标签名称不能为空');
    return;
  }
  if (isEditingTag.value && tagForm.id) {
    const index = allTags.value.findIndex(t => t.id === tagForm.id);
    if (index !== -1) {
      allTags.value[index].name = tagForm.name;
      ElMessage.success('标签已更新');
    }
  } else {
    // Create new tag - ensure unique ID in a real app
    const newId = tagForm.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    allTags.value.push({ id: newId, name: tagForm.name });
    ElMessage.success('标签已创建');
  }
  showAddTagDialog.value = false;
  isEditingTag.value = false;
  tagForm.id = undefined;
  tagForm.name = '';
};

const deleteTag = (tagId: string) => {
  ElMessageBox.confirm('确定要删除此标签吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    allTags.value = allTags.value.filter(t => t.id !== tagId);
    selectedTags.value = selectedTags.value.filter(id => id !== tagId);
    ElMessage.success('标签已删除');
  }).catch(() => {});
};

const deleteSelectedTags = () => {
   ElMessageBox.confirm(`确定要删除选中的 ${selectedTags.value.length} 个标签吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    allTags.value = allTags.value.filter(t => !selectedTags.value.includes(t.id));
    selectedTags.value = [];
    ElMessage.success('选中的标签已删除');
  }).catch(() => {});
};

</script>

<style scoped>
.tag-management-settings {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  font-weight: bold;
}
.tag-list-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  padding: 10px;
  border-radius: 4px;
}
.tag-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}
.tag-item:last-child {
  border-bottom: none;
}
.tag-item .el-checkbox {
  margin-right: 10px;
}
</style>