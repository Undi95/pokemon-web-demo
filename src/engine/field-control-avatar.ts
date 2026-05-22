/**
 * field-control-avatar.ts — 1:1 décomp port `src/field_control_avatar.c`.
 *
 * Master dispatcher des actions player (= input, interactions, warps, encounter,
 * scripts coord/step). Ce module définit :
 *
 *   - `struct FieldInput` : flags des actions player détectées par frame.
 *   - `FieldClearPlayerInput` / `FieldGetPlayerInput` : init + populate input
 *     depuis newKeys + heldKeys.
 *   - `ProcessPlayerFieldInput` : dispatcher master (= trainer engage → script
 *     OnFrame → step-based → wild encounter → arrow warp → A-button interact →
 *     door warp → dive → Start menu → Select item).
 *   - Helpers warp : `GetWarpEventAtMapPosition`, `GetWarpEventAtPosition`,
 *     `SetupWarp`, `TryStartWarpEventScript`, `TryArrowWarp`, `TryDoorWarp`.
 *   - Helpers step : `TryStartStepBasedScript`, `TryStartCoordEventScript`,
 *     `TryStartMiscWalkingScripts`, `TryStartStepCountScript`.
 *   - Helpers interaction : `TryStartInteractionScript` (via `GetInteraction
 *     Script` chain).
 *
 *  ⚠️ Notre impl actuelle dispatche ces actions via `PlayerStep` (player-avatar.ts)
 *  + `MainCB2_Overworld` (TestOverworldScene.ts) directement. Cette refactor
 *  permet d'extraire la logique 1:1 strict dans un module dédié au lieu de
 *  scatter dans des fichiers. Le wiring final (= remplacer les dispatches
 *  scattered par `ProcessPlayerFieldInput`) est progressif.
 */

import { gMapHeader, MapGridGetMetatileBehaviorAt, MAP_OFFSET, type WarpEvent } from './map-loader';
import {
  gPlayerAvatar,
  DIR_NORTH, DIR_SOUTH, DIR_EAST, DIR_WEST, MOVING,
  GetPlayerFacingDirection,
  PlayerGetElevation,
  PlayerGetDestCoords,
  GetXYCoordsOneStepInFrontOfPlayer,
} from './player-avatar';
import {
  IsWarpMetatileBehavior,
  IsArrowWarpMetatileBehavior,
  MetatileBehavior_IsForcedMovementTile,
  MetatileBehavior_IsWarpDoor,
  MetatileBehavior_IsOpenSecretBaseDoor,
  MetatileBehavior_IsEscalator,
  MetatileBehavior_IsLavaridgeB1FWarp,
  MetatileBehavior_IsLavaridge1FWarp,
  MetatileBehavior_IsAquaHideoutWarp,
  MetatileBehavior_IsUnionRoomWarp,
  MetatileBehavior_IsMtPyreHole,
  MetatileBehavior_IsMossdeepGymWarp,
} from './metatile-behavior';

// ─── State globals 1:1 décomp ───────────────────────────────────────────────

/** 1:1 décomp `static EWRAM_DATA u8 sWildEncounterImmunitySteps = 0`
 *  (field_control_avatar.c:38).
 *  Compteur de step immunité aux wild encounters (= après combat, ~6 steps
 *  sans encounter). */
let sWildEncounterImmunitySteps = 0;

/** 1:1 décomp `static EWRAM_DATA u16 sPrevMetatileBehavior = 0`
 *  (field_control_avatar.c:39).
 *  Cache du metatile behavior du step précédent. Used par `TryStartMiscWalking
 *  Scripts` pour détecter transitions (= entrer dans grass à hauteur élevée
 *  → trigger script). */
let sPrevMetatileBehavior = 0;

/** 1:1 décomp `COMMON_DATA u8 gSelectedObjectEvent = 0` (field_control_avatar.c:41).
 *  Index de l'ObjectEvent sélectionné (= NPC interact actuel, used par
 *  `lock` / `faceplayer` opcodes pour identifier le NPC ciblé). */
