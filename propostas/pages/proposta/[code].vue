<template>
  <div v-if="p" class="pp" :lang="lang">
    <!-- 1-2. Logo + imagem do destino -->
    <header class="hero" :style="p.destination.image ? { backgroundImage: `url(${p.destination.image})` } : {}">
      <div class="hero__shade" />
      <div class="hero__top"><Logo white :lang="lang" :height="38" /></div>
      <div class="hero__content wrap">
        <span class="hero__eyebrow">{{ isAereo ? t.subtitleAereo : t.subtitle }}</span>
        <h1>{{ p.destination.city || '✈️' }}</h1>
        <p v-if="p.destination.country || p.destination.origin" class="hero__country">
          <span v-if="p.destination.origin" class="hero__loc"><Icon name="plane" :size="16" /> {{ t.from }} {{ p.destination.origin }}</span>
          <span v-if="p.destination.country" class="hero__loc"><Icon name="pin" :size="16" /> {{ p.destination.country }}</span>
        </p>
        <div class="hero__chips">
          <span v-if="p.destination.departDate"><Icon name="calendar" :size="15" /> {{ fmtShort(p.destination.departDate) }}<template v-if="p.destination.returnDate"> – {{ fmtShort(p.destination.returnDate) }}</template></span>
          <span v-if="travelers"><Icon name="users" :size="15" /> {{ travelers }} {{ travelers === 1 ? t.traveler : t.travelersN }}</span>
        </div>
      </div>
      <a href="#saudacao" class="hero__down" aria-label="↓"><Icon name="chevron" :size="22" /></a>
    </header>

    <!-- Navegação por seções -->
    <nav class="snav" :class="{ show: navVisible }">
      <a v-for="s in navSections" :key="s.id" :href="`#${s.id}`" :class="{ on: activeSection === s.id }">{{ s.label }}</a>
    </nav>

    <main class="wrap body">
      <NuxtLink v-if="p.reviewOpen" :to="`/avaliacao/${p.code}`" class="rvb">
        <span class="rvb__stars">★★★★★</span>
        <strong>{{ t.rvBannerTitle }}</strong>
        <span>{{ t.rvBannerText }}</span>
        <span class="btn btn--accent btn--block">{{ t.rvBannerBtn }}</span>
      </NuxtLink>

      <div v-if="banner" class="banner" :class="`banner--${banner.kind}`">
        <Icon :name="banner.kind === 'ok' ? 'check' : 'info'" :size="20" /> {{ banner.text }}
      </div>

      <!-- 3. Saudação -->
      <section id="saudacao" v-reveal class="card greet">
        <h2>{{ t.hello }}{{ firstName ? `, ${firstName}` : '' }}! 👋</h2>
        <p class="pre">{{ p.intro }}</p>
        <p class="greet__sign">— {{ p.agency.name }}</p>
      </section>

      <!-- 4. Resumo -->
      <section id="resumo" v-reveal class="block">
        <h2 class="block__title">{{ t.summary }}</h2>
        <div class="facts">
          <div v-if="p.destination.departDate" class="fact">
            <Icon name="calendar" /><small>{{ t.dates }}</small>
            <strong>{{ fmtShort(p.destination.departDate) }}<template v-if="p.destination.returnDate"> → {{ fmtShort(p.destination.returnDate) }}</template></strong>
          </div>
          <div v-if="isAereo" class="fact"><Icon name="plane" /><small>{{ t.tripType }}</small><strong>{{ isRoundTrip ? t.roundTrip : t.oneWay }}</strong></div>
          <div v-else-if="period" class="fact"><Icon name="sun" /><small>{{ t.duration }}</small><strong>{{ period }}</strong></div>
          <div v-if="travelers" class="fact"><Icon name="users" /><small>{{ t.travelers }}</small><strong>{{ travelers }}</strong></div>
          <div v-if="isAereo" class="fact"><Icon name="check" /><small>{{ t.options }}</small><strong>{{ p.options.length }}</strong></div>
          <div v-else class="fact">
            <Icon name="check" /><small>{{ t.included }}</small>
            <strong class="inc">
              <Icon v-if="opt.flights.length" name="plane" :size="18" />
              <Icon v-if="opt.hotels.length" name="bed" :size="18" />
              <Icon v-if="opt.tours.length" name="map" :size="18" />
              <Icon v-if="opt.transfers.length" name="car" :size="18" />
            </strong>
          </div>
        </div>
      </section>

      <!-- Escolha de opção -->
      <section v-if="p.options.length > 1" id="opcoes" v-reveal class="block">
        <h2 class="block__title">{{ t.chooseOption }}</h2>
        <div class="choices">
          <button
            v-for="(o, i) in p.options"
            :key="o.id"
            class="choice"
            :class="{ on: i === cur, hl: o.highlight }"
            @click="cur = i"
          >
            <span v-if="o.highlight" class="choice__tag"><Icon name="star" :size="12" /> {{ t.recommended }}</span>
            <strong>{{ on(o.name) }}</strong>
            <span class="choice__price">{{ money(o.totals.total, p.currency, lang) }}</span>
            <small v-if="travelers > 1">{{ money(o.totals.total / travelers, p.currency, lang) }} {{ t.perPerson }}</small>
            <small v-if="payOf(o.totals.total)?.n && p.payment?.interestFree" class="choice__inst">
              {{ t.payShort(payOf(o.totals.total)!.n, money(payOf(o.totals.total)!.installment, p.currency, lang)) }}
            </small>
            <span class="choice__radio"><Icon v-if="i === cur" name="check" :size="14" :stroke="3" /></span>
          </button>

          <!-- Monte do seu jeito -->
          <button v-if="p.allowMix" class="choice choice--mix" :class="{ on: isMix }" @click="cur = MIX">
            <span class="choice__tag choice__tag--mix"><Icon name="sparkles" :size="12" /> {{ t.mixTag }}</span>
            <strong>{{ t.mixTitle }}</strong>
            <small class="choice__desc">{{ t.mixDesc }}</small>
            <span class="choice__price">{{ money(mixTotal.total, p.currency, lang) }}</span>
            <small v-if="travelers > 1">{{ money(mixTotal.total / travelers, p.currency, lang) }} {{ t.perPerson }}</small>
            <span class="choice__radio"><Icon v-if="isMix" name="check" :size="14" :stroke="3" /></span>
          </button>
        </div>

        <p v-if="isMix" class="mix-hint"><Icon name="sparkles" :size="16" /> {{ t.mixHint }}</p>
      </section>

      <!-- 5. Voos (no modo "Monte do seu jeito": 1 escolha por trecho) -->
      <section v-if="flightGroups.length" id="voos" v-reveal class="block">
        <h2 class="block__title"><Icon name="plane" /> {{ t.flights }}</h2>
        <template v-for="g in flightGroups" :key="g.leg || 'fixed'">
          <h3 v-if="g.leg" class="pick-title">{{ t.chooseFlight(v(g.leg)) }}</h3>
          <article
            v-for="e in g.entries"
            :key="e.item.id"
            class="card flight"
            :class="{ pick: isMix, on: e.selected }"
            :role="isMix ? 'radio' : undefined"
            :aria-checked="isMix ? e.selected : undefined"
            @click="isMix && pickFlight(g.leg!, e.item.id)"
          >
            <div class="flight__top">
              <span class="flight__airline">{{ e.item.airline }}<em v-if="e.item.fare?.name || e.item.fareClass">{{ v(e.item.fare?.name || e.item.fareClass || '') }}</em></span>
              <span v-if="e.item.date" class="muted">{{ fmtLong(e.item.date) }}</span>
            </div>
            <div v-if="e.badges.length || e.from" class="badges">
              <span v-for="b in e.badges" :key="b" class="badge" :class="`badge--${b}`">{{ b === 'cheap' ? t.cheapest : t.fastest }}</span>
              <span v-if="e.from" class="badge badge--from">{{ on(e.from) }}</span>
            </div>
            <div class="flight__route">
              <div><strong>{{ e.item.departTime || '—' }}</strong><span>{{ e.item.origin }}</span></div>
              <div class="flight__line">
                <small>{{ e.item.duration }}</small>
                <i><Icon name="plane" :size="16" /></i>
                <small>{{ e.item.connections?.length ? t.connectionsN(e.item.connections.length) : v(e.item.stops) }}</small>
              </div>
              <div class="r"><strong>{{ e.item.arriveTime || '—' }}</strong><span>{{ e.item.destination }}</span></div>
            </div>
            <!-- Resumo curto das conexões (os horários completos ficam em "Ver detalhes") -->
            <p v-if="e.item.connections?.length" class="flight__conn">
              <Icon name="clock" :size="14" />
              <span>{{ e.item.connections.map((c) => [c.airport, fmtMinutes(layoverMinutes(c.arrive, c.depart))].filter(Boolean).join(' · ')).join(' | ') }}</span>
            </p>
            <div v-if="e.item.baggage || e.item.price" class="flight__foot">
              <span v-if="e.item.baggage"><Icon name="luggage" :size="15" /> {{ v(e.item.baggage) }}</span>
              <span v-if="e.item.price" class="price">{{ money(e.item.price, p.currency, lang) }}<small class="tax-inc">{{ t.taxesIncluded }}</small></span>
            </div>
            <Expand v-if="e.item.notes || e.item.fare || e.item.connections?.length" :more="t.seeMore" :less="t.seeLess" @click.stop>
              <FlightDetails :flight="e.item" :t="t" :currency="p.currency" :lang="lang" />
            </Expand>
            <span v-if="isMix" class="pick__radio"><Icon v-if="e.selected" name="check" :size="14" :stroke="3" /></span>
          </article>
        </template>
      </section>

      <!-- 6. Hospedagem -->
      <section v-if="hotelGroups.length" id="hotel" v-reveal class="block">
        <h2 class="block__title"><Icon name="bed" /> {{ t.hotel }}</h2>
        <template v-for="(g, gi) in hotelGroups" :key="gi">
          <h3 v-if="isMix" class="pick-title">{{ hotelSlotTitle(g) }}</h3>
          <div :class="{ 'pick-row': isMix && g.entries.length > 1 }">
            <article
              v-for="e in g.entries"
              :key="e.item.id"
              class="card hotel"
              :class="{ pick: isMix, on: e.selected }"
              @click="isMix && pickHotel(gi, e.item.id)"
            >
              <div v-if="e.item.image" class="hotel__img" :style="{ backgroundImage: `url(${e.item.image})` }">
                <span v-if="e.item.nights" class="hotel__nights">{{ e.item.nights }} {{ t.nights }}</span>
              </div>
              <div class="hotel__body">
                <div v-if="e.from" class="badges"><span class="badge badge--from">{{ on(e.from) }}</span></div>
                <h3>{{ e.item.name }}</h3>
                <p v-if="e.item.address" class="muted small"><Icon name="pin" :size="14" /> {{ e.item.address }}</p>
                <div class="kv">
                  <div v-if="e.item.checkIn"><small>{{ t.checkIn }}</small><strong>{{ fmtShort(e.item.checkIn) }}</strong></div>
                  <div v-if="e.item.checkOut"><small>{{ t.checkOut }}</small><strong>{{ fmtShort(e.item.checkOut) }}</strong></div>
                  <div v-if="e.item.roomType"><small>{{ t.room }}</small><strong>{{ v(e.item.roomType) }}</strong></div>
                  <div v-if="e.item.board"><small>{{ t.board }}</small><strong>{{ v(e.item.board) }}</strong></div>
                </div>
                <p v-if="e.item.price" class="price-line">{{ money(e.item.price, p.currency, lang) }}</p>
                <Expand v-if="e.item.notes" :more="t.seeMore" :less="t.seeLess" @click.stop><p class="pre small">{{ e.item.notes }}</p></Expand>
              </div>
              <span v-if="isMix" class="pick__radio"><Icon v-if="e.selected" name="check" :size="14" :stroke="3" /></span>
            </article>
          </div>
        </template>
      </section>

      <!-- 7. Itinerário -->
      <section v-if="p.itinerary.length" id="roteiro" v-reveal class="block">
        <h2 class="block__title"><Icon name="calendar" /> {{ t.itinerary }}</h2>
        <ol class="timeline">
          <li v-for="(d, i) in p.itinerary" :key="d.id" :class="{ open: openDays.has(i) }">
            <button class="timeline__head" @click="toggleDay(i)">
              <span class="timeline__dot">{{ i + 1 }}</span>
              <span class="timeline__title">
                <small>{{ t.day }} {{ i + 1 }}<template v-if="dayDate(i)"> · {{ dayDate(i) }}</template></small>
                <strong>{{ d.title || `${t.day} ${i + 1}` }}</strong>
              </span>
              <Icon v-if="d.description" name="chevron" :size="18" class="chev" />
            </button>
            <p v-if="d.description && openDays.has(i)" class="timeline__desc pre">{{ d.description }}</p>
          </li>
        </ol>
      </section>

      <!-- 8. Passeios (no modo "Monte do seu jeito": adicionar/remover) -->
      <section v-if="tourEntries.length" id="passeios" v-reveal class="block">
        <h2 class="block__title"><Icon name="map" /> {{ t.tours }}</h2>
        <p v-if="isMix" class="pick-sub">{{ t.addTours }}</p>
        <article v-for="e in tourEntries" :key="e.item.id" class="card tour" :class="{ pick: isMix, on: e.selected }">
          <div v-if="e.item.image" class="tour__img" :style="{ backgroundImage: `url(${e.item.image})` }" />
          <div class="tour__body">
            <h3>{{ e.item.name }}</h3>
            <div class="meta">
              <span v-if="e.item.date"><Icon name="calendar" :size="14" /> {{ fmtShort(e.item.date) }}</span>
              <span v-if="e.item.duration"><Icon name="clock" :size="14" /> {{ e.item.duration }}</span>
              <span v-if="e.item.location"><Icon name="pin" :size="14" /> {{ e.item.location }}</span>
            </div>
            <p v-if="e.item.description" class="pre small muted">{{ e.item.description }}</p>
            <Expand v-if="e.item.included || e.item.notIncluded" :more="t.seeMore" :less="t.seeLess">
              <div class="incl">
                <div v-if="e.item.included">
                  <strong>{{ t.whatIncluded }}</strong>
                  <ul><li v-for="l in lines(e.item.included)" :key="l"><Icon name="check" :size="15" class="ok" /> {{ l }}</li></ul>
                </div>
                <div v-if="e.item.notIncluded">
                  <strong>{{ t.notIncluded }}</strong>
                  <ul><li v-for="l in lines(e.item.notIncluded)" :key="l"><Icon name="x" :size="15" class="no" /> {{ l }}</li></ul>
                </div>
              </div>
            </Expand>
            <div class="tour__foot">
              <p v-if="e.item.price" class="price-line">{{ money(e.item.price, p.currency, lang) }}</p>
              <button v-if="isMix" class="btn btn--sm toggle-add" :class="{ on: e.selected }" @click="toggleExtra('tours', e.item.id)">
                <Icon :name="e.selected ? 'check' : 'plus'" :size="15" :stroke="2.4" /> {{ e.selected ? t.added : t.add }}
              </button>
            </div>
          </div>
        </article>
      </section>

      <!-- 9. Transfers -->
      <section v-if="transferEntries.length" id="transfers" v-reveal class="block">
        <h2 class="block__title"><Icon name="car" /> {{ t.transfers }}</h2>
        <div class="card transfers">
          <div v-for="e in transferEntries" :key="e.item.id" class="transfer" :class="{ off: isMix && !e.selected }">
            <span class="transfer__ico"><Icon name="car" :size="18" /></span>
            <div>
              <strong>{{ v(e.item.origin) }} → {{ v(e.item.destination) }}</strong>
              <small class="muted">{{ [fmtShort(e.item.date), e.item.time, v(e.item.vehicle), e.item.passengers ? `${e.item.passengers} ${t.passengers}` : ''].filter(Boolean).join(' · ') }}</small>
              <small v-if="e.item.notes" class="muted pre">{{ e.item.notes }}</small>
              <span v-if="e.item.price" class="price">{{ money(e.item.price, p.currency, lang) }}</span>
            </div>
            <button v-if="isMix" class="btn btn--sm btn--icon toggle-add" :class="{ on: e.selected }" :aria-pressed="e.selected" @click="toggleExtra('transfers', e.item.id)">
              <Icon :name="e.selected ? 'check' : 'plus'" :size="16" :stroke="2.4" />
            </button>
          </div>
        </div>
      </section>

      <!-- 10. Investimento: detalhado item por item -->
      <section id="investimento" v-reveal class="block">
        <h2 class="block__title"><Icon name="wallet" /> {{ t.investment }}</h2>
        <div class="invest">
          <span class="invest__opt">{{ on(opt.name) }}</span>
          <ul class="lines">
            <li v-for="(l, i) in priceLines" :key="i">
              <span class="lines__txt"><strong>{{ l.label }}</strong><small v-if="l.detail">{{ l.detail }}</small></span>
              <span class="lines__val">{{ l.price === null ? '' : l.price === 0 ? t.included2 : money(l.price, p.currency, lang) }}</span>
            </li>
          </ul>
          <dl>
            <div v-if="opt.totals.discount || opt.totals.fees" class="sub"><dt>{{ t.subtotal }}</dt><dd>{{ money(opt.totals.subtotal, p.currency, lang) }}</dd></div>
            <div v-if="opt.totals.discount" class="disc"><dt>{{ t.discount }}</dt><dd>− {{ money(opt.totals.discount, p.currency, lang) }}</dd></div>
            <div v-if="opt.totals.fees"><dt>{{ feesLabel }}</dt><dd>+ {{ money(opt.totals.fees, p.currency, lang) }}</dd></div>
          </dl>
          <div class="invest__total">
            <small>{{ t.total }}</small>
            <strong>{{ money(opt.totals.total, p.currency, lang) }}</strong>
            <span v-if="travelers > 1">{{ money(opt.totals.total / travelers, p.currency, lang) }} {{ t.perPerson }}</span>
          </div>
          <div v-if="pay" class="pay">
            <small>{{ t.payTitle }}</small>
            <div v-if="pay.pix" class="pay__row pay__row--pix">
              <Icon name="sparkles" :size="18" />
              <span>{{ t.payPix(pay.pixDiscount) }}<strong>{{ money(pay.pix, p.currency, lang) }}</strong></span>
            </div>
            <div v-if="pay.n" class="pay__row">
              <Icon name="wallet" :size="18" />
              <span>{{ pay.interestFree ? t.payInstallments(pay.n, money(pay.installment, p.currency, lang), true) : t.payUpTo(pay.n) }}</span>
            </div>
            <p v-if="pay.note" class="pay__note pre">{{ pay.note }}</p>
          </div>
        </div>
      </section>

