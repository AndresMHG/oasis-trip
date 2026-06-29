// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // Vercel deployment preset
  nitro: {
    preset: 'vercel'
  },

  modules: ['@nuxtjs/i18n'],

  css: ['~/assets/css/main.css'],

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'es',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'oasis_lang',
      redirectOn: 'root',
      alwaysRedirect: false
    },
    locales: [
      { code: 'es', iso: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'pt', iso: 'pt-BR', name: 'Português', file: 'pt.json' },
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' }
    ],
    lazy: true,
    langDir: 'locales',
    baseUrl: 'https://www.oasistripturismo.com'
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Oasis Trip · Turismo y Viajes',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0F3D57' },
        {
          name: 'description',
          content:
            'Agencia de viajes especializada en conexiones internacionales entre Brasil, Venezuela y Colombia. Pasajes aéreos, rutas y paquetes personalizados.'
        }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap'
        }
      ]
    }
  }
})
