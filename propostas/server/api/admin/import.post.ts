// Restaura um backup gerado em "Exportar tudo". Só aceita os tipos de dado do próprio app.
const ALLOWED = /^(proposals:[A-Z0-9]+|templates:[a-z0-9]+|images:[a-z0-9]+|files:[a-z0-9]+|settings)$/i

export default defineEventHandler(async (event) => {
  const body = await readBody<{ app?: string; data?: Record<string, unknown> }>(event)
  if (body?.app !== 'oasis-trip-propostas' || !body.data || typeof body.data !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo de backup inválido' })
  }
  const db = useStorage('db')
  const entries = Object.entries(body.data).filter(([k, v]) => ALLOWED.test(k) && v !== null && v !== undefined)
  for (const [key, value] of entries) await db.setItem(key, value as never)
  return { ok: true, imported: entries.length, skipped: Object.keys(body.data).length - entries.length }
})
