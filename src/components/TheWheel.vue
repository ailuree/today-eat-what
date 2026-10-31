<template>
  <div class="wheel-wrap" ref="wrapRef">
    <canvas ref="canvasRef" class="wheel-canvas" @click="$emit('tap')"></canvas>
    <div class="pointer">
      <svg viewBox="0 0 24 24" width="30" height="30">
        <path d="M12 22 L4 6 Q12 1 20 6 Z" fill="#E0584C" stroke="#fff" stroke-width="1.5" />
        <circle cx="12" cy="7" r="2.4" fill="#fff" />
      </svg>
    </div>
    <div class="hub"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { randomInt } from '../utils/calc'

const props = defineProps({
  items: { type: Array, required: true }
})
const emit = defineEmits(['done', 'tap'])

const wrapRef = ref(null)
const canvasRef = ref(null)
let ctx = null
let size = 300
let dpr = 1
let rotation = 0 // 当前旋转弧度（顺时针）
let spinning = false
let rafId = null
let audioCtx = null
let lastTickIndex = -1

const WHEEL_COLORS = [
  '#F4A261', '#E76F51', '#E9C46A', '#8AB17D', '#4A90A4', '#B5838D',
  '#E5989B', '#FFB4A2', '#CDB4DB', '#A8DADC', '#F4A7B9', '#95B879'
]

onMounted(() => {
  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')
  measure()
  draw()
  window.addEventListener('resize', measure)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  if (rafId) cancelAnimationFrame(rafId)
})

watch(() => props.items, () => draw(), { deep: true })

function measure() {
  const w = wrapRef.value.clientWidth
  size = w
  dpr = window.devicePixelRatio || 1
  const canvas = canvasRef.value
  canvas.width = size * dpr
  canvas.height = size * dpr
  canvas.style.width = `${size}px`
  canvas.style.height = `${size}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  draw()
}

function draw() {
  if (!ctx) return
  const n = props.items.length
  const cx = size / 2
  const r = size / 2 - 4
  ctx.clearRect(0, 0, size, size)

  if (n === 0) {
    ctx.beginPath()
    ctx.arc(cx, cx, r, 0, Math.PI * 2)
    ctx.fillStyle = '#F0E6D2'
    ctx.fill()
    ctx.fillStyle = '#8A7A66'
    ctx.font = '600 15px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('请先选择菜品', cx, cx)
    return
  }

  const slice = (Math.PI * 2) / n
  ctx.save()
  ctx.translate(cx, cx)
  ctx.rotate(rotation)

  for (let i = 0; i < n; i++) {
    // 第一个扇区从顶部开始
    const start = i * slice - Math.PI / 2
    const end = start + slice
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.arc(0, 0, r, start, end)
    ctx.closePath()
    ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length]
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'
    ctx.lineWidth = 2
    ctx.stroke()

    // 文字：沿径向排布。候选少时 emoji+名称；候选多时只显示 emoji 避免拥挤
    const mid = start + slice / 2
    ctx.save()
    ctx.rotate(mid)
    const dish = props.items[i]
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    if (n <= 10) {
      ctx.font = `${Math.max(15, size * 0.07)}px sans-serif`
      ctx.fillText(dish.emoji || '🍽️', r * 0.78, 0)
      ctx.font = `700 ${Math.max(11, size * 0.042)}px sans-serif`
      ctx.fillStyle = '#fff'
      ctx.shadowColor = 'rgba(0,0,0,0.25)'
      ctx.shadowBlur = 3
      ctx.fillText(truncate(dish.name, 5), r * 0.45, 0)
      ctx.shadowBlur = 0
    } else {
      // 候选较多：仅 emoji，字号随数量收缩，位置随数量内收
      const emojiSize = Math.max(10, Math.min(size * 0.055, (slice * r * 0.62)))
      const emojiR = n > 20 ? r * 0.62 : r * 0.7
      ctx.font = `${emojiSize}px sans-serif`
      ctx.fillText(dish.emoji || '🍽️', emojiR, 0)
    }
    ctx.restore()
  }
  ctx.restore()

  // 外圈描边
  ctx.beginPath()
  ctx.arc(cx, cx, r, 0, Math.PI * 2)
  ctx.lineWidth = 5
  ctx.strokeStyle = '#fff'
  ctx.stroke()
}

function truncate(s, len) {
  return s.length > len ? `${s.slice(0, len)}…` : s
}

/* ---------- 音效 ---------- */
function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) audioCtx = new AC()
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()
}
function tickSound() {
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.type = 'square'
  osc.frequency.value = 660
  gain.gain.setValueAtTime(0.06, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05)
  osc.connect(gain).connect(audioCtx.destination)
  osc.start()
  osc.stop(audioCtx.currentTime + 0.06)
}
function winSound() {
  if (!audioCtx) return
  const notes = [523, 659, 784]
  notes.forEach((f, i) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'sine'
    osc.frequency.value = f
    const t0 = audioCtx.currentTime + i * 0.11
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(0.12, t0 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.25)
    osc.connect(gain).connect(audioCtx.destination)
    osc.start(t0)
    osc.stop(t0 + 0.28)
  })
}

/**
 * 转动转盘，返回 Promise resolve 中奖项
 */
function spin() {
  return new Promise((resolve) => {
    const n = props.items.length
    if (n < 2 || spinning) {
      resolve(null)
      return
    }
    ensureAudio()
    spinning = true
    const winner = randomInt(n)
    const slice = (Math.PI * 2) / n
    // 目标余数：让顶部指针落在中奖扇区中心附近（带随机抖动）
    const jitter = (Math.random() - 0.5) * slice * 0.55
    const targetMod = Math.PI * 2 - (winner * slice + slice / 2 + jitter)
    const currentMod = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    let delta = targetMod - currentMod
    if (delta < 0) delta += Math.PI * 2
    const fullSpins = 5 + randomInt(3) // 5-7 整圈
    const startRotation = rotation
    const totalDelta = fullSpins * Math.PI * 2 + delta
    const duration = 4600
    const startTime = performance.now()
    lastTickIndex = -1

    const frame = (now) => {
      const t = Math.min(1, (now - startTime) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // ease-out cubic
      rotation = startRotation + totalDelta * eased
      draw()

      // 越过扇区的 tick 声
      const idx = Math.floor(((rotation % (Math.PI * 2)) / slice)) % n
      if (idx !== lastTickIndex && t < 0.92) {
        lastTickIndex = idx
        tickSound()
      }

      if (t < 1) {
        rafId = requestAnimationFrame(frame)
      } else {
        spinning = false
        winSound()
        emit('done', props.items[winner])
        resolve(props.items[winner])
      }
    }
    rafId = requestAnimationFrame(frame)
  })
}

defineExpose({ spin })
</script>

<style scoped>
.wheel-wrap {
  position: relative;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  aspect-ratio: 1;
}
.wheel-canvas {
  display: block;
  border-radius: 50%;
  filter: drop-shadow(0 10px 24px rgba(180, 120, 60, 0.28));
}
.pointer {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.25));
}
.hub {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff, #f0dcc0);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.12);
  z-index: 4;
}
</style>
