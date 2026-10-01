import { STATUS, type Proposal } from '../../../../utils/proposal'

export default defineEventHandler(async (event) => {
  const current = await requireProposal(event)
  const body = await readBody<Proposal>(event)
  if (!body || !Array.isArray(body.options)) throw createError({ statusCode: 400, statusMessage: 'Dados inválidos' })

  const next: Proposal = {
    ...body,
    // Campos controlados pelo servidor
    code: current.code,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
    status: body.status in STATUS ? body.status : current.status,
    views: current.views,
    firstViewedAt: current.firstViewedAt,
    lastViewedAt: current.lastViewedAt,
    reservedAt: current.reservedAt,
    reservedOptionId: current.reservedOptionId,
    reservedMix: current.reservedMix,
    review: current.review,
    activity: current.activity
  }

  if (next.status !== current.status) {
    logActivity(next, next.status === 'enviado' ? 'enviado' : 'status', STATUS[next.status].label)
  }
  return saveProposal(next)
})
