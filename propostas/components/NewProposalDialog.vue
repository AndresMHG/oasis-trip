<template>
  <div class="dlg-bg" @click.self="$emit('close')">
    <div class="dlg panel" role="dialog" aria-label="Nova proposta">
      <header>
        <h2>Nova proposta</h2>
        <button class="btn btn--ghost btn--icon" title="Fechar" @click="$emit('close')"><Icon name="x" /></button>
      </header>

      <div class="lang">
        <span class="muted small">Idioma do cliente</span>
        <div class="seg">
          <button :class="{ on: lang === 'pt' }" @click="lang = 'pt'">🇧🇷 Português</button>
          <button :class="{ on: lang === 'es' }" @click="lang = 'es'">🇪🇸 Español</button>
        </div>
      </div>

      <h3>Modelos prontos</h3>
      <div class="tpls">
        <button v-for="t in BUILTIN_TEMPLATES" :key="t.id" class="tpl" :disabled="busy" @click="$emit('create', { lang, template: t.id })">
          <span class="tpl__ico" :class="`tpl__ico--${t.icon}`"><Icon :name="t.icon" :size="22" /></span>
          <span class="tpl__txt"><strong>{{ t.name }}</strong><small>{{ t.description }}</small></span>
          <Icon name="chevron-right" :size="18" class="tpl__go" />
        </button>
      </div>

      <h3>Rotas prontas <span class="h3-note">— só falta data, horário e preço</span></h3>
      <div class="tpls tpls--routes">
        <button v-for="r in ROUTE_TEMPLATES" :key="r.id" class="tpl tpl--route" :disabled="busy" @click="$emit('create', { lang, template: r.id })">
          <span class="tpl__ico tpl__ico--plane"><Icon name="plane" :size="20" /></span>
          <span class="tpl__txt"><strong>{{ routeName(r) }}</strong><small>{{ routeDescription(r) }}</small></span>
        </button>
      </div>

      <template v-if="saved.length">
        <h3>Meus modelos</h3>
        <div class="tpls">
          <div v-for="t in saved" :key="t.id" class="tpl tpl--saved">
            <button class="tpl__main" :disabled="busy" @click="$emit('create', { lang: t.lang, template: t.id })">
              <span class="tpl__ico"><Icon :name="t.kind === 'aereo' ? 'plane' : 'file'" :size="20" /></span>
              <span class="tpl__txt">
                <strong>{{ t.name }}</strong>
                <small>{{ t.lang === 'es' ? '🇪🇸' : '🇧🇷' }} {{ t.options }} {{ t.options === 1 ? 'opção' : 'opções' }}{{ t.city ? ` · ${t.city}` : '' }}</small>
              </span>
            </button>
            <button class="btn btn--ghost btn--icon btn--sm btn--danger" title="Excluir modelo" @click="remove(t)"><Icon name="trash" :size="15" /></button>
          </div>
        </div>
      </template>
      <p v-else class="muted small hint">
        💡 Dica: abra qualquer proposta e clique em <strong>Salvar modelo</strong> para reutilizá-la aqui.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BUILTIN_TEMPLATES, ROUTE_TEMPLATES, routeDescription, routeName } from '~/utils/templates'
import type { Kind, Lang } from '~/utils/proposal'

defineProps<{ busy?: boolean }>()
defineEmits<{ close: []; create: [payload: { lang: Lang; template: string }] }>()

interface SavedRow { id: string; name: string; lang: Lang; kind: Kind; city: string; options: number }
const lang = ref<Lang>('pt')
const saved = ref<SavedRow[]>([])
const { show } = useToast()

onMounted(async () => (saved.value = await api<SavedRow[]>('/api/admin/templates')))

const remove = async (t: SavedRow) => {
  if (!confirm(`Excluir o modelo "${t.name}"?`)) return
  await api(`/api/admin/templates/${t.id}`, { method: 'DELETE' })
  saved.value = saved.value.filter((x) => x.id !== t.id)
  show('Modelo excluído')
}
</script>

<style scoped>
.dlg-bg { position: fixed; inset: 0; z-index: 100; background: rgba(10,30,45,.45); display: grid; place-items: center; padding: 16px; }
.dlg { width: 100%; max-width: 520px; max-height: calc(100dvh - 32px); overflow: auto; padding: 20px; display: grid; gap: 14px; animation: up .25s ease; }
@keyframes up { from { opacity: 0; transform: translateY(16px); } }
header { display: flex; align-items: center; justify-content: space-between; }
header h2 { font-size: 1.3rem; }
h3 { font-size: .8rem; text-transform: uppercase; letter-spacing: .6px; color: var(--c-gray); margin-top: 4px; }
.lang { display: grid; gap: 6px; }
.seg { display: grid; grid-template-columns: 1fr 1fr; background: var(--c-bg-soft); border-radius: 12px; padding: 4px; }
.seg button { border: 0; background: none; padding: 10px; border-radius: 9px; cursor: pointer; font-weight: 600; color: var(--c-gray); }
.seg button.on { background: #fff; color: var(--c-primary); box-shadow: var(--shadow-sm); }
.tpls { display: grid; gap: 8px; }
.tpl {
  display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; cursor: pointer;
  background: #fff; border: 1.5px solid var(--c-line); border-radius: 14px; padding: 12px 14px; transition: border-color .15s, box-shadow .15s;
}
.tpl:hover { border-color: var(--c-primary-300); box-shadow: var(--shadow-sm); }
.tpl--saved { padding: 4px 6px 4px 4px; cursor: default; }
.tpl__main { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; background: none; border: 0; padding: 8px 10px; text-align: left; cursor: pointer; }
.tpl__ico { flex: none; width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; background: rgba(15,61,87,.07); color: var(--c-primary); }
.tpl__ico--plane { background: #fff1e4; color: var(--c-accent-600); }
.tpl__txt { flex: 1; min-width: 0; display: grid; }
.tpl__txt strong { color: var(--c-primary); font-family: var(--ff-head); font-size: .98rem; }
.tpl__txt small { color: var(--c-gray); font-size: .83rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tpl__go { color: var(--c-gray-300); }
.h3-note { text-transform: none; letter-spacing: 0; font-weight: 500; }
.tpls--routes { grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); }
.tpl--route { padding: 10px 12px; gap: 10px; }
.tpl--route .tpl__ico { width: 38px; height: 38px; }
.hint { background: var(--c-bg-soft); border-radius: 10px; padding: 10px 12px; }
</style>
