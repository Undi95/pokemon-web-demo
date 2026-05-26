/**
 * battle/battle-turn-helpers.ts — Port 1:1 strict des helpers turn-action
 * battle_main.c (= AllAtActionConfirmed, UpdateBattlerPartyOrdersOnSwitch,
 * SwapTurnOrder, SwitchPartyOrder, SetActionsAndBattlersTurnOrder).
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:4086-4855`
 *
 * Fonctions portées 1:1 :
 *   - SwitchPartyOrder (4086-4114) — switch slot party post-action
 *   - AllAtActionConfirmed (4554-4568) — check tous battlers ont confirmé
 *   - UpdateBattlerPartyOrdersOnSwitch (4570-4585) — record switch buffer
 *   - SwapTurnOrder (4587-4593) — swap 2 indices turn order
 *   - SetActionsAndBattlersTurnOrder (4756-4855) — main turn order setter
 *     basé sur action types (RUN > ITEM/SWITCH > MOVE par speed)
 *
 * GetWhoStrikesFirst déjà porté dans ai-script-commands.ts.
 *
 * Dépendances :
 *   - state.ts : gBattlersCount, gBattleCommunication, gActiveBattler,
 *     gBattleStruct, gBattleTypeFlags, gActionsByTurnOrder,
 *     gBattlerByTurnOrder, gChosenActionByBattler
 *   - constants.ts : B_ACTION_*, BATTLE_TYPE_*
 *   - ai/ai-script-commands.ts : GetWhoStrikesFirst
 */

import {
  gBattlersCount, gBattleCommunication, gActiveBattler,
  gBattleStruct, gBattleTypeFlags,
  gActionsByTurnOrder, gBattlerByTurnOrder, gChosenActionByBattler,
  gBattlerPartyIndexes,
  setActiveBattler,
} from './state';
import {
  BATTLE_TYPE_SAFARI, BATTLE_TYPE_LINK, BATTLE_TYPE_MULTI, BATTLE_TYPE_DOUBLE,
  B_ACTION_USE_ITEM, B_ACTION_SWITCH, B_ACTION_RUN,
  BATTLE_PARTNER,
} from './constants';
import { GetWhoStrikesFirst } from './ai/ai-script-commands';

// ─── Constants 1:1 décomp ──────────────────────────────────────────────────

/** 1:1 décomp `STATE_WAIT_ACTION_CONFIRMED` (battle_main.c:4123). */
const STATE_WAIT_ACTION_CONFIRMED = 5;

/** 1:1 décomp `gBattlePartyCurrentOrder[3]` — buffer temp pour party switch. */
const gBattlePartyCurrentOrder: number[] = [0, 0, 0];

// ─── AllAtActionConfirmed (battle_main.c:4554) — 1:1 décomp ────────────────

/** 1:1 décomp `AllAtActionConfirmed()` (battle_main.c:4554-4568).
 *  Check si tous les battlers (sauf 1 = celui en cours) ont confirmé leur action. */
export function AllAtActionConfirmed(): boolean {
  let count = 0;
  for (let i = 0; i < gBattlersCount; i++) {
    if (gBattleCommunication[i] === STATE_WAIT_ACTION_CONFIRMED) {
      count++;
    }
  }
  return count + 1 === gBattlersCount;
}

// ─── UpdateBattlerPartyOrdersOnSwitch (4570) — 1:1 décomp ──────────────────

/** 1:1 décomp `UpdateBattlerPartyOrdersOnSwitch()` (battle_main.c:4570-4585).
 *  Record le switch action dans buffer + party orders pour link battle multi. */