<!-- 11. Condições -->
      <section v-if="p.conditions" id="condicoes" v-reveal class="card cond">
        <details>
          <summary><Icon name="shield" /> {{ t.conditions }} <Icon name="chevron" :size="18" class="chev" /></summary>
          <p class="pre small muted">{{ p.conditions }}</p>
        </details>
      </section>

      <!-- 12. Validade -->
      <section v-reveal class="card valid" :class="{ expired }">
        <Icon name="hourglass" :size="26" />
        <div>
          <small>{{ t.validity }}</small>
          <strong>{{ t.validUntil }} {{ fmtLong(p.validUntil) }}</strong>
        </div>
        <span v-if="!expired && daysLeft !== null && daysLeft <= 30" class="valid__pill">{{ t.daysLeft(daysLeft) }}</span>
      </section>

      <!-- Selo de confiança -->
      <a v-if="p.agency.cadastur" v-reveal class="card trust" href="https://cadastur.turismo.gov.br/" target="_blank" rel="noopener">
        <img src="/img/cadastur.png" alt="Cadastur" width="120" height="19" loading="lazy" />
        <span>
          <strong>{{ t.cadasturTitle }}</strong>
          <small>{{ t.cadasturNo }} {{ p.agency.cadastur }} · {{ t.verify }} ↗</small>
        </span>
      </a>

      <!-- 13-14. Chamadas -->
      <section id="reservar" v-reveal class="cta">
        <button v-if="canReserve" class="btn btn--accent btn--lg btn--block" @click="sheet = 'confirm'">
          <Icon name="sparkles" :size="18" /> {{ t.reserve }}
        </button>
        <a class="btn btn--wa btn--lg btn--block" :href="waHelp" target="_blank" rel="noopener">
          <Icon name="whatsapp" :size="19" /> {{ t.talk }}
        </a>
      </section>

      <footer class="foot">
        <Logo variant="stack" :lang="lang" :height="120" />
        <a v-if="p.agency.instagram" class="foot__ig" :href="`https://www.instagram.com/${p.agency.instagram}`" target="_blank" rel="noopener">
          <Icon name="instagram" :size="18" /> @{{ p.agency.instagram }}
        </a>
        <small class="muted">{{ t.madeBy }} {{ p.agency.name }} · #{{ p.code }}</small>
      </footer>
    </main>

    <!-- Barra fixa inferior -->
    <div class="dock" :class="{ show: dockVisible }">
      <div class="dock__price">
        <small>{{ p.options.length > 1 ? on(opt.name) : t.total }}</small>
        <strong>{{ money(opt.totals.total, p.currency, lang) }}</strong>
        <small v-if="pay?.n && pay.interestFree" class="dock__inst">{{ t.payShort(pay.n, money(pay.installment, p.currency, lang)) }}</small>
      </div>
      <button v-if="canReserve" class="btn btn--accent" @click="sheet = 'confirm'">{{ t.reserve }}</button>
      <a v-else class="btn btn--wa" :href="waHelp" target="_blank" rel="noopener"><Icon name="whatsapp" :size="18" /> WhatsApp</a>
    </div>

    <!-- Confirmação -->
    <Transition name="sheet">
      <div v-if="sheet" class="sheet-bg" @click.self="sheet = null">
        <div class="sheet">
          <template v-if="sheet === 'confirm'">
            <h3>{{ t.confirmReserve(on(opt.name)) }}</h3>
            <p class="sheet__total">{{ money(opt.totals.total, p.currency, lang) }}</p>
            <p class="muted small"><Icon name="shield" :size="14" /> {{ t.noPayment }}</p>
            <button class="btn btn--accent btn--lg btn--block" :disabled="reserving" @click="reserve">{{ t.confirmBtn }}</button>
            <button class="btn btn--ghost btn--block" @click="sheet = null">{{ t.cancel }}</button>
          </template>
          <template v-else>
            <div class="sheet__ok"><Icon name="check" :size="30" :stroke="2.6" /></div>
            <h3>{{ t.reservedTitle }}</h3>
            <p class="muted">{{ t.reservedText }}</p>
            <a class="btn btn--wa btn--lg btn--block" :href="waReserve" target="_blank" rel="noopener"><Icon name="whatsapp" :size="19" /> {{ t.talk }}</a>
            <button class="btn btn--ghost btn--block" @click="sheet = null">OK</button>
          </template>
        </div>
      </div>
    </Transition>
  </div>

  <div v-else class="nf">
    <Logo :height="44" />
    <h1>{{ error ? 'Proposta não encontrada · Propuesta no encontrada' : '' }}</h1>
    <p v-if="error" class="muted">Verifique o link recebido · Verifica el enlace recibido</p>
  </div>
