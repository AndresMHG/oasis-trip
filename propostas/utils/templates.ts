// Modelos de proposta: prontos (fixos no código) e salvos pela agência.
import { FARE_PRESETS, newFlight, newOption, uid, type Flight, type Kind, type Lang, type Option, type Proposal } from './proposal'
import { countryOf } from './cities'

/** Conteúdo reaproveitável de uma proposta (sem cliente, datas nem histórico). */
export interface TemplateContent {
  kind: Kind
  intro: string
  conditions: string
  showItemPrices: boolean
  destination: { origin?: string; city: string; country: string; image: string; period: string }
  options: Option[]
  itinerary: Proposal['itinerary']
}

export interface SavedTemplate {
  id: string
  name: string
  lang: Lang
  createdAt: string
  content: TemplateContent
}

export interface BuiltinTemplate {
  id: string
  name: string
  description: string
  icon: string
}

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  { id: 'pacote', name: 'Pacote completo', description: 'Voos, hotel, passeios, transfers e roteiro', icon: 'package' },
  { id: 'aereo-ida-volta', name: 'Passagem aérea · ida e volta', description: '2 opções de voo com ida e volta', icon: 'plane' },
  { id: 'aereo-ida', name: 'Passagem aérea · somente ida', description: '2 opções de voo só de ida', icon: 'plane' },
  { id: 'direto-aereo', name: 'Orçamento direto · passagem', description: '1 opção só, sem escolher — ida e volta', icon: 'plane' },
  { id: 'direto-pacote', name: 'Orçamento direto · pacote', description: '1 opção só, sem escolher — voo, hotel e passeios', icon: 'package' }
]

/** Textos do orçamento direto (uma opção só: o cliente não escolhe, só confirma) */
const DIRETO_TEXT = {
  pt: {
    aereo: 'Conforme conversamos, segue o orçamento da sua passagem com todos os detalhes: horários, conexões, bagagem e valores. ✈️\n\nEstá tudo certo? É só clicar em "Quero reservar" para garantirmos esta tarifa — os valores das companhias aéreas podem mudar até a emissão.',
    pacote: 'Conforme conversamos, preparamos o orçamento da sua viagem com tudo o que está incluído: voos, hospedagem, passeios e traslados. 🌴\n\nEstá tudo certo? É só clicar em "Quero reservar" para confirmarmos — os valores estão sujeitos à disponibilidade no momento da reserva.',
    option: 'Seu orçamento'
  },
  es: {
    aereo: 'Como conversamos, aquí está el presupuesto de tu pasaje con todos los detalles: horarios, conexiones, equipaje y valores. ✈️\n\n¿Está todo bien? Solo haz clic en "Quiero reservar" para asegurar esta tarifa — los valores de las aerolíneas pueden cambiar hasta la emisión.',
    pacote: 'Como conversamos, preparamos el presupuesto de tu viaje con todo lo que está incluido: vuelos, hospedaje, paseos y traslados. 🌴\n\n¿Está todo bien? Solo haz clic en "Quiero reservar" para confirmar — los valores están sujetos a disponibilidad al momento de la reserva.',
    option: 'Tu presupuesto'
  }
}

const AEREO_TEXT = {
  pt: {
    intro: 'Separamos as melhores opções de voo para você, comparando horários, conexões e bagagem. Escolha a que mais combina com a sua viagem! ✈️',
    conditions:
      '• Tarifas sujeitas a disponibilidade e alteração até a emissão do bilhete.\n• Valores válidos para os passageiros e datas informados.\n• Alterações e cancelamentos seguem as regras da tarifa escolhida e podem gerar multa + diferença tarifária.\n• Confira a bagagem incluída em cada opção.\n• Documentos de viagem (passaporte, vistos e vacinas) são responsabilidade do passageiro.\n• Em voos internacionais, apresente-se no aeroporto com 3 horas de antecedência.',
    options: ['Opção 1 · Voo direto', 'Opção 2 · Mais econômica']
  },
  es: {
    intro: 'Seleccionamos las mejores opciones de vuelo para ti, comparando horarios, conexiones y equipaje. ¡Elige la que mejor se adapte a tu viaje! ✈️',
    conditions:
      '• Tarifas sujetas a disponibilidad y cambios hasta la emisión del boleto.\n• Valores válidos para los pasajeros y fechas informados.\n• Cambios y cancelaciones siguen las reglas de la tarifa elegida y pueden generar multa + diferencia tarifaria.\n• Revisa el equipaje incluido en cada opción.\n• La documentación de viaje (pasaporte, visas y vacunas) es responsabilidad del pasajero.\n• En vuelos internacionales, preséntate en el aeropuerto con 3 horas de anticipación.',
    options: ['Opción 1 · Vuelo directo', 'Opción 2 · Más económica']
  }
}

const flight = (patch: Partial<Flight>): Flight => ({ ...newFlight(), ...patch })

