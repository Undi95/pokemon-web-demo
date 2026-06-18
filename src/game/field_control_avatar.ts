/**
 * field_control_avatar.ts — 1:1 décomp port `src/field_control_avatar.c`.
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

import { gMapHeader, MapGridGetMetatileBehaviorAt, MAP_OFFSET, type WarpEvent, type BgEvent } from './fieldmap';
import {
  gPlayerAvatar,
  DIR_NORTH, DIR_SOUTH, DIR_EAST, DIR_WEST, MOVING,
  GetPlayerFacingDirection,
  PlayerGetElevation,
  PlayerGetDestCoords,
  GetXYCoordsOneStepInFrontOfPlayer,
  PartyHasMonWithSurf,
  IsPlayerFacingSurfableFishableWater,
  IsPlayerSurfingNorth,
} from './field_player_avatar';
import { FlagGet } from '../engine/script/script-vars';
import { gSaveBlock1Ptr } from '../engine/save/save-block-state';
import { gPlayerParty } from '../engine/battle/party-storage';
import { STATUS1_POISON, STATUS1_TOXIC_POISON } from '../engine/battle/constants';
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
  MetatileBehavior_IsCounter,
  MetatileBehavior_IsPC,
  MetatileBehavior_IsPlayerFacingTVScreen,
  MetatileBehavior_IsClosedSootopolisDoor,
  MetatileBehavior_IsSkyPillarClosedDoor,
  MetatileBehavior_IsCableBoxResults1,
  MetatileBehavior_IsPokeblockFeeder,
  MetatileBehavior_IsTrickHousePuzzleDoor,
  MetatileBehavior_IsRegionMap,
  MetatileBehavior_IsRunningShoesManual,
  MetatileBehavior_IsPictureBookShelf,
  MetatileBehavior_IsBookShelf,
  MetatileBehavior_IsPokeCenterBookShelf,
  MetatileBehavior_IsVase,
  MetatileBehavior_IsTrashCan,
  MetatileBehavior_IsShopShelf,
  MetatileBehavior_IsBlueprint,
  MetatileBehavior_IsPlayerFacingWirelessBoxResults,
  MetatileBehavior_IsCableBoxResults2,
  MetatileBehavior_IsQuestionnaire,
  MetatileBehavior_IsTrainerHillTimer,
  MetatileBehavior_IsWaterfall,
  MetatileBehavior_IsDiveable,
  MetatileBehavior_IsUnableToEmerge,
} from './metatile_behavior';
import {
  gObjectEvents,
  OBJECT_EVENTS_COUNT,
  GetObjectEventIdByPosition,
  ELEVATION_TRANSITION,
} from './event_object_movement';
import { MapGridGetElevationAt } from './fieldmap';
import { LOCALID_PLAYER } from '../engine/system/decomp-bridge';
import { gSpecialVar, gSelectedObjectEvent, VarGet, VarSet } from '../engine/script/script-vars';
import { ScriptContext_SetupScript, TryRunCoordEventScript } from '../engine/script/script-runtime';
import { DIR_TO_DX, DIR_TO_DY } from '../engine/field/direction-coords';
import { LOCALID_NONE } from '../engine/system/decomp-bridge';
// ProcessPlayerFieldInput : dispatch warp/rencontre via les helpers PROUVÉS (warp-system +
// wild-encounter). Ces modules N'IMPORTENT PAS field-control-avatar → pas de nouveau cycle ESM.
import {
  findWarpEventAt,
  setPendingWarp,
  getWarpKindFor,
  isArrowWarpMetatileBehavior,
  SetDiveWarpDive,
  SetDiveWarpEmerge,
  DoDiveWarp,
} from '../engine/field/warp-system';
import { CheckStandardWildEncounter } from './wild_encounter';

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

// 1:1 décomp button bit masks (= include/gba/io_reg.h). Import depuis
// decomp-data (= A8 audit).
import {
  START_BUTTON, SELECT_BUTTON, A_BUTTON, B_BUTTON,
  DPAD_RIGHT, DPAD_LEFT, DPAD_UP, DPAD_DOWN,
} from '../engine/decomp-data/include/gba/io_reg-data';
import { ENUM_PLAYER_0 } from '../engine/decomp-data/include/bike-data';
import { GetPlayerSpeed } from './bike';

// 1:1 décomp tileTransitionState values (= include/global.fieldmap.h).
const T_NOT_MOVING       = 0;
const T_TILE_TRANSITION  = 1;
const T_TILE_CENTER      = 2;

// 1:1 décomp PLAYER_SPEED_FASTEST (= bike.h enum).
export const PLAYER_SPEED_FASTEST = ENUM_PLAYER_0.PLAYER_SPEED_FASTEST;

/** 1:1 STRICT décomp `GetPlayerCurMetatileBehavior` (field_control_avatar.c:212-218) :
 *    PlayerGetDestCoords(&x, &y);
 *    return MapGridGetMetatileBehaviorAt(x, y);
 *  Note : décomp ignore le `runningState` arg dans le body (= leftover). */
