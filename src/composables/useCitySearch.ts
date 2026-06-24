import { ref, watch, type Ref } from "vue";

// 全部存 API 原始名(簡體);顯示時才在畫面 toTW。
export interface Place {
  id: number;
  name: string;
  country: string;
  admin1?: string;
}

export function useCitySearch(query: Ref<string>) {
  const results = ref<Place[]>([]);
  const loading = ref(false);

  let timer: ReturnType<typeof setTimeout> | null = null;
  let controller: AbortController | null = null;

  watch(query, (q) => {
    if (timer) clearTimeout(timer); // debounce:取消上一個待發
    const text = q.trim();
    if (!text) {
      controller?.abort(); // 連同還在飛的請求一起取消
      results.value = [];
      loading.value = false;
      return;
    }

    timer = setTimeout(async () => {
      controller?.abort(); // ← 取消上一個還沒回來的請求
      controller = new AbortController();
      const { signal } = controller; // 把這次的 signal 綁好

      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        text,
      )}&count=5&language=zh`;

      loading.value = true;
      try {
        const res = await fetch(url, { signal }); // ← signal 傳進 fetch
        const data = await res.json();
        results.value = (data.results ?? []).map((r: any) => ({
          id: r.id,
          name: r.name,
          country: r.country,
          admin1: r.admin1,
        }));
      } catch (e) {
        // 被 abort 的請求會丟 AbortError,那是正常的,忽略它
        if ((e as Error).name === "AbortError") return;
        results.value = []; // 其他錯誤才清空/處理
      } finally {
        // ⚠️ 關鍵坑:見下面說明
        if (!signal.aborted) loading.value = false;
      }
    }, 300);
  });

  return { results, loading };
}
