/**
 * battle/cmd-niveau-32.ts — Phase 1 Niveau 32 (learn move / party / handle ball) — 7 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x50 openpartyscreen           (1 byte — open party UI state machine — stub)
 *   0x51 switchhandleorder         (3 bytes — switch order state machine — stub)
 *   0x59 handlelearnnewmove        (10 bytes — try teach new move)
 *   0x5A yesnoboxlearnmove         (5 bytes — yes/no learn move — stub)
 *   0x5B yesnoboxstoplearningmove  (5 bytes — yes/no stop learning — stub)
 *   0x6C drawlvlupbox              (1 byte — level-up stats box state machine — stub)
 *   0xEF handleballthrow           (1 byte — Pokéball capture state machine — stub)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *
 *  Note : ces 7 opcodes sont des state machines UI lourdes (party screen,
 *  yesno box, palette fade, naming screen, ball anim). Notre port = MVP stubs
 *  qui advance pour permettre le bytecode de progresser. Les vrais behaviors
 *  UI seront wired post-Phase 1. */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readByte, readWord } from './script-interpreter';
import {
  gBattleMons, setActiveBattler,
  gBattleTypeFlags,
  gBattleControllerExecFlags,
  gBattleStruct as _gBattleStruct32,
} from './state';
import {
  MOVE_NONE,
  STATUS2_TRANSFORMED,
  BATTLE_TYPE_DOUBLE,
} from './constants';
import { GetBattlerAtPosition, B_POSITION_PLAYER_LEFT, B_POSITION_PLAYER_RIGHT } from './util';

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
  void partyIdx;
  // Notre context battle : on lit depuis gPlayerParty (= party qui levelup).
  // Pour Phase 1, on read directement depuis le mon courant via partyIdx.
  // Le décomp utilise un pointer struct Pokemon* — notre party storage abstrait
  // ça. Pour now, on lit via gBattleStruct.expGetterMonId.
  // Si pas accessible : fallback MOVE_NONE.
  const speciesEnum = (globalThis as { __game_data?: {
    getSpeciesEnumByNumber?: (n: number) => string | undefined;
    getLevelUpLearnset?: (s: string) => Array<{ level: number; move: string }> | undefined;
  } }).__game_data;
  // Notre BattleMon a déjà species + level. Pour port simple, on utilise le
  // mon courant via expGetterMonId index dans gPlayerParty.
  const mon = (globalThis as { gPlayerParty?: Array<{ species?: number; level?: number; moves?: number[] }> }).gPlayerParty?.[partyIdx];
  if (!mon) return MOVE_NONE;
  const speciesNum = mon.species ?? 0;
  const level = mon.level ?? 1;
  const enumKey = speciesEnum?.getSpeciesEnumByNumber?.(speciesNum) ?? `SPECIES_${speciesNum}`;
  const learnset = speciesEnum?.getLevelUpLearnset?.(enumKey);
  if (!learnset || learnset.length === 0) return MOVE_NONE;

  // 1:1 décomp : if firstMove → reset sLearningMoveTableID + skip jusqu'au
  // premier entry à level == mon.level.
  if (firstMove) {
    _sLearningMoveTableID = 0;
    while (_sLearningMoveTableID < learnset.length
           && learnset[_sLearningMoveTableID].level !== level) {
      _sLearningMoveTableID++;
    }
    if (_sLearningMoveTableID >= learnset.length) return MOVE_NONE;
  }

  // 1:1 décomp : check si entry courante à ce level (sinon return MOVE_NONE).
  if (_sLearningMoveTableID >= learnset.length
      || learnset[_sLearningMoveTableID].level !== level) {
    return MOVE_NONE;
  }
  // Resolve move name → moveId (= utilise (globalThis).MOVE_X enum si dispo).
  const moveName = learnset[_sLearningMoveTableID].move;
  const moveId = (globalThis as Record<string, unknown>)[moveName] as number | undefined ?? 0;
  // Set gMoveToLearn (= state global pour Cmd_buffermovetolearn).
  const setM = (globalThis as { __battleStateMutators?: { setMoveToLearn?: (v: number) => void } })
    .__battleStateMutators?.setMoveToLearn;
  if (setM) setM(moveId);
  _sLearningMoveTableID++;
  // GiveMoveToMon → si déjà 4 moves : MON_HAS_MAX_MOVES, si déjà connu : MON_ALREADY_KNOWS_MOVE.
  const moves = mon.moves ?? [];
  if (moves.includes(moveId)) return 0xFFFE /* MON_ALREADY_KNOWS_MOVE */;
  // Find empty slot.
  for (let i = 0; i < 4; i++) {
    if (!moves[i] || moves[i] === MOVE_NONE) {
      moves[i] = moveId;
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

/** 1:1 décomp Cmd_openpartyscreen. 6 bytes : opcode + u8 battler + u32 ptr.
 *  Macro source : `openpartyscreen battler:req, ptr:req` (battle_script.inc:476).
 *
 *  Full state machine : ~12k chars dans battle_script_commands.c. Pour POC,
 *  on consume les args + advance (= ne fait rien visuellement, party UI Phase 1.4).
 *
 *  Bug AUDIT fix : avant ne consommait pas les 5 bytes args → opcode suivant
 *  lu comme byte arg de openpartyscreen → script désync (scripts stuck à des
 *  scriptPtr aléatoires comme 721420318). */
function Cmd_openpartyscreen(ctx: BattleScriptContext): boolean {
  readByte(ctx);  // battler arg.
  readWord(ctx);  // jumpPtr if fail.
  // TODO porter party screen state machine + party_menu UI.
  return false;
}

// ─── 0x51 switchhandleorder ───────────────────────────────────────────────

/** 1:1 décomp Cmd_switchhandleorder. 3 bytes (u8 battler + u8 caseId).
 *  MVP stub : consomme args + advance. */
function Cmd_switchhandleorder(ctx: BattleScriptContext): boolean {
  if (gBattleControllerExecFlags) return _stayOnOpcode(ctx);
  readByte(ctx);  // battler
  readByte(ctx);  // caseId
  // TODO porter switch handler state machine.
  return false;
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

  // 1:1 décomp : si battler player local match expGetterMonId, GiveMove.
  const playerLeft = GetBattlerAtPosition(B_POSITION_PLAYER_LEFT);
  setActiveBattler(playerLeft);
  if (!(gBattleMons[playerLeft].status2 & STATUS2_TRANSFORMED)) {
    _giveMoveToBattleMon(playerLeft, learnMove);
  }
  if (gBattleTypeFlags & BATTLE_TYPE_DOUBLE) {
    const playerRight = GetBattlerAtPosition(B_POSITION_PLAYER_RIGHT);
    setActiveBattler(playerRight);
    if (!(gBattleMons[playerRight].status2 & STATUS2_TRANSFORMED)) {
      _giveMoveToBattleMon(playerRight, learnMove);
    }
  }
  ctx.scriptPtr = learnedMovePtr;
  return false;
}

// ─── 0x5A yesnoboxlearnmove ───────────────────────────────────────────────

/** 1:1 décomp Cmd_yesnoboxlearnmove. 5 bytes (u32 ptr). State machine. */
function Cmd_yesnoboxlearnmove(ctx: BattleScriptContext): boolean {
  readWord(ctx);  // forgetMovePtr — consume arg.
  // MVP stub : skip state machine, advance direct.
  // TODO porter yesno + summary screen + forget move flow.
  return false;
}

// ─── 0x5B yesnoboxstoplearningmove ────────────────────────────────────────

/** 1:1 décomp Cmd_yesnoboxstoplearningmove. 5 bytes (u32 ptr). State machine. */
function Cmd_yesnoboxstoplearningmove(ctx: BattleScriptContext): boolean {
  readWord(ctx);  // stopPtr.
  // MVP stub : skip state machine, advance direct.
  return false;
}

// ─── 0x6C drawlvlupbox ────────────────────────────────────────────────────

/** 1:1 décomp Cmd_drawlvlupbox. 1 byte. State machine via
 *  gBattleScripting.drawlvlupboxState. MVP stub : advance direct. */
function Cmd_drawlvlupbox(_ctx: BattleScriptContext): boolean {
  // TODO porter level-up stats box rendering (= bg + sprite + text scroll).
  return false;
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
    // STUB BtlController_EmitBallThrowAnim BALL_TRAINER_BLOCK (= Phase 1.4 UI).
    const off = _getBattleScriptOffsetHBT('BattleScript_TrainerBallBlock');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }

  if (_gBattleTypeFlagsHBT & 0x10000 /* BATTLE_TYPE_WALLY_TUTORIAL */) {
    // STUB EmitBallThrowAnim BALL_3_SHAKES_SUCCESS.
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
    // STUB EmitBallThrowAnim(shakes).
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
