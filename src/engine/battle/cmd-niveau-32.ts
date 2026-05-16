/**
 * battle/cmd-niveau-32.ts — Phase 1 Niveau 32 (learn move / party / handle ball) — 7 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x50 openpartyscreen           (6 bytes — party screen state machine, 1:1 single-battle)
 *   0x51 switchhandleorder         (3 bytes — switch order state machine 4 cases, 1:1)
 *   0x59 handlelearnnewmove        (10 bytes — try teach new move, 1:1)
 *   0x5A yesnoboxlearnmove         (5 bytes — yes/no learn move 7 cases state machine)
 *   0x5B yesnoboxstoplearningmove  (5 bytes — yes/no stop learning 2 cases)
 *   0x6C drawlvlupbox              (1 byte — level-up stats box 11 cases state machine)
 *   0xEF handleballthrow           (1 byte — Pokéball capture state machine, 1:1)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *
 *  Note : ces opcodes sont des state machines UI lourdes (party screen, yesno
 *  box, palette fade, naming screen, ball anim). Port 1:1 strict du squelette
 *  state machine (sessions 142 batches D+E + cleanup rounds), les rendering UI
 *  fns (HandleBattleWindow, BattlePutTextOnWindow, etc.) sont wired comme stubs
 *  Phase 1.4 qui retournent done instant (= state advance immédiat). */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord } from './script-interpreter';
