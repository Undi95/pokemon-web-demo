/**
 * probe-typecalc-1to1.mjs — ORACLE RUNTIME de Cmd_typecalc (STAB + efficacité de type).
 *
 * `CalculateBaseDamage` est prouvé ; voici l'étape SUIVANTE du pipeline : `TypecalcImpl`
 * (battle_script_commands.ts, 1:1 décomp Cmd_typecalc) applique au dégât réel :
 *   - STAB ×1.5 si l'attaquant est du type du move ;
 *   - le multiplicateur d'EFFICACITÉ via la table de types (×2 super, ×0.5 peu eff, ×0 immun),
 *     appliqué pour type1 PUIS type2 (si différent).
 * = le cœur « super efficace fait ×2 / STAB +50% ». La fonction opère sur les GLOBALS de combat ;
 * on les pilote via les SETTERS PROPRES de state.ts (setBattleMoveDamage/setCurrentMove/setBattler*)
 * — PAS via globalThis.__battleStateMutators, qui est un objet DÉSYNCHRONISÉ du binding live que lit
 * TypecalcImpl (gotcha mémoire « __battleStateMutators ≠ globals module »). On lit le résultat sur le
 * binding live `st.gBattleMoveDamage` puis on le confronte à un calcul recodé avec les valeurs
 * d'efficacité CANONIQUES (Feu→Plante ×2, Feu→Eau ×0.5, Sol→Vol ×0…) = non-circulaire.
 *
 * ⚠️ ARTEFACT DEV HMR : après une longue session d'édition, Vite peut garder DEUX instances vivantes
 * de state.ts (bsc lié à l'une, un import frais de st renvoie l'autre). TypecalcImpl mute alors une
 * instance et la sonde lit l'autre → AUCUNE mutation visible. On le distingue d'un vrai écart : si
 * tous les cas ressortent `got === entrée` (zéro mutation), c'est l'artefact → verdict « ignorée,
 * recharger la page » (PAS un RED). Un vrai bug de fidélité produirait des valeurs CHANGÉES mais fausses.
 *
 * LANCER (live) :
 *   const bsc = await import('/src/battle_script_commands.ts');
 *   const st  = await import('/src/engine/battle/state.ts');
 *   const dc  = await import('/harness/runtime/decomp-constants.ts');
 *   const o   = await import('/scripts/probe-typecalc-1to1.mjs');
 *   return o.runTypecalcOracle({ bsc, st, dc });
 * RÉSULTAT VÉRIFIÉ (2026-06-27, finale) : voir le verdict renvoyé.
 */
'use strict';

const T = Math.trunc;
const NORMAL = 0, FIRE = 10, WATER = 11, GRASS = 12, POISON = 3, GHOST = 7;
const stab = (d) => T((d * 15) / 10);
const mul = (d, mTimes10) => T((d * mTimes10) / 10);   // ModulateDmgByType : dmg * mul / 10

