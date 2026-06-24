import { Converter } from "opencc-js";

// ============================================================
// 簡轉繁:Open-Meteo 的 geocoding 用 language=zh 回來是「簡體」,
// 顯示前統一轉成繁體(from cn → to tw)。
// ============================================================
// Converter 建立有成本(要載字典),所以建一次、模組層級共用,
// 不要每次呼叫 toTW 都重建。
const cn2tw = Converter({ from: "cn", to: "tw" });

export function toTW(text: string): string {
  return cn2tw(text);
}