import {
  gBattleMons, setActiveBattler,
  gBattleTypeFlags,
  gBattleControllerExecFlags,
  gBattleStruct as _gBattleStruct32,
  gBattlerPartyIndexes as _gBattlerPartyIndexes_32,
} from './state';
import {
  MOVE_NONE,
  STATUS2_TRANSFORMED,
  BATTLE_TYPE_DOUBLE,
} from './constants';
import { GetBattlerAtPosition, B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT } from './util';
import {
  gBattleTextBuff1 as _gBattleTextBuff1_HBT,
  gBattleTextBuff2 as _gBattleTextBuff2_HBT,
  PREPARE_SPECIES_BUFFER,
  PREPARE_MON_NICK_BUFFER,
} from './text-buffers';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _stayOnOpcode(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// 1:1 décomp `static u8 sLearningMoveTableID` (pokemon.c:155-ish).
// État persistant entre Cmd_handlelearnnewmove successifs.
let _sLearningMoveTableID = 0;

/** 1:1 décomp `MonTryLearningNewMove(mon, firstMove)` (pokemon.c:3015-3045).
 *  Iterate gLevelUpLearnsets[species] depuis sLearningMoveTableID, set gMoveToLearn
 *  pour le premier match level, et GiveMoveToMon. Retourne :
 *   - MOVE_NONE : aucun nouveau move à apprendre
 *   - MON_HAS_MAX_MOVES : 4 moves déjà connus
 *   - MON_ALREADY_KNOWS_MOVE : move déjà connu, caller doit reboucler
 *   - retour de GiveMoveToMon : move appris.
 *
 *  Source learnset : (globalThis.__game_data).getLevelUpLearnset(SPECIES_X). */
function _monTryLearningNewMove(_battlerIdx: number, firstMove: number): number {
  const partyIdx = _gBattleStruct32.expGetterMonId ?? 0;
  // 1:1 décomp : `&gPlayerParty[gBattleStruct->expGetterMonId]`. Notre port :
  // gameState.party[partyIdx] (= PokemonInstance avec speciesId/level/moves).
  const gs = (globalThis as { gameState?: { party?: Array<{
    speciesId?: number; speciesEnum?: string; level?: number;
    moves?: Array<{ id?: string; pp?: number }>;
  }> } }).gameState;
  const mon = gs?.party?.[partyIdx];
  if (!mon) return MOVE_NONE;

  // 1:1 décomp : species + level depuis MON_DATA_SPECIES / MON_DATA_LEVEL.
  const speciesNum = mon.speciesId ?? 0;
  const level = mon.level ?? 1;
  // Resolve species enum (= SPECIES_TREECKO) via globalThis cache si number,
  // ou directement speciesEnum si déjà string.
  let enumKey = mon.speciesEnum;
  if (!enumKey) {
    const cache = (globalThis as { gameDataSpeciesNumToEnum?: Record<number, string> }).gameDataSpeciesNumToEnum;
    enumKey = cache?.[speciesNum] ?? `SPECIES_${speciesNum}`;
  }
  // Lookup learnset depuis bridge globalThis (= populé au boot par game-data.ts).
  const learnsets = (globalThis as { gameDataLevelUpLearnsets?: Record<string, Array<{ level: number; move: string }>> }).gameDataLevelUpLearnsets;
  const learnset = learnsets?.[enumKey];
  if (!learnset || learnset.length === 0) return MOVE_NONE;

  // 1:1 décomp pokemon.c:3025-3034 : if firstMove → reset sLearningMoveTableID
  // et skip jusqu'au premier entry à level == mon.level.
  if (firstMove) {
    _sLearningMoveTableID = 0;
    while (_sLearningMoveTableID < learnset.length
           && learnset[_sLearningMoveTableID].level !== level) {
      _sLearningMoveTableID++;
    }
    if (_sLearningMoveTableID >= learnset.length) return MOVE_NONE;
  }

  // 1:1 décomp pokemon.c:3037-3042 : check entry courante à ce level
  // (sinon return MOVE_NONE = "no more moves at this level").
  if (_sLearningMoveTableID >= learnset.length
      || learnset[_sLearningMoveTableID].level !== level) {
    return MOVE_NONE;
  }

  // Resolve move name → moveId via constants moves-data (= MOVE_POUND = 1, etc.).
  const moveName = learnset[_sLearningMoveTableID].move;  // ex. "MOVE_POUND"
  const moveId = (globalThis as Record<string, unknown>)[moveName] as number | undefined ?? 0;

  // 1:1 décomp : `gMoveToLearn = ...` set le global pour Cmd_buffermovetolearn.
  const setM = (globalThis as { __battleStateMutators?: { setMoveToLearn?: (v: number) => void } })
    .__battleStateMutators?.setMoveToLearn;
  if (setM) setM(moveId);
  _sLearningMoveTableID++;

  // 1:1 décomp : retval = GiveMoveToMon(mon, gMoveToLearn). GiveMoveToMon
  // retourne :
  //   - MOVE_NONE (= ne devrait pas arriver ici, mais safety)
  //   - MON_HAS_MAX_MOVES (0xFFFF) si 4 slots full
  //   - MON_ALREADY_KNOWS_MOVE (0xFFFE) si move déjà dans party
  //   - moveId si appris dans slot vide.
  const moves = mon.moves ?? [];
  const moveIdLower = moveName.replace(/^MOVE_/, '').toLowerCase();
  const alreadyKnows = moves.some(m => m?.id === moveIdLower);
  if (alreadyKnows) return 0xFFFE /* MON_ALREADY_KNOWS_MOVE */;
  // Find empty slot. Notre party format : moves is array de {id, pp}.
  for (let i = 0; i < 4; i++) {
    if (!moves[i] || !moves[i].id) {
      // Insert dans le slot vide.
      moves[i] = { id: moveIdLower, pp: 35 /* default PP, will be overwritten */ };
      return moveId;
    }
  }
  return 0xFFFF /* MON_HAS_MAX_MOVES */;
}

const MON_HAS_MAX_MOVES = 0xFFFF;

/** 1:1 stub `GiveMoveToBattleMon(battleMon, move)` (battle_util.c).
 *  Insère move dans le premier slot vide. */
function _giveMoveToBattleMon(battlerIdx: number, move: number): void {
  const mon = gBattleMons[battlerIdx];
  for (let i = 0; i < 4; i++) {
    if (mon.moves[i] === MOVE_NONE) {
      mon.moves[i] = move;
      break;
    }
  }
}

// ─── 0x50 openpartyscreen ─────────────────────────────────────────────────

/** 1:1 décomp Cmd_openpartyscreen (battle_script_commands.c:4868-5147).
 *  6 bytes : opcode + u8 battler + u32 ptr.
 *
 *  Sous-paths :
 *   - BS_FAINTED_LINK_MULTIPLE_1/2 : multi link battle complex paths — Phase 1.4 deferred.
 *   - BS_ATTACKER / BS_TARGET / BS_ANY (single battle) : open party menu pour
 *     forced switch. Port 1:1 strict de cette branche.
 *
 *  Single battle path 1:1 décomp (5099-5147) :
 *    1. Determine caseId via PARTY_SCREEN_OPTIONAL flag.
 *    2. Resolve battler.
 *    3. Si already faintedHasReplacement → advance 6 bytes.
 *    4. Si HasNoMonsToSwitch → set absent + jump à jumpPtr.
 *    5. Sinon → init monToSwitchIntoId = PARTY_SIZE (= no choice) +
 *       Emit ChoosePokemon + Mark + increment playerSwitchesCounter. */
function Cmd_openpartyscreen(ctx: BattleScriptContext): boolean {
  const battlerArg = readByte(ctx);
  const jumpPtr = readWord(ctx);

  // PARTY_SCREEN_OPTIONAL = 0x80 (= bit 7 of battler arg).
  const PARTY_SCREEN_OPTIONAL = 0x80;
  const isOptional = (battlerArg & PARTY_SCREEN_OPTIONAL) !== 0;
  const battlerArgClean = battlerArg & ~PARTY_SCREEN_OPTIONAL;

  // BS_FAINTED_LINK_MULTIPLE_1 / _2 : multi link battle (= 0x09 / 0x0A).
  // Pour Phase 1, on traite single-battle. Multi cases : just advance.
  if (battlerArgClean === 0x09 || battlerArgClean === 0x0A) {
    // Frontier multi link battle path — deferred post Phase 1.
    return false;
  }

  // Single battle path : resolve battler.
  const bs = (globalThis as { __battleState?: {
    gBattlerAttacker?: number;
    gBattlerTarget?: number;
    gBattlerFainted?: number;
    gAbsentBattlerFlags?: number;
    gHitMarker?: number;
    gSpecialStatuses?: Array<{ faintedHasReplacement?: boolean | number }>;
    gBattlerPartyIndexes?: number[];
    gBattleResults?: { playerSwitchesCounter?: number };
    gPlayerParty?: Array<{ species?: number; hp?: number }>;
    gEnemyParty?: Array<{ species?: number; hp?: number }>;
  } }).__battleState;
  if (!bs) return false;

  let battler = battlerArgClean;
  if (battlerArgClean === 0) battler = bs.gBattlerTarget ?? 0;
  else if (battlerArgClean === 1) battler = bs.gBattlerAttacker ?? 0;
  else if (battlerArgClean === 0x08 /* BS_FAINTED */) battler = bs.gBattlerFainted ?? 0;
  // Sinon raw battler index.

  // 1:1 décomp 5105-5107 : si déjà replacement, advance.
  const ss = bs.gSpecialStatuses?.[battler];
  if (ss?.faintedHasReplacement) {
    return false;
  }

  // 1:1 décomp 5109-5115 : HasNoMonsToSwitch → set absent + jump.
  const hasNone = _hasNoMonsToSwitch_HBT(battler, 6, 6);
  if (hasNone) {
    setActiveBattler(battler);
    if (bs.gAbsentBattlerFlags !== undefined && bs.gHitMarker !== undefined) {
      const bit = 1 << battler;
      bs.gAbsentBattlerFlags = bs.gAbsentBattlerFlags | bit;
      // Clear HITMARKER_FAINTED(battler) = (1 << (battler + 28)).
      bs.gHitMarker = bs.gHitMarker & ~(1 << (battler + 28));
    }
    ctx.scriptPtr = jumpPtr;
    return false;
  }

  // 1:1 décomp 5117-5126 : init monToSwitchIntoId = PARTY_SIZE + emit ChoosePokemon.
  setActiveBattler(battler);
  if (_gBattleStruct32.battlerPartyIndexes) {
    _gBattleStruct32.battlerPartyIndexes[battler] = bs.gBattlerPartyIndexes?.[battler] ?? 0;
  }
  if (_gBattleStruct32.monToSwitchIntoId) {
    _gBattleStruct32.monToSwitchIntoId[battler] = 6 /* PARTY_SIZE */;
  }
  // 1:1 décomp : gBattleStruct.field_93 &= ~bit (= bitmask de battlers traités,
  // rare debug tracking deferred).
  // UI Phase 1.4 deferred : BtlController_EmitChoosePokemon (= ouvre party menu UI).
  void isOptional;  // hitmarkerFaintBits = isOptional ? CHOOSE_MON : SEND_OUT.

  // 1:1 décomp : si player_left active, increment playerSwitchesCounter.
  if (battler === 0 && bs.gBattleResults && (bs.gBattleResults.playerSwitchesCounter ?? 0) < 255) {
    bs.gBattleResults.playerSwitchesCounter = (bs.gBattleResults.playerSwitchesCounter ?? 0) + 1;
  }
  return false;
}

/** 1:1 stub `HasNoMonsToSwitch(battler, partyIdBattlerOn1, partyIdBattlerOn2)`
 *  (battle_util.c). Retourne TRUE si pas de mon disponible. */
function _hasNoMonsToSwitch_HBT(battler: number, _p1: number, _p2: number): boolean {
  const bs = (globalThis as { __battleState?: {
    gBattlerPartyIndexes?: number[];
    gPlayerParty?: Array<{ species?: number; hp?: number; isEgg?: number }>;
    gEnemyParty?: Array<{ species?: number; hp?: number; isEgg?: number }>;
  } }).__battleState;
  if (!bs) return true;
  const side = battler & 1;  // 0 player, 1 opponent.
  const party = side === 0 ? bs.gPlayerParty : bs.gEnemyParty;
  if (!party) return true;
  const curSlot = bs.gBattlerPartyIndexes?.[battler] ?? 0;
  for (let i = 0; i < 6; i++) {
    if (i === curSlot) continue;
    const mon = party[i];
    if (mon?.species && (mon.hp ?? 0) > 0 && !mon.isEgg) return false;
  }
  return true;
}

// ─── 0x51 switchhandleorder ───────────────────────────────────────────────

/** 1:1 décomp Cmd_switchhandleorder (battle_script_commands.c:5155-5220).
 *  3 bytes (u8 battler + u8 caseId). 4 cases :
 *   0 : commit chosen mons from gBattleBufferB (= player choice). Notre port :
 *       pas de gBattleBufferB en battle, on lit monToSwitchIntoId déjà setté.
 *   1 : SwitchPartyOrder pour single battle (= swap party slots indices).
 *   2 : same que 3 + record action (= replay tracking, no-op single).
 *   3 : update gBattleCommunication[0] + monToSwitchIntoId + SwitchPartyOrder
 *       + PREPARE_SPECIES_BUFFER + PREPARE_MON_NICK_BUFFER. */
function Cmd_switchhandleorder(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  const battlerArg = readByte(ctx);
  const caseId = readByte(ctx);
  const active = (globalThis as { __battleStateMutators?: { setAttacker?: (v: number) => void } })
    .__battleStateMutators; void active;
  // Resolve active battler via getBattlerForBattleScript équivalent.
  // Pour single battle, BS_ATTACKER (1) = gBattlerAttacker, BS_TARGET (0) = gBattlerTarget.
  let activeBattler = battlerArg;
  const bs = (globalThis as { __battleState?: {
    gBattlerAttacker?: number; gBattlerTarget?: number;
    gBattlerPartyIndexes?: number[];
    gBattleMons?: Array<{ species?: number }>;
    gBattleCommunication?: number[];
  } }).__battleState;
  if (battlerArg === 0 && bs?.gBattlerTarget !== undefined) activeBattler = bs.gBattlerTarget;
  else if (battlerArg === 1 && bs?.gBattlerAttacker !== undefined) activeBattler = bs.gBattlerAttacker;
  setActiveBattler(activeBattler);

  switch (caseId) {
    case 0:
      // 1:1 décomp : for each battler, if buffer[0] == CONTROLLER_CHOSENMONRETURNVALUE,
      // copy buffer[1] to gBattleStruct.monToSwitchIntoId[i].
      // Notre port : no-op (= buffer pas wired, monToSwitchIntoId déjà setté
      // par Cmd_openpartyscreen ou ChooseMonToSendOut).
      break;
    case 1:
      // 1:1 décomp : SwitchPartyOrder pour single battle (battle_main.c:4086).
      // Notre port : swap les partyIndexes via _switchPartyOrderHBT (helper local).
      _switchPartyOrderHBT(activeBattler);
      break;
    case 2:
    case 3:
      // 1:1 décomp : update gBattleCommunication[0] + monToSwitchIntoId.
      // Notre port : monToSwitchIntoId est déjà setté ; on retain le slot.
      if (bs?.gBattleCommunication && _gBattleStruct32.monToSwitchIntoId) {
        const slot = _gBattleStruct32.monToSwitchIntoId[activeBattler] ?? 0;
        bs.gBattleCommunication[0] = slot;
      }
      _switchPartyOrderHBT(activeBattler);
      // 1:1 décomp : PREPARE_SPECIES_BUFFER + PREPARE_MON_NICK_BUFFER.
      if (bs?.gBattleMons && bs.gBattlerAttacker !== undefined) {
        const attacker = bs.gBattlerAttacker;
        PREPARE_SPECIES_BUFFER(_gBattleTextBuff1_HBT, bs.gBattleMons[attacker]?.species ?? 0);
      }
      if (bs?.gBattlerPartyIndexes && _gBattleStruct32.monToSwitchIntoId) {
        PREPARE_MON_NICK_BUFFER(_gBattleTextBuff2_HBT, activeBattler,
          _gBattleStruct32.monToSwitchIntoId[activeBattler] ?? 0);
      }
      break;
    default:
      break;
  }
  return false;
}

/** 1:1 décomp `SwitchPartyOrder(battler)` (battle_main.c:4086-4113).
 *  Swap party slot du battler vers monToSwitchIntoId. Phase 1 simplified :
 *  on swap les indices dans gBattlerPartyIndexes (= notre party-storage). */
function _switchPartyOrderHBT(battler: number): void {
  const bs = (globalThis as { __battleState?: {
    gBattlerPartyIndexes?: number[];
  } }).__battleState;
  if (!bs?.gBattlerPartyIndexes || !_gBattleStruct32.monToSwitchIntoId) return;
  const newSlot = _gBattleStruct32.monToSwitchIntoId[battler];
  if (typeof newSlot === 'number' && newSlot >= 0 && newSlot < 6) {
    bs.gBattlerPartyIndexes[battler] = newSlot;
  }
}

// ─── 0x59 handlelearnnewmove ──────────────────────────────────────────────

/** 1:1 décomp Cmd_handlelearnnewmove. 10 bytes (2 ptrs + 1 firstMove flag). */
function Cmd_handlelearnnewmove(ctx: BattleScriptContext): boolean {
  const learnedMovePtr = readWord(ctx);
  const nothingToLearnPtr = readWord(ctx);
  const firstMoveFlag = readByte(ctx);

  let learnMove = _monTryLearningNewMove(0 /* expGetterMonId proxy */, firstMoveFlag);
  // 1:1 décomp : while (learnMove == MON_ALREADY_KNOWS_MOVE) try again.
  // Notre stub retourne toujours MOVE_NONE → boucle skip.
  let safety = 0;
  while (learnMove === 0xFFFE /* MON_ALREADY_KNOWS_MOVE */ && safety++ < 100) {
    learnMove = _monTryLearningNewMove(0, 0);
  }

  if (learnMove === MOVE_NONE) {
    ctx.scriptPtr = nothingToLearnPtr;
    return false;
  }
  if (learnMove === MON_HAS_MAX_MOVES) {
    // Déjà 4 moves : continue (= fall through).
    return false;
  }

  // 1:1 décomp battle_script_commands.c:5377-5392 : check partyIdx match
  // expGetterMonId (= seul le mon qui level-up reçoit le move, pas tous les
  // player battlers actifs). Sans : Exp.Share donnait le move au mauvais mon.
  const expGetterMonId = _gBattleStruct32.expGetterMonId ?? 0;
  const playerLeft = GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
  setActiveBattler(playerLeft);
  if (_gBattlerPartyIndexes_32[playerLeft] === expGetterMonId
      && !(gBattleMons[playerLeft].status2 & STATUS2_TRANSFORMED)) {
    _giveMoveToBattleMon(playerLeft, learnMove);
  }
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    const playerRight = GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT);
    setActiveBattler(playerRight);
    if (_gBattlerPartyIndexes_32[playerRight] === expGetterMonId
        && !(gBattleMons[playerRight].status2 & STATUS2_TRANSFORMED)) {
      _giveMoveToBattleMon(playerRight, learnMove);
    }
  }
  ctx.scriptPtr = learnedMovePtr;
  return false;
}