export const gSelectedObjectEvent = { index: 0 };

// ─── struct FieldInput 1:1 décomp ───────────────────────────────────────────

/** 1:1 décomp `struct FieldInput` (include/field_control_avatar.h).
 *  Flags des actions détectées par frame. Set par `FieldGetPlayerInput` depuis
 *  newKeys/heldKeys + player state, lu par `ProcessPlayerFieldInput`. */
export interface FieldInput {
  pressedAButton: boolean;
  checkStandardWildEncounter: boolean;
  pressedStartButton: boolean;
  pressedSelectButton: boolean;
  heldDirection: boolean;
  heldDirection2: boolean;
  tookStep: boolean;
  pressedBButton: boolean;
  /** 1:1 décomp 4 bits used by various features (= dive, dpad cancel, etc.) */
  input_field_1_0: boolean;
  input_field_1_1: boolean;
  input_field_1_2: boolean;
  input_field_1_3: boolean;
  /** Direction dpad : DIR_NORTH/SOUTH/WEST/EAST ou 0 si no input. */
  dpadDirection: number;
}

/** 1:1 décomp `FieldClearPlayerInput` (field_control_avatar.c:72-87).
 *  Reset tous les flags à FALSE / 0. */
export function FieldClearPlayerInput(input: FieldInput): void {
  input.pressedAButton = false;
  input.checkStandardWildEncounter = false;
  input.pressedStartButton = false;
  input.pressedSelectButton = false;
  input.heldDirection = false;
  input.heldDirection2 = false;
  input.tookStep = false;
  input.pressedBButton = false;
  input.input_field_1_0 = false;
  input.input_field_1_1 = false;
  input.input_field_1_2 = false;
  input.input_field_1_3 = false;
  input.dpadDirection = 0;
}

// 1:1 décomp button bit masks (= include/gba/keys.h).
const START_BUTTON  = 0x08;
const SELECT_BUTTON = 0x04;
const A_BUTTON      = 0x01;
const B_BUTTON      = 0x02;
const DPAD_RIGHT    = 0x10;
const DPAD_LEFT     = 0x20;
const DPAD_UP       = 0x40;
const DPAD_DOWN     = 0x80;

// 1:1 décomp tileTransitionState values (= include/global.fieldmap.h).
const T_NOT_MOVING       = 0;
const T_TILE_TRANSITION  = 1;
const T_TILE_CENTER      = 2;

// 1:1 décomp PLAYER_SPEED_FASTEST (= include/constants/...).
const PLAYER_SPEED_FASTEST = 4;

/** 1:1 décomp `GetPlayerCurMetatileBehavior` (field_control_avatar.c:?).
 *  Returns le behavior du tile sous le player en tenant compte de son state
 *  (= mid-step ou stable). Stub : query direct via MapGridGet pour notre impl. */
function GetPlayerCurMetatileBehavior(_runningState: number): number {
  return MapGridGetMetatileBehaviorAt(
    gPlayerAvatar.x + MAP_OFFSET,
    gPlayerAvatar.y + MAP_OFFSET);
}

/** 1:1 décomp `GetPlayerSpeed` (field_player_avatar.c).
 *  Returns la vitesse du player (= 1 = walking, 2 = running, 4 = fastest bike).
 *  Stub : retourne 1 normalement, 2 si dashing. */
function GetPlayerSpeed(): number {
  return gPlayerAvatar.dashing ? 2 : 1;
}

