/**
 * script-opcodes-movement.ts — opcodes movement / object events 1:1 décomp
 * `event_object_movement.c` + `script_movement.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c` :
 *   `ScrCmd_applymovement`        (l. 992-1000) : ScriptMovement_StartObjectMovementScript.
 *   `ScrCmd_applymovementat`      (l. 1002-1017) : variant avec (mapGroup, mapNum).
 *   `ScrCmd_waitmovement`         (l. 1019-1029) : SetupNativeScript(WaitForMovementFinish).
 *   `ScrCmd_waitmovementat`       (l. 1031-1045) : variant avec map.
 *   `ScrCmd_removeobject`         (l. 1047-1053) : RemoveObjectEvent.
 *   `ScrCmd_removeobjectat`       (l. 1055-1063) : variant avec map.
 *   `ScrCmd_addobject`            (l. 1065-1071) : TrySpawnObjectEvent.
 *   `ScrCmd_addobjectat`          (l. 1073-1081) : variant avec map.
 *   `ScrCmd_setobjectxy`          (l. 1083-1091) : ObjectEventTeleport.
 *   `ScrCmd_setobjectxyperm`      (l. 1093-1101) : SetObjEventTemplateCoords.
 *   `ScrCmd_copyobjectxytoperm`   (l. 1103-1109) : persist current → template.
 *   `ScrCmd_showobjectat`         (l. 1111-1119) : SetObjectInvisibility(FALSE).
 *   `ScrCmd_hideobjectat`         (l. 1121-1129) : SetObjectInvisibility(TRUE).
 *   `ScrCmd_setobjectsubpriority` (l. 1131-1140) : SetObjectSubpriority.
 *   `ScrCmd_resetobjectsubpriority` (l. 1142-1150) : ResetObjectSubpriority.
 *   `ScrCmd_setobjectmovementtype`(l. 1168-1175) : ObjectEventChangeMovementType.
 *   `ScrCmd_createvobject`        (l. 1177-1188) : CreateVirtualObject.
 *   `ScrCmd_turnvobject`          (l. 1190-1199) : TurnVirtualObject.
 *
 * Plus opcodes pseudo (= movement action tokens) : slide_face_*, walk_*_affine,
 * init_affine_anim (= no-op, leur effet réel est dans le movement system).
 *
 * `map_script` / `map_script_2` : marqueurs dans tables OnTransition/OnFrame.
 * `disable_jump_landing_ground_effect` : flag movement modifier.
 */

import { registerOpcode, getOpcodeHandler, SetupNativeScript } from './script-runtime';
import { VarGet, FlagSet, FlagClear } from './script-vars';
import { gObjectEvents, TrySpawnObjectEvent, SetObjectEventSpritePosToMapCoords } from '../field/object-events';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { gMapHeader, MAP_OFFSET } from '../../game/fieldmap';
import { GetCurrentMap, SetObjEventTemplateCoords } from '../save/load_save';
import { getRuntime } from '../system/decomp-globals';
import { applyMovement, isAllMovementsDone, isMovementDone } from '../field/movement-system';
import {
  parseValue, findNpcByLocalId, findTemplateByLocalId, resolveObjectLocalIdRaw,
  getSelectedNpc,
} from './script-opcodes-helpers';

/** _vget = VarGet avec fallback '0'. Local au fichier (= 1:1 décomp inline read). */
function _vget(arg: string | undefined): number {
  return VarGet(arg ?? '0');
}

// ─── setobjectxy / setobjectxyperm / copyobjectxytoperm ─────────────────────

