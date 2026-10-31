<template>
  <div class="page">
    <div class="page-title">🎡 命运转盘</div>

    <TheWheel ref="wheelRef" :items="selected" @done="onDone" />

    <button class="btn btn-primary btn-block mt-16" :disabled="selected.length < 2 || busy" @click="startSpin">
      {{ busy ? '转动中…' : '开始转动' }}
    </button>

    <div class="card mt-16">
      <div class="flex-between mb-12">
        <strong>候选菜品（{{ selected.length }}）</strong>
        <button class="btn btn-ghost btn-sm" @click="showPicker = true">选择菜品</button>
      </div>
      <div v-if="!selected.length" class="muted">点击「选择菜品」，至少挑 2 样才能转</div>
      <div class="selected-chips">
        <span v-for="d in selected" :key="d.id" class="chip selected-chip">
          {{ d.emoji }} {{ d.name }}
          <button class="x" @click="removeSelected(d.id)">×</button>
        </span>
      </div>
    </div>

    <!-- 菜品选择器 -->
    <div v-if="showPicker" class="modal-mask" @click.self="showPicker = false">
      <div class="modal">
        <div class="modal-title">选择候选菜品</div>
        <div class="chip-row mb-12">
          <button class="chip" :class="{ active: pickCat === '全部' }" @click="pickCat = '全部'">全部</button>
          <button
            v-for="c in categories"
            :key="c"
            class="chip"
            :class="{ active: pickCat === c }"
            @click="pickCat = c"
          >
            {{ c }}
          </button>
        </div>
        <div class="flex gap-8 mb-12">
          <button class="btn btn-ghost btn-sm" @click="selectAll">全选当前</button>
          <button class="btn btn-ghost btn-sm" @click="clearAll">清空</button>
        </div>
        <div class="pick-list">
          <label v-for="d in pickList" :key="d.id" class="pick-item" :class="{ on: chosenIds.has(d.id) }">
            <input type="checkbox" :checked="chosenIds.has(d.id)" @change="toggle(d)" />
            <span class="pick-emoji">{{ d.emoji }}</span>
            <span class="pick-name">{{ d.name }}</span>
            <span class="muted">{{ portionKcal(d) }}千卡</span>
          </label>
        </div>
        <button class="btn btn-primary btn-block mt-12" @click="confirmPick">确定（{{ chosenIds.size }}）</button>
      </div>
    </div>

    <!-- 结果弹窗 -->
    <div v-if="result" class="modal-mask">
      <div class="modal result-modal">
        <div class="result-emoji">{{ result.emoji }}</div>
        <div class="result-title">今天就吃「{{ result.name }}」！</div>
        <div class="muted mb-12">一份约 {{ portionKcal(result) }} 千卡（{{ result.defaultPortionG }}克）</div>

        <div class="field">
          <label>这餐是谁吃的</label>
          <div class="flex gap-8">
            <button
              v-for="p in resultPeople"
              :key="p.id"
              class="chip"
              :class="{ active: resultOperator === p.id }"
              @click="resultOperator = p.id"
            >
              {{ p.emoji }} {{ p.label }}
            </button>
          </div>
        </div>

        <div class="field">
          <label>计入哪一餐</label>
          <div class="flex gap-8" style="flex-wrap: wrap">
            <button
              v-for="m in mealTypes"
              :key="m"
              class="chip"
              :class="{ active: resultMealType === m }"
              @click="resultMealType = m"
            >
              {{ m }}
            </button>
          </div>
        </div>

        <div class="field">
          <label>记录方式</label>
          <div class="flex gap-8">
            <button class="chip" :class="{ active: resultMode === 'portion' }" @click="resultMode = 'portion'">按份</button>
            <button class="chip" :class="{ active: resultMode === 'grams' }" @click="resultMode = 'grams'">按克</button>
          </div>
        </div>

        <div v-if="resultMode === 'portion'" class="field">
          <label>份数</label>
          <input v-model.number="resultServings" type="number" min="0.25" step="0.25" class="input" />
        </div>
        <div v-else class="field">
          <label>实际克数</label>
          <input v-model.number="resultGrams" type="number" min="1" class="input" />
        </div>

        <div class="muted mb-12">本餐将记录 <span class="num">{{ resultKcal }}</span> 千卡</div>

        <div class="flex gap-8">
          <button class="btn btn-ghost" style="flex: 1" @click="result = null">关闭</button>
          <button class="btn btn-ghost" style="flex: 1" @click="respin">再转一次</button>
          <button class="btn btn-primary" style="flex: 1" @click="saveResult">加入今日</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import confetti from 'canvas-confetti'
