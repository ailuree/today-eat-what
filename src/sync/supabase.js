import { createClient } from '@supabase/supabase-js'
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from './config'
import { db, getMeta, setMeta } from '../db'

const LS_URL = 'sb_url'
const LS_KEY = 'sb_key'

/* ---------------- 数据行映射（本地 camelCase ↔ 云端 snake_case） ---------------- */

function mapDishToCloud(d, roomId) {
  return {
    id: d.id,
    room_id: roomId,
    name: d.name,
    category: d.category,
    emoji: d.emoji,
    kcal_per_100g: Number(d.kcalPer100g) || 0,
    default_portion_g: Number(d.defaultPortionG) || 100,
    custom_image: d.customImage || null,
    builtin: !!d.builtin,
    deleted: !!d.deleted,
    operator_id: d.operatorId || null,
    created_at: new Date(d.createdAt || Date.now()).toISOString(),
    updated_at: new Date(d.updatedAt || Date.now()).toISOString()
  }
}

function mapDishToLocal(r) {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    emoji: r.emoji,
    kcalPer100g: Number(r.kcal_per_100g) || 0,
    defaultPortionG: Number(r.default_portion_g) || 100,
    customImage: r.custom_image || null,
    builtin: !!r.builtin,
    deleted: r.deleted ? 1 : 0,
    operatorId: r.operator_id || null,
    createdAt: r.created_at ? Date.parse(r.created_at) : Date.now(),
    updatedAt: r.updated_at ? Date.parse(r.updated_at) : Date.now()
  }
}

function mapMealToCloud(m, roomId) {
  return {
    id: m.id,
    room_id: roomId,
    date: m.date,
    meal_type: m.mealType,
    dish_id: m.dishId || null,
    dish_name: m.dishName,
    emoji: m.emoji || null,
    mode: m.mode,
    servings: Number(m.servings) || 1,
    grams: m.grams || null,
    kcal: Number(m.kcal) || 0,
    operator_id: m.operatorId || null,
    note: m.note || null,
    created_at: new Date(m.createdAt || Date.now()).toISOString()
  }
}

function mapMealToLocal(r) {
  return {
    id: r.id,
    date: r.date,
    mealType: r.meal_type,
    dishId: r.dish_id || null,
    dishName: r.dish_name,
    emoji: r.emoji || null,
    mode: r.mode,
    servings: Number(r.servings) || 1,
    grams: r.grams || null,
    kcal: Number(r.kcal) || 0,
    operatorId: r.operator_id || null,
    note: r.note || null,
    createdAt: r.created_at ? Date.parse(r.created_at) : Date.now()
  }
}

/* ---------------- 同步管理器（单例） ---------------- */

class SyncManager {
  constructor() {
    this.client = null
    this.userId = null
    this.room = null
    this.members = []
    this.status = 'offline' // offline | connecting | online | error
    this.channels = []
    this.listeners = new Set()
    this._cloudDishIds = new Set()
    this._cloudMealIds = new Set()
  }

  get online() {
    return this.status === 'online' && !!this.room
  }

  on(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  emit(event, payload) {
    this.listeners.forEach((fn) => fn(event, payload))
  }
  setStatus(s) {
    this.status = s
    this.emit('status', s)
  }

  getConfig(url, key) {
    return {
      url: url || localStorage.getItem(LS_URL) || DEFAULT_SUPABASE_URL,
      key: key || localStorage.getItem(LS_KEY) || DEFAULT_SUPABASE_ANON_KEY
    }
  }

  saveConfig(url, key) {
    if (url) localStorage.setItem(LS_URL, url)
    if (key) localStorage.setItem(LS_KEY, key)
  }

  isConfigured(url, key) {
    const c = this.getConfig(url, key)
    return !!(c.url && c.key)
  }

  async ensureClient(url, key) {
    const c = this.getConfig(url, key)
    if (!c.url || !c.key) {
      throw new Error('未配置 Supabase URL 或 anon key')
    }
    if (!this.client) {
      this.client = createClient(c.url, c.key, {
        realtime: { params: { eventsPerSecond: 5 } }
      })
    }
    return this.client
  }

  async signIn() {
    const { data, error } = await this.client.auth.signInAnonymously()
    if (error) throw error
    this.userId = data.user.id
    return data.user
  }

  genCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    const arr = new Uint32Array(6)
    crypto.getRandomValues(arr)
    return Array.from(arr, (x) => chars[x % chars.length]).join('')
  }