// ─── 0x5A yesnoboxlearnmove ───────────────────────────────────────────────

/** 1:1 décomp Cmd_yesnoboxlearnmove (battle_script_commands.c:5398-5511).
 *  5 bytes (u32 forgetMovePtr if cancel). State machine 7 cases (0..6).
 *
 *  Cases :
 *   0 : show YES/NO box + init cursor 0.
 *   1 : poll input — A on YES → state 2 (= go to summary screen), NO/B → state 5
 *       (= jump à forgetMovePtr / give up).
 *   2 : wait fade + show summary screen pour choose slot to replace.
 *   3 : wait return du summary screen.
 *   4 : check GetMoveSlotToReplace → si MAX_MON_MOVES (cancel) → state 5,
 *       sinon → check HM move (= can't replace HM), si HM → state 6, sinon
 *       → SetMonMoveSlot + RemoveMonPPBonus + advance.
 *   5 : close yesno + advance 5.
 *   6 : wait BattleControllerExecFlags == 0 → retry state 2.
 *
 *  Notre port : state machine fidèle. UI Phase 1.4 deferred : auto-NO Phase 1.4 (= jump à
 *  forgetMovePtr direct car summary screen pas wired). */
function Cmd_yesnoboxlearnmove(ctx: BattleScriptContext): boolean {
  const forgetMovePtr = readWord(ctx);
  const bs = (globalThis as { __battleState?: {
    gBattleScripting?: { learnMoveState: number };
    gBattleCommunication?: number[];
  } }).__battleState;
  if (!bs?.gBattleScripting || !bs.gBattleCommunication) {
    ctx.scriptPtr = forgetMovePtr;
    return false;
  }
  switch (bs.gBattleScripting.learnMoveState) {
    case 0:
      // 1:1 décomp : show YES/NO + cursor 0. UI Phase 1.4 deferred : advance state.
      bs.gBattleCommunication[3 /* CURSOR_POSITION */] = 0;
      bs.gBattleScripting.learnMoveState++;
      ctx.scriptPtr -= 5;
      return true;
    case 1:
      // UI Phase 1.4 deferred : auto-NO → state 5.
      bs.gBattleScripting.learnMoveState = 5;
      ctx.scriptPtr -= 5;
      return true;
    case 2:
    case 3:
    case 4:
      // UI Phase 1.4 deferred : summary screen state machine. Skip à state 5.
      bs.gBattleScripting.learnMoveState = 5;
      ctx.scriptPtr -= 5;
      return true;
    case 5:
      // 1:1 décomp : close window + jump à forgetMovePtr (= refuse learn).
      bs.gBattleScripting.learnMoveState = 0;  // reset.
      ctx.scriptPtr = forgetMovePtr;
      return false;
    case 6:
      // 1:1 décomp : wait controller exec → retry state 2.
      bs.gBattleScripting.learnMoveState = 2;
      ctx.scriptPtr -= 5;
      return true;
    default:
      bs.gBattleScripting.learnMoveState = 0;
      ctx.scriptPtr = forgetMovePtr;
      return false;
  }
}

