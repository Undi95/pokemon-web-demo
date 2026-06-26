/**
 * probe-critcalc-1to1.mjs — ORACLE RUNTIME de Cmd_critcalc (coup critique).
 *
 * 1:1 décomp `Cmd_critcalc` : critChance = 2·FocusEnergy + high-crit-move + ScopeLens +
 * 2·(LuckyPunch&Chansey) + 2·(Stick&Farfetch'd), clampé à 4 ; crit si pas de Battle/Shell Armor,
 * pas STATUS3_CANT_SCORE, pas Wally/first-battle, ET `Random() % sCriticalHitChance[critChance] == 0`
 * (table {16,8,4,3,2}). On RECODE critChance + canCrit, on PRÉDIT le tirage (le RNG est seedable :
 * on peek la valeur que la fn consommera puis on re-seed), et on confronte gCritMultiplier.
 * Cmd_critcalc ne lit pas son ctx → appelable direct. Self-import bsc+st (instances cohérentes).
 */
'use strict';

const CRIT_TABLE = [16, 8, 4, 3, 2];

export async function runCritcalcOracle(deps) {
  const bsc = await import('/src/battle_script_commands.ts');
  const st = await import('/src/engine/battle/state.ts');
  const rng = await import('/src/random.ts');
  const bm = await import('/src/engine/battle/data/battle-moves.ts');
  const ih = await import('/src/engine/battle/data/item-hold-effects.ts');
  const dc = (deps && deps.dc) || await import('/harness/runtime/decomp-constants.ts');
  if (bm.loadBattleMoves) await bm.loadBattleMoves();
  if (ih.loadItemHoldEffects) await ih.loadItemHoldEffects();
  const R = (n, p) => dc.resolveDecompConstant(n, p);

  const STATUS2_FOCUS_ENERGY = R('STATUS2_FOCUS_ENERGY', 'STATUS2_');
  const EFFECT_HIGH_CRITICAL = R('EFFECT_HIGH_CRITICAL', 'EFFECT_');
  const EFFECT_SKY_ATTACK = R('EFFECT_SKY_ATTACK', 'EFFECT_');
  const EFFECT_BLAZE_KICK = R('EFFECT_BLAZE_KICK', 'EFFECT_');
  const EFFECT_POISON_TAIL = R('EFFECT_POISON_TAIL', 'EFFECT_');
  const HOLD_SCOPE = R('HOLD_EFFECT_SCOPE_LENS', 'HOLD_EFFECT_');
  const HOLD_LUCKY = R('HOLD_EFFECT_LUCKY_PUNCH', 'HOLD_EFFECT_');
  const HOLD_STICK = R('HOLD_EFFECT_STICK', 'HOLD_EFFECT_');
  const CHANSEY = R('SPECIES_CHANSEY', 'SPECIES_');
  const FARFETCHD = R('SPECIES_FARFETCHD', 'SPECIES_');
  const BATTLE_ARMOR = R('ABILITY_BATTLE_ARMOR', 'ABILITY_');
  const SHELL_ARMOR = R('ABILITY_SHELL_ARMOR', 'ABILITY_');
  const STATUS3_CANT = R('STATUS3_CANT_SCORE_A_CRIT', 'STATUS3_');
  const BT_WALLY = R('BATTLE_TYPE_WALLY_TUTORIAL', 'BATTLE_TYPE_');
  const BT_FIRST = R('BATTLE_TYPE_FIRST_BATTLE', 'BATTLE_TYPE_');
  const ITEM_SCOPE = R('ITEM_SCOPE_LENS', 'ITEM_');
  const TACKLE = R('MOVE_TACKLE', 'MOVE_'), SLASH = R('MOVE_SLASH', 'MOVE_');

  const getEff = (move) => bm.getBattleMove(move).effect;
  const getHold = (item) => ih.GetItemHoldEffect(item);

  // critChance recodé 1:1.
  const recodeCC = (move, item, status2, species) => {
    const eff = getEff(move), he = getHold(item);
    let cc = 2 * ((status2 & STATUS2_FOCUS_ENERGY) ? 1 : 0)
      + (eff === EFFECT_HIGH_CRITICAL ? 1 : 0) + (eff === EFFECT_SKY_ATTACK ? 1 : 0)
      + (eff === EFFECT_BLAZE_KICK ? 1 : 0) + (eff === EFFECT_POISON_TAIL ? 1 : 0)
      + (he === HOLD_SCOPE ? 1 : 0)
      + 2 * (he === HOLD_LUCKY && species === CHANSEY ? 1 : 0)
      + 2 * (he === HOLD_STICK && species === FARFETCHD ? 1 : 0);
    if (cc >= CRIT_TABLE.length) cc = CRIT_TABLE.length - 1;
    return cc;
  };

  const m0 = st.gBattleMons[0], m1 = st.gBattleMons[1];
  const sv = {
    ba: st.gBattlerAttacker, bt: st.gBattlerTarget, cm: st.gCurrentMove, cmlt: st.gCritMultiplier,
    tf: st.gBattleTypeFlags, s3: st.gStatuses3[0],
    a0i: m0.item, a0s2: m0.status2, a0sp: m0.species, a1ab: m1.ability,
    rng: rng._rngDebug ? rng._rngDebug().gRngValue : 0,
  };
  const fails = []; let checked = 0;
  // [nom, move, item, status2, species, targetAbility, status3, typeFlags]
  const SC = [
    ['base', TACKLE, 0, 0, 1, 0, 0, 0],
    ['focus energy', TACKLE, 0, STATUS2_FOCUS_ENERGY, 1, 0, 0, 0],
    ['high-crit (Slash)', SLASH, 0, 0, 1, 0, 0, 0],
    ['focus+highcrit', SLASH, 0, STATUS2_FOCUS_ENERGY, 1, 0, 0, 0],
    ['scope lens', TACKLE, ITEM_SCOPE, 0, 1, 0, 0, 0],
    ['battle armor', TACKLE, 0, STATUS2_FOCUS_ENERGY, 1, BATTLE_ARMOR, 0, 0],
    ['shell armor', TACKLE, 0, STATUS2_FOCUS_ENERGY, 1, SHELL_ARMOR, 0, 0],
    ['cant score', TACKLE, 0, STATUS2_FOCUS_ENERGY, 1, 0, STATUS3_CANT, 0],
    ['first battle', TACKLE, 0, STATUS2_FOCUS_ENERGY, 1, 0, 0, BT_FIRST],
    ['wally tutorial', TACKLE, 0, STATUS2_FOCUS_ENERGY, 1, 0, 0, BT_WALLY],
  ];
  try {
    st.setBattlerAttacker(0); st.setBattlerTarget(1);
    for (const [name, move, item, status2, species, tgtAb, s3, tf] of SC) {
      m0.item = item; m0.status2 = status2; m0.species = species;
      m1.ability = tgtAb;
      st.gStatuses3[0] = s3;
      st.setCurrentMove(move);
      st.setBattleTypeFlags ? st.setBattleTypeFlags(tf) : (st.gBattleTypeFlags = tf);
      const cc = recodeCC(move, item, status2, species);
      const chance = CRIT_TABLE[cc];
      const canCrit = tgtAb !== BATTLE_ARMOR && tgtAb !== SHELL_ARMOR
        && (s3 & STATUS3_CANT) === 0 && (tf & (BT_WALLY | BT_FIRST)) === 0;
      // teste plusieurs seeds → couvre crit ET no-crit
      for (const seed of [0, 1, 7, 13, 100, 255]) {
        rng.SeedRng(seed); const V = rng.Random(); rng.SeedRng(seed);  // peek + re-seed
        const expectCrit = canCrit && (V % chance === 0);
        bsc.Cmd_critcalc(null);
        const got = st.gCritMultiplier;
        const want = expectCrit ? 2 : 1;
        checked++;
        if (got !== want && fails.length < 12) fails.push(`${name} seed=${seed} cc=${cc} V%${chance}=${V % chance}: got=${got} want=${want}`);
      }
    }
  } finally {
    st.setBattlerAttacker(sv.ba); st.setBattlerTarget(sv.bt); st.setCurrentMove(sv.cm); st.setCritMultiplier(sv.cmlt);
    st.setBattleTypeFlags ? st.setBattleTypeFlags(sv.tf) : (st.gBattleTypeFlags = sv.tf);
    st.gStatuses3[0] = sv.s3;
    m0.item = sv.a0i; m0.status2 = sv.a0s2; m0.species = sv.a0sp; m1.ability = sv.a1ab;
    rng.SeedRng(sv.rng);
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 12),
    verdict: fails.length === 0 ? '✅ Cmd_critcalc (paliers + canCrit + tirage) 1:1' : '❌ écarts' };
}
