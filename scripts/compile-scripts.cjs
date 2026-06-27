#!/usr/bin/env node
/**
 * compile-scripts.cjs — LINKER : émet l'IMAGE GLOBALE de bytecode (byte-VM).
 *
 * Concatène TOUS les event scripts (common + maps, en ordre source) dans une
 * seule image contiguë -> préserve le FALLTHROUGH 1:1 (un script sans `end`
 * tombe dans le suivant ; ~5 % des scripts en dépendent). Les pointeurs de
 * script (goto/call/event scripts de trainerbattle/…) deviennent de vrais
 * OFFSETS GLOBAUX dans l'image (relocations patchées en 2 passes) — comme des
 * adresses ROM. Les ressources irréplicables (texte/mouvement/mart/natif) →
 * ids de SYMBOLES résolus au runtime par le handler.
 *
 * Sortie : public/decomp/em/script-bytecode.json
 *   {
 *     meta: {...},
 *     image:        "<base64>",                 // Uint8Array de toute l'image
 *     scriptOffsets:{ <label>: <offset> },      // point d'entrée de chaque script/table
 *     symbols:      [ {kind, label}, ... ],     // id-indexé (ptr externes)
 *     mapSymbols:   [ <MAP_*>, ... ],           // id-indexé (refs map 2o)
 *     mapScripts:   { <MapName>: <MapScriptsLabel|null> },  // label de la table d'entête
 *     mapScriptTables: { <label>: [ {name,args} ] },        // tables map_script(_2) parsées
 *     tail:         [ <label>, ... ],           // non compilés (tail documenté)
 *   }
 *
 * Préproc #ifdef fidélité RETAIL (UBFIX/BUGFIX OFF). Build-time, déterministe.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const E = require('./lib/expand-composites.cjs');
const A = require('./lib/assemble-script.cjs');
const C = require('./lib/decomp-constants.cjs');

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
function isTable(lines) { return lines.some((l) => /^\s*map_script(_2)?\b/.test(String(l))); }

function preprocess(lines) {
  const out = []; const stack = [{ active: true, taken: true }];
  const parentActive = () => stack.slice(0, -1).every((s) => s.active);
  const active = () => stack.every((s) => s.active);
  for (const raw of lines) {
    const s = String(raw).trim(); let m;
    if ((m = s.match(/^#ifdef\s+(\w+)/))) { const on = DEFINES.has(m[1]); stack.push({ active: active() && on, taken: on }); continue; }
    if ((m = s.match(/^#ifndef\s+(\w+)/))) { const on = !DEFINES.has(m[1]); stack.push({ active: active() && on, taken: on }); continue; }
    if (/^#else\b/.test(s)) { const t = stack[stack.length - 1]; t.active = parentActive() && !t.taken; t.taken = true; continue; }
    if (/^#endif\b/.test(s)) { if (stack.length > 1) stack.pop(); continue; }
    if (s.startsWith('#')) continue;
    if (active()) out.push(raw);
  }
  return out;
}

function parseKeep(line) {
  const s = String(line).trim(); if (!s) return null;
  const sp = s.search(/\s/);
  if (sp === -1) return { name: s, args: [] };
  return { name: s.slice(0, sp), args: s.slice(sp + 1).split(',').map((x) => x.trim()).filter(Boolean) };
}

function expandToRealOps(lines) {
  const realOps = [];
  for (const line of preprocess(lines)) {
    const s = String(line).trim();
    if (!s || s.startsWith('map_script')) continue;
    for (const op of E.expandLine(s)) {
      if (op.unknown) { if (!movActions.has(op.name) && !movEnd.has(op.name)) throw new Error(`opcode non résolu: ${op.name}`); continue; }
      realOps.push(op);
    }
  }
  return realOps;
}

function main() {
  const common = (() => { try { return JSON.parse(fs.readFileSync(path.join(dir, '_common.json'), 'utf8')); } catch { return { scripts: {}, texts: {} }; } })();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== '_all.json' && f !== '_common.json').sort();

  // ── Collecte globale : scripts (ordre source), movements, texts, tables, localIds ──
  const allScripts = new Map();        // label -> {lines, mapName}  (1er gagne)
  const allText = new Set(), allMovement = new Set();
  const mapScriptTables = {};           // label -> [{name,args}]
  const mapScriptsLabel = {};           // MapName -> son label *_MapScripts (ou null)
  const mapLocalIds = {};               // MapName -> { LOCALID_*: n }
  const globalLocalIds = Object.create(null);

  // global localIds (fallback cross-map) + texts/movements globaux
  for (const f of files) {
    let mj; try { mj = JSON.parse(fs.readFileSync(path.join(mapsDir, f), 'utf8')); } catch { mj = null; }
    if (mj) (mj.object_events || []).forEach((o, i) => { if (o.local_id && globalLocalIds[o.local_id] === undefined) globalLocalIds[o.local_id] = i + 1; });
  }

  const units = [['_common', common], ...files.map((f) => [f.replace(/\.json$/, ''), readJson(path.join(dir, f))])];
  for (const [mapName, j] of units) {
    if (!j) continue;
    for (const label of Object.keys(j.texts || {})) allText.add(label);
    // per-map localIds
    const li = Object.assign(Object.create(null), globalLocalIds);
    let mj; try { mj = JSON.parse(fs.readFileSync(path.join(mapsDir, mapName + '.json'), 'utf8')); } catch { mj = null; }
    if (mj) (mj.object_events || []).forEach((o, i) => { if (o.local_id) li[o.local_id] = i + 1; });
    mapLocalIds[mapName] = li;
    for (const [label, lines] of Object.entries(j.scripts || {})) {
      if (isMovement(lines)) { allMovement.add(label); continue; }
      if (isTable(lines)) {
        mapScriptTables[label] = preprocess(lines).map(parseKeep).filter(Boolean);
        if (/_MapScripts$/.test(label)) mapScriptsLabel[mapName] = label;
        continue;
      }
      if (!allScripts.has(label)) allScripts.set(label, { lines, mapName });
    }
  }

  const globalScriptLabels = new Set(allScripts.keys());
  const classify = (label) => allText.has(label) ? 'text'
    : allMovement.has(label) ? 'movement'
    : martLabels.has(label) ? 'mart'
    : globalScriptLabels.has(label) ? 'script' : null;
  const isScript = (label) => globalScriptLabels.has(label);
  const env = A.makeEnv(classify, isScript, null);

  // ── Pass 1 : assemble chaque script en ordre, calcule les offsets globaux ──
  // Un échec d'EXPANSION (opcode inconnu) = script d'un AUTRE moteur (combat/anim/
  // AI/field-effect) présent dans _common -> exclu silencieusement (pas de l'overworld).
  // Un échec d'ASSEMBLAGE (constante non résolue) = vrai tail overworld documenté.
  const compiled = [];                  // {label, bytes, relocs, offset}
  const scriptOffsets = {};
  const tail = [];                      // overworld non compilé (tail documenté)
  const notOverworld = [];              // autre DSL (combat/anim/AI/…)
  let cursor = 0;
  for (const [label, { lines, mapName }] of allScripts) {
    env.localIds = mapLocalIds[mapName] || globalLocalIds;
    let realOps;
    try { realOps = expandToRealOps(lines); }
    catch (e) { notOverworld.push(label); continue; }
    let res;
    try { res = A.assembleScript(realOps, env); }
    catch (e) { tail.push(label); continue; }
    scriptOffsets[label] = cursor;
    compiled.push({ label, bytes: res.bytes, relocs: res.relocs, offset: cursor });
    cursor += res.bytes.length;
  }
  const imageSize = cursor;

  // ── Pass 2 : image + patch des relocations (offset global du label cible) ──
  const image = new Uint8Array(imageSize);
  let unresolvedRelocs = 0;
  for (const { bytes, relocs, offset } of compiled) {
    image.set(bytes, offset);
    for (const r of relocs) {
      const target = scriptOffsets[r.label];
      if (target === undefined) { unresolvedRelocs++; continue; } // cible non compilée (tail) -> reste 0
      const p = offset + r.pos;
      image[p] = target & 0xFF; image[p + 1] = (target >> 8) & 0xFF;
      image[p + 2] = (target >> 16) & 0xFF; image[p + 3] = (target >>> 24) & 0xFF;
    }
  }

  const out = {
    meta: {
      note: 'Généré par scripts/compile-scripts.cjs (byte-VM linker). Image globale + relocations. NE PAS éditer.',
      maps: files.length,
      scriptsCompiled: compiled.length,
      scriptsTail: tail.length,
      scriptsOtherDsl: notOverworld.length,
      mapScriptTables: Object.keys(mapScriptTables).length,
      imageBytes: imageSize,
      symbols: env.symbols.list.length,
      mapSymbols: env.mapSymbols.list.length,
      unresolvedRelocs,
      defines: [...DEFINES],
    },
    image: Buffer.from(image).toString('base64'),
    scriptOffsets,
    symbols: env.symbols.list.map((s) => ({ kind: s.kind, label: s.label })),
    mapSymbols: env.mapSymbols.list.map((s) => s.mapConst),
    mapScripts: mapScriptsLabel,
    mapScriptTables,
    tail,
  };
  fs.writeFileSync(OUT, JSON.stringify(out), 'utf8');

  console.log(`=== compile-scripts (linker image globale) ===`);
  console.log(`scripts overworld compilés : ${out.meta.scriptsCompiled}  (tail documenté: ${out.meta.scriptsTail})`);
  console.log(`exclus (autre DSL combat/anim/AI/field) : ${out.meta.scriptsOtherDsl}`);
  console.log(`tables map_script : ${out.meta.mapScriptTables}`);
  console.log(`image (octets)    : ${out.meta.imageBytes}`);
  console.log(`symboles externes : ${out.meta.symbols}   map-refs : ${out.meta.mapSymbols}`);
  console.log(`relocs non résolues (cible tail) : ${out.meta.unresolvedRelocs}`);
  console.log(`écrit             : ${path.relative(ROOT, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(0)} Ko)`);
}

function readJson(p) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; } }

main();