registerOpcode('setobjectxy', (_ctx, args) => {
  const x = parseValue(args[1]);
  const y = parseValue(args[2]);
  const npc = findNpcByLocalId(args[0] ?? '');
  if (npc) {
    // 1:1 STRICT décomp `MoveObjectEventToMapCoords` (event_object_movement.c:2133) :
    //   SetObjectEventCoords(objectEvent, x, y);    ← update coords logiques
    //   SetSpritePosToMapCoords(...);                ← update sprite pixel pos
    //   sprite->centerToCornerVecX/Y = -(graphicsInfo->width/height >> 1);
    //   sprite->x += 8; sprite->y += 16 + ctcv;
    //   ResetObjectEventFldEffData(objectEvent);
    //
    // Sans le 2e step (sprite pixel pos), le SPRITE reste à sa position template
    // visuel même si les coords logiques changent → bug user "Birch spawn pas
    // au bon endroit" (= script setobjectxy LOCALID_ROUTE101_BIRCH, 0, 15 mais
    // sprite resta à (9, 13) = template visuel jusqu'au prochain walk).
    npc.currentCoordsX = x + MAP_OFFSET;
    npc.currentCoordsY = y + MAP_OFFSET;
    npc.previousCoordsX = x + MAP_OFFSET;
    npc.previousCoordsY = y + MAP_OFFSET;
    SetObjectEventSpritePosToMapCoords(npc, x, y);
    // Architecture web : gSaveBlock1Ptr.pos est la source UNIQUE de la position
    // player (caméra + collision isPlayerAt + re-spawn return-to-field via
    // InitPlayerAvatar). Le décomp garde pos et l'object event séparés (setobjectxy
    // ne touche pas pos ; le return-to-field PRÉSERVE l'object event), mais on a
    // unifié sur pos (CHANTIER-OW source unique). Donc un setobjectxy ciblant le
    // PLAYER doit AUSSI mettre pos à jour, sinon pos reste stale → post-combat
    // InitPlayerAvatar(pos) re-spawn le player à l'ancienne pos (bug Birch tutorial :
    // setobjectxy LOCALID_PLAYER, 6, 13 puis combat → player re-spawn au lieu de
    // déclenchement du sac au lieu de (6,13) devant le prof). La caméra se re-sync
    // au prochain frame stable (MainCB2_Overworld défensif cam≠pos → DrawWholeMapView).
    if (npc.isPlayer) {
      gSaveBlock1Ptr.pos.x = x;
      gSaveBlock1Ptr.pos.y = y;
    }
  }
  return false;
});

