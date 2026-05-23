/**
 * battle/ai/ai-state.ts — 1:1 décomp AI thinking state + bytecode infra.
 *
 * Source de vérité (1:1 décomp) :
 *   - D:/Projet 1/decomps/pokeemeraude/src/battle_ai_script_commands.c
 *   - D:/Projet 1/decomps/pokeemeraude/include/battle.h
 *       (struct AI_ThinkingStruct / BattleHistory / BattleScriptsStack / UsedMoves)
 *   - D:/Projet 1/decomps/pokeemeraude/include/battle_ai_script_commands.h
 *   - D:/Projet 1/decomps/pokeemeraude/include/constants/battle_ai.h
 *   - D:/Projet 1/decomps/pokeemeraude/data/battle_ai_scripts.s
 *       (gBattleAI_ScriptsTable[32])
 *
 * Le bytecode AI (gBattleAI_ScriptsTable[] + tous les scripts AI_CheckBadMove/
 * AI_TryToFaint/AI_CheckViability/etc.) est auto-extrait 1:1 dans
 * `decomp-data/auto-asm-bytecode/data/battle_ai_scripts-bytecode.ts`
 * (ops=1756, bytes=8727, labels=555, unknownOps=0). Les pointeurs y sont
 * encodés en u32 little-endian = offset absolu dans BYTECODE — exactement
 * comme le battle script interpreter (cf. script-interpreter.ts `readWord`).
 *
 * On NE relit PAS la table de pointeurs depuis le bytecode : on résout
 * `gBattleAI_ScriptsTable[bit]` par nom de label via LABELS (= même pattern
 * que `BATTLE_SCRIPTS_FOR_MOVE_EFFECTS` du battle script interpreter).
 */

import { MAX_MON_MOVES } from '../constants';
import { MAX_BATTLERS_COUNT } from '../state';
// Constantes numériques résolues, importées de l'auto-extrait décomp 1:1
// (constants/battle_ai.h). Les flags `1 << n` n'y sont capturés que comme
// chaînes `_EXPR`, donc définis ici avec citation header (= convention
// codebase pour les #define en shift, cf. battle/constants.ts).
import {
  AI_TARGET as _AI_TARGET,
  AI_USER as _AI_USER,
  AI_TARGET_PARTNER as _AI_TARGET_PARTNER,
  AI_USER_PARTNER as _AI_USER_PARTNER,
  AI_TYPE1_TARGET as _AI_TYPE1_TARGET,
  AI_TYPE1_USER as _AI_TYPE1_USER,
  AI_TYPE2_TARGET as _AI_TYPE2_TARGET,
  AI_TYPE2_USER as _AI_TYPE2_USER,
  AI_TYPE_MOVE as _AI_TYPE_MOVE,
  AI_EFFECTIVENESS_x4 as _AI_EFF_x4,
  AI_EFFECTIVENESS_x2 as _AI_EFF_x2,
  AI_EFFECTIVENESS_x1 as _AI_EFF_x1,
  AI_EFFECTIVENESS_x0_5 as _AI_EFF_x0_5,
  AI_EFFECTIVENESS_x0_25 as _AI_EFF_x0_25,
  AI_EFFECTIVENESS_x0 as _AI_EFF_x0,
  AI_WEATHER_SUN as _AI_WEATHER_SUN,
  AI_WEATHER_RAIN as _AI_WEATHER_RAIN,
  AI_WEATHER_SANDSTORM as _AI_WEATHER_SANDSTORM,
  AI_WEATHER_HAIL as _AI_WEATHER_HAIL,
  MOVE_POWER_OTHER as _MOVE_POWER_OTHER,
  MOVE_NOT_MOST_POWERFUL as _MOVE_NOT_MOST_POWERFUL,
  MOVE_MOST_POWERFUL as _MOVE_MOST_POWERFUL,
} from '../../decomp-data/include/constants/battle_ai-data';

// ─── Constantes AI (1:1 décomp) ─────────────────────────────────────────────

// battle_ai_script_commands.c:19-22
export const AI_ACTION_DONE = 1 << 0;
export const AI_ACTION_FLEE = 1 << 1;
export const AI_ACTION_WATCH = 1 << 2;
export const AI_ACTION_DO_NOT_ATTACK = 1 << 3;

// battle_ai_script_commands.c:28-34 (enum AIState)
export const AIState_SettingUp = 0;
export const AIState_Processing = 1;
export const AIState_FinishedProcessing = 2;
export const AIState_DoNotProcess = 3;

// include/battle_ai_script_commands.h:6-7
export const AI_CHOICE_FLEE = 4;
export const AI_CHOICE_WATCH = 5;

