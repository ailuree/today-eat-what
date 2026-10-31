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
import { reactive, computed } from 'vue'
import { categories } from '../db/seed'
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
</style>
