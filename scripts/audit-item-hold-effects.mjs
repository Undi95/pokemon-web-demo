// One-off audit : nos hold-effects d'objet (public/decomp/em/items.json,
// consommé par battle/data/item-hold-effects.ts GetItemHoldEffect/Param)
// vs décomp 1:1 (src/data/items.h gItems[].holdEffect/.holdEffectParam +
// include/constants/hold_effects.h). GetItemHoldEffect pilote DIRECTEMENT
// CalculateBaseDamage (Choice Band ×1.5, Soul Dew, Deep Sea Tooth/Scale,
// Light Ball, Thick Club, Metal Powder, sHoldEffectToType…) → une dérive
// = dégâts FAUX vs ROM malgré la formule prouvée 1:1. Pur read-only.
// Compare la valeur RÉSOLUE (nom HOLD_EFFECT_* → id numérique) : catch
// aussi un nom non résolvable (= GetItemHoldEffect retournerait 0).
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const ITEMS_H = `${DEC}/src/data/items.h`;
const HE_H = `${DEC}/include/constants/hold_effects.h`;
const J = 'D:/Projet 1/pokemon-web-demo/public/decomp/em/items.json';

const ours = JSON.parse(readFileSync(J, 'utf8'));
const itemsSrc = readFileSync(ITEMS_H, 'utf8');
const heSrc = readFileSync(HE_H, 'utf8');

// 1) hold_effects.h : HOLD_EFFECT_X -> id numérique
const heId = {};
for (const m of heSrc.matchAll(/^#define\s+(HOLD_EFFECT_[A-Z0-9_]+)\s+(\d+)\s*$/gm)) {
  heId[m[1]] = Number(m[2]);
}

// 2) items.h : gItems[] { [ITEM_X] = { ... .holdEffect=.., .holdEffectParam=.. } }
//    Scan d'accolades appariées pour isoler chaque bloc item (multi-lignes).
const tblM = itemsSrc.match(/gItems\[\]\s*=\s*\{([\s\S]*)\}\s*;/);
const body = tblM ? tblM[1] : itemsSrc;
const decomp = {};
const re = /\[(ITEM_[A-Z0-9_]+)\]\s*=\s*\{/g;
let m;
while ((m = re.exec(body)) !== null) {
  const itemName = m[1];
  let depth = 1, i = re.lastIndex;
  for (; i < body.length && depth > 0; i++) {
    if (body[i] === '{') depth++;
    else if (body[i] === '}') depth--;
  }
  const inner = body.slice(re.lastIndex, i - 1);
  const heM = inner.match(/\.holdEffect\s*=\s*(HOLD_EFFECT_[A-Z0-9_]+)/);
  const hpM = inner.match(/\.holdEffectParam\s*=\s*(\d+)/);
  decomp[itemName] = {
    holdEffect: heM ? heM[1] : 'HOLD_EFFECT_NONE',
    holdEffectParam: hpM ? Number(hpM[1]) : 0,
  };
}

const resolve = (name) => (name in heId ? heId[name] : null);

let compared = 0, mismatches = 0, missingInOurs = 0, unresolved = 0;
const bad = [];
const decKeys = Object.keys(decomp).sort();
const ourKeys = Object.keys(ours).sort();
if (decKeys.length !== ourKeys.length || decKeys.join(',') !== ourKeys.join(',')) {
  const miss = decKeys.filter((k) => !(k in ours));
  const extra = ourKeys.filter((k) => !(k in decomp));
  if (miss.length) { mismatches++; bad.push(`items manquants chez nous (${miss.length}): ${miss.slice(0, 15).join(',')}`); }
  if (extra.length) { mismatches++; bad.push(`items en trop chez nous (${extra.length}): ${extra.slice(0, 15).join(',')}`); }
}
for (const [name, d] of Object.entries(decomp)) {
  const o = ours[name];
  if (!o) { missingInOurs++; continue; }
  compared++;
  const oName = o.holdEffect || 'HOLD_EFFECT_NONE';
  const oParam = o.holdEffectParam ?? 0;
  const dResolved = resolve(d.holdEffect);
  const oResolved = resolve(oName);
  if (oResolved === null) {
    unresolved++; mismatches++;
    if (bad.length < 60) bad.push(`${name}.holdEffect ours="${oName}" NON RÉSOLVABLE via hold_effects.h (→ GetItemHoldEffect=0 = bug)`);
  } else if (oResolved !== dResolved || oName !== d.holdEffect) {
    mismatches++;
    if (bad.length < 60) bad.push(`${name}.holdEffect ours=${oName}(${oResolved}) decomp=${d.holdEffect}(${dResolved})`);
  }
  if (Number(oParam) !== Number(d.holdEffectParam)) {
    mismatches++;
    if (bad.length < 60) bad.push(`${name}.holdEffectParam ours=${oParam} decomp=${d.holdEffectParam}`);
  }
}
console.log(`[audit item hold-effects] decompItems=${decKeys.length} oursItems=${ourKeys.length} compared=${compared} missingInOurs=${missingInOurs} unresolved=${unresolved} mismatches=${mismatches}`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad.slice(0, 60)) console.log('  ' + b); }
else console.log('✓ 0 mismatch — hold-effects + params extraits 1:1 décomp (résolus).');
process.exit(mismatches ? 1 : 0);
