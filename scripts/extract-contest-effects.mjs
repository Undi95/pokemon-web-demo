#!/usr/bin/env node
/**
 * extract-contest-effects.mjs
 * ---------------------------
 * Extrait `gContestEffects[]` (src/data/contest_moves.h:2837) 1:1 décomp :
 * tableau indexé par les constantes `CONTEST_EFFECT_*` (include/constants/
 * contest.h), chaque entrée = { effectType, appeal, jam } (struct
 * ContestEffect, include/contest_effect.h:12).
 *
 * L'écran RÉSUMÉ (pokemon_summary_screen.c:2686-2709 DrawContestMoveHearts)
 * fait `gContestEffects[gContestMoves[move].effect].appeal/.jam` pour dessiner
 * les cœurs CHARME / BLOCAGE. `contest-moves.json` donne déjà `.effect`
 * (= CONTEST_EFFECT_*) ; il manquait la table appeal/jam → ce report honnête
 * est maintenant comblé 1:1 (zéro fake).
 *
 * Sortie : public/decomp/em/contest-effects.json
 *   { "CONTEST_EFFECT_HIGHLY_APPEALING": { "appeal": 40, "jam": 0 }, … }
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../../decomps/pokeemeraude/src/data/contest_moves.h');
const OUT = resolve(__dirname, '../public/decomp/em/contest-effects.json');

const src = readFileSync(SRC, 'utf8');

// Isole le bloc `const struct ContestEffect gContestEffects[] = { … };`
const blockMatch = src.match(/const struct ContestEffect gContestEffects\[\]\s*=\s*\{([\s\S]*?)\n\};/);
if (!blockMatch) {
  console.error('[extract-contest-effects] gContestEffects introuvable');
  process.exit(1);
}
const block = blockMatch[1];

// Chaque entrée : `[CONTEST_EFFECT_X] = { .effectType = …, .appeal = N, .jam = N, }`
const out = {};
const reEntry = /\[(CONTEST_EFFECT_\w+)\]\s*=\s*\{([^}]*)\}/g;
let m;
let n = 0;
while ((m = reEntry.exec(block)) !== null) {
  const name = m[1];
  const body = m[2];
  const appealM = body.match(/\.appeal\s*=\s*(\d+)/);
  const jamM = body.match(/\.jam\s*=\s*(\d+)/);
  out[name] = {
    appeal: appealM ? parseInt(appealM[1], 10) : 0,
    jam: jamM ? parseInt(jamM[1], 10) : 0,
  };
  n++;
}

if (n === 0) {
  console.error('[extract-contest-effects] 0 entrée parsée — abort');
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out));
console.log(`[extract-contest-effects] écrit ${OUT}`);
console.log(`  ${n} effets | check HIGHLY_APPEALING=${JSON.stringify(out['CONTEST_EFFECT_HIGHLY_APPEALING'])} ` +
  `AVOID_STARTLE_ONCE=${JSON.stringify(out['CONTEST_EFFECT_AVOID_STARTLE_ONCE'])}`);
