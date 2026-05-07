/**
 * warp-system.ts — Phase 4.6 1:1 décomp warp dispatcher.
 *
 * Sources :
 *   - `src/field_control_avatar.c` :
 *       - ProcessPlayerFieldInput (line 134) — dispatch après step / push / A
 *       - TryStartWarpEventScript (line 702) — step warps (= player on warp tile)
 *       - TryArrowWarp (line 688) — arrow warps (= held direction == facing)
 *       - TryDoorWarp (line 833) — door warps (= push UP on MB_ANIMATED_DOOR)
 *       - IsWarpMetatileBehavior, IsArrowWarpMetatileBehavior helpers
 *   - `src/field_screen_effect.c` :
 *       - DoWarp / DoDoorWarp / DoFallWarp / DoTeleportTileWarp (= 6+ variants)
 *       - Task_WarpAndLoadMap, Task_DoDoorWarp, Task_ExitDoor, Task_ExitNonAnimDoor,
 *         Task_ExitNonDoor (state machines per warp type)
 *       - SetUpWarpExitTask (line 256) — dispatch exit task selon dest metatile
 *   - `src/overworld.c` :
 *       - WarpIntoMap, ApplyCurrentWarp, SetPlayerCoordsFromWarp
 *       - SetWarpDestination, gFieldCallback
 *
 * Design :
 *   - `getWarpAtPlayerPos()` / `findWarpEventAt(x, y)` : warp event matching
 *   - `getWarpKindFor(metatileBehavior)` : classifier le metatile en WarpKind
 *   - `setPendingWarp(warp, kind)` : flag global, claimed par scene MainCB2
 *   - `getExitTaskKindFor(metatileBehavior)` : classifier dest tile pour exit anim
 *
 * La scene (TestOverworldScene) a la responsabilité de :
 *   - Détecter pending warp dans MainCB2_Overworld → executeWarp
 *   - executeWarp dispatch selon WarpKind → joue les tasks 1:1 décomp
 *   - Au load de la dest map, executeExitTask selon metatile à player pos
 */

import type { WarpEvent, MapHeader } from './map-loader';
import { gMapHeader, MapGridGetMetatileBehaviorAt, MAP_OFFSET } from './map-loader';
import { gPlayerAvatar, DIR_NORTH, DIR_SOUTH } from './player-avatar';
import {
  MB_ANIMATED_DOOR,
  MB_NON_ANIMATED_DOOR,
  MB_WATER_DOOR,
  MB_DEEP_SOUTH_WARP,
  MB_LADDER,
  MB_NORTH_ARROW_WARP,
  MB_SOUTH_ARROW_WARP,
  MB_EAST_ARROW_WARP,
  MB_WEST_ARROW_WARP,
  MB_AQUA_HIDEOUT_WARP,
  MB_CRACKED_FLOOR_HOLE,
  MB_MT_PYRE_HOLE,
  MB_UP_ESCALATOR,
  MB_DOWN_ESCALATOR,
  isAnimatedDoor,
} from './tilemap-loader';

// ─── Warp kind classification ───────────────────────────────────────────────

/** Type de warp détecté. Dispatché par executeWarp dans la scene.
 *  1:1 décomp branches dans TryStartWarpEventScript + TryDoorWarp + TryArrowWarp. */
export type WarpKind =
  | 'door'        // MB_ANIMATED_DOOR : door anim + walk-up + Task_DoDoorWarp
  | 'step'        // MB_NON_ANIMATED_DOOR / MB_WATER_DOOR / MB_DEEP_SOUTH_WARP : DoWarp + Task_ExitNonAnimDoor
  | 'ladder'      // MB_LADDER : DoWarp + Task_ExitNonDoor (= no walk-down)
  | 'arrow'       // MB_*_ARROW_WARP : DoWarp + Task_ExitNonDoor
  | 'fall'        // MB_CRACKED_FLOOR_HOLE / MB_MT_PYRE_HOLE : DoFallWarp + FieldCB_FallWarpExit
  | 'teleport'    // MB_AQUA_HIDEOUT_WARP : DoTeleportTileWarp + FieldCB_SpinEnterWarp
  | 'escalator';  // MB_UP_ESCALATOR / MB_DOWN_ESCALATOR : DoEscalatorWarp

/** Type d'exit task à run au load de la dest map. 1:1 décomp `SetUpWarpExitTask`
 *  (field_screen_effect.c:256). Dispatch selon le metatile_behavior à la position
 *  du player après `WarpIntoMap`. */
