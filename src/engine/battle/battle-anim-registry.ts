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
  /** Charge la sheet/palette du tag si besoin (pattern LoadBallGfx). */
  load?: () => void;
  /** OAM du template C (shape/size/objMode) — requis si tileTag > 0.
   *  objMode 1:1 gOamData_*_ObjBlend_* (=1) / ObjWindow (=2) — AUDIT OBJMODE
   *  2026-06-12 : la donnée était extraite (BATTLE_ANIM_OAMS) mais JETÉE par
   *  le bridge → toutes les anims à templates Blend rendaient opaques. */
  oam?: { shape: 0 | 1 | 2; size: 0 | 1 | 2 | 3; objMode?: 0 | 1 | 2; affineMode?: 0 | 1 | 3 };
  /** Tables ANIMCMD 1:1 (anims[animNum][cmdIdx], format sprite-animation.ts) —
   *  posées sur le sprite par Cmd_createsprite, tickées par AnimateSprite
   *  (sprite.c:901). LE moteur de tables (recadrage user 2026-06-11). */
  anims?: ReadonlyArray<ReadonlyArray<unknown>>;
  /** NOM de la table AFFINE 1:1 (registre sprite-affine-extras — les tables
   *  AFFINEANIMCMD du .c, tickées par tickAllAffineAnims/BeginAffineAnim). */
  affineAnims?: string;
}

const _idToName = new Map<number, string>();
for (const { id, name } of ANIM_SYMBOLS_TABLE) _idToName.set(id, name);

// SINGLETON GLOBAL (fix T4) : si le module est instancie DEUX fois (import
// statique par l'interpreter + import DYNAMIQUE de mon_movement par
// decomp-loop -> instances Vite distinctes possibles), les enregistrements
// partaient dans une map fantome -> lookup vide cote interpreter. Le store
// vit sur globalThis : toutes les instances partagent LE meme.
type _RegStore = { tasks: Map<string, AnimTaskFn>; templates: Map<string, AnimSpriteTemplate> };
const _store: _RegStore = ((globalThis as Record<string, unknown>).__battleAnimRegistryStore as _RegStore) ?? {
  tasks: new Map<string, AnimTaskFn>(),
  templates: new Map<string, AnimSpriteTemplate>(),
};
(globalThis as Record<string, unknown>).__battleAnimRegistryStore = _store;
const _tasks = _store.tasks;
const _templates = _store.templates;

export const SYMBOL_MARKER = 0xF0000000;
export const ANIM_SYMBOL_BASE = 0x1000;

/** Résout un opérande 32-bit du bytecode anim : marqueur nominal → nom, sinon null. */
export function animSymbolName(value: number): string | null {
  const v = value >>> 0;
  // >>> 0 sur le masque : & 32-bit SIGNE en JS -> -268435456 !== 0xF0000000 (positif)
  if (((v & 0xF0000000) >>> 0) !== SYMBOL_MARKER) return null;
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
export function lookupAnimTemplate(name: string): AnimSpriteTemplate | undefined {
  const manual = _templates.get(name);
  if (manual) return manual;
  // PHASE 1a (roadmap) : fallback sur les DONNEES GENEREES (387 templates
  // extraits de la decomp — tables exactes ; callback resolu par nom).
  // Import lazy anti-cycle (le bridge importe ce module pour le type).
  const bridge = (globalThis as Record<string, unknown>).__animGeneratedBridge as
    { lookupGeneratedTemplate?: (n: string) => AnimSpriteTemplate | undefined } | undefined;
  return bridge?.lookupGeneratedTemplate?.(name);
}
export function animRegistryStats(): { tasks: number; templates: number } {
  return { tasks: _tasks.size, templates: _templates.size };
}
