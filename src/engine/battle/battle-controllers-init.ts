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

import {
  gBattleTypeFlags, setBattlersCount, setBattlerControllerFunc,
} from './state';
import {
  BATTLE_TYPE_LINK, BATTLE_TYPE_MULTI, BATTLE_TYPE_DOUBLE,
  BATTLE_TYPE_SAFARI, BATTLE_TYPE_WALLY_TUTORIAL,
} from './constants';
import { gBattlerPositions, B_POSITION_PLAYER_LEFT, B_POSITION_OPPONENT_LEFT } from './util';
import { SetControllerToPlayer } from '../../game/battle_controller_player';
import { SetControllerToOpponent } from '../../game/battle_controller_opponent';
import { setBattleMainFunc, BeginBattleIntro } from './battle-main-functions';
import { SetBattlePartyIds } from './battle-controllers-ipc';

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
