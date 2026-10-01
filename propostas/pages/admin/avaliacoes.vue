<template>
  <main class="rvs">
    <div>
      <h1>Avaliações</h1>
      <p class="muted">A opinião de quem já viajou com a Oasis Trip.</p>
    </div>

    <section class="kpis">
      <div class="kpi panel">
        <span>Nota média</span>
        <strong>{{ avg ? avg.toFixed(1) : '—' }}</strong>
        <Stars v-if="avg" :value="avg" :size="16" />
      </div>
      <div class="kpi panel"><span>Avaliações</span><strong>{{ reviewed.length }}</strong></div>
      <div class="kpi panel"><span>Nota 4 ou 5</span><strong>{{ reviewed.length ? Math.round((happy / reviewed.length) * 100) : 0 }}%</strong></div>
      <div class="kpi panel"><span>Depoimentos liberados</span><strong>{{ reviewed.filter((r) => r.review!.allowPublish).length }}</strong></div>
    </section>

    <!-- Viagens concluídas aguardando avaliação -->
    <section v-if="pendingList.length" class="panel pend">
      <h2>Aguardando avaliação <em>{{ pendingList.length }}</em></h2>
      <div v-for="p in pendingList" :key="p.code" class="pend__row">
        <div class="pend__info">
          <strong>{{ p.client.name || 'Cliente' }}</strong>
          <span class="muted small">{{ p.destination.city }} · voltou em {{ fmtDay(p.destination.returnDate) }}{{ p.reviewRequested ? ' · pedido já enviado' : '' }}</span>
        </div>
        <button class="btn btn--sm" :class="p.reviewRequested ? '' : 'btn--accent'" @click="ask(p)">
          <Icon name="whatsapp" :size="15" /> {{ p.reviewRequested ? 'Lembrar' : 'Pedir avaliação' }}
        </button>
      </div>
    </section>

    <div class="chips">
      <button :class="{ on: filter === 0 }" @click="filter = 0">Todas</button>
      <button v-for="n in [5, 4, 3, 2, 1]" :key="n" :class="{ on: filter === n }" @click="filter = n">{{ n }} ★</button>
    </div>

    <p v-if="pending" class="muted">Carregando…</p>
    <div v-else-if="!shown.length" class="panel empty">
      <Icon name="star" :size="34" />
      <h3>Nenhuma avaliação ainda</h3>
      <p class="muted">Quando uma viagem confirmada terminar, peça a avaliação pelo WhatsApp com um clique.</p>
    </div>

    <div class="grid">
      <article v-for="p in shown" :key="p.code" class="panel rcard" :class="{ low: p.review!.rating <= 3 }">
        <div class="row">
          <Stars :value="p.review!.rating" :size="18" />
          <span class="spacer" />
          <span class="small" :title="p.review!.allowPublish ? 'Autorizou publicar' : 'Não autorizou publicar'">{{ p.review!.allowPublish ? '✅ Pode publicar' : '🔒 Privado' }}</span>
        </div>
        <p v-if="p.review!.comment" class="quote">“{{ p.review!.comment }}”</p>
        <div v-if="p.review!.highlights.length" class="tags">
          <span v-for="h in p.review!.highlights" :key="h">{{ tagLabel[h] || h }}</span>
        </div>
        <footer>
          <div>
            <strong>{{ p.client.name }}</strong>
            <span class="muted small">{{ p.destination.city }} · {{ fmtDay(p.review!.at.slice(0, 10)) }}</span>
          </div>
          <button v-if="p.review!.comment && p.review!.allowPublish" class="btn btn--sm btn--icon" title="Copiar depoimento" @click="copyQuote(p)"><Icon name="copy" :size="15" /></button>
          <NuxtLink class="btn btn--sm btn--icon" title="Abrir proposta" :to="`/admin/${p.code}`"><Icon name="edit" :size="15" /></NuxtLink>
        </footer>
      </article>
    </div>
  </main>
</template>

<script setup lang="ts">
import { tripFinished, type Proposal, type Review, type Status } from '~/utils/proposal'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: 'Avaliações · Oasis Trip' })

