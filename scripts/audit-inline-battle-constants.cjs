#!/usr/bin/env node
/**
 * audit-inline-battle-constants.cjs — ORACLE des constantes INLINE du code combat.
 *
 * Les oracles existants confrontent include/constants/*.ts au décomp. MAIS le code combat
 * redéclare souvent des constantes EN DUR localement (`const CHECK_ON_FIELD = 12;` dans bsc) —
 * non couvertes, et c'est là qu'une valeur fausse se glisse (caseID 12 vs 19, AIR_LOCK 76 vs 77,
 * sound moves 44 vs 45, B_ANIM_* off-by-one…). Cet oracle :
 *   1. construit la map des #define décomp (include/**.h) → valeur (evalExpr : hex/<</références).
 *   2. scanne les `const NAME = <int/hex/shift/réf>;` inline des fichiers combat .ts.
 *   3. pour chaque NAME qui EXISTE comme #define décomp, confronte la valeur. Écart = signal.
 *
 *   node scripts/audit-inline-battle-constants.cjs   ·   exit 0 fidèle / exit 1 écarts
 *
 * ⚠️ Faux positifs possibles : un const port-local réutilisant un nom décomp pour un autre sens.
 *    → triage manuel (la sortie cite fichier:ligne + les 2 valeurs). Liste d'exclusion ci-dessous.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';

// Fichiers combat à scanner (cœur du moteur — là où les caseID/anim/msg sont hardcodés).
const TS_FILES = [
  'src/battle_script_commands.ts', 'src/battle_util.ts', 'src/battle_main.ts',
  'src/battle_ai_script_commands.ts', 'src/battle_ai_switch_items.ts',
  'src/battle_controller_player.ts', 'src/pokemon.ts',
];

// Exclusions : noms dont le sens local diverge légitimement du décomp (triage confirmé).
const EXCLUDE = new Set([
  // (rempli au fur et à mesure du triage si un faux positif est confirmé non-1:1-pertinent)
]);

// ── 1. Map des #define décomp ────────────────────────────────────────────────
function evalExpr(expr, scope) {
  let s = expr.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  // retire un cast C éventuel en tête : (u8), (s8), (u16)...
  s = s.replace(/\((?:u8|s8|u16|s16|u32|s32)\)/g, '');
  s = s.replace(/0[xX][0-9a-fA-F]+/g, (h) => String(parseInt(h, 16)));
  s = s.replace(/[A-Za-z_]\w*/g, (id) => { if (id in scope) return '(' + scope[id] + ')'; throw new Error('ref:' + id); });
  if (!/^[-0-9<>|&~()+*\/\s]+$/.test(s)) throw new Error('unsafe');
  const v = Function('"use strict";return (' + s + ')')();
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error('nan');
  return v | 0;
}

function collectDefines(dir, map) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) collectDefines(p, map);
    else if (ent.name.endsWith('.h')) {
      const txt = fs.readFileSync(p, 'utf8');
      // multi-pass pour les références forward
      let changed = true, pass = 0;
      const pending = [];
      for (const m of txt.matchAll(/^#define\s+([A-Z_][A-Z0-9_]*)\s+(.+?)\s*$/gm)) {
        // ignore les macros à paramètres : #define NAME(x) ...
        if (/^[A-Z_][A-Z0-9_]*\(/.test(m[1] + (txt[m.index + 8 + m[1].length] || ''))) {}
        pending.push([m[1], m[2]]);
      }
      while (changed && pass++ < 6) {
        changed = false;
        for (const [name, expr] of pending) {
          if (name in map) continue;
          // skip macros fonctionnelles (contiennent '(' juste après le nom dans la def source)
          try { map[name] = evalExpr(expr, map); changed = true; } catch { /* retry next pass */ }
        }
      }
    }
  }
}

const decomp = {};
collectDefines(path.join(DECOMP, 'include'), decomp);

// ── 2+3. Scan inline consts + confrontation ──────────────────────────────────
const findings = [];
let checked = 0;
const RE = /(?:^|\n)\s*(?:const|let)\s+([A-Z_][A-Z0-9_]*)\s*(?::\s*number\s*)?=\s*([^;,\n]+?)\s*[;,]/g;

for (const rel of TS_FILES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) continue;
  const txt = fs.readFileSync(file, 'utf8');
  const lines = txt.split('\n');
  for (const m of txt.matchAll(RE)) {
    const name = m[1];
    if (!(name in decomp) || EXCLUDE.has(name)) continue;
    let val;
    try { val = evalExpr(m[2], decomp); } catch { continue; } // valeur non-numérique simple → skip
    checked++;
    if (val !== decomp[name]) {
      const lineNo = txt.slice(0, m.index).split('\n').length;
      findings.push(`${rel}:${lineNo}  ${name} = ${val}  (décomp #define = ${decomp[name]})`);
    }
  }
}

console.log(`Constantes inline combat confrontées au décomp : ${checked} (noms #define connus : ${Object.keys(decomp).length}).`);
if (findings.length === 0) { console.log(`✅ Toutes les constantes inline combat connues du décomp sont FIDÈLES.`); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings) console.log('  ' + f);
process.exit(1);
