<template>
  <div class="modal-mask" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-title">{{ isEdit ? '编辑菜品' : '添加菜品' }}</div>

      <div class="field">
        <label>菜品名称</label>
        <input v-model="form.name" class="input" placeholder="如：黄焖鸡米饭" maxlength="20" />
      </div>

      <div class="field">
        <label>分类</label>
        <div class="flex gap-8" style="flex-wrap: wrap">
          <button
            v-for="c in categories"
            :key="c"
            class="chip"
            :class="{ active: form.category === c }"
            @click="form.category = c"
          >
            {{ c }}
          </button>
        </div>
      </div>

      <div class="field">
        <label>贴图</label>
        <div class="sticker-preview">
          <img v-if="form.customImage" :src="form.customImage" alt="贴图" class="uploaded" />
          <span v-else class="big-emoji">{{ form.emoji }}</span>
        </div>
        <div class="emoji-grid">
          <button
            v-for="e in emojiList"
            :key="e"
            class="emoji-btn"
            :class="{ active: form.emoji === e && !form.customImage }"
            @click="form.emoji = e; form.customImage = null"
          >
            {{ e }}
          </button>
        </div>
        <label class="btn btn-ghost btn-sm mt-8" style="width: 100%">
          上传本地图片
          <input type="file" accept="image/*" style="display: none" @change="onUpload" />
        </label>
      </div>

      <div class="field">
        <label>热量（千卡 / 100 克）</label>
        <input v-model.number="form.kcalPer100g" type="number" min="0" class="input" placeholder="如 150" />
      </div>

      <!-- 常见食物热量参考：搜索点选即可自动填充 -->
      <div class="field">
        <button type="button" class="ref-toggle" @click="showRef = !showRef">
          <span>{{ showRef ? '▾' : '▸' }} 常见食物热量参考（点选自动填充，无需联网查）</span>
        </button>
        <div v-if="showRef" class="ref-box">
          <input v-model="refKw" class="input" placeholder="搜索食物，如：米饭 / 汉堡 / 鸡胸肉" />
          <div class="ref-list">
            <button
              v-for="item in filteredRef"
              :key="item.name"
              type="button"
              class="ref-item"
              @click="applyRef(item)"
            >
              <span class="ref-emoji">{{ item.emoji }}</span>
              <span class="ref-name">{{ item.name }}</span>
              <span class="ref-cat muted">{{ item.category }}</span>
              <span class="ref-kcal num">{{ item.kcal }} 千卡</span>
            </button>
            <div v-if="!filteredRef.length" class="muted ref-empty">没有匹配的食物，可直接在上方手动输入热量</div>
          </div>
        </div>
      </div>

      <div class="field">
        <label>一份的重量（克）</label>
        <input v-model.number="form.defaultPortionG" type="number" min="1" class="input" />
      </div>

      <div class="muted mb-12">
        按一份 {{ form.defaultPortionG || 0 }} 克估算，约
        <span class="num">{{ previewKcal }}</span> 千卡
      </div>

      <div class="flex gap-12">
        <button class="btn btn-ghost" style="flex: 1" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" style="flex: 1" :disabled="!canSave" @click="save">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { categories } from '../db/seed'
import { foodCalorieRef } from '../db/food-calorie-reference'
import { compressImage } from '../utils/image'

const props = defineProps({ dish: { type: Object, default: null } })
const emit = defineEmits(['close', 'saved'])

const emojiList = [
  '🍚', '🍜', '🍝', '🍞', '🥟', '🍱', '🍛', '🍣', '🍤', '🍗',
  '🍖', '🥩', '🥓', '🌭', '🍔', '🍟', '🫓', '🥙', '🥞', '🍳',
  '🧀', '🥗', '🥘', '🍲', '🫕', '🍅', '🥔', '🥦', '🥬', '🥒',
  '🍆', '🌽', '🫑', '🌶️', '🥕', '🍄', '🥚', '🐟', '🍦', '🍰',
  '🎂', '🧁', '🍪', '🍩', '☕', '🍵', '🥤', '🧋', '🍺', '🍓',
  '🍒', '🍑', '🥭', '🍍', '🥥', '🍌', '🍉', '🍊', '🍎', '🍇',
  '🍐', '🥝', '🍽️'
]

const isEdit = !!props.dish
const form = reactive({
  name: props.dish?.name || '',
  category: props.dish?.category || '主食',
  emoji: props.dish?.emoji || '🍽️',
  customImage: props.dish?.customImage || null,
  kcalPer100g: props.dish?.kcalPer100g ?? 0,
  defaultPortionG: props.dish?.defaultPortionG ?? 100
})

const canSave = computed(() => form.name.trim().length > 0 && Number(form.kcalPer100g) >= 0)

/* ---------- 常见食物热量参考 ---------- */
const showRef = ref(false)
const refKw = ref('')
const filteredRef = computed(() => {
  const kw = refKw.value.trim()
  if (!kw) return foodCalorieRef.slice(0, 40)
  return foodCalorieRef.filter(
    (i) => i.name.includes(kw) || i.category.includes(kw)
  ).slice(0, 40)
})

/** 点选参考项：填充每百克热量；名称为空时顺带填名称与 emoji */
function applyRef(item) {
  form.kcalPer100g = item.kcal
  if (!form.name.trim()) {
    // 去掉名称里的「（熟）/（生）」等口径标注，让菜品名更简洁
    form.name = item.name.replace(/（[^）]*）/g, '')
    form.emoji = item.emoji
  }
}

const previewKcal = computed(() =>
  Math.round(((Number(form.kcalPer100g) || 0) * (Number(form.defaultPortionG) || 0)) / 100)
)

async function onUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    form.customImage = await compressImage(file)
  } catch (err) {
    alert(err.message || '图片处理失败')
  } finally {
    e.target.value = ''
  }
}

function save() {
  emit('saved', {
    name: form.name.trim(),
    category: form.category,
    emoji: form.emoji,
    customImage: form.customImage,
    kcalPer100g: Number(form.kcalPer100g) || 0,
    defaultPortionG: Number(form.defaultPortionG) || 100
  })
}
</script>

<style scoped>
.sticker-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
.big-emoji {
  font-size: 44px;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream);
  border-radius: 16px;
}
.uploaded {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 16px;
}
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 150px;
  overflow-y: auto;
  padding: 4px;
  background: var(--cream);
  border-radius: 12px;
}
.emoji-btn {
  font-size: 20px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.emoji-btn.active {
  background: var(--amber-soft);
  box-shadow: inset 0 0 0 2px var(--amber);
}
.mb-12 {
  margin-bottom: 12px;
}
.ref-toggle {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: var(--amber-dark);
  font-size: 13px;
  font-weight: 700;
  padding: 4px 0;
}
.ref-box {
  margin-top: 6px;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 8px;
  background: var(--cream);
}
.ref-list {
  margin-top: 8px;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ref-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 9px;
  border: 1px solid transparent;
  background: #fff;
  text-align: left;
}
.ref-item:hover {
  border-color: var(--amber);
  background: var(--amber-soft);
}
.ref-emoji {
  font-size: 18px;
}
.ref-name {
  font-weight: 700;
  font-size: 13px;
}
.ref-cat {
  font-size: 11px;
}
.ref-kcal {
  margin-left: auto;
  font-size: 13px;
  font-weight: 800;
  color: var(--amber-dark);
  white-space: nowrap;
}
.ref-empty {
  padding: 10px;
  font-size: 12px;
  text-align: center;
}
</style>
