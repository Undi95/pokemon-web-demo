/**
 * game/battle_util.ts — MIROIR (partiel) de `src/battle_util.c` (décomp pokeemeraude).
 *
 * Contenu (par chapitre du .c) :
 *   - HandleAction_* (battle_util.c:78-650) : UseMove (full), UseItem, Switch,
 *     Run, RunBattleScript, TryFinish, ActionFinished, NothingIsFainted +
 *     HandleFaintedMonActions. [ex-engine/battle/handle-action.ts]
 *   - TryRunFromBattle (battle_util.c:407-485) + IsRunningFromBattleImpossible
 *     (battle_main.c:4021-4084). [ex-engine/battle/try-run-from-battle.ts,
 *     fusion miroir 2026-06-12]
 *
 * PAS ENCORE ICI (reste dans engine/battle/, à absorber au fil du miroir) :
 *   AbilityBattleEffects (ability-battle-effects.ts), ItemBattleEffects
 *   (item-battle-effects.ts), BattleScriptPushCursorAndCallback (battle_main.ts),
 *   les helpers util.ts, Safari/Wally HandleActions (backlog).
 *
 * Dispatch : la table 1:1 `sTurnActionsFuncsTable` (battle_main.c:536) vit dans
 * battle_main.ts qui importe les HandleAction_* d'ici directement.
 */

import {
  gLastUsedItem,
  gBattleMons, gBattlerAttacker, setBattlerAttacker,
  gBattlerTarget, setBattlerTarget,
  gActiveBattler, setActiveBattler,
  gCurrentMove, setCurrentMove,
  gChosenMove, setChosenMove,
  gCurrMovePos, setCurrMovePos,
  gChosenMovePos, setChosenMovePos,
  gChosenMoveByBattler,
  gBattlerByTurnOrder, gCurrentTurnActionNumber,
  gBattleTypeFlags, gBattlersCount,
  gAbsentBattlerFlags,
  gBattleStruct, gBattleResults,
  setCritMultiplier, setMultiHitCounter, setMoveResultFlags,
  gHitMarker, setHitMarker,
  gBattleScripting,
  gBattleCommunication,
  gLockedMoves,
  gProtectStructs, gDisableStructs, gSpecialStatuses,
  gSideTimers,
  setCurrentActionFuncId,
  setLastUsedAbility,
  gActionSelectionCursor, gMoveSelectionCursor,
  gBattlerPartyIndexes,
  gBattleControllerExecFlags,
  setBattlerFainted, setAbsentBattlerFlags,
} from '../engine/battle/state';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_HA,
  PREPARE_MON_NICK_BUFFER,
} from '../engine/battle/text-buffers';
import {
  STATUS2_MULTIPLETURNS, STATUS2_RECHARGE,
  HITMARKER_NO_PPDEDUCT,
  MOVE_NONE, MOVE_STRUGGLE,
  MOVE_TARGET_SELECTED, MOVE_TARGET_USER, MOVE_TARGET_RANDOM,
  BATTLE_TYPE_DOUBLE, BATTLE_TYPE_PALACE, BATTLE_TYPE_ARENA, BATTLE_TYPE_SAFARI,
  GET_BATTLER_SIDE, B_SIDE_PLAYER,
  BATTLE_OPPOSITE,
  ABILITY_LIGHTNING_ROD,
  TYPE_ELECTRIC,
  NO_TARGET_OVERRIDE,
  B_ACTION_FINISHED, B_ACTION_EXEC_SCRIPT,
  MULTISTRING_CHOOSER,
  MISS_TYPE,
} from '../engine/battle/constants';
import { gBitTable } from '../engine/battle/battle-controllers';
import {
  GetBattlerAtPosition, GetBattlerPosition,
  B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT,
  B_POSITION_OPPONENT_LEFT, B_POSITION_OPPONENT_RIGHT,
  RecordAbilityBattle, ClearFuryCutterDestinyBondGrudge,
} from '../engine/battle/util';
import { getBattleMove } from '../engine/battle/data/battle-moves';
// 1:1 décomp battle_util.c:1942-1945 — HandleFaintedMonActions case 6 applique les
// effets de switch-in (Intimidate/Trace/Forecast + items). Import direct (= pas de
// cycle : ability/item-battle-effects n'importent pas handle-action) ; même pattern
// que end-turn-effects.ts.
import {
  AbilityBattleEffects,
  ABILITYEFFECT_INTIMIDATE1, ABILITYEFFECT_TRACE, ABILITYEFFECT_FORECAST,
  consumeAbilityWantedScript,
} from '../engine/battle/ability-battle-effects';
import {
  ItemBattleEffects, ITEMEFFECT_NORMAL, consumeItemWantedScript,
} from '../engine/battle/item-battle-effects';
import {
  getMoveEffectScriptOffset, getBattleScriptOffset,
  stepBattleScriptCommand, gBattleScriptContext,
} from '../engine/battle/script-interpreter';
import type { BattleScriptContext } from '../engine/battle/script-interpreter';
import { Random } from '../engine/system/random';
// Imports pour CheckMoveLimitations/AreAllMovesUnusable (battle_util.c:1069,
// ex-engine/battle/move-limitations.ts, absorbé au miroir 2026-06-13).
import { gLastMoves } from '../engine/battle/state';
import {
  STATUS2_TORMENT, STATUS3_IMPRISONED_OTHERS, MOVE_UNAVAILABLE, MAX_MON_MOVES,
  HOLD_EFFECT_CHOICE_BAND, MOVE_LIMITATIONS_ALL, ALL_MOVES_MASK,
  MOVE_LIMITATION_ZEROMOVE, MOVE_LIMITATION_PP, MOVE_LIMITATION_DISABLED,
  MOVE_LIMITATION_TORMENTED, MOVE_LIMITATION_TAUNT, MOVE_LIMITATION_IMPRISON,
} from '../engine/battle/constants';
// ─── IsMonDisobedient (battle_util.c:3890-4015) + helpers — absorbé au miroir
//     2026-06-13, ex-engine/battle/disobedience.ts. (GetMoveTarget = _GetMoveTarget
//     local l.138, déjà le miroir de battle_util.c:3811 → pas d'import croisé.) ───
import { setCalledMove, setBattleMoveDamage } from '../engine/battle/state';
import {
  BATTLE_TYPE_RECORDED_LINK, B_SIDE_OPPONENT,
  DISOBEDIENCE_OBEDIENT, DISOBEDIENCE_IGNORED, DISOBEDIENCE_OTHER,
  STATUS1_ANY, STATUS1_SLEEP, STATUS2_RAGE, STATUS2_UPROAR,
  MOVE_RAGE, MOVE_SNORE, MOVE_SLEEP_TALK, MOVE_POUND,
  NUM_LOAF_STRINGS,
  HITMARKER_DISOBEDIENT_MOVE, HITMARKER_UNABLE_TO_USE_MOVE,
  ABILITY_VITAL_SPIRIT, ABILITY_INSOMNIA,
} from '../engine/battle/constants';
import { SPECIES_MEW, SPECIES_DEOXYS } from '../engine/decomp-data/include/constants/species-data';
import { CalculateBaseDamage } from '../engine/battle/damage-calc';
import { gPlayerParty, GetMonData, MON_DATA_SPECIES } from '../engine/battle/party-storage';
import { gSaveBlock2Ptr } from '../engine/save/save-block-state';
import { FlagGet } from '../engine/script/script-vars';
// ─── AtkCanceler_UnableToUseMove (battle_util.c:1985-2270) — absorbé au miroir
//     2026-06-13, ex-engine/battle/atk-canceler.ts. (CalculateBaseDamage,
//     _GetMoveTarget local l.138, _GetImprisonedMovesCount l.1210,
//     _calculateConfusionDamage l.1323 : déjà présents ici → réutilisés.) ───
import { gBideDmg, gBideTarget, gMoveResultFlags } from '../engine/battle/state';
import {
  STATUS1_FREEZE, STATUS1_PARALYSIS,
  STATUS2_DESTINY_BOND, STATUS2_NIGHTMARE, STATUS2_FLINCHED,
  STATUS2_INFATUATION, STATUS2_CONFUSION, STATUS2_CONFUSION_TURN,
  STATUS2_BIDE, STATUS2_BIDE_TURN,
  STATUS3_GRUDGE,
  HITMARKER_NO_ATTACKSTRING,
  B_MSG_WOKE_UP, B_MSG_WOKE_UP_UPROAR, B_MSG_LOAFING,
  B_MSG_DEFROSTED, B_MSG_DEFROSTED_BY_MOVE,
  MOVE_RESULT_MISSED,
  ABILITY_EARLY_BIRD, ABILITY_TRUANT, ABILITY_SOUNDPROOF,
  EFFECT_THAW_HIT, MOVE_BIDE,
} from '../engine/battle/constants';
// (setPotentialItemEffectBattler + GetItemHoldEffect déjà importés plus bas dans ce fichier)

const B_MSG_INCAPABLE_OF_POWER = 0;  // Battle Palace deferred

/** 1:1 stub `BATTLE_PARTNER(id)` — défini déjà dans constants mais we inline. */
function _BATTLE_PARTNER(id: number): number { return id ^ 2 /* BIT_FLANK */; }

/** 1:1 stub `GetBattlerTurnOrderNum(battler)` (battle_util.c). Retourne l'index
 *  i tel que `gBattlerByTurnOrder[i] === battler`. */
function _GetBattlerTurnOrderNum(battler: number): number {
  for (let i = 0; i < gBattlersCount; i++) {
    if (gBattlerByTurnOrder[i] === battler) return i;
  }
  return 0;
}

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.
const _RecordAbilityBattle = RecordAbilityBattle;

/** 1:1 décomp battle_util.c : `gBattlerTarget = *(gBattleStruct->moveTarget + gBattlerAttacker)`
 *  (branche move SELECTED normale). La table par-battler `gBattleStruct.moveTarget[]`
 *  (state.ts:542) est posée par la sélection (SetActionsAndBattlersTurnOrder) ; le
 *  harness la pose aussi. N'affecte QUE la voie L (HandleAction_UseMove) — la voie V
 *  saute au script d'effet sans passer ici. */
function _getMoveTargetForBattler(battler: number): number {
  return gBattleStruct.moveTarget[battler];
}

function _setMoveTargetForBattler(_battler: number, _target: number): void {
  // moveTarget array deferred. La cible est set via gBattlerTarget.
  setBattlerTarget(_target);
}

/** 1:1 décomp `GetMoveTarget` (battle_util.c:3811). Re-exporté depuis
 *  cmd-niveau-34 (= déjà porté). Pour éviter circular import, inline ici. */
function _GetMoveTarget(move: number, setTarget: number): number {
  let targetBattler = 0;
  let moveTarget: number;
  let side: number;

  if (setTarget !== NO_TARGET_OVERRIDE) {
    moveTarget = setTarget - 1;
  } else {
    moveTarget = getBattleMove(move).target;
  }

  switch (moveTarget) {
    case MOVE_TARGET_SELECTED: {
      side = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
      if (gSideTimers[side].followmeTimer
          && gBattleMons[gSideTimers[side].followmeTarget].hp) {
        targetBattler = gSideTimers[side].followmeTarget;
      } else {
        side = GET_BATTLER_SIDE(gBattlerAttacker);
        let safetyIter = 0;
        do {
          targetBattler = Random() % gBattlersCount;
          safetyIter++;
        } while (
          (targetBattler === gBattlerAttacker
           || side === GET_BATTLER_SIDE(targetBattler)
           || (gAbsentBattlerFlags & (1 << targetBattler)))
          && safetyIter < 100
        );
      }
      break;
    }
    case MOVE_TARGET_USER:
      targetBattler = gBattlerAttacker;
      break;
    default:
      // MOVE_TARGET_BOTH, FOES_AND_ALLY, OPPONENTS_FIELD, RANDOM, etc.
      targetBattler = GetBattlerAtPosition(BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker)));
      if (gAbsentBattlerFlags & (1 << targetBattler)) {
        targetBattler ^= 2;
      }
      break;
  }
  return targetBattler;
}

