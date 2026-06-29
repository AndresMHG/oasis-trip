<template>
  <section class="cta">
    <div class="cta__bg" aria-hidden="true">
      <span class="cta__blob b1" />
      <span class="cta__blob b2" />
      <svg class="cta__plane float-b" width="64" height="64" viewBox="0 0 24 24" fill="#F4A261">
        <path d="M17.8 19.2 16 11l3.5-3.5a2.12 2.12 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-.9 1.7l5.3 3.4-2.2 2.2H4l-1 1 4 1.5L9.5 21l1-1v-2.8l2.2-2.2 3.4 5.3a1 1 0 0 0 1.7-.9Z"/>
      </svg>
    </div>
    <div class="container cta__inner" v-reveal.zoom>
      <h2>{{ title || t('cta.title') }}</h2>
      <p class="lead">{{ text || t('cta.text') }}</p>
      <div class="btn-row" style="justify-content:center">
        <a :href="waLink(message || t('whatsapp.message'))" target="_blank" rel="noopener" class="btn btn--accent btn--lg">
          <AppIcon name="whatsapp" :size="20" /> {{ button || t('cta.button') }}
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ title?: string; text?: string; button?: string; message?: string }>()
const { t } = useI18n()
const { waLink } = useBrand()
</script>

<style scoped>
.cta { position: relative; overflow: hidden; background: linear-gradient(135deg, var(--c-primary) 0%, var(--c-primary-300) 100%); color: #fff; padding: clamp(56px, 9vw, 100px) 0; }
.cta__bg { position: absolute; inset: 0; }
.cta__blob { position: absolute; width: 340px; height: 340px; background: rgba(255,255,255,.08); animation: blob 14s ease-in-out infinite; }
.b1 { top: -120px; left: -80px; }
.b2 { bottom: -150px; right: -60px; background: rgba(244,162,97,.16); animation-duration: 18s; }
.cta__plane { position: absolute; top: 18%; right: 8%; opacity: .5; }
.cta__inner { position: relative; text-align: center; max-width: 720px; margin-inline: auto; }
.cta__inner h2 { color: #fff; }
.cta__inner .lead { color: #d8e7ef; margin-bottom: 26px; }
</style>
