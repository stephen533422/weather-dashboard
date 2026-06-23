<script setup lang="ts">
// ============================================================
// App：全站版面外殼(header + <router-view />)
// 重點：header 每頁固定可見;內容區交給 router-view 依路由切換。
//       header 直接用全域 Pinia store,不必經 props 一層層傳。
// ============================================================
import SkyBackground from "./components/SkyBackground.vue";
import { useCitiesStore } from "./stores/cities";

// 拿到全域 store。store.cities 是響應式的,改了畫面就會更新。
// 對照 React：const { cities, addCity, removeCity } = useCitiesStore()
const store = useCitiesStore();
</script>

<template>
  <SkyBackground />
  <header class="app-header">
    <h1>🌤️ 多城市天氣儀表板</h1>
    <span class="count-badge">{{ store.cityCount }} 個城市</span>
  </header>
  <router-view />
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
h1 {
  font-size: 26px;
  margin: 0;
}
/* 城市數量小徽章:白玻璃膠囊 */
.count-badge {
  background: var(--surface-solid);
  color: var(--text-muted);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 13px;
  font-weight: 600;
}
</style>
