<template>
  <div class="relative h-[70vh] min-h-[520px] w-full lg:h-[calc(100vh-7.5rem)]">
    <l-map
      ref="map"
      v-model:zoom="zoom"
      :center="center"
      :use-global-leaflet="false"
      class="h-full w-full"
      @ready="onMapReady"
      @click="handleMapClick"
    >
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"></l-tile-layer>

      <l-marker v-for="(loc, i) in history" :key="loc.id || i" :lat-lng="[loc.lat, loc.lng]">
        <l-popup>
          <strong>{{ loc.address }}</strong>
        </l-popup>
      </l-marker>

      <l-marker
        v-if="draftLocation"
        ref="draftMarker"
        @ready="onDraftMarkerReady"
        :lat-lng="[draftLocation.lat, draftLocation.lng]"
      >
        <l-icon
          icon-url="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png"
          :icon-size="[25, 41]"
          :icon-anchor="[12, 41]"
          :popup-anchor="[1, -34]"
          :shadow-url="shadowUrl"
        />

        <l-popup :options="{ closeButton: false, autoClose: false, closeOnClick: false }">
          <div class="min-w-[200px] text-center">
            <div v-if="loading" class="text-sm font-medium text-slate-100">Looking up address…</div>
            <div v-else>
              <p class="mb-2 text-sm font-semibold text-white">{{ draftLocation.address }}</p>
              <div v-if="isAlreadySaved" class="flex flex-col items-center gap-2">
                <span class="text-xs font-semibold text-emerald-300">✓ Already saved</span>
                <button @click.stop="cancelDraft" class="btn-secondary w-full" type="button">Close</button>
              </div>
              <div v-else class="flex gap-2">
                <button @click.stop="saveDraft" class="btn-primary flex-1" type="button">Save</button>
                <button @click.stop="cancelDraft" class="btn-danger flex-1" type="button">Cancel</button>
              </div>
            </div>
          </div>
        </l-popup>
      </l-marker>
    </l-map>

    <div class="pointer-events-none absolute left-3 top-3 hidden sm:block">
      <div class="glass-panel rounded-2xl px-3 py-2">
        <div class="text-xs font-semibold text-white">Tip</div>
        <div class="text-xs text-slate-300">Click anywhere to drop a pin.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
    import { computed, nextTick, ref, watch } from 'vue'
    import { useStore } from 'vuex'
    import axios from 'axios'
    import { LIcon, LMap, LMarker, LPopup, LTileLayer } from '@vue-leaflet/vue-leaflet'
    import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
    import { key } from '../store'
    import type { LocationRecord, MapClickEvent } from '../types'

    const props = defineProps<{
        centerCoords?: { lat: number; lng: number } | null
    }>()

    const store = useStore(key)

    // State
    const zoom = ref<number>(13)
    const center = ref<[number, number]>([-33.8688, 151.2093])
    const draftLocation = ref<LocationRecord | null>(null)
    const loading = ref<boolean>(false)

    const map = ref<any>(null)
    const draftMarker = ref<any>(null)

    const history = computed(() => store.getters.history as LocationRecord[])

    const isAlreadySaved = computed(() => {
        if (!draftLocation.value?.address || loading.value) return false
        return history.value.some((loc) => loc.address === draftLocation.value?.address)
    })

    watch(
        () => props.centerCoords,
        async (newCoords) => {
            if (!newCoords) return

            const nextCenter: [number, number] = [newCoords.lat, newCoords.lng]
            const nextZoom = 16

            const leafletMap = map.value?.leafletObject
            if (leafletMap?.setView) {
                leafletMap.setView(nextCenter, nextZoom, { animate: false })
                center.value = nextCenter
                zoom.value = nextZoom
                return
            }

            // Fallback if the map isn't ready yet
            center.value = nextCenter
            zoom.value = nextZoom
            await nextTick()
            map.value?.leafletObject?.setView?.(nextCenter, nextZoom, { animate: false })
        },
    )

    const onMapReady = (leafletMap: any) => {
        // Leaflet may calculate an incorrect size during initial flex layout; workaround
        setTimeout(() => leafletMap?.invalidateSize?.(), 0)

        if (props.centerCoords) {
            leafletMap?.setView?.([props.centerCoords.lat, props.centerCoords.lng], zoom.value, { animate: false })
        }
    }

    const onDraftMarkerReady = (markerInstance: any) => {
    // UX is better if we allow popup child component to fully attach
    setTimeout(() => {
        markerInstance.openPopup()
    }, 50)
    }

    const handleMapClick = async (e: MapClickEvent) => {
    const { lat, lng } = e.latlng

    // Clear the old pin
    draftLocation.value = null
    await nextTick()

    // Set new draft location
    draftLocation.value = { lat, lng, address: 'Loading…' }
    loading.value = true

    try {
        const res = await axios.get<{ address: string }>(`/api/geocode?lat=${lat}&lng=${lng}`)
        if (draftLocation.value) {
        draftLocation.value.address = res.data.address || 'Unknown location'
        }
    } catch (err) {
        if (draftLocation.value) {
        draftLocation.value.address = 'Address lookup failed'
        }
    } finally {
        loading.value = false
    }
    }

    const saveDraft = async () => {
        if (draftLocation.value) {
            await store.dispatch('saveLocation', draftLocation.value)
            draftLocation.value = null // Clear draft, replace by history pin
        }
    }

    const cancelDraft = () => {
        draftLocation.value = null
    }
</script>