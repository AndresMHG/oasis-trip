# Oasis Trip · Sitio institucional (Nuxt 3)

Sitio web institucional para **Oasis Trip Turismo y Viajes**, agencia especializada en
conexiones internacionales entre Brasil, Venezuela y Colombia.

- **Framework:** Nuxt 3 + Vue 3
- **Idiomas:** Español (predeterminado), Português, English — con `@nuxtjs/i18n`
- **Mobile-first** y con animaciones (reveals al hacer scroll, héroe animado, marquee de rutas, botón flotante de WhatsApp con pulso, transiciones entre páginas).
- **Listo para desplegar en Vercel** (preset `vercel` ya configurado en `nitro`).

---

## Estructura de rutas

| Ruta (ES) | Português | English | Página |
|-----------|-----------|---------|--------|
| `/` | `/pt` | `/en` | Home general (todos los clientes) |
| `/servicios` | `/pt/servicios` | `/en/servicios` | Servicios |
| `/venezuela` | `/pt/venezuela` | `/en/venezuela` | Enfocada en clientes venezolanos 🇻🇪 |
| `/colombia` | `/pt/colombia` | `/en/colombia` | Enfocada en clientes colombianos 🇨🇴 |
| `/brasil` | `/pt/brasil` | `/en/brasil` | Enfocada en clientes brasileños 🇧🇷 |
| `/contacto` | `/pt/contacto` | `/en/contacto` | Contacto (formulario → WhatsApp) |

> El idioma predeterminado es español, por eso no lleva prefijo en la URL. El navegador
> detecta el idioma del visitante automáticamente la primera vez.

---

## Desarrollo local

Requisitos: Node.js 18+ (recomendado 20/22).

```bash
npm install
npm run dev      # http://localhost:3000
```

Otros comandos:

```bash
npm run build    # build de producción
npm run preview  # previsualizar el build
```

---

## Desplegar en Vercel (paso a paso)

1. **Sube el proyecto a GitHub** (o GitLab/Bitbucket):
   ```bash
   git init
   git add .
   git commit -m "Oasis Trip - sitio institucional"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/oasis-trip.git
   git push -u origin main
   ```

2. Entra a **https://vercel.com** e inicia sesión.

3. Haz clic en **Add New → Project** e **importa** el repositorio `oasis-trip`.

4. Vercel detecta Nuxt automáticamente. Deja la configuración por defecto:
   - **Framework Preset:** Nuxt.js
   - **Build Command:** `npm run build`
   - **Output:** (automático)

5. Pulsa **Deploy**. En ~1–2 minutos tendrás una URL tipo
   `https://oasis-trip.vercel.app`.

> Alternativa sin Git: instala el CLI con `npm i -g vercel`, entra a la carpeta del
> proyecto y ejecuta `vercel` (sigue las instrucciones en pantalla).

---

## Agregar tu dominio (último paso)

Cuando tengas el dominio (p. ej. `oasistripturismo.com`):

1. En tu proyecto de Vercel ve a **Settings → Domains**.
2. Escribe tu dominio y pulsa **Add**.
3. Vercel te mostrará los registros DNS a configurar en tu proveedor (los más comunes):
   - Registro **A** `@` → `76.76.21.21`, **o**
   - Registro **CNAME** `www` → `cname.vercel-dns.com`
4. Guarda los cambios en tu proveedor de dominio y espera la propagación (minutos a unas horas).
5. (Opcional) Actualiza `baseUrl` en `nuxt.config.ts` con tu dominio final para mejorar el SEO/hreflang.

---

## Personalización rápida

- **Logo:** reemplaza `public/img/logo.svg` y `public/img/logo-white.svg` por tu archivo
  (puedes usar el PNG de Canva renombrándolo, p. ej. `logo.png`, y actualizar las rutas en
  `components/AppHeader.vue` y `AppFooter.vue`).
- **Colores de marca:** en `assets/css/main.css`, variables `--c-primary` (#0F3D57),
  `--c-secondary` (#F4A261), `--c-text` (#2E2E2E), `--c-gray` (#4A4A4A).
- **Textos / traducciones:** archivos en `locales/es.json`, `locales/pt.json`, `locales/en.json`.
- **WhatsApp, correos, Instagram:** en `composables/useBrand.ts`.

---

## Contacto de la marca (precargado)

- WhatsApp: +55 41 99218-2256
- Correos: vendas@oasistripturismo.com · rocio@oasistripturismo.com · oasistripturismoeviagens@gmail.com
- Instagram: [@oasistrip.turismo](https://www.instagram.com/oasistrip.turismo)