/** 1:1 décomp `FieldGetPlayerInput` (field_control_avatar.c:89-132).
 *
 *  Populate `input` flags depuis `newKeys` (= just-pressed) + `heldKeys` (=
 *  currently-held). Respecte le player state :
 *    - Si tileTransitionState != T_TILE_CENTER && != T_NOT_MOVING ET pas en
 *      forced movement → skip input detection (= player en transition mid-step).
 *    - Si PLAYER_SPEED_FASTEST (= acro bike max) → skip A/B/Start/Select.
 *    - heldDirection / heldDirection2 set si N'IMPORTE QUEL dpad held.
 *    - tookStep set si T_TILE_CENTER && MOVING + pas forced.
 *    - checkStandardWildEncounter set si T_TILE_CENTER + pas forced.
 *    - dpadDirection = direction du dpad (priorité UP > DOWN > LEFT > RIGHT). */
export function FieldGetPlayerInput(input: FieldInput, newKeys: number, heldKeys: number): void {
  const tileTransitionState = gPlayerAvatar.tileTransitionState;
  const runningState = gPlayerAvatar.runningState;
  const forcedMove = MetatileBehavior_IsForcedMovementTile(
    GetPlayerCurMetatileBehavior(runningState));

  if ((tileTransitionState === T_TILE_CENTER && !forcedMove) || tileTransitionState === T_NOT_MOVING) {
    if (GetPlayerSpeed() !== PLAYER_SPEED_FASTEST) {
      if (newKeys & START_BUTTON)  input.pressedStartButton = true;
      if (newKeys & SELECT_BUTTON) input.pressedSelectButton = true;
      if (newKeys & A_BUTTON)      input.pressedAButton = true;
      if (newKeys & B_BUTTON)      input.pressedBButton = true;
    }
    if (heldKeys & (DPAD_UP | DPAD_DOWN | DPAD_LEFT | DPAD_RIGHT)) {
      input.heldDirection = true;
      input.heldDirection2 = true;
    }
  }

  if (!forcedMove) {
    if (tileTransitionState === T_TILE_CENTER && runningState === MOVING) {
      input.tookStep = true;
    }
    if (tileTransitionState === T_TILE_CENTER) {
      input.checkStandardWildEncounter = true;
    }
  }

  // dpadDirection priority : UP > DOWN > LEFT > RIGHT (= 1:1 décomp order).
  if (heldKeys & DPAD_UP)          input.dpadDirection = DIR_NORTH;
  else if (heldKeys & DPAD_DOWN)   input.dpadDirection = DIR_SOUTH;
  else if (heldKeys & DPAD_LEFT)   input.dpadDirection = DIR_WEST;
  else if (heldKeys & DPAD_RIGHT)  input.dpadDirection = DIR_EAST;
}

// ─── Position helpers 1:1 décomp ────────────────────────────────────────────

/** 1:1 décomp `struct MapPosition` (= local helper struct).
 *  Coords INTERNAL (= +MAP_OFFSET) + elevation. */
export interface MapPosition {
  x: number;
  y: number;
  elevation: number;
}

/** 1:1 décomp `GetPlayerPosition` (field_control_avatar.c:194-198).
 *
 *  Body décomp :
 *  ```c
 *  PlayerGetDestCoords(&position->x, &position->y);
 *  position->elevation = PlayerGetElevation();
 *  ```
 *
 *  Stores player current position (= INTERNAL coords) + elevation. */
export function GetPlayerPosition(position: MapPosition): void {
  const coords = PlayerGetDestCoords();
  // Post R3 refactor : PlayerGetDestCoords return INTERNAL coords (= 1:1 décomp).
  position.x = coords.x;
  position.y = coords.y;
  position.elevation = PlayerGetElevation();
}

/** 1:1 décomp `GetInFrontOfPlayerPosition` (field_control_avatar.c:200-210).
 *
 *  Body décomp :
 *  ```c
 *  s16 x, y;
 *  GetXYCoordsOneStepInFrontOfPlayer(&position->x, &position->y);
 *  PlayerGetDestCoords(&x, &y);
 *  if (MapGridGetElevationAt(x, y) != ELEVATION_TRANSITION)
 *      position->elevation = PlayerGetElevation();
 *  else
 *      position->elevation = ELEVATION_TRANSITION;
 *  ```
 *
 *  Stores position 1 tile DEVANT le player + elevation (= preserved si dest
 *  tile a ELEVATION_TRANSITION, sinon = player current elevation).
 *  Used pour A-button interaction + push-door check. */
