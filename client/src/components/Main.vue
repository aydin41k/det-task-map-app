<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div class="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 sm:py-6">
      <header class="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <div>
          <div class="flex items-center gap-2">
            <div class="h-9 w-9 rounded-xl bg-sky-400/15 border border-sky-300/20 grid place-items-center">
              <span class="text-sky-200 font-bold">DET</span>
            </div>
            <h1 class="text-lg font-semibold tracking-tight text-white sm:text-xl">Map App</h1>
          </div>
          <p class="mt-1 text-sm text-slate-300">
            Click the map to save a location — jump back to any saved pin from the sidebar.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn-secondary" type="button" @click="toggleSidebar">
            {{ sidebarOpen ? 'Hide history' : 'Show history' }}
          </button>
        </div>
      </header>

      <div class="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[380px_1fr]">
        <aside v-show="sidebarOpen" class="glass-panel rounded-3xl overflow-hidden lg:sticky lg:top-6 lg:h-[calc(100vh-7.5rem)]">
          <HistorySidebar @center-map="updateCenter" />
        </aside>

        <main :class="['glass-panel rounded-3xl overflow-hidden', !sidebarOpen && 'lg:col-span-2 lg:col-start-1']">
          <MapView :centerCoords="mapCenter" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { useStore } from 'vuex'
  import { key } from '../store'
  import MapView from './MapView.vue'
  import HistorySidebar from './HistorySidebar.vue'

  const store = useStore(key)

  const mapCenter = ref<{ lat: number; lng: number } | null>(null)
  const sidebarOpen = ref(true)

  const shortSessionId = computed(() => {
    const uuid = store.state.session_uuid
    return uuid ? `${uuid.slice(0, 8)}…` : ''
  })

  const updateCenter = (coords: { lat: number; lng: number }) => {
    mapCenter.value = coords
  }

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  onMounted(() => {
    store.dispatch('initSession')
    store.dispatch('fetchHistory')
  })
</script>