// constants/battle_ai.h — re-export numériques auto-extraits 1:1
export const AI_TARGET = _AI_TARGET;
export const AI_USER = _AI_USER;
export const AI_TARGET_PARTNER = _AI_TARGET_PARTNER;
export const AI_USER_PARTNER = _AI_USER_PARTNER;
export const AI_TYPE1_TARGET = _AI_TYPE1_TARGET;
export const AI_TYPE1_USER = _AI_TYPE1_USER;
export const AI_TYPE2_TARGET = _AI_TYPE2_TARGET;
export const AI_TYPE2_USER = _AI_TYPE2_USER;
export const AI_TYPE_MOVE = _AI_TYPE_MOVE;
export const AI_EFFECTIVENESS_x4 = _AI_EFF_x4;
export const AI_EFFECTIVENESS_x2 = _AI_EFF_x2;
export const AI_EFFECTIVENESS_x1 = _AI_EFF_x1;
export const AI_EFFECTIVENESS_x0_5 = _AI_EFF_x0_5;
export const AI_EFFECTIVENESS_x0_25 = _AI_EFF_x0_25;
export const AI_EFFECTIVENESS_x0 = _AI_EFF_x0;
export const AI_WEATHER_SUN = _AI_WEATHER_SUN;
export const AI_WEATHER_RAIN = _AI_WEATHER_RAIN;
export const AI_WEATHER_SANDSTORM = _AI_WEATHER_SANDSTORM;
export const AI_WEATHER_HAIL = _AI_WEATHER_HAIL;
/** BUGFIX path : UINT32_MAX. Vanilla laisse funcResult stale (cf. Cmd_get_weather). */
export const AI_WEATHER_NONE = 0xFFFFFFFF;
export const MOVE_POWER_OTHER = _MOVE_POWER_OTHER;
export const MOVE_NOT_MOST_POWERFUL = _MOVE_NOT_MOST_POWERFUL;
export const MOVE_MOST_POWERFUL = _MOVE_MOST_POWERFUL;

// constants/battle_ai.h — AI script flag bits (gTrainers[].aiFlags).
// Capturés `_EXPR` par l'extracteur ; définis ici 1:1 (battle_ai.h:35-52).
export const AI_SCRIPT_CHECK_BAD_MOVE = 1 << 0;
export const AI_SCRIPT_TRY_TO_FAINT = 1 << 1;
export const AI_SCRIPT_CHECK_VIABILITY = 1 << 2;
export const AI_SCRIPT_SETUP_FIRST_TURN = 1 << 3;
export const AI_SCRIPT_RISKY = 1 << 4;
export const AI_SCRIPT_PREFER_POWER_EXTREMES = 1 << 5;
export const AI_SCRIPT_PREFER_BATON_PASS = 1 << 6;
export const AI_SCRIPT_DOUBLE_BATTLE = 1 << 7;
export const AI_SCRIPT_HP_AWARE = 1 << 8;
export const AI_SCRIPT_TRY_SUNNY_DAY_START = 1 << 9;
export const AI_SCRIPT_ROAMING = (1 << 29) >>> 0;
export const AI_SCRIPT_SAFARI = (1 << 30) >>> 0;
export const AI_SCRIPT_FIRST_BATTLE = (1 << 31) >>> 0;

// battle_ai_script_commands.c:265 — sIgnoredPowerfulMoveEffects terminator.
export const IGNORED_MOVES_END = 0xFFFF;

/** 1:1 décomp `data/battle_ai_scripts.s` gBattleAI_ScriptsTable[32]
 *  (= un label par bit d'aiFlags 0..31, bits 10..28 = AI_Ret). */
