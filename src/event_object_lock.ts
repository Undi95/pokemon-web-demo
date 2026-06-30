/**
 * event_object_lock.ts — miroir 1:1 de `src/event_object_lock.c` (209l).
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/event_object_lock.c`.
 *
 * Système FREEZE des scripts : gèle le joueur + les object events pendant l'exécution d'un
 * script (opcodes `lock`/`lockall`/`release`/`releaseall`/`faceplayer`), puis les dégèle.
 *   - `lockall`   → FreezeObjects_WaitForPlayer + attend IsFreezePlayerFinished.
 *   - `lock`      → FreezeObjects_WaitForPlayerAndSelected + attend IsFreezeSelectedObjectAndPlayerFinished.
 *   - `release(all)` → ScriptUnfreezeObjectEvents.
 *   - `faceplayer` → Script_FacePlayer.
 *
 * Cette logique vivait INLINÉE dans scrcmd.ts (ScrCmd_lock/lockall/release/releaseall/faceplayer) ;
 * relocalisée ICI dans son foyer miroir 1:1 (consolidation MIRROR). scrcmd appelle ces fns +
 * fournit le wiring async (SetupNativeScript(ctx, IsFreezePlayerFinished)).
 *
 * ── Adaptations ASSUMÉES (vs décomp strict) ──
 *  - Le décomp gèle le joueur via `PlayerFreeze` + un task `Task_FreezePlayer` qui attend que le
 *    joueur soit immobile (IsPlayerStandingStill = tileTransitionState != T_TILE_TRANSITION). Notre
 *    byte-VM gate la fin du pas via `isPlayerStepFinished()` (= équivalent NET : le script attend la
 *    fin du pas du joueur avant de continuer). `PlayerFreeze`/`StopPlayerAvatar`/
 *    `FreezeObjectEventsExceptOne` (chaîne de deps field_player_avatar.c/event_object_movement.c)
 *    pas encore portés → on utilise les équivalents existants (boucle FreezeObjectEvent + le gate).
 *  - `FreezeForApproachingTrainers`/`Task_FreezeObjectAndPlayer` (combat — gNoOfApproachingTrainers,
 *    trainer_see.c) DIFFÉRÉS (combat en pause).
 */
import { getSelectedNpc, OPPOSITE_DIR, isPlayerStepFinished } from './engine/script/script-opcodes-helpers';
import {
  FreezeObjectEvent, UnfreezeObjectEvent, ObjectEventClearHeldMovementIfFinished,
  ObjectEventSetHeldMovement, gObjectEvents,
} from './event_object_movement';
import { GetPlayerFacingDirection, gPlayerAvatar, DIR_SOUTH, DIR_NORTH, DIR_WEST, DIR_EAST } from './field_player_avatar';
import { ScriptMovement_UnfreezeObjectEvents } from './script_movement';
import {
  MOVEMENT_ACTION_FACE_DOWN, MOVEMENT_ACTION_FACE_UP, MOVEMENT_ACTION_FACE_LEFT, MOVEMENT_ACTION_FACE_RIGHT,
} from '../include/constants/event_object_movement';

/** 1:1 décomp `GetFaceDirectionMovementAction(dir)` (table) : dir → MOVEMENT_ACTION_FACE_X. */
function faceAction(dir: number): number {
  switch (dir) {
    case DIR_SOUTH: return MOVEMENT_ACTION_FACE_DOWN;
    case DIR_NORTH: return MOVEMENT_ACTION_FACE_UP;
    case DIR_WEST:  return MOVEMENT_ACTION_FACE_LEFT;
    case DIR_EAST:  return MOVEMENT_ACTION_FACE_RIGHT;
    default:        return MOVEMENT_ACTION_FACE_DOWN;
  }
}

/** 1:1 décomp `IsPlayerStandingStill` (event_object_lock.c:11) :
 *    return gPlayerAvatar.tileTransitionState != T_TILE_TRANSITION.
 *  Adaptation : notre gate `isPlayerStepFinished()` (= true quand le pas du joueur est terminé). */
