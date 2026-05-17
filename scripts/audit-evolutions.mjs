// One-off audit : nos évolutions (public/decomp/em/evolutions.json,
// consommé par src/engine/data/game-data.ts getEvolutions) vs décomp 1:1
// (src/data/pokemon/evolution.h gEvolutionTable). Une dérive = un Pokémon
// n'évolue pas / mal en jeu (ancien bug : EVO_ITEM param=ITEM_* droppé →
// Eevee + toutes les pierres n'évoluaient pas). Read-only. Recompute
// INDÉPENDANT (parser distinct) + diff ordonné method/param/target +
// vérif ensemble de clés identique.
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const EVO = `${DEC}/src/data/pokemon/evolution.h`;
const ITEMS = `${DEC}/include/constants/items.h`;
const J = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/evolutions.json';

const ours = JSON.parse(readFileSync(J, 'utf8'));
const evoSrc = readFileSync(EVO, 'utf8');
const itemSrc = readFileSync(ITEMS, 'utf8');

const itemId = {};
for (const m of itemSrc.matchAll(/^#define\s+(ITEM_[A-Z0-9_]+)\s+(\d+)\s*$/gm)) itemId[m[1]] = Number(m[2]);

// Corps du tableau, puis chaque [SPECIES_X] = { ... } via scan d'accolades.
const tblM = evoSrc.match(/gEvolutionTable\s*\[[^\]]*\]\s*\[[^\]]*\]\s*=\s*\{([\s\S]*)\}\s*;/);
const body = tblM ? tblM[1] : evoSrc;
const decomp = {};
const re = /\[(SPECIES_\w+)\]\s*=\s*\{/g;
let m;
while ((m = re.exec(body)) !== null) {
  const sp = m[1];
  let depth = 1, i = re.lastIndex;
  for (; i < body.length && depth > 0; i++) {
    if (body[i] === '{') depth++;
    else if (body[i] === '}') depth--;
  }
  const inner = body.slice(re.lastIndex, i - 1);
  const evos = [];
  for (const em of inner.matchAll(/\{\s*(EVO_\w+)\s*,\s*([A-Za-z0-9_]+)\s*,\s*(SPECIES_\w+)\s*\}/g)) {
    const method = em[1];
    if (method === 'EVO_NONE') continue;
    const p = em[2];
    let param;
    if (/^0x[\da-fA-F]+$/.test(p)) param = parseInt(p, 16);
    else if (/^\d+$/.test(p)) param = parseInt(p, 10);
    else if (p in itemId) param = itemId[p];
    else param = `__UNRESOLVED_${p}__`;
    evos.push({ method, param, target: em[3] });
  }
  if (evos.length > 0) decomp[sp] = evos;
}

let compared = 0, mismatches = 0, missingInOurs = 0, badSpecies = 0;
const bad = [];
const decKeys = Object.keys(decomp).sort();
const ourKeys = Object.keys(ours).sort();
if (decKeys.join(',') !== ourKeys.join(',')) {
  const miss = decKeys.filter((k) => !ours[k]);
  const extra = ourKeys.filter((k) => !decomp[k]);
  if (miss.length) { mismatches++; bad.push(`espèces manquantes chez nous (${miss.length}): ${miss.slice(0, 20).join(',')}`); }
  if (extra.length) { mismatches++; bad.push(`espèces en trop chez nous (${extra.length}): ${extra.slice(0, 20).join(',')}`); }
}
for (const [sp, dEvos] of Object.entries(decomp)) {
  const o = ours[sp];
  if (!o) { missingInOurs++; continue; }
  compared++;
  let sBad = false;
  if (o.length !== dEvos.length) {
    sBad = true;
    bad.push(`${sp}: length ours=${o.length} decomp=${dEvos.length}`);
  }
  const n = Math.min(o.length, dEvos.length);
  for (let k = 0; k < n; k++) {
    const a = o[k], b = dEvos[k];
    if (String(a.method) !== b.method || Number(a.param) !== Number(b.param) || String(a.target) !== b.target) {
      sBad = true;
      if (bad.length < 60) bad.push(`${sp}[${k}]: ours=${JSON.stringify(a)} decomp=${JSON.stringify(b)}`);
    }
  }
  if (sBad) { mismatches++; badSpecies++; }
}
console.log(`[audit evolutions] decompSpecies=${Object.keys(decomp).length} oursSpecies=${ourKeys.length} compared=${compared} missingInOurs=${missingInOurs} badSpecies=${badSpecies} mismatches=${mismatches}`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad.slice(0, 60)) console.log('  ' + b); }
else console.log('✓ 0 mismatch — évolutions extraites 1:1 décomp (méthode/param/cible).');
process.exit(mismatches ? 1 : 0);
