#!/usr/bin/env node
/**
 * extract-contest-effect-descriptions.mjs
 * ---------------------------------------
 * Extrait 1:1 `gContestEffectDescriptionPointers[]` (les descriptions
 * d'EFFET CONCOURS affichées page CAPACITÉS CONCOURS du résumé).
 *
 * Décomp `PrintMoveDetails` (pokemon_summary_screen.c:3661-3684) :
 *   - page BATTLE_MOVES → gMoveDescriptionPointers[move-1]   (combat)
 *   - SINON (page CONTEST) → gContestEffectDescriptionPointers[
 *                              gContestMoves[move].effect]    (concours)
 * → la page concours montre la description de l'EFFET concours, PAS la
 *   description de combat (bug A/B : on affichait getMoveDescription).
 *
 * Sources de vérité (décomp) :
 *   - src/data/contest_text_tables.h:220 `gContestEffectDescription
 *     Pointers[] = { [CONTEST_EFFECT_X] = gText_Y, ... }`
 *   - data/text/contest_strings.inc : `gText_Y::` + `.string "..."`
 *     segments (concat direct 1:1 ; `\n` = saut de ligne RÉEL = box
 *     2 lignes, comme move_descriptions ; `$` = EOS à retirer).
 *
 * Sortie : public/decomp/em/contest-effect-descriptions-fr.json
 *   { "CONTEST_EFFECT_HIGHLY_APPEALING": "Une démonstration qui\nplaît
 *     énormément.", ... }   (keyé CONTEST_EFFECT_* = même clé que
 *   contest-effects.json / getContestMove(move).effect → wirage direct).
 *
 * 0 hardcode. Régénérer : node scripts/extract-contest-effect-descriptions.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const decomp = resolve(__dirname, '../../decomps/pokeemeraude');
const INC = resolve(decomp, 'data/text/contest_strings.inc');
const TBL = resolve(decomp, 'src/data/contest_text_tables.h');
const OUT = resolve(__dirname, '../public/decomp/em/contest-effect-descriptions-fr.json');

function die(m) { console.error('[extract-contest-effect-descriptions] FATAL:', m); process.exit(1); }

// 1) FR strings : `gLabel::` puis 1+ lignes `.string "..."` jusqu'au label
//    suivant. Concat DIRECT (1:1 .string adjacents), `\n`/`\l`/`\p` → vrai
//    saut de ligne (box 2 lignes), `$` EOS retiré. (= même règle 1:1 que
//    extract-pokemon-data.mjs extractMoveDescription.)
const incText = readFileSync(INC, 'utf8');
const strByLabel = {};
{
  const lines = incText.split('\n');
  let cur = null, parts = [];
  const flush = () => {
    if (cur) {
      strByLabel[cur] = parts.join('')
        .replace(/\$$/, '')
        .replace(/\\n/g, '\n')
        .replace(/\\[lp]/g, '\n')
        .trim();
    }
    cur = null; parts = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    const lbl = line.match(/^(\w+)::/);
    if (lbl) { flush(); cur = lbl[1]; continue; }
    const sm = line.match(/^\.string\s+"((?:\\.|[^"\\])*)"/);
    if (sm && cur) parts.push(sm[1]);
  }
  flush();
}
if (!Object.keys(strByLabel).length) die(`0 string parsée dans ${INC}`);

// 2) Table `[CONTEST_EFFECT_X] = gText_Y`
const tbl = readFileSync(TBL, 'utf8');
const blk = tbl.match(/gContestEffectDescriptionPointers\[\]\s*=\s*\{([\s\S]*?)\n\};/);
if (!blk) die('gContestEffectDescriptionPointers introuvable');
const reMap = /\[\s*(CONTEST_EFFECT_\w+)\s*\]\s*=\s*(\w+)/g;
const out = {};
let m, n = 0, missing = [];
while ((m = reMap.exec(blk[1])) !== null) {
  const effect = m[1], label = m[2];
  if (strByLabel[label] === undefined) { missing.push(`${effect}→${label}`); continue; }
  out[effect] = strByLabel[label];
  n++;
}
if (n === 0) die('0 mapping effet→texte');
if (missing.length) die(`labels FR introuvables: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`);

// Audit déterministe fail-loud (faits connus 1:1 contest_strings.inc:3-5)
const HA = out['CONTEST_EFFECT_HIGHLY_APPEALING'];
if (!HA || HA.split('\n').length !== 2) die(`HIGHLY_APPEALING attendu 2 lignes, eu [${HA}]`);
if (HA !== 'Une démonstration qui\nplaît énormément.')
  die(`HIGHLY_APPEALING texte ≠ 1:1 décomp : [${HA}]`);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out));
console.log('[extract-contest-effect-descriptions] OK', {
  effets: n, labels: Object.keys(strByLabel).length,
  HIGHLY_APPEALING: JSON.stringify(HA),
  out: OUT,
});
