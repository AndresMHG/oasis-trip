import { STATUS, type Status } from '../../../../../utils/proposal'

// Troca rápida de status (dashboard, botão "Enviar por WhatsApp", "Copiar link").
// `onlyIfDraft` evita rebaixar um status mais avançado ao reenviar o link.
export default defineEventHandler(async (event) => {
  const p = await requireProposal(event)
  const { status, onlyIfDraft } = await readBody<{ status: Status; onlyIfDraft?: boolean }>(event)
  if (!(status in STATUS)) throw createError({ statusCode: 400, statusMessage: 'Status inválido' })
  if (onlyIfDraft && p.status !== 'rascunho') return p
  if (p.status !== status) {
    p.status = status
    p.updatedAt = new Date().toISOString()
    logActivity(p, status === 'enviado' ? 'enviado' : 'status', STATUS[status].label)
    await saveProposal(p)
  }
  return p
})
