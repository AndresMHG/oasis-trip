// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Sobrescreva com as variáveis de ambiente NUXT_ADMIN_PASSWORD e NUXT_SESSION_SECRET
    adminPassword: 'oasis2026',
    sessionSecret: 'troque-este-segredo-por-um-texto-longo-e-aleatorio-123'
  },

  routeRules: {
    // Cabeçalhos de segurança em todas as páginas
    '/**': {
      headers: {
        'X-Frame-Options': 'SAMEORIGIN', // ninguém pode abrir o painel dentro de outro site
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    },
    // Proposta pública nunca deve ser indexada
    '/proposta/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/avaliacao/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/viagem/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/admin/**': { ssr: false },
    '/login': { ssr: false }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      title: 'Oasis Trip Propostas',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0F3D57' },
        { name: 'robots', content: 'noindex, nofollow' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap'
        }
      ]
    }
  }
})
