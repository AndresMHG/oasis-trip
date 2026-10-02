// Modelo de dados e regras de negócio compartilhados entre o app e o servidor.

export type Lang = 'pt' | 'es'
export type Currency = 'BRL' | 'USD' | 'EUR' | 'COP'

export type Status =
  | 'rascunho'
  | 'enviado'
  | 'visualizado'
  | 'aguardando'
  | 'reserva_solicitada'
  | 'aceito'
  | 'recusado'
  | 'expirado'

export const STATUS: Record<Status, { label: string; color: string }> = {
  rascunho: { label: 'Rascunho', color: '#8a8a8a' },
  enviado: { label: 'Enviado', color: '#2E8BB0' },
  visualizado: { label: 'Visualizado', color: '#7b61ff' },
  aguardando: { label: 'Aguardando resposta', color: '#e0a100' },
  reserva_solicitada: { label: 'Reserva solicitada', color: '#F4A261' },
  aceito: { label: 'Aceito', color: '#1f9d55' },
  recusado: { label: 'Recusado', color: '#d64545' },
  expirado: { label: 'Expirado', color: '#5b5b5b' }
}

export interface Flight {
  id: string
  airline: string
  origin: string
  destination: string
  date: string
  departTime: string
  arriveTime: string
  duration: string
  stops: string
  baggage: string
  /** Tarifa / classe (Econômica, Light, Plus, Executiva…) */
  fareClass?: string
  /** Trecho ao qual o voo pertence (Ida, Volta…) — vazio = automático pela posição */
  leg?: string
  /** Tarifa deste voo: o que inclui e regras de remarcação/cancelamento */
  fare?: Fare
  /** Conexões/escalas com horários de chegada e saída */
  connections?: Connection[]
}

export interface Connection {
  id: string
  airport: string
  arrive: string // HH:MM
  depart: string // HH:MM
  notes: string
  price: number
}

export interface Hotel {
  id: string
  name: string
  image: string
  address: string
  checkIn: string
  checkOut: string
  nights: number
  roomType: string
  board: string
  notes: string
  price: number
}

export interface Tour {
  id: string
  name: string
  image: string
  description: string
  date: string
  duration: string
  location: string
  included: string
  notIncluded: string
  price: number
}

export interface Transfer {
  id: string
  origin: string
  destination: string
  date: string
  time: string
  vehicle: string
  passengers: number
  notes: string
  price: number
}

export interface ItineraryDay {
  id: string
  title: string
  description: string
}

/* ---------- Tarifa aérea: o que inclui e regras ---------- */
export const FARE_FEATURES = ['personal', 'carryon', 'checked', 'seat', 'meal', 'miles', 'priority'] as const
export type FareFeature = (typeof FARE_FEATURES)[number]
export const FARE_FEATURE_LABELS: Record<FareFeature, string> = {
  personal: 'Artigo pessoal (bolsa/mochila)',
  carryon: 'Mala de mão (até 10kg)',
  checked: 'Mala despachada (23kg)',
  seat: 'Marcação de assento',
  meal: 'Refeição a bordo',
  miles: 'Acúmulo de milhas',
  priority: 'Embarque prioritário'
}

export type ChangeRule = '' | 'free' | 'fee' | 'no'
export type CancelRule = '' | 'full' | 'fee' | 'credit' | 'no'
export const CHANGE_RULES: Record<Exclude<ChangeRule, ''>, string> = {
  free: 'Permitida sem taxa',
  fee: 'Permitida com taxa',
  no: 'Não permitida'
}
export const CANCEL_RULES: Record<Exclude<CancelRule, ''>, string> = {
  full: 'Reembolso total',
  fee: 'Reembolso com multa',
  credit: 'Crédito para nova viagem',
  no: 'Não reembolsável'
}

/** Cor de cada regra: verde = favorável ao cliente, âmbar = com custo, vermelho = restritiva */
export const FARE_TONE = {
  change: { free: 'good', fee: 'mid', no: 'bad' } as Record<string, string>,
  cancel: { full: 'good', fee: 'mid', credit: 'mid', no: 'bad' } as Record<string, string>
}