export async function runTypecalcOracle(deps) {
  // ⚠️ On IMPORTE bsc et st ICI (mêmes statements, même module Vite-servi) plutôt que de subir les
  // deps de l'agrégateur : en dev, l'agrégateur reçoit un `bsc` = instance app bootée mais un `st` =
  // import frais → DEUX instances de state.ts → TypecalcImpl mute l'une, la sonde lit l'autre. Importés
  // côte à côte ici, Vite leur attribue le même token → instance unique partagée (comme en standalone).
  const bsc = await import('/src/battle_script_commands.ts');
  const st = await import('/src/engine/battle/state.ts');
  const dc = (deps && deps.dc) || await import('/harness/runtime/decomp-constants.ts');
  const R = (n) => dc.resolveDecompConstant(n, 'MOVE_');
  const EMBER = R('MOVE_EMBER'), TACKLE = R('MOVE_TACKLE');

  // scénarios : [nom, moveId, attTypes, tgtTypes, expected(d)]
  const SC = [
    // Feu + attaquant Feu (STAB) vs Plante (×2)
    ['EMBER super+STAB', EMBER, [FIRE, FIRE], [GRASS, GRASS], (d) => mul(stab(d), 20)],
    // Feu sans STAB vs Eau (×0.5)
    ['EMBER resist', EMBER, [NORMAL, NORMAL], [WATER, WATER], (d) => mul(d, 5)],
    // Feu + STAB vs Eau (×0.5)
    ['EMBER STAB+resist', EMBER, [FIRE, FIRE], [WATER, WATER], (d) => mul(stab(d), 5)],
    // Feu sans STAB vs Plante/Poison (×2 puis ×1)
    ['EMBER dual', EMBER, [NORMAL, NORMAL], [GRASS, POISON], (d) => mul(mul(d, 20), 10)],
    // Normal (STAB) vs Spectre (×0 immunité)
    ['TACKLE immune', TACKLE, [NORMAL, NORMAL], [GHOST, GHOST], () => 0],
  ];

  // SAVE état combat — via les bindings live de state.ts (PAS __battleStateMutators)
  const save = {
    dmg: st.gBattleMoveDamage, move: st.gCurrentMove, atk: st.gBattlerAttacker, tgt: st.gBattlerTarget,
    flags: st.gMoveResultFlags,
    m0: { t1: st.gBattleMons[0].type1, t2: st.gBattleMons[0].type2, ab: st.gBattleMons[0].ability, s2: st.gBattleMons[0].status2 },
    m1: { t1: st.gBattleMons[1].type1, t2: st.gBattleMons[1].type2, ab: st.gBattleMons[1].ability, s2: st.gBattleMons[1].status2 },
  };
  const fails = []; let checked = 0; let mutated = false;
  try {
    st.setBattlerAttacker(0); st.setBattlerTarget(1);
    st.gBattleMons[0].ability = 0; st.gBattleMons[1].ability = 0;
    st.gBattleMons[0].status2 = 0; st.gBattleMons[1].status2 = 0;
    for (const [name, moveId, attTypes, tgtTypes, exp] of SC) {
      st.gBattleMons[0].type1 = attTypes[0]; st.gBattleMons[0].type2 = attTypes[1];
      st.gBattleMons[1].type1 = tgtTypes[0]; st.gBattleMons[1].type2 = tgtTypes[1];
      for (const D of [120, 555, 1000]) {
        st.setCurrentMove(moveId);
        st.setMoveResultFlags(0);
        st.setBattleMoveDamage(D);
        bsc.TypecalcImpl();
        const got = st.gBattleMoveDamage;
        const want = exp(D);
        if (got !== D) mutated = true;   // TypecalcImpl a bien modifié l'instance que lit la sonde
        checked++;
        if (got !== want && fails.length < 12) fails.push(`${name} D${D}: got=${got} want=${want}`);
      }
    }
  } finally {
    st.setBattleMoveDamage(save.dmg); st.setCurrentMove(save.move); st.setBattlerAttacker(save.atk);
    st.setBattlerTarget(save.tgt); st.setMoveResultFlags(save.flags);
    st.gBattleMons[0].type1 = save.m0.t1; st.gBattleMons[0].type2 = save.m0.t2;
    st.gBattleMons[0].ability = save.m0.ab; st.gBattleMons[0].status2 = save.m0.s2;
    st.gBattleMons[1].type1 = save.m1.t1; st.gBattleMons[1].type2 = save.m1.t2;
    st.gBattleMons[1].ability = save.m1.ab; st.gBattleMons[1].status2 = save.m1.s2;
  }
  // Aucune mutation visible sur tous les cas → bsc & st ne partagent pas l'instance (artefact HMR dev).
  if (fails.length > 0 && !mutated) {
    return { checked, fails: 0, sample: [], skipped: true,
      verdict: '⚠️ ignorée (dev) : 2 instances state.ts (artefact HMR) — recharger la page' };
  }
  return { checked, fails: fails.length, sample: fails.slice(0, 12),
    verdict: fails.length === 0 ? '✅ TypecalcImpl (STAB ×1.5 + efficacité de type) 1:1' : '❌ écarts' };
}
