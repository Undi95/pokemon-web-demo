/**
 * script-opcodes-battle.ts — opcodes trainer battle / wild battle 1:1 décomp
 * `battle_setup.c` + `trainer_see.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_trainerbattle`         (l. 1821-1825) : dispatch via trainerbattle macros.
 *   `ScrCmd_dotrainerbattle`       (l. 1827-1831) : ConfigureAndSetUpOneTrainerBattle.
 *   `ScrCmd_gotopostbattlescript`  (l. 1833-1837) : jump to BattleScript_PostBattle.
 *   `ScrCmd_gotobeatenscript`      (l. 1839-1843) : jump to BattleScript_TrainerDefeated.
 *   `ScrCmd_checktrainerflag`      (l. 1845-1851) : gSpecialVar_Result = trainerFlag.
 *   `ScrCmd_settrainerflag`        (l. 1853-1859) : FlagSet(TRAINER_FLAGS_START + trainer).
 *   `ScrCmd_cleartrainerflag`      (l. 1861-1867) : FlagClear(TRAINER_FLAGS_START + trainer).
 *   `ScrCmd_setwildbattle`         (l. 1869-1877) : CreateScriptedWildMon.
 *   `ScrCmd_dowildbattle`          (l. 1879-1884) : BattleSetup_StartScriptedWildBattle.
 *
 * Plus les opcodes auto-extraits :
 *   `goto_if_defeated` / `goto_if_not_defeated` / `call_if_defeated` (trainer cond).
 *
 * Variantes trainerbattle (= macros event.inc:730-823) :
 *   trainerbattle TYPE, trainer, localId, ptr1, ptr2, ptr3, ptr4
 *   trainerbattle_single trainer, intro, lose, event_script, music
 *   trainerbattle_double trainer, intro, lose, not_enough_text, event_script, music
 *   trainerbattle_rematch trainer, intro, lose
 *   trainerbattle_rematch_double trainer, intro, lose, not_enough_text
 *   trainerbattle_no_intro trainer, lose_text  → TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT
 */

import type { ScriptContext } from './script-runtime';
import { registerOpcode, SetupNativeScript, ScriptJump, ScriptCall, getScript } from './script-runtime';
import { FlagSet, FlagClear, FlagGet, VarSet, gSpecialVar } from './script-vars';
import { reverseDecompConstant } from '../system/decomp-constants';
import { parseValue } from './script-opcodes-helpers';
// Voie L (suppression voie V) : entrees scripted-wild 1:1 (battle_setup.c). Import
// statique SYNC (setwildbattle doit peupler gEnemyParty AVANT que dowildbattle boote).
// Pas de cycle : battle-setup-helpers -> battle-decomp-loop -> engine/battle/* (PAS engine/script/).
import { CreateScriptedWildMon, BattleSetup_StartScriptedWildBattle, BattleSetup_StartTrainerBattle } from '../battle/battle-setup-helpers';
import { resolveTrainerNumId, ensureGTrainersLoaded } from '../battle/battle-trainer-data-bridge';
import { setTrainerBattleOpponentA, setBattleOutcome, gBattleOutcome } from '../battle/state';

function _stubTrainerBattle(trainerArg: string): void {
  console.log(`[trainerbattle stub fallback] ${trainerArg} — VAR_RESULT=1`);
  gSpecialVar.Result = 1;
  // 1:1 strict (B1) : FlagSet(TRAINER_FLAGS_START + trainerId) aligned avec
  // settrainerflag opcode.
  const trainerId = parseValue(trainerArg);
  FlagSet(1280 + trainerId);
}

/** 1:1 décomp `ScrCmd_trainerbattle` (scrcmd.c:1821-1825) : real trainer battle
 *  via state machine + battle-flow. Reads trainer party from JSON, runs battles
 *  in sequence. Falls back to stub si trainer data n'est pas dispo. */
