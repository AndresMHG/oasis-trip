<template>
  <main v-if="p" class="ed">
    <PasteQuoteDialog v-if="pasteOpen" :currency="p.currency" @close="pasteOpen = false" @apply="applyPasted" />
    <!-- Barra de ações -->
    <div class="ed__bar">
      <NuxtLink to="/admin" class="btn btn--ghost btn--icon" title="Voltar"><Icon name="chevron-left" /></NuxtLink>
      <div class="ed__who">
        <strong>{{ p.client.name || 'Nova proposta' }}</strong>
        <span class="muted small">#{{ p.code }} · <span :class="`save save--${save}`">{{ saveLabel }}</span></span>
      </div>
      <select v-model="p.status" class="status-select" :style="{ color: STATUS[p.status].color }">
        <option v-for="(s, k) in STATUS" :key="k" :value="k">{{ s.label }}</option>
      </select>
      <div class="ed__actions">
        <button class="btn btn--sm" title="Salvar como modelo para reutilizar" @click="saveAsTemplate"><Icon name="file" :size="16" /><span>Salvar modelo</span></button>
        <a class="btn btn--sm" :href="`/proposta/${p.code}`" target="_blank" @click="flush"><Icon name="eye" :size="16" /><span>Visualizar</span></a>
        <button class="btn btn--sm" @click="copy"><Icon name="link" :size="16" /><span>Copiar link</span></button>
        <button class="btn btn--sm btn--wa" @click="send"><Icon name="whatsapp" :size="16" /><span>Enviar ao cliente</span></button>
      </div>
    </div>

    <div class="ed__grid">
      <div class="ed__main">
        <!-- Cliente -->
        <EditorSection title="Cliente" icon="users" :summary="clientSummary">
          <div class="grid-form">
            <label class="field c6"><span>Nome</span><input v-model="p.client.name" placeholder="Ex.: Maria Fernanda" autofocus list="dl-clients" @change="fillClient" /></label>
            <datalist id="dl-clients"><option v-for="c in pastClients" :key="c.name" :value="c.name">{{ c.whatsapp }}</option></datalist>
            <label class="field c6"><span>WhatsApp</span><input v-model="p.client.whatsapp" type="tel" inputmode="tel" placeholder="+55 41 99999-9999" @change="langFromPhone" /></label>
            <label class="field c6"><span>E-mail</span><input v-model="p.client.email" type="email" placeholder="cliente@email.com" /></label>
            <label class="field c3">
              <span>Idioma</span>
              <select v-model="p.client.lang"><option value="pt">🇧🇷 Português</option><option value="es">🇪🇸 Español</option></select>
            </label>
            <label class="field c3"><span>Viajantes</span><input v-model.number="p.client.travelers" type="number" min="1" /></label>
          </div>
        </EditorSection>

        <!-- Destino -->
        <EditorSection title="Destino" icon="pin" :summary="destSummary">
          <div class="grid-form">
            <label class="field c4"><span>Saindo de</span><PlaceInput v-model="p.destination.origin" placeholder="Curitiba (CWB)" /></label>
            <label class="field c4"><span>{{ isAereo ? 'Cidade de destino' : 'Destino' }}</span><PlaceInput v-model="p.destination.city" :with-code="isAereo" :placeholder="isAereo ? 'Rio de Janeiro (GIG)' : 'Rio de Janeiro'" @pick="(c) => (p.destination.country = c.country)" /></label>
            <label class="field c4"><span>País</span><input v-model="p.destination.country" placeholder="Brasil" /></label>
            <label class="field c3"><span>Data de ida</span><input v-model="p.destination.departDate" type="date" /></label>
            <label class="field c3"><span>{{ isAereo ? 'Volta (vazio = só ida)' : 'Data de volta' }}</span><input v-model="p.destination.returnDate" type="date" :min="p.destination.departDate" /></label>
            <label v-if="!isAereo" class="field c4"><span>Período</span><input v-model="p.destination.period" :placeholder="autoPeriod || '7 dias / 6 noites'" /></label>
            <label class="field" :class="isAereo ? 'c6' : 'c2'"><span>{{ isAereo ? 'Passageiros' : 'Viajantes' }}</span><input v-model.number="p.destination.travelers" type="number" min="1" /></label>
            <div v-if="p.destination.origin && p.destination.city" class="field invert-row">
              <button type="button" class="btn btn--sm" @click="invertRoute"><Icon name="swap" :size="15" /> Inverter rota ({{ p.destination.city }} → {{ p.destination.origin }})</button>
            </div>
            <div class="field"><span>Imagem principal do destino</span><ImageInput v-model="p.destination.image" :suggest="p.destination.city" /></div>
          </div>
        </EditorSection>

        <!-- Mensagem -->
        <EditorSection title="Mensagem de boas-vindas" icon="sparkles" summary="Aparece logo após a saudação ao cliente" :start-open="false">
          <label class="field"><textarea v-model="p.intro" rows="4" /></label>
        </EditorSection>

        <!-- Opções -->
        <section class="opts panel" id="opcoes">
          <div class="opts__tabs">
            <button
              v-for="(o, i) in p.options"
              :key="o.id"
              class="opts__tab"
              :class="{ on: i === cur }"
              @click="cur = i"
            >
              <Icon v-if="o.highlight" name="star" :size="14" />
              {{ o.name || `Opção ${i + 1}` }}
              <small>{{ money(optionTotals(o).total, p.currency) }}</small>
            </button>
            <button class="opts__tab opts__tab--add" title="Nova opção" @click="addOption"><Icon name="plus" :size="16" /> Opção</button>
          </div>

          <div v-if="opt" class="opts__body">
            <div class="grid-form">
              <label class="field c6"><span>Nome da opção</span><input v-model="opt.name" :list="'dl-optnames'" /></label>
              <datalist id="dl-optnames"><option v-for="n in optionNames" :key="n" :value="n" /></datalist>
              <div class="c6 opts__tools">
                <label class="toggle"><input v-model="opt.highlight" type="checkbox" /> Destacar como recomendada</label>
                <span class="spacer" />
                <button class="btn btn--sm btn--paste" title="Colar o texto de uma cotação e preencher os voos" @click="pasteOpen = true"><Icon name="file" :size="15" /> Colar cotação</button>
                <button class="btn btn--sm" title="Duplicar opção" @click="dupOption"><Icon name="copy" :size="15" /> Duplicar</button>
                <button v-if="p.options.length > 1" class="btn btn--sm btn--icon btn--danger" title="Excluir opção" @click="removeOption"><Icon name="trash" :size="15" /></button>
              </div>
            </div>

            <EditorSection title="Voos" icon="plane" :summary="countLabel(opt.flights.length, 'trecho', 'trechos')">
              <ItemsEditor v-model="opt.flights" noun="Trecho" :fields="flightFields" :create="createFlight" :currency="p.currency"
                :title="(f) => [f.origin, f.destination].filter(Boolean).join(' → ')"
                :subtitle="(f) => [f.airline, fmtDay(f.date), f.departTime, f.fare?.name, f.connections?.length ? (f.connections.length === 1 ? '1 conexão' : `${f.connections.length} conexões`) : ''].filter(Boolean).join(' · ')" />
              <button v-if="opt.flights.length > 1 && opt.flights[0].fare" class="btn btn--sm copy-fare" @click="copyFareToAll">
                <Icon name="copy" :size="15" /> Usar a tarifa do 1º voo em todos os voos desta opção
              </button>
            </EditorSection>

            <button v-if="isAereo" class="btn btn--sm to-pacote" @click="p.kind = 'pacote'">
              <Icon name="plus" :size="15" /> Adicionar hotel, passeios ou transfers (transformar em pacote)
            </button>
            <template v-else>
            <EditorSection title="Hospedagem" icon="bed" :summary="countLabel(opt.hotels.length, 'hotel', 'hotéis')">
              <ItemsEditor v-model="opt.hotels" noun="Hotel" :image-suggest="p.destination.city" :fields="hotelFields" :create="createHotel" :currency="p.currency" :derive="deriveHotel"
                :title="(h) => h.name"
                :subtitle="(h) => [h.nights ? `${h.nights} noites` : '', h.roomType, h.board].filter(Boolean).join(' · ')" />
            </EditorSection>

            <EditorSection title="Passeios" icon="map" :summary="countLabel(opt.tours.length, 'passeio', 'passeios')">
              <ItemsEditor v-model="opt.tours" noun="Passeio" :image-suggest="p.destination.city" :fields="tourFields" :create="createTour" :currency="p.currency"
                :title="(t) => t.name" :subtitle="(t) => [fmtDay(t.date), t.duration].filter(Boolean).join(' · ')" />
            </EditorSection>

            <EditorSection title="Transfers" icon="car" :summary="countLabel(opt.transfers.length, 'transfer', 'transfers')">
              <ItemsEditor v-model="opt.transfers" noun="Transfer" :fields="transferFields" :create="createTransfer" :currency="p.currency"
                :title="(t) => [t.origin, t.destination].filter(Boolean).join(' → ')"
                :subtitle="(t) => [fmtDay(t.date), t.time, t.vehicle].filter(Boolean).join(' · ')" />
            </EditorSection>
            </template>

            <EditorSection title="Valores desta opção" icon="wallet">
              <!-- Propostas antigas podiam ter taxas separadas: agora o preço do voo já inclui as taxas -->
              <div v-if="opt.fees" class="legacy-fees">
                <Icon name="info" :size="18" />
                <span>Esta opção tem <strong>{{ money(opt.fees, p.currency) }}</strong> em taxas separadas. Agora o preço de cada voo já deve incluir as taxas.</span>
                <button v-if="opt.flights.length" class="btn btn--sm btn--primary" @click="feesIntoFlights">Somar ao preço dos voos</button>
                <button class="btn btn--sm" @click="opt.fees = 0">Remover</button>
              </div>
              <div class="grid-form">
                <label class="field c6"><span>Desconto</span><input v-model.number="opt.discount" type="number" min="0" step="0.01" inputmode="decimal" /></label>
                <label class="field c6"><span>Preço fechado (opcional)</span><input v-model.number="opt.packagePrice" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Soma dos itens" /></label>
              </div>
              <p class="muted small">O preço dos voos já inclui as taxas (o cliente vê "taxas inclusas"). Use "Preço fechado" para vender como pacote: ele substitui a soma dos itens.</p>
            </EditorSection>
          </div>
        </section>

        <!-- Pagamento -->
        <EditorSection v-if="p.payment" title="Formas de pagamento" icon="wallet" :summary="paySummary">
          <label class="toggle"><input v-model="p.payment.enabled" type="checkbox" /> Mostrar formas de pagamento na proposta</label>
          <div v-if="p.payment.enabled" class="grid-form">
            <label class="field c3"><span>Desconto PIX (%)</span><input v-model.number="p.payment.pixDiscount" type="number" min="0" max="50" step="0.5" inputmode="decimal" placeholder="0 = não mostrar" /></label>
            <label class="field c3"><span>Parcelas no cartão</span><input v-model.number="p.payment.installments" type="number" min="0" max="24" placeholder="0 = não mostrar" /></label>
            <div class="field c6">
              <span>Juros</span>
              <label class="toggle" style="min-height: 44px"><input v-model="p.payment.interestFree" type="checkbox" /> Parcelamento sem juros (mostra o valor da parcela)</label>
            </div>
            <label class="field"><span>Observação (opcional)</span><input v-model="p.payment.note" placeholder="Ex.: Sinal de 30% para garantir a reserva e saldo até 30 dias antes do embarque" /></label>
          </div>
          <p v-if="p.payment.enabled && opt" class="pay-preview small">
            <strong>Prévia ({{ opt.name }}):</strong>
            <template v-if="payPreview?.pix"> PIX {{ money(payPreview.pix, p.currency) }}</template>
            <template v-if="payPreview?.n"> · {{ payPreview.n }}x {{ p.payment.interestFree ? `de ${money(payPreview.installment, p.currency)} sem juros` : 'no cartão' }}</template>
          </p>
        </EditorSection>

        <!-- Itinerário -->
        <EditorSection v-if="!isAereo" title="Itinerário dia a dia" icon="calendar" :summary="countLabel(p.itinerary.length, 'dia', 'dias')" id="itinerario">
          <button v-if="dayCount && !p.itinerary.length" class="btn btn--sm magic" @click="generateDays">
            <Icon name="sparkles" :size="15" /> Gerar {{ dayCount }} dias a partir das datas da viagem
          </button>
          <ItemsEditor v-model="p.itinerary" noun="Dia" :fields="dayFields" :create="() => newDay()" :currency="p.currency"
            :title="(d) => d.title" />
        </EditorSection>

        <!-- Condições -->
        <EditorSection v-if="p.trip" title="Guia da viagem (depois de confirmar)" icon="luggage" id="guia"
          :summary="p.trip.enabled ? `Liberado · código ${p.trip.pin} · ${countLabel(p.trip.docs.length, 'documento', 'documentos')}` : 'Passagens, QR, vouchers e checklist para o cliente'"
          :start-open="p.status === 'aceito' || p.trip.enabled">
          <TripGuideEditor v-model="p.trip" :code="p.code" :confirmed="p.status === 'aceito'" @send="sendTrip" />
        </EditorSection>

        <EditorSection title="Condições, validade e exibição" icon="shield">
          <div class="grid-form">
            <label class="field c4">
              <span>Tipo de proposta</span>
              <select v-model="p.kind"><option value="pacote">Pacote de viagem</option><option value="aereo">Somente passagens</option></select>
            </label>
            <label class="field c4"><span>Válida até</span><input v-model="p.validUntil" type="date" /></label>
            <label class="field c4">
              <span>Moeda</span>
              <select v-model="p.currency"><option>BRL</option><option>USD</option><option>EUR</option><option>COP</option></select>
            </label>
            <div class="field c6">
              <span>Preços</span>
              <label class="toggle" style="min-height: 44px"><input v-model="p.showItemPrices" type="checkbox" /> Mostrar preço de cada item</label>
            </div>
            <div class="field c6">
              <span>Monte do seu jeito</span>
              <label class="toggle" style="min-height: 44px" :title="mixNote">
                <input v-model="p.allowMix" type="checkbox" /> Cliente pode combinar itens de opções diferentes
              </label>
              <small v-if="p.allowMix && mixNote" class="muted">{{ mixNote }}</small>
            </div>
            <label class="field"><span>Condições</span><textarea v-model="p.conditions" rows="6" /></label>
          </div>
        </EditorSection>
      </div>

      <!-- Lateral: investimento e histórico -->
      <aside class="ed__side">
        <div class="panel side">
          <h3>Investimento</h3>
          <div v-for="(o, i) in p.options" :key="o.id" class="tot" :class="{ on: i === cur }" @click="cur = i">
            <div class="tot__name">{{ o.name }} <Icon v-if="o.highlight" name="star" :size="13" /></div>
            <dl>
              <template v-for="(label, k) in partLabels" :key="k">
                <div v-if="optionTotals(o).parts[k]"><dt>{{ label }}</dt><dd>{{ money(optionTotals(o).parts[k], p.currency) }}</dd></div>
              </template>
              <div><dt>Subtotal</dt><dd>{{ money(optionTotals(o).subtotal, p.currency) }}</dd></div>
              <div v-if="o.discount"><dt>Descontos</dt><dd class="neg">− {{ money(o.discount, p.currency) }}</dd></div>
              <div v-if="o.fees"><dt>{{ o.feesLabel || 'Taxas' }}</dt><dd>+ {{ money(o.fees, p.currency) }}</dd></div>
              <div class="total"><dt>Total</dt><dd>{{ money(optionTotals(o).total, p.currency) }}</dd></div>
              <div v-if="p.client.travelers > 1" class="pp"><dt>Por pessoa</dt><dd>{{ money(optionTotals(o).total / p.client.travelers, p.currency) }}</dd></div>
            </dl>
          </div>
        </div>

        <div v-if="p.status === 'aceito' || p.review" class="panel side post">
          <h3>Pós-viagem</h3>
          <template v-if="p.review">
            <div class="row"><Stars :value="p.review.rating" :size="20" /><strong>{{ p.review.rating }}/5</strong></div>
            <div v-if="p.review.highlights.length" class="post__tags">
              <span v-for="h in p.review.highlights" :key="h">{{ tagLabel[h] || h }}</span>
            </div>
            <p v-if="p.review.comment" class="post__quote">“{{ p.review.comment }}”</p>
            <p class="small muted">
              {{ fmtDateTime(p.review.at) }} ·
              {{ p.review.allowPublish ? '✅ Pode publicar' : '🔒 Não autorizou publicar' }}
            </p>
          </template>
          <template v-else>
            <p class="small muted">
              {{ finished ? 'A viagem já terminou — ótimo momento para pedir a avaliação!' : `A viagem termina em ${fmtDay(p.destination.returnDate) || '—'}. Depois disso, peça a avaliação.` }}
            </p>
            <p v-if="reviewRequestedAt" class="small">📨 Pedido enviado {{ fmtDateTime(reviewRequestedAt) }}</p>
          </template>
          <button class="btn btn--sm" :class="p.review ? '' : 'btn--accent'" @click="askReview">
            <Icon name="star" :size="15" /> {{ p.review ? 'Reenviar link de avaliação' : reviewRequestedAt ? 'Lembrar cliente' : 'Pedir avaliação' }}
          </button>
        </div>

        <div class="panel side">
          <h3>Acompanhamento</h3>
          <p class="small muted">Criada em {{ fmtDateTime(p.createdAt) }}</p>
          <p class="small"><Icon name="eye" :size="14" /> {{ p.views ? `Visualizada ${p.views}x · última ${fmtDateTime(p.lastViewedAt!)}` : 'Ainda não visualizada pelo cliente' }}</p>
          <ul class="log">
            <li v-for="(a, i) in p.activity" :key="i">
              <i :class="`log--${a.type}`" />
              <span><strong>{{ activityLabel[a.type] }}</strong> {{ a.detail }}<br /><small class="muted">{{ fmtDateTime(a.at) }}</small></span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </main>
  <p v-else class="muted" style="padding: 40px; text-align: center">Carregando…</p>
