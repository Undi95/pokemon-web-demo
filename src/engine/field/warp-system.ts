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

import type { WarpEvent, MapHeader } from '../../game/fieldmap';
import { gMapHeader, MapGridGetMetatileBehaviorAt, MAP_OFFSET } from '../../game/fieldmap';
import { GetMapConnection } from '../../game/overworld';
import { CONNECTION_DIVE, CONNECTION_EMERGE } from '../decomp-data/include/constants/global-data';
import type { WarpData } from '../save/save-blocks';
import {
  MAP_TYPE_TOWN, MAP_TYPE_CITY, MAP_TYPE_ROUTE,
  MAP_TYPE_UNDERWATER, MAP_TYPE_OCEAN_ROUTE,
} from '../decomp-data/include/constants/map_types-data';
import { Overworld_GetMapHeaderByGroupAndId } from '../system/decomp-bridge';
import { GetPlayerFacingDirection, DIR_NORTH, DIR_SOUTH, DIR_EAST, DIR_WEST } from '../../game/field_player_avatar';
import { gSaveBlock1Ptr } from '../save/save-block-state';
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
import {
  MetatileBehavior_IsWarpDoor,
  MetatileBehavior_IsDoor,
  MetatileBehavior_IsNonAnimDoor,
  MetatileBehavior_IsDeepSouthWarp,
  MetatileBehavior_IsLadder,
  MetatileBehavior_IsEscalator,
  MetatileBehavior_IsNorthArrowWarp,
  MetatileBehavior_IsSouthArrowWarp,
  MetatileBehavior_IsEastArrowWarp,
  MetatileBehavior_IsWestArrowWarp,
  MetatileBehavior_IsLavaridgeB1FWarp,
  MetatileBehavior_IsLavaridge1FWarp,
  MetatileBehavior_IsAquaHideoutWarp,
  MetatileBehavior_IsUnionRoomWarp,
  MetatileBehavior_IsMossdeepGymWarp,
  MetatileBehavior_IsMtPyreHole,
  MetatileBehavior_IsCrackedFloorHole,
  MetatileBehavior_IsCrackedFloor,
  MetatileBehavior_IsBattlePyramidWarp,
  MetatileBehavior_IsOpenSecretBaseDoor,
  IsWarpMetatileBehavior as _IsWarpMetatileBehavior,
  IsArrowWarpMetatileBehavior as _IsArrowWarpMetatileBehavior,
} from '../../game/metatile_behavior';

// ─── Warp kind classification ───────────────────────────────────────────────

/** Type de warp détecté. Dispatché par executeWarp dans la scene.
 *  1:1 décomp branches dans `TryStartWarpEventScript` (field_control_avatar.c:702)
 *  + `TryDoorWarp` (line 833) + `TryArrowWarp` (line 688).
 *
 *  Chaque kind correspond à un `Do*Warp` du décomp `field_screen_effect.c` :
 *    - door         → `DoDoorWarp` (= door open SE + anim + walk-up + warp).
 *    - step         → `DoWarp` (= step on non_anim door / water door / deep south).
 *    - ladder       → `DoWarp` (= no walk-down, preserves facing).
 *    - arrow        → `DoWarp` (= arrow direction match + held).
 *    - fall         → `DoFallWarp` (= cracked floor hole fall anim).
 *    - mt_pyre_hole → `ScriptContext_SetupScript(EventScript_FallDownHoleMtPyre)`
 *                     (= 1:1 décomp Mt Pyre fall via script, PAS DoFallWarp).
 *    - aqua_teleport→ `DoTeleportTileWarp` (= spin enter anim).
 *    - union_room   → `DoSpinExitWarp` (= union room spin exit).
 *    - escalator_up / escalator_down → `DoEscalatorWarp(metatileBehavior)`.
 *    - lavaridge_b1f→ `DoLavaridgeGymB1FWarp` (= fire pop anim).
 *    - lavaridge_1f → `DoLavaridgeGym1FWarp` (= hole drop anim).
 *    - mossdeep_gym → `DoMossdeepGymWarp` (= specific Mossdeep effect).
 *    - secret_base  → `WarpIntoSecretBase` (= push NORTH sur secret base ouvert).
 */
