<template>
  <div class="img-in">
    <div class="img-in__preview" :style="model ? { backgroundImage: `url(${model})` } : {}" @click="pick">
      <template v-if="!model">
        <Icon :name="busy ? 'hourglass' : 'image'" :size="22" />
        <span>{{ busy ? 'Enviando…' : 'Adicionar foto' }}</span>
      </template>
      <button v-else type="button" class="img-in__clear" title="Remover imagem" @click.stop="model = ''">
        <Icon name="x" :size="14" />
      </button>
    </div>
    <div class="img-in__side">
      <input v-model="model" class="input" type="url" placeholder="Cole o link de uma imagem…" />
      <div class="img-in__btns">
        <button type="button" class="btn btn--sm btn--bank" @click="bank = true"><Icon name="image" :size="15" /> Banco de fotos</button>
        <button type="button" class="btn btn--sm" :disabled="busy" @click="pick"><Icon name="upload" :size="15" /> Enviar do computador/celular</button>
      </div>
      <div v-if="suggestions.length" class="img-in__sugg">
        <span class="muted small">Sugestões para {{ place!.name }}:</span>
        <button
          v-for="ph in suggestions"
          :key="ph.id"
          type="button"
          :class="{ on: model === photoUrl(ph.id) }"
          :style="{ backgroundImage: `url(${photoUrl(ph.id, 200)})` }"
          :title="`Foto: ${ph.by} (Unsplash)`"
          @click="model = photoUrl(ph.id)"
        />
      </div>
    </div>
    <input ref="file" type="file" accept="image/*" hidden @change="upload" />
    <PhotoBankDialog v-if="bank" :initial-query="suggest" @close="bank = false" @select="(u) => { model = u; bank = false }" />
  </div>
</template>

<script setup lang="ts">
import { findPlace, photoUrl } from '~/utils/photoBank'

/** `suggest`: cidade/destino para sugerir fotos do banco (ex.: "Cartagena") */
const props = defineProps<{ suggest?: string }>()
const model = defineModel<string>({ default: '' })
const file = ref<HTMLInputElement>()
const busy = ref(false)
const bank = ref(false)
const place = computed(() => (props.suggest ? findPlace(props.suggest) : undefined))
const suggestions = computed(() => place.value?.photos.slice(0, 5) || [])
const { show } = useToast()

const pick = () => file.value?.click()

// Reduz a imagem no navegador (máx. 1600px, JPEG) antes de enviar — rápido no 4G do cliente.
const compress = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const max = 1600
      const scale = Math.min(1, max / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale)
      c.height = Math.round(img.height * scale)
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      let q = 0.82
      let out = c.toDataURL('image/jpeg', q)
      while (out.length > 850_000 && q > 0.4) out = c.toDataURL('image/jpeg', (q -= 0.1))
      URL.revokeObjectURL(img.src)
      resolve(out)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(f)
  })

const upload = async (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  busy.value = true
  try {
    const dataUrl = await compress(f)
    const { url } = await api<{ url: string }>('/api/admin/upload', { method: 'POST', body: { dataUrl } })
    model.value = url
  } catch {
    show('Não foi possível enviar a imagem', 'error')
  } finally {
    busy.value = false
    if (file.value) file.value.value = ''
  }
}
</script>

<style scoped>
.img-in { display: flex; gap: 12px; align-items: stretch; }
.img-in__preview {
  position: relative; flex: none; width: 124px; aspect-ratio: 4/3; border-radius: 12px; cursor: pointer;
  background: var(--c-bg-soft) center/cover; border: 1.5px dashed var(--c-line);
  display: grid; place-content: center; justify-items: center; gap: 4px; color: var(--c-primary-300); font-size: .75rem; font-weight: 600;
}
.img-in__clear {
  position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 50%; border: 0;
  background: rgba(0,0,0,.55); color: #fff; display: grid; place-items: center; cursor: pointer;
}
.img-in__side { flex: 1; min-width: 0; display: grid; gap: 8px; align-content: center; }
.img-in__btns { display: flex; flex-wrap: wrap; gap: 6px; }
.btn--bank { border-color: var(--c-accent); color: #8a4b12; background: #fff7ef; }
.img-in__sugg { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.img-in__sugg span { width: 100%; }
.img-in__sugg button {
  width: 64px; aspect-ratio: 16/10; border-radius: 8px; border: 2px solid transparent; cursor: pointer;
  background: var(--c-bg-soft) center/cover; transition: transform .12s;
}
.img-in__sugg button:hover { transform: scale(1.06); }
.img-in__sugg button.on { border-color: var(--c-accent-600); }
@media (max-width: 480px) { .img-in { flex-direction: column; } .img-in__preview { width: 100%; aspect-ratio: 16/9; } }
</style>
