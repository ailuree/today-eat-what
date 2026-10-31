<template>
  <div class="page">
    <div class="page-title">
      🍽️ 菜品库
      <span class="muted" style="font-size: 13px; font-weight: 400">共 {{ filtered.length }} 样</span>
    </div>

    <div class="flex gap-8 mb-12">
      <input v-model="keyword" class="input" placeholder="搜索菜品名" style="flex: 1" />
      <button class="btn btn-ghost btn-sm" @click="showBatch = true">批量</button>
      <button class="btn btn-primary btn-sm" @click="openAdd">＋ 新增</button>
    </div>

    <div class="chip-row mb-12">
      <button class="chip" :class="{ active: category === '全部' }" @click="category = '全部'">全部</button>
      <button
        v-for="c in categories"
        :key="c"
        class="chip"
        :class="{ active: category === c }"
        @click="category = c"
      >
        {{ c }}
      </button>
    </div>

    <div v-if="!filtered.length" class="empty">
      <span class="emoji">🥢</span>
      还没有菜品，点击右上角「新增」添加吧
    </div>

    <div v-else class="dish-list">
      <div v-for="dish in filtered" :key="dish.id" class="dish-row card">
        <div class="dish-avatar">
          <img v-if="dish.customImage" :src="dish.customImage" alt="" />
          <span v-else>{{ dish.emoji }}</span>
        </div>
        <div class="dish-info">
          <div class="dish-name">{{ dish.name }}</div>
          <div class="muted">
            {{ dish.category }} · {{ dish.kcalPer100g }} 千卡/100g · 一份约
            <span class="num">{{ portionKcal(dish) }}</span> 千卡
          </div>
        </div>
        <div class="dish-actions">
          <button class="icon-btn" @click="openEdit(dish)" aria-label="编辑">✏️</button>
          <button class="icon-btn" @click="remove(dish)" aria-label="删除">🗑️</button>
        </div>
      </div>
    </div>

    <DishFormModal v-if="showForm" :dish="editing" @close="showForm = false" @saved="onSaved" />

    <!-- 批量导入 -->
    <div v-if="showBatch" class="modal-mask" @click.self="showBatch = false">
      <div class="modal">
        <div class="modal-title">批量添加菜品</div>
        <div class="field">
          <label>分类</label>
          <div class="flex gap-8" style="flex-wrap: wrap">
            <button
              v-for="c in categories"
              :key="c"
              class="chip"
              :class="{ active: batchCategory === c }"
              @click="batchCategory = c"
            >
              {{ c }}
            </button>
          </div>
        </div>
        <div class="field">
          <label>每行一个菜名（也支持逗号、顿号分隔），可直接粘贴</label>
          <textarea v-model="batchText" class="input" placeholder="米饭&#10;番茄炒蛋&#10;宫保鸡丁"></textarea>
        </div>
        <div class="flex gap-12">
          <button class="btn btn-ghost" style="flex: 1" @click="showBatch = false">取消</button>
          <button class="btn btn-primary" style="flex: 1" @click="doBatch">导入</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDishStore } from '../stores/dishes'
import { categories } from '../db/seed'
import { portionKcal } from '../utils/calc'
import DishFormModal from '../components/DishFormModal.vue'

const store = useDishStore()
const keyword = ref('')
const category = ref('全部')
const showForm = ref(false)
const editing = ref(null)
const showBatch = ref(false)
const batchText = ref('')
const batchCategory = ref('主食')

onMounted(async () => {
  if (!store.loaded) await store.load()
})

const filtered = computed(() => {
  const kw = keyword.value.trim()
  return store.activeList.filter((d) => {
    const matchCat = category.value === '全部' || d.category === category.value
    const matchKw = !kw || d.name.includes(kw)
    return matchCat && matchKw
  })
})

function openAdd() {
  editing.value = null
  showForm.value = true
}

function openEdit(dish) {
  editing.value = dish
  showForm.value = true
}

async function onSaved(data) {
  if (editing.value) {
    await store.updateDish(editing.value.id, data)
  } else {
    await store.addDish(data)
  }
  showForm.value = false
}

async function remove(dish) {
  if (confirm(`确定删除「${dish.name}」吗？`)) {
    await store.removeDish(dish.id)
  }
}

async function doBatch() {
  const n = await store.batchImport(batchText.value, batchCategory.value)
  alert(n > 0 ? `成功导入 ${n} 样菜品` : '没有新菜品（可能名称已存在）')
  batchText.value = ''
  showBatch.value = false
}
</script>

<style scoped>
.chip-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}
.dish-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dish-row {
  display: flex;
  align-items: center;
  padding: 12px;
  gap: 12px;
}
.dish-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--cream);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
  overflow: hidden;
}
.dish-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dish-info {
  flex: 1;
  min-width: 0;
}
.dish-name {
  font-weight: 700;
  font-size: 16px;
}
.dish-actions {
  display: flex;
  gap: 4px;
}
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 16px;
  background: var(--cream);
}
.mb-12 {
  margin-bottom: 12px;
}
</style>
