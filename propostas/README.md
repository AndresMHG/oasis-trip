# Oasis Trip Propostas

Aplicação para criar orçamentos de viagem e enviar ao cliente por um link
(`/proposta/CODIGO`), otimizada para celular.

- **Painel** (`/admin`): criar, editar, duplicar, excluir, mudar status, copiar link e enviar pelo WhatsApp.
- **Modelos prontos**: pacote completo, passagem aérea ida e volta, passagem aérea só ida — e "Salvar modelo" em qualquer proposta.
- **Proposta do cliente**: capa com foto, opções, "Monte do seu jeito", voos com conexões e tarifa, hotel, roteiro, passeios, transfers, investimento detalhado com PIX/parcelamento, selo Cadastur, "Quero reservar" e WhatsApp.
- **Pós-viagem**: página de avaliação (`/avaliacao/CODIGO`) e tela de Avaliações no painel.
- **Banco de fotos** por destino (Unsplash, uso comercial gratuito).
- **Backup**: Configurações → Exportar tudo / Importar backup.

Stack: Nuxt 3 (mesmo do site) — frontend e backend no mesmo projeto. Banco: **Neon (Postgres)** em produção;
no computador, arquivos em `.data/db`.

---

## Rodar no computador

```bash
cd propostas
npm install
npm run dev        # http://localhost:3001  → login em /login
```

Senha local padrão: `oasis2026`. **Em produção ela não funciona** — o sistema exige uma senha própria.

---

## Publicar na Vercel (passo a passo)

O site institucional e as propostas ficam no **mesmo repositório**, mas viram **dois projetos** na Vercel.

1. Envie o código para o GitHub (`git push`).
2. Na Vercel: **Add New → Project** → importe o repositório `oasis-trip` de novo.
3. Em **Root Directory**, clique em *Edit* e escolha a pasta **`propostas`**. Framework: Nuxt.js (detectado sozinho).
4. Em **Environment Variables**, adicione:
   | Nome | Valor |
   |------|-------|
   | `NUXT_ADMIN_PASSWORD` | a senha do painel (8+ caracteres, forte) |
   | `NUXT_SESSION_SECRET` | um texto aleatório com 32+ caracteres (pode gerar em https://www.random.org/strings/) |
5. Clique em **Deploy**.
6. **Banco de dados (Neon):** no projeto, abra **Storage → Create Database → Neon** (plano grátis) → **Connect**.
   A Vercel cria sozinha a variável `DATABASE_URL`. Depois, em **Deployments → ⋯ → Redeploy**.
   - Já tem uma conta Neon? Também dá para colar a *connection string* de um banco seu em `DATABASE_URL`.
   - A tabela `oasis_kv` é criada automaticamente no primeiro acesso.
7. **Domínio:** **Settings → Domains** → `propostas.oasistripturismo.com`
   (no seu provedor de domínio: registro **CNAME** `propostas` → `cname.vercel-dns.com`).

> Sem o passo 6 a aplicação abre, mas **não guarda** as propostas na Vercel.
> Sem o passo 4 o login fica bloqueado (proteção contra senha padrão).

Depois de publicado: entre em **Configurações** para revisar pagamento, Cadastur e textos padrão.
Para levar as propostas do computador para o online: no computador, **Exportar tudo**; no online, **Importar backup**.

---

## Segurança

- Só o servidor acessa o banco; a `DATABASE_URL` fica apenas nas variáveis da Vercel (nunca no código/GitHub).
- Todas as consultas ao banco são parametrizadas.
- Login: cookie cifrado, `httpOnly`, `secure`, `SameSite=Lax`; 5 senhas erradas → 15 min de bloqueio.
- Em produção, senha/chave padrão são recusadas.
- Cabeçalhos de segurança em todas as páginas; propostas com `noindex` (não aparecem no Google).
- Faça um **backup** mensal (Configurações → Exportar tudo).

---

## Onde mexer

| O quê | Arquivo |
|---|---|
| Regras (totais, status, pagamento, montagem) | `utils/proposal.ts` |
| Modelos prontos | `utils/templates.ts` |
| Banco de fotos | `utils/photoBank.ts` |
| Textos da página do cliente (PT/ES) | `composables/useProposalText.ts` |
| Página do cliente | `pages/proposta/[code].vue` |
| Editor | `pages/admin/[code].vue` |
| Conexão com o banco (Neon) | `server/lib/neonDriver.ts` e `server/plugins/storage.ts` |
| Login e segurança | `server/utils/auth.ts`, `server/api/auth/login.post.ts` |
