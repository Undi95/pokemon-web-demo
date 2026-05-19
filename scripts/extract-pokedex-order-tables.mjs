#!/usr/bin/env node
/**
 * extract-pokedex-order-tables.mjs
 * --------------------------------
 * Extrait 1:1 les 3 tables de mapping Pokédex que l'extracteur générique
 * a ratées (designated-initializers via macros, pas un array numérique
 * plat) :
 *   - sSpeciesToNationalPokedexNum  (pokemon.c, [NUM_SPECIES-1])
 *   - sSpeciesToHoennPokedexNum     (pokemon.c, [NUM_SPECIES-1])
 *   - sHoennToNationalOrder         (pokemon.c, [NUM_SPECIES-1])
 *
 * Source de vérité (décomp) :
 *   - pokemon.c:104-106 macros :
 *       SPECIES_TO_NATIONAL(name) = [SPECIES_##name - 1] = NATIONAL_DEX_##name
 *       SPECIES_TO_HOENN(name)    = [SPECIES_##name - 1] = HOENN_DEX_##name
 *       HOENN_TO_NATIONAL(name)   = [HOENN_DEX_##name - 1] = NATIONAL_DEX_##name
 *   - include/constants/species.h : `#define SPECIES_<name> <n>`
 *   - include/constants/pokedex.h : enum NATIONAL_DEX_<name> / HOENN_DEX_<name>
 *
 * = 1:1 STRICT, 0 hardcode (tout dérivé du décomp ; les valeurs viennent
 * des enums/defines décomp, l'ordre des blocs pokemon.c). Pattern projet
 * (cf. extract-constants.mjs). Sortie = module TS dans decomp-data/auto.
 *
 * Régénérer : `node scripts/extract-pokedex-order-tables.mjs`
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outPath = join(projectRoot, 'src', 'engine', 'decomp-data', 'auto', 'pokedex-order-tables.ts');

function die(msg) { console.error('[extract-pokedex-order-tables] FATAL:', msg); process.exit(1); }

// ── #define <PREFIX><name> <int>  (species.h) ──────────────────────────────
function parseDefines(filePath, prefix) {
  if (!existsSync(filePath)) die(`introuvable: ${filePath}`);
  const text = readFileSync(filePath, 'utf8');
  const out = {};
  const re = /^\s*#define\s+(\w+)\s+((?:0x)?[0-9A-Fa-f]+)\s*$/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (!m[1].startsWith(prefix)) continue;
    const v = m[2].startsWith('0x') ? parseInt(m[2], 16) : Number(m[2]);
    if (!Number.isNaN(v)) out[m[1]] = v;
  }
  return out;
}

// ── enum { A, B = 5, C, ... } (auto-increment, reset sur `= n`) ────────────
// Parse CHAQUE bloc `enum { ... }` indépendamment (compteur remis à 0 par
// bloc), puis filtre par préfixe. 1:1 sémantique enum C.
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
            : (out[rhs] !== undefined ? out[rhs] : counter); // ref à un membre déjà vu
        }
        if (mm[1].startsWith(prefix)) out[mm[1]] = counter;
        counter++;
      }
    }
  }
  return out;
}

// ── Bloc table pokemon.c : `static const u16 NAME[..] = { ... };` ─────────
function extractMacroNames(pokemonSrc, tableName) {
  const re = new RegExp(
    `static\\s+const\\s+u16\\s+${tableName}\\s*\\[[^\\]]*\\]\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`);
  const m = pokemonSrc.match(re);
  if (!m) die(`bloc table introuvable: ${tableName}`);
  const names = [];
  const er = /\b(?:SPECIES_TO_NATIONAL|SPECIES_TO_HOENN|HOENN_TO_NATIONAL)\(\s*(\w+)\s*\)/g;
  let e;
  while ((e = er.exec(m[1])) !== null) names.push(e[1]);
  if (!names.length) die(`0 entrée macro dans ${tableName}`);
  return names;
}

const speciesH = join(decompPath, 'include', 'constants', 'species.h');
const pokedexH = join(decompPath, 'include', 'constants', 'pokedex.h');
const pokemonC = join(decompPath, 'src', 'pokemon.c');

const SPECIES = parseDefines(speciesH, 'SPECIES_');
const NAT = parseEnums(pokedexH, 'NATIONAL_DEX_');
const HOE = parseEnums(pokedexH, 'HOENN_DEX_');
const src = readFileSync(pokemonC, 'utf8');

// NUM_SPECIES : `#define NUM_SPECIES <int>` OU max(SPECIES_*)+1 (fallback 1:1
// car SPECIES_NONE=0, espèces 1..N, NUM_SPECIES=N+1).
let NUM_SPECIES = SPECIES['NUM_SPECIES'];
if (!NUM_SPECIES) {
  const maxSp = Math.max(...Object.entries(SPECIES)
    .filter(([k]) => k !== 'NUM_SPECIES').map(([, v]) => v));
  NUM_SPECIES = maxSp + 1;
}
const LEN = NUM_SPECIES - 1; // taille décomp `[NUM_SPECIES - 1]`

function build(tableName, idxPrefix, idxMap, valPrefix, valMap) {
  const names = extractMacroNames(src, tableName);
  const arr = new Array(LEN).fill(0); // C static const → gaps = 0 (1:1)
  for (const name of names) {
    const idxKey = idxPrefix + name;
    const valKey = valPrefix + name;
    if (idxMap[idxKey] === undefined) die(`${idxKey} non résolu (${tableName})`);
    if (valMap[valKey] === undefined) die(`${valKey} non résolu (${tableName})`);
    const idx = idxMap[idxKey] - 1; // macro `[X_##name - 1]`
    if (idx < 0 || idx >= LEN) die(`index hors borne ${idx} (${idxKey}, LEN=${LEN})`);
    arr[idx] = valMap[valKey];
  }
  return { names, arr };
}

const s2n = build('sSpeciesToNationalPokedexNum', 'SPECIES_', SPECIES, 'NATIONAL_DEX_', NAT);
const s2h = build('sSpeciesToHoennPokedexNum', 'SPECIES_', SPECIES, 'HOENN_DEX_', HOE);
const h2n = build('sHoennToNationalOrder', 'HOENN_DEX_', HOE, 'NATIONAL_DEX_', NAT);

// ── Audit déterministe (spot-checks 1:1 connus, fail loud) ────────────────
function chk(cond, msg) { if (!cond) die(`AUDIT FAIL: ${msg}`); }
chk(s2n.arr.length === LEN, `s2n len ${s2n.arr.length} != ${LEN}`);
// SPECIES_BULBASAUR=1 → idx0 → NATIONAL_DEX_BULBASAUR=1
chk(s2n.arr[SPECIES['SPECIES_BULBASAUR'] - 1] === NAT['NATIONAL_DEX_BULBASAUR'],
  'BULBASAUR national');
// SPECIES_CELEBI → NATIONAL_DEX_CELEBI (251)
if (SPECIES['SPECIES_CELEBI'] !== undefined)
  chk(s2n.arr[SPECIES['SPECIES_CELEBI'] - 1] === NAT['NATIONAL_DEX_CELEBI'],
    'CELEBI national');
// sHoennToNationalOrder[HOENN_DEX_TREECKO-1] = NATIONAL_DEX_TREECKO
chk(h2n.arr[HOE['HOENN_DEX_TREECKO'] - 1] === NAT['NATIONAL_DEX_TREECKO'],
  'TREECKO hoenn→national');
// s2h : SPECIES_TREECKO → HOENN_DEX_TREECKO
chk(s2h.arr[SPECIES['SPECIES_TREECKO'] - 1] === HOE['HOENN_DEX_TREECKO'],
  'TREECKO species→hoenn');

const banner = `// AUTO-GENERATED par scripts/extract-pokedex-order-tables.mjs — NE PAS éditer.
// Source 1:1 décomp : pokemon.c (macros :104-106 + blocs sSpeciesToNational/
// Hoenn/sHoennToNationalOrder) + include/constants/{species,pokedex}.h.
// Régénérer : node scripts/extract-pokedex-order-tables.mjs
// NUM_SPECIES=${NUM_SPECIES} → LEN=${LEN} (taille décomp [NUM_SPECIES-1]).
// Les "trous" (espèces non listées) = 0, exactement comme le C static const.
`;
const fmt = (a) => {
  const lines = [];
  for (let i = 0; i < a.length; i += 20) lines.push('  ' + a.slice(i, i + 20).join(','));
  return lines.join(',\n');
};
const out = `${banner}
/** 1:1 décomp \`sSpeciesToNationalPokedexNum[NUM_SPECIES-1]\` (pokemon.c).
 *  Indexé \`SPECIES_x - 1\` → NATIONAL_DEX_x. */
