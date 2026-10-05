import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { setupAnalytics } from '@/features/analytics/setupAnalytics'

const app = createApp(App)

setupAnalytics(app, {
  token: import.meta.env.VITE_POSTHOG_PROJECT_TOKEN,
  host: import.meta.env.VITE_POSTHOG_HOST,
})

app.mount('#app')
