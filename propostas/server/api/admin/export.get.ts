// Backup completo: propostas, modelos, configurações e fotos enviadas, num único arquivo JSON.
export default defineEventHandler(async (event) => {
  const db = useStorage('db')
  const keys = (await db.getKeys()).filter((k) => !k.startsWith('ratelimit'))
  const items = await db.getItems(keys)
  const data = Object.fromEntries(items.map((i) => [i.key, i.value]))
  const stamp = new Date().toISOString().slice(0, 10)
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': `attachment; filename="oasis-propostas-backup-${stamp}.json"`,
    'Cache-Control': 'no-store'
  })
  return { app: 'oasis-trip-propostas', exportedAt: new Date().toISOString(), count: keys.length, data }
})
