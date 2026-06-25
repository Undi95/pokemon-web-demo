#!/usr/bin/env node
/**
 * audit-trainer-parties.cjs — ORACLE de fidélité des ÉQUIPES de dresseurs.
 *
 * Confronte `public/decomp/em/trainer-parties.json` (= équipes lues par
 * battle-trainer-party.ts CreateNPCTrainerParty : espèce/niveau/IV/objet/moves de
 * chaque mon de chaque dresseur) au décomp :
 *   - src/data/trainer_parties.h  (sParty_<Nom>[] = { {.iv,.lvl,.species,[.heldItem],[.moves]}, … })
 *   - src/data/trainers.h         ([TRAINER_X] = { … .party = <MACRO>(sParty_<Nom>) … })
 * Tout écart = combat de dresseur faux (mauvais mon/niveau/moveset/objet).
 *
 *   node scripts/audit-trainer-parties.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP = 'D:/Projet 1/decomps/pokeemeraude/src/data';
const PARTIES_H = path.join(DECOMP, 'trainer_parties.h');
const TRAINERS_H = path.join(DECOMP, 'trainers.h');
const JSON_F = path.join(ROOT, 'public/decomp/em/trainer-parties.json');

const ours = JSON.parse(fs.readFileSync(JSON_F, 'utf8'));
const partiesSrc = fs.readFileSync(PARTIES_H, 'utf8');
const trainersSrc = fs.readFileSync(TRAINERS_H, 'utf8');

// 1) sParty_<Nom> → membres [{iv, lvl, species, heldItem?, moves?}]
const sParties = {};
for (const m of partiesSrc.matchAll(/static const struct TrainerMon\w+ (sParty_\w+)\[\]\s*=\s*\{([\s\S]*?)\n\};/g)) {
  const name = m[1], body = m[2];
  const ivs = [...body.matchAll(/\.iv\s*=\s*(\d+)/g)];
  const members = [];
  for (let i = 0; i < ivs.length; i++) {
    const chunk = body.slice(ivs[i].index, i + 1 < ivs.length ? ivs[i + 1].index : body.length);
    const f = (re) => { const x = chunk.match(re); return x ? x[1] : undefined; };
    const movesM = chunk.match(/\.moves\s*=\s*\{([^}]*)\}/);
    members.push({
      iv: Number(ivs[i][1]),
      lvl: Number(f(/\.lvl\s*=\s*(\d+)/)),
      species: f(/\.species\s*=\s*(SPECIES_\w+)/),
      heldItem: f(/\.heldItem\s*=\s*(ITEM_\w+)/),
      moves: movesM ? movesM[1].split(',').map((s) => s.trim()).filter(Boolean) : [],
    });
  }
  sParties[name] = members;
}

// 2) TRAINER_X → { partyType (macro), partyName (sParty_<Nom>) }
const trainerParty = {};
const heads = [...trainersSrc.matchAll(/\[(TRAINER_[A-Z0-9_]+)\]\s*=\s*\{/g)];
for (let i = 0; i < heads.length; i++) {
  const sp = heads[i][1];
  const block = trainersSrc.slice(heads[i].index, i + 1 < heads.length ? heads[i + 1].index : trainersSrc.length);
  const pm = block.match(/\.party\s*=\s*([A-Z_]+)\((sParty_\w+)\)/);
  if (pm) trainerParty[sp] = { partyType: pm[1], partyName: pm[2] };
  else trainerParty[sp] = { partyType: null, partyName: null }; // NULL party (ex TRAINER_NONE)
}

const findings = [];
let checked = 0, monsChecked = 0;
for (const sp of Object.keys(trainerParty)) {
  const tp = trainerParty[sp];
  if (!tp.partyName) continue;                         // dresseur sans équipe (NULL)
  const o = ours[sp];
  if (!o) { findings.push(`${sp} : ABSENT de trainer-parties.json`); continue; }
  checked++;
  if (o.partyType !== tp.partyType) findings.push(`${sp} : partyType json=${o.partyType} ≠ décomp=${tp.partyType}`);
  const dParty = sParties[tp.partyName] || [];
  const oParty = o.party || [];
  if (oParty.length !== dParty.length) { findings.push(`${sp} : nb mons json=${oParty.length} ≠ décomp=${dParty.length} (${tp.partyName})`); continue; }
  const hasItem = /ITEM_/.test(tp.partyType), hasMoves = /CUSTOM/.test(tp.partyType);
  for (let j = 0; j < dParty.length; j++) {
    const d = dParty[j], om = oParty[j]; monsChecked++;
    if (Number(om.iv) !== d.iv) findings.push(`${sp}[${j}].iv json=${om.iv} ≠ décomp=${d.iv}`);
    if (Number(om.level) !== d.lvl) findings.push(`${sp}[${j}].level json=${om.level} ≠ décomp=${d.lvl}`);
    if (om.species !== d.species) findings.push(`${sp}[${j}].species json=${om.species} ≠ décomp=${d.species}`);
    if (hasItem && om.heldItem !== d.heldItem) findings.push(`${sp}[${j}].heldItem json=${om.heldItem} ≠ décomp=${d.heldItem}`);
    if (hasMoves) {
      const dm = (d.moves || []).join(','), omv = (om.moves || []).join(',');
      if (dm !== omv) findings.push(`${sp}[${j}].moves json=[${omv}] ≠ décomp=[${dm}]`);
    }
  }
}

console.log(`Dresseurs avec équipe : ${Object.values(trainerParty).filter((t) => t.partyName).length} · comparés : ${checked} · mons vérifiés : ${monsChecked}`);
if (findings.length === 0) { console.log('✅ trainer-parties.json FIDÈLE au décomp (espèce/niveau/IV/objet/moves de chaque dresseur).'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) d'équipe de dresseur (= combats faux) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
