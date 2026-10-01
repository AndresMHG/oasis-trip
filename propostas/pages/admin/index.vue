<template>
  <main class="dash">
    <section class="dash__head">
      <div>
        <h1>Propostas</h1>
        <p class="muted">Crie, envie e acompanhe seus orçamentos em minutos.</p>
      </div>
      <div class="new">
        <button class="btn btn--accent btn--lg" :disabled="creating" @click="menu = true">
          <Icon name="plus" :size="18" /> Nova proposta
        </button>
      </div>
    </section>
    <NewProposalDialog v-if="menu" :busy="creating" @close="menu = false" @create="create" />

    <NuxtLink v-if="kpi.reservas" to="#" class="alert" @click.prevent="filter = 'reserva_solicitada'">
      <Icon name="sparkles" :size="20" />
      <strong>{{ kpi.reservas }} {{ kpi.reservas > 1 ? 'clientes querem' : 'cliente quer' }} reservar!</strong>
      <span>Entre em contato agora</span>
      <Icon name="arrow" :size="18" />
    </NuxtLink>

    <NuxtLink v-if="toReview" to="/admin/avaliacoes" class="alert alert--review">
      <Icon name="star" :size="20" />
      <strong>{{ toReview }} {{ toReview > 1 ? 'viagens concluídas' : 'viagem concluída' }} sem avaliação</strong>
      <span>Peça a opinião dos clientes</span>
      <Icon name="arrow" :size="18" />
    </NuxtLink>

    <section class="kpis">
      <div class="kpi panel"><span>Em aberto</span><strong>{{ kpi.abertas }}</strong></div>
      <div class="kpi panel"><span>Visualizadas</span><strong>{{ kpi.vistas }}</strong></div>
      <div class="kpi panel"><span>Aceitas</span><strong>{{ kpi.aceitas }}</strong></div>
      <div class="kpi panel"><span>Conversão</span><strong>{{ kpi.conversao }}%</strong></div>
    </section>

    <section class="filters">
      <label class="search">
        <Icon name="search" :size="18" />
        <input v-model="q" class="input" placeholder="Buscar cliente, destino ou código…" />
      </label>
      <div class="chips">
        <button :class="{ on: filter === '' }" @click="filter = ''">Todas <em>{{ list.length }}</em></button>
        <button
          v-for="(s, k) in STATUS"
          v-show="counts[k]"
          :key="k"
          :class="{ on: filter === k }"
          :style="{ '--b': s.color }"
          @click="filter = k"
        >
          {{ s.label }} <em>{{ counts[k] }}</em>
        </button>
      </div>
    </section>

    <p v-if="pending" class="muted empty">Carregando…</p>
    <div v-else-if="!filtered.length" class="empty panel">
      <Icon name="plane" :size="36" />
      <h3>{{ list.length ? 'Nenhuma proposta encontrada' : 'Crie sua primeira proposta' }}</h3>
      <p class="muted">{{ list.length ? 'Ajuste a busca ou o filtro.' : 'Leva poucos minutos e o cliente recebe um link lindo no celular.' }}</p>
    </div>

    <ul v-else class="list">
      <li v-for="p in filtered" :key="p.code" class="item panel" :class="{ hot: p.status === 'reserva_solicitada' }">
        <NuxtLink :to="`/admin/${p.code}`" class="item__main">
          <div class="thumb" :style="p.destination.image ? { backgroundImage: `url(${p.destination.image})` } : {}">
            <Icon v-if="!p.destination.image" name="map" :size="22" />
          </div>
          <div class="item__info">
            <strong>{{ p.client.name || 'Cliente sem nome' }} <small>{{ p.client.lang === 'es' ? '🇪🇸' : '🇧🇷' }}</small></strong>
            <span class="muted small">
              {{ [p.destination.city, p.destination.country].filter(Boolean).join(', ') || 'Destino a definir' }}
              · {{ p.client.travelers }} {{ p.client.travelers === 1 ? 'viajante' : 'viajantes' }}
            </span>
            <span class="muted small meta">
              <span>#{{ p.code }}</span>
              <span>Criada {{ fmtDate(p.createdAt) }}</span>
              <span :class="{ warn: expiresSoon(p) }">Válida até {{ fmtDay(p.validUntil) }}</span>
              <span v-if="p.views"><Icon name="eye" :size="13" /> {{ p.views }}x · {{ ago(p.lastViewedAt) }}</span>
              <span v-if="p.review"><Stars :value="p.review.rating" :size="13" /></span>
            </span>
          </div>
          <div class="item__price">
            <small class="muted">{{ p.reservedTotal !== null ? 'Reserva' : p.options > 1 ? `${p.options} opções · a partir de` : 'Total' }}</small>
            <strong>{{ money(p.reservedTotal ?? p.minTotal, p.currency) }}</strong>
          </div>
        </NuxtLink>
        <div class="item__actions">
          <select class="status-select" :value="p.status" :style="{ color: STATUS[p.status].color }" @change="changeStatus(p, ($event.target as HTMLSelectElement).value as Status)">
            <option v-for="(s, k) in STATUS" :key="k" :value="k">{{ s.label }}</option>
          </select>
          <span class="spacer" />
          <button class="btn btn--sm btn--wa" title="Enviar por WhatsApp" @click="send(p)"><Icon name="whatsapp" :size="16" /><span class="hide-sm">Enviar</span></button>
          <button class="btn btn--sm btn--icon" title="Copiar link" @click="copy(p)"><Icon name="link" :size="16" /></button>
          <a class="btn btn--sm btn--icon" title="Visualizar como cliente" :href="`/proposta/${p.code}`" target="_blank"><Icon name="eye" :size="16" /></a>
          <NuxtLink class="btn btn--sm btn--icon" title="Editar" :to="`/admin/${p.code}`"><Icon name="edit" :size="16" /></NuxtLink>
          <button class="btn btn--sm btn--icon" title="Duplicar" @click="duplicate(p)"><Icon name="copy" :size="16" /></button>
          <button class="btn btn--sm btn--icon btn--danger" title="Excluir" @click="remove(p)"><Icon name="trash" :size="16" /></button>
        </div>
      </li>
    </ul>
  </main>
