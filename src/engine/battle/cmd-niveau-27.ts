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
import { readWord, Random, getBattleScriptOffset, getMoveEffectScriptOffset } from './script-interpreter';
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
import {
  EFFECT_SKULL_BASH as _EFFECT_SKULL_BASH,
  EFFECT_RAZOR_WIND as _EFFECT_RAZOR_WIND,
  EFFECT_SKY_ATTACK as _EFFECT_SKY_ATTACK,
  EFFECT_SOLAR_BEAM as _EFFECT_SOLAR_BEAM,
  EFFECT_SEMI_INVULNERABLE as _EFFECT_SEMI_INVULNERABLE,
  EFFECT_BIDE as _EFFECT_BIDE,
} from '../decomp-data/auto/include/constants/battle_move_effects-data';

// ─── Helpers ────────────────────────────────────────────────────────────────

// 1:1 décomp `GetGenderFromSpeciesAndPersonality` — full port via species-runtime
// (= utilise gSpeciesInfo[species].genderRatio + personality lo byte 1:1).
import { GetGenderFromSpeciesAndPersonality as _GetGenderFull } from './data/species-runtime';
function _getGenderFromSpeciesAndPersonality(species: number, personality: number): number {
  return _GetGenderFull(species, personality);
}

/** 1:1 décomp `IsInvalidForSleepTalkOrAssist(move)`
 *  (battle_script_commands.c:8212-8222). Returns true si le move ne peut PAS
 *  être appelé par Sleep Talk / Assist (= MOVE_NONE/SLEEP_TALK/ASSIST/MIRROR_MOVE/METRONOME).
 *  Note décomp Em ne check pas STRUGGLE, FOCUS_PUNCH, UPROAR, 2-turn moves
 *  (= ceux-ci sont check ailleurs dans Cmd_trychoosesleeptalkmove). */
function _isInvalidForSleepTalkOrAssist(move: number): boolean {
  const MOVE_ASSIST_LOCAL = 274;
  const MOVE_MIRROR_MOVE_LOCAL = 119;
  const MOVE_METRONOME_LOCAL = 118;
  const MOVE_SLEEP_TALK_LOCAL = 214;
  return move === MOVE_NONE
      || move === MOVE_SLEEP_TALK_LOCAL
      || move === MOVE_ASSIST_LOCAL
      || move === MOVE_MIRROR_MOVE_LOCAL
      || move === MOVE_METRONOME_LOCAL;
}

/** 1:1 décomp `IsTwoTurnsMove(move)` (battle_script_commands.c:8199-8210).
 *  Returns true si le move utilise 2 turns (charge → attaque).
 *  AUDIT FIX : valeurs EFFECT_* importées depuis auto-data (= drift précédent
 *  avec SKULL_BASH=11/RAZOR_WIND=12/SOLAR_BEAM=70/SEMI_INVULNERABLE=39/BIDE=27
 *  toutes FAUSSES). */
function _isTwoTurnsMove(move: number): boolean {
  const effect = getBattleMove(move).effect;
  return effect === _EFFECT_SKULL_BASH
      || effect === _EFFECT_RAZOR_WIND
      || effect === _EFFECT_SKY_ATTACK
      || effect === _EFFECT_SOLAR_BEAM
      || effect === _EFFECT_SEMI_INVULNERABLE
      || effect === _EFFECT_BIDE;
}

// 1:1 décomp `CheckMoveLimitations` — importé depuis move-limitations.ts (= full port).
import { CheckMoveLimitations as _CheckMoveLimitationsFull } from './move-limitations';
function _checkMoveLimitations(battler: number, unusableBits: number, check: number): number {
  return _CheckMoveLimitationsFull(battler, unusableBits, check);
}

/** 1:1 stub `GetMoveTarget(move, override)` — pour MVP retourne gBattlerTarget
 *  inchangé. */
function _getMoveTarget(_move: number, _override: number): number {
  return gBattlerTarget;
}

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.
import { RecordAbilityBattle as _recordAbilityBattleFullN27 } from './util';
function _recordAbilityBattle(battler: number, ability: number): void {
  _recordAbilityBattleFullN27(battler, ability);
}

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
function Cmd_metronome(ctx: BattleScriptContext): boolean {
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
      // 1:1 décomp : gBattlescriptCurrInstr = gBattleScriptsForMoveEffects[move.effect].
      const off = getMoveEffectScriptOffset(getBattleMove(candidate).effect);
      if (off >= 0) ctx.scriptPtr = off;
      setBattlerTarget(_getMoveTarget(candidate, 0));
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
  // 1:1 décomp : BattleScriptPush(gBattleScriptsForMoveEffects[effect]); gBattlescriptCurrInstr++.
  // BattleScriptPush stocke le ptr du move effect script sur le stack — sera
  // popped par le prochain `return`. L'opcode lui-même est déjà avancé par
  // le dispatch loop (cf. script-interpreter.ts:runBattleScript).
  const off = getMoveEffectScriptOffset(getBattleMove(move).effect);
  if (off >= 0) ctx.scriptPtrStack.push(off);
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
