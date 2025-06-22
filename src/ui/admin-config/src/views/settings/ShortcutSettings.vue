<template>
  <div class="shortcut-settings">
    <h3>快捷键设置</h3>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>全局快捷键</span>
          <el-input v-model="searchTerm" placeholder="搜索快捷键..." clearable style="width: 200px; float: right;"></el-input>
        </div>
      </template>
      <el-table :data="filteredShortcuts" style="width: 100%" empty-text="未找到匹配的快捷键或暂无快捷键">
        <el-table-column prop="action" label="功能" width="250"></el-table-column>
        <el-table-column prop="shortcut" label="当前快捷键" width="250">
            <template #default="scope">
                <el-tag v-if="scope.row.shortcut">{{ formatShortcut(scope.row.shortcut) }}</el-tag>
                <el-text v-else type="info">未设置</el-text>
            </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="editShortcut(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="clearShortcut(scope.row)" :disabled="!scope.row.shortcut">清除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showEditDialog" title="编辑快捷键" width="30%" @closed="resetEditForm">
      <p>请按下您想为 "<strong>{{ editingShortcut?.action }}</strong>" 设置的新快捷键组合。</p>
      <p>当前: <el-tag v-if="currentPressedKeys.length > 0">{{ formatShortcut(currentPressedKeys) }}</el-tag><el-text v-else type="info">等待输入...</el-text></p>
      <div class="shortcut-input-area" tabindex="0" @keydown.prevent="handleKeyDown" @keyup.prevent="handleKeyUp">
        在此区域按下快捷键
      </div>
      <el-alert v-if="shortcutConflict" title="快捷键冲突" :description="`此快捷键已被 '${conflictAction}' 使用。`" type="warning" show-icon :closable="false" style="margin-top:10px;"></el-alert>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditDialog = false">取消</el-button>
          <el-button type="primary" @click="saveShortcut" :disabled="currentPressedKeys.length === 0 || shortcutConflict">应用</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

interface Shortcut {
  id: string;
  action: string;
  shortcut: string[]; // e.g., ['Control', 'Shift', 'S']
}

const searchTerm = ref('');
const shortcuts = ref<Shortcut[]>([
  { id: 'quick-capture', action: '快速捕获', shortcut: ['Control', 'Shift', 'C'] },
  { id: 'open-dashboard', action: '打开仪表盘', shortcut: ['Control', 'Shift', 'D'] },
  { id: 'search-notes', action: '搜索笔记', shortcut: ['Control', 'K'] },
  { id: 'new-note', action: '新建笔记', shortcut: [] }, // Example of unassigned
  { id: 'toggle-sidebar', action: '切换侧边栏', shortcut: ['Control', 'B'] },
]);

const showEditDialog = ref(false);
const editingShortcut = ref<Shortcut | null>(null);
const currentPressedKeys = ref<string[]>([]);
const keyMap: Record<string, string> = {
    Control: 'Ctrl',
    Meta: 'Cmd', // For macOS
    Alt: 'Alt',
    Shift: 'Shift',
};
const pressedModifiers = reactive<Record<string, boolean>>({
    Control: false,
    Meta: false,
    Alt: false,
    Shift: false,
});
const shortcutConflict = ref(false);
const conflictAction = ref('');

const filteredShortcuts = computed(() => {
  if (!searchTerm.value) {
    return shortcuts.value;
  }
  return shortcuts.value.filter(s => 
    s.action.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    formatShortcut(s.shortcut).toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const formatShortcut = (keys: string[]) => {
  if (!keys || keys.length === 0) return '';
  return keys.map(key => keyMap[key] || key).join(' + ');
};

const editShortcut = (shortcut: Shortcut) => {
  editingShortcut.value = shortcut;
  currentPressedKeys.value = [...shortcut.shortcut]; // Show current shortcut initially
  showEditDialog.value = true;
  shortcutConflict.value = false;
  conflictAction.value = '';
};

const handleKeyDown = (event: KeyboardEvent) => {
    event.preventDefault();
    const key = event.key === ' ' ? 'Space' : event.key;

    if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
        pressedModifiers[key] = true;
    } else {
        // A non-modifier key is pressed
        currentPressedKeys.value = [];
        if (pressedModifiers.Control) currentPressedKeys.value.push('Control');
        if (pressedModifiers.Meta) currentPressedKeys.value.push('Meta');
        if (pressedModifiers.Alt) currentPressedKeys.value.push('Alt');
        if (pressedModifiers.Shift) currentPressedKeys.value.push('Shift');
        
        // Avoid adding modifier keys themselves as the main key
        if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
             // Capitalize letter keys, keep others as is (e.g. F1, ArrowUp)
            currentPressedKeys.value.push(key.length === 1 ? key.toUpperCase() : key);
        }
    }
    checkConflict();
};

const handleKeyUp = (event: KeyboardEvent) => {
    event.preventDefault();
    const key = event.key;
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
        pressedModifiers[key] = false;
    }
    // If only modifiers were pressed and then released, clear currentPressedKeys
    // unless a non-modifier key was part of the sequence.
    // This logic might need refinement based on desired UX for modifier-only inputs.
    if (currentPressedKeys.value.every(k => ['Control', 'Shift', 'Alt', 'Meta'].includes(k))) {
        // if no non-modifier key was pressed, this keyup might mean the user is done or aborted
    }
    checkConflict();
};

const checkConflict = () => {
    shortcutConflict.value = false;
    conflictAction.value = '';
    if (currentPressedKeys.value.length === 0) return;

    const currentShortcutStr = currentPressedKeys.value.sort().join(',');
    for (const sc of shortcuts.value) {
        if (sc.id !== editingShortcut.value?.id && sc.shortcut.sort().join(',') === currentShortcutStr) {
            shortcutConflict.value = true;
            conflictAction.value = sc.action;
            break;
        }
    }
};

const saveShortcut = () => {
  if (editingShortcut.value && currentPressedKeys.value.length > 0 && !shortcutConflict.value) {
    const index = shortcuts.value.findIndex(s => s.id === editingShortcut.value!.id);
    if (index !== -1) {
      shortcuts.value[index].shortcut = [...currentPressedKeys.value];
      ElMessage.success(`快捷键 '${editingShortcut.value.action}' 已更新`);
    }
  }
  showEditDialog.value = false;
};

const clearShortcut = (shortcut: Shortcut) => {
  ElMessageBox.confirm(`确定要清除 '${shortcut.action}' 的快捷键吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    const index = shortcuts.value.findIndex(s => s.id === shortcut.id);
    if (index !== -1) {
      shortcuts.value[index].shortcut = [];
      ElMessage.success(`快捷键 '${shortcut.action}' 已清除`);
    }
  }).catch(() => {});
};

const resetEditForm = () => {
    currentPressedKeys.value = [];
    editingShortcut.value = null;
    shortcutConflict.value = false;
    conflictAction.value = '';
    Object.keys(pressedModifiers).forEach(key => pressedModifiers[key] = false);
};

</script>

<style scoped>
.shortcut-settings {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.shortcut-input-area {
  border: 1px dashed #ccc;
  padding: 20px;
  text-align: center;
  margin-top: 10px;
  border-radius: 4px;
  cursor: text;
}
.shortcut-input-area:focus {
  border-color: #409EFF;
  outline: none;
}
</style>