export type ExitTaskKind =
  | 'door'        // MetatileBehavior_IsDoor (= MB_PETALBURG_GYM_DOOR | MB_ANIMATED_DOOR)
                  //   → Task_ExitDoor : door open + walk-down + door close
  | 'non_anim'    // MetatileBehavior_IsNonAnimDoor (= MB_NON_ANIMATED_DOOR | MB_WATER_DOOR | MB_DEEP_SOUTH_WARP)
                  //   → Task_ExitNonAnimDoor : juste walk-down
  | 'none';       // Else → Task_ExitNonDoor : no walk-down, juste unlock

// ─── Pending warp state ─────────────────────────────────────────────────────

/** Warp détecté ce frame, à exécuter par la scene MainCB2_Overworld. */
let _gPendingWarp: WarpEvent | null = null;
let _gPendingWarpKind: WarpKind | null = null;

export function setPendingWarp(warp: WarpEvent | null, kind: WarpKind | null = null): void {
  _gPendingWarp = warp;
  _gPendingWarpKind = kind;
}

export function getPendingWarp(): { warp: WarpEvent; kind: WarpKind } | null {
  if (!_gPendingWarp || !_gPendingWarpKind) return null;
  return { warp: _gPendingWarp, kind: _gPendingWarpKind };
}

// ─── Warp detection helpers ─────────────────────────────────────────────────

/** 1:1 décomp `GetWarpEventAtMapPosition` (field_control_avatar.c:875).
 *  Find warp event à n'importe quelle position de la map courante.
 *  @returns Le WarpEvent trouvé, ou null. */
export function findWarpEventAt(x: number, y: number): WarpEvent | null {
  if (!gMapHeader) return null;
  const warps = gMapHeader.events.warps;
  for (const warp of warps) {
    if (warp.x === x && warp.y === y) {
      return warp;
    }
  }
  return null;
}

/** Find warp à la position courante du player. */
export function getWarpAtPlayerPos(): WarpEvent | null {
  return findWarpEventAt(gPlayerAvatar.x, gPlayerAvatar.y);
}

/** 1:1 décomp `IsWarpMetatileBehavior` (field_control_avatar.c:751).
 *  Returns TRUE si le metatile_behavior est un type de warp détecté
 *  par TryStartWarpEventScript (= step warp). */
export function isWarpMetatileBehavior(behavior: number): boolean {
  return behavior === MB_ANIMATED_DOOR
      || behavior === MB_NON_ANIMATED_DOOR
      || behavior === MB_WATER_DOOR
      || behavior === MB_DEEP_SOUTH_WARP
      || behavior === MB_LADDER
      || behavior === MB_AQUA_HIDEOUT_WARP
      || behavior === MB_CRACKED_FLOOR_HOLE
      || behavior === MB_MT_PYRE_HOLE
      || behavior === MB_UP_ESCALATOR
      || behavior === MB_DOWN_ESCALATOR;
}

/** 1:1 décomp `IsArrowWarpMetatileBehavior` (field_control_avatar.c:767).
 *  Returns TRUE si tile + direction = arrow warp matching. */
export function isArrowWarpMetatileBehavior(behavior: number, direction: number): boolean {
  switch (direction) {
    case DIR_NORTH: return behavior === MB_NORTH_ARROW_WARP;
    case DIR_SOUTH: return behavior === MB_SOUTH_ARROW_WARP;
    case 3: /* DIR_WEST */ return behavior === MB_WEST_ARROW_WARP;
    case 4: /* DIR_EAST */ return behavior === MB_EAST_ARROW_WARP;
    default: return false;
  }
}

/** Classifier le metatile en WarpKind. Utilisé par PlayerStep au step end +
 *  collision dispatch. Returns null si pas un warp. */
export function getWarpKindFor(behavior: number): WarpKind | null {
  if (behavior === MB_ANIMATED_DOOR) return 'door';
  if (behavior === MB_NON_ANIMATED_DOOR
   || behavior === MB_WATER_DOOR
   || behavior === MB_DEEP_SOUTH_WARP) return 'step';
  if (behavior === MB_LADDER) return 'ladder';
  if (behavior === MB_NORTH_ARROW_WARP
   || behavior === MB_SOUTH_ARROW_WARP
   || behavior === MB_EAST_ARROW_WARP
   || behavior === MB_WEST_ARROW_WARP) return 'arrow';
  if (behavior === MB_CRACKED_FLOOR_HOLE
   || behavior === MB_MT_PYRE_HOLE) return 'fall';
  if (behavior === MB_AQUA_HIDEOUT_WARP) return 'teleport';
  if (behavior === MB_UP_ESCALATOR
   || behavior === MB_DOWN_ESCALATOR) return 'escalator';
  return null;
}

// ─── Exit task classification ───────────────────────────────────────────────

