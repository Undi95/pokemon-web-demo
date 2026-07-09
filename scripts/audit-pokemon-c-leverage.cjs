// Mesure le LEVIER : quelle pièce, déplacée vers src/pokemon.ts, débloque le plus.
// 1) Surface d'import des symboles "core" mon-data (GetMonData/SetMonData/arrays/struct).
// 2) Combien des fns pokemon.c "AILLEURS/MANQUANT" utilisent GetMonData (→ same-file si déplacé).
// 3) Les deux foyers : importateurs de engine/pokemon/pokemon (PokemonInstance) vs flat.
const fs = require('fs');
const path = require('path');
const ROOT = 'D:/Projet 1/pokemon-web-demo';

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name.endsWith('.ts')) acc.push(p);
  }
  return acc;
}
const files = [...walk(path.join(ROOT, 'src'), []), ...walk(path.join(ROOT, 'harness'), [])]
  .map(f => ({ f: path.relative(ROOT, f).split(path.sep).join('/'), t: fs.readFileSync(f, 'utf8') }));

// --- 1) importateurs (multiline-safe : regex sur tout le contenu) d'un symbole depuis party-storage ---
function importersFromPartyStorage(sym) {
  const re = new RegExp('import[^;]*\\b' + sym + '\\b[^;]*party-storage', 's');
  return files.filter(({ f, t }) => f !== 'src/engine/battle/party-storage.ts' && re.test(t)).map(x => x.f);
}
// --- importateurs (toutes sources) qui USENT le symbole en call/usage ---
function usersOf(sym) {
  const re = new RegExp('(^|[^.\\w])' + sym + '\\s*\\(', 's');
  return files.filter(({ t }) => re.test(t)).map(x => x.f);
}

const CORE = ['GetMonData', 'SetMonData', 'gPlayerParty', 'gEnemyParty', 'CalculatePlayerPartyCount', 'CreateMon'];
console.log('=== 1) Surface d\'import depuis party-storage (= churn si on déplace) ===');
for (const sym of CORE) {
  const imp = importersFromPartyStorage(sym);
  console.log(sym.padEnd(26) + ' importé par ' + String(imp.length).padStart(3) + ' fichiers');
}

// --- 2) Parmi les fns pokemon.c non-mirroir, combien usent GetMonData/SetMonData ? ---
const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit-reports/pokemon-c-audit.json'), 'utf8'));
const nonMirror = rows.filter(r => r.status !== 'MIRROR');
// Cherche dans party-storage.ts le corps de chaque fn AILLEURS pour voir si elle use GetMonData.
const psBody = files.find(x => x.f === 'src/engine/battle/party-storage.ts').t;
let useGMD = 0, total = 0;
for (const r of rows.filter(r => r.status === 'AILLEURS' && r.where.includes('party-storage'))) {
  total++;
  const m = psBody.match(new RegExp('function\\s+' + r.name + '\\s*\\([^]*?\\n\\}', 'm'));
  if (m && /\bGetMonData\b|\bSetMonData\b/.test(m[0])) useGMD++;
}
console.log('\n=== 2) Fns pokemon.c "AILLEURS dans party-storage" qui usent GetMonData/SetMonData ===');
console.log(useGMD + ' / ' + total + ' (= deviendraient SAME-FILE si GetMonData vivait dans pokemon.ts)');

// --- 3) Les deux foyers ---
const instImporters = files.filter(({ f, t }) => f !== 'src/engine/pokemon/pokemon.ts'
  && /import[^;]*from\s*['"][^'"]*engine\/pokemon\/pokemon['"]/s.test(t)).map(x => x.f);
const pokInstUsers = usersOf('createPokemonInstance').concat(usersOf('makePokemonInstanceView'));
console.log('\n=== 3) Deux foyers ===');
console.log('Importateurs de engine/pokemon/pokemon.ts (monde PokemonInstance string-enum) : ' + instImporters.length);
console.log('  → ' + instImporters.slice(0, 18).join(', ') + (instImporters.length > 18 ? ' …' : ''));

// --- 4) total fichiers touchant party-storage ---
const psImporters = files.filter(({ f, t }) => f !== 'src/engine/battle/party-storage.ts'
  && /from\s*['"][^'"]*party-storage['"]/s.test(t)).map(x => x.f);
console.log('\n=== 4) Total fichiers important party-storage.ts (le hub actuel) : ' + psImporters.length + ' ===');