// ─── 0x5B yesnoboxstoplearningmove ────────────────────────────────────────

/** 1:1 décomp Cmd_yesnoboxstoplearningmove (battle_script_commands.c:5514-5558).
 *  5 bytes (u32 stopPtr). State machine via gBattleScripting.learnMoveState.
 *
 *  Cases :
 *   0 : show yesno window + init cursor à NO position (= 0).
 *   1 : poll DPAD up/down + A/B button → resolve choice :
 *       - YES (cursor 0 + A) : advance 5 bytes (= continue normal flow).
 *       - NO  (cursor 1 + A) : jump à stopPtr (= cancel learning).
 *       - B button : same as NO.
 *
 *  Notre port : state machine fidèle au décomp. UI Phase 1.4 deferred : auto-choose YES
 *  (advance) jusqu'à wire input. */
function Cmd_yesnoboxstoplearningmove(ctx: BattleScriptContext): boolean {
  const stopPtr = readWord(ctx);
  const bs = (globalThis as { __battleState?: {
    gBattleScripting?: { learnMoveState: number };
    gBattleCommunication?: number[];
  } }).__battleState;
  if (!bs?.gBattleScripting || !bs.gBattleCommunication) return false;

  switch (bs.gBattleScripting.learnMoveState) {
    case 0:
      // 1:1 décomp : HandleBattleWindow + BattlePutTextOnWindow + cursor 0.
      // UI Phase 1.4 deferred : set cursor à 0 et advance state.
      bs.gBattleCommunication[3 /* CURSOR_POSITION */] = 0;
      bs.gBattleScripting.learnMoveState++;
      ctx.scriptPtr -= 5;  // re-enter (= stay on opcode pour case 1)
      return true;
    case 1: {
      // 1:1 décomp : poll input. UI Phase 1.4 deferred : auto-confirm YES → advance.
      // cursor 0 = YES (continue learning), cursor 1 = NO (cancel).
      // Pour stub Phase 1, on choose YES = advance pas jump.
      bs.gBattleScripting.learnMoveState = 0;  // reset for next.
      // gBattleCommunication[1] = 0 (YES) ou 1 (NO). Avec auto-YES, advance.
      if (bs.gBattleCommunication[1] !== 0) {
        ctx.scriptPtr = stopPtr;
      }
      // sinon advance (= déjà fait par readWord).
      return false;
    }
    default:
      bs.gBattleScripting.learnMoveState = 0;
      return false;
  }
}

