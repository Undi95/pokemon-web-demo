/**
 * battle/battle-controllers-ipc.ts — Port 1:1 strict du Controller IPC core.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c`
 *
 * **User priority #1 (Important)** : Le système IPC core du battle.
 *
 * Architecture 1:1 décomp :
 *   - `sBattleBuffersTransferData[0x100]` : buffer staging (256 bytes)
 *   - `gBattleBufferA[MAX_BATTLERS_COUNT][0x200]` : commands engine→controller
 *   - `gBattleBufferB[MAX_BATTLERS_COUNT][0x200]` : responses controller→engine
 *   - `PrepareBufferDataTransfer(bufferId, data, size)` : core writer
 *   - `SetBattlePartyIds()` : init gBattlerPartyIndexes depuis party
 *
 * Mécanique IPC :
 *   - Engine veut envoyer command à controller → écrit dans
 *     sBattleBuffersTransferData puis PrepareBufferDataTransfer(TO_CONTROLLER)
 *     copie vers gBattleBufferA[battler][N]. MarkBattlerForControllerExec
 *     set le bit gBattleControllerExecFlags[battler].
 *   - Controller dispatch lit gBattleBufferA[battler][0] = opcode, execute,
 *     écrit response → gBattleBufferB via PrepareBufferDataTransfer(TO_ENGINE).
 *
 * Notre port :
 *   - Buffers A/B implémentés Uint8Array per battler.
 *   - PrepareBufferDataTransfer 1:1 strict pour single battle.
 *   - SetBattlePartyIds 1:1 strict.
 *   - InitSinglePlayerBtlControllers : structure 1:1 (= controller funcs
 *     pour Birch/wild restent dette R3 car cascade Player/Opponent controller).
 *
 * Dépendances :
 *   - state.ts : gActiveBattler, gBattlersCount, gBattleTypeFlags,
 *     gBattlerPartyIndexes
 *   - constants.ts : BATTLE_TYPE_* flags
 *   - save-block-state.ts : gPlayerParty
 *   - battle-controllers.ts : MarkBattlerForControllerExec
 */

import {
  gActiveBattler, gBattlersCount, gBattleTypeFlags,
  gBattlerPartyIndexes,
} from './state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_MULTI, BATTLE_TYPE_TWO_OPPONENTS,
} from './constants';
import { gSaveBlock1Ptr } from '../save/save-block-state';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `MAX_BATTLERS_COUNT` = 4. */
const MAX_BATTLERS_COUNT = 4;
/** 1:1 décomp `PARTY_SIZE` = 6. */
const PARTY_SIZE = 6;
/** 1:1 décomp `B_COMM_TO_CONTROLLER` = 0 (= engine → controller). */
export const B_COMM_TO_CONTROLLER = 0;
/** 1:1 décomp `B_COMM_TO_ENGINE` = 1 (= controller → engine). */
export const B_COMM_TO_ENGINE = 1;
/** 1:1 décomp `B_SIDE_PLAYER` = 0 / `B_SIDE_OPPONENT` = 1. */
const B_SIDE_PLAYER = 0;

/** 1:1 décomp `MON_DATA_HP` = 6 / `MON_DATA_SPECIES_OR_EGG` = 0x4D /
 *  `MON_DATA_IS_EGG` = 78 / `MON_DATA_SPECIES` = 11 (pokemon.h). */
const MON_DATA_HP = 6;
const MON_DATA_SPECIES = 11;
const MON_DATA_SPECIES_OR_EGG = 0x4D;
const MON_DATA_IS_EGG = 78;

/** 1:1 décomp `SPECIES_NONE` = 0 / `SPECIES_EGG` = 412. */
const SPECIES_NONE = 0;
const SPECIES_EGG = 412;

// ─── Core IPC buffers 1:1 décomp ───────────────────────────────────────────

/** 1:1 décomp `sBattleBuffersTransferData[0x100]` (battle_controllers.c:21). */
export const sBattleBuffersTransferData = new Uint8Array(0x100);

/** 1:1 décomp `gBattleBufferA[MAX_BATTLERS_COUNT][0x200]` (battle.h).
 *  Buffer commands engine → controller per battler. */
export const gBattleBufferA: Uint8Array[] = [
  new Uint8Array(0x200), new Uint8Array(0x200),
  new Uint8Array(0x200), new Uint8Array(0x200),
];

/** 1:1 décomp `gBattleBufferB[MAX_BATTLERS_COUNT][0x200]` (battle.h).
 *  Buffer responses controller → engine per battler. */
export const gBattleBufferB: Uint8Array[] = [
  new Uint8Array(0x200), new Uint8Array(0x200),
  new Uint8Array(0x200), new Uint8Array(0x200),
];

