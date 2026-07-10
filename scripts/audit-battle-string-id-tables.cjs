#!/usr/bin/env node
/**
 * audit-battle-string-id-tables.cjs — ORACLE des tables d'IDs de messages de combat.
 *
 * Le combat choisit ses messages via `printfromtable gXStringIds` indexé par
 * gBattleCommunication[MULTISTRING_CHOOSER] (= un B_MSG_*). Le port hand-code ces tables dans
 * `battle-string-id-tables.ts` (`gXStringIds: new Uint16Array([...])`). Une VALEUR STRINGID fausse
 * = mauvais message affiché (même classe que les bugs B_MSG côté INDEX déjà corrigés, mais ici
 * côté VALEUR de la table). Cet oracle confronte chaque table au décomp `battle_message.c`
 * (`const u16 gXStringIds[] = { [B_MSG_X] = STRINGID_Y, ... }`), en résolvant les B_MSG_ et
 * STRINGID_ via les #define (battle_string_ids.h), index par index.
 *
 *   node scripts/audit-battle-string-id-tables.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const C_MSG = path.join(DECOMP, 'src/battle_message.c');
const TS_TBL = path.join(ROOT, 'src/battle_message.ts');  // BATTLE_STRING_ID_TABLES au foyer (consolidation famille battle_message)

// ── résolveur #define (B_MSG_*, STRINGID_*) ──────────────────────────────────
function evalExpr(expr, scope) {
  let s = expr.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  s = s.replace(/\((?:u8|s8|u16|s16|u32|s32)\)/g, '');
  s = s.replace(/0[xX][0-9a-fA-F]+/g, (h) => String(parseInt(h, 16)));
  s = s.replace(/[A-Za-z_]\w*/g, (id) => { if (id in scope) return '(' + scope[id] + ')'; throw new Error('ref'); });
  if (!/^[-0-9<>|&~()+*\/\s]+$/.test(s)) throw new Error('unsafe');
  return Function('"use strict";return (' + s + ')')() | 0;
}
const decomp = {};
(function defs(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) defs(p);
    else if (e.name.endsWith('.h')) {
      const t = fs.readFileSync(p, 'utf8'); const pend = [];
      // [ \t]+ (PAS \s+) entre nom et valeur : \s traverse les newlines → la garde
      // `#define GUARD_X_H` (sans valeur) avalait le 1er vrai define du fichier
      // (bug historique : WEATHER_NONE jamais chargé, gWeatherStartsStringIds « non résolue »).
      for (const m of t.matchAll(/^#define[ \t]+([A-Z_][A-Z0-9_]*)[ \t]+(.+?)\s*$/gm)) pend.push([m[1], m[2]]);
      let c = 1, ps = 0;
      while (c && ps++ < 6) { c = 0; for (const [n, ex] of pend) { if (n in decomp) continue; try { decomp[n] = evalExpr(ex, decomp); c = 1; } catch {} } }
    }
  }
})(path.join(DECOMP, 'include'));
// enums C (auto-incrément, résoudre-ou-ignorer) — pour les index BALL_*, B_MSG_* d'enum, etc.
function collectEnumsFromText(txt, map) {
  let any = false;
  for (const e of txt.matchAll(/enum\s+(?:[A-Za-z_]\w*\s+)?\{([^}]*)\}/g)) {
    const body = e[1].replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    let cur = 0;
    for (const raw of body.split(',')) {
      const member = raw.trim(); if (!member) continue;
      const eq = member.indexOf('='); const name = (eq < 0 ? member : member.slice(0, eq)).trim();
      if (!/^[A-Z_][A-Z0-9_]*$/.test(name)) break;
      let val; if (eq < 0) val = cur; else { try { val = evalExpr(member.slice(eq + 1), map); } catch { break; } }
      if (!(name in map)) { map[name] = val; any = true; } cur = val + 1;
    }
  }
  return any;
}
(function enums(dir) {
  const texts = [];
  (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith('.h') || e.name.endsWith('.c')) texts.push(fs.readFileSync(p, 'utf8')); } })(dir);
  let c = 1, ps = 0; while (c && ps++ < 4) { c = 0; for (const t of texts) if (collectEnumsFromText(t, decomp)) c = 1; }
})(path.join(DECOMP, 'include'));

// ── tables port ──────────────────────────────────────────────────────────────
const tsSrc = fs.readFileSync(TS_TBL, 'utf8');
const portTables = {};
for (const m of tsSrc.matchAll(/(\w+StringIds)\s*:\s*new Uint16Array\(\[([^\]]*)\]\)/g)) {
  portTables[m[1]] = [...m[2].matchAll(/\d+/g)].map((x) => Number(x[0]));
}

// ── tables décomp ─────────────────────────────────────────────────────────────
const cSrc = fs.readFileSync(C_MSG, 'utf8');
const decompTables = {};
const unresolved = [];
for (const m of cSrc.matchAll(/const u16 (\w+StringIds)\[[^\]]*\]\s*=\s*\{([^}]*)\}/g)) {
  const name = m[1];
  const body = m[2].replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const arr = []; let seq = 0; let bad = false;
  for (const raw of body.split(',')) {
    const entry = raw.trim();
    if (!entry) continue;
    const des = entry.match(/^\[\s*([A-Z0-9_]+)\s*\]\s*=\s*([A-Z0-9_]+)\s*$/);
    if (des) {
      if (!(des[1] in decomp) || !(des[2] in decomp)) { bad = true; unresolved.push(`${name}: ${des[1]} ou ${des[2]}`); break; }
      arr[decomp[des[1]]] = decomp[des[2]]; seq = decomp[des[1]] + 1;
    } else if (/^[A-Z0-9_]+$/.test(entry)) {
      if (!(entry in decomp)) { bad = true; unresolved.push(`${name}: ${entry}`); break; }
      arr[seq++] = decomp[entry];
    } else { bad = true; unresolved.push(`${name}: forme « ${entry} »`); break; }
  }
  if (!bad) decompTables[name] = arr;
}

// ── confrontation ──────────────────────────────────────────────────────────────
const findings = [];
let checkedTables = 0, checkedVals = 0;
for (const name of Object.keys(portTables)) {
  const port = portTables[name];
  const dec = decompTables[name];
  if (!dec) { findings.push(`${name} : absente/non résolue côté décomp`); continue; }
  checkedTables++;
  const n = Math.max(port.length, dec.length);
  for (let i = 0; i < n; i++) {
    checkedVals++;
    if (port[i] !== dec[i]) findings.push(`${name}[${i}] : port=${port[i]} décomp=${dec[i]}`);
  }
}

console.log(`Tables d'IDs de messages de combat confrontées : ${checkedTables} (${checkedVals} valeurs) vs décomp battle_message.c.`);
if (unresolved.length) console.log(`  (note : ${unresolved.length} table(s) décomp non résolue(s) — détail : ${[...new Set(unresolved)].join(' · ')})`);
if (findings.length === 0) { console.log('✅ Tables d\'IDs de messages FIDÈLES au décomp (valeurs STRINGID 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 60)) console.log('  ' + f);
process.exit(1);
