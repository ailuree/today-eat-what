<template>
  <div class="page">
    <div class="hello">
      <div>
        <h2 class="hello-title">{{ greeting }}</h2>
        <p class="muted">{{ today }} · 今天也要好好吃饭</p>
      </div>
      <router-link to="/wheel" class="go-wheel">🎡</router-link>
    </div>

    <!-- 视图切换：我 / TA / 合计 -->
    <div class="viewer-switch">
      <button
        v-for="v in viewerOptions"
        :key="v.id"
        class="viewer-btn"
        :class="{ active: viewer === v.id }"
        @click="viewer = v.id"
      >
        {{ v.emoji }} {{ v.label }}
      </button>
    </div>

    <!-- 热量进度环 -->
    <div class="card progress-card">
      <div class="ring">
        <svg viewBox="0 0 120 120" class="ring-svg">
          <circle cx="60" cy="60" r="50" class="ring-bg" />
          <circle
            cx="60"
            cy="60"
            r="50"
            class="ring-fg"
            :class="{ over: total > goal }"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
        </svg>
        <div class="ring-center">
          <div class="ring-num num">{{ total }}</div>
          <div class="muted">/ {{ goal }} 千卡</div>
        </div>
      </div>
      <div class="progress-side">
        <div class="side-item">
          <span class="dot" :style="{ background: total > goal ? 'var(--tomato)' : 'var(--mint)' }"></span>
          <div>
            <div class="muted">剩余可吃</div>
            <div class="num" :class="{ over: total > goal }">{{ Math.max(0, goal - total) }} 千卡</div>
          </div>
        </div>
        <div class="side-item">
          <span class="dot" style="background: var(--pink)"></span>
          <div>
            <div class="muted">记录条数</div>
            <div class="num">{{ records.length }} 条</div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm mt-8" @click="openQuick">＋ 快速加一餐</button>
      </div>
    </div>

    <!-- 今日菜单 -->
    <div v-for="m in mealTypes" :key="m" class="card meal-card">
      <div class="flex-between mb-12">
        <strong>{{ mealIcon[m] }} {{ m }}</strong>
        <span class="muted num">{{ groupKcal(m) }} 千卡</span>
      </div>
      <div v-if="!groupRecords(m).length" class="muted">还没记录</div>
      <div v-for="r in groupRecords(m)" :key="r.id" class="meal-row">
        <span class="meal-emoji">{{ r.emoji }}</span>
        <div class="meal-detail">
          <div class="meal-name">{{ r.dishName }}</div>
          <div class="muted">
            {{ r.mode === 'grams' ? `${r.grams}克` : `${r.servings}份` }}
            <span v-if="operatorName(r.operatorId)"> · {{ operatorName(r.operatorId) }}</span>
          </div>
        </div>
        <span class="num meal-kcal">{{ r.kcal }}</span>
        <button class="del-btn" @click="removeRecord(r)">×</button>
      </div>
    </div>

    <!-- 快速加一餐 -->
    <div v-if="showQuick" class="modal-mask" @click.self="showQuick = false">
      <div class="modal">
        <div class="modal-title">快速加一餐</div>
        <div class="field">
          <label>餐次</label>
          <div class="flex gap-8" style="flex-wrap: wrap">
            <button
              v-for="m in mealTypes"
              :key="m"
              class="chip"
              :class="{ active: quickMealType === m }"
              @click="quickMealType = m"
            >
              {{ m }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>这餐是谁吃的</label>
          <div class="flex gap-8">
            <button
              v-for="p in peopleOptions"
              :key="p.id"
              class="chip"
              :class="{ active: quickOperator === p.id }"
              @click="quickOperator = p.id"
            >
              {{ p.emoji }} {{ p.label }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>选择菜品</label>
          <input v-model="quickKw" class="input" placeholder="搜索菜品名" />
        </div>
        <div class="quick-list">
          <button
            v-for="d in quickList"
            :key="d.id"
            class="pick-item"
            :class="{ on: quickDish?.id === d.id }"
            @click="quickDish = d"
          >
            <span class="pick-emoji">{{ d.emoji }}</span>
            <span class="pick-name">{{ d.name }}</span>
            <span class="muted">{{ portionKcal(d) }}千卡/份</span>
          </button>
        </div>
        <div class="flex gap-8 mt-12">
          <button class="btn btn-ghost" style="flex: 1" @click="showQuick = false">取消</button>
          <button class="btn btn-primary" style="flex: 1" :disabled="!quickDish" @click="confirmQuick">
            确认（1 份）
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDishStore } from '../stores/dishes'
import { useMealStore } from '../stores/meals'
import { useAppStore } from '../stores/app'
import { portionKcal, todayStr } from '../utils/calc'

const dishStore = useDishStore()
const mealStore = useMealStore()
const appStore = useAppStore()

const date = todayStr()
const mealTypes = ['早餐', '午餐', '晚餐', '加餐']
const mealIcon = { 早餐: '🌅', 午餐: '☀️', 晚餐: '🌙', 加餐: '🍪' }

const showQuick = ref(false)
const quickMealType = ref('午餐')
const quickKw = ref('')
const quickDish = ref(null)
const quickOperator = ref('me')

// 视图切换
const viewer = ref('me')
const viewerOptions = [
  { id: 'me', label: '我', emoji: appStore.profiles[0]?.emoji || '🙋' },
  { id: 'partner', label: 'TA', emoji: appStore.profiles[1]?.emoji || '🙋‍♀️' },
  { id: 'all', label: '合计', emoji: '👫' }
]
const peopleOptions = [
  { id: 'me', label: '我', emoji: appStore.profiles[0]?.emoji || '🙋' },
  { id: 'partner', label: 'TA', emoji: appStore.profiles[1]?.emoji || '🙋‍♀️' }
]

onMounted(async () => {
  if (!dishStore.loaded) await dishStore.load()
  if (!appStore.loaded) await appStore.load()
  await mealStore.loadDate(date)
})

// 当前视图下包含的用餐人（旧记录无 operatorId 时按“我”处理）
const activeOperators = computed(() => (viewer.value === 'all' ? ['me', 'partner'] : [viewer.value]))

const records = computed(() =>
  mealStore.records(date).filter((r) => activeOperators.value.includes(r.operatorId || 'me'))
)
const total = computed(() => records.value.reduce((s, r) => s + (r.kcal || 0), 0))
const goal = computed(() => {
  if (viewer.value === 'me') return appStore.dailyGoal
  if (viewer.value === 'partner') return appStore.dailyGoalB
  return appStore.dailyGoal + appStore.dailyGoalB
})

const circumference = 2 * Math.PI * 50
const dashOffset = computed(() => {
  const ratio = Math.min(1, total.value / goal.value)
  return circumference * (1 - ratio)
})

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，早点休息'
  if (h < 11) return '早上好呀'
  if (h < 14) return '中午好，吃饭啦'
  if (h < 18) return '下午好'
  return '晚上好'
})