function _runTrainerBattle(ctx: ScriptContext, trainerArg: string, defeatText?: string): boolean {
  if (!trainerArg) {
    _stubTrainerBattle(trainerArg);
    return false;
  }
  // VOIE L (reflip C5) : route le combat dresseur sur la boucle decomp (CB2_InitBattle -> controllers
  // + gBattleMainFunc), comme le wild. Verifie voie L (harness combat dresseur) : intro + send-out 1:1
  // + VICTOIRE complete + retour OW + inBattle reset (C1-C3 lose_text + getmoneyreward suffisent). Briques
  // T1-T3 : resolveTrainerNumId + ensureGTrainersLoaded (peuple gTrainers numId-keyed + gEnemyParty
  // battle-ready) + BattleSetup_StartTrainerBattle (BATTLE_TYPE_TRAINER + sTrainerADefeatSpeech + boot).
  // ⚠️ DETTE C4 : DEFAITE -> retour OW SANS whiteout (CB2_WhiteOut non porte). PAS de freeze (verifie),
  //    juste pas 1:1 (devrait teleporter au Centre Pokemon + soigner). A porter ensuite.
  const numId = resolveTrainerNumId(trainerArg);
  setBattleOutcome(0);                  // reset l'outcome AVANT le combat (gate du poll de fin)
  setTrainerBattleOpponentA(numId);
  let started = false;
  void ensureGTrainersLoaded().then(() => {
    BattleSetup_StartTrainerBattle(defeatText);
    started = true;
  }).catch(() => { started = true; });
  SetupNativeScript(ctx, () => {
    if (!started) return false;
    // 1:1 : le script BLOQUE jusqu'au retour du combat. On poll l'etat equivalent : combat fini =
    // gMain.inBattle (runtime) false ET gBattleOutcome pose (!=0). inBattle reset par
    // ReturnFromBattleToOverworld (fix verifie) ; gBattleOutcome pose au meme endroit (setSpecialVarResult).
    const inB = (globalThis as { __rt?: { gMain?: { inBattle?: boolean } } }).__rt?.gMain?.inBattle ?? false;
    if (inB || gBattleOutcome === 0) return false;
    // 1:1 SetBattledTrainersFlags : FlagSet(TRAINER_FLAGS_START + numId) si VICTOIRE (B_OUTCOME_WON=1).
    if (gBattleOutcome === 1) FlagSet(1280 + numId);
    return true;   // debloque le script (continue apres le trainerbattle)
  });
  return true;  // block script
}

// ─── Trainerbattle variants ──────────────────────────────────────────────────

// Le label `defeat` (= lose_text = réplique de défaite PERSONNELLE du dresseur,
// affichée sur l'OW après la victoire) est à une position 1:1 selon la macro
// (cf. asm/macros/event.inc). Notre transpileur émet la forme HAUT-NIVEAU
// (vérifié : `trainerbattle_double args:[trainer,intro,defeat,not_enough,event]`).
registerOpcode('trainerbattle', (ctx, args) => {
  // Forme générique `trainerbattle TYPE, trainer, localId, ptr1, ptr2, ...` :
  // ptr2 (=args[4]) = lose_text pour tous les types SAUF SINGLE_NO_INTRO_TEXT
  // où ptr1 (=args[3]) = lose_text.
  const type = args[0] ?? '';
  const defeat = type === 'TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT' ? args[3] : args[4];
  return _runTrainerBattle(ctx, args[1] ?? '', defeat);
});

// trainerbattle_single trainer, intro, lose, ...  → lose = args[2].
registerOpcode('trainerbattle_single', (ctx, args) => {
  return _runTrainerBattle(ctx, args[0] ?? '', args[2]);
});

// trainerbattle_double trainer, intro, lose, not_enough, ...  → lose = args[2].
registerOpcode('trainerbattle_double', (ctx, args) => {
  // Double battles not yet supported — fallback to single.
  return _runTrainerBattle(ctx, args[0] ?? '', args[2]);
});

// trainerbattle_rematch trainer, intro, lose  → lose = args[2].
registerOpcode('trainerbattle_rematch', (ctx, args) => {
  return _runTrainerBattle(ctx, args[0] ?? '', args[2]);
});

// trainerbattle_rematch_double trainer, intro, lose, not_enough  → lose = args[2].
registerOpcode('trainerbattle_rematch_double', (ctx, args) => {
  return _runTrainerBattle(ctx, args[0] ?? '', args[2]);
});

// trainerbattle_no_intro trainer, lose_text  → lose = args[1].
registerOpcode('trainerbattle_no_intro', (ctx, args) => {
  return _runTrainerBattle(ctx, args[0] ?? '', args[1]);
});

// ─── Trainer flags ───────────────────────────────────────────────────────────

// 1:1 décomp `ScrCmd_settrainerflag` (scrcmd.c:1853-1859) :
//   FlagSet(TRAINER_FLAGS_START + ScriptReadHalfword(ctx)).
// 1:1 strict (refactor B1) : FlagSet accepte un numeric id → on peut wire
// directement avec TRAINER_FLAGS_START + parseValue(trainerName).
// constants/flags.h : TRAINER_FLAGS_START = 1280.
registerOpcode('settrainerflag', (_ctx, args) => {
  const trainer = args[0] ?? '';
  const trainerId = parseValue(trainer);
  FlagSet(1280 + trainerId);
  return false;
});

// 1:1 décomp `ScrCmd_cleartrainerflag` (scrcmd.c:1861-1867) :
//   FlagClear(TRAINER_FLAGS_START + ScriptReadHalfword(ctx)).
registerOpcode('cleartrainerflag', (_ctx, args) => {
  const trainer = args[0] ?? '';
  const trainerId = parseValue(trainer);
  FlagClear(1280 + trainerId);
  return false;
});

// 1:1 décomp `ScrCmd_checktrainerflag` (scrcmd.c:1869-1875) :
//   ctx->comparisonResult = FlagGet(TRAINER_FLAGS_START + ScriptReadHalfword(ctx));
//   (= set VAR_RESULT comme le décomp set comparisonResult, qui est read par goto_if).
registerOpcode('checktrainerflag', (_ctx, args) => {
  const trainer = args[0] ?? '';
  const trainerId = parseValue(trainer);
  const has = FlagGet(1280 + trainerId);
  VarSet('VAR_RESULT', has ? 1 : 0);
  return false;
});

