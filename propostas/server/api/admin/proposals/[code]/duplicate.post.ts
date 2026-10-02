import { addDays, newCode, today, type Proposal } from '../../../../../utils/proposal'

export default defineEventHandler(async (event) => {
  const src = await requireProposal(event)
  const settings = await getSettings()
  const now = new Date().toISOString()
  const copy: Proposal = {
    ...structuredClone(src),
    code: newCode(),
    createdAt: now,
    updatedAt: now,
    status: 'rascunho',
    validUntil: addDays(today(), settings.validityDays),
    views: 0,
    firstViewedAt: undefined,
    lastViewedAt: undefined,
    reservedAt: undefined,
    reservedOptionId: undefined,
    reservedMix: undefined,
    review: undefined,
    trip: undefined,
    activity: [{ type: 'criado', at: now, detail: `Duplicada de ${src.code}` }]
  }
  while (await getProposal(copy.code)) copy.code = newCode()
  return saveProposal(copy)
})