export interface Fare {
  name: string
  features: Partial<Record<FareFeature, boolean>>
  change: ChangeRule
  changeFee: number
  cancel: CancelRule
  cancelFee: number
  notes: string
}

export const newFare = (): Fare => ({ name: '', features: {}, change: '', changeFee: 0, cancel: '', cancelFee: 0, notes: '' })

/** Pontos de partida rápidos — cada companhia tem suas regras, ajuste depois. */
export const FARE_PRESETS: Record<'basica' | 'standard' | 'flex', { label: string; fare: Fare }> = {
  basica: {
    label: 'Básica / Light',
    fare: { name: 'Econômica Light', features: { personal: true, carryon: true }, change: 'fee', changeFee: 0, cancel: 'no', cancelFee: 0, notes: '' }
  },
  standard: {
    label: 'Standard',
    fare: { name: 'Econômica Standard', features: { personal: true, carryon: true, checked: true, seat: true, miles: true }, change: 'fee', changeFee: 0, cancel: 'fee', cancelFee: 0, notes: '' }
  },
  flex: {
    label: 'Flexível / Plus',
    fare: { name: 'Econômica Plus', features: { personal: true, carryon: true, checked: true, seat: true, meal: true, miles: true, priority: true }, change: 'free', changeFee: 0, cancel: 'full', cancelFee: 0, notes: '' }
  }
}

/** Propostas antigas tinham a tarifa na opção: passa para cada voo que ainda não tem a sua. */
export const migrateOptionFare = <T extends { fare?: Fare; flights: Flight[] }>(o: T): T => {
  if (!o.fare) return o
  const fare = o.fare
  const flights = o.flights.map((f) => (f.fare ? f : { ...f, fare: structuredClone(fare) }))
  const { fare: _old, ...rest } = o
  return { ...(rest as T), flights }
}

export const fareHasInfo = (f?: Fare | null) =>
  !!f && (!!f.name || Object.values(f.features || {}).some(Boolean) || !!f.change || !!f.cancel || !!f.notes)

export interface Option {
  id: string
  name: string
  highlight: boolean
  /** @deprecated a tarifa agora fica em cada voo (Flight.fare); mantido para propostas antigas */
  fare?: Fare
  /** A que se referem as taxas (ex.: "Taxas de embarque e aeroportuárias") */
  feesLabel?: string
  flights: Flight[]
  hotels: Hotel[]
  tours: Tour[]
  transfers: Transfer[]
  discount: number
  fees: number
  /** Quando > 0, substitui a soma dos itens (preço fechado de pacote). */
  packagePrice: number
}

export interface Review {
  rating: number // 1 a 5
  highlights: string[] // chaves de REVIEW_TAGS
  comment: string
  allowPublish: boolean
  at: string
}

// O que o cliente mais gostou (chips na página de avaliação)
export const REVIEW_TAGS = ['atendimento', 'hotel', 'passeios', 'voos', 'roteiro', 'preco', 'transfers'] as const

export interface Activity {
  type: 'criado' | 'enviado' | 'visualizado' | 'reserva' | 'status' | 'avaliacao' | 'pedido_avaliacao'
  at: string
  detail?: string
}

/** Condições de pagamento exibidas no Investimento */
export interface Payment {
  enabled: boolean
  /** % de desconto para pagamento à vista no PIX (0 = não mostrar) */
  pixDiscount: number
  /** Nº de parcelas no cartão (0 ou 1 = não mostrar) */
  installments: number
  interestFree: boolean
  note: string
}

/** pacote = viagem completa · aereo = cotação só de passagens */
export type Kind = 'pacote' | 'aereo'

