import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import locale from 'element-plus/lib/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
import axios from 'axios'
import qs from 'qs'
import { ElMessage } from 'element-plus'


axios.defaults.baseURL = 'http://10.190.0.22:9600/position-api'
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

// 开始发送请求
axios.interceptors.request.use(config => {
  if (config.headers) {
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
  }
  const sysToken = '05186787FCDE69A65F0C81BF6F1B9B58FB648A8B5D805F903EEBF47419A4BDC0F8979367DEC34AEEB986F87DE2A22C557C623A0E8F2511AC6EC87BB66AB647ED'
  const flag = config.method === 'post'
  if (flag) {
    config.data = qs.stringify({
      ...(config.data),
      sysToken
    })
  } else {
    config.params = {
      ...config.params,
      sysToken
    }
  }
  return config
})
axios.interceptors.response.use(config => {
  if(config.data && config.data.code === 0)  {
    return config.data
  } else {
    ElMessage.error(config.data.message ? config.data.message :'server error')
  }
}, error => {
  ElMessage.error('server error')
  console.log(error)
})

createApp(App).use(store).use(router).use(ElementPlus,{ locale }).mount('#app')