export type WarpKind =
  | 'door'         // MB_ANIMATED_DOOR (= TryDoorWarp push NORTH)
  | 'step'         // MB_NON_ANIMATED_DOOR / MB_WATER_DOOR / MB_DEEP_SOUTH_WARP (= TryStartWarpEventScript step)
  | 'ladder'       // MB_LADDER (= preserve facing)
  | 'arrow'        // MB_*_ARROW_WARP (= TryArrowWarp held direction match)
  | 'fall'         // MB_CRACKED_FLOOR_HOLE (= DoFallWarp post-cracked-floor step)
  | 'mt_pyre_hole' // MB_MT_PYRE_HOLE (= script EventScript_FallDownHoleMtPyre)
  | 'aqua_teleport'// MB_AQUA_HIDEOUT_WARP (= DoTeleportTileWarp spin enter)
  | 'union_room'   // MB_BRIDGE_OVER_OCEAN reused (= DoSpinExitWarp)
  | 'escalator_up' // MB_UP_ESCALATOR (= DoEscalatorWarp up direction)
  | 'escalator_down'// MB_DOWN_ESCALATOR (= DoEscalatorWarp down direction)
  | 'lavaridge_b1f'// MB_LAVARIDGE_GYM_B1F_WARP (= fire pop to F1)
  | 'lavaridge_1f' // MB_LAVARIDGE_GYM_1F_WARP (= hole drop to B1F)
  | 'mossdeep_gym' // MB_MOSSDEEP_GYM_WARP (= Mossdeep specific spin)
  | 'secret_base'; // IsOpenSecretBaseDoor (= push NORTH WarpIntoSecretBase)

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
/** 1:1 STRICT décomp `GetWarpEventAtPosition` (field_control_avatar.c:860-875) :
 *  filtre par (x, y) ET elevation (= warpEvent->elevation == elevation OR
 *  warpEvent->elevation == ELEVATION_TRANSITION).
 *
 *  @param elevation Default 0 (= ELEVATION_TRANSITION) matche toutes les elevations
 *                   (= safe default pour les call-sites qui n'ont pas d'elevation contextuelle). */
export function findWarpEventAt(x: number, y: number, elevation: number = 0): WarpEvent | null {
  if (!gMapHeader) return null;
  const warps = gMapHeader.events.warps;
  for (const warp of warps) {
    if (warp.x === x && warp.y === y) {
      // 1:1 strict décomp ligne 870 : check elevation match OR ELEVATION_TRANSITION.
      if (warp.elevation === elevation || warp.elevation === 0) {
        return warp;
      }
    }
  }
  return null;
}

/** Find warp à la position courante du player. */
export function getWarpAtPlayerPos(): WarpEvent | null {
  return findWarpEventAt(gSaveBlock1Ptr.pos.x, gSaveBlock1Ptr.pos.y);
}

/** 1:1 décomp `IsWarpMetatileBehavior` (field_control_avatar.c:751-765).
 *  Returns TRUE si le metatile_behavior est un type de warp détecté
 *  par TryStartWarpEventScript (= step warp).
 *
 *  Délégué au helper 1:1 strict dans `metatile-behavior.ts`. */
export function isWarpMetatileBehavior(behavior: number): boolean {
  return _IsWarpMetatileBehavior(behavior);
}

/** 1:1 décomp `IsArrowWarpMetatileBehavior` (field_control_avatar.c:767-781).
 *  Returns TRUE si tile + direction = arrow warp matching.
 *
 *  Délégué au helper 1:1 strict dans `metatile-behavior.ts`. */
export function isArrowWarpMetatileBehavior(behavior: number, direction: number): boolean {
  return _IsArrowWarpMetatileBehavior(behavior, direction);
}

/** Classifier le metatile en WarpKind. 1:1 décomp dispatch ordre de
 *  `TryStartWarpEventScript` (field_control_avatar.c:702-749) + `TryDoorWarp`
 *  (line 833) + `TryArrowWarp` (line 688).
 *
 *  Important : l'ordre du dispatch décomp est SIGNIFICATIF — certains tiles
 *  peuvent matcher plusieurs helpers (= e.g. door tile matche aussi
 *  `IsWarpMetatileBehavior` qui inclut `IsWarpDoor`). On retourne le PREMIER
 *  match en suivant l'ordre décomp.
 *
 *  Returns null si pas un warp. */
