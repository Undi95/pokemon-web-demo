/**
 * probe-ppreduce-1to1.mjs — ORACLE RUNTIME de Cmd_ppreduce (déduction PP + Pressure).
 *
 * 1:1 décomp `Cmd_ppreduce` : ppToDeduct = 1 (+1 si la cible single-target a ABILITY_PRESSURE et
 * ≠ attaquant, sauf ppNotAffectedByPressure) ; déduit du PP du slot courant (clamp à 0) seulement
 * si pas HITMARKER_NO_PPDEDUCT/NO_ATTACKSTRING et pp>0. Déterministe (pas de RNG). Ctx utilisé
 * UNIQUEMENT dans l'early-return (gBattleControllerExecFlags≠0) → on met 0 et on passe null.
 * On met STATUS2_TRANSFORMED pour sauter l'emit-persist (side-effect party). Self-import bsc+st.
 * Move de test = Tackle (single-target → cas default du switch Pressure).
 */
'use strict';

export async function runPpReduceOracle(deps) {
  const bsc = await import('/src/battle_script_commands.ts');
  const st = await import('/src/engine/battle/state.ts');
  const bm = await import('/src/engine/battle/data/battle-moves.ts');
  const dc = (deps && deps.dc) || await import('/harness/runtime/decomp-constants.ts');
  if (bm.loadBattleMoves) await bm.loadBattleMoves();
  const R = (n, p) => dc.resolveDecompConstant(n, p);
  const NO_PPDEDUCT = R('HITMARKER_NO_PPDEDUCT', 'HITMARKER_');
  const NO_ATTACKSTRING = R('HITMARKER_NO_ATTACKSTRING', 'HITMARKER_');
  const TRANSFORMED = R('STATUS2_TRANSFORMED', 'STATUS2_');
  const PRESSURE = R('ABILITY_PRESSURE', 'ABILITY_');
  const TACKLE = R('MOVE_TACKLE', 'MOVE_');
  const TARGET_SELECTED = R('MOVE_TARGET_SELECTED', 'MOVE_TARGET_');

  // garde : Tackle doit être single-target (cas default) pour ce recodage.
  const tackleTarget = bm.getBattleMove(TACKLE).target;
  if (tackleTarget !== TARGET_SELECTED && tackleTarget !== 0) {
    return { checked: 0, fails: 0, sample: [], skipped: true, verdict: '⚠️ ignorée : Tackle non single-target' };
  }

  const m0 = st.gBattleMons[0], m1 = st.gBattleMons[1];
  const ss0 = st.gSpecialStatuses[0];
  const sv = {
    ba: st.gBattlerAttacker, bt: st.gBattlerTarget, cmp: st.gCurrMovePos, cm: st.gCurrentMove,
    hm: st.gHitMarker, ce: st.gBattleControllerExecFlags,
    pp: [...m0.pp], s2: m0.status2, a1: m1.ability, np: ss0.ppNotAffectedByPressure,
  };
  const fails = []; let checked = 0;
  // [nom, startPp, tgtAbility, ppNotAffected, hitMarker]
  const SC = [
    ['no pressure', 10, 0, 0, 0],
    ['pressure', 10, PRESSURE, 0, 0],
    ['pressure pp=1 clamp', 1, PRESSURE, 0, 0],
    ['no pressure pp=1', 1, 0, 0, 0],
    ['ppNotAffected+pressure', 10, PRESSURE, 1, 0],
    ['NO_PPDEDUCT', 10, PRESSURE, 0, NO_PPDEDUCT],
    ['NO_ATTACKSTRING', 10, 0, 0, NO_ATTACKSTRING],
    ['pp=0', 0, 0, 0, 0],
  ];
  try {
    st.setBattlerAttacker(0); st.setBattlerTarget(1); st.setCurrMovePos(0);
    st.setCurrentMove(TACKLE);
    st.setBattleControllerExecFlags(0);
    m0.status2 = TRANSFORMED;  // saute l'emit-persist (MOVE_IS_PERMANENT false)
    for (const [name, startPp, tgtAb, np, hm] of SC) {
      m0.pp[0] = startPp; m1.ability = tgtAb; ss0.ppNotAffectedByPressure = np;
      st.setHitMarker(hm);
      bsc.Cmd_ppreduce(null);
      const got = m0.pp[0];
      // recodage
      let deduct = 1 + (np ? 0 : (1 !== 0 && tgtAb === PRESSURE ? 1 : 0)); // attacker(0)!=target(1)
      let want;
      if ((hm & (NO_PPDEDUCT | NO_ATTACKSTRING)) || startPp === 0) want = startPp;
      else want = startPp > deduct ? startPp - deduct : 0;
      checked++;
      if (got !== want && fails.length < 12) fails.push(`${name}: got=${got} want=${want}`);
    }
  } finally {
    st.setBattlerAttacker(sv.ba); st.setBattlerTarget(sv.bt); st.setCurrMovePos(sv.cmp); st.setCurrentMove(sv.cm);
    st.setHitMarker(sv.hm); st.setBattleControllerExecFlags(sv.ce);
    for (let i = 0; i < sv.pp.length; i++) m0.pp[i] = sv.pp[i];
    m0.status2 = sv.s2; m1.ability = sv.a1; ss0.ppNotAffectedByPressure = sv.np;
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 12),
    verdict: fails.length === 0 ? '✅ Cmd_ppreduce (Pressure + clamp + gate NO_PPDEDUCT) 1:1' : '❌ écarts' };
}
