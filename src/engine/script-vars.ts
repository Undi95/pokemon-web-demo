/**
 * script-vars.ts — flags + variables global state pour le script engine.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_data.c:164-233` (= FlagSet,
 *     FlagGet, FlagClear, VarSet, VarGet, GetVarPointer, GetFlagPointer)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/event_data.h` (= macros / IDs)
 *
 * 1:1 strict : tous les flags/vars vivent dans `gSaveBlock1Ptr->flags / vars`.
 * Décomp `GetFlagPointer(id)` returns `&gSaveBlock1Ptr->flags[id / 8]`, le
 * `FlagSet` set le bit `1 << (id & 7)`. Notre port stocke chaque flag par
 * name (= simplification structurelle, mais comportementalement identique :
 * un bit du décomp = une entry de notre Record<string, boolean>).
 *
 * 2026-05-23 : élimination du round-trip via gameState (= ancien wrapper non-
 * 1:1). Maintenant 1:1 direct gSaveBlock1Ptr. Brise aussi le cycle ESM
 * script-vars → game-state.
 */

import { gSaveBlock1Ptr } from './save-block-state';
import { ResetSaveBlocks } from './save-system';
import { resolveDecompConstant } from './decomp-constants';

// ─── Flag API (1:1 décomp event_data.c:206-233) ──────────────────────────────

/** 1:1 décomp `FlagSet(id)` (event_data.c:206-212) :
 *    u8 *ptr = GetFlagPointer(id);
 *    if (ptr) *ptr |= 1 << (id & 7);
 *  Notre port : `gSaveBlock1Ptr->flags` est `Record<string, boolean>` indexé
 *  par name de flag (= u8 array bitfield indexé par id/8 dans ROM). */
export function FlagSet(flag: string): void {
  gSaveBlock1Ptr.flags[flag] = true;
}

/** 1:1 décomp `FlagClear(id)` (event_data.c:214-220) :
 *    u8 *ptr = GetFlagPointer(id);
 *    if (ptr) *ptr &= ~(1 << (id & 7)); */
export function FlagClear(flag: string): void {
  delete gSaveBlock1Ptr.flags[flag];
}

/** 1:1 décomp `FlagGet(id)` (event_data.c:222-233) :
 *    u8 *ptr = GetFlagPointer(id);
 *    if (!ptr) return FALSE;
 *    if (!(((*ptr) >> (id & 7)) & 1)) return FALSE;
 *    return TRUE; */
export function FlagGet(flag: string): boolean {
  return !!gSaveBlock1Ptr.flags[flag];
}

// ─── Var API (1:1 décomp event_data.c:164-189) ───────────────────────────────

/** 1:1 décomp `VarSet(id, value)` (event_data.c:182-189) :
 *    u16 *ptr = GetVarPointer(id);
 *    if (!ptr) return FALSE;
 *    *ptr = value;
 *  Notre port : `gSaveBlock1Ptr->vars` est `Record<string, number>` indexé
 *  par name de var (= u16 array indexé par id-VARS_START dans ROM). */
export function VarSet(varId: string, value: number): void {
  gSaveBlock1Ptr.vars[varId] = value & 0xFFFF;
}

/** 1:1 décomp `VarGet(id)` (event_data.c:174-180) :
 *    u16 *ptr = GetVarPointer(id);
 *    if (!ptr) return id;        // 1:1 décomp : if id < VARS_START, return id
 *    return *ptr;
 *
 *  Notre port reçoit le name string : si c'est un immediate numérique → return.
 *  Si c'est une var name (= VAR_xxx) → lookup `gSaveBlock1Ptr.vars[name]`.
 *  Si c'est une constant name (= METATILE_X, MALE, etc) → resolveDecompConstant
 *  (= simule le compile-time literal resolution du décomp).
 *
 *  Special var `VAR_FACING` (= 0x800C dans le décomp) pointe vers
 *  `gSpecialVar_Facing` (= field_control_avatar.c:282,305) — facing direction
 *  du player au moment de l'interact. Notre port lit gPlayerAvatar.facing
 *  via globalThis (= évite cycle ESM script-vars ↔ player-avatar). */
