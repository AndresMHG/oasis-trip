<template>
  <div class="fd">
    <!-- Trajeto com as conexões e o tempo de espera em cada uma -->
    <ol v-if="flight.connections?.length" class="fd__route">
      <li class="fd__stop">
        <strong>{{ flight.departTime || '—' }}</strong>
        <span>{{ t.departsFrom }} {{ flight.origin }}</span>
      </li>
      <li v-for="c in flight.connections" :key="c.id" class="fd__conn">
        <span class="fd__conn-title"><Icon name="clock" :size="14" /> {{ t.connectionIn }} {{ c.airport }}</span>
        <small>
          {{ [c.arrive && `${t.arrives} ${c.arrive}`, c.depart && `${t.departs} ${c.depart}`].filter(Boolean).join(' · ') }}
          <b v-if="layoverMinutes(c.arrive, c.depart)"> · {{ fmtMinutes(layoverMinutes(c.arrive, c.depart)) }} {{ t.ofWait }}</b>
        </small>
      </li>
      <li class="fd__stop">
        <strong>{{ flight.arriveTime || '—' }}</strong>
        <span>{{ t.arrivesAt }} {{ flight.destination }}</span>
      </li>
    </ol>

    <!-- Tarifa deste voo, em poucas linhas -->
    <div v-if="fare" class="fd__fare">
      <p class="fd__fare-name"><Icon name="shield" :size="15" /> {{ t.fareShort }}<template v-if="fare.name">: <strong>{{ fare.name }}</strong></template></p>
      <p v-if="included.length" class="fd__inc"><Icon name="check" :size="14" :stroke="2.6" /> {{ included.join(' · ') }}</p>
      <p v-if="notIncluded.length && included.length" class="fd__not">{{ t.notIncludedShort }}: {{ notIncluded.join(', ').toLowerCase() }}</p>
      <p v-if="fare.change" class="fd__rule"><i :class="`dot dot--${FARE_TONE.change[fare.change]}`" /> <span><b>{{ t.fareChange }}:</b> {{ changeText }}</span></p>
      <p v-if="fare.cancel" class="fd__rule"><i :class="`dot dot--${FARE_TONE.cancel[fare.cancel]}`" /> <span><b>{{ t.fareCancel }}:</b> {{ cancelText }}</span></p>
      <p v-if="fare.notes" class="fd__note">{{ fare.notes }}</p>
    </div>

    <p v-if="flight.notes" class="fd__note pre">{{ flight.notes }}</p>
  </div>
</template>

<script setup lang="ts">
import { FARE_FEATURES, FARE_TONE, fmtMinutes, layoverMinutes, money, type Currency, type Flight, type Lang } from '~/utils/proposal'

const props = defineProps<{ flight: Flight; t: any; currency: Currency; lang: Lang }>()
const fare = computed(() => props.flight.fare)
const included = computed(() => FARE_FEATURES.filter((f) => fare.value?.features?.[f]).map((f) => props.t.fareFeatures[f]))
const notIncluded = computed(() => FARE_FEATURES.filter((f) => !fare.value?.features?.[f]).map((f) => props.t.fareFeatures[f]))
const fee = (v: number) => (v ? ` · ${props.t.feePerPerson(money(v, props.currency, props.lang))}` : '')
const changeText = computed(() => {
  const f = fare.value!
  const base = props.t.changeRule[f.change] + (f.change === 'fee' ? fee(f.changeFee) : '')
  return f.change === 'no' ? base : `${base} ${props.t.fareDiff}`
})
const cancelText = computed(() => {
  const f = fare.value!
  return props.t.cancelRule[f.cancel] + (f.cancel === 'fee' ? fee(f.cancelFee) : '')
})
</script>

<style scoped>
.fd { display: grid; gap: 12px; padding-top: 4px; font-size: .88rem; color: var(--c-text); }
.fd p { margin: 0; }
.fd__route { list-style: none; margin: 0; padding: 0 0 0 14px; border-left: 2px dashed var(--c-line); display: grid; gap: 10px; }
.fd__stop { position: relative; display: flex; gap: 8px; align-items: baseline; }
.fd__stop::before { content: ''; position: absolute; left: -20px; top: 5px; width: 10px; height: 10px; border-radius: 50%; background: var(--c-primary); }
.fd__stop strong { font-family: var(--ff-head); color: var(--c-primary); }
.fd__conn { position: relative; display: grid; gap: 1px; background: #fff7ef; border-radius: 10px; padding: 8px 10px; }
.fd__conn::before { content: ''; position: absolute; left: -19px; top: 12px; width: 8px; height: 8px; border-radius: 50%; background: var(--c-accent); }
.fd__conn-title { display: flex; align-items: center; gap: 5px; font-weight: 600; color: #8a4b12; }
.fd__conn small { color: var(--c-gray); }
.fd__conn b { color: #8a4b12; }
.fd__fare { display: grid; gap: 5px; background: var(--c-bg-soft); border-radius: 12px; padding: 10px 12px; }
.fd__fare-name { display: flex; align-items: center; gap: 6px; color: var(--c-primary); }
.fd__inc { display: flex; gap: 6px; align-items: flex-start; color: #16693a; }
.fd__inc svg { flex: none; margin-top: 3px; }
.fd__not { color: var(--c-gray); font-size: .82rem; }
.fd__rule { display: flex; gap: 8px; align-items: flex-start; }
.dot { flex: none; width: 8px; height: 8px; border-radius: 50%; margin-top: 7px; }
.dot--good { background: var(--c-ok); }
.dot--mid { background: #e0a100; }
.dot--bad { background: var(--c-danger); }
.fd__note { color: var(--c-gray); font-size: .84rem; }
</style>
