// Audit 1:1 : table mouvement décomp `gMovementActionFuncs`
// (src/data/object_events/movement_action_func_tables.h) vs notre
// `public/decomp/em/movement-action-funcs.json` (consommé par
// movement-action-dispatch.ts) + couverture des step-funcs auto-portées.
// Parser INDÉPENDANT (≠ extracteur) + diff ORDONNÉ master + tables.
// = "grid impassable / tout calculé" demandé par user. Read-only.
// Méthodo identique à audit-move-effect-scripts / audit-scrcmd.
import { readFileSync } from 'node:fs';

const DEC = 'D:/Projet 1/decomps/pokeemeraude';
const P = 'D:/Projet 1/pokemon-web-demo';
const H = `${DEC}/src/data/object_events/movement_action_func_tables.h`;
const JSON_F = `${P}/public/decomp/em/movement-action-funcs.json`;
const AUTO = `${P}/src/engine/decomp-data/auto/src-all/event_object_movement-all-auto.ts`;

const h = readFileSync(H, 'utf8');

// 1) Master : gMovementActionFuncs[] = { [MOVEMENT_ACTION_X] = gMovementActionFuncs_Tbl, ... }
const masterBody = h.match(/gMovementActionFuncs\[\]\)\s*\([^)]*\)\s*=\s*\{([\s\S]*?)\n\};/);
const decMaster = {};
if (masterBody) {
  for (const m of masterBody[1].matchAll(/\[(MOVEMENT_ACTION_\w+)\]\s*=\s*gMovementActionFuncs_(\w+)/g)) {
    decMaster[m[1]] = m[2];  // action → tableName (sans préfixe, = JSON)
  }
}

// 2) Sous-tables : gMovementActionFuncs_Tbl[] = { Func0, Func1, ... };
const decTables = {};
for (const m of h.matchAll(/gMovementActionFuncs_(\w+)\[\]\)\s*\([^)]*\)\s*=\s*\{([\s\S]*?)\n\};/g)) {
  const tbl = m[1];
  const funcs = [...m[2].matchAll(/\b(MovementAction_\w+)\b/g)].map(x => x[1]);
  if (funcs.length) decTables[tbl] = funcs;
}

// 3) JSON committé.
const j = JSON.parse(readFileSync(JSON_F, 'utf8'));
const jMaster = j.master || {};
const jTables = j.tables || {};

// 4) Auto-port : noms de step-funcs réellement disponibles.
const autoSrc = readFileSync(AUTO, 'utf8');
const autoFuncs = new Set([...autoSrc.matchAll(/\b(MovementAction_\w+)\b/g)].map(m => m[1]));

// Diff master.
let mMis = 0;
const decMK = Object.keys(decMaster), jMK = Object.keys(jMaster);
for (const k of new Set([...decMK, ...jMK])) {
  if (decMaster[k] !== jMaster[k]) { mMis++; if (mMis <= 15) console.error(`  master[${k}] décomp=${decMaster[k]} json=${jMaster[k]}`); }
}
// Diff tables (listes ordonnées).
let tMis = 0;
for (const t of new Set([...Object.keys(decTables), ...Object.keys(jTables)])) {
  const d = decTables[t] || [], jj = jTables[t] || [];
  if (d.length !== jj.length || d.some((f, i) => f !== jj[i])) {
    tMis++; if (tMis <= 15) console.error(`  table[${t}] décomp=${d.length}f json=${jj.length}f ${JSON.stringify(d) === JSON.stringify(jj) ? '' : '(ordre/contenu diff)'}`);
  }
}
// Couverture step-funcs (impl auto-portée présente ?).
const allStepFuncs = new Set();
for (const fs of Object.values(jTables)) for (const f of fs) allStepFuncs.add(f);
const missImpl = [...allStepFuncs].filter(f => !autoFuncs.has(f));

console.log(`[audit movement] décomp master=${decMK.length} json master=${jMK.length} | décomp tables=${Object.keys(decTables).length} json tables=${Object.keys(jTables).length}`);
console.log(`  master mismatch : ${mMis}`);
console.log(`  tables mismatch : ${tMis}`);
console.log(`  step-funcs uniques=${allStepFuncs.size} | auto-portées dispo=${autoFuncs.size} | SANS impl=${missImpl.length}`);
if (missImpl.length && missImpl.length <= 30) console.log(`    ${missImpl.sort().join(', ')}`);
const dataOk = mMis === 0 && tMis === 0;
console.log(`\n${dataOk
  ? `✓ movement : table gMovementActionFuncs 1:1 décomp (master+tables 0 mismatch).${missImpl.length ? ` ⚠ ${missImpl.length} step-func sans impl auto-portée (gap runtime).` : ' Step-funcs toutes portées.'}`
  : `✗ movement : ${mMis} master + ${tMis} tables mismatch — table PAS 1:1 décomp.`}`);
process.exit(dataOk ? 0 : 1);
