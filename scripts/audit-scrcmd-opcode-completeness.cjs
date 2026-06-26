#!/usr/bin/env node
/**
 * audit-scrcmd-opcode-completeness.cjs — ORACLE de complétude des opcodes de script overworld.
 *
 * L'interpréteur de scripts overworld dispatche par NOM (`getOpcodeHandler(op.name)`) ; un opcode
 * SANS `registerOpcode` → `dispatchOpcode` NO-OP silencieux (warn once) = COMMANDE DE SCRIPT CASSÉE
 * (ex. un saut conditionnel qui ne branche pas, un setflag qui ne pose rien…). Bug réel trouvé :
 * `vgoto_if_ne` manquant (Mystery Gift), corrigé `1a87c8ea`.
 *
 * Liste canonique des opcodes OVERWORLD = clés de `public/decomp/em/script-opcodes.json` (`macros`,
 * = le registre que l'extracteur utilise pour émettre le bytecode). On collecte les opcodes
 * RÉELLEMENT UTILISÉS dans les scripts compilés (`scripts/_all.json`, 1er mot de chaque ligne) qui
 * appartiennent à ce registre canonique (⇒ filtre les opcodes d'AUTRES sous-systèmes — combat/anim/
 * IA/mouvement — qui partagent le fichier _all.json mais ne passent pas par registerOpcode), et on
 * vérifie que chacun a un handler `registerOpcode(...)` côté port.
 *
 *   node scripts/audit-scrcmd-opcode-completeness.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

// 1. registre canonique des opcodes overworld
const opc = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/script-opcodes.json'), 'utf8'));
const canonical = new Set(Object.keys(opc.macros || {}));

// 2. opcodes overworld RÉELLEMENT UTILISÉS dans les scripts compilés
const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/scripts/_all.json'), 'utf8'));
const used = new Map();
for (const n in all.scripts) {
  for (const l of all.scripts[n]) {
    if (typeof l !== 'string') continue;
    const op = l.trim().split(/[\s,]/)[0];
    if (canonical.has(op)) used.set(op, (used.get(op) || 0) + 1);
  }
}

// 3. opcodes ENREGISTRÉS (registerOpcode dans tout src/)
const registered = new Set();
for (const f of execSync('grep -rln registerOpcode src/ --include=*.ts', { cwd: ROOT }).toString().trim().split('\n')) {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of s.matchAll(/registerOpcode\(\s*['"]([a-z0-9_]+)['"]/g)) registered.add(m[1]);
}

const findings = [];
let checked = 0;
for (const [op, count] of [...used.entries()].sort()) {
  checked++;
  if (!registered.has(op)) findings.push(`${op} : UTILISÉ ×${count} (opcode overworld canonique) mais AUCUN registerOpcode → no-op silencieux`);
}

console.log(`Opcodes overworld confrontés : ${checked} distincts utilisés (sur ${canonical.size} macros canoniques) vs registerOpcode.`);
if (findings.length === 0) { console.log('✅ Tous les opcodes overworld utilisés ont un handler enregistré.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 50)) console.log('  ' + f);
process.exit(1);
