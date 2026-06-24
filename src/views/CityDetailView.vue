<script setup lang="ts">
// ============================================================
// CityDetailView(/city/:name):單一城市的天氣詳細頁
// 重點：用 useRoute() 讀路由參數;param 變了要重抓(watch)。
//       兩段式抓法(geocoding 拿經緯度 → forecast),
//       forecast 一次要 current(目前)+ daily(今日)+ hourly(逐時)。
// ============================================================
import { ref, computed, watch, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { describeWeather } from "../utils/weatherCode";
import { toTW } from "../utils/zh";

const route = useRoute();
const city = computed(() =>
  Array.isArray(route.params.name) ? route.params.name[0] : route.params.name,
);

interface Current {
  temp: number;
  apparent: number;
  humidity: number;
  wind: number;
  desc: string;
}
interface Daily {
  max: number;
  min: number;
  precip: number; // 今日最大降雨機率 %
  sunrise: string; // HH:mm
  sunset: string;
}
interface HourlyRow {
  time: string;
  temp: number;
  desc: string; // 完整描述(放 title 給 hover)
  icon: string; // 只取表情符號,卡片上顯示
  precip: number; // 該小時降雨機率 %
}
interface DayRow {
  label: string; // 例 "週三 6/25"
  icon: string;
  max: number;
  min: number;
  precip: number;
}

const loading = ref(true);
const error = ref("");
const place = ref<{ name: string; country: string } | null>(null);
const current = ref<Current | null>(null);
const daily = ref<Daily | null>(null);
const hours = ref<HourlyRow[]>([]);
const forecast = ref<DayRow[]>([]); // 未來幾天

const hhmm = (iso: string) => iso.slice(11, 16); // "2026-06-24T05:10" → "05:10"

const WD = ["日", "一", "二", "三", "四", "五", "六"];
function dayLabel(iso: string) {
  // 加 T00:00 用本地時間解析,週幾才不會被 UTC 位移
  const d = new Date(iso + "T00:00");
  return `週${WD[d.getDay()]} ${+iso.slice(5, 7)}/${+iso.slice(8, 10)}`;
}

// 滑鼠拖曳捲動逐時卡列 + 放開後的慣性滑動(touch 本來就能滑,這補上滑鼠 swipe)
const strip = ref<HTMLElement | null>(null);
let dragging = false;
let startX = 0;
let startScroll = 0;
let velocity = 0; // px/ms,拖曳時的瞬時速度
let lastX = 0;
let lastT = 0;
let momentumId = 0;

function onDown(e: PointerEvent) {
  // 觸控/觸控筆交給瀏覽器原生捲動(它的慣性比較好);只有滑鼠才用自訂拖曳
  if (e.pointerType !== "mouse" || !strip.value) return;
  cancelAnimationFrame(momentumId); // 按下時停掉還在跑的慣性
  dragging = true;
  startX = e.clientX;
  startScroll = strip.value.scrollLeft;
  lastX = e.clientX;
  lastT = performance.now();
  velocity = 0;
  strip.value.setPointerCapture(e.pointerId); // 抓住指標,拖出元素也還收得到 move
}
function onMove(e: PointerEvent) {
  if (!dragging || !strip.value) return;
  strip.value.scrollLeft = startScroll - (e.clientX - startX);
  // 記錄瞬時速度,供放開後的慣性使用
  const now = performance.now();
  const dt = now - lastT || 16;
  velocity = (e.clientX - lastX) / dt;
  lastX = e.clientX;
  lastT = now;
}
function onUp(e: PointerEvent) {
  if (!dragging) return;
  dragging = false;
  strip.value?.releasePointerCapture(e.pointerId);
  // 慣性:用最後的速度繼續滑,每幀乘上摩擦力衰減
  const step = () => {
    if (!strip.value || Math.abs(velocity) < 0.02) return;
    strip.value.scrollLeft -= velocity * 16; // 拖右(velocity>0)→ 內容往左捲
    velocity *= 0.9; // 摩擦力(越接近 1 滑得越遠)
    momentumId = requestAnimationFrame(step);
  };
  momentumId = requestAnimationFrame(step);
}

onUnmounted(() => cancelAnimationFrame(momentumId));

async function load() {
  loading.value = true;
  error.value = "";
  place.value = null;
  current.value = null;
  daily.value = null;
  hours.value = [];
  forecast.value = [];
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
    place.value = { name: toTW(found.name), country: toTW(found.country) };

    // 第二段:一次要 current + daily + hourly;timezone=auto 讓日出日落等是當地時間
    const wRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${found.latitude}&longitude=${found.longitude}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&hourly=temperature_2m,weather_code,precipitation_probability` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,sunrise,sunset` +
        `&timezone=auto&forecast_days=7`,
    );
    const w = await wRes.json();

    current.value = {
      temp: w.current.temperature_2m,
      apparent: w.current.apparent_temperature,
      humidity: w.current.relative_humidity_2m,
      wind: w.current.wind_speed_10m,
      desc: describeWeather(w.current.weather_code),
    };

    const d = w.daily;
    daily.value = {
      max: d.temperature_2m_max[0],
      min: d.temperature_2m_min[0],
      precip: d.precipitation_probability_max[0],
      sunrise: hhmm(d.sunrise[0]),
      sunset: hhmm(d.sunset[0]),
    };

    // 未來幾天(daily 從 index 1 起,跳過今天)
    forecast.value = d.time.slice(1).map((iso: string, i: number) => {
      const k = i + 1; // 對回原陣列的 index
      return {
        label: dayLabel(iso),
        icon: describeWeather(d.weather_code[k]).split(" ")[0],
        max: d.temperature_2m_max[k],
        min: d.temperature_2m_min[k],
        precip: d.precipitation_probability_max[k],
      };
    });

    // hourly 是並排陣列,用同一個 index 對齊;只取今天 24 小時(forecast_days=7 會回 7 天)
    const { time, temperature_2m, weather_code, precipitation_probability } =
      w.hourly;
    hours.value = time.slice(0, 24).map((t: string, i: number) => {
      const desc = describeWeather(weather_code[i]); // 例 "⛅ 局部多雲"
      return {
        time: hhmm(t),
        temp: temperature_2m[i],
        desc,
        icon: desc.split(" ")[0], // 取表情符號
        precip: precipitation_probability[i],
      };
    });
  } catch {
    error.value = "載入失敗";
  } finally {
    loading.value = false;
  }
}

