

<template>
  <div>
    <div
      class="w-full bg-white rounded-b-lg border border-t-0 rounded-tr-lg xl:p-0"
    >
      <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        <form class="space-y-4 md:space-y-6" @submit.prevent="sendData()">
          <div>
            <label
              for="email"
              class="block mb-2 text-sm font-medium text-gray-900"
              >emai</label
            >
            <input
              v-model="email"
              type="text"
              name=""
              id="email"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
              placeholder="name@etu.ru"
              required=""
            />
          </div>
          <div>
            <label
              for="password"
              class="block mb-2 text-sm font-medium text-gray-900"
              >пароль</label
            >
            <div class="relative">
              <input
                v-model="password"
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                required=""
              />
              <a
                @click.prevent="togglePasswordVisibility()"
                v-if="password.length > 0"
                @mouseover="isHovered = true"
                @mouseleave="isHovered = false"
                data-tip="Посмотреть пароль"
                class="absolute cursor-pointer tooltip top-1 right-3"
              >
                <img
                  class="w-6 mx-2 mt-1"
                  :src="
                    isHovered
                      ? '/public/images/logo/view-gold.png'
                      : '/public/images/logo/view-blue.png'
                  "
                />
              </a>
            </div>
          </div>
          <button
            type="submit"
            class="w-full text-white bg-[#02346f] hover:bg-[#bb8d54] focus:ring-4 focus:outline-none transition-all-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Войти
          </button>
          <p class="text-sm font-light text-gray-500">
            Нет аккаунта?
            <a
              @click="isSign()"
              class="font-medium cursor-pointer text-primary-600 hover:text-[#02346f]"
              >Зарегистрируйтесь</a
            >
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, getCurrentInstance } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useRouter } from "vue-router";
import { loginUser } from "../hooks/useUser";


const router = useRouter();
const instance = getCurrentInstance();

 const isHovered = ref(false);
let email = ref("");
let password = ref("");

const isSign = () => {
  instance.emit("createUser", true);
};

const togglePasswordVisibility = () => {
  let passwordInput = document.getElementById("password") as HTMLInputElement;
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
};

const sendData = async () => {
  const logUser = {
    email: email.value,
    password: password.value,
  };
  const result = await loginUser(logUser);
  if (result.status) {
    localStorage.setItem("jwt", result.data.accessToken);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: result.data.id,
        name: result.data.username,
        img: result.data.imageUrl,
        email: result.data.email,
      })
    );
    router.push("/");
  } else {
    toast.error("Не получилось войти в аккаунт", {
      autoClose: 3000,
    });
  }
};
</script>

<style scoped>
</style>