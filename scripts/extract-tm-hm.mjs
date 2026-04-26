#!/usr/bin/env node
/**
 * Extrait TM/HM mapping (TMxx → MOVE_X) + learnsets par species.
 *
 * Sources :
 *   - `include/constants/tms_hms.h` : macros FOREACH_TM/FOREACH_HM
 *   - `src/data/pokemon/tmhm_learnsets.h` : `gTMHMLearnsets[NUM_SPECIES]`
 *
 * Sortie : `tm-hm.json` :
 *   { "moves": { "TM01": "MOVE_FOCUS_PUNCH", ... },
 *     "learnsets": { "SPECIES_BULBASAUR": ["TM03", "TM06", ...] } }
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const decompPath = resolve(projectRoot, '..', 'decomps', 'pokeemeraude');
const outDirSrc = join(projectRoot, 'src', 'decomp', 'em');
const outDirPub = join(projectRoot, 'public', 'decomp', 'em');
mkdirSync(outDirSrc, { recursive: true });
mkdirSync(outDirPub, { recursive: true });

function extractTMHMOrder() {
  const text = readFileSync(join(decompPath, 'include/constants/tms_hms.h'), 'utf8');
  const tms = [], hms = [];
  const tmMatch = text.match(/FOREACH_TM\(F\)\s*\\?\s*([\s\S]*?)\\?\s*\n\s*FOREACH_HM/);
  if (tmMatch) {
    for (const line of tmMatch[1].split('\n')) {
      const m = line.match(/F\(\s*(\w+)\s*\)/);
      if (m) tms.push(m[1]);
    }
  }
  const hmMatch = text.match(/FOREACH_HM\(F\)\s*\\?\s*([\s\S]*?)\\?\s*\n\s*#define/);
  if (hmMatch) {
    for (const line of hmMatch[1].split('\n')) {
      const m = line.match(/F\(\s*(\w+)\s*\)/);
      if (m) hms.push(m[1]);
    }
  }
  return { tms, hms };
}

function buildMovesMap(tms, hms) {
  const moves = {};
  tms.forEach((mv, i) => { moves[`TM${String(i + 1).padStart(2, '0')}`] = `MOVE_${mv}`; });
  hms.forEach((mv, i) => { moves[`HM${String(i + 1).padStart(2, '0')}`] = `MOVE_${mv}`; });
  return moves;
}

function parseLearnsets() {
  const candidates = [
    'src/data/pokemon/tmhm_learnsets.h',
    'src/data/pokemon_tmhm_learnsets.h',
  ];
  let file = null;
  for (const c of candidates) if (existsSync(join(decompPath, c))) { file = c; break; }
  if (!file) { console.error('learnsets file not found'); return {}; }
  const text = readFileSync(join(decompPath, file), 'utf8');
  const reSpecies = /\[(SPECIES_\w+)\]\s*=\s*\{\s*\.learnset\s*=\s*\{([\s\S]*?)\}\s*\}/g;
  const out = {};
  let m;
  while ((m = reSpecies.exec(text)) !== null) {
    const species = m[1];
    const body = m[2];
    const moves = [];
    const reMove = /\.(\w+)\s*=\s*TRUE/g;
    let mv;
    while ((mv = reMove.exec(body)) !== null) moves.push(mv[1]);
    out[species] = moves;
  }
  return out;
}

const { tms, hms } = extractTMHMOrder();
const moves = buildMovesMap(tms, hms);
const learnsets = parseLearnsets();

// Convert: pour chaque species, liste de TM/HM ids (TMxx/HMxx) au lieu de noms moves
const learnsetsBySpecies = {};
const moveToTmhm = {};
for (const [tmhmKey, moveName] of Object.entries(moves)) moveToTmhm[moveName.replace(/^MOVE_/, '')] = tmhmKey;
for (const [species, moveList] of Object.entries(learnsets)) {
  learnsetsBySpecies[species] = moveList.map(mv => moveToTmhm[mv] ?? null).filter(Boolean);
}

const output = { moves, learnsets: learnsetsBySpecies };
const json = JSON.stringify(output);
writeFileSync(join(outDirSrc, 'tm-hm.json'), json);
writeFileSync(join(outDirPub, 'tm-hm.json'), json);

console.log(`[extract-tm-hm] ${tms.length} TMs, ${hms.length} HMs, ${Object.keys(learnsetsBySpecies).length} species`);
console.log(`  TM01-05:`, Object.entries(moves).slice(0, 5));
console.log(`  spot BULBASAUR:`, learnsetsBySpecies.SPECIES_BULBASAUR?.slice(0, 6));
