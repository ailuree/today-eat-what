<template>
  <div class="page">
    <div class="page-title">📊 热量统计</div>

    <!-- 统计对象切换 -->
    <div class="stat-switch">
      <button
        v-for="v in statViewerOptions"
        :key="v.id"
        class="stat-btn"
        :class="{ active: statViewer === v.id }"
        @click="statViewer = v.id"
      >
        {{ v.emoji }} {{ v.label }}
      </button>
    </div>

    <!-- 月份切换 -->
    <div class="card">
      <div class="flex-between mb-12">
        <button class="btn btn-ghost btn-sm" @click="changeMonth(-1)">‹ 上月</button>
        <strong>{{ cursor.getFullYear() }} 年 {{ cursor.getMonth() + 1 }} 月</strong>
        <button class="btn btn-ghost btn-sm" @click="changeMonth(1)">下月 ›</button>
      </div>

      <div class="cal-week">
        <span v-for="w in weekNames" :key="w">{{ w }}</span>
      </div>
      <div class="cal-grid">
        <div
          v-for="(cell, i) in calendarCells"
          :key="i"
          class="cal-cell"
          :class="{ blank: !cell, clickable: cell }"
          @click="cell && openDay(cell)"
        >
          <template v-if="cell">
            <span class="cal-day" :class="{ today: cell.dateStr === todayStr() }">{{ cell.day }}</span>
            <span
              v-if="cell.kcal > 0"
              class="cal-kcal num"
              :class="kcalClass(cell.kcal)"
            >{{ cell.kcal }}</span>
          </template>
        </div>
      </div>

      <div class="cal-tip mt-12 muted">点击任意日期，可查看当天吃了什么</div>

      <div class="cal-legend mt-12 muted">
        <span><i style="background: var(--mint)"></i>达标</span>
        <span><i style="background: var(--amber)"></i>接近目标</span>
        <span><i style="background: var(--tomato)"></i>超标</span>
      </div>
    </div>

    <!-- 月度汇总 -->
    <div class="card summary-card">
      <div class="summary-item">
        <div class="num big">{{ monthSummary.avg }}</div>
        <div class="muted">日均热量</div>
      </div>
      <div class="summary-item">
        <div class="num big" style="color: var(--mint)">{{ monthSummary.goodDays }}</div>
        <div class="muted">达标天数</div>
      </div>
      <div class="summary-item">
        <div class="num big" style="color: var(--tomato)">{{ monthSummary.overDays }}</div>
        <div class="muted">超标天数</div>
      </div>
    </div>

    <!-- 近 7 天趋势 -->
    <div class="card">
      <strong>近 7 天热量趋势</strong>
      <div ref="chartRef" class="chart"></div>
    </div>

    <!-- 历史当天详情 -->
    <DayDetailModal
      v-if="selectedDate"
      :date-str="selectedDate"
      :records="selectedRecords"
      :goal="statGoal"
      @close="selectedDate = ''"
      @remove="onRemoveRecord"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import * as echarts from 'echarts'
import { db } from '../db'
import { useAppStore } from '../stores/app'
import { useMealStore } from '../stores/meals'
import { todayStr } from '../utils/calc'
import DayDetailModal from '../components/DayDetailModal.vue'

const appStore = useAppStore()
const mealStore = useMealStore()
const cursor = ref(new Date())
const allMeals = ref([])
const selectedDate = ref('')
const chartRef = ref(null)
let chart = null

// 统计对象切换
const statViewer = ref('me')
const statViewerOptions = computed(() => [
  { id: 'me', label: '我', emoji: appStore.profiles[0]?.emoji || '🙋' },
  { id: 'partner', label: 'TA', emoji: appStore.profiles[1]?.emoji || '🙋‍♀️' },
  { id: 'all', label: '合计', emoji: '👫' }
])
const statOperators = computed(() =>
  statViewer.value === 'all' ? ['me', 'partner'] : [statViewer.value]
)
// 按统计对象过滤后的记录（旧记录无 operatorId 时按“我”处理）
const filteredMeals = computed(() =>
  allMeals.value.filter((r) => statOperators.value.includes(r.operatorId || 'me'))
)
const statGoal = computed(() => {
  if (statViewer.value === 'me') return appStore.dailyGoal
  if (statViewer.value === 'partner') return appStore.dailyGoalB
  return appStore.dailyGoal + appStore.dailyGoalB
})

const weekNames = ['一', '二', '三', '四', '五', '六', '日']

onMounted(async () => {
  if (!appStore.loaded) await appStore.load()
  allMeals.value = await db.meals.toArray()
  await nextTick()
  renderChart()
})

watch([cursor, statViewer], () => {
  nextTick(() => renderChart())
})

