// Banco de fotos por destino — fotos do Unsplash com licença gratuita para uso comercial
// (https://unsplash.com/license). Selecionadas e conferidas uma a uma; fotos "Unsplash+" (pagas)
// e fotos com marcas registradas ficaram de fora. Para incluir mais: acrescente uma linha P(...).

export interface BankPhoto { id: string; by: string }
export interface BankPlace { name: string; country: string; keywords: string[]; photos: BankPhoto[] }

/** Apelidos que ajudam a encontrar o destino pelo nome digitado na proposta */
const ALIASES: Record<string, string[]> = {
  'Rio de Janeiro': ['rio', 'copacabana', 'ipanema', 'cristo redentor', 'pao de acucar'],
  'São Paulo': ['sao paulo', 'sampa'],
  'Foz do Iguaçu': ['iguacu', 'iguazu', 'cataratas'],
  'Salvador': ['bahia', 'pelourinho'],
  'Florianópolis': ['floripa'],
  'Fernando de Noronha': ['noronha'],
  'Lençóis Maranhenses': ['lencois', 'barreirinhas'],
  'Jericoacoara': ['jeri'],
  'Balneário Camboriú': ['camboriu'],
  'Porto de Galinhas': ['ipojuca'],
  'Isla Margarita': ['margarita', 'porlamar', 'pampatar'],
  'Los Roques': ['roques'],
  'Morrocoy': ['tucacas', 'chichiriviche'],
  'Cartagena': ['cartagena de indias'],
  'San Andrés': ['san andres'],
  'Tayrona': ['tairona'],
  'Eje Cafetero / Salento': ['salento', 'cocora', 'armenia', 'pereira', 'quindio', 'eje cafetero'],
  'Guatapé': ['penol', 'el penol'],
  'Cusco / Machu Picchu': ['cusco', 'cuzco', 'machu picchu', 'vale sagrado'],
  'Punta Cana': ['bavaro', 'republica dominicana'],
  'Cancún': ['riviera maya', 'playa del carmen', 'tulum'],
  'Cidade do Panamá': ['panama', 'ciudad de panama'],
  'Nova York': ['new york', 'nueva york', 'nyc', 'manhattan'],
  'Lisboa': ['lisbon'],
  'Madri': ['madrid'],
  'Roma': ['rome'],
  'Hotel · piscina': ['hotel', 'resort', 'piscina'],
  'Hotel · quarto': ['hotel', 'quarto', 'habitacion'],
  'Praia paradisíaca': ['praia', 'playa', 'beach', 'caribe'],
  'Avião': ['aviao', 'avion', 'voo', 'vuelo', 'passagem'],
  'Cruzeiro': ['crucero', 'navio'],
  'Passeio de barco': ['barco', 'lancha', 'bote']
}

const P = (name: string, country: string, photos: string[]): BankPlace => ({
  name,
  country,
  keywords: ALIASES[name] || [],
  photos: photos.map((s) => {
    const [id, by] = s.split('|')
    return { id: `photo-${id}`, by }
  })
})

