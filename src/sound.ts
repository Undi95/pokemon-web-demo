/**
 * sound.ts — Port 1:1 (partiel) de `decomp/src/sound.c`.
 *
 * Helpers audio option-aware (mode MONO/STEREO via gSaveBlock2Ptr.optionsSound) +
 * bridge PlayBGM. Le moteur m4a hardware lui-même est une version propre (exempt
 * 1:1, cf. [[hardware-non-1to1-exemptions]]) ; ces helpers, eux, sont 1:1 décomp.
 *
 * Rapatriés depuis `gba-menu-system.ts` (fourre-tout dissous, MIRROR 1:1).
 */
import { m4aSongNumStart } from '../harness/runtime/decomp-globals';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { OPTIONS_SOUND_MONO, OPTIONS_SOUND_STEREO } from '../include/constants/global';

/** 1:1 décomp `sound.c PlayBGM(songNum)` — bridge vers m4aSongNumStart loop=true.
 *  Skip si MUS_NONE (0xFFFF) ou 0 (= maps sans music, ex. MAP_INSIDE_OF_TRUCK). */
export function PlayBGM(songNum: number): void {
  if (songNum === 0xFFFF || songNum === 0) return;
  m4aSongNumStart(songNum, true);  // BGM = loop
}

/** Audio pan adjustment — true si STEREO (= apply pan), false si MONO (= centered).
 *  Lu par le m4a engine à chaque PlayCry/PlayBGM. */
export function IsStereoSound(): boolean {
  return ((gSaveBlock2Ptr.optionsSound ?? OPTIONS_SOUND_MONO) | 0) === OPTIONS_SOUND_STEREO;
}

/** 1:1 décomp `SetPokemonCryStereo(u32 val)` (sound.c) — toggle live l'audio mode
 *  (MONO/STEREO). Notre m4a simplifié : update gSaveBlock2Ptr.optionsSound, le
 *  prochain note lookup utilise la nouvelle valeur via IsStereoSound(). */
export function SetPokemonCryStereo(selection: number): void {
  gSaveBlock2Ptr.optionsSound = selection | 0;
}

// Bridge globalThis pour les auto-callbacks (= eval scope @ts-nocheck).
(globalThis as Record<string, unknown>).IsStereoSound = IsStereoSound;
(globalThis as Record<string, unknown>).SetPokemonCryStereo = SetPokemonCryStereo;
