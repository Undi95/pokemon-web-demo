/**
 * scrcmd_fieldeffect.ts — logique partagée des opcodes « field effect » (voie A).
 *
 * Appelée par LE MOTEUR PARSÉ ET LE BYTE-VM (source unique). L'état traverse la
 * frontière moteur-script → game/ via globalThis (anti-cycle ESM, comme l'a établi
 * le moteur parsé) :
 *   - `gFieldEffectArguments[8]` : buffer s16 partagé (adopt-or-create via globalThis ;
 *     sinon le slot posé ici n'atteint pas les FldEff_* de field_effect.ts → bug
 *     surf freeze tMonId=255). cf. mémoire gFieldEffectArguments désync→globalThis.
 *   - `FieldEffectStart(id)` : exposée sur globalThis par game/field_effect.
 * `sFieldEffectScriptId` est module-local (1:1 scrcmd.c:50, écrit par dofieldeffect
 * ET waitfieldeffect). `FieldEffectActiveListContains` = vrai module (pas de cycle).
 *
 * 1:1 décomp scrcmd.c:1973-2003 (dofieldeffect/setfieldeffectargument/waitfieldeffect).
 */
import { FieldEffectActiveListContains } from './engine/field/field-effect-active-list';

/** 1:1 décomp `sFieldEffectScriptId` (scrcmd.c:50). */
let _sFieldEffectScriptId = 0;

/** Buffer `gFieldEffectArguments[8]` partagé (adopt-or-create via globalThis). */
function fieldEffectArgs(): number[] {
  const g = globalThis as Record<string, unknown>;
  let a = g.gFieldEffectArguments as number[] | undefined;
  if (!a) { a = new Array(8).fill(0); g.gFieldEffectArguments = a; }
  return a;
}

/** 1:1 décomp `ScrCmd_dofieldeffect` : sFieldEffectScriptId=effectId ; FieldEffectStart. */
export function doFieldEffect(effectId: number): void {
  _sFieldEffectScriptId = effectId;
  const start = (globalThis as Record<string, unknown>).FieldEffectStart as ((id: number) => unknown) | undefined;
  if (typeof start === 'function') {
    try { start(effectId); } catch (e) { console.warn(`[dofieldeffect] FLDEFF id=${effectId} a levé`, e); }
  } else {
    console.warn(`[dofieldeffect] FieldEffectStart non exposé — FLDEFF id=${effectId} ignoré`);
  }
}

/** 1:1 décomp `ScrCmd_setfieldeffectargument` : gFieldEffectArguments[argNum]=(s16)value. */
export function setFieldEffectArgument(argNum: number, value: number): void {
  if (argNum < 0 || argNum >= 8) return;
  let v = value & 0xFFFF;
  if (v & 0x8000) v -= 0x10000;   // cast (s16) — sign-extension 16 bits
  fieldEffectArgs()[argNum] = v;
}

/** 1:1 décomp `ScrCmd_waitfieldeffect` : pose sFieldEffectScriptId et renvoie le poll
 *  `WaitForFieldEffectFinish` = !FieldEffectActiveListContains(sFieldEffectScriptId). */
export function setWaitFieldEffect(effectId: number): () => boolean {
  _sFieldEffectScriptId = effectId;
  return () => !FieldEffectActiveListContains(_sFieldEffectScriptId);
}