/** 1:1 décomp `HandleAction_UseMove` (battle_util.c:78-292). */
export function HandleAction_UseMove(ctx?: BattleScriptContext): void {
  let var_ = 4;

  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);

  // Skip si absent.
  if (gBattleStruct.absentBattlerFlags & gBitTable[gBattlerAttacker]) {
    setCurrentActionFuncId(B_ACTION_FINISHED);
    return;
  }

  // Reset combat state (= 1:1 décomp).
  setCritMultiplier(1);
  gBattleScripting.dmgMultiplier = 1;
  gBattleStruct.atkCancelerTracker = 0;
  setMoveResultFlags(0);
  setMultiHitCounter(0);
  gBattleCommunication[MISS_TYPE] = 0;  // 1:1 décomp battle_util.c:96 (MISS_TYPE=6)

  // 1:1 décomp battle_util.c:99 : `gCurrMovePos = gChosenMovePos = gBattleStruct->chosenMovePositions[attacker]`.
  // INDISPENSABLE : sans cette ligne, gCurrMovePos restait à 0 → TOUS les branches
  // ci-dessous (moves[gCurrMovePos]) utilisaient moves[0] → le joueur ne pouvait JAMAIS
  // jouer un move autre que le slot 0 (sélectionner Leer slot 1 jouait Pound slot 0).
  // Bug masqué jusqu'ici car harness/AI/tests utilisaient toujours le slot 0.
  // chosenMovePositions[] est posé par : in-game (battle-action-selection.ts:620 depuis
  // gBattleBufferB[2]), AI (ai-script-commands.ts:436-437), harness (battle-decomp-loop.ts:395).
  setCurrMovePos(gBattleStruct.chosenMovePositions[gBattlerAttacker]);
  setChosenMovePos(gBattleStruct.chosenMovePositions[gBattlerAttacker]);

  // Choose move 1:1 décomp.
  if (gProtectStructs[gBattlerAttacker].noValidMoves) {
    gProtectStructs[gBattlerAttacker].noValidMoves = 0;
    setCurrentMove(MOVE_STRUGGLE);
    setChosenMove(MOVE_STRUGGLE);
    setHitMarker(gHitMarker | HITMARKER_NO_PPDEDUCT);
    _setMoveTargetForBattler(gBattlerAttacker, _GetMoveTarget(MOVE_STRUGGLE, NO_TARGET_OVERRIDE));
  } else if (gBattleMons[gBattlerAttacker].status2 & STATUS2_MULTIPLETURNS
             || gBattleMons[gBattlerAttacker].status2 & STATUS2_RECHARGE) {
    setCurrentMove(gLockedMoves[gBattlerAttacker]);
    setChosenMove(gLockedMoves[gBattlerAttacker]);
  } else if (gDisableStructs[gBattlerAttacker].encoredMove !== MOVE_NONE
             && gDisableStructs[gBattlerAttacker].encoredMove === gBattleMons[gBattlerAttacker].moves[gDisableStructs[gBattlerAttacker].encoredMovePos]) {
    // Encore forces same move
    const encored = gDisableStructs[gBattlerAttacker].encoredMove;
    setCurrentMove(encored);
    setChosenMove(encored);
    setCurrMovePos(gDisableStructs[gBattlerAttacker].encoredMovePos);
    setChosenMovePos(gDisableStructs[gBattlerAttacker].encoredMovePos);
    _setMoveTargetForBattler(gBattlerAttacker, _GetMoveTarget(encored, NO_TARGET_OVERRIDE));
  } else if (gDisableStructs[gBattlerAttacker].encoredMove !== MOVE_NONE
             && gDisableStructs[gBattlerAttacker].encoredMove !== gBattleMons[gBattlerAttacker].moves[gDisableStructs[gBattlerAttacker].encoredMovePos]) {
    // Encored move was overwritten — reset
    setCurrMovePos(gDisableStructs[gBattlerAttacker].encoredMovePos);
    setChosenMovePos(gDisableStructs[gBattlerAttacker].encoredMovePos);
    const move = gBattleMons[gBattlerAttacker].moves[gCurrMovePos];
    setCurrentMove(move);
    setChosenMove(move);
    gDisableStructs[gBattlerAttacker].encoredMove = MOVE_NONE;
    gDisableStructs[gBattlerAttacker].encoredMovePos = 0;
    gDisableStructs[gBattlerAttacker].encoreTimer = 0;
    _setMoveTargetForBattler(gBattlerAttacker, _GetMoveTarget(move, NO_TARGET_OVERRIDE));
  } else if (gBattleMons[gBattlerAttacker].moves[gCurrMovePos] !== gChosenMoveByBattler[gBattlerAttacker]) {
    const move = gBattleMons[gBattlerAttacker].moves[gCurrMovePos];
    setCurrentMove(move);
    setChosenMove(move);
    _setMoveTargetForBattler(gBattlerAttacker, _GetMoveTarget(move, NO_TARGET_OVERRIDE));
  } else {
    const move = gBattleMons[gBattlerAttacker].moves[gCurrMovePos];
    setCurrentMove(move);
    setChosenMove(move);
  }

  if (gBattleMons[gBattlerAttacker].hp !== 0) {
    // 1:1 décomp `HandleAction_UseMove` (battle_util.c:165-175).
    if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
      gBattleResults.lastUsedMovePlayer = gCurrentMove;
    } else {
      gBattleResults.lastUsedMoveOpponent = gCurrentMove;
    }
  }

  // Choose target.
  const side = BATTLE_OPPOSITE(GET_BATTLER_SIDE(gBattlerAttacker));
  if (gSideTimers[side].followmeTimer !== 0
      && getBattleMove(gCurrentMove).target === MOVE_TARGET_SELECTED
      && GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gSideTimers[side].followmeTarget)
      && gBattleMons[gSideTimers[side].followmeTarget].hp !== 0) {
    setBattlerTarget(gSideTimers[side].followmeTarget);
  } else if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
             && gSideTimers[side].followmeTimer === 0
             && (getBattleMove(gCurrentMove).power !== 0
                 || getBattleMove(gCurrentMove).target !== MOVE_TARGET_USER)
             && gBattleMons[_getMoveTargetForBattler(gBattlerAttacker)].ability !== ABILITY_LIGHTNING_ROD
             && getBattleMove(gCurrentMove).type === TYPE_ELECTRIC) {
    // Lightning Rod redirect double battle.
    const sideAtk = GET_BATTLER_SIDE(gBattlerAttacker);
    for (let active = 0; active < gBattlersCount; active++) {
      setActiveBattler(active);
      if (sideAtk !== GET_BATTLER_SIDE(active)
          && _getMoveTargetForBattler(gBattlerAttacker) !== active
          && gBattleMons[active].ability === ABILITY_LIGHTNING_ROD
          && _GetBattlerTurnOrderNum(active) < var_) {
        var_ = _GetBattlerTurnOrderNum(active);
      }
    }
    if (var_ === 4) {
      // Pas de Lightning Rod trouvé — pick target normal.
      if (getBattleMove(gChosenMove).target & MOVE_TARGET_RANDOM) {
        if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
          setBattlerTarget((Random() & 1)
            ? GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT)
            : GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT));
        } else {
          setBattlerTarget((Random() & 1)
            ? GetBattlerAtPosition(B_POSITION_PLAYER_LEFT)
            : GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT));
        }
      } else {
        setBattlerTarget(_getMoveTargetForBattler(gBattlerAttacker));
      }
      // Absent battler redirect to partner.
      if (gAbsentBattlerFlags & gBitTable[gBattlerTarget]) {
        if (GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)) {
          setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
        } else {
          setBattlerTarget(GetBattlerAtPosition(BATTLE_OPPOSITE(GetBattlerPosition(gBattlerAttacker))));
          if (gAbsentBattlerFlags & gBitTable[gBattlerTarget]) {
            setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
          }
        }
      }
    } else {
      // Lightning Rod redirect actif.
      setActiveBattler(gBattlerByTurnOrder[var_]);
      _RecordAbilityBattle(gActiveBattler, gBattleMons[gActiveBattler].ability);
      gSpecialStatuses[gActiveBattler].lightningRodRedirected = 1;
      setBattlerTarget(gActiveBattler);
    }
  } else if ((gBattleTypeFlags & BATTLE_TYPE_DOUBLE)
             && (getBattleMove(gChosenMove).target & MOVE_TARGET_RANDOM)) {
    if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
      setBattlerTarget((Random() & 1)
        ? GetBattlerAtPosition(B_POSITION_OPPONENT_LEFT)
        : GetBattlerAtPosition(B_POSITION_OPPONENT_RIGHT));
    } else {
      setBattlerTarget((Random() & 1)
        ? GetBattlerAtPosition(B_POSITION_PLAYER_LEFT)
        : GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT));
    }
    if ((gAbsentBattlerFlags & gBitTable[gBattlerTarget])
        && GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)) {
      setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
    }
  } else {
    setBattlerTarget(_getMoveTargetForBattler(gBattlerAttacker));
    if (gAbsentBattlerFlags & gBitTable[gBattlerTarget]) {
      if (GET_BATTLER_SIDE(gBattlerAttacker) !== GET_BATTLER_SIDE(gBattlerTarget)) {
        setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
      } else {
        setBattlerTarget(GetBattlerAtPosition(BATTLE_OPPOSITE(GetBattlerPosition(gBattlerAttacker))));
        if (gAbsentBattlerFlags & gBitTable[gBattlerTarget]) {
          setBattlerTarget(GetBattlerAtPosition(_BATTLE_PARTNER(GetBattlerPosition(gBattlerTarget))));
        }
      }
    }
  }

  // Battle Palace fallback (= rare cas trainer Palace).
  let scriptPtr = -1;
  if ((gBattleTypeFlags & BATTLE_TYPE_PALACE) && gProtectStructs[gBattlerAttacker].palaceUnableToUseMove) {
    if (gBattleMons[gBattlerAttacker].hp === 0) {
      setCurrentActionFuncId(B_ACTION_FINISHED);
      return;
    }
    // gPalaceSelectionBattleScripts Frontier deferred.
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_INCAPABLE_OF_POWER;
    scriptPtr = getBattleScriptOffset('BattleScript_MoveUsedLoafingAround');
  } else {
    // 1:1 décomp : `gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[gBattleMoves[gCurrentMove].effect]`.
    const moveEffect = getBattleMove(gCurrentMove).effect;
    scriptPtr = getMoveEffectScriptOffset(moveEffect as number);
  }

  // Battle Arena : BattleArena_AddMindPoints. Battle Frontier deferred post-Phase 1.
  if (gBattleTypeFlags & BATTLE_TYPE_ARENA) {
    // BattleArena_AddMindPoints deferred.
    void setLastUsedAbility;
  }

  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);

  // 1:1 décomp battle_util.c:285 : `gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[effect]`.
  // On pose le scriptPtr sur le ctx persistant (= le global gBattlescriptCurrInstr),
  // que HandleAction_RunBattleScript steppera commande par commande (1×/frame,
  // gated sur gBattleControllerExecFlags). La voie V passe son propre ctx local.
  const c = ctx ?? gBattleScriptContext;
  if (scriptPtr >= 0) {
    c.scriptPtr = scriptPtr;
  }
}

/** 1:1 décomp `HandleAction_Switch` (battle_util.c:294-310). */
export function HandleAction_Switch(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  // 1:1 décomp battle_util.c : gBattle_BG0_X/Y = 0 — BG scroll registers GBA
  // (= no-op web canvas, le scroll est piloté par le renderer side).
  // gActionSelectionCursor / gMoveSelectionCursor reset au switch.
  gActionSelectionCursor[gBattlerAttacker] = 0;
  gMoveSelectionCursor[gBattlerAttacker] = 0;
  // 1:1 décomp battle_util.c : PREPARE_MON_NICK_BUFFER. battlerPartyIndexes
  // dans le décomp = gBattleStruct->battlerPartyIndexes ; notre port utilise
  // gBattlerPartyIndexes pour le party slot courant de chaque battler.
  PREPARE_MON_NICK_BUFFER(_gBattleTextBuff1_HA, gBattlerAttacker, gBattlerPartyIndexes[gBattlerAttacker]);
  gBattleScripting.battler = gBattlerAttacker;
  const off = getBattleScriptOffset('BattleScript_ActionSwitch');
  // ctx est undefined quand appelé via le turn dispatch (sTurnActionsFuncsTable() sans
  // arg) → fallback sur le ctx PERSISTANT gBattleScriptContext (= celui que steppe
  // HandleAction_RunBattleScript). Sans ce fallback le scriptPtr n'était JAMAIS posé
  // → le mon ne swappait pas, tour figé à RunTurnActionsFunctions (bug switch loop #9).
  // Pattern `ctx ?? gBattleScriptContext` = handle-action.ts:357/482.
  const c = ctx ?? gBattleScriptContext;
  if (off >= 0) c.scriptPtr = off;
  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
  // 1:1 décomp ll.308-309 : incrémente playerSwitchesCounter (cap à 255 u8).
  if (gBattleResults.playerSwitchesCounter < 255) {
    gBattleResults.playerSwitchesCounter++;
  }
}

/** 1:1 décomp `HandleAction_UseItem` (battle_util.c:312+). partial port.
 *  Wirage minimal : set attacker + ClearFuryCutterDestinyBondGrudge.
 *  Phase 1.4 : full item battle flow deferred (= read gBattleBufferB[1..2] pour item ID,
 *  switch sur effect, run bytecode item-use). */