export function UpdateBattlerPartyOrdersOnSwitch(): void {
  // 1:1 décomp l. 4572 : gBattleStruct->monToSwitchIntoId[active] =
  //                       gBattleBufferB[active][1].
  // Dette R3 : gBattleBufferB[active][1..3] tracker côté controller.
  // Pour now : read via lazy globalThis si disponible.
  const stateMod = (globalThis as { __battleState?: { gBattleBufferB?: Uint8Array[] } }).__battleState;
  const buf = stateMod?.gBattleBufferB?.[gActiveBattler];

  if (buf) {
    gBattleStruct.monToSwitchIntoId[gActiveBattler] = buf[1];
    // Dette R3 : RecordedBattle_SetBattlerAction not yet ported.

    if (gBattleTypeFlags & BATTLE_TYPE_LINK && gBattleTypeFlags & BATTLE_TYPE_MULTI) {
      // 1:1 décomp ll. 4577-4583 : battlerPartyOrders update pour link multi.
      // Type 1:1 décomp : u8[MAX_BATTLERS_COUNT][3] → number[4][3] côté TS.
      const partyOrders = gBattleStruct.battlerPartyOrders;
      partyOrders[gActiveBattler][0] &= 0xF;
      partyOrders[gActiveBattler][0] |= (buf[2] & 0xF0);
      partyOrders[gActiveBattler][1] = buf[3];

      const partnerIdx = BATTLE_PARTNER(gActiveBattler);
      partyOrders[partnerIdx][0] &= 0xF0;
      partyOrders[partnerIdx][0] |= (buf[2] & 0xF0) >> 4;
      partyOrders[partnerIdx][2] = buf[3];
    }
  }
}

// ─── SwapTurnOrder (4587) — 1:1 décomp ─────────────────────────────────────

/** 1:1 décomp `SwapTurnOrder(id1, id2)` (battle_main.c:4587-4593). */
export function SwapTurnOrder(id1: number, id2: number): void {
  const tmpAction = gActionsByTurnOrder[id1];
  gActionsByTurnOrder[id1] = gActionsByTurnOrder[id2];
  gActionsByTurnOrder[id2] = tmpAction;

  const tmpBattler = gBattlerByTurnOrder[id1];
  gBattlerByTurnOrder[id1] = gBattlerByTurnOrder[id2];
  gBattlerByTurnOrder[id2] = tmpBattler;
}

// ─── SwitchPartyOrder (4086) — 1:1 décomp ──────────────────────────────────

/** Cascade helper : `GetPartyIdFromBattlePartyId(idx)`. */
function _GetPartyIdFromBattlePartyId(idx: number): number {
  // Dette R3 : full battle party order mapping. Pour single battle : identity.
  return idx;
}

/** Cascade helper : `SwitchPartyMonSlots(id1, id2)`. */
function _SwitchPartyMonSlots(id1: number, id2: number): void {
  // Dette R3 : swap player party slots. Cascade vers party-storage.ts.
  void id1; void id2;
}

/** 1:1 décomp `SwitchPartyOrder(battler)` (battle_main.c:4086-4114).
 *  Swap les slot dans la party current order après un switch. */
export function SwitchPartyOrder(battler: number): void {
  const partyOrders = gBattleStruct.battlerPartyOrders;

  // 1:1 décomp ll. 4092-4093 : copy battlerPartyOrders[battler][0..3] dans temp.
  for (let i = 0; i < 3; i++) {
    gBattlePartyCurrentOrder[i] = partyOrders[battler][i] ?? 0;
  }

  // 1:1 décomp ll. 4095-4097 : swap les 2 slots dans player party.
  const partyId1 = _GetPartyIdFromBattlePartyId(gBattlerPartyIndexes[battler]);
  const partyId2 = _GetPartyIdFromBattlePartyId(gBattleStruct.monToSwitchIntoId[battler] ?? 0);
  _SwitchPartyMonSlots(partyId1, partyId2);

  // 1:1 décomp ll. 4099-4113 : update battlerPartyOrders.
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    for (let i = 0; i < 3; i++) {
      partyOrders[battler][i] = gBattlePartyCurrentOrder[i];
      partyOrders[BATTLE_PARTNER(battler)][i] = gBattlePartyCurrentOrder[i];
    }
  } else {
    for (let i = 0; i < 3; i++) {
      partyOrders[battler][i] = gBattlePartyCurrentOrder[i];
    }
  }
}

// ─── SetActionsAndBattlersTurnOrder (4756) — 1:1 décomp ────────────────────

/** 1:1 décomp `SetActionsAndBattlersTurnOrder()` (battle_main.c:4756-4855).
 *  Main turn order setter : RUN > ITEM/SWITCH > MOVE (par speed).
 *
 *  Safari : pas d'order (= chacun joue dans l'ordre battler).
 *  Sinon :
 *  - Check si un battler a B_ACTION_RUN → priorité absolue (= fuite immediate)
 *  - Sinon : ITEM/SWITCH first par battler order, puis MOVES par speed. */
