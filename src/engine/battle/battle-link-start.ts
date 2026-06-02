/**
 * battle/battle-link-start.ts — Port 1:1 strict de FindLinkBattleMaster +
 * CB2_HandleStartBattle.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c`
 *
 * Fonctions portées 1:1 :
 *   - FindLinkBattleMaster (897-951) — détermine le master link battle
 *     selon version + multiplayerId
 *   - CB2_HandleStartBattle (953-1159) — state machine 18 cases pour
 *     link battle handshake (= envoi/réception party Pokémon, RNG seed,
 *     init sprites)
 *
 * Note : link battle est non-applicable à notre démo offline. Le port
 * existe pour completeness 1:1 strict — cascade massive R3 vers
 * gBlockRecvBuffer / SendBlock / IsLinkTaskFinished / etc.
 *
 * Dépendances :
 *   - state.ts : gBattleTypeFlags, gBattleCommunication, gBattleStruct,
 *     gBattleScripting, gTrainerBattleOpponent_A
 *   - constants.ts : BATTLE_TYPE_* flags
 */

import {
  gBattleTypeFlags, gBattleCommunication, gBattleScripting,
  gBattleStruct, gTrainerBattleOpponent_A,
  setBattleTypeFlags,
} from './state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_RECORDED,
} from './constants';
import { InitBattleControllers as _InitBattleControllersImpl } from './battle-controllers-init';
import { getRuntime } from '../system/decomp-globals';
import { ShowBg } from '../ui/gba-window-system';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `BATTLE_TYPE_IS_MASTER` = bit 24. */
const BATTLE_TYPE_IS_MASTER = 1 << 24;
/** 1:1 décomp `BATTLE_TYPE_TRAINER` = bit 3. */
const BATTLE_TYPE_TRAINER_LOCAL = 1 << 3;
/** 1:1 décomp `BATTLE_TYPE_LINK_IN_BATTLE` = bit 18. */
const BATTLE_TYPE_LINK_IN_BATTLE = 1 << 18;
/** 1:1 décomp `BIT_SIDE` = 1. */
const BIT_SIDE = 1;
/** 1:1 décomp `MULTIUSE_STATE` = 0. */
const MULTIUSE_STATE = 0;
/** 1:1 décomp `SPRITES_INIT_STATE1` = 1, `SPRITES_INIT_STATE2` = 2. */
const SPRITES_INIT_STATE1 = 1;
const SPRITES_INIT_STATE2 = 2;
/** 1:1 décomp `TRAINER_UNION_ROOM`. */
const TRAINER_UNION_ROOM = 1025;
/** 1:1 décomp `VERSION_EMERALD`. */
const VERSION_EMERALD = 5;

// ─── Cascade helpers (= dette R3 documentée) ───────────────────────────────

/** 1:1 décomp `gBlockRecvBuffer[i][word]` — link battle recv buffer. */
function _getBlockRecvBuffer(_player: number, _word: number): number {
  // Dette R3 : link cable recv buffer. Pour now : default 0.
  return 0;
}

/** 1:1 décomp `GetMultiplayerId()`. */
function _GetMultiplayerId(): number {
  return 0;  // Single player.
}

/** 1:1 décomp `IsDma3ManagerBusyWithBgCopy()`. */
function _IsDma3ManagerBusyWithBgCopy(): boolean {
  return false;
}

/** 1:1 décomp `ShowBg(bgId)` → active le BG dans DISPCNT (gba-window-system). */
function _ShowBg(bgId: number): void {
  ShowBg(bgId);
}

/** 1:1 décomp `FillAroundBattleWindows()`. */
function _FillAroundBattleWindows(): void {
  // Dette R3 : battle window border fill.
}

/** 1:1 décomp `gWirelessCommType`. */
function _getWirelessCommType(): number {
  return 0;
}

/** 1:1 décomp `LoadWirelessStatusIndicatorSpriteGfx()`. */
function _LoadWirelessStatusIndicatorSpriteGfx(): void {
  // Dette R3 : wireless indicator gfx.
}

