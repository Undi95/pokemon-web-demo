#!/usr/bin/env node
// unify-constants-lot7.cjs — dissout les `export const` du fourre-tout
// engine/battle/constants.ts vers les headers-miroirs include/*.
// - DUP-SAME (déjà dans include/, même valeur) → ré-export depuis include.
// - ABSENT avec header de section connu → APPEND au header-miroir (section
//   délimitée « Compléments unification lot 7 ») + ré-export.
// - Section sans header mappé / fonctions / macros → restent en place.
// Idempotent-ish : à ne lancer QU'UNE fois (vérifier git diff après).
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const SRC = path.join(root, 'src/engine/battle/constants.ts');

// header décomp (tel que cité dans les commentaires de section) → fichier include
const HDR = {
  'battle.h': 'include/battle.ts',
  'constants/battle.h': 'include/constants/battle.ts',
  'battle_script_commands.h': 'include/battle_script_commands.ts',
  'battle_string_ids.h': 'include/constants/battle_string_ids.ts',
  'pokemon.h': 'include/constants/pokemon.ts', // sections "(pokemon.h:...)" = constants/pokemon.h de fait (TYPE_*, stats)
  'constants/pokemon.h': 'include/constants/pokemon.ts',
  'abilities.h': 'include/constants/abilities.ts',
  'constants/hold_effects.h': 'include/constants/hold_effects.ts',
  'hold_effects.h': 'include/constants/hold_effects.ts',
  'battle_move_effects.h': 'include/constants/battle_move_effects.ts',
  'constants/global.h': 'include/constants/global.ts',
  'global.h': 'include/constants/global.ts',
  'battle_pyramid.h': 'include/constants/battle_pyramid.ts',
  'moves.h': 'include/constants/moves.ts',
  'constants/moves.h': 'include/constants/moves.ts',
  'species.h': 'include/constants/species.ts',
  'constants/species.h': 'include/constants/species.ts',
};

const src = fs.readFileSync(SRC, 'utf8');
const lines = src.split('\n');

// 1. Index include/ existant (nom → fichier relatif)
const incIndex = new Map();
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.ts')) {
      const txt = fs.readFileSync(p, 'utf8');
      const re = /export (?:const|function) ([A-Za-z0-9_]+)/g;
      let m;
      while ((m = re.exec(txt))) if (!incIndex.has(m[1])) incIndex.set(m[1], path.relative(root, p).replace(/\\/g, '/'));
    }
  }
})(path.join(root, 'include'));

// 2. Parcours ligne à ligne : sections + const (avec leur doc/commentaire attaché)
let curHdr = null;
const keep = [];          // lignes restantes dans constants.ts
const moves = new Map();  // fichier include → [{name, block}]
const reexports = [];     // {name, from}
let i = 0;
const constStart = /^export const ([A-Za-z0-9_]+)\s*=/;
function sectionHeader(line) {
  const m = line.match(/\(([a-z0-9_/]+\.h)[:)]/i);
  return m ? m[1] : null;
}
while (i < lines.length) {
  const line = lines[i];
  if (/^\/\/ ───/.test(line)) { curHdr = sectionHeader(line); keep.push(line); i++; continue; }
  const cm = line.match(constStart);
  if (!cm) { keep.push(line); i++; continue; }
  const name = cm[1];
  // bloc complet de la const (jusqu'au ';' final) + doc /** */ ou // juste au-dessus
  let start = i, end = i;
  while (!/;\s*(\/\/.*)?$/.test(lines[end]) && end < lines.length - 1) end++;
  let docStart = start;
  for (let j = keep.length - 1; j >= 0; j--) {
    const k = keep[j];
    if (/^\s*(\/\/[^─]|\/\*\*|\s*\*)/.test(k) && !/^\/\/ ───/.test(k)) { docStart = j; }
    else break;
  }
  const doc = keep.splice(docStart === start ? keep.length : docStart);
  const block = doc.concat(lines.slice(start, end + 1)).join('\n');
  i = end + 1;

  const incFile = incIndex.get(name);
  if (incFile) {
    reexports.push({ name, from: incFile });          // DUP-SAME (0 DUP-DIFF vérifié par l'oracle)
  } else if (curHdr && HDR[curHdr]) {
    const dest = HDR[curHdr];
    if (!moves.has(dest)) moves.set(dest, []);
    moves.get(dest).push({ name, block });
    reexports.push({ name, from: dest.replace(/\.ts$/, '') });
  } else {
    keep.push(...doc, ...lines.slice(start, end + 1)); // pas de destination sûre → reste
  }
}

// 3. Appends aux headers-miroirs
for (const [dest, items] of moves) {
  const p = path.join(root, dest);
  let txt = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : `// ${dest} — miroir 1:1 décomp (créé unification lot 7)\n`;
  txt = txt.replace(/^\/\/ AUTO-GENERATED[^\n]*\n\/\/ Do not edit[^\n]*\n/m,
    (s) => s.replace('AUTO-GENERATED', 'EX-AUTO-GENERATED (générateur disparu — complété manuellement)').replace('Do not edit manually — re-run `npm run extract:decomp-all` to refresh.', 'Compléments manuels autorisés (aucun script ne régénère include/ depuis avril 2026).'));
  txt += `\n// ─── Compléments (unification lot 7, 2026-07-10) — #define ${dest.includes('constants/') ? 'constants/' : ''}que l'ancien extracteur sautait (1<<N/composites), rapatriés de engine/battle/constants.ts ───\n`;
  for (const { block } of items) txt += block + '\n';
  fs.writeFileSync(p, txt);
  console.log(`+${items.length} → ${dest}`);
}

// 4. Nouveau constants.ts : ré-exports + résidu
const header = `/**
 * engine/battle/constants.ts — EN DISSOLUTION (unification lot 7).
 * Les constantes de headers décomp vivent dans include/* (source unique) ;
 * ce fichier ne fait plus que les RÉ-EXPORTER pour ses ~30 importeurs
 * historiques. Lot futur : re-router les importeurs et supprimer ce fichier.
 * Résidu légitime en bas : fonctions/macros + constantes sans header décomp.
 */
`;
const byFile = new Map();
for (const { name, from } of reexports) {
  const key = from.replace(/^include\//, '../../../include/').replace(/\.ts$/, '');
  if (!byFile.has(key)) byFile.set(key, []);
  byFile.get(key).push(name);
}
let out = header;
for (const [from, names] of byFile) {
  out += `export {\n  ${names.join(',\n  ')},\n} from '${from}';\n`;
}
out += '\n' + keep.join('\n');
fs.writeFileSync(SRC, out);
console.log(`constants.ts réécrit : ${reexports.length} ré-exports (${byFile.size} sources), résidu ${keep.length} lignes`);