// ─── Cascade helpers (= GetMonData wire vers party-storage) ────────────────

/** 1:1 décomp `GetMonData(mon, field)` (pokemon.c). */
function _GetMonData(mon: unknown, field: number): number {
  if (!mon) return 0;
  const m = mon as {
    hp?: number; species?: number; isEgg?: boolean;
    level?: number;
  };
  switch (field) {
    case MON_DATA_HP: return m.hp ?? 0;
    case MON_DATA_SPECIES: return m.species ?? 0;
    case MON_DATA_SPECIES_OR_EGG:
      if (m.isEgg) return SPECIES_EGG;
      return m.species ?? 0;
    case MON_DATA_IS_EGG: return m.isEgg ? 1 : 0;
  }
  return 0;
}

/** 1:1 décomp `GET_BATTLER_SIDE2(battler)` (battle.h). */
function _GET_BATTLER_SIDE2(battler: number): number {
  return battler & 1;
}

// ─── SetBattlePartyIds (battle_controllers.c:586-654) — 1:1 strict ─────────

/** 1:1 décomp `SetBattlePartyIds()` (battle_controllers.c:586-654).
 *  Init `gBattlerPartyIndexes[battler]` au premier mon healthy
 *  (= !KO, !egg, !SPECIES_NONE) dans la party correspondante. */
export function SetBattlePartyIds(): void {
  if (gBattleTypeFlags & BATTLE_TYPE_MULTI) return;

  const playerParty = gSaveBlock1Ptr.playerParty ?? [];
  // Get gEnemyParty depuis state.
  const enemyParty = ((globalThis as { __battleState?: { gEnemyParty?: unknown[] } }).__battleState?.gEnemyParty) ?? [];

  for (let i = 0; i < gBattlersCount; i++) {
    for (let j = 0; j < PARTY_SIZE; j++) {
      if (i < 2) {
        if (_GET_BATTLER_SIDE2(i) === B_SIDE_PLAYER) {
          const mon = playerParty[j];
          if (_GetMonData(mon, MON_DATA_HP) !== 0
              && _GetMonData(mon, MON_DATA_SPECIES_OR_EGG) !== SPECIES_NONE
              && _GetMonData(mon, MON_DATA_SPECIES_OR_EGG) !== SPECIES_EGG
              && !_GetMonData(mon, MON_DATA_IS_EGG)) {
            gBattlerPartyIndexes[i] = j;
            break;
          }
        } else {
          const mon = enemyParty[j];
          if (_GetMonData(mon, MON_DATA_HP) !== 0
              && _GetMonData(mon, MON_DATA_SPECIES_OR_EGG) !== SPECIES_NONE
              && _GetMonData(mon, MON_DATA_SPECIES_OR_EGG) !== SPECIES_EGG
              && !_GetMonData(mon, MON_DATA_IS_EGG)) {
            gBattlerPartyIndexes[i] = j;
            break;
          }
        }
      } else {
        if (_GET_BATTLER_SIDE2(i) === B_SIDE_PLAYER) {
          const mon = playerParty[j];
          // 1:1 décomp ll. 625-633 : SPECIES (pas SPECIES_OR_EGG, typo Game Freak).
          if (_GetMonData(mon, MON_DATA_HP) !== 0
              && _GetMonData(mon, MON_DATA_SPECIES) !== SPECIES_NONE
              && _GetMonData(mon, MON_DATA_SPECIES_OR_EGG) !== SPECIES_EGG
              && !_GetMonData(mon, MON_DATA_IS_EGG)
              && gBattlerPartyIndexes[i - 2] !== j) {
            gBattlerPartyIndexes[i] = j;
            break;
          }
        } else {
          const mon = enemyParty[j];
          if (_GetMonData(mon, MON_DATA_HP) !== 0
              && _GetMonData(mon, MON_DATA_SPECIES_OR_EGG) !== SPECIES_NONE
              && _GetMonData(mon, MON_DATA_SPECIES_OR_EGG) !== SPECIES_EGG
              && !_GetMonData(mon, MON_DATA_IS_EGG)
              && gBattlerPartyIndexes[i - 2] !== j) {
            gBattlerPartyIndexes[i] = j;
            break;
          }
        }
      }
    }
  }

  // 1:1 décomp ll. 651-652 : TWO_OPPONENTS override.
  if (gBattleTypeFlags & BATTLE_TYPE_TWO_OPPONENTS) {
    gBattlerPartyIndexes[1] = 0;
    gBattlerPartyIndexes[3] = 3;
  }
}

// ─── PrepareBufferDataTransfer (battle_controllers.c:656-678) — 1:1 strict ─

