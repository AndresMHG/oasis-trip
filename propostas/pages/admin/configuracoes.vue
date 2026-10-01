<template>
  <main class="cfg">
    <div>
      <h1>Configurações</h1>
      <p class="muted">Padrões usados em toda nova proposta — ganhe tempo configurando uma vez.</p>
    </div>
    <form v-if="s" class="cfg__form" @submit.prevent="submit">
      <!-- Pagamento padrão -->
      <section class="panel box">
        <h2><Icon name="wallet" /> Formas de pagamento padrão</h2>
        <p class="muted small">Aplicado a cada nova proposta — dá para ajustar em cada uma.</p>
        <label class="toggle"><input v-model="s.payment.enabled" type="checkbox" /> Mostrar formas de pagamento nas propostas</label>
        <div v-if="s.payment.enabled" class="grid-form">
          <label class="field c3"><span>Desconto PIX (%)</span><input v-model.number="s.payment.pixDiscount" type="number" min="0" max="50" step="0.5" /></label>
          <label class="field c3"><span>Parcelas no cartão</span><input v-model.number="s.payment.installments" type="number" min="0" max="24" /></label>
          <div class="field c6"><span>Juros</span><label class="toggle" style="min-height: 44px"><input v-model="s.payment.interestFree" type="checkbox" /> Sem juros</label></div>
          <label class="field"><span>Observação padrão</span><input v-model="s.payment.note" placeholder="Ex.: Sinal de 30% para garantir a reserva" /></label>
        </div>
      </section>

      <!-- Agência -->
      <section class="panel box">
        <h2><Icon name="shield" /> Agência</h2>
        <div class="grid-form">
          <label class="field c6"><span>Nome exibido na assinatura</span><input v-model="s.agentName" /></label>
          <label class="field c6"><span>WhatsApp da agência (botão "Falar com a Oasis Trip")</span><input v-model="s.whatsapp" type="tel" /></label>
          <label class="field c6"><span>Instagram</span><input v-model="s.instagram" placeholder="oasistrip.turismo" /></label>
          <label class="field c6">
            <span>Link de avaliação no Google (opcional)</span>
            <input v-model="s.googleReviewUrl" type="url" placeholder="https://g.page/r/…/review" />
            <small class="muted">Clientes que derem nota 4 ou 5 serão convidados a avaliar também no Google.</small>
          </label>
          <label class="field c6">
            <span>Nº Cadastur</span>
            <input v-model="s.cadastur" placeholder="00.000.000/0000-00" />
            <small class="muted">Aparece como selo de confiança nas propostas.</small>
          </label>
          <label class="field c6">
            <span>Cadastur válido até</span>
            <input v-model="s.cadasturValidUntil" type="date" />
            <small class="muted">Depois dessa data o selo some automaticamente — lembre de renovar.</small>
          </label>
        </div>
      </section>

      <!-- Padrões de texto -->
      <section class="panel box">
        <h2><Icon name="file" /> Textos e validade</h2>
        <div class="grid-form">
          <label class="field c6"><span>Validade padrão (dias)</span><input v-model.number="s.validityDays" type="number" min="1" /></label>
          <label class="field c6">
            <span>Moeda padrão</span>
            <select v-model="s.currency"><option>BRL</option><option>USD</option><option>EUR</option><option>COP</option></select>
          </label>
          <label class="field c6"><span>🇧🇷 Mensagem de boas-vindas</span><textarea v-model="s.intro.pt" rows="4" /></label>
          <label class="field c6"><span>🇪🇸 Mensaje de bienvenida</span><textarea v-model="s.intro.es" rows="4" /></label>
          <label class="field c6"><span>🇧🇷 Condições padrão</span><textarea v-model="s.conditions.pt" rows="8" /></label>
          <label class="field c6"><span>🇪🇸 Condiciones estándar</span><textarea v-model="s.conditions.es" rows="8" /></label>
        </div>
      </section>

      <!-- Backup -->
      <section class="panel box">
        <h2><Icon name="upload" /> Backup</h2>
        <p class="muted small">Baixe uma cópia de todas as propostas, modelos, avaliações, configurações e fotos enviadas. Recomendado uma vez por mês.</p>
        <div class="row wrap">
          <a class="btn btn--sm" href="/api/admin/export" download><Icon name="file" :size="15" /> Exportar tudo (arquivo .json)</a>
          <button type="button" class="btn btn--sm" :disabled="importing" @click="importFile?.click()"><Icon name="upload" :size="15" /> {{ importing ? 'Importando…' : 'Importar backup' }}</button>
          <input ref="importFile" type="file" accept="application/json,.json" hidden @change="importBackup" />
        </div>
        <p class="muted small">Importar grava as propostas do arquivo por cima das que têm o mesmo código.</p>
      </section>

      <div class="save-bar">
        <button class="btn btn--primary btn--lg" :disabled="saving">{{ saving ? 'Salvando…' : 'Salvar configurações' }}</button>
      </div>
    </form>
  </main>
</template>

<script setup lang="ts">
import type { Settings } from '~/utils/proposal'

definePageMeta({ layout: 'admin', middleware: 'auth' })
useHead({ title: 'Configurações · Oasis Trip' })

const { show } = useToast()
const s = ref<Settings>()
const saving = ref(false)
onMounted(async () => (s.value = await api<Settings>('/api/admin/settings')))

const importFile = ref<HTMLInputElement>()
const importing = ref(false)
const importBackup = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!confirm(`Importar "${file.name}"? Propostas com o mesmo código serão substituídas.`)) return
  importing.value = true
  try {
    const r = await api<{ imported: number }>('/api/admin/import', { method: 'POST', body: JSON.parse(await file.text()) })
    show(`${r.imported} registros importados`)
    s.value = await api<Settings>('/api/admin/settings')
  } catch {
    show('Não foi possível importar este arquivo', 'error')
  } finally {
    importing.value = false
    if (importFile.value) importFile.value.value = ''
  }
}

const submit = async () => {
  saving.value = true
  try {
    s.value = await api<Settings>('/api/admin/settings', { method: 'PUT', body: s.value })
    show('Configurações salvas')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.cfg { max-width: 980px; margin: 0 auto; padding: 22px clamp(12px, 3vw, 28px) 100px; display: grid; gap: 18px; }
.cfg h1 { font-size: 1.7rem; }
.cfg__form { display: grid; gap: 16px; }
.box { padding: 20px; display: grid; gap: 14px; }
.box h2 { font-size: 1.08rem; display: flex; align-items: center; gap: 8px; }
.box h2 svg { color: var(--c-accent-600); }
.field small { font-size: .78rem; }
.row.wrap { flex-wrap: wrap; }
.save-bar { position: sticky; bottom: 0; padding: 12px 0; background: linear-gradient(transparent, var(--c-bg-soft) 30%); }
</style>
