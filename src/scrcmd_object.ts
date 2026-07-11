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

// Helpers partagés : foyer scrcmd.ts (cycle scrcmd ↔ scrcmd_object bénin, functions
// hoistées) + findTemplateByLocalId = adaptation GetBaseTemplateForObjectEvent (EOM).
import { findNpcByLocalId, resolveObjectLocalIdRaw } from './scrcmd';
import { findTemplateByLocalId } from './event_object_movement';
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
  // 1:1 décomp `SetObjEventTemplateCoords(localId, x, y)` matche `template->localId == localId`
  // (NUMÉRIQUE). Le byte-VM (`ScrCmd_setobjectxyperm`) passe `String(localId)` : sans cette
  // conversion, SetObjEventTemplateCoords tentait un match par `localIdRaw` (jamais égal à
  // "<num>") → append d'un template BIDON (localId 0) au lieu de muter le vrai template. Le
  // spawn map-load (SpawnObjectEventsOnMap itère le saveblock) posait alors le NPC aux coords
  // ROM. Ex. LittlerootTown_BrendansHouse_1F OnTransition `MoveMomToDoor`
  // (setobjectxyperm MOM 9,8) était ignoré → Maman spawn à sa case ROM (2,6) au lieu de la
  // porte à l'emménagement. Fix : resoudre l'id numérique pour le match template 1:1.
  const idForTemplate: number | string = /^-?\d+$/.test(localIdArg) ? parseInt(localIdArg, 10) : localIdArg;
  SetObjEventTemplateCoords(currentMapId, idForTemplate, x, y);
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

/** 1:1 décomp `ObjectEventTurn` anim (event_object_movement.c:1867) : StartSpriteAnim
 *  (GetFaceDirectionAnimNum(dir)) + SeekSpriteAnim(0) via globalThis.__npcSetFaceAnim. */
function npcTurnAnim(npc: { facingDirection: number; spriteId: number; inanimate: boolean }): void {
  const setFace = (globalThis as Record<string, unknown>).__npcSetFaceAnim as ((rt: unknown, npc: unknown) => void) | undefined;
  if (!setFace) return;
  try { setFace(getRuntime(), npc); } catch { /* rt pas prêt */ }
}

/** 1:1 décomp `ScrCmd_turnobject` → ObjectEventTurnByLocalIdAndMap → ObjectEventTurn :
 *  pose facingDirection (= valeur DIR_, 1=SOUTH..4=EAST) + relance l'anim de face. */
export function doTurnObject(localIdArg: string, direction: number): void {
  const npc = findNpcByLocalId(localIdArg);
  if (!npc) return;
  npc.facingDirection = direction;
  npcTurnAnim(npc as unknown as { facingDirection: number; spriteId: number; inanimate: boolean });
}

/** 1:1 décomp `ScrCmd_copyobjectxytoperm` → TryOverrideObjectEventTemplateCoords :
 *  persiste la position courante du NPC dans son template (pas de reset au reload). */
export function doCopyObjectXYToPerm(localIdArg: string): void {
  const npc = findNpcByLocalId(localIdArg);
  const tmpl = findTemplateByLocalId(localIdArg);
  if (npc && tmpl) {
    tmpl.x = npc.currentCoordsX - MAP_OFFSET;
    tmpl.y = npc.currentCoordsY - MAP_OFFSET;
  }
}

/** 1:1 décomp `ScrCmd_setobjectsubpriority` → SetObjectSubpriority(localId, …, priority+83).
 *  Pose obj.subpriority + fixedPriority + la subpriority du sprite. */
export function doSetObjectSubpriority(localId: number, priority: number): void {
  const effective = (priority + 83) & 0xFF;
  const obj = gObjectEvents.find((o) => o.active && (o as unknown as { localId?: number }).localId === localId);
  if (!obj) return;
  (obj as unknown as { subpriority?: number; fixedPriority?: boolean }).subpriority = effective;
  (obj as unknown as { fixedPriority?: boolean }).fixedPriority = true;
  const rt = getRuntime() as unknown as { gSprites?: Array<{ subpriority?: number } | undefined> } | undefined;
  const spriteId = (obj as unknown as { spriteId?: number }).spriteId;
  if (rt?.gSprites && typeof spriteId === 'number' && spriteId >= 0) {
    const spr = rt.gSprites[spriteId];
    if (spr) spr.subpriority = effective;
  }
}

/** 1:1 décomp `ScrCmd_resetobjectsubpriority` → ResetObjectSubpriority : subpriority=0 (sprite 0xFF). */
export function doResetObjectSubpriority(localId: number): void {
  const obj = gObjectEvents.find((o) => o.active && (o as unknown as { localId?: number }).localId === localId);
  if (!obj) return;
  (obj as unknown as { subpriority?: number; fixedPriority?: boolean }).subpriority = undefined;
  (obj as unknown as { fixedPriority?: boolean }).fixedPriority = false;
  const rt = getRuntime() as unknown as { gSprites?: Array<{ subpriority?: number } | undefined> } | undefined;
  const spriteId = (obj as unknown as { spriteId?: number }).spriteId;
  if (rt?.gSprites && typeof spriteId === 'number' && spriteId >= 0) {
    const spr = rt.gSprites[spriteId];
    if (spr) spr.subpriority = 0xFF;
  }
}

/** 1:1 décomp `ScrCmd_setobjectmovementtype` → SetObjEventTemplateMovementType.
 *  movementTypeRaw = string "MOVEMENT_TYPE_*" (le byte-VM convertit l'id numérique).
 *  Sync facingDirection immédiat pour FACE_x / WALK_IN_PLACE_x même si le NPC est gelé. */
export function doSetObjectMovementType(localIdArg: string, movementTypeRaw: string): void {
  const tpl = findTemplateByLocalId(localIdArg);
  if (tpl) tpl.movementTypeRaw = movementTypeRaw;
  const npc = findNpcByLocalId(localIdArg);
  if (npc) {
    npc.movementType = movementTypeRaw;
    npc.movementStep = 0;
    if (movementTypeRaw) {
      const m = movementTypeRaw.toUpperCase();
      let newFacing = 0;
      if (m.endsWith('_FACE_UP') || m === 'MOVEMENT_TYPE_FACE_UP') newFacing = 2;          // DIR_NORTH
      else if (m.endsWith('_FACE_DOWN') || m === 'MOVEMENT_TYPE_FACE_DOWN') newFacing = 1;  // DIR_SOUTH
      else if (m.endsWith('_FACE_LEFT') || m === 'MOVEMENT_TYPE_FACE_LEFT') newFacing = 3;  // DIR_WEST
      else if (m.endsWith('_FACE_RIGHT') || m === 'MOVEMENT_TYPE_FACE_RIGHT') newFacing = 4; // DIR_EAST
      else if (m.includes('WALK_IN_PLACE_DOWN')) newFacing = 1;
      else if (m.includes('WALK_IN_PLACE_UP')) newFacing = 2;
      else if (m.includes('WALK_IN_PLACE_LEFT')) newFacing = 3;
      else if (m.includes('WALK_IN_PLACE_RIGHT')) newFacing = 4;
      if (newFacing > 0) npc.facingDirection = newFacing;
    }
  }
}
