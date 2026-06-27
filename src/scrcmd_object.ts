/**
 * scrcmd_object.ts — logique partagée des opcodes object-event (byte-VM voie A).
 *
 * Les handlers object-event du jeu sont adaptés au web (localIds résolus via
 * findNpcByLocalId/resolveObjectLocalIdRaw, position sprite/caméra, unification
 * position-joueur). Pour éviter de DUPLIQUER cette logique entre le moteur parsé
 * (`scrcmd.ts`) et le byte-VM (`scrcmd_bytevm.ts`) — ce qui créerait de la
 * divergence — on l'extrait ici en fns partagées que LES DEUX appellent.
 *
 * Interface = args STRING (comme le moteur parsé) ; le byte-VM passe `String(num)`
 * (les helpers ont déjà un fallback numérique → match `npc.localId`).
 *
 * 1:1 décomp : scrcmd.c ScrCmd_setobjectxy / setobjectxyperm / removeobject /
 * addobject / showobjectat / hideobjectat.
 */

import { findNpcByLocalId, resolveObjectLocalIdRaw } from './engine/script/script-opcodes-helpers';
import { VarGet, FlagSet, FlagClear } from './engine/script/script-vars';
import { MAP_OFFSET, gMapHeader } from './fieldmap';
import { SetObjectEventSpritePosToMapCoords, TrySpawnObjectEvent, gObjectEvents } from './event_object_movement';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { GetCurrentMap, SetObjEventTemplateCoords } from './load_save';
import { getRuntime } from '../harness/runtime/decomp-globals';
import { DestroySprite } from './sprite';

/** 1:1 décomp `ScrCmd_setobjectxy` → MoveObjectEventToMapCoords (coords + sprite px). */
export function doSetObjectXY(localIdArg: string, x: number, y: number): void {
  const npc = findNpcByLocalId(localIdArg);
  if (!npc) return;
  npc.currentCoordsX = x + MAP_OFFSET;
  npc.currentCoordsY = y + MAP_OFFSET;
  npc.previousCoordsX = x + MAP_OFFSET;
  npc.previousCoordsY = y + MAP_OFFSET;
  SetObjectEventSpritePosToMapCoords(npc, x, y);
  // Architecture web : pos = source unique du joueur → un setobjectxy ciblant le
  // PLAYER doit aussi mettre gSaveBlock1Ptr.pos à jour (sinon re-spawn stale).
  if (npc.isPlayer) { gSaveBlock1Ptr.pos.x = x; gSaveBlock1Ptr.pos.y = y; }
}

/** 1:1 décomp `ScrCmd_setobjectxyperm` → SetObjEventTemplateCoords (persistant). */
export function doSetObjectXYPerm(localIdArg: string, x: number, y: number): void {
  const currentMapId = gMapHeader?.id ?? GetCurrentMap()?.name ?? '';
  SetObjEventTemplateCoords(currentMapId, localIdArg, x, y);
  const npc = findNpcByLocalId(localIdArg);
  if (npc) {
    npc.initialCoordsX = x + MAP_OFFSET;
    npc.initialCoordsY = y + MAP_OFFSET;
    npc.currentCoordsX = x + MAP_OFFSET;
    npc.currentCoordsY = y + MAP_OFFSET;
    npc.previousCoordsX = x + MAP_OFFSET;
    npc.previousCoordsY = y + MAP_OFFSET;
    SetObjectEventSpritePosToMapCoords(npc, x, y);
  }
}

/** 1:1 décomp `ScrCmd_addobject` → TrySpawnObjectEvent (+ clear flag). */
export function doAddObject(localIdArg: string): void {
  const localIdRaw = resolveObjectLocalIdRaw(localIdArg);
  const tpl = gMapHeader?.events?.objectEvents?.find((t) => t.localIdRaw === localIdRaw);
  if (tpl?.flagId) FlagClear(tpl.flagId);
  const rt = getRuntime();
  if (rt) TrySpawnObjectEvent(localIdRaw, rt);
}

/** 1:1 décomp `ScrCmd_removeobject` → set flag + destroy sprite + inactive. */
export function doRemoveObject(localIdArg: string): void {
  const localIdRaw = resolveObjectLocalIdRaw(localIdArg);
  const tpl = gMapHeader?.events?.objectEvents?.find((t) => t.localIdRaw === localIdRaw);
  if (tpl?.flagId) FlagSet(tpl.flagId);
  const npc = gObjectEvents.find((n) => n.active && n.localIdRaw === localIdRaw);
  if (npc) {
    if (npc.spriteId >= 0) {
      try { DestroySprite(npc.spriteId); } catch (e) { console.warn(`[removeobject] DestroySprite ${npc.spriteId} threw:`, e); }
      npc.spriteId = -1;
    }
    npc.active = false;
    npc.invisible = true;
  }
}

/** 1:1 décomp `ScrCmd_showobjectat`/`hideobjectat` → SetObjectInvisibility. */
export function doSetObjectInvisibility(localIdArg: string, invisible: boolean): void {
  if (!invisible) {
    const npc = findNpcByLocalId(localIdArg);
    if (npc) npc.invisible = false;
  } else {
    const localId = VarGet(localIdArg);
    const obj = gObjectEvents.find((o) => o.active && (o as unknown as { localId?: number }).localId === localId);
    if (obj) obj.invisible = true;
  }
}