const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })

function groupRecords(m) {
  return records.value.filter((r) => r.mealType === m)
}
function groupKcal(m) {
  return groupRecords(m).reduce((s, r) => s + r.kcal, 0)
}
function operatorName(id) {
  if (!id) return ''
  const p = appStore.profileById(id)
  return p ? p.name : ''
}
async function removeRecord(r) {
  if (confirm(`删除「${r.dishName}」这条记录？`)) {
    await mealStore.removeMeal(date, r.id)
  }
}

const quickList = computed(() => {
  const kw = quickKw.value.trim()
  const list = dishStore.activeList
  return kw ? list.filter((d) => d.name.includes(kw)) : list
})

async function confirmQuick() {
  if (!quickDish.value) return
  await mealStore.addMeal({
    date,
    mealType: quickMealType.value,
    dish: quickDish.value,
    operatorId: quickOperator.value
  })
  showQuick.value = false
  quickDish.value = null
  quickKw.value = ''
}

// 打开快速弹窗：默认用餐人跟随当前视图（合计时默认“我”）
function openQuick() {
  quickOperator.value = viewer.value === 'partner' ? 'partner' : 'me'
  showQuick.value = true
}
</script>

<style scoped>
.hello {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.hello-title {
  font-size: 24px;
  font-weight: 800;
}
.go-wheel {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #fff;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  text-decoration: none;
}
.viewer-switch {
  display: flex;
  gap: 6px;
  background: var(--cream);
  padding: 5px;
  border-radius: 14px;
  margin-bottom: 14px;
}
.viewer-btn {
  flex: 1;
  padding: 8px 4px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink-soft);
  transition: background 0.15s ease, color 0.15s ease;
}
.viewer-btn.active {
  background: #fff;
  color: var(--amber-dark);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.progress-card {
  display: flex;
  align-items: center;
  gap: 16px;
}
.ring {
  position: relative;
  width: 132px;
  height: 132px;
  flex-shrink: 0;
}
.ring-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.ring-bg {
  fill: none;
  stroke: var(--cream-deep);
  stroke-width: 10;
}
.ring-fg {
  fill: none;
  stroke: var(--amber);
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
}
.ring-fg.over {
  stroke: var(--tomato);
}
.ring-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.ring-num {
  font-size: 26px;
}
.progress-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.side-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.over {
  color: var(--tomato);
}
.meal-card {
  margin-top: 14px;
}
.meal-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-top: 1px solid var(--line);
}
.meal-emoji {
  font-size: 22px;
}
.meal-detail {
  flex: 1;
}
.meal-name {
  font-weight: 700;
}
.meal-kcal {
  min-width: 48px;
  text-align: right;
}
.del-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--cream);
  color: var(--tomato);
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
}
.quick-list {
  max-height: 40vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pick-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: #fff;
  text-align: left;
}
.pick-item.on {
  border-color: var(--amber);
  background: var(--amber-soft);
}
.pick-emoji {
  font-size: 20px;
}
.pick-name {
  font-weight: 600;
}
.mb-12 {
  margin-bottom: 12px;
}
</style>
