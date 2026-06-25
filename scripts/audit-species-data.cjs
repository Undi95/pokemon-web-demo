#!/usr/bin/env node
/**
 * audit-species-data.cjs — ORACLE de fidélité DATA des espèces (base stats).
 *
 * Confronte `public/decomp/em/species-info.json` (source des stats de base en jeu :
 * PV/Att/Déf/Vit/AttSpé/DéfSpé, types, talents, taux de capture, exp, EV, bonheur,
 * groupes d'œuf, growthRate, couleur…) au décomp `src/data/pokemon/species_info.h`
 * (gSpeciesInfo[] 1:1). Tout écart de VALEUR = bug en jeu (dégâts/PV faux, mauvais
 * type, évolution bonheur cassée, Retour/Frustration faux…). Déterministe.
 *
 *   node scripts/audit-species-data.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SP_H = 'D:/Projet 1/decomps/pokeemeraude/src/data/pokemon/species_info.h';
const SP_JSON = path.join(ROOT, 'public/decomp/em/species-info.json');

const ours = JSON.parse(fs.readFileSync(SP_JSON, 'utf8'));
const src = fs.readFileSync(SP_H, 'utf8');

// Macros résolues 1:1 (include/constants/pokemon.h)
const STANDARD_FRIENDSHIP = 70;
const resolveFriendship = (v) => v === 'STANDARD_FRIENDSHIP' ? STANDARD_FRIENDSHIP : Number(v);
const resolveBool = (v) => v === 'TRUE' ? true : v === 'FALSE' ? false : v;

// Parse par scan d'accolades APPARIÉES (depth-scan) : `[SPECIES_NONE] = {0},`
// sur une ligne ferait avaler le bloc suivant à une regex gloutonne (Bulbasaur
// droppée). On extrait le corps `{...}` exact de chaque entrée.
const decomp = {};
const notModeled = [];
const headRe = /\[(SPECIES_[A-Z0-9_]+)\]\s*=\s*\{/g;
let m;
while ((m = headRe.exec(src)) !== null) {
  const key = m[1];
  let depth = 1, i = headRe.lastIndex;
  for (; i < src.length && depth > 0; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') depth--;
  }
  const body = src.slice(headRe.lastIndex, i - 1);
  headRe.lastIndex = i;
  if (key === 'SPECIES_NONE') continue;        // sentinelle {0}, pas une vraie espèce
  if (!ours[key]) { notModeled.push(key); continue; } // formes Unown/old non modélisées
  const f = (re) => { const x = body.match(re); return x ? x[1].trim() : undefined; };
  // tableaux { A, B } → [A, B]
  const arr = (re) => { const x = body.match(re); return x ? x[1].split(',').map(s => s.trim()).filter(Boolean) : undefined; };
  decomp[key] = {
    hp: f(/\.baseHP\s*=\s*(\d+)/), atk: f(/\.baseAttack\s*=\s*(\d+)/), def: f(/\.baseDefense\s*=\s*(\d+)/),
    spe: f(/\.baseSpeed\s*=\s*(\d+)/), spa: f(/\.baseSpAttack\s*=\s*(\d+)/), spd: f(/\.baseSpDefense\s*=\s*(\d+)/),
    types: arr(/\.types\s*=\s*\{([^}]*)\}/),
    abilities: arr(/\.abilities\s*=\s*\{([^}]*)\}/),
    eggGroups: arr(/\.eggGroups\s*=\s*\{([^}]*)\}/),
    catchRate: f(/\.catchRate\s*=\s*(\d+)/),
    expYield: f(/\.expYield\s*=\s*(\d+)/),
    evhp: f(/\.evYield_HP\s*=\s*(\d+)/), evatk: f(/\.evYield_Attack\s*=\s*(\d+)/), evdef: f(/\.evYield_Defense\s*=\s*(\d+)/),
    evspe: f(/\.evYield_Speed\s*=\s*(\d+)/), evspa: f(/\.evYield_SpAttack\s*=\s*(\d+)/), evspd: f(/\.evYield_SpDefense\s*=\s*(\d+)/),
    itemCommon: f(/\.itemCommon\s*=\s*([A-Z0-9_]+)/), itemRare: f(/\.itemRare\s*=\s*([A-Z0-9_]+)/),
    genderRatio: f(/\.genderRatio\s*=\s*([^,\n]+)/),
    eggCycles: f(/\.eggCycles\s*=\s*(\d+)/),
    friendship: f(/\.friendship\s*=\s*([A-Za-z0-9_]+)/),
    growthRate: f(/\.growthRate\s*=\s*([A-Z0-9_]+)/),
    safariFlee: f(/\.safariZoneFleeRate\s*=\s*(\d+)/),
    bodyColor: f(/\.bodyColor\s*=\s*([A-Z0-9_]+)/),
    noFlip: f(/\.noFlip\s*=\s*([A-Z]+)/),
  };
}

const findings = [];
let checked = 0;
const eq = (key, label, dv, ov) => {
  if (dv === undefined) return;                          // champ non exprimé au décomp
  if (ov === undefined) { findings.push(`${key}.${label} : json MANQUE (décomp=${JSON.stringify(dv)})`); return; }
  if (String(dv) !== String(ov)) findings.push(`${key}.${label} : json=${JSON.stringify(ov)} ≠ décomp=${JSON.stringify(dv)}`);
};

for (const key of Object.keys(decomp)) {
  const o = ours[key];
  const d = decomp[key];
  if (!o) { findings.push(`${key} : ABSENT de species-info.json (présent au décomp)`); continue; }
  checked++;
  const st = o.stats || {}, ev = o.evYield || {};
  eq(key, 'stats.hp', d.hp, st.hp); eq(key, 'stats.atk', d.atk, st.atk); eq(key, 'stats.def', d.def, st.def);
  eq(key, 'stats.spe', d.spe, st.spe); eq(key, 'stats.spa', d.spa, st.spa); eq(key, 'stats.spd', d.spd, st.spd);
  if (d.types) { eq(key, 'types[0]', d.types[0], (o.types||[])[0]); eq(key, 'types[1]', d.types[1] ?? d.types[0], (o.types||[])[1]); }
  if (d.abilities) { eq(key, 'abilities[0]', d.abilities[0], (o.abilities||[])[0]); eq(key, 'abilities[1]', d.abilities[1] ?? 'ABILITY_NONE', (o.abilities||[])[1]); }
  if (d.eggGroups) { eq(key, 'eggGroups[0]', d.eggGroups[0], (o.eggGroups||[])[0]); eq(key, 'eggGroups[1]', d.eggGroups[1] ?? d.eggGroups[0], (o.eggGroups||[])[1]); }
  eq(key, 'catchRate', d.catchRate, o.catchRate);
  eq(key, 'expYield', d.expYield, o.expYield);
  eq(key, 'evYield.hp', d.evhp, ev.hp); eq(key, 'evYield.atk', d.evatk, ev.atk); eq(key, 'evYield.def', d.evdef, ev.def);
  eq(key, 'evYield.spe', d.evspe, ev.spe); eq(key, 'evYield.spa', d.evspa, ev.spa); eq(key, 'evYield.spd', d.evspd, ev.spd);
  eq(key, 'itemCommon', d.itemCommon, o.itemCommon);
  eq(key, 'itemRare', d.itemRare, o.itemRare);
  eq(key, 'genderRatio', d.genderRatio, o.genderRatio);
  eq(key, 'eggCycles', d.eggCycles, o.eggCycles);
  eq(key, 'friendship', d.friendship !== undefined ? resolveFriendship(d.friendship) : undefined, o.friendship);
  eq(key, 'growthRate', d.growthRate, o.growthRate);
  eq(key, 'safariFlee', d.safariFlee, o.safariFlee);
  eq(key, 'bodyColor', d.bodyColor, o.bodyColor);
  eq(key, 'noFlip', d.noFlip !== undefined ? resolveBool(d.noFlip) : undefined, o.noFlip);
}

console.log(`Espèces décomp parsées : ${Object.keys(decomp).length} · comparées à species-info.json : ${checked}` +
  (notModeled.length ? ` · non modélisées (skip) : ${notModeled.length}` : ''));
if (findings.length === 0) { console.log('✅ species-info.json FIDÈLE au décomp species_info.h (base stats/types/talents/EV/bonheur/œuf…).'); process.exit(0); }
// Regroupe par champ pour lisibilité quand un champ dérape en masse
const byField = {};
for (const f of findings) { const fld = f.split(' : ')[0].split('.').slice(1).join('.') || '(absent)'; byField[fld] = (byField[fld]||0)+1; }
console.log(`❌ ${findings.length} écart(s) de DATA espèce (= bugs en jeu). Par champ :`);
for (const [fld, n] of Object.entries(byField).sort((a,b)=>b[1]-a[1])) console.log(`   ${String(n).padStart(4)}  ${fld}`);
console.log('\nExemples (30 premiers) :');
for (const f of findings.slice(0, 30)) console.log('  ' + f);
process.exit(1);
