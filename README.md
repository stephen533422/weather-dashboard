# 🌤️ 天氣儀表板

多城市天氣儀表板 —— 以 **Vue 3 `<script setup>` + TypeScript** 打造的學習用 side project,涵蓋 Pinia 全域狀態、Vue Router 多頁、composable、真實 API 串接,以及 three.js 動態天空背景。

天氣資料來自免費、免 API key 的 [Open-Meteo](https://open-meteo.com/)。

## ✨ 功能

- **多城市卡片牆**:新增 / 刪除城市,清單存 `localStorage`,重整保留。
- **搜尋自動完成**:輸入即時跳出候選城市(debounce 防抖 + `AbortController` 競態處理)。
- **城市詳細頁**:點卡片進入 `/city/:name`,一次顯示
  - 目前天氣(溫度、體感、濕度、風速)
  - 今日概況(高低溫、降雨機率、日出日落)
  - 今日逐時(橫向滾動卡片,滑鼠可拖曳 + 慣性)
  - 未來幾天預報
- **排序**:依加入順序 / 名稱切換,偏好存 `localStorage`(自製泛型 Dropdown 組件)。
- **在地化**:城市名以 `opencc-js` 簡轉繁顯示。
- **動態天空背景**:three.js 官方 `Sky`(大氣散射)+ 貼圖雲海 + 霧。
- **打磨**:玻璃擬態 UI(`backdrop-filter`)、loading skeleton、Toast 提示、RWD。

## 🧱 技術棧

| 類別 | 使用 |
|---|---|
| 框架 | Vue 3(`<script setup lang="ts">`) |
| 狀態管理 | Pinia |
| 路由 | Vue Router |
| 型別 | TypeScript(strict) |
| 建置 | Vite |
| 3D | three.js |
| 其他 | opencc-js（簡轉繁） |

## 🚀 開始使用

```bash
npm install      # 安裝依賴
npm run dev      # 開發伺服器(http://localhost:5173)
npm run build    # 型別檢查 + 打包
npm run preview  # 預覽打包結果
npm run type-check  # 只跑 vue-tsc 型別檢查
```

## 📁 專案結構

```
src/
├─ main.ts                 # 進入點:掛 Pinia、Vue Router
├─ App.vue                 # 版面外殼(header + <router-view />)
├─ router/index.ts         # 路由表(/ 與 /city/:name)
├─ stores/cities.ts        # Pinia store:城市清單 + 排序偏好
├─ views/
│  ├─ HomeView.vue         # 首頁:搜尋 + 排序 + 卡片牆
│  └─ CityDetailView.vue   # 詳細頁:目前/逐時/未來天氣
├─ components/
│  ├─ WeatherCard.vue      # 城市卡片
│  ├─ CitySearch.vue       # 搜尋自動完成
│  ├─ Dropdown.vue         # 自製泛型下拉選單
│  ├─ SkyBackground.vue    # three.js 天空(管理生命週期)
│  └─ Toast.vue            # 提示
├─ composables/
│  ├─ useCityWeather.ts    # 取單一城市天氣(= custom hook)
│  └─ useCitySearch.ts     # 搜尋(debounce + 競態)
├─ three/sky.ts            # 純 three.js 天空場景
├─ utils/
│  ├─ weatherCode.ts       # weather_code → 描述
│  └─ zh.ts                # 簡轉繁
└─ style.css               # 全域樣式 + 設計 token
```

## 📝 備註

這是從 React 背景轉換學習 Vue 的練習專案,開發歷程與各階段重點見 [ROADMAP.md](./ROADMAP.md)。
