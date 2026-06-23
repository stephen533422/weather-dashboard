<script setup lang="ts">
// ============================================================
// CityDetailView(/city/:name):單一城市的逐時預報頁
// 重點：用 useRoute() 讀路由參數;param 變了要重抓(watch)。
//       抓法沿用 WeatherCard 的兩段式(geocoding → forecast),
//       第二段改抓 hourly 逐時資料。
// ============================================================
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
// route.params.name 型別是 string | string[],收斂成乾淨的 string
const city = computed(() =>
  Array.isArray(route.params.name) ? route.params.name[0] : route.params.name,
);

// 一列逐時資料的形狀
interface HourlyRow {
  time: string; // 只留 HH:mm
  temp: number;
  desc: string;
}

const loading = ref(true);
const error = ref("");
const place = ref<{ name: string; country: string } | null>(null);
const hours = ref<HourlyRow[]>([]);

// 與 WeatherCard 同一份對照表(weather_code → 圖示文字)。
// 註:目前兩個檔各有一份,Stage C 再抽成共用。
const codeMap: Record<number, string> = {
  0: "☀️ 晴朗",
  1: "🌤️ 大致晴朗",
  2: "⛅ 局部多雲",
  3: "☁️ 陰天",
  45: "🌫️ 有霧",
  48: "🌫️ 霧凇",
  51: "🌦️ 毛毛雨",
  61: "🌧️ 小雨",
  63: "🌧️ 中雨",
  65: "🌧️ 大雨",
  71: "🌨️ 小雪",
  80: "🌦️ 陣雨",
  95: "⛈️ 雷雨",
};

async function load() {
  loading.value = true;
  error.value = "";
  place.value = null;
  hours.value = [];
  try {
    // 第一段:geocoding 拿經緯度
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        city.value,
      )}&count=1&language=zh`,
    );
    const geo = await geoRes.json();
    if (!geo.results || geo.results.length === 0) {
      error.value = "找不到這個城市";
      return;
    }
    const found = geo.results[0];
    place.value = { name: found.name, country: found.country };

    // 第二段:改抓逐時(hourly)。回來的是並排陣列,用同一個 index 對齊。
    const wRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${found.latitude}&longitude=${found.longitude}&hourly=temperature_2m,weather_code&forecast_days=1`,
    );
    const w = await wRes.json();
    const { time, temperature_2m, weather_code } = w.hourly;
    // 把三個並排陣列組成一列一列的物件(time[i] 配 temp[i] 配 code[i])
    hours.value = time.map((t: string, i: number) => ({
      time: t.slice(11, 16), // "2026-06-23T08:00" → "08:00"
      temp: temperature_2m[i],
      desc: codeMap[weather_code[i]] || "🌡️ 未知",
    }));
  } catch {
    error.value = "載入失敗";
  } finally {
    loading.value = false;
  }
}

// 用 watch(immediate) 取代 onMounted:
// 首次進頁會跑一次,之後 /city/A → /city/B 切換(組件被重用)也會重抓。
watch(city, load, { immediate: true });
</script>

<template>
  <router-link class="back" to="/">← 返回</router-link>

  <h2 class="title">
    {{ city }}
    <span v-if="place" class="muted">{{ place.country }}</span>
  </h2>

  <p v-if="loading" class="muted">載入中…</p>
  <p v-else-if="error" class="error">⚠️ {{ error }}（{{ city }}）</p>

  <!-- 逐時清單:v-for 跑組好的 hours,每小時一列 -->
  <ul v-else class="hours">
    <li v-for="h in hours" :key="h.time" class="hour-row">
      <span class="hour-time">{{ h.time }}</span>
      <span class="hour-desc">{{ h.desc }}</span>
      <span class="hour-temp">{{ h.temp }}°C</span>
    </li>
  </ul>
</template>

<style scoped>
.back {
  display: inline-block;
  margin: 4px 0 16px;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
}
.back:hover {
  color: var(--text);
}
.title {
  margin: 0 0 16px;
  font-size: 22px;
}

/* 逐時清單:玻璃卡風格的長條 */
.hours {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hour-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius);
  padding: 10px 16px;
}
.hour-time {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  width: 52px;
}
.hour-desc {
  flex: 1;
}
.hour-temp {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.error {
  color: #d33;
}
</style>