/** 1:1 décomp `CreateWirelessStatusIndicatorSprite()`. */
function _CreateWirelessStatusIndicatorSprite(_x: number, _y: number): void {
  // Dette R3.
}

/** 1:1 décomp `gReceivedRemoteLinkPlayers`. */
function _getReceivedRemoteLinkPlayers(): number {
  return 0;
}

/** 1:1 décomp `IsLinkTaskFinished()`. */
function _IsLinkTaskFinished(): boolean {
  return true;
}

/** 1:1 décomp `gLinkPlayers[i]`. */
function _setLinkPlayerId(_idx: number, _id: number): void {
  // Dette R3.
}

function _getLinkPlayerVersion(_idx: number): number {
  return VERSION_EMERALD;
}

/** 1:1 décomp `SendBlock(mask, src, size)`. */
function _SendBlock(_mask: number, _src: unknown, _size: number): void {
  // Dette R3 : link block send.
}

/** 1:1 décomp `BitmaskAllOtherLinkPlayers()`. */
function _BitmaskAllOtherLinkPlayers(): number {
  return 0;
}

/** 1:1 décomp `GetBlockReceivedStatus()`. */
function _GetBlockReceivedStatus(): number {
  return 0;
}

/** 1:1 décomp `ResetBlockReceivedFlags()`. */
function _ResetBlockReceivedFlags(): void {
  // Dette R3.
}

/** 1:1 décomp `CreateTask(taskFn, priority)`. */
function _CreateTask(_taskFn: () => void, _priority: number): number {
  return -1;
}

/** 1:1 décomp `InitLinkBattleVsScreen` task fn. */
function _InitLinkBattleVsScreen(): void {
  // Dette R3 : VS screen display.
}

/** 1:1 décomp `RecordedBattle_SetFrontierPassFlagFromHword(hword)`. */
function _RecordedBattle_SetFrontierPassFlagFromHword(_hword: number): void {
  // Dette R3.
}

/** 1:1 décomp `SetDeoxysStats()`. */
function _SetDeoxysStats(): void {
  // Dette R3 : Deoxys form-specific stats.
}

/** 1:1 décomp `SetPlayerBerryDataInBattleStruct()` (battle_main.c:753-785). */
function _SetPlayerBerryDataInBattleStruct(): void {
  // 1:1 décomp : copy player Enigma Berry data dans gBattleStruct.
  // Dette R3 : full IsEnigmaBerryValid + GetBerryInfo cascade.
}

/** 1:1 décomp `SetAllPlayersBerryData()` (battle_main.c:787-894). */
function _SetAllPlayersBerryData(): void {
  // 1:1 décomp : init gEnigmaBerries[0..3] from player Enigma berry or default.
  // Dette R3.
}

/** 1:1 décomp `BufferPartyVsScreenHealth_AtStart()` (= K19 wire). */
function _BufferPartyVsScreenHealth_AtStart(): void {
  const m = (globalThis as Record<string, unknown>).__battleVBlankHelpers as {
    BufferPartyVsScreenHealth_AtStart?: () => void;
  } | undefined;
  m?.BufferPartyVsScreenHealth_AtStart?.();
}

/** 1:1 décomp `TryCorrectShedinjaLanguage(mon)` (= K21 wire). */
function _TryCorrectShedinjaLanguage(_mon: unknown): void {
  const m = (globalThis as Record<string, unknown>).__battleTurnDispatch as {
    TryCorrectShedinjaLanguage?: (mon: unknown) => void;
  } | undefined;
  m?.TryCorrectShedinjaLanguage?.(_mon);
}

/** 1:1 décomp `InitBattleControllers()` (battle_controllers.c:81).
 *  Wire vers battle-controllers-init.ts (pose gBattleMainFunc = BeginBattleIntro
 *  + installe SetControllerToPlayer/Opponent dans la table partagée). */
