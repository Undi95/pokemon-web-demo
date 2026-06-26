#!/usr/bin/env node
/**
 * audit-trapping-moves.cjs — ORACLE de la liste des moves « ligoteurs » (wrap).
 *
 * Confronte `_gTrappingMoves` (battle_script_commands.ts) au décomp `gTrappingMoves[]`
 * (battle_message.c:1257). Liste ORDONNÉE des moves qui ligotent (Bind, Wrap, Fire Spin, Clamp,
 * Whirlpool, Sand Tomb) ; l'INDEX du move dans la liste sélectionne le message via
 * MULTISTRING_CHOOSER → l'ordre ET les ids comptent. IDs bruts sous commentaire = classe du bug
 * sSoundMovesTable.
 *
 * Résout les NOMS décomp (MOVE_*) en numéros via moves.h, confronte nos NUMÉROS (commentaires
 * strippés). La décomp a un terminateur 0xFFFF (« Never read ») que NOTRE table omet
 * intentionnellement (length = NUM_TRAPPING_MOVES pour la boucle `idx < length-1`) → l'oracle
 * confronte les 6 vrais moves et vérifie que notre table n'a PAS le terminateur.
 *
 *   node scripts/audit-trapping-moves.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP_MSG = 'D:/Projet 1/decomps/pokeemeraude/src/battle_message.c';
const DECOMP_MOVES_H = 'D:/Projet 1/decomps/pokeemeraude/include/constants/moves.h';
const OURS = path.join(ROOT, 'src/battle_script_commands.ts');

const NAME2NUM = {};
for (const m of fs.readFileSync(DECOMP_MOVES_H, 'utf8').matchAll(/#define\s+(MOVE_[A-Z0-9_]+)\s+(\d+)\b/g)) {
  NAME2NUM[m[1]] = Number(m[2]);
}

const cSrc = fs.readFileSync(DECOMP_MSG, 'utf8');
const tsSrc = fs.readFileSync(OURS, 'utf8');

const cA = cSrc.indexOf('gTrappingMoves[NUM_TRAPPING_MOVES');
const cBody = cSrc.slice(cSrc.indexOf('{', cA), cSrc.indexOf('};', cA));
const cHasTerm = /0xFFFF/i.test(cBody);
const decompNames = [...cBody.matchAll(/MOVE_[A-Z0-9_]+/g)].map((m) => m[0]);
const want = decompNames.map((n) => NAME2NUM[n]);

const tA = tsSrc.indexOf('const _gTrappingMoves');
const tBody = tsSrc.slice(tsSrc.indexOf('[', tsSrc.indexOf('=', tA)), tsSrc.indexOf('];', tA))
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
const got = [...tBody.matchAll(/0x[0-9a-fA-F]+|\d+/g)].map((m) => Number(m[0]));

const findings = [];
if (want.some((v) => v === undefined)) findings.push(`nom décomp non résolu : ${decompNames.filter((n) => NAME2NUM[n] === undefined).join(',')}`);
if (want.length !== got.length) findings.push(`longueur (hors terminateur) : décomp=${want.length} ours=${got.length}`);
const n = Math.min(want.length, got.length);
for (let i = 0; i < n; i++) if (want[i] !== got[i]) findings.push(`[${i}] ${decompNames[i]} : décomp=${want[i]} ours=${got[i]}`);
if (!cHasTerm) findings.push('terminateur 0xFFFF attendu côté décomp (absent)');
if (got.some((v) => v === 0xFFFF)) findings.push('notre table NE doit PAS contenir le terminateur 0xFFFF (length = NUM_TRAPPING_MOVES pour la boucle)');

console.log(`Moves ligoteurs : décomp=${want.length} (+ terminateur 0xFFFF) · ours=${got.length} (sans terminateur)`);
if (findings.length === 0) { console.log('✅ _gTrappingMoves FIDÈLE au décomp (6 moves ordonnés ; terminateur omis à dessein).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
