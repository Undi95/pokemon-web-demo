/**
 * battle/battle-switch.ts — Port 1:1 strict décomp pour le switch in-battle :
 *   - `SwitchInClearSetData` (battle_main.c:3152-3300) : reset state d'un battler
 *     après switch-in (= clear stat stages + status2 + lastMoves + disable struct).
 *     Special case BATON_PASS : preserve certains bits.
 *   - `HandleAction_Switch` (battle_util.c:295-310) : queue le switch via
 *     gBattleStruct->monToSwitchIntoId + script BattleScript_HandleFaintedMon.
 *
 *  Source de vérité :
 *    - D:/Projet 1/decomps/pokeemeraude/src/battle_main.c:3152
 *    - D:/Projet 1/decomps/pokeemeraude/src/battle_util.c:295
 */

import {
  gBattleMons, gActiveBattler, gCurrentMove, gBattlersCount,
  gDisableStructs, gStatuses3, gLastMoves, gBattleStruct,
  setMoveResultFlags, setCurrentMove,
} from './state';
import {
  NUM_BATTLE_STATS, DEFAULT_STAT_STAGE, MOVE_NONE,
  STATUS2_CONFUSION, STATUS2_FOCUS_ENERGY, STATUS2_SUBSTITUTE,
  STATUS2_ESCAPE_PREVENTION, STATUS2_CURSED, STATUS2_WRAPPED,
  STATUS3_LEECHSEED_BATTLER, STATUS3_LEECHSEED, STATUS3_ALWAYS_HITS,
  STATUS3_PERISH_SONG, STATUS3_ROOTED, STATUS3_MUDSPORT, STATUS3_WATERSPORT,
  STATUS3_ALWAYS_HITS_TURN, STATUS2_INFATUATED_WITH,
  EFFECT_BATON_PASS,
} from './constants';
import { getMove } from '../data/game-data';

/** 1:1 décomp `GetBattlerSide(battler)` (battle_anim_mons.c). */
function GetBattlerSide(battler: number): number {
  return battler & 1;
}

/** 1:1 décomp `gLastLandedMoves[]`. */
const gLastLandedMoves = [0, 0, 0, 0];
/** 1:1 décomp `gLastHitByType[]`. */
const gLastHitByType = [0, 0, 0, 0];
/** 1:1 décomp `gLastResultingMoves[]`. */
const gLastResultingMoves = [0, 0, 0, 0];
/** 1:1 décomp `gLastPrintedMoves[]`. */
const gLastPrintedMoves = [0, 0, 0, 0];
/** 1:1 décomp `gLastHitBy[]`. */
const gLastHitBy = [0xFF, 0xFF, 0xFF, 0xFF];

/** 1:1 décomp `gActionSelectionCursor[]` et `gMoveSelectionCursor[]`. */
const gActionSelectionCursor = [0, 0, 0, 0];
const gMoveSelectionCursor = [0, 0, 0, 0];

/** Reset gBattleStruct fields per-battler accessés par SwitchInClearSetData. */
function _resetBattleStructForSwitch(battler: number): void {
  // Reset lastTakenMove + lastTakenMoveFrom for this battler.
  // gBattleStruct.lastTakenMove[battler*2..battler*2+1] = MOVE_NONE.
  if (gBattleStruct.lastTakenMove) {
    gBattleStruct.lastTakenMove[battler * 2 + 0] = MOVE_NONE;
    gBattleStruct.lastTakenMove[battler * 2 + 1] = MOVE_NONE;
  }
  if (gBattleStruct.lastTakenMoveFrom) {
    // Clear 4 source battlers × 2 bytes each.
    for (let i = 0; i < 4; i++) {
      gBattleStruct.lastTakenMoveFrom[i * 2 + battler * 8 + 0] = 0;
      gBattleStruct.lastTakenMoveFrom[i * 2 + battler * 8 + 1] = 0;
    }
  }
  // Palace flags.
  if (gBattleStruct.palaceFlags !== undefined) {
    gBattleStruct.palaceFlags &= ~(1 << battler);
  }
  // Choiced move (Choice Band lock).
  if (gBattleStruct.choicedMove) {
    gBattleStruct.choicedMove[battler] = MOVE_NONE;
  }
  // Arena turn counter (= Battle Arena only).
  if (gBattleStruct.arenaTurnCounter !== undefined) {
    gBattleStruct.arenaTurnCounter = 0xFF;
  }
}

/** Helper : clear move/ability history (= AI tracking arrays).
 *  1:1 décomp `ClearBattlerMoveHistory(battler)` + `ClearBattlerAbilityHistory(battler)`. */
function _clearBattlerMoveHistory(_battler: number): void {
  // Cascade vers AI move tracking — gBattleResources->ai.moveHistory[battler][4]
  // not fully wired. Pas critique pour tutorial Birch.
}
function _clearBattlerAbilityHistory(_battler: number): void {
  // Same cascade.
}