export const AI_SCRIPTS_TABLE_LABELS: readonly string[] = [
  'AI_CheckBadMove',        // 0  AI_SCRIPT_CHECK_BAD_MOVE
  'AI_TryToFaint',          // 1  AI_SCRIPT_TRY_TO_FAINT
  'AI_CheckViability',      // 2  AI_SCRIPT_CHECK_VIABILITY
  'AI_SetupFirstTurn',      // 3  AI_SCRIPT_SETUP_FIRST_TURN
  'AI_Risky',               // 4  AI_SCRIPT_RISKY
  'AI_PreferPowerExtremes', // 5  AI_SCRIPT_PREFER_POWER_EXTREMES
  'AI_PreferBatonPass',     // 6  AI_SCRIPT_PREFER_BATON_PASS
  'AI_DoubleBattle',        // 7  AI_SCRIPT_DOUBLE_BATTLE
  'AI_HPAware',             // 8  AI_SCRIPT_HP_AWARE
  'AI_TrySunnyDayStart',    // 9  AI_SCRIPT_TRY_SUNNY_DAY_START
  'AI_Ret', 'AI_Ret', 'AI_Ret', 'AI_Ret', 'AI_Ret', // 10..14
  'AI_Ret', 'AI_Ret', 'AI_Ret', 'AI_Ret', 'AI_Ret', // 15..19
  'AI_Ret', 'AI_Ret', 'AI_Ret', 'AI_Ret', 'AI_Ret', // 20..24
  'AI_Ret', 'AI_Ret', 'AI_Ret', 'AI_Ret',           // 25..28
  'AI_Roaming',             // 29 AI_SCRIPT_ROAMING
  'AI_Safari',              // 30 AI_SCRIPT_SAFARI
  'AI_FirstBattle',         // 31 AI_SCRIPT_FIRST_BATTLE
];

// ─── Structs 1:1 décomp (include/battle.h) ──────────────────────────────────

/** 1:1 décomp `struct AI_ThinkingStruct` (battle.h:176-188). */
export interface AI_ThinkingStruct {
  aiState: number;          // u8
  movesetIndex: number;     // u8
  moveConsidered: number;   // u16
  score: number[];          // s8[MAX_MON_MOVES]
  funcResult: number;       // u32
  aiFlags: number;          // u32
  aiAction: number;         // u8
  aiLogicId: number;        // u8
  // filler12[6] — padding décomp, non modélisé
  simulatedRNG: number[];   // u8[MAX_MON_MOVES]
}

/** 1:1 décomp `struct UsedMoves` (battle.h:190-194). */
export interface UsedMoves {
  moves: number[];          // u16[MAX_MON_MOVES]
  unknown: number[];        // u16[MAX_MON_MOVES]
}

/** 1:1 décomp `struct BattleHistory` (battle.h:196-203). */
export interface BattleHistory {
  usedMoves: UsedMoves[];   // [MAX_BATTLERS_COUNT]
  abilities: number[];      // u8[MAX_BATTLERS_COUNT]
  itemEffects: number[];    // u8[MAX_BATTLERS_COUNT]
  trainerItems: number[];   // u16[MAX_BATTLERS_COUNT]
  itemsNo: number;          // u8
}

/** 1:1 décomp `struct BattleScriptsStack` (battle.h:205-209).
 *  `const u8 *ptr[8]` → offsets numériques dans BYTECODE dans notre port. */
export interface BattleScriptsStack {
  ptr: number[];            // [8]
  size: number;             // u8
}

function _blankAiThinking(): AI_ThinkingStruct {
  return {
    aiState: 0,
    movesetIndex: 0,
    moveConsidered: 0,
    score: new Array(MAX_MON_MOVES).fill(0),
    funcResult: 0,
    aiFlags: 0,
    aiAction: 0,
    aiLogicId: 0,
    simulatedRNG: new Array(MAX_MON_MOVES).fill(0),
  };
}

function _blankUsedMoves(): UsedMoves {
  return {
    moves: new Array(MAX_MON_MOVES).fill(0),
    unknown: new Array(MAX_MON_MOVES).fill(0),
  };
}

function _blankBattleHistory(): BattleHistory {
  return {
    usedMoves: Array.from({ length: MAX_BATTLERS_COUNT }, () => _blankUsedMoves()),
    abilities: new Array(MAX_BATTLERS_COUNT).fill(0),
    itemEffects: new Array(MAX_BATTLERS_COUNT).fill(0),
    trainerItems: new Array(MAX_BATTLERS_COUNT).fill(0),
    itemsNo: 0,
  };
}

/** 1:1 décomp `AI_THINKING_STRUCT` (= gBattleResources->ai). */
export const gAiThinkingStruct: AI_ThinkingStruct = _blankAiThinking();

/** 1:1 décomp `BATTLE_HISTORY` (= gBattleResources->battleHistory). */
export const gBattleHistory: BattleHistory = _blankBattleHistory();

/** 1:1 décomp `gBattleResources->AI_ScriptsStack`. */
export const gAI_ScriptsStack: BattleScriptsStack = { ptr: new Array(8).fill(0), size: 0 };

/** `for (i=0; i<sizeof(struct AI_ThinkingStruct); i++) data[i] = 0;`
 *  (battle_ai_script_commands.c:319-320). */
export function clearAiThinkingStruct(): void {
  Object.assign(gAiThinkingStruct, _blankAiThinking());
}

