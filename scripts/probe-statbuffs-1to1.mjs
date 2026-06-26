/**
 * probe-statbuffs-1to1.mjs — ORACLE RUNTIME de ChangeStatBuffs (changements de paliers de stats).
 *
 * 1:1 décomp `ChangeStatBuffs` : décode statValue (`(n>>4)&7` magnitude, 0x80 négatif), applique
 * le delta aux statStages[statId] (apply INCONDITIONNEL puis clamp [0..12]), bloque les baisses
 * via Clear Body/White Smoke (toute stat), Keen Eye (précision), Hyper Cutter (attaque), Mist
 * (camp) → retour STAT_CHANGE_DIDNT_WORK sans appliquer. Déterministe (pas de RNG). flags=0 +
 * pas de `deps` → pas de saut de script (chemin opcode évité). activeBattler = gBattlerTarget.
 * Self-import bsc+st.
 */
'use strict';

export async function runStatBuffsOracle(deps) {
  const bsc = await import('/src/battle_script_commands.ts');
  const st = await import('/src/engine/battle/state.ts');
  const bc = await import('/src/engine/battle/constants.ts');
  const dc = (deps && deps.dc) || await import('/harness/runtime/decomp-constants.ts');
  const R = (n, p) => dc.resolveDecompConstant(n, p);
  const STAT_ATK = R('STAT_ATK', 'STAT_'), STAT_ACC = R('STAT_ACC', 'STAT_'), STAT_DEF = R('STAT_DEF', 'STAT_');
  const CLEAR_BODY = R('ABILITY_CLEAR_BODY', 'ABILITY_');
  const HYPER_CUTTER = R('ABILITY_HYPER_CUTTER', 'ABILITY_');
  const KEEN_EYE = R('ABILITY_KEEN_EYE', 'ABILITY_');
  const TACKLE = R('MOVE_TACKLE', 'MOVE_');
  const SET = bc.SET_STAT_BUFF_VALUE, NEG = 0x80;
  const WORKED = bc.STAT_CHANGE_WORKED;       // 0 (= décomp, vérifié)
  const DIDNT = bc.STAT_CHANGE_DIDNT_WORK;     // 1
  const up = (n) => SET(n), down = (n) => SET(n) | NEG;

  const m1 = st.gBattleMons[1];
  const side = 1 & 1;
  const sv = { bt: st.gBattlerTarget, cm: st.gCurrentMove, ss: [...m1.statStages], ab: m1.ability,
    mist: st.gSideTimers[side].mistTimer };
  const fails = []; let checked = 0;
  // [nom, statId, encoded, ability, mistTimer, startStage, wantStage, wantRet]
  const SC = [
    ['atk +2', STAT_ATK, up(2), 0, 0, 6, 8, WORKED],
    ['atk -1', STAT_ATK, down(1), 0, 0, 6, 5, WORKED],
    ['atk +2 clamp', STAT_ATK, up(2), 0, 0, 11, 12, WORKED],
    ['atk -2 clamp', STAT_ATK, down(2), 0, 0, 1, 0, WORKED],
    ['atk +1 at MAX', STAT_ATK, up(1), 0, 0, 12, 12, DIDNT],
    ['atk -1 at MIN', STAT_ATK, down(1), 0, 0, 0, 0, DIDNT],
    ['Clear Body bloque -1', STAT_ATK, down(1), CLEAR_BODY, 0, 6, 6, DIDNT],
    ['Hyper Cutter bloque -atk', STAT_ATK, down(1), HYPER_CUTTER, 0, 6, 6, DIDNT],
    ['Hyper Cutter PAS -def', STAT_DEF, down(1), HYPER_CUTTER, 0, 6, 5, WORKED],
    ['Keen Eye bloque -acc', STAT_ACC, down(1), KEEN_EYE, 0, 6, 6, DIDNT],
    ['Mist bloque -1', STAT_ATK, down(1), 0, 3, 6, 6, DIDNT],
    ['Clear Body NE bloque PAS +', STAT_ATK, up(1), CLEAR_BODY, 0, 6, 7, WORKED],
  ];
  try {
    st.setBattlerTarget(1);
    st.setCurrentMove(TACKLE);
    for (const [name, statId, enc, ability, mist, start, wantStage, wantRet] of SC) {
      m1.ability = ability;
      m1.statStages[statId] = start;
      st.gSideTimers[side].mistTimer = mist;
      const ret = bsc.ChangeStatBuffs(enc, statId, 0, 0);
      const gotStage = m1.statStages[statId];
      checked++;
      if ((gotStage !== wantStage || ret !== wantRet) && fails.length < 12)
        fails.push(`${name}: stage got=${gotStage} want=${wantStage}, ret got=${ret} want=${wantRet}`);
    }
  } finally {
    st.setBattlerTarget(sv.bt); st.setCurrentMove(sv.cm);
    for (let i = 0; i < sv.ss.length; i++) m1.statStages[i] = sv.ss[i];
    m1.ability = sv.ab; st.gSideTimers[side].mistTimer = sv.mist;
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 12),
    verdict: fails.length === 0 ? '✅ ChangeStatBuffs (apply+clamp+Clear Body/Hyper Cutter/Keen Eye/Mist) 1:1' : '❌ écarts' };
}
