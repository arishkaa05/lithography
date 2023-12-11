import 'daisyui/dist/full.css'
import "tailwindcss/tailwind.css";
import { createApp } from 'vue'
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router/router';

const app = createApp(App);

// app.use(DaisyUI, {
//   theme: 'light'
// });

app
  .use(router)
  .use(createPinia())
  .mount("#app");