</template>

<script setup lang="ts">
import type { FieldDef } from '~/components/ItemsEditor.vue'
import { findPlace, photoUrl } from '~/utils/photoBank'
import { swapDefaultText } from '~/utils/templates'
import { countryOf } from '~/utils/cities'
import { optionNameFor } from '~/composables/useProposalText'
import {
  AIRLINES, BAGGAGE, BOARDS, LEGS, STATUS, STOPS, VEHICLES,
  migrateOptionFare, money, paymentValues, newDay, newTripGuide, newFlight, newHotel, newOption, newTour, newTransfer, nightsBetween, optionTotals, tripFinished, uid,
  type Flight, type Hotel, type Proposal, type Settings
} from '~/utils/proposal'

definePageMeta({ layout: 'admin', middleware: 'auth' })

const route = useRoute()
const { show } = useToast()
const { copyLink, sendWhatsapp, requestReview } = useAdminActions()

const p = ref<Proposal>()
const settings = ref<Settings>()
const cur = ref(0)
const opt = computed(() => p.value?.options[cur.value])

useHead(() => ({ title: `${p.value?.client.name || 'Proposta'} · Oasis Trip` }))

onMounted(async () => {
  const [prop, s] = await Promise.all([
    api<Proposal>(`/api/admin/proposals/${route.params.code}`),
    api<Settings>('/api/admin/settings')
  ])
  settings.value = s
  // Propostas antigas (antes destes campos existirem)
  prop.kind ??= 'pacote'
  prop.allowMix ??= true
  // Tarifa agora é por voo: converte propostas que tinham a tarifa na opção
  prop.options = prop.options.map((o) => migrateOptionFare(o))
  prop.payment ??= { ...s.payment }
  prop.trip ??= newTripGuide(prop.client.lang)
  p.value = prop
  await nextTick()
  save.value = 'saved'
})

