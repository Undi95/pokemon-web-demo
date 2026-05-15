/**
 * battle/cmd-niveau-27.ts — Phase 1 Niveau 27 (infatuation + sleep talk + metronome + nature) — 5 opcodes
 * 1:1 décomp `src/battle_script_commands.c`.
 *
 * Opcodes :
 *   0x97 tryinfatuating          (5 bytes — Attract gender check)
 *   0x9E metronome               (1 byte  — Random move pick)
 *   0xA9 trychoosesleeptalkmove  (5 bytes — Sleep Talk pick valid move)
 *   0xCC callenvironmentattack   (1 byte  — Nature Power)
 *   0xF1 trysetcaughtmondexflags (5 bytes — set caught Pokedex flag)
 *
 * Sources de vérité (1:1) :
 *   - `public/decomp/em/extracted-all/battle_script_commands.json`
 *   - `decomps/pokeemeraude/src/battle_script_commands.c:759 sNaturePowerMoves`
 */

import type { BattleOpcodeHandler, BattleScriptContext } from './script-interpreter';
import { readWord, Random, getBattleScriptOffset } from './script-interpreter';
import {
  gBattleMons, gBattlerAttacker, gBattlerTarget, setBattlerTarget,
  setCurrentMove, gCurrentMove,
  setCalledMove, setCurrMovePos,
  gHitMarker, setHitMarker,
  setLastUsedAbility,
  gBattleEnvironment,
} from './state';
import {
  STATUS2_INFATUATION, STATUS2_INFATUATED_WITH,
  ABILITY_OBLIVIOUS,
  MON_GENDERLESS,
  MAX_MON_MOVES, MOVE_NONE,
  MOVES_COUNT, ALL_MOVES_MASK,
  MOVE_FOCUS_PUNCH, MOVE_UPROAR,
  HITMARKER_ATTACKSTRING_PRINTED,
  sNaturePowerMoves,
  sMovesForbiddenToCopy, METRONOME_FORBIDDEN_END,
} from './constants';
import { getBattleMove } from './data/battle-moves';
import { gBitTable } from './battle-controllers';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** 1:1 stub `GetGenderFromSpeciesAndPersonality(species, personality)`
 *  (pokemon.c). Returns MON_MALE / MON_FEMALE / MON_GENDERLESS.
 *
 *  Notre stub : utilise personality % 2 (= 0:MALE, 1:FEMALE) sans species
 *  gender ratio lookup. */
function _getGenderFromSpeciesAndPersonality(_species: number, personality: number): number {
  // TODO porter gSpeciesInfo[species].genderRatio + comparaison avec
  // personality lo byte.
  return (personality & 1) === 0 ? 0x00 : 0xFE;  // MON_MALE / MON_FEMALE
}

/** 1:1 stub `IsInvalidForSleepTalkOrAssist(move)` (battle_util.c).
 *  Forbidden moves dans le décomp : MOVE_NONE / METRONOME / STRUGGLE / SLEEP_TALK
 *  / ASSIST / MIRROR_MOVE / FOCUS_PUNCH / UPROAR / 2-turn moves.
 *  Notre stub : check juste MOVE_NONE + STRUGGLE (= rough). */
function _isInvalidForSleepTalkOrAssist(move: number): boolean {
  return move === MOVE_NONE || move === 165 /* MOVE_STRUGGLE */
      || move === 118 /* MOVE_METRONOME */ || move === 214 /* MOVE_SLEEP_TALK */;
}

/** 1:1 stub `IsTwoTurnsMove(move)` (battle_util.c). Pour MVP : false. */
function _isTwoTurnsMove(_move: number): boolean { return false; }

/** 1:1 stub `CheckMoveLimitations(battler, unusableBits, check)` (battle_util.c).
 *  Pour MVP : retourne juste unusableBits inchangé. */
function _checkMoveLimitations(_battler: number, unusableBits: number, _check: number): number {
  return unusableBits;
}

/** 1:1 stub `GetMoveTarget(move, override)` — pour MVP retourne gBattlerTarget
 *  inchangé. */
function _getMoveTarget(_move: number, _override: number): number {
  return gBattlerTarget;
}

