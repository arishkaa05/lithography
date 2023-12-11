import daisyui from "daisyui";

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    'node_modules/flowbite-vue/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
    },
    
  },
  darkMode: 'class',
  daisyui: {
    themes: ["light" ]
  },
  flowbite:{
    themes: ["light"], 
  },
  plugins: [daisyui] 
};