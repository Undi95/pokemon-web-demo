#!/usr/bin/env node
/**
 * audit-script-references.cjs — ORACLE d'intégrité des références inter-scripts.
 *
 * Les scripts overworld référencent par LABEL : d'autres scripts (`goto X`/`call X`/`goto_if_eq …, X`),
 * des textes (`msgbox X`/`message X`), et des scripts de mouvement (`applymovement localId, X`). Si X
 * n'est PAS défini, l'action no-op silencieusement à l'exécution (dispatchOpcode warn-once) → branche
 * cassée / dialogue manquant / NPC immobile. Cet oracle vérifie que TOUTE référence par label dans les
 * scripts compilés (public/decomp/em/scripts/_all.json) résout vers un script ou texte défini → graphe
 * de références FERMÉ. Une référence pendante = bug d'extraction (script/texte déposé). NULL (pointeur
 * C nul des `msgbox NULL`, texte chargé dynamiquement) est exclu.
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
// labels à ignorer (constantes/macros/NULL = pointeur C nul ; pas des labels de script/texte)
const SKIP = /^(TRUE|FALSE|VAR_|FLAG_|MOVE_|ITEM_|SPECIES_|B_|MSGBOX|MAP_|NO|YES|NULL)$|^(VAR_|FLAG_|MOVE_|ITEM_|SPECIES_|MAP_|TRAINER_|MUS_|SE_|B_)/;
const isLabel = (d) => d && /^[A-Z][A-Za-z0-9_]+$/.test(d) && !SKIP.test(d);
// opcodes référençant un TEXTE (msgbox/message…) → arg = label de texte
const TEXT_OP = { msgbox: 0, message: 0, braille: 0, vmessage: 0, vmsgbox: 0, preparemsg: 0 };
// opcodes référençant un script de MOUVEMENT (applymovement localId, Mvt) → 2e arg
const MOVE_OP = new Set(['applymovement', 'applymovement_at', 'applymovementat']);

const ref = new Map(); // label -> {count, sample, kind}
function note(label, sname, kind) {
  if (!ref.has(label)) ref.set(label, { count: 0, s: sname, kind });
  ref.get(label).count++;
}
for (const sname in all.scripts) {
  for (const line of all.scripts[sname]) {
    if (typeof line !== 'string') continue;
    const op = line.trim().split(/\s+/)[0];
    const args = line.slice(op.length).split(',').map((s) => s.trim()).filter(Boolean);
    if (JUMP_OPS.has(op)) { const d = args[args.length - 1]; if (isLabel(d)) note(d, sname, 'saut'); }
    else if (op in TEXT_OP) { const d = args[TEXT_OP[op]]; if (isLabel(d)) note(d, sname, 'texte'); }
    else if (MOVE_OP.has(op)) { const d = args[1]; if (isLabel(d)) note(d, sname, 'mouvement'); }
  }
}

const findings = [];
let checked = 0;
for (const [label, info] of [...ref.entries()].sort()) {
  checked++;
  if (!definedScripts.has(label) && !definedTexts.has(label))
    findings.push(`${label} : référence ${info.kind} (×${info.count}, ex. ${info.s.slice(0, 55)}) NON définie → ${info.kind === 'texte' ? 'dialogue manquant' : info.kind === 'mouvement' ? 'NPC immobile' : 'saut cassé'}`);
}

console.log(`Références de scripts confrontées : ${checked} labels distincts (saut/texte/mouvement) vs ${definedScripts.size} scripts + ${definedTexts.size} textes définis.`);
if (findings.length === 0) { console.log('✅ Graphe de références FERMÉ (toute destination goto/call/msgbox/applymovement est définie).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
