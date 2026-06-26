#!/usr/bin/env node
/**
 * audit-sound-moves.cjs — ORACLE de la table des moves SON (bloqués par Insonorisation).
 *
 * Confronte `sSoundMovesTable` (battle_util.ts) au décomp `sSoundMovesTable[]` (battle_util.c:688).
 * La capacité Insonorisation (Soundproof) rend immunisé aux moves de cette liste. Un numéro faux
 * = mauvaise immunité (ex. bug trouvé sur `finale` : 44=MOVE_BITE sous le commentaire MOVE_GROWL
 * → Insonorisation bloquait Morsure au lieu de Grondement).
 *
 * Résout les NOMS décomp (MOVE_*) en numéros via moves.h, confronte les NUMÉROS de notre table
 * (commentaires strippés — c'est le NOMBRE qui compte, pas le commentaire). Terminateur
 * SOUND_MOVES_END (0xFFFF) vérifié présent des deux côtés.
 *
 *   node scripts/audit-sound-moves.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP_C = 'D:/Projet 1/decomps/pokeemeraude/src/battle_util.c';
const DECOMP_MOVES_H = 'D:/Projet 1/decomps/pokeemeraude/include/constants/moves.h';
const OURS = path.join(ROOT, 'src/battle_util.ts');

const NAME2NUM = {};
for (const m of fs.readFileSync(DECOMP_MOVES_H, 'utf8').matchAll(/#define\s+(MOVE_[A-Z0-9_]+)\s+(\d+)\b/g)) {
  NAME2NUM[m[1]] = Number(m[2]);
}

const cSrc = fs.readFileSync(DECOMP_C, 'utf8');
const tsSrc = fs.readFileSync(OURS, 'utf8');

function tableBody(src, marker, open, close) {
  const a = src.indexOf(marker);
  return src.slice(src.indexOf(open, a), src.indexOf(close, a));
}

const decompBody = tableBody(cSrc, 'sSoundMovesTable[]', '{', '}');
const decompNames = [...decompBody.matchAll(/MOVE_[A-Z0-9_]+/g)].map((m) => m[0]);
const want = decompNames.map((n) => NAME2NUM[n]);

const oursBody = tableBody(tsSrc, 'const sSoundMovesTable', '[', '];')
  .replace(/\/\*[\s\S]*?\*\//g, '')   // commentaires bloc /* */
  .replace(/\/\/[^\n]*/g, '');        // commentaires ligne // (peuvent contenir des nombres)
const got = [...oursBody.matchAll(/\d+/g)].map((m) => Number(m[0]));

const findings = [];
if (want.some((v) => v === undefined)) findings.push(`nom décomp non résolu : ${decompNames.filter((n) => NAME2NUM[n] === undefined).join(',')}`);
if (want.length !== got.length) findings.push(`longueur : décomp=${want.length} ours=${got.length}`);
const n = Math.min(want.length, got.length);
for (let i = 0; i < n; i++) if (want[i] !== got[i]) findings.push(`[${i}] ${decompNames[i]} : décomp=${want[i]} ours=${got[i]}`);
// terminateur
if (!/SOUND_MOVES_END/.test(decompBody)) findings.push('SOUND_MOVES_END absent du décomp');
if (!/SOUND_MOVES_END/.test(tableBody(tsSrc, 'const sSoundMovesTable', '[', '];'))) findings.push('SOUND_MOVES_END absent de notre table');

console.log(`Moves SON : décomp=${want.length} · ours=${got.length} (+ terminateur SOUND_MOVES_END)`);
if (findings.length === 0) { console.log('✅ sSoundMovesTable FIDÈLE au décomp (moves bloqués par Insonorisation 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