/* ---------- Preenchimento automático ---------- */
interface PastClient { name: string; whatsapp: string; email: string; lang: 'pt' | 'es'; travelers: number }
const pastClients = ref<PastClient[]>([])
onMounted(async () => {
  const list = await api<{ code: string; updatedAt: string; client: PastClient }[]>('/api/admin/proposals').catch(() => [])
  const seen = new Map<string, PastClient>()
  for (const r of [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))) {
    const k = r.client?.name?.trim().toLowerCase()
    if (k && r.code !== route.params.code && !seen.has(k)) seen.set(k, r.client)
  }
  pastClients.value = [...seen.values()]
})
/** Cliente que já recebeu proposta → completa WhatsApp, e-mail, idioma e viajantes */
const fillClient = () => {
  const c = pastClients.value.find((x) => x.name.trim().toLowerCase() === p.value?.client.name.trim().toLowerCase())
  if (!c || !p.value) return
  const cl = p.value.client
  cl.whatsapp ||= c.whatsapp
  cl.email ||= c.email
  if (c.lang && c.lang !== cl.lang) cl.lang = c.lang
  if (c.travelers && cl.travelers <= 1) cl.travelers = c.travelers
  show('Dados do cliente preenchidos a partir da última proposta')
}
/** DDI do WhatsApp → idioma (+55 português; países de língua espanhola → espanhol) */
const ES_DDI = ['58', '57', '51', '56', '54', '52', '53', '34', '507', '506', '503', '502', '504', '505', '591', '593', '595', '598', '1809', '1829', '1849']
const langFromPhone = () => {
  const d = (p.value?.client.whatsapp || '').replace(/\D/g, '')
  if (!p.value || !(p.value.client.whatsapp || '').trim().startsWith('+')) return
  const lang = d.startsWith('55') ? 'pt' : ES_DDI.some((x) => d.startsWith(x)) ? 'es' : null
  if (lang && lang !== p.value.client.lang) {
    p.value.client.lang = lang
    show(lang === 'es' ? 'Idioma da proposta: Español 🇪🇸' : 'Idioma da proposta: Português 🇧🇷')
  }
}
/** Troca origem ↔ destino da proposta e de todos os voos (ex.: Manaus → Curitiba vira Curitiba → Manaus) */
const invertRoute = () => {
  const d = p.value!.destination
  const from = d.origin || ''
  d.origin = d.city
  d.city = from
  d.country = countryOf(from) || d.country
  for (const o of p.value!.options) {
    for (const f of o.flights) {
      [f.origin, f.destination] = [f.destination, f.origin]
      f.connections?.reverse()
    }
  }
  show('Rota invertida — confira datas e horários')
}
/** Conexões informadas → campo "Escalas" acompanha (1 conexão, 2 conexões…) */
watch(
  () => p.value?.options.flatMap((o) => o.flights.map((f) => f.connections?.filter((c) => c.airport).length || 0)).join(','),
  () => {
    for (const o of p.value?.options || []) for (const f of o.flights) {
      const n = f.connections?.filter((c) => c.airport).length || 0
      if (n && (!f.stops || STOPS.includes(f.stops))) f.stops = n === 1 ? '1 conexão' : `${n} conexões`
    }
  }
)