export function SetActionsAndBattlersTurnOrder(): void {
  let turnOrderId = 0;

  if (gBattleTypeFlags & BATTLE_TYPE_SAFARI) {
    // 1:1 décomp ll. 4762-4768 : Safari = order battler natural.
    for (let active = 0; active < gBattlersCount; active++) {
      setActiveBattler(active);
      gActionsByTurnOrder[turnOrderId] = gChosenActionByBattler[active];
      gBattlerByTurnOrder[turnOrderId] = active;
      turnOrderId++;
    }
  } else {
    // 1:1 décomp ll. 4772-4795 : check si un battler veut RUN.
    if (gBattleTypeFlags & BATTLE_TYPE_LINK) {
      for (let active = 0; active < gBattlersCount; active++) {
        setActiveBattler(active);
        if (gChosenActionByBattler[active] === B_ACTION_RUN) {
          turnOrderId = 5;
          break;
        }
      }
    } else {
      // 1:1 décomp ll. 4785-4794 : single battle = check battler 0 + 2.
      if (gChosenActionByBattler[0] === B_ACTION_RUN) {
        setActiveBattler(0);
        turnOrderId = 5;
      }
      if (gChosenActionByBattler[2] === B_ACTION_RUN) {
        setActiveBattler(2);
        turnOrderId = 5;
      }
    }

    if (turnOrderId === 5) {
      // 1:1 décomp ll. 4799-4810 : RUN priority order setup.
      gActionsByTurnOrder[0] = gChosenActionByBattler[gActiveBattler];
      gBattlerByTurnOrder[0] = gActiveBattler;
      turnOrderId = 1;
      for (let i = 0; i < gBattlersCount; i++) {
        if (i !== gActiveBattler) {
          gActionsByTurnOrder[turnOrderId] = gChosenActionByBattler[i];
          gBattlerByTurnOrder[turnOrderId] = i;
          turnOrderId++;
        }
      }
      // Dette R3 : gBattleMainFunc = CheckFocusPunch_ClearVarsBeforeTurnStarts.
      gBattleStruct.focusPunchBattlerId = 0;
      return;
    } else {
      // 1:1 décomp ll. 4817-4825 : ITEM/SWITCH actions first.
      for (let active = 0; active < gBattlersCount; active++) {
        setActiveBattler(active);
        if (gChosenActionByBattler[active] === B_ACTION_USE_ITEM
            || gChosenActionByBattler[active] === B_ACTION_SWITCH) {
          gActionsByTurnOrder[turnOrderId] = gChosenActionByBattler[active];
          gBattlerByTurnOrder[turnOrderId] = active;
          turnOrderId++;
        }
      }
      // 1:1 décomp ll. 4826-4834 : non-ITEM/SWITCH actions ensuite.
      for (let active = 0; active < gBattlersCount; active++) {
        setActiveBattler(active);
        if (gChosenActionByBattler[active] !== B_ACTION_USE_ITEM
            && gChosenActionByBattler[active] !== B_ACTION_SWITCH) {
          gActionsByTurnOrder[turnOrderId] = gChosenActionByBattler[active];
          gBattlerByTurnOrder[turnOrderId] = active;
          turnOrderId++;
        }
      }
      // 1:1 décomp ll. 4835-4850 : bubble sort par speed (= GetWhoStrikesFirst).
      for (let i = 0; i < gBattlersCount - 1; i++) {
        for (let j = i + 1; j < gBattlersCount; j++) {
          const battler1 = gBattlerByTurnOrder[i];
          const battler2 = gBattlerByTurnOrder[j];
          if (gActionsByTurnOrder[i] !== B_ACTION_USE_ITEM
              && gActionsByTurnOrder[j] !== B_ACTION_USE_ITEM
              && gActionsByTurnOrder[i] !== B_ACTION_SWITCH
              && gActionsByTurnOrder[j] !== B_ACTION_SWITCH) {
            if (GetWhoStrikesFirst(battler1, battler2, false)) {
              SwapTurnOrder(i, j);
            }
          }
        }
      }
    }
  }
  // Dette R3 : gBattleMainFunc = CheckFocusPunch_ClearVarsBeforeTurnStarts.
  gBattleStruct.focusPunchBattlerId = 0;
}

// ─── Devtools expose ───────────────────────────────────────────────────────

(globalThis as Record<string, unknown>).__battleTurnHelpers = {
  AllAtActionConfirmed, UpdateBattlerPartyOrdersOnSwitch,
  SwapTurnOrder, SwitchPartyOrder, SetActionsAndBattlersTurnOrder,
};
