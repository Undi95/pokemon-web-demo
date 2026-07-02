/**
 * sound.ts — Port 1:1 (partiel) de `decomp/src/sound.c`.
 *
 * Helpers audio option-aware (mode MONO/STEREO via gSaveBlock2Ptr.optionsSound) +
 * PlayBGM + la STATE MACHINE map-music (sCurrentMapMusic/sNextMapMusic/
 * sMapMusicState, sound.c:20-178) tickée CHAQUE frame par MapMusicMain (= AgbMain
 * main.c:159, branchée dans runOneFrame via globalThis). Le moteur m4a hardware
 * lui-même est une version propre (exempt 1:1, cf [[hardware-non-1to1-exemptions]]) ;
 * ces helpers, eux, sont 1:1 décomp.
 *
 * Fanfares (PlayFanfare/WaitFanfare/IsFanfareTaskInactive, sound.c:180-256) :
 * foyer actuel = harness/runtime/decomp-globals.ts (tracking durée réel) — ne pas
 * dupliquer ici.
 *
 * Rapatriés depuis `gba-menu-system.ts` (fourre-tout dissous, MIRROR 1:1).
 */
import { m4aSongNumStart, IsFanfareTaskInactive } from '../harness/runtime/decomp-globals';
import {
  fadeOutBgmTemporarily, isBgmPausedOrStopped, stopSong, isPlaying, fadeOutBgm, fadeInBgm,
} from '../harness/m4a/player';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { OPTIONS_SOUND_MONO, OPTIONS_SOUND_STEREO } from '../include/constants/global';
import { MUS_NONE } from '../include/constants/songs';

// ─── 1:1 sound.c:20-26 — statics map-music + gDisableMusic (COMMON_DATA) ─────
let sCurrentMapMusic = 0;
let sNextMapMusic = 0;
let sMapMusicState = 0;
let sMapMusicFadeInSpeed = 0;
export let gDisableMusic = false;

/** 1:1 décomp `sound.c PlayBGM(songNum)` (:563-570) :
 *    if (gDisableMusic) songNum = 0;
 *    if (songNum == MUS_NONE) songNum = 0;
 *    m4aSongNumStart(songNum);
 *  Adaptation moteur : m4aSongNumStart(0) GBA = jouer MUS_DUMMY (= silence, la
 *  song courante est REMPLACÉE) → équivalent = stop du slot BGM. 🐛 fix
 *  2026-07-02 (bug 4 évolution) : l'ancien early-return laissait l'ancienne
 *  musique TOURNER sur PlayBGM(0)/PlayBGM(MUS_NONE), et NE PAS forcer loop=true
 *  — la boucle vient des MARKERS du song (mid2agb `[`/`]` autodétectés). */