/**
 * Se o texto é um dos textos padrão (das Configurações ou dos modelos de passagem) no idioma `from`,
 * devolve a versão em `to`. Texto escrito à mão volta igual.
 */
export const swapDefaultText = (
  text: string, field: 'intro' | 'conditions', from: Lang, to: Lang,
  settings?: { intro: Record<Lang, string>; conditions: Record<Lang, string> }
) => {
  const same = (a?: string) => !!a && a.trim() === (text || '').trim()
  if (from === to) return text
  if (settings && same(settings[field][from])) return settings[field][to]
  if (same(AEREO_TEXT[from][field])) return AEREO_TEXT[to][field]
  if (field === 'intro') for (const k of ['aereo', 'pacote'] as const) if (same(DIRETO_TEXT[from][k])) return DIRETO_TEXT[to][k]
  return text
}

/* ---------- Rotas prontas: companhia, conexão, bagagem e tarifa já preenchidas ----------
   Só faltam datas, horários e preço. As conexões são as mais comuns de cada companhia —
   confira na hora da cotação, porque a malha aérea muda. Para incluir outra rota, acrescente um item. */
interface RouteOption { name: [string, string]; airline: string; via: string[]; baggage: string; fare: keyof typeof FARE_PRESETS; highlight?: boolean }
export interface RouteTemplate { id: string; origin: string; city: string; options: RouteOption[] }

export const ROUTE_TEMPLATES: RouteTemplate[] = [
  {
    id: 'rota-cwb-bvb', origin: 'Curitiba (CWB)', city: 'Boa Vista (BVB)',
    options: [
      { name: ['Opção 1 · LATAM', 'Opción 1 · LATAM'], airline: 'LATAM', via: ['Brasília (BSB)'], baggage: '1 mala despachada 23kg', fare: 'standard', highlight: true },
      { name: ['Opção 2 · GOL', 'Opción 2 · GOL'], airline: 'GOL', via: ['Brasília (BSB)'], baggage: 'Mala de mão 10kg', fare: 'basica' },
      { name: ['Opção 3 · Azul', 'Opción 3 · Azul'], airline: 'Azul', via: ['Campinas (VCP)', 'Manaus (MAO)'], baggage: 'Mala de mão 10kg', fare: 'basica' }
    ]
  },
  {
    id: 'rota-mao-cwb', origin: 'Manaus (MAO)', city: 'Curitiba (CWB)',
    options: [
      { name: ['Opção 1 · Azul', 'Opción 1 · Azul'], airline: 'Azul', via: ['Campinas (VCP)'], baggage: '1 mala despachada 23kg', fare: 'standard', highlight: true },
      { name: ['Opção 2 · LATAM', 'Opción 2 · LATAM'], airline: 'LATAM', via: ['São Paulo (GRU)'], baggage: 'Mala de mão 10kg', fare: 'basica' },
      { name: ['Opção 3 · GOL', 'Opción 3 · GOL'], airline: 'GOL', via: ['Brasília (BSB)'], baggage: 'Mala de mão 10kg', fare: 'basica' }
    ]
  },
  {
    id: 'rota-cwb-bog', origin: 'Curitiba (CWB)', city: 'Bogotá (BOG)',
    options: [
      { name: ['Opção 1 · Copa Airlines', 'Opción 1 · Copa Airlines'], airline: 'Copa Airlines', via: ['Cidade do Panamá (PTY)'], baggage: '1 mala despachada 23kg', fare: 'standard', highlight: true },
      { name: ['Opção 2 · Avianca', 'Opción 2 · Avianca'], airline: 'Avianca', via: ['São Paulo (GRU)'], baggage: 'Mala de mão 10kg', fare: 'basica' },
      { name: ['Opção 3 · LATAM', 'Opción 3 · LATAM'], airline: 'LATAM', via: ['São Paulo (GRU)'], baggage: '1 mala despachada 23kg', fare: 'standard' }
    ]
  },
  {
    id: 'rota-cwb-ccs', origin: 'Curitiba (CWB)', city: 'Caracas (CCS)',
    options: [
      { name: ['Opção 1 · Copa Airlines', 'Opción 1 · Copa Airlines'], airline: 'Copa Airlines', via: ['Cidade do Panamá (PTY)'], baggage: '1 mala despachada 23kg', fare: 'standard', highlight: true },
      { name: ['Opção 2 · Avianca', 'Opción 2 · Avianca'], airline: 'Avianca', via: ['São Paulo (GRU)', 'Bogotá (BOG)'], baggage: '1 mala despachada 23kg', fare: 'standard' }
    ]
  }
]

const short = (place: string) => place.replace(/\s*\([A-Z]{3}\)\s*$/, '')
export const routeName = (r: RouteTemplate) => `${short(r.origin)} ⇄ ${short(r.city)}`
export const routeDescription = (r: RouteTemplate) => r.options.map((o) => o.airline).join(' · ')

