<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { createSky, type SkyHandle } from "../three/sky";

// template ref:變數名要跟 template 裡 ref="canvasEl" 一致。
// 初始是 null(DOM 還沒掛),mount 後才拿得到。對照 React const canvasRef = useRef(null)
const canvasEl = ref<HTMLCanvasElement | null>(null);

// 存 three.js 的 handle,用來之後 dispose。
// 這不需要響應式,用普通變數就好(不是 ref)。
let handle: SkyHandle | null = null;

onMounted(() => {
  // 這裡 canvasEl.value 才保證有值
  if (canvasEl.value) handle = createSky(canvasEl.value);
});

onUnmounted(() => {
  // 對照 React useEffect(() => {...; return () => cleanup}, []) 的那個 return
  handle?.dispose();
});
</script>

<template>
  <canvas ref="canvasEl" class="sky"></canvas>
</template>

<style scoped>
/* 固定鋪滿整個視窗,壓在所有內容後面 */
.sky {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  display: block;
}
</style>