</template>

<script setup lang="ts">
import {
  MIX_ID, durationMinutes, fmtMinutes, layoverMinutes, legOf, mixBase, mixCatalog, mixDefault, mixTotals, money, nightsBetween,
  optionTotals, paymentValues, waUrl,
  type Flight, type Hotel, type Kind, type MixSelection, type Payment, type Proposal, type Tour, type Transfer
} from '~/utils/proposal'

type PublicOption = Pick<Proposal['options'][number], 'id' | 'name' | 'highlight' | 'flights' | 'hotels' | 'tours' | 'transfers' | 'fees' | 'packagePrice' | 'feesLabel'> & {
  totals: ReturnType<typeof optionTotals> & { parts: ReturnType<typeof optionTotals>['parts'] | null }
}
type PublicProposal = Pick<Proposal, 'code' | 'status' | 'validUntil' | 'currency' | 'destination' | 'intro' | 'itinerary' | 'conditions' | 'reservedOptionId' | 'showItemPrices'> & {
  reviewOpen: boolean
  allowMix: boolean
  reservedMix: MixSelection | null
  client: Pick<Proposal['client'], 'name' | 'lang' | 'travelers'>
  options: PublicOption[]
  kind: Kind
  payment: Payment | null
  agency: { name: string; whatsapp: string; instagram: string; cadastur: string }
}