/** 1:1 décomp `SwitchInClearSetData()` (battle_main.c:3152-3300+).
 *
 *  Reset all battler state pour un switch-in. Special case BATON_PASS qui
 *  preserve certains volatile statuses (confusion, focus energy, substitute,
 *  escape prevention, curse, leech seed, perish song, rooted, mud sport,
 *  water sport, always hits, substitute HP, perish song timer, sure hit
 *  battler).
 *
 *  Appelé par battle_script_commands.c:Cmd_switchindataupdate après le user
 *  a sélectionné un mon dans le party menu IN_BATTLE.
 */
export function SwitchInClearSetData(): void {
  // 1:1 décomp ligne 3154 : copy gDisableStructs[gActiveBattler] AVANT reset
  // pour pouvoir restorer les Baton Pass fields.
  const disableStructCopy = { ...gDisableStructs[gActiveBattler] };

  const currentMoveEffect = getMove(`MOVE_${gCurrentMove}` as never)?.effect ?? 0;
  const isBatonPass = currentMoveEffect === (EFFECT_BATON_PASS as unknown as typeof currentMoveEffect);

  // 1:1 décomp ll.3158-3172 : non-BatonPass → reset stat stages + clear
  // escape prevention/sureHit set by THIS battler on autres.
  if (!isBatonPass) {
    for (let i = 0; i < NUM_BATTLE_STATS; i++) {
      gBattleMons[gActiveBattler].statStages[i] = DEFAULT_STAT_STAGE;
    }
    for (let i = 0; i < gBattlersCount; i++) {
      // Clear escape prevention si this battler était la cause.
      if ((gBattleMons[i].status2 & STATUS2_ESCAPE_PREVENTION) && gDisableStructs[i].battlerPreventingEscape === gActiveBattler) {
        gBattleMons[i].status2 &= ~STATUS2_ESCAPE_PREVENTION;
      }
      // Clear always-hits si this battler était la cible sure.
      if ((gStatuses3[i] & STATUS3_ALWAYS_HITS) && gDisableStructs[i].battlerWithSureHit === gActiveBattler) {
        gStatuses3[i] &= ~STATUS3_ALWAYS_HITS;
        gDisableStructs[i].battlerWithSureHit = 0;
      }
    }
  }

  // 1:1 décomp ll.3173-3193 : status2 + gStatuses3 reset.
  if (isBatonPass) {
    // Préserve certains bits 1:1 décomp.
    gBattleMons[gActiveBattler].status2 &= (
      STATUS2_CONFUSION | STATUS2_FOCUS_ENERGY | STATUS2_SUBSTITUTE |
      STATUS2_ESCAPE_PREVENTION | STATUS2_CURSED
    );
    gStatuses3[gActiveBattler] &= (
      STATUS3_LEECHSEED_BATTLER | STATUS3_LEECHSEED | STATUS3_ALWAYS_HITS |
      STATUS3_PERISH_SONG | STATUS3_ROOTED | STATUS3_MUDSPORT | STATUS3_WATERSPORT
    );
    // Adjust always-hits for opposing side.
    for (let i = 0; i < gBattlersCount; i++) {
      if (GetBattlerSide(gActiveBattler) !== GetBattlerSide(i)
          && (gStatuses3[i] & STATUS3_ALWAYS_HITS) !== 0
          && (gDisableStructs[i].battlerWithSureHit === gActiveBattler)) {
        gStatuses3[i] &= ~STATUS3_ALWAYS_HITS;
        gStatuses3[i] |= STATUS3_ALWAYS_HITS_TURN(2);
      }
    }
  } else {
    gBattleMons[gActiveBattler].status2 = 0;
    gStatuses3[gActiveBattler] = 0;
  }

  // 1:1 décomp ll.3195-3201 : Clear infatuation + wrap par autres battlers
  // ciblant ce mon.
  for (let i = 0; i < gBattlersCount; i++) {
    if (gBattleMons[i].status2 & STATUS2_INFATUATED_WITH(gActiveBattler)) {
      gBattleMons[i].status2 &= ~STATUS2_INFATUATED_WITH(gActiveBattler);
    }
    if ((gBattleMons[i].status2 & STATUS2_WRAPPED) && gBattleStruct.wrappedBy?.[i] === gActiveBattler) {
      gBattleMons[i].status2 &= ~STATUS2_WRAPPED;
    }
  }

  // 1:1 décomp ll.3203-3204 : reset UI cursors.
  gActionSelectionCursor[gActiveBattler] = 0;
  gMoveSelectionCursor[gActiveBattler] = 0;

  // 1:1 décomp ll.3206-3208 : clear DisableStruct entièrement.
  const ds = gDisableStructs[gActiveBattler];
  for (const key of Object.keys(ds) as Array<keyof typeof ds>) {
    if (typeof ds[key] === 'number') ((ds as unknown) as Record<string, number>)[key as string] = 0;
  }

  // 1:1 décomp ll.3210-3217 : Baton Pass preserve certains DisableStruct fields.
  if (isBatonPass) {
    gDisableStructs[gActiveBattler].substituteHP = disableStructCopy.substituteHP;
    gDisableStructs[gActiveBattler].battlerWithSureHit = disableStructCopy.battlerWithSureHit;
    gDisableStructs[gActiveBattler].perishSongTimer = disableStructCopy.perishSongTimer;
    gDisableStructs[gActiveBattler].perishSongTimerStartValue = disableStructCopy.perishSongTimerStartValue;
    gDisableStructs[gActiveBattler].battlerPreventingEscape = disableStructCopy.battlerPreventingEscape;
  }

  // 1:1 décomp ll.3219-3227 : reset move result flags + lastMoves + lastHits.
  setMoveResultFlags(0);
  gDisableStructs[gActiveBattler].isFirstTurn = 2;
  gDisableStructs[gActiveBattler].truantSwitchInHack = disableStructCopy.truantSwitchInHack;
  gLastMoves[gActiveBattler] = MOVE_NONE;
  gLastLandedMoves[gActiveBattler] = MOVE_NONE;
  gLastHitByType[gActiveBattler] = 0;
  gLastResultingMoves[gActiveBattler] = MOVE_NONE;
  gLastPrintedMoves[gActiveBattler] = MOVE_NONE;
  gLastHitBy[gActiveBattler] = 0xFF;

  // 1:1 décomp ll.3229-3251 : reset gBattleStruct per-battler fields.
  _resetBattleStructForSwitch(gActiveBattler);

  // 1:1 décomp ll.3242-3251 : Clear lastTakenMove pour autres battlers de
  // l'opposing side qui avaient été frappés par ce battler.
  for (let i = 0; i < gBattlersCount; i++) {
    if (i !== gActiveBattler && GetBattlerSide(i) !== GetBattlerSide(gActiveBattler)) {
      if (gBattleStruct.lastTakenMove) {
        gBattleStruct.lastTakenMove[i * 2 + 0] = MOVE_NONE;
        gBattleStruct.lastTakenMove[i * 2 + 1] = MOVE_NONE;
      }
    }
    if (gBattleStruct.lastTakenMoveFrom) {
      gBattleStruct.lastTakenMoveFrom[i * 8 + gActiveBattler * 2 + 0] = 0;
      gBattleStruct.lastTakenMoveFrom[i * 8 + gActiveBattler * 2 + 1] = 0;
    }
  }

  // 1:1 décomp ll.3257-3258 : reset gCurrentMove + arena counter.
  setCurrentMove(MOVE_NONE);

  // 1:1 décomp ll.3260-3261 : clear AI history.
  _clearBattlerMoveHistory(gActiveBattler);
  _clearBattlerAbilityHistory(gActiveBattler);
}