/** `for (i=0; i<sizeof(struct BattleHistory); i++) data[i] = 0;`
 *  (battle_ai_script_commands.c:288-289). */
export function clearBattleHistory(): void {
  Object.assign(gBattleHistory, _blankBattleHistory());
}

// ─── gAIScriptPtr / sBattler_AI (EWRAM_DATA, battle_ai_script_commands.c:154-155) ───

/** 1:1 décomp `EWRAM_DATA const u8 *gAIScriptPtr` — offset dans BYTECODE. */
export let gAIScriptPtr = 0;
export function setAiScriptPtr(v: number): void { gAIScriptPtr = v; }

/** 1:1 décomp `EWRAM_DATA static u8 sBattler_AI`. */
export let sBattler_AI = 0;
export function setBattlerAI(v: number): void { sBattler_AI = v; }

// ─── Bytecode storage (mirror script-interpreter.ts) ────────────────────────

let _AI_BYTECODE: Uint8Array | null = null;
let _AI_LABELS: Record<string, number> = {};

/** Charge le bytecode AI auto-extrait 1:1. Idempotent. */
export async function loadAiScriptBytecode(): Promise<void> {
  if (_AI_BYTECODE) return;
  const mod = await import(
    './../../decomp-data/auto-asm-bytecode/data/battle_ai_scripts-bytecode'
  );
  _AI_BYTECODE = new Uint8Array(mod.BYTECODE as readonly number[]);
  _AI_LABELS = { ...(mod.LABELS as Record<string, number>) };
  console.log(
    `[battle/ai] loaded ${_AI_BYTECODE.length} bytes, ${Object.keys(_AI_LABELS).length} labels`,
  );
}

export function aiBytecodeLoaded(): boolean {
  return _AI_BYTECODE !== null;
}

/** Resolve un label AI string → byte offset dans BYTECODE (-1 si introuvable). */
export function getAiScriptOffset(label: string): number {
  return _AI_LABELS[label] ?? -1;
}

/** 1:1 décomp `gBattleAI_ScriptsTable[logicId]` → offset BYTECODE.
 *  Résolu par nom de label (= pas de relecture de table de pointeurs). */
export function getAiScriptsTableEntry(logicId: number): number {
  const label = AI_SCRIPTS_TABLE_LABELS[logicId];
  if (label === undefined) return -1;
  return getAiScriptOffset(label);
}

// ─── Reader helpers (analogue T1_READ_* du décomp) ──────────────────────────
//
// Les commandes AI indexent RELATIVEMENT à gAIScriptPtr et avancent
// manuellement (gAIScriptPtr += N), contrairement au battle script
// interpreter qui stream-read. On expose donc des accesseurs par offset.

/** `gAIScriptPtr[off]` — u8 à l'offset absolu (gAIScriptPtr + off). */
export function aiByteAt(off: number): number {
  if (!_AI_BYTECODE) return 0;
  return _AI_BYTECODE[gAIScriptPtr + off] | 0;
}

/** Lit u8 à une adresse absolue arbitraire dans BYTECODE (= `*ptr`). */
export function aiByteAtAddr(addr: number): number {
  if (!_AI_BYTECODE) return 0;
  return _AI_BYTECODE[addr] | 0;
}

/** `T1_READ_16(gAIScriptPtr + off)` — u16 little-endian. */
export function aiRead16(off: number): number {
  if (!_AI_BYTECODE) return 0;
  const p = gAIScriptPtr + off;
  return (_AI_BYTECODE[p] | (_AI_BYTECODE[p + 1] << 8)) >>> 0;
}

/** `T1_READ_16` à une adresse absolue (= `*(u16*)ptr`). */
export function aiRead16AtAddr(addr: number): number {
  if (!_AI_BYTECODE) return 0;
  return (_AI_BYTECODE[addr] | (_AI_BYTECODE[addr + 1] << 8)) >>> 0;
}

/** `T1_READ_32(gAIScriptPtr + off)` — u32 little-endian (status masks). */
export function aiRead32(off: number): number {
  if (!_AI_BYTECODE) return 0;
  const p = gAIScriptPtr + off;
  return (
    (_AI_BYTECODE[p] |
      (_AI_BYTECODE[p + 1] << 8) |
      (_AI_BYTECODE[p + 2] << 16) |
      (_AI_BYTECODE[p + 3] << 24)) >>>
    0
  );
}

/** `T1_READ_PTR(gAIScriptPtr + off)` — u32 LE = offset absolu dans BYTECODE
 *  (identique à l'encodage du battle script interpreter). */
export function aiReadPtr(off: number): number {
  return aiRead32(off);
}
