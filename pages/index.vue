<template>
  <div>
    <!-- ===================== HERO ===================== -->
    <section class="hero">
      <div class="hero__bg" aria-hidden="true">
        <span class="hero__blob h1" />
        <span class="hero__blob h2" />
        <span class="hero__blob h3" />
        <!-- animated world arcs -->
        <svg class="hero__arcs" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <path id="arc1" d="M120 460 Q500 80 1080 300" fill="none" stroke="rgba(244,162,97,.55)" stroke-width="2" stroke-dasharray="6 10" class="arc-dash" />
          <path d="M120 460 Q500 80 1080 300" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="2" />
          <path d="M80 200 Q620 520 1140 140" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="2" stroke-dasharray="4 12" class="arc-dash slow" />
          <circle r="5" fill="#F4A261"><animateMotion dur="9s" repeatCount="indefinite" rotate="auto"><mpath href="#arc1" /></animateMotion></circle>
          <g class="hero__plane2">
            <animateMotion dur="9s" repeatCount="indefinite" rotate="auto"><mpath href="#arc1" /></animateMotion>
            <path d="M0-7 14 0 0 7 3 0Z" fill="#fff" />
          </g>
        </svg>
      </div>

      <div class="container hero__inner">
        <span class="hero__eyebrow hero-anim d-1">{{ t('hero.eyebrow') }}</span>
        <h1 class="hero-anim d-2">{{ t('hero.title') }}</h1>
        <p class="hero__sub hero-anim d-3">{{ t('hero.subtitle') }}</p>
        <div class="btn-row hero-anim d-4">
          <a :href="waLink(t('whatsapp.message'))" target="_blank" rel="noopener" class="btn btn--accent btn--lg">
            <AppIcon name="whatsapp" :size="20" /> {{ t('hero.ctaWhatsapp') }}
          </a>
          <NuxtLink :to="localePath('/contacto')" class="btn btn--ghost btn--lg hero__ghost">
            {{ t('hero.ctaQuote') }} <AppIcon name="arrow" :size="18" />
          </NuxtLink>
        </div>

        <div class="hero__stats hero-anim d-5">
          <div v-for="(s, i) in stats" :key="i" class="hero__stat">
            <strong>{{ s.value }}</strong>
            <span>{{ s.label }}</span>
          </div>
        </div>
      </div>

      <div class="hero__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0 40 C 360 90 1080 -10 1440 40 L1440 80 L0 80Z" fill="#ffffff" /></svg>
      </div>
    </section>

    <!-- ===================== TRUST STRIP ===================== -->
    <section class="trust">
      <div class="container">
        <p class="trust__title" v-reveal>{{ t('trust.title') }}</p>
        <div class="trust__grid">
          <div v-for="(item, i) in trustItems" :key="i" class="trust__item" v-reveal.up="i * 80">
            <AppIcon name="check" :size="20" /> <span>{{ item }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== ABOUT / STORY ===================== -->
    <section class="section">
      <div class="container about">
        <div class="about__media" v-reveal.left>
          <div class="about__card float-a">
            <div class="about__globe spin-slow">
              <AppIcon name="globe" :size="120" />
            </div>
            <div class="about__chip chip-1 float-b"><AppIcon name="plane" :size="18" /> Brasil ↔ Venezuela</div>
            <div class="about__chip chip-2 float-a"><AppIcon name="pin" :size="18" /> Boa Vista (RR)</div>
            <div class="about__chip chip-3 float-b"><AppIcon name="heart" :size="18" /> +LatAm</div>
          </div>
        </div>
        <div class="about__text" v-reveal.right>
          <span class="eyebrow">{{ t('about.eyebrow') }}</span>
          <h2>{{ t('about.title') }}</h2>
          <p>{{ t('about.p1') }}</p>
          <p>{{ t('about.p2') }}</p>
          <p>{{ t('about.p3') }}</p>
        </div>
      </div>
    </section>

    <!-- ===================== SERVICES ===================== -->
    <section class="section section--soft">
      <div class="container">
        <div class="section-head section-head--center" v-reveal>
          <span class="eyebrow">{{ t('services.eyebrow') }}</span>
          <h2>{{ t('services.title') }}</h2>
          <p class="lead">{{ t('services.lead') }}</p>
        </div>
        <div class="grid grid-3">
          <div v-for="(s, i) in services" :key="i" class="card" v-reveal.up="(i % 3) * 110">
            <div class="ico"><AppIcon :name="s.icon" :size="24" /></div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== CONNECTIONS BR-VE ===================== -->
    <section class="section section--deep conn">
      <div class="conn__bg" aria-hidden="true"><span class="hero__blob h2" /></div>
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

    <!-- ===================== AUDIENCES ===================== -->
    <section class="section">
      <div class="container">
        <div class="section-head section-head--center" v-reveal>
          <span class="eyebrow">{{ t('nav.audiences') }}</span>
          <h2>{{ t('trust.title') }}</h2>
        </div>
        <div class="grid grid-3">
          <NuxtLink v-for="(aud, i) in audiences" :key="aud.who" :to="localePath('/' + aud.who)" class="aud" v-reveal.up="i * 120" :style="{ '--accent': aud.accent }">
            <span class="aud__flag">{{ aud.flag }}</span>
            <h3>{{ aud.title }}</h3>
            <p>{{ aud.sub }}</p>
            <span class="aud__go">{{ t('nav.quote') }} <AppIcon name="arrow" :size="18" /></span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ===================== ROUTES ===================== -->
    <section id="rutas" class="section section--soft">
      <div class="container">
        <div class="section-head section-head--center" v-reveal>
          <span class="eyebrow">{{ t('routes.eyebrow') }}</span>
          <h2>{{ t('routes.title') }}</h2>
          <p class="lead">{{ t('routes.lead') }}</p>
        </div>
      </div>
      <RouteMarquee :items="routesList" />
      <div class="container">
        <div class="routes__grid" v-reveal>
          <span v-for="(r, i) in routesList" :key="i" class="routes__chip">
            <AppIcon name="plane" :size="15" /> {{ r }}
          </span>
        </div>
      </div>
    </section>

    <!-- ===================== FROM ANYWHERE ===================== -->
    <section class="section">
      <div class="container from">
        <div class="from__text" v-reveal.left>
          <span class="eyebrow">{{ t('from.eyebrow') }}</span>
          <h2>{{ t('from.title') }}</h2>
          <p class="lead">{{ t('from.lead') }}</p>
          <p class="from__note">{{ t('from.note') }}</p>
        </div>
        <div class="from__pills" v-reveal.right>
          <span v-for="(c, i) in countries" :key="i" class="from__pill" v-reveal.zoom="i * 60">
            <AppIcon name="pin" :size="15" /> {{ c }}
          </span>
        </div>
      </div>
    </section>

    <!-- ===================== WHY ===================== -->
    <section class="section section--soft">
      <div class="container">
        <div class="section-head section-head--center" v-reveal>
          <span class="eyebrow">{{ t('why.eyebrow') }}</span>
          <h2>{{ t('why.title') }}</h2>
        </div>
        <div class="grid grid-4">
          <div v-for="(w, i) in whyItems" :key="i" class="why" v-reveal.up="(i % 4) * 90">
            <AppIcon name="check" :size="20" /> <span>{{ w }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== COMMITMENT ===================== -->
    <section class="section commit">
      <div class="container commit__inner" v-reveal.zoom>
        <span class="eyebrow">{{ t('commitment.eyebrow') }}</span>
        <h2>{{ t('commitment.title') }}</h2>
        <p>{{ t('commitment.p1') }}</p>
        <p>{{ t('commitment.p2') }}</p>
      </div>
    </section>

    <CtaBanner />
  </div>
</template>

<script setup lang="ts">
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
const { waLink } = useBrand()

const arr = (k: string) => (tm(k) as any[]).map((x) => rt(x))
const stats = computed(() => (tm('hero.stats') as any[]).map((s) => ({ value: rt(s.value), label: rt(s.label) })))
const trustItems = computed(() => arr('trust.items'))
const services = computed(() => (tm('services.items') as any[]).map((s) => ({ icon: rt(s.icon), title: rt(s.title), desc: rt(s.desc) })))
const airDest = computed(() => arr('connections.air.destinations'))
const routesList = computed(() => arr('routes.list'))
const countries = computed(() => arr('from.countries'))
const whyItems = computed(() => arr('why.items'))

const audiences = computed(() => [
  { who: 'venezuela', flag: '🇻🇪', accent: '#C0392B', title: t('audience.venezuela.title'), sub: t('audience.venezuela.subtitle') },
  { who: 'colombia', flag: '🇨🇴', accent: '#D4A017', title: t('audience.colombia.title'), sub: t('audience.colombia.subtitle') },
  { who: 'brasil', flag: '🇧🇷', accent: '#1E8449', title: t('audience.brasil.title'), sub: t('audience.brasil.subtitle') }
])

useHead({
  title: 'Oasis Trip · Turismo y Viajes',
  meta: [{ name: 'description', content: t('footer.tagline') }]
})
</script>

<style scoped>
/* ---------- HERO ---------- */
.hero { position: relative; overflow: hidden; padding: 150px 0 120px; color: #fff;
  background: linear-gradient(150deg, #0F3D57 0%, #0a2c40 55%, #103a52 100%); }
.hero__bg { position: absolute; inset: 0; }
.hero__blob { position: absolute; border-radius: 50%; filter: blur(2px); animation: blob 16s ease-in-out infinite; }
.h1 { width: 360px; height: 360px; background: rgba(46,139,176,.30); top: -120px; left: -90px; }
.h2 { width: 300px; height: 300px; background: rgba(244,162,97,.16); bottom: -120px; right: 6%; animation-duration: 20s; }
.h3 { width: 220px; height: 220px; background: rgba(255,255,255,.06); top: 30%; right: 30%; animation-duration: 24s; }
.hero__arcs { position: absolute; inset: 0; width: 100%; height: 100%; opacity: .9; }
.arc-dash { animation: dash-move 24s linear infinite; }
.arc-dash.slow { animation-duration: 40s; }
.hero__inner { position: relative; max-width: 820px; }
.hero__eyebrow { display: inline-block; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
  padding: 8px 16px; border-radius: 999px; font-family: var(--ff-head); font-weight: 600; font-size: .8rem; margin-bottom: 22px; }
.hero h1 { color: #fff; font-size: clamp(2.1rem, 5.4vw, 3.6rem); }
.hero__sub { font-size: clamp(1.05rem, 2.2vw, 1.28rem); color: #cfe1ea; max-width: 640px; margin: 18px 0 30px; }
.hero__ghost { color: #fff; border-color: rgba(255,255,255,.4); }
.hero__ghost:hover { border-color: #fff; background: rgba(255,255,255,.1); color: #fff; }
.hero__stats { display: flex; flex-wrap: wrap; gap: 14px 40px; margin-top: 48px; }
.hero__stat { display: flex; flex-direction: column; }
.hero__stat strong { font-family: var(--ff-head); font-size: 1.5rem; color: #fff; line-height: 1.1; }
.hero__stat span { font-size: .9rem; color: #a9c4d2; }
.hero__wave { position: absolute; left: 0; right: 0; bottom: -1px; line-height: 0; }
.hero__wave svg { width: 100%; height: 70px; display: block; }

/* ---------- TRUST ---------- */
.trust { background: #fff; padding: 36px 0 8px; }
.trust__title { text-align: center; font-family: var(--ff-head); font-weight: 700; font-size: clamp(1.2rem,2.6vw,1.7rem); color: var(--c-primary); max-width: 780px; margin: 0 auto 26px; }
.trust__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.trust__item { display: flex; gap: 10px; align-items: flex-start; background: var(--c-bg-soft); border: 1px solid var(--c-line);
  border-radius: 14px; padding: 16px; font-weight: 500; color: var(--c-gray); font-size: .95rem; }
.trust__item svg { color: var(--c-secondary-600); flex: none; margin-top: 2px; }
@media (max-width: 900px) { .trust__grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 540px) { .trust__grid { grid-template-columns: 1fr; } }

/* ---------- ABOUT ---------- */
.about { display: grid; grid-template-columns: 1fr 1.15fr; gap: 54px; align-items: center; }
.about__media { display: flex; justify-content: center; }
.about__card { position: relative; width: 100%; max-width: 380px; aspect-ratio: 1; border-radius: 30px;
  background: linear-gradient(140deg, var(--c-primary), var(--c-primary-300)); display: grid; place-items: center;
  box-shadow: var(--shadow-md); }
.about__globe { color: rgba(255,255,255,.85); }
.about__chip { position: absolute; display: inline-flex; align-items: center; gap: 8px; background: #fff;
  border-radius: 999px; padding: 10px 16px; font-family: var(--ff-head); font-weight: 600; font-size: .85rem; color: var(--c-primary);
  box-shadow: var(--shadow-md); }
.about__chip svg { color: var(--c-secondary-600); }
.chip-1 { top: 8%; left: -6%; } .chip-2 { bottom: 12%; right: -8%; } .chip-3 { bottom: -4%; left: 18%; }
@media (max-width: 880px) { .about { grid-template-columns: 1fr; gap: 40px; } .about__card { max-width: 320px; } }

/* ---------- CONNECTIONS ---------- */
.conn { position: relative; overflow: hidden; }
.conn__bg { position: absolute; inset: 0; }
.conn__card { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12); border-radius: 20px; padding: 32px; height: 100%; }
.conn__ico { width: 56px; height: 56px; border-radius: 16px; background: rgba(244,162,97,.18); color: var(--c-secondary); display: grid; place-items: center; margin-bottom: 18px; }
.conn__card p { color: #b9cdd8; }
.conn__label { color: #fff !important; font-weight: 600; margin-top: 18px; }
.conn__note { font-size: .9rem; color: #93acb9 !important; margin-top: 14px; }
.conn__disclaimer { display: flex; gap: 12px; align-items: flex-start; margin-top: 30px; padding: 18px 22px;
  background: rgba(244,162,97,.12); border: 1px solid rgba(244,162,97,.3); border-radius: 14px; color: #e9d8c6; font-size: .92rem; }
.conn__disclaimer svg { color: var(--c-secondary); flex: none; margin-top: 2px; }

/* ---------- AUDIENCES ---------- */
.aud { position: relative; overflow: hidden; display: block; background: #fff; border: 1px solid var(--c-line);
  border-radius: 20px; padding: 32px 28px; box-shadow: var(--shadow-sm); transition: transform .2s, box-shadow .25s; border-top: 5px solid var(--accent); }
.aud:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); }
.aud__flag { font-size: 2.4rem; display: block; margin-bottom: 12px; }
.aud h3 { color: var(--c-primary); }
.aud p { color: var(--c-gray); font-size: .95rem; }
.aud__go { display: inline-flex; align-items: center; gap: 7px; margin-top: 14px; font-family: var(--ff-head);
  font-weight: 700; color: var(--accent); }
.aud__go svg { transition: transform .2s; }
.aud:hover .aud__go svg { transform: translateX(5px); }

/* ---------- ROUTES ---------- */
.routes__grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 34px; }
.routes__chip { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--c-line);
  border-radius: 999px; padding: 10px 18px; font-family: var(--ff-head); font-weight: 600; color: var(--c-primary); font-size: .9rem;
  transition: transform .18s, border-color .2s; }
.routes__chip:hover { transform: translateY(-3px); border-color: var(--c-secondary); }
.routes__chip svg { color: var(--c-secondary-600); }

/* ---------- FROM ---------- */
.from { display: grid; grid-template-columns: 1fr 1.1fr; gap: 48px; align-items: center; }
.from__note { color: var(--c-gray-300); font-style: italic; }
.from__pills { display: flex; flex-wrap: wrap; gap: 12px; }
.from__pill { display: inline-flex; align-items: center; gap: 8px; background: var(--c-bg-soft); border: 1px solid var(--c-line);
  border-radius: 14px; padding: 13px 18px; font-family: var(--ff-head); font-weight: 600; color: var(--c-primary); transition: transform .18s, background .2s; }
.from__pill:hover { transform: translateY(-3px); background: #fff; }
.from__pill svg { color: var(--c-secondary-600); }
@media (max-width: 880px) { .from { grid-template-columns: 1fr; gap: 28px; } }

/* ---------- WHY ---------- */
.why { display: flex; gap: 12px; align-items: flex-start; background: #fff; border: 1px solid var(--c-line);
  border-radius: 14px; padding: 20px; font-family: var(--ff-head); font-weight: 600; color: var(--c-primary); }
.why svg { color: var(--c-secondary-600); flex: none; margin-top: 2px; }

/* ---------- COMMITMENT ---------- */
.commit__inner { max-width: 780px; margin-inline: auto; text-align: center; }
.commit__inner p { color: var(--c-gray); font-size: 1.05rem; }
</style>