const route = useRoute()
const code = String(route.params.code).toUpperCase()
const { data, error } = await useFetch<PublicProposal>(`/api/p/${code}`)
const p = computed(() => data.value)

const lang = computed(() => p.value?.client.lang || 'pt')
const { t: tRef, v, on } = useProposalText(lang)
const t = computed(() => tRef.value)

/* ---------- Opção selecionada (ou "Monte do seu jeito" = MIX) ---------- */
const MIX = -1
const initialIdx = () => {
  const opts = p.value?.options || []
  if (p.value?.reservedOptionId === MIX_ID && p.value.allowMix) return MIX
  const r = opts.findIndex((o) => o.id === p.value?.reservedOptionId)
  if (r >= 0) return r
  const h = opts.findIndex((o) => o.highlight)
  return h >= 0 ? h : 0
}
const cur = ref(initialIdx())
const isMix = computed(() => cur.value === MIX)

/* ---------- "Monte do seu jeito": o cliente combina itens de todas as opções ---------- */
const catalog = computed(() => mixCatalog(p.value?.options || []))
const mixSel = ref<MixSelection>(
  p.value?.reservedMix || (p.value ? mixDefault(p.value.options) : { flights: [], hotels: [], tours: [], transfers: [] })
)
const mixTotal = computed(() => mixTotals(p.value?.options || [], mixSel.value))

const pickFlight = (leg: string, id: string) => {
  const g = catalog.value.legs.find((x) => x.key === leg)
  const others = mixSel.value.flights.filter((fid) => !g?.items.some((e) => e.item.id === fid))
  mixSel.value = { ...mixSel.value, flights: [...others, id] }
}
const pickHotel = (gi: number, id: string) => {
  const g = catalog.value.hotels[gi]
  const others = mixSel.value.hotels.filter((hid) => !g?.items.some((e) => e.item.id === hid))
  mixSel.value = { ...mixSel.value, hotels: [...others, id] }
}
const toggleExtra = (kind: 'tours' | 'transfers', id: string) => {
  const list = mixSel.value[kind]
  mixSel.value = { ...mixSel.value, [kind]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] }
}

/** Opção exibida: uma pronta ou a combinação montada pelo cliente (mesmo formato). */
const opt = computed<PublicOption>(() => {
  if (!isMix.value) return p.value!.options[cur.value] || p.value!.options[0]
  const m = mixTotal.value
  return {
    id: MIX_ID, name: t.value.mixName, highlight: false, fees: m.fees, packagePrice: 0,
    flights: m.items.flights, hotels: m.items.hotels, tours: m.items.tours, transfers: m.items.transfers,
    totals: { ...m, parts: m.parts }
  }
})

const optionNames = (ids: string[]) =>
  ids.map((id) => p.value!.options.find((o) => o.id === id)?.name).filter(Boolean).map((n) => on(n!)).join(' / ')

interface Entry<T> { item: T; selected: boolean; badges: ('cheap' | 'fast')[]; from: string }
const fixed = <T>(items: T[]): Entry<T>[] => items.map((item) => ({ item, selected: false, badges: [], from: '' }))

/** Voos: no modo montagem, todas as alternativas agrupadas por trecho */
const flightGroups = computed<{ leg: string | null; entries: Entry<Flight>[] }[]>(() => {
  if (!isMix.value) return opt.value.flights.length ? [{ leg: null, entries: fixed(opt.value.flights) }] : []
  return catalog.value.legs.map((g) => {
    const minPrice = Math.min(...g.items.map((e) => Number(e.item.price) || Infinity))
    const minDur = Math.min(...g.items.map((e) => durationMinutes(e.item.duration)))
    const many = g.items.length > 1
    return {
      leg: g.key,
      entries: g.items.map((e) => ({
        item: e.item,
        selected: mixSel.value.flights.includes(e.item.id),
        badges: many
          ? ([Number(e.item.price) === minPrice && 'cheap', durationMinutes(e.item.duration) === minDur && minDur < Infinity && 'fast'].filter(Boolean) as ('cheap' | 'fast')[])
          : [],
        from: many ? optionNames(e.optionIds) : ''
      }))
    }
  })
})
const hotelGroups = computed<{ entries: Entry<Hotel>[] }[]>(() => {
  if (!isMix.value) return opt.value.hotels.length ? [{ entries: fixed(opt.value.hotels) }] : []
  return catalog.value.hotels.map((g) => ({
    entries: g.items.map((e) => ({ item: e.item, selected: mixSel.value.hotels.includes(e.item.id), badges: [], from: g.items.length > 1 ? optionNames(e.optionIds) : '' }))
  }))
})
// "Escolha sua hospedagem · 11 mar – 15 mar" (útil quando há mais de uma cidade)
const hotelSlotTitle = (g: { entries: Entry<Hotel>[] }) => {
  const h = g.entries[0]?.item
  const dates = h?.checkIn && h?.checkOut ? ` · ${fmtShort(h.checkIn)} – ${fmtShort(h.checkOut)}` : ''
  return t.value.chooseHotel + dates
}
const tourEntries = computed<Entry<Tour>[]>(() =>
  isMix.value
    ? catalog.value.tours.map((e) => ({ item: e.item, selected: mixSel.value.tours.includes(e.item.id), badges: [], from: '' }))
    : fixed(opt.value.tours)
)
const transferEntries = computed<Entry<Transfer>[]>(() =>
  isMix.value
    ? catalog.value.transfers.map((e) => ({ item: e.item, selected: mixSel.value.transfers.includes(e.item.id), badges: [], from: '' }))
    : fixed(opt.value.transfers)
)

/** A que se referem as taxas (definido na opção; na montagem, o da opção-base) */
const feesLabel = computed(() => {
  const label = isMix.value ? mixBase(p.value!.options)?.feesLabel : opt.value.feesLabel
  return label ? v(label) : t.value.fees
})