import TheWheel from '../components/TheWheel.vue'
import { useDishStore } from '../stores/dishes'
import { useMealStore } from '../stores/meals'
import { useAppStore } from '../stores/app'
import { categories } from '../db/seed'
import { portionKcal, kcalByGrams, kcalByServings, todayStr } from '../utils/calc'

const dishStore = useDishStore()
const mealStore = useMealStore()
const appStore = useAppStore()
const wheelRef = ref(null)

const chosenIds = ref(new Set())
const showPicker = ref(false)
const pickCat = ref('全部')
const busy = ref(false)
const result = ref(null)
const resultMealType = ref(defaultMealType())
const resultMode = ref('portion')
const resultServings = ref(1)
const resultGrams = ref(200)
const resultOperator = ref('me')

const resultPeople = computed(() =>
  appStore.profiles.map((p) => ({ id: p.id, label: p.name, emoji: p.emoji }))
)

onMounted(async () => {
  if (!dishStore.loaded) await dishStore.load()
  // 默认选中全部菜品（首次进入），重新赋值 Set 以触发响应式更新
  if (chosenIds.value.size === 0) {
    dishStore.activeList.forEach((d) => chosenIds.value.add(d.id))
    chosenIds.value = new Set(chosenIds.value)
  }
})

const selected = computed(() =>
  [...chosenIds.value]
    .map((id) => dishStore.byId(id))
    .filter(Boolean)
)

const pickList = computed(() =>
  pickCat.value === '全部'
    ? dishStore.activeList
    : dishStore.activeList.filter((d) => d.category === pickCat.value)
)

const mealTypes = ['早餐', '午餐', '晚餐', '加餐']

function defaultMealType() {
  const h = new Date().getHours()
  if (h < 10) return '早餐'
  if (h < 14) return '午餐'
  if (h < 17) return '加餐'
  if (h < 21) return '晚餐'
  return '加餐'
}

function toggle(d) {
  if (chosenIds.value.has(d.id)) chosenIds.value.delete(d.id)
  else chosenIds.value.add(d.id)
  // 触发响应式
  chosenIds.value = new Set(chosenIds.value)
}
function selectAll() {
  pickList.value.forEach((d) => chosenIds.value.add(d.id))
  chosenIds.value = new Set(chosenIds.value)
}
function clearAll() {
  chosenIds.value = new Set()
}
function removeSelected(id) {
  chosenIds.value.delete(id)
  chosenIds.value = new Set(chosenIds.value)
}
function confirmPick() {
  showPicker.value = false
}

async function startSpin() {
  if (selected.value.length < 2 || busy.value) return
  busy.value = true
  await wheelRef.value.spin()
  busy.value = false
}

function onDone(dish) {
  result.value = dish
  resultMealType.value = defaultMealType()
  resultMode.value = 'portion'
  resultServings.value = 1
  resultGrams.value = dish.defaultPortionG || 200
  resultOperator.value = 'me'
  fireConfetti()
  mealStore.recordSpin({ dish })
}

function fireConfetti() {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.35 },
    colors: ['#E8833A', '#E0584C', '#E9C46A', '#7FB77E', '#F4B6C2']
  })
  setTimeout(() => {
    confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } })
    confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } })
  }, 250)
}

const resultKcal = computed(() => {
  if (!result.value) return 0
  return resultMode.value === 'grams'
    ? kcalByGrams(result.value, resultGrams.value)
    : kcalByServings(result.value, resultServings.value)
})

async function saveResult() {
  await mealStore.addMeal({
    date: todayStr(),
    mealType: resultMealType.value,
    dish: result.value,
    mode: resultMode.value,
    servings: resultServings.value,
    grams: resultGrams.value,
    operatorId: resultOperator.value
  })
  result.value = null
}

async function respin() {
  result.value = null
  await startSpin()
}
</script>

<style scoped>
.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.selected-chip {
  background: var(--amber-soft);
  border-color: var(--amber-soft);
  color: var(--ink);
}
.selected-chip .x {
  font-size: 15px;
  line-height: 1;
  padding: 0 0 0 2px;
  color: var(--tomato);
  font-weight: 800;
}
.chip-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}
.pick-list {
  max-height: 46vh;
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
.pick-item input {
  width: 18px;
  height: 18px;
  accent-color: var(--amber);
}
.result-modal {
  text-align: center;
}
.result-emoji {
  font-size: 64px;
  margin-bottom: 6px;
}
.result-title {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 6px;
}
.result-modal .field {
  text-align: left;
}
.mb-12 {
  margin-bottom: 12px;
}
</style>