// watch(immediate):首次進頁跑一次,/city/A → /city/B 切換(組件重用)也重抓。
watch(city, load, { immediate: true });
</script>

<template>
  <router-link class="back" to="/">← 返回</router-link>

  <!-- 載入中:骨架比照實際版型(目前天氣卡:地名 + 大溫度 + 數據格,加逐時) -->
  <template v-if="loading">
    <section class="now">
      <div class="skeleton sk-place"></div>
      <div class="skeleton sk-temp"></div>
      <dl class="stats">
        <div v-for="n in 6" :key="n" class="skeleton sk-stat"></div>
      </dl>
    </section>
    <ul class="hours">
      <li v-for="n in 8" :key="n" class="hour">
        <div class="skeleton sk-line" style="width: 70%"></div>
        <div class="skeleton sk-line sk-line--lg" style="width: 80%"></div>
        <div class="skeleton sk-line" style="width: 60%"></div>
      </li>
    </ul>
    <ul class="days">
      <li v-for="n in 5" :key="n" class="day-row">
        <div class="skeleton sk-line" style="width: 100%; height: 16px"></div>
      </li>
    </ul>
  </template>

  <p v-else-if="error" class="error">⚠️ {{ error }}（{{ city }}）</p>

  <template v-else>
    <!-- 目前天氣 -->
    <section v-if="current" class="now">
      <div class="now-place">
        {{ place?.name }}
        <span v-if="place" class="muted">{{ place.country }}</span>
      </div>
      <div class="now-hero">
        <span class="now-temp">{{ Math.round(current.temp) }}°</span>
        <div class="now-meta">
          <span class="now-desc">{{ current.desc }}</span>
          <span v-if="daily" class="now-range">
            高 {{ Math.round(daily.max) }}° · 低 {{ Math.round(daily.min) }}°
          </span>
        </div>
      </div>

      <dl class="stats">
        <div class="stat">
          <dt>體感</dt>
          <dd>{{ Math.round(current.apparent) }}°</dd>
        </div>
        <div class="stat">
          <dt>濕度</dt>
          <dd>{{ current.humidity }}%</dd>
        </div>
        <div class="stat">
          <dt>風速</dt>
          <dd>{{ current.wind }}<small> km/h</small></dd>
        </div>
        <template v-if="daily">
          <div class="stat">
            <dt>降雨機率</dt>
            <dd>{{ daily.precip }}%</dd>
          </div>
          <div class="stat">
            <dt>日出</dt>
            <dd>{{ daily.sunrise }}</dd>
          </div>
          <div class="stat">
            <dt>日落</dt>
            <dd>{{ daily.sunset }}</dd>
          </div>
        </template>
      </dl>
    </section>

    <!-- 逐時預報:橫向滾動卡片列(滑鼠可拖曳) -->
    <ul
      ref="strip"
      class="hours draggable"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointerleave="onUp"
    >
      <li v-for="h in hours" :key="h.time" class="hour" :title="h.desc">
        <span class="hour-time">{{ h.time }}</span>
        <span class="hour-icon">{{ h.icon }}</span>
        <span class="hour-temp">{{ Math.round(h.temp) }}°</span>
        <span class="hour-precip">💧{{ h.precip }}%</span>
      </li>
    </ul>

    <!-- 未來幾天:橫條列 -->
    <ul class="days">
      <li v-for="day in forecast" :key="day.label" class="day-row">
        <span class="day-name">{{ day.label }}</span>
        <span class="day-icon">{{ day.icon }}</span>
        <span class="day-precip">💧{{ day.precip }}%</span>
        <span class="day-temp">
          {{ Math.round(day.min) }}° / {{ Math.round(day.max) }}°
        </span>
      </li>
    </ul>
  </template>
