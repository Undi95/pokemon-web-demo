#!/usr/bin/env node
/**
 * audit-present.cjs — ORACLE de la distribution du move PRÉSENT (Present).
 *
 * Confronte `Cmd_presentdamagecalculation` (battle_script_commands.ts) au décomp (.c:8616).
 * Présent tire `Random() & 0xFF` (0-255) → seuils 102/178/204 → puissance 40/80/120, sinon SOIN
 * de maxHP/4. Un seuil/puissance faux = distribution de Présent fausse (proba dégâts vs soin).
 *
 * Confronte par GROUPES (la séquence brute diffère sur `*= -1` vs `-heal`) : puissances,
 * seuils de distribution (3 premiers, dédupliqués), masque 0xFF, diviseur de soin (4).
 *
 *   node scripts/audit-present.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c';
const OURS = path.join(ROOT, 'src/battle_script_commands.ts');

function body(src, marker) {
  const a = src.lastIndexOf(marker);
  const end = src.indexOf('\n}', a);
  return src.slice(a, end).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}
const grab = (s, re) => [...s.matchAll(re)].map((m) => Number(m[1]));
const uniq = (a) => [...new Set(a)];

const cB = body(fs.readFileSync(DECOMP, 'utf8'), 'void Cmd_presentdamagecalculation(void)');
const tB = body(fs.readFileSync(OURS, 'utf8'), 'function Cmd_presentdamagecalculation');

const groups = {
  puissances: [grab(cB, /gDynamicBasePower\s*=\s*(\d+)/g), grab(tB, /setDynamicBasePower\((\d+)\)/g)],
  seuils: [uniq(grab(cB, /rand\s*<\s*(\d+)/g)).slice(0, 3), uniq(grab(tB, /rand\s*<\s*(\d+)/g)).slice(0, 3)],
  masque: [grab(cB, /Random\(\)\s*&\s*0x([0-9A-Fa-f]+)/g).map((x) => x), [parseInt('FF', 16)]], // décomp
  divSoin: [grab(cB, /maxHP\s*\/\s*(\d+)/g), grab(tB, /maxHP\s*\/\s*(\d+)/g)],
};
// masque : extraire proprement le hex des deux côtés
const hex = (s) => (s.match(/Random\(\)\s*&\s*0x([0-9A-Fa-f]+)/) || [])[1];
groups.masque = [[hex(cB)], [hex(tB)]];

const findings = [];
for (const [label, [c, t]] of Object.entries(groups)) {
  if (String(c) !== String(t)) findings.push(`${label} : décomp=[${c}] ours=[${t}]`);
}
// garde-fou non-vacuité
if (grab(cB, /gDynamicBasePower\s*=\s*(\d+)/g).join(',') !== '40,80,120') findings.push('décomp puissances inattendues (attendu 40,80,120)');

console.log(`Présent : puissances ours=[${grab(tB, /setDynamicBasePower\((\d+)\)/g)}] · seuils=[${uniq(grab(tB, /rand\s*<\s*(\d+)/g)).slice(0, 3)}] · masque=0x${hex(tB)} · soin/${grab(tB, /maxHP\s*\/\s*(\d+)/g)[0]}`);
if (findings.length === 0) { console.log('✅ Cmd_presentdamagecalculation FIDÈLE au décomp (seuils 102/178/204 + puissances 40/80/120 + soin maxHP/4).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
