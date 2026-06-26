#!/usr/bin/env node
/**
 * audit-movement-name-to-action.cjs — ORACLE du mapping nom de mouvement → MOVEMENT_ACTION.
 *
 * Les scripts d'applymovement référencent des mouvements par NOM (`walk_down`, `face_left`,
 * `jump_2_down`…). Le port (`script_movement.ts`) mappe chaque nom à un `MOVEMENT_ACTION_*` qui
 * pilote l'animation/déplacement réel du NPC. Un nom mappé à la MAUVAISE action = le NPC fait le
 * mauvais mouvement (ex. `walk_down` → FACE_UP). Le décomp définit ce mapping de façon canonique
 * dans `asm/macros/movement.inc` (`create_movement_action <name>, MOVEMENT_ACTION_<X>`). Cet oracle
 * confronte les deux mappings nom→action (CORRECTNESS), et vérifie que tout mouvement décomp UTILISÉ
 * dans les scripts est présent dans la map port (COMPLÉTUDE). Distinct des oracles movement existants
 * (action→step-func, actionId↔enum) : ici c'est la couche NOM→action.
 *
 *   node scripts/audit-movement-name-to-action.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';

// décomp : create_movement_action <name>, MOVEMENT_ACTION_<X>
const inc = fs.readFileSync(path.join(DECOMP, 'asm/macros/movement.inc'), 'utf8');
const decompMap = new Map();
for (const m of inc.matchAll(/create_movement_action\s+([a-z0-9_]+)\s*,\s*(MOVEMENT_ACTION_[A-Z0-9_]+)/g)) decompMap.set(m[1], m[2]);

// port : ['<name>']: MOVEMENT_ACTION_<X>
const sm = fs.readFileSync(path.join(ROOT, 'src/script_movement.ts'), 'utf8');
const portMap = new Map();
for (const m of sm.matchAll(/\[\s*['"]([a-z0-9_]+)['"]\s*\]\s*:\s*(MOVEMENT_ACTION_[A-Z0-9_]+)/g)) portMap.set(m[1], m[2]);

// mouvements décomp réellement utilisés dans les scripts compilés
const all = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/scripts/_all.json'), 'utf8'));
const usedMove = new Map();
for (const n in all.scripts) {
  for (const l of all.scripts[n]) {
    if (typeof l !== 'string') continue;
    const op = l.trim().split(/[\s,]/)[0];
    if (decompMap.has(op)) usedMove.set(op, (usedMove.get(op) || 0) + 1);
  }
}

const findings = [];
let checked = 0;
// CORRECTNESS : tout nom mappé des deux côtés → même action
for (const [name, act] of decompMap) {
  if (!portMap.has(name)) continue;
  checked++;
  if (portMap.get(name) !== act) findings.push(`${name} : port=${portMap.get(name)} décomp=${act} (mauvaise action → mauvais mouvement)`);
}
// COMPLÉTUDE : tout mouvement décomp UTILISÉ par un script est dans la map port
for (const [name, count] of usedMove) {
  if (!portMap.has(name)) findings.push(`${name} : UTILISÉ ×${count} mais ABSENT de la map port → NPC sans mouvement`);
}

console.log(`Mapping mouvement nom→action confronté : ${checked} noms (décomp ${decompMap.size} / port ${portMap.size} ; mouvements utilisés ${usedMove.size}).`);
if (findings.length === 0) { console.log('✅ Mapping nom de mouvement → MOVEMENT_ACTION FIDÈLE au décomp (correctness + complétude).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
