import { createApp } from 'vue'
import posthog from 'posthog-js'
import './style.css'
import App from './App.vue'

const posthogProjectToken = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN
const posthogHost = import.meta.env.VITE_POSTHOG_HOST

if (posthogProjectToken && posthogHost) {
  posthog.init(posthogProjectToken, {
    api_host: posthogHost,
    logs: {
      serviceName: 'typey-site-web',
      environment: import.meta.env.MODE,
    },
  })
} else if (import.meta.env.DEV) {
  const missingVariable = posthogProjectToken
    ? 'VITE_POSTHOG_HOST'
    : 'VITE_POSTHOG_PROJECT_TOKEN'
  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  )
}

const app = createApp(App)

app.config.errorHandler = (error) => {
  if (posthogProjectToken && posthogHost) {
    posthog.captureException(error)
  }
}

app.mount('#app')