#!/usr/bin/env node
/**
 * audit-trainer-money-table.cjs — ORACLE de fidélité de la table de PRIME des dresseurs.
 *
 * Confronte `src/engine/battle/data/trainer-money-table.ts` (gTrainerMoneyTable) au décomp
 * `gTrainerMoneyTable[]` (battle_main.c:474). C'est la base de la prime de combat dresseur :
 * `moneyReward = 4 × niveau_dernier_mon × multiplicateur × value[classe]` (Cmd_getmoneyreward).
 * Une value fausse = prime fausse pour toute une classe de dresseurs.
 *
 * Compare par NOM de classe (TRAINER_CLASS_X → value) + l'ordre + la sentinelle finale {0xFF,5}.
 *
 *   node scripts/audit-trainer-money-table.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/battle_main.c';
const OURS = path.join(ROOT, 'src/engine/battle/data/trainer-money-table.ts');

/** Extrait la séquence [{class, value}] de la table décomp (entre `gTrainerMoneyTable[] =` et `};`). */
function parseDecomp(src) {
  const start = src.indexOf('gTrainerMoneyTable[] =');
  const body = src.slice(start, src.indexOf('};', start));
  const out = [];
  for (const m of body.matchAll(/\{\s*(TRAINER_CLASS_[A-Z0-9_]+|0xFF)\s*,\s*(\d+)\s*\}/g)) {
    out.push({ cls: m[1], value: Number(m[2]) });
  }
  return out;
}

/** Extrait la séquence de notre table TS ({ classId: TRAINER_CLASS_X | 0xFF, value: N }). */
function parseOurs(src) {
  const start = src.indexOf('gTrainerMoneyTable');
  const body = src.slice(start);
  const out = [];
  for (const m of body.matchAll(/classId:\s*(TRAINER_CLASS_[A-Z0-9_]+|0xFF)\s*,\s*value:\s*(\d+)/g)) {
    out.push({ cls: m[1], value: Number(m[2]) });
  }
  return out;
}

const decomp = parseDecomp(fs.readFileSync(DECOMP, 'utf8'));
const ours = parseOurs(fs.readFileSync(OURS, 'utf8'));

const findings = [];
if (decomp.length !== ours.length) findings.push(`longueur : décomp=${decomp.length} ours=${ours.length}`);
const n = Math.max(decomp.length, ours.length);
for (let i = 0; i < n; i++) {
  const d = decomp[i], o = ours[i];
  if (!d) { findings.push(`[${i}] EN TROP chez nous : ${o.cls}=${o.value}`); continue; }
  if (!o) { findings.push(`[${i}] MANQUE chez nous : ${d.cls}=${d.value}`); continue; }
  if (d.cls !== o.cls) findings.push(`[${i}] classe : décomp=${d.cls} ours=${o.cls}`);
  else if (d.value !== o.value) findings.push(`[${i}] ${d.cls} : décomp=${d.value} ours=${o.value}`);
}
// sentinelle finale = {0xFF, 5}
const last = decomp[decomp.length - 1];
if (!last || last.cls !== '0xFF') findings.push('sentinelle finale {0xFF, …} absente du décomp parsé');

console.log(`Table prime dresseur : décomp=${decomp.length} · ours=${ours.length} entrées`);
if (findings.length === 0) { console.log('✅ gTrainerMoneyTable FIDÈLE au décomp (classe→prime + ordre + sentinelle).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