export function HandleAction_UseItem(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  setBattlerTarget(gBattlerAttacker);
  ClearFuryCutterDestinyBondGrudge(gBattlerAttacker);
  // 1:1 decomp battle_util.c:318 : gLastUsedItem = bufferB[1] | bufferB[2]<<8
  // (deja pose 1:1 par STATE_WAIT_ACTION_CASE_CHOSEN -> setLastUsedItem).
  const item = gLastUsedItem;
  if (item > 0 && item <= 12 /* LAST_BALL = ITEM_PREMIER_BALL */) {
    // 1:1 : gBattlescriptCurrInstr = gBattlescriptsForBallThrow[item] — la table
    // (battle_scripts_2.s:15) pointe BattleScript_BallThrow pour toutes les balls
    // (Safari = BattleScript_SafariBallThrow, item 5 en Safari uniquement).
    const off = getBattleScriptOffset('BattleScript_BallThrow');
    // Le dispatcher C7 (RunTurnActionsFunctions) appelle les handlers SANS ctx
    // -> fallback 1:1 sur le ctx PERSISTANT (gBattleScriptContext), comme
    // HandleEndTurn_BattleWon.
    const c = ctx ?? gBattleScriptContext;
    if (off >= 0 && c) {
      c.scriptPtr = off;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
      return;
    }
  }
  // 1:1 decomp battle_util.c:324-330 : POKE_DOLL(80)/FLUFFY_TAIL(81) ->
  // BattleScript_RunByUsingItem (fuite garantie wild) ; autres items joueur ->
  // BattleScript_PlayerUsesItem (message + finishaction ; l effet medecine/X a
  // deja ete applique cote bag/party 1:1). Branche AI trainer items = dette.
  if (item === 80 || item === 81) {
    const off2 = getBattleScriptOffset('BattleScript_RunByUsingItem');
    const c2 = ctx ?? gBattleScriptContext;
    if (off2 >= 0 && c2) {
      c2.scriptPtr = off2;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
      return;
    }
  } else if (item > 0) {
    const off3 = getBattleScriptOffset('BattleScript_PlayerUsesItem');
    const c3 = ctx ?? gBattleScriptContext;
    if (off3 >= 0 && c3) {
      c3.scriptPtr = off3;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
      return;
    }
  }
  setCurrentActionFuncId(B_ACTION_FINISHED);
}

/** 1:1 décomp `HandleAction_Run` (battle_util.c:487-539). */
export function HandleAction_Run(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);

  if (gBattleTypeFlags & (_BATTLE_TYPE_LINK_HAR | _BATTLE_TYPE_RECORDED_LINK_HAR)) {
    // 1:1 décomp ll.491-510 : link battle run = all link battlers lose/win.
    setCurrentTurnActionNumberHAR(gBattlersCount);
    for (let i = 0; i < gBattlersCount; i++) {
      _setActiveBattlerHAR(i);
      if (GET_BATTLER_SIDE(i) === B_SIDE_PLAYER) {
        if (_gChosenActionByBattlerHAR[i] === _B_ACTION_RUN_HAR) {
          // OUTCOME_LOST = 2 ; combiné avec outcome existant via OR.
          _setBattleOutcomeHAR(_gBattleOutcomeHAR | 2);
        }
      } else {
        if (_gChosenActionByBattlerHAR[i] === _B_ACTION_RUN_HAR) {
          // OUTCOME_WON = 1.
          _setBattleOutcomeHAR(_gBattleOutcomeHAR | 1);
        }
      }
    }
    // OUTCOME_LINK_BATTLE_RAN = 1 << 7 = 0x80.
    // Frontier deferred : gSaveBlock2Ptr.frontier.disableRecordBattle = TRUE (= Frontier post-Phase 1).
    return;
  }

  // Normal battle.
  if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_PLAYER) {
    if (!TryRunFromBattle(gBattlerAttacker)) {
      // Failed to run away.
      ClearFuryCutterDestinyBondGrudge(gBattlerAttacker);
      gBattleCommunication[MULTISTRING_CHOOSER] = _B_MSG_CANT_ESCAPE_2_HAR;
      const off = _getBattleScriptOffsetHAR('BattleScript_PrintFailedToRunString');
      // 1:1 décomp `gBattlescriptCurrInstr = BattleScript_PrintFailedToRunString` :
      // la table sTurnActionsFuncsTable appelle SANS ctx → fallback OBLIGATOIRE sur
      // le ctx persistant (sinon le script n'est jamais pointé → B_ACTION_EXEC_SCRIPT
      // steppe l'ancien pointeur = soft-lock silencieux au menu, bug user fuite).
      const c = ctx ?? gBattleScriptContext;
      if (c && off >= 0) c.scriptPtr = off;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
    }
    // Si TryRunFromBattle a réussi : il a déjà set gBattleOutcome = RAN +
    // gCurrentTurnActionNumber = gBattlersCount.
  } else {
    // Wild opponent essaie de fuir (= Roar / Whirlwind sur joueur).
    if (gBattleMons[gBattlerAttacker].status2 & (_STATUS2_WRAPPED_HAR | _STATUS2_ESCAPE_PREVENTION_HAR)) {
      gBattleCommunication[MULTISTRING_CHOOSER] = _B_MSG_ATTACKER_CANT_ESCAPE_HAR;
      const off = _getBattleScriptOffsetHAR('BattleScript_PrintFailedToRunString');
      // 1:1 : même fallback ctx persistant (appel sans ctx depuis la table d'actions).
      const c = ctx ?? gBattleScriptContext;
      if (c && off >= 0) c.scriptPtr = off;
      setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
    } else {
      setCurrentTurnActionNumberHAR(gBattlersCount);
      _setBattleOutcomeHAR(6 /* B_OUTCOME_MON_FLED */);
    }
  }
}

// ─── Actions SAFARI + WALLY (battle_util.c:550-637) — tranche battle_util ×7 ──
// Atteignabilité : Safari Zone + tuto Wally hors démo actuelle (les boots
// DoSafariBattle/StartWallyTutorialBattle = dettes notées) ; les handlers sont
// la STRUCTURE 1:1 complète, dispatchés par sTurnActionsFuncsTable dès que les
// entrées de jeu existeront.

/** 1:1 `sPkblToEscapeFactor[5][3]` (battle_util.c:52-74) — lignes = throw
 *  counter, colonnes = B_MSG_MON_CURIOUS(0)/ENTHRALLED(1)/IGNORED(2). */
const sPkblToEscapeFactor: ReadonlyArray<ReadonlyArray<number>> = [
  [0, 0, 0], [3, 5, 0], [2, 3, 0], [1, 2, 0], [1, 1, 0],
];
/** 1:1 `sGoNearCounterToCatchFactor[]` (battle_util.c:75). */
const sGoNearCounterToCatchFactor: readonly number[] = [4, 3, 2, 1];
/** 1:1 `sGoNearCounterToEscapeFactor[]` (battle_util.c:76). */
const sGoNearCounterToEscapeFactor: readonly number[] = [4, 4, 4, 4];

/** 1:1 EWRAM `gNumSafariBalls` (battle global) — décrémenté par le throw ;
 *  initialisé (30) à l'entrée Safari Zone (boot safari = dette). */
export let gNumSafariBalls = 0;
export function setNumSafariBalls(v: number): void { gNumSafariBalls = v & 0xFF; }

/** 1:1 `MULTISTRING_CHOOSER` (battle.h) = gBattleCommunication[5]. */
const _MULTISTRING_CHOOSER_SAF = 5;
const _ITEM_SAFARI_BALL = 5;
/** 1:1 battle_string_ids.h:548-549. */
const _B_MSG_CREPT_CLOSER = 0, _B_MSG_CANT_GET_CLOSER = 1;

/** 1:1 décomp `HandleAction_SafariZoneBallThrow()` (battle_util.c:550-560).
 *  gBattle_BG0_X/Y=0 : scroll textbox piloté par le renderer web (cf.
 *  HandleAction_Switch, même convention no-op). */
export function HandleAction_SafariZoneBallThrow(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  gNumSafariBalls--;
  _setLastUsedItemSAF(_ITEM_SAFARI_BALL);
  // 1:1 gBattlescriptsForBallThrow[ITEM_SAFARI_BALL] = BattleScript_SafariBallThrow
  // (battle_scripts_2.s:20).
  const off = getBattleScriptOffset('BattleScript_SafariBallThrow');
  const c = ctx ?? gBattleScriptContext;
  if (c && off >= 0) c.scriptPtr = off;
  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
}

/** 1:1 décomp `HandleAction_ThrowPokeblock()` (battle_util.c:561-589).
 *  ⚠️ QUIRK VANILLA reproduit (pas de BUGFIX) : `<` au lieu de `<=` →
 *  safariEscapeFactor peut tomber à 0 (« pokeblock throw glitch »). */
export function HandleAction_ThrowPokeblock(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  gBattleCommunication[_MULTISTRING_CHOOSER_SAF] = (gBattleBufferB[gBattlerAttacker][1] ?? 1) - 1;
  _setLastUsedItemSAF(gBattleBufferB[gBattlerAttacker][2] ?? 0);

  if (gBattleResults.pokeblockThrows < 255) gBattleResults.pokeblockThrows++;
  const bs = gBattleStruct as { safariPkblThrowCounter?: number; safariEscapeFactor?: number };
  if ((bs.safariPkblThrowCounter ?? 0) < 3) bs.safariPkblThrowCounter = (bs.safariPkblThrowCounter ?? 0) + 1;
  if ((bs.safariEscapeFactor ?? 0) > 1) {
    const dec = sPkblToEscapeFactor[bs.safariPkblThrowCounter ?? 0][gBattleCommunication[_MULTISTRING_CHOOSER_SAF]] ?? 0;
    if ((bs.safariEscapeFactor ?? 0) < dec) bs.safariEscapeFactor = 1;
    else bs.safariEscapeFactor = (bs.safariEscapeFactor ?? 0) - dec;
  }

  // 1:1 gBattlescriptsForSafariActions[2] = BattleScript_ActionThrowPokeblock.
  const off = getBattleScriptOffset('BattleScript_ActionThrowPokeblock');
  const c = ctx ?? gBattleScriptContext;
  if (c && off >= 0) c.scriptPtr = off;
  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
}

/** 1:1 décomp `HandleAction_GoNear()` (battle_util.c:590-616). */
export function HandleAction_GoNear(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  const bs = gBattleStruct as { safariCatchFactor?: number; safariEscapeFactor?: number; safariGoNearCounter?: number };

  bs.safariCatchFactor = (bs.safariCatchFactor ?? 0) + (sGoNearCounterToCatchFactor[bs.safariGoNearCounter ?? 0] ?? 0);
  if (bs.safariCatchFactor > 20) bs.safariCatchFactor = 20;

  bs.safariEscapeFactor = (bs.safariEscapeFactor ?? 0) + (sGoNearCounterToEscapeFactor[bs.safariGoNearCounter ?? 0] ?? 0);
  if (bs.safariEscapeFactor > 20) bs.safariEscapeFactor = 20;

  if ((bs.safariGoNearCounter ?? 0) < 3) {
    bs.safariGoNearCounter = (bs.safariGoNearCounter ?? 0) + 1;
    gBattleCommunication[_MULTISTRING_CHOOSER_SAF] = _B_MSG_CREPT_CLOSER;
  } else {
    gBattleCommunication[_MULTISTRING_CHOOSER_SAF] = _B_MSG_CANT_GET_CLOSER;
  }
  // 1:1 gBattlescriptsForSafariActions[1] = BattleScript_ActionGetNear.
  const off = getBattleScriptOffset('BattleScript_ActionGetNear');
  const c = ctx ?? gBattleScriptContext;
  if (c && off >= 0) c.scriptPtr = off;
  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
}

/** 1:1 décomp `HandleAction_SafariZoneRun()` (battle_util.c:617-624). */
export function HandleAction_SafariZoneRun(_ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  (globalThis as { __PlaySE?: (id: number) => void }).__PlaySE?.(17 /* SE_FLEE (songs.h:23) */);
  setCurrentTurnActionNumberHAR(gBattlersCount);
  _setBattleOutcomeHAR(4 /* B_OUTCOME_RAN */);
}

/** 1:1 décomp `HandleAction_WallyBallThrow()` (battle_util.c:625-637). */
export function HandleAction_WallyBallThrow(ctx?: BattleScriptContext): void {
  setBattlerAttacker(gBattlerByTurnOrder[gCurrentTurnActionNumber]);
  PREPARE_MON_NICK_BUFFER(_gBattleTextBuff1_HA, gBattlerAttacker, gBattlerPartyIndexes[gBattlerAttacker]);
  // 1:1 gBattlescriptsForSafariActions[3] = BattleScript_ActionWallyThrow.
  const off = getBattleScriptOffset('BattleScript_ActionWallyThrow');
  const c = ctx ?? gBattleScriptContext;
  if (c && off >= 0) c.scriptPtr = off;
  setCurrentActionFuncId(B_ACTION_EXEC_SCRIPT);
  gActionsByTurnOrder[1] = B_ACTION_FINISHED;
}

