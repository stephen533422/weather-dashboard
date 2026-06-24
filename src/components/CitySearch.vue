<script setup lang="ts">
// ============================================================
// CitySearch:城市搜尋自動完成(取代原本的手打輸入框 + 新增鈕)
// 重點：用 composable useCitySearch 拿即時候選,選一個就 emit('select')。
//       點外面 / Esc 關閉清單(沿用 Dropdown 那套生命週期監聽)。
// ============================================================
import { ref, onMounted, onUnmounted } from "vue";
import { useCitySearch } from "../composables/useCitySearch";

// 選中城市時通知父層(父層拿去 store.addCity)
const emit = defineEmits<{
  select: [name: string];
}>();

// 輸入字串;交給 composable 做 debounce + 抓候選
const query = ref("");
const { results, loading } = useCitySearch(query);

const open = ref(false);
const root = ref<HTMLElement | null>(null);

function choose(name: string) {
  emit("select", name);
  query.value = ""; // 清空 → composable 的 watch 會把 results 清掉
  open.value = false;
}

// 按 Enter 直接選第一筆候選(常見的 autocomplete 操作)
function chooseFirst() {
  if (results.value.length) choose(results.value[0].name);
}

// 點到組件以外 / Esc → 關閉清單(對照 Dropdown.vue)
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}
function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") open.value = false;
}
onMounted(() => {
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onKey);
});
onUnmounted(() => {
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onKey);
});
</script>

<template>
  <div ref="root" class="search">
    <input
      v-model="query"
      placeholder="搜尋城市,例如 London / 高雄"
      @focus="open = true"
      @keyup.enter="chooseFirst"
    />

    <!-- 候選浮層:有輸入且開啟時才顯示 -->
    <ul v-if="open && query.trim()" class="panel">
      <li v-if="loading" class="hint">搜尋中…</li>
      <template v-else-if="results.length">
        <li
          v-for="p in results"
          :key="p.id"
          class="option"
          @click="choose(p.name)"
        >
          <span class="name">{{ p.name }}</span>
          <span class="muted">
            {{ p.admin1 ? p.admin1 + ", " : "" }}{{ p.country }}
          </span>
        </li>
      </template>
      <li v-else class="hint">找不到城市</li>
    </ul>
  </div>
</template>

<style scoped>
.search {
  position: relative;
  width: 100%;
}
.search input {
  width: 100%;
}

.panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 4px;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: var(--surface-solid);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  z-index: 10;
}
.option {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}
.option:hover {
  background: rgba(47, 111, 237, 0.1);
}
.option .name {
  font-weight: 600;
}
.hint {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text-muted);
}
</style>
