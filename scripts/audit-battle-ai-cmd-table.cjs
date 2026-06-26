#!/usr/bin/env node
/**
 * audit-battle-ai-cmd-table.cjs — ORACLE de la table de dispatch des commandes de l'IA de combat.
 *
 * L'IA de combat exécute un bytecode via `sBattleAICmdTable[*gAIScriptPtr]()` : un tableau
 * POSITIONNEL (index = opcode AI) de handlers `Cmd_*`. Un handler à la mauvaise position = l'IA
 * interprète mal son script (décisions faussées). Le décomp
 * (battle_ai_script_commands.c:160 `static const BattleAICmdFunc sBattleAICmdTable[] = {...}`) et
 * le port (battle_ai_script_commands.ts, même tableau) listent les Cmd_* dans l'ordre des opcodes.
 * Cet oracle confronte les deux listes ordonnées, index par index (noms normalisés).
 *
 *   node scripts/audit-battle-ai-cmd-table.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const C_SRC = path.join(DECOMP, 'src/battle_ai_script_commands.c');
const TS_SRC = path.join(ROOT, 'src/battle_ai_script_commands.ts');

const norm = (n) => n.replace(/^_+/, '').replace(/__b\d+$/i, '').toLowerCase();

// extrait la liste ORDONNÉE des Cmd_* du corps `sBattleAICmdTable[] = { ... }`.
function parseTable(src) {
  const m = src.match(/sBattleAICmdTable[^=]*=\s*[\[{]([\s\S]*?)[\]}];/);
  if (!m) return null;
  const body = m[1].replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const names = [];
  for (const raw of body.split(',')) {
    const e = raw.trim();
    if (!e) continue;
    const id = e.match(/^([A-Za-z_]\w*)/);
    if (id) names.push(id[1]);
  }
  return names;
}

const decompList = parseTable(fs.readFileSync(C_SRC, 'utf8'));
const portList = parseTable(fs.readFileSync(TS_SRC, 'utf8'));

const findings = [];
if (!decompList) findings.push('table décomp introuvable');
if (!portList) findings.push('table port introuvable');
let checked = 0;
if (decompList && portList) {
  if (decompList.length !== portList.length)
    findings.push(`longueur : décomp=${decompList.length} port=${portList.length}`);
  const n = Math.min(decompList.length, portList.length);
  for (let i = 0; i < n; i++) {
    checked++;
    if (norm(decompList[i]) !== norm(portList[i]))
      findings.push(`opcode 0x${i.toString(16).toUpperCase()} : port=${portList[i]} décomp=${decompList[i]}`);
  }
}

console.log(`Table IA sBattleAICmdTable confrontée : ${checked} opcodes (positionnel) vs décomp.`);
if (findings.length === 0) { console.log('✅ Dispatch IA opcode->handler FIDÈLE au décomp (ordre des Cmd_* 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 60)) console.log('  ' + f);
process.exit(1);
