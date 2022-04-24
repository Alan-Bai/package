<template>
<div class="edit-dialog">
  <el-form  ref="formDataRef" :model="formData" :rules="rules">
    <el-form-item label="事件名称" label-width="100px" prop="eventName">
      <el-input v-model="formData.eventName" autocomplete="off"></el-input>
    </el-form-item>
    <el-form-item label="事件类型" label-width="100px" prop="eventType">
      <el-select v-model="formData.eventType" @change="eventTypeChange">
        <el-option label="触发事件" :value="2"></el-option>
        <el-option label="校验事件" :value="3"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="失败处理" label-width="100px" prop="reserved1" v-if="formData.eventType === 3">
      <el-select v-model="formData.reserved1">
        <el-option label="提交" value="1"></el-option>
        <el-option label="不允许提交" value="2"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item v-if="formData.eventType === 2" label="触发事件类型">
      <el-select v-model="formData.reserved2" clearable>
        <el-option label="头寸推送" value="1"></el-option>
        <el-option label="材料推送" value="2"></el-option>
        <el-option label="指令推送" value="3"></el-option>
      </el-select>
    </el-form-item>
  </el-form>
  <div class="footer">
    <el-button type="primary"  @click="save">确定</el-button>
    <el-button  @click="cancle">取消</el-button>
  </div>
</div>
</template>

<script>
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

export default {
  name: 'edit-dialog',
  props: {
    form: {
      type: Object,
      default: () => {}
    },
    dialogFormVisible: {
      type: Boolean,
      default: () => false
    },
    title: {
      type: String,
      default: () => ''
    }
  },
  setup(props, { emit }) {
    // 定义表单字段
    const formData = reactive({
      eventName: '',
      eventType: '',
      reserved1: '',
      eventId: ''
    })
    onMounted(() => {
      const { eventType, reserved1, eventId, reserved2 } = props.form
      if(props.title === '编辑') {
        formData.eventName = props.form.eventName
        formData.eventType = eventType
        formData.reserved1 = reserved1
        formData.reserved2 = reserved2
        formData.eventId = eventId
      }
    })
    // eventTypeChange
    const eventTypeChange = () => {
      formData.reserved1 = ""
      formData.reserved2 = ""
    }
    // 取消关闭弹窗
    const cancle = () => {
      emit('update:dialogFormVisible', false)
    }
    // 保存相关
    const formDataRef = ref()
    const save = () => {
      console.log(formDataRef);
      formDataRef.value.validate(valid => {
        if (valid) {
          const url = '/zjtzProcedureEvent/saveOrUpdate'
          const param = { ...formData }
          axios.post(url, param).then((res) => {
            if (res && res.code === 0) {
              cancle()
              ElMessage({ type: 'success', message: '保存成功!' })
              emit('query')
            }
          })
        }
      })
    }
    // 校验规则
    const rules = reactive({
      eventName: [{ required: true, message: '请输入事件名称', trigger: 'blur' }],
      eventType: [{ required: true, message: '请选择事件类型', trigger: 'blur' }],
      reserved1: [{ required: true, message: '请选择失败处理', trigger: 'blur' }]
    })
    return {
      formData,
      rules,
      cancle,
      save,
      ElMessage,
      eventTypeChange,
      formDataRef
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-dialog {
  :deep(.el-select) {
    width: 100%;
  }
  .footer {
    padding-top: 10px;
    border-top: 1px solid #dcdfe6;
    text-align: center;
  }
}
</style>

