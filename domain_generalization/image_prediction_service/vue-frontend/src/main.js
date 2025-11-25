import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import { translations } from './i18n/translations.js'
import './assets/styles.css'

// 创建i18n实例
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: translations
})

// 创建并挂载Vue应用
const app = createApp(App)
app.use(i18n)
app.mount('#app')