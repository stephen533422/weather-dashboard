// useCityWeather:給一個城市名(Ref),回傳該城市的即時天氣 + loading/error。
// 這是 composable(= React custom hook):把抓資料邏輯收進來,組件只管畫面。
import { ref, watch, type Ref } from "vue";
import { describeWeather } from "../utils/weatherCode";
import { toTW } from "../utils/zh";

// 卡片要顯示的天氣資料形狀
interface Weather {
  name: string;
  country: string;
  temp: number;
  humidity: number;
  desc: string;
}

export function useCityWeather(city: Ref<string>) {
  const loading = ref(true);
  const error = ref("");
  const data = ref<Weather | null>(null);

  async function load() {
    loading.value = true;
    error.value = "";
    data.value = null;
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city.value,
        )}&count=1&language=zh`,
      );
      const geo = await geoRes.json();
      if (!geo.results || geo.results.length === 0) {
        error.value = "找不到這個城市";
        return;
      }
      const place = geo.results[0];
      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,weather_code`,
      );
      const w = await wRes.json();
      data.value = {
        // API 回傳是簡體,顯示前轉繁體
        name: toTW(place.name),
        country: toTW(place.country),
        temp: w.current.temperature_2m,
        humidity: w.current.relative_humidity_2m,
        desc: describeWeather(w.current.weather_code),
      };
    } catch {
      error.value = "載入失敗";
    } finally {
      loading.value = false;
    }
  }

  watch(city, load, { immediate: true });

  return { loading, error, data }; // 回傳給組件用
}