interface Row {
  code: string
  status: Status
  client: Proposal['client']
  destination: { city: string; image: string; returnDate: string }
  review: Review | null
  reviewRequested: boolean
}

const { show } = useToast()
const { requestReview } = useAdminActions()
const list = ref<Row[]>([])
const pending = ref(true)
const filter = ref(0)

const load = async () => {
  list.value = await api<Row[]>('/api/admin/proposals')
  pending.value = false
}
onMounted(load)

const reviewed = computed(() =>
  list.value.filter((p) => p.review).sort((a, b) => b.review!.at.localeCompare(a.review!.at))
)
const shown = computed(() => reviewed.value.filter((p) => !filter.value || p.review!.rating === filter.value))
const avg = computed(() => (reviewed.value.length ? reviewed.value.reduce((s, p) => s + p.review!.rating, 0) / reviewed.value.length : 0))
const happy = computed(() => reviewed.value.filter((p) => p.review!.rating >= 4).length)
const pendingList = computed(() => list.value.filter((p) => !p.review && tripFinished(p)))

const tagLabel: Record<string, string> = { atendimento: 'Atendimento', hotel: 'Hotel', passeios: 'Passeios', voos: 'Voos', roteiro: 'Roteiro', preco: 'Custo-benefício', transfers: 'Transfers' }
const fmtDay = (d: string) => (d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '')

const ask = async (p: Row) => {
  if (!p.client.whatsapp) show('Preencha o WhatsApp do cliente na proposta para enviar direto')
  await requestReview({ code: p.code, client: p.client, destination: p.destination })
  load()
}
const copyQuote = async (p: Row) => {
  const first = p.client.name.trim().split(' ')[0]
  await navigator.clipboard.writeText(`“${p.review!.comment}”\n— ${first}, ${p.destination.city} ${'⭐'.repeat(p.review!.rating)}`)
  show('Depoimento copiado — pronto para postar!')
}
</script>

<style scoped>
.rvs { max-width: 1100px; margin: 0 auto; padding: 22px clamp(12px, 3vw, 28px) 80px; display: grid; gap: 18px; }
.rvs h1 { font-size: 1.7rem; }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media (max-width: 700px) { .kpis { grid-template-columns: repeat(2, 1fr); } }
.kpi { padding: 14px 16px; display: grid; gap: 2px; }
.kpi span { font-size: .78rem; color: var(--c-gray); font-weight: 600; text-transform: uppercase; letter-spacing: .4px; }
.kpi strong { font-family: var(--ff-head); font-size: 1.6rem; color: var(--c-primary); }

.pend { padding: 16px 18px; display: grid; gap: 4px; border-color: #F4B400; }
.pend h2 { font-size: 1.05rem; margin-bottom: 6px; }
.pend h2 em { font-style: normal; background: #fff6d9; color: #7a5a00; border-radius: 999px; padding: 1px 9px; font-size: .85rem; }
.pend__row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px dashed var(--c-line); }
.pend__info { flex: 1; display: grid; min-width: 0; }

.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chips button { border: 1.5px solid var(--c-line); background: #fff; border-radius: 999px; padding: 6px 13px; font-size: .85rem; cursor: pointer; }
.chips button.on { border-color: var(--c-primary); background: var(--c-primary); color: #fff; }

.empty { text-align: center; padding: 46px 20px; display: grid; gap: 8px; justify-items: center; color: #d99a00; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
.rcard { padding: 16px 18px; display: grid; gap: 10px; align-content: start; }
.rcard.low { border-color: #f2b8b8; background: #fffafa; }
.quote { font-size: .97rem; line-height: 1.55; white-space: pre-line; }
.tags { display: flex; flex-wrap: wrap; gap: 5px; }
.tags span { font-size: .75rem; background: var(--c-bg-soft); border-radius: 999px; padding: 3px 9px; color: var(--c-primary); font-weight: 600; }
.rcard footer { display: flex; align-items: center; gap: 6px; padding-top: 10px; border-top: 1px solid var(--c-line); }
.rcard footer div { flex: 1; display: grid; min-width: 0; }
</style>
