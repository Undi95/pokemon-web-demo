/**
 * field-effect.ts — Port 1:1 strict `field_effect.c` minimal (= dispatcher
 * FieldEffectStart + gFieldEffectArguments + helpers communs).
 *
 * Source : D:/Projet 1/decomps/pokeemeraude/src/field_effect.c.
 *
 * Le décomp a un système complet de ~50 field effects avec scripts bytecode
 * dispatch (= `gFieldEffectScriptPointers[FLDEFF_X]`). Notre port :
 *
 *   - `gFieldEffectArguments[8]` : array de params globals (= u32 each).
 *     Les actions movement/script set ces args avant `FieldEffectStart(id)`.
 *   - `FieldEffectStart(id)` : dispatcher qui invoque le handler enregistré
 *     pour `FLDEFF_X` (= notre TS : Map<id, handler>).
 *
 * Effects portés 1:1 strict (= H3.4) :
 *   - FLDEFF_EXCLAMATION_MARK_ICON (0)  → SpawnEmoteSprite('exclamation')
 *   - FLDEFF_QUESTION_MARK_ICON (33)    → SpawnEmoteSprite('question')
 *   - FLDEFF_HEART_ICON (46)            → SpawnEmoteSprite('heart')
 *
 * Effects stub explicit (= cascade non-portée, marqué dette H3) :
 *   - FLDEFF_TREE_DISGUISE (28)         : sprite tree par-dessus NPC.
 *   - FLDEFF_MOUNTAIN_DISGUISE (29)     : sprite mountain par-dessus NPC.
 *   - FLDEFF_BERRY_TREE_GROWTH_SPARKLE (23) : sparkle anim au berry grow.
 *   - ~44 autres effects (= shadow, reflection, fishing, sparkle dust, etc.).
 *
 * Les emote/disguise actions movement appellent FieldEffectStart(FLDEFF_X)
 * directement après set gFieldEffectArguments[0..3]. Le port traduit ça :
 * args[0..2] = localId/mapNum/mapGroup typiquement.
 */

import type { DecompRuntime } from '../system/decomp-runtime';
import { SpawnEmoteSprite, type EmoteType } from './field-effect-emotes';

/** 1:1 décomp `gFieldEffectArguments[8]` (field_effect.c:24). Params globals
 *  pour FieldEffectStart, set par caller avant FieldEffectStart(id). */
export const gFieldEffectArguments: number[] = new Array(8).fill(0);

/** 1:1 décomp `FLDEFF_*` constants (include/constants/field_effects.h). */
export const FLDEFF_EXCLAMATION_MARK_ICON      = 0;
export const FLDEFF_BERRY_TREE_GROWTH_SPARKLE  = 23;
export const FLDEFF_TREE_DISGUISE              = 28;
export const FLDEFF_MOUNTAIN_DISGUISE          = 29;
export const FLDEFF_QUESTION_MARK_ICON         = 33;
export const FLDEFF_HEART_ICON                 = 46;

/** Runtime captured pour passer aux handlers qui need rt. Set par scene au boot. */
let _activeRuntime: DecompRuntime | null = null;

export function SetFieldEffectRuntime(rt: DecompRuntime): void {
  _activeRuntime = rt;
}

/** 1:1 décomp `FieldEffectStart(id)` (field_effect.c:172) :
 *    return gFieldEffectScriptPointers[id](&gFieldEffectArguments[0]);
 *
 *  Notre TS : dispatcher Map<id, handler>. Returns sprite ID (= MAX_SPRITES
 *  si pas de sprite spawné, sinon spriteId numeric).
 *
 *  Used par MovementAction_Emote* / Disguise / BerryTreeGrowth sparkle / etc. */
export function FieldEffectStart(id: number): number {
  const rt = _activeRuntime;
  if (!rt) {
    console.warn(`[FieldEffectStart] no active runtime — effect id=${id} skipped`);
    return 64;  // MAX_SPRITES sentinel
  }

  // ─── Emote icons (= EXCLAMATION_MARK / QUESTION_MARK / HEART) ──────────────
  // 1:1 décomp args setup par MovementAction_Emote* :
  //   ObjectEventGetLocalIdAndMap(obj, &args[0], &args[1], &args[2]);
  //   args[0] = localId, args[1] = mapNum, args[2] = mapGroup.
  if (id === FLDEFF_EXCLAMATION_MARK_ICON || id === FLDEFF_QUESTION_MARK_ICON || id === FLDEFF_HEART_ICON) {
    const localId = gFieldEffectArguments[0];
    let emoteType: EmoteType = 'exclamation';
    if (id === FLDEFF_QUESTION_MARK_ICON) emoteType = 'question';
    else if (id === FLDEFF_HEART_ICON) emoteType = 'heart';
    // localId numeric — lookup localIdRaw via gObjectEvents.
    // Notre TS SpawnEmoteSprite prend localIdRaw string. On passe "LOCALID_<n>"
    // ou "LOCALID_PLAYER" pour 0xFF.
    const localIdRaw = localId === 0xFF ? 'LOCALID_PLAYER' : `LOCALID_${localId}`;
    SpawnEmoteSprite(rt, localIdRaw, emoteType);
    return 64;  // emote sprite has its own management
  }

  // ─── Disguise / Sparkle (= dette H3 cascade R3 future port) ────────────────
  if (id === FLDEFF_TREE_DISGUISE) {
    // DETTE R3 : spawn tree sprite par-dessus NPC. Tree disguise visual.
    return 64;
  }
  if (id === FLDEFF_MOUNTAIN_DISGUISE) {
    // DETTE R3 : spawn mountain sprite par-dessus NPC. Mountain disguise visual.
    return 64;
  }
  if (id === FLDEFF_BERRY_TREE_GROWTH_SPARKLE) {
    // DETTE R3 : sparkle anim 64f au-dessus du berry tree.
    return 64;
  }

  // ─── Effects non encore portés (= dette R3) ────────────────────────────────
  console.warn(`[FieldEffectStart] FLDEFF id=${id} not yet ported — dette R3`);
  return 64;
}

/** Reset les arguments à 0 — call par certains handlers post-exec. */
export function ClearFieldEffectArguments(): void {
  for (let i = 0; i < 8; i++) gFieldEffectArguments[i] = 0;
}
