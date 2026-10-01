<template>
  <div class="cx">
    <div v-for="(c, i) in list" :key="c.id" class="cx__row">
      <label class="field"><span>Aeroporto da conexão</span><input v-model="c.airport" placeholder="Panamá (PTY)" /></label>
      <label class="field"><span>Chega</span><input v-model="c.arrive" type="time" /></label>
      <label class="field"><span>Sai</span><input v-model="c.depart" type="time" /></label>
      <span class="cx__wait" :class="{ warn: layoverMinutes(c.arrive, c.depart) > 0 && layoverMinutes(c.arrive, c.depart) < 60 }">
        {{ layoverMinutes(c.arrive, c.depart) ? `Espera: ${fmtMinutes(layoverMinutes(c.arrive, c.depart))}` : '' }}
      </span>
      <button type="button" class="btn btn--ghost btn--icon btn--sm btn--danger" title="Remover conexão" @click="model = list.filter((_, j) => j !== i)"><Icon name="trash" :size="15" /></button>
    </div>
    <button type="button" class="btn btn--sm cx__add" @click="add"><Icon name="plus" :size="15" /> Adicionar conexão</button>
  </div>
</template>

<script setup lang="ts">
import { fmtMinutes, layoverMinutes, uid, type Connection } from '~/utils/proposal'

const model = defineModel<Connection[] | undefined>()
const list = computed(() => model.value || [])
const add = () => (model.value = [...list.value, { id: uid(), airport: '', arrive: '', depart: '' }])
</script>

<style scoped>
.cx { display: grid; gap: 8px; }
.cx__row { display: grid; grid-template-columns: minmax(0, 2fr) 1fr 1fr auto auto; gap: 8px; align-items: end; }
.cx__wait { font-size: .82rem; font-weight: 600; color: var(--c-primary); padding-bottom: 12px; white-space: nowrap; }
.cx__wait.warn { color: #c2410c; }
.cx__add { justify-self: start; border-style: dashed; }
@media (max-width: 600px) {
  .cx__row { grid-template-columns: 1fr 1fr; }
  .cx__row .field:first-child { grid-column: span 2; }
}
</style>
