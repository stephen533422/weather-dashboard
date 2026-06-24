import * as THREE from "three";
import { Sky } from "three/examples/jsm/objects/Sky.js";

// ============================================================
// createSky:在傳入的 <canvas> 上用 three.js 畫「清晰的雲海」天空。
// 這支是純 three.js(跟 Vue 無關),抽成獨立模組;
// Vue 組件只負責:mount 後呼叫 createSky、unmount 時呼叫 dispose()。
//
// 手法(經典 three.js clouds,參考 Jaume Sanchez / mrdoob):
// 大量半透明「雲朵貼圖平面」散佈在一個區域,用 FogExp2 把遠處的雲
// 融進天色 → 雲是實體、清晰的,且有層層疊疊的景深。
// 雲貼圖用 canvas 程序生成(免外部 PNG 素材)。
// ============================================================

export interface SkyHandle {
  dispose: () => void;
}

// 程序生成一張「有細節的雲朵」貼圖:用 fractal value noise 當內部紋理,
// 乘上放射狀遮罩讓邊緣收斂 → 雲有內部結構、邊緣分明(不是平滑光暈那種糊)。
function makeCloudTexture(): THREE.CanvasTexture {
  const size = 256;

  // --- JS 版 value-noise + fbm(只在建貼圖時跑一次) ---
  const rand = (x: number, y: number) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const vnoise = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = smooth(xf);
    const v = smooth(yf);
    return lerp(
      lerp(rand(xi, yi), rand(xi + 1, yi), u),
      lerp(rand(xi, yi + 1), rand(xi + 1, yi + 1), u),
      v,
    );
  };
  const fbm = (x: number, y: number) => {
    let f = 0;
    let amp = 0.5;
    let freq = 1;
    for (let i = 0; i < 5; i++) {
      f += amp * vnoise(x * freq, y * freq);
      freq *= 2;
      amp *= 0.5;
    }
    return f;
  };
  const smoothstep = (e0: number, e1: number, x: number) => {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };

  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      // 放射狀遮罩:中心 1、邊緣 0,讓雲塊收斂不外溢
      const dx = (px / size - 0.5) * 2;
      const dy = (py / size - 0.5) * 2;
      const mask = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy));
      // fractal 細節
      const n = fbm((px / size) * 4.5, (py / size) * 4.5);
      // 相乘後用 smoothstep 收邊(轉換帶放寬一點 → 邊緣較柔和)
      const alpha = smoothstep(0.26, 0.58, n * mask);
      const idx = (py * size + px) * 4;
      img.data[idx] = 255;
      img.data[idx + 1] = 255;
      img.data[idx + 2] = 255;
      img.data[idx + 3] = Math.round(alpha * 255);
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

export function createSky(canvas: HTMLCanvasElement): SkyHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  // 官方 Sky 範例的關鍵設定:沒有 tone mapping + 曝光,大氣散射的顏色會偏掉
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;

  const scene = new THREE.Scene();

  // 官方 Sky:Preetham 大氣散射,提供真實天空漸層 + 太陽輝光(three.js 社群標準做法)
  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);
  const skyU = sky.material.uniforms;
  // 官方範例的標準參數
  skyU.turbidity.value = 10; // 混濁度
  skyU.rayleigh.value = 3; // 藍天散射強度
  skyU.mieCoefficient.value = 0.005; // 太陽周圍懸浮散射
  skyU.mieDirectionalG.value = 0.7; // 太陽輝光集中度

  // 太陽方位:elevation 仰角、azimuth 方位角(度)。太陽移到側前方,
  // 讓視野中央是藍天、太陽輝光在一側。
  const elevation = 25;
  const azimuth = 135;
  const phi = THREE.MathUtils.degToRad(90 - elevation);
  const theta = THREE.MathUtils.degToRad(azimuth);
  skyU.sunPosition.value.setFromSphericalCoords(1, phi, theta);

  // 霧:遠處的雲融進天色,做出地平線與景深
  scene.fog = new THREE.FogExp2(0xdce8f2, 0.00024);

  const camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    1,
    20000,
  );
  // 相機在雲層上方,看向前下方的地平線
  camera.position.set(0, 90, 240);

  // ---- 一大片雲朵平面(用 InstancedMesh,一個 draw call 畫很多片) ----
  const cloudTex = makeCloudTexture();
  const geometry = new THREE.PlaneGeometry(110, 110);
  const material = new THREE.MeshBasicMaterial({
    map: cloudTex,
    transparent: true,
    depthWrite: false, // 半透明疊圖不寫深度,避免互相切掉
    opacity: 0.95,
    fog: true,
  });
  // tone mapping(曝光 0.5)會把白雲壓暗,把雲色推到 >1(HDR 白)補亮回來
  material.color.setRGB(1.9, 1.9, 1.9);

  const COUNT = 1200;
  const clouds = new THREE.InstancedMesh(geometry, material, COUNT);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < COUNT; i++) {
    dummy.position.set(
      (Math.random() - 0.5) * 3600, // x:很寬
      -120 + (Math.random() - 0.5) * 120, // y:壓在下方薄薄一層(雲海,再降低一點)
      -150 - Math.random() * 3600, // z:拉開間距、往遠方延伸(不要太貼相機)
    );
    dummy.rotation.z = Math.random() * Math.PI * 2;
    // 尺寸差拉大:近處大、遠處小,景深更明顯
    const s = 0.6 + Math.random() * 2.2;
    dummy.scale.set(s, s, 1);
    dummy.updateMatrix();
    clouds.setMatrixAt(i, dummy.matrix);
  }
  scene.add(clouds);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  // 動畫:相機緩緩平移 + 微微推近,做出雲海飄移的視差(不需要 wrap,避免跳動)。
  let rafId = 0;
  let running = true;
  let time = 0;
  let last = performance.now();

  function frame(now: number) {
    rafId = requestAnimationFrame(frame);
    time += (now - last) / 1000;
    last = now;
    camera.position.x = Math.sin(time * 0.04) * 140;
    camera.position.z = 240 + Math.cos(time * 0.03) * 120;
    camera.lookAt(0, 60, -1200);
    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(frame);

  // 分頁切到背景就暫停(省電/省 GPU),切回來再續跑。
  function onVisibility() {
    if (document.hidden && running) {
      cancelAnimationFrame(rafId);
      running = false;
    } else if (!document.hidden && !running) {
      running = true;
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    }
  }
  document.addEventListener("visibilitychange", onVisibility);

  // 回傳清理函式:停動畫、移除監聽、釋放 GPU 資源(漏了會記憶體/GPU 洩漏)。
  return {
    dispose() {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      material.dispose();
      cloudTex.dispose();
      sky.geometry.dispose();
      sky.material.dispose();
      renderer.dispose();
    },
  };
}
