// One-off audit : notre table d'efficacité des types
// (src/engine/battle/data/type-effectiveness.ts gTypeEffectiveness) vs
// décomp 1:1 (src/battle_main.c gTypeEffectiveness[336]). Cette table
// pilote TOUT TypeCalc/AI_TypeCalc → une dérive casse silencieusement le
// 1:1 (super/pas-efficace/immunité faux). Pur read-only, comparaison de
// la SÉQUENCE de tokens symboliques (les 2 sources sont symboliques).
import { readFileSync } from 'node:fs';

const C = 'D:/Projet 1/decomps/pokeemeraude/src/battle_main.c';
const T = 'D:/Projet 1/pokemon-web-demo/src/engine/battle/data/type-effectiveness.ts';

function tokens(body) {
  return body
    .replace(/\/\/[^\n]*/g, ' ')        // strip // comments
    .replace(/\/\*[\s\S]*?\*\//g, ' ')  // strip /* */ comments
    .split(/[\s,]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

// Décomp : const u8 gTypeEffectiveness[336] = { ... };
const cSrc = readFileSync(C, 'utf8');
const cm = cSrc.match(/gTypeEffectiveness\[\d+\]\s*=\s*\{([\s\S]*?)\};/);
if (!cm) { console.log('ERR: decomp gTypeEffectiveness introuvable'); process.exit(2); }
const cTok = tokens(cm[1]);

// Nous : export const gTypeEffectiveness ... = [ ... ];
const tSrc = readFileSync(T, 'utf8');
const tm = tSrc.match(/gTypeEffectiveness[^=]*=\s*\[([\s\S]*?)\];/);
if (!tm) { console.log('ERR: notre gTypeEffectiveness introuvable'); process.exit(2); }
const tTok = tokens(tm[1]);

let mismatches = 0;
const bad = [];
const n = Math.max(cTok.length, tTok.length);
for (let i = 0; i < n; i++) {
  if (cTok[i] !== tTok[i]) {
    mismatches++;
    if (bad.length < 60) bad.push(`idx ${i} (triple ${Math.floor(i / 3)}, col ${i % 3}): ours=${tTok[i] ?? '∅'} decomp=${cTok[i] ?? '∅'}`);
  }
}
console.log(`[audit type chart] decompLen=${cTok.length} oursLen=${tTok.length} mismatches=${mismatches}`);
if (cTok.length !== tTok.length) console.log(`⚠ longueurs différentes (décomp 336 attendu)`);
if (bad.length) { console.log('MISMATCHES:'); for (const b of bad) console.log('  ' + b); }
else if (mismatches === 0) console.log('✓ 0 mismatch — table type-effectiveness 1:1 décomp.');
process.exit(mismatches ? 1 : 0);
