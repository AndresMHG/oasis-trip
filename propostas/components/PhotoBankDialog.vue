<template>
  <div class="pb-bg" @click.self="$emit('close')">
    <div class="pb panel" role="dialog" aria-label="Banco de fotos">
      <header>
        <div>
          <h2>Banco de fotos</h2>
          <p class="muted small">Fotos gratuitas para uso comercial (Unsplash). Toque para usar.</p>
        </div>
        <button type="button" class="btn btn--ghost btn--icon" title="Fechar" @click="$emit('close')"><Icon name="x" /></button>
      </header>

      <label class="pb__search">
        <Icon name="search" :size="18" />
        <input v-model="q" class="input" placeholder="Buscar destino: Cartagena, Rio, Margarita…" autofocus />
      </label>
      <div class="pb__chips">
        <button v-for="c in countries" :key="c" type="button" :class="{ on: country === c }" @click="country = country === c ? '' : c">{{ c }}</button>
      </div>

      <div class="pb__list">
        <section v-for="place in filtered" :key="place.name">
          <h3>{{ place.name }} <small>{{ place.country }}</small></h3>
          <div class="pb__grid">
            <button
              v-for="ph in place.photos"
              :key="ph.id"
              type="button"
              class="pb__ph"
              :title="ph.alt"
              :style="{ backgroundImage: `url(${photoUrl(ph.id, 480)})` }"
              @click="$emit('select', photoUrl(ph.id))"
            >
              <span>{{ ph.by }}</span>
            </button>
          </div>
        </section>
        <p v-if="!filtered.length" class="muted pb__empty">Nenhum destino encontrado. Você ainda pode colar o link de qualquer imagem ou enviar do seu computador.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PHOTO_BANK, photoUrl, placeMatches } from '~/utils/photoBank'

const props = defineProps<{ initialQuery?: string }>()
defineEmits<{ close: []; select: [url: string] }>()

const q = ref(props.initialQuery || '')
const country = ref('')
const countries = [...new Set(PHOTO_BANK.map((p) => p.country))]
const filtered = computed(() =>
  PHOTO_BANK.filter((p) => (!country.value || p.country === country.value) && (!q.value.trim() || placeMatches(p, q.value)))
)
// Se a busca inicial (cidade da proposta) não achar nada, mostra tudo
onMounted(() => { if (!filtered.value.length) q.value = '' })
</script>

<style scoped>
.pb-bg { position: fixed; inset: 0; z-index: 120; background: rgba(10,30,45,.5); display: grid; place-items: center; padding: 14px; }
.pb { width: 100%; max-width: 860px; height: min(86dvh, 820px); display: grid; grid-template-rows: auto auto auto 1fr; gap: 12px; padding: 18px; overflow: hidden; }
header { display: flex; justify-content: space-between; gap: 10px; }
header h2 { font-size: 1.25rem; }
.pb__search { position: relative; }
.pb__search svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--c-gray-300); }
.pb__search .input { padding-left: 40px; border-radius: 999px; }
.pb__chips { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; }
.pb__chips button { flex: none; border: 1.5px solid var(--c-line); background: #fff; border-radius: 999px; padding: 6px 12px; font-size: .82rem; cursor: pointer; }
.pb__chips button.on { background: var(--c-primary); border-color: var(--c-primary); color: #fff; }
.pb__list { overflow-y: auto; display: grid; gap: 18px; align-content: start; padding-right: 4px; }
.pb__list h3 { font-size: .98rem; margin-bottom: 8px; }
.pb__list h3 small { font-family: var(--ff-body); font-weight: 500; color: var(--c-gray); font-size: .8rem; margin-left: 4px; }
.pb__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
.pb__ph {
  position: relative; aspect-ratio: 16/10; border: 0; border-radius: 12px; cursor: pointer; background: var(--c-bg-soft) center/cover;
  transition: transform .15s, box-shadow .15s; overflow: hidden;
}
.pb__ph:hover { transform: scale(1.03); box-shadow: var(--shadow-md); }
.pb__ph span {
  position: absolute; left: 0; right: 0; bottom: 0; padding: 14px 8px 5px; font-size: .68rem; color: #fff; text-align: left;
  background: linear-gradient(transparent, rgba(0,0,0,.55)); opacity: 0; transition: opacity .15s;
}
.pb__ph:hover span { opacity: 1; }
.pb__empty { text-align: center; padding: 30px 10px; }
</style>
