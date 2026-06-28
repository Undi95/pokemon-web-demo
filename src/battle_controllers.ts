/**
 * src/battle_controllers.ts — mirror 1:1 de battle_controllers.c (1585 l).
 * CONSOLIDATION (2026-06-28) des 3 fichiers éclatés : battle-controllers-ipc.ts
 * (IPC/buffers) + battle-controllers-init.ts (init contrôleurs) + battle-controllers.ts
 * (dispatch). Inter-imports devenus internes. Source : src/battle_controllers.c.
 */
import { gActiveBattler, gBattlersCount, gBattleTypeFlags, gBattlerPartyIndexes } from './engine/battle/state';
import { BATTLE_TYPE_LINK, BATTLE_TYPE_MULTI, BATTLE_TYPE_TWO_OPPONENTS } from './engine/battle/constants';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { setBattlersCount, setBattlerControllerFunc } from './engine/battle/state';
import { BATTLE_TYPE_DOUBLE, BATTLE_TYPE_SAFARI, BATTLE_TYPE_WALLY_TUTORIAL } from './engine/battle/constants';
import { gBattlerPositions, B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT } from './engine/battle/util';
import { SetControllerToPlayer } from './battle_controller_player';
import { SetControllerToOpponent } from './battle_controller_opponent';
import { setBattleMainFunc, BeginBattleIntro } from './engine/battle/battle-main-functions';
import { MAX_BATTLERS_COUNT, gBattleScripting, setBattleControllerExecFlags, gBattleControllerExecFlags, setActiveBattler, gBattlerAttacker, gBattlerTarget, gCurrentMove, gChosenMove, gBattleOutcome, gBattleStruct, gBattleWeather, gBattleMons, gPotentialItemEffectBattler, gLastUsedItem, gLastUsedAbility, type DisableStruct } from './engine/battle/state';
import { gBattleTextBuff1, gBattleTextBuff2, gBattleTextBuff3 } from '../include/battle_message';
import { CONTROLLER_PRINTSTRING, CONTROLLER_PRINTSTRINGPLAYERONLY, CONTROLLER_SETMONDATA, CONTROLLER_MOVEANIMATION, CONTROLLER_HEALTHBARUPDATE, CONTROLLER_HITANIMATION, CONTROLLER_FAINTANIMATION, CONTROLLER_STATUSICONUPDATE, CONTROLLER_STATUSANIMATION, CONTROLLER_BATTLEANIMATION, CONTROLLER_PLAYSE, CONTROLLER_PLAYFANFAREORBGM, CONTROLLER_FAINTINGCRY, CONTROLLER_RETURNMONTOBALL, CONTROLLER_SPRITEINVISIBILITY, CONTROLLER_SWITCHINANIM, CONTROLLER_DRAWPARTYSTATUSSUMMARY, CONTROLLER_HIDEPARTYSTATUSSUMMARY, CONTROLLER_TRAINERSLIDE, CONTROLLER_TRAINERSLIDEBACK, CONTROLLER_BALLTHROWANIM, CONTROLLER_EXPUPDATE, CONTROLLER_CHOOSEPOKEMON, CONTROLLER_LINKSTANDBYMSG, CONTROLLER_CANTSWITCH, CONTROLLER_UNKNOWNYESNOBOX, CONTROLLER_RESETACTIONMOVESELECTION, CONTROLLER_ENDLINKBATTLE, CONTROLLER_INTROSLIDE, CONTROLLER_INTROTRAINERBALLTHROW, CONTROLLER_DRAWTRAINERPIC, CONTROLLER_LOADMONSPRITE, CONTROLLER_GETMONDATA, enqueueBattleEvent, buildBattleMsgDataSnapshot, type BattleMsgData } from './engine/battle/battle-event-queue';
import { resolveDecompConstant } from '../harness/runtime/decomp-constants';
import type { BattleScriptContext } from './engine/battle/script-interpreter';
import { FillWindowPixelBuffer, PutWindowTilemap, CopyWindowToVram } from './window';
import { AddTextPrinterParameterized4 } from './menu';
import { gTextFlags } from './text';
import { GetPlayerTextSpeedDelay } from './menu';
import { getBattleTextOnWindowsInfo, B_WIN_COPYTOVRAM, B_WIN_MSG } from './engine/battle/battle-windows';
import { gBitTable } from '../include/util';

// ── depuis battle-controllers-ipc.ts ──────────────────────────────────────────
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





// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

// MAX_BATTLERS_COUNT (battle.h:9) : importé en haut (bloc controllers), pas redéclaré.
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

// ─── RÉCONCILIATION (2026-06-29) : InitBattleControllers / InitSinglePlayerBtlControllers /
//     _BufferBattlePartyCurrentOrderBySide — versions CANONIQUES (réelles, câblées par
//     battle_main.ts:5291) gardées plus bas (depuis battle-controllers-init.c). Les versions
//     ipc (stubs : InitSinglePlayer = identité __battleUtil) sont retirées ici. ─────────────

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


// ── depuis battle-controllers-init.ts ──────────────────────────────────────────
/**
 * battle/battle-controllers-init.ts — Port 1:1 strict de InitBattleControllers
 * + InitSinglePlayerBtlControllers.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c:81-235`
 *
 * Rôle : APRÈS `SetUpBattleVarsAndBirchZigzagoon` (qui pose tous les
 * `gBattlerControllerFuncs[i] = BattleControllerDummy` + `gBattleMainFunc =
 * BeginBattleIntroDummy`), `InitBattleControllers` installe les VRAIS
 * controllers par battler + `gBattleMainFunc = BeginBattleIntro`. C'est le
 * point qui « arme » la state-machine combat : au tick suivant de
 * `BattleMainCB1`, `gBattleMainFunc()` = `BeginBattleIntro` et
 * `gBattlerControllerFuncs[0]()` = `SetControllerToPlayer` (qui s'auto-remplace
 * par `PlayerBufferRunCommand`).
 *
 * Appelé par `CB2_HandleStartBattle` case 15 (battle-link-start.ts).
 *
 * Dépendances :
 *   - state.ts : gBattleTypeFlags, setBattlersCount, setBattlerControllerFunc
 *   - battle-controller-player.ts : SetControllerToPlayer
 *   - battle-controller-opponent.ts : SetControllerToOpponent
 *   - battle-main-functions.ts : setBattleMainFunc, BeginBattleIntro
 *   - battle-controllers-ipc.ts : SetBattlePartyIds
 *   - util.ts : gBattlerPositions, B_POSITION_*
 */









// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `B_BATTLER_0..3` (battle.h). */
const B_BATTLER_0 = 0;
const B_BATTLER_1 = 1;
const B_BATTLER_2 = 2;
const B_BATTLER_3 = 3;
/** 1:1 décomp `B_POSITION_PLAYER_RIGHT` = 2, `B_POSITION_OPPONENT_RIGHT` = 3. */
const B_POSITION_PLAYER_RIGHT = 2;
const B_POSITION_OPPONENT_RIGHT = 3;

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `RecordedBattle_Init(mode)` + `RecordedBattle_SaveParties()`. */
function _RecordedBattle_Init(_mode: number): void { /* Dette R3 : recorded battle */ }
function _RecordedBattle_SaveParties(): void { /* Dette R3 */ }

/** 1:1 décomp `InitLinkBtlControllers()`. */
function _InitLinkBtlControllers(): void { /* Dette R3 : link battle offline */ }

/** 1:1 décomp `BufferBattlePartyCurrentOrderBySide(battler, side)`
 *  (party_menu.c:5918) : init battlerPartyOrders[battler] = nibbles
 *  [mon ACTIF, puis les autres] — la base de l'ordre d'affichage du party menu
 *  COMBAT. Impl dans le miroir battle_main (lazy anti-cycle). */
function _BufferBattlePartyCurrentOrderBySide(battler: number, flankId: number): void {
  const m = (globalThis as Record<string, unknown>).__battlePartyOrder as {
    BufferBattlePartyCurrentOrderBySide?: (b: number, f: number) => void;
  } | undefined;
  m?.BufferBattlePartyCurrentOrderBySide?.(battler, flankId);
}

// ─── InitSinglePlayerBtlControllers (battle_controllers.c:113-235) ─────────

/** 1:1 décomp `InitSinglePlayerBtlControllers()` (battle_controllers.c:113-235).
 *  Pose gBattleMainFunc = BeginBattleIntro + installe les controllers par
 *  battler selon le type (single / double).
 *
 *  Couvre 1:1 : single standard (player vs opponent), double (×4). Les chemins
 *  SAFARI / WALLY_TUTORIAL / INGAME_PARTNER / RECORDED nécessitent des
 *  controllers spécialisés non encore portés (`SetControllerToSafari/Wally/...`)
 *  → fallback `SetControllerToPlayer` + dette R3 explicite. */
