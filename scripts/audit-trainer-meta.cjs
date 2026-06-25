#!/usr/bin/env node
/**
 * audit-trainer-meta.cjs — ORACLE de fidélité des MÉTADONNÉES de dresseurs.
 *
 * Complète audit-trainer-parties (qui vérifie les équipes) : vérifie les champs
 * GAMEPLAY du dresseur dans `trainer-parties.json` vs le décomp `trainers.h` :
 *   trainerClass · trainerPic · trainerName · doubleBattle · aiFlags · items tenus.
 * (encounterMusic_gender EXCLU : champ packé BGM, gender+musique, hors scope — on ne
 * touche pas au son ; notre JSON ne garde que le gender.) Tout écart = combat de
 * dresseur faux (mauvaise IA, mono/double, objets utilisés).
 *
 *   node scripts/audit-trainer-meta.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TRAINERS_H = 'D:/Projet 1/decomps/pokeemeraude/src/data/trainers.h';
const JSON_F = path.join(ROOT, 'public/decomp/em/trainer-parties.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const src = fs.readFileSync(TRAINERS_H, 'utf8');

const normSet = (s) => s == null ? [] : String(s).split('|').map((x) => x.trim()).filter((x) => x && x !== '0').sort();

const findings = [];
let checked = 0;
const heads = [...src.matchAll(/\[(TRAINER_[A-Z0-9_]+)\]\s*=\s*\{/g)];
for (let i = 0; i < heads.length; i++) {
  const tr = heads[i][1];
  const block = src.slice(heads[i].index, i + 1 < heads.length ? heads[i + 1].index : src.length);
  const f = (re) => { const x = block.match(re); return x ? x[1].trim() : undefined; };
  const o = ours[tr];
  if (!o) { if (tr !== 'TRAINER_NONE') findings.push(`${tr} : ABSENT de trainer-parties.json`); continue; }
  checked++;

  const tClass = f(/\.trainerClass\s*=\s*(TRAINER_CLASS_[A-Z0-9_]+)/);
  if (tClass && tClass !== o.trainerClass) findings.push(`${tr}.trainerClass json=${o.trainerClass} ≠ décomp=${tClass}`);
  const tPic = f(/\.trainerPic\s*=\s*(TRAINER_PIC_[A-Z0-9_]+)/);
  if (tPic && tPic !== o.trainerPic) findings.push(`${tr}.trainerPic json=${o.trainerPic} ≠ décomp=${tPic}`);
  const tName = f(/\.trainerName\s*=\s*_\("([^"]*)"\)/);
  if (tName !== undefined && tName !== o.name) findings.push(`${tr}.name json=${JSON.stringify(o.name)} ≠ décomp=${JSON.stringify(tName)}`);
  const dbl = f(/\.doubleBattle\s*=\s*(TRUE|FALSE)/);
  if (dbl !== undefined && (dbl === 'TRUE') !== (o.doubleBattle === true)) findings.push(`${tr}.doubleBattle json=${o.doubleBattle} ≠ décomp=${dbl}`);

  const aiD = normSet(f(/\.aiFlags\s*=\s*([^,\n]+)/)), aiO = [...(o.aiFlags || [])].sort();
  if (aiD.join('|') !== aiO.join('|')) findings.push(`${tr}.aiFlags json=[${aiO}] ≠ décomp=[${aiD}]`);

  const itD = (f(/\.items\s*=\s*\{([^}]*)\}/) || '').split(',').map((x) => x.trim()).filter((x) => x && x !== 'ITEM_NONE');
  const itO = (o.items || []).filter((x) => x !== 'ITEM_NONE');
  if (itD.join(',') !== itO.join(',')) findings.push(`${tr}.items json=[${itO}] ≠ décomp=[${itD}]`);
}

console.log(`Dresseurs décomp : ${heads.length} · comparés : ${checked}`);
if (findings.length === 0) { console.log('✅ trainer-parties.json métadonnées FIDÈLES au décomp (classe/pic/nom/double/IA/objets).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) de métadonnée dresseur :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
