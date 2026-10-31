import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/today' },
  { path: '/today', name: 'today', component: () => import('../views/TodayView.vue'), meta: { title: '今日' } },
  { path: '/wheel', name: 'wheel', component: () => import('../views/WheelView.vue'), meta: { title: '转盘' } },
  { path: '/dishes', name: 'dishes', component: () => import('../views/DishesView.vue'), meta: { title: '菜品' } },
  { path: '/stats', name: 'stats', component: () => import('../views/StatsView.vue'), meta: { title: '统计' } },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue'), meta: { title: '设置' } }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · 今天吃点啥` : '今天吃点啥'
})

export default router