export function getWarpKindFor(behavior: number): WarpKind | null {
  // 1. Secret base door (= TryDoorWarp push NORTH branch décomp:839-843).
  //    Premier check parce que `IsOpenSecretBaseDoor` overlap pas avec autres.
  if (MetatileBehavior_IsOpenSecretBaseDoor(behavior)) return 'secret_base';

  // 2. Door warp (= TryDoorWarp décomp:845-855, MB_ANIMATED_DOOR).
  if (MetatileBehavior_IsWarpDoor(behavior)) return 'door';

  // 3. Arrow warps (= TryArrowWarp décomp:688-700). Direction-spécifique mais
  //    le classifier ici n'a pas la direction → retourne 'arrow' générique,
  //    le caller (= player-avatar) check IsArrowWarpMetatileBehavior(behavior,
  //    direction) avant d'invoquer.
  if (MetatileBehavior_IsNorthArrowWarp(behavior)
   || MetatileBehavior_IsSouthArrowWarp(behavior)
   || MetatileBehavior_IsEastArrowWarp(behavior)
   || MetatileBehavior_IsWestArrowWarp(behavior)) return 'arrow';

  // 4. Special warps (= TryStartWarpEventScript dispatch ordre 1:1).
  //    `IsEscalator` retourné split UP/DOWN pour permettre dispatch correct.
  if (behavior === MB_UP_ESCALATOR) return 'escalator_up';
  if (behavior === MB_DOWN_ESCALATOR) return 'escalator_down';
  if (MetatileBehavior_IsLavaridgeB1FWarp(behavior)) return 'lavaridge_b1f';
  if (MetatileBehavior_IsLavaridge1FWarp(behavior)) return 'lavaridge_1f';
  if (MetatileBehavior_IsAquaHideoutWarp(behavior)) return 'aqua_teleport';
  if (MetatileBehavior_IsUnionRoomWarp(behavior)) return 'union_room';
  if (MetatileBehavior_IsMtPyreHole(behavior)) return 'mt_pyre_hole';
  if (MetatileBehavior_IsMossdeepGymWarp(behavior)) return 'mossdeep_gym';

  // 5. Cracked floor hole (= fall warp, dispatch via player step). Pas couvert
  //    par `IsWarpMetatileBehavior` du décomp (= géré par player collision).
  if (MetatileBehavior_IsCrackedFloorHole(behavior)) return 'fall';

  // 6. Non-anim door + ladder (= TryStartWarpEventScript fallback DoWarp).
  if (MetatileBehavior_IsNonAnimDoor(behavior)) return 'step';
  if (MetatileBehavior_IsLadder(behavior)) return 'ladder';

  return null;
}

// ─── Exit task classification ───────────────────────────────────────────────

/** 1:1 décomp `SetUpWarpExitTask` (field_screen_effect.c:256).
 *
 *  Body décomp :
 *  ```c
 *  static u8 SetUpWarpExitTask(void) {
 *      s16 x, y;
 *      u8 behavior;
 *      const TaskFunc *func;
 *      PlayerGetDestCoords(&x, &y);
 *      behavior = MapGridGetMetatileBehaviorAt(x, y);
 *      if (MetatileBehavior_IsDoor(behavior) == TRUE)
 *          func = sExitDoorTaskFunc;       // = Task_ExitDoor
 *      else if (MetatileBehavior_IsNonAnimDoor(behavior) == TRUE)
 *          func = sExitNonAnimDoorTaskFunc; // = Task_ExitNonAnimDoor
 *      else
 *          func = sExitNonDoorTaskFunc;    // = Task_ExitNonDoor
 *      return CreateTask(*func, 0);
 *  }
 *  ```
 *
 *  Délégué aux helpers 1:1 strict `MetatileBehavior_IsDoor` / `IsNonAnimDoor`. */
export function getExitTaskKindFor(behavior: number): ExitTaskKind {
  if (MetatileBehavior_IsDoor(behavior)) return 'door';
  if (MetatileBehavior_IsNonAnimDoor(behavior)) return 'non_anim';
  return 'none';
}

/** Read le metatile_behavior à la position courante du player.
 *  Helper pour scene executeWarp post-load → dispatch exit task. */
export function getMetatileBehaviorAtPlayerPos(): number {
  return MapGridGetMetatileBehaviorAt(gSaveBlock1Ptr.pos.x + MAP_OFFSET, gSaveBlock1Ptr.pos.y + MAP_OFFSET);
}

// ─── Post-warp facing direction ─────────────────────────────────────────────