function _InitBattleControllers(): void {
  _InitBattleControllersImpl();
}

/** 1:1 décomp `RecordedBattle_SetTrainerInfo()`. */
function _RecordedBattle_SetTrainerInfo(): void {
  // Dette R3.
}

/** 1:1 décomp `BattleInitAllSprites(ptr1, ptr2)`. */
function _BattleInitAllSprites(_ptr1: number, _ptr2: number): boolean {
  // Dette R3 : init all battle sprites step-by-step.
  return true;  // Complete immediate.
}

/** 1:1 décomp `BattleMainCB1` + `BattleMainCB2` (= K22 wire). */
function _BattleMainCB1(): void {
  const m = (globalThis as Record<string, unknown>).__battleCB2 as {
    BattleMainCB1?: () => void;
  } | undefined;
  m?.BattleMainCB1?.();
}

function _BattleMainCB2(): void {
  const m = (globalThis as Record<string, unknown>).__battleCB2 as {
    BattleMainCB2?: () => void;
  } | undefined;
  m?.BattleMainCB2?.();
}

/** 1:1 décomp `gMain.callback1` setter (= K8 wire). */
function _setMainCallback1(cb: (() => void) | null): void {
  const m = (globalThis as Record<string, unknown>).__battleMainFunctions as {
    setMainCallback1?: (cb: (() => void) | null) => void;
    setPreBattleCallback1?: (cb: (() => void) | null) => void;
    getMainCallback1?: () => (() => void) | null;
  } | undefined;
  // 1:1 décomp ll. 1139-1140 : gPreBattleCallback1 = gMain.callback1 ;
  // gMain.callback1 = BattleMainCB1.
  m?.setPreBattleCallback1?.(m?.getMainCallback1?.() ?? null);
  m?.setMainCallback1?.(cb);
}

function _SetMainCallback2(cb: (() => void) | null): void {
  // 1:1 décomp `SetMainCallback2(cb)` : installe le callback2 sur le runtime.
  getRuntime()?.SetMainCallback2?.(cb as never);
}

/** 1:1 décomp `RunTasks()` + `AnimateSprites()` + `BuildOamBuffer()`. */
function _RunTasks(): void { /* Dette R3 */ }
function _AnimateSprites(): void { /* Dette R3 */ }
function _BuildOamBuffer(): void { /* Dette R3 */ }

// ─── FindLinkBattleMaster (897-951) — 1:1 décomp ───────────────────────────

/** 1:1 décomp `FindLinkBattleMaster(numPlayers, multiPlayerId)`
 *  (battle_main.c:897-951). Détermine le master link battle selon version
 *  + multiplayerId.
 *
 *  3 cases :
 *  1) Player 1 minimum version (0x100) → player 1 master
 *  2) Tous players même version → player 1 master
 *  3) Lowest index avec highest version → master
 *
 *  Sets BATTLE_TYPE_IS_MASTER + BATTLE_TYPE_TRAINER flags. */
export function FindLinkBattleMaster(numPlayers: number, multiPlayerId: number): void {
  let found = 0;

  // 1:1 décomp ll. 901-909 : player 1 minimum version (0x100).
  if (_getBlockRecvBuffer(0, 0) === 0x100) {
    if (multiPlayerId === 0) {
      setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER_LOCAL);
    } else {
      setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_TRAINER_LOCAL);
    }
    found++;
  }

  if (found === 0) {
    // 1:1 décomp ll. 911-929 : tous players même version → player 1 master.
    let i: number;
    for (i = 0; i < numPlayers; i++) {
      if (_getBlockRecvBuffer(0, 0) !== _getBlockRecvBuffer(i, 0)) break;
    }

    if (i === numPlayers) {
      if (multiPlayerId === 0) {
        setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER_LOCAL);
      } else {
        setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_TRAINER_LOCAL);
      }
      found++;
    }

    if (found === 0) {
      // 1:1 décomp ll. 933-949 : lowest index highest version master.
      for (i = 0; i < numPlayers; i++) {
        if (_getBlockRecvBuffer(i, 0) === 0x300 && i !== multiPlayerId) {
          if (i < multiPlayerId) break;
        }
        if (_getBlockRecvBuffer(i, 0) > 0x300 && i !== multiPlayerId) break;
      }

      if (i === numPlayers) {
        setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_IS_MASTER | BATTLE_TYPE_TRAINER_LOCAL);
      } else {
        setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_TRAINER_LOCAL);
      }
    }
  }
}

