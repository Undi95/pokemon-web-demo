/**
 * field-effect-active-list.ts — 1:1 STRICT décomp `src/field_effect.c:846-886`
 * (`sActiveList[32]` + helpers).
 *
 * Source de vérité :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_effect.c:236` (sActiveList[32])
 *   - `D:/Projet 1/decomps/pokeemeraude/src/field_effect.c:846-886`
 *     (FieldEffectActiveListClear / Add / Remove / Contains)
 *   - `D:/Projet 1/decomps/pokeemeraude/include/constants/field_effect.h` (FLDEFF_*)
 *
 * Concept 1:1 décomp :
 *   - `sActiveList[32]` est un buffer u8[] où chaque slot = effect id, 0xFF = vide.
 *   - `FieldEffectStart(id)` (field_effect.c:697) appelle `FieldEffectActiveListAdd(id)`.
 *   - Chaque effect sprite callback appelle `FieldEffectActiveListRemove(id)` quand
 *     son anim termine (= il n'y a PAS de timer auto-remove, c'est la responsabilité
 *     du sprite callback).
 *   - `waitfieldeffect FLDEFF_X` polls `FieldEffectActiveListContains(FLDEFF_X)`
 *     et resume le script quand l'effect est retiré.
 *
 * Dette R3 (= effects pas encore portés) :
 *   Les effects dont le sprite callback n'est pas encore wiré ne se retirent jamais
 *   de la list. Les call sites individuels (ex. `dofieldeffectsparkle`) peuvent
 *   ajouter un setTimeout local pour `FieldEffectActiveListRemove(id)` après la
 *   durée attendue de l'anim, en attendant le port du sprite callback.
 */

// ─── State ───────────────────────────────────────────────────────────────────

/** 1:1 décomp `static u8 sActiveList[32]` (field_effect.c:236). 0xFF = slot vide. */
const FIELD_EFFECT_COUNT = 32;
const sActiveList = new Uint8Array(FIELD_EFFECT_COUNT).fill(0xFF);

// ─── Public API 1:1 strict décomp ────────────────────────────────────────────

/** 1:1 décomp `FieldEffectActiveListClear` (field_effect.c:846-851) :
 *  ```c
 *  void FieldEffectActiveListClear(void) {
 *      u8 i;
 *      for (i = 0; i < ARRAY_COUNT(sActiveList); i++)
 *          sActiveList[i] = 0xFF;
 *  }
 *  ```
 */
export function FieldEffectActiveListClear(): void {
  for (let i = 0; i < sActiveList.length; i++) {
    sActiveList[i] = 0xFF;
  }
}

/** 1:1 décomp `FieldEffectActiveListAdd` (field_effect.c:853-864) :
 *  ```c
 *  void FieldEffectActiveListAdd(u8 id) {
 *      u8 i;
 *      for (i = 0; i < ARRAY_COUNT(sActiveList); i++) {
 *          if (sActiveList[i] == 0xFF) {
 *              sActiveList[i] = id;
 *              return;
 *          }
 *      }
 *  }
 *  ```
 *  Insert dans le premier slot 0xFF trouvé. Si list pleine (= 32 effects actifs),
 *  silently dropped (= décomp behavior).
 */
export function FieldEffectActiveListAdd(id: number): void {
  for (let i = 0; i < sActiveList.length; i++) {
    if (sActiveList[i] === 0xFF) {
      sActiveList[i] = id;
      return;
    }
  }
}

/** 1:1 décomp `FieldEffectActiveListRemove` (field_effect.c:866-877) :
 *  ```c
 *  void FieldEffectActiveListRemove(u8 id) {
 *      u8 i;
 *      for (i = 0; i < ARRAY_COUNT(sActiveList); i++) {
 *          if (sActiveList[i] == id) {
 *              sActiveList[i] = 0xFF;
 *              return;
 *          }
 *      }
 *  }
 *  ```
 *  Retire la PREMIÈRE occurrence de id (= décomp behavior, pas de compact array).
 */
export function FieldEffectActiveListRemove(id: number): void {
  for (let i = 0; i < sActiveList.length; i++) {
    if (sActiveList[i] === id) {
      sActiveList[i] = 0xFF;
      return;
    }
  }
}

/** 1:1 décomp `FieldEffectActiveListContains` (field_effect.c:879-886) :
 *  ```c
 *  bool8 FieldEffectActiveListContains(u8 id) {
 *      u8 i;
 *      for (i = 0; i < ARRAY_COUNT(sActiveList); i++)
 *          if (sActiveList[i] == id)
 *              return TRUE;
 *      return FALSE;
 *  }
 *  ```
 */
export function FieldEffectActiveListContains(id: number): boolean {
  for (let i = 0; i < sActiveList.length; i++) {
    if (sActiveList[i] === id) return true;
  }
  return false;
}