// ─── Mark* controller exec (battle_util.c:830-863) ──────────────────────────

/** 1:1 décomp `MarkAllBattlersForControllerExec()` (battle_util.c:830-845) —
 *  marqué UNUSED dans le .c (port nominal complet, aucun caller décomp). */
export function MarkAllBattlersForControllerExec(): void {
  if (gBattleTypeFlags & _BATTLE_TYPE_LINK_HAR) {
    for (let i = 0; i < gBattlersCount; i++) {
      _orBattleControllerExecFlags(gBitTable[i] << (32 - 4 /* MAX_BATTLERS_COUNT */));
    }
  } else {
    for (let i = 0; i < gBattlersCount; i++) {
      _orBattleControllerExecFlags(gBitTable[i]);
    }
  }
}

/** 1:1 décomp `MarkBattlerReceivedLinkData(battlerId)` (battle_util.c:854-863) —
 *  link only : GetLinkPlayerCount()=0 hors link → seule la clear-mask s'applique. */
export function MarkBattlerReceivedLinkData(battlerId: number): void {
  const linkPlayers = 0; // GetLinkPlayerCount() — link non porté (dette link).
  for (let i = 0; i < linkPlayers; i++) {
    _orBattleControllerExecFlags(gBitTable[battlerId] << (i << 2));
  }
  _andBattleControllerExecFlags(~((1 << 28) << battlerId));
}

// Imports locaux HandleAction_Run. (TryRunFromBattle vit DANS ce fichier
// depuis la fusion miroir — ex-try-run-from-battle.ts, section en bas.)
import { getBattleScriptOffset as _getBattleScriptOffsetHAR } from '../engine/battle/script-interpreter';
import {
  setBattleOutcome as _setBattleOutcomeHAR,
  setCurrentTurnActionNumber as setCurrentTurnActionNumberHAR,
  gChosenActionByBattler as _gChosenActionByBattlerHAR,
  setActiveBattler as _setActiveBattlerHAR,
  gBattleOutcome as _gBattleOutcomeHAR,
  setLastUsedItem as _setLastUsedItemSAF,
  setBattleControllerExecFlags as _setBattleControllerExecFlagsSAF,
  gBattleControllerExecFlags as _gBattleControllerExecFlagsSAF,
  gActionsByTurnOrder,
} from '../engine/battle/state';
import { gBattleBufferB } from '../engine/battle/battle-controllers-ipc';

/** Helpers OR/AND sur gBattleControllerExecFlags (Mark* 1:1). */
function _orBattleControllerExecFlags(mask: number): void {
  _setBattleControllerExecFlagsSAF((_gBattleControllerExecFlagsSAF | mask) >>> 0);
}
function _andBattleControllerExecFlags(mask: number): void {
  _setBattleControllerExecFlagsSAF((_gBattleControllerExecFlagsSAF & mask) >>> 0);
}
import {
  BATTLE_TYPE_LINK as _BATTLE_TYPE_LINK_HAR,
  BATTLE_TYPE_RECORDED_LINK as _BATTLE_TYPE_RECORDED_LINK_HAR,
  STATUS2_WRAPPED as _STATUS2_WRAPPED_HAR,
  STATUS2_ESCAPE_PREVENTION as _STATUS2_ESCAPE_PREVENTION_HAR,
} from '../engine/battle/constants';

const _B_ACTION_RUN_HAR = 3;
// 1:1 décomp battle_string_ids.h:564-569 (index dans gNoEscapeStringIds) :
// CANT_ESCAPE=0, DONT_LEAVE_BIRCH=1, PREVENTS_ESCAPE=2, CANT_ESCAPE_2=3,
// ATTACKER_CANT_ESCAPE=4. (Les anciennes valeurs 1/0 affichaient le message
// Birch « Ne me laisse pas comme ça! » sur un échec de fuite sauvage.)
const _B_MSG_CANT_ESCAPE_2_HAR = 3;
const _B_MSG_ATTACKER_CANT_ESCAPE_HAR = 4;

/** 1:1 décomp `HandleAction_RunBattleScript` (battle_util.c:3805-3809) :
 *  `if (gBattleControllerExecFlags == 0) gBattleScriptingCommandsTable[*gBattlescriptCurrInstr]();`
 *
 *  Step UNE commande du battle script par frame, et SEULEMENT quand aucun
 *  controller n'est en cours d'exécution (texte/anim/hp update finis). Le pacing
 *  per-frame émerge : RunTurnActionsFunctions appelle ceci 1×/frame ; une
 *  commande bloquante (printstring/animation/datahpupdate) fait
 *  MarkBattlerForControllerExec → le flag bloque le prochain step ; le controller
 *  func (tické par BattleMainCB1) clear le flag quand fini → step reprend. */
export function HandleAction_RunBattleScript(ctx?: BattleScriptContext): void {
  const c = ctx ?? gBattleScriptContext;
  if (gBattleControllerExecFlags === 0) {
    stepBattleScriptCommand(c);
  }
}

/** 1:1 décomp `HandleAction_TryFinish` (battle_util.c:638-645). Appelle
 *  HandleFaintedMonActions chaque frame ; tant que TRUE (un script EXP/faint est
 *  en cours), on attend ; quand FALSE (tout le flow post-faint est fini) →
 *  faintedActionsState=0 + gCurrentActionFuncId=B_ACTION_FINISHED. */
export function HandleAction_TryFinish(_ctx?: BattleScriptContext): void {
  if (!HandleFaintedMonActions()) {
    gBattleStruct.faintedActionsState = 0;
    setCurrentActionFuncId(B_ACTION_FINISHED);
  }
}

/** 1:1 décomp `FAINTED_ACTIONS_MAX_CASE` = 7 (battle_util.c). */
const _FAINTED_ACTIONS_MAX_CASE = 7;
const _PARTY_SIZE_HFM = 6;

/** `BattleScriptExecute(label)` via le hook globalThis (= évite le cycle
 *  handle-action ↔ battle-main-functions ; même pattern que turn-dispatch). */
function _BattleScriptExecuteHFM(label: string): void {
  const bm = (globalThis as Record<string, unknown>).__battleMainFunctions as
    { BattleScriptExecute?: (l: string) => void } | undefined;
  if (bm?.BattleScriptExecute) bm.BattleScriptExecute(label);
  else console.warn('[handle-action] BattleScriptExecute hook absent (battle-main-functions pas chargé)');
}

/** 1:1 inline `HasNoMonsToSwitch(battler, …)` (battle_util.c) — true si AUCUN
 *  autre mon vivant dans le party du battler. (= ne peut pas remplacer.) */
function _HasNoMonsToSwitchHFM(battler: number): boolean {
  const partyIdx = gBattlerPartyIndexes[battler] ?? 0;
  const party = (battler & 1) === 0
    ? (globalThis as { gPlayerParty?: Array<{ species?: number; hp?: number; isEgg?: number }> }).gPlayerParty
    : (globalThis as { gEnemyParty?: Array<{ species?: number; hp?: number; isEgg?: number }> }).gEnemyParty;
  if (!party) return true;
  for (let j = 0; j < _PARTY_SIZE_HFM; j++) {
    if (j === partyIdx) continue;
    const m = party[j];
    if (m?.species && (m.hp ?? 0) > 0 && !m.isEgg) return false;
  }
  return true;
}

/** 1:1 inline `OpponentSwitchInResetSentPokesToOpponentValue(battler)`
 *  (battle_util.c:915-932) — recompute gSentPokesToOpponent[flank]. */
function _OpponentSwitchInResetHFM(battler: number): void {
  if ((battler & 1) !== 1) return;  // GET_BATTLER_SIDE != B_SIDE_OPPONENT.
  const flank = (battler & 2) >>> 1;
  const sentPokes = (globalThis as { gSentPokesToOpponent?: number[] }).gSentPokesToOpponent;
  if (!sentPokes) return;
  let bits = 0;
  for (let i = 0; i < gBattlersCount; i += 2) {
    if (!(gAbsentBattlerFlags & gBitTable[i])) bits |= gBitTable[gBattlerPartyIndexes[i] ?? 0];
  }
  sentPokes[flank] = bits;
}

/** 1:1 décomp `HandleFaintedMonActions()` (battle_util.c:1877-1954). State machine
 *  `faintedActionsState` (0..7) : EXP (GiveExp) → faint/« K.O. » (HandleFaintedMon)
 *  → effets switch-in. Return TRUE quand un script est lancé (BattleScriptExecute
 *  bascule gBattleMainFunc → le script tourne per-frame ; la fonction est
 *  re-appelée par TryFinish au frame suivant) ; FALSE quand fini (state == MAX). */
export function HandleFaintedMonActions(): boolean {
  if (gBattleTypeFlags & BATTLE_TYPE_SAFARI) return false;
  do {
    switch (gBattleStruct.faintedActionsState) {
      case 0:
        gBattleStruct.faintedActionsBattlerId = 0;
        gBattleStruct.faintedActionsState = 1;
        for (let i = 0; i < gBattlersCount; i++) {
          if ((gAbsentBattlerFlags & gBitTable[i]) && !_HasNoMonsToSwitchHFM(i)) {
            setAbsentBattlerFlags(gAbsentBattlerFlags & ~gBitTable[i]);
          }
        }
        // décomp = fall through vers case 1 ; ici break → le do-while ré-entre
        // au switch avec state=1 (= équivalent exact).
        break;
      case 1: {
        let launched = false;
        do {
          const b = gBattleStruct.faintedActionsBattlerId;
          setBattlerFainted(b);
          setBattlerTarget(b);
          const expBit = gBitTable[gBattlerPartyIndexes[b] ?? 0] ?? 1;
          if (gBattleMons[b].hp === 0
              && !(gBattleStruct.givenExpMons & expBit)
              && !(gAbsentBattlerFlags & gBitTable[b])) {
            _BattleScriptExecuteHFM('BattleScript_GiveExp');
            gBattleStruct.faintedActionsState = 2;
            launched = true;
            break;
          }
        } while (++gBattleStruct.faintedActionsBattlerId !== gBattlersCount);
        if (launched) return true;
        gBattleStruct.faintedActionsState = 3;
        break;
      }
      case 2:
        _OpponentSwitchInResetHFM(gBattleStruct.faintedActionsBattlerId);
        if (++gBattleStruct.faintedActionsBattlerId === gBattlersCount) gBattleStruct.faintedActionsState = 3;
        else gBattleStruct.faintedActionsState = 1;
        break;
      case 3:
        gBattleStruct.faintedActionsBattlerId = 0;
        gBattleStruct.faintedActionsState = 4;
        // décomp = fall through vers case 4 ; break → do-while ré-entre à state=4.
        break;
      case 4: {
        let launched = false;
        do {
          const b = gBattleStruct.faintedActionsBattlerId;
          setBattlerFainted(b);
          setBattlerTarget(b);
          if (gBattleMons[b].hp === 0 && !(gAbsentBattlerFlags & gBitTable[b])) {
            _BattleScriptExecuteHFM('BattleScript_HandleFaintedMon');
            gBattleStruct.faintedActionsState = 5;
            launched = true;
            break;
          }
        } while (++gBattleStruct.faintedActionsBattlerId !== gBattlersCount);
        if (launched) return true;
        gBattleStruct.faintedActionsState = 6;
        break;
      }
      case 5:
        if (++gBattleStruct.faintedActionsBattlerId === gBattlersCount) gBattleStruct.faintedActionsState = 6;
        else gBattleStruct.faintedActionsState = 4;
        break;
      case 6:
        // 1:1 décomp battle_util.c:1942-1947 :
        //   if (AbilityBattleEffects(ABILITYEFFECT_INTIMIDATE1, 0,0,0,0)
        //    || AbilityBattleEffects(ABILITYEFFECT_TRACE, 0,0,0,0)
        //    || ItemBattleEffects(ITEMEFFECT_NORMAL, 0, TRUE)
        //    || AbilityBattleEffects(ABILITYEFFECT_FORECAST, 0,0,0,0))
        //       return TRUE;          // un script switch-in a été mis en file
        //   gBattleStruct->faintedActionsState++;   // → état 7
        //
        // Dans la décomp, AbilityBattleEffects/ItemBattleEffects mettent le script
        // en file (BattleScriptPushCursorAndCallback) et retournent l'effet != 0 ;
        // ici notre port délègue l'exécution au caller : on consomme le label voulu
        // (consume*WantedScript) puis on le lance via _BattleScriptExecuteHFM (=
        // l'équivalent du BattleScriptExecute interne). Le `return true` reproduit
        // le `return TRUE` (= le caller re-appelle au frame suivant).
        if (AbilityBattleEffects(ABILITYEFFECT_INTIMIDATE1, 0, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) _BattleScriptExecuteHFM(label);
          return true;
        }
        if (AbilityBattleEffects(ABILITYEFFECT_TRACE, 0, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) _BattleScriptExecuteHFM(label);
          return true;
        }
        if (ItemBattleEffects(ITEMEFFECT_NORMAL, 0, true) !== 0) {
          const label = consumeItemWantedScript();
          if (label) _BattleScriptExecuteHFM(label);
          return true;
        }
        if (AbilityBattleEffects(ABILITYEFFECT_FORECAST, 0, 0, 0, 0) !== 0) {
          const label = consumeAbilityWantedScript();
          if (label) _BattleScriptExecuteHFM(label);
          return true;
        }
        gBattleStruct.faintedActionsState++;
        break;
      case _FAINTED_ACTIONS_MAX_CASE:
        break;
    }
  } while (gBattleStruct.faintedActionsState !== _FAINTED_ACTIONS_MAX_CASE);
  return false;
}

