import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import { ensureSeed } from './db'
import { sync } from './sync/supabase'
import './style.css'

// PWA Service Worker 自动更新注册
import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

// 申请持久化存储，降低浏览器自动清理数据的概率
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().catch(() => {})
}

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 首次启动先写入内置菜品与默认设置，再挂载界面；挂载后自动尝试云端重连
ensureSeed()
  .catch((err) => console.error('种子数据初始化失败', err))
  .finally(() => {
    app.mount('#app')
    sync.restore().catch((err) => console.error('云端重连失败', err))
  })