</template>

<style scoped>
/* 跟首頁次要按鈕(如「清空」)一致的玻璃按鈕外觀 */
.back {
  display: inline-flex;
  align-items: center;
  margin: 12px 0 16px;
  padding: 9px 16px;
  border: 1px solid var(--surface-border);
  background: var(--surface-solid);
  color: var(--text);
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition:
    border-color 0.15s,
    transform 0.1s;
}
.back:hover {
  border-color: var(--accent);
}
.back:active {
  transform: translateY(1px);
}
/* 目前天氣大區 */
.now {
  background: var(--surface);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius);
  padding: 20px 22px 8px;
  margin-bottom: 12px;
}
.now-place {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 14px;
}
.now-place .muted {
  font-weight: 400;
}
.now-hero {
  display: flex;
  align-items: center;
  gap: 16px;
}
.now-temp {
  font-size: 60px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -2px;
}
@media (max-width: 480px) {
  .now-temp {
    font-size: 48px;
  }
}
.now-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.now-desc {
  font-size: 18px;
  font-weight: 600;
}
.now-range {
  font-size: 14px;
  color: var(--text-muted);
}

/* 數據格:label 在上、值在下,等寬自動排列 */
.stats {
  margin: 18px 0 0;
  padding-top: 16px;
  border-top: 1px solid var(--surface-border);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(82px, 1fr));
  gap: 16px 12px;
}
.stat {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.stat dt {
  font-size: 12px;
  color: var(--text-muted);
}
.stat dd {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.stat dd small {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
}

/* 逐時:橫向滾動的小卡片列 */
.hours {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; /* iOS 原生慣性捲動 */
  /* 隱藏原生捲軸(拖曳/觸控/滾輪仍可捲),才符合玻璃風 */
  scrollbar-width: none; /* Firefox */
}
.hours::-webkit-scrollbar {
  display: none; /* Chrome / Safari */
}
.draggable {
  cursor: grab;
  user-select: none; /* 拖曳時不要選到卡片文字 */
}
.draggable:active {
  cursor: grabbing;
}
.hour {
  flex: 0 0 auto;
  width: 66px;
  min-height: 118px; /* 固定高度,骨架卡與真實卡同高,載入時不跳版 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--surface);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius);
  padding: 12px 8px;
}
.hour-time {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.hour-icon {
  font-size: 22px;
}
.hour-temp {
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.hour-precip {
  font-size: 12px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.sk-line {
  display: block;
  height: 11px;
  border-radius: 6px;
}
.sk-line--lg {
  height: 20px;
}

/* 未來幾天:玻璃橫條列 */
.days {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.day-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius);
  padding: 12px 16px;
}
.day-name {
  width: 96px;
  font-weight: 600;
  font-size: 14px;
}
.day-icon {
  font-size: 18px;
}
.day-precip {
  margin-left: auto;
  font-size: 13px;
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.day-temp {
  width: 84px;
  text-align: right;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
/* loading 骨架尺寸:對齊真實版型的各區塊 */
.sk-place {
  height: 24px;
  width: 45%;
  margin-bottom: 16px;
}
.sk-temp {
  height: 56px;
  width: 60%;
}
.sk-stat {
  height: 40px;
}
.error {
  color: #d33;
}
</style>
