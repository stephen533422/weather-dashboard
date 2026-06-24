<script setup lang="ts">
// ============================================================
// HomeView(/):首頁 —— 新增城市的輸入框 + 卡片牆 + Toast
// 重點：怎麼在組件裡「使用」一個 Pinia store
// ============================================================
import { ref, reactive } from "vue";
import { useCitiesStore } from "../stores/cities";
import WeatherCard from "../components/WeatherCard.vue";
import Toast from "../components/Toast.vue";
import Dropdown from "../components/Dropdown.vue";
import CitySearch from "../components/CitySearch.vue";

// 拿到全域 store。store.cities 是響應式的,改了畫面就會更新。
// 對照 React：const { cities, addCity, removeCity } = useCitiesStore()
const store = useCitiesStore();

// 排序選項。值的型別要正好是 "added" | "name",Dropdown 的泛型 T 才能對上 store.sortMode
const sortOptions: { value: "added" | "name"; label: string }[] = [
  { value: "added", label: "加入順序" },
  { value: "name", label: "名稱 A→Z" },
];

// toast 狀態:message 為空字串時 Toast 自動隱藏
const toast = reactive({ message: "", valid: true });
// 計時器 id 的型別:setTimeout 的回傳,還沒設定時為 null
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function showToast(message: string, valid: boolean) {
  toast.message = message;
  toast.valid = valid;
  // 先清掉上一個計時器,避免前一個 toast 把這次的提早關掉
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.message = "";
  }, 2500);
}

function handleSelect(name: string) {
  // store 回傳 { message, valid },直接拿去顯示 toast
  const result = store.addCity(name);
  showToast(result.message, result.valid);
}
</script>

<template>
  <section class="toolbar">
    <div class="add-row">
      <CitySearch @select="handleSelect" />
    </div>
    <div class="status-row">
      <Dropdown v-model="store.sortMode" :options="sortOptions" />
      <button @click="store.clearAll">清空</button>
    </div>
  </section>

  <!-- 卡片牆：v-for 跑 store.sortedCities(排好的衍生清單),每個城市一張卡片 -->
  <!-- :city-name 把城市名傳進子組件(props) -->
  <!-- @remove 接子組件發出的事件,呼叫 store.removeCity 把它刪掉 -->
  <div v-if="store.cities.length" class="grid">
    <WeatherCard
      v-for="name in store.sortedCities"
      :key="name"
      :city-name="name"
      @remove="store.removeCity(name)"
    />
  </div>
  <p v-else class="muted">還沒有城市,在上面加一個吧。</p>

  <Toast :message="toast.message" :valid="toast.valid" />
</template>

<style scoped>
.toolbar {
  margin: 20px 0 28px;
}
.add-row,
.status-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
/* 提示文字靠左、清空鈕推到最右 */
.status-row button {
  margin-left: auto;
}

/* 卡片牆：用 CSS Grid 自動排版,手機上自動變單欄(RWD) */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
</style>
