#!/usr/bin/env node
/**
 * validate-script-assembly.cjs — valide le sérialiseur byte-VM sur tout le corpus.
 *
 * Pour chaque map (+ _common mergé), expanse puis ASSEMBLE chaque script overworld
 * en octets. Toute irrésolution (constante, special, arg manquant, opcode inconnu)
 * est collectée. Objectif régression : 0 erreur d'assemblage.
 *
 * Émet aussi des stats (octets totaux, symboles, map-refs) pour sanity-check.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const E = require('./lib/expand-composites.cjs');
const A = require('./lib/assemble-script.cjs');

const ROOT = path.join(__dirname, '..');
const dir = path.join(ROOT, 'public/decomp/em/scripts');
const movActions = new Set(Object.keys(JSON.parse(
  fs.readFileSync(path.join(ROOT, 'public/decomp/em/movement-actions.json'), 'utf8'))));
const movEnd = new Set(['step_end', 'face_default', 'walk_in_place_down']);
const martLabels = new Set(Object.keys(JSON.parse(
  fs.readFileSync(path.join(ROOT, 'public/decomp/em/mart-lists.json'), 'utf8'))));

function isMovement(lines) {
  if (!Array.isArray(lines) || !lines.length) return false;
  const last = String(lines[lines.length - 1]).trim();
  if (!movEnd.has(last)) return false;
  return lines.every((l) => { const t = String(l).trim(); return !t.includes(',') && (movActions.has(t.split(/\s+/)[0]) || movEnd.has(t)); });
}

function loadCommon() {
  try { return JSON.parse(fs.readFileSync(path.join(dir, '_common.json'), 'utf8')); } catch { return { scripts: {}, texts: {} }; }
}

// Tokens du « tail » connu et documenté (cf docs/BYTE-VM-PLAN.md). Tout token NON
// listé ici qui échoue = RÉGRESSION (fait échouer le validateur).
const KNOWN_TAIL = [
  /^STR_VAR_[23]$/,       // placeholders charmap utilisés comme valeur de setvar (Battle Dome) — vraiment edge
  /^COMPARE_SIZE_/,       // const locale (Lotad/Seedot house) définie hors include/.set
  /^MAP_NUM\(/, /^MAP_GROUP\(/, // map num/group : impossible (identité-map STRING, pas de MAP_* numérique) — 1 occ (Deoxys)
];
const isTail = (msg) => { const m = msg.match(/'([^']*)'/); return m && KNOWN_TAIL.some((re) => re.test(m[1])); };

/** Table GLOBALE des LOCALID_* (nom -> index+1) sur toutes les maps. Les noms sont
 *  uniques (préfixés par map) -> sert de fallback pour les refs cross-map (scripts
 *  partagés entre étages d'un même bâtiment). */
function buildGlobalLocalIds(mapsDir) {
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

function main() {
  const common = loadCommon();
  const mapsDir = path.join(ROOT, 'public/decomp/em/maps');
  const globalLocalIds = buildGlobalLocalIds(mapsDir);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== '_all.json' && f !== '_common.json');
  const errors = new Map();   // message -> count
  const exampleOf = new Map();
  let totalScripts = 0, totalBytes = 0, totalSymbols = 0, totalMapRefs = 0, okScripts = 0;

  for (const f of files) {
    let j; try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { continue; }

    // namespaces (map + common) pour classify
    const scriptLabels = new Set(), movementLabels = new Set(), textLabels = new Set();
    for (const src of [common, j]) {
      for (const [label, lines] of Object.entries(src.scripts || {})) {
        if (isMovement(lines)) movementLabels.add(label); else scriptLabels.add(label);
      }
      for (const label of Object.keys(src.texts || {})) textLabels.add(label);
    }
    const classify = (label) => {
      if (textLabels.has(label)) return 'text';
      if (movementLabels.has(label)) return 'movement';
      if (martLabels.has(label)) return 'mart';
      if (scriptLabels.has(label)) return 'script';
      return null; // inconnu (cross-map / natif géré via hint opcode)
    };

    // LOCALID_* : table globale (fallback cross-map) + per-map (précédence à la map courante).
    const localIds = Object.assign(Object.create(null), globalLocalIds);
    try {
      const mapJson = JSON.parse(fs.readFileSync(path.join(mapsDir, f), 'utf8'));
      (mapJson.object_events || []).forEach((o, i) => { if (o.local_id) localIds[o.local_id] = i + 1; });
    } catch { /* pas de map JSON (ex. _common déjà exclu) */ }

    const isScript = (label) => scriptLabels.has(label);
    const env = A.makeEnv(classify, isScript, localIds);
    for (const [label, lines] of Object.entries(j.scripts || {})) {
      if (isMovement(lines)) continue;
      totalScripts++;
      try {
        const realOps = [];
        for (const line of lines) {
          const s = String(line).trim();
          if (!s || s.startsWith('#') || s.startsWith('map_script')) continue;
          for (const op of E.expandLine(s)) {
            if (op.unknown) { if (!movActions.has(op.name) && !movEnd.has(op.name)) throw new Error(`opcode non résolu: ${op.name}`); continue; }
            realOps.push(op);
          }
        }
        const { bytes } = A.assembleScript(realOps, env);
        totalBytes += bytes.length;
        okScripts++;
      } catch (e) {
        const key = String(e.message).replace(/'[^']*'/g, "'…'");
        errors.set(key, (errors.get(key) || 0) + 1);
        if (!exampleOf.has(key)) exampleOf.set(key, `${f} :: ${label} — ${e.message}`);
      }
    }
    totalSymbols += env.symbols.list.length;
    totalMapRefs += env.mapSymbols.list.length;
  }

  console.log(`=== validate-script-assembly ===`);
  console.log(`scripts overworld : ${totalScripts}  (assemblés OK: ${okScripts})`);
  console.log(`octets bytecode   : ${totalBytes}`);
  console.log(`symboles (cumul)  : ${totalSymbols}   map-refs (cumul) : ${totalMapRefs}`);
  const errs = [...errors.entries()].sort((a, b) => b[1] - a[1]);
  const tail = errs.filter(([k]) => isTail(exampleOf.get(k)));
  const regressions = errs.filter(([k]) => !isTail(exampleOf.get(k)));
  if (tail.length) {
    console.log(`\n📋 Tail connu/documenté (${tail.length} types) — non bloquant :`);
    for (const [k, n] of tail) console.log(`   x${n}  ${exampleOf.get(k)}`);
  }
  if (regressions.length === 0) {
    console.log(`\n✅ Aucune régression d'assemblage — corpus sérialisé hors tail documenté.`);
    process.exitCode = 0;
  } else {
    console.log(`\n❌ RÉGRESSIONS d'assemblage (${regressions.length} types) :`);
    for (const [k, n] of regressions) console.log(`   x${n}  ${k}\n        ex: ${exampleOf.get(k)}`);
    process.exitCode = 1;
  }
}

main();
