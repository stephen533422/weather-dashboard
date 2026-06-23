<script setup lang="ts">
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <h2>{{ route.params.name }}</h2>
  <router-link to="/">← 返回</router-link>
</template>
