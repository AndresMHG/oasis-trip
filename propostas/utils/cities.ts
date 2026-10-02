// Cidades e aeroportos para a sugestão de preenchimento (Saindo de, Destino, voos e conexões).
// Formato: [cidade, código IATA, país]. Para incluir mais, acrescente uma linha.

export interface City { name: string; iata: string; country: string; label: string; search: string }

const RAW: [string, string, string][] = [
  // Brasil — Sul
  ['Curitiba', 'CWB', 'Brasil'], ['Foz do Iguaçu', 'IGU', 'Brasil'], ['Londrina', 'LDB', 'Brasil'],
  ['Maringá', 'MGF', 'Brasil'], ['Cascavel', 'CAC', 'Brasil'], ['Ponta Grossa', 'PGZ', 'Brasil'],
  ['Florianópolis', 'FLN', 'Brasil'], ['Navegantes', 'NVT', 'Brasil'], ['Joinville', 'JOI', 'Brasil'],
  ['Chapecó', 'XAP', 'Brasil'], ['Jaguaruna', 'JJG', 'Brasil'], ['Porto Alegre', 'POA', 'Brasil'],
  ['Caxias do Sul', 'CXJ', 'Brasil'], ['Passo Fundo', 'PFB', 'Brasil'], ['Pelotas', 'PET', 'Brasil'],
  // Brasil — Sudeste
  ['São Paulo', 'GRU', 'Brasil'], ['São Paulo', 'CGH', 'Brasil'], ['Campinas', 'VCP', 'Brasil'],
  ['Ribeirão Preto', 'RAO', 'Brasil'], ['São José do Rio Preto', 'SJP', 'Brasil'], ['Presidente Prudente', 'PPB', 'Brasil'],
  ['Rio de Janeiro', 'GIG', 'Brasil'], ['Rio de Janeiro', 'SDU', 'Brasil'], ['Cabo Frio', 'CFB', 'Brasil'],
  ['Belo Horizonte', 'CNF', 'Brasil'], ['Uberlândia', 'UDI', 'Brasil'], ['Montes Claros', 'MOC', 'Brasil'],
  ['Juiz de Fora', 'IZA', 'Brasil'], ['Vitória', 'VIX', 'Brasil'],
  // Brasil — Centro-Oeste
  ['Brasília', 'BSB', 'Brasil'], ['Goiânia', 'GYN', 'Brasil'], ['Cuiabá', 'CGB', 'Brasil'],
  ['Campo Grande', 'CGR', 'Brasil'], ['Bonito', 'BYO', 'Brasil'], ['Caldas Novas', 'CLV', 'Brasil'],
  // Brasil — Nordeste
  ['Salvador', 'SSA', 'Brasil'], ['Porto Seguro', 'BPS', 'Brasil'], ['Ilhéus', 'IOS', 'Brasil'],
  ['Recife', 'REC', 'Brasil'], ['Fernando de Noronha', 'FEN', 'Brasil'], ['Fortaleza', 'FOR', 'Brasil'],
  ['Jericoacoara', 'JJD', 'Brasil'], ['Natal', 'NAT', 'Brasil'], ['João Pessoa', 'JPA', 'Brasil'],
  ['Maceió', 'MCZ', 'Brasil'], ['Aracaju', 'AJU', 'Brasil'], ['São Luís', 'SLZ', 'Brasil'],
  ['Teresina', 'THE', 'Brasil'], ['Petrolina', 'PNZ', 'Brasil'], ['Juazeiro do Norte', 'JDO', 'Brasil'],
  // Brasil — Norte
  ['Manaus', 'MAO', 'Brasil'], ['Belém', 'BEL', 'Brasil'], ['Santarém', 'STM', 'Brasil'],
  ['Macapá', 'MCP', 'Brasil'], ['Boa Vista', 'BVB', 'Brasil'], ['Porto Velho', 'PVH', 'Brasil'],
  ['Rio Branco', 'RBR', 'Brasil'], ['Palmas', 'PMW', 'Brasil'],
  // Venezuela
  ['Caracas', 'CCS', 'Venezuela'], ['Maracaibo', 'MAR', 'Venezuela'], ['Valencia', 'VLN', 'Venezuela'],
  ['Barquisimeto', 'BRM', 'Venezuela'], ['Isla Margarita', 'PMV', 'Venezuela'], ['Barcelona', 'BLA', 'Venezuela'],
  ['Maturín', 'MUN', 'Venezuela'], ['Puerto Ordaz', 'PZO', 'Venezuela'], ['Mérida', 'MRD', 'Venezuela'],
  ['San Antonio del Táchira', 'SVZ', 'Venezuela'], ['Los Roques', 'LRV', 'Venezuela'], ['Canaima', 'CAJ', 'Venezuela'],
  // Colômbia
  ['Bogotá', 'BOG', 'Colômbia'], ['Medellín', 'MDE', 'Colômbia'], ['Cartagena', 'CTG', 'Colômbia'],
  ['Cali', 'CLO', 'Colômbia'], ['Barranquilla', 'BAQ', 'Colômbia'], ['Santa Marta', 'SMR', 'Colômbia'],
  ['San Andrés', 'ADZ', 'Colômbia'], ['Pereira', 'PEI', 'Colômbia'], ['Armenia', 'AXM', 'Colômbia'],
  ['Bucaramanga', 'BGA', 'Colômbia'], ['Cúcuta', 'CUC', 'Colômbia'],
  // América do Sul
  ['Buenos Aires', 'EZE', 'Argentina'], ['Buenos Aires', 'AEP', 'Argentina'], ['Córdoba', 'COR', 'Argentina'],
  ['Mendoza', 'MDZ', 'Argentina'], ['Bariloche', 'BRC', 'Argentina'], ['Ushuaia', 'USH', 'Argentina'],
  ['El Calafate', 'FTE', 'Argentina'], ['Salta', 'SLA', 'Argentina'], ['Puerto Iguazú', 'IGR', 'Argentina'],
  ['Rosario', 'ROS', 'Argentina'],
  ['Santiago', 'SCL', 'Chile'], ['Puerto Natales', 'PNT', 'Chile'], ['Punta Arenas', 'PUQ', 'Chile'],
  ['Calama (Atacama)', 'CJC', 'Chile'], ['Puerto Montt', 'PMC', 'Chile'], ['Ilha de Páscoa', 'IPC', 'Chile'],
  ['Montevidéu', 'MVD', 'Uruguai'], ['Punta del Este', 'PDP', 'Uruguai'],
  ['Assunção', 'ASU', 'Paraguai'], ['Ciudad del Este', 'AGT', 'Paraguai'],
  ['Lima', 'LIM', 'Peru'], ['Cusco', 'CUZ', 'Peru'], ['Arequipa', 'AQP', 'Peru'],
  ['La Paz', 'LPB', 'Bolívia'], ['Santa Cruz de la Sierra', 'VVI', 'Bolívia'], ['Uyuni', 'UYU', 'Bolívia'],
  ['Quito', 'UIO', 'Equador'], ['Guayaquil', 'GYE', 'Equador'], ['Galápagos', 'GPS', 'Equador'],
  // América Central e Caribe
  ['Cidade do Panamá', 'PTY', 'Panamá'], ['San José', 'SJO', 'Costa Rica'], ['Liberia', 'LIR', 'Costa Rica'],
  ['San Salvador', 'SAL', 'El Salvador'], ['Cidade da Guatemala', 'GUA', 'Guatemala'],
  ['Punta Cana', 'PUJ', 'República Dominicana'], ['Santo Domingo', 'SDQ', 'República Dominicana'],
  ['Havana', 'HAV', 'Cuba'], ['Varadero', 'VRA', 'Cuba'], ['Aruba', 'AUA', 'Aruba'], ['Curaçao', 'CUR', 'Curaçao'],
  ['Montego Bay', 'MBJ', 'Jamaica'], ['San Juan', 'SJU', 'Porto Rico'],
  // México
  ['Cidade do México', 'MEX', 'México'], ['Cancún', 'CUN', 'México'], ['Guadalajara', 'GDL', 'México'],
  ['Monterrey', 'MTY', 'México'], ['Los Cabos', 'SJD', 'México'], ['Puerto Vallarta', 'PVR', 'México'],
  // Estados Unidos e Canadá
  ['Miami', 'MIA', 'Estados Unidos'], ['Orlando', 'MCO', 'Estados Unidos'], ['Fort Lauderdale', 'FLL', 'Estados Unidos'],
  ['Nova York', 'JFK', 'Estados Unidos'], ['Nova York', 'EWR', 'Estados Unidos'], ['Boston', 'BOS', 'Estados Unidos'],
  ['Washington', 'IAD', 'Estados Unidos'], ['Atlanta', 'ATL', 'Estados Unidos'], ['Chicago', 'ORD', 'Estados Unidos'],
  ['Dallas', 'DFW', 'Estados Unidos'], ['Houston', 'IAH', 'Estados Unidos'], ['Las Vegas', 'LAS', 'Estados Unidos'],
  ['Los Angeles', 'LAX', 'Estados Unidos'], ['San Francisco', 'SFO', 'Estados Unidos'], ['Seattle', 'SEA', 'Estados Unidos'],
  ['Toronto', 'YYZ', 'Canadá'], ['Montreal', 'YUL', 'Canadá'], ['Vancouver', 'YVR', 'Canadá'],
  // Europa
  ['Lisboa', 'LIS', 'Portugal'], ['Porto', 'OPO', 'Portugal'], ['Faro', 'FAO', 'Portugal'], ['Funchal (Madeira)', 'FNC', 'Portugal'],
  ['Madri', 'MAD', 'Espanha'], ['Barcelona', 'BCN', 'Espanha'], ['Sevilha', 'SVQ', 'Espanha'], ['Málaga', 'AGP', 'Espanha'],
  ['Valência', 'VLC', 'Espanha'], ['Palma de Mallorca', 'PMI', 'Espanha'], ['Tenerife', 'TFS', 'Espanha'],
  ['Paris', 'CDG', 'França'], ['Paris', 'ORY', 'França'], ['Nice', 'NCE', 'França'], ['Lyon', 'LYS', 'França'],
  ['Londres', 'LHR', 'Reino Unido'], ['Londres', 'LGW', 'Reino Unido'], ['Edimburgo', 'EDI', 'Reino Unido'], ['Dublin', 'DUB', 'Irlanda'],
  ['Roma', 'FCO', 'Itália'], ['Milão', 'MXP', 'Itália'], ['Veneza', 'VCE', 'Itália'], ['Florença', 'FLR', 'Itália'], ['Nápoles', 'NAP', 'Itália'],
  ['Amsterdã', 'AMS', 'Holanda'], ['Bruxelas', 'BRU', 'Bélgica'], ['Frankfurt', 'FRA', 'Alemanha'], ['Munique', 'MUC', 'Alemanha'],
  ['Berlim', 'BER', 'Alemanha'], ['Zurique', 'ZRH', 'Suíça'], ['Genebra', 'GVA', 'Suíça'], ['Viena', 'VIE', 'Áustria'],
  ['Praga', 'PRG', 'República Tcheca'], ['Budapeste', 'BUD', 'Hungria'], ['Atenas', 'ATH', 'Grécia'], ['Santorini', 'JTR', 'Grécia'],
  ['Istambul', 'IST', 'Turquia'], ['Copenhague', 'CPH', 'Dinamarca'], ['Estocolmo', 'ARN', 'Suécia'], ['Oslo', 'OSL', 'Noruega'],
  ['Helsinque', 'HEL', 'Finlândia'], ['Reykjavik', 'KEF', 'Islândia'], ['Varsóvia', 'WAW', 'Polônia'],
  // Oriente Médio, África, Ásia e Oceania
  ['Dubai', 'DXB', 'Emirados Árabes'], ['Abu Dhabi', 'AUH', 'Emirados Árabes'], ['Doha', 'DOH', 'Catar'],
  ['Tel Aviv', 'TLV', 'Israel'], ['Cairo', 'CAI', 'Egito'], ['Marrakech', 'RAK', 'Marrocos'], ['Casablanca', 'CMN', 'Marrocos'],
  ['Joanesburgo', 'JNB', 'África do Sul'], ['Cidade do Cabo', 'CPT', 'África do Sul'], ['Luanda', 'LAD', 'Angola'],
  ['Maldivas (Malé)', 'MLE', 'Maldivas'], ['Tóquio', 'NRT', 'Japão'], ['Tóquio', 'HND', 'Japão'], ['Seul', 'ICN', 'Coreia do Sul'],
  ['Pequim', 'PEK', 'China'], ['Xangai', 'PVG', 'China'], ['Hong Kong', 'HKG', 'China'], ['Singapura', 'SIN', 'Singapura'],
  ['Bangkok', 'BKK', 'Tailândia'], ['Phuket', 'HKT', 'Tailândia'], ['Bali (Denpasar)', 'DPS', 'Indonésia'],
  ['Sydney', 'SYD', 'Austrália'], ['Melbourne', 'MEL', 'Austrália'], ['Auckland', 'AKL', 'Nova Zelândia']
]

/** Sem acentos e em minúsculas — para "sao paulo" achar "São Paulo" */
export const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export const CITIES: City[] = RAW.map(([name, iata, country]) => ({
  name, iata, country,
  label: `${name} (${iata})`,
  search: fold(`${name} ${iata} ${country}`)
}))

/** Até `limit` sugestões: começa com o texto digitado primeiro, depois as que contêm */
export function searchCities(term: string, limit = 8): City[] {
  const q = fold(term)
  if (!q) return []
  const starts: City[] = []
  const contains: City[] = []
  for (const c of CITIES) {
    const n = fold(c.name)
    if (n.startsWith(q) || c.iata.toLowerCase() === q) starts.push(c)
    else if (c.search.includes(q)) contains.push(c)
  }
  return [...starts, ...contains].slice(0, limit)
}

/** País de um valor como "Caracas (CCS)" ou "Caracas" — vazio se não reconhecer */
export function countryOf(value: string): string {
  const v = fold(value || '')
  if (!v) return ''
  const code = /\(([a-z]{3})\)\s*$/.exec(v)?.[1]
  const hit = CITIES.find((c) => (code ? c.iata.toLowerCase() === code : fold(c.name) === v))
  return hit?.country || ''
}
