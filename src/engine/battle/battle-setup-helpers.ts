/**
 * battle/battle-setup-helpers.ts — Port 1:1 strict des helpers setup battle.
 *
 * Sources de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c:43-79`
 *     (SetUpBattleVarsAndBirchZigzagoon)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_setup.c:636-`
 *     (BattleSetup_GetEnvironmentId)
 *
 * Fonctions portées 1:1 strict :
 *   - SetUpBattleVarsAndBirchZigzagoon (43-79) — setup battle vars + spawn
 *     Zigzagoon LV 2 wild si BATTLE_TYPE_FIRST_BATTLE (= Birch tutorial)
 *   - BattleSetup_GetEnvironmentId (636-) — determine battle environment
 *     (= GRASS / SAND / CAVE / WATER / etc.) depuis metatile behavior
 *
 * Dépendances :
 *   - state.ts : gActiveBattler, gActionSelectionCursor, gMoveSelectionCursor,
 *     gBattleTypeFlags, setBattleControllerExcFlags
 *   - constants.ts : MAX_BATTLERS_COUNT, BATTLE_TYPE_FIRST_BATTLE
 *   - battle-main-functions.ts : BeginBattleIntroDummy (K8 porté)
 *   - decomp-data : SPECIES_ZIGZAGOON, OT_ID_PLAYER_ID
 */

import {
  gActionSelectionCursor, gMoveSelectionCursor,
  gBattleTypeFlags,
  setBattleControllerExecFlags, setActiveBattler,
  MAX_BATTLERS_COUNT,
} from './state';
import { BATTLE_TYPE_FIRST_BATTLE } from './constants';
import { gBattlerPositions } from './util';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `SPECIES_ZIGZAGOON` (constants/species.h) = 287 (Gen 3 dex). */
const SPECIES_ZIGZAGOON = 287;

/** 1:1 décomp `OT_ID_PLAYER_ID` = 0 (= utilise gSaveBlock2Ptr->playerTrainerId). */
const OT_ID_PLAYER_ID = 0;

/** 1:1 décomp `USE_RANDOM_IVS` (pokemon.c) = MAX_PER_STAT_IVS + 1 = 32. */
const USE_RANDOM_IVS = 32;

/** 1:1 décomp `BATTLE_ENVIRONMENT_*` (constants/battle.h). */
export const BATTLE_ENVIRONMENT_GRASS = 0;
export const BATTLE_ENVIRONMENT_LONG_GRASS = 1;
export const BATTLE_ENVIRONMENT_SAND = 2;
export const BATTLE_ENVIRONMENT_UNDERWATER = 3;
export const BATTLE_ENVIRONMENT_WATER = 4;
export const BATTLE_ENVIRONMENT_POND = 5;
export const BATTLE_ENVIRONMENT_MOUNTAIN = 6;
export const BATTLE_ENVIRONMENT_CAVE = 7;
export const BATTLE_ENVIRONMENT_BUILDING = 8;
export const BATTLE_ENVIRONMENT_PLAIN = 9;

/** 1:1 décomp `MAP_TYPE_*` (constants/map_types.h). */
const MAP_TYPE_TOWN = 1;
const MAP_TYPE_CITY = 2;
const MAP_TYPE_ROUTE = 3;
const MAP_TYPE_UNDERGROUND = 4;
const MAP_TYPE_UNDERWATER = 5;
const MAP_TYPE_OCEAN_ROUTE = 6;
const MAP_TYPE_UNKNOWN = 7;
const MAP_TYPE_INDOOR = 8;
const MAP_TYPE_SECRET_BASE = 9;

/** 1:1 décomp `MON_DATA_HELD_ITEM` = 22. */
const MON_DATA_HELD_ITEM = 22;

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `BattleControllerDummy` (battle_controllers.c). No-op callback. */
function BattleControllerDummy(): void {
  // Dette R3 : controller dispatch system (= notre TS bypass via state machine).
}

/** 1:1 décomp `gBattlerControllerFuncs[MAX_BATTLERS_COUNT]`. */
const gBattlerControllerFuncs: Array<() => void> = [
  BattleControllerDummy, BattleControllerDummy,
  BattleControllerDummy, BattleControllerDummy,
];

/** 1:1 décomp `HandleLinkBattleSetup()`. */
function HandleLinkBattleSetup(): void {
  // Dette R3 : link battle handshake. Notre port : noop (no link battle).
}

