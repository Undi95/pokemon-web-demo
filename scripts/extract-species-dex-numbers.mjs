#!/usr/bin/env node
/**
 * extract-species-dex-numbers.mjs
 * -------------------------------
 * Extrait, par espèce, son numéro Pokédex NATIONAL + HOENN 1:1 décomp.
 *
 * Source : `include/constants/pokedex.h` — 2 `enum { ... }` séquentiels :
 *   National : NATIONAL_DEX_NONE=0, NATIONAL_DEX_BULBASAUR=1, …
 *   Hoenn    : HOENN_DEX_NONE=0, HOENN_DEX_TREECKO=1, … DEOXYS=202
 *              (HOENN_DEX_COUNT), puis non-Hoenn 203+ (exclus du dex).
 *
 * 1:1 décomp `sSpeciesToHoennPokedexNum[SPECIES_X-1] = HOENN_DEX_X` /
 * `sSpeciesToNationalPokedexNum[SPECIES_X-1] = NATIONAL_DEX_X`
 * (pokemon.c:104-105 macros). On reconstruit directement par NOM d'espèce.
 *
 * Sortie : public/decomp/em/species-dex-numbers.json
 *   { "SPECIES_TREECKO": { "national": 252, "hoenn": 1 }, … }
 * + la constante HOENN_DEX_COUNT (= valeur de HOENN_DEX_DEOXYS).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PDX = resolve(__dirname, '../../decomps/pokeemeraude/include/constants/pokedex.h');
const SPECIES_INFO = resolve(__dirname, '../public/decomp/em/species-info.json');
const OUT = resolve(__dirname, '../public/decomp/em/species-dex-numbers.json');

const src = readFileSync(PDX, 'utf8');

/** Parse un enum `{...}` séquentiel : <PREFIX>_<NAME>[ = N], → map NAME→val.
 *  Démarre la 1re `enum {` dont la 1re entrée commence par `prefix`. */
function parseEnum(prefix) {
  const map = {};
  // Trouve le bloc enum contenant `${prefix}_NONE`.
  const reEnum = /enum\s*\{([\s\S]*?)\}\s*;/g;
  let m;
  while ((m = reEnum.exec(src)) !== null) {
    const body = m[1];
    if (!body.includes(`${prefix}_NONE`)) continue;
    let val = 0;
    for (const rawLine of body.split('\n')) {
      const line = rawLine.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (!line) continue;
      const e = line.match(new RegExp(`^${prefix}_(\\w+)\\s*(?:=\\s*(\\w+))?\\s*,?$`));
      if (!e) continue;
      if (e[2] !== undefined) {
        const explicit = parseInt(e[2], 10);
        if (Number.isFinite(explicit)) val = explicit;
        else if (map[e[2].replace(`${prefix}_`, '')] !== undefined) val = map[e[2]]; // alias rare
      }
      map[e[1]] = val;
      val++;
    }
    break;
  }
  return map;
}

const national = parseEnum('NATIONAL_DEX');
const hoenn = parseEnum('HOENN_DEX');
const HOENN_DEX_COUNT = hoenn['DEOXYS']; // = HOENN_DEX_DEOXYS (pokedex.h:846)

const speciesKeys = Object.keys(JSON.parse(readFileSync(SPECIES_INFO, 'utf8')));
const out = { __HOENN_DEX_COUNT: HOENN_DEX_COUNT };
let nMissing = 0;
for (const sk of speciesKeys) {
  if (sk === 'SPECIES_NONE') continue;
  const name = sk.replace(/^SPECIES_/, '');
  const nat = national[name];
  const ho = hoenn[name];
  if (nat === undefined) { nMissing++; continue; }
  out[sk] = { national: nat, hoenn: ho ?? 0xFFFF };
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out));
console.log(`[extract-species-dex-numbers] écrit ${OUT}`);
console.log(`  HOENN_DEX_COUNT=${HOENN_DEX_COUNT} | species mappés=${Object.keys(out).length - 1} | sans national=${nMissing}`);
console.log(`  check TREECKO=${JSON.stringify(out['SPECIES_TREECKO'])} TORCHIC=${JSON.stringify(out['SPECIES_TORCHIC'])} JIRACHI=${JSON.stringify(out['SPECIES_JIRACHI'])}`);
