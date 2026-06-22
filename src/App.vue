<script setup>
// ============================================================
// App：新增城市的輸入框 + 卡片牆
// 重點：怎麼在組件裡「使用」一個 Pinia store
// ============================================================
import { ref } from 'vue'
import { useCitiesStore } from './stores/cities'
import WeatherCard from './components/WeatherCard.vue'

// 拿到全域 store。store.cities 是響應式的,改了畫面就會更新。
// 對照 React：const { cities, addCity, removeCity } = useCitiesStore()
const store = useCitiesStore()

const newCity = ref('')

function handleAdd() {
  store.addCity(newCity.value) // 呼叫 store 的 action
  newCity.value = ''
}
</script>

<template>
  <h1>🌤️ 多城市天氣儀表板</h1>

  <div style="display: flex; gap: 8px; margin: 16px 0 24px;">
    <input
      v-model="newCity"
      placeholder="輸入城市,例如 London / Kaohsiung"
      style="flex: 1;"
      @keyup.enter="handleAdd"
    />
    <button @click="handleAdd">新增城市</button>
  </div>

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
</template>

<style scoped>
h1 {
  font-size: 24px;
}
/* 卡片牆：用 CSS Grid 自動排版,手機上自動變單欄(RWD) */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
</style>
