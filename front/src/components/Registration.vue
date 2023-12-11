

<template>
  <div>
    <div
      class="w-full bg-white rounded-b-lg border border-t-0 rounded-tr-lg xl:p-0"
    >
      <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        <form class="space-y-4 md:space-y-6" @submit.prevent="sendData()">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="username"
                class="block mb-2 text-sm font-medium text-gray-900"
                >имя</label
              >
              <input
                v-model="username"
                type="text"
                name="username"
                id="username"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="Иван"
              />
            </div>
            <div>
              <label
                for="lastname"
                class="block mb-2 text-sm font-medium text-gray-900"
                >фамилия</label
              >
              <input
                v-model="lastname"
                type="text"
                name="lastname"
                id="lastname"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="Иванов"
              />
            </div>
            <div>
              <label
                for="email"
                class="block mb-2 text-sm font-medium text-gray-900"
                >emai</label
              >
              <input
                v-model="email"
                type="text"
                name="email"
                id="email"
                class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                placeholder="name@etu.ru"
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
                  :class="{ 'border-red-500': passwordNotConfirmed }"
                  placeholder="••••••••"
                  class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
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
            <div>
              <label
                for="passwordConfirmation"
                class="block mb-2 text-sm font-medium text-gray-900"
                >подтверждение пароля</label
              >
              <div class="relative">
                <input
                  v-model="passwordConfirmation"
                  type="password"
                  name="passwordConfirmation"
                  id="passwordConfirmation"
                  placeholder="••••••••"
                  :class="{ 'border-red-500': passwordNotConfirmed }"
                  class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                />
                <a
                  @click.prevent="toggleConfirmPasswordVisibility()"
                  v-if="passwordConfirmation.length > 0"
                  @mouseover="isHovered = true"
                  @mouseleave="isHovered = false"
                  data-tip="Посмотреть пароль"
                  class="absolute cursor-pointer tooltip top-1 right-3"
                >
                  <img
                    class="w-6 mx-2 mt-1"
                    :src="
                      isHovered
                        ? '/public/images/ogo/view-gold.png'
                        : '/public/images/logo/view-blue.png'
                    "
                  />
                </a>
              </div>
            </div>
            <div class="h-4 -mt-2 mb-2">
              <label v-if="passwordNotConfirmed" class="text-red-400"
                >*Пароли не совпадают</label
              >
            </div>
          </div>
          <!-- {{passwordNotConfirmed}} -->
          <button
            type="submit"
            class="w-full text-white bg-[#02346f] hover:bg-[#bb8d54] focus:ring-4 focus:outline-none transition-all-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Зарегистрироваться
          </button>
          <p class="text-sm font-light text-gray-500">
            Уже есть аккаунт?
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, getCurrentInstance } from "vue";
import { createUser, User } from "../hooks/useUser";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const router = useRouter();


const instance = getCurrentInstance();
const isHovered = ref(false);
let passwordNotConfirmed = ref(false);

let errorMsg = ref("");
let username = ref("");
let lastname = ref("");
let email = ref("");
let password = ref("");
let passwordConfirmation = ref("");

const togglePasswordVisibility = () => {
  let passwordInput = document.getElementById("password") as HTMLInputElement;
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
};
const toggleConfirmPasswordVisibility = () => {
  let passwordInput = document.getElementById(
    "passwordConfirmation"
  ) as HTMLInputElement;
  if (passwordInput.type === "passwordConfirmation") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "passwordConfirmation";
  }
};
// const isSign = () => {
//   instance.emit("userCreare", true);
// };

const sendData = async () => {
  errorMsg.value = "";
  if (passwordConfirmation.value !== password.value)
    passwordNotConfirmed.value = true;
  else {
    passwordNotConfirmed.value = false;
    const newUser: User = {
      username: username.value,
      lastname: lastname.value,
      email: email.value,
      password: password.value,
    };
    const result: any = await createUser(newUser);
    if (result.status) {
      toast.success("Регистрация прошла успешно! Войтите в аккаунт.", {
        autoClose: 3000,
      });
      setTimeout(() => {
        // isSign();
      }, 1000);
    } else {
      toast.error(result.response.data.message, {
        autoClose: 3000,
      });
    }
  }
};
</script>

<style scoped>
</style>