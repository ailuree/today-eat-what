<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal day-modal">
      <div class="day-head">
        <div>
          <div class="day-title">{{ dateLabel }}</div>
          <div class="muted">{{ weekdayLabel }} · 共 {{ records.length }} 条记录</div>
        </div>
        <button class="close-x" @click="$emit('close')">×</button>
      </div>

      <!-- 当天总热量 -->
      <div class="day-total" :class="{ over: total > goal }">
        <div>
          <span class="num total-num">{{ total }}</span>
          <span class="muted"> / {{ goal }} 千卡</span>
        </div>
        <span class="total-tag">{{ total > goal ? '已超标' : total > goal * 0.85 ? '接近目标' : '达标' }}</span>
      </div>

      <!-- 按餐次分组 -->
      <div v-for="m in mealTypes" :key="m" class="meal-group">
        <div class="group-head">
          <strong>{{ mealIcon[m] }} {{ m }}</strong>
          <span class="muted num">{{ groupKcal(m) }} 千卡</span>
        </div>
        <div v-if="!groupRecords(m).length" class="muted empty">无记录</div>
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
          <button class="del-btn" @click="$emit('remove', r)">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '../stores/app'

const props = defineProps({
  dateStr: { type: String, required: true },
  records: { type: Array, default: () => [] },
  goal: { type: Number, default: 1700 }
})
defineEmits(['close', 'remove'])

const appStore = useAppStore()
const mealTypes = ['早餐', '午餐', '晚餐', '加餐']
const mealIcon = { 早餐: '🌅', 午餐: '☀️', 晚餐: '🌙', 加餐: '🍪' }

const total = computed(() => props.records.reduce((s, r) => s + (r.kcal || 0), 0))

function groupRecords(m) {
  return props.records.filter((r) => r.mealType === m)
}
function groupKcal(m) {
  return groupRecords(m).reduce((s, r) => s + (r.kcal || 0), 0)
}
function operatorName(id) {
  if (!id) return ''
  const p = appStore.profileById(id)
  return p ? p.name : ''
}

const dateLabel = computed(() => {
  const [y, m, d] = props.dateStr.split('-')
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`
})
const weekdayLabel = computed(() => {
  const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return names[new Date(props.dateStr + 'T00:00:00').getDay()]
})
</script>

<style scoped>
.day-modal {
  max-height: 86vh;
  overflow-y: auto;
}
.day-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}
.day-title {
  font-size: 18px;
  font-weight: 800;
}
.close-x {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--cream);
  color: var(--ink-soft);
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
}
.day-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--mint-soft, #eaf5ec);
  margin-bottom: 14px;
}
.day-total.over {
  background: #fbeae8;
}
.total-num {
  font-size: 24px;
  font-weight: 800;
}
.day-total.over .total-num {
  color: var(--tomato);
}
.total-tag {
  font-size: 13px;
  font-weight: 700;
  color: var(--mint);
}
.day-total.over .total-tag {
  color: var(--tomato);
}
.meal-group {
  margin-bottom: 12px;
}
.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.empty {
  font-size: 13px;
  padding: 4px 0;
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
  min-width: 44px;
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
</style>
