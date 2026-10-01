<template>
  <span class="stars" :title="`${value} de 5`" :style="{ fontSize: size + 'px' }">
    <span v-for="n in 5" :key="n" :class="{ on: n <= Math.round(value) }">★</span>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ value: number; size?: number }>(), { size: 15 })
</script>

<style scoped>
.stars { letter-spacing: 1px; line-height: 1; white-space: nowrap; }
.stars span { color: #dfe5e9; }
.stars .on { color: #F4B400; }
</style>
