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
import { reverseDecompConstant } from '../../../harness/runtime/decomp-constants';
import { parseValue } from './script-opcodes-helpers';
// Voie L (suppression voie V) : entrees scripted-wild 1:1 (battle_setup.c). Import
// statique SYNC (setwildbattle doit peupler gEnemyParty AVANT que dowildbattle boote).
// Pas de cycle : battle-setup-helpers -> battle-decomp-loop -> engine/battle/* (PAS engine/script/).
import { CreateScriptedWildMon, BattleSetup_StartScriptedWildBattle } from '../battle/battle-setup-helpers';
// Flux dresseur 1:1 (port miroir battle_setup.c) : Configure (tables
// TrainerBattleParameter) + jump EventScript_* + dotrainerbattle/post-battle.
// Remplace l'ancien net-effect local _runTrainerBattle (2026-06-12).
import {
  ScrCmd_trainerbattle, ScrCmd_dotrainerbattle,
  ScrCmd_gotopostbattlescript, ScrCmd_gotobeatenscript,
} from '../../battle_setup';

// ─── Trainerbattle variants — flux 1:1 BattleSetup_ConfigureTrainerBattle ────
// (port miroir game/battle_setup.ts, remplace l'ancien net-effect _runTrainerBattle.)
// Chaque macro haut-niveau (asm/macros/event.inc:730-823) est RE-DÉPLIÉE vers la
// forme générique `[mode, trainer, localId, ptr…]` que ConfigureTrainerBattle
// parse via les MÊMES tables TrainerBattleParameter que la ROM, puis JUMP vers
// le EventScript_* de trainer_battle.inc (transpilé) — intro speech, musique,
// flag déjà-battu, dotrainerbattle, lose_text et post-battle script suivent le
// script 1:1.

registerOpcode('trainerbattle', (ctx, args) => {
  // Forme générique déjà dépliée : [TYPE, trainer, localId, ptr1, ptr2, …].
  return ScrCmd_trainerbattle(ctx, args);
});

// trainerbattle_single trainer, intro, lose [, event_script [, music]]
// (event.inc : sans event_script → SINGLE ; avec → CONTINUE_SCRIPT(_NO_MUSIC)).
registerOpcode('trainerbattle_single', (ctx, args) => {
  const [trainer, intro, lose, eventScript, music] = args;
  if (eventScript && eventScript !== '0') {
    const mode = music === 'NO_MUSIC' ? 'TRAINER_BATTLE_CONTINUE_SCRIPT_NO_MUSIC' : 'TRAINER_BATTLE_CONTINUE_SCRIPT';
    return ScrCmd_trainerbattle(ctx, [String(mode === 'TRAINER_BATTLE_CONTINUE_SCRIPT' ? 2 : 1), trainer ?? '0', '0', intro ?? '0', lose ?? '0', eventScript]);
  }
  return ScrCmd_trainerbattle(ctx, ['0' /* TRAINER_BATTLE_SINGLE */, trainer ?? '0', '0', intro ?? '0', lose ?? '0']);
});

// trainerbattle_double trainer, intro, lose, not_enough [, event_script [, music]]
registerOpcode('trainerbattle_double', (ctx, args) => {
  const [trainer, intro, lose, notEnough, eventScript, music] = args;
  if (eventScript && eventScript !== '0') {
    const modeVal = music === 'NO_MUSIC' ? 8 /* CONTINUE_SCRIPT_DOUBLE_NO_MUSIC */ : 6 /* CONTINUE_SCRIPT_DOUBLE */;
    return ScrCmd_trainerbattle(ctx, [String(modeVal), trainer ?? '0', '0', intro ?? '0', lose ?? '0', notEnough ?? '0', eventScript]);
  }
  return ScrCmd_trainerbattle(ctx, ['4' /* TRAINER_BATTLE_DOUBLE */, trainer ?? '0', '0', intro ?? '0', lose ?? '0', notEnough ?? '0']);
});

// trainerbattle_rematch trainer, intro, lose
registerOpcode('trainerbattle_rematch', (ctx, args) => {
  return ScrCmd_trainerbattle(ctx, ['5' /* TRAINER_BATTLE_REMATCH */, args[0] ?? '0', '0', args[1] ?? '0', args[2] ?? '0']);
});

// trainerbattle_rematch_double trainer, intro, lose, not_enough
registerOpcode('trainerbattle_rematch_double', (ctx, args) => {
  return ScrCmd_trainerbattle(ctx, ['7' /* TRAINER_BATTLE_REMATCH_DOUBLE */, args[0] ?? '0', '0', args[1] ?? '0', args[2] ?? '0', args[3] ?? '0']);
});

// trainerbattle_no_intro trainer, lose_text
registerOpcode('trainerbattle_no_intro', (ctx, args) => {
  return ScrCmd_trainerbattle(ctx, ['3' /* TRAINER_BATTLE_SINGLE_NO_INTRO_TEXT */, args[0] ?? '0', '0', args[1] ?? '0']);
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

// ─── Trainer battle internal opcodes (1:1 scrcmd.c:1827-1843, port miroir
//     game/battle_setup.ts — remplacent les anciens stubs no-op) ─────────────

/** 1:1 décomp `ScrCmd_dotrainerbattle` (scrcmd.c:1827) : DoTrainerBattle +
 *  ScriptContext_Stop (poll de fin + CB2_EndTrainerBattle flags). */
registerOpcode('dotrainerbattle', (ctx, _args) => ScrCmd_dotrainerbattle(ctx));

/** 1:1 décomp `ScrCmd_gotopostbattlescript` (scrcmd.c:1833) :
 *  jump BattleSetup_GetTrainerPostBattleScript(). */
registerOpcode('gotopostbattlescript', (ctx, _args) => ScrCmd_gotopostbattlescript(ctx));

/** 1:1 décomp `ScrCmd_gotobeatenscript` (scrcmd.c:1839) :
 *  jump BattleSetup_GetScriptAddrAfterBattle() (= reprise du script de map). */
registerOpcode('gotobeatenscript', (ctx, _args) => ScrCmd_gotobeatenscript(ctx));
