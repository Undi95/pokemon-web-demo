/**
 * script-opcodes-fieldeffect.ts — opcodes field effect 1:1 décomp `field_effect.c`.
 *
 * Source de vérité :
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1973-1980` :
 *     `ScrCmd_dofieldeffect`        : sFieldEffectScriptId = VarGet(effectId); FieldEffectStart.
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1982-1996` :
 *     `ScrCmd_setfieldeffectargument` : gFieldEffectArguments[argNum] = (s16)VarGet(value).
 *   `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1998-2003` :
 *     `ScrCmd_waitfieldeffect`      : SetupNativeScript(WaitForFieldEffectFinish).
 *
 * Plus la macro `dofieldeffectsparkle x, y, priority` (event.inc:1974) qui
 * expand à setfieldeffectargument×3 + dofieldeffect FLDEFF_SPARKLE.
 *
 * Module-level state : `sFieldEffectScriptId` (scrcmd.c:50) + `gFieldEffect
 * Arguments[8]` (field_effect.c).
 */

import { registerOpcode, getOpcodeHandler, SetupNativeScript } from './script-runtime';
import { VarGet } from './script-vars';
import { parseValue } from './script-opcodes-helpers';

/** 1:1 décomp `sFieldEffectScriptId` (scrcmd.c:50). Set par `waitfieldeffect`. */
let _sFieldEffectScriptId = 0;

/** 1:1 décomp `gFieldEffectArguments[8]` (field_effect.c). Buffer s16 utilisé
 *  pour passer params aux field effects. Set par `setfieldeffectargument`
 *  opcode + utilisé par `dofieldeffect`. */
// ⚠️ MÊME array partagé que game/field_effect.ts (adopt-or-create via globalThis). Sinon le slot
// posé ici par `setfieldeffectargument`/`dofieldeffectsparkle` n'atteint pas les FldEff_* qui
// importent gFieldEffectArguments de field_effect.ts (bug surf freeze : tMonId=255 → gPlayerParty[255]
// undefined). Pas d'import statique (moteur script → game/) = pas de cycle ESM ; le 1er chargé crée.
const _gFieldEffectArguments: number[] =
  ((globalThis as Record<string, unknown>).gFieldEffectArguments as number[] | undefined) ?? new Array(8).fill(0);
(globalThis as Record<string, unknown>).gFieldEffectArguments = _gFieldEffectArguments;

/** _vget = VarGet avec fallback '0'. Local au fichier (= 1:1 décomp inline read). */
function _vget(arg: string | undefined): number {
  return VarGet(arg ?? '0');
}

