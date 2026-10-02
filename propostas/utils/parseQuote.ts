// Lê o texto copiado de uma cotação (site da consolidadora, companhia aérea, Google Voos…)
// e monta os voos: companhia, aeroportos, conexões, datas, horários, duração, escalas, bagagem e preço.
// Funciona por "pistas" — o que não for reconhecido fica em branco para preencher à mão.
import { CITIES } from './cities'
import { AIRLINES, newFlight, uid, type Connection, type Flight } from './proposal'

export interface ParsedQuote {
  flights: Flight[]
  /** Preço total encontrado (quando não dá para separar por voo) */
  total: number
  /** Avisos para o usuário conferir */
  notes: string[]
}

const IATA = new Map(CITIES.map((c) => [c.iata, c.label]))
// Códigos que parecem aeroporto mas não são
const NOT_IATA = new Set(['BRL', 'USD', 'EUR', 'CLP', 'COP', 'ARS', 'PEN', 'VES', 'MXN', 'DOP', 'CPF', 'RG', 'PIX', 'TAP', 'GOL', 'IDA', 'VOO', 'DIA', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'AM', 'PM', 'KG', 'ADT', 'CHD', 'INF', 'OK', 'LTD', 'SA', 'NDC', 'GDS', 'PNR', 'TAX', 'YQ', 'YR', 'FEE', 'BAG', 'ECO', 'EXE', 'MIN', 'HRS', 'NAO', 'SIM', 'UTC', 'GMT', 'CIA', 'VIA', 'RS', 'LOC', 'ATÉ', 'NÃO', 'DEZ', 'JAN', 'FEV', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEC', 'FEB', 'APR', 'MAY', 'AUG', 'SEP', 'OCT', 'ENE'])
const MONTHS: Record<string, number> = {
  jan: 1, janeiro: 1, ene: 1, enero: 1, january: 1,
  fev: 2, fevereiro: 2, feb: 2, febrero: 2, february: 2,
  mar: 3, marco: 3, março: 3, marzo: 3, march: 3,
  abr: 4, abril: 4, apr: 4, april: 4,
  mai: 5, maio: 5, may: 5, mayo: 5,
  jun: 6, junho: 6, junio: 6, june: 6,
  jul: 7, julho: 7, julio: 7, july: 7,
  ago: 8, agosto: 8, aug: 8, august: 8,
  set: 9, setembro: 9, sep: 9, sept: 9, septiembre: 9, september: 9,
  out: 10, outubro: 10, oct: 10, octubre: 10, october: 10,
  nov: 11, novembro: 11, noviembre: 11, november: 11,
  dez: 12, dezembro: 12, dic: 12, diciembre: 12, dec: 12, december: 12
}
const MONTH_RE = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join('|')
const CONN_LINE = /conex[aã]o|conexi[oó]n|connection|layover|escala (?:em|en)|parada (?:em|en)|troca de avi[aã]o|cambio de avi[oó]n/i
const AIRLINE_ALIASES: [RegExp, string][] = [
  [/\bcopa\b/i, 'Copa Airlines'], [/\blatam\b/i, 'LATAM'], [/\bgol\b/i, 'GOL'], [/\bazul\b/i, 'Azul'],
  [/\bavianca\b/i, 'Avianca'], [/\bwingo\b/i, 'Wingo'], [/\blaser\b/i, 'Laser Airlines'], [/\bconviasa\b/i, 'Conviasa'],
  [/\bestelar\b/i, 'Estelar'], [/aerol[ií]neas argentinas/i, 'Aerolíneas Argentinas'], [/\bamerican\b/i, 'American Airlines'],
  [/\bunited\b/i, 'United'], [/\bdelta\b/i, 'Delta'], [/\btap\b/i, 'TAP Air Portugal'], [/\biberia\b/i, 'Iberia'],
  [/air europa/i, 'Air Europa'], [/jetsmart/i, 'JetSMART'], [/\bsky\b/i, 'Sky Airline'], [/\bavior\b/i, 'Avior'],
  [/\bturpial\b/i, 'Turpial'], [/air france/i, 'Air France'], [/\bklm\b/i, 'KLM'], [/\bemirates\b/i, 'Emirates'],
  [/qatar/i, 'Qatar Airways'], [/lufthansa/i, 'Lufthansa'], [/arajet/i, 'Arajet'], [/\bboa\b/i, 'BoA']
]
const LEG_RE = /^\s*(?:voo\s+de\s+|vuelo\s+de\s+)?(ida|volta|vuelta|regreso|retorno|partida|outbound|return|departure|trecho\s*\d|tramo\s*\d)\b/i

type Ev =
  | { k: 'airport'; v: string; i: number }
  | { k: 'time'; v: string; i: number }
  | { k: 'date'; v: string; i: number }
  | { k: 'duration'; v: string; i: number }
  | { k: 'airline'; v: string; i: number }
  | { k: 'price'; v: number; i: number }
  | { k: 'stops'; v: string; i: number }
  | { k: 'baggage'; v: string; i: number }
  | { k: 'conn'; v: string; i: number; times: string[] }

const pad = (n: number) => String(n).padStart(2, '0')
const time24 = (h: number, m: number, ap?: string) => {
  if (ap) { const pm = /p/i.test(ap); if (pm && h < 12) h += 12; if (!pm && h === 12) h = 0 }
  return h < 24 && m < 60 ? `${pad(h)}:${pad(m)}` : ''
}
const money = (s: string) => {
  // "1.234,56" (BR) | "1,234.56" (US) | "1234"
  const t = s.replace(/\s/g, '')
  const br = /,\d{2}$/.test(t) || /^\d{1,3}(\.\d{3})+$/.test(t)
  const n = br ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '')
  return Number(n) || 0
}

function scan(text: string, year: number): Ev[] {
  const ev: Ev[] = []
  const lines = text.replace(/\r/g, '').split('\n')
  let pos = 0
  for (const raw of lines) {
    const line = raw.replace(/ /g, ' ')
    const at = (m: RegExpExecArray) => pos + m.index
    let m: RegExpExecArray | null
    // Trecho (Ida / Volta) → marcador de separação
    if (LEG_RE.test(line)) ev.push({ k: 'stops', v: '__leg__:' + LEG_RE.exec(line)![1].toLowerCase(), i: pos })
    // Preço
    const priceRe = /(?:R\$|BRL|US\$|USD|\$)\s*([\d.,]+\d)|([\d.]+,\d{2})\s*(?:BRL|reais)/gi
    while ((m = priceRe.exec(line))) ev.push({ k: 'price', v: money(m[1] || m[2]), i: at(m) })
    // Duração (9h 40min, 9h40, 9 hr 40 min, 9:40h)
    const durRe = /\b(\d{1,2})\s*(?:h|hr|hrs|horas?)\s*(?:e\s*)?(\d{1,2})?\s*(?:m|min|mins|minutos)?\b/gi
    const durs: [number, number][] = []
    while ((m = durRe.exec(line))) {
      // ignora "06h40" usado como horário quando não há palavra de duração e há outro horário
      const isClock = /^\d{2}h\d{2}$/i.test(m[0].replace(/\s/g, '')) && !/dura|tempo|total|viagem/i.test(line)
      if (isClock) continue
      ev.push({ k: 'duration', v: `${Number(m[1])}h${m[2] ? ` ${Number(m[2])}min` : ''}`, i: at(m) })
      durs.push([m.index, m.index + m[0].length])
    }
    // Horários (06:40, 6:40 AM, 06h40)
    const timeRe = /\b(\d{1,2})(?::|h)(\d{2})\s*(a\.?\s?m\.?|p\.?\s?m\.?)?(?!\s*(?:min|m\b|kg))/gi
    while ((m = timeRe.exec(line))) {
      if (durs.some(([a, b]) => m!.index >= a && m!.index < b)) continue
      const t = time24(Number(m[1]), Number(m[2]), m[3])
      if (t) ev.push({ k: 'time', v: t, i: at(m) })
    }
    // Datas: 18/12/2026, 18/12, 18 dez, 18 de dezembro, Dec 18
    const dRe = new RegExp(`\\b(\\d{1,2})\\/(\\d{1,2})(?:\\/(\\d{2,4}))?\\b|\\b(\\d{1,2})\\s*(?:de\\s+)?(${MONTH_RE})\\.?(?:\\s*(?:de\\s+)?(\\d{4}))?(?![a-zç])|\\b(${MONTH_RE})\\.?\\s+(\\d{1,2})(?:,?\\s*(\\d{4}))?\\b`, 'gi')
    while ((m = dRe.exec(line))) {
      let d = 0, mo = 0, y = year
      if (m[1]) { d = +m[1]; mo = +m[2]; if (m[3]) y = +m[3] < 100 ? 2000 + +m[3] : +m[3] }
      else if (m[4]) { d = +m[4]; mo = MONTHS[m[5].toLowerCase()] || 0; if (m[6]) y = +m[6] }
      else if (m[7]) { mo = MONTHS[m[7].toLowerCase()] || 0; d = +m[8]; if (m[9]) y = +m[9] }
      const noYear = !(m[3] || m[6] || m[9])
      if (d >= 1 && d <= 31 && mo >= 1 && mo <= 12) {
        // Sem ano e já passou → é do ano que vem
        if (noYear && `${y}-${pad(mo)}-${pad(d)}` < new Date().toISOString().slice(0, 10)) y++
        ev.push({ k: 'date', v: `${y}-${pad(mo)}-${pad(d)}`, i: at(m) })
      }
    }
    // Aeroportos (códigos IATA em maiúsculas)
    const apRe = /(?<![A-Za-z])([A-Z]{3})(?![A-Za-z])/g
    const found: { c: string; i: number }[] = []
    while ((m = apRe.exec(line))) {
      const c = m[1]
      if (NOT_IATA.has(c)) continue
      // Código conhecido, ou desconhecido mas com cara de aeroporto (entre parênteses, setas ou hífen)
      const ctx = line.slice(Math.max(0, m.index - 2), m.index + 5)
      if (IATA.has(c) || /[(\-–→>]/.test(ctx)) found.push({ c, i: at(m) })
    }
    // Linha de conexão ("Conexão em PTY 10:15 - 11:35", ou "1 hr 20 min PTY" do Google Voos)
    const lineTimes = ev.filter((e) => e.k === 'time' && e.i >= pos && e.i < pos + raw.length)
    const isConn = found.length === 1 && (CONN_LINE.test(line) || (durs.length > 0 && !lineTimes.length && line.trim().length < 40))
    if (isConn) {
      // horários desta linha são da conexão; duração desta linha é a espera, não a do voo
      for (const e of lineTimes) ev.splice(ev.indexOf(e), 1)
      for (let j = ev.length - 1; j >= 0; j--) if (ev[j].k === 'duration' && ev[j].i >= pos && ev[j].i < pos + raw.length) ev.splice(j, 1)
      ev.push({ k: 'conn', v: found[0].c, i: found[0].i, times: lineTimes.map((e) => e.v as string) })
    } else for (const f of found) ev.push({ k: 'airport', v: f.c, i: f.i })
    // Companhia
    for (const [re, name] of AIRLINE_ALIASES) if ((m = re.exec(line))) ev.push({ k: 'airline', v: name, i: at(m) })
    for (const a of AIRLINES) {
      const i = line.toLowerCase().indexOf(a.toLowerCase())
      if (i >= 0 && !ev.some((e) => e.k === 'airline' && e.v === a && e.i >= pos && e.i < pos + line.length)) ev.push({ k: 'airline', v: a, i: pos + i })
    }
    // Escalas
    if ((m = /\b(direto|directo|sem escalas|sin escalas|non-?stop|nonstop)\b/i.exec(line))) ev.push({ k: 'stops', v: 'Direto', i: at(m) })
    if ((m = /\b(\d)\s*(paradas?|escalas?|conex(?:ão|ões|ion|iones|ao|oes)|stops?)\b/i.exec(line))) {
      const n = +m[1]; const word = /conex/i.test(m[2]) ? (n === 1 ? 'conexão' : 'conexões') : n === 1 ? 'escala' : 'escalas'
      ev.push({ k: 'stops', v: `${n} ${word}`, i: at(m) })
    }
    // Bagagem
    if (/despachad|facturad|checked bag|23\s?kg|bagagem inclu|equipaje inclu/i.test(line)) {
      const two = /\b2\s*(?:x\s*)?(?:malas?|bagagens?|maletas?|bags?|pe[cç]as?)\b/i.test(line)
      ev.push({ k: 'baggage', v: two ? '2 malas despachadas 23kg' : '1 mala despachada 23kg', i: pos })
    } else if (/mala de m[aã]o|bagagem de m[aã]o|equipaje de mano|carry-?on|10\s?kg/i.test(line)) {
      ev.push({ k: 'baggage', v: 'Mala de mão 10kg', i: pos })
    } else if (/artigo pessoal|art[ií]culo personal|personal item|item pessoal/i.test(line)) {
      ev.push({ k: 'baggage', v: 'Artigo pessoal', i: pos })
    }
    pos += raw.length + 1
  }
  return ev.sort((a, b) => a.i - b.i)
}

/** Separa os eventos em trechos: pelos marcadores Ida/Volta ou, sem eles, quando a rota volta ao início */
function split(ev: Ev[]): Ev[][] {
  const marks = ev.filter((e) => e.k === 'stops' && e.v.startsWith('__leg__'))
  const groups: Ev[][] = []
  if (marks.length >= 2) {
    let g: Ev[] = []
    for (const e of ev) {
      if (e.k === 'stops' && e.v.startsWith('__leg__')) { if (g.some((x) => x.k === 'airport' || x.k === 'time')) groups.push(g); g = [] } else g.push(e)
    }
    if (g.length) groups.push(g)
    return groups.filter((x) => x.some((e) => e.k === 'airport'))
  }
  // Sem marcadores: procura o ponto de retorno — a ida (O → … → D) espelhada na volta (D → … → O)
  const clean = ev.filter((e) => !(e.k === 'stops' && e.v.startsWith('__leg__')))
  const apEv = clean.filter((e) => e.k === 'airport')
  const seq = apEv.map((e) => e.v)
  const uniq = (l: string[]) => l.filter((x, i) => x !== l[i - 1])
  const mirror = (l: string[], r: string[]) => { const a = uniq(l), b = uniq(r); return a.length >= 2 && a.join() === [...b].reverse().join() }
  for (let p = 1; p < seq.length - 1; p++) {
    const dup = seq[p + 1] === seq[p]
    const left = seq.slice(0, p + 1)
    const right = seq.slice(dup ? p + 1 : p)
    if (seq[p] === seq[0] || !mirror(left, right)) continue
    // Corte: no 2º código repetido; sem repetição, logo depois do 1º horário após o destino
    let cut: number
    const firstT = clean.find((e) => e.k === 'time')
    const timeFirst = !!firstT && firstT.i < apEv[0].i
    const tAfter = clean.find((e) => e.k === 'time' && e.i > apEv[p].i)
    if (timeFirst && tAfter && (!dup || tAfter.i < apEv[p + 1].i)) cut = tAfter.i
    else if (dup) cut = apEv[p + 1].i
    else {
      const t = clean.find((e) => e.k === 'time' && e.i > apEv[p].i)
      cut = t ? t.i + 1 : apEv[p].i + 1
    }
    const L = clean.filter((e) => e.i < cut)
    const R = clean.filter((e) => e.i >= cut)
    if (!dup && !R.some((e) => e.k === 'airport' && e.v === seq[p] && e.i < (R.find((x) => x.k === 'airport')?.i ?? Infinity) + 1)) R.unshift({ ...apEv[p], i: cut - 0.5 })
    return [L, R]
  }
  return [clean]
}

const label = (code: string) => IATA.get(code) || code

function toFlight(g: Ev[]): Flight {
  const f = newFlight()
  const aps: string[] = []
  for (const e of g) if (e.k === 'airport' && aps[aps.length - 1] !== e.v) aps.push(e.v)
  const times = g.filter((e) => e.k === 'time').map((e) => e.v as string)
  f.airline = (g.find((e) => e.k === 'airline')?.v as string) || ''
  f.date = (g.find((e) => e.k === 'date')?.v as string) || ''
  f.duration = (g.find((e) => e.k === 'duration')?.v as string) || ''
  const stop = g.find((e) => e.k === 'stops' && !String(e.v).startsWith('__leg__'))?.v as string | undefined
  f.baggage = (g.find((e) => e.k === 'baggage')?.v as string) || ''
  if (aps.length) { f.origin = label(aps[0]); f.destination = label(aps[aps.length - 1]) }
  // Aeroportos do meio = conexões. Horários: 1º = saída, último = chegada, os do meio em pares (chega, sai)
  const mids = aps.slice(1, -1)
  if (times.length) { f.departTime = times[0]; if (times.length > 1) f.arriveTime = times[times.length - 1] }
  const inner = times.slice(1, -1)
  f.connections = mids.map((ap, i): Connection => ({
    id: uid(), airport: label(ap),
    arrive: inner[i * 2] || '', depart: inner[i * 2 + 1] || '', notes: '', price: 0
  }))
  // Conexões descritas em linha própria
  for (const c of g.filter((e): e is Extract<Ev, { k: 'conn' }> => e.k === 'conn')) {
    if (c.v === aps[0] || c.v === aps[aps.length - 1] || mids.includes(c.v)) continue
    f.connections.push({ id: uid(), airport: label(c.v), arrive: c.times[0] || '', depart: c.times[1] || '', notes: '', price: 0 })
  }
  const nConn = f.connections.length
  if (!f.connections.length) delete f.connections
  f.stops = nConn ? (nConn === 1 ? '1 conexão' : `${nConn} conexões`) : stop || 'Direto'
  const price = g.filter((e) => e.k === 'price').map((e) => e.v as number)
  f.price = price.length ? Math.max(...price) : 0
  return f
}

export function parseQuote(text: string, year = new Date().getFullYear()): ParsedQuote {
  const notes: string[] = []
  const ev = scan(text || '', year)
  const groups = split(ev)
  let flights = groups.map(toFlight).filter((f) => f.origin || f.departTime)
  // Companhia/bagagem aparecem uma vez só no texto → vale para todos os voos
  const airline = flights.find((f) => f.airline)?.airline
  const bag = flights.find((f) => f.baggage)?.baggage
  for (const f of flights) { f.airline ||= airline || ''; f.baggage ||= bag || '' }
  // Preço: um valor por voo, ou um total só (vai no 1º voo)
  const prices = ev.filter((e) => e.k === 'price').map((e) => e.v as number)
  const total = prices.length ? Math.max(...prices) : 0
  const perFlight = flights.filter((f) => f.price).length
  if (perFlight < flights.length || new Set(flights.map((f) => f.price)).size === 1) {
    flights.forEach((f, i) => (f.price = i === 0 ? total : 0))
    if (total && flights.length > 1) notes.push('O preço total foi colocado no 1º voo — confira se é por pessoa ou por todos.')
  }
  flights = flights.slice(0, 6)
  if (!flights.length) notes.push('Não encontrei voos neste texto. Confira se copiou a parte com horários e aeroportos.')
  if (flights.some((f) => !f.departTime || !f.arriveTime)) notes.push('Alguns horários ficaram em branco.')
  if (flights.some((f) => !f.date)) notes.push('Alguma data não foi encontrada.')
  return { flights, total, notes }
}