export interface Proposal {
  code: string
  kind?: Kind
  payment?: Payment
  createdAt: string
  updatedAt: string
  status: Status
  validUntil: string
  currency: Currency
  showItemPrices: boolean
  client: {
    name: string
    whatsapp: string
    email: string
    lang: Lang
    travelers: number
  }
  destination: {
    /** Cidade de saída (opcional) — preenche os voos e aparece na capa */
    origin?: string
    city: string
    country: string
    period: string
    departDate: string
    returnDate: string
    travelers: number
    image: string
  }
  intro: string
  options: Option[]
  itinerary: ItineraryDay[]
  conditions: string
  views: number
  firstViewedAt?: string
  lastViewedAt?: string
  reservedAt?: string
  reservedOptionId?: string
  /** Cliente pode montar a própria combinação com itens de todas as opções */
  allowMix?: boolean
  /** Itens escolhidos quando o cliente reservou a combinação "Monte do seu jeito" */
  reservedMix?: MixSelection
  review?: Review
  /** Guia da viagem: liberado depois da confirmação, protegido por PIN */
  trip?: TripGuide
  activity: Activity[]
}

/* ---------- Guia da viagem (pós-confirmação) ---------- */
export type TripDocKind = 'passagem' | 'embarque' | 'voucher' | 'seguro' | 'outro'
export const TRIP_DOC_KINDS: Record<TripDocKind, { pt: string; es: string; icon: string }> = {
  passagem: { pt: 'Passagem / e-ticket', es: 'Pasaje / e-ticket', icon: 'plane' },
  embarque: { pt: 'Cartão de embarque (QR)', es: 'Tarjeta de embarque (QR)', icon: 'plane' },
  voucher: { pt: 'Voucher (hotel, passeio, transfer)', es: 'Voucher (hotel, paseo, traslado)', icon: 'file' },
  seguro: { pt: 'Seguro viagem', es: 'Seguro de viaje', icon: 'shield' },
  outro: { pt: 'Outro documento', es: 'Otro documento', icon: 'file' }
}
export interface TripDoc {
  id: string
  kind: TripDocKind
  title: string
  /** Localizador / código da reserva (PNR) */
  pnr: string
  /** Arquivo guardado no banco (PDF ou imagem) */
  fileId: string
  fileName: string
  mime: string
}
export interface TripGuide {
  enabled: boolean
  /** Código de 4 dígitos que o cliente digita para abrir o guia */
  pin: string
  docs: TripDoc[]
  /** Um item por linha */
  checklist: string
  insurance: string
  contacts: string
  notes: string
}
const TRIP_CHECKLIST: Record<Lang, string> = {
  pt: 'Documento de identidade ou passaporte válido (confira a validade)\nCheck-in online (abre 24 a 48 h antes do voo)\nChegar ao aeroporto 3 h antes em voos internacionais (2 h nos nacionais)\nSeguro viagem impresso ou no celular\nVacinas e documentos exigidos pelo destino\nCartão internacional / dinheiro local\nCarregador e adaptador de tomada',
  es: 'Documento de identidad o pasaporte vigente (revisa la fecha de vencimiento)\nCheck-in online (abre 24 a 48 h antes del vuelo)\nLlegar al aeropuerto 3 h antes en vuelos internacionales (2 h en nacionales)\nSeguro de viaje impreso o en el celular\nVacunas y documentos exigidos por el destino\nTarjeta internacional / dinero local\nCargador y adaptador de enchufe'
}
export const newTripPin = () => String(Math.floor(1000 + Math.random() * 9000))
export const newTripGuide = (lang: Lang = 'pt'): TripGuide => ({
  enabled: false, pin: newTripPin(), docs: [], checklist: TRIP_CHECKLIST[lang], insurance: '', contacts: '', notes: ''
})

export interface Settings {
  agentName: string
  whatsapp: string
  instagram: string
  /** Link "Escreva uma avaliação" do Perfil da Empresa no Google (opcional) */
  googleReviewUrl: string
  validityDays: number
  currency: Currency
  conditions: Record<Lang, string>
  intro: Record<Lang, string>
  /** Pagamento padrão para novas propostas */
  payment: Payment
  /** Registro no Cadastur (Ministério do Turismo) — selo de confiança nas propostas */
  cadastur: string
  cadasturValidUntil: string
}