// ─── CB2_HandleStartBattle (953-1159) — 1:1 décomp ─────────────────────────

/** 1:1 décomp `CB2_HandleStartBattle()` (battle_main.c:953-1159). State machine
 *  18 cases pour link battle handshake. Non-link path : skip à case 15. */
export function CB2_HandleStartBattle(): void {
  _RunTasks();
  _AnimateSprites();
  _BuildOamBuffer();

  const playerMultiplayerId = _GetMultiplayerId();
  gBattleScripting.multiplayerId = playerMultiplayerId;
  const enemyMultiplayerId = playerMultiplayerId ^ BIT_SIDE;

  switch (gBattleCommunication[MULTIUSE_STATE]) {
    case 0:
      // 1:1 décomp ll. 968-980.
      if (!_IsDma3ManagerBusyWithBgCopy()) {
        _ShowBg(0); _ShowBg(1); _ShowBg(2); _ShowBg(3);
        _FillAroundBattleWindows();
        gBattleCommunication[MULTIUSE_STATE] = 1;
      }
      if (_getWirelessCommType()) _LoadWirelessStatusIndicatorSpriteGfx();
      break;
    case 1:
      // 1:1 décomp ll. 981-1014 : link path vs offline path.
      if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
        if (_getReceivedRemoteLinkPlayers()) {
          if (_IsLinkTaskFinished()) {
            // Set version signature 0x300 (= Emerald).
            // Dette R3 : gBattleStruct.multiBuffer.linkBattlerHeader.versionSignatureLo/Hi.
            _BufferPartyVsScreenHealth_AtStart();
            _SetPlayerBerryDataInBattleStruct();

            if (gTrainerBattleOpponent_A === TRAINER_UNION_ROOM) {
              _setLinkPlayerId(0, 0);
              _setLinkPlayerId(1, 1);
            }

            _SendBlock(_BitmaskAllOtherLinkPlayers(), null, 0);
            gBattleCommunication[MULTIUSE_STATE] = 2;
          }
          if (_getWirelessCommType()) _CreateWirelessStatusIndicatorSprite(0, 0);
        }
      } else {
        // Offline path : skip à case 15.
        if (!(gBattleTypeFlags & BATTLE_TYPE_RECORDED)) {
          setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_IS_MASTER);
        }
        gBattleCommunication[MULTIUSE_STATE] = 15;
        _SetAllPlayersBerryData();
      }
      break;
    case 2:
      // 1:1 décomp ll. 1015-1034 : recv version signature + setup VS task.
      if ((_GetBlockReceivedStatus() & 3) === 3) {
        _ResetBlockReceivedFlags();
        FindLinkBattleMaster(2, playerMultiplayerId);
        _SetAllPlayersBerryData();
        const taskId = _CreateTask(_InitLinkBattleVsScreen, 0);
        void taskId;  // Dette R3 : gTasks setup.
        _RecordedBattle_SetFrontierPassFlagFromHword(_getBlockRecvBuffer(playerMultiplayerId, 1));
        _RecordedBattle_SetFrontierPassFlagFromHword(_getBlockRecvBuffer(enemyMultiplayerId, 1));
        _SetDeoxysStats();
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 3:
      // 1:1 décomp ll. 1035-1043 : send Pokemon 1-2.
      if (_IsLinkTaskFinished()) {
        _SendBlock(_BitmaskAllOtherLinkPlayers(), null /* gPlayerParty */, 200 * 2);
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 4:
      // 1:1 décomp ll. 1044-1052 : recv Pokemon 1-2.
      if ((_GetBlockReceivedStatus() & 3) === 3) {
        _ResetBlockReceivedFlags();
        // Dette R3 : memcpy gEnemyParty depuis gBlockRecvBuffer.
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 7:
      if (_IsLinkTaskFinished()) {
        _SendBlock(_BitmaskAllOtherLinkPlayers(), null /* gPlayerParty[2] */, 200 * 2);
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 8:
      if ((_GetBlockReceivedStatus() & 3) === 3) {
        _ResetBlockReceivedFlags();
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 11:
      if (_IsLinkTaskFinished()) {
        _SendBlock(_BitmaskAllOtherLinkPlayers(), null /* gPlayerParty[4] */, 200 * 2);
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 12:
      if ((_GetBlockReceivedStatus() & 3) === 3) {
        _ResetBlockReceivedFlags();
        // 1:1 décomp ll. 1085-1090 : Shedinja language correction par mon.
        for (let i = 0; i < 6; i++) {
          _TryCorrectShedinjaLanguage(null);  // gEnemyParty[i]
        }
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 15:
      // 1:1 décomp ll. 1094-1115 : init battle controllers + check Emerald version.
      _InitBattleControllers();
      _RecordedBattle_SetTrainerInfo();
      gBattleCommunication[SPRITES_INIT_STATE1] = 0;
      gBattleCommunication[SPRITES_INIT_STATE2] = 0;

      if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
        let i = 0;
        for (; i < 2 && (_getLinkPlayerVersion(i) & 0xFF) === VERSION_EMERALD; i++);
        if (i === 2) gBattleCommunication[MULTIUSE_STATE] = 16;
        else gBattleCommunication[MULTIUSE_STATE] = 18;
      } else {
        gBattleCommunication[MULTIUSE_STATE] = 18;
      }
      break;
    case 16:
      // 1:1 décomp ll. 1117-1124 : send RNG seed pour recorded battle.
      if (_IsLinkTaskFinished()) {
        _SendBlock(_BitmaskAllOtherLinkPlayers(), null /* gRecordedBattleRngSeed */, 4);
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 17:
      // 1:1 décomp ll. 1125-1134 : recv RNG seed.
      if ((_GetBlockReceivedStatus() & 3) === 3) {
        _ResetBlockReceivedFlags();
        if (!(gBattleTypeFlags & BATTLE_TYPE_IS_MASTER)) {
          // Dette R3 : memcpy gRecordedBattleRngSeed.
        }
        gBattleCommunication[MULTIUSE_STATE]++;
      }
      break;
    case 18:
      // 1:1 décomp ll. 1135-1145 : finish, start battle.
      if (_BattleInitAllSprites(SPRITES_INIT_STATE1, SPRITES_INIT_STATE2)) {
        _setMainCallback1(_BattleMainCB1);
        _SetMainCallback2(_BattleMainCB2);
        if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
          setBattleTypeFlags(gBattleTypeFlags | BATTLE_TYPE_LINK_IN_BATTLE);
        }
      }
      break;
    // 1:1 décomp ll. 1146-1157 : delays cases 5/9/13 + waits 6/10/14.
    case 5:
    case 9:
    case 13:
      gBattleCommunication[MULTIUSE_STATE]++;
      gBattleCommunication[1] = 1;
      // 1:1 décomp : intentional fall through (= immediate decrement next case).
      // Extract for TS noFallthroughCasesInSwitch compat.
      _delayWait();
      break;
    case 6:
    case 10:
    case 14:
      _delayWait();
      break;
  }
}

/** 1:1 décomp helper case 6/10/14 (= extrait pour bypass fallthrough). */
function _delayWait(): void {
  if (--gBattleCommunication[1] === 0) {
    gBattleCommunication[MULTIUSE_STATE]++;
  }
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleLinkStart = {
  FindLinkBattleMaster, CB2_HandleStartBattle,
};