/** 1:1 stub `RecordAbilityBattle` (battle_util.c). AI tracking — no-op. */
function _recordAbilityBattle(_battler: number, _ability: number): void {}

/** 1:1 stub `GetSetPokedexFlag(natDexNum, caseId)` (pokedex.c).
 *  Pour MVP : retourne 0 (= jamais set). Permettra l'opcode de toujours
 *  brancher sur le SET path. */
function _getSetPokedexFlag(_natDexNum: number, _caseId: number): number {
  return 0;
}

/** 1:1 stub `HandleSetPokedexFlag(natDexNum, caseId, personality)`. */
function _handleSetPokedexFlag(_natDexNum: number, _caseId: number, _personality: number): void {
  // TODO porter gSaveBlock2Ptr.pokedex flags.
}

/** 1:1 stub `SpeciesToNationalPokedexNum(species)` — Gen 3 species id == natDexNum
 *  pour les 386 premiers. */
function _speciesToNationalPokedexNum(species: number): number {
  return species;
}

// ─── 0x97 tryinfatuating ──────────────────────────────────────────────────

/** 1:1 décomp Cmd_tryinfatuating. 5 bytes (u32 fail jump). */
function Cmd_tryinfatuating(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const atk = gBattleMons[gBattlerAttacker];
  const tgt = gBattleMons[gBattlerTarget];

  if (tgt.ability === ABILITY_OBLIVIOUS) {
    setLastUsedAbility(ABILITY_OBLIVIOUS);
    _recordAbilityBattle(gBattlerTarget, ABILITY_OBLIVIOUS);
    const off = getBattleScriptOffset('BattleScript_ObliviousPreventsAttraction');
    if (off >= 0) ctx.scriptPtr = off;
    return false;
  }

  const genderAtk = _getGenderFromSpeciesAndPersonality(atk.species, atk.personality);
  const genderTgt = _getGenderFromSpeciesAndPersonality(tgt.species, tgt.personality);

  if (genderAtk === genderTgt
      || (tgt.status2 & STATUS2_INFATUATION)
      || genderAtk === MON_GENDERLESS
      || genderTgt === MON_GENDERLESS) {
    ctx.scriptPtr = failJump;
    return false;
  }
  tgt.status2 |= STATUS2_INFATUATED_WITH(gBattlerAttacker);
  return false;
}

// ─── 0x9E metronome ───────────────────────────────────────────────────────

/** 1:1 décomp Cmd_metronome. 1 byte. */
function Cmd_metronome(_ctx: BattleScriptContext): boolean {
  // 1:1 décomp infinite loop : pick random move 1..MOVES_COUNT, retry si dans
  // sMovesForbiddenToCopy (= full forbidden list, donc on parcourt jusqu'à
  // METRONOME_FORBIDDEN_END). On set gCurrentMove + gBattlerTarget.
  for (let tries = 0; tries < 1000; tries++) {
    // 1:1 décomp MOVES_COUNT<512 path : Random()&0x1FF puis check >=MOVES_COUNT.
    const candidate = (Random() & 0x1FF) + 1;
    if (candidate >= MOVES_COUNT) continue;

    let i = -1;
    while (true) {
      i++;
      if (sMovesForbiddenToCopy[i] === candidate) break;
      if (sMovesForbiddenToCopy[i] === METRONOME_FORBIDDEN_END) break;
    }
    if (sMovesForbiddenToCopy[i] === METRONOME_FORBIDDEN_END) {
      // Candidate non forbidden : utiliser.
      setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
      setCurrentMove(candidate);
      setBattlerTarget(_getMoveTarget(candidate, 0));
      // 1:1 décomp : jump à gBattleScriptsForMoveEffects[move.effect].
      // Notre port : pas wired (= jump table extraction TODO). Le caller doit
      // continuer son flow normal après ce set.
      return false;
    }
  }
  // Safety : ne devrait jamais arriver. Default = TACKLE.
  setCurrentMove(33);
  return false;
}

// ─── 0xA9 trychoosesleeptalkmove ──────────────────────────────────────────

