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
| **B** | 點卡片 → 城市詳細頁(逐時預報),可返回 | Vue Router(router-link / router-view / 路由參數) | ⏸️ 規劃完,待開始 |
| **C** | 收尾打磨:loading 骨架、城市排序、重複/錯誤提示 | 綜合練習 | 未開始 |

## Stage A 小練習(目前進行中)

- [ ] **顯示城市數量**:在 store 加一個 `cityCount` 的 `computed` 並 return,標題旁顯示「目前 N 個城市」。(重點:體會 store 也能放 computed)
- [ ] **清空全部**:store 加一個 `clearAll()` action,畫面加一顆「清空」按鈕。
- [ ] **(挑戰)重複城市提示**:`addCity` 回傳 `true/false`,畫面依結果顯示「已加入」或「城市已存在」提示。

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