/** 1:1 décomp `PrepareBufferDataTransferLink(bufferId, size, data)` (734-773).
 *  Link battle variant — pour notre port (= laissé de côté), noop documenté. */
function _PrepareBufferDataTransferLink(_bufferId: number, _size: number, _data: Uint8Array): void {
  // User dit "laisse de côté link", noop documenté.
}

/** 1:1 décomp `PrepareBufferDataTransfer(bufferId, data, size)`
 *  (battle_controllers.c:656-678). Copy data → gBattleBufferA ou B selon
 *  bufferId, ou route vers link variant si BATTLE_TYPE_LINK. */
export function PrepareBufferDataTransfer(bufferId: number, data: Uint8Array, size: number): void {
  if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
    _PrepareBufferDataTransferLink(bufferId, size, data);
    return;
  }

  switch (bufferId) {
    case B_COMM_TO_CONTROLLER:
      // 1:1 décomp ll. 669-671 : copy size bytes data → gBattleBufferA[active].
      for (let i = 0; i < size; i++) {
        gBattleBufferA[gActiveBattler][i] = data[i];
      }
      break;
    case B_COMM_TO_ENGINE:
      // 1:1 décomp ll. 673-675 : copy size bytes data → gBattleBufferB[active].
      for (let i = 0; i < size; i++) {
        gBattleBufferB[gActiveBattler][i] = data[i];
      }
      break;
  }
}

// ─── BtlController_Emit* (battle_controllers.c:1180-1500) — 1:1 strict ────

/** 1:1 décomp `CONTROLLER_TWORETURNVALUES` (battle_controllers.h:35). */
const CONTROLLER_TWORETURNVALUES = 0x21;

/** 1:1 décomp `BtlController_EmitTwoReturnValues(bufferId, ret8, ret16)`
 *  (battle_controllers.c:1372-1379). Setup CONTROLLER_TWORETURNVALUES command
 *  + ret8 + ret16 (low/high bytes) dans transfer staging buffer puis flush
 *  vers gBattleBufferA ou B selon bufferId. Utilisé par les input handlers
 *  (HandleInputChooseAction/Move/Target) pour signaler engine du choix joueur. */
export function BtlController_EmitTwoReturnValues(bufferId: number, ret8: number, ret16: number): void {
  sBattleBuffersTransferData[0] = CONTROLLER_TWORETURNVALUES;
  sBattleBuffersTransferData[1] = ret8 & 0xFF;
  sBattleBuffersTransferData[2] = ret16 & 0xFF;
  sBattleBuffersTransferData[3] = (ret16 & 0xFF00) >> 8;
  PrepareBufferDataTransfer(bufferId, sBattleBuffersTransferData, 4);
}

/** 1:1 décomp `EWRAM_DATA struct UnusedControllerStruct gUnusedControllerStruct`
 *  (battle_controllers.c) — struct jamais LUE, mais les handlers UnkVar/UnkFlag
 *  des deux controllers y écrivent (corps 1:1). UNE instance partagée. */
export const gUnusedControllerStruct = { unk: 0, flag: 0 };

/** 1:1 décomp `CONTROLLER_ONERETURNVALUE` (battle_controllers.h, enum = 0x23). */
const CONTROLLER_ONERETURNVALUE = 0x23;

/** 1:1 décomp `void BtlController_EmitOneReturnValue(u8 bufferId, u16 ret)`
 *  (battle_controllers.c) : réponse 16-bit seule → bufferB[1..2] LE
 *  (ex. item choisi par l'AI en réponse à OPENBAG). */
export function BtlController_EmitOneReturnValue(bufferId: number, ret: number): void {
  sBattleBuffersTransferData[0] = CONTROLLER_ONERETURNVALUE;
  sBattleBuffersTransferData[1] = ret & 0xFF;
  sBattleBuffersTransferData[2] = (ret & 0xFF00) >> 8;
  sBattleBuffersTransferData[3] = 0;
  PrepareBufferDataTransfer(bufferId, sBattleBuffersTransferData, 4);
}

// ─── Init helpers (battle_controllers.c:81-111) ────────────────────────────

