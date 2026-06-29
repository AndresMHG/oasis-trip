<template>
  <a :href="waLink(t('whatsapp.message'))" target="_blank" rel="noopener" class="wa" :aria-label="t('whatsapp.float')">
    <span class="wa__ring" />
    <AppIcon name="whatsapp" :size="28" />
    <span class="wa__label">{{ t('whatsapp.float') }}</span>
  </a>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { waLink } = useBrand()
</script>

<style scoped>
.wa {
  position: fixed; right: 18px; bottom: calc(18px + env(safe-area-inset-bottom)); z-index: 45;
  display: inline-flex; align-items: center; gap: 0;
  background: #25D366; color: #063b22; border-radius: 999px;
  padding: 15px; box-shadow: 0 10px 26px rgba(37,211,102,.45);
  animation: floaty 5s ease-in-out infinite;
  transition: transform .2s, gap .25s, padding .25s;
}
.wa:hover { transform: scale(1.06); color: #063b22; }
.wa__ring {
  position: absolute; inset: 0; border-radius: 999px; animation: pulse-ring 2.4s ease-out infinite;
}
.wa__label {
  font-family: var(--ff-head); font-weight: 700; font-size: .95rem; max-width: 0; overflow: hidden; white-space: nowrap;
  transition: max-width .3s ease, margin .3s ease;
}
@media (min-width: 768px) {
  .wa:hover { gap: 8px; padding-right: 22px; }
  .wa:hover .wa__label { max-width: 160px; margin-left: 4px; }
}
</style>
