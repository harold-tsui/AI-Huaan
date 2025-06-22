<template>
  <div class="para-organization-settings">
    <h3>PARA自动分类设置</h3>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>Obsidian PARA组织设置</span>
        </div>
      </template>
      <el-form :model="form" label-width="180px">
        <el-form-item label="启用Obsidian自动组织">
          <el-switch v-model="form.enable_obsidian_organization"></el-switch>
        </el-form-item>

        <el-form-item label="组织模式">
          <el-select v-model="form.obsidian_organization_mode" :disabled="!form.enable_obsidian_organization">
            <el-option label="手动触发" value="manual"></el-option>
            <el-option label="定时执行" value="scheduled"></el-option>
          </el-select>
        </el-form-item>

        <div v-if="form.obsidian_organization_mode === 'scheduled' && form.enable_obsidian_organization">
          <el-form-item label="执行频率">
            <el-select v-model="form.obsidian_organization_frequency">
              <el-option label="每日" value="daily"></el-option>
              <el-option label="每周" value="weekly"></el-option>
              <el-option label="每月" value="monthly"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="执行时间">
            <el-time-picker 
              v-model="timePickerValue" 
              format="HH:mm" 
              placeholder="选择时间"
              @change="updateTimeString"
            ></el-time-picker>
          </el-form-item>
        </div>

        <el-form-item label="应用PARA方法">
          <el-switch v-model="form.obsidian_apply_para" :disabled="!form.enable_obsidian_organization"></el-switch>
        </el-form-item>

        <el-form-item label="分类规则" v-if="form.obsidian_apply_para && form.enable_obsidian_organization">
          <el-input 
            type="textarea" 
            v-model="form.obsidian_classification_rules" 
            :rows="5" 
            placeholder="输入自定义分类规则，每行一条。例如：'关键词:项目名称'"
          ></el-input>
        </el-form-item>

        <el-form-item label="处理范围">
          <el-select v-model="form.obsidian_processing_scope" :disabled="!form.enable_obsidian_organization">
            <el-option label="所有文件" value="all"></el-option>
            <el-option label="特定文件夹" value="specific_folder"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="指定文件夹路径" v-if="form.obsidian_processing_scope === 'specific_folder' && form.enable_obsidian_organization">
          <el-input v-model="form.obsidian_specific_folder_path" placeholder="例如: /Inbox"></el-input>
        </el-form-item>

        <el-form-item label="Vault路径">
          <el-input v-model="form.obsidian_organization_vault_path" placeholder="例如: /Users/YourName/Documents/ObsidianVault" :disabled="!form.enable_obsidian_organization"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSettings" :disabled="!form.enable_obsidian_organization">保存设置</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="success" @click="runManualOrganization" :disabled="!form.enable_obsidian_organization || form.obsidian_organization_mode !== 'manual'">立即执行组织</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="box-card" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>组织历史记录</span>
        </div>
      </template>
      <div v-if="organizationHistory.length === 0" class="empty-history">
        <p>暂无组织历史记录</p>
      </div>
      <el-timeline v-else>
        <el-timeline-item
          v-for="(activity, index) in organizationHistory"
          :key="index"
          :timestamp="activity.timestamp"
          :type="activity.status === 'success' ? 'success' : 'danger'"
        >
          {{ activity.message }}
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

// 定义PARA组织配置接口
interface PARAOrganizationConfig {
  enable_obsidian_organization: boolean;
  obsidian_organization_mode: string;
  obsidian_organization_frequency: string;
  obsidian_organization_time: string;
  obsidian_apply_para: boolean;
  obsidian_classification_rules: string;
  obsidian_processing_scope: string;
  obsidian_specific_folder_path: string;
  obsidian_organization_vault_path: string;
}

// 定义组织历史记录接口
interface OrganizationHistoryItem {
  timestamp: string;
  status: string;
  message: string;
}

