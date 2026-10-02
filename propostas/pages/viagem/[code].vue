<template>
  <div class="tv" :lang="lang">
    <header class="hero" :style="g?.destination.image ? { backgroundImage: `url(${g.destination.image})` } : {}">
      <div class="hero__shade" />
      <div class="hero__top"><Logo white :lang="lang" :height="34" /></div>
      <div class="hero__content wrap">
        <span class="hero__eyebrow">{{ t.eyebrow }}</span>
        <h1>{{ g ? cityName : '✈️' }}</h1>
        <p v-if="g?.destination.departDate" class="hero__dates">
          <Icon name="calendar" :size="16" /> {{ fmtLong(g.destination.departDate) }}<template v-if="g.destination.returnDate"> → {{ fmtLong(g.destination.returnDate) }}</template>
        </p>
        <div v-if="countdown" class="hero__count">{{ countdown }}</div>
      </div>
    </header>

    <!-- PIN -->
    <main v-if="!g" class="wrap body">
      <section class="card pin">
        <Icon name="shield" :size="28" />
        <h2>{{ t.pinTitle }}</h2>
        <p class="muted">{{ t.pinText }}</p>
        <form @submit.prevent="unlock()">
          <input v-model="pin" class="pin__input" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••" autofocus />
          <button class="btn btn--primary btn--block" :disabled="busy || pin.length < 4">{{ busy ? '…' : t.open }}</button>
        </form>
        <p v-if="err" class="pin__err">{{ err }}</p>
      </section>
    </main>

    <main v-else class="wrap body">
      <section class="card greet">
        <h2>{{ t.hello }}{{ firstName ? `, ${firstName}` : '' }}! 🎉</h2>
        <p>{{ t.greet }}</p>
      </section>

      <!-- Avisos -->
      <section v-if="g.notes" class="card notice">
        <Icon name="info" :size="20" />
        <p class="pre">{{ g.notes }}</p>
      </section>

      <!-- Voos -->
      <section v-if="g.flights.length" class="block">
        <h2 class="block__title"><Icon name="plane" :size="20" /> {{ t.flights }}</h2>
        <article v-for="(f, i) in g.flights" :key="f.id" class="card flight">
          <div class="flight__head">
            <strong>{{ legName(i) }}</strong>
            <span>{{ [f.airline, fmtShort(f.date)].filter(Boolean).join(' · ') }}</span>
          </div>
          <div class="flight__route">
            <div><b>{{ f.departTime || '--:--' }}</b><small>{{ f.origin }}</small></div>
            <span class="flight__line"><Icon name="plane" :size="16" /><small v-if="f.duration">{{ f.duration }}</small></span>
            <div class="r"><b>{{ f.arriveTime || '--:--' }}</b><small>{{ f.destination }}</small></div>
          </div>
          <p v-if="f.connections?.length" class="flight__conn">
            {{ t.connection }}: {{ f.connections.map((c) => [c.airport, c.arrive && c.depart ? `${c.arrive}–${c.depart}` : ''].filter(Boolean).join(' ')).join(' · ') }}
          </p>
          <p v-if="f.baggage" class="muted small"><Icon name="luggage" :size="14" /> {{ v(f.baggage) }}</p>
        </article>
      </section>

      <!-- Documentos -->
      <section v-if="g.docs.length" class="block">
        <h2 class="block__title"><Icon name="file" :size="20" /> {{ t.docs }}</h2>
        <article v-for="d in g.docs" :key="d.id" class="card doc">
          <div class="doc__head">
            <span class="doc__ico"><Icon :name="TRIP_DOC_KINDS[d.kind]?.icon || 'file'" :size="20" /></span>
            <span class="doc__txt">
              <strong>{{ d.title || TRIP_DOC_KINDS[d.kind]?.[lang] }}</strong>
              <small class="muted">{{ TRIP_DOC_KINDS[d.kind]?.[lang] }}</small>
            </span>
          </div>
          <div v-if="d.pnr" class="doc__pnr">
            <small>{{ t.pnr }}</small>
            <b>{{ d.pnr }}</b>
            <button type="button" class="btn btn--sm" @click="copy(d.pnr)"><Icon name="copy" :size="14" /> {{ t.copy }}</button>
          </div>
          <a v-if="d.hasFile && d.mime.startsWith('image/')" :href="fileUrl(d.id)" target="_blank" class="doc__img">
            <img :src="fileUrl(d.id)" :alt="d.title" loading="lazy" />
          </a>
          <div v-if="d.hasFile" class="doc__btns">
            <a class="btn btn--primary" :href="fileUrl(d.id)" target="_blank"><Icon name="eye" :size="16" /> {{ t.view }}</a>
            <a class="btn" :href="fileUrl(d.id, true)"><Icon name="upload" :size="16" class="dl" /> {{ t.download }}</a>
          </div>
        </article>
      </section>

      <!-- Hotel, passeios e transfers -->
      <section v-if="g.hotels.length || g.tours.length || g.transfers.length" class="block">
        <h2 class="block__title"><Icon name="bed" :size="20" /> {{ t.stay }}</h2>
        <article v-for="h in g.hotels" :key="h.id" class="card item">
          <strong>{{ h.name }}</strong>
          <small class="muted">{{ [h.address, h.checkIn && `${t.checkin} ${fmtShort(h.checkIn)}`, h.checkOut && `${t.checkout} ${fmtShort(h.checkOut)}`].filter(Boolean).join(' · ') }}</small>
          <small v-if="h.board || h.roomType" class="muted">{{ [v(h.roomType), v(h.board)].filter(Boolean).join(' · ') }}</small>
          <a v-if="h.address" class="btn btn--sm" :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${h.name} ${h.address}`)}`" target="_blank"><Icon name="pin" :size="14" /> {{ t.map }}</a>
        </article>
        <article v-for="x in g.tours" :key="x.id" class="card item">
          <strong><Icon name="map" :size="15" /> {{ x.name }}</strong>
          <small class="muted">{{ [fmtShort(x.date), x.duration, x.location].filter(Boolean).join(' · ') }}</small>
        </article>
        <article v-for="x in g.transfers" :key="x.id" class="card item">
          <strong><Icon name="car" :size="15" /> {{ x.origin }} → {{ x.destination }}</strong>
          <small class="muted">{{ [fmtShort(x.date), x.time, v(x.vehicle)].filter(Boolean).join(' · ') }}</small>
        </article>
      </section>

      <!-- Roteiro -->
      <section v-if="g.itinerary?.length" class="block">
        <h2 class="block__title"><Icon name="calendar" :size="20" /> {{ t.itinerary }}</h2>
        <ol class="card days">
          <li v-for="(d, i) in g.itinerary" :key="d.id"><b>{{ t.day }} {{ i + 1 }}{{ d.title ? ` · ${d.title}` : '' }}</b><span v-if="d.description" class="muted">{{ d.description }}</span></li>
        </ol>
      </section>

      <!-- Checklist -->
      <section v-if="g.checklist.length" class="block">
        <h2 class="block__title"><Icon name="check" :size="20" /> {{ t.checklist }}</h2>
        <ul class="card check">
          <li v-for="(c, i) in g.checklist" :key="i" :class="{ done: done.includes(i) }" @click="toggle(i)">
            <span class="box"><Icon v-if="done.includes(i)" name="check" :size="14" :stroke="3" /></span>{{ c }}
          </li>
        </ul>
      </section>

      <!-- Contatos -->
      <section class="block">
        <h2 class="block__title"><Icon name="chat" :size="20" /> {{ t.contacts }}</h2>
        <div class="card contacts">
          <a class="btn btn--wa btn--block" :href="waUrl(g.agency.whatsapp, t.waMsg(firstName, g.code))" target="_blank"><Icon name="whatsapp" :size="18" /> {{ t.talk }} {{ g.agency.name }}</a>
          <div v-if="g.insurance"><small>{{ t.insurance }}</small><p class="pre">{{ g.insurance }}</p></div>
          <div v-if="g.contacts"><small>{{ t.useful }}</small><p class="pre">{{ g.contacts }}</p></div>
        </div>
      </section>

      <p class="foot muted small">{{ t.foot }} · #{{ g.code }}</p>
    </main>
  </div>
