<template>
  <div class="dlg-bg" @click.self="$emit('close')">
    <div class="dlg panel" role="dialog" aria-label="Colar cotação">
      <header>
        <h2>Colar cotação</h2>
        <button class="btn btn--ghost btn--icon" title="Fechar" @click="$emit('close')"><Icon name="x" /></button>
      </header>

      <template v-if="!result">
        <p class="muted small">
          No site da cotação (consolidadora, companhia aérea, Google Voos…), selecione o texto dos voos — ida e volta,
          com horários, aeroportos e preço — copie com <b>Ctrl + C</b> e cole aqui com <b>Ctrl + V</b>.
        </p>
        <textarea v-model="text" class="paste" rows="12" placeholder="Cole aqui o texto da cotação…" autofocus />
        <div class="actions">
          <button class="btn btn--primary" :disabled="!text.trim()" @click="read"><Icon name="sparkles" :size="16" /> Ler cotação</button>
        </div>
      </template>

      <template v-else>
        <p v-if="!result.flights.length" class="warn">Não encontrei voos neste texto. Confira se copiou a parte com horários e aeroportos.</p>
        <ol v-else class="found">
          <li v-for="(f, i) in result.flights" :key="f.id">
            <strong>{{ legName(i) }} · {{ f.airline || 'Companhia?' }}</strong>
            <span>{{ f.origin || '?' }} {{ f.departTime || '--:--' }} → {{ f.destination || '?' }} {{ f.arriveTime || '--:--' }}</span>
            <small class="muted">
              {{ [f.date ? fmtDay(f.date) : 'sem data', f.duration, f.stops, f.connections?.map((c) => c.airport).join(', '), f.baggage, f.price ? money(f.price, currency) : '']
                .filter(Boolean).join(' · ') }}
            </small>
          </li>
        </ol>
        <ul v-if="result.notes.length && result.flights.length" class="notes">
          <li v-for="n in result.notes" :key="n">{{ n }}</li>
        </ul>
        <div class="actions">
          <button class="btn" @click="result = null"><Icon name="chevron-left" :size="16" /> Voltar</button>
          <span class="spacer" />
          <template v-if="result.flights.length">
            <button class="btn" @click="$emit('apply', { flights: result.flights, mode: 'new' })"><Icon name="plus" :size="16" /> Nova opção</button>
            <button class="btn btn--primary" @click="$emit('apply', { flights: result.flights, mode: 'replace' })"><Icon name="check" :size="16" /> Usar nesta opção</button>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseQuote, type ParsedQuote } from '~/utils/parseQuote'
import { money, type Currency, type Flight } from '~/utils/proposal'

defineProps<{ currency: Currency }>()
defineEmits<{ close: []; apply: [payload: { flights: Flight[]; mode: 'new' | 'replace' }] }>()

const text = ref('')
const result = ref<ParsedQuote | null>(null)
const read = () => (result.value = parseQuote(text.value))
const legName = (i: number) => (result.value!.flights.length === 2 ? (i === 0 ? 'Ida' : 'Volta') : `Trecho ${i + 1}`)
const fmtDay = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<style scoped>
.dlg-bg { position: fixed; inset: 0; z-index: 100; background: rgba(10,30,45,.45); display: grid; place-items: center; padding: 16px; }
.dlg { width: 100%; max-width: 620px; max-height: calc(100dvh - 32px); overflow: auto; padding: 20px; display: grid; gap: 14px; }
header { display: flex; align-items: center; justify-content: space-between; }
header h2 { font-size: 1.3rem; }
.paste { width: 100%; font: inherit; font-size: .9rem; padding: 12px; border: 1.5px solid var(--c-line); border-radius: 10px; resize: vertical; }
.paste:focus { outline: none; border-color: var(--c-primary-300); box-shadow: 0 0 0 3px rgba(46,139,176,.15); }
.actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.spacer { flex: 1; }
.found { margin: 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.found li { display: grid; gap: 2px; padding: 10px 12px; border: 1.5px solid var(--c-line); border-radius: 12px; }
.found strong { color: var(--c-primary); font-family: var(--ff-head); }
.notes { margin: 0; padding: 10px 12px 10px 28px; background: #fff6e0; color: #7a5a00; border-radius: 10px; font-size: .88rem; }
.warn { background: #fff6e0; color: #7a5a00; border-radius: 10px; padding: 10px 12px; }
</style>
