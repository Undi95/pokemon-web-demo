/**
 * probe-tmhm-learn-1to1.mjs — ORACLE RUNTIME de la légalité d'apprentissage CT/CS.
 *
 * audit-tmhm-learnsets.cjs prouve la DATA (tmhm-learnsets.json == décomp tmhm_learnsets.h,
 * ensembles 1:1). Celui-ci prouve les FONCTIONS runtime qui la consomment (party-storage.ts) :
 *   - CanSpeciesLearnTMHM(species, tm)  (pokemon.c:6252)
 *   - CanMonLearnTMHM(mon, tm)          (pokemon.c:6232)
 *   - GiveMoveToMon(mon, move)          (pokemon.c → GiveMoveToBoxMon)
 *   - MonKnowsMove(mon, move)           (pokemon.c)
 * = la chaîne derrière ItemUseCB_TMHM (party_menu.c:4733, dispatch d'enseignement de CT/CS).
 *
 * NON-CIRCULAIRE : les valeurs attendues de BULBASAUR (apprend TOXIC/CUT/ATTRACT… ; PAS
 * FOCUS_PUNCH/BLIZZARD/FLY/SURF) sont lues DIRECTEMENT dans le décomp tmhm_learnsets.h
 * (.learnset de SPECIES_BULBASAUR), pas dans notre JSON.
 *
 * LANCER (live) : o.runTmhmLearnOracle({
 *   ps: await import('/src/engine/battle/party-storage.ts'),
 *   tm: await import('/src/engine/pokemon/tmhm-moves.ts'),
 *   dc: await import('/harness/runtime/decomp-constants.ts') })
 * RÉSULTAT VÉRIFIÉ (2026-06-26, finale) : 22 cas + teach/already/max 1:1, 0 écart.
 */
'use strict';

export function runTmhmLearnOracle({ ps, tm, dc }) {
  const R = (s) => dc.resolveDecompConstant(s);
  const fails = [];
  const BULBA = R('SPECIES_BULBASAUR');

  // (1) CanSpeciesLearnTMHM — index sTMHMMoves (FOREACH_TMHM) → attendu lu du décomp .h.
  const canTrue = [5, 8, 9, 10, 16, 18, 20, 21, 26, 31, 35, 41, 42, 43, 44, 50, 53, 54, 55]; // BULBASAUR .learnset
  const canFalse = [0, 13, 49, 51, 52, 56, 57]; // FOCUS_PUNCH, BLIZZARD, OVERHEAT, FLY, SURF, WATERFALL, DIVE
  for (const i of canTrue) if (ps.CanSpeciesLearnTMHM(BULBA, i) !== true) fails.push(`CanSpeciesLearnTMHM(BULBA,${i}=${tm.sTMHMMoves[i]}) attendu true`);
  for (const i of canFalse) if (ps.CanSpeciesLearnTMHM(BULBA, i) !== false) fails.push(`CanSpeciesLearnTMHM(BULBA,${i}=${tm.sTMHMMoves[i]}) attendu false`);

  // (2) CanMonLearnTMHM via un mon synthétique + (3) GiveMoveToMon (teach / already / max).
  const mkMon = (moves) => ({ species: BULBA, isEgg: 0, nickname: 'BULBI', moves: [...moves, 0, 0, 0, 0].slice(0, 4), pp: [0, 0, 0, 0] });
  const TOXIC = R('MOVE_TOXIC'), CUT = R('MOVE_CUT'), TACKLE = R('MOVE_TACKLE'), GROWL = R('MOVE_GROWL');

  const m1 = mkMon([TACKLE, GROWL]);
  if (ps.CanMonLearnTMHM(m1, 5) !== true) fails.push('CanMonLearnTMHM(BULBA TOXIC) attendu true');
  if (ps.CanMonLearnTMHM(m1, 51) !== false) fails.push('CanMonLearnTMHM(BULBA FLY) attendu false');

  // teach (slot vide) : retourne le move, l'inscrit + pose les PP.
  const r1 = ps.GiveMoveToMon(m1, TOXIC);
  if (r1 !== TOXIC) fails.push(`GiveMoveToMon teach attendu ${TOXIC} got ${r1}`);
  if (!ps.MonKnowsMove(m1, TOXIC)) fails.push('post-teach MonKnowsMove TOXIC attendu true');
  if (m1.pp[2] <= 0) fails.push(`post-teach PP attendu >0 got ${m1.pp[2]}`);

  // already knows : retourne MON_ALREADY_KNOWS_MOVE.
  const r2 = ps.GiveMoveToMon(m1, TOXIC);
  if (r2 !== 65534) fails.push(`GiveMoveToMon already attendu 65534 got ${r2}`);

  // 4 capacités pleines : retourne MON_HAS_MAX_MOVES, n'inscrit rien.
  const full = mkMon([TACKLE, GROWL, TOXIC, CUT]);
  const r3 = ps.GiveMoveToMon(full, R('MOVE_VINE_WHIP'));
  if (r3 !== 65535) fails.push(`GiveMoveToMon max attendu 65535 got ${r3}`);

  const checked = canTrue.length + canFalse.length + 6;
  return { checked, fails: fails.length, sample: fails.slice(0, 12),
    verdict: fails.length === 0 ? '✅ CanSpeciesLearnTMHM/CanMonLearnTMHM/GiveMoveToMon 1:1' : '❌ écarts' };
}
