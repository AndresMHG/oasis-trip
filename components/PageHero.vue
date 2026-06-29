<template>
  <section class="ph">
    <div class="ph__bg" aria-hidden="true">
      <span class="ph__blob a" />
      <span class="ph__blob b" />
      <svg class="ph__plane float-b" width="48" height="48" viewBox="0 0 24 24" fill="rgba(244,162,97,.5)">
        <path d="M17.8 19.2 16 11l3.5-3.5a2.12 2.12 0 0 0-3-3L13 8 4.8 6.2a1 1 0 0 0-.9 1.7l5.3 3.4-2.2 2.2H4l-1 1 4 1.5L9.5 21l1-1v-2.8l2.2-2.2 3.4 5.3a1 1 0 0 0 1.7-.9Z"/>
      </svg>
    </div>
    <div class="container ph__inner">
      <span v-if="eyebrow" class="ph__eyebrow hero-anim d-1">{{ eyebrow }}</span>
      <h1 class="hero-anim d-2">{{ title }}</h1>
      <p v-if="sub" class="ph__sub hero-anim d-3">{{ sub }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ eyebrow?: string; title: string; sub?: string }>()
</script>

<style scoped>
.ph { position: relative; overflow: hidden; padding: 128px 0 64px; color: #fff;
  background: linear-gradient(140deg, #0F3D57 0%, #0a2c40 70%); }
.ph__bg { position: absolute; inset: 0; }
.ph__blob { position: absolute; border-radius: 50%; animation: blob 16s ease-in-out infinite; }
.ph__blob.a { width: 280px; height: 280px; background: rgba(46,139,176,.28); top: -120px; left: -70px; }
.ph__blob.b { width: 240px; height: 240px; background: rgba(244,162,97,.14); bottom: -130px; right: 8%; animation-duration: 20s; }
.ph__plane { position: absolute; top: 30%; right: 12%; }
.ph__inner { position: relative; max-width: 760px; }
.ph__eyebrow { display: inline-block; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
  padding: 7px 15px; border-radius: 999px; font-family: var(--ff-head); font-weight: 600; font-size: .78rem; margin-bottom: 16px; }
.ph h1 { color: #fff; }
.ph__sub { font-size: 1.12rem; color: #cfe1ea; max-width: 620px; margin-top: 12px; }
</style>
