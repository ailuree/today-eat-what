import { defineStore } from 'pinia'
import { db } from '../db'
import { uid, kcalByGrams, kcalByServings } from '../utils/calc'
import { sync } from '../sync/supabase'

export const useMealStore = defineStore('meals', {
  state: () => ({
    // 按日期缓存的进食记录 { 'YYYY-MM-DD': [] }
    byDate: {},
    _bound: false
  }),
  getters: {
    totalKcal: (s) => (date) =>
      (s.byDate[date] || []).reduce((sum, r) => sum + (r.kcal || 0), 0),
    records: (s) => (date) => s.byDate[date] || []
  },
  actions: {
    async loadDate(date) {
      if (this.byDate[date]) return this.byDate[date]
      const rows = await db.meals.where('date').equals(date).toArray()
      rows.sort((a, b) => a.createdAt - b.createdAt)
      this.byDate[date] = rows
      this.bindSync()
      return rows
    },
    bindSync() {
      if (this._bound) return
      this._bound = true
      sync.on((event, payload) => {
        if (event === 'meal-changed') {
          const date = payload.date
          if (!this.byDate[date]) this.byDate[date] = []
          const i = this.byDate[date].findIndex((r) => r.id === payload.id)
          if (i >= 0) this.byDate[date].splice(i, 1, payload)
          else this.byDate[date].push(payload)
          this.byDate[date].sort((a, b) => a.createdAt - b.createdAt)
        } else if (event === 'meal-deleted') {
          for (const d of Object.keys(this.byDate)) {
            this.byDate[d] = this.byDate[d].filter((r) => r.id !== payload)
          }
        }
      })
    },
    /**
     * 新增一条进食记录
     * mode: 'portion' 按份（servings 份），'grams' 按克
     */
    async addMeal({ date, mealType, dish, mode = 'portion', servings = 1, grams, operatorId = 'me', note = '' }) {
      const kcal = mode === 'grams' ? kcalByGrams(dish, grams) : kcalByServings(dish, servings)
      const row = {
        id: uid(),
        date,
        mealType,
        dishId: dish.id,
        dishName: dish.name,
        emoji: dish.emoji,
        mode,
        servings: mode === 'portion' ? servings : 1,
        grams: mode === 'grams' ? grams : null,
        kcal,
        operatorId,
        note,
        createdAt: Date.now()
      }
      await db.meals.add(row)
      if (!this.byDate[date]) this.byDate[date] = []
      this.byDate[date].push(row)
      sync.pushMeal(row)
      return row
    },
    async removeMeal(date, id) {
      await db.meals.delete(id)
      if (this.byDate[date]) {
        this.byDate[date] = this.byDate[date].filter((r) => r.id !== id)
      }
      sync.deleteMeal(id)
    },
    async recordSpin({ dish, presetId = null }) {
      const row = {
        id: uid(),
        timestamp: Date.now(),
        dishId: dish.id,
        dishName: dish.name,
        presetId
      }
      await db.spins.add(row)
      if (sync.online) {
        const { error } = await sync.client
          .from('spins')
          .insert({ id: row.id, room_id: sync.room.id, dish_id: dish.id, dish_name: dish.name, operator_id: sync.userId })
        if (error) console.error('推送抽签历史失败', error.message)
      }
    }
  }
})