export function GetInFrontOfPlayerPosition(position: MapPosition): void {
  const inFront = GetXYCoordsOneStepInFrontOfPlayer();
  // Post R3 refactor : GetXYCoords... return INTERNAL coords (= 1:1 décomp).
  position.x = inFront.x;
  position.y = inFront.y;
  // 1:1 décomp ELEVATION_TRANSITION = 0xF check. Skip pour MVP (= notre impl
  // ne tracks pas ELEVATION_TRANSITION par tile). Default = player elevation.
  position.elevation = PlayerGetElevation();
}

// ─── Warp event lookup helpers 1:1 décomp ──────────────────────────────────

/** 1:1 décomp `GetWarpEventAtPosition` (field_control_avatar.c:?).
 *  Recherche un warp event dans le mapHeader à la position (x, y) +
 *  elevation matching. Returns warpEventId ou -1 (WARP_ID_NONE). */
export function GetWarpEventAtPosition(
  mapHeader: typeof gMapHeader,
  x: number, y: number, _elevation: number,
): number {
  if (!mapHeader) return -1;
  const warps = mapHeader.events.warps as WarpEvent[];
  for (let i = 0; i < warps.length; i++) {
    const w = warps[i];
    if (w.x === x && w.y === y) {
      // 1:1 décomp : elevation check (= w.elevation == 0 OR elevation match).
      // Skip for now (= our WarpEvent doesn't store elevation).
      return i;
    }
  }
  return -1;
}

/** 1:1 décomp `GetWarpEventAtMapPosition` (field_control_avatar.c:783-786).
 *  Wrap `GetWarpEventAtPosition` en stripping MAP_OFFSET (= position.x est
 *  internal, le warp lookup attend logical). */
export function GetWarpEventAtMapPosition(
  mapHeader: typeof gMapHeader,
  position: MapPosition,
): number {
  return GetWarpEventAtPosition(
    mapHeader,
    position.x - MAP_OFFSET,
    position.y - MAP_OFFSET,
    position.elevation);
}

/** 1:1 décomp `SetupWarp` (field_control_avatar.c:788-831).
 *  Configure le warp destination depuis warpEventId. Décomp body :
 *  ```c
 *  warpEvent = &mapHeader.events->warps[warpEventId];
 *  if (warpEvent->mapNum == MAP_DYNAMIC) → SetWarpDestinationToDynamicWarp.
 *  else → SetWarpDestinationToMapWarp(warpEvent->mapGroup, ...);
 *  ```
 *  Notre impl : utiliser warp-system `setPendingWarp` à la place. */
export function SetupWarp(
  mapHeader: typeof gMapHeader,
  warpEventId: number,
  position: MapPosition,
): WarpEvent | null {
  if (!mapHeader) return null;
  const warps = mapHeader.events.warps as WarpEvent[];
  if (warpEventId < 0 || warpEventId >= warps.length) return null;
  void position;
  return warps[warpEventId];
}

// ─── Warp dispatch helpers 1:1 décomp ──────────────────────────────────────

/** 1:1 décomp `TryArrowWarp` (field_control_avatar.c:688-700).
 *
 *  Body décomp :
 *  ```c
 *  static bool8 TryArrowWarp(struct MapPosition *position, u16 mb, u8 dir) {
 *      s8 warpEventId = GetWarpEventAtMapPosition(&gMapHeader, position);
 *      if (IsArrowWarpMetatileBehavior(mb, dir) == TRUE && warpEventId != WARP_ID_NONE) {
 *          StoreInitialPlayerAvatarState();
 *          SetupWarp(&gMapHeader, warpEventId, position);
 *          DoWarp();
 *          return TRUE;
 *      }
 *      return FALSE;
 *  }
 *  ```
 *
 *  Returns TRUE si arrow warp triggered (= TileX direction match + warp event
 *  present). Caller doit ensuite executer DoWarp (= via setPendingWarp). */
