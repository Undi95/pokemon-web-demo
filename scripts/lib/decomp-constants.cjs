#!/usr/bin/env node
/**
 * lib/decomp-constants.cjs — résolveur de constantes décomp pour le compilateur
 * byte-VM (build-time CJS). Résout au compile-time tout arg de script
 * (`FLAG_X`, `ITEM_X`, `VAR_RESULT`, `SPECIES_X`, `MSGBOX_DEFAULT`, `DIR_NORTH`,
 * `TRUE`, `TRAINER_BATTLE_SINGLE`, `CONTEST_RANK_MASTER`, …) en valeur numérique.
 *
 * Source primaire = les `.h` de la décomp (`include/constants/*.h` + quelques
 * include/*.h), parsés pour `#define NAME <expr>` puis résolus itérativement
 * (numérique, hex, `<<`, `|`, `+`, `-`, parenthèses, refs vers d'autres consts).
 * Source canon = la décomp elle-même → couverture complète, zéro dépendance aux
 * .ts auto-extraits. Suppléments (si une clé manque) : constantes locales
 * event.inc (`STD_*`, `MSGBOX_*`, `YES/NO`, `NO_MUSIC`) + dumps JSON.
 *
 * API : { resolve(name)->number|undefined, has(name)->bool, count, table }.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';

// raw[name] = expression brute (string) ; on résout en plusieurs passes.
const raw = Object.create(null);
const table = Object.create(null);

function addRaw(name, expr, override = true) {
  if (!override && (raw[name] !== undefined || table[name] !== undefined)) return;
  raw[name] = expr.trim();
}

// ── 1. #define des .h de la décomp ───────────────────────────────────────────
function parseHeaderDefines(file) {
  const txt = fs.readFileSync(file, 'utf8');
  // Ligne par ligne (sinon `\s+` franchit les `\n` : une garde `#define GUARD_X`
  // valueless engloutirait la définition suivante). #define NAME expr ; rejette
  // les macros fonctions `#define NAME(args)`.
  const re = /^\s*#define\s+([A-Za-z_]\w*)[ \t]+(.+?)\s*$/;
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(re);
    if (!m) continue;
    let expr = m[2].replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '').trim();
    if (expr === '') continue;
    addRaw(m[1], expr);
  }
}
function listHeaders(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.h')).map((f) => path.join(dir, f));
}
for (const f of listHeaders(path.join(DECOMP, 'include/constants'))) parseHeaderDefines(f);
// quelques include/*.h portant des constantes utilisées en script
for (const extra of ['include/global.h', 'include/constants/event_objects.h']) {
  const p = path.join(DECOMP, extra);
  if (fs.existsSync(p)) parseHeaderDefines(p);
}

// ── 2. constantes locales event.inc (`NAME = RHS`, `.set NAME, RHS`) ──────────
{
  const txt = fs.readFileSync(path.join(DECOMP, 'asm/macros/event.inc'), 'utf8');
  const re1 = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*([^@]+?)\s*(?:@.*)?$/;
  const re2 = /^\s*\.set\s+([A-Z_][A-Z0-9_]*)\s*,\s*([^@]+?)\s*(?:@.*)?$/;
  for (const line of txt.split(/\r?\n/)) {
    let m;
    if ((m = line.match(re1))) addRaw(m[1], m[2], false);
    else if ((m = line.match(re2))) addRaw(m[1], m[2], false);
  }
}

// ── 3. manuel ────────────────────────────────────────────────────────────────
table['TRUE'] = 1;
table['FALSE'] = 0;

// ── Résolution itérative des expressions brutes ──────────────────────────────
function evalExpr(expr) {
  let s = String(expr).trim();
  if (s === '') return undefined;
  // déballe parenthèses englobant tout
  while (s[0] === '(') {
    let d = 0, j = -1;
    for (let i = 0; i < s.length; i++) { if (s[i] === '(') d++; else if (s[i] === ')') { if (--d === 0) { j = i; break; } } }
    if (j === s.length - 1) s = s.slice(1, j).trim(); else break;
  }
  // token simple
  if (/^-?\d+$/.test(s)) return parseInt(s, 10) | 0;
  if (/^0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  if (table[s] !== undefined) return table[s];
  // opérateurs binaires de bas niveau de précédence d'abord : | puis + - puis << puis ref
  for (const op of ['|', '+', '-', '<<']) {
    const parts = splitTop(s, op);
    if (parts.length > 1) {
      let acc = null;
      for (const p of parts) {
        const v = evalExpr(p);
        if (v === undefined) return undefined;
        if (acc === null) acc = v;
        else if (op === '|') acc |= v;
        else if (op === '+') acc += v;
        else if (op === '-') acc -= v;
        else if (op === '<<') acc <<= v;
      }
      return acc | 0;
    }
  }
  return undefined;
}
/** split au top-level (hors parenthèses) sur un opérateur (string). */
function splitTop(s, op) {
  const parts = []; let d = 0, st = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') d++; else if (c === ')') d--;
    else if (d === 0 && s.startsWith(op, i)) {
      // évite de confondre `<<` avec `<` ; et `-` unaire en tête
      if (op === '-' && (i === st || /[+\-*/<|(]\s*$/.test(s.slice(st, i)))) continue;
      parts.push(s.slice(st, i)); st = i + op.length; i += op.length - 1;
    }
  }
  parts.push(s.slice(st));
  return parts.map((x) => x.trim()).filter((x) => x !== '');
}

