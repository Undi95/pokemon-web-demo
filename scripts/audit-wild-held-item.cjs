#!/usr/bin/env node
/**
 * audit-wild-held-item.cjs — ORACLE des chances d'OBJET TENU des Pokémon sauvages.
 *
 * Confronte les constantes de `SetWildMonHeldItem` (party-storage.ts) au décomp
 * (pokemon.c SetWildMonHeldItem) : chanceNoItem=45 / chanceNotRare=95 (normal), 20 / 80 avec
 * Œil Composé (ABILITY_COMPOUND_EYES). Ces seuils décident, pour CHAQUE sauvage, s'il tient un
 * objet (commun/rare/aucun). Un seuil faux = taux d'objets tenus faux sur tout le jeu.
 *
 * Vérifie aussi que l'id ABILITY_COMPOUND_EYES (14 chez nous, sous commentaire) == abilities.h.
 * NB : la branche Altering Cave de la décomp est une Dette R3 documentée (inerte en vanilla) —
 * hors périmètre de cet oracle (cf. commentaire dans party-storage.ts).
 *
 *   node scripts/audit-wild-held-item.cjs   ·   exit 0 fidèle / exit 1 écarts
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DECOMP_C = 'D:/Projet 1/decomps/pokeemeraude/src/pokemon.c';
const DECOMP_ABILITIES_H = 'D:/Projet 1/decomps/pokeemeraude/include/constants/abilities.h';
const OURS = path.join(ROOT, 'src/engine/battle/party-storage.ts');

/** Corps de la fonction SetWildMonHeldItem. */
function fnBody(src, marker) {
  const a = src.indexOf(marker);   // ancre sur la DÉFINITION (après tout JSDoc « chanceNoItem = 45 »)
  return src.slice(a, a + 2500).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}
/** Les valeurs assignées à chanceNoItem / chanceNotRare, dans l'ordre. */
function chances(body) {
  const noItem = [...body.matchAll(/chanceNoItem\s*=\s*(\d+)/g)].map((m) => Number(m[1]));
  const notRare = [...body.matchAll(/chanceNotRare\s*=\s*(\d+)/g)].map((m) => Number(m[1]));
  return { noItem, notRare };
}

const cBody = fnBody(fs.readFileSync(DECOMP_C, 'utf8'), 'void SetWildMonHeldItem(void)');
const tBody = fnBody(fs.readFileSync(OURS, 'utf8'), 'export function SetWildMonHeldItem');
const c = chances(cBody), t = chances(tBody);

// ABILITY_COMPOUND_EYES (abilities.h) vs notre 14 inline
const abiM = fs.readFileSync(DECOMP_ABILITIES_H, 'utf8').match(/#define\s+ABILITY_COMPOUND_EYES\s+(\d+)/);
const compoundEyesDecomp = abiM ? Number(abiM[1]) : undefined;
const compoundEyesOursM = tBody.match(/GetMonAbility\(gPlayerParty\[0\]\)\s*===\s*(\d+)/);
const compoundEyesOurs = compoundEyesOursM ? Number(compoundEyesOursM[1]) : undefined;

const findings = [];
const cmpSeq = (label, ca, ta) => {
  if (ca.join(',') !== ta.join(',')) findings.push(`${label} : décomp=[${ca}] ours=[${ta}]`);
};
cmpSeq('chanceNoItem (normal,compoundEyes)', c.noItem, t.noItem);
cmpSeq('chanceNotRare (normal,compoundEyes)', c.notRare, t.notRare);
if (c.noItem.join(',') !== '45,20') findings.push(`décomp chanceNoItem inattendu : [${c.noItem}] (attendu 45,20)`);
if (c.notRare.join(',') !== '95,80') findings.push(`décomp chanceNotRare inattendu : [${c.notRare}] (attendu 95,80)`);
if (compoundEyesDecomp !== compoundEyesOurs) findings.push(`ABILITY_COMPOUND_EYES : abilities.h=${compoundEyesDecomp} ours=${compoundEyesOurs}`);

console.log(`Objet tenu sauvage : seuils ours noItem=[${t.noItem}] notRare=[${t.notRare}] · CompoundEyes=${compoundEyesOurs}`);
if (findings.length === 0) { console.log('✅ SetWildMonHeldItem : seuils 45/95/20/80 + ABILITY_COMPOUND_EYES FIDÈLES au décomp.'); process.exit(0); }
console.log(`❌ ${findings.length} écart(s) :\n`);
for (const f of findings.slice(0, 40)) console.log('  ' + f);
process.exit(1);
