#!/usr/bin/env node
/**
 * audit-tmhm-move-map.cjs — ORACLE du mapping CT/CS (TM/HM) → capacité.
 *
 * `sTMHMMoves[]` (engine/pokemon/tmhm-moves.ts) mappe l'index CT/CS → la capacité enseignée
 * (TM01 → MOVE_FOCUS_PUNCH, …, HM01 → MOVE_CUT, …). Un décalage = la CT enseigne la MAUVAISE
 * capacité (très observable). Source canonique = `include/constants/tms_hms.h` : `FOREACH_TM(F)`
 * (50) puis `FOREACH_HM(F)` (8) listent les `F(<MOVE>)` dans l'ordre des index. Cet oracle confronte
 * la liste ordonnée port vs décomp, index par index. Distinct de `audit-tmhm-learnsets` (QUI peut
 * apprendre chaque CT) — ici c'est QUELLE capacité chaque CT EST.
 *
 *   node scripts/audit-tmhm-move-map.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';

// décomp : FOREACH_TM(F) … F(X) puis FOREACH_HM(F)
const h = fs.readFileSync(path.join(DECOMP, 'include/constants/tms_hms.h'), 'utf8');
function foreachMoves(macro) {
  const m = h.match(new RegExp('#define\\s+' + macro + '\\(F\\)([\\s\\S]*?)(?=\\n#define|\\n#endif)'));
  if (!m) return null;
  return [...m[1].matchAll(/F\(\s*([A-Z0-9_]+)\s*\)/g)].map((x) => 'MOVE_' + x[1]);
}
const decompTM = foreachMoves('FOREACH_TM');
const decompHM = foreachMoves('FOREACH_HM');
const decomp = (decompTM && decompHM) ? [...decompTM, ...decompHM] : null;

// port : sTMHMMoves = ['MOVE_X', …]
const ts = fs.readFileSync(path.join(ROOT, 'src/engine/pokemon/tmhm-moves.ts'), 'utf8');
const arrM = ts.match(/sTMHMMoves\s*:\s*readonly\s+string\[\]\s*=\s*\[([\s\S]*?)\]\s*;/);
const port = arrM ? [...arrM[1].matchAll(/['"](MOVE_[A-Z0-9_]+)['"]/g)].map((x) => x[1]) : null;

const findings = [];
let checked = 0;
if (!decomp) findings.push('décomp FOREACH_TM/HM introuvable');
if (!port) findings.push('port sTMHMMoves introuvable');
if (decomp && port) {
  if (decomp.length !== port.length) findings.push(`longueur : décomp=${decomp.length} (TM ${decompTM.length}+HM ${decompHM.length}) port=${port.length}`);
  const n = Math.min(decomp.length, port.length);
  for (let i = 0; i < n; i++) {
    checked++;
    if (decomp[i] !== port[i]) {
      const label = i < (decompTM ? decompTM.length : 50) ? `TM${String(i + 1).padStart(2, '0')}` : `HM${String(i - (decompTM.length) + 1).padStart(2, '0')}`;
      findings.push(`${label} (idx ${i}) : port=${port[i]} décomp=${decomp[i]}`);
    }
  }
}

console.log(`Mapping CT/CS → capacité confronté : ${checked} entrées (décomp tms_hms.h FOREACH_TM/HM) vs sTMHMMoves.`);
if (findings.length === 0) { console.log('✅ Mapping CT/CS → capacité FIDÈLE au décomp (chaque CT enseigne la bonne capacité).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