function GetPlayerCurMetatileBehavior(_runningState: number): number {
  const pos = PlayerGetDestCoords();  // INTERNAL coords 1:1 décomp.
  return MapGridGetMetatileBehaviorAt(pos.x, pos.y);
}

// `GetPlayerSpeed` est une fonction de bike.c → source UNIQUE dans `game/bike.ts` (1:1,
// utilise sMachBikeSpeeds pour le mach bike). Importée pour l'usage local (FieldGetPlayerInput)
// + re-exportée pour les importeurs existants (field_tasks.ts) sans changer leur chemin.
export { GetPlayerSpeed };

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

/** 1:1 STRICT décomp `ProcessPlayerFieldInput` (field_control_avatar.c:134). Master dispatcher
 *  des actions consommatrices d'input — tourne AVANT PlayerStep dans `DoCB1_Overworld`, gaté par
 *  `!ArePlayerFieldControlsLocked()`. Retourne TRUE si une action a consommé l'input (la scène
 *  appelle alors `LockPlayerFieldControls()` + skip PlayerStep). Les flags
 *  (tookStep/checkStandardWildEncounter/heldDirection/pressedAButton) sont posés par
 *  `FieldGetPlayerInput`, eux-mêmes gatés par `tileTransitionState` (T_TILE_CENTER) → c'est ce
 *  qui fait fire les events de step-end au BON moment (remplace l'ancien déclenchement par
 *  `stepFramesLeft === 0` dans PlayerStep).
 *
 *  ⚠️ Le dispatch warp réutilise les helpers PROUVÉS `findWarpEventAt`/`getWarpKindFor`/
 *  `setPendingWarp` (mécanisme warp-system, récupéré par `MainCB2_Overworld::getPendingWarp`),
 *  PAS les `TryArrowWarp`/`TryStartWarpEventScript` de ce fichier (lookup différent, jamais
 *  activé en jeu). Non portés (gérés ailleurs / hors démo, documenté) : `CheckForTrainersWanting
 *  Battle`, `TryRunOnFrameMapScript` (appelé par la scène), dive emerge/down, start menu
 *  (`TickStartMenu`), select item, misc/step-count/repel scripts. */
