/**
 * script-opcodes-door.ts — opcodes door 1:1 décomp `field_door.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:2050-2108` :
 *   `ScrCmd_opendoor`     : PlaySE(GetDoorSoundEffect(x,y)); FieldAnimateDoorOpen(x,y).
 *   `ScrCmd_closedoor`    : FieldAnimateDoorClose(x,y).
 *   `ScrCmd_waitdooranim` : SetupNativeScript(IsDoorAnimationStopped).
 *   `ScrCmd_setdooropen`  : FieldSetDoorOpened(x,y) — instant, no SE.
 *   `ScrCmd_setdoorclosed`: FieldSetDoorClosed(x,y) — instant, no SE.
 *
 * Aliases historiques `setdoor_opened`/`setdoor_closed` (= mêmes opcodes via
 * naming variant côté scripts JSON).
 */

import { registerOpcode, getOpcodeHandler, SetupNativeScript } from './script-runtime';
import { PlaySE } from '../system/decomp-globals';
import { parseValue } from './script-opcodes-helpers';

/** 1:1 décomp `sDoorAnimActive` (field_door.c interne, exposé via
 *  `IsDoorAnimationStopped`). True quand FieldAnimateDoorOpen/Close en cours. */
let _doorAnimActive = false;

// 1:1 décomp ScrCmd_opendoor (scrcmd.c:2050-2061) :
//   x = VarGet(ScriptReadHalfword(ctx));
//   y = VarGet(ScriptReadHalfword(ctx));
//   PlaySE(GetDoorSoundEffect(x, y));
//   FieldAnimateDoorOpen(x, y);   ← starts anim (= 16 frames)
//   return FALSE;  (= continue script immédiatement)
//
// `waitdooranim` ensuite halt le script jusqu'à anim fin via SetupNativeScript
// + IsDoorAnimationStopped (= `_doorAnimActive` polled).
registerOpcode('opendoor', (_ctx, args) => {
  const x = parseValue(args[0]);
  const y = parseValue(args[1]);
  void (async () => {
    try {
      const fdoor = await import('../field/field-door');
      const seId = fdoor.GetDoorSoundEffect(x, y);
      PlaySE(seId);
      _doorAnimActive = true;
      await fdoor.FieldAnimateDoorOpen(x, y);
      _doorAnimActive = false;
    } catch (e) {
      console.warn('[opcode opendoor] failed', e);
      _doorAnimActive = false;
    }
  })();
  return false;
});

// 1:1 décomp ScrCmd_closedoor (scrcmd.c:2062-2080) :
//   x = VarGet(ScriptReadHalfword(ctx));
//   y = VarGet(ScriptReadHalfword(ctx));
//   FieldAnimateDoorClose(x, y);
registerOpcode('closedoor', (_ctx, args) => {
  const x = parseValue(args[0]);
  const y = parseValue(args[1]);
  void (async () => {
    try {
      const fdoor = await import('../field/field-door');
      _doorAnimActive = true;
      await fdoor.FieldAnimateDoorClose(x, y);
      _doorAnimActive = false;
    } catch (e) {
      console.warn('[opcode closedoor] failed', e);
      _doorAnimActive = false;
    }
  })();
  return false;
});

// 1:1 décomp ScrCmd_waitdooranim (scrcmd.c:2081-2085) :
//   SetupNativeScript(IsDoorAnimationStopped).
// On poll _doorAnimActive jusqu'à false (= anim terminée). Si aucune anim
// n'a été démarrée par opendoor/closedoor (= behavior pas MB_ANIMATED_DOOR
// donc no-op), _doorAnimActive reste false → continue immédiatement.
registerOpcode('waitdooranim', (ctx) => {
  const tick = (): boolean => !_doorAnimActive;
  SetupNativeScript(ctx, tick);
  return true;
});

// 1:1 décomp ScrCmd_setdooropen (scrcmd.c:2087-2096) :
//   FieldSetDoorOpened(x, y) = instant draw open frame, no SE.
registerOpcode('setdooropen', (_ctx, args) => {
  const x = parseValue(args[0]);
  const y = parseValue(args[1]);
  void (async () => {
    try {
      const fdoor = await import('../field/field-door');
      await fdoor.FieldSetDoorOpened(x, y);
    } catch (e) { console.warn('[opcode setdooropen] failed', e); }
  })();
  return false;
});

// 1:1 décomp ScrCmd_setdoorclosed (scrcmd.c:2098-2108) :
//   FieldSetDoorClosed(x, y) = instant draw closed frame, no SE.
//   À porter 1:1 strict (= identique à setdooropen mais avec close frame).
registerOpcode('setdoorclosed', (_ctx, _args) => false);

// 1:1 décomp aliases naming variants — setdoor_opened/setdoor_closed sont des
// mêmes opcodes (= snake_case avec underscore) que setdooropen/setdoorclosed
// (= naming JSON extracteur).
registerOpcode('setdoor_opened', (ctx, args) => getOpcodeHandler('setdooropen')?.(ctx, args) ?? false);
registerOpcode('setdoor_closed', (ctx, args) => getOpcodeHandler('setdoorclosed')?.(ctx, args) ?? false);