export function VarGet(varId: string): number {
  // Si l'arg ressemble à un nombre / hex, le return tel quel (= immediate).
  if (/^-?\d+$/.test(varId)) return parseInt(varId, 10) & 0xFFFF;
  if (/^0x[0-9a-fA-F]+$/.test(varId)) return parseInt(varId, 16) & 0xFFFF;
  // Special vars resolved at runtime (= 1:1 décomp gSpecialVars[]).
  if (varId === 'VAR_FACING') {
    // 1:1 décomp event_data.c:24 `EWRAM_DATA u16 gSpecialVar_Facing = 0;`
    // Set par field-control-avatar.ts (= 1:1 field_control_avatar.c:282,305)
    // au moment de starting un script d'interaction. Read direct via gSpecialVar.Facing.
    return gSpecialVar.Facing;
  }
  // 1:1 décomp event_data.c:174-180 : `if (id < VARS_START) return id`.
  // Sur ROM les constants comme METATILE_X / MALE / FEMALE sont resolved au
  // compile time (= literal u16 inline dans le bytecode). Notre transpiler
  // garde le NAME → on resolve ici via la table des constants extraites depuis
  // les headers décomp. Audit session 125 : sans ça, setmetatile écrivait 0
  // (= wall) sur (4,2) → player can't exit truck après option menu cycle.
  if (varId.startsWith('VAR_')) {
    // Var symbolique → lookup direct gSaveBlock1Ptr.vars (= 1:1 décomp
    // gSaveBlock1Ptr->vars[id-0x4000]).
    return gSaveBlock1Ptr.vars[varId] ?? 0;
  }
  // Constant resolution (METATILE_*, MALE/FEMALE, FLAG_*, ITEM_*, MUS_*, etc).
  const constVal = resolveDecompConstant(varId);
  if (constVal !== undefined) return constVal & 0xFFFF;
  // Unknown : fallback lookup direct gSaveBlock1Ptr.vars (= returns 0 if not set).
  return gSaveBlock1Ptr.vars[varId] ?? 0;
}

// ─── Special vars (1:1 décomp) ───────────────────────────────────────────────

/** `gSpecialVar_Result` (= VAR_RESULT, 0x800D dans le décomp). Set par checkflag,
 *  checkplayergender, yesnobox, etc. Read par goto_if_eq, call_if_eq.
 *
 *  1:1 strict : Result est un getter/setter sur la var VAR_RESULT dans
 *  gSaveBlock1Ptr.vars direct. Ça permet de read VAR_RESULT via VarGet AND
 *  via gSpecialVar.Result indistinctement (= 1:1 décomp où c'est la même
 *  chose). Critique pour goto_if_eq VAR_RESULT, MALE qui était cassé avant
 *  (= deux stores séparés faisaient que VarGet(VAR_RESULT) = 0 toujours).
 *
 *  LastTalked = gSpecialVar_LastTalked (= localId du NPC interacted). Set par
 *  CheckForObjectEventInteractive avant ScriptContext_SetupScript. */
export const gSpecialVar = {
  get Result(): number { return gSaveBlock1Ptr.vars['VAR_RESULT'] ?? 0; },
  set Result(value: number) { gSaveBlock1Ptr.vars['VAR_RESULT'] = value & 0xFFFF; },
  get LastTalked(): number { return gSaveBlock1Ptr.vars['VAR_LAST_TALKED'] ?? 0; },
  set LastTalked(value: number) { gSaveBlock1Ptr.vars['VAR_LAST_TALKED'] = value & 0xFFFF; },
  /** 1:1 décomp `EWRAM_DATA u16 gSpecialVar_Facing = 0` (event_data.c:24).
   *  Set par `field_control_avatar.c:282,305` quand le player trigger un
   *  script d'interaction (= snapshot direction du player à ce moment).
   *  Read par scripts via VarGet('VAR_FACING'). Notre port stocke direct
   *  ici (= module-level), sans passer par gSaveBlock1Ptr (le décomp non
   *  plus — c'est un EWRAM global séparé). */
  Facing: 0,
  /** 1:1 décomp `gSpecialVar_ItemId` (item_menu.h:87) — u16 global set par
   *  `Task_BagMenu_HandleInput` quand A pressé sur un item, lu par les
   *  handlers context-menu (UTILIS./DONNER/JETER/etc.) + scripts give-item. */
  ItemId: 0,
  /** 1:1 décomp `gSpecialVar_0x8005` — slot generic (item_menu.c utilise pour
   *  Apprentice/FavorLady/QuizLady). */
  Aux: 0,
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

/** Reset complet (= pour debugging / map reload). Appelle ResetSaveBlocks
 *  direct (= 1:1 save-system). Note : ça reset AUSSI playerName/gender/bag/
 *  etc — donc à utiliser avec prudence. Pour reset script vars seulement,
 *  écrire ici un helper dédié. */
export function ResetScriptVars(): void {
  ResetSaveBlocks();
  gSelectedObjectEvent.index = 0;
}

// ─── Debug exposure ─────────────────────────────────────────────────────────
// Compat avec ancien code qui lit window.__gFlags / window.__gVars depuis console.
// Lecture directe gSaveBlock1Ptr (= 1:1 décomp event_data.c storage location).
if (typeof window !== 'undefined') {
  Object.defineProperty(window, '__gFlags', {
    configurable: true,
    get() {
      const flags = gSaveBlock1Ptr.flags;
      const names = Object.keys(flags);
      return {
        size: names.length,
        has: (flag: string) => !!flags[flag],
        forEach: (cb: (flag: string) => void) => names.forEach(cb),
      };
    },
  });
  Object.defineProperty(window, '__gVars', {
    configurable: true,
    get() {
      const vars = gSaveBlock1Ptr.vars;
      return {
        size: Object.keys(vars).length,
        get: (varId: string) => vars[varId] ?? 0,
        set: (varId: string, value: number) => { vars[varId] = value & 0xFFFF; },
        has: (varId: string) => varId in vars,
      };
    },
  });
}
