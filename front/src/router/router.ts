import Main from "../pages/Main.vue";
import Login from "../pages/Login.vue";


import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: Main,
  },
  {
    path: "/login",
    component: Login,
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(import.meta.env.BASE_URL),
});
export default router;