function InitSinglePlayerBtlControllers(): void {
  if (!(gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) {
    // 1:1 décomp ll. 162-216 : single battle.
    setBattleMainFunc(BeginBattleIntro);

    if (gBattleTypeFlags & BATTLE_TYPE_SAFARI) {
      // Dette R3 : SetControllerToSafari non porté → fallback player.
      setBattlerControllerFunc(B_BATTLER_0, SetControllerToPlayer);
    } else if (gBattleTypeFlags & BATTLE_TYPE_WALLY_TUTORIAL) {
      // Dette R3 : SetControllerToWally non porté → fallback player.
      setBattlerControllerFunc(B_BATTLER_0, SetControllerToPlayer);
    } else {
      setBattlerControllerFunc(B_BATTLER_0, SetControllerToPlayer);
    }
    gBattlerPositions[B_BATTLER_0] = B_POSITION_PLAYER_LEFT;

    setBattlerControllerFunc(B_BATTLER_1, SetControllerToOpponent);
    gBattlerPositions[B_BATTLER_1] = B_POSITION_OPPONENT_LEFT;

    setBattlersCount(2);
    // 1:1 décomp ll. 180-215 : sous-chemins RECORDED → dette R3 (offline).
  } else {
    // 1:1 décomp ll. 217-235 : double battle (×4 controllers).
    setBattleMainFunc(BeginBattleIntro);

    setBattlerControllerFunc(B_BATTLER_0, SetControllerToPlayer);
    gBattlerPositions[B_BATTLER_0] = B_POSITION_PLAYER_LEFT;

    setBattlerControllerFunc(B_BATTLER_1, SetControllerToOpponent);
    gBattlerPositions[B_BATTLER_1] = B_POSITION_OPPONENT_LEFT;

    setBattlerControllerFunc(B_BATTLER_2, SetControllerToPlayer);
    gBattlerPositions[B_BATTLER_2] = B_POSITION_PLAYER_RIGHT;

    setBattlerControllerFunc(B_BATTLER_3, SetControllerToOpponent);
    gBattlerPositions[B_BATTLER_3] = B_POSITION_OPPONENT_RIGHT;

    setBattlersCount(4);
  }
}

// ─── InitBattleControllers (battle_controllers.c:81-111) — 1:1 strict ──────

/** 1:1 décomp `InitBattleControllers()` (battle_controllers.c:81-111). */
export function InitBattleControllers(): void {
  // 1:1 décomp ll. 85-91 : recorded battle init (R3 offline).
  if (!(gBattleTypeFlags & BATTLE_TYPE_LINK)) {
    _RecordedBattle_Init(0 /* B_RECORD_MODE_RECORDING */);
  } else {
    _RecordedBattle_Init(1 /* B_RECORD_MODE_PLAYBACK */);
  }
  _RecordedBattle_SaveParties();

  // 1:1 décomp ll. 93-96 : link vs single.
  if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
    _InitLinkBtlControllers();
  } else {
    InitSinglePlayerBtlControllers();
  }

  // 1:1 décomp l. 98 : assigne gBattlerPartyIndexes au premier mon valide.
  SetBattlePartyIds();

  // 1:1 décomp ll. 100-104 : buffer party order (noop offline).
  if (!(gBattleTypeFlags & BATTLE_TYPE_MULTI)) {
    const stateMod = (globalThis as { __battleState?: { gBattlersCount?: number } }).__battleState;
    const count = stateMod?.gBattlersCount ?? 2;
    for (let i = 0; i < count; i++) {
      _BufferBattlePartyCurrentOrderBySide(i, 0);
    }
  }

  // 1:1 décomp ll. 106-110 : zero gBattleStruct->tvMovePoints + tv (R3 TV data).
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleControllersInit = {
  InitBattleControllers, InitSinglePlayerBtlControllers,
};


// ── depuis battle-controllers.ts ──────────────────────────────────────────
/**
 * battle/battle-controllers.ts — minimal stubs pour battle controllers async.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_controllers.c` (~2300 lignes,
 *     les `BtlController_Emit*` fns + dispatch via gBattlerControllerFuncs[])
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_util.c` (= helpers comme
 *     `MarkBattlerForControllerExec`, `PrepareStringBattle`)
 *   - `D:/Projet 1/decomps/pokeemeraude/src/util.c:7` (= `gBitTable[]`)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/battle.h:9` (= MAX_BATTLERS_COUNT=4)
 *
 * Rationale : les opcodes Batch 04 (attackanimation/printstring/waitmessage/etc.)
 * appellent `BtlController_Emit*` puis `MarkBattlerForControllerExec`. Cela set
 * un bit dans `gBattleControllerExecFlags`. Les opcodes `waitanimation` et
 * `waitmessage` pause jusqu'à ce que le flag soit 0.
 *
 * Pour Phase 1 (= backing infrastructure pas wired au gameplay) :
 *   - `MarkBattlerForControllerExec` 1:1 décomp (set bit).
 *   - `BtlController_Emit*` = stubs vides (= aucune anim/text rendu).
 *   - `tickBattleControllers()` clear le flag (= simule les controllers finis
 *     instantané). Appelé entre les handler calls par runBattleScript loop.
 *
 * Quand on wirera ce battle interpreter au gameplay, ces stubs seront remplacés
 * par de vraies fonctions qui :
 *   1. Émettent les commandes UI au framework graphique (anim, text, fade, etc.)
 *   2. Le framework appelle un callback "controller done" qui clear le bit.
 */







// ── Rendu texte RÉEL (voie L) — primitives window/text GBA + data battle 1:1.
//    Aucun de ces modules n'importe battle/ → import statique sûr (pas de cycle).






// ─── Helper : snapshot BattleMsgData for PrintString events ─────────────────

/** Build BattleMsgData snapshot 1:1 décomp battle_controllers.c:1147-1166.
 *  Capture gBattleTextBuff1/2/3 + abilities + state vars current. */
function _snapshotMsgData(): BattleMsgData {
  // Resolve gCurrentMove.type via gBattleMoves[gCurrentMove].type.
  let moveType = 0;
  try {
    const moves = (globalThis as { __battle_moves?: Array<{ type: number }> }).__battle_moves;
    if (moves && moves[gCurrentMove]) moveType = moves[gCurrentMove].type;
  } catch { /* fallthrough */ }
  return buildBattleMsgDataSnapshot({
    gCurrentMove,
    gChosenMove,
    gLastUsedItem,
    gLastUsedAbility,
    gBattleScripting: { battler: gBattleScripting.battler },
    gBattlerAttacker,
    gBattlerTarget,
    gBattleStruct: {
      scriptPartyIdx: gBattleStruct.scriptPartyIdx ?? 0,
      hpScale: gBattleStruct.hpScale ?? 0,
    },
    gPotentialItemEffectBattler,
    gBattleMoveType: moveType,
    gBattleMons,
    gBattleTextBuff1,
    gBattleTextBuff2,
    gBattleTextBuff3,
    maxBattlersCount: MAX_BATTLERS_COUNT,
  });
}

// Suppress unused-import warning si certains symboles ne sont pas utilisés
// (= placeholder for future Phase 1.4 events).
void resolveDecompConstant;

// ─── gBitTable[] (util.c:7) → consolidé sur le miroir `src/game/util.ts` ──────
// (source unique ; les `_gBitTable` privés de battle-action-selection/battle-main-
//  functions restent à migrer — cf. ledger.) import+export = binding local + ré-export.

export { gBitTable };

// ─── Controller exec flags helpers ──────────────────────────────────────────

// MarkBattlerForControllerExec : DÉPLACÉ dans le miroir game/battle_util.ts
// (battle_util.c, 2026-06-13).

/** Clear exec flag pour battler donné (= controller signal "I'm done").
 *  Pas une fonction 1:1 décomp en soi (= dans le décomp c'est implicit par le
 *  controller qui termine son state machine), mais nécessaire pour le wire
 *  futur. Appelé par tickBattleControllers (= Phase 1 stub clear immédiat). */
export function clearBattlerExecFlag(battlerId: number): void {
  setBattleControllerExecFlags(gBattleControllerExecFlags & ~gBitTable[battlerId]);
}

/** Tick (= clear all exec flags) pour simuler les controllers finis instantané.
 *  Phase 1.4 : remplacer par real per-controller tick une fois wired au framework
 *  UI. Pour Phase 1, clear tout = scripts s'avancent sans wait.
 *
 *  Reset aussi `gBattleCommunication[MSG_DISPLAY]` (= 0) car le décomp utilise
 *  cette flag pour signaler "text print en cours". Sans wire UI text, on
 *  simule "fini instantanément" en clearing ici. Sinon `Cmd_waitmessage`
 *  loop infiniment (= 497/639 scripts stuck post wire avant fix).
 *
 *  Note : MSG_DISPLAY = 0 (= constant in battle.h:84). On utilise direct
 *  index pour éviter circular imports. */
export function tickBattleControllers(): void {
  setBattleControllerExecFlags(0);
  // 1:1 décomp simulate "text print done" instantané.
  // MSG_DISPLAY = 7 (= constants.ts:458 from battle.h).
  const bs = (globalThis as { __battleState?: { gBattleCommunication?: number[] } })
    .__battleState;
  if (bs?.gBattleCommunication) {
    bs.gBattleCommunication[7] = 0;  // MSG_DISPLAY = 7.
  }
}

// ─── BtlController_Emit* stubs ──────────────────────────────────────────────

/** Helper voie L (décomp) : flush `bytes` dans gBattleBufferA[active] via
 *  PrepareBufferDataTransfer (= 1:1 : chaque BtlController_EmitXxx écrit
 *  sBattleBuffersTransferData[] puis flush). INDISPENSABLE : sans ça,
 *  Player/OpponentBufferRunCommand relit un VIEUX opcode dans bufferA[0] et
 *  dispatch le mauvais handler (ou ne clear jamais le flag → blocage du tour). */
function _emitToBufferA(bufferId: number, bytes: number[]): void {
  for (let i = 0; i < bytes.length; i++) sBattleBuffersTransferData[i] = bytes[i] & 0xFF;
  PrepareBufferDataTransfer(bufferId, sBattleBuffersTransferData, bytes.length);
}

/** 1:1 décomp `BtlController_EmitMoveAnimation` (battle_controllers.c:1107-1135).
 *  Écrit bufferA (voie L) + enqueue event (compat voie V). Le disableStruct
 *  memcpy [16..] du décomp est différé (= le handler MoveAnimation clear immédiat,
 *  anim sprite = chantier A/B). */
export function BtlController_EmitMoveAnimation(
  bufferId: number,
  move: number,
  turnOfMove: number,
  movePower: number,
  dmg: number,
  friendship: number,
  disableStructPtr: DisableStruct,
  multihit: number,
): void {
  _emitToBufferA(bufferId, [
    CONTROLLER_MOVEANIMATION,
    move & 0xFF, (move >> 8) & 0xFF,
    turnOfMove & 0xFF,
    movePower & 0xFF, (movePower >> 8) & 0xFF,
    dmg & 0xFF, (dmg >> 8) & 0xFF, (dmg >> 16) & 0xFF, (dmg >>> 24) & 0xFF,
    friendship & 0xFF,
    multihit & 0xFF,
    gBattleWeather & 0xFF, (gBattleWeather >> 8) & 0xFF,
    0, 0,
  ]);
  enqueueBattleEvent({
    type: CONTROLLER_MOVEANIMATION,
    battler: gActiveBattler,
    move, turnOfMove, movePower, dmg, friendship, multihit,
    weather: gBattleWeather,
    disableStruct: { ...disableStructPtr },
  });
}

/** 1:1 signature décomp `BtlController_EmitPrintString` (battle_controllers.c:1137-1167).
 *  Source utilisé par `PrepareStringBattle`. Enqueue PrintString event avec
 *  snapshot complet du BattleMsgData (= 1:1 décomp build). */
export function BtlController_EmitPrintString(bufferId: number, stringId: number): void {
  // 1:1 décomp battle_controllers.c:1142-1166 : écrit gBattleBufferA[active] =
  // [CONTROLLER_PRINTSTRING, gBattleOutcome, stringId lo, stringId hi, ...msgData].
  // (voie L) PlayerBufferRunCommand lit bufferA[0] → PlayerHandlePrintString, qui
  // relit stringId via bufferA[2]|bufferA[3]<<8. Le BattleMsgData [4..] du décomp
  // est reconstruit côté handler via le snapshot globalThis, donc 4 bytes suffisent.
  sBattleBuffersTransferData[0] = CONTROLLER_PRINTSTRING;
  sBattleBuffersTransferData[1] = gBattleOutcome & 0xFF;
  sBattleBuffersTransferData[2] = stringId & 0xFF;
  sBattleBuffersTransferData[3] = (stringId & 0xFF00) >> 8;
  PrepareBufferDataTransfer(bufferId, sBattleBuffersTransferData, 4);

  // 1:1 décomp (battle_controllers.c:1148-1166) : le BattleMsgData (battlerAttacker/
  // Target/Effect/scrActive/textBuffs/currentMove...) est SÉRIALISÉ dans bufferA[4..]
  // À L'ÉMISSION (= figé). Le handler (PlayerHandlePrintString) lit CE snapshot, PAS
  // un nouveau. CRITIQUE : sans ça, le handler re-snapshote PLUS TARD (quand le
  // controller traite la commande) → gBattlerAttacker/Target ont déjà changé (move
  // suivant / fin de tour) → le NOM dans le message pointe le mauvais Pokémon
  // (ex "ARCKO est déjà paralysé" au lieu de "WAILMER"). On fige le snapshot ici.
  // 1:1 décomp : le snapshot est sérialisé dans gBattleBufferA[active] (PAR BATTLER).
  // On le stocke donc par gActiveBattler — un slot global serait écrasé par le
  // printstring d'un AUTRE battler émis avant que celui-ci soit affiché (= le bug
  // "ARCKO déjà paralysé" : le message d'ARCKO était écrasé par le SPLASH de Wailmer).
  const snap = _snapshotMsgData();
  _printStringMsgDataByBattler[gActiveBattler] = snap;

  // Compat voie V (battle-flow.ts drain) : enqueue aussi l'event. La voie L ne
  // draine pas cette queue (= 0 régression V, 0 double-affichage L car battle-flow
  // est inerte flag-ON).
  enqueueBattleEvent({
    type: CONTROLLER_PRINTSTRING,
    battler: gActiveBattler,
    outcome: gBattleOutcome,
    stringId,
    msgData: snap,
  });
}

/** Snapshot BattleMsgData FIGÉ au dernier EmitPrintString, PAR BATTLER (1:1 décomp =
 *  msgData sérialisé dans bufferA[active][4..] à l'émission). Le handler du battler
 *  `b` l'utilise au lieu de re-snapshoter (qui capturerait des battlers déjà changés,
 *  ou d'un autre move). Indexé par battler pour ne pas être écrasé entre battlers. */
const _printStringMsgDataByBattler: (BattleMsgData | null)[] = [null, null, null, null];
export function getLastPrintStringMsgData(battler?: number): BattleMsgData | null {
  const b = typeof battler === 'number' ? battler : gActiveBattler;
  return _printStringMsgDataByBattler[b] ?? null;
}

/** 1:1 signature décomp `BtlController_EmitPlaySE(bufferId, songId)`
 *  (battle_controllers.c). Enqueue PlaySE event ; battle-flow consume +
 *  appelle audio engine. */
export function BtlController_EmitPlaySE(bufferId: number, songId: number): void {
  // 1:1 décomp battle_controllers.c : [PLAYSE, songId lo, songId hi, 0].
  _emitToBufferA(bufferId, [CONTROLLER_PLAYSE, songId & 0xFF, (songId >> 8) & 0xFF, 0]);
  enqueueBattleEvent({
    type: CONTROLLER_PLAYSE,
    battler: gActiveBattler,
    songId,
  });
}

/** 1:1 signature décomp `BtlController_EmitPlayFanfareOrBGM(buf, songId, isBGM)`
 *  (battle_controllers.c). */
export function BtlController_EmitPlayFanfareOrBGM(bufferId: number, songId: number, isBGM: boolean): void {
  // 1:1 décomp battle_controllers.c:1471-1478 : [PLAYFANFAREORBGM, songId lo, hi, playBGM].
  // Écrit bufferA[0] (sinon le Mark pairé re-dispatche la commande périmée).
  _emitToBufferA(bufferId, [CONTROLLER_PLAYFANFAREORBGM, songId & 0xFF, (songId >> 8) & 0xFF, isBGM ? 1 : 0]);
  enqueueBattleEvent({
    type: CONTROLLER_PLAYFANFAREORBGM,
    battler: gActiveBattler,
    songId,
    isBGM,
  });
}

/** 1:1 signature décomp `BtlController_EmitFaintingCry(buf)`. */
export function BtlController_EmitFaintingCry(bufferId: number): void {
  // 1:1 décomp battle_controllers.c:1480-1487 : [FAINTINGCRY ×4].
  _emitToBufferA(bufferId, [CONTROLLER_FAINTINGCRY, CONTROLLER_FAINTINGCRY, CONTROLLER_FAINTINGCRY, CONTROLLER_FAINTINGCRY]);
  enqueueBattleEvent({
    type: CONTROLLER_FAINTINGCRY,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitHitAnimation(buf)`. */
export function BtlController_EmitHitAnimation(bufferId: number): void {
  // 1:1 décomp battle_controllers.c : les 4 bytes = CONTROLLER_HITANIMATION.
  _emitToBufferA(bufferId, [CONTROLLER_HITANIMATION, CONTROLLER_HITANIMATION, CONTROLLER_HITANIMATION, CONTROLLER_HITANIMATION]);
  enqueueBattleEvent({
    type: CONTROLLER_HITANIMATION,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitFaintAnimation(buf)`. */
export function BtlController_EmitFaintAnimation(bufferId: number): void {
  // 1:1 décomp battle_controllers.c:1062-1068 : [FAINTANIMATION ×4]. INDISPENSABLE :
  // `Cmd_dofaintanimation` émet ceci + Mark ; sans bufferA[0] écrit, le Mark re-
  // dispatche bufferA[0] PÉRIMÉ (= le PRINTSTRING « X K.O.! » qui précède) → le
  // message de K.O. s'affiche 2× in-game. Handler = state machine gardée (cf.
  // Player/OpponentHandleFaintAnimation : ExecComplete tant que __battleSpritesData
  // pas câblé ; visuel via enqueue).
  _emitToBufferA(bufferId, [CONTROLLER_FAINTANIMATION, CONTROLLER_FAINTANIMATION, CONTROLLER_FAINTANIMATION, CONTROLLER_FAINTANIMATION]);
  enqueueBattleEvent({
    type: CONTROLLER_FAINTANIMATION,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitReturnMonToBall(buf, doFadeOut)`. */
export function BtlController_EmitReturnMonToBall(bufferId: number, doFadeOut: boolean): void {
  // 1:1 décomp battle_controllers.c:1028-1033 : [RETURNMONTOBALL, skipAnim] (2 bytes).
  _emitToBufferA(bufferId, [CONTROLLER_RETURNMONTOBALL, doFadeOut ? 1 : 0]);
  enqueueBattleEvent({
    type: CONTROLLER_RETURNMONTOBALL,
    battler: gActiveBattler,
    doFadeOut,
  });
}

/** 1:1 signature décomp `BtlController_EmitSpriteInvisibility(buf, isInvisible)`. */
export function BtlController_EmitSpriteInvisibility(bufferId: number, isInvisible: boolean): void {
  // 1:1 décomp battle_controllers.c:1536-1543 : écrit gBattleBufferA[active] =
  // [CONTROLLER_SPRITEINVISIBILITY, isInvisible, ...]. INDISPENSABLE : Cmd_moveend
  // (MOVEEND_ATTACKER_VISIBLE, qui fire sur CHAQUE move normal) émet ceci + Mark ;
  // sans bufferA[0] écrit, le Mark re-dispatche bufferA[0] PÉRIMÉ (= MOVEANIMATION)
  // → l'anim/son du move rejoue 2× in-game. Handler = ExecCompleted (visuel via enqueue).
  _emitToBufferA(bufferId, [
    CONTROLLER_SPRITEINVISIBILITY, isInvisible ? 1 : 0,
    CONTROLLER_SPRITEINVISIBILITY, CONTROLLER_SPRITEINVISIBILITY,
  ]);
  enqueueBattleEvent({
    type: CONTROLLER_SPRITEINVISIBILITY,
    battler: gActiveBattler,
    isInvisible,
  });
}

/** 1:1 signature décomp `BtlController_EmitSetMonData(buf, requestId, monIdx,
 *  bytes, data)` (battle_controllers.c).
 *
 *  Le décomp utilise un buffer link/inter-cpu : le caller a déjà write
 *  gBattleMons[gActiveBattler].X, puis cet emit notifie le controller-side
 *  pour persist le change au party-side (= gPlayerParty/gEnemyParty Pokemon
 *  struct via SetMonData).
 *
 *  Notre port : flush direct via SetMonData sur le party slot correspondant.
 *  Couvre les cas usuels en battle : HP, status, PP, held item, level, exp.
 *
 *  Note importante : monIdx est typiquement 0 (= "current battler") ou un
 *  bitmask (= sur Emit de plusieurs mons). Pour single mon, on flush via
 *  gActiveBattler. Pour bitmask, on itère. */
export function BtlController_EmitSetMonData(
  bufferId: number, requestId: number, monToCheck: number, bytes: number, data: unknown,
): void {
  // 1:1 décomp battle_controllers.c:986-996 : gBattleBufferA[active] =
  // [CONTROLLER_SETMONDATA, requestId, monToCheck, bytes, ...dataLE]. Les `bytes` octets de
  // `data` (entier) sont sérialisés en LITTLE-ENDIAN dans bufferA[4..4+bytes]. Le Mark pairé
  // re-dispatche bufferA[0]=SETMONDATA → Player/OpponentHandleSetMonData désérialise et
  // applique au party (SetBattleMonDataFromBuffer). Plus de side-channel __batPSetMonByActive
  // : la donnée passe par le round-trip bufferA comme la décomp (1:1, l'apply n'est plus
  // court-circuité dans l'Emit).
  const v = (typeof data === 'number' ? data : 0) >>> 0;
  const payload = [CONTROLLER_SETMONDATA, requestId & 0xFF, monToCheck & 0xFF, bytes & 0xFF];
  for (let i = 0; i < bytes; i++) payload.push((v >>> (8 * i)) & 0xFF);
  _emitToBufferA(bufferId, payload);
}

/** 1:1 signature décomp `BtlController_EmitPrintSelectionString(buf, stringId)`
 *  (battle_controllers.c:1169-1199). Enqueue PrintStringPlayerOnly event. */
export function BtlController_EmitPrintSelectionString(bufferId: number, stringId: number): void {
  // 1:1 décomp battle_controllers.c : écrit gBattleBufferA[active] =
  // [CONTROLLER_PRINTSTRINGPLAYERONLY, CONTROLLER_PRINTSTRINGPLAYERONLY, stringId lo, hi,
  // ...msgData]. SANS cette écriture bufferA, le controller voie L ne dispatche JAMAIS
  // PlayerHandlePrintSelectionString → les messages de sélection (« Impossible de fuir! »,
  // sac plein, item inutilisable, forfeit...) ne rendent jamais. Le msgData est figé PAR
  // battler (cf EmitPrintString) pour que le handler relise le bon snapshot.
  sBattleBuffersTransferData[0] = CONTROLLER_PRINTSTRINGPLAYERONLY;
  sBattleBuffersTransferData[1] = CONTROLLER_PRINTSTRINGPLAYERONLY;
  sBattleBuffersTransferData[2] = stringId & 0xFF;
  sBattleBuffersTransferData[3] = (stringId & 0xFF00) >> 8;
  PrepareBufferDataTransfer(bufferId, sBattleBuffersTransferData, 4);

  const snap = _snapshotMsgData();
  _printStringMsgDataByBattler[gActiveBattler] = snap;

  enqueueBattleEvent({
    type: CONTROLLER_PRINTSTRINGPLAYERONLY,
    battler: gActiveBattler,
    stringId,
    msgData: snap,
  });
}

/** 1:1 signature décomp `BtlController_EmitEndLinkBattle(buf, outcome)`. */
export function BtlController_EmitEndLinkBattle(bufferId: number, outcome: number): void {
  // 1:1 décomp battle_controllers.c:1576-1583 : [ENDLINKBATTLE, outcome, disableRecord,
  // disableRecord, record bytes…]. disableRecordBattle + RecordedBattle_BufferNewBattlerData
  // = dette R3 → 0 (link/recorded only, jamais atteint en wild solo). Écrit bufferA[0]
  // pour le dispatch (cf. [[EmitGetMonData]]). 6 bytes.
  _emitToBufferA(bufferId, [CONTROLLER_ENDLINKBATTLE, outcome & 0xFF, 0, 0, 0, 0]);
  enqueueBattleEvent({
    type: CONTROLLER_ENDLINKBATTLE,
    battler: gActiveBattler,
    outcome,
  });
}

/** 1:1 signature décomp `BtlController_EmitBattleAnimation(buf, anim, arg)`. */
export function BtlController_EmitBattleAnimation(bufferId: number, animationId: number, argument: number): void {
  // 1:1 décomp battle_controllers.c:1545-1552 : [BATTLEANIMATION, animationId, arg lo, hi].
  _emitToBufferA(bufferId, [CONTROLLER_BATTLEANIMATION, animationId & 0xFF, argument & 0xFF, (argument >> 8) & 0xFF]);
  enqueueBattleEvent({
    type: CONTROLLER_BATTLEANIMATION,
    battler: gActiveBattler,
    animationId,
    argument,
  });
}

/** 1:1 décomp `BtlController_EmitStatusIconUpdate` (battle_controllers.c:1284-1296).
 *  [STATUSICONUPDATE, status1 u32 LE, status2 u32 LE] (9 bytes). Écrit bufferA[0]
 *  pour le dispatch (cf. [[EmitGetMonData]] : sans ça, résidu = mauvais handler). */
export function BtlController_EmitStatusIconUpdate(bufferId: number, status1: number, status2: number): void {
  _emitToBufferA(bufferId, [
    CONTROLLER_STATUSICONUPDATE,
    status1 & 0xFF, (status1 >> 8) & 0xFF, (status1 >> 16) & 0xFF, (status1 >> 24) & 0xFF,
    status2 & 0xFF, (status2 >> 8) & 0xFF, (status2 >> 16) & 0xFF, (status2 >> 24) & 0xFF,
  ]);
  enqueueBattleEvent({
    type: CONTROLLER_STATUSICONUPDATE,
    battler: gActiveBattler,
    status1, status2,
  });
}

/** 1:1 signature décomp `BtlController_EmitHealthBarUpdate(buf, healthValue)`. */
export function BtlController_EmitHealthBarUpdate(bufferId: number, healthValue: number): void {
  // 1:1 décomp battle_controllers.c : [HEALTHBARUPDATE, 0, hp lo, hp hi].
  // PlayerHandleHealthBarUpdate relit hpVal via bufferA[2]|bufferA[3]<<8.
  _emitToBufferA(bufferId, [CONTROLLER_HEALTHBARUPDATE, 0, healthValue & 0xFF, (healthValue >> 8) & 0xFF]);
  enqueueBattleEvent({
    type: CONTROLLER_HEALTHBARUPDATE,
    battler: gActiveBattler,
    healthValue,
  });
}

/** 1:1 signature décomp `BtlController_EmitStatusAnimation(buf, status2anim, status)`.
 *  status2anim = TRUE pour STATUS2_*, FALSE pour STATUS1_*. */
export function BtlController_EmitStatusAnimation(bufferId: number, isStatus2: boolean, status: number): void {
  // 1:1 décomp battle_controllers.c:1298-1306 : [STATUSANIMATION, status2, status u32 LE] (6 bytes).
  _emitToBufferA(bufferId, [
    CONTROLLER_STATUSANIMATION, isStatus2 ? 1 : 0,
    status & 0xFF, (status >> 8) & 0xFF, (status >> 16) & 0xFF, (status >> 24) & 0xFF,
  ]);
  enqueueBattleEvent({
    type: CONTROLLER_STATUSANIMATION,
    battler: gActiveBattler,
    isStatus2, status,
  });
}

/** 1:1 signature décomp `BtlController_EmitDrawPartyStatusSummary(buf, hpStatuses, isBattleStart)`. */
export function BtlController_EmitDrawPartyStatusSummary(bufferId: number, hpStatuses: unknown, arg2: number): void {
  // 1:1 décomp battle_controllers.c:1505-1512 : [DRAWPARTYSTATUSSUMMARY,
  // flags & ~PARTY_SUMM_SKIP_DRAW_DELAY, (flags & 0x80)>>7, DRAWPARTYSTATUSSUMMARY,
  // ...memcpy(HpAndStatus[PARTY_SIZE])]. struct HpAndStatus {u16 hp; u32 status;}
  // = 8 bytes (2 hp LE + 2 pad + 4 status LE) × 6 mons → bufferA[4..51]. Les
  // handlers (PlayerHandleDrawPartyStatusSummary) parsent bufferA[4+i*8] 1:1.
  const _bytes: number[] = [
    CONTROLLER_DRAWPARTYSTATUSSUMMARY, arg2 & 0x7F, (arg2 & 0x80) >> 7, CONTROLLER_DRAWPARTYSTATUSSUMMARY,
  ];
  const _arr = Array.isArray(hpStatuses) ? hpStatuses as Array<{ hp?: number; status?: number }> : [];
  for (let i = 0; i < 6; i++) {
    const e = _arr[i] ?? {};
    const hp = (e.hp ?? 0) & 0xFFFF;
    const st = (e.status ?? 0) >>> 0;
    _bytes.push(hp & 0xFF, (hp >> 8) & 0xFF, 0, 0,
      st & 0xFF, (st >> 8) & 0xFF, (st >> 16) & 0xFF, (st >>> 24) & 0xFF);
  }
  _emitToBufferA(bufferId, _bytes);
  enqueueBattleEvent({
    type: CONTROLLER_DRAWPARTYSTATUSSUMMARY,
    battler: gActiveBattler,
    hpStatuses: Array.isArray(hpStatuses) ? (hpStatuses as number[]) : [],
    arg2,
  });
}

/** 1:1 signature décomp `BtlController_EmitHidePartyStatusSummary(buf)`. */
export function BtlController_EmitHidePartyStatusSummary(bufferId: number): void {
  // 1:1 décomp battle_controllers.c:1518-1525 : [HIDEPARTYSTATUSSUMMARY ×4].
  _emitToBufferA(bufferId, [CONTROLLER_HIDEPARTYSTATUSSUMMARY, CONTROLLER_HIDEPARTYSTATUSSUMMARY, CONTROLLER_HIDEPARTYSTATUSSUMMARY, CONTROLLER_HIDEPARTYSTATUSSUMMARY]);
  enqueueBattleEvent({
    type: CONTROLLER_HIDEPARTYSTATUSSUMMARY,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitTrainerSlideBack(buf)`. */
export function BtlController_EmitTrainerSlideBack(bufferId: number): void {
  // 1:1 décomp battle_controllers.c:1053-1060 : [TRAINERSLIDEBACK ×4].
  _emitToBufferA(bufferId, [CONTROLLER_TRAINERSLIDEBACK, CONTROLLER_TRAINERSLIDEBACK, CONTROLLER_TRAINERSLIDEBACK, CONTROLLER_TRAINERSLIDEBACK]);
  enqueueBattleEvent({
    type: CONTROLLER_TRAINERSLIDEBACK,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitTrainerSlide(buf)` (= slide in). */
export function BtlController_EmitTrainerSlide(bufferId: number): void {
  // 1:1 décomp battle_controllers.c:1044-1051 : [TRAINERSLIDE ×4].
  _emitToBufferA(bufferId, [CONTROLLER_TRAINERSLIDE, CONTROLLER_TRAINERSLIDE, CONTROLLER_TRAINERSLIDE, CONTROLLER_TRAINERSLIDE]);
  enqueueBattleEvent({
    type: CONTROLLER_TRAINERSLIDE,
    battler: gActiveBattler,
  });
}

/** 1:1 signature décomp `BtlController_EmitIntroSlide(buf, terrainId)`
 *  (battle_controllers.c:1141-1146). Démarre l'animation slide-in du
 *  background battle (= WIN0V split central). Enqueue event pour
 *  battle_intro.ts (miroir game/) consume. */
export function BtlController_EmitIntroSlide(bufferId: number, terrainId: number): void {
  // 1:1 décomp battle_controllers.c:1489-1494 : écrit gBattleBufferA[active] =
  // [CONTROLLER_INTROSLIDE, environmentId] (2 bytes). SANS ça, le Mark pairé (dans
  // BattleIntroPrepareBackgroundSlide) re-dispatche le bufferA[0] PÉRIMÉ → double
  // de la commande controller précédente in-game (cf. fix EmitLoadMonSprite).
  _emitToBufferA(bufferId, [CONTROLLER_INTROSLIDE, terrainId & 0xFF]);
  enqueueBattleEvent({
    type: CONTROLLER_INTROSLIDE as never,
    battler: gActiveBattler,
    terrainId,
  } as never);
}

/** 1:1 signature décomp `BtlController_EmitIntroTrainerBallThrow(buf)`
 *  (battle_controllers.c:1148-1153). Lance le ball throw animation du
 *  trainer (= player ou opponent) suivi de l'emerge du Pokemon. Enqueue
 *  event pour battle-ball-throw.ts + sprite emerge consume. */
export function BtlController_EmitIntroTrainerBallThrow(bufferId: number): void {
  // 1:1 décomp battle_controllers.c:1496-1503 : écrit gBattleBufferA[active] =
  // [CONTROLLER_INTROTRAINERBALLTHROW ×4]. SANS ça, le Mark pairé (dans
  // BattleIntro{Player1,Opponent1}SendsOutMonAnimation) re-dispatche bufferA[0]
  // PÉRIMÉ (= PRINTSTRING du « Go {mon} ») → message d'envoi affiché 2× in-game.
  _emitToBufferA(bufferId, [
    CONTROLLER_INTROTRAINERBALLTHROW, CONTROLLER_INTROTRAINERBALLTHROW,
    CONTROLLER_INTROTRAINERBALLTHROW, CONTROLLER_INTROTRAINERBALLTHROW,
  ]);
  enqueueBattleEvent({
    type: CONTROLLER_INTROTRAINERBALLTHROW as never,
    battler: gActiveBattler,
  } as never);
}

/** 1:1 signature décomp `BtlController_EmitDrawTrainerPic(buf)`
 *  (battle_controllers.c:986-990). Charge + display le sprite trainer
 *  (= player back ou opponent face). Enqueue event pour battle UI consume. */
export function BtlController_EmitDrawTrainerPic(bufferId: number): void {
  // 1:1 décomp battle_controllers.c:1035-1042 : écrit gBattleBufferA[active] =
  // [CONTROLLER_DRAWTRAINERPIC ×4]. SANS ça, le Mark pairé (dans
  // BattleIntroDrawTrainersOrMonsSprites) re-dispatche bufferA[0] PÉRIMÉ.
  _emitToBufferA(bufferId, [
    CONTROLLER_DRAWTRAINERPIC, CONTROLLER_DRAWTRAINERPIC,
    CONTROLLER_DRAWTRAINERPIC, CONTROLLER_DRAWTRAINERPIC,
  ]);
  enqueueBattleEvent({
    type: CONTROLLER_DRAWTRAINERPIC as never,
    battler: gActiveBattler,
  } as never);
}

/** 1:1 signature décomp `BtlController_EmitLoadMonSprite(buf)`
 *  (battle_controllers.c:973-977). Charge le sprite du Pokemon (= wild ou
 *  opp send-out). Enqueue event pour battle UI consume. */
export function BtlController_EmitLoadMonSprite(bufferId: number): void {
  // 1:1 décomp battle_controllers.c:973-977 : 4 bytes [LOADMONSPRITE, LOADMONSPRITE,
  // 0, 0] → gBattleBufferA. SANS ça, OpponentBufferRunCommand lit bufferA[0] résiduel
  // et NE dispatche PAS OpponentHandleLoadMonSprite (= le sprite mon ne se chargeait
  // jamais). Même pattern que les autres Emit fixés (EmitChoosePokemon session 5ter).
  _emitToBufferA(bufferId, [CONTROLLER_LOADMONSPRITE, CONTROLLER_LOADMONSPRITE, 0, 0]);
  enqueueBattleEvent({
    type: CONTROLLER_LOADMONSPRITE as never,
    battler: gActiveBattler,
  } as never);
}

/** 1:1 signature décomp `BtlController_EmitBallThrowAnim(buf, caseId)`
 *  (battle_controllers.c:1089-1094). caseId :
 *  0 = BALL_NO_SHAKES, 1..3 = BALL_*_SHAKES_FAIL, 4 = BALL_3_SHAKES_SUCCESS,
 *  5 = BALL_TRAINER_BLOCK, 6 = BALL_WALLY_SUCCESS_HACK. */
export function BtlController_EmitBallThrowAnim(bufferId: number, caseId: number): void {
  // 1:1 décomp battle_controllers.c:1089-1094 : [BALLTHROWANIM, caseId] (2 bytes).
  _emitToBufferA(bufferId, [CONTROLLER_BALLTHROWANIM, caseId & 0xFF]);
  enqueueBattleEvent({
    type: CONTROLLER_BALLTHROWANIM,
    battler: gActiveBattler,
    caseId,
  });
}

/** 1:1 signature décomp `BtlController_EmitExpUpdate(buf, partyId, expPoints)`
 *  (battle_controllers.c:1275-1281). */
export function BtlController_EmitExpUpdate(bufferId: number, partyId: number, expPoints: number): void {
  // 1:1 décomp battle_controllers.c:1275-1281 : bufferA[0..3] = [EXPUPDATE, partyId,
  // (s16)expPoints lo, hi]. CRITIQUE : il FAUT écrire bufferA[0]=EXPUPDATE. Cmd_getexp
  // case 3 appelle cet emit PUIS MarkBattlerForControllerExec ; si bufferA[0] n'est pas
  // réécrit, le dispatch re-joue le bufferA[0] PÉRIMÉ = CONTROLLER_PRINTSTRING (posé par
  // le message "X a gagné N EXP" du case 2) → le message d'EXP s'IMPRIME 2× (doublon
  // collé signalé user, sans level-up). MÊME classe de bug que les Emit stubs vides
  // switch/bag/choose. PlayerHandleExpUpdate complète proprement (anim barre EXP = A/B
  // déféré ; l'EXP est déjà posée par Cmd_getexp case 3).
  _emitToBufferA(bufferId, [
    CONTROLLER_EXPUPDATE, partyId & 0xFF, expPoints & 0xFF, (expPoints >> 8) & 0xFF,
  ]);
  enqueueBattleEvent({
    type: CONTROLLER_EXPUPDATE,
    battler: gActiveBattler,
    partyId, expPoints,
  });
}

/** 1:1 signature décomp `BtlController_EmitChoosePokemon(buf, caseId,
 *  monToSwitchIntoId_partner, ability, partyOrder)`. */
export function BtlController_EmitChoosePokemon(
  bufferId: number, caseId: number, monToSwitchIntoId: number, ability: number,
  partyOrder: number | readonly number[],
): void {
  // Voie L (1:1 décomp battle_controllers.c) : écrire gBattleBufferA[active] (7 bytes) —
  // OpponentBufferRunCommand/PlayerBufferRunCommand lisent bufferA[0]=opcode pour
  // dispatcher le handler. SANS ça, le controller ne dispatchait JAMAIS ChoosePokemon
  // (il ne faisait qu'enqueue l'event voie V) → switch-in dresseur cassé (le mon suivant
  // n'entrait jamais → freeze multi-mon). bufferA[0]=opcode,[1]=caseId,[2]=monToSwitch,
  // [3]=ability,[4..6]=partyOrder.
  const order: readonly number[] = typeof partyOrder === 'number' ? [partyOrder, 0, 0] : partyOrder;
  _emitToBufferA(bufferId, [
    CONTROLLER_CHOOSEPOKEMON, caseId & 0xFF, monToSwitchIntoId & 0xFF, ability & 0xFF,
    order[0] ?? 0, order[1] ?? 0, order[2] ?? 0,
  ]);
  enqueueBattleEvent({
    type: CONTROLLER_CHOOSEPOKEMON,
    battler: gActiveBattler,
    caseId, monToSwitchIntoId, ability, partyOrder,
  });
}

/** 1:1 décomp `BtlController_EmitLinkStandbyMsg` (battle_controllers.c:1555-1567).
 *  [LINKSTANDBYMSG, mode, record?, record?] (4 bytes hors recorded). `record`
 *  (= notre param `frame`) déclenche RecordedBattle_BufferNewBattlerData = dette R3
 *  → 0. Écrit bufferA[0] pour le dispatch (cf. [[EmitGetMonData]]). */
export function BtlController_EmitLinkStandbyMsg(bufferId: number, mode: number, frame: boolean): void {
  _emitToBufferA(bufferId, [CONTROLLER_LINKSTANDBYMSG, mode & 0xFF, 0, 0]);
  enqueueBattleEvent({
    type: CONTROLLER_LINKSTANDBYMSG,
    battler: gActiveBattler,
    mode, frame,
  });
}

/** 1:1 signature décomp `BtlController_EmitCantSwitch(buf)`. */
export function BtlController_EmitCantSwitch(bufferId: number): void {
  // 1:1 décomp battle_controllers.c:1453-1460 : [CANTSWITCH ×4].
  _emitToBufferA(bufferId, [CONTROLLER_CANTSWITCH, CONTROLLER_CANTSWITCH, CONTROLLER_CANTSWITCH, CONTROLLER_CANTSWITCH]);
  enqueueBattleEvent({
    type: CONTROLLER_CANTSWITCH,
    battler: gActiveBattler,
  });
}

/** 1:1 décomp `BtlController_EmitYesNoBox` (battle_controllers.c:1210-1217).
 *  Écrit [YESNOBOX, YESNOBOX, YESNOBOX, YESNOBOX] (4 bytes) dans gBattleBufferA via
 *  PrepareBufferDataTransfer. CRITIQUE : bufferA[0] = l'ID de COMMANDE lu par
 *  XxxBufferRunCommand pour dispatcher vers Xxx HandleYesNoBox (cf. [[EmitGetMonData]]).
 *  Correspondance constante vérifiée 1:1 : décomp `CONTROLLER_YESNOBOX` = index 19 = 0x13
 *  (enum battle_controllers.h:186-205, base CONTROLLER_GETMONDATA=0) = notre
 *  CONTROLLER_UNKNOWNYESNOBOX (0x13, battle-event-queue.ts:69), qui est aussi la clé de
 *  dispatch `sPlayerBufferCommands[0x13] = PlayerHandleYesNoBox` (battle-controller-player.ts).
 *  (≠ CONTROLLER_23 = index 20 = 0x14.) */
export function BtlController_EmitYesNoBox(bufferId: number): void {
  // 1:1 décomp battle_controllers.c:1212-1216 : [YESNOBOX ×4], taille 4.
  _emitToBufferA(bufferId, [
    CONTROLLER_UNKNOWNYESNOBOX,
    CONTROLLER_UNKNOWNYESNOBOX,
    CONTROLLER_UNKNOWNYESNOBOX,
    CONTROLLER_UNKNOWNYESNOBOX,
  ]);
  enqueueBattleEvent({
    type: CONTROLLER_UNKNOWNYESNOBOX,
    battler: gActiveBattler,
  });
}

/** 1:1 décomp `BtlController_EmitSwitchInAnim` (battle_controllers.c:1019-1026).
 *  [SWITCHINANIM, partyId, dontClearSubstituteBit, 5] (4 bytes). Écrit bufferA[0]
 *  pour le dispatch (cf. [[EmitGetMonData]]). */
export function BtlController_EmitSwitchInAnim(bufferId: number, partyId: number, dontClear: number): void {
  _emitToBufferA(bufferId, [CONTROLLER_SWITCHINANIM, partyId & 0xFF, dontClear & 0xFF, 5]);
  enqueueBattleEvent({
    type: CONTROLLER_SWITCHINANIM,
    battler: gActiveBattler,
    partyId, dontClear,
  });
}

/** 1:1 décomp `BtlController_EmitGetMonData` (battle_controllers.c:968-975).
 *  Écrit [GETMONDATA, requestId, monToCheck, 0] dans gBattleBufferA via
 *  PrepareBufferDataTransfer. CRITIQUE : bufferA[0] = l'ID de COMMANDE lu par
 *  XxxBufferRunCommand pour dispatcher vers XxxHandleGetMonData. Sans cette
 *  écriture, le buffer garde sa valeur RÉSIDUELLE (au 1er combat = 0 = GETMONDATA
 *  par chance ; au re-combat = CHOOSEACTION résiduel → dispatch vers le mauvais
 *  handler → BattleIntroGetMonsData bloque case 1 → écran noir). Le handler lit
 *  ensuite gBattleMons directement (adaptation : pas de round-trip data réel). */
export function BtlController_EmitGetMonData(bufferId: number, requestId: number, monToCheck: number): void {
  _emitToBufferA(bufferId, [CONTROLLER_GETMONDATA, requestId & 0xFF, monToCheck & 0xFF, 0]);
}

/** 1:1 signature décomp `BtlController_EmitResetActionMoveSelection(buf, caseId)`. */
export function BtlController_EmitResetActionMoveSelection(bufferId: number, caseId: number): void {
  // 1:1 décomp battle_controllers.c:1569-1574 : [RESETACTIONMOVESELECTION, caseId] (2 bytes).
  _emitToBufferA(bufferId, [CONTROLLER_RESETACTIONMOVESELECTION, caseId & 0xFF]);
  enqueueBattleEvent({
    type: CONTROLLER_RESETACTIONMOVESELECTION,
    battler: gActiveBattler,
    caseId,
  });
}

/** 1:1 signature décomp `BtlController_EmitYesNoBox` n'existe pas — yesnobox
 *  est implémenté direct par Cmd_yesnobox via le state machine
 *  gBattleCommunication[0]. */

// PrepareStringBattle / BattleScriptPush / BattleScriptPop : DÉPLACÉS dans le
// miroir game/battle_util.ts (battle_util.c, 2026-06-13).

// ─── UI/Input stubs ─────────────────────────────────────────────────────────

/** 1:1 signature décomp `HandleBattleWindow(xStart, yStart, xEnd, yEnd, flags)`.
 *  Décomp construit/clear un rect window dans BG tilemap. Phase 1 stub : no-op. */
export function HandleBattleWindow(
  _xStart: number, _yStart: number, _xEnd: number, _yEnd: number, _flags: number,
): void {
  // Phase 1.4 UI : draw/clear window au framework UI.
}

/** 1:1 signature décomp `BattlePutTextOnWindow(text, windowId)`
 *  (battle_message.c:1957-1961). R2 wire : delegate au battle-flow.ts
 *  printText(windowId, text) si __activeBattleFlow exposé (= combat actif).
 *  Sinon fallback : store dans __battleDisplayedText pour scene pickup futur.
 *  Maintient aussi le __textPrinterState pour CompleteOnInactiveTextPrinter2. */
/** COPYWIN_FULL — 1:1 décomp window.h:24 enum {NONE,MAP,GFX,FULL}.
 *  (Notre CopyWindowToVram ignore le mode mais on passe la vraie valeur.) */
const COPYWIN_FULL = 3;

/** 1:1 décomp `BattlePutTextOnWindow` (battle_message.c:3035-3108) — chemin de
 *  rendu RÉEL via le window/text system GBA. La voie V passe par
 *  `__activeBattleFlow.printText` (rendu impératif voie-V) ; la voie L (décomp)
 *  n'a PAS de flow → ce chemin imprime vraiment le texte dans la fenêtre.
 *  windowsType = B_WIN_TYPE_NORMAL (wild/trainer non-Arena). Voie L = pas de
 *  BATTLE_TYPE_LINK/RECORDED → on suit les branches non-link (autoScroll=FALSE,
 *  speed B_WIN_MSG = GetPlayerTextSpeedDelay()). */
function _battlePutTextOnWindowReal(text: string | Uint8Array, windowIdArg: number): void {
  let windowId = windowIdArg;
  let copyToVram: boolean;

  // battle_message.c:3042-3051.
  if (windowId & B_WIN_COPYTOVRAM) {
    windowId &= ~B_WIN_COPYTOVRAM;
    copyToVram = false;
  } else {
    const info0 = getBattleTextOnWindowsInfo(windowId);
    if (!info0) return; // window hors table normal (VS/arena) — non utilisé voie L.
    FillWindowPixelBuffer(windowId, info0.fillValue);
    copyToVram = true;
  }

  const info = getBattleTextOnWindowsInfo(windowId);
  if (!info) return;

  // battle_message.c:3074-3077 : la flèche de fin de message (down arrow) en COMBAT
  // utilise la variante ALTERNATIVE (sDarkDownArrowTiles = down_arrow_alt.png, idx
  // 1/2/10 → palette 0 = textbox). Sans ce flag, le printer blitte la flèche TERRAIN
  // (down_arrow.png, idx 0/2/4 prévus pour gMessageBox_Pal) colorisée par la palette
  // combat → couleurs fausses (blob rouge) = bug "la arrow n'utilise pas sa seconde
  // palette" signalé user. Seul ARENA_WIN_JUDGMENT_TEXT garde FALSE — non porté
  // (pas d'arène en voie L) → toujours la branche else (TRUE).
  gTextFlags.useAlternateDownArrow = true;

  // battle_message.c:3053-3065 : x/y/colors du textInfo.
  // (x===0xFF → center-align via GetStringCenterAlignXOffset : VS/arena
  //  uniquement, jamais en B_WIN_TYPE_NORMAL → branche non portée.)
  const x = info.x;
  const y = info.y;

  // battle_message.c:3084-3099 : speed + canABSpeedUpPrint. Pour B_WIN_MSG (boîte
  // de message : attaque/EXP/etc.), speed = GetPlayerTextSpeedDelay() ET
  // `gTextFlags.canABSpeedUpPrint = 1` → tenir A/B accélère le défilement du texte
  // (= comportement ROM). Pour les autres fenêtres (noms de moves, PP…), speed fixe
  // du textInfo ET canABSpeedUpPrint = 0. SANS poser ce flag, il gardait la valeur
  // laissée par le field message box (FALSE, field_message_box.c:17) → A/B
  // n'accélérait jamais le texte en combat (bug user "A/B ne défile pas vite").
  let speed: number;
  if (windowId === B_WIN_MSG) {
    speed = GetPlayerTextSpeedDelay();
    gTextFlags.canABSpeedUpPrint = true;
  } else {
    speed = info.speed;
    gTextFlags.canABSpeedUpPrint = false;
  }

  // battle_message.c:3101 AddTextPrinter(&printerTemplate, speed, NULL).
  // colorArray = [bgColor, fgColor, shadowColor] (convention text-system).
  AddTextPrinterParameterized4(
    windowId, info.fontId, x, y,
    info.letterSpacing, info.lineSpacing,
    [info.bgColor, info.fgColor, info.shadowColor],
    speed, text,
  );

  // battle_message.c:3103-3107.
  if (copyToVram) {
    PutWindowTilemap(windowId);
    CopyWindowToVram(windowId, COPYWIN_FULL);
  }
}

export function BattlePutTextOnWindow(text: number | string, windowId: number): void {
  const g = globalThis as Record<string, unknown>;
  const txt = typeof text === 'string' ? text : String(text);

  {
    // Voie L (décomp) : pas de flow voie-V → rendu RÉEL 1:1 (battle_message.c:3035).
    try {
      _battlePutTextOnWindowReal(txt, windowId);
    } catch (e) {
      console.warn('[battle/battle-controllers] BattlePutTextOnWindow real render failed:', e);
    }
  }

  // Stash aussi dans __battleDisplayedText (= debug + scene pickup futur).
  if (!g.__battleDisplayedText) g.__battleDisplayedText = {};
  if (!g.__textPrinterState) g.__textPrinterState = {};
  if (!g.__textPrinterTimers) g.__textPrinterTimers = {};
  (g.__battleDisplayedText as Record<number, string | number>)[windowId] = text;
  const timers = g.__textPrinterTimers as Record<number, number>;
  if (timers[windowId]) { clearTimeout(timers[windowId]); delete timers[windowId]; }
  // Flag de TEST `__battleTextInstant` (inerte sans le flag) : marque le texte
  // TERMINÉ *synchroniquement* (pas de setTimeout) → un harness SYNC ne reste pas
  // bloqué sur les pollers de texte (CompleteOnInactiveTextPrinter*), qui lisent
  // __textPrinterState. Ne touche pas le pacing 1:1 normal (branche else).
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) {
    (g.__textPrinterState as Record<number, boolean>)[windowId] = false;
    return;
  }
  (g.__textPrinterState as Record<number, boolean>)[windowId] = true;
  // Simulate typewriter : ~length * 2 frames + 60 frame pause for read.
  const frames = Math.max(60, txt.length * 2 + 60);
  timers[windowId] = (setTimeout(() => {
    (g.__textPrinterState as Record<number, boolean>)[windowId] = false;
    delete timers[windowId];
  }, frames * (1000 / 60)) as unknown) as number;
}

/** Variante BYTE-LEVEL de BattlePutTextOnWindow (voie L décodeur byte-level
 *  battle-message.ts). `bytes` = string charmap déjà encodée (gDisplayedStringBattle)
 *  → passée au printer SANS re-encoder (_battlePutTextOnWindowReal accepte
 *  Uint8Array). Gère la complétion (__textPrinterState timer, identique à
 *  BattlePutTextOnWindow) + stash debug lisible (decode reverse-charmap via
 *  __battleMessage, pour ne pas casser le harness qui lit __battleDisplayedText). */
export function BattlePutTextOnWindowBytes(bytes: Uint8Array, windowId: number): void {
  const g = globalThis as Record<string, unknown>;
  try {
    _battlePutTextOnWindowReal(bytes, windowId);
  } catch (e) {
    console.warn('[battle/battle-controllers] BattlePutTextOnWindowBytes render failed:', e);
  }
  // Stash debug (harness/probes lisent __battleDisplayedText).
  if (!g.__battleDisplayedText) g.__battleDisplayedText = {};
  let readable = '<bytes>';
  try {
    const bm = (globalThis as { __battleMessage?: { decodeBytesToString?: (b: Uint8Array) => string } }).__battleMessage;
    if (bm?.decodeBytesToString) readable = bm.decodeBytesToString(bytes);
  } catch { /* noop */ }
  (g.__battleDisplayedText as Record<number, string>)[windowId] = readable;
  // Complétion : __textPrinterState[windowId] (true=actif → false après ~frames).
  if (!g.__textPrinterState) g.__textPrinterState = {};
  if (!g.__textPrinterTimers) g.__textPrinterTimers = {};
  const timers = g.__textPrinterTimers as Record<number, number>;
  if (timers[windowId]) { clearTimeout(timers[windowId]); delete timers[windowId]; }
  if ((globalThis as { __battleTextInstant?: boolean }).__battleTextInstant) {
    (g.__textPrinterState as Record<number, boolean>)[windowId] = false;
    return;
  }
  (g.__textPrinterState as Record<number, boolean>)[windowId] = true;
  let len = 0;
  while (len < bytes.length && bytes[len] !== 0xFF) len++;
  const frames = Math.max(60, len * 2 + 60);
  timers[windowId] = (setTimeout(() => {
    (g.__textPrinterState as Record<number, boolean>)[windowId] = false;
    delete timers[windowId];
  }, frames * (1000 / 60)) as unknown) as number;
}

/** 1:1 signature décomp `BattleCreateYesNoCursorAt(cursorPosition)`. Phase 1 stub. */
export function BattleCreateYesNoCursorAt(_cursorPosition: number): void {
  // Phase 1.4 UI : draw yes/no cursor sprite.
}

/** 1:1 signature décomp `BattleDestroyYesNoCursorAt(cursorPosition)`. Phase 1 stub. */
export function BattleDestroyYesNoCursorAt(_cursorPosition: number): void {
  // Phase 1.4 UI : remove yes/no cursor sprite.
}

/** 1:1 signature décomp `PlaySE(seId)`. Phase 1 stub (= SE channel not wired). */
export function PlaySE(_seId: number): void {
  // Phase 1.4 UI : trigger SE via audio engine.
}

/** 1:1 signature décomp `JOY_NEW(button)` (= include/global.h:134 macro
 *  `TEST_BUTTON(gMain.newKeys, button)`). Returns truthy si `button` mask
 *  intersecte newKeys ce frame. Wired vers `getRuntime().gMain.newKeys`
 *  via lazy lookup pour éviter cycle ESM avec decomp-globals. */
export function JOY_NEW(button: number): number {
  const rt = _getRuntimeLazy();
  return rt ? (rt.gMain.newKeys & button) : 0;
}

/** 1:1 signature décomp `JOY_REPEAT(button)` (= include/global.h:137 macro
 *  `TEST_BUTTON(gMain.newAndRepeatedKeys, button)`). */
export function JOY_REPEAT(button: number): number {
  const rt = _getRuntimeLazy();
  return rt ? (rt.gMain.newAndRepeatedKeys & button) : 0;
}

/** 1:1 signature décomp `JOY_HELD(button)` (= include/global.h:131 macro
 *  `TEST_BUTTON(gMain.heldKeys, button)`). */
export function JOY_HELD(button: number): number {
  const rt = _getRuntimeLazy();
  return rt ? (rt.gMain.heldKeys & button) : 0;
}

/** Lazy lookup runtime via globalThis.__rt (exposé par decomp-globals
 *  ligne ~109). Évite cycle ESM avec decomp-globals → gba-global-scope. */
type _RtShape = { gMain: { newKeys: number; newAndRepeatedKeys: number; heldKeys: number } };
function _getRuntimeLazy(): _RtShape | null {
  const g = globalThis as { __rt?: unknown };
  const r = g.__rt as _RtShape | undefined;
  if (r && r.gMain) return r;
  return null;
}

// ─── Button constants (io_reg.h) — 1:1 décomp ──────────────────────────────
export const A_BUTTON      = 1 << 0;
export const B_BUTTON      = 1 << 1;
export const SELECT_BUTTON = 1 << 2;
export const START_BUTTON  = 1 << 3;
export const DPAD_RIGHT    = 1 << 4;
export const DPAD_LEFT     = 1 << 5;
export const DPAD_UP       = 1 << 6;
export const DPAD_DOWN     = 1 << 7;
export const R_BUTTON      = 1 << 8;
export const L_BUTTON      = 1 << 9;

/** 1:1 décomp `DPAD_ANY` (gba/io_reg.h:713) = OR de DPAD_LEFT/RIGHT/UP/DOWN. */
export const DPAD_ANY      = DPAD_RIGHT | DPAD_LEFT | DPAD_UP | DPAD_DOWN;

// ─── SE_* constants (constants/songs.h) — subset utilisé Batch 04 ──────────
export const SE_SELECT = 5; // 1:1 décomp constants/songs.h

// ─── Sanity check : MAX_BATTLERS_COUNT match ────────────────────────────────
if (MAX_BATTLERS_COUNT !== 4) {
  // Sanity check — gBitTable est indexé par battler id, jamais > 3.
  console.warn('[battle/battle-controllers] MAX_BATTLERS_COUNT mismatch:', MAX_BATTLERS_COUNT);
}

// gBattleScripting est ré-exporté pour les opcodes qui en ont besoin sans
// recharger le module state.
export { gBattleScripting };

// Expose pour battle-controller-player lazy lookup (= éviter cycle ESM).
(globalThis as { __battleControllers?: object }).__battleControllers = {
  snapshotMsgData: _snapshotMsgData,
  getLastPrintStringMsgData,
  BattlePutTextOnWindowBytes,
  BattlePutTextOnWindow,
  // T5 : consommes par PlayerHandleYesNoBox/Input (acces lazy anti-cycle).
  HandleBattleWindow,
  BattleCreateYesNoCursorAt,
  BattleDestroyYesNoCursorAt,
};
