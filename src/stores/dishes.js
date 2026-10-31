import { defineStore } from 'pinia'
import { db } from '../db'
import { uid } from '../utils/calc'
import { sync } from '../sync/supabase'

export const useDishStore = defineStore('dishes', {
  state: () => ({
    list: [],
    loaded: false,
    _bound: false
  }),
  getters: {
    activeList: (s) => s.list.filter((d) => !d.deleted),
    byId: (s) => (id) => s.list.find((d) => d.id === id)
  },
  actions: {
    async load() {
      this.list = await db.dishes.where('deleted').equals(0).toArray()
      this.list.sort((a, b) => b.updatedAt - a.updatedAt)
      this.loaded = true
      this.bindSync()
    },
    /** 订阅云端实时变更，更新内存列表 */
    bindSync() {
      if (this._bound) return
      this._bound = true
      sync.on((event, payload) => {
        if (event === 'dish-changed') {
          if (payload.deleted) {
            this.list = this.list.filter((d) => d.id !== payload.id)
            return
          }
          const i = this.list.findIndex((d) => d.id === payload.id)
          if (i >= 0) this.list.splice(i, 1, payload)
          else this.list.unshift(payload)
          this.list.sort((a, b) => b.updatedAt - a.updatedAt)
        } else if (event === 'dish-deleted') {
          this.list = this.list.filter((d) => d.id !== payload)
        } else if (event === 'pulled') {
          this.load()
        }
      })
    },
    async addDish(data) {
      const now = Date.now()
      const row = {
        id: uid(),
        deleted: 0,
        builtin: false,
        customImage: null,
        createdAt: now,
        updatedAt: now,
        emoji: '🍽️',
        category: '主食',
        kcalPer100g: 0,
        defaultPortionG: 100,
        ...data
      }
      await db.dishes.add(row)
      this.list.unshift(row)
      sync.pushDish(row)
      return row
    },
    async updateDish(id, patch) {
      const row = this.list.find((d) => d.id === id)
      if (!row) return
      const next = { ...row, ...patch, updatedAt: Date.now() }
      await db.dishes.put(next)
      Object.assign(row, patch, { updatedAt: next.updatedAt })
      sync.pushDish(next)
    },
    async removeDish(id) {
      const row = this.list.find((d) => d.id === id)
      if (!row) return
      const updatedAt = Date.now()
      await db.dishes.update(id, { deleted: 1, updatedAt })
      this.list = this.list.filter((d) => d.id !== id)
      sync.pushDish({ ...row, deleted: 1, updatedAt })
    },
    /**
     * 批量导入：按换行/逗号/顿号/分号切分，同名菜品跳过
     * 返回新增数量
     */
    async batchImport(text, category = '主食') {
      const names = text
        .split(/[\n,，、;；\t]+/)
        .map((s) => s.trim())
        .filter(Boolean)
      const existing = new Set(this.activeList.map((d) => d.name))
      const now = Date.now()
      const rows = []
      for (const name of names) {
        if (existing.has(name)) continue
        existing.add(name)
        rows.push({
          id: uid(),
          name,
          category,
          emoji: '🍽️',
          kcalPer100g: 0,
          defaultPortionG: 100,
          deleted: 0,
          builtin: false,
          customImage: null,
          createdAt: now,
          updatedAt: now
        })
      }
      if (rows.length) {
        await db.dishes.bulkAdd(rows)
        this.list.unshift(...rows)
        rows.forEach((r) => sync.pushDish(r))
      }
      return rows.length
    }
  }
})
