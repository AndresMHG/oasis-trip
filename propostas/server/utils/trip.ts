import { createHmac, timingSafeEqual } from 'node:crypto'

// Depois que o cliente digita o PIN certo, recebe um token que libera os arquivos do guia.
// O token muda se o PIN for trocado no painel.
export const tripToken = (code: string, pin: string) =>
  createHmac('sha256', String(useRuntimeConfig().sessionSecret)).update(`trip:${code}:${pin}`).digest('hex').slice(0, 32)

export const checkTripToken = (code: string, pin: string, token: string) => {
  const a = Buffer.from(tripToken(code, pin))
  const b = Buffer.from(String(token || ''))
  return a.length === b.length && timingSafeEqual(a, b)
}
