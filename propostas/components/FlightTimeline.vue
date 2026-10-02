<template>
  <div class="tlw">
  <!-- Linha do tempo do voo: cada parada em uma linha, com a espera entre os voos destacada -->
  <ol class="tl">
    <template v-for="(s, i) in steps" :key="i">
      <li v-if="s.type === 'point'" class="tl__pt" :class="{ end: s.end }">
        <span class="tl__time">{{ s.time || '--:--' }}<em v-if="s.nextDay">{{ t.tlNextDay }}</em></span>
        <span class="tl__dot" />
        <span class="tl__txt">
          <small>{{ s.label }}</small>
          <b>{{ s.place }}</b>
        </span>
      </li>
      <li v-else-if="s.type === 'leg'" class="tl__leg">
        <span class="tl__time" />
        <span class="tl__bar" />
        <span class="tl__txt"><Icon name="plane" :size="14" /> {{ s.label }}</span>
      </li>
      <li v-else class="tl__wait" :class="{ warn: s.short }">
        <span class="tl__time" />
        <span class="tl__bar tl__bar--wait" />
        <span class="tl__box">
          <b><Icon name="clock" :size="15" /> {{ t.tlWait }}{{ s.wait ? `: ${s.wait}` : '' }}<template v-if="s.short"> · {{ t.tlShortWait }}</template></b>
          <small>{{ t.tlChange }}</small>
        </span>
      </li>
    </template>
  </ol>
  <p class="tl__note"><Icon name="info" :size="13" /> {{ t.tlLocal }}</p>
  </div>
</template>

<script setup lang="ts">
import { fmtMinutes, layoverMinutes, type Flight, type Lang } from '~/utils/proposal'

const props = defineProps<{ flight: Flight; lang: Lang }>()
const { t } = useProposalText(() => props.lang)

type Step =
  | { type: 'point'; time: string; place: string; label: string; nextDay: boolean; end?: boolean }
  | { type: 'leg'; label: string }
  | { type: 'wait'; wait: string; short: boolean }

const mins = (s: string) => {
  const [h, m] = (s || '').split(':').map(Number)
  return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN
}

const steps = computed<Step[]>(() => {
  const f = props.flight
  const conns = (f.connections || []).filter((c) => c.airport)
  const out: Step[] = []
  // Marca "+1 dia" quando o horário "volta" (passou da meia-noite)
  let last = mins(f.departTime)
  let nextDay = false
  const mark = (time: string) => {
    const m = mins(time)
    if (!Number.isNaN(m) && !Number.isNaN(last) && m < last) nextDay = true
    if (!Number.isNaN(m)) last = m
    return nextDay
  }
  out.push({ type: 'point', time: f.departTime, place: f.origin, label: t.value.tlDepart, nextDay: false })
  conns.forEach((c, i) => {
    out.push({ type: 'leg', label: t.value.tlFlight(i + 1) })
    out.push({ type: 'point', time: c.arrive, place: c.airport, label: t.value.tlArrive, nextDay: mark(c.arrive) })
    const w = layoverMinutes(c.arrive, c.depart)
    out.push({ type: 'wait', wait: fmtMinutes(w), short: w > 0 && w < 60 })
    out.push({ type: 'point', time: c.depart, place: c.airport, label: t.value.tlDepart, nextDay: mark(c.depart) })
  })
  out.push({ type: 'leg', label: t.value.tlFlight(conns.length + 1) })
  out.push({ type: 'point', time: f.arriveTime, place: f.destination, label: t.value.tlArrive, nextDay: mark(f.arriveTime), end: true })
  return out
})
</script>

<style scoped>
.tl { list-style: none; margin: 0; padding: 0; display: grid; }
.tl li { display: grid; grid-template-columns: 62px 18px 1fr; column-gap: 10px; align-items: center; }
.tl__time { font-family: var(--ff-head); font-size: 1.15rem; font-weight: 700; color: var(--c-primary); text-align: right; line-height: 1.1; }
.tl__time em { display: block; font-style: normal; font-size: .68rem; font-weight: 700; color: #b45309; }
.tl__dot { width: 14px; height: 14px; border-radius: 50%; border: 3px solid var(--c-primary); background: #fff; justify-self: center; }
.tl__pt.end .tl__dot { background: var(--c-primary); }
.tl__txt { display: grid; min-width: 0; padding: 4px 0; }
.tl__txt small { font-size: .7rem; text-transform: uppercase; letter-spacing: .6px; color: var(--c-gray); font-weight: 600; }
.tl__txt b { color: var(--c-text); font-size: .95rem; overflow-wrap: anywhere; }
.tl__leg .tl__txt { display: flex; align-items: center; gap: 5px; font-size: .78rem; color: var(--c-primary-300); font-weight: 600; padding: 2px 0; }
.tl__bar { width: 3px; height: 100%; min-height: 26px; background: var(--c-primary-300); justify-self: center; border-radius: 2px; }
.tl__bar--wait { background: repeating-linear-gradient(to bottom, var(--c-accent) 0 4px, transparent 4px 8px); }
.tl__box { display: grid; gap: 2px; margin: 6px 0; padding: 9px 12px; border-radius: 12px; background: #fff7ef; border: 1px solid #f6d7b8; }
.tl__box b { display: flex; align-items: center; gap: 6px; color: #8a4b12; font-size: .9rem; }
.tl__box small { color: #8a5a2b; font-size: .78rem; }
.tl__wait.warn .tl__box { background: #fff1f0; border-color: #f5c2bd; }
.tl__wait.warn .tl__box b { color: #b42318; }
.tl__note { display: flex; align-items: center; gap: 5px; margin: 6px 0 0; font-size: .74rem; color: var(--c-gray); }
</style>
