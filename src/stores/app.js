import { defineStore } from 'pinia'
import { getMeta, setMeta } from '../db'

export const useAppStore = defineStore('app', {
  state: () => ({
    dailyGoal: 1700,
    dailyGoalB: 1400,
    profiles: [
      { id: 'me', name: '我', emoji: '🙋', color: '#E8833A' },
      { id: 'partner', name: 'TA', emoji: '🙋‍♀️', color: '#E5989B' }
    ],
    room: null,
    loaded: false
  }),
  getters: {
    profileById: (s) => (id) => s.profiles.find((p) => p.id === id) || s.profiles[0]
  },
  actions: {
    async load() {
      this.dailyGoal = await getMeta('dailyGoal', 1700)
      this.dailyGoalB = await getMeta('dailyGoalB', 1400)
      this.profiles = await getMeta('profiles', this.profiles)
      this.room = await getMeta('room', null)
      this.loaded = true
    },
    async saveGoals() {
      await setMeta('dailyGoal', this.dailyGoal)
      await setMeta('dailyGoalB', this.dailyGoalB)
    },
    async saveProfiles() {
      await setMeta('profiles', this.profiles)
    },
    async saveRoom(room) {
      this.room = room
      await setMeta('room', room)
    }
  }
})
