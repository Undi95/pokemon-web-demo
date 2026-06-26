#!/usr/bin/env node
/**
 * audit-scrcmd-conditional-jumps.cjs — ORACLE de complétude des sauts conditionnels overworld.
 *
 * L'interpréteur de scripts overworld dispatche par NOM (`getOpcodeHandler(op.name)`) ; un opcode
 * SANS handler enregistré → `dispatchOpcode` NO-OP silencieux (warn once). Pour un opcode de SAUT
 * CONDITIONNEL (`goto_if_*`/`call_if_*`/`vgoto_if_*`/`vcall_if_*`), un no-op = la branche ne se
 * fait PAS → le script tombe en séquence = LOGIQUE CASSÉE (bug réel : vgoto_if_ne manquant,
 * utilisé par MysteryGiftScript_AlteringCave/_BattleCard, corrigé). Cet oracle collecte les opcodes
 * de cette famille RÉELLEMENT UTILISÉS dans les scripts compilés (public/decomp/em/scripts/_all.json)
 * et vérifie que chacun a un `registerOpcode(...)` côté port.
 *
 *   node scripts/audit-scrcmd-conditional-jumps.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const COND_RE = /^v?(goto|call)_if(_[a-z0-9_]+)?$/;

// opcodes de saut conditionnel UTILISÉS dans les scripts compilés
const allJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/scripts/_all.json'), 'utf8'));
const used = new Map();
for (const name in allJson.scripts) {
  for (const line of allJson.scripts[name]) {
    if (typeof line !== 'string') continue;
    const op = line.trim().split(/[\s,]/)[0];
    if (COND_RE.test(op)) used.set(op, (used.get(op) || 0) + 1);
  }
}

// opcodes ENREGISTRÉS (registerOpcode dans tout src/)
const registered = new Set();
const files = execSync('grep -rln registerOpcode src/ --include=*.ts', { cwd: ROOT }).toString().trim().split('\n');
for (const f of files) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of s.matchAll(/registerOpcode\(\s*['"]([a-z0-9_]+)['"]/g)) registered.add(m[1]);
}

const findings = [];
let checked = 0;
for (const [op, count] of [...used.entries()].sort()) {
  checked++;
  if (!registered.has(op)) findings.push(`${op} : UTILISÉ ×${count} mais AUCUN registerOpcode → no-op silencieux (branche cassée)`);
}

console.log(`Sauts conditionnels overworld confrontés : ${checked} opcodes distincts utilisés (goto_if/call_if/v…) vs registerOpcode.`);
if (findings.length === 0) { console.log('✅ Tous les sauts conditionnels utilisés ont un handler enregistré.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
