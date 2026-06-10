/**
 * battle-anim-registry.ts — REGISTRY des symboles C référencés par le bytecode
 * battle_anim_scripts (goal T4 2026-06-10).
 *
 * Le compileur émet les ptr C inconnus (AnimTask_*, sprite templates gXxx,
 * SpriteCB_*) comme MARQUEURS NOMINAUX `SYMBOL_MARKER | id` (ids 0x1000+,
 * table dédiée `_anim-symbols-table.ts`). L'interpréteur résout id → nom ici :
 *   - createvisualtask : nom → AnimTaskFn TS (1:1 du .c correspondant)
 *   - createsprite     : nom → AnimSpriteTemplate TS
 *
 * Les miroirs (game/battle_anim_mon_movement.ts, …) s'ENREGISTRENT à l'import.
 * Données pures — AUCUN import du runtime/interpréteur (anti-cycle ESM).
 */

import { ANIM_SYMBOLS_TABLE } from '../decomp-data/auto-asm-bytecode/_anim-symbols-table';

/** Une AnimTask TS : reçoit l'OBJET DecompTask (modèle runtime). */
export type AnimTaskFn = (task: { taskId: number; data: number[] }) => void;

/** Template de sprite d'anim (sous-ensemble utile ; tileTag 0 = contrôleur invisible). */
export interface AnimSpriteTemplate {
  name: string;
  tileTag: number;
  paletteTag: number;
  /** Callback TS (1:1 le .callback du template C). */
  callback: (sprite: unknown) => void;
}

const _idToName = new Map<number, string>();
for (const { id, name } of ANIM_SYMBOLS_TABLE) _idToName.set(id, name);

const _tasks = new Map<string, AnimTaskFn>();
const _templates = new Map<string, AnimSpriteTemplate>();

export const SYMBOL_MARKER = 0xF0000000;
export const ANIM_SYMBOL_BASE = 0x1000;

/** Résout un opérande 32-bit du bytecode anim : marqueur nominal → nom, sinon null. */
export function animSymbolName(value: number): string | null {
  const v = value >>> 0;
  if ((v & 0xF0000000) !== SYMBOL_MARKER) return null;
  const id = v & 0xFFFF;
  if (id < ANIM_SYMBOL_BASE) return null; // ids 0-81 = table commune battle vars
  return _idToName.get(id) ?? null;
}

export function registerAnimTasks(map: Record<string, AnimTaskFn>): void {
  for (const [k, v] of Object.entries(map)) _tasks.set(k, v);
}
export function registerAnimTemplates(templates: AnimSpriteTemplate[]): void {
  for (const t of templates) _templates.set(t.name, t);
}
export function lookupAnimTask(name: string): AnimTaskFn | undefined { return _tasks.get(name); }
export function lookupAnimTemplate(name: string): AnimSpriteTemplate | undefined { return _templates.get(name); }
export function animRegistryStats(): { tasks: number; templates: number } {
  return { tasks: _tasks.size, templates: _templates.size };
}
