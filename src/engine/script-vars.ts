/**
 * script-vars.ts — flags + variables global state pour le script engine.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_data.c` (= FlagSet, FlagGet,
 *     FlagClear, VarSet, VarGet, GetVarPointer)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/event_data.h` (= macros / IDs)
 *
 * Phase 4.5 MVP : storage simple en Set (flags) + Map (vars), keyed par
 * symbol name (FLAG_VISITED_LITTLEROOT_TOWN, VAR_LITTLEROOT_INTRO_STATE).
 * Pas de save persistence pour l'instant — tout reset au reload.
 */

/** Set des flags actifs. Présence dans le set = TRUE, absence = FALSE.
 *  1:1 décomp `gSaveBlock1Ptr->flags` array de bits. */
const gFlags = new Set<string>();

/** Map des variables actives. Si pas dans la map → return 0 (= 1:1 décomp
 *  default). Variables stockées comme u16 dans le décomp ; ici number JS. */
const gVars = new Map<string, number>();

// ─── Flag API (1:1 décomp event_data.c) ──────────────────────────────────────

/** 1:1 décomp `FlagSet(flag)` : set le flag à TRUE. */
export function FlagSet(flag: string): void {
  gFlags.add(flag);
}

/** 1:1 décomp `FlagClear(flag)` : set le flag à FALSE. */
export function FlagClear(flag: string): void {
  gFlags.delete(flag);
}

/** 1:1 décomp `FlagGet(flag)` : returns TRUE si flag set. */
export function FlagGet(flag: string): boolean {
  return gFlags.has(flag);
}

// ─── Var API (1:1 décomp event_data.c) ───────────────────────────────────────

/** 1:1 décomp `VarSet(varId, value)`. */
export function VarSet(varId: string, value: number): void {
  gVars.set(varId, value & 0xFFFF);
}

/** 1:1 décomp `VarGet(varId)`. Returns 0 si var pas définie.
 *  Si arg est un nombre (= immediate), return le nombre directement (= utilisé
 *  par compare opcodes qui prennent var ou immediate). */
export function VarGet(varId: string): number {
  // Si l'arg ressemble à un nombre / hex, le return tel quel (= immediate).
  if (/^-?\d+$/.test(varId)) return parseInt(varId, 10) & 0xFFFF;
  if (/^0x[0-9a-fA-F]+$/.test(varId)) return parseInt(varId, 16) & 0xFFFF;
  return gVars.get(varId) ?? 0;
}

// ─── Special vars (1:1 décomp) ───────────────────────────────────────────────

/** `gSpecialVar_Result` (= VAR_RESULT). Set par checkflag, checkplayergender,
 *  yesnobox, etc. Read par goto_if_eq, call_if_eq. */
export const gSpecialVar = {
  Result: 0,
  /** 1:1 décomp `gSpecialVar_LastTalked` : localId du NPC interacted. Set par
   *  CheckForObjectEventInteractive avant ScriptContext_SetupScript. */
  LastTalked: 0,
};

/** 1:1 décomp `gSelectedObjectEvent` : index dans gObjectEvents du NPC en
 *  interaction. Set au début de l'interact, read par ScrCmd_lock,
 *  ScrCmd_faceplayer, ScrCmd_release. */
export const gSelectedObjectEvent = { index: 0 };

/** 1:1 décomp `ctx->comparisonResult` (= LESS_THAN/EQUAL/GREATER_THAN, used
 *  par goto_if_eq etc. après `compare`). 0=LT, 1=EQ, 2=GT. */
export const COMPARE_LT = 0;
export const COMPARE_EQ = 1;
export const COMPARE_GT = 2;

export function Compare(a: number, b: number): number {
  if (a < b) return COMPARE_LT;
  if (a > b) return COMPARE_GT;
  return COMPARE_EQ;
}

/** Reset complet (= pour debugging / map reload). */
export function ResetScriptVars(): void {
  gFlags.clear();
  gVars.clear();
  gSpecialVar.Result = 0;
  gSpecialVar.LastTalked = 0;
  gSelectedObjectEvent.index = 0;
}

/** Expose pour debugging en console. */
(globalThis as Record<string, unknown>).__gFlags = gFlags;
(globalThis as Record<string, unknown>).__gVars = gVars;