</template>

<script setup lang="ts">
import { STATUS, money, tripFinished, type Currency, type Lang, type Proposal, type Review, type Status } from '~/utils/proposal'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: 'Propostas · Oasis Trip' })

// Resumo retornado por GET /api/admin/proposals (ver server/utils/db.ts → summarize)
interface Row {
  code: string
  createdAt: string
  status: Status
  validUntil: string
  currency: Currency
  client: Proposal['client']
  destination: { city: string; country: string; image: string; returnDate: string }
  review: Review | null
  reviewRequested: boolean
  options: number
  minTotal: number
  reservedTotal: number | null
  views: number
  lastViewedAt?: string
}
const load = () => api<Row[]>('/api/admin/proposals')

const { show } = useToast()
const { copyLink, sendWhatsapp, setStatus } = useAdminActions()
const list = ref<Row[]>([])
const pending = ref(true)
const q = ref('')
const filter = ref<Status | ''>('')
const menu = ref(false)
const creating = ref(false)

const refresh = async () => {
  list.value = await load()
  pending.value = false
}
onMounted(refresh)

const counts = computed(() => {
  const c: Record<string, number> = {}
  for (const p of list.value) c[p.status] = (c[p.status] || 0) + 1
  return c
})

const kpi = computed(() => {
  const c = counts.value
  const abertas = (c.rascunho || 0) + (c.enviado || 0) + (c.visualizado || 0) + (c.aguardando || 0)
  const enviadas = list.value.filter((p) => p.status !== 'rascunho').length
  const aceitas = c.aceito || 0
  return {
    abertas,
    vistas: list.value.filter((p) => p.views > 0).length,
    aceitas,
    reservas: c.reserva_solicitada || 0,
    conversao: enviadas ? Math.round(((aceitas + (c.reserva_solicitada || 0)) / enviadas) * 100) : 0
  }
})

const toReview = computed(() => list.value.filter((p) => !p.review && tripFinished(p)).length)

const norm = (s: string) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const filtered = computed(() => {
  const term = norm(q.value)
  return list.value.filter(
    (p) =>
      (!filter.value || p.status === filter.value) &&
      (!term || norm([p.client.name, p.destination.city, p.destination.country, p.code].join(' ')).includes(term))
  )
})

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
const fmtDay = (d: string) => (d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—')
const expiresSoon = (p: Row) => !['aceito', 'recusado', 'expirado'].includes(p.status) && p.validUntil <= addDays(today(), 2)
const ago = (iso?: string) => {
  if (!iso) return ''
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 60) return `há ${Math.max(1, m)} min`
  if (m < 1440) return `há ${Math.round(m / 60)} h`
  return `há ${Math.round(m / 1440)} d`
}

const create = async (body: { lang: Lang; template: string }) => {
  creating.value = true
  try {
    const p = await api<{ code: string }>('/api/admin/proposals', { method: 'POST', body })
    await navigateTo(`/admin/${p.code}`)
  } finally {
    creating.value = false
    menu.value = false
  }
}

