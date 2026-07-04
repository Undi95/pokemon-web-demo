#!/usr/bin/env node
/**
 * audit-anim-callbacks.cjs — ORACLE ANIMS COMBAT (2026-07-04).
 *
 * Croise BATTLE_ANIM_TEMPLATES (auto-extrait : chaque template d'anim avec son
 * callback C) × les callbacks effectivement ENREGISTRÉS côté TS
 * (registerAnimCallbacks/registerAnimTemplates/registerAnimTasks) : un template
 * dont le callback n'est enregistré nulle part = sprite créé SANS callback =
 * anim à vide/figée (bug AnimBurnFlame : flammes de brûlure invisibles).
 * Trié par nombre d'usages dans battle_anim_scripts.s (impact réel).
 *
 * Usage : node scripts/audit-anim-callbacks.cjs [--min N]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const DECOMP = path.resolve(ROOT, '..', 'decomps', 'pokeemeraude');

const minArg = (() => { const i = process.argv.indexOf('--min'); return i >= 0 ? Number(process.argv[i + 1]) : 1; })();

// 1. Tous les templates → callback (source auto 1:1).
const tpl = fs.readFileSync(path.join(ROOT, 'src/engine/decomp-data/auto/src/battle-anim-sprites.ts'), 'utf8');
const templates = {}; // name -> callback
for (const m of tpl.matchAll(/"(g\w+SpriteTemplate)":\{[^}]*"callback":"(\w+)"/g)) templates[m[1]] = m[2];

// 2. Callbacks enregistrés côté TS (toutes formes de register + clé objet).
let registered = new Set();
function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!p.includes('decomp-data')) yield* walk(p); }
    else if (e.name.endsWith('.ts')) yield p;
  }
}
for (const f of walk(path.join(ROOT, 'src'))) {
  const t = fs.readFileSync(f, 'utf8');
  // Heuristique large : toute clé objet `AnimX:`/`SoundTask_X:`/`SpriteCB_X:` = un
  // enregistrement (les register* passent tous par un objet littéral ; les alias
  // d'import et les `})` internes cassaient le match strict).
  for (const k of t.matchAll(/\b(Anim\w+|SoundTask_\w+|SpriteCB_\w+|Do\w+|Slide\w+|Translate\w+|Init\w+|Move\w+)\s*:/g)) registered.add(k[1]);
  for (const m of t.matchAll(/callback:\s*['"]?(\w+)/g)) registered.add(m[1]);
}

// 3. Usages des templates dans les scripts d'anim (impact).
const scripts = fs.readFileSync(path.join(DECOMP, 'data/battle_anim_scripts.s'), 'utf8');
const rows = [];
for (const [tplName, cb] of Object.entries(templates)) {
  if (registered.has(cb)) continue;
  const uses = (scripts.match(new RegExp(`\\b${tplName}\\b`, 'g')) || []).length;
  if (uses >= minArg) rows.push({ tplName, cb, uses });
}
rows.sort((a, b) => b.uses - a.uses);
const byCb = new Map();
for (const r of rows) {
  if (!byCb.has(r.cb)) byCb.set(r.cb, { cb: r.cb, uses: 0, tpls: [] });
  const e = byCb.get(r.cb); e.uses += r.uses; e.tpls.push(r.tplName);
}
const agg = [...byCb.values()].sort((a, b) => b.uses - a.uses);
for (const e of agg) console.log(String(e.uses).padStart(4), e.cb, ' ←', e.tpls.slice(0, 3).join(','), e.tpls.length > 3 ? `(+${e.tpls.length - 3})` : '');
console.log(`\nTOTAL callbacks manquants: ${agg.length} (${rows.length} templates, usages ≥${minArg})`);
