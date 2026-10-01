export default defineEventHandler(async (event) => {
  const p = await requireProposal(event)
  await deleteProposal(p.code)
  return { ok: true }
})