/** 1:1 décomp `InitBattleControllers()` (battle_controllers.c:81-111). */
export function InitBattleControllers(): void {
  // 1:1 décomp ll. 85-87 : RecordedBattle_Init selon mode.
  // Dette R3 : recorded battle non porté (= user "laisse de côté").

  // 1:1 décomp ll. 90-91 : RecordedBattle_SaveParties.
  // Dette R3.

  // 1:1 décomp ll. 93-96 : link vs single player init.
  if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
    // Dette R3 : InitLinkBtlControllers (= user "laisse de côté").
  } else {
    InitSinglePlayerBtlControllers();
  }

  SetBattlePartyIds();

  // 1:1 décomp ll. 100-104 : multi battle party order buffer.
  if (!(gBattleTypeFlags & BATTLE_TYPE_MULTI)) {
    for (let i = 0; i < gBattlersCount; i++) {
      _BufferBattlePartyCurrentOrderBySide(i, 0);
    }
  }

  // 1:1 décomp ll. 106-110 : clear tvMovePoints + tv structs.
  const stateMod = (globalThis as { __battleState?: { gBattleStruct?: {
    tvMovePoints?: number[]; tv?: Record<string, number>;
  } } }).__battleState;
  const s = stateMod?.gBattleStruct;
  if (s?.tvMovePoints) s.tvMovePoints.fill(0);
  if (s?.tv) {
    for (const k of Object.keys(s.tv)) {
      s.tv[k] = 0;
    }
  }
}

/** 1:1 décomp `InitSinglePlayerBtlControllers()` (113-388).
 *  Init gBattlerControllerFuncs + gBattlerPositions selon battle type.
 *  Notre port : squelette + dette R3 cascade vers Player/Opponent controllers
 *  individuels (= notre battle-flow.ts handle state machine direct). */
export function InitSinglePlayerBtlControllers(): void {
  // Le décomp init 4 battlers : 2 player (front/back) + 2 opponent (front/back).
  // Chaque battler reçoit un controller func (PlayerHandleX, OpponentHandleX,
  // WildHandleX, etc.) qui dispatche les commands depuis gBattleBufferA.
  //
  // Notre port : battle-flow.ts state machine handle direct sans dispatcher.
  // Le port complet de InitSinglePlayerBtlControllers requires Player/Opponent
  // controllers individuels (= ~10000l C total) qui sont dette R3 multi-session.
  //
  // Pour now : init gBattlerPositions = identity (= single battle default).
  const util = (globalThis as Record<string, unknown>).__battleUtil as {
    gBattlerPositions?: number[];
  } | undefined;
  if (util?.gBattlerPositions) {
    util.gBattlerPositions[0] = 0;  // B_POSITION_PLAYER_LEFT
    util.gBattlerPositions[1] = 1;  // B_POSITION_OPPONENT_LEFT
    util.gBattlerPositions[2] = 2;  // B_POSITION_PLAYER_RIGHT
    util.gBattlerPositions[3] = 3;  // B_POSITION_OPPONENT_RIGHT
  }
}

/** 1:1 décomp `BufferBattlePartyCurrentOrderBySide(battler, side)`. */
function _BufferBattlePartyCurrentOrderBySide(battler: number, flankId: number): void {
  // 1:1 décomp party_menu.c:5918 : init battlerPartyOrders[battler] = [mon actif,
  // puis les autres] (nibbles). Impl dans le miroir battle_main (lazy anti-cycle).
  const m = (globalThis as Record<string, unknown>).__battlePartyOrder as {
    BufferBattlePartyCurrentOrderBySide?: (b: number, f: number) => void;
  } | undefined;
  m?.BufferBattlePartyCurrentOrderBySide?.(battler, flankId);
}

// ─── Helper export for battle-action-selection (= replace lazy globalThis) ─

/** Helper public : read byte du gBattleBufferB[battler][offset]. */
export function readBattleBufferB(battler: number, offset: number): number {
  return gBattleBufferB[battler]?.[offset] ?? 0;
}

/** Helper public : write byte au gBattleBufferB[battler][offset]. */
export function writeBattleBufferB(battler: number, offset: number, value: number): void {
  if (gBattleBufferB[battler]) gBattleBufferB[battler][offset] = value & 0xFF;
}

/** Helper public : read byte du gBattleBufferA[battler][offset]. */
export function readBattleBufferA(battler: number, offset: number): number {
  return gBattleBufferA[battler]?.[offset] ?? 0;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

// Expose via __battleState aussi pour la lazy lookup (= battle-action-selection).
const battleStateMod = (globalThis as Record<string, unknown>).__battleState as Record<string, unknown> | undefined;
if (battleStateMod) {
  battleStateMod.gBattleBufferA = gBattleBufferA;
  battleStateMod.gBattleBufferB = gBattleBufferB;
}

(globalThis as Record<string, unknown>).__battleControllersIpc = {
  sBattleBuffersTransferData,
  gBattleBufferA, gBattleBufferB,
  PrepareBufferDataTransfer, SetBattlePartyIds,
  InitBattleControllers, InitSinglePlayerBtlControllers,
  readBattleBufferA, readBattleBufferB, writeBattleBufferB,
  BtlController_EmitTwoReturnValues,
  B_COMM_TO_CONTROLLER, B_COMM_TO_ENGINE,
};
