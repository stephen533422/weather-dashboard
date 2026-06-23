import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import CityDetailView from "../views/CityDetailView.vue";

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/city/:name", name: "city", component: CityDetailView },
  ],
});
