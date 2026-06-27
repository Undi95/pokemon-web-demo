#!/usr/bin/env node
/**
 * compile-scripts.cjs — driver d'émission du bytecode (byte-VM Phase 2, finition).
 *
 * Compile TOUS les scripts overworld (les 468 maps + _common) en bytecode + tables
 * de symboles, via la pipeline validée : préproc #ifdef → expand-composites →
 * assemble-script. Sortie : public/decomp/em/script-bytecode.json
 *   {
 *     meta: {...},
 *     maps: {
 *       <MapName>: {
 *         bytecode:        { <scriptLabel>: "<hex>" },          // event scripts compilés
 *         symbols:         [ {kind, label}, ... ],              // id-indexé (pointeurs .4byte)
 *         mapSymbols:      [ <MAP_*>, ... ],                    // id-indexé (refs map 2o)
 *         mapScriptTables: { <label>: [ {name, args}, ... ] },  // tables map_script (gardées parsées)
 *         tail:            [ <label>, ... ],                    // scripts non compilés (tail documenté)
 *       }, ...
 *     }
 *   }
 *
 * Préproc : fidélité RETAIL (config.h `#if MODERN || BUGFIX` → UBFIX/BUGFIX NON
 * définis) → corps `#ifdef UBFIX|BUGFIX` SKIPPÉS, `#ifndef` GARDÉS.
 *
 * Outil de build (non 1:1) — déterministe.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const E = require('./lib/expand-composites.cjs');
const A = require('./lib/assemble-script.cjs');

const ROOT = path.join(__dirname, '..');
const dir = path.join(ROOT, 'public/decomp/em/scripts');
const mapsDir = path.join(ROOT, 'public/decomp/em/maps');
const OUT = path.join(ROOT, 'public/decomp/em/script-bytecode.json');

const DEFINES = new Set(); // retail : ni UBFIX ni BUGFIX

const movActions = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/movement-actions.json'), 'utf8'))));
const movEnd = new Set(['step_end', 'face_default', 'walk_in_place_down']);
const martLabels = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em/mart-lists.json'), 'utf8'))));

function isMovement(lines) {
  if (!Array.isArray(lines) || !lines.length) return false;
  const last = String(lines[lines.length - 1]).trim();
  if (!movEnd.has(last)) return false;
  return lines.every((l) => { const t = String(l).trim(); return !t.includes(',') && (movActions.has(t.split(/\s+/)[0]) || movEnd.has(t)); });
}

/** Préprocesseur C minimal (#ifdef/#ifndef/#else/#endif) contre DEFINES. */
function preprocess(lines) {
  const out = [];
  const stack = [{ active: true, taken: true }];
  const parentActive = () => stack.slice(0, -1).every((s) => s.active);
  const active = () => stack.every((s) => s.active);
  for (const raw of lines) {
    const s = String(raw).trim();
    let m;
    if ((m = s.match(/^#ifdef\s+(\w+)/))) { const on = DEFINES.has(m[1]); stack.push({ active: active() && on, taken: on }); continue; }
    if ((m = s.match(/^#ifndef\s+(\w+)/))) { const on = !DEFINES.has(m[1]); stack.push({ active: active() && on, taken: on }); continue; }
    if (/^#elif\b/.test(s)) { const t = stack[stack.length - 1]; t.active = false; continue; } // pas rencontré ; conservateur
    if (/^#else\b/.test(s)) { const t = stack[stack.length - 1]; t.active = parentActive() && !t.taken; t.taken = true; continue; }
    if (/^#endif\b/.test(s)) { if (stack.length > 1) stack.pop(); continue; }
    if (s.startsWith('#')) continue; // autre directive préproc inconnue
    if (active()) out.push(raw);
  }
  return out;
}

function loadCommon() {
  try { return JSON.parse(fs.readFileSync(path.join(dir, '_common.json'), 'utf8')); } catch { return { scripts: {}, texts: {} }; }
}

function buildGlobalLocalIds() {
  const g = Object.create(null);
  if (!fs.existsSync(mapsDir)) return g;
  for (const f of fs.readdirSync(mapsDir).filter((x) => x.endsWith('.json'))) {
    try {
      const mj = JSON.parse(fs.readFileSync(path.join(mapsDir, f), 'utf8'));
      (mj.object_events || []).forEach((o, i) => { if (o.local_id && g[o.local_id] === undefined) g[o.local_id] = i + 1; });
    } catch { /* skip */ }
  }
  return g;
}

const toHex = (u8a) => Buffer.from(u8a).toString('hex');

function main() {
  const common = loadCommon();
  const globalLocalIds = buildGlobalLocalIds();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== '_all.json' && f !== '_common.json');

  const maps = {};
  let totalScripts = 0, totalBytes = 0, totalTail = 0, totalTables = 0;

  for (const f of files) {
    let j; try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { continue; }
    const mapName = f.replace(/\.json$/, '');

    // namespaces (map + common) pour classify
    const scriptLabels = new Set(), movementLabels = new Set(), textLabels = new Set();
    for (const src of [common, j]) {
      for (const [label, lines] of Object.entries(src.scripts || {})) {
        if (isMovement(lines)) movementLabels.add(label); else scriptLabels.add(label);
      }
      for (const label of Object.keys(src.texts || {})) textLabels.add(label);
    }
    const classify = (label) => textLabels.has(label) ? 'text'
      : movementLabels.has(label) ? 'movement'
      : martLabels.has(label) ? 'mart'
      : scriptLabels.has(label) ? 'script' : null;

    const localIds = Object.assign(Object.create(null), globalLocalIds);
    try {
      const mj = JSON.parse(fs.readFileSync(path.join(mapsDir, f), 'utf8'));
      (mj.object_events || []).forEach((o, i) => { if (o.local_id) localIds[o.local_id] = i + 1; });
    } catch { /* pas de map JSON */ }

    const env = A.makeEnv(classify, localIds);
    const bytecode = {};
    const mapScriptTables = {};
    const tail = [];

    for (const [label, lines] of Object.entries(j.scripts || {})) {
      if (isMovement(lines)) continue;             // mouvements : ressource séparée
      const pre = preprocess(lines);
      // Table de map-scripts (map_script / map_script_2) → gardée parsée (lue par findMapScriptLabel)
      if (pre.some((l) => /^\s*map_script\b/.test(String(l)))) {
        mapScriptTables[label] = pre.map((l) => E.expandLine ? parseKeep(l) : l).filter(Boolean);
        totalTables++;
        continue;
      }
      totalScripts++;
      try {
        const realOps = [];
        for (const line of pre) {
          const s = String(line).trim();
          if (!s || s.startsWith('map_script')) continue;
          for (const op of E.expandLine(s)) {
            if (op.unknown) { if (!movActions.has(op.name) && !movEnd.has(op.name)) throw new Error(`opcode non résolu: ${op.name}`); continue; }
            realOps.push(op);
          }
        }
        const bytes = A.assembleScript(realOps, env);
        bytecode[label] = toHex(bytes);
        totalBytes += bytes.length;
      } catch (e) {
        tail.push(label);   // tail documenté (TM nommés, etc.) — non compilé
        totalTail++;
      }
    }

    maps[mapName] = {
      bytecode,
      symbols: env.symbols.list.map((s) => ({ kind: s.kind, label: s.label })),
      mapSymbols: env.mapSymbols.list.map((s) => s.mapConst),
      mapScriptTables,
      tail,
    };
  }

  const out = {
    meta: {
      note: 'Généré par scripts/compile-scripts.cjs (byte-VM). Bytecode hex + tables de symboles par map. NE PAS éditer.',
      maps: Object.keys(maps).length,
      scriptsCompiled: totalScripts - totalTail,
      scriptsTail: totalTail,
      mapScriptTables: totalTables,
      bytecodeBytes: totalBytes,
      defines: [...DEFINES],
    },
    maps,
  };
  fs.writeFileSync(OUT, JSON.stringify(out), 'utf8');

  console.log(`=== compile-scripts ===`);
  console.log(`maps              : ${out.meta.maps}`);
  console.log(`scripts compilés  : ${out.meta.scriptsCompiled}`);
  console.log(`scripts tail      : ${out.meta.scriptsTail}`);
  console.log(`tables map_script : ${out.meta.mapScriptTables}`);
  console.log(`bytecode (octets) : ${out.meta.bytecodeBytes}`);
  console.log(`écrit             : ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} Ko)`);
}

/** Parse une ligne map_script* en {name, args} (gardée telle quelle pour le runtime). */
function parseKeep(line) {
  const s = String(line).trim();
  if (!s) return null;
  const sp = s.search(/\s/);
  if (sp === -1) return { name: s, args: [] };
  return { name: s.slice(0, sp), args: s.slice(sp + 1).split(',').map((x) => x.trim()).filter(Boolean) };
}

main();