export const PHOTO_BANK: BankPlace[] = [
  P('Rio de Janeiro', 'Brasil', ['1483729558449-99ef09a8c325|Agustin Diaz Gargiulo', '1516306580123-e6e52b1b7b5f|Raphael Nogueira', '1518639192441-8fce0a366e2e|Raphael Nogueira', '1544991337-95176b5233c4|Davi Costa', '1643400813604-b3877e0c4db9|Luis Diego Aguilar']),
  P('São Paulo', 'Brasil', ['1554168848-228452c09d60|Renan', '1561592390-42c07289e9cb|Lucas Marcomini', '1561592390-ec0391c9c723|Lucas Marcomini']),
  P('Foz do Iguaçu', 'Brasil', ['1604626676599-e21a94462216|Jaime Dantas', '1614949260630-1d8a27791215|Douglas Lopez', '1590246300072-2e8ad75c57d5|Christhian Gruhn', '1587845858725-81d43f65121b|Ondrej Bocek']),
  P('Salvador', 'Brasil', ['1524943890419-892660e224f9|Milo Miloezger', '1546536635-e3c6b5941a63|Marcus Alves', '1605735846938-af537a09ac4f|Roberto Huczek', '1515898034510-821b204966e4|Pedro Menezes', '1589711769108-5aaf6de20ca6|William Freitas']),
  P('Florianópolis', 'Brasil', ['1577727385788-0a17874094c3|Beatriz Beltrame', '1531518835120-2248364aa851|Tiago Muraro', '1565574337618-b08146e94992|Eduardo Zmievski']),
  P('Fortaleza', 'Brasil', ['1604955083894-2a27e1879732|Jaime Dantas', '1604954433815-28af57d7501a|Jaime Dantas', '1615332263430-87407c5b345a|Alexandre Barbosa', '1604954434554-c19a5258f9e1|Jaime Dantas']),
  P('Natal', 'Brasil', ['1604973655948-09d9105b1a4e|Jaime Dantas', '1604973656963-8471bb65dba6|Jaime Dantas']),
  P('Maceió', 'Brasil', ['1626794467452-937f5100a9f5|André Magalhães', '1614761069588-bd4ec336b4f9|William Freitas']),
  P('Porto de Galinhas', 'Brasil', ['1582132887861-5bec067fa929|Sonia Nadales', '1698760042513-3378a8c062bb|Mayumi Maciel']),
  P('Recife', 'Brasil', ['1582125455304-fe0f50e94d80|Silvia Mc Donald', '1584289488698-6f7b099c9ae0|thiago japyassu', '1612383892465-153167840470|Datingjungle']),
  P('Fernando de Noronha', 'Brasil', ['1532393950032-b666e39c29b3|Rudney Uezu', '1562708851-9c2c2768e277|Alex Braga', '1614723267704-86f4122a43ad|Ze Paulo', '1567537351071-88fc3da80466|Roberto Silva', '1560829046-86d0441301eb|Alex Braga']),
  P('Gramado', 'Brasil', ['1541531946226-e2797e9a686a|Diego Carneiro', '1579794623063-80a3f6a7d42d|Cayetano Gros', '1629337451516-504864885a69|Eelco Böhtlingk']),
  P('Bonito', 'Brasil', ['1711752945107-7b82d588ecc3|Azzedine Rouichi', '1711238295567-af8c6cb5c3bc|Azzedine Rouichi', '1678067250512-6aab0c663c8c|Rafael Vianna Croffi']),
  P('Lençóis Maranhenses', 'Brasil', ['1509228105826-2d09109f16bc|Roi Dimor', '1561422419-9120edee6a9e|Marcus Dall Col', '1562289166-b452ddeb2011|Marcus Dall Col']),
  P('Jericoacoara', 'Brasil', ['1520257328559-2062fc7de0b3|Raphael Nogueira', '1534360711679-f2d802cb8946|Lucas Campoi', '1518083769225-b7c743135b19|Micaela Parente']),
  P('Manaus', 'Brasil', ['1520464399004-1f1e8e938bb3|Tadeu Jnr', '1677114603445-0baea88a9af6|Marcus Dall Col']),
  P('Curitiba', 'Brasil', ['1576368436128-8046b44339e0|Alice Yamamura', '1601997476064-f44852383201|Vitor Mendes Stafusa', '1616642325314-fe17e194b380|camila figueiredo']),
  P('Balneário Camboriú', 'Brasil', ['1511225771260-3767ac2414fd|Luis Fernando Oliveira', '1705065217971-67d74f1e0544|Rafael Sales', '1639402142542-5a1bd55609a0|Danilo Vilhena', '1668104494309-1a87c44ba14c|Merlin Assogba']),
  P('Brasília', 'Brasil', ['1598882949753-4d2a8b61ebbe|Thandy Yung', '1625426078245-6911839409dd|Ramon Buçard', '1594056891098-b098f52664d6|Daniel Costa']),
  P('Caracas', 'Venezuela', ['1509915964737-a47c5aefdcc0|Jonathan Mendez', '1575540782119-0bf88a2ace17|Matthias Mullie']),
  P('Isla Margarita', 'Venezuela', ['1532202509491-ee922e576bb8|Martha Dominguez de Gouveia', '1650316933766-481c045d8802|Alondra Lucia']),
  P('Los Roques', 'Venezuela', ['1637407412556-9a29c2d6793e|Jorge Brito', '1637407411845-fbfaa0d08923|Jorge Brito', '1637407410723-8c32f6884043|Jorge Brito']),
  P('Mérida', 'Venezuela', ['1634520009705-8f732d945c64|Solanger Mendoza', '1692933930594-10d83684fa29|Pedro Romero', '1692973497068-34c230eabeff|Pedro Romero', '1692847957016-bd1ecd442a92|Pedro Romero']),
  P('Morrocoy', 'Venezuela', ['1722532354250-cdcc00a6f7fa|Eduardo Juhyun Kim', '1722272983424-f3080194f43f|Eduardo Juhyun Kim']),
  P('Bogotá', 'Colômbia', ['1568632234157-ce7aecd03d0d|Random Institute', '1568632234180-0e6c08735d01|Random Institute', '1561165804-08ddb43c659f|Jorge Gardner', '1622432866666-26f106904a19|Alejandro Alfaro M', '1607245800462-955a85640559|Santiago Boada']),
  P('Cartagena', 'Colômbia', ['1536308037887-165852797016|Ricardo Gomez Angel', '1583531352515-8884af319dc1|Leandro Loureiro', '1534035265253-afe22046ba98|Ricardo Gomez Angel', '1656130727374-e99edc2b8ba4|Jose Fuentes', '1651421479936-e24edc3e3143|Luis Desiro']),
  P('Medellín', 'Colômbia', ['1520501247332-6fb052b72414|Néstor Morales', '1512250431446-d0b4b57b27ec|Joel Duncan', '1515366974328-f1181eb25189|Juan Saravia', '1590598016835-83cf3357ebc5|Mike Swigunski']),
  P('San Andrés', 'Colômbia', ['1576475510454-b0af18970e6d|Darren Lawrence', '1592782985575-a96c6e647155|Tatiana Zanon', '1585927432326-949bc9e7e7a0|Guido Coppa']),
  P('Santa Marta', 'Colômbia', ['1467500979910-c55a80c59e48|Alejandro Ortiz', '1580670418997-46950c4877df|Azzedine Rouichi', '1533406129549-d664f406c25f|Christian Holzinger', '1612815867823-85cf0957890b|Azzedine Rouichi']),
  P('Tayrona', 'Colômbia', ['1635079552384-dd8adecd8a7c|Levi Ari Pronk', '1647644595953-b8b5a5a85c30|Yves Alarie']),
  P('Cali', 'Colômbia', ['1522812865094-5c856f116942|Andres F. Uran', '1728588519059-a62e06050425|Juan Manuel Gonzalez Restrepo']),
  P('Eje Cafetero / Salento', 'Colômbia', ['1557733686-45c927db98e9|Brian Kyed', '1631134950135-ab17ef088779|Backroad Packers', '1693357483341-204143afdeb7|Nicole Arango Lang', '1631137697490-f43817277ebd|Julian Florez']),
  P('Guatapé', 'Colômbia', ['1532443603613-61fa154742cd|Fernanda Fierro', '1539617546058-a8f9510b464e|Robin Noguier', '1525088299396-2417f1366edd|Milo Miloezger', '1568489711036-9c94a7d5aea6|Jan Kronies']),
  P('Barranquilla', 'Colômbia', ['1564399331650-bbfe2aac0a04|Urip Dunker', '1579833886879-e2a40d333d20|Aider Barrios']),
  P('Villa de Leyva', 'Colômbia', ['1613498248726-8922766cebdb|Datingjungle', '1611781638782-0d3cae1cd22e|Alejandro Ortiz', '1653069789763-a533095ff56c|Freysteinn G. Jonsson']),
  P('Buenos Aires', 'Argentina', ['1528392175875-4ce3ab32663c|Andrea Leopardi', '1612294037637-ec328d0e075e|Barbara Zandoval', '1586354822120-bf910e563cdf|Francisco Ghisletti']),
  P('Bariloche', 'Argentina', ['1575393476573-6cdacd2e8c88|Emilio Luján', '1598162480222-b2c3d92548d5|Delfina Iacub', '1617548437735-92d875423353|Emilio Luján']),
  P('Santiago', 'Chile', ['1557974040-3bec341da09b|Agustín Ljósmyndun', '1566079463188-97d2f1352582|Caio Silva', '1689850543263-01a52ccc6943|Chalo Gallardo']),
  P('Lima', 'Peru', ['1531968455001-5c5272a41129|Willian Justen de Vasconcellos', '1577587230708-187fdbef4d91|Aarom Ore', '1533655481656-8f79f05f04e7|Willian Justen de Vasconcellos']),
  P('Cusco / Machu Picchu', 'Peru', ['1531065208531-4036c0dba3ca|Sebastian Tapia Huerta', '1666240073343-9801b7b5b949|Denisse Leon', '1543385426-191664295b58|Fabien Moliné', '1587595431973-160d0d94add1|Eddie Kiszka']),
  P('Punta Cana', 'República Dominicana', ['1551126892-7cf2e2d9a4d9|Melisa Popanicic', '1534612899740-55c821a90129|Shawn Lee', '1538683270504-3d09ad7ae739|Bryan Angelo', '1546708973-b339540b5162|John Prefer']),
  P('Cancún', 'México', ['1457537227909-08f41319e53c|Joe Cooke', '1602088113235-229c19758e9f|David Vives', '1565358720137-55235e0878a2|Jess Torre']),
  P('Cidade do Panamá', 'Panamá', ['1540610410855-b4c8877b761c|Yosi Bitran', '1550010411-eafe277dd3a9|David Barajas', '1548739699-ec48e06cdea1|Francisco Rioseco', '1587759301533-ae42d7065a80|Fabrice Parchet']),
  P('Aruba', 'Aruba', ['1625736102294-96f0268f49de|Lex Melony', '1633421332483-1aa89f0c6b9a|Kiril Georgiev', '1558117338-c0a08d13eb32|Paulo Evangelista']),
  P('Curaçao', 'Curaçao', ['1548113457-932ab55d23d9|Alex Bello', '1636517031771-46f4032c895f|Cole Marshall', '1648512558254-562df2f2e86a|Aron Marinelli']),
  P('Miami', 'EUA', ['1533106497176-45ae19e68ba2|Ryan Spencer', '1514214246283-d427a95c5d2f|aurora.kreativ', '1605723517503-3cadb5818a0c|Denys Kostyuchenko', '1589083130544-0d6a2926e519|Antonio Cuellar']),
  P('Orlando', 'EUA', ['1584765844382-5521d1a0e534|Brian McGowan']),
  P('Nova York', 'EUA', ['1480714378408-67cf0d13bc1b|ben o\'bro', '1496442226666-8d4d0e62e6e9|Luca Bravo', '1499092346589-b9b6be3e94b2|Patrick Tomasso', '1518235506717-e1ed3306a89b|Mike Chavarri']),
  P('Lisboa', 'Portugal', ['1525207934214-58e69a8f8a3e|Andreas Brücker', '1501927023255-9063be98970c|Liam McKay', '1585208798174-6cedd86e019a|Aayush Gupta', '1558102400-72da9fdbecae|Svetlana Gumerova']),
  P('Madri', 'Espanha', ['1539037116277-4db20889f2d4|Florian Wehde', '1543783207-ec64e4d95325|Jorge Fernández Salas', '1501525776-246410718e63|Abbie Bernet']),
  P('Paris', 'França', ['1502602898657-3e91760cbb34|Chris Karidis', '1492136344046-866c85e0bf04|Jad Limcaco', '1583265266785-aab9e443ee68|Fabien Maurin']),
  P('Roma', 'Itália', ['1509024644558-2f56ce76c490|Dario Veronesi', '1511163262182-1b04e5fa4caa|Mauricio Artieda', '1552432552-06c0b0a94dda|David Libeert']),
  P('Hotel · piscina', 'Genéricas', ['1623718649591-311775a30c43|Cory Bjork', '1610641818989-c2051b5e2cfd|Fabio Fistarol', '1669694575282-03ed7faf6360|Ruth Bourke']),
  P('Hotel · quarto', 'Genéricas', ['1562438668-bcf0ca6578f0|刘 强', '1512918728675-ed5a9ecdebfd|Frames For Your Heart', '1590381105924-c72589b9ef3f|Rod Long', '1611892440504-42a792e24d32|visualsofdana']),
  P('Praia paradisíaca', 'Genéricas', ['1541417904950-b855846fe074|Nattu Adnan', '1587320754512-da4dbc717fc7|Dorsa Masghati', '1546526380-252a1fb1e9aa|Isa Jokela-Gomes']),
  P('Avião', 'Genéricas', ['1487253031786-9989fcd7bb73|Jakob Owens', '1542776488-a3bbacfcdccd|Lex Sirikiat']),
  P('Cruzeiro', 'Genéricas', ['1511316695145-4992006ffddb|Peter Hansen', '1554254648-2d58a1bc3fd5|Alonso Reyes', '1559599746-8823b38544c6|Alonso Reyes']),
  P('Passeio de barco', 'Genéricas', ['1605692498957-f1045e808732|Hugh Whyte', '1618578907040-e8e81b085dfb|Shelby Cohron'])
]

/** URL otimizada da foto (Unsplash redimensiona e comprime) */
export const photoUrl = (id: string, w = 1600) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`

const norm = (s: string) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** Busca livre no banco (nome, país ou apelido) */
export const placeMatches = (p: BankPlace, q: string) => {
  const n = norm(q)
  if (!n) return true
  const hay = norm([p.name, p.country, ...p.keywords].join(' '))
  return hay.includes(n) || [p.name, ...p.keywords].some((k) => n.includes(norm(k.split(' / ')[0])))
}

/** Destino do banco que corresponde à cidade da proposta (ex.: "Cartagena de Indias", "Caracas (CCS)") */
export const findPlace = (city: string) => {
  const c = norm(city.replace(/\(.*?\)/g, ''))
  if (c.length < 3) return undefined
  return PHOTO_BANK.find(
    (p) =>
      p.country !== 'Genéricas' &&
      [...p.name.split(' / '), ...p.keywords].some((k) => {
        const nk = norm(k)
        // igual, cidade contém o nome ("Cartagena de Indias"), ou nome começa com o digitado (5+ letras)
        return c === nk || (nk.length >= 3 && c.includes(nk)) || (c.length >= 5 && nk.startsWith(c))
      })
  )
}
