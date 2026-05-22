/**
 * web-overlays.ts — Overlays NON-1:1 décomp pour notre port TS.
 *
 * Ces helpers persistent des states qui n'existent PAS dans le décomp ROM :
 *   - `__objectPositions` : `setobjectxyperm` opcode → notre OW utilise des
 *     localId strings pour identifier les NPCs, donc on stocke par
 *     `(mapName, localId)` au lieu de mapGroup/mapNum/eventLocalId (= décomp).
 *   - `__takenItemBalls` : marker pour pas re-spawn les item balls déjà
 *     ramassés. Le décomp ROM utilise des `FLAG_ITEM_X` dédiés (= dans
 *     `data/scripts/maps/*.inc`). Notre script-runtime n'a pas (encore) wire
 *     ces flags pour chaque item ball → workaround overlay TS.
 *
 * **Dette technique** : ces overlays sont NON-1:1 strict. Le refactor 1:1
 * pur consiste à :
 *   - `setObjectXY` → utiliser `gSaveBlock1Ptr.objectEventTemplates` direct
 *     (= 1:1 décomp `gSaveBlock1Ptr->objectEventTemplates`).
 *   - `takenItemBalls` → wire les FLAG_ITEM_BALL_* du décomp + utiliser
 *     `FlagGet(label)` pour skip le respawn.
 *
 * Pour l'instant, ces overlays sont expose ici pour découpler le code engine
 * de la classe GameState legacy.
 */

import { gSaveBlock1Ptr } from './save-block-state';

// ─── Object positions overlay (`setobjectxyperm`) ─────────────────────────────

/** Override la position d'un NPC. Persistée dans SaveBlock1.__objectPositions. */
export function SetObjectXY(mapName: string, localId: string, x: number, y: number): void {
  const block1 = gSaveBlock1Ptr as unknown as { __objectPositions?: Record<string, Record<string, { x: number; y: number }>> };
  if (!block1.__objectPositions) block1.__objectPositions = {};
  if (!block1.__objectPositions[mapName]) block1.__objectPositions[mapName] = {};
  block1.__objectPositions[mapName][localId] = { x, y };
}

/** Read l'override de position d'un NPC (= undefined si pas set). */
export function GetObjectXY(mapName: string, localId: string): { x: number; y: number } | undefined {
  const block1 = gSaveBlock1Ptr as unknown as { __objectPositions?: Record<string, Record<string, { x: number; y: number }>> };
  return block1.__objectPositions?.[mapName]?.[localId];
}

// ─── Taken item balls overlay ─────────────────────────────────────────────────

interface TakenItemBalls {
  has(label: string): boolean;
  add(label: string): void;
}

/** Accessor : `takenItemBalls.has(label)` / `.add(label)`. Persiste dans
 *  SaveBlock1.__takenItemBalls. */
export function GetTakenItemBalls(): TakenItemBalls {
  const block1 = gSaveBlock1Ptr as unknown as { __takenItemBalls?: string[] };
  if (!block1.__takenItemBalls) block1.__takenItemBalls = [];
  const arr = block1.__takenItemBalls;
  return {
    has: (label: string) => arr.includes(label),
    add: (label: string) => { if (!arr.includes(label)) arr.push(label); },
  };
}
