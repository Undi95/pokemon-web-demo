#!/usr/bin/env node
/**
 * audit-battle-opcode-table.cjs — ORACLE de la table de dispatch des opcodes de combat.
 *
 * Les BattleScripts (bytecode) sont interprétés via une table opcode -> handler. Un opcode mappé
 * au MAUVAIS Cmd_* = mauvaise commande exécutée (move cassé). Le décomp définit
 * `gBattleScriptingCommandsTable[]` par initialiseurs désignés `[B_SCR_OP_X] = Cmd_Y` (enum
 * BattleScriptOpcode séquentiel) ; le port enregistre `commandsTable[0xNN] = Cmd_Y`. Cet oracle
 * résout B_SCR_OP_* (enum) -> valeur, confronte le Cmd_* par opcode entre port et décomp, et
 * signale tout écart + tout opcode décomp non enregistré côté port.
 *
 *   node scripts/audit-battle-opcode-table.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const C_SRC = path.join(DECOMP, 'src/battle_script_commands.c');
const TS_SRC = path.join(ROOT, 'src/battle_script_commands.ts');

// ── résoudre l'enum BattleScriptOpcode (B_SCR_OP_*) ──────────────────────────
function evalExpr(expr, scope) {
  let s = expr.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  s = s.replace(/0[xX][0-9a-fA-F]+/g, (h) => String(parseInt(h, 16)));
  s = s.replace(/[A-Za-z_]\w*/g, (id) => { if (id in scope) return '(' + scope[id] + ')'; throw new Error('ref'); });
  if (!/^[-0-9<>|&~()+*\/\s]+$/.test(s)) throw new Error('unsafe');
  return Function('"use strict";return (' + s + ')')() | 0;
}
const opEnum = {};
{
  const h = fs.readFileSync(path.join(DECOMP, 'include/constants/battle_script_commands.h'), 'utf8');
  const m = h.match(/enum\s+BattleScriptOpcode\s*\{([\s\S]*?)\}/);
  if (m) {
    const body = m[1].replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    let cur = 0;
    for (const raw of body.split(',')) {
      const e = raw.trim(); if (!e) continue;
      const eq = e.indexOf('='); const name = (eq < 0 ? e : e.slice(0, eq)).trim();
      if (!/^[A-Z_][A-Z0-9_]*$/.test(name)) continue;
      const val = eq < 0 ? cur : evalExpr(e.slice(eq + 1), opEnum);
      opEnum[name] = val; cur = val + 1;
    }
  }
}

// ── table décomp : [B_SCR_OP_X] = Cmd_Y ──────────────────────────────────────
const cSrc = fs.readFileSync(C_SRC, 'utf8');
const tblMatch = cSrc.match(/gBattleScriptingCommandsTable\[\][^=]*=\s*\{([\s\S]*?)\n\};/);
const decompMap = {};       // opcode value -> Cmd name
const unresolved = [];
if (tblMatch) {
  for (const m of tblMatch[1].matchAll(/\[\s*([A-Z0-9_]+)\s*\]\s*=\s*(Cmd_[A-Za-z0-9_]+)/g)) {
    if (!(m[1] in opEnum)) { unresolved.push(m[1]); continue; }
    decompMap[opEnum[m[1]]] = m[2];
  }
}

// ── tables port : commandsTable[] (logique combat) + _commands[] (contrôle de flux
//    goto/call/return/end/pause/waitstate, gérés par l'interpréteur — domaine pointeur/pile). ──
// Normalisation : strip préfixe `_`, suffixe de dédup `__bNN`, casse (artefacts de port : un
// `Cmd_clearstatusfromeffect__b02` ou `Cmd_tryko` reste LE handler — c'est le mapping opcode qui
// compte, pas le nom exact du symbole TS).
const norm = (n) => n.replace(/^_+/, '').replace(/__b\d+$/i, '').toLowerCase();
const INTERP_SRC = path.join(ROOT, 'src/engine/battle/script-interpreter.ts');
const tsSrc = fs.readFileSync(TS_SRC, 'utf8');
const interpSrc = fs.readFileSync(INTERP_SRC, 'utf8');
const portMap = {};
for (const m of tsSrc.matchAll(/commandsTable\[\s*(0x[0-9A-Fa-f]+|\d+)\s*\]\s*=\s*(_?Cmd_[A-Za-z0-9_]+)/g)) {
  portMap[Number(m[1])] = m[2];
}
for (const m of interpSrc.matchAll(/_commands\[\s*(0x[0-9A-Fa-f]+|\d+)\s*\]\s*=\s*(_?Cmd_[A-Za-z0-9_]+)/g)) {
  if (portMap[Number(m[1])] === undefined) portMap[Number(m[1])] = m[2];
}

// ── confrontation ────────────────────────────────────────────────────────────
const findings = [];
let checked = 0;
const opcodes = Object.keys(decompMap).map(Number).sort((a, b) => a - b);
for (const op of opcodes) {
  const dec = decompMap[op];
  const prt = portMap[op];
  checked++;
  const hex = '0x' + op.toString(16).toUpperCase().padStart(2, '0');
  if (prt === undefined) findings.push(`${hex} : décomp=${dec} — NON enregistré côté port (ni commandsTable ni _commands)`);
  else if (norm(prt) !== norm(dec)) findings.push(`${hex} : port=${prt} décomp=${dec}`);
}

console.log(`Table d'opcodes de combat confrontée : ${checked} opcodes (décomp gBattleScriptingCommandsTable) vs port commandsTable.`);
if (unresolved.length) console.log(`  (note : ${unresolved.length} entrée(s) décomp à nom non résolu — ignorées : ${[...new Set(unresolved)].slice(0, 6).join(', ')})`);
if (findings.length === 0) { console.log('✅ Dispatch opcode->handler FIDÈLE au décomp (chaque B_SCR_OP_* → bon Cmd_*).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 60)) console.log('  ' + f);
process.exit(1);
