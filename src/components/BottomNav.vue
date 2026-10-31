<template>
  <nav class="bottom-nav">
    <router-link v-for="item in tabs" :key="item.name" :to="item.to" class="nav-item" :class="{ center: item.center }">
      <span class="nav-icon" v-html="item.icon"></span>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
const tabs = [
  {
    name: 'today',
    label: '今日',
    to: '/today',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/></svg>'
  },
  {
    name: 'wheel',
    label: '转一下',
    to: '/wheel',
    center: true,
    icon: '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.2"/><path d="M12 3v6.8M12 14.2V21M3 12h6.8M14.2 12H21M5.6 5.6l4.8 4.8M13.6 13.6l4.8 4.8M18.4 5.6l-4.8 4.8M10.4 13.6l-4.8 4.8"/></svg>'
  },
  {
    name: 'dishes',
    label: '菜品',
    to: '/dishes',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v4H4z"/><path d="M6 8v12h12V8"/><path d="M10 12h4"/></svg>'
  },
  {
    name: 'stats',
    label: '统计',
    to: '/stats',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>'
  },
  {
    name: 'settings',
    label: '设置',
    to: '/settings',
    icon: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.2.5.74.86 1.33 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/></svg>'
  }
]
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  width: 100%;
  max-width: 480px;
  height: calc(var(--nav-h) + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 50;
}
.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--ink-soft);
  text-decoration: none;
  font-size: 11px;
  font-weight: 600;
  transition: color 0.15s ease;
}
.nav-item.router-link-active {
  color: var(--amber-dark);
}
.nav-icon {
  display: flex;
}
.nav-item.center {
  position: relative;
  color: #fff;
}
.nav-item.center .nav-icon {
  position: absolute;
  top: -22px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(145deg, #f0934a, #e0702a);
  box-shadow: 0 8px 18px rgba(224, 112, 42, 0.45);
  align-items: center;
  justify-content: center;
  border: 4px solid var(--cream);
}
.nav-item.center .nav-label {
  margin-top: 30px;
  color: var(--amber-dark);
}
.nav-item.center.router-link-active {
  color: #fff;
}
</style>
