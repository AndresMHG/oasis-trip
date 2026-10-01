import type { H3Event } from 'h3'

// Valores de teste do nuxt.config.ts — nunca podem ser usados em produção
const DEV_PASSWORD = 'oasis2026'
const DEV_SECRET = 'troque-este-segredo-por-um-texto-longo-e-aleatorio-123'

/** Em produção, exige senha e chave próprias (variáveis NUXT_ADMIN_PASSWORD e NUXT_SESSION_SECRET). */
export const authConfigProblem = () => {
  if (import.meta.dev) return ''
  const { adminPassword, sessionSecret } = useRuntimeConfig()
  if (!adminPassword || adminPassword === DEV_PASSWORD || String(adminPassword).length < 8) {
    return 'Defina uma senha própria (8+ caracteres) na variável NUXT_ADMIN_PASSWORD.'
  }
  if (!sessionSecret || sessionSecret === DEV_SECRET || String(sessionSecret).length < 32) {
    return 'Defina uma chave secreta própria (32+ caracteres) na variável NUXT_SESSION_SECRET.'
  }
  return ''
}

const sessionConfig = () => ({
  name: 'oasis_admin',
  password: useRuntimeConfig().sessionSecret,
  maxAge: 60 * 60 * 24 * 30, // 30 dias logado
  // httpOnly: o JavaScript da página não lê o cookie · secure: só via HTTPS ·
  // sameSite lax: outros sites não conseguem usar a sua sessão
  cookie: { httpOnly: true, secure: !import.meta.dev, sameSite: 'lax' as const, path: '/' }
})

export const adminSession = (event: H3Event) => useSession<{ admin?: boolean }>(event, sessionConfig())

export const isAdmin = async (event: H3Event) => {
  if (authConfigProblem()) return false
  return !!(await adminSession(event)).data.admin
}

export const requireAdmin = async (event: H3Event) => {
  if (!(await isAdmin(event))) throw createError({ statusCode: 401, statusMessage: 'Não autorizado' })
}
