/**
 * scrcmd_door.ts — logique partagée des opcodes « porte » (byte-VM voie A).
 *
 * Les fns de porte (field_door.ts) sont ASYNC dans notre port (anim pilotée par
 * une task) alors que la décomp est synchrone (démarre la task + `waitdooranim`
 * poll `IsDoorAnimationStopped`). Adaptation : on pose un flag `_doorAnimActive`
 * autour de l'await, et `waitdooranim` poll `isDoorAnimationStopped()`. Extrait
 * ici pour que LE MOTEUR PARSÉ ET LE BYTE-VM appellent la même logique (zéro
 * divergence).
 *
 * ⚠️ coords : field_door prend des coords map-relative SANS MAP_OFFSET (il l'ajoute
 * en interne). La décomp ajoute MAP_OFFSET avant l'appel → ici on passe les coords
 * brutes (VarGet), l'offset est absorbé par field_door.
 *
 * 1:1 décomp scrcmd.c:2050-2108 (opendoor/closedoor/waitdooranim/setdooropen/setdoorclosed).
 */
import {
  GetDoorSoundEffect, FieldAnimateDoorOpen, FieldAnimateDoorClose,
  FieldSetDoorOpened, FieldSetDoorClosed,
} from './field_door';
import { PlaySE } from '../harness/runtime/decomp-globals';

let _doorAnimActive = false;
/** 1:1 décomp `IsDoorAnimationStopped` : true quand aucune anim de porte n'est en cours. */
export function isDoorAnimationStopped(): boolean { return !_doorAnimActive; }

/** 1:1 décomp `ScrCmd_opendoor` : PlaySE(GetDoorSoundEffect) + FieldAnimateDoorOpen. */
export function doOpenDoor(x: number, y: number): void {
  void (async () => {
    try {
      PlaySE(GetDoorSoundEffect(x, y));
      _doorAnimActive = true;
      await FieldAnimateDoorOpen(x, y);
    } catch (e) { console.warn('[opendoor] échec', e); }
    finally { _doorAnimActive = false; }
  })();
}

/** 1:1 décomp `ScrCmd_closedoor` : FieldAnimateDoorClose. */
export function doCloseDoor(x: number, y: number): void {
  void (async () => {
    try { _doorAnimActive = true; await FieldAnimateDoorClose(x, y); }
    catch (e) { console.warn('[closedoor] échec', e); }
    finally { _doorAnimActive = false; }
  })();
}

/** 1:1 décomp `ScrCmd_setdooropen` : FieldSetDoorOpened (dessin instantané, sans SE). */
export function doSetDoorOpen(x: number, y: number): void {
  void (async () => {
    try { await FieldSetDoorOpened(x, y); } catch (e) { console.warn('[setdooropen] échec', e); }
  })();
}

/** 1:1 décomp `ScrCmd_setdoorclosed` : FieldSetDoorClosed (dessin instantané, sync). */
export function doSetDoorClosed(x: number, y: number): void {
  try { FieldSetDoorClosed(x, y); } catch (e) { console.warn('[setdoorclosed] échec', e); }
}
