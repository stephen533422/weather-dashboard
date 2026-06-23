# CLAUDE.md — 給 AI 助理的專案上下文

> 這個檔案會在每次 Claude Code session 啟動時自動載入。
> 詳細路線與小練習見 [ROADMAP.md](./ROADMAP.md)。

## 這是什麼專案

一個 **Vue 3 學習用 side project**(多城市天氣儀表板),目的是讓開發者從 **React 背景**轉換掌握 Vue,對應「Vue 前端工程師」職缺需求。**重點是學習過程,不是趕快做完。**

- 開發者:約 2 年經驗,主力 React,正在學 Vue(下一份工作方向)。
- 技術主軸:**Vue 3 `<script setup>` + Pinia + Vue Router + 真實 API 的 CRUD**。
- API:[Open-Meteo](https://open-meteo.com/)(免費、免 API key)。
- 工具:Vite。

## 互動方式(重要約定)

1. **先寫規劃 + 列出要改哪些檔 → 等開發者確認後才寫 code。** 不要自己往下衝做下一個 Stage。
2. **能讓開發者自己練的,就讓他練。** 小練習由開發者動手做,助理負責出題與 review,不要代寫。
3. **一次只引入一到兩個新概念**,避免一次跳太深。
4. 解釋 Vue 語法時,**盡量附上對照的 React 寫法**(開發者靠這個建立直覺)。
5. 程式碼註解用繁體中文,維持現有風格。

## 目前進度

- ✅ **Stage A** 完成:Pinia store(城市清單 + localStorage)、卡片牆、props/emit、新增/刪除。Stage A 小練習已全部完成。
- ✅ **樣式美化**:抽出 CSS 變數 token、天氣感漸層背景、玻璃卡片、Toast 提示(Teleport + Transition)。
- ✅ **TS 化** 完成:全專案導入 TypeScript(strict),`.vue` 用 `<script setup lang="ts">`、props/emit 改泛型寫法、store 加型別。`npm run type-check` 把關。
- ✅ **Stage B** 完成:導入 Vue Router。`App.vue` 拆成版面外殼 + `<router-view />`、首頁移到 `views/HomeView.vue`、卡片 `router-link` 進 `/city/:name` 詳細頁、`CityDetailView` 用 `useRoute()` 讀參數並抓 `hourly` 逐時(用 `watch(immediate)` 因應組件重用)。
- ✅ **Stage C** 完成:抽出 `utils/weatherCode` 與 composable `composables/useCityWeather`(= custom hook)、loading skeleton(全域 `.skeleton` + shimmer)、城市排序(`sortMode`/`sortedCities` computed,偏好存 localStorage)。
- 小練習與完整 Stage 表見 ROADMAP.md。

## Git 慣例

- 走 feature branch 流程:在 `feature` 分支開發 → 合併回 `master`。**合併後保留 `feature` 分支**(不刪除,下次切回去繼續用)。
- Commit 用 Conventional Commits(`feat:` / `fix:` / `refactor:` / `docs:` / `chore:`)。
- 初始 commit 只含骨架,功能各自獨立提交(刻意保持乾淨歷史,方便面試展示)。

## React → Vue 速查

| React | Vue 3 (`<script setup>`) |
|---|---|
| `useState` | `ref()` / `reactive()` |
| `useMemo` | `computed()` |
| `useEffect` | `watch()` / `onMounted()` |
| props / callback | `defineProps()` / `defineEmits()` |
| `value` + `onChange` | `v-model` |
| Zustand / Redux | Pinia |
| React Router | Vue Router |
