/**
 * probe-weatherdamage-1to1.mjs — ORACLE RUNTIME de Cmd_weatherdamage (sable/grêle fin de tour).
 *
 * 1:1 décomp `Cmd_weatherdamage` (battle_script_commands.c) : si WEATHER_HAS_EFFECT, sable/grêle
 * infligent maxHP/16 (min 1) à l'attaquant, SAUF immunités de type (sable : Roc/Acier/Sol + Sand
 * Veil ; grêle : Glace) et semi-invulnérabilité (souterrain/sous l'eau). On pilote gBattleWeather +
 * gBattleMons[attaquant] (type/ability/maxHP) avec SAVE+RESTORE et on confronte gBattleMoveDamage.
 *
 * Self-import bsc+st côte à côte (instances Vite cohérentes — cf. leçon typecalc/météo-bridge).
 *
 * LANCER (live) : return (await import('/scripts/probe-weatherdamage-1to1.mjs')).runWeatherDamageOracle({ dc });
 */
'use strict';

export async function runWeatherDamageOracle(deps) {
  const bsc = await import('/src/battle_script_commands.ts');
  const st = await import('/src/engine/battle/state.ts');
  const bc = await import('/src/engine/battle/constants.ts');
  const dc = (deps && deps.dc) || await import('/harness/runtime/decomp-constants.ts');
  // B_WEATHER_* sont COMPOSITES (temporary|permanent) → importer du module canonique que lit bsc,
  // pas resolveDecompConstant (qui ne résout pas les composites).
  const B_WEATHER_SANDSTORM = bc.B_WEATHER_SANDSTORM;
  const B_WEATHER_HAIL = bc.B_WEATHER_HAIL;
  const SAND_VEIL = dc.resolveDecompConstant('ABILITY_SAND_VEIL', 'ABILITY_');
  // TYPE_* = valeurs Gen 3 standard (= décomp, = ce que lit bsc).
  const TYPE = { NORMAL: 0, GROUND: 4, ROCK: 5, STEEL: 8, ICE: 15 };

  const m0 = st.gBattleMons[0], m1 = st.gBattleMons[1];
  const sv = {
    ba: st.gBattlerAttacker, bc: st.gBattlersCount, bw: st.gBattleWeather, dmg: st.gBattleMoveDamage,
    s3_0: st.gStatuses3[0], abs: st.gAbsentBattlerFlags,
    a0: m0.ability, t1: m0.type1, t2: m0.type2, mh: m0.maxHP, a1: m1.ability,
  };
  const setBW = (v) => st.setBattleWeather(v);
  const fails = []; let checked = 0;

  // [nom, weather, type1, type2, ability, maxHP, attendu]
  const SC = [
    ['sable Normal', B_WEATHER_SANDSTORM, TYPE.NORMAL, TYPE.NORMAL, 0, 160, 10],   // 160/16
    ['sable Roc', B_WEATHER_SANDSTORM, TYPE.ROCK, TYPE.NORMAL, 0, 160, 0],
    ['sable Acier (type2)', B_WEATHER_SANDSTORM, TYPE.NORMAL, TYPE.STEEL, 0, 160, 0],
    ['sable Sol', B_WEATHER_SANDSTORM, TYPE.GROUND, TYPE.GROUND, 0, 160, 0],
    ['sable Sand Veil', B_WEATHER_SANDSTORM, TYPE.NORMAL, TYPE.NORMAL, SAND_VEIL, 160, 0],
    ['sable min-1', B_WEATHER_SANDSTORM, TYPE.NORMAL, TYPE.NORMAL, 0, 10, 1],       // 10/16=0 → 1
    ['grêle Normal', B_WEATHER_HAIL, TYPE.NORMAL, TYPE.NORMAL, 0, 160, 10],
    ['grêle Glace', B_WEATHER_HAIL, TYPE.ICE, TYPE.NORMAL, 0, 160, 0],
    ['grêle Glace(type2)', B_WEATHER_HAIL, TYPE.NORMAL, TYPE.ICE, 0, 160, 0],
  ];

  try {
    st.setBattlerAttacker(0);
    st.setBattlersCount(2);
    st.gStatuses3[0] = 0;            // pas souterrain/sous l'eau (mutation d'élément, OK)
    st.setAbsentBattlerFlags(0);
    m1.ability = 0;                  // pas de Cloud Nine/Air Lock → WEATHER_HAS_EFFECT true
    for (const [name, weather, t1, t2, ab, mh, want] of SC) {
      setBW(weather);
      m0.type1 = t1; m0.type2 = t2; m0.ability = ab; m0.maxHP = mh;
      st.setBattleMoveDamage(-999);   // sentinelle : la fn doit l'écraser
      bsc.Cmd_weatherdamage(null);
      const got = st.gBattleMoveDamage;
      checked++;
      if (got !== want && fails.length < 12) fails.push(`${name}: got=${got} want=${want}`);
    }
  } finally {
    st.setBattlerAttacker(sv.ba); st.setBattlersCount(sv.bc); setBW(sv.bw); st.setBattleMoveDamage(sv.dmg);
    st.gStatuses3[0] = sv.s3_0; st.setAbsentBattlerFlags(sv.abs);
    m0.ability = sv.a0; m0.type1 = sv.t1; m0.type2 = sv.t2; m0.maxHP = sv.mh; m1.ability = sv.a1;
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 12),
    verdict: fails.length === 0 ? '✅ Cmd_weatherdamage (sable/grêle maxHP/16 + immunités) 1:1' : '❌ écarts' };
}
