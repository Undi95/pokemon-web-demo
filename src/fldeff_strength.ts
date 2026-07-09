/**
 * fldeff_strength.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/fldeff_strength.c`.
 *
 * Chaîne FORCE (HM04) : party menu FORCE → SetUpFieldMove_Strength (party_menu.ts,
 * pattern Surf/Flash local) → gPostMenuFieldCallback = FieldCallback_Strength →
 * ScriptContext_SetupScript(EventScript_UseStrength) → `dofieldeffect
 * FLDEFF_USE_STRENGTH` → FldEff_UseStrength → task → waitstate signalé →
 * EventScript_ActivateStrength (setflag FLAG_SYS_USE_STRENGTH + « {STR_VAR_1}
 * utilise FORCE! »). La POUSSÉE du rocher est déjà portée (TryPushBoulder,
 * field_player_avatar.ts:1091).
 */

import { CreateFieldMoveTask } from './field_effect_helpers';
import { FieldEffectActiveListRemove } from './field_effect';
import { ScriptContext_Enable, ScriptContext_SetupScript } from './script';
import { GetMonData, gPlayerParty } from './pokemon';
import { MON_DATA_NICKNAME } from '../include/pokemon';
import { StringCopy, gStringVar1 } from './string_util';
import { encodeOwText } from './text';
import { setStringVar } from '../include/text';

/** 1:1 décomp `FLDEFF_USE_STRENGTH = 40` (include/constants/field_effects.h:44). */
const FLDEFF_USE_STRENGTH = 40;

/** 1:1 décomp `static void FieldCallback_Strength(void)` (fldeff_strength.c:30-34).
 *  gFieldEffectArguments[0] = slot du mon (posé sur globalThis, lu par
 *  FldEff_UseStrength). Exposé `__FieldCallback_Strength` (pattern Flash,
 *  anti-cycle ESM party_menu ⇄ fldeff). */
export function FieldCallback_Strength(): void {
  const g = globalThis as Record<string, unknown>;
  const args = (g.gFieldEffectArguments ?? (g.gFieldEffectArguments = [0, 0, 0, 0, 0, 0, 0, 0])) as number[];
  args[0] = ((g.__GetCursorSelectionMonId as (() => number) | undefined)?.() ?? 0);
  ScriptContext_SetupScript('EventScript_UseStrength');
}

/** 1:1 décomp `static void StartStrengthFieldEffect(void)` (fldeff_strength.c:45-49).
 *  « Just passes control back to EventScript_UseStrength ». SignalWaitState =
 *  pattern port (waitstate native-poll, cf. fldeff_rocksmash.ts). */
function StartStrengthFieldEffect(): void {
  FieldEffectActiveListRemove(FLDEFF_USE_STRENGTH);
  ScriptContext_Enable();
  void import('./scrcmd').then(m => m.SignalWaitState());
}

/** 1:1 décomp `bool8 FldEff_UseStrength(void)` (fldeff_strength.c:36-43) :
 *    taskId = CreateFieldMoveTask(); gTasks[taskId].data[8/9] = StartStrengthFieldEffect;
 *    GetMonNickname(&gPlayerParty[gFieldEffectArguments[0]], gStringVar1);
 *  GetMonNickname = GetMonData(NICKNAME)+StringGet_Nickname — frontière charmap. */
export function FldEff_UseStrength(): number {
  CreateFieldMoveTask(StartStrengthFieldEffect);
  const args = (globalThis as Record<string, unknown>).gFieldEffectArguments as number[] | undefined;
  const mon = gPlayerParty[args?.[0] ?? 0];
  if (mon) {
    const nick = GetMonData(mon, MON_DATA_NICKNAME) as string;
    StringCopy(gStringVar1, encodeOwText(nick));
    // Canal byte-VM : la msgbox du script résout {STR_VAR_1} via setStringVar
    // (deux systèmes de string vars — le décomp n'a que gStringVar1).
    setStringVar(1, nick);
  }
  return 0; // FALSE
}

// Pont globalThis (pattern __FieldCallback_Flash) pour party_menu.SetUpFieldMove_Strength.
(globalThis as Record<string, unknown>).__FieldCallback_Strength = FieldCallback_Strength;
