<template>
  <div class="fe">
    <div class="fe__presets">
      <span class="muted small">Preencher rápido:</span>
      <button v-for="(p, k) in FARE_PRESETS" :key="k" type="button" class="btn btn--sm" @click="apply(k)">{{ p.label }}</button>
    </div>

    <div class="grid-form">
      <label class="field c6">
        <span>Nome da tarifa</span>
        <input v-model="fare.name" list="dl-fare-names" placeholder="Ex.: LATAM Standard, Copa Classic…" />
        <datalist id="dl-fare-names"><option v-for="n in FARES" :key="n" :value="n" /></datalist>
      </label>
    </div>

    <div class="field">
      <span>O que está incluído (toque para marcar)</span>
      <div class="fe__chips">
        <button
          v-for="f in FARE_FEATURES"
          :key="f"
          type="button"
          :class="{ on: fare.features[f] }"
          @click="fare.features[f] = !fare.features[f]"
        >
          <Icon :name="fare.features[f] ? 'check' : 'x'" :size="14" :stroke="2.4" /> {{ FARE_FEATURE_LABELS[f] }}
        </button>
      </div>
      <small class="muted">O que não estiver marcado aparece para o cliente como “não incluído”.</small>
    </div>

    <div class="grid-form">
      <label class="field c4">
        <span>Remarcação</span>
        <select v-model="fare.change">
          <option value="">Não informar</option>
          <option v-for="(l, k) in CHANGE_RULES" :key="k" :value="k">{{ l }}</option>
        </select>
      </label>
      <label v-if="fare.change === 'fee'" class="field c2">
        <span>Taxa (por pessoa)</span>
        <input v-model.number="fare.changeFee" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0 = a consultar" />
      </label>
      <label class="field c4">
        <span>Cancelamento</span>
        <select v-model="fare.cancel">
          <option value="">Não informar</option>
          <option v-for="(l, k) in CANCEL_RULES" :key="k" :value="k">{{ l }}</option>
        </select>
      </label>
      <label v-if="fare.cancel === 'fee'" class="field c2">
        <span>Multa (por pessoa)</span>
        <input v-model.number="fare.cancelFee" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0 = a consultar" />
      </label>
      <label class="field">
        <span>Observações da tarifa (opcional)</span>
        <input v-model="fare.notes" placeholder="Ex.: No-show cancela o trecho de volta. Remarcação até 24h antes do voo." />
      </label>
    </div>
    <p v-if="fare.change === 'free' || fare.change === 'fee'" class="muted small">A mensagem “+ diferença tarifária, se houver” aparece automaticamente para o cliente.</p>
  </div>
</template>

<script setup lang="ts">
import { CANCEL_RULES, CHANGE_RULES, FARE_FEATURES, FARE_FEATURE_LABELS, FARE_PRESETS, FARES, type Fare } from '~/utils/proposal'

const fare = defineModel<Fare>({ required: true })

const apply = (k: keyof typeof FARE_PRESETS) => {
  const p = structuredClone(FARE_PRESETS[k].fare)
  // Mantém o nome se você já digitou um específico da companhia
  fare.value = { ...p, name: fare.value.name && !FARES.includes(fare.value.name) ? fare.value.name : p.name }
}
</script>

<style scoped>
.fe { display: grid; gap: 14px; }
.fe__presets { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.fe__chips { display: flex; flex-wrap: wrap; gap: 6px; }
.fe__chips button {
  display: inline-flex; align-items: center; gap: 5px; cursor: pointer; font-size: .85rem;
  border: 1.5px solid var(--c-line); background: #fff; color: var(--c-gray-300); border-radius: 999px; padding: 7px 12px;
  text-decoration: line-through; text-decoration-color: rgba(0,0,0,.25);
}
.fe__chips button.on { border-color: var(--c-ok); background: #eefaf3; color: #16693a; text-decoration: none; font-weight: 600; }
</style>
