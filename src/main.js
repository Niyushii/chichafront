// src/main.js
import { createApp, provide, h } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import App from './App.vue'
import router from '../src/router/index'
import client from '../src/apollo/apolloClient'

// ✅ Importar PrimeVue SIN tema
import PrimeVue from 'primevue/config'
import 'primeicons/primeicons.css'

// ✅ Importar tus estilos personalizados
import './assets/styles/base.css'

const app = createApp({
  setup() {
    provide(DefaultApolloClient, client)
  },
  render: () => h(App),
})

// ✅ Usar PrimeVue sin configuración de tema (unstyled mode)
app.use(PrimeVue, {
  unstyled: true
})

app.use(router)
app.mount('#app')