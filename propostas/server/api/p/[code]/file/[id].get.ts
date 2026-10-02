// Arquivo do guia da viagem: só com o token recebido ao digitar o PIN.
export default defineEventHandler(async (event) => {
  const p = await requireProposal(event)
  const trip = p.trip
  const { t, download } = getQuery(event)
  if (!trip?.enabled || !checkTripToken(p.code, trip.pin, String(t || ''))) {
    throw createError({ statusCode: 401, statusMessage: 'Acesso negado' })
  }
  const doc = trip.docs.find((d) => d.id === getRouterParam(event, 'id'))
  const dataUrl = doc?.fileId ? await files.get(doc.fileId) : null
  const m = dataUrl?.match(/^data:([a-z]+\/[a-z0-9.+-]+);base64,(.+)$/)
  if (!doc || !m) throw createError({ statusCode: 404 })
  const name = (doc.fileName || doc.title || 'documento').replace(/[^\w.\- ]/g, '_')
  setResponseHeaders(event, {
    'Content-Type': m[1],
    'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${name}"`,
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex, nofollow'
  })
  return Buffer.from(m[2], 'base64')
})
