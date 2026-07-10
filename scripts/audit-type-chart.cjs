#!/usr/bin/env node
/**
 * audit-type-chart.cjs — ORACLE de fidélité de la TABLE DES TYPES (combat).
 *
 * Confronte la table RUNTIME utilisée par TypeCalc — `gTypeEffectiveness`
 * (src/battle_main.ts, au foyer miroir depuis le lot 25 ; 336 éléments avec marqueurs
 * TYPE_FORESIGHT/TYPE_ENDTABLE + section foresight NORMAL/FIGHTING→GHOST) — au décomp
 * `gTypeEffectiveness[336]` (battle_main.c:335). Token-par-token (mêmes noms TYPE_* /
 * TYPE_MUL_* des deux côtés). Tout écart = efficacité de type fausse = dégâts faux.
 *
 * NB : `public/decomp/em/type-chart.json` est un extrait INCOMPLET (108 entrées, sans
 * marqueurs ni section foresight) et N'EST PAS la source de combat → on cible la table TS.
 *
 *   node scripts/audit-type-chart.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP_C = 'D:/Projet 1/decomps/pokeemeraude/src/battle_main.c';
const TS_F = path.join(ROOT, 'src/battle_main.ts');

// Extrait le corps d'un tableau entre un marqueur d'ouverture et le 1er délimiteur de fin.
const sliceBody = (src, startMarker, open, close) => {
  const a = src.indexOf(startMarker);
  if (a < 0) throw new Error('marqueur introuvable : ' + startMarker);
  const o = src.indexOf(open, a);
  const c = src.indexOf(close, o);
  return src.slice(o + 1, c);
};
// Liste ordonnée des tokens TYPE_* (= TYPE_X, TYPE_MUL_X, TYPE_FORESIGHT, TYPE_ENDTABLE)
const tokens = (body) => body.match(/TYPE_[A-Z0-9_]+/g) || [];

const decompBody = sliceBody(fs.readFileSync(DECOMP_C, 'utf8'), 'gTypeEffectiveness[336]', '{', '};');
const tsBody = sliceBody(fs.readFileSync(TS_F, 'utf8'), 'gTypeEffectiveness: ReadonlyArray', '[', '];');

const dTok = tokens(decompBody);
const tTok = tokens(tsBody);

const findings = [];
if (dTok.length !== tTok.length) findings.push(`LONGUEUR : ts=${tTok.length} ≠ décomp=${dTok.length}`);
const n = Math.min(dTok.length, tTok.length);
for (let i = 0; i < n; i++) {
  if (dTok[i] !== tTok[i]) {
    const triple = Math.floor(i / 3), field = ['atk', 'def', 'mul'][i % 3];
    findings.push(`triple ${triple} (${field}) : ts=${tTok[i]} ≠ décomp=${dTok[i]}`);
  }
}

console.log(`Tokens table de types : décomp=${dTok.length} · ts=${tTok.length} · triples=${Math.floor(dTok.length / 3)}`);
if (findings.length === 0) { console.log('✅ gTypeEffectiveness (runtime) FIDÈLE au décomp battle_main.c (336 éléments, foresight inclus).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de table de types (= dégâts faux) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
