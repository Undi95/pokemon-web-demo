#!/usr/bin/env node
/**
 * audit-hidden-power.cjs — ORACLE de la formule de Puissance Cachée (Hidden Power).
 *
 * Confronte `Cmd_hiddenpowercalc` (battle_script_commands.ts) au décomp (.c:8892). Formule
 * DÉTERMINISTE : type + puissance dérivés des 6 IVs.
 *   powerBits = bits (IV & 2) décalés ; typeBits = bits (IV & 1) décalés ;
 *   puissance = (40 * powerBits) / 63 + 30 ; type = (NUMBER_OF_MON_TYPES - 3) * typeBits / 63 + 1,
 *   +1 si >= TYPE_MYSTERY. Une constante/décalage faux = type ou puissance de Hidden Power faux.
 *
 * Confronte la SÉQUENCE COMPLÈTE de constantes entières du corps (masques 2/1, décalages,
 * 40/63/30, 3/63/1) — commentaires strippés (le décomp en a un avec des chiffres) — + vérifie
 * NUMBER_OF_MON_TYPES = 18 des deux côtés.
 *
 *   node scripts/audit-hidden-power.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/battle_script_commands.c';
const DECOMP_POKEMON_H = 'D:/Projet 1/decomps/pokeemeraude/include/constants/pokemon.h';
const OURS = path.join(ROOT, 'src/battle_script_commands.ts');
const OURS_CONST = path.join(ROOT, 'include/constants/pokemon.ts');

function ints(src, marker) {
  const a = src.lastIndexOf(marker);     // définition (≠ forward decl)
  const end = src.indexOf('\n}', a);     // accolade fermante de la fonction (colonne 0 ; les `}` internes sont indentés)
  const body = src.slice(a, end)
    .replace(/\b[su](?:8|16|32)\b/g, '') // retire les types C u8/u16/s32 (le `8` de `u8` parasitait la séquence)
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  return [...body.matchAll(/\d+/g)].map((m) => Number(m[0]));
}

const cSeq = ints(fs.readFileSync(DECOMP, 'utf8'), 'void Cmd_hiddenpowercalc(void)');
const tSeq = ints(fs.readFileSync(OURS, 'utf8'), 'function Cmd_hiddenpowercalc');

const findings = [];
if (cSeq.join(',') !== tSeq.join(',')) findings.push(`séquence de constantes :\n    décomp=[${cSeq}]\n    ours =[${tSeq}]`);
// garde-fou non-vacuité : la puissance doit contenir 40,63,30
if (!cSeq.includes(40) || !cSeq.includes(63) || !cSeq.includes(30)) findings.push(`décomp : constantes puissance 40/63/30 introuvables (parse cassé ?)`);

// NUMBER_OF_MON_TYPES = 18 des deux côtés
const cN = (fs.readFileSync(DECOMP_POKEMON_H, 'utf8').match(/#define\s+NUMBER_OF_MON_TYPES\s+(\d+)/) || [])[1];
const tN = (fs.readFileSync(OURS_CONST, 'utf8').match(/NUMBER_OF_MON_TYPES\s*=\s*(\d+)/) || [])[1];
if (cN !== tN) findings.push(`NUMBER_OF_MON_TYPES : décomp=${cN} ours=${tN}`);

console.log(`Hidden Power : ${tSeq.length} constantes · NUMBER_OF_MON_TYPES ours=${tN}`);
if (findings.length === 0) { console.log('✅ Cmd_hiddenpowercalc FIDÈLE au décomp (powerBits/typeBits + 40/63/30 + 18 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
