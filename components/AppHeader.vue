<template>
  <header class="hd" :class="{ 'hd--solid': solid || menu }">
    <div class="container hd__bar">
      <NuxtLink :to="localePath('/')" class="hd__logo" @click="menu = false">
        <img :src="solid || menu ? '/img/logo.svg' : '/img/logo-white.svg'" alt="Oasis Trip" height="40" />
      </NuxtLink>

      <nav class="hd__nav" :class="{ open: menu }">
        <NuxtLink :to="localePath('/')" class="hd__link" @click="menu = false">{{ t('nav.home') }}</NuxtLink>
        <NuxtLink :to="localePath('/servicios')" class="hd__link" @click="menu = false">{{ t('nav.services') }}</NuxtLink>
        <NuxtLink :to="localePath('/') + '#rutas'" class="hd__link" @click="menu = false">{{ t('nav.routes') }}</NuxtLink>
        <div class="hd__group">
          <span class="hd__group-label">{{ t('nav.audiences') }}</span>
          <div class="hd__sub">
            <NuxtLink :to="localePath('/venezuela')" class="hd__link" @click="menu = false">🇻🇪 {{ t('nav.venezuela') }}</NuxtLink>
            <NuxtLink :to="localePath('/colombia')" class="hd__link" @click="menu = false">🇨🇴 {{ t('nav.colombia') }}</NuxtLink>
            <NuxtLink :to="localePath('/brasil')" class="hd__link" @click="menu = false">🇧🇷 {{ t('nav.brasil') }}</NuxtLink>
          </div>
        </div>
        <NuxtLink :to="localePath('/contacto')" class="hd__link" @click="menu = false">{{ t('nav.contact') }}</NuxtLink>

        <a :href="waLink(t('whatsapp.message'))" target="_blank" rel="noopener" class="btn btn--accent hd__cta" @click="menu = false">
          <AppIcon name="whatsapp" :size="18" /> {{ t('nav.quote') }}
        </a>
      </nav>

      <div class="hd__right">
        <LangSwitcher :class="{ scrolled: solid || menu }" />
        <button class="hd__burger" :aria-label="menu ? 'Close menu' : 'Open menu'" @click="menu = !menu">
          <AppIcon :name="menu ? 'close' : 'menu'" :size="24" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const { waLink } = useBrand()
const menu = ref(false)
const solid = ref(false)

const onScroll = () => (solid.value = window.scrollY > 40)
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
watch(menu, (v) => {
  if (import.meta.client) document.body.style.overflow = v ? 'hidden' : ''
})
</script>

<style scoped>
.hd {
  position: fixed; inset: 0 0 auto 0; z-index: 50;
  transition: background .3s ease, box-shadow .3s ease, backdrop-filter .3s ease;
}
.hd--solid { background: rgba(255,255,255,.92); backdrop-filter: blur(10px); box-shadow: 0 4px 18px rgba(15,61,87,.08); }
.hd__bar { display: flex; align-items: center; justify-content: space-between; height: 72px; gap: 16px; }
.hd__logo { display: flex; align-items: center; }
.hd__logo img { transition: transform .3s; }
.hd__logo:hover img { transform: scale(1.04); }

.hd__right { display: flex; align-items: center; gap: 10px; }
.hd__burger {
  display: inline-grid; place-items: center; width: 44px; height: 44px;
  background: transparent; border: 0; color: #fff; cursor: pointer; border-radius: 12px;
}
.hd--solid .hd__burger { color: var(--c-primary); }

.hd__nav { display: none; }
.hd__link {
  font-family: var(--ff-head); font-weight: 600; font-size: .97rem; color: #fff;
  position: relative; padding: 6px 0;
}
.hd--solid .hd__link { color: var(--c-primary); }
.hd__cta { color: #2a1c0a !important; }

/* ----- Desktop ----- */
@media (min-width: 1000px) {
  .hd__burger { display: none; }
  .hd__nav {
    display: flex; align-items: center; gap: 26px;
  }
  .hd__link::after {
    content: ''; position: absolute; left: 0; bottom: -2px; height: 2px; width: 0;
    background: var(--c-secondary); transition: width .25s ease;
  }
  .hd__link:hover::after, .hd__link.router-link-active::after { width: 100%; }
  .hd__group { position: relative; }
  .hd__group-label {
    font-family: var(--ff-head); font-weight: 600; font-size: .97rem; cursor: default;
    color: #fff; display: inline-flex; align-items: center; gap: 4px;
  }
  .hd--solid .hd__group-label { color: var(--c-primary); }
  .hd__group-label::after { content: '▾'; font-size: .7rem; opacity: .8; }
  .hd__sub {
    position: absolute; top: calc(100% + 14px); left: 50%; transform: translateX(-50%) translateY(8px);
    background: #fff; border: 1px solid var(--c-line); border-radius: 14px; box-shadow: var(--shadow-md);
    padding: 8px; display: grid; gap: 2px; min-width: 190px; opacity: 0; visibility: hidden; transition: .2s;
  }
  .hd__group:hover .hd__sub { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
  .hd__sub .hd__link { color: var(--c-text) !important; padding: 9px 12px; border-radius: 9px; }
  .hd__sub .hd__link:hover { background: var(--c-bg-soft); }
  .hd__sub .hd__link::after { display: none; }
}

/* ----- Mobile menu ----- */
@media (max-width: 999px) {
  .hd__nav {
    position: fixed; inset: 72px 0 0 0; background: #fff;
    flex-direction: column; align-items: stretch; gap: 4px;
    padding: 22px 22px calc(22px + env(safe-area-inset-bottom));
    transform: translateX(100%); transition: transform .32s cubic-bezier(.4,0,.2,1);
    overflow-y: auto;
  }
  .hd__nav.open { display: flex; transform: none; }
  .hd__nav .hd__link {
    color: var(--c-text); font-size: 1.18rem; padding: 15px 6px; border-bottom: 1px solid var(--c-line);
  }
  .hd__group-label {
    display: block; font-family: var(--ff-head); font-weight: 700; color: var(--c-gray-300);
    font-size: .78rem; text-transform: uppercase; letter-spacing: 1.5px; padding: 18px 6px 6px;
  }
  .hd__sub { display: grid; }
  .hd__cta { margin-top: 22px; justify-content: center; font-size: 1.05rem; padding: 16px; }
}
</style>
