<template>
  <div class="app-container">
    <HistorySidebar @center-map="updateCenter" />
    <MapView :centerCoords="mapCenter" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import MapView from './MapView.vue'
  import HistorySidebar from './HistorySidebar.vue'

  const mapCenter = ref<{ lat: number; lng: number } | null>(null)

  const updateCenter = (coords: { lat: number; lng: number }) => {
    mapCenter.value = coords
  }
</script>

<style>
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  .app-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
  }
</style>
