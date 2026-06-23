import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";

// ============================================================
// Pinia Store：全域共用的「我的城市」清單
// ============================================================
// 心法：一個 setup store 就是「一段可以被很多組件共用的 <script setup>」。
// 裡面的 ref / computed / function 寫法跟你在組件裡寫的一模一樣,
// 差別只在於：它定義在外面、任何組件都能拿來用,而且大家共用同一份資料。
//
// 對照 React：這就像把 useState + 操作函式抽成一個全域 store
// (Zustand 的 create()、或 Redux 的 slice)。
//
// defineStore 的第一個參數 'cities' 是這個 store 的唯一名字(像資料庫表名)。
// addCity 的回傳:給畫面顯示的提示文字 + 成功與否。
// 用 interface 把形狀講清楚,呼叫端(App.vue)就有型別保護。
export interface AddCityResult {
  message: string;
  valid: boolean;
}

export const useCitiesStore = defineStore("cities", () => {
  // 從 localStorage 讀回上次存的城市,第一次使用就給兩個預設城市
  const saved = localStorage.getItem("my-cities");
  // ref<string[]>:明確標註是字串陣列(JSON.parse 回來是 any,要自己框住)
  const cities = ref<string[]>(saved ? JSON.parse(saved) : ["Taipei", "Tokyo"]);
  // 讀回上次的排序偏好;只接受合法值,其餘一律當預設 'added'
  // (三元式同時把 string | null 收斂成 "added" | "name",型別才過得了)
  const savedSort = localStorage.getItem("sort-mode");
  const sortMode = ref<"added" | "name">(savedSort === "name" ? "name" : "added");

  const cityCount = computed(() => cities.value.length);
  const sortedCities = computed(() => {
    if (sortMode.value === "name") {
      return [...cities.value].sort((a, b) => a.localeCompare(b));
    }
    return cities.value;
  });

  // action(就是個函式):新增城市
  function addCity(name: string): AddCityResult {
    const n = name.trim();
    if (!n) return { message: "請輸入城市名稱", valid: false };
    // 避免重複加入同一個城市(不分大小寫)
    if (cities.value.some((c) => c.toLowerCase() === n.toLowerCase()))
      return { message: "已經有這個城市了", valid: false };
    cities.value.push(n);
    return { message: "新增成功", valid: true };
  }

  // action：移除城市
  function removeCity(name: string) {
    cities.value = cities.value.filter((c) => c !== name);
  }

  function clearAll() {
    cities.value = [];
  }

  // 清單一變就存進 localStorage
  watch(
    cities,
    (val) => localStorage.setItem("my-cities", JSON.stringify(val)),
    {
      deep: true,
    },
  );

  // 排序偏好一變也存(字串不用 JSON,直接存)
  watch(sortMode, (val) => localStorage.setItem("sort-mode", val));

  // return 出去的東西,才是組件能用到的(state + actions)
  return {
    cities,
    cityCount,
    sortedCities,
    sortMode,
    addCity,
    removeCity,
    clearAll,
  };
});
