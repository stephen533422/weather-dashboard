<script setup lang="ts">
// ============================================================
// Toast：浮在畫面右下角的提示,淡入淡出。
// 只負責「長怎樣 + 進出場動畫」;何時顯示/幾秒關掉由父層控制
// (父層把 message 設成空字串就會自動隱藏)。
// ============================================================
// 泛型版 defineProps:直接用 TS 型別宣告 props,不用 runtime 的 { type: ... }。
// 對照 React：等於 function Toast({ message, valid }: { message: string; valid: boolean })
defineProps<{
  message: string; // 提示文字,空字串 = 不顯示
  valid: boolean; // true=成功(綠) / false=失敗(紅)
}>();
</script>

<template>
  <!-- Teleport：把內容渲染到 <body> 底下,不被 #app 的寬度/overflow 困住 -->
  <!-- 對照 React 的 createPortal(node, document.body) -->
  <Teleport to="body">
    <!-- Transition：v-if 切換時,Vue 自動在 div 上加/移除 toast-* class -->
    <!-- 對照 React framer-motion 的 <AnimatePresence> -->
    <Transition name="toast">
      <div
        v-if="message.length"
        class="toast"
        :class="valid ? 'is-ok' : 'is-err'"
      >
        {{ message }}
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 100;
  padding: 12px 18px;
  border-radius: var(--radius);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-hover);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}
/* 半透明整片背景色:保留玻璃感,後面內容會微微透出來 */
.toast.is-ok {
  background: rgba(31, 157, 87, 0.78);
}
.toast.is-err {
  background: rgba(221, 51, 51, 0.78);
}

/* === 進場 / 離場動畫 === */
/* 剛出現(enter-from)與快消失(leave-to)的目標狀態:透明 + 往下偏移 */
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
/* active 階段掛上過場,中間補間交給瀏覽器 */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
</style>