/** Detalhamento do investimento: uma linha por item, com o preço de cada um */
const priceLines = computed(() => {
  const o = opt.value
  const showPrice = p.value!.showItemPrices && !(o.packagePrice > 0)
  const price = (n: number) => (showPrice ? Number(n) || 0 : null)
  const out: { label: string; detail: string; price: number | null }[] = []
  o.flights.forEach((f, i) =>
    out.push({
      label: t.value.lineFlight(v(legOf(f, i, o.flights.length))),
      detail: [f.airline, [f.origin, f.destination].filter(Boolean).join(' → '), showPrice ? t.value.taxesIncluded : ''].filter(Boolean).join(' · '),
      price: price(f.price)
    })
  )
  o.hotels.forEach((h) => out.push({ label: t.value.lineHotel, detail: [h.name, h.nights ? `${h.nights} ${t.value.nights}` : ''].filter(Boolean).join(' · '), price: price(h.price) }))
  o.tours.forEach((x) => out.push({ label: t.value.lineTour, detail: x.name, price: price(x.price) }))
  o.transfers.forEach((x) => out.push({ label: t.value.lineTransfer, detail: `${v(x.origin)} → ${v(x.destination)}`, price: price(x.price) }))
  if (o.packagePrice > 0) out.push({ label: t.value.linePackage, detail: '', price: o.packagePrice })
  return out
})

/* ---------- Derivados ---------- */
// "Maria Souza" → "Maria"; casais/grupos ("Juliana e Rafael", "Ana y Luis") ficam completos
const firstName = computed(() => {
  const n = (p.value?.client.name || '').trim()
  return /\s(e|y|&)\s/i.test(n) ? n : n.split(/\s+/)[0]
})
const travelers = computed(() => p.value?.destination.travelers || p.value?.client.travelers || 0)
const period = computed(() => {
  const d = p.value?.destination
  if (!d) return ''
  if (d.period) return lang.value === 'es' ? d.period.replace(/dias/gi, 'días').replace(/noites/gi, 'noches') : d.period
  const n = nightsBetween(d.departDate, d.returnDate)
  return n ? `${n + 1} ${t.value.days} / ${n} ${t.value.nights}` : ''
})
const locale = computed(() => (lang.value === 'es' ? 'es-419' : 'pt-BR'))
const toDate = (d: string) => new Date(d + 'T12:00:00')
const fmtShort = (d: string) => (d ? toDate(d).toLocaleDateString(locale.value, { day: '2-digit', month: 'short' }).replace('.', '') : '')
const fmtLong = (d: string) => (d ? toDate(d).toLocaleDateString(locale.value, { weekday: 'short', day: '2-digit', month: 'long' }) : '')
const dayDate = (i: number) => {
  const dep = p.value?.destination.departDate
  if (!dep) return ''
  const d = toDate(dep)
  d.setDate(d.getDate() + i)
  return d.toLocaleDateString(locale.value, { weekday: 'short', day: '2-digit', month: 'short' }).replace(/\./g, '')
}
const lines = (s: string) => s.split('\n').map((l) => l.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean)

const daysLeft = computed(() => {
  if (!p.value?.validUntil) return null
  return Math.max(0, Math.ceil((toDate(p.value.validUntil).getTime() - Date.now()) / 86400000))
})
const expired = computed(() => p.value?.status === 'expirado')
const reserved = ref(false)
const alreadyReserved = computed(() => reserved.value || p.value?.status === 'reserva_solicitada' || p.value?.status === 'aceito')
const canReserve = computed(() => !expired.value && !alreadyReserved.value && p.value?.status !== 'recusado')
const banner = computed(() => {
  if (expired.value) return { kind: 'warn', text: t.value.expired }
  if (p.value?.status === 'aceito') return { kind: 'ok', text: t.value.accepted }
  if (alreadyReserved.value) return { kind: 'ok', text: t.value.alreadyReserved }
  return null
})

const agencyWa = computed(() => p.value?.agency.whatsapp || '5541992182256')
/* ---------- Passagens e pagamento ---------- */
const isAereo = computed(() => p.value?.kind === 'aereo')
const isRoundTrip = computed(() => !!p.value?.destination.returnDate || (opt.value?.flights.length || 0) > 1)
const payOf = (total: number) => paymentValues(total, p.value?.payment || undefined)
const pay = computed(() => (opt.value ? payOf(opt.value.totals.total) : null))

const waHelp = computed(() => waUrl(agencyWa.value, t.value.waHello(p.value?.client.name || '', code)))
// Na montagem, a mensagem já leva a combinação escolhida
const waReserve = computed(() => {
  const base = t.value.waReserve(p.value?.client.name || '', code, on(opt.value?.name || ''))
  if (!isMix.value) return waUrl(agencyWa.value, base)
  const detail = priceLines.value.map((l) => `• ${l.label}: ${l.detail}`).join('\n')
  return waUrl(agencyWa.value, `${base}\n\n${detail}\n${t.value.total}: ${money(opt.value.totals.total, p.value!.currency, lang.value)}`)
})

/* ---------- Itinerário ---------- */
const openDays = ref(new Set<number>([0]))
const toggleDay = (i: number) => {
  const s = new Set(openDays.value)
  s.has(i) ? s.delete(i) : s.add(i)
  openDays.value = s
}

/* ---------- Reserva ---------- */
const sheet = ref<null | 'confirm' | 'done'>(null)
const reserving = ref(false)
const reserve = async () => {
  reserving.value = true
  try {
    await $fetch(`/api/p/${code}/reserve`, {
      method: 'POST',
      body: isMix.value ? { optionId: MIX_ID, mix: mixSel.value } : { optionId: opt.value.id }
    })
    reserved.value = true
    sheet.value = 'done'
  } catch {
    window.open(waReserve.value, '_blank')
    sheet.value = null
  } finally {
    reserving.value = false
  }
}

/* ---------- Navegação, barra fixa e animações ---------- */
const navSections = computed(() => {
  if (!p.value) return []
  const o = opt.value
  return [
    p.value.options.length > 1 && { id: 'opcoes', label: t.value.navOptions },
    o.flights.length && { id: 'voos', label: t.value.flights },
    o.hotels.length && { id: 'hotel', label: t.value.hotel },
    p.value.itinerary.length && { id: 'roteiro', label: t.value.navItinerary },
    o.tours.length && { id: 'passeios', label: t.value.tours },
    o.transfers.length && { id: 'transfers', label: t.value.transfers },
    { id: 'investimento', label: t.value.investment }
  ].filter(Boolean) as { id: string; label: string }[]
})
const navVisible = ref(false)
const dockVisible = ref(false)
const activeSection = ref('')

const onScroll = () => {
  const y = window.scrollY
  navVisible.value = y > window.innerHeight * 0.6
  const cta = document.getElementById('reservar')
  const ctaVisible = cta ? cta.getBoundingClientRect().top < window.innerHeight : false
  dockVisible.value = y > window.innerHeight * 0.9 && !ctaVisible && !sheet.value
  let current = ''
  for (const s of navSections.value) {
    const el = document.getElementById(s.id)
    if (el && el.getBoundingClientRect().top < 140) current = s.id
  }
  if (current !== activeSection.value) {
    activeSection.value = current
    // Mantém o item ativo visível na barra de navegação
    nextTick(() => document.querySelector('.snav a.on')?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }))
  }
}

const vReveal = {
  mounted(el: HTMLElement) {
    if (!('IntersectionObserver' in window)) return
    el.classList.add('rv')
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('rv--in'); io.disconnect() }
    }, { threshold: 0.08 })
    io.observe(el)
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  if (p.value) $fetch(`/api/p/${code}/view`, { method: 'POST' }).catch(() => {})
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
watch(cur, () => nextTick(onScroll))