/* ---------- Guia da viagem: envia link + código pelo WhatsApp ---------- */
const sendTrip = async () => {
  await persist()
  const P = p.value!
  const first = (P.client.name || '').trim().split(' ')[0]
  const url = `${window.location.origin}/viagem/${P.code}`
  const city = P.destination.city.replace(/\s*\([A-Z]{3}\)\s*$/, '')
  const msg = P.client.lang === 'es'
    ? `¡Hola${first ? ' ' + first : ''}! ✈️ Tu viaje${city ? ' a ' + city : ''} está confirmado.\n\nAquí está tu guía con los pasajes, códigos QR, vouchers y todo lo que necesitas:\n${url}\n\nCódigo de acceso: *${P.trip!.pin}*\n\n¡Cualquier duda, estamos aquí! 💛`
    : `Olá${first ? ' ' + first : ''}! ✈️ Sua viagem${city ? ' para ' + city : ''} está confirmada.\n\nAqui está o seu guia com as passagens, QR codes, vouchers e tudo o que você precisa:\n${url}\n\nCódigo de acesso: *${P.trip!.pin}*\n\nQualquer dúvida, estamos aqui! 💛`
  const phone = (P.client.whatsapp || '').replace(/\D/g, '')
  window.open(phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
}

/* ---------- Colar cotação: texto copiado → voos preenchidos ---------- */
const pasteOpen = ref(false)
const applyPasted = ({ flights, mode }: { flights: Flight[]; mode: 'new' | 'replace' }) => {
  const P = p.value!
  if (mode === 'new') {
    const o = newOption(nextOptionName())
    P.options.push(o)
    cur.value = P.options.length - 1
  }
  const o = P.options[cur.value]
  // Mantém o que o modelo já tinha (tarifa, bagagem) quando o texto não traz
  o.flights = flights.map((f, i) => {
    const old = o.flights[i]
    if (!old) return f
    const keep = (k: keyof Flight) => (f[k] === '' || f[k] === undefined || f[k] === 0 ? old[k] : f[k])
    return { ...old, ...f, id: old.id, airline: keep('airline'), baggage: keep('baggage'), fare: old.fare, fareClass: old.fareClass, leg: old.leg } as Flight
  })
  // Nome da opção com a companhia, se ainda for o nome genérico
  const airline = flights.find((f) => f.airline)?.airline
  if (airline && /^(Opção|Opción) \d+$/.test(o.name.trim())) o.name = `${o.name.trim()} · ${airline}`
  // Destino e datas da proposta, se ainda estiverem vazios
  const d = P.destination
  const [ida] = flights
  const volta = flights.length > 1 ? flights[flights.length - 1] : null
  d.origin ||= ida.origin
  if (!d.city) { d.city = ida.destination; d.country ||= countryOf(ida.destination) }
  d.departDate ||= ida.date
  if (volta) d.returnDate ||= volta.date
  pasteOpen.value = false
  show(`${flights.length} ${flights.length === 1 ? 'voo preenchido' : 'voos preenchidos'} — confira horários e preço`)
}

/* ---------- Salvamento automático ---------- */
const save = ref<'saved' | 'dirty' | 'saving' | 'error' | 'init'>('init')
const saveLabel = computed(() => ({ saved: 'Tudo salvo ✓', dirty: 'Alterações…', saving: 'Salvando…', error: 'Erro ao salvar — tentando de novo', init: '' })[save.value])
let timer: ReturnType<typeof setTimeout> | undefined
let rev = 0 // incrementa a cada edição
let inFlight: Promise<void> | null = null
let applyingServer = false

const persist = async (): Promise<void> => {
  clearTimeout(timer)
  if (inFlight) return inFlight
  if (!p.value || save.value === 'saved' || save.value === 'init') return
  const startRev = rev
  save.value = 'saving'
  inFlight = (async () => {
    try {
      const res = await api<Proposal>(`/api/admin/proposals/${p.value!.code}`, { method: 'PUT', body: p.value })
      applyingServer = true
      p.value!.activity = res.activity
      p.value!.updatedAt = res.updatedAt
      await nextTick()
      applyingServer = false
      save.value = rev === startRev ? 'saved' : 'dirty'
      if (save.value === 'dirty') timer = setTimeout(persist, 900)
    } catch {
      applyingServer = false
      save.value = 'error'
      timer = setTimeout(persist, 4000)
    }
  })()
  await inFlight
  inFlight = null
}
const flush = () => persist()

watch(p, () => {
  if (applyingServer || save.value === 'init') return
  rev++
  if (save.value === 'saving') return // o save em andamento percebe a mudança e salva de novo
  save.value = 'dirty'
  clearTimeout(timer)
  timer = setTimeout(persist, 900)
}, { deep: true })

const beforeUnload = (e: BeforeUnloadEvent) => { if (save.value === 'dirty' || save.value === 'saving') e.preventDefault() }
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => { window.removeEventListener('beforeunload', beforeUnload); persist() })

