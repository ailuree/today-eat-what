<template>
  <div class="page">
    <div class="page-title">⚙️ 设置</div>

    <!-- 云端同步 -->
    <div class="card">
      <div class="flex-between">
        <strong>☁️ 情侣云端同步</strong>
        <span class="status-badge" :class="statusClass">{{ statusText }}</span>
      </div>

      <!-- 已连接 -->
      <template v-if="sync.online">
        <div class="room-box mt-12">
          <div class="muted">房间邀请码（发给 TA 即可加入）</div>
          <div class="code-row">
            <span class="code num">{{ sync.room.code }}</span>
            <button class="btn btn-ghost btn-sm" @click="copyCode">复制</button>
          </div>
        </div>
        <div class="field mt-12">
          <label>房间成员（{{ sync.members.length }}）</label>
          <div class="flex gap-8" style="flex-wrap: wrap">
            <span v-for="m in sync.members" :key="m.id" class="chip member-chip" :style="{ borderColor: m.color }">
              {{ m.emoji }} {{ m.name }}
            </span>
          </div>
        </div>
        <p class="muted">同一房间内菜品、记录实时同步，离线操作联网后自动补传。</p>
        <button class="btn btn-ghost btn-block mt-12" style="color: var(--tomato)" @click="leave">退出房间</button>
      </template>

      <!-- 未连接 -->
      <template v-else>
        <p class="muted mt-8">两人加入同一房间，共享菜品与每日记录、实时同步。</p>

        <!-- 服务器配置 -->
        <button class="link-btn mt-8" @click="showConfig = !showConfig">
          {{ showConfig ? '收起服务器配置' : '▸ 配置 Supabase 服务器（首次使用）' }}
        </button>
        <div v-if="showConfig" class="config-box mt-8">
          <div class="field">
            <label>Project URL</label>
            <input v-model="urlInput" class="input" placeholder="https://xxxxxxxx.supabase.co" />
          </div>
          <div class="field">
            <label>anon public key</label>
            <textarea v-model="keyInput" class="input" style="min-height: 70px"></textarea>
          </div>
          <button class="btn btn-primary btn-block" @click="saveConfig">保存配置</button>
        </div>

        <div class="flex gap-8 mt-12">
          <button class="btn btn-primary" style="flex: 1" @click="createRoom">创建房间</button>
          <button class="btn btn-ghost" style="flex: 1" @click="showJoin = !showJoin">加入房间</button>
        </div>

        <div v-if="showJoin" class="join-box mt-12">
          <div class="field">
            <label>输入 6 位邀请码</label>
            <input v-model="joinCode" class="input code-input" maxlength="6" placeholder="如 AB3K9P" />
          </div>
          <button class="btn btn-primary btn-block" @click="join">确认加入</button>
        </div>
      </template>
    </div>

    <!-- 每日热量目标 -->
    <div class="card">
      <strong>每日热量目标（千卡）</strong>
      <div class="field mt-12">
        <label>我的目标</label>
        <input v-model.number="appStore.dailyGoal" type="number" min="800" class="input" />
      </div>
      <div class="field">
        <label>TA 的目标</label>
        <input v-model.number="appStore.dailyGoalB" type="number" min="800" class="input" />
      </div>
      <button class="btn btn-primary btn-block" @click="saveGoals">保存目标</button>
    </div>

    <!-- 双人资料 -->
    <div class="card">
      <strong>我的资料（同步到房间）</strong>
      <div class="profile-row mt-12">
        <button class="emoji-pick" @click="cycleEmoji">{{ myProfile.emoji }}</button>
        <input v-model="myProfile.name" class="input" style="flex: 1" maxlength="10" />
      </div>
      <button class="btn btn-primary btn-block mt-12" @click="saveMyProfile">保存资料</button>
    </div>

    <!-- 安装应用 -->
    <div class="card">
      <strong>📱 安装到桌面</strong>
      <button v-if="canInstall" class="btn btn-primary btn-block mt-12" @click="installApp">立即安装</button>
      <p v-else class="muted mt-12">
        安卓/电脑 Chrome：点击地址栏安装图标；<br />
        iPhone：用 Safari 打开 → 底部分享 →「添加到主屏幕」。
      </p>
    </div>

    <!-- 数据管理 -->
    <div class="card">
      <strong>数据备份</strong>
      <p class="muted mt-8">本地数据建议定期备份</p>
      <div class="flex gap-8 mt-12">
        <button class="btn btn-ghost" style="flex: 1" @click="exportData">导出备份</button>
        <label class="btn btn-ghost" style="flex: 1">
          导入备份
          <input type="file" accept="application/json" style="display: none" @change="importData" />
        </label>
      </div>
      <button class="btn btn-ghost btn-block mt-8" style="color: var(--tomato)" @click="clearData">清空全部数据</button>
    </div>

    <!-- 关于 -->
    <div class="card about-card">
      <strong>关于「今天吃点啥」</strong>
      <p class="muted mt-8">
        内置热量数据参考《中国食品成分表》第 6 版及中国疾控中心营养所食物营养成分查询平台，
        复合菜品为估算值，可自行修正；数据仅用于生活记录，不构成医疗或营养建议。
      </p>
      <p class="muted mt-8">版本 v1.1.0</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAppStore } from '../stores/app'
