// Chamado pelo navegador do cliente ao abrir a proposta. Fica separado do GET
// para que robôs de pré-visualização de link (WhatsApp, Instagram…) não contem como visualização.
export default defineEventHandler(async (event) => {
  if (await isAdmin(event)) return { ok: true, admin: true }
  const p = await requireProposal(event)
  const now = new Date().toISOString()
  const first = !p.firstViewedAt
  p.views = (p.views || 0) + 1
  p.firstViewedAt ||= now
  p.lastViewedAt = now
  if (p.status === 'rascunho' || p.status === 'enviado') p.status = 'visualizado'
  // Histórico: a 1ª abertura e depois no máximo uma entrada por hora
  const last = p.activity?.find((a) => a.type === 'visualizado')
  if (first || !last || Date.now() - new Date(last.at).getTime() > 3600_000) {
    logActivity(p, 'visualizado', first ? 'Primeira visualização' : undefined)
  }
  await saveProposal(p)
  return { ok: true }
})
