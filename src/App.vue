<script setup lang="ts">
// ============================================================
// App：新增城市的輸入框 + 卡片牆
// 重點：怎麼在組件裡「使用」一個 Pinia store
// ============================================================
import { ref, reactive } from "vue";
import { useCitiesStore } from "./stores/cities";
import WeatherCard from "./components/WeatherCard.vue";
import Toast from "./components/Toast.vue";

// 拿到全域 store。store.cities 是響應式的,改了畫面就會更新。
// 對照 React：const { cities, addCity, removeCity } = useCitiesStore()
const store = useCitiesStore();

const newCity = ref("");

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

function handleAdd() {
  // store 回傳 { message, valid },直接拿去顯示 toast
  const result = store.addCity(newCity.value);
  showToast(result.message, result.valid);
  newCity.value = "";
}
</script>

<template>
  <header class="app-header">
    <h1>🌤️ 多城市天氣儀表板</h1>
    <span class="count-badge">{{ store.cityCount }} 個城市</span>
  </header>

  <section class="toolbar">
    <div class="add-row">
      <input
        v-model="newCity"
        placeholder="輸入城市,例如 London / Kaohsiung"
        @keyup.enter="handleAdd"
      />
      <button class="btn-primary" @click="handleAdd">新增城市</button>
    </div>
    <div class="status-row">
      <button @click="store.clearAll">清空</button>
    </div>
  </section>

  <!-- 卡片牆：v-for 跑 store.cities,每個城市一張卡片 -->
  <!-- :city-name 把城市名傳進子組件(props) -->
  <!-- @remove 接子組件發出的事件,呼叫 store.removeCity 把它刪掉 -->
  <div v-if="store.cities.length" class="grid">
    <WeatherCard
      v-for="name in store.cities"
      :key="name"
      :city-name="name"
      @remove="store.removeCity(name)"
    />
  </div>
  <p v-else class="muted">還沒有城市,在上面加一個吧。</p>

  <Toast :message="toast.message" :valid="toast.valid" />

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
.add-row input {
  flex: 1;
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
