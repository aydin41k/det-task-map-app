import { createApp } from 'vue'
import App from './components/Main.vue'
import { store, key } from './store'
import 'leaflet/dist/leaflet.css'

const app = createApp(App)

app.use(store, key)
app.mount('#app')