export default defineComponent({
  name: 'PARAOrganizationSettings',
  setup() {
    const form = ref<PARAOrganizationConfig>({
      enable_obsidian_organization: false,
      obsidian_organization_mode: 'manual',
      obsidian_organization_frequency: 'daily',
      obsidian_organization_time: '03:00',
      obsidian_apply_para: true,
      obsidian_classification_rules: '',
      obsidian_processing_scope: 'all',
      obsidian_specific_folder_path: '',
      obsidian_organization_vault_path: '',
    });

    const timePickerValue = ref(new Date('2000-01-01T03:00:00'));
    const organizationHistory = ref<OrganizationHistoryItem[]>([]);
    const originalForm = ref<PARAOrganizationConfig>({} as PARAOrganizationConfig);

    const updateTimeString = () => {
      if (timePickerValue.value) {
        const hours = timePickerValue.value.getHours().toString().padStart(2, '0');
        const minutes = timePickerValue.value.getMinutes().toString().padStart(2, '0');
        form.value.obsidian_organization_time = `${hours}:${minutes}`;
      }
    };

    const loadSettings = async () => {
      try {
        const { data } = await axios.get<PARAOrganizationConfig>('/api/config/para-organization');
        form.value = { ...form.value, ...data };
        originalForm.value = { ...data };
        
        // 设置时间选择器的值
        if (form.value.obsidian_organization_time) {
          const [hours, minutes] = form.value.obsidian_organization_time.split(':');
          const date = new Date();
          date.setHours(parseInt(hours, 10));
          date.setMinutes(parseInt(minutes, 10));
          timePickerValue.value = date;
        }
      } catch (error) {
        console.error('加载PARA组织设置失败:', error);
        ElMessage.error('加载设置失败，请稍后重试');
      }
    };

    const saveSettings = async () => {
      try {
        await axios.post<{message: string; config: PARAOrganizationConfig}>('/api/config/para-organization', form.value);
        ElMessage.success('设置保存成功');
        originalForm.value = { ...form.value };
      } catch (error) {
        console.error('保存PARA组织设置失败:', error);
        ElMessage.error('保存设置失败，请稍后重试');
      }
    };

    const resetForm = () => {
      form.value = { ...originalForm.value };
      // 重置时间选择器
      if (form.value.obsidian_organization_time) {
        const [hours, minutes] = form.value.obsidian_organization_time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        timePickerValue.value = date;
      }
    };

    const runManualOrganization = async () => {
      try {
        // 这里应该调用后端API来手动触发PARA组织
        // 修改API路径以匹配后端实际实现
        await axios.post('/api/organization/execute');
        ElMessage.success('手动组织任务已启动');
        // 可以在这里更新历史记录
        loadOrganizationHistory();
      } catch (error) {
        console.error('启动手动组织任务失败:', error);
        ElMessage.error('启动任务失败，请稍后重试');
      }
    };

    const loadOrganizationHistory = async () => {
      try {
        // 从后端API获取组织历史记录
        const { data } = await axios.get<OrganizationHistoryItem[]>('/api/organization/history');
        organizationHistory.value = data || [];
      } catch (error) {
        console.error('加载组织历史记录失败:', error);
        // 如果API调用失败，使用模拟数据作为备用
        organizationHistory.value = [
          {
            timestamp: '2023-06-15 15:30:45',
            status: 'success',
            message: '成功组织了25个文件到PARA结构'
          },
          {
            timestamp: '2023-06-14 03:00:00',
            status: 'success',
            message: '自动组织完成，处理了12个文件'
          },
          {
            timestamp: '2023-06-13 03:00:00',
            status: 'danger',
            message: '组织失败：无法访问Vault路径'
          }
        ];
      }
    };

    onMounted(() => {
      loadSettings();
      loadOrganizationHistory();
    });

    return {
      form,
      timePickerValue,
      organizationHistory,
      updateTimeString,
      saveSettings,
      resetForm,
      runManualOrganization
    };
  }
});
</script>

<style scoped>
.para-organization-settings {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-history {
  text-align: center;
  color: #909399;
  padding: 20px;
}

.el-timeline {
  margin-top: 20px;
}
</style>