  async upsertProfile(profile) {
    const { error } = await this.client.from('profiles').upsert({
      id: this.userId,
      name: profile.name || '我',
      emoji: profile.emoji || '🙋',
      color: profile.color || '#E8833A'
    })
    if (error) throw error
  }

  /* ---------- 创建房间 ---------- */
  async createRoom(profile, url, key) {
    this.setStatus('connecting')
    await this.ensureClient(url, key)
    await this.signIn()
    await this.upsertProfile(profile)

    let code = null
    for (let i = 0; i < 5; i++) {
      code = this.genCode()
      const { error } = await this.client.from('rooms').insert({ code, created_by: this.userId })
      if (!error) break
      code = null
    }
    if (!code) throw new Error('房间创建失败，请重试')

    const { data: room, error } = await this.client.from('rooms').select('*').eq('code', code).single()
    if (error) throw error
    const { error: mErr } = await this.client
      .from('room_members')
      .insert({ room_id: room.id, member_id: this.userId })
    if (mErr) throw mErr

    this.room = room
    await this.afterJoin()
    return room
  }

  /* ---------- 加入房间 ---------- */
  async joinRoom(code, profile, url, key) {
    this.setStatus('connecting')
    await this.ensureClient(url, key)
    await this.signIn()
    await this.upsertProfile(profile)

    const { data: room, error } = await this.client
      .from('rooms')
      .select('*')
      .eq('code', String(code).trim().toUpperCase())
      .maybeSingle()
    if (error) throw error
    if (!room) throw new Error('邀请码无效，没有找到房间')

    const { error: mErr } = await this.client.from('room_members').upsert(
      { room_id: room.id, member_id: this.userId },
      { onConflict: 'room_id,member_id', ignoreDuplicates: true }
    )
    if (mErr) throw mErr

    this.room = room
    await this.afterJoin()
    return room
  }

  /* ---------- 刷新/重连 ---------- */
  async restore() {
    const saved = await getMeta('room')
    if (!saved || !this.isConfigured()) return false
    try {
      this.setStatus('connecting')
      await this.ensureClient()
      const {
        data: { session }
      } = await this.client.auth.getSession()
      if (!session) {
        await setMeta('room', null)
        this.setStatus('offline')
        return false
      }
      this.userId = session.user.id
      const { data: room } = await this.client.from('rooms').select('*').eq('id', saved.id).maybeSingle()
      if (!room) {
        await setMeta('room', null)
        this.setStatus('offline')
        return false
      }
      this.room = room
      await this.afterJoin()
      return true
    } catch (err) {
      console.error('云端重连失败', err)
      this.setStatus('error')
      return false
    }
  }

  async afterJoin() {
    this.setStatus('connecting')
    await this.pullAll()
    await this.pushLocalData()
    this.subscribe()
    await setMeta('room', { id: this.room.id, code: this.room.code, joinedAt: Date.now() })
    this.setStatus('online')
  }

  /* ---------- 全量拉取并合并本地 ---------- */
  async pullAll() {
    const roomId = this.room.id
    const [dRes, mRes, memRes] = await Promise.all([
      this.client.from('dishes').select('*').eq('room_id', roomId),
      this.client.from('meals').select('*').eq('room_id', roomId),
      this.client
        .from('room_members')
        .select('member_id, profiles(name, emoji, color)')
        .eq('room_id', roomId)
    ])
    if (dRes.error) throw dRes.error
    if (mRes.error) throw mRes.error
    if (memRes.error) throw memRes.error

    this.members = (memRes.data || []).map((r) => ({
      id: r.member_id,
      name: r.profiles?.name || '成员',
      emoji: r.profiles?.emoji || '🙋',
      color: r.profiles?.color || '#E8833A'
    }))

    this._cloudDishIds = new Set()
    for (const row of dRes.data) {
      this._cloudDishIds.add(row.id)
      const local = mapDishToLocal(row)
      const existing = await db.dishes.get(local.id)
      if (!existing || (existing.updatedAt || 0) <= local.updatedAt) {
        await db.dishes.put(local)
      }
    }

    this._cloudMealIds = new Set()
    for (const row of mRes.data) {
      this._cloudMealIds.add(row.id)
      await db.meals.put(mapMealToLocal(row))
    }

    this.emit('pulled', { dishes: dRes.data.length, meals: mRes.data.length })
  }

