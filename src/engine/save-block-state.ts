/**
 * save-block-state.ts — Foundation 1:1 décomp : storage + accesseurs des
 *                       SaveBlock1 / SaveBlock2 + Proxy `gSaveBlock1/2Ptr`.
 *
 * Source de vérité (= 1:1 EXACT) :
 *   - `D:/Projet 1/decomps/pokeemeraude/include/global.h`
 *     `extern struct SaveBlock1 *gSaveBlock1Ptr;`
 *     `extern struct SaveBlock2 *gSaveBlock2Ptr;`
 *
 * ⚠️ Foundation module : imports limités au strict minimum
 * (= save-blocks types + bag-types pure functions). PAS d'import de
 * game-state / load_save / object-events / gba-menu-system / decomp-bridge
 * — sinon réintroduit le cycle ESM `object-events ↔ game-state ↔ load_save`
 * qui fait crasher le boot dès que l'ordre d'init eager change.
 *
 * Rôle dans le port :
 *   - Storage authoritatif : seul ce module détient `_sCurrentBlock1/2`.
 *   - Accesseurs `GetSaveBlock1/2` : 1:1 décomp `gSaveBlock1Ptr` deref.
 *   - Setters `SetSaveBlock1/2` : utilisés par save-system.ts lors du
 *     `LoadGameSave` / `ResetSaveBlocks` pour swap les blocs en RAM.
 *   - Proxy `gSaveBlock1/2Ptr` : 1:1 décomp pointer-deref pattern. Permet
 *     d'écrire `gSaveBlock1Ptr.pos.x = X` partout dans le port comme en C.
 *
 * Caveat — pourquoi Proxy plutôt que `let gSaveBlock1Ptr = GetSaveBlock1()` :
 *   `LoadGameSave` peut remplacer `_sCurrentBlock1` par un nouveau bloc (=
 *   swap pointer en C). Un binding direct serait stale. Le Proxy interroge
 *   `GetSaveBlock1()` à chaque get/set → toujours frais. Pas d'écriture
 *   SRAM auto — seul `TrySavingData()` (= save explicite) flush.
 */

import type { SaveBlock1, SaveBlock2 } from './save-blocks';
import { emptySaveBlock1, emptySaveBlock2 } from './save-blocks';

// ─── Storage authoritatif (= EWRAM du décomp) ────────────────────────────────

let _sCurrentBlock1: SaveBlock1 | null = null;
let _sCurrentBlock2: SaveBlock2 | null = null;

// ─── Accesseurs 1:1 décomp ───────────────────────────────────────────────────

/** 1:1 décomp `gSaveBlock1Ptr` accessor. Init si null (= boot pré-LoadGameSave). */
export function GetSaveBlock1(): SaveBlock1 {
  if (!_sCurrentBlock1) _sCurrentBlock1 = emptySaveBlock1();
  return _sCurrentBlock1;
}

/** 1:1 décomp `gSaveBlock2Ptr` accessor. Init si null. */
export function GetSaveBlock2(): SaveBlock2 {
  if (!_sCurrentBlock2) _sCurrentBlock2 = emptySaveBlock2();
  return _sCurrentBlock2;
}

/** Swap le pointer SaveBlock1 (= utilisé par save-system.LoadGameSave). */
export function SetSaveBlock1(block: SaveBlock1 | null): void {
  _sCurrentBlock1 = block;
}

/** Swap le pointer SaveBlock2 (= utilisé par save-system.LoadGameSave). */
export function SetSaveBlock2(block: SaveBlock2 | null): void {
  _sCurrentBlock2 = block;
}

// ─── Proxy 1:1 décomp `gSaveBlock1/2Ptr` ─────────────────────────────────────
//
// `extern struct SaveBlock1 *gSaveBlock1Ptr` (global.h). En TS pure : Proxy
// qui delegate à `GetSaveBlock1()` / `GetSaveBlock2()`. Les écritures NE
// déclenchent PAS d'écriture SRAM automatique — seul `TrySavingData()` (=
// START → SAUVER explicite) flush. User-flag verbatim (2026-05-21) : "le
// seul moyen de sauvegarde est et restera START => SAUVER, corrige ça
// définitivement".

export const gSaveBlock1Ptr: any = new Proxy({} as Record<string, unknown>, {
  get(_target, prop: string | symbol): unknown {
    return (GetSaveBlock1() as unknown as Record<string, unknown>)[prop as string];
  },
  set(_target, prop: string | symbol, value: unknown): boolean {
    (GetSaveBlock1() as unknown as Record<string, unknown>)[prop as string] = value;
    return true;
  },
  ownKeys(_target): ArrayLike<string | symbol> {
    return Object.keys(GetSaveBlock1() as unknown as Record<string, unknown>);
  },
  getOwnPropertyDescriptor(_target, prop: string | symbol): PropertyDescriptor | undefined {
    const v = (GetSaveBlock1() as unknown as Record<string, unknown>)[prop as string];
    return v === undefined ? undefined : { enumerable: true, configurable: true, value: v, writable: true };
  },
});

export const gSaveBlock2Ptr: any = new Proxy({} as Record<string, unknown>, {
  get(_target, prop: string | symbol): unknown {
    return (GetSaveBlock2() as unknown as Record<string, unknown>)[prop as string];
  },
  set(_target, prop: string | symbol, value: unknown): boolean {
    (GetSaveBlock2() as unknown as Record<string, unknown>)[prop as string] = value;
    return true;
  },
  ownKeys(_target): ArrayLike<string | symbol> {
    return Object.keys(GetSaveBlock2() as unknown as Record<string, unknown>);
  },
  getOwnPropertyDescriptor(_target, prop: string | symbol): PropertyDescriptor | undefined {
    const v = (GetSaveBlock2() as unknown as Record<string, unknown>)[prop as string];
    return v === undefined ? undefined : { enumerable: true, configurable: true, value: v, writable: true };
  },
});