const changeStatus = async (p: Row, status: Status) => {
  await setStatus(p.code, status)
  show(`Status alterado para "${STATUS[status].label}"`)
  refresh()
}
const send = async (p: Row) => { await sendWhatsapp(p); refresh() }
const copy = async (p: Row) => { await copyLink(p.code); refresh() }
const duplicate = async (p: Row) => {
  const c = await api<{ code: string }>(`/api/admin/proposals/${p.code}/duplicate`, { method: 'POST' })
  show('Proposta duplicada — edite o que precisar')
  await navigateTo(`/admin/${c.code}`)
}
const remove = async (p: Row) => {
  if (!confirm(`Excluir a proposta de ${p.client.name || 'cliente sem nome'} (#${p.code})? Esta ação não pode ser desfeita.`)) return
  await api(`/api/admin/proposals/${p.code}`, { method: 'DELETE' })
  show('Proposta excluída')
  refresh()
}
</script>

<style scoped>
.dash { max-width: 1100px; margin: 0 auto; padding: 22px clamp(12px, 3vw, 28px) 80px; display: grid; gap: 18px; }
.dash__head { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; justify-content: space-between; }
.dash__head h1 { font-size: 1.7rem; }
.new { position: relative; }
@media (max-width: 600px) { .new, .new .btn { width: 100%; } }

.alert {
  display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  background: linear-gradient(90deg, #fff4ea, #fff); border: 1.5px solid var(--c-accent);
  color: #8a4b12; padding: 14px 18px; border-radius: var(--radius);
}
.alert span { flex: 1; font-size: .9rem; }
.alert--review { border-color: #F4B400; background: linear-gradient(90deg, #fffbea, #fff); color: #7a5a00; }

.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media (max-width: 700px) { .kpis { grid-template-columns: repeat(2, 1fr); } }
.kpi { padding: 14px 16px; display: grid; gap: 2px; }
.kpi span { font-size: .78rem; color: var(--c-gray); font-weight: 600; text-transform: uppercase; letter-spacing: .4px; }
.kpi strong { font-family: var(--ff-head); font-size: 1.6rem; color: var(--c-primary); }

.filters { display: grid; gap: 10px; }
.search { position: relative; }
.search svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--c-gray-300); }
.search .input { padding-left: 40px; border-radius: 999px; }
.chips { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
.chips button {
  --b: var(--c-primary); flex: none; border: 1.5px solid var(--c-line); background: #fff; border-radius: 999px;
  padding: 6px 12px; font-size: .83rem; cursor: pointer; color: var(--c-text);
}
.chips button em { font-style: normal; color: var(--c-gray-300); margin-left: 3px; }
.chips button.on { border-color: var(--b); color: var(--b); background: color-mix(in srgb, var(--b) 8%, #fff); }

.empty { text-align: center; padding: 50px 20px; display: grid; gap: 8px; justify-items: center; color: var(--c-primary-300); }

.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
.item { overflow: hidden; transition: box-shadow .2s; }
.item:hover { box-shadow: var(--shadow-md); }
.item.hot { border-color: var(--c-accent); box-shadow: 0 0 0 3px rgba(244,162,97,.2); }
.item__main { display: flex; gap: 14px; align-items: center; padding: 14px 16px; color: inherit; }
.thumb {
  flex: none; width: 58px; height: 58px; border-radius: 14px; background: var(--c-bg-soft) center/cover;
  display: grid; place-items: center; color: var(--c-primary-300);
}
.item__info { flex: 1; min-width: 0; display: grid; gap: 2px; }
.item__info strong { font-family: var(--ff-head); color: var(--c-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta { display: flex; flex-wrap: wrap; gap: 4px 12px; }
.meta span { display: inline-flex; align-items: center; gap: 3px; }
.meta .warn { color: #c2410c; font-weight: 600; }
.item__price { text-align: right; display: grid; }
.item__price strong { font-family: var(--ff-head); font-size: 1.1rem; color: var(--c-primary); white-space: nowrap; }
.item__actions {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  padding: 10px 16px; border-top: 1px solid var(--c-line); background: #fbfcfd;
}
.status-select {
  font: inherit; font-size: .82rem; font-weight: 600; border: 1.5px solid var(--c-line); border-radius: 999px;
  padding: 6px 10px; background: #fff; cursor: pointer;
}
@media (max-width: 600px) {
  .item__main { flex-wrap: wrap; }
  .item__price { width: 100%; text-align: left; display: flex; gap: 8px; align-items: baseline; padding-left: 72px; }
  .hide-sm { display: none; }
  .status-select { width: 100%; }
  .item__actions .spacer { display: none; }
}
</style>