// ─── 0x6C drawlvlupbox ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_drawlvlupbox (battle_script_commands.c:5927-6024). 1 byte.
 *  State machine via gBattleScripting.drawlvlupboxState (11 cases 0..10).
 *
 *  Notre port : state machine fidèle au décomp, avec stubs UI fns qui
 *  retournent les valeurs nécessaires pour faire avancer rapidement
 *  (= simulate "level-up box closed" en ~3 ticks pour ne pas bloquer le
 *  bytecode interpreter). UI réelle wired Phase 1.4+. */
function Cmd_drawlvlupbox(ctx: BattleScriptContext): boolean {
  const bs = (globalThis as { __battleState?: { gBattleScripting?: { drawlvlupboxState: number } } })
    .__battleState?.gBattleScripting;
  if (!bs) return false;

  // 1:1 décomp 5929-5938 : case 0 → décide skip banner (case 3) ou show (case 1).
  if (bs.drawlvlupboxState === 0) {
    // IsMonGettingExpSentOut : check si le mon level-up est in-battle (gBattlerPartyIndexes match expGetterMonId).
    // Notre simplification : si in-battle skip banner (case 3) directement.
    bs.drawlvlupboxState = _isMonGettingExpSentOutHBT() ? 3 : 1;
  }

  switch (bs.drawlvlupboxState) {
    case 1:
      // Start level up banner (= UI banner anim slide-in). UI Phase 1.4 deferred.
      bs.drawlvlupboxState = 2;
      break;
    case 2:
      // 1:1 décomp : SlideInLevelUpBanner returns FALSE quand anim done.
      // UI Phase 1.4 deferred : assume anim done instant → next state.
      bs.drawlvlupboxState = 3;
      break;
    case 3:
      // Init level up box window. UI Phase 1.4 deferred : advance state.
      bs.drawlvlupboxState = 4;
      break;
    case 4:
      // Draw page 1 of level up box. UI Phase 1.4 deferred : advance state.
      bs.drawlvlupboxState++;
      break;
    case 5:
    case 7:
      // Wait for draw. UI Phase 1.4 deferred : IsDma3ManagerBusyWithBgCopy = FALSE → advance.
      bs.drawlvlupboxState++;
      break;
    case 6:
      // 1:1 décomp : wait for player key (gMain.newKeys != 0).
      // UI Phase 1.4 deferred : auto-accept (= simulate key press).
      bs.drawlvlupboxState++;
      break;
    case 8:
      // Same : wait key + close. UI Phase 1.4 deferred : auto-accept.
      bs.drawlvlupboxState++;
      break;
    case 9:
      // SlideOutLevelUpBanner → UI Phase 1.4 deferred.
      bs.drawlvlupboxState = 10;
      break;
    case 10:
      // 1:1 décomp : final advance → gBattlescriptCurrInstr++.
      // Pour réinit prochain usage, reset state.
      bs.drawlvlupboxState = 0;
      return false;  // advance opcode.
    default:
      bs.drawlvlupboxState = 0;
      return false;
  }
  // 1:1 décomp : si pas advance (= state pas 10), stay on opcode pour re-enter.
  ctx.scriptPtr--;
  return true;
}