export function IsPlayerStandingStill(): boolean {
  return isPlayerStepFinished();
}

/** 1:1 décomp `FreezeObjects_WaitForPlayer` (event_object_lock.c:43) :
 *    FreezeObjectEvents(); CreateTask(Task_FreezePlayer, 80);
 *  → gèle TOUS les object events immédiatement ; le joueur est figé une fois immobile (attente
 *  via IsFreezePlayerFinished). */
export function FreezeObjects_WaitForPlayer(): void {
  for (const npc of gObjectEvents) if (npc.active) FreezeObjectEvent(npc);
}

/** 1:1 décomp `IsFreezePlayerFinished` (event_object_lock.c:29) :
 *    if (FuncIsActiveTask(Task_FreezePlayer)) return FALSE; else { StopPlayerAvatar(); return TRUE; }
 *  Adaptation : gate `isPlayerStepFinished()` (le pas du joueur est-il fini ?). */
export function IsFreezePlayerFinished(): boolean {
  return isPlayerStepFinished();
}

/** 1:1 décomp `FreezeObjects_WaitForPlayerAndSelected` (event_object_lock.c:87) :
 *    FreezeObjectEventsExceptOne(gSelectedObjectEvent); CreateTask(Task_FreezeSelectedObjectAndPlayer);
 *    ...gèle le selected si pas en mouvement.
 *  → gèle tous les object events SAUF le selected (figé à la fin via le gate). */
export function FreezeObjects_WaitForPlayerAndSelected(): void {
  const sel = getSelectedNpc();
  for (const n of gObjectEvents) if (n.active && n !== sel) FreezeObjectEvent(n);
}

/** 1:1 décomp `IsFreezeSelectedObjectAndPlayerFinished` (event_object_lock.c:72) :
 *    if (FuncIsActiveTask(Task_FreezeSelectedObjectAndPlayer)) return FALSE;
 *    else { StopPlayerAvatar(); return TRUE; }
 *  Adaptation : attend la fin du pas joueur, puis gèle le selected. */
export function IsFreezeSelectedObjectAndPlayerFinished(): boolean {
  if (!isPlayerStepFinished()) return false;
  const sel = getSelectedNpc();
  if (sel) FreezeObjectEvent(sel);
  return true;
}

/** 1:1 décomp `ScriptUnfreezeObjectEvents` (event_object_lock.c:99) :
 *    playerObjectId = GetObjectEventIdByLocalIdAndMap(LOCALID_PLAYER, 0, 0);
 *    ObjectEventClearHeldMovementIfFinished(&gObjectEvents[playerObjectId]);
 *    ScriptMovement_UnfreezeObjectEvents();
 *    UnfreezeObjectEvents();
 *  → libère le held movement du joueur + dégèle les scripts de mouvement + dégèle tous les objets. */
export function ScriptUnfreezeObjectEvents(): void {
  const player = gObjectEvents[gPlayerAvatar.objectEventId];
  if (player) ObjectEventClearHeldMovementIfFinished(player);
  ScriptMovement_UnfreezeObjectEvents();
  for (const npc of gObjectEvents) if (npc.active) UnfreezeObjectEvent(npc);
}

/** 1:1 décomp `Script_FacePlayer` (event_object_lock.c:119) :
 *    ObjectEventFaceOppositeDirection(&gObjectEvents[gSelectedObjectEvent], gSpecialVar_Facing);
 *  → le NPC sélectionné se tourne vers le joueur (= direction opposée au facing du joueur).
 *  Adaptation : `ObjectEventSetHeldMovement(npc, faceAction(opposite(playerFacing)))` (équiv. net). */
export function Script_FacePlayer(): void {
  const npc = getSelectedNpc();
  if (!npc) return;
  const opp = OPPOSITE_DIR[GetPlayerFacingDirection()] ?? DIR_SOUTH;
  ObjectEventSetHeldMovement(npc, faceAction(opp));
}
