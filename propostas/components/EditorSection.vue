<template>
  <section class="sec panel" :id="id">
    <button type="button" class="sec__head" @click="open = !open">
      <span class="sec__ico"><Icon :name="icon" :size="19" /></span>
      <span class="sec__title">
        <strong>{{ title }}</strong>
        <small v-if="summary" class="muted">{{ summary }}</small>
      </span>
      <Icon name="chevron" :size="18" class="sec__chev" :class="{ open }" />
    </button>
    <div v-show="open" class="sec__body"><slot /></div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ title: string; icon: string; summary?: string; id?: string; startOpen?: boolean }>(), {
  startOpen: true
})
const open = ref(props.startOpen)
</script>

<style scoped>
.sec { scroll-margin-top: 130px; }
.sec__head {
  width: 100%; display: flex; align-items: center; gap: 12px; padding: 16px 18px;
  background: none; border: 0; cursor: pointer; text-align: left;
}
.sec__ico { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; background: rgba(15,61,87,.07); color: var(--c-primary); flex: none; }
.sec__title { flex: 1; display: grid; }
.sec__title strong { font-family: var(--ff-head); color: var(--c-primary); font-size: 1.02rem; }
.sec__chev { color: var(--c-gray-300); transition: transform .2s; }
.sec__chev.open { transform: rotate(180deg); }
.sec__body { padding: 0 18px 18px; display: grid; gap: 14px; }
</style>
