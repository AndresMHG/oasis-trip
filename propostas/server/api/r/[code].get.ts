// Dados mínimos para a página pública de avaliação (/avaliacao/CODIGO).
export default defineEventHandler(async (event) => {
  const p = await requireProposal(event)
  const s = await getSettings()
  return {
    code: p.code,
    client: { name: p.client.name, lang: p.client.lang },
    destination: { city: p.destination.city, country: p.destination.country, image: p.destination.image },
    review: p.review || null,
    agency: {
      name: s.agentName,
      whatsapp: s.whatsapp,
      instagram: s.instagram.replace(/^@/, ''),
      googleReviewUrl: s.googleReviewUrl
    }
  }
})
