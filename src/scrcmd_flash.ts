/**
 * scrcmd_flash.ts — logique partagée « flash » (setflashlevel/animateflash) voie A.
 *
 * Appelée par LE MOTEUR PARSÉ ET LE BYTE-VM (source unique). Foyer décomp =
 * overworld.c (SetFlashLevel) + field_screen_effect.c (AnimateFlash). `_gFlashLevel`
 * (module-local) + `globalThis.gFlashLevel` = source du masque d'obscurité lu par
 * la scène field (flash-mask.ts). On pose les DEUX (sinon animateflash lerp depuis
 * un niveau périmé).
 */
let _gFlashLevel = 0;

/** 1:1 décomp `gMaxFlashLevel = ARRAY_COUNT(sFlashLevelToRadius) - 1 = 8` (field_screen_effect.c:54). */
export const gMaxFlashLevel = 8;

/** 1:1 décomp `SetFlashLevel(s32 flashLevel)` (overworld.c:981) :
 *    if (flashLevel < 0 || flashLevel > gMaxFlashLevel) flashLevel = 0;
 *    gSaveBlock1Ptr->flashLevel = flashLevel; */
export function SetFlashLevel(flashLevel: number): void {
  if (flashLevel < 0 || flashLevel > gMaxFlashLevel) flashLevel = 0;
  _gFlashLevel = flashLevel & 0xF;
  (globalThis as Record<string, unknown>).gFlashLevel = _gFlashLevel;
}

/** 1:1 décomp `ScrCmd_animateflash` (scrcmd.c:605) : AnimateFlash(level) = fade radial
 *  16 frames de _gFlashLevel vers targetLevel. Renvoie le poll (true = anim finie). */
export function makeAnimateFlashPoll(targetLevel: number): () => boolean {
  const startLevel = _gFlashLevel;
  let frame = 0;
  const totalFrames = 16;
  return (): boolean => {
    frame++;
    _gFlashLevel = Math.round(startLevel + (targetLevel - startLevel) * (frame / totalFrames));
    (globalThis as Record<string, unknown>).gFlashLevel = _gFlashLevel;
    if (frame >= totalFrames) {
      _gFlashLevel = targetLevel;
      (globalThis as Record<string, unknown>).gFlashLevel = _gFlashLevel;
      return true;
    }
    return false;
  };
}

// Exposé pour SetDefaultFlashLevel (game/overworld.ts) sans import statique (anti-cycle ESM).
(globalThis as Record<string, unknown>).__SetFlashLevel = SetFlashLevel;
