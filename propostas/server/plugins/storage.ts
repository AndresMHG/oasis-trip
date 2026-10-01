import fsDriver from 'unstorage/drivers/fs'
import upstashDriver from 'unstorage/drivers/upstash'
import neonDriver from '../lib/neonDriver'

// Onde os dados ficam guardados:
// - Neon (Postgres) — recomendado em produção. A Vercel cria DATABASE_URL ao conectar o Neon em Storage.
// - Upstash Redis — alternativa (KV_REST_API_URL / KV_REST_API_TOKEN).
// - Sem nada configurado → arquivos JSON em ./.data/db (uso no computador).
export default defineNitroPlugin(() => {
  const storage = useStorage()
  const pg = process.env.DATABASE_URL || process.env.POSTGRES_URL
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

  if (pg) {
    storage.mount('db', neonDriver({ url: pg }))
    console.info('[storage] usando Neon (Postgres)')
  } else if (kvUrl && kvToken) {
    storage.mount('db', upstashDriver({ url: kvUrl, token: kvToken, base: 'oasis' }))
    console.info('[storage] usando Upstash Redis')
  } else {
    if (!import.meta.dev) console.warn('[storage] ATENÇÃO: sem banco configurado — os dados não ficam salvos em produção')
    storage.mount('db', fsDriver({ base: './.data/db' }))
  }
})