  /* ---------- 把本地已有但云端没有的数据补推 ---------- */
  async pushLocalData() {
    const roomId = this.room.id
    const localDishes = await db.dishes.toArray()
    const newDishes = localDishes.filter((d) => !this._cloudDishIds.has(d.id))
    if (newDishes.length) {
      const { error } = await this.client
        .from('dishes')
        .upsert(newDishes.map((d) => mapDishToCloud(d, roomId)))
      if (error) console.error('补推菜品失败', error.message)
    }

    const localMeals = await db.meals.toArray()
    const newMeals = localMeals.filter((m) => !this._cloudMealIds.has(m.id))
    if (newMeals.length) {
      const { error } = await this.client
        .from('meals')
        .upsert(newMeals.map((m) => mapMealToCloud(m, roomId)))
      if (error) console.error('补推记录失败', error.message)
    }
  }

  /* ---------- 实时订阅 ---------- */
  subscribe() {
    this.unsubscribe()
    const roomId = this.room.id
    const channel = this.client.channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dishes', filter: `room_id=eq.${roomId}` },
        (payload) => this.onRemoteDish(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meals', filter: `room_id=eq.${roomId}` },
        (payload) => this.onRemoteMeal(payload)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${roomId}` },
        () => this.refreshMembers()
      )
      .subscribe()
    this.channels.push(channel)
  }

  unsubscribe() {
    for (const ch of this.channels) {
      this.client.removeChannel(ch)
    }
    this.channels = []
  }

  async onRemoteDish(payload) {
    if (payload.eventType === 'DELETE') {
      const id = payload.old.id
      await db.dishes.update(id, { deleted: 1 })
      this.emit('dish-deleted', id)
      return
    }
    const local = mapDishToLocal(payload.new)
    const existing = await db.dishes.get(local.id)
    if (!existing || (existing.updatedAt || 0) <= local.updatedAt) {
      await db.dishes.put(local)
      this.emit('dish-changed', local)
    }
  }

  async onRemoteMeal(payload) {
    if (payload.eventType === 'DELETE') {
      const id = payload.old.id
      await db.meals.delete(id)
      this.emit('meal-deleted', id)
      return
    }
    const local = mapMealToLocal(payload.new)
    await db.meals.put(local)
    this.emit('meal-changed', local)
  }

  async refreshMembers() {
    if (!this.room) return
    const { data } = await this.client
      .from('room_members')
      .select('member_id, profiles(name, emoji, color)')
      .eq('room_id', this.room.id)
    this.members = (data || []).map((r) => ({
      id: r.member_id,
      name: r.profiles?.name || '成员',
      emoji: r.profiles?.emoji || '🙋',
      color: r.profiles?.color || '#E8833A'
    }))
    this.emit('members', this.members)
  }

  /* ---------- 本地操作触发的推送 ---------- */
  async pushDish(dish) {
    if (!this.online) return
    const { error } = await this.client.from('dishes').upsert(mapDishToCloud(dish, this.room.id))
    if (error) console.error('推送菜品失败', error.message)
  }

  async pushMeal(meal) {
    if (!this.online) return
    const { error } = await this.client.from('meals').upsert(mapMealToCloud(meal, this.room.id))
    if (error) console.error('推送记录失败', error.message)
  }

  async deleteMeal(mealId) {
    if (!this.online) return
    const { error } = await this.client.from('meals').delete().eq('id', mealId)
    if (error) console.error('删除记录失败', error.message)
  }

  async leaveRoom() {
    this.unsubscribe()
    await setMeta('room', null)
    this.room = null
    this.members = []
    this.setStatus('offline')
  }
}

export const sync = new SyncManager()
