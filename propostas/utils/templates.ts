// Modelos de proposta: prontos (fixos no código) e salvos pela agência.
import { FARE_PRESETS, newFlight, newOption, uid, type Flight, type Kind, type Lang, type Option, type Proposal } from './proposal'

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
  { id: 'aereo-ida', name: 'Passagem aérea · somente ida', description: '2 opções de voo só de ida', icon: 'plane' }
]

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

/** Conteúdo de um modelo pronto; `null` para o pacote em branco (usa o padrão). */
export const builtinContent = (id: string, lang: Lang): TemplateContent | null => {
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
  p.conditions = c.conditions
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
