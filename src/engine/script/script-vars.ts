/**
 * script-vars.ts — BRIDGE nom→id vers le miroir 1:1 `src/game/event_data.ts`.
 *
 * Migration miroir 2026-06-05 : le stockage flags/vars est désormais 1:1 décomp
 * (bit-packé / indexé par id, dans gSaveBlock1Ptr.flags/vars = number[]). Ce
 * fichier RÉSOUT les noms `FLAG_X`/`VAR_X` → id numérique (via les tables résolues
 * `src/game/include/constants/flags.ts`/`vars.ts`) puis appelle les fonctions du
 * miroir par id. Les callers existants (string-based) continuent de marcher.
 *
 * Fallback `_legacy*` : pour un nom non présent dans les tables résolues (rare),
 * on garde un stockage name-keyed séparé → zéro régression.
 */

import * as ED from '../../../include/event_data';
import * as FLAGS from '../../../include/constants/flags';
import * as VARS from '../../../include/constants/vars';
import { resolveDecompConstant } from '../../../harness/runtime/decomp-constants';
import { ResetSaveBlocks } from '../../save';

const _FLAGS = FLAGS as unknown as Record<string, number>;
const _VARS = VARS as unknown as Record<string, number>;

// Fallback pour les noms non résolus (anti-régression).
const _legacyFlags = new Set<string>();
const _legacyVars = new Map<string, number>();

// ─── Flag API (bridge → miroir event_data.c:206-233) ─────────────────────────
function _flagId(flag: string | number): number | null {
  if (typeof flag === 'number') return flag;
  const v = _FLAGS[flag];
  return typeof v === 'number' ? v : null;
}

/** 1:1 décomp `FlagSet(id)`. Accepte un nom (résolu) ou un id numérique. */
export function FlagSet(flag: string | number): void {
  const id = _flagId(flag);
  if (id !== null) ED.FlagSet(id);
  else if (typeof flag === 'string') _legacyFlags.add(flag);
}

/** 1:1 décomp `FlagClear(id)`. */
export function FlagClear(flag: string | number): void {
  const id = _flagId(flag);
  if (id !== null) ED.FlagClear(id);
  else if (typeof flag === 'string') _legacyFlags.delete(flag);
}

/** 1:1 décomp `FlagGet(id)`. */
export function FlagGet(flag: string | number): boolean {
  const id = _flagId(flag);
  if (id !== null) return ED.FlagGet(id);
  return typeof flag === 'string' ? _legacyFlags.has(flag) : false;
}

// ─── Var API (bridge → miroir event_data.c:164-189) ──────────────────────────
function _varId(varId: string): number | null {
  const v = _VARS[varId];
  return typeof v === 'number' ? v : null;
}

/** 1:1 décomp `VarSet(id, value)`. */
export function VarSet(varId: string, value: number): void {
  const id = _varId(varId);
  if (id !== null) ED.VarSet(id, value);
  else _legacyVars.set(varId, value & 0xFFFF);
}

/** 1:1 décomp `VarGet(id)`. Gère aussi : immédiats numériques, et constantes
 *  non-VAR (METATILE_X, MALE…) résolues en littéral (le décomp les inline au
 *  compile-time ; notre transpiler garde le nom). */
export function VarGet(varId: string): number {
  if (/^-?\d+$/.test(varId)) return parseInt(varId, 10) & 0xFFFF;
  if (/^0x[0-9a-fA-F]+$/.test(varId)) return parseInt(varId, 16) & 0xFFFF;
  const id = _varId(varId);
  if (id !== null) return ED.VarGet(id);
  // Constante non-VAR (literal compile-time décomp).
  const c = resolveDecompConstant(varId);
  if (c !== undefined) return c & 0xFFFF;
  return _legacyVars.get(varId) ?? 0;
}

// ─── Special vars (1:1 décomp — backés par le miroir via leur id) ────────────
/** `gSpecialVar_Result/LastTalked/Facing` = special vars (0x800D/0x800F/0x800C)
 *  → routés vers `gSpecialVars` par le miroir. ItemId/Aux = globals séparés
 *  (item_menu.h), gardés en champs simples. */
export const gSpecialVar = {
  get Result(): number { return ED.VarGet(VARS.VAR_RESULT); },
  set Result(v: number) { ED.VarSet(VARS.VAR_RESULT, v); },
  get LastTalked(): number { return ED.VarGet(VARS.VAR_LAST_TALKED); },
  set LastTalked(v: number) { ED.VarSet(VARS.VAR_LAST_TALKED, v); },
  get Facing(): number { return ED.VarGet(VARS.VAR_FACING); },
  set Facing(v: number) { ED.VarSet(VARS.VAR_FACING, v); },
  /** 1:1 décomp `gSpecialVar_ItemId` = `gSpecialVars[VAR_ITEM_ID - SPECIAL_VARS_START]`
   *  (event_data.c GetVarPointer ; VAR_ITEM_ID = 0x800E) → MÊME stockage que la var
   *  VAR_ITEM_ID. Routé via la var (et non un champ séparé) pour que les opcodes
   *  script `goto_if_eq VAR_ITEM_ID` / `removeitem VAR_ITEM_ID` voient ce que le sac
   *  écrit (Bag_ChooseBerry → gSpecialVar.ItemId), 1:1 décomp. */
  get ItemId(): number { return ED.VarGet(VARS.VAR_ITEM_ID); },
  set ItemId(v: number) { ED.VarSet(VARS.VAR_ITEM_ID, v); },
  /** 1:1 décomp `gSpecialVar_0x8005` — slot generic. */
  Aux: 0,
};

/** 1:1 décomp `gSelectedObjectEvent` : index du NPC en interaction. */
export const gSelectedObjectEvent = { index: 0 };

// ─── Compare (ctx->comparisonResult) ─────────────────────────────────────────
export const COMPARE_LT = 0;
export const COMPARE_EQ = 1;
export const COMPARE_GT = 2;
export function Compare(a: number, b: number): number {
  if (a < b) return COMPARE_LT;
  if (a > b) return COMPARE_GT;
  return COMPARE_EQ;
}

/** Reset complet (debug / map reload) — via ResetSaveBlocks (1:1 save-system). */
export function ResetScriptVars(): void {
  ResetSaveBlocks();
  gSelectedObjectEvent.index = 0;
  _legacyFlags.clear();
  _legacyVars.clear();
}

// ─── Debug exposure (= window.__gFlags / __gVars) ────────────────────────────
if (typeof window !== 'undefined') {
  Object.defineProperty(window, '__gFlags', {
    configurable: true,
    get() {
      const setNames = Object.keys(_FLAGS).filter((n) => n.startsWith('FLAG_') && ED.FlagGet(_FLAGS[n]));
      return {
        size: setNames.length + _legacyFlags.size,
        has: (flag: string) => FlagGet(flag),
        forEach: (cb: (flag: string) => void) => { setNames.forEach(cb); _legacyFlags.forEach(cb); },
      };
    },
  });
  Object.defineProperty(window, '__gVars', {
    configurable: true,
    get() {
      return {
        get: (varId: string) => VarGet(varId),
        set: (varId: string, value: number) => VarSet(varId, value),
        has: (varId: string) => _varId(varId) !== null || _legacyVars.has(varId),
      };
    },
  });
}