const routeContent = (r: RouteTemplate, lang: Lang): TemplateContent => {
  const tx = AEREO_TEXT[lang]
  const leg = (o: RouteOption, from: string, to: string, via: string[]): Flight => flight({
    airline: o.airline, origin: from, destination: to,
    stops: via.length === 1 ? '1 conexão' : `${via.length} conexões`,
    baggage: o.baggage,
    fare: structuredClone(FARE_PRESETS[o.fare].fare), fareClass: FARE_PRESETS[o.fare].fare.name,
    connections: via.map((airport) => ({ id: uid(), airport, arrive: '', depart: '', notes: '', price: 0 }))
  })
  return {
    kind: 'aereo',
    intro: tx.intro,
    conditions: tx.conditions,
    showItemPrices: true,
    destination: { origin: r.origin, city: r.city, country: countryOf(r.city), image: '', period: '' },
    options: r.options.map((o) => ({
      ...newOption(o.name[lang === 'es' ? 1 : 0]),
      highlight: !!o.highlight,
      flights: [leg(o, r.origin, r.city, o.via), leg(o, r.city, r.origin, [...o.via].reverse())]
    })),
    itinerary: []
  }
}

/** Conteúdo de um modelo pronto; `null` para o pacote em branco (usa o padrão). */
export const builtinContent = (id: string, lang: Lang): TemplateContent | null => {
  const route = ROUTE_TEMPLATES.find((r) => r.id === id)
  if (route) return routeContent(route, lang)
  if (id === 'direto-aereo' || id === 'direto-pacote') {
    const tx = DIRETO_TEXT[lang]
    const aereo = id === 'direto-aereo'
    const f = () => flight({ stops: '', baggage: '1 mala despachada 23kg', fare: structuredClone(FARE_PRESETS.standard.fare), fareClass: FARE_PRESETS.standard.fare.name })
    return {
      kind: aereo ? 'aereo' : 'pacote',
      intro: aereo ? tx.aereo : tx.pacote,
      conditions: aereo ? AEREO_TEXT[lang].conditions : '',
      showItemPrices: true,
      destination: { city: '', country: '', image: '', period: '' },
      options: [{ ...newOption(tx.option), highlight: true, flights: [f(), f()] }],
      itinerary: []
    }
  }
  if (id !== 'aereo-ida-volta' && id !== 'aereo-ida') return null
  const tx = AEREO_TEXT[lang]
  const roundTrip = id === 'aereo-ida-volta'
  const legs = (stops: string, baggage: string, fare: keyof typeof FARE_PRESETS) => {
    const f = () => flight({ stops, baggage, fare: structuredClone(FARE_PRESETS[fare].fare), fareClass: FARE_PRESETS[fare].fare.name })
    return roundTrip ? [f(), f()] : [f()]
  }
  return {
    kind: 'aereo',
    intro: tx.intro,
    conditions: tx.conditions,
    showItemPrices: true,
    destination: { city: '', country: '', image: '', period: '' },
    options: [
      { ...newOption(tx.options[0]), highlight: true, flights: legs('Direto', '1 mala despachada 23kg', 'standard') },
      { ...newOption(tx.options[1]), flights: legs('1 escala', 'Mala de mão 10kg', 'basica') }
    ],
    itinerary: []
  }
}

const reId = <T extends { id: string }>(items: T[]) => items.map((i) => ({ ...structuredClone(i), id: uid() }))

/** Aplica o conteúdo de um modelo a uma proposta nova (gera ids novos). */
export const applyTemplate = (p: Proposal, c: TemplateContent) => {
  p.kind = c.kind
  p.intro = c.intro
  p.conditions = c.conditions || p.conditions
  p.showItemPrices = c.showItemPrices
  p.destination = { ...p.destination, ...c.destination }
  p.options = c.options.map((o) => ({
    ...structuredClone(o),
    id: uid(),
    flights: reId(o.flights),
    hotels: reId(o.hotels),
    tours: reId(o.tours),
    transfers: reId(o.transfers)
  }))
  p.itinerary = reId(c.itinerary)
  return p
}

/** Extrai o conteúdo reaproveitável de uma proposta, limpando datas. */
export const toTemplateContent = (p: Proposal): TemplateContent => {
  const noDate = <T extends Record<string, any>>(items: T[], keys: string[]) =>
    items.map((i) => {
      const c: Record<string, any> = { ...i }
      keys.forEach((k) => (c[k] = ''))
      return c as T
    })
  return {
    kind: p.kind || 'pacote',
    intro: p.intro,
    conditions: p.conditions,
    showItemPrices: p.showItemPrices,
    destination: {
      origin: p.destination.origin || '',
      city: p.destination.city,
      country: p.destination.country,
      image: p.destination.image,
      period: p.destination.period
    },
    options: p.options.map((o) => ({
      ...o,
      flights: noDate(o.flights, ['date']),
      hotels: noDate(o.hotels, ['checkIn', 'checkOut']),
      tours: noDate(o.tours, ['date']),
      transfers: noDate(o.transfers, ['date'])
    })),
    itinerary: p.itinerary
  }
}