export const DEFAULT_SETTINGS: Settings = {
  agentName: 'Equipe Oasis Trip',
  whatsapp: '5541992182256',
  instagram: 'oasistrip.turismo',
  googleReviewUrl: '',
  validityDays: 7,
  currency: 'BRL',
  conditions: {
    pt: '• Valores sujeitos à disponibilidade no momento da reserva.\n• Tarifas aéreas podem sofrer alteração até a emissão.\n• Reserva confirmada mediante pagamento do sinal.\n• Documentação de viagem (passaporte, vistos e vacinas) é responsabilidade do passageiro.\n• Recomendamos a contratação de seguro viagem.',
    es: '• Valores sujetos a disponibilidad al momento de la reserva.\n• Las tarifas aéreas pueden cambiar hasta la emisión.\n• Reserva confirmada mediante el pago de la seña.\n• La documentación de viaje (pasaporte, visas y vacunas) es responsabilidad del pasajero.\n• Recomendamos contratar un seguro de viaje.'
  },
  intro: {
    pt: 'Preparamos esta proposta com muito carinho, pensando em cada detalhe da sua viagem. Confira abaixo tudo o que está incluído.',
    es: 'Preparamos esta propuesta con mucho cariño, pensando en cada detalle de tu viaje. Mira abajo todo lo que está incluido.'
  },
  payment: { enabled: true, pixDiscount: 5, installments: 10, interestFree: true, note: '' },
  cadastur: '64.181.038/0001-90',
  cadasturValidUntil: '2028-01-06'
}

/** Valores de pagamento calculados para um total */
export const paymentValues = (total: number, pay?: Payment) => {
  if (!pay?.enabled || !total) return null
  const pix = pay.pixDiscount > 0 ? total * (1 - pay.pixDiscount / 100) : 0
  const n = Math.floor(pay.installments || 0)
  return { pix, pixDiscount: pay.pixDiscount, n: n > 1 ? n : 0, installment: n > 1 ? total / n : 0, interestFree: pay.interestFree, note: pay.note }
}

export const uid = () => Math.random().toString(36).slice(2, 10)

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export const newCode = (len = 8) => {
  let out = ''
  const bytes = new Uint8Array(len)
  globalThis.crypto.getRandomValues(bytes)
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length]
  return out
}

export const newFlight = (): Flight => ({
  id: uid(), airline: '', origin: '', destination: '', date: '', departTime: '', arriveTime: '',
  duration: '', stops: 'Direto', baggage: '', fareClass: '', notes: '', price: 0
})
export const newHotel = (): Hotel => ({
  id: uid(), name: '', image: '', address: '', checkIn: '', checkOut: '', nights: 0,
  roomType: '', board: 'Café da manhã', notes: '', price: 0
})
export const newTour = (): Tour => ({
  id: uid(), name: '', image: '', description: '', date: '', duration: '', location: '',
  included: '', notIncluded: '', price: 0
})
export const newTransfer = (): Transfer => ({
  id: uid(), origin: '', destination: '', date: '', time: '', vehicle: 'Privativo', passengers: 0,
  notes: '', price: 0
})
export const newDay = (title = ''): ItineraryDay => ({ id: uid(), title, description: '' })

// Sugestões rápidas para os campos (texto livre continua permitido)
export const AIRLINES = ['LATAM', 'GOL', 'Azul', 'Avianca', 'Copa Airlines', 'Wingo', 'Laser Airlines', 'Conviasa', 'Estelar', 'Aerolíneas Argentinas', 'American Airlines', 'United', 'Delta', 'TAP Air Portugal', 'Iberia', 'Air Europa', 'JetSMART', 'Sky Airline']
export const STOPS = ['Direto', '1 escala', '2 escalas', '1 conexão', '2 conexões']
export const BAGGAGE = ['Artigo pessoal', 'Mala de mão 10kg', '1 mala despachada 23kg', '2 malas despachadas 23kg', 'Mala de mão + 1 despachada 23kg']
export const FARES = ['Econômica', 'Econômica Light', 'Econômica Standard', 'Econômica Plus', 'Premium Economy', 'Executiva']
export const BOARDS = ['Sem refeição', 'Café da manhã', 'Meia pensão', 'Pensão completa', 'All inclusive']
export const VEHICLES = ['Privativo', 'Compartilhado', 'Van privativa', 'Carro executivo', 'Ônibus']
export const newOption = (name = 'Opção Essencial'): Option => ({
  id: uid(), name, highlight: false, flights: [], hotels: [], tours: [], transfers: [],
  discount: 0, fees: 0, packagePrice: 0
})