registerOpcode('setobjectxyperm', (_ctx, args) => {
  // 1:1 STRICT décomp `ScrCmd_setobjectxyperm` :
  //   u16 localId = VarGet(ScriptReadHalfword(ctx));
  //   u16 x = VarGet(ScriptReadHalfword(ctx));
  //   u16 y = VarGet(ScriptReadHalfword(ctx));
  //   SetObjEventTemplateCoords(localId, x, y);
  //
  // Et SetObjEventTemplateCoords (overworld.c:490) écrit dans
  // `gSaveBlock1Ptr->objectEventTemplates[]` (= PERSISTENT cross-map reload).
  const x = parseValue(args[1]);
  const y = parseValue(args[2]);
  const localIdRaw = args[0] ?? '';
  const currentMapId = gMapHeader?.id ?? GetCurrentMap()?.name ?? '';
  SetObjEventTemplateCoords(currentMapId, localIdRaw, x, y);
  // 1:1 STRICT décomp : NE PAS muter `gMapHeader.events.objectEvents` (= ROM
  // read-only dans le décomp). Seul `gSaveBlock1Ptr.objectEventTemplates` est
  // muté via SetObjEventTemplateCoords (= writable saveblock memory).
  const npc = findNpcByLocalId(args[0] ?? '');
  if (npc) {
    // Post R3 refactor : initialCoords/currentCoords INTERNAL (= +MAP_OFFSET).
    npc.initialCoordsX = x + MAP_OFFSET;
    npc.initialCoordsY = y + MAP_OFFSET;
    // Audit session 126 C6 : aussi sync `currentCoordsX/Y` + `previousCoordsX/Y`
    // pour 1:1 visuel sur les changements en cours de game.
    npc.currentCoordsX = x + MAP_OFFSET;
    npc.currentCoordsY = y + MAP_OFFSET;
    npc.previousCoordsX = x + MAP_OFFSET;
    npc.previousCoordsY = y + MAP_OFFSET;
    // 1:1 STRICT décomp `MoveObjectEventToMapCoords` (event_object_movement.c:2133) :
    // sprite pixel pos doit être recalculé avec camera offset, PAS un simple `x * 16`
    // qui ignore gFieldCamera/gTotalCamera/sFieldCameraOffset.
    SetObjectEventSpritePosToMapCoords(npc, x, y);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_copyobjectxytoperm` (scrcmd.c:1103-1109) :
 *    persist NPC current XY to template (= so NPC doesn't reset on map reload). */
registerOpcode('copyobjectxytoperm', (_ctx, args) => {
  const npc = findNpcByLocalId(args[0] ?? '');
  const tmpl = findTemplateByLocalId(args[0] ?? '');
  if (npc && tmpl) {
    tmpl.x = npc.currentCoordsX - MAP_OFFSET;
    tmpl.y = npc.currentCoordsY - MAP_OFFSET;
  }
  return false;
});

// ─── setobjectmovementtype ──────────────────────────────────────────────────

registerOpcode('setobjectmovementtype', (_ctx, args) => {
  const movementType = args[1];
  // 1:1 décomp : modifie le TEMPLATE pour que le NPC respawn avec ce movement.
  const tpl = findTemplateByLocalId(args[0] ?? '');
  if (tpl) tpl.movementTypeRaw = movementType;
  const npc = findNpcByLocalId(args[0] ?? '');
  if (npc) {
    npc.movementType = movementType;
    npc.movementStep = 0;
    // 1:1 décomp : update facingDirection en sync avec movement type pour que
    // FACE_UP/DOWN/LEFT/RIGHT applique son facing IMMÉDIATEMENT, même quand
    // le NPC est `frozen` (= lockall) et ne tick pas son movement handler.
    if (movementType) {
      const m = movementType.toUpperCase();
      let newFacing = 0;
      if (m.endsWith('_FACE_UP') || m === 'MOVEMENT_TYPE_FACE_UP') newFacing = 2;       // DIR_NORTH
      else if (m.endsWith('_FACE_DOWN') || m === 'MOVEMENT_TYPE_FACE_DOWN') newFacing = 1; // DIR_SOUTH
      else if (m.endsWith('_FACE_LEFT') || m === 'MOVEMENT_TYPE_FACE_LEFT') newFacing = 3; // DIR_WEST
      else if (m.endsWith('_FACE_RIGHT') || m === 'MOVEMENT_TYPE_FACE_RIGHT') newFacing = 4; // DIR_EAST
      else if (m.includes('WALK_IN_PLACE_DOWN')) newFacing = 1;
      else if (m.includes('WALK_IN_PLACE_UP')) newFacing = 2;
      else if (m.includes('WALK_IN_PLACE_LEFT')) newFacing = 3;
      else if (m.includes('WALK_IN_PLACE_RIGHT')) newFacing = 4;
      if (newFacing > 0) npc.facingDirection = newFacing;
    }
  }
  return false;
});

// ─── applymovement / waitmovement + variants ────────────────────────────────

/** 1:1 décomp `ScrCmd_applymovement` (scrcmd.c:992-1000) :
 *  enqueue movement actions pour l'object event ciblé (= localId arg). */
registerOpcode('applymovement', (_ctx, args) => {
  const localId = args[0] ?? '';
  const movementLabel = args[1] ?? '';
  if (!localId || !movementLabel) {
    console.warn(`[opcode applymovement] bad args : ${args.join(',')}`);
    return false;
  }
  applyMovement(localId, movementLabel);
  return false;  // Continue script tick — waitmovement bloque si nécessaire.
});

/** 1:1 décomp `ScrCmd_waitmovement` (scrcmd.c:1019-1029) :
 *    SetupNativeScript callback qui returns TRUE quand movements done.
 *    waitmovement 0 = wait pour TOUTES les queues actives.
 *    waitmovement LOCALID_X = wait pour cette queue specific. */
registerOpcode('waitmovement', (ctx, args) => {
  const target = args[0] ?? '0';
  if (target === '0' || target === '') {
    SetupNativeScript(ctx, isAllMovementsDone);
  } else {
    SetupNativeScript(ctx, () => isMovementDone(target));
  }
  return true;  // pause script ; SetupNativeScript reprendra quand done.
});

/** 1:1 décomp `ScrCmd_applymovementat` (scrcmd.c:1002-1017) :
 *    applymovement mais sur object dans (mapGroup, mapNum). Notre port :
 *    si même map → delegate à applymovement. */
registerOpcode('applymovementat', (ctx, args) => {
  return getOpcodeHandler('applymovement')?.(ctx, args) ?? false;
});

/** 1:1 décomp `ScrCmd_waitmovementat` (scrcmd.c:1031-1045) :
 *    waitmovement mais sur map spécifique. */
registerOpcode('waitmovementat', (ctx, args) => {
  return getOpcodeHandler('waitmovement')?.(ctx, args) ?? false;
});

// ─── Map scripts triggers (= map_script + map_script_2) ─────────────────────
// Ces opcodes apparaissent dans les tables OnTransition / OnFrame, pas dans
// les scripts exécutables. Les ignorer si rencontrés pendant une exécution.

registerOpcode('map_script', () => false);
registerOpcode('map_script_2', () => false);

// ─── Object event manipulation (= 1:1 décomp ScrCmd_addobject etc.) ─────────

/** 1:1 décomp `ScrCmd_addobject` (scrcmd.c:1065-1071) :
 *    TrySpawnObjectEvent(localId, mapNum, mapGroup) qui ClearFlag + spawn
 *    directement le NPC. Sans le spawn immédiat, le NPC attendrait le
 *    prochain tile cross pour apparaitre. */
registerOpcode('addobject', (_ctx, args) => {
  const localIdRaw = resolveObjectLocalIdRaw(args[0] ?? '');
  const tpl = gMapHeader?.events?.objectEvents?.find(t => t.localIdRaw === localIdRaw);
  if (tpl?.flagId) FlagClear(tpl.flagId);
  // Spawn immédiat (= 1:1 décomp behavior).
  const rt = getRuntime();
  if (rt) {
    const ok = TrySpawnObjectEvent(localIdRaw, rt);
    console.log(`[opcode addobject] ${args[0]} → ${localIdRaw} → ${ok ? 'spawned' : 'failed'}`);
  }
  return false;
});

/** 1:1 décomp `ScrCmd_removeobject` (scrcmd.c:1047-1053) :
 *    SetFlag(flagId) + remove sprite via FreeAndDestroyObjectEventSprite. */
registerOpcode('removeobject', (_ctx, args) => {
  const localIdRaw = resolveObjectLocalIdRaw(args[0] ?? '');
  const tpl = gMapHeader?.events?.objectEvents?.find(t => t.localIdRaw === localIdRaw);
  if (tpl?.flagId) FlagSet(tpl.flagId);
  // Find active NPC + destroy sprite + mark inactive.
  const npc = gObjectEvents.find(n => n.active && n.localIdRaw === localIdRaw);
  if (npc) {
    if (npc.spriteId >= 0) {
      try {
        const rt = getRuntime();
        rt.DestroySprite(npc.spriteId);
      } catch (e) {
        console.warn(`[opcode removeobject] DestroySprite ${npc.spriteId} threw:`, e);
      }
      npc.spriteId = -1;
    }
    npc.active = false;
    npc.invisible = true;
  }
  return false;
});

/** 1:1 décomp `ScrCmd_addobjectat` (scrcmd.c:1073-1081) :
 *    addobject sur map spécifique. */
registerOpcode('addobjectat', (ctx, args) => {
  return getOpcodeHandler('addobject')?.(ctx, args) ?? false;
});

/** 1:1 décomp `ScrCmd_removeobjectat` (scrcmd.c:1055-1063) :
 *    removeobject sur map spécifique. */
registerOpcode('removeobjectat', (ctx, args) => {
  return getOpcodeHandler('removeobject')?.(ctx, args) ?? false;
});

/** 1:1 décomp `ScrCmd_showobjectat` (scrcmd.c:1111-1119) :
 *    SetObjectInvisibility(localId, ..., FALSE). */
registerOpcode('showobjectat', (_ctx, args) => {
  const npc = findNpcByLocalId(args[0] ?? '');
  if (npc) npc.invisible = false;
  return false;
});

/** 1:1 décomp `ScrCmd_hideobjectat` (scrcmd.c:1121-1129) :
 *    SetObjectInvisibility(localId, mapNum, mapGroup, TRUE).
 *  `SetObjectInvisibility` (event_object_movement.c:1939) :
 *    if (!TryGetObjectEventIdByLocalIdAndMap(...,&id))  // = SI TROUVÉ
 *      gObjectEvents[id].invisible = invisible.
 *  objet chargé → invisible=TRUE ; non chargé → NO-OP. */
registerOpcode('hideobjectat', (_ctx, args) => {
  const localId = _vget(args[0]);
  const obj = gObjectEvents.find(o => o.active && (o as unknown as { localId?: number }).localId === localId);
  if (obj) obj.invisible = true;
  return false;
});

// ─── Object subpriority (1:1 décomp ScrCmd_setobjectsubpriority) ────────────

/** 1:1 décomp ScrCmd_setobjectsubpriority (scrcmd.c:1131-1140) :
 *    SetObjectSubpriority(localId, mapNum, mapGroup, priority + 83).
 *  event_object_movement.c:SetObjectSubpriority :
 *    sprite->subpriority = priority + 83;
 *    sprite->coordOffsetEnabled = TRUE;  // = fixedPriority flag */
registerOpcode('setobjectsubpriority', (_ctx, args) => {
  const localId = _vget(args[0]);
  const _mapGroup = parseValue(args[1] ?? '0');
  const _mapNum = parseValue(args[2] ?? '0');
  const priority = parseValue(args[3] ?? '0');
  void _mapGroup; void _mapNum;
  const effective = (priority + 83) & 0xFF;
  const obj = gObjectEvents.find(o => o.active && (o as unknown as { localId?: number }).localId === localId);
  if (obj) {
    (obj as unknown as { subpriority?: number; fixedPriority?: boolean }).subpriority = effective;
    (obj as unknown as { fixedPriority?: boolean }).fixedPriority = true;
    const rt = getRuntime();
    const spriteId = (obj as unknown as { spriteId?: number }).spriteId;
    if (rt && typeof spriteId === 'number' && spriteId >= 0) {
      const spr = rt.gSprites.get(spriteId);
      if (spr) spr.subpriority = effective;
    }
  }
  return false;
});

/** 1:1 décomp ScrCmd_resetobjectsubpriority (scrcmd.c:1142-1150) :
 *    ResetObjectSubpriority(localId, mapNum, mapGroup).
 *  event_object_movement.c:ResetObjectSubpriority :
 *    sprite->subpriority = 0;
 *    sprite->coordOffsetEnabled = FALSE. */
registerOpcode('resetobjectsubpriority', (_ctx, args) => {
  const localId = _vget(args[0]);
  const obj = gObjectEvents.find(o => o.active && (o as unknown as { localId?: number }).localId === localId);
  if (obj) {
    (obj as unknown as { subpriority?: number; fixedPriority?: boolean }).subpriority = undefined;
    (obj as unknown as { fixedPriority?: boolean }).fixedPriority = false;
    const rt = getRuntime();
    const spriteId = (obj as unknown as { spriteId?: number }).spriteId;
    if (rt && typeof spriteId === 'number' && spriteId >= 0) {
      const spr = rt.gSprites.get(spriteId);
      if (spr) spr.subpriority = 0xFF;
    }
  }
  return false;
});

// ─── Virtual objects (createvobject / turnvobject) ──────────────────────────

/** 1:1 décomp ScrCmd_createvobject (scrcmd.c:1177-1188) :
 *    CreateVirtualObject(graphicsId, virtualObjId, x, y, elevation, direction). */
registerOpcode('createvobject', (_ctx, args) => {
  const graphicsId = parseValue(args[0] ?? '0');
  const virtualObjId = parseValue(args[1] ?? '0');
  const x = _vget(args[2]);
  const y = _vget(args[3]);
  const elevation = parseValue(args[4] ?? '0');
  const direction = parseValue(args[5] ?? '0');
  void (async () => {
    const vo = (globalThis as { __virtualObjects?: { CreateVirtualObject?: (g: number, id: number, x: number, y: number, e: number, d: number) => Promise<number> } }).__virtualObjects;
    if (vo?.CreateVirtualObject) {
      await vo.CreateVirtualObject(graphicsId, virtualObjId, x, y, elevation, direction);
    }
  })();
  return false;
});

/** 1:1 décomp ScrCmd_turnvobject (scrcmd.c:1190-1199) :
 *    TurnVirtualObject(virtualObjId, direction). */
registerOpcode('turnvobject', (_ctx, args) => {
  const virtualObjId = parseValue(args[0] ?? '0');
  const direction = parseValue(args[1] ?? '0');
  const vo = (globalThis as { __virtualObjects?: { TurnVirtualObject?: (id: number, d: number) => void } }).__virtualObjects;
  vo?.TurnVirtualObject?.(virtualObjId, direction);
  return false;
});

// ─── Disable jump landing ground effect ─────────────────────────────────────

/** 1:1 décomp `ScrCmd_disable_jump_landing_ground_effect` :
 *    flag sur ObjectEvent qui empêche le dust effect au landing après jump.
 *    Set sur le SELECTED object. */
registerOpcode('disable_jump_landing_ground_effect', (_ctx, _args) => {
  const npc = getSelectedNpc();
  if (npc) {
    (npc as unknown as { disableJumpLandingGroundEffect?: boolean }).disableJumpLandingGroundEffect = true;
  }
  return false;
});

// ─── Movement actions (slide_face / walk_*_affine / init_affine_anim) ──────
// 1:1 décomp NOTE : ce ne sont PAS des opcodes script, mais des MOVEMENT
// ACTIONS (= bytes dans un movement script passé à `applymovement`). Nos
// scripts contiennent parfois ces tokens directement → on les expose comme
// opcodes no-op pour éviter les warnings (= leur effet réel est dans le
// movement system géré via applymovement + waitmovement).

registerOpcode('slide_face_up', (_ctx, _args) => false);
registerOpcode('slide_face_down', (_ctx, _args) => false);
registerOpcode('slide_face_left', (_ctx, _args) => false);
registerOpcode('slide_face_right', (_ctx, _args) => false);
registerOpcode('walk_up_affine', (_ctx, _args) => false);
registerOpcode('walk_down_affine', (_ctx, _args) => false);
registerOpcode('init_affine_anim', (_ctx, _args) => false);