const _HM_RESET_BITS =
  _HITMARKER_DESTINYBOND_HAF | _HITMARKER_IGNORE_SUBSTITUTE_HAF
  | _HITMARKER_ATTACKSTRING_PRINTED_HAF | _HITMARKER_NO_PPDEDUCT_HAF
  | _HITMARKER_STATUS_ABILITY_EFFECT_HAF | _HITMARKER_IGNORE_ON_AIR_HAF
  | _HITMARKER_IGNORE_UNDERGROUND_HAF | _HITMARKER_IGNORE_UNDERWATER_HAF
  | _HITMARKER_PASSIVE_HP_UPDATE_HAF | _HITMARKER_OBEYS_HAF
  | _HITMARKER_WAKE_UP_CLEAR_HAF | _HITMARKER_SYNCHRONIZE_EFFECT_HAF
  | _HITMARKER_CHARGING_HAF | _HITMARKER_NEVER_SET_HAF;

/** 1:1 décomp `HandleAction_NothingIsFainted` (battle_util.c:647-656). */
export function HandleAction_NothingIsFainted(_ctx?: BattleScriptContext): void {
  setCurrentTurnActionNumberHAR(_gCurrentTurnActionNumberHAF + 1);
  setCurrentActionFuncId(_gActionsByTurnOrderHAF[_gCurrentTurnActionNumberHAF]);
  setHitMarker(_gHitMarkerHAF & ~_HM_RESET_BITS);
}

/** 1:1 décomp `HandleAction_ActionFinished` (battle_util.c:658-684). */
export function HandleAction_ActionFinished(_ctx?: BattleScriptContext): void {
  // 1:1 décomp : monToSwitchIntoId[battlerByTurnOrder[current]] = PARTY_SIZE.
  _gBattleStructHAF.monToSwitchIntoId[_gBattlerByTurnOrderHAF[_gCurrentTurnActionNumberHAF]] = 6 /* PARTY_SIZE */;
  setCurrentTurnActionNumberHAR(_gCurrentTurnActionNumberHAF + 1);
  setCurrentActionFuncId(_gActionsByTurnOrderHAF[_gCurrentTurnActionNumberHAF]);
  _SpecialStatusesClearHAF();
  setHitMarker(_gHitMarkerHAF & ~_HM_RESET_BITS);

  setCurrentMove(0);
  setBattleMoveDamageHAR(0);
  setMoveResultFlags(0);
  gBattleScripting.animTurn = 0;
  gBattleScripting.animTargetsHit = 0;
  _gLastLandedMovesHAF[gBattlerAttacker] = 0;
  _gLastHitByTypeHAF[gBattlerAttacker] = 0;
  _gBattleStructHAF.dynamicMoveType = 0;
  setDynamicBasePowerHAR(0);
  gBattleScripting.moveendState = 0;
  gBattleCommunication[3] = 0;  // MOVE_EFFECT_BYTE
  gBattleCommunication[4] = 0;
  gBattleScripting.multihitMoveEffect = 0;
  // 1:1 décomp battle_util.c:683 : gBattleResources->battleScriptsStack->size = 0.
  // Notre équivalent = vider le call-stack du ctx persistant pour que le tour
  // suivant reparte propre (= évite une fuite de scriptPtrStack entre tours).
  gBattleScriptContext.scriptPtrStack.length = 0;
  gBattleScriptContext.comparisonResult = 0;
}

/** 1:1 décomp `SpecialStatusesClear()` (battle_util.c). Reset gSpecialStatuses
 *  pour tous les battlers à blank. */
function _SpecialStatusesClearHAF(): void {
  for (let i = 0; i < gBattlersCount; i++) {
    const ss = _gSpecialStatusesHAF[i];
    ss.statLowered = 0;
    ss.lightningRodRedirected = 0;
    ss.restoredBattlerSprite = 0;
    ss.intimidatedMon = 0;
    ss.traced = 0;
    ss.ppNotAffectedByPressure = 0;
    ss.faintedHasReplacement = 0;
    ss.focusBanded = 0;
    ss.shellBellDmg = 0;
    ss.physicalDmg = 0;
    ss.specialDmg = 0;
    ss.physicalBattlerId = 0;
    ss.specialBattlerId = 0;
  }
}

// Imports HandleAction_TryFinish/NothingIsFainted/ActionFinished.
import {
  gBattleStruct as _gBattleStructHAF,
  gCurrentTurnActionNumber as _gCurrentTurnActionNumberHAF,
  gActionsByTurnOrder as _gActionsByTurnOrderHAF,
  gBattlerByTurnOrder as _gBattlerByTurnOrderHAF,
  gHitMarker as _gHitMarkerHAF,
  gLastLandedMoves as _gLastLandedMovesHAF,
  gLastHitByType as _gLastHitByTypeHAF,
  gSpecialStatuses as _gSpecialStatusesHAF,
  setBattleMoveDamage as setBattleMoveDamageHAR,
  setDynamicBasePower as setDynamicBasePowerHAR,
} from '../engine/battle/state';
import {
  HITMARKER_DESTINYBOND as _HITMARKER_DESTINYBOND_HAF,
  HITMARKER_IGNORE_SUBSTITUTE as _HITMARKER_IGNORE_SUBSTITUTE_HAF,
  HITMARKER_ATTACKSTRING_PRINTED as _HITMARKER_ATTACKSTRING_PRINTED_HAF,
  HITMARKER_NO_PPDEDUCT as _HITMARKER_NO_PPDEDUCT_HAF,
  HITMARKER_STATUS_ABILITY_EFFECT as _HITMARKER_STATUS_ABILITY_EFFECT_HAF,
  HITMARKER_IGNORE_ON_AIR as _HITMARKER_IGNORE_ON_AIR_HAF,
  HITMARKER_IGNORE_UNDERGROUND as _HITMARKER_IGNORE_UNDERGROUND_HAF,
  HITMARKER_IGNORE_UNDERWATER as _HITMARKER_IGNORE_UNDERWATER_HAF,
  HITMARKER_PASSIVE_HP_UPDATE as _HITMARKER_PASSIVE_HP_UPDATE_HAF,
  HITMARKER_OBEYS as _HITMARKER_OBEYS_HAF,
  HITMARKER_WAKE_UP_CLEAR as _HITMARKER_WAKE_UP_CLEAR_HAF,
  HITMARKER_SYNCHRONIZE_EFFECT as _HITMARKER_SYNCHRONIZE_EFFECT_HAF,
  HITMARKER_CHARGING as _HITMARKER_CHARGING_HAF,
  HITMARKER_NEVER_SET as _HITMARKER_NEVER_SET_HAF,
} from '../engine/battle/constants';

// NB : la table de dispatch d'actions 1:1 (`sTurnActionsFuncsTable`, battle_main.c:536) vit
// dans battle-turn-dispatch.ts (= le port de battle_main.c, là où vit aussi
// RunTurnActionsFunctions), qui importe les HandleAction_* DIRECTEMENT (imports ESM). On ne
// duplique donc PAS la table ici, et on n'expose plus de registre globalThis.__handleAction
// (l'ancien `handleActionTable` + le registre étaient des duplicatas morts — retirés, B6).

// ════════════════════════════════════════════════════════════════════════════
// TryRunFromBattle (battle_util.c:407-485) + IsRunningFromBattleImpossible
// (battle_main.c:4021-4084) — [fusion miroir 2026-06-12, ex-try-run-from-battle.ts]
// ════════════════════════════════════════════════════════════════════════════
import {
  gStatuses3,
  setBattleOutcome, setCurrentTurnActionNumber,
  setLastUsedItem, setPotentialItemEffectBattler,
} from '../engine/battle/state';
import {
  ABILITY_RUN_AWAY, ABILITY_SHADOW_TAG, ABILITY_ARENA_TRAP,
  ABILITY_LEVITATE, ABILITY_MAGNET_PULL,
  BATTLE_TYPE_FRONTIER, BATTLE_TYPE_TRAINER_HILL, BATTLE_TYPE_TRAINER,
  BATTLE_TYPE_LINK, BATTLE_TYPE_FIRST_BATTLE,
  B_OUTCOME_RAN,
  FLEE_ITEM, FLEE_ABILITY,
  PYRAMID_LOCATION_NONE,
  STATUS2_ESCAPE_PREVENTION, STATUS2_WRAPPED,
  STATUS3_ROOTED,
  TYPE_FLYING, TYPE_STEEL,
} from '../engine/battle/constants';
import { HOLD_EFFECT_CAN_ALWAYS_RUN } from '../engine/decomp-data/include/constants/hold_effects-data';
import { GetItemHoldEffect } from '../engine/battle/data/item-hold-effects';
import { ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER } from '../engine/battle/ability-battle-effects';

// ─── BATTLE_RUN_* return codes (= constants/battle.h) ──────────────────────

/** 1:1 décomp `BATTLE_RUN_SUCCESS` (= 0). */
export const BATTLE_RUN_SUCCESS = 0;
/** 1:1 décomp `BATTLE_RUN_FORBIDDEN` (= 1). Status (Bind/etc.), First Battle
 *  (= "Don't be a coward!") ; message direct. */
export const BATTLE_RUN_FORBIDDEN = 1;
/** 1:1 décomp `BATTLE_RUN_FAILURE` (= 2). Shadow Tag/Arena Trap/Magnet Pull
 *  block ; message via gBattleCommunication[MULTISTRING_CHOOSER]. */
export const BATTLE_RUN_FAILURE = 2;

/** 1:1 décomp `B_MSG_*` indices (include/constants/battle_string_ids.h:565-569).
 *  Ces valeurs indexent gNoEscapeStringIds[] (battle_message.c:900) :
 *  [0]=CANTESCAPE, [1]=DONTLEAVEBIRCH, [2]=PREVENTSESCAPE. */
const B_MSG_CANT_ESCAPE = 0;
const B_MSG_DONT_LEAVE_BIRCH = 1;
const B_MSG_PREVENTS_ESCAPE = 2;

/** 1:1 décomp `CurrentBattlePyramidLocation()` (battle_pyramid.c). Retourne
 *  PYRAMID_LOCATION_NONE quand on est pas dans la Battle Pyramid. */
function CurrentBattlePyramidLocation(): number {
  return PYRAMID_LOCATION_NONE;
}

/** 1:1 décomp `GetPyramidRunMultiplier()` (battle_pyramid.c). Return 100 par
 *  défaut (= rare hors Frontier). */
function GetPyramidRunMultiplier(): number {
  return 100;
}

/** Helper : check si un battler est de type donné. */
function IS_BATTLER_OF_TYPE(battler: number, type: number): boolean {
  const mon = gBattleMons[battler];
  return mon.type1 === type || mon.type2 === type;
}

/** 1:1 décomp `IsRunningFromBattleImpossible()` (battle_main.c:4021-4084).
 *
 *  Check si le battler ACTIF peut fuir le combat. Returns :
 *  - BATTLE_RUN_SUCCESS : fuite permise → caller appelle TryRunFromBattle
 *  - BATTLE_RUN_FAILURE : abilité opposite bloque (Shadow Tag/Arena Trap/
 *    Magnet Pull) → message via gBattleCommunication[MULTISTRING_CHOOSER]
 *  - BATTLE_RUN_FORBIDDEN : status/first battle bloque → message direct */