export function ProcessPlayerFieldInput(input: FieldInput): boolean {
  gSpecialVar.LastTalked = LOCALID_NONE;
  gSelectedObjectEvent.index = 0;

  const playerDirection = GetPlayerFacingDirection();
  const position: MapPosition = { x: 0, y: 0, elevation: 0 };
  GetPlayerPosition(position);  // INTERNAL coords + elevation
  let metatileBehavior = MapGridGetMetatileBehaviorAt(position.x, position.y);

  // input->pressedBButton : 1:1 décomp `TrySetupDiveEmergeScript` (field_control_avatar.c:153) —
  // B en underwater sur tuile émergeable → remonte. Placé TÔT (avant tookStep), comme la décomp.
  if (input.pressedBButton && TrySetupDiveEmergeScript()) {
    return true;
  }

  // input->tookStep : 1:1 décomp `TryStartStepBasedScript` (coord events + step-on warp).
  if (input.tookStep) {
    // `TryStartCoordEventScript(position)` — coord events (= truck SetIntroFlags). Coords LOGIQUES.
    if (TryRunCoordEventScript(position.x - MAP_OFFSET, position.y - MAP_OFFSET)) {
      return true;
    }
    // `TryStartWarpEventScript(position, mb)` — step-on warp (door/ladder/escalator/…), PAS arrow.
    const stepWarp = findWarpEventAt(position.x - MAP_OFFSET, position.y - MAP_OFFSET, position.elevation);
    if (stepWarp) {
      const kind = getWarpKindFor(metatileBehavior);
      if (kind && kind !== 'arrow') {
        setPendingWarp(stepWarp, kind);
        return true;
      }
    }
  }

  // input->checkStandardWildEncounter : 1:1 décomp `CheckStandardWildEncounter`.
  if (input.checkStandardWildEncounter && CheckStandardWildEncounter(metatileBehavior)) {
    return true;
  }

  // input->heldDirection && dpad == facing : 1:1 décomp `TryArrowWarp` (arrow warp pré-step).
  if (input.heldDirection && input.dpadDirection === playerDirection) {
    if (isArrowWarpMetatileBehavior(metatileBehavior, playerDirection)) {
      const arrowWarp = findWarpEventAt(position.x - MAP_OFFSET, position.y - MAP_OFFSET, position.elevation);
      if (arrowWarp) {
        setPendingWarp(arrowWarp, 'arrow');
        return true;
      }
    }
  }

  // 1:1 décomp : à partir d'ici `position` = la tuile DEVANT le joueur (GetInFrontOfPlayerPosition).
  GetInFrontOfPlayerPosition(position);
  metatileBehavior = MapGridGetMetatileBehaviorAt(position.x, position.y);

  // input->pressedAButton : 1:1 décomp `TryStartInteractionScript` (NPC / panneau / PC / …).
  if (input.pressedAButton && TryStartInteractionScript(position, metatileBehavior, playerDirection)) {
    return true;
  }

  // input->heldDirection2 && dpad == facing : 1:1 décomp `TryDoorWarp` (DIR_NORTH uniquement).
  if (input.heldDirection2 && input.dpadDirection === playerDirection) {
    if (playerDirection === DIR_NORTH) {
      const kind = getWarpKindFor(metatileBehavior);
      if (kind === 'door') {
        const doorWarp = findWarpEventAt(position.x - MAP_OFFSET, position.y - MAP_OFFSET, position.elevation);
        if (doorWarp) {
          setPendingWarp(doorWarp, kind);
          return true;
        }
      }
    }
  }

  // input->pressedAButton : 1:1 décomp `TrySetupDiveDownScript` (field_control_avatar.c:180) —
  // A sur eau profonde plongeable (badge 7) → plonge. Placé APRÈS TryStartInteractionScript +
  // TryDoorWarp (ordre décomp), avant le menu Start.
  if (input.pressedAButton && TrySetupDiveDownScript()) {
    return true;
  }

  return false;
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

/** 1:1 STRICT décomp `GetInFrontOfPlayerPosition` (field_control_avatar.c:200-210) :
 *    GetXYCoordsOneStepInFrontOfPlayer(&position->x, &position->y);
 *    PlayerGetDestCoords(&x, &y);
 *    if (MapGridGetElevationAt(x, y) != ELEVATION_TRANSITION)
 *        position->elevation = PlayerGetElevation();
 *    else
 *        position->elevation = ELEVATION_TRANSITION;
 *
 *  Stores position 1 tile DEVANT le player + elevation (= preserved si player
 *  source tile a ELEVATION_TRANSITION, sinon = player previousElevation).
 *  Used pour A-button interaction + push-door check. */
export function GetInFrontOfPlayerPosition(position: MapPosition): void {
  const inFront = GetXYCoordsOneStepInFrontOfPlayer();
  position.x = inFront.x;
  position.y = inFront.y;
  // 1:1 STRICT : read elevation au tile SOURCE (= player current pos).
  const src = PlayerGetDestCoords();
  if (MapGridGetElevationAt(src.x, src.y) !== ELEVATION_TRANSITION) {
    position.elevation = PlayerGetElevation();
  } else {
    position.elevation = ELEVATION_TRANSITION;
  }
}

// ─── Warp event lookup helpers 1:1 décomp ──────────────────────────────────

/** 1:1 STRICT décomp `GetWarpEventAtPosition` (field_control_avatar.c:860-875) :
 *    for (i = 0; i < warpCount; i++) {
 *        if (warpEvent->x == x && warpEvent->y == y) {
 *            if (warpEvent->elevation == elevation || warpEvent->elevation == ELEVATION_TRANSITION)
 *                return i;
 *        }
 *    }
 *    return WARP_ID_NONE;
 */
export function GetWarpEventAtPosition(
  mapHeader: typeof gMapHeader,
  x: number, y: number, elevation: number,
): number {
  if (!mapHeader) return -1;
  const warps = mapHeader.events.warps as WarpEvent[];
  for (let i = 0; i < warps.length; i++) {
    const w = warps[i];
    if (w.x === x && w.y === y) {
      if (w.elevation === elevation || w.elevation === ELEVATION_TRANSITION) {
        return i;
      }
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

// ─── Interaction script helpers 1:1 décomp ─────────────────────────────────

/** 1:1 décomp `GetBackgroundEventAtPosition(struct MapHeader *, u16 x, u16 y, u8 elevation)`
 *  (field_control_avatar.c — used by GetInteractedBackgroundEventScript).
 *
 *  Body décomp : iterate sur `mapHeader->events->bgEvents` et match strict
 *  `(x, y)` + `(bg.elevation == elevation || bg.elevation == 0)`.
 *
 *  IMPORTANT : x/y attendus en **LOGICAL** (= post-strip MAP_OFFSET). */
export function GetBackgroundEventAtPosition(
  mapHeader: typeof gMapHeader,
  x: number, y: number, elevation: number,
): BgEvent | null {
  if (!mapHeader) return null;
  const bgEvents = mapHeader.events.bgEvents as BgEvent[];
  for (const bg of bgEvents) {
    if (bg.x !== x || bg.y !== y) continue;
    if (bg.elevation !== elevation && bg.elevation !== 0) continue;
    return bg;
  }
  return null;
}

/** 1:1 décomp `GetInteractedObjectEventScript` (field_control_avatar.c:286-314).
 *
 *  ```c
 *  objectEventId = GetObjectEventIdByPosition(position->x, position->y, position->elevation);
 *  if (objectEventId == OBJECT_EVENTS_COUNT || gObjectEvents[objectEventId].localId == LOCALID_PLAYER) {
 *      if (MetatileBehavior_IsCounter(metatileBehavior) != TRUE) return NULL;
 *      objectEventId = GetObjectEventIdByPosition(position->x + dx, position->y + dy, position->elevation);
 *      if (objectEventId == OBJECT_EVENTS_COUNT || gObjectEvents[objectEventId].localId == LOCALID_PLAYER) return NULL;
 *  }
 *  gSelectedObjectEvent = objectEventId;
 *  gSpecialVar_LastTalked = gObjectEvents[objectEventId].localId;
 *  gSpecialVar_Facing = direction;
 *  ... GetRamScript filter ...
 *  return script;
 *  ```
 *
 *  Position en INTERNAL (= match avec `currentCoordsX/Y` INTERNAL post-R3). */
export function GetInteractedObjectEventScript(
  position: MapPosition, metatileBehavior: number, direction: number,
): string | null {
  let objectEventId = GetObjectEventIdByPosition(position.x, position.y, position.elevation);
  if (objectEventId === OBJECT_EVENTS_COUNT
      || gObjectEvents[objectEventId].localId === LOCALID_PLAYER) {
    if (!MetatileBehavior_IsCounter(metatileBehavior)) return null;
    const dx = DIR_TO_DX[direction] ?? 0;
    const dy = DIR_TO_DY[direction] ?? 0;
    objectEventId = GetObjectEventIdByPosition(position.x + dx, position.y + dy, position.elevation);
    if (objectEventId === OBJECT_EVENTS_COUNT
        || gObjectEvents[objectEventId].localId === LOCALID_PLAYER) return null;
  }
  gSelectedObjectEvent.index = objectEventId;
  gSpecialVar.LastTalked = gObjectEvents[objectEventId].localId;
  // 1:1 décomp `gSpecialVar_Facing = direction` (field_control_avatar.c:305).
  gSpecialVar.Facing = direction;
  // TrainerHill skip pour MVP.
  const script = gObjectEvents[objectEventId].scriptLabel;
  if (!script) return null;
  // GetRamScript filter skip — pas de RAM scripts dynamic dans notre port.
  return script;
}

/** 1:1 décomp `GetInteractedBackgroundEventScript` (field_control_avatar.c:316-365).
 *
 *  Body décomp : `position->x - MAP_OFFSET, position->y - MAP_OFFSET` → strip
 *  pour comparer avec bg events stockés en LOGICAL.
 *
 *  Dispatch par `bgEvent.kind` :
 *    - BG_EVENT_PLAYER_FACING_ANY : return script.
 *    - BG_EVENT_PLAYER_FACING_NORTH/SOUTH/EAST/WEST : return script si dir match.
 *    - BG_EVENT_HIDDEN_ITEM : check FLAG_HIDDEN_ITEMS_START + EventScript_HiddenItemScript.
 *    - BG_EVENT_SECRET_BASE : secret base entrance check.
 *  Si script vide → return `EventScript_TestSignpostMsg` ("There's nothing here."). */
export function GetInteractedBackgroundEventScript(
  position: MapPosition, _metatileBehavior: number, direction: number,
): string | null {
  const bgEvent = GetBackgroundEventAtPosition(
    gMapHeader, position.x - MAP_OFFSET, position.y - MAP_OFFSET, position.elevation);
  if (!bgEvent) return null;
  // Hidden item dispatch (= kind 'hidden_item' dans notre data, BG_EVENT_HIDDEN_ITEM décomp).
  if (bgEvent.kind === 'hidden_item') {
    return 'EventScript_HiddenItemScript';
  }
  // Secret base entrance (= kind 'secret_base'). Skip MVP — pas critique démo Littleroot.
  if (bgEvent.kind === 'secret_base') {
    return null;
  }
  // Sign / panneau standard : dispatch par playerFacingDir.
  const pfd = bgEvent.playerFacingDir;
  if (pfd === 'BG_EVENT_PLAYER_FACING_NORTH' && direction !== DIR_NORTH) return null;
  if (pfd === 'BG_EVENT_PLAYER_FACING_SOUTH' && direction !== DIR_SOUTH) return null;
  if (pfd === 'BG_EVENT_PLAYER_FACING_EAST'  && direction !== DIR_EAST)  return null;
  if (pfd === 'BG_EVENT_PLAYER_FACING_WEST'  && direction !== DIR_WEST)  return null;
  if (!bgEvent.script) {
    return 'EventScript_TestSignpostMsg';
  }
  return bgEvent.script;
}

/** 1:1 décomp `GetInteractedMetatileScript` (field_control_avatar.c:367-446).
 *
 *  Lookup un EventScript_* global selon le metatile behavior face au joueur.
 *  Order des checks 1:1 strict avec décomp.
 *
 *  Secret base + decoration metatiles skip MVP (= pas de secret base démo). */
export function GetInteractedMetatileScript(
  _position: MapPosition, metatileBehavior: number, direction: number,
): string | null {
  if (MetatileBehavior_IsPlayerFacingTVScreen(metatileBehavior, direction))
    return 'EventScript_TV';
  if (MetatileBehavior_IsPC(metatileBehavior))
    return 'EventScript_PC';
  if (MetatileBehavior_IsClosedSootopolisDoor(metatileBehavior))
    return 'EventScript_ClosedSootopolisDoor';
  if (MetatileBehavior_IsSkyPillarClosedDoor(metatileBehavior))
    return 'SkyPillar_Outside_EventScript_ClosedDoor';
  if (MetatileBehavior_IsCableBoxResults1(metatileBehavior))
    return 'EventScript_CableBoxResults';
  if (MetatileBehavior_IsPokeblockFeeder(metatileBehavior))
    return 'EventScript_PokeBlockFeeder';
  if (MetatileBehavior_IsTrickHousePuzzleDoor(metatileBehavior))
    return 'Route110_TrickHousePuzzle_EventScript_Door';
  if (MetatileBehavior_IsRegionMap(metatileBehavior))
    return 'EventScript_RegionMap';
  if (MetatileBehavior_IsRunningShoesManual(metatileBehavior))
    return 'EventScript_RunningShoesManual';
  if (MetatileBehavior_IsPictureBookShelf(metatileBehavior))
    return 'EventScript_PictureBookShelf';
  if (MetatileBehavior_IsBookShelf(metatileBehavior))
    return 'EventScript_BookShelf';
  if (MetatileBehavior_IsPokeCenterBookShelf(metatileBehavior))
    return 'EventScript_PokemonCenterBookShelf';
  if (MetatileBehavior_IsVase(metatileBehavior))
    return 'EventScript_Vase';
  if (MetatileBehavior_IsTrashCan(metatileBehavior))
    return 'EventScript_EmptyTrashCan';
  if (MetatileBehavior_IsShopShelf(metatileBehavior))
    return 'EventScript_ShopShelf';
  if (MetatileBehavior_IsBlueprint(metatileBehavior))
    return 'EventScript_Blueprint';
  if (MetatileBehavior_IsPlayerFacingWirelessBoxResults(metatileBehavior, direction))
    return 'EventScript_WirelessBoxResults';
  if (MetatileBehavior_IsCableBoxResults2(metatileBehavior, direction))
    return 'EventScript_CableBoxResults';
  if (MetatileBehavior_IsQuestionnaire(metatileBehavior))
    return 'EventScript_Questionnaire';
  if (MetatileBehavior_IsTrainerHillTimer(metatileBehavior))
    return 'EventScript_TrainerHillTimer';
  return null;
}

/** 1:1 décomp `GetInteractionScript` (field_control_avatar.c:240-259).
 *
 *  Chain : ObjectEventScript → BackgroundEventScript → MetatileScript → WaterScript.
 *  Returns le premier non-NULL. WaterScript (Surf/Waterfall) skip pour MVP. */
export function GetInteractionScript(
  position: MapPosition, metatileBehavior: number, direction: number,
): string | null {
  let script = GetInteractedObjectEventScript(position, metatileBehavior, direction);
  if (script !== null) return script;
  script = GetInteractedBackgroundEventScript(position, metatileBehavior, direction);
  if (script !== null) return script;
  script = GetInteractedMetatileScript(position, metatileBehavior, direction);
  if (script !== null) return script;
  script = GetInteractedWaterScript(position, metatileBehavior, direction);
  if (script !== null) return script;
  return null;
}

/** 1:1 STRICT décomp `GetInteractedWaterScript` (field_control_avatar.c:448) :
 *    if (FlagGet(FLAG_BADGE05_GET) && PartyHasMonWithSurf() && IsPlayerFacingSurfableFishableWater())
 *        return EventScript_UseSurf;
 *    if (MetatileBehavior_IsWaterfall(metatileBehavior)) {
 *        if (FlagGet(FLAG_BADGE08_GET) && IsPlayerSurfingNorth())
 *            return EventScript_UseWaterfall;
 *        else
 *            return EventScript_CannotUseWaterfall;
 *    }
 *    return NULL;
 *  Entrée HM Surf : A face à de l'eau surfable (badge 5 + un mon connaît Surf) → UseSurf.
 *  Entrée HM Cascade : A face à une tuile MB_WATERFALL en surfant VERS LE NORD (badge 8) → UseWaterfall
 *  (checkpartymove → msgbox OUI/NON → dofieldeffect FLDEFF_USE_WATERFALL → grimpe). Sinon (pas badge 8
 *  ou pas en surf-nord) → CannotUseWaterfall (lockall + "Un mur d'eau s'abat…"). `position` = unused1. */
function GetInteractedWaterScript(
  _position: MapPosition, metatileBehavior: number, _direction: number,
): string | null {
  if (FlagGet('FLAG_BADGE05_GET') && PartyHasMonWithSurf() && IsPlayerFacingSurfableFishableWater())
    return 'EventScript_UseSurf';

  if (MetatileBehavior_IsWaterfall(metatileBehavior)) {
    if (FlagGet('FLAG_BADGE08_GET') && IsPlayerSurfingNorth())
      return 'EventScript_UseWaterfall';
    else
      return 'EventScript_CannotUseWaterfall';
  }
  return null;
}

/** 1:1 décomp `TryStartInteractionScript` (field_control_avatar.c:220-238).
 *
 *  Si script non-NULL → PlaySE(SE_SELECT) (sauf PC variants) + ScriptContext_SetupScript.
 *  Notre impl skip PlaySE explicite (= user a demandé no-touch BGM/SE). */
export function TryStartInteractionScript(
  position: MapPosition, metatileBehavior: number, direction: number,
): boolean {
  const script = GetInteractionScript(position, metatileBehavior, direction);
  if (!script) return false;
  console.log(`[field-control] interaction script → '${script}' at INTERNAL=(${position.x},${position.y}) dir=${direction} mb=0x${metatileBehavior.toString(16)}`);
  ScriptContext_SetupScript(script);
  return true;
}

// ─── Dive (HM Plongée) 1:1 décomp field_control_avatar.c:940-983 ─────────────
// ⚠️ Le port stocke `gMapHeader.mapType` comme le NOM string du constant décomp
// (= json.map_type, ex. "MAP_TYPE_UNDERWATER") → on compare à la string (différence
// de représentation des données, pas une approximation de logique).

/** 1:1 STRICT décomp `TryDoDiveWarp(struct MapPosition *position, u16 metatileBehavior)`
 *  (field_control_avatar.c:940) :
 *    if (UNDERWATER && !IsUnableToEmerge) { if SetDiveWarpEmerge → Store + DoDiveWarp + SE; return TRUE }
 *    else if (IsDiveable) { if SetDiveWarpDive → Store + DoDiveWarp + SE; return TRUE }
 *    return FALSE;
 *  Appelé par `DiveFieldEffect_TryWarp` (Task_UseDive) → exécute le warp.
 *  `position` = coords INTERNAL du joueur ; SetDiveWarp* veut du LOCAL (− MAP_OFFSET).
 *  ⚠️ DETTE : `StoreInitialPlayerAvatarState()` non porté (le joueur se ré-init sur la
 *  map dest, cohérent avec __devGotoMap) ; PlaySE(SE_M_DIVE) skip (audio). */
export function TryDoDiveWarp(position: MapPosition, metatileBehavior: number): boolean {
  if (gMapHeader?.mapType === 'MAP_TYPE_UNDERWATER' && !MetatileBehavior_IsUnableToEmerge(metatileBehavior)) {
    if (SetDiveWarpEmerge(position.x - MAP_OFFSET, position.y - MAP_OFFSET)) {
      DoDiveWarp();
      return true;
    }
  } else if (MetatileBehavior_IsDiveable(metatileBehavior) === true) {
    if (SetDiveWarpDive(position.x - MAP_OFFSET, position.y - MAP_OFFSET)) {
      DoDiveWarp();
      return true;
    }
  }
  return false;
}

/** 1:1 STRICT décomp `TrySetDiveWarp(void)` (field_control_avatar.c:965) :
 *    PlayerGetDestCoords(&x, &y); metatileBehavior = MapGridGetMetatileBehaviorAt(x, y);
 *    if (UNDERWATER && !IsUnableToEmerge) { if SetDiveWarpEmerge(x-OFF, y-OFF) return 1; }
 *    else if (IsDiveable) { if SetDiveWarpDive(x-OFF, y-OFF) return 2; }
 *    return 0;
 *  Pose la dest du warp Dive (sans déclencher) + renvoie 1 (emerge) / 2 (dive) / 0 (rien).
 *  Le joueur est SUR la tuile (coords courantes), pas devant. */
export function TrySetDiveWarp(): number {
  const coords = PlayerGetDestCoords();  // INTERNAL
  const metatileBehavior = MapGridGetMetatileBehaviorAt(coords.x, coords.y);
  if (gMapHeader?.mapType === 'MAP_TYPE_UNDERWATER' && !MetatileBehavior_IsUnableToEmerge(metatileBehavior)) {
    if (SetDiveWarpEmerge(coords.x - MAP_OFFSET, coords.y - MAP_OFFSET) === true) return 1;
  } else if (MetatileBehavior_IsDiveable(metatileBehavior) === true) {
    if (SetDiveWarpDive(coords.x - MAP_OFFSET, coords.y - MAP_OFFSET) === true) return 2;
  }
  return 0;
}

/** 1:1 STRICT décomp `TrySetupDiveDownScript(void)` (field_control_avatar.c:463) :
 *    if (FlagGet(FLAG_BADGE07_GET) && TrySetDiveWarp() == 2) { ScriptContext_SetupScript(EventScript_UseDive); return TRUE; }
 *    return FALSE;
 *  Entrée HM Plongée DESCENTE : A sur eau profonde plongeable (badge 7) → EventScript_UseDive
 *  (checkpartymove MOVE_DIVE → msgbox OUI/NON → dofieldeffect FLDEFF_USE_DIVE → warp underwater). */
function TrySetupDiveDownScript(): boolean {
  if (FlagGet('FLAG_BADGE07_GET') && TrySetDiveWarp() === 2) {
    ScriptContext_SetupScript('EventScript_UseDive');
    return true;
  }
  return false;
}

/** 1:1 STRICT décomp `TrySetupDiveEmergeScript(void)` (field_control_avatar.c:473) :
 *    if (FlagGet(FLAG_BADGE07_GET) && gMapHeader.mapType == MAP_TYPE_UNDERWATER && TrySetDiveWarp() == 1) {
 *        ScriptContext_SetupScript(EventScript_UseDiveUnderwater); return TRUE; }
 *    return FALSE;
 *  Entrée HM Plongée ÉMERSION : B en underwater sur une tuile émergeable (badge 7) → remonte. */
function TrySetupDiveEmergeScript(): boolean {
  if (FlagGet('FLAG_BADGE07_GET') && gMapHeader?.mapType === 'MAP_TYPE_UNDERWATER' && TrySetDiveWarp() === 1) {
    ScriptContext_SetupScript('EventScript_UseDiveUnderwater');
    return true;
  }
  return false;
}

// ─── Step counter helpers 1:1 décomp ───────────────────────────────────────

/** 1:1 STRICT décomp `UpdateFriendshipStepCounter` (field_control_avatar.c:614-630) :
 *    u16 *ptr = GetVarPointer(VAR_FRIENDSHIP_STEP_COUNTER);
 *    (*ptr)++;
 *    (*ptr) %= 128;
 *    if (*ptr == 0) {
 *        struct Pokemon *mon = gPlayerParty;
 *        for (i = 0; i < PARTY_SIZE; i++) {
 *            AdjustFriendship(mon, FRIENDSHIP_EVENT_WALKING);
 *            mon++;
 *        }
 *    }
 */
export function UpdateFriendshipStepCounter(): void {
  // 1:1 décomp GetVarPointer + increment + modulo.
  const counter = ((VarGet('VAR_FRIENDSHIP_STEP_COUNTER') + 1) & 0xFFFF) % 128;
  VarSet('VAR_FRIENDSHIP_STEP_COUNTER', counter);
  if (counter === 0) {
    // 1:1 décomp : pour chaque mon du party, AdjustFriendship(mon, FRIENDSHIP_EVENT_WALKING).
    void import('../engine/battle/party-storage').then(({ AdjustFriendship }) => {
      const party = gPlayerParty;
      const FRIENDSHIP_EVENT_WALKING = 5;  // 1:1 décomp include/constants/pokemon.h:179.
      for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
        const mon = party[i];
        // 1:1 décomp : AdjustFriendship early-return si species == SPECIES_EGG. Notre
        // PokemonInstance (œuf) a `isEgg` — PAS `species===412`, et `mon.species` est
        // undefined sur l'instance → AdjustFriendship NE détecte PAS l'œuf → il gagnerait
        // de la friendship à la marche, ce qui CORROMPRAIT son compteur d'éclosion
        // (friendship = compteur d'éclosion pour un œuf, cf. pokemon.ts:105). On skip les
        // œufs ici = équivalent 1:1 strict de l'early-return œuf du décomp.
        // 1:1 : AdjustFriendship early-return si species==SPECIES_EGG ; nos œufs =
        // species réel + flag isEgg → on skip explicitement (équivalent 1:1).
        if (mon && mon.species !== 0 && !mon.isEgg) {
          AdjustFriendship(mon, FRIENDSHIP_EVENT_WALKING);
        }
      }
    });
  }
}

/** 1:1 STRICT décomp `UpdatePoisonStepCounter` (field_control_avatar.c:637-660) :
 *    if (gMapHeader.mapType != MAP_TYPE_SECRET_BASE) {
 *        ptr = GetVarPointer(VAR_POISON_STEP_COUNTER);
 *        (*ptr)++;
 *        (*ptr) %= 4;
 *        if (*ptr == 0) {
 *            switch (DoPoisonFieldEffect()) {
 *            case FLDPSN_NONE: return FALSE;
 *            case FLDPSN_PSN:  return FALSE;
 *            case FLDPSN_FNT:  return TRUE;
 *            }
 *        }
 *    }
 *    return FALSE;
 *
 *  DoPoisonFieldEffect 1:1 décomp field_poison.c:120-154 : decrement HP des
 *  party mons poisoned ; return FLDPSN_FNT si tous fainted, FLDPSN_PSN si
 *  encore en vie, FLDPSN_NONE si aucun poisoned.
 *
 *  ⚠️ DORMANTE (audit 2026-06-05) : AUCUN caller. Le dispatch décomp
 *  `TryStartStepCountScript` (field_control_avatar.c:537, appelle ce compteur +
 *  UpdateFriendshipStepCounter + IncrementRematchStepCounter) n'est PAS porté →
 *  le poison de terrain ne retire AUCUN PV en LIVE. Câbler = cluster #13
 *  (TryFieldPoisonWhiteOut, actuellement stub) + #15 (GetHealLocation pour le
 *  téléport white-out). Le décrément ici est 1:1 mais inerte tant que non câblé. */
export function UpdatePoisonStepCounter(): boolean {
  // 1:1 décomp : skip pour Secret Base.
  const MAP_TYPE_SECRET_BASE = 9;  // 1:1 décomp include/constants/map_types.h:13.
  if (gMapHeader && (gMapHeader as unknown as { mapType?: number }).mapType === MAP_TYPE_SECRET_BASE) {
    return false;
  }
  const counter = ((VarGet('VAR_POISON_STEP_COUNTER') + 1) & 0xFFFF) % 4;
  VarSet('VAR_POISON_STEP_COUNTER', counter);
  if (counter !== 0) return false;
  // 1:1 décomp DoPoisonFieldEffect (field_poison.c:120-154) :
  //   iter party, decrement HP des poisoned mons, return FNT si tous KO.
  const FLDPSN_FNT = 2;  // 1:1 décomp include/constants/pokemon.h.
  const party = gSaveBlock1Ptr.playerParty;
  let numFainted = 0;
  let numPoisoned = 0;
  for (let i = 0; i < 6 /* PARTY_SIZE */; i++) {
    const mon = party[i];
    if (!mon || mon.species === 0) continue;
    // 1:1 décomp : status1 & (STATUS1_POISON | STATUS1_TOXIC_POISON).
    if ((mon.status >>> 0) & (STATUS1_POISON | STATUS1_TOXIC_POISON)) {
      let hp = mon.hp;
      if (hp === 0 || --hp === 0) numFainted++;
      mon.hp = hp;
      numPoisoned++;
    }
  }
  // DoPoisonFieldEffect screen flash via FldEffPoison_Start — non porté (= UI).
  void numPoisoned;  // mark used pour conformer au décomp.
  if (numFainted !== 0) {
    // 1:1 décomp : return FLDPSN_FNT === 2 → caller wraps en boolean.
    void FLDPSN_FNT;
    return true;
  }
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
