// One-off audit : compare nos base stats extraites (public/decomp/em/
// species-info.json) vs la décomp 1:1 (src/data/pokemon/species_info.h).
// But : détecter toute dérive d'extraction (= un base stat faux fausse
// silencieusement TOUT calcul stat/damage). Pur read-only.
//
// Parsing décomp = scan d'accolades APPARIÉES (PAS chunk fixe 1600c) :
// `[SPECIES_NONE] = {0},` single-line → un chunk fixe avalait le
// `.baseHP` de SPECIES_BULBASAUR (espèce #1) ; côté nous le même bug
// d'extraction existait → les 2 se masquaient (audit passait à tort,
// Bulbasaur DROPPÉE non détectée). De plus `missingInOurs` ne faisait
// PLUS échouer = angle mort. Corrigé : depth-scan + fail si une vraie
// espèce (avec .base) manque de notre côté.
import { readFileSync } from 'node:fs';

const H = 'D:/Projet 1/decomps/pokeemeraude/src/data/pokemon/species_info.h';
const J = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/species-info.json';

const hSrc = readFileSync(H, 'utf8');
const ours = JSON.parse(readFileSync(J, 'utf8'));

const decomp = {};
const re = /\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*\{/g;
let m;
while ((m = re.exec(hSrc)) !== null) {
  const name = m[1];
  let depth = 1, i = re.lastIndex;
  for (; i < hSrc.length && depth > 0; i++) {
    if (hSrc[i] === '{') depth++;
    else if (hSrc[i] === '}') depth--;
  }
  const body = hSrc.slice(re.lastIndex, i - 1);
  re.lastIndex = i;
  if (!body.includes('.base')) continue; // SPECIES_NONE / slot vide
  const g = (k) => { const mm = body.match(new RegExp('\\.' + k + '\\s*=\\s*(\\d+)')); return mm ? Number(mm[1]) : null; };
  decomp[name] = {
    hp: g('baseHP'), atk: g('baseAttack'), def: g('baseDefense'),
    spe: g('baseSpeed'), spa: g('baseSpAttack'), spd: g('baseSpDefense'),
  };
}

const STAT = ['hp', 'atk', 'def', 'spe', 'spa', 'spd'];
let compared = 0, mismatches = 0, missingInOurs = 0;
const bad = [];
for (const [name, d] of Object.entries(decomp)) {
  if (d.hp === null) continue; // sécurité (ne devrait plus arriver)
  const o = ours[name];
  if (!o || !o.stats) {
    missingInOurs++;
    bad.push(`${name}: ABSENT de notre species-info.json (espèce réelle droppée à l'extraction)`);
    continue;
  }
  compared++;
  for (const s of STAT) {
    if (o.stats[s] !== d[s]) {
      mismatches++;
      bad.push(`${name}.${s}: ours=${o.stats[s]} decomp=${d[s]}`);
    }
  }
}
const fail = mismatches + missingInOurs;
console.log(`[audit species base stats] decompEntries=${Object.keys(decomp).length} compared=${compared} missingInOurs=${missingInOurs} mismatches=${mismatches}`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad.slice(0, 60)) console.log('  ' + b); }
else console.log('✓ 0 mismatch — base stats extraites 1:1 décomp (toutes espèces présentes).');
process.exit(fail ? 1 : 0);
