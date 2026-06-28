#!/usr/bin/env node
/**
 * extract-pokedex-entries-table.mjs
 * ---------------------------------
 * Extrait 1:1 `gPokedexEntries[]` (struct PokedexEntry, src/data/pokemon/
 * pokedex_entries.h) en table **indexée par NUMÉRO National Dex** —
 * structure exacte exigée par `GetPokedexHeightWeight(dexNum, data)`
 * (pokedex.c:4194 : `gPokedexEntries[dexNum].height`).
 *
 * ⚠️ DISTINCT de `extract-pokedex-entries.mjs` (existant, LIVE) : celui-là
 * sort `pokedex-entries.json` keyé `SPECIES_<name>` (+ descriptions FR)
 * pour starter-choose-flow.ts:71. Il RENOMME `NATIONAL_DEX_x → SPECIES_x`
 * (conflation des 2 numérotations — incorrect pour un index `[dexNum]`).
 * → on NE le modifie PAS (consommateur live) ; CE script produit la table
 * natDex-indexée 1:1 séparée (convention décomp-data/auto), buts différents.
 *
 * Source de vérité : src/data/pokemon/pokedex_entries.h + include/
 * constants/pokedex.h (enum NATIONAL_DEX_). 0 hardcode.
 *
 * SCOPE 1:1 ÉTAPE 3 part 2 : champs NUMÉRIQUES (height/weight/pokemonScale
 * /pokemonOffset/trainerScale/trainerOffset) + categoryName (texte FR
 * court `_("...")`). `.description = gXxxPokedexText` (gros texte flavor)
 * = DIFFÉRÉ ÉTAPE 4+ (info screen, A/B) — report HONNÊTE, pas un demi-port
 * (la description FR existe déjà via pokedex-entries.json pour qui en a
 * besoin ; ici on ne réinvente pas).
 *
 * Régénérer : node scripts/extract-pokedex-entries-table.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
// Chemin miroir 1:1 décomp (src/data/pokemon/pokedex_entries.h → .ts).
const outPath = join(projectRoot, 'src', 'data', 'pokemon', 'pokedex_entries.ts');

function die(m) { console.error('[extract-pokedex-entries-table] FATAL:', m); process.exit(1); }

// enum { A, B=5, C, ... } auto-incr par bloc (1:1 sémantique enum C) —
// même parseur que extract-pokedex-order-tables.mjs (ÉTAPE 2a).
function parseEnums(filePath, prefix) {
  if (!existsSync(filePath)) die(`introuvable: ${filePath}`);
  const text = readFileSync(filePath, 'utf8');
  const out = {};
  const blockRe = /enum\s*(?:\w+\s*)?\{([\s\S]*?)\}/g;
  let bm;
  while ((bm = blockRe.exec(text)) !== null) {
    let counter = 0;
    for (let line of bm[1].split('\n')) {
      line = line.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (!line) continue;
      for (const ent of line.split(',')) {
        const e = ent.trim();
        if (!e) continue;
        const mm = e.match(/^(\w+)\s*(?:=\s*(.+))?$/);
        if (!mm) continue;
        if (mm[2] !== undefined) {
          const rhs = mm[2].trim();
          counter = /^(0x)?[0-9A-Fa-f]+$/.test(rhs)
            ? (rhs.startsWith('0x') ? parseInt(rhs, 16) : Number(rhs))
            : (out[rhs] !== undefined ? out[rhs] : counter);
        }
        if (mm[1].startsWith(prefix)) out[mm[1]] = counter;
        counter++;
      }
    }
  }
  return out;
}

const pokedexH = join(decompPath, 'include', 'constants', 'pokedex.h');
const entriesH = join(decompPath, 'src', 'data', 'pokemon', 'pokedex_entries.h');
if (!existsSync(entriesH)) die(`introuvable: ${entriesH}`);

const NAT = parseEnums(pokedexH, 'NATIONAL_DEX_');
const src = readFileSync(entriesH, 'utf8');

const entryRe = /\[\s*NATIONAL_DEX_(\w+)\s*\]\s*=\s*\{([\s\S]*?)\}/g;
function field(body, name) {
  const m = body.match(new RegExp(`\\.${name}\\s*=\\s*(-?(?:0x)?[0-9A-Fa-f]+)\\b`));
  if (!m) return null;
  return m[1].startsWith('0x') ? parseInt(m[1], 16) : Number(m[1]);
}
function catName(body) {
  const m = body.match(/\.categoryName\s*=\s*_\(\s*"((?:[^"\\]|\\.)*)"\s*\)/);
  return m ? m[1] : '';
}

const entries = {};
let maxIdx = 0, count = 0, mm;
while ((mm = entryRe.exec(src)) !== null) {
  const key = 'NATIONAL_DEX_' + mm[1];
  if (NAT[key] === undefined) die(`${key} non résolu (enum pokedex.h)`);
  const idx = NAT[key];
  const body = mm[2];
  const e = {
    categoryName: catName(body),
    height: field(body, 'height'),
    weight: field(body, 'weight'),
    pokemonScale: field(body, 'pokemonScale'),
    pokemonOffset: field(body, 'pokemonOffset'),
    trainerScale: field(body, 'trainerScale'),
    trainerOffset: field(body, 'trainerOffset'),
  };
  for (const f of ['height', 'weight', 'pokemonScale', 'pokemonOffset', 'trainerScale', 'trainerOffset'])
    if (e[f] === null) die(`champ .${f} manquant pour ${key}`);
  entries[idx] = e;
  if (idx > maxIdx) maxIdx = idx;
  count++;
}
if (!count) die('0 entrée parsée');

const LEN = maxIdx + 1;
const arr = [];
for (let i = 0; i < LEN; i++) {
  arr[i] = entries[i] ?? { categoryName: '', height: 0, weight: 0,
    pokemonScale: 256, pokemonOffset: 0, trainerScale: 256, trainerOffset: 0 };
}

// Audit déterministe fail-loud (faits Pokémon connus 1:1).
function chk(c, m) { if (!c) die(`AUDIT FAIL: ${m}`); }
const bulba = arr[NAT['NATIONAL_DEX_BULBASAUR']];
chk(bulba.height === 7, `Bulbasaur height ${bulba.height} != 7`);   // 0.7 m
chk(bulba.weight === 69, `Bulbasaur weight ${bulba.weight} != 69`); // 6.9 kg
chk(bulba.categoryName === 'GRAINE', `Bulbasaur cat "${bulba.categoryName}" != GRAINE`);
const none = arr[NAT['NATIONAL_DEX_NONE']];
chk(none.height === 0 && none.weight === 0, 'NONE height/weight != 0');
chk(count >= 386, `count ${count} < 386`);

const banner = `// AUTO-GENERATED par scripts/extract-pokedex-entries-table.mjs — NE PAS éditer.
// Source 1:1 décomp : src/data/pokemon/pokedex_entries.h + include/
// constants/pokedex.h. Régénérer : node scripts/extract-pokedex-entries-table.mjs
// INDEXÉ PAR NUMÉRO NATIONAL DEX (= gPokedexEntries[dexNum], 1:1 décomp ;
// distinct de pokedex-entries.json keyé SPECIES_, qui sert starter-flow).
// SCOPE : numériques + categoryName FR. \`.description\` (texte flavor) =
// DIFFÉRÉ ÉTAPE 4+ (info screen). LEN=${LEN}, ${count} entrées.
`;
const rows = arr.map((e, i) =>
  `  /*${i}*/ { categoryName: ${JSON.stringify(e.categoryName)}, height: ${e.height}, weight: ${e.weight}, ` +
  `pokemonScale: ${e.pokemonScale}, pokemonOffset: ${e.pokemonOffset}, ` +
  `trainerScale: ${e.trainerScale}, trainerOffset: ${e.trainerOffset} }`).join(',\n');

const out = `${banner}
/** 1:1 décomp \`struct PokedexEntry\` (include/pokedex.h:21-32) SANS
 *  \`description\` (symbole texte différé ÉTAPE 4+). height=décimètres,
 *  weight=hectogrammes. */
export interface PokedexEntryData {
  categoryName: string;
  height: number;
  weight: number;
  pokemonScale: number;
  pokemonOffset: number;
  trainerScale: number;
  trainerOffset: number;
}

/** 1:1 décomp \`const struct PokedexEntry gPokedexEntries[]\`
 *  (pokedex_entries.h), indexé par numéro National Dex. */
export const gPokedexEntries: readonly PokedexEntryData[] = [
${rows}
];
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, out);

console.log('[extract-pokedex-entries-table] OK', {
  LEN, count,
  bulbasaur: { h: bulba.height, w: bulba.weight, cat: bulba.categoryName },
  deoxys: arr[NAT['NATIONAL_DEX_DEOXYS']]
    ? { h: arr[NAT['NATIONAL_DEX_DEOXYS']].height, cat: arr[NAT['NATIONAL_DEX_DEOXYS']].categoryName } : null,
  out: outPath,
});
