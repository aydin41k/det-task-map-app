import axios from 'axios'
import { createStore } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import type { InjectionKey } from 'vue'
import type { Store, Commit } from 'vuex'
import type { LocationRecord } from '../types'

export interface State {
  session_uuid: string | null
  history: LocationRecord[]
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    session_uuid: localStorage.getItem('map_session_uuid') || null,
    history: [],
  },
  mutations: {
    SET_SESSION(state: State, uuid: string) {
      state.session_uuid = uuid
      localStorage.setItem('map_session_uuid', uuid)
    },

    SET_HISTORY(state: State, locations: LocationRecord[]) {
      state.history = locations
    },
    
    ADD_LOCATION(state: State, location: LocationRecord) {
      state.history.unshift(location)
    },
  },
  actions: {
    initSession({ commit, state }: { commit: Commit; state: State }) {
      if (!state.session_uuid) {
        const newUuid = uuidv4()
        commit('SET_SESSION', newUuid)
      }
    },
    
    async fetchHistory({ state, commit }: { state: State; commit: Commit }) {
      if (!state.session_uuid) return
      try {
        const res = await axios.get<LocationRecord[]>(`/api/history/${state.session_uuid}`)
        commit('SET_HISTORY', res.data)
      } catch (error) {
        console.error('Fetch history failed:', error)
      }
    },

    async saveLocation({ state, commit }: { state: State; commit: Commit }, payload: LocationRecord) {
      try {
        const body = {
          session_uuid: state.session_uuid,
          lat: payload.lat,
          lng: payload.lng,
          address: payload.address,
        }
        await axios.post('/api/location', body)

        // Optimistic update
        commit('ADD_LOCATION', { ...body, id: Date.now().toString() })
      } catch (error) {
        console.error('Save location failed:', error)
      }
    },
  },
  getters: {
    history: (state: State) => state.history,
  },
})
