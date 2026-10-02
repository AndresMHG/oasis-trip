import { timingSafeEqual } from 'node:crypto'
import { MIX_ID, migrateOptionFare, mixCatalog, mixItems, type Proposal } from '../../../../utils/proposal'

// Guia da viagem: o cliente envia o PIN (ou o token salvo no celular) e recebe tudo o que precisa para viajar.
const MAX_FAILS = 5
const LOCK_MS = 15 * 60 * 1000
interface Attempts { fails: number; lockedUntil: number }

/** Itens confirmados: a opção reservada, a combinação montada ou a 1ª opção */
const chosen = (p: Proposal) => {
  const options = p.options.map(migrateOptionFare)
  if (p.reservedOptionId === MIX_ID && p.reservedMix) return mixItems(mixCatalog(options), p.reservedMix)
  const o = options.find((x) => x.id === p.reservedOptionId) || (options.length === 1 ? options[0] : options.find((x) => x.highlight) || options[0])
  return { flights: o?.flights || [], hotels: o?.hotels || [], tours: o?.tours || [], transfers: o?.transfers || [] }
}

export default defineEventHandler(async (event) => {
  const p = await requireProposal(event)
  const trip = p.trip
  if (!trip?.enabled) throw createError({ statusCode: 404, statusMessage: 'Guia ainda não disponível' })

  const { pin, token } = await readBody<{ pin?: string; token?: string }>(event)
  let ok = !!token && checkTripToken(p.code, trip.pin, token)

  if (!ok) {
    const ip = getRequestIP(event, { xForwardedFor: true }) || 'desconhecido'
    const key = `ratelimit:trip:${p.code}:${ip.replace(/[^a-z0-9.:]/gi, '')}`
    const db = useStorage('db')
    const att = (await db.getItem<Attempts>(key)) || { fails: 0, lockedUntil: 0 }
    if (att.lockedUntil > Date.now()) {
      throw createError({ statusCode: 429, statusMessage: 'Muitas tentativas. Tente de novo em 15 min.' })
    }
    const a = Buffer.from(String(trip.pin))
    const b = Buffer.from(String(pin || '').replace(/\D/g, ''))
    ok = a.length === b.length && timingSafeEqual(a, b)
    if (!ok) {
      const fails = att.fails + 1
      await db.setItem(key, { fails: fails >= MAX_FAILS ? 0 : fails, lockedUntil: fails >= MAX_FAILS ? Date.now() + LOCK_MS : 0 })
      await new Promise((r) => setTimeout(r, 500))
      throw createError({ statusCode: 401, statusMessage: 'Código incorreto' })
    }
    await db.removeItem(key)
  }

  const settings = await getSettings()
  const items = chosen(p)
  return {
    token: tripToken(p.code, trip.pin),
    code: p.code,
    client: { name: p.client.name, lang: p.client.lang, travelers: p.client.travelers },
    destination: p.destination,
    flights: items.flights,
    hotels: items.hotels.map((h) => ({ id: h.id, name: h.name, address: h.address, checkIn: h.checkIn, checkOut: h.checkOut, nights: h.nights, roomType: h.roomType, board: h.board, image: h.image, notes: h.notes })),
    tours: items.tours.map((t) => ({ id: t.id, name: t.name, date: t.date, duration: t.duration, location: t.location, image: t.image })),
    transfers: items.transfers.map((t) => ({ id: t.id, origin: t.origin, destination: t.destination, date: t.date, time: t.time, vehicle: t.vehicle })),
    itinerary: p.itinerary,
    docs: trip.docs.map((d) => ({ id: d.id, kind: d.kind, title: d.title, pnr: d.pnr, fileName: d.fileName, mime: d.mime, hasFile: !!d.fileId })),
    checklist: trip.checklist.split('\n').map((s) => s.trim()).filter(Boolean),
    insurance: trip.insurance,
    contacts: trip.contacts,
    notes: trip.notes,
    agency: { name: settings.agentName, whatsapp: settings.whatsapp, instagram: settings.instagram.replace(/^@/, '') }
  }
})
