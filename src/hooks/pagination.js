import { ref } from 'vue'

function pagination() {
  const size = ref(20)
  const page = ref(1)
  const pageSizes = [20, 50, 100]
  const handleSizeChange = (value, fn) => {
    size.value = value
    page.value = 1
    fn()
  }
  const handleCurrentChange = (value, fn) => {
    page.value = value
    fn()
  }
  return {
    size,
    page,
    pageSizes,
    handleSizeChange,
    handleCurrentChange
  }
}

export default pagination