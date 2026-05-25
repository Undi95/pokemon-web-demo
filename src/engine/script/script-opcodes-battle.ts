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
import { reverseDecompConstant } from '../decomp-constants';
import { parseValue } from './script-opcodes-helpers';

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
function _runTrainerBattle(ctx: ScriptContext, trainerArg: string): boolean {
  if (!trainerArg) {
    _stubTrainerBattle(trainerArg);
    return false;
  }
  // Dynamic import : avoid circular deps at load.
  let flowReady = false;
  let flow: { tick: () => boolean } | null = null;
  void import('../trainer-battle-flow').then((mod) => {
    flow = mod.startTrainerBattle(trainerArg);
    flowReady = true;
  }).catch(() => {
    // Fallback to stub if import fails.
    _stubTrainerBattle(trainerArg);
    flowReady = true;
    flow = { tick: () => true };
  });
  SetupNativeScript(ctx, () => {
    if (!flowReady) return false;
    return flow!.tick();
  });
  return true;  // block script
}

// ─── Trainerbattle variants ──────────────────────────────────────────────────

registerOpcode('trainerbattle', (ctx, args) => {
  // args = [type, trainer, localId, ptr1, ...]
  return _runTrainerBattle(ctx, args[1] ?? '');
});

registerOpcode('trainerbattle_single', (ctx, args) => {
  return _runTrainerBattle(ctx, args[0] ?? '');
});

registerOpcode('trainerbattle_double', (ctx, args) => {
  // Double battles not yet supported — fallback to single.
  return _runTrainerBattle(ctx, args[0] ?? '');
});

registerOpcode('trainerbattle_rematch', (ctx, args) => {
  return _runTrainerBattle(ctx, args[0] ?? '');
});

registerOpcode('trainerbattle_rematch_double', (ctx, args) => {
  return _runTrainerBattle(ctx, args[0] ?? '');
});

registerOpcode('trainerbattle_no_intro', (ctx, args) => {
  return _runTrainerBattle(ctx, args[0] ?? '');
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
  const speciesArg = args[0] ?? '';
  const level = parseValue(args[1] ?? '5');
  const itemArg = args[2] ?? 'ITEM_NONE';
  const speciesId = parseValue(speciesArg);
  const itemId = parseValue(itemArg);
  (globalThis as Record<string, unknown>).gScriptedWildMon = {
    species: speciesId,
    level,
    item: itemId,
  };
  return false;
});

/** 1:1 décomp `ScrCmd_dowildbattle` (scrcmd.c:1879-1884) :
 *    BattleSetup_StartScriptedWildBattle + ScriptContext_Stop. */
registerOpcode('dowildbattle', (ctx, _args) => {
  void (async () => {
    try {
      const mon = (globalThis as Record<string, unknown>).gScriptedWildMon as
        { species?: number; level?: number; item?: number } | undefined;
      if (mon) {
        const { startWildBattle } = await import('../battle-flow').catch(() => ({ startWildBattle: undefined }));
        if (typeof startWildBattle === 'function') {
          const enumName = reverseDecompConstant(mon.species ?? 0, 'SPECIES_') ?? `SPECIES_${mon.species ?? 0}`;
          startWildBattle({
            opponentSpecies: enumName,
            opponentLevel: mon.level ?? 5,
          });
        } else {
          console.warn('[opcode dowildbattle] battle-flow.startWildBattle not exposed yet');
        }
      }
    } catch (e) {
      console.warn('[opcode dowildbattle] failed:', e);
    }
  })();
  // SetupNativeScript wait — battle screen takes over until done.
  let framesWaited = 0;
  const poll = (): boolean => {
    framesWaited++;
    return framesWaited >= 1;  // resume immediately (battle scene is async)
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