export function PlayBGM(songNum: number): void {
  if (gDisableMusic) songNum = 0;
  if (songNum === MUS_NONE) songNum = 0;
  if (songNum === 0) { stopSong('bgm'); return; }
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

/** 1:1 décomp `void FadeOutBGMTemporarily(u8 speed)` (sound.c:271-274) :
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

/** 1:1 décomp `void FadeInBGM(u8 speed)` (sound.c:285-288) :
 *  m4aMPlayFadeIn(&gMPlayInfo_BGM, speed). */
export function FadeInBGM(speed: number): void {
  fadeInBgm(speed);
}

/** 1:1 décomp `void FadeOutBGM(u8 speed)` (sound.c:290-293) :
 *  m4aMPlayFadeOut(&gMPlayInfo_BGM, speed) — fade puis STOP (≠ Temporarily). */
export function FadeOutBGM(speed: number): void {
  fadeOutBgm(speed);
}

/** 1:1 décomp `bool8 IsBGMStopped(void)` (sound.c:295-300) :
 *  !(status & MUSICPLAYER_STATUS_TRACK) → TRUE. Notre moteur : plus aucune song
 *  en lecture sur le slot BGM. */
export function IsBGMStopped(): boolean {
  return !isPlaying('bgm');
}

/** 1:1 décomp `void FadeInNewBGM(u16 songNum, u8 speed)` (sound.c:258-269).
 *  Le .c pré-charge (start → ImmInit → volume 0 → stop) puis m4aMPlayFadeIn ;
 *  équivalent moteur : start + fade-in du gain (exemption son). */
export function FadeInNewBGM(songNum: number, speed: number): void {
  if (gDisableMusic) songNum = 0;
  if (songNum === MUS_NONE) songNum = 0;
  if (songNum === 0) { stopSong('bgm'); return; }
  m4aSongNumStart(songNum);
  fadeInBgm(speed);
}

// ─── State machine map-music (1:1 sound.c:58-178) ────────────────────────────
// 🐛 fix 2026-07-02 (bug 4 évolution) : cette machine n'avait JAMAIS été portée —
// PlayNewMapMusic/StopMapMusic étaient des bridges directs sans tracking, et
// GetCurrentMapMusic n'existait pas → Overworld_PlaySpecialMapMusic ne pouvait
// rien relancer après le jingle MUS_EVOLVED (silence total post-évolution).

/** 1:1 décomp `void InitMapMusic(void)` (sound.c:58-62). */
export function InitMapMusic(): void {
  gDisableMusic = false;
  ResetMapMusic();
}

/** 1:1 décomp `void MapMusicMain(void)` (sound.c:64-105) — tickée CHAQUE frame
 *  quelle que soit la scène (AgbMain main.c:159, après PlayTimeCounter_Update) :
 *  runOneFrame l'appelle via globalThis (anti-cycle harness↔src). */
export function MapMusicMain(): void {
  switch (sMapMusicState) {
    case 0:
      break;
    case 1:
      sMapMusicState = 2;
      PlayBGM(sCurrentMapMusic);
      break;
    case 2:
    case 3:
    case 4:
      break;
    case 5:
      if (IsBGMStopped()) {
        sNextMapMusic = 0;
        sMapMusicState = 0;
      }
      break;
    case 6:
      if (IsBGMStopped() && IsFanfareTaskInactive()) {
        sCurrentMapMusic = sNextMapMusic;
        sNextMapMusic = 0;
        sMapMusicState = 2;
        PlayBGM(sCurrentMapMusic);
      }
      break;
    case 7:
      if (IsBGMStopped() && IsFanfareTaskInactive()) {
        FadeInNewBGM(sNextMapMusic, sMapMusicFadeInSpeed);
        sCurrentMapMusic = sNextMapMusic;
        sNextMapMusic = 0;
        sMapMusicState = 2;
        sMapMusicFadeInSpeed = 0;
      }
      break;
  }
}

/** 1:1 décomp `void ResetMapMusic(void)` (sound.c:107-113). */
export function ResetMapMusic(): void {
  sCurrentMapMusic = 0;
  sNextMapMusic = 0;
  sMapMusicState = 0;
  sMapMusicFadeInSpeed = 0;
}

/** 1:1 décomp `u16 GetCurrentMapMusic(void)` (sound.c:115-118). */
export function GetCurrentMapMusic(): number {
  return sCurrentMapMusic;
}

/** 1:1 décomp `void PlayNewMapMusic(u16 songNum)` (sound.c:120-125) : pose la
 *  musique + state 1 → le PLAY est DIFFÉRÉ au prochain tick MapMusicMain. */
export function PlayNewMapMusic(songNum: number): void {
  sCurrentMapMusic = songNum;
  sNextMapMusic = 0;
  sMapMusicState = 1;
}

/** 1:1 décomp `void StopMapMusic(void)` (sound.c:127-132) : current=0 + state 1
 *  → le tick suivant fait PlayBGM(0) = stop du slot BGM. */
export function StopMapMusic(): void {
  sCurrentMapMusic = 0;
  sNextMapMusic = 0;
  sMapMusicState = 1;
}

/** 1:1 décomp `void FadeOutMapMusic(u8 speed)` (sound.c:134-141). */
export function FadeOutMapMusic(speed: number): void {
  if (IsNotWaitingForBGMStop())
    FadeOutBGM(speed);
  sCurrentMapMusic = 0;
  sNextMapMusic = 0;
  sMapMusicState = 5;
}

/** 1:1 décomp `void FadeOutAndPlayNewMapMusic(u16 songNum, u8 speed)`
 *  (sound.c:143-149) : fade-out puis play différé quand le BGM est stoppé. */
export function FadeOutAndPlayNewMapMusic(songNum: number, speed: number): void {
  FadeOutMapMusic(speed);
  sCurrentMapMusic = 0;
  sNextMapMusic = songNum;
  sMapMusicState = 6;
}

/** 1:1 décomp `void FadeOutAndFadeInNewMapMusic(u16 songNum, u8 fadeOutSpeed,
 *  u8 fadeInSpeed)` (sound.c:151-158). */
export function FadeOutAndFadeInNewMapMusic(songNum: number, fadeOutSpeed: number, fadeInSpeed: number): void {
  FadeOutMapMusic(fadeOutSpeed);
  sCurrentMapMusic = 0;
  sNextMapMusic = songNum;
  sMapMusicState = 7;
  sMapMusicFadeInSpeed = fadeInSpeed;
}

/** 1:1 décomp `static void UNUSED FadeInNewMapMusic(u16 songNum, u8 speed)`
 *  (sound.c:160-167) — morte dans la décomp, conservée miroir. */
function FadeInNewMapMusic(songNum: number, speed: number): void {
  FadeInNewBGM(songNum, speed);
  sCurrentMapMusic = songNum;
  sNextMapMusic = 0;
  sMapMusicState = 2;
  sMapMusicFadeInSpeed = 0;
}
void FadeInNewMapMusic;

/** 1:1 décomp `bool8 IsNotWaitingForBGMStop(void)` (sound.c:169-178). */
export function IsNotWaitingForBGMStop(): boolean {
  if (sMapMusicState === 6) return false;
  if (sMapMusicState === 5) return false;
  if (sMapMusicState === 7) return false;
  return true;
}

// Bridge globalThis pour les auto-callbacks (= eval scope @ts-nocheck) + le tick
// AgbMain (runOneFrame → MapMusicMain, anti-cycle harness↔src).
(globalThis as Record<string, unknown>).IsStereoSound = IsStereoSound;
(globalThis as Record<string, unknown>).SetPokemonCryStereo = SetPokemonCryStereo;
(globalThis as Record<string, unknown>).IsBGMPausedOrStopped = IsBGMPausedOrStopped;
(globalThis as Record<string, unknown>).FadeOutBGMTemporarily = FadeOutBGMTemporarily;
(globalThis as Record<string, unknown>).MapMusicMain = MapMusicMain;
(globalThis as Record<string, unknown>).GetCurrentMapMusic = GetCurrentMapMusic;
(globalThis as Record<string, unknown>).PlayNewMapMusic = PlayNewMapMusic;
(globalThis as Record<string, unknown>).FadeOutAndPlayNewMapMusic = FadeOutAndPlayNewMapMusic;
// Délégation decomp-globals → FOYER (PlayBGM + gDisableMusic uniques ici) :
// decomp-globals.PlayBGM/setDisableMusic routent sur ces ponts (anti-cycle,
// sound.ts importe decomp-globals donc l'inverse est interdit en statique).
(globalThis as Record<string, unknown>).__soundPlayBGM = PlayBGM;
(globalThis as Record<string, unknown>).__soundSetDisableMusic = (v: boolean) => { gDisableMusic = v; };
