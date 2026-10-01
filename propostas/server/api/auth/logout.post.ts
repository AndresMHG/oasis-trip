export default defineEventHandler(async (event) => {
  const session = await adminSession(event)
  await session.clear()
  return { ok: true }
})
