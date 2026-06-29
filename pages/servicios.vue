<template>
  <div>
    <PageHero :eyebrow="t('services.eyebrow')" :title="t('services.title')" :sub="t('services.lead')" />

    <section class="section">
      <div class="container">
        <div class="grid grid-3">
          <div v-for="(s, i) in services" :key="i" class="card" v-reveal.up="(i % 3) * 110">
            <div class="ico"><AppIcon :name="s.icon" :size="24" /></div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Connections -->
    <section class="section section--deep conn">
      <div class="container">
        <div class="section-head" v-reveal>
          <span class="eyebrow">{{ t('connections.eyebrow') }}</span>
          <h2>{{ t('connections.title') }}</h2>
          <p class="lead">{{ t('connections.lead') }}</p>
        </div>
        <div class="grid grid-2">
          <div class="conn__card" v-reveal.left>
            <div class="conn__ico"><AppIcon name="plane" :size="26" /></div>
            <h3>{{ t('connections.air.title') }}</h3>
            <p>{{ t('connections.air.desc') }}</p>
            <p class="conn__label">{{ t('connections.air.destinationsLabel') }}</p>
            <ul class="pill-list">
              <li v-for="(d, i) in airDest" :key="i">{{ d }}</li>
            </ul>
            <p class="conn__note">{{ t('connections.air.note') }}</p>
          </div>
          <div class="conn__card" v-reveal.right>
            <div class="conn__ico"><AppIcon name="route" :size="26" /></div>
            <h3>{{ t('connections.land.title') }}</h3>
            <p>{{ t('connections.land.desc') }}</p>
            <p class="conn__note">{{ t('connections.land.note') }}</p>
          </div>
        </div>
        <p class="conn__disclaimer" v-reveal>
          <AppIcon name="shield" :size="18" /> {{ t('connections.disclaimer') }}
        </p>
      </div>
    </section>

    <CtaBanner />
  </div>
</template>

<script setup lang="ts">
const { t, tm, rt } = useI18n()
const services = computed(() => (tm('services.items') as any[]).map((s) => ({ icon: rt(s.icon), title: rt(s.title), desc: rt(s.desc) })))
const airDest = computed(() => (tm('connections.air.destinations') as any[]).map((d) => rt(d)))
useHead({ title: () => `${t('services.title')} · Oasis Trip` })
</script>

<style scoped>
.conn__card { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12); border-radius: 20px; padding: 32px; height: 100%; }
.conn__ico { width: 56px; height: 56px; border-radius: 16px; background: rgba(244,162,97,.18); color: var(--c-secondary); display: grid; place-items: center; margin-bottom: 18px; }
.conn__card p { color: #b9cdd8; }
.conn__label { color: #fff !important; font-weight: 600; margin-top: 18px; }
.conn__note { font-size: .9rem; color: #93acb9 !important; margin-top: 14px; }
.conn__disclaimer { display: flex; gap: 12px; align-items: flex-start; margin-top: 30px; padding: 18px 22px;
  background: rgba(244,162,97,.12); border: 1px solid rgba(244,162,97,.3); border-radius: 14px; color: #e9d8c6; font-size: .92rem; }
.conn__disclaimer svg { color: var(--c-secondary); flex: none; margin-top: 2px; }
</style>