export const addDays = (iso: string, days: number) => {
  const d = iso ? new Date(iso + 'T12:00:00') : new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
export const today = () => new Date().toISOString().slice(0, 10)

export const nightsBetween = (a: string, b: string) => {
  if (!a || !b) return 0
  const diff = (new Date(b + 'T12:00:00').getTime() - new Date(a + 'T12:00:00').getTime()) / 86400000
  return diff > 0 ? Math.round(diff) : 0
}

export const newProposal = (s: Settings = DEFAULT_SETTINGS, lang: Lang = 'pt'): Proposal => {
  const now = new Date().toISOString()
  const opt = newOption(lang === 'es' ? 'Opción Esencial' : 'Opção Essencial')
  return {
    code: newCode(),
    kind: 'pacote',
    allowMix: true,
    payment: { ...s.payment },
    createdAt: now,
    updatedAt: now,
    status: 'rascunho',
    validUntil: addDays(today(), s.validityDays),
    currency: s.currency,
    showItemPrices: true,
    client: { name: '', whatsapp: '', email: '', lang, travelers: 2 },
    destination: { city: '', country: '', period: '', departDate: '', returnDate: '', travelers: 2, image: '' },
    intro: s.intro[lang],
    options: [opt],
    itinerary: [],
    conditions: s.conditions[lang],
    views: 0,
    activity: [{ type: 'criado', at: now }]
  }
}

const sum = (items: { price: number }[]) => items.reduce((t, i) => t + (Number(i.price) || 0), 0)

/* ---------- Trechos de voo ---------- */
export const LEGS = ['Ida', 'Volta', 'Trecho 3', 'Trecho 4']

/** Nome do trecho de um voo dentro da opção (campo "Trecho" ou pela posição). */
export const legOf = (f: Flight, i: number, count: number) =>
  f.leg || (count === 1 ? 'Ida' : count === 2 ? (i === 0 ? 'Ida' : 'Volta') : `Trecho ${i + 1}`)

/** O voo chega num dia seguinte? (algum horário "volta" ao passar da meia-noite) */
export const flightNextDay = (f: Pick<Flight, 'departTime' | 'arriveTime' | 'connections'>) => {
  const m = (s: string) => { const [h, mi] = (s || '').split(':').map(Number); return Number.isFinite(h) && Number.isFinite(mi) ? h * 60 + mi : NaN }
  const seq = [f.departTime, ...(f.connections || []).flatMap((c) => [c.arrive, c.depart]), f.arriveTime].map(m).filter((x) => !Number.isNaN(x))
  return seq.some((x, i) => i > 0 && x < seq[i - 1])
}

/** Tempo de espera entre chegada e saída (atravessa a meia-noite se preciso), em minutos */
export const layoverMinutes = (arrive: string, depart: string) => {
  const m = (s: string) => {
    const [h, mi] = (s || '').split(':').map(Number)
    return Number.isFinite(h) && Number.isFinite(mi) ? h * 60 + mi : NaN
  }
  const a = m(arrive)
  const d = m(depart)
  return Number.isNaN(a) || Number.isNaN(d) ? 0 : (d - a + 1440) % 1440
}
/** 105 → "1h 45min" */
export const fmtMinutes = (min: number) => (min ? `${Math.floor(min / 60) ? Math.floor(min / 60) + 'h ' : ''}${min % 60 ? (min % 60) + 'min' : ''}`.trim() : '')

/** "9h 40min" → 580 (para achar o voo mais rápido) */
export const durationMinutes = (d: string) => {
  const h = /(\d+)\s*h/i.exec(d || '')
  const m = /(\d+)\s*m/i.exec(d || '')
  return h || m ? (h ? +h[1] * 60 : 0) + (m ? +m[1] : 0) : Infinity
}

export const optionTotals = (o: Option) => {
  const parts = {
    flights: sum(o.flights),
    hotels: sum(o.hotels),
    tours: sum(o.tours),
    transfers: sum(o.transfers)
  }
  const itemsSum = parts.flights + parts.hotels + parts.tours + parts.transfers
  const subtotal = Number(o.packagePrice) > 0 ? Number(o.packagePrice) : itemsSum
  const discount = Number(o.discount) || 0
  const fees = Number(o.fees) || 0
  return { parts, itemsSum, subtotal, discount, fees, total: Math.max(0, subtotal - discount + fees) }
}

/* ---------- "Monte do seu jeito": o cliente combina itens de todas as opções ---------- */
/** id usado em reservedOptionId quando o cliente reserva a própria combinação */
export const MIX_ID = 'mix'
type MixOption = Pick<Option, 'id' | 'name' | 'highlight' | 'flights' | 'hotels' | 'tours' | 'transfers' | 'fees' | 'packagePrice'> & { feesLabel?: string }

export interface MixEntry<T> { item: T; optionIds: string[] }
export interface MixCatalog {
  /** 1 escolha por trecho (Ida, Volta…) */
  legs: { key: string; items: MixEntry<Flight>[] }[]
  /** 1 escolha por hospedagem (se houver mais de uma cidade: Hospedagem 1, 2…) */
  hotels: { key: string; items: MixEntry<Hotel>[] }[]
  /** Adicionais: o cliente marca os que quiser */
  tours: MixEntry<Tour>[]
  transfers: MixEntry<Transfer>[]
}
export interface MixSelection { flights: string[]; hotels: string[]; tours: string[]; transfers: string[] }

const keyFlight = (f: Flight) => [f.airline, f.origin, f.destination, f.date, f.departTime, f.arriveTime, f.price, f.fare?.name].join('|')
const keyHotel = (h: Hotel) => [h.name, h.roomType, h.board, h.checkIn, h.checkOut, h.price].join('|')
const keyTour = (t: Tour) => [t.name, t.date, t.price].join('|')
const keyTransfer = (t: Transfer) => [t.origin, t.destination, t.date, t.time, t.vehicle, t.price].join('|')

// Opções com "preço fechado" não entram: seus itens não têm preço individual confiável
const mixable = (opts: MixOption[]) => opts.filter((o) => !(Number(o.packagePrice) > 0))

const addUnique = <T>(list: MixEntry<T>[], item: T, key: (i: T) => string, optionId: string) => {
  const hit = list.find((e) => key(e.item) === key(item))
  if (hit) { if (!hit.optionIds.includes(optionId)) hit.optionIds.push(optionId) } else list.push({ item, optionIds: [optionId] })
}

/** Junta os itens de todas as opções, sem repetir itens iguais. */
export const mixCatalog = (options: MixOption[]): MixCatalog => {
  const cat: MixCatalog = { legs: [], hotels: [], tours: [], transfers: [] }
  for (const o of mixable(options)) {
    o.flights.forEach((f, i) => {
      const key = legOf(f, i, o.flights.length)
      let g = cat.legs.find((x) => x.key === key)
      if (!g) cat.legs.push((g = { key, items: [] }))
      addUnique(g.items, f, keyFlight, o.id)
    })
    o.hotels.forEach((h, i) => {
      const key = `h${i}`
      let g = cat.hotels.find((x) => x.key === key)
      if (!g) cat.hotels.push((g = { key, items: [] }))
      addUnique(g.items, h, keyHotel, o.id)
    })
    o.tours.forEach((t) => addUnique(cat.tours, t, keyTour, o.id))
    o.transfers.forEach((t) => addUnique(cat.transfers, t, keyTransfer, o.id))
  }
  return cat
}

/** Só vale oferecer a montagem se houver o que combinar. */
export const mixWorthIt = (c: MixCatalog) =>
  c.legs.some((g) => g.items.length > 1) || c.hotels.some((g) => g.items.length > 1) || c.tours.length > 0 || c.transfers.length > 0

/** Opção-base da montagem: a recomendada, senão a primeira. Dela vêm as taxas e a seleção inicial. */
export const mixBase = (options: MixOption[]) => {
  const list = mixable(options)
  return list.find((o) => o.highlight) || list[0]
}

/** Seleção inicial = itens da opção-base. */
export const mixDefault = (options: MixOption[], c = mixCatalog(options)): MixSelection => {
  const base = mixBase(options)
  const pick = <T>(groups: { items: MixEntry<T>[] }[]) =>
    groups.map((g) => (g.items.find((e) => base && e.optionIds.includes(base.id)) || g.items[0]).item as T & { id: string })
  return {
    flights: pick(c.legs).map((f) => f.id),
    hotels: pick(c.hotels).map((h) => h.id),
    tours: c.tours.filter((e) => base && e.optionIds.includes(base.id)).map((e) => e.item.id),
    transfers: c.transfers.filter((e) => base && e.optionIds.includes(base.id)).map((e) => e.item.id)
  }
}

/** Itens escolhidos (validados contra o catálogo) — 1 por trecho/hospedagem. */
export const mixItems = (c: MixCatalog, sel: MixSelection) => {
  const one = <T extends { id: string }>(groups: { items: MixEntry<T>[] }[], ids: string[]) =>
    groups.map((g) => (g.items.find((e) => ids.includes(e.item.id)) || g.items[0]).item)
  return {
    flights: one(c.legs, sel.flights).map((f, i) => ({ ...f, leg: c.legs[i].key })),
    hotels: one(c.hotels, sel.hotels),
    tours: c.tours.filter((e) => sel.tours.includes(e.item.id)).map((e) => e.item),
    transfers: c.transfers.filter((e) => sel.transfers.includes(e.item.id)).map((e) => e.item)
  }
}

/** Total da montagem: soma dos itens + taxas da opção-base (descontos de pacote não se aplicam). */
export const mixTotals = (options: MixOption[], sel: MixSelection) => {
  const c = mixCatalog(options)
  const items = mixItems(c, sel)
  const parts = { flights: sum(items.flights), hotels: sum(items.hotels), tours: sum(items.tours), transfers: sum(items.transfers) }
  const subtotal = parts.flights + parts.hotels + parts.tours + parts.transfers
  const fees = Number(mixBase(options)?.fees) || 0
  return { items, parts, itemsSum: subtotal, subtotal, discount: 0, fees, total: subtotal + fees }
}

/** Status efetivo: propostas abertas com validade vencida viram "expirado". */
export const effectiveStatus = (p: Pick<Proposal, 'status' | 'validUntil'>): Status => {
  const open: Status[] = ['rascunho', 'enviado', 'visualizado', 'aguardando']
  if (open.includes(p.status) && p.validUntil && p.validUntil < today()) return 'expirado'
  return p.status
}

/** Viagem confirmada e já finalizada → momento de pedir avaliação. */
export const tripFinished = (p: Pick<Proposal, 'status' | 'destination'>) =>
  p.status === 'aceito' && !!p.destination.returnDate && p.destination.returnDate < today()

export const isClosed = (s: Status) => ['aceito', 'recusado', 'expirado', 'reserva_solicitada'].includes(s)

export const money = (v: number, currency: Currency = 'BRL', lang: Lang = 'pt') =>
  new Intl.NumberFormat(lang === 'es' ? 'es-419' : 'pt-BR', {
    style: 'currency',
    currency,
    // Em espanhol o padrão mostraria "BRL 250.00"; assim aparece "R$ 250.00"
    currencyDisplay: lang === 'es' && currency === 'BRL' ? 'narrowSymbol' : 'symbol',
    maximumFractionDigits: currency === 'COP' ? 0 : 2
  }).format(Number(v) || 0)

export const onlyDigits = (s: string) => (s || '').replace(/\D/g, '')

export const waUrl = (phone: string, text: string) =>
  `https://wa.me/${onlyDigits(phone)}?text=${encodeURIComponent(text)}`