export function IsRunningFromBattleImpossible(): number {
  let holdEffect: number;
  let side: number;
  let i: number;

  // 1:1 décomp ll. 4027-4030 : check Enigma Berry vs normal hold effect.
  // Stub : on assume item normal (= ITEM_ENIGMA_BERRY pas porté).
  holdEffect = GetItemHoldEffect(gBattleMons[gActiveBattler].item);

  setPotentialItemEffectBattler(gActiveBattler);

  if (holdEffect === HOLD_EFFECT_CAN_ALWAYS_RUN) return BATTLE_RUN_SUCCESS;
  if (gBattleTypeFlags & BATTLE_TYPE_LINK) return BATTLE_RUN_SUCCESS;
  if (gBattleMons[gActiveBattler].ability === ABILITY_RUN_AWAY) return BATTLE_RUN_SUCCESS;

  side = GET_BATTLER_SIDE(gActiveBattler);

  // 1:1 décomp ll. 4043-4063 : check opponents abilities Shadow Tag / Arena Trap.
  for (i = 0; i < gBattlersCount; i++) {
    if (side !== GET_BATTLER_SIDE(i)
        && gBattleMons[i].ability === ABILITY_SHADOW_TAG) {
      gBattleScripting.battler = i;
      setLastUsedAbility(gBattleMons[i].ability);
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
      return BATTLE_RUN_FAILURE;
    }
    if (side !== GET_BATTLER_SIDE(i)
        && gBattleMons[gActiveBattler].ability !== ABILITY_LEVITATE
        && !IS_BATTLER_OF_TYPE(gActiveBattler, TYPE_FLYING)
        && gBattleMons[i].ability === ABILITY_ARENA_TRAP) {
      gBattleScripting.battler = i;
      setLastUsedAbility(gBattleMons[i].ability);
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
      return BATTLE_RUN_FAILURE;
    }
  }

  // 1:1 décomp ll. 4064-4071 : Magnet Pull vs Steel-type check.
  const magnetPullCheck = AbilityBattleEffects(
    ABILITYEFFECT_CHECK_FIELD_EXCEPT_BATTLER, gActiveBattler,
    ABILITY_MAGNET_PULL, 0, 0,
  );
  if (magnetPullCheck !== 0 && IS_BATTLER_OF_TYPE(gActiveBattler, TYPE_STEEL)) {
    gBattleScripting.battler = magnetPullCheck - 1;
    setLastUsedAbility(gBattleMons[magnetPullCheck - 1].ability);
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_PREVENTS_ESCAPE;
    return BATTLE_RUN_FAILURE;
  }

  // 1:1 décomp ll. 4072-4077 : status check (Wrap/Bind/Mean Look/Spider Web).
  if ((gBattleMons[gActiveBattler].status2 & (STATUS2_ESCAPE_PREVENTION | STATUS2_WRAPPED))
      || (gStatuses3[gActiveBattler] & STATUS3_ROOTED)) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_CANT_ESCAPE;
    return BATTLE_RUN_FORBIDDEN;
  }

  // 1:1 décomp ll. 4078-4082 : BIRCH TUTORIAL ⇒ "Don't be a coward!" message.
  if (gBattleTypeFlags & BATTLE_TYPE_FIRST_BATTLE) {
    gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DONT_LEAVE_BIRCH;
    return BATTLE_RUN_FORBIDDEN;
  }

  return BATTLE_RUN_SUCCESS;
}

/** 1:1 décomp `TryRunFromBattle(u8 battler)` (battle_util.c:407-485). */
export function TryRunFromBattle(battler: number): boolean {
  let effect = 0;
  let holdEffect: number;
  let pyramidMultiplier: number;
  let speedVar: number;

  // 1:1 décomp ll.414-417 : Enigma Berry test (stub - on assume item normal).
  holdEffect = GetItemHoldEffect(gBattleMons[battler].item);

  setPotentialItemEffectBattler(battler);

  if (holdEffect === HOLD_EFFECT_CAN_ALWAYS_RUN) {
    setLastUsedItem(gBattleMons[battler].item);
    gProtectStructs[battler].fleeType = FLEE_ITEM;
    effect++;
  } else if (gBattleMons[battler].ability === ABILITY_RUN_AWAY) {
    if (CurrentBattlePyramidLocation() !== PYRAMID_LOCATION_NONE) {
      gBattleStruct.runTries++;
      pyramidMultiplier = GetPyramidRunMultiplier();
      speedVar = Math.floor(
        (gBattleMons[battler].speed * pyramidMultiplier) /
        gBattleMons[BATTLE_OPPOSITE(battler)].speed
      ) + (gBattleStruct.runTries * 30);
      if (speedVar > (Random() & 0xFF)) {
        setLastUsedAbility(ABILITY_RUN_AWAY);
        gProtectStructs[battler].fleeType = FLEE_ABILITY;
        effect++;
      }
    } else {
      setLastUsedAbility(ABILITY_RUN_AWAY);
      gProtectStructs[battler].fleeType = FLEE_ABILITY;
      effect++;
    }
  } else if ((gBattleTypeFlags & (BATTLE_TYPE_FRONTIER | BATTLE_TYPE_TRAINER_HILL))
             && (gBattleTypeFlags & BATTLE_TYPE_TRAINER)) {
    effect++;
  } else {
    if (!(gBattleTypeFlags & BATTLE_TYPE_DOUBLE)) {
      if (CurrentBattlePyramidLocation() !== PYRAMID_LOCATION_NONE) {
        pyramidMultiplier = GetPyramidRunMultiplier();
        speedVar = Math.floor(
          (gBattleMons[battler].speed * pyramidMultiplier) /
          gBattleMons[BATTLE_OPPOSITE(battler)].speed
        ) + (gBattleStruct.runTries * 30);
        if (speedVar > (Random() & 0xFF)) effect++;
      } else if (gBattleMons[battler].speed < gBattleMons[BATTLE_OPPOSITE(battler)].speed) {
        speedVar = Math.floor(
          (gBattleMons[battler].speed * 128) /
          gBattleMons[BATTLE_OPPOSITE(battler)].speed
        ) + (gBattleStruct.runTries * 30);
        if (speedVar > (Random() & 0xFF)) effect++;
      } else {
        // same speed or faster
        effect++;
      }
    }

    gBattleStruct.runTries++;
  }

  if (effect !== 0) {
    setCurrentTurnActionNumber(gBattlersCount);
    setBattleOutcome(B_OUTCOME_RAN);
  }

  return effect !== 0;
}

// ─── CheckMoveLimitations + AreAllMovesUnusable (battle_util.c:1069-1151) ──────
//     [ex-engine/battle/move-limitations.ts, absorbé au miroir 2026-06-13]

/** 1:1 décomp `GetImprisonedMovesCount(battlerId, move)` (battle_util.c:1129-1151).
 *  Compte combien d'opposants ont Imprison + ce move. Lookup état via globalThis
 *  (__battleState) = anti-cycle ESM, comme dans l'original move-limitations.ts. */
function _GetImprisonedMovesCount(battlerId: number, move: number): number {
  let imprisonedMoves = 0;
  const stateMod = (globalThis as { __battleState?: { gBattlersCount?: number; gStatuses3?: number[]; gBattleMons?: { moves: number[] }[] } }).__battleState;
  const battlersCount = stateMod?.gBattlersCount ?? 2;
  const statuses3 = stateMod?.gStatuses3;
  const battleMons = stateMod?.gBattleMons;
  if (!statuses3 || !battleMons) return 0;
  // 1:1 décomp `GetBattlerSide(id)` = id & BIT_SIDE = id & 1.
  const battlerSide = battlerId & 1;
  for (let i = 0; i < battlersCount; i++) {
    if (battlerSide !== (i & 1) && (statuses3[i] & STATUS3_IMPRISONED_OTHERS)) {
      for (let j = 0; j < MAX_MON_MOVES; j++) {
        if (move === battleMons[i].moves[j]) { imprisonedMoves++; break; }
      }
    }
  }
  return imprisonedMoves;
}

/** 1:1 décomp `CheckMoveLimitations(battlerId, unusableMoves, check)` (battle_util.c:1069).
 *  Dette : ITEM_ENIGMA_BERRY path (Frontier) skippé → GetItemHoldEffect direct. */
export function CheckMoveLimitations(battlerId: number, unusableMoves: number, check: number): number {
  const holdEffect = GetItemHoldEffect(gBattleMons[battlerId].item);
  setPotentialItemEffectBattler(battlerId);

  for (let i = 0; i < MAX_MON_MOVES; i++) {
    const move = gBattleMons[battlerId].moves[i];
    // No move
    if (move === MOVE_NONE && (check & MOVE_LIMITATION_ZEROMOVE)) unusableMoves |= gBitTable[i];
    // No PP
    if (gBattleMons[battlerId].pp[i] === 0 && (check & MOVE_LIMITATION_PP)) unusableMoves |= gBitTable[i];
    // Disable
    if (move === gDisableStructs[battlerId].disabledMove && (check & MOVE_LIMITATION_DISABLED)) unusableMoves |= gBitTable[i];
    // Torment
    if (move === gLastMoves[battlerId] && (check & MOVE_LIMITATION_TORMENTED)
        && (gBattleMons[battlerId].status2 & STATUS2_TORMENT)) unusableMoves |= gBitTable[i];
    // Taunt
    if (gDisableStructs[battlerId].tauntTimer && (check & MOVE_LIMITATION_TAUNT)
        && getBattleMove(move).power === 0) unusableMoves |= gBitTable[i];
    // Imprison
    if (_GetImprisonedMovesCount(battlerId, move) && (check & MOVE_LIMITATION_IMPRISON)) unusableMoves |= gBitTable[i];
    // Encore
    if (gDisableStructs[battlerId].encoreTimer && gDisableStructs[battlerId].encoredMove !== move) unusableMoves |= gBitTable[i];
    // Choice Band
    if (holdEffect === HOLD_EFFECT_CHOICE_BAND
        && gBattleStruct.choicedMove[battlerId] !== MOVE_NONE
        && gBattleStruct.choicedMove[battlerId] !== MOVE_UNAVAILABLE
        && gBattleStruct.choicedMove[battlerId] !== move) unusableMoves |= gBitTable[i];
  }
  return unusableMoves;
}

/** 1:1 décomp `AreAllMovesUnusable()` (battle_util.c:1112-1127).
 *  Dette : gSelectionBattleScripts[NoMovesLeft] différé (UI selection). */
export function AreAllMovesUnusable(): boolean {
  const unusable = CheckMoveLimitations(gActiveBattler, 0, MOVE_LIMITATIONS_ALL);
  if (unusable === ALL_MOVES_MASK) {
    gProtectStructs[gActiveBattler].noValidMoves = 1;
    return true;
  } else {
    gProtectStructs[gActiveBattler].noValidMoves = 0;
    return false;
  }
}

// ─── K14b wire — auto-enregistrement sur globalThis (convention, cf ability-battle-
//     effects:985). La voie L action-selection appelle IsRunningFromBattleImpossible
//     au choix de FUITE (battle_main.c:4322-4351) via ce hook (évite le cycle ESM).
(globalThis as { IsRunningFromBattleImpossible?: () => number }).IsRunningFromBattleImpossible = IsRunningFromBattleImpossible;

// ════════════════════════════════════════════════════════════════════════════
// IsMonDisobedient (battle_util.c:3890-4015) — check de désobéissance des mons
// outsiders dépassant le niveau d'obéissance correspondant aux badges.
// [fusion miroir 2026-06-13, ex-engine/battle/disobedience.ts]
// ════════════════════════════════════════════════════════════════════════════

const _DIS_FLAG_BADGE02_GET = 'FLAG_BADGE02_GET';
const _DIS_FLAG_BADGE04_GET = 'FLAG_BADGE04_GET';
const _DIS_FLAG_BADGE06_GET = 'FLAG_BADGE06_GET';
const _DIS_FLAG_BADGE08_GET = 'FLAG_BADGE08_GET';

const _DIS_MOD = (a: number, b: number): number => ((a % b) + b) % b;

/** 1:1 décomp `IsBattlerModernFatefulEncounter(battler)` (battle_util.c:3890-3898).
 *  Web port : MON_DATA_MODERN_FATEFUL_ENCOUNTER déféré (pas d'anti-cheat) → always
 *  true sauf jamais (= seul un Mew/Deoxys illégal renverrait false). */
function _IsBattlerModernFatefulEncounter(battler: number): boolean {
  if (GET_BATTLER_SIDE(battler) === B_SIDE_OPPONENT) return true;
  const partyIdx = gBattlerPartyIndexes[battler];
  if (!gPlayerParty[partyIdx]) return true;
  const species = GetMonData(gPlayerParty[partyIdx], MON_DATA_SPECIES) as number;
  if (species !== SPECIES_MEW && species !== SPECIES_DEOXYS) return true;
  // MON_DATA_MODERN_FATEFUL_ENCOUNTER déféré (= pas pertinent web port).
  return true;
}

/** 1:1 décomp `IsOtherTrainer(u32 otId, u8 *otName)` (pokemon.c) : true si TID OU
 *  OT name diffèrent du joueur. Phase 1 single-tutorial : assume name match si TID
 *  match. */