/* ---------- Envio ---------- */
const reload = async (res: Proposal) => {
  applyingServer = true
  p.value!.status = res.status
  p.value!.activity = res.activity
  await nextTick()
  applyingServer = false
}
const copy = async () => { await persist(); reload(await copyLink(p.value!.code)) }
const send = async () => {
  await persist()
  if (!p.value!.client.whatsapp) show('Dica: preencha o WhatsApp do cliente para enviar direto para ele')
  reload(await sendWhatsapp(p.value!))
}

/* ---------- Idioma: troca textos padrão automaticamente ---------- */
watch(() => p.value?.client.lang, (lang, old) => {
  const s = settings.value
  if (!p.value || !s || !lang || !old || lang === old) return
  p.value.intro = swapDefaultText(p.value.intro, 'intro', old, lang, s)
  p.value.conditions = swapDefaultText(p.value.conditions, 'conditions', old, lang, s)
  // Nomes de opção sugeridos também mudam de idioma
  if (lang === 'es') for (const o of p.value.options) o.name = optionNameFor(o.name, 'es')
})
watch(() => p.value?.client.travelers, (n, old) => {
  if (p.value && n && p.value.destination.travelers === old) p.value.destination.travelers = n
})

/* ---------- Resumos ---------- */
const fmtDay = (d: string) => (d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '')
const fmtDateTime = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
const countLabel = (n: number, one: string, many: string) => (n ? `${n} ${n === 1 ? one : many}` : 'Nenhum item')
const clientSummary = computed(() => [p.value?.client.name, p.value?.client.whatsapp].filter(Boolean).join(' · ') || 'Quem vai receber a proposta')
const nights = computed(() => nightsBetween(p.value?.destination.departDate || '', p.value?.destination.returnDate || ''))
const dayCount = computed(() => (nights.value ? nights.value + 1 : 0))
const autoPeriod = computed(() => (nights.value ? `${dayCount.value} dias / ${nights.value} noites` : ''))
const destSummary = computed(() => {
  const d = p.value?.destination
  return [d?.city, d?.country].filter(Boolean).join(', ') + (d?.departDate ? ` · ${fmtDay(d.departDate)} → ${fmtDay(d.returnDate)}` : '') || 'Para onde o cliente vai'
})
const partLabels = { flights: 'Voos', hotels: 'Hospedagem', tours: 'Passeios', transfers: 'Transfers' } as const
const activityLabel = {
  criado: 'Criada', enviado: 'Enviada', visualizado: 'Cliente abriu', reserva: '🎉 Quero reservar!', status: 'Status:',
  pedido_avaliacao: 'Pedido de avaliação enviado', avaliacao: '⭐ Cliente avaliou'
}
const tagLabel: Record<string, string> = { atendimento: 'Atendimento', hotel: 'Hotel', passeios: 'Passeios', voos: 'Voos', roteiro: 'Roteiro', preco: 'Custo-benefício', transfers: 'Transfers' }