// Helper 1:1 strict : check trainer defeated via FlagGet(TRAINER_FLAGS_START + id).
// constants/flags.h : TRAINER_FLAGS_START = 1280. Aligned avec settrainerflag/
// cleartrainerflag/checktrainerflag (= refactor B1 numeric IDs).
function _isTrainerDefeated(trainerArg: string): boolean {
  const trainerId = parseValue(trainerArg);
  return FlagGet(1280 + trainerId);
}

// 1:1 décomp `ScrCmd_goto_if_not_defeated` (= macro event.inc) :
//   branch if trainer NOT defeated. Used 10x in early-game scripts.
registerOpcode('goto_if_not_defeated', (ctx, args) => {
  const trainer = args[0] ?? '';
  const target = args[1] ?? '';
  if (!_isTrainerDefeated(trainer)) {
    const sub = getScript(target);
    if (sub) ScriptJump(ctx, sub);
  }
  return false;
});

// 1:1 décomp `ScrCmd_call_if_defeated`. 7x usage.
registerOpcode('call_if_defeated', (ctx, args) => {
  const trainer = args[0] ?? '';
  const target = args[1] ?? '';
  if (_isTrainerDefeated(trainer)) {
    const sub = getScript(target);
    if (sub) ScriptCall(ctx, sub);
  }
  return false;
});

// 1:1 décomp `ScrCmd_goto_if_defeated`. Inverse de goto_if_not_defeated. 16x.
registerOpcode('goto_if_defeated', (ctx, args) => {
  const trainer = args[0] ?? '';
  const target = args[1] ?? '';
  if (_isTrainerDefeated(trainer)) {
    const sub = getScript(target);
    if (sub) ScriptJump(ctx, sub);
  }
  return false;
});

// ─── Wild battles (1:1 décomp ScrCmd_setwildbattle/dowildbattle) ────────────

// `setwildbattle` / `dowildbattle` early stubs (= last-wins overwrites).
registerOpcode('setwildbattle', (_ctx, _args) => false);
registerOpcode('dowildbattle', (_ctx, _args) => false);

/** 1:1 décomp `ScrCmd_setwildbattle` (scrcmd.c:1869-1877) :
 *    CreateScriptedWildMon(species, level, item). */
registerOpcode('setwildbattle', (_ctx, args) => {
  // 1:1 décomp ScrCmd_setwildbattle (scrcmd.c:1869-1877) : CreateScriptedWildMon(species, level, item).
  // Voie L : peuple gEnemyParty[0] avec un mon PLEIN (createPokemonInstance) — remplace le
  // stub global gScriptedWildMon de la voie V (suppression voie V).
  const speciesId = parseValue(args[0] ?? '');
  const level = parseValue(args[1] ?? '5');
  const itemId = parseValue(args[2] ?? 'ITEM_NONE');
  CreateScriptedWildMon(speciesId, level, itemId);
  return false;
});

/** 1:1 décomp `ScrCmd_dowildbattle` (scrcmd.c:1879-1884) :
 *    BattleSetup_StartScriptedWildBattle + ScriptContext_Stop. */
registerOpcode('dowildbattle', (ctx, _args) => {
  // 1:1 décomp ScrCmd_dowildbattle (scrcmd.c:1879-1884) :
  //   BattleSetup_StartScriptedWildBattle(); ScriptContext_Stop(); return TRUE;
  // Voie L : gEnemyParty[0] deja pose par setwildbattle -> CreateScriptedWildMon ;
  // BattleSetup_StartScriptedWildBattle pose flags=0 + boote la VRAIE boucle decomp
  // (CB2_InitBattle), remplace l'ad-hoc voie V startWildBattle (suppression voie V).
  BattleSetup_StartScriptedWildBattle();
  // ScriptContext_Stop() : le swap CB2 (boucle combat) prend la main pendant le combat ;
  // au retour OW (CB2_EndScriptedWildBattle -> ReturnToFieldContinueScript), le poll
  // reprend le script. (A/B : confirmer la reprise du script apres un dowildbattle.)
  let framesWaited = 0;
  const poll = (): boolean => {
    framesWaited++;
    return framesWaited >= 1;
  };
  SetupNativeScript(ctx, poll);
  return true;
});

// ─── Trainer battle internal opcodes ────────────────────────────────────────

/** 1:1 décomp ScrCmd_dotrainerbattle : ConfigureAndSetUpOneTrainerBattle.
 *  Internal — pas appelé directement par les scripts user. No-op safe. */
registerOpcode('dotrainerbattle', (_ctx, _args) => false);

/** 1:1 décomp : jump to BattleScript_PostBattle. Internal. */
registerOpcode('gotopostbattlescript', (_ctx, _args) => false);

/** 1:1 décomp : jump to BattleScript_TrainerDefeated. Internal. */
registerOpcode('gotobeatenscript', (_ctx, _args) => false);