import { db } from '../db'
import { sync } from '../sync/supabase'

const appStore = useAppStore()
const showConfig = ref(false)
const showJoin = ref(false)
const urlInput = ref(localStorage.getItem('sb_url') || '')
const keyInput = ref(localStorage.getItem('sb_key') || '')
const joinCode = ref('')
const canInstall = ref(false)
let deferredPrompt = null
let unsub = null
const statusTick = ref(0)

const myProfile = ref({ id: 'me', name: '我', emoji: '🙋', color: '#E8833A' })

onMounted(async () => {
  if (!appStore.loaded) await appStore.load()
  myProfile.value = { ...appStore.profiles[0] }
  unsub = sync.on(() => {
    statusTick.value++
  })
  window.addEventListener('beforeinstallprompt', onBeforeInstall)
})

onBeforeUnmount(() => {
  unsub && unsub()
  window.removeEventListener('beforeinstallprompt', onBeforeInstall)
})

const statusText = computed(() => {
  // 依赖 statusTick 触发重算
  void statusTick.value
  if (sync.status === 'online') return '已连接'
  if (sync.status === 'connecting') return '连接中'
  if (sync.status === 'error') return '连接失败'
  return '未连接'
})
const statusClass = computed(() => {
  void statusTick.value
  return {
    online: sync.status === 'online',
    connecting: sync.status === 'connecting',
    error: sync.status === 'error'
  }
})

function onBeforeInstall(e) {
  e.preventDefault()
  deferredPrompt = e
  canInstall.value = true
}
async function installApp() {
  if (!deferredPrompt) return
  deferredPrompt.prompt()
  await deferredPrompt.userChoice
  deferredPrompt = null
  canInstall.value = false
}

function saveConfig() {
  if (!urlInput.value.trim() || !keyInput.value.trim()) {
    alert('请填写完整的 URL 和 anon key')
    return
  }
  sync.saveConfig(urlInput.value.trim(), keyInput.value.trim())
  alert('配置已保存')
  showConfig.value = false
}

async function createRoom() {
  if (!sync.isConfigured()) {
    alert('请先展开「配置 Supabase 服务器」填写配置')
    showConfig.value = true
    return
  }
  try {
    const room = await sync.createRoom(myProfile.value)
    alert(`房间已创建，邀请码：${room.code}`)
  } catch (err) {
    alert(err.message || '创建失败')
  }
}

async function join() {
  if (joinCode.value.trim().length !== 6) {
    alert('请输入 6 位邀请码')
    return
  }
  try {
    await sync.joinRoom(joinCode.value, myProfile.value)
    alert('加入成功，数据同步中')
  } catch (err) {
    alert(err.message || '加入失败')
  }
}

