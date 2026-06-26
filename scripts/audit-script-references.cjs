#!/usr/bin/env node
/**
 * audit-script-references.cjs — ORACLE d'intégrité des références inter-scripts.
 *
 * Les scripts overworld sautent vers d'autres scripts via `goto X`/`call X`/`goto_if_eq …, X` etc.
 * (X = label de script). Si X n'est PAS un script défini, le saut no-op silencieusement à l'exécution
 * (dispatchOpcode warn-once) → branche d'événement cassée. Cet oracle vérifie que TOUTE destination
 * de saut dans les scripts compilés (public/decomp/em/scripts/_all.json) est un script (ou texte)
 * défini → graphe de références FERMÉ. Une destination pendante = bug d'extraction (script déposé).
 *
 *   node scripts/audit-script-references.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/scripts/_all.json'), 'utf8'));
const definedScripts = new Set(Object.keys(all.scripts));
const definedTexts = new Set(Object.keys(all.texts || {}));

const JUMP_OPS = new Set(['goto', 'call', 'goto_if', 'call_if', 'vgoto', 'vcall',
  'goto_if_eq', 'goto_if_ne', 'goto_if_lt', 'goto_if_gt', 'goto_if_le', 'goto_if_ge',
  'goto_if_set', 'goto_if_unset', 'call_if_eq', 'call_if_ne', 'call_if_set', 'call_if_unset',
  'vgoto_if_eq', 'vgoto_if_ne', 'vgoto_if_set', 'vgoto_if_unset',
  'vcall_if_eq', 'vcall_if_ne', 'vcall_if_set', 'vcall_if_unset']);
// destinations à ignorer (constantes/macros, pas des labels de script)
const SKIP = /^(TRUE|FALSE|VAR_|FLAG_|MOVE_|ITEM_|SPECIES_|B_|MSGBOX|MAP_|NO|YES)/;

const ref = new Map(); // label -> {count, sample}
for (const sname in all.scripts) {
  for (const line of all.scripts[sname]) {
    if (typeof line !== 'string') continue;
    const op = line.trim().split(/\s+/)[0];
    if (!JUMP_OPS.has(op)) continue;
    const args = line.slice(op.length).split(',').map((s) => s.trim()).filter(Boolean);
    const dest = args[args.length - 1];
    if (dest && /^[A-Z][A-Za-z0-9_]+$/.test(dest) && !SKIP.test(dest)) {
      if (!ref.has(dest)) ref.set(dest, { count: 0, s: sname });
      ref.get(dest).count++;
    }
  }
}

const findings = [];
let checked = 0;
for (const [label, info] of [...ref.entries()].sort()) {
  checked++;
  if (!definedScripts.has(label) && !definedTexts.has(label))
    findings.push(`${label} : destination de saut (×${info.count}, ex. ${info.s.slice(0, 60)}) NON définie → saut cassé`);
}

console.log(`Références inter-scripts confrontées : ${checked} destinations de saut distinctes (${definedScripts.size} scripts définis).`);
if (findings.length === 0) { console.log('✅ Graphe de références inter-scripts FERMÉ (toute destination goto/call est définie).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
