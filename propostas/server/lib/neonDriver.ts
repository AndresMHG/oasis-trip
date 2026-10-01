import { neon } from '@neondatabase/serverless'
import { defineDriver } from 'unstorage'

// Guarda os dados do app (propostas, modelos, configurações, fotos) numa única tabela do Neon (Postgres):
//   kv(key text primary key, value text, updated_at timestamptz)
// Todas as consultas são parametrizadas ($1, $2…) — nada do usuário é concatenado no SQL.
export default defineDriver((opts: { url: string; table?: string }) => {
  const sql = neon(opts.url)
  const table = (opts.table || 'oasis_kv').replace(/[^a-z0-9_]/gi, '')
  let ready: Promise<unknown> | null = null

  // Cria a tabela na primeira vez que o app usa o banco
  const init = () =>
    (ready ||= sql.query(
      `CREATE TABLE IF NOT EXISTS ${table} (key text PRIMARY KEY, value text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`
    ))

  // Escapa % e _ para o LIKE tratar o prefixo literalmente
  const likePrefix = (base: string) => base.replace(/[\\%_]/g, (c) => '\\' + c) + '%'

  return {
    name: 'neon',
    async hasItem(key) {
      await init()
      const rows = await sql.query(`SELECT 1 FROM ${table} WHERE key = $1`, [key])
      return rows.length > 0
    },
    async getItem(key) {
      await init()
      const rows = (await sql.query(`SELECT value FROM ${table} WHERE key = $1`, [key])) as { value: string }[]
      return rows[0]?.value ?? null
    },
    async getItems(items) {
      await init()
      const keys = items.map((i) => i.key)
      if (!keys.length) return []
      const rows = (await sql.query(`SELECT key, value FROM ${table} WHERE key = ANY($1::text[])`, [keys])) as { key: string; value: string }[]
      const byKey = new Map(rows.map((r) => [r.key, r.value]))
      return keys.map((key) => ({ key, value: byKey.get(key) ?? null }))
    },
    async setItem(key, value) {
      await init()
      await sql.query(
        `INSERT INTO ${table} (key, value, updated_at) VALUES ($1, $2, now())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [key, value]
      )
    },
    async removeItem(key) {
      await init()
      await sql.query(`DELETE FROM ${table} WHERE key = $1`, [key])
    },
    async getKeys(base) {
      await init()
      const rows = (base
        ? await sql.query(`SELECT key FROM ${table} WHERE key LIKE $1`, [likePrefix(base)])
        : await sql.query(`SELECT key FROM ${table}`)) as { key: string }[]
      return rows.map((r) => r.key)
    },
    async clear(base) {
      await init()
      if (base) await sql.query(`DELETE FROM ${table} WHERE key LIKE $1`, [likePrefix(base)])
      else await sql.query(`DELETE FROM ${table}`)
    }
  }
})
