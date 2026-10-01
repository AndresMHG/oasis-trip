// Lista os modelos salvos (sem o conteúdo completo, só o necessário para escolher).
export default defineEventHandler(async () =>
  (await listTemplates()).map((t) => ({
    id: t.id,
    name: t.name,
    lang: t.lang,
    createdAt: t.createdAt,
    kind: t.content.kind,
    city: t.content.destination.city,
    options: t.content.options.length
  }))
)
