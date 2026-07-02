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
import { fadeOutBgmTemporarily, isBgmPausedOrStopped, stopSong } from '../harness/m4a/player';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { OPTIONS_SOUND_MONO, OPTIONS_SOUND_STEREO } from '../include/constants/global';

/** 1:1 décomp `sound.c PlayBGM(songNum)` — bridge vers m4aSongNumStart.
 *  Skip si MUS_NONE (0xFFFF) ou 0 (= maps sans music, ex. MAP_INSIDE_OF_TRUCK).
 *  🐛 fix 2026-07-02 : NE PAS forcer loop=true — la boucle vient des MARKERS du
 *  song (mid2agb `[`/`]` → autodétectés par m4aSongNumStart), comme le song data
 *  GBA. Le forçage faisait REBOUCLER les jingles sans markers (MUS_EVOLVED joué
 *  en boucle pendant l'affichage du mon évolué — signalé user). Les BGM de map
 *  ont tous leurs markers → boucle inchangée pour eux. */
export function PlayBGM(songNum: number): void {
  if (songNum === 0xFFFF || songNum === 0) return;
  m4aSongNumStart(songNum);
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

/** 1:1 décomp `void FadeOutBGMTemporarily(u8 speed)` (sound.c:295-298) :
 *  m4aMPlayFadeOutTemporarily(&gMPlayInfo_BGM, speed) — fade puis PAUSE
 *  (position conservée, FadeInBGM reprend). Moteur m4a = exempt ; la sémantique
 *  pause-vs-stop, elle, est 1:1 (consommée par ScrCmd_fadeoutbgm bloquant). */
export function FadeOutBGMTemporarily(speed: number): void {
  fadeOutBgmTemporarily(speed);
}

/** 1:1 décomp `bool8 IsBGMPausedOrStopped(void)` (sound.c:276-283) :
 *  status & PAUSE → TRUE ; !(status & TRACK) → TRUE ; sinon FALSE.
 *  Native script de ScrCmd_fadeoutbgm (scrcmd.c:977) : le script reste bloqué
 *  tant que le fade n'est pas fini. */
export function IsBGMPausedOrStopped(): boolean {
  return isBgmPausedOrStopped();
}

/** 1:1 décomp `void PlayNewMapMusic(u16 songNum)` (sound.c:335-340) : coupe la
 *  map-music courante et lance songNum (décomp : state machine sMapMusicState
 *  MAPMUS_STATE_STOP_AND_FADE → play au tick ; notre moteur = swap direct,
 *  exemption son [[hardware-non-1to1-exemptions]]). Consommé par la scène
 *  d'évolution (MUS_EVOLUTION). */
export function PlayNewMapMusic(songNum: number): void {
  PlayBGM(songNum);
}

/** 1:1 décomp `void StopMapMusic(void)` (sound.c:414-419) : sMapMusicState =
 *  MAPMUS_STATE_STOP (le tick suivant fait m4aSongNumStop(map music)). Notre
 *  moteur : stop direct du slot BGM. */
export function StopMapMusic(): void {
  stopSong('bgm');
}

// Bridge globalThis pour les auto-callbacks (= eval scope @ts-nocheck).
(globalThis as Record<string, unknown>).IsStereoSound = IsStereoSound;
(globalThis as Record<string, unknown>).SetPokemonCryStereo = SetPokemonCryStereo;
(globalThis as Record<string, unknown>).IsBGMPausedOrStopped = IsBGMPausedOrStopped;
(globalThis as Record<string, unknown>).FadeOutBGMTemporarily = FadeOutBGMTemporarily;
