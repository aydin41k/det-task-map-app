import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'

import Main from '../src/components/Main.vue'
import HistorySidebar from '../src/components/HistorySidebar.vue'
import { key } from '../src/store'

describe('UI smoke tests', () => {
  it('Main: toggling the sidebar makes the map span the full grid', async () => {
    const store = createStore({
      state: { session_uuid: '12345678-aaaa-bbbb-cccc-1234567890ab', history: [] },
      getters: { history: (s: any) => s.history },
      actions: { initSession: () => undefined, fetchHistory: () => undefined },
    })

    const wrapper = mount(Main, {
      global: {
        plugins: [[store, key]],
        stubs: {
          HistorySidebar: { template: '<div data-testid="sidebar">sidebar</div>' },
          MapView: { template: '<div data-testid="map">map</div>' },
        },
      },
    })

    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true)

    await wrapper.get('button').trigger('click') // "Hide history" / "Show history"
    expect(wrapper.find('[data-testid="sidebar"]').exists()).toBe(true) // stub still exists in DOM; v-show toggles visibility
    expect(wrapper.get('main').classes()).toContain('lg:col-span-2')
    expect(wrapper.get('main').classes()).toContain('lg:col-start-1')
  })

  it('HistorySidebar: shows an empty state when there is no history', async () => {
    const store = createStore({
      state: { session_uuid: 's', history: [] },
      getters: { history: () => [] },
    })

    const wrapper = mount(HistorySidebar, { global: { plugins: [[store, key]] } })
    expect(wrapper.text()).toContain('No locations saved yet')
  })

  it('HistorySidebar: clicking 🗑️ dispatches deleteLocation and does not emit center-map', async () => {
    const dispatch = vi.fn()

    const store = createStore({
      state: { session_uuid: 's', history: [] },
      getters: {
        history: () => [{ id: 9, lat: -33.86, lng: 151.20, address: 'Somewhere' }],
      },
      // Vuex store dispatch is a method on the store instance; override after create.
    })
    ;(store as any).dispatch = dispatch

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = mount(HistorySidebar, { global: { plugins: [[store, key]] } })

    await wrapper.get('button[aria-label="Delete saved location"]').trigger('click')
    expect(dispatch).toHaveBeenCalledWith('deleteLocation', 9)
    expect(wrapper.emitted('center-map')).toBeUndefined()

    confirmSpy.mockRestore()
  })
})


