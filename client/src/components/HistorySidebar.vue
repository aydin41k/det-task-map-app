<template>
  <div class="sidebar">
    <div class="header">
      <h2>History</h2>
    </div>

    <div v-if="history.length === 0" class="empty-state">
      <p>No locations saved.</p>
      <small>Click the map to add one!</small>
    </div>

    <ul class="history-list">
      <li
        v-for="(loc, index) in history"
        :key="loc.id || index"
        class="history-item"
        @click="centerMap(loc)"
      >
        <span class="icon">📍</span>
        <div class="details">
          <div class="address">{{ loc.address }}</div>
          <div class="coords">{{ loc.lat.toFixed(4) }}, {{ loc.lng.toFixed(4) }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { key } from '../store'
import type { LocationRecord } from '../types'

// Emits definition for TS
const emit = defineEmits<{
  (e: 'center-map', coords: { lat: number; lng: number }): void
}>()

const store = useStore(key)

const history = computed(() => store.getters.history as LocationRecord[])
const sessionUuid = computed(() => store.state.session_uuid)
const shortSessionId = computed(() =>
  sessionUuid.value ? sessionUuid.value.slice(0, 8) + '...' : '',
)

const centerMap = (loc: LocationRecord) => {
  emit('center-map', { lat: loc.lat, lng: loc.lng })
}

onMounted(() => {
  store.dispatch('initSession')
  store.dispatch('fetchHistory')
})
</script>

<style scoped>
.sidebar {
  width: 320px;
  background: #fff;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}
.header {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}
.header h2 {
  margin: 0 0 5px 0;
  font-size: 1.2rem;
}
.empty-state {
  padding: 40px;
  text-align: center;
  color: #888;
}
.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex-grow: 1;
}
.history-item {
  display: flex;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}
.history-item:hover {
  background: #f1f8ff;
}
.icon {
  margin-right: 10px;
  font-size: 1.2rem;
}
.address {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  margin-bottom: 4px;
}
.coords {
  font-size: 0.75rem;
  color: #666;
  font-family: monospace;
}
</style>
