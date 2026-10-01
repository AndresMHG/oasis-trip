import { timingSafeEqual } from 'node:crypto'

// Bloqueio contra tentativas em massa: 5 erros seguidos do mesmo endereço → 15 minutos bloqueado
const MAX_FAILS = 5
const LOCK_MS = 15 * 60 * 1000

interface Attempts { fails: number; lockedUntil: number }

export default defineEventHandler(async (event) => {
  const problem = authConfigProblem()
  if (problem) throw createError({ statusCode: 503, statusMessage: problem })

  const ip = getRequestIP(event, { xForwardedFor: true }) || 'desconhecido'
  const key = `ratelimit:login:${ip.replace(/[^a-z0-9.:]/gi, '')}`
  const db = useStorage('db')
  const att = (await db.getItem<Attempts>(key)) || { fails: 0, lockedUntil: 0 }

  if (att.lockedUntil > Date.now()) {
    const min = Math.ceil((att.lockedUntil - Date.now()) / 60000)
    throw createError({ statusCode: 429, statusMessage: `Muitas tentativas. Tente de novo em ${min} min.` })
  }

  const { password } = await readBody<{ password?: string }>(event)
  const expected = Buffer.from(String(useRuntimeConfig().adminPassword))
  const given = Buffer.from(String(password || ''))
  const ok = given.length === expected.length && timingSafeEqual(given, expected)

  if (!ok) {
    const fails = att.fails + 1
    await db.setItem(key, { fails: fails >= MAX_FAILS ? 0 : fails, lockedUntil: fails >= MAX_FAILS ? Date.now() + LOCK_MS : 0 })
    await new Promise((r) => setTimeout(r, 600))
    throw createError({
      statusCode: 401,
      statusMessage: fails >= MAX_FAILS ? 'Muitas tentativas. Tente de novo em 15 min.' : 'Senha incorreta'
    })
  }

  await db.removeItem(key)
  const session = await adminSession(event)
  await session.update({ admin: true })
  return { ok: true }
})