export const sSpeciesToNationalPokedexNum: readonly number[] = [
${fmt(s2n.arr)}
];

/** 1:1 décomp \`sSpeciesToHoennPokedexNum[NUM_SPECIES-1]\` (pokemon.c).
 *  Indexé \`SPECIES_x - 1\` → HOENN_DEX_x (0 si hors Hoenn). */
export const sSpeciesToHoennPokedexNum: readonly number[] = [
${fmt(s2h.arr)}
];

/** 1:1 décomp \`sHoennToNationalOrder[NUM_SPECIES-1]\` (pokemon.c).
 *  Indexé \`HOENN_DEX_x - 1\` → NATIONAL_DEX_x. */
export const sHoennToNationalOrder: readonly number[] = [
${fmt(h2n.arr)}
];
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, out);

console.log('[extract-pokedex-order-tables] OK', {
  NUM_SPECIES, LEN,
  s2n_entries: s2n.names.length, s2h_entries: s2h.names.length, h2n_entries: h2n.names.length,
  bulbasaur_nat: s2n.arr[SPECIES['SPECIES_BULBASAUR'] - 1],
  treecko_hoenn: s2h.arr[SPECIES['SPECIES_TREECKO'] - 1],
  hoenn1_nat: h2n.arr[0],
  out: outPath,
});
