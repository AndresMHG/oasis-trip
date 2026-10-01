<template>
  <div class="items">
    <article v-for="(item, i) in items" :key="item.id" class="it">
      <header class="it__head" @click="toggle(item.id)">
        <span class="it__n">{{ i + 1 }}</span>
        <span class="it__title">
          <strong>{{ title(item) || `${noun} ${i + 1}` }}</strong>
          <small v-if="subtitle(item)" class="muted">{{ subtitle(item) }}</small>
        </span>
        <span v-if="item.price" class="it__price">{{ money(item.price, currency) }}</span>
        <span class="it__tools" @click.stop>
          <button type="button" class="btn btn--ghost btn--icon btn--sm" title="Subir" :disabled="i === 0" @click="move(i, -1)"><Icon name="up" :size="15" /></button>
          <button type="button" class="btn btn--ghost btn--icon btn--sm" title="Descer" :disabled="i === items.length - 1" @click="move(i, 1)"><Icon name="down" :size="15" /></button>
          <button type="button" class="btn btn--ghost btn--icon btn--sm" title="Duplicar" @click="dup(i)"><Icon name="copy" :size="15" /></button>
          <button type="button" class="btn btn--ghost btn--icon btn--sm btn--danger" title="Remover" @click="remove(i)"><Icon name="trash" :size="15" /></button>
        </span>
      </header>
      <div v-show="openIds.has(item.id)" class="grid-form it__body">
        <!-- Campos compostos ficam em <div>: dentro de <label>, clicar no rótulo acionaria o 1º botão interno -->
        <component :is="BLOCK_TYPES.includes(f.type || '') ? 'div' : 'label'" v-for="f in fields" :key="f.key" class="field" :class="[f.cls || 'c6', { 'field--block': f.type === 'fare' }]">
          <span>{{ f.label }}</span>
          <ImageInput v-if="f.type === 'image'" v-model="item[f.key]" :suggest="imageSuggest" />
          <ConnectionsEditor v-else-if="f.type === 'connections'" v-model="item[f.key]" />
          <template v-else-if="f.type === 'fare'">
            <FareEditor v-if="item[f.key]" v-model="item[f.key]" />
            <button v-else type="button" class="btn btn--sm fare-add" @click="item[f.key] = newFare()">
              <Icon name="plus" :size="15" /> Informar tarifa (bagagem, remarcação e cancelamento)
            </button>
          </template>
          <textarea v-else-if="f.type === 'textarea'" v-model="item[f.key]" :placeholder="f.placeholder" :rows="f.rows || 3" />
          <select v-else-if="f.type === 'select'" v-model="item[f.key]">
            <option v-for="o in f.options" :key="o" :value="o">{{ o }}</option>
          </select>
          <input
            v-else
            v-model="item[f.key]"
            :type="f.type === 'money' ? 'number' : f.type || 'text'"
            :step="f.type === 'money' ? '0.01' : undefined"
            :min="f.type === 'money' || f.type === 'number' ? 0 : undefined"
            :inputmode="f.type === 'money' ? 'decimal' : undefined"
            :placeholder="typeof f.placeholder === 'function' ? f.placeholder(item) : f.placeholder"
            :list="f.list ? `dl-${f.key}` : undefined"
            @input="derive?.(item)"
            @change="f.type === 'money' || f.type === 'number' ? (item[f.key] = Number(item[f.key]) || 0) : undefined"
          />
          <datalist v-if="f.list" :id="`dl-${f.key}`"><option v-for="o in f.list" :key="o" :value="o" /></datalist>
        </component>
      </div>
    </article>

    <button type="button" class="btn items__add" @click="add"><Icon name="plus" :size="16" /> Adicionar {{ noun.toLowerCase() }}</button>
  </div>
</template>

<script setup lang="ts">
import { money, newFare, uid, type Currency } from '~/utils/proposal'

const BLOCK_TYPES = ['image', 'fare', 'connections']

export interface FieldDef {
  key: string
  label: string
  type?: 'text' | 'date' | 'time' | 'number' | 'money' | 'textarea' | 'image' | 'select' | 'fare' | 'connections'
  cls?: string
  placeholder?: string | ((item: any) => string)
  options?: string[]
  list?: string[]
  rows?: number
}

const props = defineProps<{
  fields: FieldDef[]
  noun: string
  create: () => any
  title: (item: any) => string
  subtitle?: (item: any) => string
  derive?: (item: any) => void
  currency: Currency
  /** Destino usado para sugerir fotos do banco nos campos de imagem */
  imageSuggest?: string
}>()
const items = defineModel<any[]>({ required: true })
const subtitle = (item: any) => props.subtitle?.(item) || ''

const openIds = ref(new Set<string>())
const toggle = (id: string) => {
  const s = new Set(openIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  openIds.value = s
}

const add = () => {
  const item = props.create()
  items.value.push(item)
  toggle(item.id)
}
const dup = (i: number) => {
  const copy = { ...structuredClone(toRaw(items.value[i])), id: uid() }
  items.value.splice(i + 1, 0, copy)
  toggle(copy.id)
}
const remove = (i: number) => {
  if (confirm(`Remover ${props.noun.toLowerCase()}?`)) items.value.splice(i, 1)
}
const move = (i: number, d: number) => {
  const [it] = items.value.splice(i, 1)
  items.value.splice(i + d, 0, it)
}
</script>

<style scoped>
.items { display: grid; gap: 10px; }
.it { border: 1.5px solid var(--c-line); border-radius: 14px; background: #fff; }
.it__head { display: flex; align-items: center; gap: 10px; padding: 10px 10px 10px 14px; cursor: pointer; }
.it__n {
  flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center;
  background: var(--c-bg-soft); color: var(--c-primary); font-size: .8rem; font-weight: 700;
}
.it__title { flex: 1; min-width: 0; display: grid; }
.it__title strong, .it__title small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.it__title strong { font-size: .95rem; }
.it__price { font-weight: 600; color: var(--c-primary); font-size: .9rem; white-space: nowrap; }
.it__tools { display: flex; }
.it__body { padding: 4px 14px 16px; border-top: 1px dashed var(--c-line); padding-top: 14px; }
.items__add { border-style: dashed; justify-self: start; }
.field--block { background: #fffaf4; border: 1px solid #f7dcc2; border-radius: 12px; padding: 12px; }
.fare-add { justify-self: start; border-color: var(--c-accent); color: #8a4b12; background: #fff7ef; }
@media (max-width: 600px) {
  .it__head { flex-wrap: wrap; }
  .it__tools { width: 100%; justify-content: flex-end; }
}
</style>