/* ---------- SEO / pré-visualização no WhatsApp ---------- */
const origin = useRequestURL().origin
const absImg = computed(() => {
  const img = p.value?.destination.image
  if (!img) return `${origin}/og.png`
  return img.startsWith('http') ? img : origin + img
})
useHead(() => ({
  title: p.value ? `${p.value.destination.city || t.value.subtitle} · Oasis Trip` : 'Oasis Trip',
  htmlAttrs: { lang: lang.value === 'es' ? 'es' : 'pt-BR' }
}))
useSeoMeta({
  ogTitle: () => (p.value ? `${isAereo.value ? t.value.subtitleAereo : t.value.subtitle}${p.value.destination.city ? ` · ${p.value.destination.city}` : ''} ✈️` : 'Oasis Trip'),
  ogDescription: () => (p.value ? `${t.value.hello}${firstName.value ? ', ' + firstName.value : ''}! ${p.value.intro.slice(0, 120)}` : ''),
  ogImage: () => absImg.value,
  ogType: 'website',
  twitterCard: 'summary_large_image'
})
</script>

<style scoped>
.pp { --wrap: 640px; background: var(--c-bg-soft); min-height: 100dvh; padding-bottom: 90px; }
.wrap { width: 100%; max-width: var(--wrap); margin: 0 auto; padding-inline: 16px; }
.pre { white-space: pre-line; }
.muted { color: var(--c-gray); }

