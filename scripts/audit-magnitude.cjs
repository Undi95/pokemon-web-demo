#!/usr/bin/env node
/**
 * audit-magnitude.cjs — ORACLE de la distribution de puissance d'AMPLEUR (Magnitude).
 *
 * Confronte `Cmd_magnitudedamagecalculation` (battle_script_commands.ts) au décomp (.c:8673).
 * Magnitude tire `Random() % 100` puis mappe par seuils → (puissance, numéro de magnitude) :
 *   <5→10/M4 · <15→30/M5 · <35→50/M6 · <65→70/M7 · <85→90/M8 · <95→110/M9 · else→150/M10.
 * Un seuil ou une puissance faux = distribution de dégâts d'Ampleur fausse.
 *
 * Extrait 3 séquences (seuils `magnitude < N`, puissances `setDynamicBasePower(N)` / décomp
 * `gDynamicBasePower = N`, numéros `magnitude = N`) et les confronte.
 *
 *   node scripts/audit-magnitude.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c';
const OURS = path.join(ROOT, 'src/battle_script_commands.ts');

function body(src, marker) {
  const a = src.lastIndexOf(marker);   // la DÉFINITION est la dernière occurrence (≠ déclaration forward `…;`)
  return src.slice(a, a + 1200).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}
const ints = (s, re) => [...s.matchAll(re)].map((m) => Number(m[1]));

const cB = body(fs.readFileSync(DECOMP, 'utf8'), 'void Cmd_magnitudedamagecalculation(void)');
const tB = body(fs.readFileSync(OURS, 'utf8'), 'function Cmd_magnitudedamagecalculation');

const seqs = {
  seuils: [/magnitude\s*<\s*(\d+)/g, /magnitude\s*<\s*(\d+)/g],
  numéros: [/magnitude\s*=\s*(\d+)/g, /magnitude\s*=\s*(\d+)/g],
  puissances: [/gDynamicBasePower\s*=\s*(\d+)/g, /setDynamicBasePower\((\d+)\)/g],
};

const findings = [];
for (const [label, [cre, tre]] of Object.entries(seqs)) {
  const c = ints(cB, cre), t = ints(tB, tre);
  if (c.join(',') !== t.join(',')) findings.push(`${label} : décomp=[${c}] ours=[${t}]`);
}
// garde-fou : valeurs attendues (non vacuité)
const expPow = '10,30,50,70,90,110,150';
if (ints(cB, /gDynamicBasePower\s*=\s*(\d+)/g).join(',') !== expPow) findings.push(`décomp puissances inattendues (attendu ${expPow})`);

console.log(`Magnitude : puissances ours=[${ints(tB, /setDynamicBasePower\((\d+)\)/g)}] · seuils=[${ints(tB, /magnitude\s*<\s*(\d+)/g)}]`);
if (findings.length === 0) { console.log('✅ Cmd_magnitudedamagecalculation FIDÈLE au décomp (seuils + puissances + numéros de magnitude 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
