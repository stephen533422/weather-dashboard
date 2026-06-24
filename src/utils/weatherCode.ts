// Record<number, string>:key 是 weather_code(數字)、value 是描述字串
const codeMap: Record<number, string> = {
  0: "☀️ 晴朗",
  1: "🌤️ 大致晴朗",
  2: "⛅ 局部多雲",
  3: "☁️ 陰天",
  45: "🌫️ 有霧",
  48: "🌫️ 霧凇",
  51: "🌦️ 毛毛雨",
  61: "🌧️ 小雨",
  63: "🌧️ 中雨",
  65: "🌧️ 大雨",
  71: "🌨️ 小雪",
  80: "🌦️ 陣雨",
  95: "⛈️ 雷雨",
};

export function describeWeather(code: number): string {
  return codeMap[code] ?? "🌡️ 未知";
}
