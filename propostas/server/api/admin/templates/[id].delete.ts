export default defineEventHandler(async (event) => {
  await deleteTemplate(getRouterParam(event, 'id') || '')
  return { ok: true }
})