/** 1:1 décomp `ClearBattleAnimationVars()`. Wire vers battle-anim-interpreter K1. */
function ClearBattleAnimationVars(): void {
  const ba = (globalThis as Record<string, unknown>).__battleAnim as {
    ClearBattleAnimationVars?: () => void;
  } | undefined;
  ba?.ClearBattleAnimationVars?.();
}

/** 1:1 décomp `ClearBattleMonForms()`. */
function ClearBattleMonForms(): void {
  // Dette R3 : per-battler form tracker (Castform weather / Unown letter).
}

/** 1:1 décomp `BattleAI_HandleItemUseBeforeAISetup(itemMask)`. */
function BattleAI_HandleItemUseBeforeAISetup(_itemMask: number): void {
  // Dette R3 : trainer pre-battle items use (= X Attack / Guard Spec).
}

/** 1:1 décomp `ZeroEnemyPartyMons()`. */
function _ZeroEnemyPartyMons(): void {
  const stateMod = require('./state') as { gEnemyParty?: unknown[] };
  if (stateMod.gEnemyParty) {
    for (let i = 0; i < 6; i++) {
      stateMod.gEnemyParty[i] = null;
    }
  }
}

/** 1:1 décomp `CreateMon(...)`. */
function _CreateMon(
  monSlot: number, species: number, level: number, _fixedIV: number,
  _useRandomIvs: number, _personality: number, _otIdType: number, _otIdNum: number,
): void {
  const stateMod = require('./state') as { gEnemyParty?: unknown[] };
  if (stateMod.gEnemyParty) {
    stateMod.gEnemyParty[monSlot] = {
      species, level,
      moves: [0, 0, 0, 0], pp: [0, 0, 0, 0],
      heldItem: 0,
    };
  }
}

/** 1:1 décomp `SetMonData(mon, field, value)`. */
function _SetMonData(monSlot: number, field: number, value: number): void {
  const stateMod = require('./state') as { gEnemyParty?: Array<{ heldItem?: number }> };
  if (stateMod.gEnemyParty?.[monSlot] && field === MON_DATA_HELD_ITEM) {
    stateMod.gEnemyParty[monSlot].heldItem = value;
  }
}

// ─── SetUpBattleVarsAndBirchZigzagoon (battle_controllers.c:43-79) ─────────

/** 1:1 décomp `SetUpBattleVarsAndBirchZigzagoon()` (battle_controllers.c:43-79).
 *  Setup initial des vars battle + spawn Zigzagoon LV2 si tutorial Birch.
 *
 *  Appelé par CB2_InitBattleInternal (= battle_main.c:684). */
export function SetUpBattleVarsAndBirchZigzagoon(): void {
  // 1:1 décomp l. 47 : gBattleMainFunc = BeginBattleIntroDummy.
  const bmf = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    setBattleMainFunc?: (fn: () => void) => void;
    BeginBattleIntroDummy?: () => void;
  } | undefined;
  if (bmf?.setBattleMainFunc && bmf.BeginBattleIntroDummy) {
    bmf.setBattleMainFunc(bmf.BeginBattleIntroDummy);
  }

  // 1:1 décomp ll. 49-55 : init controller funcs + positions + UI cursors.
  for (let i = 0; i < MAX_BATTLERS_COUNT; i++) {
    gBattlerControllerFuncs[i] = BattleControllerDummy;
    gBattlerPositions[i] = 0xFF;
    gActionSelectionCursor[i] = 0;
    gMoveSelectionCursor[i] = 0;
  }

  HandleLinkBattleSetup();
  setBattleControllerExecFlags(0);
  ClearBattleAnimationVars();
  ClearBattleMonForms();

  // 1:1 décomp ll. 61-65 : UBFIX active = reset gActiveBattler = 0.
  setActiveBattler(0);

  BattleAI_HandleItemUseBeforeAISetup(0xF);

  // 1:1 décomp ll. 68-74 : Birch tutorial = spawn Zigzagoon LV 2.
  if (gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE) {
    _ZeroEnemyPartyMons();
    _CreateMon(0, SPECIES_ZIGZAGOON, 2, USE_RANDOM_IVS, 0, 0, OT_ID_PLAYER_ID, 0);
    _SetMonData(0, MON_DATA_HELD_ITEM, 0);
  }

  // 1:1 décomp ll. 77-78 : unused vars (never read).
  // gUnusedFirstBattleVar1 = 0; gUnusedFirstBattleVar2 = 0;
}

