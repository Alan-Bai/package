<template>
  <div class='home' v-loading="loading" element-loading-text="正在加载">
    <el-form class="query" @keyup.enter="query(1)">
      <el-row>
        <el-col :span="6">
          <el-form-item label="事件编号" label-width="80px">
            <el-input v-model="formData.reserved2" clearable @clear="query(1)"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="6">
        <el-form-item label="事件名称" label-width="90px">
            <el-input v-model="formData.eventName" clearable @clear="query(1)"></el-input>
        </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="事件类型" label-width="90px">
            <el-select v-model="formData.eventType" placeholder="请选择" clearable @change="query(1)">
              <el-option :label="item.label" :value="item.value" v-for="item in eventTypeList" :key="item.value"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4">
          <el-form-item>
            <el-button :icon="Search"  type='primary' style="margin-left: 20px;" @click="query(1)">查询</el-button>
            <el-button :icon="CirclePlus"  style="margin-left: 20px;" @click="editRow('')">新增</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
      <el-table border :data="tableData" stripe  height="100%" style="margin-top: 10px;">
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="90" type='index' />
        <el-table-column prop="reserved2" label="事件编号" show-overflow-tooltip min-width="180" />
        <el-table-column prop="eventName" label="事件名称" show-overflow-tooltip min-width="180" />
        <el-table-column prop="eventClass" label="事件类" show-overflow-tooltip min-width="180" />
        <el-table-column prop="reserved1" label="失败处理" show-overflow-tooltip :formatter="eventTypeFilter" />
        <el-table-column prop="eventType" label="事件类型" show-overflow-tooltip>
          <template #default="scope">
            {{ eventTypeComputed(scope.row.eventType)  }}
          </template>
        </el-table-column >
        <el-table-column prop="enteredBy" label="录入人" show-overflow-tooltip />
        <el-table-column prop="tCreateTime" label="录入时间" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" min-width="180" align="center">
          <template  #default="scope">
            <el-button size="small" :icon="Edit"  @click="editRow(scope.row.eventId)">编辑</el-button>
            <el-button size="small" :icon="Delete" type="danger" @click="deleteRow(scope.row.eventId, scope.$index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    <el-pagination
      class="pagination"
      v-model:currentPage="formData.page"
      v-model:page-size="formData.size"
      :page-sizes="pageSizes"
      layout="total, sizes, prev, pager, next, jumper"
      :total="formData.total"
      @size-change="((val) => handleSizeChange(val, query))"
      @current-change="((val) => handleCurrentChange(val, query))"
    >
    </el-pagination>
    <!-- 编辑或者新增弹窗 -->
    <teleport to='#dialog'>
      <el-dialog v-model="dialogFormVisible" :title="title" destroy-on-close draggable width="500px">
        <edit-dialog :form="form" v-model:dialogFormVisible="dialogFormVisible" :title="title" @query="query(1)"></edit-dialog>
      </el-dialog>
    </teleport>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue'
import axios from 'axios'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Edit, Delete, Search, CirclePlus } from '@element-plus/icons-vue'
import  editDialog  from './components/edit-dialog.vue'
import pagination from '../hooks/pagination'

export default  ({
  components: {
    editDialog
  },
  setup () {   
    const { pageSizes, page, size, handleSizeChange, handleCurrentChange  } = pagination()
    // 主页查询
    const formData = reactive({
      eventName: '',
      eventType: '',
      reserved2: '',
      total: 0,
      page,
      size
    })
    const tableData = ref([])
    const eventTypeComputed = computed(() => {
      return (eventType) => {
        const obj = eventTypeList.find(item => +item.value === eventType )
        return obj ? obj.label : ''
      } 
    })
    const loading = ref(false)
    const query = (val) => {
      formData.page = val ? val : formData.page
      const { size, reserved2, eventName, eventType, page } = formData
      const param = {
        page,
        reserved2,
        eventName,
        size,
        eventType: eventType
      }
      const url = '/zjtzProcedureEvent/pageQuery'
      loading.value = true
      tableData.value = []
      axios.post(url, param).then((res) => {
        loading.value = false
        if (res && res.code === 0 && res.body) {
          tableData.value = res.body.rows || []
          formData.total = res.body.total
        }
      }).catch(err => {
        loading.value = false
        console.log(err)
      })
    }
    const eventTypeList = [
      { label: '触发类型', value: '2' },
      { label: '检验事件', value: '3' }
    ]
    const eventTypeFilter = row => {
      const eventType = row.eventType
      const obj = {
        3: '失败',
        2: '不允许提交'
      }
      return obj[eventType]
    }
    onMounted(() => {
      query(1)
    })
    // 处理编辑以及弹窗
    const title = ref('') // 弹窗标题
    const form = reactive({ // 传值弹窗数据
      eventName: '',
      eventType: '',
      reserved1: '',
      eventId: ''
    })
    // 删除一行数据
    const deleteRow = (eventId, index) => {
      ElMessageBox.confirm(`你确定要删除序号 ${index + 1} 的数据吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const url = '/zjtzProcedureEvent/delete'
        const param = { eventId }
        loading.value = true
        axios.post(url, param).then(res => {
          loading.value = false
          if(res && res.code === 0) {
            query(1)
            ElMessage({ type: 'success', message: '删除成功!' })
          }
        }).catch(() => {
          loading.value = false
        })
      }).catch(() => {
        ElMessage({ type: 'info', message: '取消删除' })
      })
    }
    // 定义弹窗展示变量
    const dialogFormVisible = ref(false)
    // 编辑或者新增
    const editRow = (eventId) => {
      title.value = eventId ? '编辑' : '新增'
      if(eventId) {
        loading.value = true
        const url = '/zjtzProcedureEvent/get'
        const param = { eventId }
        axios.post(url, param).then((res) => {
          loading.value = false
          if (res && res.code === 0) {
            dialogFormVisible.value = true
            const { eventName = '', eventType = '', reserved1 = '' } = res.body
            form.eventName = eventName
            form.eventType = eventType,
            form.reserved1 = reserved1
            form.eventId = eventId
          }
        }).catch(() => 
          loading.value = false
        )
      } else {
        dialogFormVisible.value = true
      }
    }
    return {
      formData,
      loading,
      query,
      tableData,
      eventTypeComputed,
      eventTypeList,
      handleSizeChange,
      handleCurrentChange,
      eventTypeFilter,
      deleteRow,
      Edit,
      Delete,
      Search,
      CirclePlus,
      editRow,
      dialogFormVisible,
      form,
      title,
      pageSizes
    }
  }
})
</script>

<style lang="scss" scoped>
  .home {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
    .query {
      box-sizing: border-box;
      background: #fff;
      border-radius: 4px;
      padding: 5px
    }
    .table {
      // margin-top: 5px;
      // padding-top: 5px;
      // margin: 5px;
      padding: 10px;
      box-sizing: border-box;
    }
    :deep(.el-select) {
      width: 100%;
    }
    :deep(.el-row) {
      padding-top: 10px;
      // display: flex;
      // align-items: center;
      // flex-direction: row;
    }
    :deep(.el-form-item){
      margin-bottom: 10px;
    }
    :deep(.el-table__empty-block) {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      margin: auto;
    }
    :deep(.el-dialog__body) {
      // background: red;
    }
    :deep(.el-table) {
      box-sizing: border-box;
      // border: 1px solid red;
    }
    .pagination {
      display: flex;
      justify-content: flex-end;
      text-align: right;
      border-top: 1px solid #eee;
      padding-top: 5px;
      margin-top: 5px;
      padding-right: 5px;
      background: #fff;
      border-radius: 4px;
    }
  }
</style>