// 1:1 décomp `ScrCmd_dofieldeffect` (scrcmd.c:1973-1980) :
//   sFieldEffectScriptId = VarGet(effectId);
//   ScriptContext_Stop();
//   FieldEffectStart(effectId);
//
// Audit session 126 LOT C3 : avant strict no-op → Cut/Surf/Fly/Strength/
// Rock Smash all broken. Maintenant on dispatch via FieldEffectStart depuis
// l'auto-file (= field_effect-all-auto.ts).
registerOpcode('dofieldeffect', (_ctx, args) => {
  const effectId = VarGet(args[0] ?? '0');
  // Session 132 : track active list pour waitfieldeffect consumer.
  // 1:1 décomp `FieldEffectStart(id)` ajoute id à gFieldEffectActiveList.
  const fa = (globalThis as { __fieldEffectActiveList?: { FieldEffectActiveListAdd?: (id: number) => void } }).__fieldEffectActiveList;
  fa?.FieldEffectActiveListAdd?.(effectId);
  const fieldEffectStart = (globalThis as Record<string, unknown>).FieldEffectStart as
    ((id: number) => unknown) | undefined;
  if (typeof fieldEffectStart === 'function') {
    try {
      fieldEffectStart(effectId);
      console.log(`[opcode dofieldeffect] FLDEFF id=${effectId} dispatched`);
    } catch (e) {
      console.warn(`[opcode dofieldeffect] FLDEFF id=${effectId} threw:`, e);
    }
  } else {
    console.warn(`[opcode dofieldeffect] FieldEffectStart not exposed — FLDEFF id=${effectId} skipped (Cut/Surf/Fly/etc broken until wired)`);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_setfieldeffectargument` (scrcmd.c:1982-1996) :
 *    gFieldEffectArguments[argNum] = (s16)VarGet(value). */
registerOpcode('setfieldeffectargument', (_ctx, args) => {
  const argNum = parseValue(args[0] ?? '0');
  const value = _vget(args[1]);
  if (argNum >= 0 && argNum < 8) {
    // s16 cast (sign extension du 16-bit)
    let v = value & 0xFFFF;
    if (v & 0x8000) v -= 0x10000;
    _gFieldEffectArguments[argNum] = v;
  }
  // Expose pour le rendering field-effect.
  (globalThis as Record<string, unknown>).gFieldEffectArguments = _gFieldEffectArguments;
  return false;
});

/** 1:1 décomp `ScrCmd_waitfieldeffect` (scrcmd.c:1998-2003) :
 *    sFieldEffectScriptId = VarGet(arg);
 *    SetupNativeScript(ctx, WaitForFieldEffectFinish) ; return TRUE.
 *  WaitForFieldEffectFinish : return !FieldEffectActiveListContains(sFieldEffectScriptId).
 *  Session 132 : real tracking via field-effect-active-list.ts. */
registerOpcode('waitfieldeffect', (ctx, args) => {
  _sFieldEffectScriptId = _vget(args[0]);
  const poll = (): boolean => {
    const fa = (globalThis as { __fieldEffectActiveList?: { FieldEffectActiveListContains?: (id: number) => boolean } }).__fieldEffectActiveList;
    return !(fa?.FieldEffectActiveListContains?.(_sFieldEffectScriptId) ?? false);
  };
  SetupNativeScript(ctx, poll);
  return true;
});

/** 1:1 décomp macro `dofieldeffectsparkle x, y, priority` (event.inc:1974) :
 *    setfieldeffectargument 0, x ; setfieldeffectargument 1, y ;
 *    setfieldeffectargument 2, priority ; dofieldeffect FLDEFF_SPARKLE.
 *  Session 132 : trigger active list add pour tracking via waitfieldeffect. */
registerOpcode('dofieldeffectsparkle', (ctx, args) => {
  const x = _vget(args[0]);
  const y = _vget(args[1]);
  const priority = _vget(args[2]);
  _gFieldEffectArguments[0] = x;
  _gFieldEffectArguments[1] = y;
  _gFieldEffectArguments[2] = priority;
  (globalThis as Record<string, unknown>).gFieldEffectArguments = _gFieldEffectArguments;
  // FLDEFF_SPARKLE = 36 (= 1:1 décomp include/constants/field_effects.h).
  const FLDEFF_SPARKLE = 36;
  const fa = (globalThis as {
    __fieldEffectActiveList?: {
      FieldEffectActiveListAdd?: (id: number) => void;
      FieldEffectActiveListRemove?: (id: number) => void;
    };
  }).__fieldEffectActiveList;
  fa?.FieldEffectActiveListAdd?.(FLDEFF_SPARKLE);
  // Dette R3 : sprite callback `FldEff_Sparkle` (= field_effect_helpers.c) pas
  // encore porté. Le décomp wire la sprite anim auto-remove via FieldEffectStop
  // → FieldEffectActiveListRemove à fin d'anim. En attendant, scheduler local
  // setTimeout 500ms (~30 frames) pour matcher la durée visuelle attendue.
  setTimeout(() => fa?.FieldEffectActiveListRemove?.(FLDEFF_SPARKLE), 500);
  return getOpcodeHandler('dofieldeffect')?.(ctx, ['36']) ?? false;
});
