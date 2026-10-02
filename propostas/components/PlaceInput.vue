<template>
  <div class="pi">
    <input
      v-model="model"
      :placeholder="placeholder"
      autocomplete="off"
      role="combobox"
      :aria-expanded="open && items.length > 0"
      @focus="open = true"
      @input="open = true; active = 0"
      @blur="open = false"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.enter="onEnter"
      @keydown.esc="open = false"
    />
    <ul v-if="open && items.length" class="pi__list" role="listbox">
      <li
        v-for="(c, i) in items"
        :key="c.label"
        role="option"
        :aria-selected="i === active"
        :class="{ on: i === active }"
        @mousedown.prevent="pick(c)"
        @mouseenter="active = i"
      >
        <span class="pi__name">{{ c.name }}</span>
        <span class="pi__code">{{ c.iata }}</span>
        <span class="pi__country">{{ c.country }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { searchCities, type City } from '~/utils/cities'

const props = withDefaults(defineProps<{ placeholder?: string; withCode?: boolean }>(), { withCode: true })
const emit = defineEmits<{ pick: [city: City] }>()
const model = defineModel<string>()

const open = ref(false)
const active = ref(0)
const valueFor = (c: City) => (props.withCode ? c.label : c.name)
const items = computed(() => {
  const list = searchCities(model.value || '')
  // Já escolhido → não fica mostrando a mesma sugestão
  return list.length === 1 && valueFor(list[0]) === model.value ? [] : list
})

const move = (d: number) => {
  open.value = true
  if (items.value.length) active.value = (active.value + d + items.value.length) % items.value.length
}
const pick = (c: City) => {
  model.value = valueFor(c)
  open.value = false
  emit('pick', c)
}
const onEnter = (e: KeyboardEvent) => {
  if (open.value && items.value[active.value]) { e.preventDefault(); pick(items.value[active.value]) }
}
</script>

<style scoped>
.pi { position: relative; }
.pi__list {
  position: absolute; z-index: 30; left: 0; right: 0; top: calc(100% + 4px);
  margin: 0; padding: 4px; list-style: none; max-height: 280px; overflow-y: auto;
  background: #fff; border: 1.5px solid var(--c-line); border-radius: 10px;
  box-shadow: 0 10px 28px rgba(15, 61, 87, .14);
}
.pi__list li {
  display: grid; grid-template-columns: 1fr auto; column-gap: 8px; align-items: baseline;
  padding: 8px 10px; border-radius: 7px; cursor: pointer; text-transform: none; letter-spacing: 0;
}
.pi__list li.on { background: rgba(46, 139, 176, .1); }
.pi__name { font-size: .95rem; font-weight: 500; color: var(--c-text); }
.pi__code { font-size: .8rem; font-weight: 700; color: var(--c-primary-300); }
.pi__country { grid-column: 1 / -1; font-size: .78rem; font-weight: 400; color: var(--c-gray); }
</style>