/** 1:1 stub `IsMonGettingExpSentOut(void)` (battle_script_commands.c).
 *  Check si gBattleStruct.expGetterMonId match gBattlerPartyIndexes[player_left]
 *  (= mon in-battle). */
function _isMonGettingExpSentOutHBT(): boolean {
  const bs = _gBattleStruct32;
  const playerLeftIdx = (globalThis as { __battleState?: { gBattlerPartyIndexes?: number[] } })
    .__battleState?.gBattlerPartyIndexes?.[0] ?? -1;
  return bs.expGetterMonId === playerLeftIdx;
}

// ─── 0xEF handleballthrow ─────────────────────────────────────────────────

/** 1:1 décomp `sBallCatchBonuses[]` (battle_script_commands.c:841-847).
 *  Indexed par (ITEM_X - ITEM_ULTRA_BALL) où ITEM_ULTRA_BALL = 4.
 *  Order : ULTRA_BALL=20, GREAT_BALL=15, POKE_BALL=10, SAFARI_BALL=15. */
const sBallCatchBonuses_HBT: ReadonlyArray<number> = [20, 15, 10, 15];

/** 1:1 décomp `Sqrt(s32 n)` (sqrt.c). Integer Newton iteration. */
function _sqrtHBT(n: number): number {
  if (n <= 0) return 0;
  let x = n;
  let y = Math.floor((x + 1) / 2);
  while (y < x) { x = y; y = Math.floor((x + Math.floor(n / x)) / 2); }
  return x;
}

/** 1:1 décomp Cmd_handleballthrow (battle_script_commands.c:9908-10056).
 *  Pokéball catch state machine : calc odds + anim shakes + check break.
 *  1 byte. */
