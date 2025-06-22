<template>
  <div class="data-sync-backup-settings">
    <h3>数据同步与备份</h3>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>同步设置</span>
        </div>
      </template>
      <el-form label-width="150px">
        <el-form-item label="自动同步频率">
          <el-select v-model="syncSettings.frequency" placeholder="选择同步频率">
            <el-option label="每小时" value="hourly"></el-option>
            <el-option label="每天" value="daily"></el-option>
            <el-option label="每周" value="weekly"></el-option>
            <el-option label="手动" value="manual"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="冲突解决策略">
          <el-radio-group v-model="syncSettings.conflictStrategy">
            <el-radio label="ask">询问用户</el-radio>
            <el-radio label="local">保留本地版本</el-radio>
            <el-radio label="remote">保留远程版本</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveSyncSettings">保存同步设置</el-button>
          <el-button @click="manualSync" :loading="isSyncing">{{ isSyncing ? '同步中...' : '立即同步' }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>备份设置</span>
        </div>
      </template>
      <el-form label-width="150px">
        <el-form-item label="自动备份">
          <el-switch v-model="backupSettings.autoBackup"></el-switch>
        </el-form-item>
        <el-form-item label="备份保留数量" v-if="backupSettings.autoBackup">
          <el-input-number v-model="backupSettings.retentionCount" :min="1" :max="100"></el-input-number>
        </el-form-item>
        <el-form-item label="备份位置">
          <el-input v-model="backupSettings.location" placeholder="例如：/path/to/backups"></el-input>
          <el-button style="margin-left: 10px;" @click="browseBackupLocation">浏览...</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveBackupSettings">保存备份设置</el-button>
          <el-button @click="createBackup" :loading="isBackingUp">{{ isBackingUp ? '备份中...' : '立即备份' }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card">
        <template #header>
            <div class="card-header">
            <span>备份历史</span>
            </div>
        </template>
        <el-table :data="backupHistory" style="width: 100%" empty-text="暂无备份记录">
            <el-table-column prop="timestamp" label="备份时间" width="200"></el-table-column>
            <el-table-column prop="size" label="大小" width="120"></el-table-column>
            <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                    <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template #default="scope">
                    <el-button size="small" @click="restoreBackup(scope.row)">恢复</el-button>
                    <el-button size="small" type="danger" @click="deleteBackup(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </el-card>

  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

interface SyncSettings {
  frequency: string;
  conflictStrategy: string;
}

interface BackupSettings {
  autoBackup: boolean;
  retentionCount: number;
  location: string;
}

interface BackupRecord {
    id: string;
    timestamp: string;
    size: string;
    status: '成功' | '失败';
}

const syncSettings = reactive<SyncSettings>({
  frequency: 'daily',
  conflictStrategy: 'ask',
});

const backupSettings = reactive<BackupSettings>({
  autoBackup: true,
  retentionCount: 7,
  location: '',
});

const isSyncing = ref(false);
const isBackingUp = ref(false);

const backupHistory = ref<BackupRecord[]>([
    { id: 'backup1', timestamp: new Date(Date.now() - 86400000).toLocaleString(), size: '10.5 MB', status: '成功' },
    { id: 'backup2', timestamp: new Date(Date.now() - 2 * 86400000).toLocaleString(), size: '10.2 MB', status: '成功' },
]);

const saveSyncSettings = () => {
  console.log('Sync settings saved:', syncSettings);
  ElMessage.success('同步设置已保存');
};

const manualSync = () => {
  isSyncing.value = true;
  console.log('Manual sync started...');
  // Simulate sync process
  setTimeout(() => {
    isSyncing.value = false;
    ElMessage.success('手动同步完成');
  }, 2000);
};

const saveBackupSettings = () => {
  console.log('Backup settings saved:', backupSettings);
  ElMessage.success('备份设置已保存');
};

const browseBackupLocation = () => {
    // This would typically open a file dialog. For web, this is complex.
    // We can simulate or ask user to paste path.
    ElMessage.info('请手动粘贴备份路径或通过系统对话框选择 (功能待实现)');
};

const createBackup = () => {
  isBackingUp.value = true;
  console.log('Backup process started...');
  // Simulate backup process
  setTimeout(() => {
    isBackingUp.value = false;
    const newBackup: BackupRecord = {
        id: `backup${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        size: `${(Math.random() * 5 + 8).toFixed(1)} MB`, // Random size between 8-13MB
        status: Math.random() > 0.1 ? '成功' : '失败' // 90% success rate
    };
    backupHistory.value.unshift(newBackup);
    ElMessage.success('备份创建成功');
  }, 3000);
};

const restoreBackup = (backup: BackupRecord) => {
    ElMessageBox.confirm(`确定要从 ${backup.timestamp} 的备份恢复数据吗？当前数据将被覆盖。`, '恢复备份', {
        confirmButtonText: '确定恢复',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        console.log('Restoring from backup:', backup.id);
        ElMessage.success(`开始从 ${backup.timestamp} 的备份中恢复数据...`);
        // Simulate restore
    }).catch(() => {});
};

const deleteBackup = (backup: BackupRecord) => {
    ElMessageBox.confirm(`确定要删除 ${backup.timestamp} 的备份记录吗？此操作不可恢复。`, '删除备份', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
    }).then(() => {
        backupHistory.value = backupHistory.value.filter(b => b.id !== backup.id);
        ElMessage.success(`备份 ${backup.timestamp} 已删除`);
    }).catch(() => {});
};

</script>

<style scoped>
.data-sync-backup-settings {
  padding: 20px;
}
.box-card {
  margin-bottom: 20px;
}
.card-header {
  font-weight: bold;
}
</style>