function copyCode() {
  navigator.clipboard
    .writeText(sync.room.code)
    .then(() => alert('邀请码已复制'))
    .catch(() => alert(sync.room.code))
}

async function leave() {
  if (confirm('确定退出房间？本地数据保留，之后可重新加入。')) {
    await sync.leaveRoom()
  }
}

async function saveGoals() {
  await appStore.saveGoals()
  alert('目标已保存')
}

async function saveMyProfile() {
  const profiles = appStore.profiles.map((p, i) => (i === 0 ? { ...myProfile.value } : p))
  appStore.profiles = profiles
  await appStore.saveProfiles()
  // 若已在房间，同步更新云端 profile
  if (sync.online) {
    const { error } = await sync.client
      .from('profiles')
      .upsert({ id: sync.userId, name: myProfile.value.name, emoji: myProfile.value.emoji, color: myProfile.value.color })
    if (error) alert(error.message)
  }
  alert('资料已保存')
}

const emojiCycle = ['🙋', '🙋‍♀️', '🧑', '👩', '👦', '👧', '🐻', '🐰', '🐱', '🐶', '🐼', '🦊']
function cycleEmoji() {
  const i = emojiCycle.indexOf(myProfile.value.emoji)
  myProfile.value.emoji = emojiCycle[(i + 1) % emojiCycle.length]
}

async function exportData() {
  const data = {
    exportedAt: new Date().toISOString(),
    version: 1,
    dishes: await db.dishes.toArray(),
    meals: await db.meals.toArray(),
    spins: await db.spins.toArray(),
    presets: await db.presets.toArray(),
    meta: await db.meta.toArray()
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `今天吃点啥-备份-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

async function importData(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const data = JSON.parse(await file.text())
    if (!confirm('导入将与当前数据合并（同 id 覆盖），确定继续？')) return
    if (data.dishes) await db.dishes.bulkPut(data.dishes)
    if (data.meals) await db.meals.bulkPut(data.meals)
    if (data.spins) await db.spins.bulkPut(data.spins)
    if (data.presets) await db.presets.bulkPut(data.presets)
    if (data.meta) await db.meta.bulkPut(data.meta)
    alert('导入成功，刷新页面后生效')
  } catch (err) {
    alert(`导入失败：${err.message}`)
  } finally {
    e.target.value = ''
  }
}

async function clearData() {
  if (!confirm('确定清空全部菜品和记录？此操作不可恢复，建议先导出备份。')) return
  if (!confirm('再次确认：真的要清空吗？')) return
  await Promise.all([
    db.dishes.clear(),
    db.meals.clear(),
    db.spins.clear(),
    db.presets.clear(),
    db.stickers.clear()
  ])
  alert('已清空，刷新页面后重新加载内置菜品')
}
</script>

<style scoped>
.status-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--cream);
  color: var(--ink-soft);
}
.status-badge.online {
  background: var(--mint-soft);
  color: #4e8a4d;
}
.status-badge.connecting {
  background: var(--amber-soft);
  color: var(--amber-dark);
}
.status-badge.error {
  background: #fbe3e0;
  color: var(--tomato);
}
.room-box {
  background: var(--cream);
  border-radius: 12px;
  padding: 12px;
}
.code-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}
.code {
  font-size: 30px;
  letter-spacing: 4px;
  color: var(--amber-dark);
}
.member-chip {
  font-weight: 700;
}
.link-btn {
  color: var(--amber-dark);
  font-weight: 700;
  font-size: 14px;
}
.config-box,
.join-box {
  background: var(--cream);
  border-radius: 12px;
  padding: 12px;
}
.code-input {
  letter-spacing: 4px;
  text-transform: uppercase;
}
.profile-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.emoji-pick {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--cream);
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.about-card {
  line-height: 1.6;
}
</style>
