#!/usr/bin/env node
/**
 * validate-script-expansion.cjs — validateur de complétude du compilateur byte-VM.
 *
 * Expanse CHAQUE ligne de script overworld des 468 fichiers de map (via
 * lib/expand-composites.cjs) et vérifie que tout bottom-out en opcodes réels.
 * Tout token non résolu qui N'EST PAS une action de mouvement (movement-actions.json)
 * ni un artefact préprocesseur (#…) est un trou réel à corriger.
 *
 * Régression : doit rester à « 0 opcode de script non résolu ».
 */
'use strict';

const fs = require('fs');
const path = require('path');
const E = require('./lib/expand-composites.cjs');

const ROOT = path.join(__dirname, '..');
const dir = path.join(ROOT, 'public/decomp/em/scripts');
const movActions = new Set(Object.keys(JSON.parse(
  fs.readFileSync(path.join(ROOT, 'public/decomp/em/movement-actions.json'), 'utf8'))));
const movEnd = new Set(['step_end', 'face_default', 'walk_in_place_down']);

/** Un script-label est en fait une séquence de mouvement (pas des opcodes). */
function isMovement(lines) {
  if (!lines.length) return false;
  const last = String(lines[lines.length - 1]).trim();
  if (!movEnd.has(last)) return false;
  return lines.every((l) => {
    const t = String(l).trim();
    return !t.includes(',') && (movActions.has(t.split(/\s+/)[0]) || movEnd.has(t));
  });
}

function main() {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== '_all.json' && f !== '_common.json');
  const realGaps = new Map();   // token non résolu ET non-mouvement
  const movResidual = new Map(); // tokens mouvement ayant fuité (classif imparfaite — OK)
  let scripts = 0, lines = 0, expandedOps = 0, skippedMov = 0, skippedPre = 0;

  for (const f of files) {
    let j; try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { continue; }
    for (const arr of Object.values(j.scripts || {})) {
      if (!Array.isArray(arr)) continue;
      if (isMovement(arr)) { skippedMov++; continue; }
      scripts++;
      for (const line of arr) {
        const s = String(line).trim();
        if (!s) continue;
        if (s.startsWith('#')) { skippedPre++; continue; }   // artefact préproc
        if (s.startsWith('map_script')) continue;            // table de map-scripts
        lines++;
        let ops;
        try { ops = E.expandLine(s); }
        catch (e) { bump(realGaps, `EXC:${s.split(/\s+/)[0]}`); continue; }
        for (const o of ops) {
          expandedOps++;
          if (o.unknown) bump(movActions.has(o.name) || movEnd.has(o.name) ? movResidual : realGaps, o.name);
        }
      }
    }
  }

  console.log(`=== validate-script-expansion ===`);
  console.log(`fichiers map       : ${files.length}`);
  console.log(`scripts (non-mov)  : ${scripts}  (movements ignorés: ${skippedMov})`);
  console.log(`lignes overworld   : ${lines}  (préproc # ignorés: ${skippedPre})`);
  console.log(`opcodes réels émis : ${expandedOps}`);
  const mr = [...movResidual.entries()].reduce((a, [, n]) => a + n, 0);
  console.log(`résidu mouvement   : ${movResidual.size} tokens (${mr} occ.) — séquences de mouvement mal classées, gérées par movement-system`);
  const gaps = [...realGaps.entries()].sort((a, b) => b[1] - a[1]);
  if (gaps.length === 0) {
    console.log(`\n✅ 0 opcode de script non résolu — expandeur complet sur tout le corpus overworld.`);
    process.exitCode = 0;
  } else {
    console.log(`\n❌ TROUS RÉELS (${gaps.length}) :`);
    for (const [k, n] of gaps) console.log(`   ${k}  x${n}`);
    process.exitCode = 1;
  }
}
function bump(map, k) { map.set(k, (map.get(k) || 0) + 1); }

main();
