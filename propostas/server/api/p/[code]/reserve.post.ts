import {
  effectiveStatus, migrateOptionFare, MIX_ID, mixCatalog, mixItems, mixTotals, money, optionTotals, type MixSelection
} from '../../../../utils/proposal'

// Botão "Quero reservar": registra o interesse do cliente (sem pagamento) —
// numa opção pronta ou na combinação que ele montou ("Monte do seu jeito").
export default defineEventHandler(async (event) => {
  const p = await requireProposal(event)
  const { optionId, mix } = await readBody<{ optionId?: string; mix?: Partial<MixSelection> }>(event)

  const status = effectiveStatus(p)
  if (status === 'expirado' || status === 'recusado') {
    throw createError({ statusCode: 409, statusMessage: 'Proposta indisponível' })
  }

  let detail = ''
  if (optionId === MIX_ID && p.allowMix !== false && mix) {
    // Guarda só ids que existem no catálogo (1 por trecho/hospedagem)
    const raw: MixSelection = {
      flights: mix.flights || [], hotels: mix.hotels || [], tours: mix.tours || [], transfers: mix.transfers || []
    }
    const items = mixItems(mixCatalog(p.options.map(migrateOptionFare)), raw)
    const sel: MixSelection = {
      flights: items.flights.map((f) => f.id),
      hotels: items.hotels.map((h) => h.id),
      tours: items.tours.map((t) => t.id),
      transfers: items.transfers.map((t) => t.id)
    }
    p.reservedOptionId = MIX_ID
    p.reservedMix = sel
    detail = [
      'Montou do seu jeito',
      ...items.flights.map((f) => `${f.leg}: ${[f.airline, f.departTime].filter(Boolean).join(' ')}`),
      ...items.hotels.map((h) => h.name),
      items.tours.length ? `${items.tours.length} passeio(s)` : '',
      money(mixTotals(p.options.map(migrateOptionFare), sel).total, p.currency)
    ].filter(Boolean).join(' · ')
  } else {
    const option = p.options.find((o) => o.id === optionId) || p.options[0]
    p.reservedOptionId = option?.id
    p.reservedMix = undefined
    detail = option ? `Opção: ${option.name} · ${money(optionTotals(option).total, p.currency)}` : ''
  }

  if (status !== 'aceito') p.status = 'reserva_solicitada'
  p.reservedAt = new Date().toISOString()
  logActivity(p, 'reserva', detail)
  await saveProposal(p)
  return { ok: true }
})
