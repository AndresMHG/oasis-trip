<template>
  <div class="lang" @keydown.esc="open = false">
    <button class="lang__btn" :aria-expanded="open" aria-haspopup="listbox" @click="open = !open">
      <AppIcon name="globe" :size="18" />
      <span>{{ current.code.toUpperCase() }}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
           :style="{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }">
        <path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <transition name="drop">
      <ul v-if="open" class="lang__menu" role="listbox">
        <li v-for="l in locales" :key="l.code">
          <NuxtLink
            :to="switchLocalePath(l.code)"
            class="lang__item"
            :class="{ active: l.code === locale }"
            role="option"
            @click="open = false"
          >
            <span class="dot" /> {{ l.name }}
          </NuxtLink>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const open = ref(false)
const current = computed(
  () => (locales.value as any[]).find((l) => l.code === locale.value) || { code: locale.value }
)

if (import.meta.client) {
  const onClick = (e: MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.lang')) open.value = false
  }
  onMounted(() => document.addEventListener('click', onClick))
  onBeforeUnmount(() => document.removeEventListener('click', onClick))
}
</script>

<style scoped>
.lang { position: relative; }
.lang__btn {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.22);
  color: #fff; font-weight: 600; font-family: var(--ff-head);
  padding: 8px 12px; border-radius: 999px; cursor: pointer; font-size: .88rem;
  transition: background .2s;
}
.lang__btn:hover { background: rgba(255,255,255,.24); }
.lang.scrolled .lang__btn { color: var(--c-primary); background: rgba(15,61,87,.08); border-color: var(--c-line); }
.lang__menu {
  position: absolute; right: 0; top: calc(100% + 10px);
  background: #fff; border: 1px solid var(--c-line); border-radius: 14px;
  box-shadow: var(--shadow-md); list-style: none; margin: 0; padding: 6px; min-width: 168px; z-index: 60;
}
.lang__item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px; color: var(--c-text); font-weight: 500;
}
.lang__item:hover { background: var(--c-bg-soft); }
.lang__item.active { color: var(--c-primary); font-weight: 700; }
.lang__item .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--c-line); }
.lang__item.active .dot { background: var(--c-secondary); }
.drop-enter-active, .drop-leave-active { transition: opacity .18s ease, transform .18s ease; }
.drop-enter-from, .drop-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
