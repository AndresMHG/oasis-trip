// Registra no histórico que o pedido de avaliação foi enviado ao cliente.
export default defineEventHandler(async (event) => {
  const p = await requireProposal(event)
  logActivity(p, 'pedido_avaliacao')
  p.updatedAt = new Date().toISOString()
  return saveProposal(p)
})
