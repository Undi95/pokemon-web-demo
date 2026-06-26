#!/usr/bin/env node
/**
 * audit-ai-ignored-effects.cjs — ORACLE de la liste d'effets « ignorés » par l'IA.
 *
 * Confronte `sIgnoredPowerfulMoveEffects` (battle_ai_script_commands.ts) au décomp
 * (battle_ai_script_commands.c:266). C'est la liste des EFFECT_* de moves « à 2 temps / fort
 * malus » (Explosion, Solar Beam, Focus Punch, Overheat…) que l'IA ne sur-valorise pas comme
 * un simple gros move. La table utilise des constantes NOMMÉES (EFFECT_*) → l'oracle confronte
 * la SÉQUENCE DE NOMS (+ terminateur IGNORED_MOVES_END) : protège contre un effet ajouté /
 * retiré / réordonné, qui fausserait les décisions de l'IA.
 *
 *   node scripts/audit-ai-ignored-effects.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/battle_ai_script_commands.c';
const OURS = path.join(ROOT, 'src/battle_ai_script_commands.ts');

function names(src, marker, open, close) {
  const a = src.indexOf(marker);
  const oi = src.indexOf(open, src.indexOf('=', a));
  const body = src.slice(oi, src.indexOf(close, oi));
  return [...body.matchAll(/EFFECT_[A-Z0-9_]+|IGNORED_MOVES_END/g)].map((m) => m[0]);
}

const decomp = names(fs.readFileSync(DECOMP, 'utf8'), 'sIgnoredPowerfulMoveEffects[]', '{', '}');
const ours = names(fs.readFileSync(OURS, 'utf8'), 'const sIgnoredPowerfulMoveEffects', '[', '];');

const findings = [];
if (decomp.length !== ours.length) findings.push(`longueur : décomp=${decomp.length} ours=${ours.length}`);
const n = Math.min(decomp.length, ours.length);
for (let i = 0; i < n; i++) if (decomp[i] !== ours[i]) findings.push(`[${i}] : décomp=${decomp[i]} ours=${ours[i]}`);

console.log(`IA effets ignorés : décomp=${decomp.length} · ours=${ours.length} entrées`);
if (findings.length === 0) { console.log('✅ sIgnoredPowerfulMoveEffects FIDÈLE au décomp (séquence d\'effets + terminateur 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