/* ---------- Passagens, pagamento e modelos ---------- */
const isAereo = computed(() => p.value?.kind === 'aereo')
// Por que a montagem pode não aparecer para o cliente
const mixNote = computed(() => {
  if (!p.value) return ''
  if (p.value.options.length < 2) return 'Aparece quando houver 2 ou mais opções.'
  if (!p.value.showItemPrices) return 'Precisa de "Mostrar preço de cada item" ligado.'
  if (p.value.options.some((o) => Number(o.packagePrice) > 0)) return 'Opções com preço fechado ficam de fora da montagem.'
  return ''
})
// Distribui as taxas antigas entre os voos da opção (o total da opção não muda)
const feesIntoFlights = () => {
  const o = opt.value!
  const n = o.flights.length
  // Divide em valores inteiros; o que sobrar (inclusive centavos) vai para o último voo
  const part = Math.floor(o.fees / n)
  o.flights.forEach((f, i) => {
    const add = i === n - 1 ? o.fees - part * (n - 1) : part
    f.price = Math.round(((Number(f.price) || 0) + add) * 100) / 100
  })
  o.fees = 0
  o.feesLabel = ''
  show('Taxas somadas ao preço dos voos — o total continua o mesmo')
}

const copyFareToAll = () => {
  const [first, ...rest] = opt.value!.flights
  rest.forEach((f) => (f.fare = structuredClone(toRaw(first.fare))))
  show('Tarifa aplicada a todos os voos desta opção')
}
const payPreview = computed(() => (opt.value && p.value ? paymentValues(optionTotals(opt.value).total, p.value.payment) : null))
const paySummary = computed(() => {
  const pay = p.value?.payment
  if (!pay?.enabled) return 'Não exibido'
  return [pay.pixDiscount ? `PIX ${pay.pixDiscount}% off` : '', pay.installments > 1 ? `${pay.installments}x${pay.interestFree ? ' sem juros' : ''}` : '']
    .filter(Boolean).join(' · ') || 'Só observação'
})

// Cidade reconhecida no banco de fotos + capa vazia → já coloca uma foto bonita do destino
let coverTimer: ReturnType<typeof setTimeout> | undefined
watch(() => p.value?.destination.city, (city) => {
  clearTimeout(coverTimer)
  // espera parar de digitar
  coverTimer = setTimeout(() => {
    if (!p.value || p.value.destination.image || !city) return
    const place = findPlace(city)
    if (place) {
      p.value.destination.image = photoUrl(place.photos[0].id)
      show(`Foto de capa de ${place.name} adicionada — troque quando quiser`)
    }
  }, 1200)
})

// Datas e cidade do destino preenchem os voos que ainda estão em branco (ida = 1º trecho, volta = último)
watch(
  () => [p.value?.destination.departDate, p.value?.destination.returnDate, p.value?.destination.city, p.value?.destination.origin],
  ([dep, ret, city, from]) => {
    for (const o of p.value?.options || []) {
      const [first] = o.flights
      const last = o.flights.length > 1 ? o.flights[o.flights.length - 1] : null
      if (first) { first.date ||= dep || ''; first.destination ||= city || ''; first.origin ||= from || '' }
      if (last) { last.date ||= ret || ''; last.origin ||= city || ''; last.destination ||= from || '' }
    }
  }
)

const saveAsTemplate = async () => {
  const suggestion = isAereo.value
    ? `Passagens ${p.value!.destination.city || ''}`.trim()
    : `${p.value!.destination.city || 'Pacote'} ${p.value!.destination.period || ''}`.trim()
  const name = prompt('Nome do modelo (as datas e os dados do cliente não são salvos):', suggestion)
  if (!name) return
  await persist()
  await api('/api/admin/templates', { method: 'POST', body: { code: p.value!.code, name } })
  show(`Modelo "${name}" salvo! Use em "Nova proposta".`)
}

/* ---------- Pós-viagem ---------- */
const finished = computed(() => !!p.value && tripFinished(p.value))
const reviewRequestedAt = computed(() => p.value?.activity.find((a) => a.type === 'pedido_avaliacao')?.at)
const askReview = async () => {
  await persist()
  if (!p.value!.client.whatsapp) show('Preencha o WhatsApp do cliente para enviar direto para ele')
  reload(await requestReview(p.value!))
}

// Período automático quando o campo fica vazio
watch(autoPeriod, (v, old) => {
  if (p.value && (!p.value.destination.period || p.value.destination.period === old)) p.value.destination.period = v
})

/* ---------- Opções ---------- */
const optionNames = computed(() => {
  const es = p.value?.client.lang === 'es'
  const n = (p.value?.options.length || 0) + 1
  if (isAereo.value) {
    const O = es ? 'Opción' : 'Opção'
    const tags = es
      ? ['Más rápida', 'Más económica', 'Vuelo directo', 'Mejor horario', 'Con equipaje', ...AIRLINES.slice(0, 6)]
      : ['Mais rápida', 'Mais econômica', 'Voo direto', 'Melhor horário', 'Com bagagem', ...AIRLINES.slice(0, 6)]
    return tags.map((t) => `${O} ${cur.value + 1} · ${t}`).concat(tags.map((t) => `${O} ${n} · ${t}`))
  }
  return es ? ['Opción Esencial', 'Opción Completa', 'Opción Premium'] : ['Opção Essencial', 'Opção Completa', 'Opção Premium']
})
const nextOptionName = () => {
  const es = p.value?.client.lang === 'es'
  const n = p.value!.options.length + 1
  if (isAereo.value) return `${es ? 'Opción' : 'Opção'} ${n}`
  return (es ? ['Opción Esencial', 'Opción Completa', 'Opción Premium'] : ['Opção Essencial', 'Opção Completa', 'Opção Premium'])[n - 1] || `${es ? 'Opción' : 'Opção'} ${n}`
}
const addOption = () => {
  const o = newOption(nextOptionName())
  p.value!.options.push(o)
  cur.value = p.value!.options.length - 1
}
const dupOption = () => {
  const src = structuredClone(toRaw(opt.value!))
  const reId = <T extends { id: string }>(l: T[]) => l.map((i) => ({ ...i, id: uid() }))
  const copy = {
    ...src, id: uid(), highlight: false,
    name: isAereo.value ? `${src.name} (cópia)` : nextOptionName(),
    flights: reId(src.flights), hotels: reId(src.hotels), tours: reId(src.tours), transfers: reId(src.transfers)
  }
  p.value!.options.splice(cur.value + 1, 0, copy)
  cur.value++
  show('Opção duplicada — ajuste hotel, passeios e valores')
}
const removeOption = () => {
  if (!confirm(`Excluir "${opt.value!.name}" e todos os seus itens?`)) return
  p.value!.options.splice(cur.value, 1)
  cur.value = Math.max(0, cur.value - 1)
}

