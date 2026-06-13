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


// ─── gAIScriptPtr / sBattler_AI (EWRAM_DATA, battle_ai_script_commands.c:154-155) ───

/** 1:1 décomp `EWRAM_DATA const u8 *gAIScriptPtr` — offset dans BYTECODE. */
export let gAIScriptPtr = 0;
export function setAiScriptPtr(v: number): void { gAIScriptPtr = v; }


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
