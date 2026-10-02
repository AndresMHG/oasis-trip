import {
  effectiveStatus, fareHasInfo, migrateOptionFare, mixCatalog, mixWorthIt, optionTotals, today, tripFinished
} from '../../../utils/proposal'
import { swapDefaultText } from '../../../utils/templates'

// Proposta pública (link do cliente) — somente leitura, sem dados internos.
export default defineEventHandler(async (event) => {
  const p = await requireProposal(event)
  const settings = await getSettings()
  const lang = p.client.lang === 'es' ? 'es' : 'pt'

  return {
    code: p.code,
    kind: p.kind || 'pacote',
    payment: p.payment || null,
    status: effectiveStatus(p),
    validUntil: p.validUntil,
    currency: p.currency,
    showItemPrices: p.showItemPrices,
    client: { name: p.client.name, lang: p.client.lang, travelers: p.client.travelers },
    destination: p.destination,
    // Proposta em espanhol com o texto padrão ainda em português → mostra a versão em espanhol
    intro: swapDefaultText(p.intro, 'intro', lang === 'es' ? 'pt' : 'es', lang, settings),
    itinerary: p.itinerary,
    conditions: swapDefaultText(p.conditions, 'conditions', lang === 'es' ? 'pt' : 'es', lang, settings),
    reservedOptionId: p.reservedOptionId,
    reservedMix: p.reservedMix || null,
    // "Monte do seu jeito" precisa dos preços de cada item e de 2+ opções para combinar
    allowMix: p.allowMix !== false && p.showItemPrices && p.options.length > 1 && mixWorthIt(mixCatalog(p.options.map(migrateOptionFare))),
    reviewOpen: tripFinished(p) && !p.review,
    // Só avisa que existe um guia; o conteúdo exige o PIN (POST /api/p/CODE/trip)
    tripGuide: !!p.trip?.enabled,
    options: p.options.map((raw) => {
      const o = migrateOptionFare(raw) // tarifa antiga da opção → em cada voo
      const totals = optionTotals(o)
      const strip = <T extends { price: number }>(items: T[]) =>
        p.showItemPrices ? items : items.map((i) => ({ ...i, price: 0 }))
      return {
        id: o.id,
        name: o.name,
        highlight: o.highlight,
        feesLabel: o.feesLabel || '',
        flights: strip(o.flights).map((f) => ({ ...f, fare: fareHasInfo(f.fare) ? f.fare : undefined })),
        hotels: strip(o.hotels),
        tours: strip(o.tours),
        transfers: strip(o.transfers),
        fees: totals.fees,
        packagePrice: Number(o.packagePrice) || 0,
        totals: { ...totals, parts: p.showItemPrices ? totals.parts : null }
      }
    }),
    agency: {
      name: settings.agentName,
      whatsapp: settings.whatsapp,
      instagram: settings.instagram.replace(/^@/, ''),
      // Selo só aparece enquanto o certificado estiver válido
      cadastur: settings.cadastur && (!settings.cadasturValidUntil || settings.cadasturValidUntil >= today()) ? settings.cadastur : ''
    }
  }
})
