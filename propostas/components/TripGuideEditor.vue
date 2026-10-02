<template>
  <div class="tg">
    <div class="tg__top">
      <label class="toggle"><input v-model="trip.enabled" type="checkbox" /> <b>Liberar o guia para o cliente</b></label>
      <span v-if="!trip.enabled && confirmed" class="tg__hint">✅ Viagem confirmada — já dá para liberar</span>
    </div>
    <p class="muted small">
      O cliente abre pelo mesmo link da proposta (botão <b>Minha viagem</b>) ou em <code>/viagem/{{ code }}</code>
      e digita o código abaixo. Passagens, QR e vouchers só aparecem com o código.
    </p>

    <div class="grid-form">
      <label class="field c4">
        <span>Código de acesso (PIN)</span>
        <span class="tg__pin">
          <input v-model="trip.pin" inputmode="numeric" maxlength="6" @input="trip.pin = trip.pin.replace(/\D/g, '')" />
          <button type="button" class="btn btn--sm" title="Gerar outro código" @click="trip.pin = newTripPin()"><Icon name="sparkles" :size="15" /></button>
        </span>
      </label>
      <div class="c8 tg__send">
        <button type="button" class="btn btn--wa" :disabled="!trip.enabled" @click="$emit('send')"><Icon name="whatsapp" :size="16" /> Enviar guia pelo WhatsApp</button>
        <a class="btn" :href="`/viagem/${code}`" target="_blank"><Icon name="eye" :size="16" /> Ver como o cliente</a>
      </div>
    </div>

    <!-- Documentos -->
    <h4>Passagens, cartões de embarque e vouchers</h4>
    <div v-for="(d, i) in trip.docs" :key="d.id" class="tg__doc">
      <div class="grid-form">
        <label class="field c4">
          <span>Tipo</span>
          <select v-model="d.kind">
            <option v-for="(k, key) in TRIP_DOC_KINDS" :key="key" :value="key">{{ k.pt }}</option>
          </select>
        </label>
        <label class="field c5"><span>Título</span><input v-model="d.title" placeholder="Ex.: Passagem ida e volta — Copa" /></label>
        <label class="field c3"><span>Localizador (PNR)</span><input v-model="d.pnr" placeholder="ABC123" @input="d.pnr = d.pnr.toUpperCase()" /></label>
      </div>
      <div class="tg__file">
        <span v-if="d.fileId" class="tg__fname"><Icon name="file" :size="15" /> {{ d.fileName || 'arquivo' }}</span>
        <span v-else class="muted small">Nenhum arquivo — dá para enviar só o localizador.</span>
        <span class="spacer" />
        <button type="button" class="btn btn--sm" :disabled="busy === d.id" @click="pick(d.id)">
          <Icon :name="busy === d.id ? 'hourglass' : 'upload'" :size="15" /> {{ busy === d.id ? 'Enviando…' : d.fileId ? 'Trocar arquivo' : 'Enviar PDF ou foto' }}
        </button>
        <button type="button" class="btn btn--sm btn--icon btn--danger" title="Remover" @click="trip.docs.splice(i, 1)"><Icon name="trash" :size="15" /></button>
      </div>
    </div>
    <div class="tg__add">
      <button v-for="(k, key) in TRIP_DOC_KINDS" :key="key" type="button" class="btn btn--sm" @click="addDoc(key)">
        <Icon name="plus" :size="14" /> {{ k.pt.split(' (')[0] }}
      </button>
    </div>
    <input ref="file" type="file" accept="application/pdf,image/*" hidden @change="upload" />

    <!-- Textos -->
    <div class="grid-form tg__texts">
      <label class="field c6"><span>Checklist antes de viajar (1 por linha)</span><textarea v-model="trip.checklist" rows="7" /></label>
      <div class="c6 tg__col">
        <label class="field"><span>Seguro viagem (empresa, apólice, telefone de emergência)</span><textarea v-model="trip.insurance" rows="3" placeholder="Ex.: Assist Card · Apólice 123456 · +55 11 0000-0000 (24h)" /></label>
        <label class="field"><span>Contatos úteis (hotel, guia, transfer…)</span><textarea v-model="trip.contacts" rows="3" placeholder="Ex.: Hotel Getsemaní: +57 300 000 0000" /></label>
      </div>
      <label class="field"><span>Avisos importantes</span><textarea v-model="trip.notes" rows="3" placeholder="Ex.: Leve o passaporte original. O transfer espera na saída do desembarque com uma placa com seu nome." /></label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TRIP_DOC_KINDS, newTripPin, uid, type TripDocKind, type TripGuide } from '~/utils/proposal'

