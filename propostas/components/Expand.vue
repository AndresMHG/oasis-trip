<template>
  <div class="expand" :class="{ open }">
    <div v-if="open" class="expand__body"><slot /></div>
    <button type="button" class="expand__btn" @click="open = !open">
      {{ open ? less : more }} <Icon name="chevron" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ more: string; less: string }>()
const open = ref(false)
</script>

<style scoped>
.expand__btn {
  display: inline-flex; align-items: center; gap: 4px; background: none; border: 0; padding: 4px 0; cursor: pointer;
  color: var(--c-primary-300); font-weight: 600; font-size: .87rem;
}
.expand__btn svg { transition: transform .2s; }
.expand.open .expand__btn svg { transform: rotate(180deg); }
.expand__body { padding: 4px 0 6px; color: var(--c-gray); animation: fade .25s; }
@keyframes fade { from { opacity: 0; transform: translateY(-4px); } }
</style>