</template>

<script setup lang="ts">
import { TRIP_DOC_KINDS, waUrl, type Flight, type ItineraryDay, type Lang, type TripDocKind } from '~/utils/proposal'

interface Guide {
  token: string
  code: string
  client: { name: string; lang: Lang; travelers: number }
  destination: { city: string; country: string; departDate: string; returnDate: string; image: string; origin?: string }
  flights: Flight[]
  hotels: { id: string; name: string; address: string; checkIn: string; checkOut: string; roomType: string; board: string }[]
  tours: { id: string; name: string; date: string; duration: string; location: string }[]
  transfers: { id: string; origin: string; destination: string; date: string; time: string; vehicle: string }[]
  itinerary: ItineraryDay[]
  docs: { id: string; kind: TripDocKind; title: string; pnr: string; fileName: string; mime: string; hasFile: boolean }[]
  checklist: string[]
  insurance: string
  contacts: string
  notes: string
  agency: { name: string; whatsapp: string; instagram: string }
}

useHead({ title: 'Minha viagem · Oasis Trip', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const route = useRoute()
const code = String(route.params.code).toUpperCase()
const g = ref<Guide | null>(null)
const pin = ref('')
const err = ref('')
const busy = ref(false)
const done = ref<number[]>([])

// Idioma: o do guia; antes do PIN, o do navegador
const lang = computed<Lang>(() => g.value?.client.lang || (import.meta.client && navigator.language.startsWith('es') ? 'es' : 'pt'))
const { v } = useProposalText(lang)

const T = {
  pt: {
    eyebrow: 'Minha viagem', pinTitle: 'Digite seu código de acesso', pinText: 'Você recebeu o código de 4 dígitos pelo WhatsApp junto com este link.',
    open: 'Abrir meu guia', wrong: 'Código incorreto. Confira a mensagem que enviamos.', hello: 'Olá',
    greet: 'Sua viagem está confirmada! Aqui está tudo o que você precisa: passagens, cartões de embarque, vouchers e dicas.',
    flights: 'Seus voos', ida: 'Ida', volta: 'Volta', trecho: 'Trecho', connection: 'Conexão', docs: 'Passagens e documentos',
    pnr: 'Localizador', copy: 'Copiar', copied: 'Copiado!', view: 'Abrir', download: 'Baixar', stay: 'Hospedagem e passeios',
    checkin: 'check-in', checkout: 'check-out', map: 'Ver no mapa', itinerary: 'Roteiro', day: 'Dia',
    checklist: 'Antes de viajar', contacts: 'Contatos', talk: 'Falar com', insurance: 'Seguro viagem', useful: 'Contatos úteis',
    foot: 'Guia da viagem preparado pela Oasis Trip',
    count: (n: number) => (n > 1 ? `Faltam ${n} dias! ✈️` : n === 1 ? 'É amanhã! ✈️' : n === 0 ? 'É hoje! Boa viagem ✈️' : ''),
    waMsg: (n: string, c: string) => `Olá! Sou ${n || 'cliente'} (viagem ${c}) e tenho uma dúvida sobre a minha viagem.`
  },
  es: {
    eyebrow: 'Mi viaje', pinTitle: 'Ingresa tu código de acceso', pinText: 'Recibiste el código de 4 dígitos por WhatsApp junto con este enlace.',
    open: 'Abrir mi guía', wrong: 'Código incorrecto. Revisa el mensaje que te enviamos.', hello: 'Hola',
    greet: '¡Tu viaje está confirmado! Aquí está todo lo que necesitas: pasajes, tarjetas de embarque, vouchers y consejos.',
    flights: 'Tus vuelos', ida: 'Ida', volta: 'Vuelta', trecho: 'Tramo', connection: 'Conexión', docs: 'Pasajes y documentos',
    pnr: 'Código de reserva', copy: 'Copiar', copied: '¡Copiado!', view: 'Abrir', download: 'Descargar', stay: 'Hospedaje y paseos',
    checkin: 'check-in', checkout: 'check-out', map: 'Ver en el mapa', itinerary: 'Itinerario', day: 'Día',
    checklist: 'Antes de viajar', contacts: 'Contactos', talk: 'Hablar con', insurance: 'Seguro de viaje', useful: 'Contactos útiles',
    foot: 'Guía de viaje preparada por Oasis Trip',
    count: (n: number) => (n > 1 ? `¡Faltan ${n} días! ✈️` : n === 1 ? '¡Es mañana! ✈️' : n === 0 ? '¡Es hoy! Buen viaje ✈️' : ''),
    waMsg: (n: string, c: string) => `¡Hola! Soy ${n || 'cliente'} (viaje ${c}) y tengo una duda sobre mi viaje.`
  }
}
const t = computed(() => T[lang.value])

const firstName = computed(() => (g.value?.client.name || '').trim().split(' ')[0])
const cityName = computed(() => (g.value?.destination.city || '').replace(/\s*\([A-Z]{3}\)\s*$/, ''))
const locale = computed(() => (lang.value === 'es' ? 'es' : 'pt-BR'))
const toDate = (d: string) => new Date(d + 'T12:00:00')
const fmtShort = (d: string) => (d ? toDate(d).toLocaleDateString(locale.value, { day: '2-digit', month: 'short' }).replace('.', '') : '')
const fmtLong = (d: string) => (d ? toDate(d).toLocaleDateString(locale.value, { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '') : '')
const legName = (i: number) => {
  const n = g.value?.flights.length || 0
  const f = g.value?.flights[i]
  if (f?.leg) return v(f.leg)
  return n === 2 ? (i === 0 ? t.value.ida : t.value.volta) : n === 1 ? t.value.ida : `${t.value.trecho} ${i + 1}`
}
const countdown = computed(() => {
  const d = g.value?.destination.departDate
  if (!d) return ''
  const days = Math.round((toDate(d).getTime() - toDate(new Date().toISOString().slice(0, 10)).getTime()) / 86400000)
  return t.value.count(days)
})
const fileUrl = (id: string, download = false) => `/api/p/${code}/file/${id}?t=${g.value?.token}${download ? '&download=1' : ''}`

// Guarda o acesso neste celular para não pedir o código toda vez
const store = {
  get: (k: string) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k: string, val: string) => { try { localStorage.setItem(k, val) } catch {} }
}
const unlock = async (token?: string) => {
  busy.value = true
  err.value = ''
  try {
    g.value = await $fetch<Guide>(`/api/p/${code}/trip`, { method: 'POST', body: token ? { token } : { pin: pin.value } })
    store.set(`trip:${code}`, g.value.token)
    done.value = JSON.parse(store.get(`trip:${code}:done`) || '[]')
  } catch (e: any) {
    if (!token) err.value = e?.statusCode === 401 ? t.value.wrong : e?.statusMessage || e?.data?.statusMessage || 'Erro'
  } finally {
    busy.value = false
  }
}
const toggle = (i: number) => {
  done.value = done.value.includes(i) ? done.value.filter((x) => x !== i) : [...done.value, i]
  store.set(`trip:${code}:done`, JSON.stringify(done.value))
}
const copy = async (s: string) => {
  try { await navigator.clipboard.writeText(s); alertCopied() } catch {}
}
const { show } = useToast()
const alertCopied = () => show(t.value.copied)

onMounted(() => {
  const saved = store.get(`trip:${code}`)
  if (saved) unlock(saved)
})
</script>

<style scoped>
.tv { min-height: 100dvh; background: var(--c-bg-soft); }
.wrap { max-width: 640px; margin: 0 auto; padding: 0 16px; }
.hero {
  position: relative; min-height: 46svh; display: flex; flex-direction: column; justify-content: flex-end;
  background: linear-gradient(135deg, #0F3D57, #2E8BB0) center/cover no-repeat; color: #fff;
}
.hero__shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,44,64,.55) 0%, rgba(10,44,64,.1) 40%, rgba(10,44,64,.9) 100%); }
.hero__top { position: absolute; top: 0; left: 0; right: 0; padding: calc(14px + env(safe-area-inset-top)) 16px; }
.hero__content { position: relative; padding-bottom: 28px; width: 100%; }
.hero__eyebrow { font-size: .78rem; letter-spacing: 1.5px; text-transform: uppercase; opacity: .85; font-weight: 600; }
.hero h1 { color: #fff; font-size: clamp(2.2rem, 10vw, 3.4rem); font-weight: 800; line-height: 1.05; margin: 4px 0 8px; }
.hero__dates { display: flex; align-items: center; gap: 6px; opacity: .92; }
.hero__count { display: inline-block; margin-top: 12px; background: var(--c-accent); color: #2a1c0a; font-weight: 700; padding: 6px 14px; border-radius: 999px; }
.body { display: grid; gap: 18px; padding-top: 18px; padding-bottom: 40px; }
.card { background: #fff; border: 1px solid var(--c-line); border-radius: 16px; padding: 16px; box-shadow: var(--shadow-sm); }
.pin { display: grid; gap: 10px; justify-items: center; text-align: center; color: var(--c-primary); }
.pin form { display: grid; gap: 10px; width: 100%; max-width: 280px; }
.pin__input { font: inherit; font-size: 1.8rem; letter-spacing: 10px; text-align: center; padding: 12px; border: 2px solid var(--c-line); border-radius: 12px; }
.pin__input:focus { outline: none; border-color: var(--c-primary-300); }
.pin__err { color: var(--c-danger, #d64545); font-weight: 600; }
.greet h2 { color: var(--c-primary); font-size: 1.3rem; margin-bottom: 6px; }
.notice { display: flex; gap: 10px; background: #fff6e0; border-color: #f3d58a; color: #7a5a00; }
.notice svg { flex: none; margin-top: 2px; }
.block { display: grid; gap: 10px; }
.block__title { display: flex; align-items: center; gap: 8px; color: var(--c-primary); font-size: 1.1rem; }
.flight { display: grid; gap: 10px; }
.flight__head { display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.flight__head strong { color: var(--c-primary); font-family: var(--ff-head); }
.flight__head span { color: var(--c-gray); font-size: .88rem; }
.flight__route { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 10px; }
.flight__route b { display: block; font-family: var(--ff-head); font-size: 1.4rem; color: var(--c-primary); }
.flight__route small { color: var(--c-gray); font-size: .82rem; }
.flight__route .r { text-align: right; }
.flight__line { display: grid; justify-items: center; color: var(--c-primary-300); }
.flight__line small { font-size: .72rem; }
.flight__conn { background: #fff7ef; color: #8a4b12; border-radius: 10px; padding: 7px 10px; font-size: .85rem; }
.doc { display: grid; gap: 12px; }
.doc__head { display: flex; gap: 12px; align-items: center; }
.doc__ico { width: 42px; height: 42px; border-radius: 12px; display: grid; place-items: center; background: rgba(15,61,87,.07); color: var(--c-primary); flex: none; }
.doc__txt { display: grid; }
.doc__txt strong { color: var(--c-primary); }
.doc__pnr { display: flex; align-items: center; gap: 10px; background: var(--c-bg-soft); border-radius: 12px; padding: 10px 12px; }
.doc__pnr small { color: var(--c-gray); font-size: .78rem; text-transform: uppercase; letter-spacing: .5px; }
.doc__pnr b { flex: 1; font-family: ui-monospace, monospace; font-size: 1.3rem; letter-spacing: 2px; color: var(--c-primary); }
.doc__img { display: block; border-radius: 12px; overflow: hidden; border: 1px solid var(--c-line); background: #fff; }
.doc__img img { display: block; width: 100%; height: auto; }
.doc__btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.dl { transform: rotate(180deg); }
.item { display: grid; gap: 4px; }
.item strong { color: var(--c-primary); display: flex; align-items: center; gap: 6px; }
.item .btn { justify-self: start; margin-top: 6px; }
.days { margin: 0; padding: 16px 16px 16px 20px; display: grid; gap: 10px; list-style: none; }
.days li { display: grid; gap: 2px; }
.days b { color: var(--c-primary); }
.check { list-style: none; margin: 0; padding: 6px; display: grid; }
.check li { display: flex; gap: 10px; align-items: flex-start; padding: 10px; border-radius: 10px; cursor: pointer; }
.check li.done { color: var(--c-gray); text-decoration: line-through; }
.box { width: 22px; height: 22px; flex: none; border: 2px solid var(--c-primary-300); border-radius: 6px; display: grid; place-items: center; color: #fff; }
.check li.done .box { background: var(--c-ok, #1f9d55); border-color: var(--c-ok, #1f9d55); }
.contacts { display: grid; gap: 14px; }
.contacts small { color: var(--c-gray); font-size: .78rem; text-transform: uppercase; letter-spacing: .5px; }
.pre { white-space: pre-line; }
.foot { text-align: center; }
</style>