function _IsOtherTrainer(otId: number, _otName: string): boolean {
  const playerTID = (gSaveBlock2Ptr.playerTrainerId ?? 0) >>> 0;
  if (playerTID !== (otId >>> 0)) return true;
  return false;
}

/** 1:1 décomp `FlagGet(flag)` — wired via script-vars (gameState.hasFlag). */
function _FlagGet(flagId: string): boolean {
  return FlagGet(flagId);
}

/** 1:1 décomp `CalculateBaseDamage(self, self, MOVE_POUND, 0, 40, 0, self, self)`
 *  (battle_util.c:4000) = self-hit 40-power typeless via le VRAI CalculateBaseDamage
 *  (burn-halving + badge boost), pas une formule simplifiée. */
function _calculateConfusionDamage(battler: number): number {
  return CalculateBaseDamage(
    gBattleMons[battler], gBattleMons[battler], MOVE_POUND, 0, 40, 0, battler, battler,
  ).damage;
}

export interface DisobedienceResult {
  /** 0 = OBEDIENT, 1 = IGNORED (= block all action), 2 = OTHER (= random thing). */
  retval: number;
  /** BattleScript label vers lequel sauter si pas obéissant. */
  jumpLabel: string | null;
}

/** 1:1 décomp `IsMonDisobedient()` (battle_util.c:3900-4015). */
export function IsMonDisobedient(_ctx: BattleScriptContext): DisobedienceResult {
  let obedienceLevel = 0;

  // 1:1 décomp : early-out checks.
  if (gBattleTypeFlags & (BATTLE_TYPE_LINK | BATTLE_TYPE_RECORDED_LINK)) {
    return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
  }
  if (GET_BATTLER_SIDE(gBattlerAttacker) === B_SIDE_OPPONENT) {
    return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
  }

  // 1:1 décomp : IsBattlerModernFatefulEncounter = only false if illegal Mew/Deoxys.
  if (_IsBattlerModernFatefulEncounter(gBattlerAttacker)) {
    // Frontier paths déférés : INGAME_PARTNER / FRONTIER / RECORDED / IsOtherTrainer.
    const mon = gBattleMons[gBattlerAttacker];
    if (!_IsOtherTrainer(mon.otId ?? 0, mon.otName ?? '')) {
      return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
    }
    if (_FlagGet(_DIS_FLAG_BADGE08_GET)) {
      return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
    }

    obedienceLevel = 10;
    if (_FlagGet(_DIS_FLAG_BADGE02_GET)) obedienceLevel = 30;
    if (_FlagGet(_DIS_FLAG_BADGE04_GET)) obedienceLevel = 50;
    if (_FlagGet(_DIS_FLAG_BADGE06_GET)) obedienceLevel = 70;
  }

  if (gBattleMons[gBattlerAttacker].level <= obedienceLevel) {
    return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
  }

  // First roll : test si le mon obéit malgré son niveau trop élevé.
  let rnd = Random() & 255;
  let calc = ((gBattleMons[gBattlerAttacker].level + obedienceLevel) * rnd) >>> 8;
  if (calc < obedienceLevel) {
    return { retval: DISOBEDIENCE_OBEDIENT, jumpLabel: null };
  }

  // Pas obéissant — break Rage if active.
  if (gCurrentMove === MOVE_RAGE) {
    gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_RAGE;
  }

  // Sleep + Snore/SleepTalk → ignored
  if ((gBattleMons[gBattlerAttacker].status1 & STATUS1_SLEEP)
      && (gCurrentMove === MOVE_SNORE || gCurrentMove === MOVE_SLEEP_TALK)) {
    return {
      retval: DISOBEDIENCE_IGNORED,
      jumpLabel: 'BattleScript_IgnoresWhileAsleep',
    };
  }

  // Second roll : type of disobedience.
  rnd = Random() & 255;
  calc = ((gBattleMons[gBattlerAttacker].level + obedienceLevel) * rnd) >>> 8;
  if (calc < obedienceLevel) {
    // Random move ou loaf si tous les moves indispo.
    const limitations = CheckMoveLimitations(gBattlerAttacker, 1 << gCurrMovePos, MOVE_LIMITATIONS_ALL);
    if (limitations === ALL_MOVES_MASK) {
      gBattleCommunication[MULTISTRING_CHOOSER] = _DIS_MOD(Random(), NUM_LOAF_STRINGS);
      return {
        retval: DISOBEDIENCE_IGNORED,
        jumpLabel: 'BattleScript_MoveUsedLoafingAround',
      };
    } else {
      // Random pick un autre move (1:1 décomp battle_util.c : do/while sans garde —
      // termine forcément car ce else-branch garantit limitations != ALL_MOVES_MASK,
      // donc au moins un slot de move est libre).
      do {
        const idx = _DIS_MOD(Random(), MAX_MON_MOVES);
        setCurrMovePos(idx);
        setChosenMovePos(idx);
      } while ((1 << gCurrMovePos) & limitations);

      const calledMove = gBattleMons[gBattlerAttacker].moves[gCurrMovePos];
      setCalledMove(calledMove);
      // 1:1 décomp : gBattlerTarget = GetMoveTarget(calledMove, NO_TARGET_OVERRIDE).
      setBattlerTarget(_GetMoveTarget(calledMove, NO_TARGET_OVERRIDE));
      setHitMarker(gHitMarker | HITMARKER_DISOBEDIENT_MOVE);
      return {
        retval: DISOBEDIENCE_OTHER,
        jumpLabel: 'BattleScript_IgnoresAndUsesRandomMove',
      };
    }
  } else {
    // Sleep / self-hit / loaf.
    obedienceLevel = gBattleMons[gBattlerAttacker].level - obedienceLevel;
    calc = Random() & 255;
    if (calc < obedienceLevel
        && !(gBattleMons[gBattlerAttacker].status1 & STATUS1_ANY)
        && gBattleMons[gBattlerAttacker].ability !== ABILITY_VITAL_SPIRIT
        && gBattleMons[gBattlerAttacker].ability !== ABILITY_INSOMNIA) {
      // Try to fall asleep.
      let i;
      for (i = 0; i < gBattlersCount; i++) {
        if (gBattleMons[i].status2 & STATUS2_UPROAR) break;
      }
      if (i === gBattlersCount) {
        return {
          retval: DISOBEDIENCE_IGNORED,
          jumpLabel: 'BattleScript_IgnoresAndFallsAsleep',
        };
      }
    }
    calc -= obedienceLevel;
    if (calc < obedienceLevel) {
      // Self-hit confusion-style damage.
      setBattleMoveDamage(_calculateConfusionDamage(gBattlerAttacker));
      setBattlerTarget(gBattlerAttacker);
      setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
      return {
        retval: DISOBEDIENCE_OTHER,
        jumpLabel: 'BattleScript_IgnoresAndHitsItself',
      };
    } else {
      gBattleCommunication[MULTISTRING_CHOOSER] = _DIS_MOD(Random(), NUM_LOAF_STRINGS);
      return {
        retval: DISOBEDIENCE_IGNORED,
        jumpLabel: 'BattleScript_MoveUsedLoafingAround',
      };
    }
  }
}

/** Helper glue pour Cmd_attackcanceler (= bridge du retour restructuré de
 *  IsMonDisobedient vers le modèle d'interpréteur ctx ; dissous dans Cmd_attackcanceler
 *  quand battle_script_commands.c sera migré). */
export function applyDisobedienceCheck(ctx: BattleScriptContext, opcodeStartPtr: number): boolean {
  const result = IsMonDisobedient(ctx);
  if (result.retval === DISOBEDIENCE_OBEDIENT) return false;

  // Push cursor + jump (= 1:1 décomp pattern).
  if (result.jumpLabel) {
    ctx.scriptPtrStack.push(opcodeStartPtr);
    const off = getBattleScriptOffset(result.jumpLabel);
    if (off >= 0) ctx.scriptPtr = off;
  }
  return true;
}

// ════════════════════════════════════════════════════════════════════════════
// AtkCanceler_UnableToUseMove (battle_util.c:1985-2270) — status checks au début
// de chaque move (sleep/freeze/paralysis/confusion/flinch/attract/truant/disable/
// taunt/imprison/bide/thaw). State machine gBattleStruct.atkCancelerTracker 0..14.
// [fusion miroir 2026-06-13, ex-engine/battle/atk-canceler.ts]
// ════════════════════════════════════════════════════════════════════════════

// ─── CANCELER_* enum (battle_util.c:1966-1983) — 1:1 décomp ──────────────
export const CANCELER_FLAGS      = 0;
export const CANCELER_ASLEEP     = 1;
export const CANCELER_FROZEN     = 2;
export const CANCELER_TRUANT     = 3;
export const CANCELER_RECHARGE   = 4;
export const CANCELER_FLINCH     = 5;
export const CANCELER_DISABLED   = 6;
export const CANCELER_TAUNTED    = 7;
export const CANCELER_IMPRISONED = 8;
export const CANCELER_CONFUSED   = 9;
export const CANCELER_PARALYZED  = 10;
export const CANCELER_IN_LOVE    = 11;
export const CANCELER_BIDE       = 12;
export const CANCELER_THAW       = 13;
export const CANCELER_END        = 14;

/** 1:1 décomp `UproarWakeUpCheck(battler)` (battle_script_commands.c:6804-6829).
 *  Check si un battler en STATUS2_UPROAR est dans le combat. Wake up le mon
 *  sleeping (= battler param) sauf si Soundproof. */
function _UproarWakeUpCheck(battler: number): boolean {
  const B_MSG_CANT_SLEEP_UPROAR = 0;
  const B_MSG_UPROAR_KEPT_AWAKE = 1;
  let i: number;
  for (i = 0; i < gBattlersCount; i++) {
    if (!(gBattleMons[i].status2 & STATUS2_UPROAR)
        || gBattleMons[battler].ability === ABILITY_SOUNDPROOF) {
      continue;
    }
    gBattleScripting.battler = i;
    // 1:1 décomp battle_script_commands.c:6815 : sentinel 0xFF = "target pas
    // encore set par un précédent move targeting".
    if (gBattlerTarget === 0xFF) {
      setBattlerTarget(i);
    } else if (gBattlerTarget === i) {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_CANT_SLEEP_UPROAR;
    } else {
      gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_UPROAR_KEPT_AWAKE;
    }
    break;
  }
  return i !== gBattlersCount;
}

/** 1:1 décomp `CountTrailingZeroBits(value)` (util.c). Position du LSB set.
 *  Pour STATUS2_INFATUATION : 0x10000 (bit 16) → return 0. */
function _CountTrailingZeroBits(value: number): number {
  if (value === 0) return 0;
  let count = 0;
  while ((value & 1) === 0) {
    count++;
    value >>>= 1;
  }
  return count;
}

export interface AtkCancelerResult {
  /** 0=move proceeds, 1=cancelled BS jump set, 2=cancelled + status1 sync needed. */
  effect: number;
  /** BattleScript label vers lequel sauter (= si effect != 0). */
  jumpLabel: string | null;
  /** Si true, le caller doit `ctx.scriptPtrStack.push(opcodeStartPtr)` avant jump
   *  (= BattleScriptPushCursor dans décomp). */
  pushCursor: boolean;
}

