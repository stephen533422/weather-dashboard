<script setup lang="ts">
// ============================================================
// WeatherCard：單一城市的天氣卡片
// 重點：defineProps（接收父層傳入的資料）、defineEmits（通知父層）
//       天氣 API 邏輯直接沿用 Project 1,你已經熟了。
// ============================================================
import { toRef } from "vue";
import { useCityWeather } from "../composables/useCityWeather";

// defineProps：用泛型直接宣告型別(取代 runtime 的 { type: String })。
// 對照 React 的函式參數 function WeatherCard({ cityName }: { cityName: string }) {}
// 父層用 <WeatherCard :city-name="..." /> 傳進來。
const props = defineProps<{
  cityName: string;
}>();
const { loading, error, data } = useCityWeather(toRef(props, "cityName"));

// defineEmits：泛型版,宣告會發出 remove 事件(無參數,用 [] 表示)。
// 對照 React 的 callback prop：父層傳 onRemove,子層呼叫 onRemove()。
// Vue 改成「發事件」:子層 emit('remove')，父層用 @remove="..." 接。
const emit = defineEmits<{
  remove: [];
}>();
</script>

<template>
  <router-link class="card" :to="{ name: 'city', params: { name: cityName } }">
    <button class="remove" @click.stop.prevent="emit('remove')" title="移除">
      ✕
    </button>

    <p v-if="loading" class="muted">載入中…</p>
    <p v-else-if="error" class="error">⚠️ {{ error }}（{{ cityName }}）</p>
    <div v-else-if="data">
      <h3 class="city">
        {{ data.name }} <span class="muted">{{ data.country }}</span>
      </h3>
      <p class="temp">{{ data.temp }}°C</p>
      <p class="desc">{{ data.desc }}</p>
      <p class="muted humidity">濕度 {{ data.humidity }}%</p>
    </div>
  </router-link>
</template>

<style scoped>
/* 玻璃卡:半透明白 + 模糊,漂在漸層天空上 */
.card {
  position: relative;
  background: var(--surface);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
  display: block; /* <a> 預設是 inline,改回塊狀才吃得到寬高/排版 */
  color: inherit; /* 不要藍色,沿用父層文字色 */
  text-decoration: none; /* 拿掉底線 */
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}
.city {
  margin: 0;
  font-size: 17px;
}
.temp {
  font-size: 40px;
  font-weight: 700;
  margin: 6px 0 2px;
  letter-spacing: -1px;
}
.desc {
  margin: 0;
  font-size: 15px;
}
.humidity {
  margin: 6px 0 0;
}
.error {
  color: #d33;
  margin: 0;
}
.remove {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-muted);
  padding: 4px 8px;
  font-weight: 400;
}
.remove:hover {
  color: #d33;
  border-color: transparent;
  background: transparent;
}
</style>