/** 1:1 décomp `GetAdjustedInitialDirection` (overworld.c:929-952). Détermine
 *  la direction du facing du player après le load de la dest map, selon le
 *  metatile_behavior à la position post-warp + son ancien facing.
 *
 *  Décomp appelé via `GetInitialPlayerAvatarState()` → `InitObjectEventsLocal`
 *  → `InitPlayerAvatar(x, y, direction, gender)` au spawn dans la dest map.
 *  Donc le facing est défini AVANT que `FieldCB_DefaultWarpExit` ne lance
 *  `Task_ExitNonAnimDoor` qui lit `GetPlayerFacingDirection()` pour walker
 *  dans cette direction (= push 1 case).
 *
 *  Cas couverts (= 1:1 décomp branches) :
 *  - MB_DEEP_SOUTH_WARP     → DIR_NORTH (= player vient du sud)
 *  - MB_NON_ANIMATED_DOOR   → DIR_SOUTH (= escalier classique, push south)
 *  - MB_ANIMATED_DOOR       → DIR_SOUTH (= porte normale, push south)
 *  - MB_SOUTH_ARROW_WARP    → DIR_NORTH
 *  - MB_NORTH_ARROW_WARP    → DIR_SOUTH
 *  - MB_WEST_ARROW_WARP     → DIR_EAST
 *  - MB_EAST_ARROW_WARP     → DIR_WEST
 *  - MB_LADDER              → preserve previousDirection (= keep facing)
 *  - default                → DIR_SOUTH
 *
 *  Skipped (= MVP, à porter si besoin) :
 *  - FLAG_SYS_CRUISE_MODE + MAP_TYPE_OCEAN_ROUTE → DIR_EAST
 *  - underwater/surfing transition flags
 *  - MetatileBehavior_IsWaterDoor → traitée comme MB_NON_ANIMATED_DOOR
 *    (= notre classifier IsNonAnimDoor inclut MB_WATER_DOOR, c'est cohérent).
 */
export function GetAdjustedInitialDirection(
  metatileBehavior: number,
  previousDirection: number,
): number {
  // 1:1 décomp branches (= overworld.c:929-952, ordre conservé pour priorité
  // identique). Skipped : FLAG_SYS_CRUISE_MODE + MAP_TYPE_OCEAN_ROUTE → DIR_EAST,
  // PLAYER_AVATAR_FLAG_SURFING → preserve, à porter quand surf wired.
  if (MetatileBehavior_IsDeepSouthWarp(metatileBehavior)) return DIR_NORTH;
  if (MetatileBehavior_IsNonAnimDoor(metatileBehavior)) return DIR_SOUTH;
  if (MetatileBehavior_IsDoor(metatileBehavior)) return DIR_SOUTH;
  if (MetatileBehavior_IsSouthArrowWarp(metatileBehavior)) return DIR_NORTH;
  if (MetatileBehavior_IsNorthArrowWarp(metatileBehavior)) return DIR_SOUTH;
  if (MetatileBehavior_IsWestArrowWarp(metatileBehavior)) return DIR_EAST;
  if (MetatileBehavior_IsEastArrowWarp(metatileBehavior)) return DIR_WEST;
  if (MetatileBehavior_IsLadder(metatileBehavior)) return previousDirection;
  // Default 1:1 décomp ligne 951 : DIR_SOUTH.
  return DIR_SOUTH;
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
      facing: GetPlayerFacingDirection(),  // = preserve current facing
    };
  }
  // 1:1 décomp : preserve facing courant. La scene executeWarp override
  // DIR_SOUTH pour door/non_anim exit task + Task_ExitDoor walk-down.
  return { x: dest.x, y: dest.y, facing: GetPlayerFacingDirection() };
}

// ─── Reset ─────────────────────────────────────────────────────────────────

/** Clear pending warp + flag reset. À call quand on réinit la scene. */
export function resetWarpState(): void {
  _gPendingWarp = null;
  _gPendingWarpKind = null;
}

// ─── DynamicWarp 1:1 décomp (= setdynamicwarp opcode) ────────────────────────

/** 1:1 décomp `ScrCmd_setdynamicwarp` (scrcmd.c) :
 *    SetDynamicWarp(mapGroup, mapNum, warpId);
 *  Stocke dans `gSaveBlock1Ptr->dynamicWarp` la prochaine destination MAP_DYNAMIC.
 *  Notre port : mapId est string (= conversion mapGroup/mapNum → name déférée),
 *  stocké dans `__dynamicWarpMapId` overlay. */