/* ---------- Itens com preenchimento inteligente ---------- */
const createFlight = () => {
  const f = newFlight()
  const list = opt.value!.flights
  const d = p.value!.destination
  if (!list.length) {
    f.date = d.departDate
    f.destination = d.city
    f.origin = d.origin || ''
  } else {
    const prev = list[list.length - 1]
    f.origin = prev.destination
    f.destination = list[0].origin
    f.airline = prev.airline
    f.baggage = prev.baggage
    if (prev.fare) f.fare = structuredClone(toRaw(prev.fare))
    f.date = d.returnDate
  }
  return f
}
const createHotel = () => {
  const h = newHotel()
  const d = p.value!.destination
  h.checkIn = d.departDate
  h.checkOut = d.returnDate
  h.nights = nightsBetween(h.checkIn, h.checkOut)
  h.address = [d.city, d.country].filter(Boolean).join(', ')
  return h
}
const deriveHotel = (h: Hotel) => { h.nights = nightsBetween(h.checkIn, h.checkOut) || h.nights }
const createTransfer = () => {
  const t = newTransfer()
  const list = opt.value!.transfers
  const d = p.value!.destination
  t.passengers = p.value!.client.travelers
  const hotel = opt.value!.hotels.find((h) => h.name)?.name || 'Hotel'
  if (!list.length) { t.origin = transferPlaces.value[0]; t.destination = hotel; t.date = d.departDate }
  else { t.origin = hotel; t.destination = transferPlaces.value[0]; t.date = d.returnDate }
  return t
}
const createTour = () => {
  const t = newTour()
  t.location = p.value!.destination.city.replace(/\s*\([A-Z]{3}\)\s*$/, '')
  t.date = p.value!.destination.departDate
  return t
}
/** Sugestões de origem/destino do transfer: aeroporto do destino, hotéis desta opção, porto, centro */
const transferPlaces = computed(() => {
  const d = p.value?.destination
  const es = p.value?.client.lang === 'es'
  const airport = d?.city ? `${es ? 'Aeropuerto' : 'Aeroporto'} ${d.city}` : (es ? 'Aeropuerto' : 'Aeroporto')
  const hotels = (opt.value?.hotels || []).map((h) => h.name).filter(Boolean)
  return [airport, ...hotels, 'Hotel', es ? 'Puerto / Muelle' : 'Porto / Píer', es ? 'Centro' : 'Centro', es ? 'Rodoviaria' : 'Rodoviária']
})
const generateDays = () => {
  const es = p.value!.client.lang === 'es'
  p.value!.itinerary = Array.from({ length: dayCount.value }, (_, i) =>
    newDay(i === 0 ? (es ? 'Llegada' : 'Chegada') : i === dayCount.value - 1 ? (es ? 'Regreso' : 'Retorno') : '')
  )
}

/* ---------- Campos de cada tipo de item ---------- */
const flightFields: FieldDef[] = [
  { key: 'leg', label: 'Trecho', cls: 'c3', list: LEGS, placeholder: 'Automático (Ida/Volta)' },
  { key: 'airline', label: 'Companhia aérea', cls: 'c3', list: AIRLINES },
  { key: 'origin', label: 'Origem', type: 'place', cls: 'c3', placeholder: 'São Paulo (GRU)' },
  { key: 'destination', label: 'Destino', type: 'place', cls: 'c3', placeholder: 'Bogotá (BOG)' },
  { key: 'date', label: 'Data', type: 'date', cls: 'c3' },
  { key: 'departTime', label: 'Saída', type: 'time', cls: 'c3' },
  { key: 'arriveTime', label: 'Chegada', type: 'time', cls: 'c3' },
  { key: 'duration', label: 'Duração', cls: 'c3', placeholder: '5h 30min' },
  { key: 'stops', label: 'Escalas', cls: 'c3', list: STOPS },
  { key: 'baggage', label: 'Bagagem', cls: 'c3', list: BAGGAGE },
  { key: 'price', label: 'Preço (com taxas)', type: 'money', cls: 'c3' },
  { key: 'connections', label: 'Conexões / escalas (com horários)', type: 'connections' },
  { key: 'fare', label: 'Tarifa deste voo', type: 'fare' },
  { key: 'notes', label: 'Observações', type: 'textarea', rows: 2 }
]
const hotelFields: FieldDef[] = [
  { key: 'name', label: 'Nome do hotel', cls: 'c8' },
  { key: 'price', label: 'Preço', type: 'money', cls: 'c4' },
  { key: 'image', label: 'Imagem principal', type: 'image' },
  { key: 'address', label: 'Endereço', cls: 'c8' },
  { key: 'nights', label: 'Noites', type: 'number', cls: 'c4' },
  { key: 'checkIn', label: 'Check-in', type: 'date', cls: 'c3' },
  { key: 'checkOut', label: 'Check-out', type: 'date', cls: 'c3' },
  { key: 'roomType', label: 'Tipo de quarto', cls: 'c3', list: ['Standard', 'Superior', 'Luxo', 'Suíte', 'Quarto duplo', 'Quarto triplo', 'Vista mar'] },
  { key: 'board', label: 'Regime', cls: 'c3', list: BOARDS },
  { key: 'notes', label: 'Observações', type: 'textarea', rows: 2 }
]
const tourFields: FieldDef[] = [
  { key: 'name', label: 'Nome do passeio', cls: 'c8' },
  { key: 'price', label: 'Preço', type: 'money', cls: 'c4' },
  { key: 'image', label: 'Imagem', type: 'image' },
  { key: 'description', label: 'Descrição', type: 'textarea' },
  { key: 'date', label: 'Data', type: 'date', cls: 'c4' },
  { key: 'duration', label: 'Duração', cls: 'c4', placeholder: '4 horas' },
  { key: 'location', label: 'Local', cls: 'c4' },
  { key: 'included', label: 'O que está incluído (1 por linha)', type: 'textarea', cls: 'c6', placeholder: 'Guia bilíngue\nIngressos\nTransporte' },
  { key: 'notIncluded', label: 'Não incluído (1 por linha)', type: 'textarea', cls: 'c6', placeholder: 'Almoço\nGorjetas' }
]
const transferFields = computed<FieldDef[]>(() => [
  { key: 'origin', label: 'Origem', cls: 'c6', list: transferPlaces.value },
  { key: 'destination', label: 'Destino', cls: 'c6', list: transferPlaces.value },
  { key: 'date', label: 'Data', type: 'date', cls: 'c3' },
  { key: 'time', label: 'Horário', type: 'time', cls: 'c3' },
  { key: 'vehicle', label: 'Veículo', cls: 'c3', list: VEHICLES },
  { key: 'passengers', label: 'Passageiros', type: 'number', cls: 'c3' },
  { key: 'price', label: 'Preço', type: 'money', cls: 'c4' },
  { key: 'notes', label: 'Observações', cls: 'c8' }
])
const dayFields: FieldDef[] = [
  { key: 'title', label: 'Título do dia', placeholder: 'Ex.: Cristo Redentor e Pão de Açúcar' },
  { key: 'description', label: 'Descrição das atividades', type: 'textarea' }
]
</script>