// passes jusqu'à point fixe
let changed = true, pass = 0;
while (changed && pass < 12) {
  changed = false; pass++;
  for (const [name, expr] of Object.entries(raw)) {
    if (table[name] !== undefined) continue;
    const v = evalExpr(expr);
    if (typeof v === 'number' && Number.isFinite(v)) { table[name] = v; changed = true; }
  }
}

// ── 4. suppléments JSON (clés manquantes uniquement) ─────────────────────────
function loadJson(rel) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'public/decomp/em', rel), 'utf8')); } catch { return null; }
}
for (const rel of ['constants.json', 'flags-vars.json']) {
  const j = loadJson(rel);
  if (!j) continue;
  for (const ns of Object.values(j)) if (ns && typeof ns === 'object')
    for (const [k, v] of Object.entries(ns)) if (typeof v === 'number' && table[k] === undefined) table[k] = v;
}

function resolve(name) {
  if (name == null) return undefined;
  const s = String(name).trim();
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^0x[0-9a-fA-F]+$/.test(s)) return parseInt(s, 16);
  return table[s];
}
function has(name) { return resolve(name) !== undefined; }

module.exports = { resolve, has, table, get count() { return Object.keys(table).length; } };

if (require.main === module) {
  const probes = ['TRUE', 'FALSE', 'FLAG_TEMP_1', 'ITEM_POTION', 'VAR_RESULT', 'MSGBOX_DEFAULT',
    'MOVE_TACKLE', 'SPECIES_ZIGZAGOON', 'DIR_NORTH', 'TRAINER_BATTLE_SINGLE',
    'TRAINER_BATTLE_CONTINUE_SCRIPT', 'VARS_START', 'VARS_END', 'SPECIAL_VARS_START',
    'STD_OBTAIN_ITEM', 'YES', 'NO', 'NO_MUSIC', 'LOCALID_PLAYER', 'CONTEST_RANK_MASTER',
    'FLAG_BADGE01_GET', 'CONTEST_TYPE_NPC_MASTER', 'B_OUTCOME_WON'];
  console.log(`=== decomp-constants (CJS) : ${module.exports.count} constantes (pass=${pass}) ===`);
  for (const p of probes) console.log(`  ${p} = ${resolve(p)}`);
  const missing = probes.filter((p) => resolve(p) === undefined);
  console.log(missing.length ? `\n⚠️  non résolues : ${missing.join(', ')}` : `\n✅ toutes les sondes résolues.`);
}