/** 1:1 décomp Cmd_trychoosesleeptalkmove. 5 bytes (u32 fail jump). */
function Cmd_trychoosesleeptalkmove(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  let unusableMovesBits = 0;
  for (let i = 0; i < MAX_MON_MOVES; i++) {
    const move = gBattleMons[gBattlerAttacker].moves[i];
    if (_isInvalidForSleepTalkOrAssist(move)
        || move === MOVE_FOCUS_PUNCH
        || move === MOVE_UPROAR
        || _isTwoTurnsMove(move)) {
      unusableMovesBits |= gBitTable[i];
    }
  }
  // 1:1 décomp : CheckMoveLimitations avec ~MOVE_LIMITATION_PP (= ignore PP).
  unusableMovesBits = _checkMoveLimitations(gBattlerAttacker, unusableMovesBits, ~0);
  if (unusableMovesBits === ALL_MOVES_MASK) {
    // No valid move : fall-through (advance 5 — déjà fait par readWord).
    return false;
  }
  let movePosition = 0;
  for (let tries = 0; tries < 100; tries++) {
    movePosition = Random() % MAX_MON_MOVES;
    if (!(gBitTable[movePosition] & unusableMovesBits)) break;
  }
  setCalledMove(gBattleMons[gBattlerAttacker].moves[movePosition]);
  setCurrMovePos(movePosition);
  setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
  setBattlerTarget(_getMoveTarget(gBattleMons[gBattlerAttacker].moves[movePosition], 0));
  ctx.scriptPtr = failJump;  // 1:1 décomp : jump au "success" label (= NOT failJump, mais
  // le code décomp utilise T1_READ_PTR du même offset pour les deux paths).
  return false;
}

// ─── 0xCC callenvironmentattack ───────────────────────────────────────────

/** 1:1 décomp Cmd_callenvironmentattack. 1 byte. Nature Power. */
function Cmd_callenvironmentattack(ctx: BattleScriptContext): boolean {
  setHitMarker(gHitMarker & ~HITMARKER_ATTACKSTRING_PRINTED);
  const move = sNaturePowerMoves[gBattleEnvironment] ?? 129; // SWIFT fallback.
  setCurrentMove(move);
  setBattlerTarget(_getMoveTarget(move, 0));
  // 1:1 décomp : BattleScriptPush(gBattleScriptsForMoveEffects[effect]).
  // Notre port : push current ptr (= return-to-here), jump pas wired.
  ctx.scriptPtrStack.push(ctx.scriptPtr);
  // TODO : jump à gBattleScriptsForMoveEffects[move.effect] quand table portée.
  return false;
}

// ─── 0xF1 trysetcaughtmondexflags ─────────────────────────────────────────

/** 1:1 décomp Cmd_trysetcaughtmondexflags. 5 bytes (u32 fail jump).
 *  Décomp lit gEnemyParty[0] pour species + personality.
 *  Notre port : utilise gBattleMons[1] (= opponent battler) car gEnemyParty
 *  pas wired battle-side. */
function Cmd_trysetcaughtmondexflags(ctx: BattleScriptContext): boolean {
  const failJump = readWord(ctx);
  const species = gBattleMons[1].species;  // gEnemyParty[0] proxy.
  const personality = gBattleMons[1].personality;
  const dexNum = _speciesToNationalPokedexNum(species);
  const FLAG_GET_CAUGHT = 1;
  const FLAG_SET_CAUGHT = 3;

  if (_getSetPokedexFlag(dexNum, FLAG_GET_CAUGHT)) {
    ctx.scriptPtr = failJump;
    return false;
  }
  _handleSetPokedexFlag(dexNum, FLAG_SET_CAUGHT, personality);
  return false;
}

// ─── Install handlers ──────────────────────────────────────────────────────

export function installNiveau27Handlers(commands: BattleOpcodeHandler[]): void {
  commands[0x97] = Cmd_tryinfatuating;
  commands[0x9E] = Cmd_metronome;
  commands[0xA9] = Cmd_trychoosesleeptalkmove;
  commands[0xCC] = Cmd_callenvironmentattack;
  commands[0xF1] = Cmd_trysetcaughtmondexflags;
}
