<template>
  <div>
    <div class="tabs">
      <a
        class="tab tab-lg tab-lifted font-semibold"
        @click="active = !active"
        :class="{ 'tab-active': active }"
        >Войти</a
      >
      <a
        class="tab tab-lg tab-lifted"
        @click="active = !active"
        :class="{ 'tab-active': !active }"
        >Зарегистрироваться</a
      >
    </div>
    <login @userCreare="handleLogin" v-if="active" />
    <Registration @userCreare="handleRegistration" v-if="!active" />
  </div>
</template>

<script setup lang='ts'>
import { ref } from "vue";
import Login from "../components/Login.vue";
import Registration from "../components/Registration.vue";

const active = ref(true);

const handleRegistration = (isCreate: boolean) => {
  active.value = true;
};
const handleLogin = (isCreate: boolean) => {
  active.value = false;
};
</script>