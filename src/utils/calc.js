/** 一份（默认份量）的热量 */
export function portionKcal(dish) {
  if (!dish || !dish.kcalPer100g) return 0
  return Math.round((dish.kcalPer100g * (dish.defaultPortionG || 100)) / 100)
}

/** 按实际克数计算热量 */
export function kcalByGrams(dish, grams) {
  if (!dish || !dish.kcalPer100g || !grams) return 0
  return Math.round((dish.kcalPer100g * grams) / 100)
}

/** 按份数计算热量 */
export function kcalByServings(dish, servings) {
  return Math.round(portionKcal(dish) * (servings || 1))
}

/** 今日日期字符串 YYYY-MM-DD（本地时区） */
export function todayStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 生成随机 id */
export function uid() {
  return crypto.randomUUID()
}

/** 密码学安全的等概率整数 [0, max) */
export function randomInt(max) {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return arr[0] % max
}