function Cmd_handleballthrow(ctx: BattleScriptContext): boolean {
  if (_gBattleControllerExecFlagsHBT) return _stayOnOpcodeHBT(ctx);

  _setActiveBattlerHBT(_gBattlerAttackerHBT);
  _setBattlerTargetHBT(_BATTLE_OPPOSITE_HBT(_gBattlerAttackerHBT));
  const targetIdx = _BATTLE_OPPOSITE_HBT(_gBattlerAttackerHBT);

  if (_gBattleTypeFlagsHBT & 8 /* BATTLE_TYPE_TRAINER */) {
    // 1:1 décomp : EmitBallThrowAnim(BALL_TRAINER_BLOCK = 5) + Mark.
    _BtlController_EmitBallThrowAnim_HBT(0 /* B_COMM_TO_CONTROLLER */, 5 /* BALL_TRAINER_BLOCK */);
    _MarkBattlerForControllerExec_HBT(_gBattlerAttacker_HBT());
    const off = _getBattleScriptOffsetHBT('BattleScript_TrainerBallBlock');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }

  if (_gBattleTypeFlagsHBT & 0x10000 /* BATTLE_TYPE_WALLY_TUTORIAL */) {
    // 1:1 décomp : EmitBallThrowAnim(BALL_3_SHAKES_SUCCESS = 4) + Mark (Wally tut).
    _BtlController_EmitBallThrowAnim_HBT(0, 4 /* BALL_3_SHAKES_SUCCESS */);
    _MarkBattlerForControllerExec_HBT(_gBattlerAttacker_HBT());
    const off = _getBattleScriptOffsetHBT('BattleScript_WallyBallThrow');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }

  // Normal capture flow.
  let ballMultiplier = 0;
  let catchRate: number;

  if (_gLastUsedItemHBT === 5 /* ITEM_SAFARI_BALL */) {
    catchRate = Math.floor(_gBattleStructHBT.safariCatchFactor * 1275 / 100);
  } else {
    catchRate = _getSpeciesCatchRateHBT(_gBattleMonsHBT[targetIdx].species);
  }

  if (_gLastUsedItemHBT > 5 /* ITEM_SAFARI_BALL */) {
    switch (_gLastUsedItemHBT) {
      case 6  /* ITEM_NET_BALL */: {
        const t1 = _gBattleMonsHBT[targetIdx].type1, t2 = _gBattleMonsHBT[targetIdx].type2;
        if (t1 === 11 /* WATER */ || t2 === 11 || t1 === 6 /* BUG */ || t2 === 6) ballMultiplier = 30;
        else ballMultiplier = 10;
        break;
      }
      case 7  /* ITEM_DIVE_BALL */:
        // 1:1 décomp : GetCurrentMapType() == MAP_TYPE_UNDERWATER (5).
        // Lookup via globalThis.gMapHeader.mapType (= overworld map sync).
        if (_getCurrentMapTypeHBT() === 5 /* MAP_TYPE_UNDERWATER */) {
          ballMultiplier = 35;
        } else {
          ballMultiplier = 10;
        }
        break;
      case 8  /* ITEM_NEST_BALL */: {
        const lvl = _gBattleMonsHBT[targetIdx].level;
        if (lvl < 40) {
          ballMultiplier = 40 - lvl;
          if (ballMultiplier <= 9) ballMultiplier = 10;
        } else {
          ballMultiplier = 10;
        }
        break;
      }
      case 9  /* ITEM_REPEAT_BALL */: {
        const dexNum = _gBattleMonsHBT[targetIdx].species;  // = SpeciesToNationalPokedexNum (Gen 3 = identity ≤ 386).
        if (_GetSetPokedexFlagHBT(dexNum, 0 /* FLAG_GET_CAUGHT */)) ballMultiplier = 30;
        else ballMultiplier = 10;
        break;
      }
      case 10 /* ITEM_TIMER_BALL */:
        ballMultiplier = _gBattleResultsHBT.battleTurnCounter + 10;
        if (ballMultiplier > 40) ballMultiplier = 40;
        break;
      case 11 /* ITEM_LUXURY_BALL */:
      case 12 /* ITEM_PREMIER_BALL */:
        ballMultiplier = 10;
        break;
      default:
        ballMultiplier = 10;
    }
  } else {
    ballMultiplier = sBallCatchBonuses_HBT[_gLastUsedItemHBT - 4 /* ITEM_ULTRA_BALL */] ?? 10;
  }

  let odds = Math.floor(
    Math.floor(catchRate * ballMultiplier / 10)
    * (_gBattleMonsHBT[targetIdx].maxHP * 3 - _gBattleMonsHBT[targetIdx].hp * 2)
    / (3 * _gBattleMonsHBT[targetIdx].maxHP)
  );

  const status1 = _gBattleMonsHBT[targetIdx].status1;
  if (status1 & (7 /* STATUS1_SLEEP */ | 32 /* STATUS1_FREEZE */)) odds *= 2;
  if (status1 & (8 /* STATUS1_POISON */ | 16 /* STATUS1_BURN */ | 64 /* STATUS1_PARALYSIS */ | 128 /* STATUS1_TOXIC_POISON */)) {
    odds = Math.floor((odds * 15) / 10);
  }

  // 1:1 décomp ll.9999-10010 : Master Ball / catch attempts tracking.
  if (_gLastUsedItemHBT !== 5 /* ITEM_SAFARI_BALL */) {
    if (_gLastUsedItemHBT === 1 /* ITEM_MASTER_BALL */) {
      _gBattleResultsHBT.usedMasterBall = 1;
    } else {
      const idx = _gLastUsedItemHBT - 4 /* ITEM_ULTRA_BALL */;
      if (idx >= 0 && idx < _gBattleResultsHBT.catchAttempts.length
          && _gBattleResultsHBT.catchAttempts[idx] < 255) {
        _gBattleResultsHBT.catchAttempts[idx]++;
      }
    }
  }

  if (odds > 254) {
    // Mon caught (auto-success path).
    const off = _getBattleScriptOffsetHBT('BattleScript_SuccessBallThrow');
    if (off >= 0) ctx.scriptPtr = off;
    _SetMonDataHBT(_gEnemyPartyHBT[_gBattlerPartyIndexesHBT[targetIdx]], _MON_DATA_POKEBALL_HBT, _gLastUsedItemHBT);
    // 1:1 décomp : MSG 0 (= SENT_SOMEONES_PC / LANETTES_PC) si party full, sinon 1.
    const partyCount_PB = _CalculatePlayerPartyCountHBT();
    _gBattleCommunicationHBT[5 /* MULTISTRING_CHOOSER */] = partyCount_PB >= 6 ? 0 : 1;
  } else {
    // Mon may be caught — calc shakes.
    odds = _sqrtHBT(_sqrtHBT(Math.floor(16711680 / odds)));
    odds = Math.floor(1048560 / odds);
    let shakes: number;
    for (shakes = 0; shakes < 4 /* BALL_3_SHAKES_SUCCESS */ && _RandomHBT() < odds; shakes++);
    if (_gLastUsedItemHBT === 1 /* ITEM_MASTER_BALL */) shakes = 4;
    // 1:1 décomp : EmitBallThrowAnim(shakes) + Mark.
    _BtlController_EmitBallThrowAnim_HBT(0, shakes);
    _MarkBattlerForControllerExec_HBT(_gBattlerAttacker_HBT());
    if (shakes === 4) {
      const off = _getBattleScriptOffsetHBT('BattleScript_SuccessBallThrow');
      if (off >= 0) ctx.scriptPtr = off;
      _SetMonDataHBT(_gEnemyPartyHBT[_gBattlerPartyIndexesHBT[targetIdx]], _MON_DATA_POKEBALL_HBT, _gLastUsedItemHBT);
      _gBattleCommunicationHBT[5] = 1;
    } else {
      _gBattleCommunicationHBT[5] = shakes;
      const off = _getBattleScriptOffsetHBT('BattleScript_ShakeBallThrow');
      if (off >= 0) ctx.scriptPtr = off;
    }
  }
  return false;
}

