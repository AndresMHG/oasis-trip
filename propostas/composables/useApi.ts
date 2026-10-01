import type { Proposal, Status } from '~/utils/proposal'

// Chamadas da área administrativa. Sessão expirada → volta para o login.
export const api = $fetch.create({
  onResponseError({ response }) {
    if (response.status === 401 && import.meta.client) navigateTo('/login')
  }
})

export const useAdminActions = () => {
  const { show } = useToast()

  const publicUrl = (code: string) => `${window.location.origin}/proposta/${code}`

  const setStatus = (code: string, status: Status, onlyIfDraft = false) =>
    api<Proposal>(`/api/admin/proposals/${code}/status`, { method: 'POST', body: { status, onlyIfDraft } })

  const copyLink = async (code: string) => {
    await navigator.clipboard.writeText(publicUrl(code))
    show('Link copiado! Cole no WhatsApp ou e-mail do cliente.')
    return setStatus(code, 'enviado', true)
  }

  const whatsappMessage = (p: { code: string; client: Proposal['client']; destination: { city: string } }) => {
    const first = (p.client.name || '').trim().split(' ')[0]
    const city = p.destination.city
    return p.client.lang === 'es'
      ? `¡Hola${first ? ' ' + first : ''}! 😊 Preparamos tu propuesta de viaje${city ? ' a ' + city : ''} ✈️\n\nMírala aquí: ${publicUrl(p.code)}\n\nCualquier duda, estamos a tu disposición. — Oasis Trip`
      : `Olá${first ? ' ' + first : ''}! 😊 Preparamos a sua proposta de viagem${city ? ' para ' + city : ''} ✈️\n\nConfira aqui: ${publicUrl(p.code)}\n\nQualquer dúvida, estamos à disposição. — Oasis Trip`
  }

  const sendWhatsapp = async (p: Parameters<typeof whatsappMessage>[0]) => {
    const text = encodeURIComponent(whatsappMessage(p))
    const phone = onlyDigits(p.client.whatsapp)
    window.open(phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`, '_blank')
    return setStatus(p.code, 'enviado', true)
  }

  // Pós-viagem: envia o link da página de avaliação pelo WhatsApp do cliente
  const requestReview = (p: Parameters<typeof whatsappMessage>[0]) => {
    const first = (p.client.name || '').trim().split(' ')[0]
    const city = p.destination.city
    const url = `${window.location.origin}/avaliacao/${p.code}`
    const msg = p.client.lang === 'es'
      ? `¡Hola${first ? ' ' + first : ''}! 😊 Esperamos que hayas disfrutado mucho tu viaje${city ? ' a ' + city : ''} 🌴\n\n¿Nos cuentas cómo fue? Toma menos de 1 minuto:\n${url}\n\n¡Gracias por viajar con Oasis Trip! 💛`
      : `Olá${first ? ' ' + first : ''}! 😊 Esperamos que você tenha aproveitado muito sua viagem${city ? ' para ' + city : ''} 🌴\n\nConta pra gente como foi? Leva menos de 1 minuto:\n${url}\n\nObrigado por viajar com a Oasis Trip! 💛`
    const phone = onlyDigits(p.client.whatsapp)
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
    return api<Proposal>(`/api/admin/proposals/${p.code}/review-request`, { method: 'POST' })
  }

  return { publicUrl, setStatus, copyLink, sendWhatsapp, requestReview }
}
