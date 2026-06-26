#!/usr/bin/env node
/**
 * audit-multichoice-lists.cjs — ORACLE des listes de menus à choix (commande script `multichoice`).
 *
 * `MultichoiceList_X[]` (src/data/script_menu.h) = options affichées par l'opcode `multichoice`
 * (questions NPC, panneaux, base secrète…). Chaque entrée = `{gText_Y}`. L'ORDRE des options
 * compte (curseur). Confronte `public/decomp/em/multichoice-lists.json` (champ `lists`) au décomp,
 * liste par liste, gText par gText et dans l'ordre.
 *
 *   node scripts/audit-multichoice-lists.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude';
const decompFile = path.join(DECOMP, 'src/data/script_menu.h');
const jsonFile = path.join(ROOT, 'public/decomp/em/multichoice-lists.json');

const txt = fs.readFileSync(decompFile, 'utf8');
const decomp = {};
// chaque `MultichoiceList_X[] = { ...\n};` ; on extrait le 1er gText_ de chaque entrée `{...}`.
for (const m of txt.matchAll(/MultichoiceList_(\w+)\[\]\s*=\s*\{([\s\S]*?)\n\};/g)) {
  const name = 'MultichoiceList_' + m[1];
  // le champ `text` est toujours le 1er de chaque entrée `{...}` (struct MenuAction.text) ;
  // les symboles de texte ne commencent PAS tous par gText_ (gMenuText_, gTrickHouse_, …).
  const texts = [...m[2].matchAll(/\{\s*([A-Za-z_]\w*)/g)].map((x) => x[1]);
  decomp[name] = texts;
}

const json = JSON.parse(fs.readFileSync(jsonFile, 'utf8')).lists || {};
const findings = [];
let checked = 0;
const eqArr = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
for (const name of Object.keys(decomp)) {
  checked++;
  if (!(name in json)) { findings.push(`${name} : absent du JSON (décomp ${decomp[name].length} options)`); continue; }
  if (!eqArr(decomp[name], json[name])) {
    findings.push(`${name} : JSON=[${json[name].join(',')}] · décomp=[${decomp[name].join(',')}]`);
  }
}
for (const name of Object.keys(json)) {
  if (!(name in decomp)) findings.push(`${name} : dans le JSON mais ABSENT du décomp`);
}

console.log(`Listes multichoice confrontées : ${checked} (décomp ${Object.keys(decomp).length} · JSON ${Object.keys(json).length}).`);
if (findings.length === 0) { console.log('✅ MultichoiceList_* FIDÈLES au décomp (options + ordre 1:1).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