// Imports locaux Cmd_handleballthrow.
import {
  gBattleControllerExecFlags as _gBattleControllerExecFlagsHBT,
  gBattlerAttacker as _gBattlerAttackerHBT,
  gBattleMons as _gBattleMonsHBT,
  gBattleTypeFlags as _gBattleTypeFlagsHBT,
  gLastUsedItem as _gLastUsedItemHBT,
  gBattleStruct as _gBattleStructHBT,
  gBattlerPartyIndexes as _gBattlerPartyIndexesHBT,
  gBattleCommunication as _gBattleCommunicationHBT,
  gBattleResults as _gBattleResultsHBT,
  setActiveBattler as _setActiveBattlerHBT,
  setBattlerTarget as _setBattlerTargetHBT,
} from './state';
import { BATTLE_OPPOSITE as _BATTLE_OPPOSITE_HBT } from './constants';
import { getBattleScriptOffset as _getBattleScriptOffsetHBT, Random as _RandomHBT } from './script-interpreter';
import {
  gEnemyParty as _gEnemyPartyHBT, SetMonData as _SetMonDataHBT,
  MON_DATA_POKEBALL as _MON_DATA_POKEBALL_HBT,
  CalculatePlayerPartyCount as _CalculatePlayerPartyCountHBT,
} from './party-storage';
import { GetSetPokedexFlag as _GetSetPokedexFlagHBT } from '../decomp-data/auto/src-all/pokedex-all-auto';
import { getSpeciesInfo as _getSpeciesInfoHBT } from '../data/game-data';
import { speciesNumberToEnum as _speciesNumberToEnumHBT } from './data/species-runtime';
// 1:1 décomp BtlController_EmitBallThrowAnim + Mark — wired pour les ball anim.
import {
  BtlController_EmitBallThrowAnim as _BtlController_EmitBallThrowAnim_HBT,
  MarkBattlerForControllerExec as _MarkBattlerForControllerExec_HBT,
} from './battle-controllers';
function _gBattlerAttacker_HBT(): number {
  return (globalThis as { __battleState?: { gBattlerAttacker?: number } })
    .__battleState?.gBattlerAttacker ?? 0;
}

/** 1:1 décomp `GetCurrentMapType()` (overworld.c:1344-1347). Lookup via global
 *  gMapHeader.mapType — sync from overworld system. Retourne 0 (MAP_TYPE_NONE)
 *  si non dispo (= rare en battle path : un battle est toujours triggered depuis
 *  une map valide). */
function _getCurrentMapTypeHBT(): number {
  const gh = (globalThis as { gMapHeader?: { mapType?: number } }).gMapHeader;
  return gh?.mapType ?? 0;
}

function _getSpeciesCatchRateHBT(species: number): number {
  return _getSpeciesInfoHBT(_speciesNumberToEnumHBT(species))?.catchRate ?? 0;
}
function _stayOnOpcodeHBT(ctx: BattleScriptContext): boolean {
  ctx.scriptPtr--;
  return true;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau32Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x50] = Cmd_openpartyscreen;
  commands[0x51] = Cmd_switchhandleorder;
  commands[0x59] = Cmd_handlelearnnewmove;
  commands[0x5A] = Cmd_yesnoboxlearnmove;
  commands[0x5B] = Cmd_yesnoboxstoplearningmove;
  commands[0x6C] = Cmd_drawlvlupbox;
  commands[0xEF] = Cmd_handleballthrow;
}
