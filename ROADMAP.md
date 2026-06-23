# 多城市天氣儀表板 — 學習路線圖

> 目的:在這個 side project 裡循序漸進掌握 Vue 3,對應「Vue 前端工程師」職缺需求。
> 技術主軸:**Pinia(全域狀態)+ Vue Router(多頁面)+ 真實 API 的 CRUD**。
> API:[Open-Meteo](https://open-meteo.com/)(免費、免 API key)。

## 開發節奏(約定)

1. 每個 Stage **先寫規劃 + 列出要改哪些檔 → 等確認後才寫 code**。
2. 每個 Stage 結束會出**小練習**,自己動手做完、Review 過,再進下一步。
3. 不一次塞太多新概念,一個 Stage 只引入一到兩個。

## Stage 進度

| Stage | 內容 | 新概念 | 狀態 |
|---|---|---|---|
| **A** | Pinia store 存城市清單、卡片牆、新增/刪除、localStorage | Pinia、props、emit | ✅ 完成 |
| **TS** | 全專案導入 TypeScript(strict):tsconfig、vue-tsc、props/emit 泛型寫法、store 型別 | TypeScript、`defineProps<T>()`、`ref<T>()`、interface | ✅ 完成 |
| **B** | 點卡片 → 城市詳細頁(逐時預報),可返回 | Vue Router(router-link / router-view / 路由參數 / `watch` 重抓) | ✅ 完成 |
| **C** | 收尾打磨:loading 骨架、城市排序、抽出共用 `codeMap`/抓資料邏輯 | 綜合練習(composable / skeleton CSS / 衍生 computed) | ✅ 完成 |
| **E** | three.js 雲海天空背景(官方 Sky 大氣散射 + 貼圖雲 + 霧) | Vue 生命週期管命令式庫:template ref、`onMounted`/`onUnmounted` cleanup | ✅ 完成 |

> 另有加分項(非 Stage):自製 Dropdown 組件(泛型 + `defineModel` + 點外關閉)、城市名 opencc 簡轉繁、卡片玻璃透明度。

## Stage A 小練習

- [x] **顯示城市數量**:在 store 加一個 `cityCount` 的 `computed` 並 return,標題旁顯示「目前 N 個城市」。(重點:體會 store 也能放 computed)
- [x] **清空全部**:store 加一個 `clearAll()` action,畫面加一顆「清空」按鈕。
- [x] **(挑戰)重複城市提示**:`addCity` 回傳 `true/false`,畫面依結果顯示「已加入」或「城市已存在」提示。

## Stage B 重點(已完成)

- [x] **拆頁**:`App.vue` 瘦成版面外殼(header + `<router-view />`),首頁內容搬到 `views/HomeView.vue`。
- [x] **路由表**:`router/index.ts` 定義 `/` 與 `/city/:name`(`createWebHistory`)。
- [x] **卡片導頁**:`WeatherCard` 用 `router-link` 進詳細頁;刪除鈕 `@click.stop.prevent` 避免誤觸,並中和 `<a>` 預設樣式。
- [x] **詳細頁**:`CityDetailView` 用 `useRoute()` 讀參數、抓 Open-Meteo `hourly` 顯示逐時。
- 坑備忘:Router 會**重用組件**,切換城市要用 `watch(city, …, { immediate: true })` 重抓(`onMounted` 只跑一次)。

## Stage C 重點(已完成)

- [x] **抽共用**:`weather_code` 對照表抽成 `utils/weatherCode`(`describeWeather`);抓天氣邏輯抽成 composable `composables/useCityWeather`(= React custom hook),WeatherCard 只剩畫面。
- [x] **loading 骨架**:全域 `.skeleton`(灰底 + shimmer 流光)共用樣式,WeatherCard 與 CityDetailView 載入時顯示骨架佔位。
- [x] **城市排序**:store 加 `sortMode` + `sortedCities`(`computed`,複製後排序不動原始清單),下拉切換、偏好存 localStorage。
- 坑備忘:排序用 `[...cities].sort()` 複製再排,**不可**原地 `cities.sort()`(會破壞加入順序);composable 參數收 `Ref` 才保得住響應式(`toRef(props, …)`)。

## Stage E 重點(已完成)

- [x] **three.js 整合**:`three/sky.ts` 為純 three.js 模組,匯出 `createSky(canvas)` 回傳 `{ dispose }`;Vue 的 `SkyBackground.vue` 用 **template ref** 拿 `<canvas>`、`onMounted` 建場景、`onUnmounted` 呼叫 `dispose`(= React `useEffect` 的 cleanup)。
- [x] **天空**:官方 `Sky`(Preetham 大氣散射),搭配 `ACESFilmicToneMapping` + `toneMappingExposure 0.5`(關鍵,否則顏色會偏)。太陽用 elevation/azimuth 設定。
- [x] **雲**:貼圖雲平面 `InstancedMesh` + `FogExp2` 鋪出地平線景深;雲貼圖用 canvas fbm 程序生成(免外部 PNG)。
- 坑備忘:命令式庫一定要在 `onUnmounted` 釋放(`cancelAnimationFrame`、移除 listener、`dispose()` GPU 資源);tone mapping 會壓暗 `MeshBasicMaterial` 白雲,用 `material.color` 推到 >1(HDR)補亮。

## 樣式/主題練習(規劃中,以後再做)

> 背景:已把設計集中成一套 CSS 變數 token(`style.css` 的 `:root`),組件只「消費」這些 token。

- [ ] **深色模式**:在 `style.css` 加 `@media (prefers-color-scheme: dark)`,只覆寫 `:root` 裡那幾個 `--` 變數(`--text` / `--surface` / 背景漸層等),**組件一行都不改**就整個變深色。
  - 重點:親身驗證「token 抽對了」—— 換主題只動字典,不動句子。
  - 進階:改成可手動切換(按鈕 toggle `data-theme="dark"`,用屬性選擇器覆寫變數),這時就需要狀態,可以放進 Pinia store。

### 心法備忘
- Pinia setup store = 一段「可以被很多組件共用的 `<script setup>`」,裡面就是 `ref` / `computed` / `function`。
- `props`(父 → 子,往下傳)vs `emit`(子 → 父,往上通知);對照 React 的 props 與 callback。
- 模板用 kebab-case(`:city-name`),JS 用 camelCase(`cityName`),Vue 會自動對應。

## 之後的大方向(本專案之外)

| Project | 內容 | 對應職缺需求 |
|---|---|---|
| **Project 3** | WebSocket 即時資料(即時氣溫推播 / AI 串流對話) | ⭐ WebSocket / Streaming API(多數人沒有) |
| **Project 4** | Nuxt 改寫 + 部署 Vercel + GitHub Actions | 加分:SSR、CI/CD、Git flow |

## React → Vue 速查

| React | Vue 3 (`<script setup>`) |
|---|---|
| `useState` | `ref()` / `reactive()` |
| `useMemo` | `computed()` |
| `useEffect` | `watch()` / `watchEffect()` / `onMounted()` |
| props / callback props | `defineProps()` / `defineEmits()` |
| `value` + `onChange` | `v-model` |
| Zustand / Redux | Pinia |
| React Router | Vue Router |
