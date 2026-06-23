<script setup lang="ts" generic="T extends string">
// ============================================================
// Dropdown:自製下拉選單(取代原生 <select>)
// 為什麼自製:原生 select 展開的浮層由 OS 畫,套不了玻璃/圓角/模糊。
// 重點:泛型組件 + defineModel(v-model)+ 點外面/Esc 關閉(生命週期監聽)。
// ============================================================
import { ref, computed, onMounted, onUnmounted } from "vue";

// 泛型組件:T 跟著傳入的 options / v-model 自動推斷(這裡會是 "added" | "name")。
// defineModel:Vue 3.4+ 的 v-model 糖,等同 props.modelValue + emit('update:modelValue')。
// 對照 React:本來要 value={v} + onChange,這裡雙向綁定一行搞定。
const model = defineModel<T>({ required: true });

const props = defineProps<{
  options: { value: T; label: string }[];
}>();

const open = ref(false);
// template ref:拿到最外層 DOM,用來判斷「點擊是否在組件內」。對照 React useRef。
const root = ref<HTMLElement | null>(null);

// 目前選到的 label(找不到給空字串)
const currentLabel = computed(
  () => props.options.find((o) => o.value === model.value)?.label ?? "",
);

function choose(value: T) {
  model.value = value;
  open.value = false;
}

// 點到組件以外 → 關閉。觸發鈕在 root 內,所以「開啟」那一下不會被自己關掉。
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    open.value = false;
  }
}
function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") open.value = false;
}

// 掛/卸全域監聽。對照 React:
// useEffect(() => { addEventListener; return () => removeEventListener }, [])
// 那個 return 的 cleanup 就是這裡的 onUnmounted。
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
  <div ref="root" class="dropdown">
    <!-- 觸發鈕:顯示目前選項 + 箭頭(沿用全域 button 的玻璃樣式) -->
    <button
      type="button"
      class="trigger"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span>{{ currentLabel }}</span>
      <span class="arrow" :class="{ up: open }">▾</span>
    </button>

    <!-- 選項浮層:玻璃底 + 模糊 + 圓角(這就是原生 select 做不到的) -->
    <ul v-if="open" class="panel">
      <li
        v-for="o in options"
        :key="o.value"
        class="option"
        :class="{ active: o.value === model }"
        @click="choose(o.value)"
      >
        {{ o.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
  /* 整個控制項當作按鈕用,不要讓文字被選取 */
  user-select: none;
}
.trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 132px;
}
.arrow {
  font-size: 16px;
  line-height: 1;
  color: var(--text-muted);
  transition: transform 0.15s ease;
}
.arrow.up {
  transform: rotate(180deg);
}

.panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 100%;
  margin: 0;
  padding: 4px;
  list-style: none;
  /* 選項之間留間距 */
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--surface-solid);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid var(--surface-border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  z-index: 10;
}
.option {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  /* 選項是可點的,游標用手指而非文字游標 */
  cursor: pointer;
}
.option:hover {
  background: rgba(47, 111, 237, 0.1);
}
.option.active {
  background: rgba(47, 111, 237, 0.16);
  color: var(--accent);
}
</style>