export function SetDynamicWarp(mapId: string, x: number, y: number): void {
  gSaveBlock1Ptr.dynamicWarp = { mapGroup: 0, mapNum: 0, warpId: -1, x, y };
  (gSaveBlock1Ptr as unknown as Record<string, string>).__dynamicWarpMapId = mapId;
}

/** 1:1 décomp `GetDynamicWarp` accessor : lit gSaveBlock1Ptr->dynamicWarp.
 *  Retourne undefined si pas set. */
export function GetDynamicWarp(): { mapId: string; x: number; y: number } | undefined {
  const w = gSaveBlock1Ptr.dynamicWarp as { x: number; y: number } | undefined;
  const mapId = (gSaveBlock1Ptr as unknown as Record<string, string>).__dynamicWarpMapId;
  if (!mapId || !w) return undefined;
  return { mapId, x: w.x, y: w.y };
}

// ─── Dive warp (1:1 décomp overworld.c:740-781 + field_screen_effect.c:495) ──
//
// Le décomp stocke la destination dans le global `sWarpDestination` (consommé par
// WarpIntoMap au chargement). Notre modèle warp transporte la dest DANS l'objet
// pending-warp (destMap/x/y, warpId:-1 = coords directes — même chemin que
// __devGotoMap, PROUVÉ : une map underwater charge bien). On stocke donc la dest
// dans `_sDiveWarpDest` puis `DoDiveWarp` la pousse via setPendingWarp.

/** Destination du prochain warp Dive, posée par SetDiveWarp, consommée par DoDiveWarp. */
let _sDiveWarpDest: { destMap: string; x: number; y: number } | null = null;

/** 1:1 STRICT décomp `SetDiveWarp(u8 dir, u16 x, u16 y)` (overworld.c:756) :
 *    connection = GetMapConnection(dir);
 *    if (connection != NULL) SetWarpDestination(connection->mapGroup, mapNum, WARP_ID_NONE, x, y);
 *    else { RunOnDiveWarpMapScript(); if (IsDummyWarp(&sFixedDiveWarp)) return FALSE; SetWarpDestinationToDiveWarp(); }
 *    return TRUE;
 *  (x, y) = coords LOCALES du joueur. Branche connexion = cas commun (Route124→Underwater).
 *  ⚠️ DETTE : la branche `sFixedDiveWarp` (maps à dive warp fixe via opcode `setdivewarp` :
 *  Marine Cave, Sealed Chamber…) n'est pas portée → on retourne FALSE s'il n'y a pas de
 *  connexion (= "pas de dive ici", comportement honnête, pas un stub qui fait semblant). */
function SetDiveWarp(dir: number, x: number, y: number): boolean {
  const connection = GetMapConnection(dir);
  if (connection !== null) {
    // SetWarpDestination(connection->map, WARP_ID_NONE, x, y) : dest = map connectée aux (x,y).
    _sDiveWarpDest = { destMap: connection.destMap, x, y };
    return true;
  }
  // Branche fixed-dive-warp non portée (dette documentée).
  return false;
}

/** 1:1 STRICT décomp `SetDiveWarpEmerge(u16 x, u16 y)` (overworld.c:774). */
export function SetDiveWarpEmerge(x: number, y: number): boolean {
  return SetDiveWarp(CONNECTION_EMERGE, x, y);
}

/** 1:1 STRICT décomp `SetDiveWarpDive(u16 x, u16 y)` (overworld.c:779). */
export function SetDiveWarpDive(x: number, y: number): boolean {
  return SetDiveWarp(CONNECTION_DIVE, x, y);
}

/** 1:1 décomp `DoDiveWarp(void)` (field_screen_effect.c:495) :
 *    LockPlayerFieldControls(); TryFadeOutOldMapMusic(); WarpFadeOutScreen();
 *    PlayRainStoppingSoundEffect(); gFieldCallback = FieldCB_DefaultWarpExit;
 *    CreateTask(Task_WarpAndLoadMap, 10);
 *  Adaptation port : le warp = `setPendingWarp(dest, 'step')` (la scène MainCB2 le
 *  consomme → fade + Task_WarpAndLoadMap + exit task selon la tuile dest, comme
 *  __devGotoMap). Musique/SE = skip 1:1 (audio). La dest doit avoir été posée par
 *  SetDiveWarpDive/Emerge. */