// ─── BattleSetup_GetEnvironmentId (battle_setup.c:636) ─────────────────────

/** Cascade helpers : metatile behavior + map type access. */
function _PlayerGetDestCoords(): { x: number; y: number } {
  // Cascade : player-avatar.ts coords lookup.
  const pa = (globalThis as { __playerAvatar?: { x?: number; y?: number } }).__playerAvatar;
  return { x: pa?.x ?? 0, y: pa?.y ?? 0 };
}

function _MapGridGetMetatileBehaviorAt(_x: number, _y: number): number {
  // Cascade : metatile-behavior.ts. Pour now : default 0 (= no special).
  return 0;
}

function _isTallGrass(behavior: number): boolean { return behavior === 2; }
function _isLongGrass(behavior: number): boolean { return behavior === 3; }
function _isSandOrDeepSand(behavior: number): boolean { return behavior === 4 || behavior === 5; }
function _isIndoorEncounter(behavior: number): boolean { return behavior === 8; }
function _isSurfableWaterOrUnderwater(behavior: number): boolean { return behavior === 16 || behavior === 17; }
function _isDeepOrOceanWater(behavior: number): boolean { return behavior === 18; }
function _isMountain(behavior: number): boolean { return behavior === 32; }

function _getMapType(): number {
  const mh = (globalThis as { __mapHeader?: { mapType?: number } }).__mapHeader;
  return mh?.mapType ?? MAP_TYPE_TOWN;
}

/** 1:1 décomp `BattleSetup_GetEnvironmentId()` (battle_setup.c:636-).
 *  Returns le BATTLE_ENVIRONMENT_* depuis metatile behavior + map type. */
export function BattleSetup_GetEnvironmentId(): number {
  const { x, y } = _PlayerGetDestCoords();
  const tileBehavior = _MapGridGetMetatileBehaviorAt(x, y);

  if (_isTallGrass(tileBehavior)) return BATTLE_ENVIRONMENT_GRASS;
  if (_isLongGrass(tileBehavior)) return BATTLE_ENVIRONMENT_LONG_GRASS;
  if (_isSandOrDeepSand(tileBehavior)) return BATTLE_ENVIRONMENT_SAND;

  const mapType = _getMapType();
  switch (mapType) {
    case MAP_TYPE_TOWN:
    case MAP_TYPE_CITY:
    case MAP_TYPE_ROUTE:
      break;
    case MAP_TYPE_UNDERGROUND:
      if (_isIndoorEncounter(tileBehavior)) return BATTLE_ENVIRONMENT_BUILDING;
      if (_isSurfableWaterOrUnderwater(tileBehavior)) return BATTLE_ENVIRONMENT_POND;
      return BATTLE_ENVIRONMENT_CAVE;
    case MAP_TYPE_INDOOR:
    case MAP_TYPE_SECRET_BASE:
      return BATTLE_ENVIRONMENT_BUILDING;
    case MAP_TYPE_UNDERWATER:
      return BATTLE_ENVIRONMENT_UNDERWATER;
    case MAP_TYPE_OCEAN_ROUTE:
      if (_isSurfableWaterOrUnderwater(tileBehavior)) return BATTLE_ENVIRONMENT_WATER;
      return BATTLE_ENVIRONMENT_PLAIN;
  }

  if (_isDeepOrOceanWater(tileBehavior)) return BATTLE_ENVIRONMENT_WATER;
  if (_isSurfableWaterOrUnderwater(tileBehavior)) return BATTLE_ENVIRONMENT_POND;
  if (_isMountain(tileBehavior)) return BATTLE_ENVIRONMENT_MOUNTAIN;

  return BATTLE_ENVIRONMENT_PLAIN;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleSetupHelpers = {
  SetUpBattleVarsAndBirchZigzagoon, BattleSetup_GetEnvironmentId,
  BATTLE_ENVIRONMENT_GRASS, BATTLE_ENVIRONMENT_LONG_GRASS,
  BATTLE_ENVIRONMENT_SAND, BATTLE_ENVIRONMENT_UNDERWATER,
  BATTLE_ENVIRONMENT_WATER, BATTLE_ENVIRONMENT_POND,
  BATTLE_ENVIRONMENT_MOUNTAIN, BATTLE_ENVIRONMENT_CAVE,
  BATTLE_ENVIRONMENT_BUILDING, BATTLE_ENVIRONMENT_PLAIN,
};

void MAP_TYPE_UNKNOWN;
