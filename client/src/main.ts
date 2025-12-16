import { createApp } from 'vue'
import App from './components/Main.vue'
import { store, key } from './store'
import 'leaflet/dist/leaflet.css'
import './assets/main.css'

const app = createApp(App)

app.use(store, key)
app.mount('#app')
