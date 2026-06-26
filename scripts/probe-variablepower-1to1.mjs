/**
 * probe-variablepower-1to1.mjs — ORACLE RUNTIME des moves à puissance variable (déterministes).
 *
 * - Flail/Reversal (`Cmd_remaininghptopower`) : power = sFlailHpScaleToPowerTable[lookup] selon
 *   GetScaledHPFraction(hp, maxHP, 48) (table [1,200,4,150,9,100,16,80,32,40,48,20], pas-de-2).
 * - Retour/Frustration (`Cmd_friendshiptodamagecalculation`) : Retour = 10·friendship/25,
 *   Frustration = 10·(255-friendship)/25.
 * Aucun RNG ; les 2 cmds ne lisent pas leur ctx → appelables direct. Self-import bsc+st.
 */
'use strict';

const FLAIL = [1, 200, 4, 150, 9, 100, 16, 80, 32, 40, 48, 20];
const MAX_FRIENDSHIP = 255;

function scaledFrac(hp, maxHP) { let f = Math.floor((hp * 48) / maxHP); if (f === 0 && hp > 0) f = 1; return f; }
function flailPower(hp, maxHP) { const f = scaledFrac(hp, maxHP); let i = 0; for (i = 0; i < FLAIL.length; i += 2) if (f <= FLAIL[i]) break; return FLAIL[i + 1]; }

export async function runVariablePowerOracle(deps) {
  const bsc = await import('/src/battle_script_commands.ts');
  const st = await import('/src/engine/battle/state.ts');
  const bm = await import('/src/engine/battle/data/battle-moves.ts');
  const dc = (deps && deps.dc) || await import('/harness/runtime/decomp-constants.ts');
  if (bm.loadBattleMoves) await bm.loadBattleMoves();
  const R = (n) => dc.resolveDecompConstant(n, 'MOVE_');
  const RETURN = R('MOVE_RETURN'), FRUSTRATION = R('MOVE_FRUSTRATION');
  const EFFECT_RETURN = dc.resolveDecompConstant('EFFECT_RETURN', 'EFFECT_');
  const effOf = (m) => bm.getBattleMove(m).effect;

  const m0 = st.gBattleMons[0];
  const sv = { ba: st.gBattlerAttacker, cm: st.gCurrentMove, dbp: st.gDynamicBasePower,
    hp: m0.hp, mh: m0.maxHP, fr: m0.friendship };
  const fails = []; let checked = 0;
  try {
    st.setBattlerAttacker(0);
    // — Flail/Reversal — (maxHP=48 → frac=hp ; + cas maxHP=100)
    const flailCases = [
      [48, 48], [1, 48], [4, 48], [9, 48], [16, 48], [32, 48], [5, 48], [33, 48],
      [1, 100], [50, 100], [100, 100], [3, 100],
    ];
    for (const [hp, maxHP] of flailCases) {
      m0.hp = hp; m0.maxHP = maxHP;
      st.setDynamicBasePower(-1);
      bsc.Cmd_remaininghptopower(null);
      const got = st.gDynamicBasePower, want = flailPower(hp, maxHP);
      checked++;
      if (got !== want && fails.length < 12) fails.push(`Flail hp=${hp}/${maxHP}: got=${got} want=${want}`);
    }
    // — Retour/Frustration —
    for (const move of [RETURN, FRUSTRATION]) {
      const isReturn = effOf(move) === EFFECT_RETURN;
      st.setCurrentMove(move);
      for (const fr of [0, 70, 100, 150, 200, 255]) {
        m0.friendship = fr;
        st.setDynamicBasePower(-1);
        bsc.Cmd_friendshiptodamagecalculation(null);
        const got = st.gDynamicBasePower;
        const want = isReturn ? Math.floor(10 * fr / 25) : Math.floor(10 * (MAX_FRIENDSHIP - fr) / 25);
        checked++;
        if (got !== want && fails.length < 12) fails.push(`${isReturn ? 'Return' : 'Frustration'} fr=${fr}: got=${got} want=${want}`);
      }
    }
  } finally {
    st.setBattlerAttacker(sv.ba); st.setCurrentMove(sv.cm); st.setDynamicBasePower(sv.dbp);
    m0.hp = sv.hp; m0.maxHP = sv.mh; m0.friendship = sv.fr;
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 12),
    verdict: fails.length === 0 ? '✅ Flail/Reversal + Retour/Frustration (puissance variable) 1:1' : '❌ écarts' };
}