defineProps<{ code: string; confirmed?: boolean }>()
defineEmits<{ send: [] }>()
const trip = defineModel<TripGuide>({ required: true })
const { show } = useToast()

const file = ref<HTMLInputElement>()
const target = ref('')
const busy = ref('')

const addDoc = (kind: TripDocKind) => {
  const titles: Record<TripDocKind, string> = { passagem: 'Passagem aérea', embarque: 'Cartão de embarque', voucher: 'Voucher', seguro: 'Seguro viagem', outro: 'Documento' }
  const d = { id: uid(), kind, title: titles[kind], pnr: '', fileId: '', fileName: '', mime: '' }
  trip.value.docs.push(d)
  pick(d.id)
}
const pick = (id: string) => { target.value = id; file.value?.click() }

const readAsDataUrl = (f: Blob) => new Promise<string>((res, rej) => {
  const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = rej; r.readAsDataURL(f)
})
// Fotos: reduz para no máx. 2000px mantendo o QR legível. PDFs vão como estão (até 3 MB).
const compressImage = (f: File) => new Promise<string>((resolve, reject) => {
  const img = new Image()
  img.onload = () => {
    const scale = Math.min(1, 2000 / Math.max(img.width, img.height))
    const c = document.createElement('canvas')
    c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale)
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
    resolve(c.toDataURL('image/jpeg', 0.92))
    URL.revokeObjectURL(img.src)
  }
  img.onerror = reject
  img.src = URL.createObjectURL(f)
})

const upload = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const f = input.files?.[0]
  input.value = ''
  const d = trip.value.docs.find((x) => x.id === target.value)
  if (!f || !d) return
  const isPdf = f.type === 'application/pdf'
  if (!isPdf && !f.type.startsWith('image/')) return show('Envie um PDF ou uma foto')
  if (isPdf && f.size > 3_000_000) return show('PDF muito grande (máx. 3 MB). Tente um print da tela ou um PDF menor.')
  busy.value = d.id
  try {
    const dataUrl = isPdf ? await readAsDataUrl(f) : await compressImage(f)
    const { id } = await api<{ id: string }>('/api/admin/files', { method: 'POST', body: { dataUrl } })
    d.fileId = id
    d.fileName = isPdf ? f.name : f.name.replace(/\.[a-z0-9]+$/i, '') + '.jpg'
    d.mime = isPdf ? 'application/pdf' : 'image/jpeg'
    show('Arquivo enviado ✓')
  } catch (err: any) {
    show(err?.statusMessage || err?.data?.statusMessage || 'Não foi possível enviar o arquivo')
  } finally {
    busy.value = ''
  }
}
</script>

<style scoped>
.tg { display: grid; gap: 14px; }
.tg__top { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.tg__hint { font-size: .85rem; color: #16693a; background: #eefaf3; padding: 4px 10px; border-radius: 999px; }
.tg__pin { display: flex; gap: 6px; }
.tg__pin input { font-size: 1.15rem; letter-spacing: 4px; font-weight: 700; text-align: center; }
.tg__send { display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap; }
h4 { font-family: var(--ff-head); color: var(--c-primary); font-size: .95rem; margin-top: 4px; }
.tg__doc { border: 1.5px solid var(--c-line); border-radius: 12px; padding: 12px; display: grid; gap: 10px; }
.tg__file { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tg__fname { display: inline-flex; align-items: center; gap: 6px; font-size: .88rem; color: var(--c-primary); font-weight: 600; }
.spacer { flex: 1; }
.tg__add { display: flex; gap: 6px; flex-wrap: wrap; }
.tg__add .btn { border-style: dashed; }
.tg__col { display: grid; gap: 12px; }
code { background: var(--c-bg-soft); padding: 1px 6px; border-radius: 6px; }
</style>
