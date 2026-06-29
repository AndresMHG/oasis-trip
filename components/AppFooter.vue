<template>
  <footer class="ft">
    <div class="container ft__grid">
      <div class="ft__brand" v-reveal.up>
        <img src="/img/logo-white.svg" alt="Oasis Trip" height="44" />
        <p class="ft__tag">{{ t('footer.tagline') }}</p>
        <div class="ft__social">
          <a :href="waLink()" target="_blank" rel="noopener" aria-label="WhatsApp"><AppIcon name="whatsapp" :size="20" /></a>
          <a :href="instagramUrl" target="_blank" rel="noopener" aria-label="Instagram"><AppIcon name="instagram" :size="20" /></a>
          <a :href="`mailto:${emails[0]}`" aria-label="Email"><AppIcon name="mail" :size="20" /></a>
        </div>
      </div>

      <div class="ft__col" v-reveal.up="80">
        <h4>{{ t('footer.navTitle') }}</h4>
        <NuxtLink :to="localePath('/')">{{ t('nav.home') }}</NuxtLink>
        <NuxtLink :to="localePath('/servicios')">{{ t('nav.services') }}</NuxtLink>
        <NuxtLink :to="localePath('/') + '#rutas'">{{ t('nav.routes') }}</NuxtLink>
        <NuxtLink :to="localePath('/contacto')">{{ t('nav.contact') }}</NuxtLink>
      </div>

      <div class="ft__col" v-reveal.up="160">
        <h4>{{ t('footer.audienceTitle') }}</h4>
        <NuxtLink :to="localePath('/venezuela')">🇻🇪 {{ t('nav.venezuela') }}</NuxtLink>
        <NuxtLink :to="localePath('/colombia')">🇨🇴 {{ t('nav.colombia') }}</NuxtLink>
        <NuxtLink :to="localePath('/brasil')">🇧🇷 {{ t('nav.brasil') }}</NuxtLink>
      </div>

      <div class="ft__col" v-reveal.up="240">
        <h4>{{ t('footer.contactTitle') }}</h4>
        <a :href="waLink(t('whatsapp.message'))" target="_blank" rel="noopener">{{ phoneDisplay }}</a>
        <a v-for="e in emails" :key="e" :href="`mailto:${e}`">{{ e }}</a>
        <a :href="instagramUrl" target="_blank" rel="noopener">@{{ instagramHandle }}</a>
      </div>
    </div>

    <div class="container ft__bottom">
      <p class="ft__disc">{{ t('footer.disclaimer') }}</p>
      <p class="ft__rights">© {{ year }} Oasis Trip Turismo y Viajes. {{ t('footer.rights') }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { waLink, phoneDisplay, emails, instagramHandle, instagramUrl } = useBrand()
const year = new Date().getFullYear()
</script>

<style scoped>
.ft { background: var(--c-bg-deep); color: #c3d4dd; padding: 64px 0 30px; }
.ft__grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1.3fr; gap: 38px; }
.ft__tag { margin-top: 16px; max-width: 320px; color: #9fb6c2; font-size: .95rem; }
.ft__social { display: flex; gap: 10px; margin-top: 18px; }
.ft__social a {
  width: 40px; height: 40px; display: grid; place-items: center; border-radius: 12px;
  background: rgba(255,255,255,.08); color: #fff; transition: background .2s, transform .2s;
}
.ft__social a:hover { background: var(--c-secondary); color: #2a1c0a; transform: translateY(-3px); }
.ft__col { display: flex; flex-direction: column; gap: 11px; }
.ft__col h4 { color: #fff; font-size: 1rem; margin-bottom: 6px; }
.ft__col a { color: #b4c8d2; font-size: .94rem; transition: color .2s, padding .2s; }
.ft__col a:hover { color: var(--c-secondary); padding-left: 4px; }
.ft__bottom {
  margin-top: 46px; padding-top: 22px; border-top: 1px solid rgba(255,255,255,.12);
  display: flex; flex-direction: column; gap: 10px;
}
.ft__disc { font-size: .8rem; color: #7e96a3; margin: 0; }
.ft__rights { font-size: .85rem; color: #9fb6c2; margin: 0; }
@media (max-width: 860px) { .ft__grid { grid-template-columns: 1fr 1fr; gap: 30px; } }
@media (max-width: 520px) { .ft__grid { grid-template-columns: 1fr; } }
</style>
