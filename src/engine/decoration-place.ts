/**
 * decoration-place.ts — STUB explicite du Place flow de decoration.c.
 *
 * Source de vérité (= 1:1 décomp, port FUTUR) :
 *   - `D:/Projet 1/decomps/pokeemeraude/src/decoration.c` lignes 1300-2400
 *     (~1100l C, le coeur du mode "Décorer ma chambre")
 *
 * ÉTAT : STUB explicite — fonctions exposées avec `console.warn` pour permettre
 * le wire depuis `decoration.ts:DecorationItemsMenuAction_AttemptPlace` sans
 * crash. Le port réel demande d'abord de porter :
 *
 *   - `struct PlaceDecorationGraphicsDataBuffer` (decoration.c:75-83) :
 *     `{ decoration, tiles[0x40], image[0x800], palette[16] }` — buffer GFX
 *   - `sDecorationMovementInfo[]` (decoration.c:325-378) — shape → cameraX/Y +
 *     dimensions par DECORSHAPE_* (10 shapes)
 *   - `sDecorSelectorOam`, `sDecorWhilePlacingSpriteTemplate` — OAM templates
 *   - `gFieldCamera.spriteId` accès — sprite camera tracking
 *   - `gpu_pal_decompress_alloc_tag_and_upload` — asset loader spécifique
 *   - `CreateObjectGraphicsSprite` — création sprite NPC
 *   - `OBJ_EVENT_GFX_BRENDAN_DECORATING / MAY_DECORATING` — graphics IDs
 *   - `TrySpawnObjectEvent`, `TryMoveObjectEventToMapCoords`,
 *     `TryOverrideObjectEventTemplateCoords` — manipulation object events
 *   - `gMapHeader.events->objectEvents[]` — map object events array
 *   - `IsSelectedDecorInThePC` (decoration.c) — check inventory
 *   - `HasDecorationSpace` (decoration.c) — check secret base / player room space
 *   - `sDecorationContext` (decoration.c:122) — { items, pos, size, isPlayerRoom }
 *   - `sDecorationsCursorPos`, `sDecorationsScrollOffset`, `gCurDecorationIndex` —
 *     state navigation
 *   - `SetInitialPositions`, `ContinueDecorating`, `Task_PlaceDecoration` — task funcs
 *   - 10 helpers d'arrange/place (sDecorRearrangementDataBuffer logic)
 *
 * 1:1 STRICT : chaque fonction stub porte le nom décomp EXACT, signature
 * 1:1, et un commentaire pointant la ligne décomp source.
 */

/** 1:1 décomp `static void Task_PlaceDecoration(u8 taskId)` (decoration.c:1361).
 *  STUB : devrait initialiser le mode "Décorer", spawn cursor sprite, lock
 *  player avatar, et entrer la boucle de placement. Sans les helpers absents,
 *  on log un warn + DestroyTask pour cleanup. */
export function Task_PlaceDecoration(taskId: number): void {
  console.warn('[decoration-place STUB] Task_PlaceDecoration — port décomp.c:1361 différé (chantier dédié, dépendances : gFieldCamera, sprite system, sDecorationMovementInfo)');
  // 1:1 TODO : implémenter state machine 0..2 (= fade + ConfigureCamera +
  // SetUpDecorationShape + SetUpPlayerAvatar + ContinueDecorating).
  void taskId;
}

/** 1:1 décomp `static void ConfigureCameraObjectForPlacingDecoration(...)`
 *  (decoration.c:1391). STUB. */
export function ConfigureCameraObjectForPlacingDecoration(_data: unknown, _decor: number): void {
  console.warn('[decoration-place STUB] ConfigureCameraObjectForPlacingDecoration — port différé');
}

/** 1:1 décomp `static void SetUpPlacingDecorationPlayerAvatar(...)` (decoration.c:1401). STUB. */
export function SetUpPlacingDecorationPlayerAvatar(_taskId: number, _data: unknown): void {
  console.warn('[decoration-place STUB] SetUpPlacingDecorationPlayerAvatar — port différé');
}

/** 1:1 décomp `static void SetUpDecorationShape(u8 taskId)` (decoration.c:1419).
 *  Cette fonction est plus simple : juste un switch sur shape → set tDecorWidth/Height.
 *  PORTABLE sans dépendances. */
export function SetUpDecorationShape(_taskId: number, _shape: number): { width: number; height: number; cursorYShift: number } {
  // 1:1 décomp switch (shape) → tDecorWidth/tDecorHeight + tCursorY++ pour 1x3.
  switch (_shape) {
    // 1:1 décomp DECORSHAPE_* enum (decoration.h)
    case 0 /* DECORSHAPE_1x1 */: return { width: 1, height: 1, cursorYShift: 0 };
    case 1 /* DECORSHAPE_2x1 */: return { width: 2, height: 1, cursorYShift: 0 };
    case 2 /* DECORSHAPE_3x1 */: return { width: 3, height: 1, cursorYShift: 0 };
    case 3 /* DECORSHAPE_4x2 */: return { width: 4, height: 2, cursorYShift: 0 };
    case 4 /* DECORSHAPE_2x2 */: return { width: 2, height: 2, cursorYShift: 0 };
    case 5 /* DECORSHAPE_1x2 */: return { width: 1, height: 2, cursorYShift: 0 };
    case 6 /* DECORSHAPE_1x3 */: return { width: 1, height: 3, cursorYShift: 1 };
    case 7 /* DECORSHAPE_2x4 */: return { width: 2, height: 4, cursorYShift: 0 };
    case 8 /* DECORSHAPE_3x3 */: return { width: 3, height: 3, cursorYShift: 0 };
    case 9 /* DECORSHAPE_3x2 */: return { width: 3, height: 2, cursorYShift: 0 };
    default: return { width: 1, height: 1, cursorYShift: 0 };
  }
}

/** 1:1 décomp `static void AttemptPlaceDecoration(u8 taskId)` (decoration.c:1467). STUB. */
export function AttemptPlaceDecoration(taskId: number): void {
  console.warn('[decoration-place STUB] AttemptPlaceDecoration — port différé');
  void taskId;
}

/** 1:1 décomp `static void AttemptCancelPlaceDecoration(u8 taskId)`. STUB. */
export function AttemptCancelPlaceDecoration(taskId: number): void {
  console.warn('[decoration-place STUB] AttemptCancelPlaceDecoration — port différé');
  void taskId;
}

/** 1:1 décomp `static void ContinueDecorating(u8 taskId)` (decoration.c:1914). STUB. */
export function ContinueDecorating(taskId: number): void {
  console.warn('[decoration-place STUB] ContinueDecorating — port différé');
  void taskId;
}

/** 1:1 décomp `static bool8 HasDecorationSpace(void)` (decoration.c:1313).
 *  Cette fonction est portable : iterate sDecorationContext.items pour
 *  trouver un slot DECOR_NONE. Mais sDecorationContext n'est pas exposé encore.
 *  STUB qui retourne TRUE pour permettre le flow. */
export function HasDecorationSpace(): boolean {
  console.warn('[decoration-place STUB] HasDecorationSpace — sDecorationContext non porté, retourne TRUE');
  return true;
}

/** 1:1 décomp `bool8 IsSelectedDecorInThePC(void)` (decoration.c, expose). STUB. */
export function IsSelectedDecorInThePC(): boolean {
  console.warn('[decoration-place STUB] IsSelectedDecorInThePC — port différé, retourne TRUE');
  return true;
}
