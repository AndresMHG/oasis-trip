<template>
  <span class="badge" :style="{ '--b': STATUS[status]?.color }">
    <i />{{ STATUS[status]?.label || status }}
  </span>
</template>

<script setup lang="ts">
import { STATUS, type Status } from '~/utils/proposal'
defineProps<{ status: Status }>()
</script>

<style scoped>
.badge {
  display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
  font-size: .76rem; font-weight: 600; padding: 4px 10px; border-radius: 999px;
  color: var(--b); background: color-mix(in srgb, var(--b) 12%, #fff);
}
.badge i { width: 7px; height: 7px; border-radius: 50%; background: var(--b); }
</style>