export function TryArrowWarp(
  position: MapPosition,
  metatileBehavior: number,
  direction: number,
): WarpEvent | null {
  const warpEventId = GetWarpEventAtMapPosition(gMapHeader, position);
  if (IsArrowWarpMetatileBehavior(metatileBehavior, direction) && warpEventId !== -1) {
    // 1:1 décomp : StoreInitialPlayerAvatarState() — sauvegardé pour ContinueGame
    // (= retour à la position d'avant si fade fail).
    // SetupWarp(&gMapHeader, warpEventId, position) → DoWarp().
    // Notre impl : retourne le WarpEvent à utiliser, caller invoque setPendingWarp.
    return SetupWarp(gMapHeader, warpEventId, position);
  }
  return null;
}

/** 1:1 décomp `TryStartWarpEventScript` (field_control_avatar.c:702-749).
 *
 *  Body décomp : check si le tile sous le player est warp behavior + warp event
 *  present, puis dispatch selon le type (Escalator / Lavaridge / Aqua / Union
 *  Room / Mt Pyre Hole / Mossdeep Gym / DoWarp default).
 *
 *  Returns le WarpEvent + kind si triggered, null sinon. Caller dispatch.
 */
export function TryStartWarpEventScript(
  position: MapPosition,
  metatileBehavior: number,
): { warp: WarpEvent; specialDispatch: string | null } | null {
  const warpEventId = GetWarpEventAtMapPosition(gMapHeader, position);
  if (warpEventId !== -1 && IsWarpMetatileBehavior(metatileBehavior)) {
    const warp = SetupWarp(gMapHeader, warpEventId, position);
    if (!warp) return null;
    // 1:1 décomp : StoreInitialPlayerAvatarState() ici.
    // Dispatch selon kind (= ordre décomp préservé).
    let specialDispatch: string | null = null;
    if (MetatileBehavior_IsEscalator(metatileBehavior)) {
      specialDispatch = 'DoEscalatorWarp';
    } else if (MetatileBehavior_IsLavaridgeB1FWarp(metatileBehavior)) {
      specialDispatch = 'DoLavaridgeGymB1FWarp';
    } else if (MetatileBehavior_IsLavaridge1FWarp(metatileBehavior)) {
      specialDispatch = 'DoLavaridgeGym1FWarp';
    } else if (MetatileBehavior_IsAquaHideoutWarp(metatileBehavior)) {
      specialDispatch = 'DoTeleportTileWarp';
    } else if (MetatileBehavior_IsUnionRoomWarp(metatileBehavior)) {
      specialDispatch = 'DoSpinExitWarp';
    } else if (MetatileBehavior_IsMtPyreHole(metatileBehavior)) {
      // 1:1 décomp : run script `EventScript_FallDownHoleMtPyre` directement
      // (= pas un DoWarp basique).
      specialDispatch = 'ScriptContext_SetupScript:EventScript_FallDownHoleMtPyre';
    } else if (MetatileBehavior_IsMossdeepGymWarp(metatileBehavior)) {
      specialDispatch = 'DoMossdeepGymWarp';
    }
    return { warp, specialDispatch };
  }
  return null;
}

