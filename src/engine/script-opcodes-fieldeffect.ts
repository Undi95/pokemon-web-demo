/**
 * script-opcodes-fieldeffect.ts — opcode `dofieldeffect` 1:1 décomp `field_effect.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:1973-1980` :
 *   `ScrCmd_dofieldeffect` : sFieldEffectScriptId = VarGet(effectId); FieldEffectStart.
 *
 * Les opcodes `setfieldeffectargument`, `waitfieldeffect`, `dofieldeffectsparkle`
 * restent dans `script-opcodes.ts` parce qu'ils partagent `_vget` + `_gField
 * EffectArguments` avec d'autres sections. À extraire dans une session ultérieure
 * quand le module-level state aura été refactoré.
 */

import { registerOpcode } from './script-runtime';
import { VarGet } from './script-vars';

// 1:1 décomp `ScrCmd_dofieldeffect` (scrcmd.c) :
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