/** 1:1 décomp `SetUpWarpExitTask` (field_screen_effect.c:256).
 *  Selon le metatile_behavior à la position du player post-warp, choisit
 *  l'exit task à run :
 *    - IsDoor         → 'door' (Task_ExitDoor : door open + walk-down + door close)
 *    - IsNonAnimDoor  → 'non_anim' (Task_ExitNonAnimDoor : juste walk-down)
 *    - else           → 'none' (Task_ExitNonDoor : no walk-down, juste unlock)
 */
export function getExitTaskKindFor(behavior: number): ExitTaskKind {
  // 1:1 décomp `MetatileBehavior_IsDoor` :
  //   == MB_PETALBURG_GYM_DOOR || == MB_ANIMATED_DOOR
  if (behavior === MB_ANIMATED_DOOR) return 'door';
  // 1:1 décomp `MetatileBehavior_IsNonAnimDoor` :
  //   == MB_NON_ANIMATED_DOOR || == MB_WATER_DOOR || == MB_DEEP_SOUTH_WARP
  if (behavior === MB_NON_ANIMATED_DOOR
   || behavior === MB_WATER_DOOR
   || behavior === MB_DEEP_SOUTH_WARP) return 'non_anim';
  return 'none';
}

/** Read le metatile_behavior à la position courante du player.
 *  Helper pour scene executeWarp post-load → dispatch exit task. */
export function getMetatileBehaviorAtPlayerPos(): number {
  return MapGridGetMetatileBehaviorAt(gPlayerAvatar.x + MAP_OFFSET, gPlayerAvatar.y + MAP_OFFSET);
}

// ─── Player coords resolution ───────────────────────────────────────────────

/** 1:1 décomp `SetPlayerCoordsFromWarp` (overworld.c:603) — résout les coords
 *  du player dans la map dest depuis warp.warpId.
 *
 *  Audit Opus 2.6 : avant ce fix, facing était hardcoded à `DIR_SOUTH` pour
 *  tous les warps. Ça cassait les ladders/arrows/escalators qui doivent
 *  préserver le facing courant pour que `Task_ExitNonAnimDoor` walk dans la
 *  bonne direction.
 *
 *  Comportement 1:1 décomp :
 *  - **Door warps** (= MB_ANIMATED_DOOR / MB_NON_ANIMATED_DOOR) : facing post-
 *    warp = DIR_SOUTH (= player walks DOWN out of door, donc arrive facing
 *    south). C'est `Task_ExitDoor` / `Task_ExitNonAnimDoor` qui walk DOWN +
 *    set facing south implicitement.
 *  - **Ladder warps** : facing post-warp = current (= player monte/descend
 *    sans tourner).
 *  - **Arrow warps** : facing post-warp = direction de l'arrow (e.g.
 *    MB_NORTH_ARROW_WARP arrival → facing NORTH because player montait).
 *  - **Stairs/escalator** : facing post-warp = direction de l'escalator.
 *
 *  Pour MVP, on retourne `currentFacing` par défaut. La scene executeWarp
 *  override avec DIR_SOUTH si exitKind = 'door' ou 'non_anim'. C'est plus
 *  flexible et 1:1 décomp pour les autres cases.
 *
 *  @returns { x, y, facing } pour spawn dans la dest map.
 */
export function getPlayerCoordsFromWarp(
  destMapHeader: MapHeader,
  destWarpId: number,
): { x: number; y: number; facing: number } {
  const warps = destMapHeader.events.warps;
  const id = (destWarpId >= 0 && destWarpId < warps.length) ? destWarpId : 0;
  if (id !== destWarpId) {
    console.warn(`[warp-system] destWarpId ${destWarpId} out of range (${warps.length} warps), fallback 0`);
  }
  const dest = warps[id];
  if (!dest) {
    return {
      x: Math.floor(destMapHeader.mapLayout.width / 2),
      y: Math.floor(destMapHeader.mapLayout.height / 2),
      facing: gPlayerAvatar.facing,  // = preserve current facing
    };
  }
  // 1:1 décomp : preserve facing courant. La scene executeWarp override
  // DIR_SOUTH pour door/non_anim exit task + Task_ExitDoor walk-down.
  return { x: dest.x, y: dest.y, facing: gPlayerAvatar.facing };
}

// ─── Reset ─────────────────────────────────────────────────────────────────

/** Clear pending warp + flag reset. À call quand on réinit la scene. */
export function resetWarpState(): void {
  _gPendingWarp = null;
  _gPendingWarpKind = null;
}

// Re-exports pour back-compat avec ancien API (= player-avatar import).
// TODO Phase 4.7 : refactor caller pour use new typed API.