/** 1:1 décomp `AtkCanceler_UnableToUseMove()` (battle_util.c:1985-2270). */
export function AtkCanceler_UnableToUseMove(_ctx: BattleScriptContext): AtkCancelerResult {
  let effect = 0;
  let jumpLabel: string | null = null;
  let pushCursor = false;
  let bideDmgLocal = 0;

  let iterations = 0;
  const MAX_ITER = 64;

  while (iterations++ < MAX_ITER && gBattleStruct.atkCancelerTracker !== CANCELER_END && effect === 0) {
    switch (gBattleStruct.atkCancelerTracker) {
      case CANCELER_FLAGS:
        // 1:1 décomp : clear DESTINY_BOND + STATUS3_GRUDGE.
        gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_DESTINY_BOND;
        gStatuses3[gBattlerAttacker] &= ~STATUS3_GRUDGE;
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_ASLEEP:
        if (gBattleMons[gBattlerAttacker].status1 & STATUS1_SLEEP) {
          if (_UproarWakeUpCheck(gBattlerAttacker)) {
            gBattleMons[gBattlerAttacker].status1 &= ~STATUS1_SLEEP;
            gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_NIGHTMARE;
            pushCursor = true;
            gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WOKE_UP_UPROAR;
            jumpLabel = 'BattleScript_MoveUsedWokeUp';
            effect = 2;
          } else {
            // 1:1 décomp : Early Bird ability → 2x sleep counter decrement.
            const toSub = gBattleMons[gBattlerAttacker].ability === ABILITY_EARLY_BIRD ? 2 : 1;
            if ((gBattleMons[gBattlerAttacker].status1 & STATUS1_SLEEP) < toSub) {
              gBattleMons[gBattlerAttacker].status1 &= ~STATUS1_SLEEP;
            } else {
              gBattleMons[gBattlerAttacker].status1 -= toSub;
            }
            if (gBattleMons[gBattlerAttacker].status1 & STATUS1_SLEEP) {
              // Still asleep
              if (gCurrentMove !== MOVE_SNORE && gCurrentMove !== MOVE_SLEEP_TALK) {
                jumpLabel = 'BattleScript_MoveUsedIsAsleep';
                setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
                effect = 2;
              }
            } else {
              // Just woke up
              gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_NIGHTMARE;
              pushCursor = true;
              gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_WOKE_UP;
              jumpLabel = 'BattleScript_MoveUsedWokeUp';
              effect = 2;
            }
          }
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_FROZEN:
        if (gBattleMons[gBattlerAttacker].status1 & STATUS1_FREEZE) {
          if (Random() % 5) {
            // 1:1 décomp : 80% chance stay frozen.
            if (getBattleMove(gCurrentMove).effect !== EFFECT_THAW_HIT) {
              jumpLabel = 'BattleScript_MoveUsedIsFrozen';
              setHitMarker(gHitMarker | HITMARKER_NO_ATTACKSTRING);
            } else {
              // EFFECT_THAW_HIT = unfreeze via move effect happens in CANCELER_THAW.
              gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
              break;
            }
          } else {
            // 20% chance unfreeze.
            gBattleMons[gBattlerAttacker].status1 &= ~STATUS1_FREEZE;
            pushCursor = true;
            jumpLabel = 'BattleScript_MoveUsedUnfroze';
            gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DEFROSTED;
          }
          effect = 2;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_TRUANT:
        if (gBattleMons[gBattlerAttacker].ability === ABILITY_TRUANT
            && gDisableStructs[gBattlerAttacker].truantCounter) {
          // 1:1 décomp : CancelMultiTurnMoves + Loafing.
          _CancelMultiTurnMoves(gBattlerAttacker);
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_LOAFING;
          jumpLabel = 'BattleScript_MoveUsedLoafingAround';
          setMoveResultFlags(gMoveResultFlags | MOVE_RESULT_MISSED);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_RECHARGE:
        if (gBattleMons[gBattlerAttacker].status2 & STATUS2_RECHARGE) {
          gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_RECHARGE;
          gDisableStructs[gBattlerAttacker].rechargeTimer = 0;
          _CancelMultiTurnMoves(gBattlerAttacker);
          jumpLabel = 'BattleScript_MoveUsedMustRecharge';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_FLINCH:
        if (gBattleMons[gBattlerAttacker].status2 & STATUS2_FLINCHED) {
          gBattleMons[gBattlerAttacker].status2 &= ~STATUS2_FLINCHED;
          gProtectStructs[gBattlerAttacker].flinchImmobility = 1;
          _CancelMultiTurnMoves(gBattlerAttacker);
          jumpLabel = 'BattleScript_MoveUsedFlinched';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_DISABLED:
        if (gDisableStructs[gBattlerAttacker].disabledMove === gCurrentMove
            && gDisableStructs[gBattlerAttacker].disabledMove !== 0 /* MOVE_NONE */) {
          gProtectStructs[gBattlerAttacker].usedDisabledMove = 1;
          gBattleScripting.battler = gBattlerAttacker;
          _CancelMultiTurnMoves(gBattlerAttacker);
          jumpLabel = 'BattleScript_MoveUsedIsDisabled';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_TAUNTED:
        if (gDisableStructs[gBattlerAttacker].tauntTimer
            && getBattleMove(gCurrentMove).power === 0) {
          gProtectStructs[gBattlerAttacker].usedTauntedMove = 1;
          _CancelMultiTurnMoves(gBattlerAttacker);
          jumpLabel = 'BattleScript_MoveUsedIsTaunted';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_IMPRISONED:
        if (_GetImprisonedMovesCount(gBattlerAttacker, gCurrentMove)) {
          gProtectStructs[gBattlerAttacker].usedImprisonedMove = 1;
          _CancelMultiTurnMoves(gBattlerAttacker);
          jumpLabel = 'BattleScript_MoveUsedIsImprisoned';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_CONFUSED:
        if (gBattleMons[gBattlerAttacker].status2 & STATUS2_CONFUSION) {
          // 1:1 décomp : decrement confusion counter via STATUS2_CONFUSION_TURN(1).
          gBattleMons[gBattlerAttacker].status2 -= STATUS2_CONFUSION_TURN(1);
          if (gBattleMons[gBattlerAttacker].status2 & STATUS2_CONFUSION) {
            // Still confused
            if (Random() & 1) {
              // No confusion damage this turn — pre-push BattleScript.
              gBattleCommunication[MULTISTRING_CHOOSER] = 0;  // FALSE
              pushCursor = true;
            } else {
              // Confusion self-hit
              gBattleCommunication[MULTISTRING_CHOOSER] = 1;  // TRUE
              setBattlerTarget(gBattlerAttacker);
              setBattleMoveDamage(_calculateConfusionDamage(gBattlerAttacker));
              gProtectStructs[gBattlerAttacker].confusionSelfDmg = 1;
              setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
            }
            jumpLabel = 'BattleScript_MoveUsedIsConfused';
          } else {
            // Snapped out of confusion
            pushCursor = true;
            jumpLabel = 'BattleScript_MoveUsedIsConfusedNoMore';
          }
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_PARALYZED:
        // 1:1 décomp Em : `CancelMultiTurnMoves` retiré (= bug fix Em vs RS).
        if ((gBattleMons[gBattlerAttacker].status1 & STATUS1_PARALYSIS)
            && (Random() % 4) === 0) {
          gProtectStructs[gBattlerAttacker].prlzImmobility = 1;
          jumpLabel = 'BattleScript_MoveUsedIsParalyzed';
          setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_IN_LOVE:
        if (gBattleMons[gBattlerAttacker].status2 & STATUS2_INFATUATION) {
          // 1:1 décomp : battler ID stocké dans bits 16-23 de status2.
          gBattleScripting.battler = _CountTrailingZeroBits(
            (gBattleMons[gBattlerAttacker].status2 & STATUS2_INFATUATION) >>> 0x10
          );
          if (Random() & 1) {
            pushCursor = true;
          } else {
            // 1:1 décomp : BattleScriptPush(BattleScript_MoveUsedIsInLoveCantAttack)
            // (= STACKED, pas la principal jump). Notre port : on indique au caller.
            // Le caller doit faire 2 pushes : opcodeStartPtr + InLoveCantAttack.
            jumpLabel = 'BattleScript_MoveUsedIsInLove__withCantAttack';  // sentinel
            setHitMarker(gHitMarker | HITMARKER_UNABLE_TO_USE_MOVE);
            gProtectStructs[gBattlerAttacker].loveImmobility = 1;
            _CancelMultiTurnMoves(gBattlerAttacker);
          }
          if (jumpLabel !== 'BattleScript_MoveUsedIsInLove__withCantAttack') {
            jumpLabel = 'BattleScript_MoveUsedIsInLove';
          }
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_BIDE:
        if (gBattleMons[gBattlerAttacker].status2 & STATUS2_BIDE) {
          gBattleMons[gBattlerAttacker].status2 -= STATUS2_BIDE_TURN(1);
          if (gBattleMons[gBattlerAttacker].status2 & STATUS2_BIDE) {
            jumpLabel = 'BattleScript_BideStoringEnergy';
          } else {
            // Bide release
            if (gBideDmg[gBattlerAttacker]) {
              setCurrentMove(MOVE_BIDE);
              bideDmgLocal = gBideDmg[gBattlerAttacker] * 2;
              gBattleScripting.bideDmg = bideDmgLocal;
              setBattlerTarget(gBideTarget[gBattlerAttacker]);
              if (gAbsentBattlerFlags & (1 << gBattlerTarget)) {
                // 1:1 décomp battle_util.c AtkCanceler CANCELER_BIDE :
                // `gBattlerTarget = GetMoveTarget(MOVE_BIDE, MOVE_TARGET_SELECTED + 1);`
                // = repick target alive (= rare case Bide vs fainted target).
                setBattlerTarget(_GetMoveTarget(MOVE_BIDE, MOVE_TARGET_SELECTED + 1));
              }
              jumpLabel = 'BattleScript_BideAttack';
            } else {
              jumpLabel = 'BattleScript_BideNoEnergyToAttack';
            }
          }
          effect = 1;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_THAW:
        if (gBattleMons[gBattlerAttacker].status1 & STATUS1_FREEZE) {
          if (getBattleMove(gCurrentMove).effect === EFFECT_THAW_HIT) {
            gBattleMons[gBattlerAttacker].status1 &= ~STATUS1_FREEZE;
            pushCursor = true;
            jumpLabel = 'BattleScript_MoveUsedUnfroze';
            gBattleCommunication[MULTISTRING_CHOOSER] = B_MSG_DEFROSTED_BY_MOVE;
          }
          effect = 2;
        }
        gBattleStruct.atkCancelerTracker = gBattleStruct.atkCancelerTracker + 1;
        break;

      case CANCELER_END:
        break;
    }
  }

  // 1:1 décomp : `if (effect == 2)` → emit SetMonData REQUEST_STATUS_BATTLE.
  // Notre port : signal au caller via `effect=2`. EmitSetMonData status1 sync
  // wired via batch C bridge.
  return { effect, jumpLabel, pushCursor };
}

/** 1:1 décomp `CancelMultiTurnMoves(battler)` (battle_util.c:864-875). */
function _CancelMultiTurnMoves(battler: number): void {
  // 1:1 décomp battle.h:132,135,137,139,178.
  const STATUS2_MULTIPLETURNS = 1 << 12;             // 0x1000 (= 1<<12)
  const STATUS2_LOCK_CONFUSE  = (1 << 10) | (1 << 11); // 0xC00
  const STATUS2_UPROAR_LOCAL  = (1 << 4) | (1 << 5) | (1 << 6); // 0x70
  const STATUS2_BIDE_LOCAL    = (1 << 8) | (1 << 9); // 0x300
  // 1:1 décomp : STATUS3_SEMI_INVULNERABLE = ON_AIR(1<<6) | UNDERGROUND(1<<7) | UNDERWATER(1<<18)
  const STATUS3_SEMI_INVULNERABLE_LOCAL = (1 << 6) | (1 << 7) | (1 << 18); // 0x400C0
  gBattleMons[battler].status2 &= ~STATUS2_MULTIPLETURNS;
  gBattleMons[battler].status2 &= ~STATUS2_LOCK_CONFUSE;
  gBattleMons[battler].status2 &= ~STATUS2_UPROAR_LOCAL;
  gBattleMons[battler].status2 &= ~STATUS2_BIDE_LOCAL;
  gStatuses3[battler] &= ~STATUS3_SEMI_INVULNERABLE_LOCAL;
  gDisableStructs[battler].rolloutTimer = 0;
  gDisableStructs[battler].furyCutterCounter = 0;
}

/** Helper glue pour Cmd_attackcanceler : wire AtkCanceler dans le script flow
 *  (= bridge du retour restructuré vers le modèle d'interpréteur ctx ; dissous
 *  dans Cmd_attackcanceler quand battle_script_commands.c sera migré). Retourne
 *  true si le caller doit return immédiat (= AtkCanceler a set le jump). */
export function applyAtkCanceler(ctx: BattleScriptContext, opcodeStartPtr: number): boolean {
  const result = AtkCanceler_UnableToUseMove(ctx);
  if (result.effect === 0) return false;  // continue normally

  if (result.pushCursor) {
    ctx.scriptPtrStack.push(opcodeStartPtr);
  }
  if (result.jumpLabel) {
    // Handle sentinel pour CANCELER_IN_LOVE avec double push.
    if (result.jumpLabel === 'BattleScript_MoveUsedIsInLove__withCantAttack') {
      const offCantAttack = getBattleScriptOffset('BattleScript_MoveUsedIsInLoveCantAttack');
      const offInLove = getBattleScriptOffset('BattleScript_MoveUsedIsInLove');
      if (offCantAttack >= 0) ctx.scriptPtrStack.push(offCantAttack);
      if (offInLove >= 0) ctx.scriptPtr = offInLove;
    } else {
      const off = getBattleScriptOffset(result.jumpLabel);
      if (off >= 0) ctx.scriptPtr = off;
    }
  }
  return true;
}

/** Reset le tracker pour un nouveau move. Appelé par battle setup entre 2 attacks. */
export function resetAtkCancelerTracker(): void {
  gBattleStruct.atkCancelerTracker = 0;
}
