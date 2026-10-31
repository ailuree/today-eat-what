import { defineStore } from 'pinia'
import { getMeta, setMeta } from '../db'

/**
 * 彻底剥离 Vue 响应式 Proxy，转成可被 IndexedDB 结构化克隆的纯对象。
 * meta 中只含字符串/数字等简单数据，JSON 转换安全。
 */
function toPlain(value) {
  return JSON.parse(JSON.stringify(value))
}

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
      await setMeta('dailyGoal', toPlain(this.dailyGoal))
      await setMeta('dailyGoalB', toPlain(this.dailyGoalB))
    },
    async saveProfiles() {
      await setMeta('profiles', toPlain(this.profiles))
    },
    async saveRoom(room) {
      this.room = room
      await setMeta('room', toPlain(room))
    }
  }
})