/** 1:1 décomp `HandleAction_Switch()` (battle_util.c:295-310).
 *
 *  Handler appelé par battle_main.c state machine quand le battler a choisi
 *  B_ACTION_SWITCH dans le menu action. Set up le script execution flow :
 *    - gBattlerAttacker = battler courant
 *    - gBattle_BG0_X = 0  (= reset BG scroll, cascade UI)
 *    - reset cursor states
 *    - gBattlescriptCurrInstr = BattleScript_ActionSwitch
 *    - gCurrentActionFuncId = B_ACTION_EXEC_SCRIPT
 *
 *  Le script ActionSwitch utilise les opcodes `getswitchedmondata` +
 *  `switchindataupdate` + `returnatktoball` + `switchinanim` + `switchineffects`
 *  + `switchhandleorder` qui sont déjà portés via le battle bytecode.
 */
export function HandleAction_Switch(_ctx?: unknown): void {
  // ⚠️ Doublon NON appelé par le turn loop (qui dispatche via __handleAction =
  // handle-action.ts:HandleAction_Switch). Gardé pour __battleSwitch/TriggerBattleSwitch
  // (devtools). Reset cursors only ; le vrai setup script est dans handle-action.ts.
  gActionSelectionCursor[gActiveBattler] = 0;
  gMoveSelectionCursor[gActiveBattler] = 0;
}

/** Public helper : trigger un switch from devtools / scripts.
 *  Set monToSwitchIntoId puis call HandleAction_Switch.
 *
 *  À utiliser quand le party screen IN_BATTLE retourne le partyIndex choisi
 *  par le user (cf. cascade party-screen.ts mode IN_BATTLE). */
export function TriggerBattleSwitch(monIndex: number, battler: number = 0): void {
  if (gBattleStruct.monToSwitchIntoId) {
    gBattleStruct.monToSwitchIntoId[battler] = monIndex;
  }
  HandleAction_Switch();
}

/** Devtools expose. */
(globalThis as Record<string, unknown>).__battleSwitch = {
  SwitchInClearSetData, HandleAction_Switch, TriggerBattleSwitch,
};
