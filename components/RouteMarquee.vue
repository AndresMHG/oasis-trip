<template>
  <div class="marq" aria-hidden="true">
    <div class="marq__track">
      <span v-for="(r, i) in doubled" :key="i" class="marq__item">
        <AppIcon name="plane" :size="16" /> {{ r }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ items: string[] }>()
const doubled = computed(() => [...props.items, ...props.items])
</script>

<style scoped>
.marq { overflow: hidden; -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.marq__track { display: flex; gap: 14px; width: max-content; animation: drift 32s linear infinite; }
.marq:hover .marq__track { animation-play-state: paused; }
.marq__item {
  display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;
  background: #fff; border: 1px solid var(--c-line); border-radius: 999px;
  padding: 11px 20px; font-family: var(--ff-head); font-weight: 600; color: var(--c-primary);
  box-shadow: var(--shadow-sm);
}
.marq__item svg { color: var(--c-secondary-600); }
</style>
