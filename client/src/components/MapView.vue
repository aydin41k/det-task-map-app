<template>
  <div class="map-wrapper">
    <l-map
      ref="map"
      v-model:zoom="zoom"
      :center="center"
      :use-global-leaflet="false"
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
          <div class="draft-popup">
            <div v-if="loading">Scanning address...</div>
            <div v-else>
              <p class="draft-address">{{ draftLocation.address }}</p>
              <div v-if="isAlreadySaved" class="already-saved">
                <span class="saved-label">✓ Already saved</span>
                <button @click.stop="cancelDraft" class="btn btn-cancel">Close</button>
              </div>
              <div v-else class="draft-actions">
                <button @click.stop="saveDraft" class="btn btn-save">Save</button>
                <button @click.stop="cancelDraft" class="btn btn-cancel">Cancel</button>
              </div>
            </div>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script setup lang="ts">
    import { ref, computed, watch, nextTick } from 'vue'
    import { useStore } from 'vuex'
    import { key } from '../store'
    import axios from 'axios'
    import { LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet'
    import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
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

    const draftMarker = ref<any>(null)

    const history = computed(() => store.getters.history as LocationRecord[])

    const isAlreadySaved = computed(() => {
        if (!draftLocation.value?.address || loading.value) return false
        return history.value.some((loc) => loc.address === draftLocation.value?.address)
    })

    watch(
        () => props.centerCoords,
        (newCoords) => {
            if (newCoords) {
                center.value = [newCoords.lat, newCoords.lng]
                zoom.value = 16
            }
        },
    )

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
        draftLocation.value = { lat, lng, address: 'Loading...' }
        loading.value = true

        try {
            const res = await axios.get<{ address: string }>(`/api/geocode?lat=${lat}&lng=${lng}`)
            if (draftLocation.value) {
                draftLocation.value.address = res.data.address || 'Unknown Location'
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
            draftLocation.value = null // Clear draft, replaced by history pin
        }
    }

    const cancelDraft = () => {
        draftLocation.value = null
    }
</script>

<style scoped>
    .map-wrapper {
        flex-grow: 1;
        height: 100vh;
        position: relative;
        z-index: 1;
    }

    .draft-popup {
        text-align: center;
        min-width: 160px;
    }

    .draft-address {
        margin: 5px 0 10px;
        font-weight: bold;
        font-size: 13px;
    }

    .draft-actions {
        display: flex;
        gap: 8px;
        justify-content: center;
    }

    .btn {
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        color: white;
        font-size: 12px;
    }

    .btn-save {
        background: #28a745;
    }

    .btn-cancel {
        background: #dc3545;
    }

    .already-saved {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
    }

    .saved-label {
        color: #28a745;
        font-weight: bold;
        font-size: 12px;
    }
</style>
