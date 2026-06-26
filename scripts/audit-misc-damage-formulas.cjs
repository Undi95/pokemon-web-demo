#!/usr/bin/env node
/**
 * audit-misc-damage-formulas.cjs — ORACLE de 4 opcodes de dégâts à formule.
 *
 * Confronte la SÉQUENCE de constantes entières (corps, commentaires + types C strippés) de 4
 * opcodes battle_script_commands.ts au décomp (.c) :
 *   - Cmd_friendshiptodamagecalculation : Retour/Frustration = 10 * friendship / 25 (et 255-f).
 *   - Cmd_psywavedamageeffect : Psywave = level * (re-tirage[0,10]*10 + 50) / 100 (0.5-1.5×).
 * Une constante fausse = puissance/dégâts faux pour ces moves. (Fury Cutter `×2^(compteur-1)`
 * cap 5, et Roulade `×2^coups`×DefenseCurl timer 5 : audit lecture-seule 1:1 — leurs corps ont
 * trop de bruit port-spécifique pour une confrontation de séquence — `if (off>=0)`, `STATUS2_*`.)
 *
 *   node scripts/audit-misc-damage-formulas.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = fs.readFileSync('D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c', 'utf8');
const OURS = fs.readFileSync(path.join(ROOT, 'src/battle_script_commands.ts'), 'utf8');

function ints(src, marker) {
  const a = src.lastIndexOf(marker);
  const end = src.indexOf('\n}', a);
  const body = src.slice(a, end)
    .replace(/\b[su](?:8|16|32)\b/g, '')           // types C (u8 → `8` parasite)
    .replace(/\?\?\s*\d+/g, '')                     // fallbacks nullish `?? 0` (port-spécifique, pas formule)
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  return [...body.matchAll(/\d+/g)].map((m) => Number(m[0]));
}

const FNS = [
  ['friendship', 'void Cmd_friendshiptodamagecalculation(void)', 'function Cmd_friendshiptodamagecalculation'],
  ['psywave', 'void Cmd_psywavedamageeffect(void)', 'function Cmd_psywavedamageeffect'],
];

const findings = [];
for (const [label, cMarker, tMarker] of FNS) {
  const c = ints(DECOMP, cMarker), t = ints(OURS, tMarker);
  if (c.length === 0) { findings.push(`${label} : décomp parse vide (marqueur ?)`); continue; }
  if (c.join(',') !== t.join(',')) findings.push(`${label} :\n    décomp=[${c}]\n    ours =[${t}]`);
}

console.log(`Opcodes de dégâts misc : ${FNS.length} fonctions confrontées (séquences de constantes)`);
if (findings.length === 0) { console.log('✅ Retour/Frustration (10/25) + Psywave (16/10/50/100) FIDÈLES au décomp (constantes 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
