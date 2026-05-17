// One-off audit : nos types + abilities d'espèce (public/decomp/em/
// species-info.json) vs décomp 1:1 (src/data/pokemon/species_info.h
// .types[2] / .abilities[2]). Le port AI (GetAbilityBySpecies, AI_TypeCalc,
// TypeCalc, ShouldSwitch absorb/wonderguard) + tout TypeCalc gameplay
// dépendent de ces 2 champs → une dérive casse silencieusement le 1:1.
// Pur read-only. Complète audit:species-stats.
//
// Parsing décomp = scan d'accolades APPARIÉES (PAS chunk fixe 1600c) :
// `[SPECIES_NONE] = {0},` single-line faisait avaler les .types/.abilities
// de SPECIES_BULBASAUR par un chunk fixe ; le même bug existait côté
// extraction → masquage mutuel (Bulbasaur DROPPÉE non détectée). De plus
// `missingInOurs` ne faisait pas échouer. Corrigé : depth-scan + fail si
// une vraie espèce manque de notre côté.
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
  const pair = (k) => {
    const mm = body.match(new RegExp('\\.' + k + '\\s*=\\s*\\{\\s*([A-Z0-9_]+)\\s*,\\s*([A-Z0-9_]+)\\s*\\}'));
    return mm ? [mm[1], mm[2]] : null;
  };
  decomp[name] = { types: pair('types'), abilities: pair('abilities') };
}

let compared = 0, mismatches = 0, missingInOurs = 0, badSpecies = 0;
const bad = [];
for (const [name, d] of Object.entries(decomp)) {
  if (!d.types && !d.abilities) continue;
  const o = ours[name];
  if (!o) {
    missingInOurs++;
    bad.push(`${name}: ABSENT de notre species-info.json (espèce réelle droppée à l'extraction)`);
    continue;
  }
  compared++;
  let sBad = false;
  if (d.types) {
    const ot = o.types || [];
    if (String(ot[0]) !== d.types[0] || String(ot[1]) !== d.types[1]) {
      sBad = true;
      if (bad.length < 60) bad.push(`${name}.types: ours=[${ot}] decomp=[${d.types}]`);
    }
  }
  if (d.abilities) {
    const oa = o.abilities || [];
    if (String(oa[0]) !== d.abilities[0] || String(oa[1]) !== d.abilities[1]) {
      sBad = true;
      if (bad.length < 60) bad.push(`${name}.abilities: ours=[${oa}] decomp=[${d.abilities}]`);
    }
  }
  if (sBad) { mismatches++; badSpecies++; }
}
const fail = badSpecies + missingInOurs;
console.log(`[audit species abilities/types] decompEntries=${Object.keys(decomp).length} compared=${compared} missingInOurs=${missingInOurs} badSpecies=${badSpecies}`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad.slice(0, 60)) console.log('  ' + b); }
else console.log('✓ 0 mismatch — types + abilities extraits 1:1 décomp (toutes espèces présentes).');
process.exit(fail ? 1 : 0);