<style scoped>
.ed { max-width: 1240px; margin: 0 auto; padding: 0 clamp(10px, 2.5vw, 24px) 80px; }
.ed__bar {
  position: sticky; top: 54px; z-index: 40; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  padding: 10px 4px; margin-bottom: 14px; background: color-mix(in srgb, var(--c-bg-soft) 92%, transparent);
  backdrop-filter: blur(8px); border-bottom: 1px solid var(--c-line);
}
.ed__who { flex: 1; min-width: 140px; display: grid; }
.ed__who strong { font-family: var(--ff-head); color: var(--c-primary); font-size: 1.08rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.save--saved { color: var(--c-ok); }
.save--error { color: var(--c-danger); }
.ed__actions { display: flex; gap: 6px; }
.invert-row { align-items: flex-start; }
.btn--paste { border-color: var(--c-primary-300); color: var(--c-primary); }
.status-select { font: inherit; font-size: .85rem; font-weight: 600; border: 1.5px solid var(--c-line); border-radius: 999px; padding: 7px 10px; background: #fff; }
@media (max-width: 760px) {
  .ed__bar { top: 54px; }
  .ed__actions { width: 100%; }
  .ed__actions .btn { flex: 1; }
  .ed__actions .btn:not(.btn--wa) span { display: none; }
}

.ed__grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 18px; align-items: start; }
.ed__main { display: grid; gap: 14px; }
.ed__side { position: sticky; top: 130px; display: grid; gap: 14px; }
@media (max-width: 980px) { .ed__grid { grid-template-columns: 1fr; } .ed__side { position: static; } }

.opts { overflow: hidden; }
.opts__tabs { display: flex; gap: 6px; padding: 10px; background: var(--c-primary); overflow-x: auto; scrollbar-width: none; }
.opts__tab {
  flex: none; display: grid; gap: 1px; text-align: left; border: 0; cursor: pointer;
  padding: 9px 14px; border-radius: 12px; background: rgba(255,255,255,.1); color: rgba(255,255,255,.85);
  font-family: var(--ff-head); font-weight: 600; font-size: .9rem;
}
.opts__tab svg { display: inline; vertical-align: -2px; color: var(--c-accent); }
.opts__tab small { font-family: var(--ff-body); font-weight: 500; font-size: .75rem; opacity: .8; }
.opts__tab.on { background: #fff; color: var(--c-primary); }
.opts__tab--add { display: flex; align-items: center; gap: 4px; background: transparent; border: 1.5px dashed rgba(255,255,255,.4); }
.opts__body { padding: 16px; display: grid; gap: 12px; background: #fafcfd; }
.opts__body :deep(.sec) { box-shadow: none; }
.opts__tools { display: flex; align-items: flex-end; gap: 8px; flex-wrap: wrap; }
.to-pacote { justify-self: start; border-style: dashed; }
.copy-fare { justify-self: start; }
.legacy-fees {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; padding: 12px 14px; border-radius: 12px;
  background: #fff6e0; border: 1px solid #f3d58a; color: #7a5a00; font-size: .9rem;
}
.legacy-fees span { flex: 1; min-width: 220px; }
.pay-preview { background: #eefaf3; color: #16693a; border-radius: 10px; padding: 8px 12px; }
.magic { justify-self: start; border-color: var(--c-accent); color: #8a4b12; background: #fff7ef; }

.side { padding: 16px; display: grid; gap: 10px; }
.side h3 { font-size: 1rem; }
.tot { border: 1.5px solid var(--c-line); border-radius: 12px; padding: 10px 12px; cursor: pointer; }
.tot.on { border-color: var(--c-primary-300); }
.tot__name { font-weight: 700; color: var(--c-primary); display: flex; align-items: center; gap: 4px; margin-bottom: 6px; }
.tot__name svg { color: var(--c-accent); }
.tot dl { margin: 0; display: grid; gap: 3px; font-size: .86rem; }
.tot dl div { display: flex; justify-content: space-between; gap: 8px; }
.tot dt { color: var(--c-gray); }
.tot dd { margin: 0; font-weight: 500; white-space: nowrap; }
.tot .neg { color: var(--c-ok); }
.tot .total { border-top: 1px dashed var(--c-line); padding-top: 5px; margin-top: 3px; font-size: 1rem; }
.tot .total dt, .tot .total dd { color: var(--c-primary); font-weight: 700; }
.tot .pp dd { color: var(--c-gray); }

.post { border-color: #f7d9bd; order: -1; }
.post .btn { justify-self: start; }
.post__tags { display: flex; flex-wrap: wrap; gap: 5px; }
.post__tags span { font-size: .75rem; background: var(--c-bg-soft); border-radius: 999px; padding: 3px 9px; color: var(--c-primary); font-weight: 600; }
.post__quote { font-style: italic; color: var(--c-text); font-size: .92rem; border-left: 3px solid var(--c-accent); padding-left: 10px; white-space: pre-line; }
.log .log--avaliacao, .log .log--pedido_avaliacao { background: #F4B400; }
.log { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; max-height: 280px; overflow: auto; font-size: .85rem; }
.log li { display: flex; gap: 10px; }
.log i { flex: none; width: 9px; height: 9px; border-radius: 50%; margin-top: 6px; background: var(--c-gray-300); }
.log .log--enviado { background: #2E8BB0; }
.log .log--visualizado { background: #7b61ff; }
.log .log--reserva { background: var(--c-accent); }
</style>