/* Hero */
.hero {
  position: relative; min-height: 88svh; display: flex; flex-direction: column; justify-content: flex-end;
  background: linear-gradient(135deg, #0F3D57, #2E8BB0) center/cover no-repeat; color: #fff; overflow: hidden;
}
.hero__shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(10,44,64,.55) 0%, rgba(10,44,64,0) 30%, rgba(10,44,64,.25) 55%, rgba(10,44,64,.92) 100%); }
.hero__top { position: absolute; top: 0; left: 0; right: 0; padding: calc(16px + env(safe-area-inset-top)) 18px; }
.hero__content { position: relative; padding-bottom: 70px; animation: rise .9s cubic-bezier(.22,.61,.36,1) both; }
.hero__eyebrow {
  display: inline-block; font-family: var(--ff-head); font-weight: 600; font-size: .72rem; letter-spacing: 2.5px; text-transform: uppercase;
  color: var(--c-accent); margin-bottom: 10px;
}
.hero h1 { color: #fff; font-size: clamp(2.6rem, 12vw, 4.2rem); font-weight: 800; letter-spacing: -1px; line-height: 1; text-shadow: 0 4px 30px rgba(0,0,0,.25); }
.hero__country { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 16px; margin-top: 10px; font-size: 1.05rem; opacity: .92; }
.hero__loc { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.hero__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
.hero__chips span {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 13px; border-radius: 999px; font-size: .88rem; font-weight: 500;
  background: rgba(255,255,255,.16); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.22);
}
.hero__down { position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%); color: #fff; opacity: .8; animation: bob 2s ease-in-out infinite; }
@keyframes bob { 50% { transform: translate(-50%, 6px); } }
@keyframes rise { from { opacity: 0; transform: translateY(28px); } }

/* Navegação de seções */
.snav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 30; display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none;
  padding: calc(10px + env(safe-area-inset-top)) 12px 10px; background: rgba(255,255,255,.94); backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--c-line); transform: translateY(-110%); transition: transform .3s;
}
.snav.show { transform: none; }
.snav a {
  flex: none; padding: 7px 14px; border-radius: 999px; font-size: .85rem; font-weight: 600; color: var(--c-gray);
  font-family: var(--ff-head);
}
.snav a.on { background: var(--c-primary); color: #fff; }
@media (min-width: 700px) { .snav { justify-content: center; } }

/* minmax(0,1fr): nenhum conteúdo largo (ex.: tabela comparativa) pode alargar a página no celular */
.body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 26px; padding-top: 22px; }
.block { min-width: 0; grid-template-columns: minmax(0, 1fr); }
.card { background: #fff; border-radius: var(--radius); box-shadow: var(--shadow-sm); border: 1px solid var(--c-line); }
.block { display: grid; gap: 12px; scroll-margin-top: 70px; }
.block__title { display: flex; align-items: center; gap: 9px; font-size: 1.3rem; }
.block__title svg { color: var(--c-accent-600); }

.rvb {
  position: relative; z-index: 3; margin-top: -60px; display: grid; gap: 6px; text-align: center; padding: 22px 20px;
  background: #fff; border: 2px solid var(--c-accent); border-radius: var(--radius); box-shadow: var(--shadow-md); color: var(--c-gray);
}
.rvb__stars { color: #F4B400; font-size: 1.5rem; letter-spacing: 3px; }
.rvb strong { font-family: var(--ff-head); color: var(--c-primary); font-size: 1.3rem; }
.rvb .btn { margin-top: 8px; }
.rvb + .banner + .greet, .rvb + .greet { margin-top: 0; }
.banner { display: flex; gap: 10px; align-items: center; padding: 14px 16px; border-radius: 14px; font-weight: 500; font-size: .93rem; }
.banner--warn { background: #fff4e5; color: #8a4b12; border: 1px solid #f7c98f; }
.banner--ok { background: #e8f7ee; color: #16693a; border: 1px solid #a6e0bd; }

/* Saudação */
.greet { padding: 24px 22px; margin-top: -60px; position: relative; z-index: 2; scroll-margin-top: 80px; }
.greet h2 { font-size: 1.55rem; margin-bottom: 10px; }
.greet p { color: var(--c-gray); font-size: 1.02rem; line-height: 1.6; }
.greet__sign { margin-top: 14px !important; font-family: var(--ff-head); font-weight: 600; color: var(--c-primary) !important; font-size: .95rem !important; }

/* Resumo */
.facts { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.fact { background: #fff; border: 1px solid var(--c-line); border-radius: 16px; padding: 14px; display: grid; gap: 2px; box-shadow: var(--shadow-sm); }
.fact > svg { color: var(--c-primary-300); margin-bottom: 6px; }
.fact small { color: var(--c-gray); font-size: .75rem; text-transform: uppercase; letter-spacing: .5px; font-weight: 600; }
.fact strong { font-family: var(--ff-head); color: var(--c-primary); font-size: 1rem; }
.fact .inc { display: flex; gap: 8px; color: var(--c-primary); }

/* Opções */
.choices { display: grid; gap: 10px; }
.choice {
  position: relative; display: grid; gap: 2px; text-align: left; cursor: pointer; padding: 16px 52px 16px 18px;
  border-radius: 16px; border: 2px solid var(--c-line); background: #fff; transition: border-color .2s, box-shadow .2s;
}
.choice strong { font-family: var(--ff-head); color: var(--c-primary); font-size: 1.05rem; }
.choice__price { font-family: var(--ff-head); font-weight: 700; font-size: 1.2rem; color: var(--c-text); }
.choice small { color: var(--c-gray); }
.choice__tag {
  justify-self: start; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 4px;
  background: var(--c-accent); color: #2a1c0a; font-size: .7rem; font-weight: 700; padding: 3px 9px; border-radius: 999px; text-transform: uppercase; letter-spacing: .5px;
}
.choice__radio {
  position: absolute; right: 16px; top: 50%; transform: translateY(-50%); width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid var(--c-line); display: grid; place-items: center; color: #fff;
}
.choice.on { border-color: var(--c-primary); box-shadow: 0 8px 24px rgba(15,61,87,.12); }
.choice.on .choice__radio { background: var(--c-primary); border-color: var(--c-primary); }

/* Voos */
.flight { padding: 16px 18px; display: grid; gap: 14px; }
.flight__top { display: flex; justify-content: space-between; gap: 10px; font-size: .85rem; }
.flight__airline { font-weight: 700; color: var(--c-primary); text-transform: uppercase; letter-spacing: .5px; }
.flight__route { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 10px; }
.flight__route > div { display: grid; min-width: 0; }
.flight__route .r { text-align: right; }
.flight__route strong { font-family: var(--ff-head); font-size: 1.55rem; color: var(--c-primary); line-height: 1.1; }
.flight__route span { font-size: .85rem; color: var(--c-gray); overflow-wrap: anywhere; }
.flight__line { display: grid; justify-items: center; gap: 2px; min-width: 90px; }
.flight__line i {
  display: grid; place-items: center; width: 100%; color: var(--c-accent-600); position: relative;
  background: linear-gradient(90deg, var(--c-line) 50%, transparent 0) center/8px 2px repeat-x;
}
.flight__line i svg { background: #fff; padding: 0 4px; box-sizing: content-box; transform: rotate(45deg); }
.flight__line small { font-size: .72rem; color: var(--c-gray); white-space: nowrap; }
.flight__foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding-top: 12px; border-top: 1px dashed var(--c-line); font-size: .87rem; color: var(--c-gray); }
.flight__foot span { display: inline-flex; align-items: center; gap: 6px; }
.price { font-weight: 700; color: var(--c-primary); white-space: nowrap; }
.price-line { font-family: var(--ff-head); font-weight: 700; color: var(--c-primary); margin-top: 10px !important; }

/* Hotel */
.hotel { overflow: hidden; }
.hotel__img { position: relative; aspect-ratio: 16/10; background: center/cover; }
.hotel__nights {
  position: absolute; left: 14px; bottom: 14px; background: rgba(15,61,87,.85); color: #fff; backdrop-filter: blur(6px);
  padding: 6px 12px; border-radius: 999px; font-size: .82rem; font-weight: 600;
}
.hotel__body { padding: 16px 18px 18px; display: grid; gap: 8px; }
.hotel__body h3 { font-size: 1.2rem; }
.hotel__body p svg { display: inline; vertical-align: -2px; }
.kv { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px; }
.kv div { background: var(--c-bg-soft); border-radius: 12px; padding: 10px 12px; display: grid; }
.kv small { font-size: .72rem; text-transform: uppercase; letter-spacing: .5px; color: var(--c-gray); font-weight: 600; }
.kv strong { font-size: .93rem; color: var(--c-text); }

/* Itinerário */
.timeline { list-style: none; margin: 0; padding: 0; position: relative; display: grid; gap: 8px; }
.timeline::before { content: ''; position: absolute; left: 21px; top: 20px; bottom: 20px; width: 2px; background: var(--c-line); }
.timeline li { position: relative; background: #fff; border: 1px solid var(--c-line); border-radius: 16px; box-shadow: var(--shadow-sm); }
.timeline__head { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 14px 12px 8px; background: none; border: 0; text-align: left; cursor: pointer; }
.timeline__dot {
  flex: none; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; margin-left: 0;
  background: var(--c-primary); color: #fff; font-weight: 700; font-size: .8rem; font-family: var(--ff-head);
}
.timeline__title { flex: 1; display: grid; }
.timeline__title small { color: var(--c-accent-600); font-weight: 600; font-size: .75rem; text-transform: uppercase; letter-spacing: .5px; }
.timeline__title strong { font-family: var(--ff-head); color: var(--c-primary); }
.timeline .chev { color: var(--c-gray-300); transition: transform .2s; }
.timeline li.open .chev { transform: rotate(180deg); }
.timeline__desc { padding: 0 16px 16px 48px; color: var(--c-gray); font-size: .94rem; }

/* Passeios */
.tour { overflow: hidden; }
.tour__img { aspect-ratio: 16/9; background: center/cover; }
.tour__body { padding: 16px 18px 18px; display: grid; gap: 8px; }
.tour__body h3 { font-size: 1.12rem; }
.meta { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: .84rem; color: var(--c-gray); }
.meta span { display: inline-flex; align-items: center; gap: 5px; }
.incl { display: grid; gap: 14px; padding-top: 4px; }
.incl strong { font-size: .85rem; color: var(--c-primary); }
.incl ul { list-style: none; padding: 0; margin: 6px 0 0; display: grid; gap: 6px; font-size: .9rem; }
.incl li { display: flex; gap: 8px; align-items: flex-start; }
.incl svg { flex: none; margin-top: 3px; }
.incl .ok { color: var(--c-ok); }
.incl .no { color: var(--c-danger); }

/* Transfers */
.transfers { padding: 6px 16px; }
.transfer { display: flex; gap: 12px; align-items: center; padding: 12px 0; }
.transfer + .transfer { border-top: 1px dashed var(--c-line); }
.transfer > div { flex: 1; display: grid; min-width: 0; }
.transfer strong { font-size: .95rem; }
.transfer__ico { flex: none; width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; background: rgba(15,61,87,.07); color: var(--c-primary); }

/* Investimento */
.invest {
  background: linear-gradient(160deg, #0F3D57, #0a2c40); color: #dfeaf0; border-radius: 22px; padding: 22px;
  box-shadow: var(--shadow-md); display: grid; gap: 14px; position: relative; overflow: hidden;
}
.invest::after { content: ''; position: absolute; right: -60px; top: -60px; width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle, rgba(244,162,97,.35), transparent 70%); }
.invest__opt { font-family: var(--ff-head); font-weight: 600; color: var(--c-accent); font-size: .85rem; text-transform: uppercase; letter-spacing: 1.5px; }
.invest dl { margin: 0; display: grid; gap: 8px; }
.invest dl div { display: flex; justify-content: space-between; gap: 10px; font-size: .95rem; }
.invest dd { margin: 0; color: #fff; font-weight: 500; white-space: nowrap; }
.invest dt { min-width: 0; }
.invest .sub { border-top: 1px solid rgba(255,255,255,.15); padding-top: 8px; }
.invest .disc dd { color: #7ee2a8; }
.invest__total { display: grid; border-top: 1px solid rgba(255,255,255,.15); padding-top: 14px; }
.invest__total small { text-transform: uppercase; letter-spacing: 1px; font-size: .75rem; opacity: .75; }
.invest__total strong { font-family: var(--ff-head); color: #fff; font-size: clamp(2rem, 9vw, 2.6rem); line-height: 1.1; }
.invest__total span { color: var(--c-accent); font-weight: 500; }

/* Monte do seu jeito */
.choice--mix { border-style: dashed; border-color: var(--c-accent); background: linear-gradient(135deg, #fff8f0, #fff); }
.choice--mix.on { border-style: solid; border-color: var(--c-accent-600); box-shadow: 0 8px 24px rgba(244,162,97,.25); }
.choice--mix.on .choice__radio { background: var(--c-accent-600); border-color: var(--c-accent-600); }
.choice__tag--mix { background: var(--c-primary); color: #fff; }
.choice__desc { color: var(--c-gray); margin-bottom: 4px; }
.mix-hint { display: flex; gap: 8px; align-items: flex-start; background: #fff4ea; color: #8a4b12; border-radius: 12px; padding: 10px 12px; font-size: .9rem; }
.mix-hint svg { flex: none; margin-top: 2px; }
.pick-title { font-size: 1rem; color: var(--c-primary); margin: 6px 0 -2px; }
.pick-sub { color: var(--c-gray); font-size: .9rem; margin-top: -4px; }
.pick { position: relative; cursor: pointer; border-width: 2px; transition: border-color .15s, box-shadow .15s, opacity .15s; }
.pick:not(.on) { opacity: .78; }
.pick.on { border-color: var(--c-primary); box-shadow: 0 8px 24px rgba(15,61,87,.14); opacity: 1; }
.tour.pick { cursor: default; }
.pick__radio {
  position: absolute; top: 14px; right: 14px; width: 24px; height: 24px; border-radius: 50%;
  border: 2px solid var(--c-line); background: #fff; display: grid; place-items: center; color: #fff;
}
.pick.on .pick__radio { background: var(--c-primary); border-color: var(--c-primary); }
.flight.pick .flight__top { padding-right: 34px; }
.hotel.pick .pick__radio { top: 12px; right: 12px; }
.badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: -6px; }
.badge { font-size: .72rem; font-weight: 700; padding: 3px 9px; border-radius: 999px; }
.badge--cheap { background: #e8f7ee; color: #16693a; }
.badge--fast { background: #e8f1f6; color: var(--c-primary); }
.badge--from { background: var(--c-bg-soft); color: var(--c-gray); font-weight: 600; }
.hotel__body .badges { margin: 0 0 4px; }
.pick-row { display: grid; gap: 12px; }
.tour__foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.toggle-add { border-color: var(--c-primary-300); color: var(--c-primary); }
.toggle-add.on { background: var(--c-ok); border-color: var(--c-ok); color: #fff; }
.transfer.off { opacity: .55; }
.transfer .price { display: block; margin-top: 2px; }

/* Detalhamento do investimento */
.lines { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.lines li { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
.lines__txt { display: grid; min-width: 0; }
.lines__txt strong { color: #fff; font-weight: 600; font-size: .95rem; }
.lines__txt small { color: #9fb6c3; font-size: .8rem; overflow-wrap: anywhere; }
.lines__val { color: #fff; font-weight: 600; white-space: nowrap; font-size: .95rem; }

.flight__foot .price { display: grid; justify-items: end; flex: none; }
.tax-inc { font-size: .7rem; font-weight: 500; color: var(--c-gray); }

/* Conexões no card do voo */
.flight__conn { display: flex; gap: 6px; align-items: flex-start; margin: -4px 0 0; font-size: .82rem; color: #8a4b12; background: #fff7ef; border-radius: 10px; padding: 7px 10px; }
.flight__conn svg { flex: none; margin-top: 2px; }

/* Pagamento */
.pay { display: grid; gap: 8px; border-top: 1px solid rgba(255,255,255,.15); padding-top: 14px; position: relative; z-index: 1; }
.pay > small { text-transform: uppercase; letter-spacing: 1px; font-size: .72rem; opacity: .75; }
.pay__row { display: flex; gap: 10px; align-items: flex-start; background: rgba(255,255,255,.07); border-radius: 12px; padding: 10px 12px; font-size: .92rem; }
.pay__row svg { flex: none; margin-top: 2px; color: var(--c-accent); }
.pay__row strong { display: block; color: #fff; font-family: var(--ff-head); font-size: 1.15rem; }
.pay__row--pix { background: rgba(126,226,168,.12); }
.pay__row--pix svg { color: #7ee2a8; }
.pay__note { font-size: .85rem; opacity: .85; }
.choice__inst { color: var(--c-ok) !important; font-weight: 600; }
.dock__inst { color: var(--c-ok) !important; font-weight: 600; }
.flight__airline { display: grid; }
.flight__airline em { font-style: normal; font-weight: 500; font-size: .78rem; color: var(--c-gray); text-transform: none; letter-spacing: 0; }

/* Selo Cadastur */
.trust { display: flex; align-items: center; gap: 14px; padding: 14px 18px; color: var(--c-text); }
.trust img { width: 96px; height: auto; flex: none; }
.trust span { display: grid; gap: 1px; min-width: 0; }
.trust strong { font-size: .88rem; color: var(--c-primary); line-height: 1.3; }
.trust small { font-size: .78rem; color: var(--c-gray); }

/* Condições */
.cond details { padding: 4px 18px; }
.cond summary { display: flex; align-items: center; gap: 10px; padding: 14px 0; cursor: pointer; list-style: none; font-family: var(--ff-head); font-weight: 600; color: var(--c-primary); }
.cond summary::-webkit-details-marker { display: none; }
.cond summary .chev { margin-left: auto; color: var(--c-gray-300); transition: transform .2s; }
.cond details[open] summary .chev { transform: rotate(180deg); }
.cond details p { padding-bottom: 16px; }

/* Validade */
.valid { display: flex; align-items: center; gap: 14px; padding: 16px 18px; color: var(--c-primary); }
.valid > div { flex: 1; display: grid; }
.valid small { color: var(--c-gray); font-size: .78rem; text-transform: uppercase; letter-spacing: .5px; font-weight: 600; }
.valid strong { font-family: var(--ff-head); font-size: 1rem; }
.valid__pill { background: #fff4e5; color: #b45309; font-weight: 700; font-size: .78rem; padding: 6px 10px; border-radius: 999px; white-space: nowrap; }
.valid.expired { opacity: .7; }

.cta { display: grid; gap: 10px; }
.cta .btn { padding: 18px; font-size: 1.05rem; }

.foot { display: grid; justify-items: center; gap: 10px; padding: 24px 0 10px; text-align: center; }
.foot__ig {
  display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: 999px; font-weight: 600; font-size: .92rem;
  color: #fff; background: linear-gradient(45deg, #f58529, #dd2a7b 50%, #8134af);
}

/* Barra fixa */
.dock {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; display: flex; align-items: center; gap: 12px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); background: rgba(255,255,255,.96); backdrop-filter: blur(12px);
  border-top: 1px solid var(--c-line); box-shadow: 0 -8px 30px rgba(15,61,87,.1);
  transform: translateY(110%); transition: transform .3s;
}
.dock.show { transform: none; }
.dock__price { flex: 1; display: grid; min-width: 0; }
.dock__price small { color: var(--c-gray); font-size: .75rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dock__price strong { font-family: var(--ff-head); color: var(--c-primary); font-size: 1.2rem; }
@media (min-width: 700px) { .dock { justify-content: center; } .dock__price { flex: 0 1 auto; margin-right: 24px; } }

/* Folha de confirmação */
.sheet-bg { position: fixed; inset: 0; z-index: 60; background: rgba(10,30,45,.5); display: flex; align-items: flex-end; justify-content: center; }
.sheet {
  width: 100%; max-width: 520px; background: #fff; border-radius: 24px 24px 0 0; padding: 26px 20px calc(20px + env(safe-area-inset-bottom));
  display: grid; gap: 12px; text-align: center;
}
.sheet h3 { font-size: 1.25rem; }
.sheet__total { font-family: var(--ff-head); font-size: 2rem; font-weight: 700; color: var(--c-primary); }
.sheet p svg { display: inline; vertical-align: -2px; }
.sheet__ok { justify-self: center; width: 64px; height: 64px; border-radius: 50%; background: #e8f7ee; color: var(--c-ok); display: grid; place-items: center; animation: pop .4s cubic-bezier(.3,1.6,.6,1); }
@keyframes pop { from { transform: scale(.4); } }
.sheet-enter-active, .sheet-leave-active { transition: opacity .25s; }
.sheet-enter-active .sheet, .sheet-leave-active .sheet { transition: transform .3s cubic-bezier(.22,.61,.36,1); }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .sheet, .sheet-leave-to .sheet { transform: translateY(100%); }

/* Animação de entrada */
.rv { opacity: 0; transform: translateY(26px); transition: opacity .6s ease, transform .6s cubic-bezier(.22,.61,.36,1); }
.rv--in { opacity: 1; transform: none; }
.greet.rv { transform: translateY(26px); }

.nf { min-height: 100dvh; display: grid; place-content: center; justify-items: center; gap: 14px; text-align: center; padding: 20px; }
.nf h1 { font-size: 1.2rem; }

@media (min-width: 700px) {
  .hero { min-height: 72vh; }
  .facts { grid-template-columns: repeat(4, 1fr); }
  .choices { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
}
</style>
