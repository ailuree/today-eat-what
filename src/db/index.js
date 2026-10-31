import Dexie from 'dexie'
import { seedDishes } from './seed'

class EatWhatDB extends Dexie {
  constructor() {
    super('eat-what-db')
    this.version(1).stores({
      // 主键 id，建立常用查询索引
      dishes: 'id, name, category, updatedAt, deleted',
      meals: 'id, date, mealType, dishId, operatorId',
      spins: 'id, timestamp, dishId, presetId',
      presets: 'id, name',
      stickers: 'id, type',
      meta: 'key'
    })
  }
}

export const db = new EatWhatDB()

/**
 * 首次启动写入内置菜品；已有数据则跳过，不覆盖用户修改
 */
export async function ensureSeed() {
  const count = await db.dishes.count()
  if (count === 0) {
    const now = Date.now()
    const rows = seedDishes.map((d) => ({
      id: crypto.randomUUID(),
      deleted: 0,
      builtin: true,
      createdAt: now,
      updatedAt: now,
      customImage: null,
      ...d
    }))
    await db.dishes.bulkAdd(rows)
  }
  // 默认设置
  const goal = await db.meta.get('dailyGoal')
  if (!goal) {
    await db.meta.bulkPut([
      { key: 'dailyGoal', value: 1700 },
      { key: 'dailyGoalB', value: 1400 },
      { key: 'profiles', value: [{ id: 'me', name: '我', emoji: '🙋', color: '#E8833A' }, { id: 'partner', name: 'TA', emoji: '🙋‍♀️', color: '#E5989B' }] },
      { key: 'room', value: null }
    ])
  }
}

/** 读取 meta 项 */
export async function getMeta(key, fallback = null) {
  const row = await db.meta.get(key)
  return row ? row.value : fallback
}

/** 写入 meta 项 */
export async function setMeta(key, value) {
  await db.meta.put({ key, value })
}
