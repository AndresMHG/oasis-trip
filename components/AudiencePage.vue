<template>
  <div>
    <!-- Hero -->
    <section class="ah" :style="{ '--accent': accent }">
      <div class="ah__bg" aria-hidden="true">
        <span class="ah__blob b1" />
        <span class="ah__blob b2" />
        <svg class="ah__map spin-slow" viewBox="0 0 200 200" width="520" height="520">
          <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="1" />
          <ellipse cx="100" cy="100" rx="40" ry="92" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1" />
          <ellipse cx="100" cy="100" rx="74" ry="92" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="1" />
          <line x1="8" y1="100" x2="192" y2="100" stroke="rgba(255,255,255,.12)" stroke-width="1" />
        </svg>
      </div>
      <div class="container ah__inner">
        <span class="ah__flag hero-anim d-1">{{ flag }}</span>
        <span class="badge hero-anim d-1">{{ a('badge') }}</span>
        <h1 class="hero-anim d-2">{{ a('title') }}</h1>
        <p class="ah__sub hero-anim d-3">{{ a('subtitle') }}</p>
        <div class="btn-row hero-anim d-4">
          <a :href="waLink(a('whatsappMsg'))" target="_blank" rel="noopener" class="btn btn--accent btn--lg">
            <AppIcon name="whatsapp" :size="20" /> {{ t('hero.ctaWhatsapp') }}
          </a>
          <NuxtLink :to="localePath('/contacto')" class="btn btn--ghost btn--lg ah__ghost">{{ t('nav.contact') }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Intro -->
    <section class="section">
      <div class="container intro">
        <div v-reveal.left>
          <span class="eyebrow">{{ a('badge') }}</span>
          <h2>{{ a('introTitle') }}</h2>
          <p class="lead">{{ a('introText') }}</p>
          <div class="btn-row mt-m">
            <a :href="waLink(a('whatsappMsg'))" target="_blank" rel="noopener" class="btn btn--primary">
              <AppIcon name="whatsapp" :size="18" /> {{ t('hero.ctaWhatsapp') }}
            </a>
          </div>
        </div>
        <div class="intro__card float-a" v-reveal.right :style="{ '--accent': accent }">
          <div class="intro__icon"><AppIcon name="route" :size="30" /></div>
          <h3>{{ a('routesTitle') }}</h3>
          <ul class="intro__routes">
            <li v-for="(r, i) in routes" :key="i"><AppIcon name="plane" :size="15" /> {{ r }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="section section--soft">
      <div class="container">
        <div class="section-head section-head--center" v-reveal>
          <span class="eyebrow">{{ a('featuresTitle') }}</span>
          <h2>{{ a('introTitle') }}</h2>
        </div>
        <div class="grid grid-4">
          <div v-for="(f, i) in features" :key="i" class="card" v-reveal.up="i * 90">
            <div class="ico" :style="{ background: 'color-mix(in srgb, ' + accent + ' 16%, transparent)', color: accent }">
              <AppIcon :name="featureIcons[i]" :size="24" />
            </div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <CtaBanner :title="a('ctaTitle')" :text="a('ctaText')" :message="a('whatsappMsg')" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ who: 'venezuela' | 'colombia' | 'brasil'; flag: string; accent: string }>()
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
const { waLink } = useBrand()

const a = (k: string) => t(`audience.${props.who}.${k}`)
const routes = computed(() => (tm(`audience.${props.who}.routes`) as any[]).map((r) => rt(r)))
const features = computed(() =>
  (tm(`audience.${props.who}.features`) as any[]).map((f) => ({ title: rt(f.title), desc: rt(f.desc) }))
)
const featureIcons = ['plane', 'route', 'package', 'shield']
</script>

<style scoped>
.ah { position: relative; overflow: hidden; padding: 130px 0 80px; color: #fff;
  background: linear-gradient(140deg, var(--c-primary) 0%, #0a2c40 60%, color-mix(in srgb, var(--accent) 35%, #0a2c40) 120%); }
.ah__bg { position: absolute; inset: 0; }
.ah__blob { position: absolute; width: 320px; height: 320px; background: rgba(255,255,255,.06); animation: blob 16s ease-in-out infinite; }
.b1 { top: -120px; right: 12%; }
.b2 { bottom: -160px; left: -60px; background: color-mix(in srgb, var(--accent) 22%, transparent); animation-duration: 20s; }
.ah__map { position: absolute; top: 50%; right: -120px; transform: translateY(-50%); opacity: .5; }
.ah__inner { position: relative; max-width: 760px; }
.ah__flag { font-size: 2.6rem; display: block; margin-bottom: 10px; animation: floaty 5s ease-in-out infinite; }
.badge { display: inline-block; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.22);
  padding: 7px 16px; border-radius: 999px; font-family: var(--ff-head); font-weight: 600; font-size: .82rem; margin-bottom: 18px; }
.ah h1 { color: #fff; }
.ah__sub { font-size: 1.15rem; color: #d6e6ee; max-width: 640px; margin-bottom: 28px; }
.ah__ghost { color: #fff; border-color: rgba(255,255,255,.4); }
.ah__ghost:hover { border-color: #fff; background: rgba(255,255,255,.1); color: #fff; }

.intro { display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; align-items: center; }
.intro__card { background: #fff; border: 1px solid var(--c-line); border-radius: 22px; padding: 32px; box-shadow: var(--shadow-md);
  border-top: 5px solid var(--accent); }
.intro__icon { width: 60px; height: 60px; border-radius: 16px; display: grid; place-items: center; margin-bottom: 16px;
  background: color-mix(in srgb, var(--accent) 16%, transparent); color: var(--accent); }
.intro__routes { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 11px; }
.intro__routes li { display: flex; align-items: center; gap: 10px; font-family: var(--ff-head); font-weight: 600; color: var(--c-primary);
  padding-bottom: 11px; border-bottom: 1px dashed var(--c-line); }
.intro__routes li:last-child { border-bottom: 0; padding-bottom: 0; }
.intro__routes svg { color: var(--accent); }
@media (max-width: 880px) { .intro { grid-template-columns: 1fr; gap: 30px; } }
</style>
