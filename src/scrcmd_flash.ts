/**
 * scrcmd_flash.ts — logique partagée « flash » (setflashlevel) voie A.
 *
 * Foyer décomp = overworld.c (SetFlashLevel). L'ANIMATION (`animateflash`) passe
 * désormais par le vrai `AnimateFlash` (field_screen_effect.ts → effet scanline WIN0),
 * plus par l'ex-rustine `makeAnimateFlashPoll` (supprimée avec harness/gba/flash-mask.ts).
 *
 * Source de vérité (niveau de flash) = `gSaveBlock1Ptr->flashLevel`, lu par
 * `GetFlashLevel()` (field_screen_effect.ts / overworld.c:988) — celui qu'utilisent
 * `InitCurrentFlashLevelScanlineEffect` (map load) et `AnimateFlash`.
 */
import { gSaveBlock1Ptr } from './engine/save/save-block-state';

/** 1:1 décomp `gMaxFlashLevel = ARRAY_COUNT(sFlashLevelToRadius) - 1 = 8` (field_screen_effect.c:54). */
export const gMaxFlashLevel = 8;

/** 1:1 décomp `void SetFlashLevel(s32 flashLevel)` (overworld.c:981) :
 *    if (flashLevel < 0 || flashLevel > gMaxFlashLevel) flashLevel = 0;
 *    gSaveBlock1Ptr->flashLevel = flashLevel; */
export function SetFlashLevel(flashLevel: number): void {
  if (flashLevel < 0 || flashLevel > gMaxFlashLevel) flashLevel = 0;
  gSaveBlock1Ptr.flashLevel = flashLevel & 0xF;
}

// Exposé pour SetDefaultFlashLevel (overworld.ts) sans import statique (anti-cycle ESM).
(globalThis as Record<string, unknown>).__SetFlashLevel = SetFlashLevel;