export function DoDiveWarp(): void {
  if (!_sDiveWarpDest) return;
  setPendingWarp(
    { destMap: _sDiveWarpDest.destMap, x: _sDiveWarpDest.x, y: _sDiveWarpDest.y, elevation: 0, warpId: -1 },
    'step',
  );
}

// ─── Map type helpers (1:1 décomp overworld.c:1334-1364) ────────────────────

/** 1:1 décomp `EWRAM_DATA struct WarpData gLastUsedWarp = {0}` (overworld.c:193).
 *  Mémorise la map source d'où le player vient d'arriver. Set par ApplyCurrentWarp
 *  (overworld.c:542) AVANT le swap location → dest.
 *
 *  Notre port : init à gSaveBlock1Ptr.location au boot (= "venu de la même map
 *  qu'on est"). À jour via setLastUsedWarp() au moment du warp. Tant que le
 *  wire complet ApplyCurrentWarp n'est pas porté, les Get*MapType helpers
 *  retourneront le type de la map courante = OK pour overworld stable, peut
 *  être faux dans cas spécifique de check "où ai-je été précédemment".
 *  Dette R3 documentée : wire setLastUsedWarp dans tous les flow Do*Warp. */
export const gLastUsedWarp: WarpData = { mapGroup: 0, mapNum: 0, warpId: 0, x: 0, y: 0 };

/** 1:1 décomp ApplyCurrentWarp prelude (overworld.c:542) :
 *  `gLastUsedWarp = gSaveBlock1Ptr->location;`. Doit être appelé AVANT que
 *  gSaveBlock1Ptr.location soit overwrite par le swap warp. */
export function setLastUsedWarp(w: WarpData): void {
  gLastUsedWarp.mapGroup = w.mapGroup;
  gLastUsedWarp.mapNum = w.mapNum;
  gLastUsedWarp.warpId = w.warpId;
  gLastUsedWarp.x = w.x;
  gLastUsedWarp.y = w.y;
}

/** 1:1 décomp `u8 GetMapTypeByGroupAndId(s8 mapGroup, s8 mapNum)` (overworld.c:1334) :
 *  `return Overworld_GetMapHeaderByGroupAndId(mapGroup, mapNum)->mapType;`. */
export function GetMapTypeByGroupAndId(mapGroup: number, mapNum: number): number {
  const hdr = Overworld_GetMapHeaderByGroupAndId(mapGroup, mapNum);
  return (hdr?.mapType ?? 0) & 0xFF;
}

/** 1:1 décomp `u8 GetMapTypeByWarpData(struct WarpData *warp)` (overworld.c:1339) :
 *  `return GetMapTypeByGroupAndId(warp->mapGroup, warp->mapNum);`. */
export function GetMapTypeByWarpData(warp: WarpData): number {
  return GetMapTypeByGroupAndId(warp.mapGroup, warp.mapNum);
}

/** 1:1 décomp `u8 GetCurrentMapType(void)` (overworld.c:1344) :
 *  `return GetMapTypeByWarpData(&gSaveBlock1Ptr->location);`. */
export function GetCurrentMapType(): number {
  return GetMapTypeByWarpData(gSaveBlock1Ptr.location);
}

/** 1:1 décomp `u8 GetLastUsedWarpMapType(void)` (overworld.c:1349) :
 *  `return GetMapTypeByWarpData(&gLastUsedWarp);`. */
export function GetLastUsedWarpMapType(): number {
  return GetMapTypeByWarpData(gLastUsedWarp);
}

/** 1:1 décomp `bool8 IsMapTypeOutdoors(u8 mapType)` (overworld.c:1354) :
 *  `return mapType == ROUTE || TOWN || UNDERWATER || CITY || OCEAN_ROUTE;`. */
export function IsMapTypeOutdoors(mapType: number): boolean {
  return mapType === MAP_TYPE_ROUTE
      || mapType === MAP_TYPE_TOWN
      || mapType === MAP_TYPE_UNDERWATER
      || mapType === MAP_TYPE_CITY
      || mapType === MAP_TYPE_OCEAN_ROUTE;
}

// Re-exports pour back-compat avec ancien API (= player-avatar import).
// TODO Phase 4.7 : refactor caller pour use new typed API.
