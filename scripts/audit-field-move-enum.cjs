#!/usr/bin/env node
/**
 * audit-field-move-enum.cjs — ORACLE de l'enum FIELD_MOVE_* (gate badge CS + dispatch CS de terrain).
 *
 * Dans `CursorCb_FieldMove` (party menu), les CS de terrain d'index <= FIELD_MOVE_WATERFALL sont
 * gatées par un badge CONSÉCUTIF : `FlagGet(FLAG_BADGE01_GET + fieldMove)` (décomp party_menu.c) =
 * `FLAG_BADGE0{fieldMove+1}_GET` côté port. La VALEUR de chaque FIELD_MOVE_* détermine donc le
 * badge requis (Surf=4 → BADGE05) ET le dispatch du field move. Si l'ordre de l'enum diverge du
 * décomp, une CS est bloquée au mauvais badge ou dispatchée à la mauvaise action. Cet oracle
 * confronte l'enum FIELD_MOVE port (party-screen.ts) au décomp (party_menu.c), nom par nom.
 *
 *   node scripts/audit-field-move-enum.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';

// décomp : enum { FIELD_MOVE_CUT, …, FIELD_MOVES_COUNT } dans party_menu.c (séquentiel)
const pm = fs.readFileSync(path.join(DECOMP, 'src/party_menu.c'), 'utf8');
const em = pm.match(/enum\s*\{\s*(FIELD_MOVE_CUT[\s\S]*?FIELD_MOVES_COUNT)\s*\}/);
const decompMap = {};
if (em) {
  const body = em[1].replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  let cur = 0;
  for (const raw of body.split(',')) {
    const name = raw.trim();
    if (!/^FIELD_MOVE/.test(name)) continue;
    if (name === 'FIELD_MOVES_COUNT') { decompMap[name] = cur; break; }
    decompMap[name] = cur++;
  }
}

// port : const FIELD_MOVE_X = N
const ps = fs.readFileSync(path.join(ROOT, 'src/engine/ui/party-screen.ts'), 'utf8');
const portMap = {};
for (const m of ps.matchAll(/const\s+(FIELD_MOVE_[A-Z_]+|FIELD_MOVES_COUNT)\s*=\s*(\d+)\s*;/g)) portMap[m[1]] = Number(m[2]);

// Invariant : tout FIELD_MOVE_* DÉFINI côté port a la VALEUR du décomp (un mauvais ordre =
// mauvais badge/dispatch). Les constantes décomp NON définies côté port = dette de FEATURE
// (ex. FIELD_MOVE_SECRET_POWER = base secrète non portée) — notées, pas un échec, car les
// constantes suivantes sont numérotées EN DUR correctement (MILK_DRINK=11 réserve bien 10 à
// SECRET_POWER) ⇒ aucun décalage.
const findings = [];
let checked = 0;
const notPorted = [];
if (!Object.keys(decompMap).length) findings.push('enum FIELD_MOVE décomp introuvable');
for (const [name, val] of Object.entries(decompMap)) {
  if (name === 'FIELD_MOVES_COUNT') continue;
  if (!(name in portMap)) { notPorted.push(`${name}(=${val})`); continue; }
  checked++;
  if (portMap[name] !== val) findings.push(`${name} : port=${portMap[name]} décomp=${val} (mauvais badge/dispatch CS)`);
}

console.log(`Enum FIELD_MOVE confronté : ${checked} constantes port confrontées (décomp party_menu.c).`);
if (notPorted.length) console.log(`  (note : ${notPorted.length} field move(s) décomp non porté(s) = dette feature : ${notPorted.join(', ')})`);
if (findings.length === 0) { console.log('✅ Enum FIELD_MOVE port FIDÈLE au décomp (gate badge CS + dispatch CS 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 30)) console.log('  ' + f);
process.exit(1);