/** 按日期聚合的热量映射（跟随统计对象） */
const kcalMap = computed(() => {
  const map = {}
  for (const r of filteredMeals.value) {
    map[r.date] = (map[r.date] || 0) + (r.kcal || 0)
  }
  return map
})

const calendarCells = computed(() => {
  const year = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const firstDay = new Date(year, month, 1)
  // 周一开头：getDay 0(周日) -> 6
  const lead = (firstDay.getDay() + 6) % 7
  const days = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= days; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, dateStr, kcal: kcalMap.value[dateStr] || 0 })
  }
  return cells
})

function kcalClass(kcal) {
  const goal = statGoal.value
  if (kcal > goal) return 'over'
  if (kcal > goal * 0.85) return 'near'
  return 'good'
}

const monthSummary = computed(() => {
  const monthDates = calendarCells.value.filter(Boolean).map((c) => c.dateStr)
  const recorded = monthDates.filter((d) => (kcalMap.value[d] || 0) > 0)
  const total = recorded.reduce((s, d) => s + kcalMap.value[d], 0)
  const goal = statGoal.value
  return {
    avg: recorded.length ? Math.round(total / recorded.length) : 0,
    goodDays: recorded.filter((d) => kcalMap.value[d] <= goal).length,
    overDays: recorded.filter((d) => kcalMap.value[d] > goal).length
  }
})

function changeMonth(delta) {
  const d = new Date(cursor.value)
  d.setMonth(d.setMonth(d.getMonth() + delta))
  cursor.value = d
}

/* ---------- 历史当天详情 ---------- */
function openDay(cell) {
  selectedDate.value = cell.dateStr
}

const selectedRecords = computed(() =>
  filteredMeals.value
    .filter((r) => r.date === selectedDate.value)
    .sort((a, b) => a.createdAt - b.createdAt)
)

async function onRemoveRecord(record) {
  if (!confirm(`删除「${record.dishName}」这条记录？`)) return
  await mealStore.removeMeal(record.date, record.id)
  // 重新读取并刷新月历数字
  allMeals.value = await db.meals.toArray()
}

function renderChart() {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  const dates = []
  const values = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const s = todayStr(d)
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
    values.push(kcalMap.value[s] || 0)
  }
  const goal = statGoal.value
  chart.setOption({
    grid: { left: 40, right: 12, top: 24, bottom: 28 },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: dates, axisLine: { lineStyle: { color: '#C9BBA6' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#EFE6D6' } } },
    series: [
      {
        type: 'bar',
        data: values.map((v) => ({
          value: v,
          itemStyle: { color: v > goal ? '#E0584C' : v > goal * 0.85 ? '#E8833A' : '#7FB77E', borderRadius: [5, 5, 0, 0] }
        })),
        barWidth: '52%',
        markLine: {
          symbol: 'none',
          lineStyle: { color: '#B5838D', type: 'dashed' },
          data: [{ yAxis: goal, label: { formatter: `目标 ${goal}` } }]
        }
      }
    ]
  })
  window.addEventListener('resize', resizeChart)
}

function resizeChart() {
  chart && chart.resize()
}
</script>

<style scoped>
.stat-switch {
  display: flex;
  gap: 6px;
  background: var(--cream);
  padding: 5px;
  border-radius: 14px;
  margin-bottom: 14px;
}
.stat-btn {
  flex: 1;
  padding: 8px 4px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink-soft);
  transition: background 0.15s ease, color 0.15s ease;
}
.stat-btn.active {
  background: #fff;
  color: var(--amber-dark);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.cal-week,
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.cal-week {
  margin-bottom: 6px;
  color: var(--ink-soft);
  font-size: 12px;
  text-align: center;
  font-weight: 700;
}
.cal-cell {
  min-height: 52px;
  border-radius: 10px;
  background: var(--cream);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px 2px;
}
.cal-cell.blank {
  background: transparent;
}
.cal-cell.clickable {
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.cal-cell.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}
.cal-tip {
  font-size: 12px;
  text-align: center;
}
.cal-day {
  font-size: 12px;
  color: var(--ink-soft);
}
.cal-day.today {
  color: #fff;
  background: var(--amber);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}
.cal-kcal {
  font-size: 12px;
}
.cal-kcal.good {
  color: var(--mint);
}
.cal-kcal.near {
  color: var(--amber-dark);
}
.cal-kcal.over {
  color: var(--tomato);
}
.cal-legend {
  display: flex;
  gap: 16px;
}
.cal-legend i {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 4px;
}
.summary-card {
  display: flex;
  margin-top: 14px;
}
.summary-item {
  flex: 1;
  text-align: center;
}
.summary-item .big {
  font-size: 24px;
}
.chart {
  width: 100%;
  height: 220px;
  margin-top: 8px;
}
.mb-12 {
  margin-bottom: 12px;
}
.mt-12 {
  margin-top: 12px;
}
</style>