/** 1:1 décomp `TryDoorWarp` (field_control_avatar.c:833-858).
 *
 *  Body décomp :
 *  ```c
 *  static bool8 TryDoorWarp(struct MapPosition *position, u16 mb, u8 dir) {
 *      if (direction == DIR_NORTH) {
 *          if (MetatileBehavior_IsOpenSecretBaseDoor(mb) == TRUE) {
 *              WarpIntoSecretBase(position, gMapHeader.events);
 *              return TRUE;
 *          }
 *          if (MetatileBehavior_IsWarpDoor(mb) == TRUE) {
 *              warpEventId = GetWarpEventAtMapPosition(&gMapHeader, position);
 *              if (warpEventId != WARP_ID_NONE && IsWarpMetatileBehavior(mb)) {
 *                  StoreInitialPlayerAvatarState();
 *                  SetupWarp(&gMapHeader, warpEventId, position);
 *                  DoDoorWarp();
 *                  return TRUE;
 *              }
 *          }
 *      }
 *      return FALSE;
 *  }
 *  ```
 *
 *  Returns { warp, isSecretBase } si door warp triggered. Caller dispatch
 *  selon `isSecretBase` (= WarpIntoSecretBase vs DoDoorWarp). */
export function TryDoorWarp(
  position: MapPosition,
  metatileBehavior: number,
  direction: number,
): { warp: WarpEvent; isSecretBase: boolean } | null {
  if (direction !== DIR_NORTH) return null;
  // Secret base door = 7 spot OPEN variants. WarpIntoSecretBase a sa propre
  // logique de destination resolution (= via secret_base.c).
  if (MetatileBehavior_IsOpenSecretBaseDoor(metatileBehavior)) {
    // 1:1 décomp : WarpIntoSecretBase(position, gMapHeader.events).
    // Notre impl : retourner placeholder pour la scene à dispatch.
    return { warp: { x: position.x - MAP_OFFSET, y: position.y - MAP_OFFSET,
                     elevation: position.elevation, destMap: '', warpId: 0 } as WarpEvent,
             isSecretBase: true };
  }
  if (MetatileBehavior_IsWarpDoor(metatileBehavior)) {
    const warpEventId = GetWarpEventAtMapPosition(gMapHeader, position);
    if (warpEventId !== -1 && IsWarpMetatileBehavior(metatileBehavior)) {
      const warp = SetupWarp(gMapHeader, warpEventId, position);
      if (warp) {
        return { warp, isSecretBase: false };
      }
    }
  }
  return null;
}

// ─── Step counter helpers 1:1 décomp ───────────────────────────────────────

/** 1:1 décomp `UpdateFriendshipStepCounter` (field_control_avatar.c:614-635).
 *  Incrémente le step counter friendship dans gSaveBlock. Une fois 128 steps
 *  atteints, raise friendship de chaque pokemon du party par 1. */
export function UpdateFriendshipStepCounter(): void {
  // TODO Phase 2 : port body complet (= access gSaveBlock1Ptr->vars[VAR_STEP_COUNTER_FRIENDSHIP]).
  // Pour MVP : no-op (= friendship grinding pas critique démo).
}

/** 1:1 décomp `UpdatePoisonStepCounter` (field_control_avatar.c:637-666).
 *  Si party member poisoned, decrement HP toutes les 4 steps. Si HP atteint 0,
 *  fait fainted + trigger Hall of Fade. */
export function UpdatePoisonStepCounter(): boolean {
  // TODO Phase 2 : port body complet.
  return false;
}

/** 1:1 décomp `sWildEncounterImmunitySteps` getter pour scripts. */
export function GetWildEncounterImmunitySteps(): number {
  return sWildEncounterImmunitySteps;
}
export function ResetWildEncounterImmunitySteps(): void {
  sWildEncounterImmunitySteps = 0;
}
export function IncrementWildEncounterImmunitySteps(): void {
  if (sWildEncounterImmunitySteps < 0xFF) sWildEncounterImmunitySteps++;
}

/** Get/set sPrevMetatileBehavior cache. */
export function GetPrevMetatileBehavior(): number { return sPrevMetatileBehavior; }
export function SetPrevMetatileBehavior(v: number): void { sPrevMetatileBehavior = v; }
