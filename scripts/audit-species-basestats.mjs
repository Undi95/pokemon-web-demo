// One-off audit : compare nos base stats extraites (public/decomp/em/
// species-info.json) vs la décomp 1:1 (src/data/pokemon/species_info.h).
// But : détecter toute dérive d'extraction (= un base stat faux fausse
// silencieusement TOUT calcul stat/damage). Pur read-only.
import { readFileSync } from 'node:fs';

const H = 'D:/Projet 1/decomps/pokeemeraude/src/data/pokemon/species_info.h';
const J = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/species-info.json';

const hSrc = readFileSync(H, 'utf8');
const ours = JSON.parse(readFileSync(J, 'utf8'));

// Parse chaque bloc [SPECIES_X] = { ... } (non-greedy jusqu'au '}' du niveau).
const decomp = {};
const re = /\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*\{/g;
let m;
while ((m = re.exec(hSrc)) !== null) {
  const name = m[1];
  // Récupère ~1500 chars après l'accolade (un bloc species fait < ça).
  const chunk = hSrc.slice(m.index, m.index + 1600);
  const g = (k) => { const mm = chunk.match(new RegExp('\\.' + k + '\\s*=\\s*(\\d+)')); return mm ? Number(mm[1]) : null; };
  decomp[name] = {
    hp: g('baseHP'), atk: g('baseAttack'), def: g('baseDefense'),
    spe: g('baseSpeed'), spa: g('baseSpAttack'), spd: g('baseSpDefense'),
  };
}

const STAT = ['hp', 'atk', 'def', 'spe', 'spa', 'spd'];
let compared = 0, mismatches = 0, missingInOurs = 0;
const bad = [];
for (const [name, d] of Object.entries(decomp)) {
  if (d.hp === null) continue; // bloc sans base stats (slot vide)
  const o = ours[name];
  if (!o || !o.stats) { missingInOurs++; continue; }
  compared++;
  for (const s of STAT) {
    if (o.stats[s] !== d[s]) {
      mismatches++;
      bad.push(`${name}.${s}: ours=${o.stats[s]} decomp=${d[s]}`);
    }
  }
}
console.log(`[audit species base stats] decompEntries=${Object.keys(decomp).length} compared=${compared} missingInOurs=${missingInOurs} mismatches=${mismatches}`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad.slice(0, 60)) console.log('  ' + b); }
else console.log('✓ 0 mismatch — base stats extraites 1:1 décomp.');
process.exit(mismatches ? 1 : 0);
