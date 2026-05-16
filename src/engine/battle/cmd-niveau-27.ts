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

// 1:1 décomp `GetMoveTarget` — wired via cmd-niveau-34 export.
import { _GetMoveTarget as _GetMoveTargetFull } from './cmd-niveau-34';
function _getMoveTarget(move: number, override: number): number {
  return _GetMoveTargetFull(move, override);
}

// 1:1 décomp `RecordAbilityBattle` — wired via util.ts.
import { RecordAbilityBattle as _recordAbilityBattleFullN27 } from './util';
function _recordAbilityBattle(battler: number, ability: number): void {
  _recordAbilityBattleFullN27(battler, ability);
}

// 1:1 décomp `GetSetPokedexFlag(nationalDexNo, caseID)` (pokedex.c:1900-1959).
// L'auto-gen `pokedex-all-auto.ts` use bare globals (FLAG_GET_SEEN, FLAG_SET_*,
// gSaveBlock2Ptr) sans imports → `ReferenceError` runtime. On port 1:1 ici
// avec accès via globalThis pour gSaveBlock2Ptr.
const FLAG_GET_SEEN = 0;
const FLAG_GET_CAUGHT_AC = 1;
const FLAG_SET_SEEN_AC = 2;
const FLAG_SET_CAUGHT_AC = 3;
void FLAG_GET_CAUGHT_AC; void FLAG_SET_SEEN_AC; void FLAG_SET_CAUGHT_AC;

/** 1:1 décomp `GetSetPokedexFlag(natDexNum, caseId)` (pokedex.c:1900-1959).
 *  Pour notre POC : implémentation locale lue depuis globalThis.gSaveBlock2Ptr.
 *  Si non-disponible (= avant save load), retourne 0 (= pas seen / pas caught). */
function _getSetPokedexFlag(natDexNum: number, caseId: number): number {
  if (natDexNum <= 0) return 0;
  const sb2 = (globalThis as { gSaveBlock2Ptr?: {
    pokedex?: { seen?: Uint8Array | number[]; owned?: Uint8Array | number[] };
  } }).gSaveBlock2Ptr;
  if (!sb2?.pokedex) return 0;  // pas de save load → silent.
  const idx = (natDexNum - 1) >>> 3;
  const bit = 1 << ((natDexNum - 1) & 7);
  if (caseId === FLAG_GET_SEEN) {
    return (sb2.pokedex.seen?.[idx] ?? 0) & bit ? 1 : 0;
  }
  if (caseId === FLAG_GET_CAUGHT_AC) {
    return (sb2.pokedex.owned?.[idx] ?? 0) & bit ? 1 : 0;
  }
  if (caseId === FLAG_SET_SEEN_AC) {
    if (sb2.pokedex.seen) sb2.pokedex.seen[idx] = ((sb2.pokedex.seen[idx] ?? 0) | bit) & 0xFF;
    return 0;
  }
  if (caseId === FLAG_SET_CAUGHT_AC) {
    if (sb2.pokedex.owned) sb2.pokedex.owned[idx] = ((sb2.pokedex.owned[idx] ?? 0) | bit) & 0xFF;
    if (sb2.pokedex.seen) sb2.pokedex.seen[idx] = ((sb2.pokedex.seen[idx] ?? 0) | bit) & 0xFF;
    return 0;
  }
  return 0;
}

/** 1:1 décomp `HandleSetPokedexFlag(natDexNum, caseId, personality)` (pokemon.c:6929-6940).
 *  Set caught/seen flag puis si caught + UNOWN/SPINDA → store personality. */
function _handleSetPokedexFlag(natDexNum: number, caseId: number, personality: number): void {
  // FLAG_SET_SEEN = 2, FLAG_GET_SEEN = 0 ; FLAG_SET_CAUGHT = 3, FLAG_GET_CAUGHT = 1.
  const getFlagCaseId = caseId === 2 /* FLAG_SET_SEEN */ ? 0 /* FLAG_GET_SEEN */ : 1 /* FLAG_GET_CAUGHT */;
  if (!_getSetPokedexFlag(natDexNum, getFlagCaseId)) {
    _getSetPokedexFlag(natDexNum, caseId);
    // SPECIES_UNOWN = 201, SPECIES_SPINDA = 327 (= include/constants/species.h).
    // NationalPokedexNumToSpecies = identity en Gen 3 pour les 386 premiers.
    const species = natDexNum;
    const sb2 = (globalThis as { gSaveBlock2Ptr?: { pokedex?: {
      unownPersonality?: number; spindaPersonality?: number;
    } } }).gSaveBlock2Ptr;
    if (sb2?.pokedex) {
      if (species === 201 /* SPECIES_UNOWN */) sb2.pokedex.unownPersonality = personality >>> 0;
      if (species === 327 /* SPECIES_SPINDA */) sb2.pokedex.spindaPersonality = personality >>> 0;
    }
  }
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
