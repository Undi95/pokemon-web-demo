/**
 * script-vars.ts — flags + variables global state pour le script engine.
 *
 * Source de vérité (1:1 décomp) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/event_data.c` (= FlagSet, FlagGet,
 *     FlagClear, VarSet, VarGet, GetVarPointer)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/event_data.h` (= macros / IDs)
 *
 * Phase 4.10 unification : tous les flags/vars vivent dans `gameState.data`
 * (= 1:1 décomp `gSaveBlock1Ptr->flags / vars`). Cf. `game-state.ts`. Avant ce
 * commit, gFlags Set + gVars Map étaient en mémoire seule → état perdu sur F5
 * + non-persisté en localStorage. Maintenant, tout passe par gameState et
 * survit au reload via gameState.save() (= called au map switch + manually).
 */

import { gameState } from './game-state';

// ─── Flag API (1:1 décomp event_data.c) ──────────────────────────────────────

/** 1:1 décomp `FlagSet(flag)` : set le flag à TRUE. */
export function FlagSet(flag: string): void {
  gameState.setFlag(flag);
}

/** 1:1 décomp `FlagClear(flag)` : set le flag à FALSE. */
export function FlagClear(flag: string): void {
  gameState.clearFlag(flag);
}

/** 1:1 décomp `FlagGet(flag)` : returns TRUE si flag set. */
export function FlagGet(flag: string): boolean {
  return gameState.hasFlag(flag);
}

// ─── Var API (1:1 décomp event_data.c) ───────────────────────────────────────

/** 1:1 décomp `VarSet(varId, value)`. */
export function VarSet(varId: string, value: number): void {
  gameState.setVar(varId, value & 0xFFFF);
}

/** 1:1 décomp `VarGet(varId)`. Returns 0 si var pas définie.
 *  Si arg est un nombre (= immediate), return le nombre directement (= utilisé
 *  par compare opcodes qui prennent var ou immediate).
 *  Pour les constantes connues (MALE/FEMALE/etc) qui ne sont pas des var
 *  symboliques, return 0 (= vérifie via gameState qui retourne 0 par défaut). */
export function VarGet(varId: string): number {
  // Si l'arg ressemble à un nombre / hex, le return tel quel (= immediate).
  if (/^-?\d+$/.test(varId)) return parseInt(varId, 10) & 0xFFFF;
  if (/^0x[0-9a-fA-F]+$/.test(varId)) return parseInt(varId, 16) & 0xFFFF;
  return gameState.getVar(varId);
}

// ─── Special vars (1:1 décomp) ───────────────────────────────────────────────

/** `gSpecialVar_Result` (= VAR_RESULT, 0x800D dans le décomp). Set par checkflag,
 *  checkplayergender, yesnobox, etc. Read par goto_if_eq, call_if_eq.
 *
 *  Phase 4.10 unification : Result est désormais un getter/setter sur la var
 *  VAR_RESULT dans gameState. Ça permet de read VAR_RESULT via VarGet AND via
 *  gSpecialVar.Result indistinctement (= 1:1 décomp où c'est la même chose).
 *  Critique pour goto_if_eq VAR_RESULT, MALE qui était cassé avant (= deux
 *  stores séparés faisaient que VarGet(VAR_RESULT) = 0 toujours).
 *
 *  LastTalked = gSpecialVar_LastTalked (= localId du NPC interacted). Set par
 *  CheckForObjectEventInteractive avant ScriptContext_SetupScript. */
export const gSpecialVar = {
  get Result(): number { return gameState.getVar('VAR_RESULT'); },
  set Result(value: number) { gameState.setVar('VAR_RESULT', value & 0xFFFF); },
  get LastTalked(): number { return gameState.getVar('VAR_LAST_TALKED'); },
  set LastTalked(value: number) { gameState.setVar('VAR_LAST_TALKED', value & 0xFFFF); },
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

/** Reset complet (= pour debugging / map reload). Délègue à gameState.reset.
 *  Note : ça reset AUSSI playerName/gender/bag/etc — donc à utiliser avec
 *  prudence. Pour reset script vars seulement, écrire ici un helper dédié. */
export function ResetScriptVars(): void {
  gameState.reset();
  gSelectedObjectEvent.index = 0;
}

// ─── Debug exposure ─────────────────────────────────────────────────────────
// Compat avec ancien code qui lit window.__gFlags / window.__gVars depuis console.
// Maintenant ces valeurs viennent de gameState. On expose des proxies qui font le
// pont au runtime.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, '__gFlags', {
    configurable: true,
    get() {
      const names = gameState.getAllFlagNames();
      return {
        size: names.length,
        has: (flag: string) => gameState.hasFlag(flag),
        forEach: (cb: (flag: string) => void) => names.forEach(cb),
      };
    },
  });
  Object.defineProperty(window, '__gVars', {
    configurable: true,
    get() {
      const all = gameState.getAllVars();
      return {
        size: Object.keys(all).length,
        get: (varId: string) => gameState.getVar(varId),
        set: (varId: string, value: number) => gameState.setVar(varId, value),
        has: (varId: string) => varId in all,
      };
    },
  });
}
