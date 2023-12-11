<script setup lang="ts">
</script>

<template>
  <div class="light w-full">
    <div class="min-h-screen bg-neutral-100 h-full flex flex-col">
      <div  class="container w-full mb-20 max-w-screen-lg flex-grow mx-auto px-5 py-8 ">
        <router-view></router-view>
      </div>
    </div>
    <Footer></Footer>
  </div>
</template>
