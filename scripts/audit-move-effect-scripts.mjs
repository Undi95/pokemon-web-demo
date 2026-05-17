// Audit 1:1 : routing effet→BattleScript. Confronte (a) le décomp
// `gBattleScriptsForMoveEffects[]` (data/battle_scripts_1.s, parser
// INDÉPENDANT), (b) la table RUNTIME du moteur
// (decomp-data/auto-asm-bytecode/data/battle_scripts_1-jump-table.ts
// BATTLE_SCRIPTS_FOR_MOVE_EFFECTS, = ce que getMoveEffectScriptOffset
// utilise réellement pour router CHAQUE move), (c) le JSON committé
// (public/decomp/em/move-effect-scripts.json, drift guard).
// Une dérive = un move (damaging OU status) dispatché vers le MAUVAIS
// script = comportement faux. Read-only. Diff ORDONNÉ index par index.
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const P = 'D:/Projet 1/pokemon-web-demo';
const S = `${DEC}/data/battle_scripts_1.s`;
const ENG = `${P}/src/engine/decomp-data/auto-asm-bytecode/data/battle_scripts_1-jump-table.ts`;
const JSON_OUT = `${P}/public/decomp/em/move-effect-scripts.json`;

// (a) Parser INDÉPENDANT du décomp .s (différent de l'extracteur).
const src = readFileSync(S, 'utf8');
const i0 = src.indexOf('gBattleScriptsForMoveEffects::');
if (i0 < 0) { console.error('FATAL: table décomp introuvable'); process.exit(1); }
const decomp = [];
for (const ln of src.slice(i0).split(/\r?\n/).slice(1)) {
  const t = ln.trim();
  if (t === '') continue;
  const m = t.match(/^\.4byte\s+([A-Za-z0-9_]+)/);
  if (!m) break;
  decomp.push(m[1]);
}

// (b) Table runtime du moteur.
const engSrc = readFileSync(ENG, 'utf8');
const arrM = engSrc.match(/BATTLE_SCRIPTS_FOR_MOVE_EFFECTS\s*:\s*readonly\s+string\[\]\s*=\s*\[([\s\S]*?)\]\s*;/);
if (!arrM) { console.error('FATAL: BATTLE_SCRIPTS_FOR_MOVE_EFFECTS introuvable'); process.exit(1); }
const engine = [...arrM[1].matchAll(/'([A-Za-z0-9_]+)'/g)].map(m => m[1]);

// (c) JSON committé.
const json = JSON.parse(readFileSync(JSON_OUT, 'utf8'));

let mismatches = 0;
const n = Math.max(decomp.length, engine.length, json.length);
for (let i = 0; i < n; i++) {
  const d = decomp[i], e = engine[i], j = json[i]?.label;
  if (d !== e || d !== j) {
    mismatches++;
    if (mismatches <= 20) {
      console.error(`  [${i}] décomp=${d} | moteur=${e} | json=${j}`);
    }
  }
}

console.log(`[audit move-effect-scripts] decomp=${decomp.length} engine=${engine.length} json=${json.length} mismatches=${mismatches}`);
if (decomp.length !== engine.length || decomp.length !== json.length) {
  console.error(`✗ LONGUEURS DIFFÉRENTES (décomp ${decomp.length} / moteur ${engine.length} / json ${json.length}).`);
  process.exit(1);
}
if (mismatches > 0) {
  console.error(`✗ ${mismatches} mismatch — routing effet→script PAS 1:1 décomp.`);
  process.exit(1);
}
console.log('✓ 0 mismatch — routing effet→BattleScript 1:1 décomp (214 effets, moteur + json).');
