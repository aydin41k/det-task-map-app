<template>
  <div class="flex h-full flex-col">
    <div class="border-b border-white/10 px-5 py-4">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-white">History</h2>
        <span class="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-200">
          {{ history.length }}
        </span>
      </div>
      <p class="mt-1 text-sm text-slate-300">Your saved locations for this session.</p>
    </div>

    <div v-if="history.length === 0" class="grid flex-1 place-items-center px-6 py-10">
      <div class="text-center">
        <div class="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-sky-400/15 border border-sky-300/20">
          <span class="text-xl">📍</span>
        </div>
        <p class="text-sm font-semibold text-white">No locations saved yet</p>
        <p class="mt-1 text-sm text-slate-300">Click the map to add your first pin.</p>
      </div>
    </div>

    <ul v-else class="flex-1 overflow-y-auto p-2 [scrollbar-gutter:stable]">
      <li v-for="(loc, index) in history" :key="loc.id || index">
        <button
          type="button"
          class="group flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
          @click="centerMap(loc)"
        >
          <span class="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 border border-white/10">
            <span class="text-base">📍</span>
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-white">{{ loc.address }}</span>
            <span class="mt-0.5 block font-mono text-[12px] text-slate-300">
              {{ loc.lat.toFixed(4) }}, {{ loc.lng.toFixed(4) }}
            </span>
          </span>
          <span class="mt-1 text-xs text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
            Centre
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { key } from '../store'
import type { LocationRecord } from '../types'

// Emits definition for TS
const emit = defineEmits<{
  (e: 'center-map', coords: { lat: number; lng: number }): void
}>()

const store = useStore(key)

const history = computed(() => store.getters.history as LocationRecord[])

const centerMap = (loc: LocationRecord) => {
  emit('center-map', { lat: loc.lat, lng: loc.lng })
}
</script>
