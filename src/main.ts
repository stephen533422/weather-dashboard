import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'

// createApp(App) 跟之前一樣。
// .use(createPinia()) 是「安裝外掛」—— 把 Pinia(全域狀態)裝進這個 App。
// 類比 React 要用 Redux 時把 <Provider store={store}> 包在最外層。
// 裝好之後,任何組件都能用 useXxxStore() 拿到全域資料。
createApp(App).use(createPinia()).mount('#app')
