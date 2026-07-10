/**
 * sound.ts — Port 1:1 COMPLET de `decomp/src/sound.c` (631 l) : map-music
 * state machine, fanfares (sFanfares + Task_Fanfare), cris Pokémon
 * (PlayCry_* → PlayCryInternal → SetPokemonCry* + gCryTable), SE avec panning,
 * fades BGM et prédicats de statut.
 *
 * Driver : les fonctions m4a fines (m4aMPlayStop/Continue/FadeIn/…,
 * SetPokemonCry*) viennent DIRECTEMENT de src/m4a.ts (moteur 1:1 certifié
 * sample-exact) ; m4aSongNumStart passe par decomp-globals qui DISPATCH
 * natif/legacy (`?m4a-legacy`). En mode legacy, les chemins natifs sont
 * inertes (gSongTable=0) et les fonctions marquées [legacy] ci-dessous
 * délèguent au shim historique (harness/m4a/player) — comportement inchangé.
 *
 * gCryTable/gCryTable_Reverse : offsets gSoundMemory (adresses ROM du blob),
 * posés par harness/m4a/native.ts depuis sound-data.json (sound.c les déclare
 * `extern struct ToneData[]` — elles vivent dans sound_data.s).
 */
import { m4aSongNumStart, FuncIsActiveTask, IsFanfareTaskInactive as shimIsFanfareTaskInactive } from '../harness/runtime/decomp-globals';
import {
  fadeOutBgmTemporarily as legacyFadeOutBgmTemporarily,
  isBgmPausedOrStopped as legacyIsBgmPausedOrStopped,
  stopSong as legacyStopSong,
  isPlaying as legacyIsPlaying,
  fadeOutBgm as legacyFadeOutBgm,
  fadeInBgm as legacyFadeInBgm,
} from '../harness/m4a/player';
import { M4A_NATIVE } from '../harness/m4a/native';
import { ClearPokemonCrySongs } from './main';
import {
  gMPlayInfo_BGM,
  gMPlayInfo_SE1,
  gMPlayInfo_SE2,
  gMPlayInfo_SE3,
  IsPokemonCryPlaying,
  m4aMPlayContinue,
  m4aMPlayFadeIn,
  m4aMPlayFadeOut,
  m4aMPlayFadeOutTemporarily,
  m4aMPlayImmInit,
  m4aMPlayPanpotControl,
  m4aMPlayStop,
  m4aMPlayVolumeControl,
  m4aSongNumStop,
  SetPokemonCryChorus,
  SetPokemonCryLength,
  SetPokemonCryPanpot,
  SetPokemonCryPitch,
  SetPokemonCryPriority,
  SetPokemonCryProgress,
  SetPokemonCryRelease,
  SetPokemonCryTone,
  SetPokemonCryVolume,
  SetPokemonCryStereo as m4aSetPokemonCryStereo,
} from './m4a';
import type { MusicPlayerInfo } from '../include/gba/m4a_internal';
import { MUSICPLAYER_STATUS_PAUSE, MUSICPLAYER_STATUS_TRACK, TRACKS_ALL } from '../include/gba/m4a_internal';
import { CreateTask, DestroyTask } from './task';
import { gBattleTypeFlags } from './engine/battle/state';
import { BATTLE_TYPE_MULTI } from './engine/battle/constants';
import { SpeciesToCryId } from './pokemon';
import { gSaveBlock2Ptr } from './engine/save/save-block-state';
import { OPTIONS_SOUND_MONO, OPTIONS_SOUND_STEREO } from '../include/constants/global';
import {
  MUS_NONE, MUS_DUMMY, MUS_LEVEL_UP, MUS_OBTAIN_ITEM, MUS_EVOLVED, MUS_OBTAIN_TMHM,
  MUS_HEAL, MUS_OBTAIN_BADGE, MUS_MOVE_DELETED, MUS_OBTAIN_BERRY, MUS_AWAKEN_LEGEND,
  MUS_SLOTS_JACKPOT, MUS_SLOTS_WIN, MUS_TOO_BAD, MUS_RG_POKE_FLUTE,
  MUS_RG_OBTAIN_KEY_ITEM, MUS_RG_DEX_RATING, MUS_OBTAIN_B_POINTS, MUS_OBTAIN_SYMBOL,
  MUS_REGISTER_MATCH_CALL,
} from '../include/constants/songs';
import {
  CRY_MODE_DOUBLES, CRY_MODE_ECHO_END, CRY_MODE_ECHO_START, CRY_MODE_ENCOUNTER,
  CRY_MODE_FAINT, CRY_MODE_GROWL_1, CRY_MODE_GROWL_2, CRY_MODE_HIGH_PITCH,
  CRY_MODE_NORMAL, CRY_MODE_ROAR_1, CRY_MODE_ROAR_2, CRY_MODE_WEAK,
  CRY_MODE_WEAK_DOUBLES, CRY_PRIORITY_NORMAL, CRY_VOLUME,
  FANFARE_AWAKEN_LEGEND, FANFARE_EVOLVED, FANFARE_HEAL, FANFARE_LEVEL_UP,
  FANFARE_MOVE_DELETED, FANFARE_OBTAIN_B_POINTS, FANFARE_OBTAIN_BADGE,
  FANFARE_OBTAIN_BERRY, FANFARE_OBTAIN_ITEM, FANFARE_OBTAIN_SYMBOL,
  FANFARE_OBTAIN_TMHM, FANFARE_REGISTER_MATCH_CALL, FANFARE_RG_DEX_RATING,
  FANFARE_RG_OBTAIN_KEY_ITEM, FANFARE_RG_POKE_FLUTE, FANFARE_SLOTS_JACKPOT,
  FANFARE_SLOTS_WIN, FANFARE_TOO_BAD,
} from '../include/constants/sound';

// struct Fanfare { u16 songNum; u16 duration; } (sound.c:11-15)
interface Fanfare { songNum: number; duration: number; }

// ─── 1:1 sound.c:17-26 — EWRAM/statics ──────────────────────────────────────
export let gMPlay_PokemonCry: MusicPlayerInfo | null = null;
export let gPokemonCryBGMDuckingCounter = 0;

let sCurrentMapMusic = 0;
let sNextMapMusic = 0;
let sMapMusicState = 0;
let sMapMusicFadeInSpeed = 0;
let sFanfareCounter = 0;

export let gDisableMusic = false;

// gCryTable / gCryTable_Reverse : extern struct ToneData[] (sound.c:28-29) —
// offsets gSoundMemory posés par le chargeur natif (sound-data.json).
export let gCryTable = 0;
export let gCryTable_Reverse = 0;
export function setGCryTables(normal: number, reverse: number): void {
  gCryTable = normal;
  gCryTable_Reverse = reverse;
}

// The 1st argument in the table is the length of the fanfare, measured in frames. (sound.c:36-56)
const sFanfares: Fanfare[] = [];
sFanfares[FANFARE_LEVEL_UP] = { songNum: MUS_LEVEL_UP, duration: 80 };
sFanfares[FANFARE_OBTAIN_ITEM] = { songNum: MUS_OBTAIN_ITEM, duration: 160 };
sFanfares[FANFARE_EVOLVED] = { songNum: MUS_EVOLVED, duration: 220 };
sFanfares[FANFARE_OBTAIN_TMHM] = { songNum: MUS_OBTAIN_TMHM, duration: 220 };
sFanfares[FANFARE_HEAL] = { songNum: MUS_HEAL, duration: 160 };
sFanfares[FANFARE_OBTAIN_BADGE] = { songNum: MUS_OBTAIN_BADGE, duration: 340 };
sFanfares[FANFARE_MOVE_DELETED] = { songNum: MUS_MOVE_DELETED, duration: 180 };
sFanfares[FANFARE_OBTAIN_BERRY] = { songNum: MUS_OBTAIN_BERRY, duration: 120 };
sFanfares[FANFARE_AWAKEN_LEGEND] = { songNum: MUS_AWAKEN_LEGEND, duration: 710 };
sFanfares[FANFARE_SLOTS_JACKPOT] = { songNum: MUS_SLOTS_JACKPOT, duration: 250 };
sFanfares[FANFARE_SLOTS_WIN] = { songNum: MUS_SLOTS_WIN, duration: 150 };
sFanfares[FANFARE_TOO_BAD] = { songNum: MUS_TOO_BAD, duration: 160 };
sFanfares[FANFARE_RG_POKE_FLUTE] = { songNum: MUS_RG_POKE_FLUTE, duration: 450 };
sFanfares[FANFARE_RG_OBTAIN_KEY_ITEM] = { songNum: MUS_RG_OBTAIN_KEY_ITEM, duration: 170 };
sFanfares[FANFARE_RG_DEX_RATING] = { songNum: MUS_RG_DEX_RATING, duration: 196 };
sFanfares[FANFARE_OBTAIN_B_POINTS] = { songNum: MUS_OBTAIN_B_POINTS, duration: 313 };
sFanfares[FANFARE_OBTAIN_SYMBOL] = { songNum: MUS_OBTAIN_SYMBOL, duration: 318 };
sFanfares[FANFARE_REGISTER_MATCH_CALL] = { songNum: MUS_REGISTER_MATCH_CALL, duration: 135 };

/** 1:1 décomp `void InitMapMusic(void)` (sound.c:58-62). */
export function InitMapMusic(): void {
  gDisableMusic = false;
  ResetMapMusic();
}

/** 1:1 décomp `void MapMusicMain(void)` (sound.c:64-105) — tickée CHAQUE frame
 *  (AgbMain main.c:159) via runOneFrame → globalThis (anti-cycle harness↔src). */
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

/** 1:1 décomp `void PlayNewMapMusic(u16 songNum)` (sound.c:120-125). */
export function PlayNewMapMusic(songNum: number): void {
  sCurrentMapMusic = songNum;
  sNextMapMusic = 0;
  sMapMusicState = 1;
}

/** 1:1 décomp `void StopMapMusic(void)` (sound.c:127-132). */
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

/** 1:1 décomp `void FadeOutAndPlayNewMapMusic(u16 songNum, u8 speed)` (sound.c:143-149). */
export function FadeOutAndPlayNewMapMusic(songNum: number, speed: number): void {
  FadeOutMapMusic(speed);
  sCurrentMapMusic = 0;
  sNextMapMusic = songNum;
  sMapMusicState = 6;
}

/** 1:1 décomp `void FadeOutAndFadeInNewMapMusic(u16, u8, u8)` (sound.c:151-158). */
export function FadeOutAndFadeInNewMapMusic(songNum: number, fadeOutSpeed: number, fadeInSpeed: number): void {
  FadeOutMapMusic(fadeOutSpeed);
  sCurrentMapMusic = 0;
  sNextMapMusic = songNum;
  sMapMusicState = 7;
  sMapMusicFadeInSpeed = fadeInSpeed;
}

/** 1:1 décomp `static void UNUSED FadeInNewMapMusic(u16, u8)` (sound.c:160-167)
 *  — morte dans la décomp, conservée miroir. */
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

// ─── Fanfares (1:1 sound.c:180-256) ─────────────────────────────────────────

/** 1:1 décomp `void PlayFanfareByFanfareNum(u8 fanfareNum)` (sound.c:180-187). */
export function PlayFanfareByFanfareNum(fanfareNum: number): void {
  m4aMPlayStop(gMPlayInfo_BGM);
  const songNum = sFanfares[fanfareNum].songNum;
  sFanfareCounter = sFanfares[fanfareNum].duration;
  m4aSongNumStart(songNum);
}

/** 1:1 décomp `bool8 WaitFanfare(bool8 stop)` (sound.c:189-205). */
export function WaitFanfare(stop: boolean): boolean {
  if (sFanfareCounter) {
    sFanfareCounter--;
    return false;
  } else {
    if (!stop)
      m4aMPlayContinue(gMPlayInfo_BGM);
    else
      m4aSongNumStart(MUS_DUMMY);

    return true;
  }
}

/** 1:1 décomp `void StopFanfareByFanfareNum(u8 fanfareNum)` (sound.c:207-211, unused). */
export function StopFanfareByFanfareNum(fanfareNum: number): void {
  m4aSongNumStop(sFanfares[fanfareNum].songNum);
}

/** 1:1 décomp `void PlayFanfare(u16 songNum)` (sound.c:213-230). */
export function PlayFanfare(songNum: number): void {
  for (let i = 0; i < sFanfares.length; i++) {
    if (sFanfares[i].songNum === songNum) {
      PlayFanfareByFanfareNum(i);
      CreateFanfareTask();
      return;
    }
  }

  // songNum is not in sFanfares
  // Play first fanfare in table instead
  PlayFanfareByFanfareNum(0);
  CreateFanfareTask();
}

/** 1:1 décomp `bool8 IsFanfareTaskInactive(void)` (sound.c:232-237).
 *  [legacy] : le shim tracke SA fanfare (durée réelle du .mid) — délégué. */
export function IsFanfareTaskInactive(): boolean {
  if (!M4A_NATIVE) return shimIsFanfareTaskInactive();
  if (FuncIsActiveTask(Task_Fanfare) === true) return false;
  return true;
}

/** 1:1 décomp `static void Task_Fanfare(u8 taskId)` (sound.c:239-250). */
function Task_Fanfare(task: { taskId: number }): void {
  if (sFanfareCounter) {
    sFanfareCounter--;
  } else {
    m4aMPlayContinue(gMPlayInfo_BGM);
    DestroyTask(task.taskId);
  }
}

/** 1:1 décomp `static void CreateFanfareTask(void)` (sound.c:252-256). */
function CreateFanfareTask(): void {
  if (FuncIsActiveTask(Task_Fanfare) !== true)
    CreateTask(Task_Fanfare, 80);
}

// ─── Fades BGM (1:1 sound.c:258-300) ────────────────────────────────────────

/** 1:1 décomp `void FadeInNewBGM(u16 songNum, u8 speed)` (sound.c:258-269) :
 *  pré-charge (start → ImmInit → volume 0 → stop) puis m4aMPlayFadeIn.
 *  [legacy] : start + fade-in du gain (shim). */
export function FadeInNewBGM(songNum: number, speed: number): void {
  if (gDisableMusic) songNum = 0;
  if (songNum === MUS_NONE) songNum = 0;
  if (!M4A_NATIVE) {
    if (songNum === 0) { legacyStopSong('bgm'); return; }
    m4aSongNumStart(songNum);
    legacyFadeInBgm(speed);
    return;
  }
  m4aSongNumStart(songNum);
  m4aMPlayImmInit(gMPlayInfo_BGM);
  m4aMPlayVolumeControl(gMPlayInfo_BGM, TRACKS_ALL, 0);
  m4aSongNumStop(songNum);
  m4aMPlayFadeIn(gMPlayInfo_BGM, speed);
}

/** 1:1 décomp `void FadeOutBGMTemporarily(u8 speed)` (sound.c:271-274). */
export function FadeOutBGMTemporarily(speed: number): void {
  if (!M4A_NATIVE) { legacyFadeOutBgmTemporarily(speed); return; }
  m4aMPlayFadeOutTemporarily(gMPlayInfo_BGM, speed);
}

/** 1:1 décomp `bool8 IsBGMPausedOrStopped(void)` (sound.c:276-283). */
export function IsBGMPausedOrStopped(): boolean {
  if (!M4A_NATIVE) return legacyIsBgmPausedOrStopped();
  if (gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_PAUSE) return true;
  if (!(gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_TRACK)) return true;
  return false;
}

/** 1:1 décomp `void FadeInBGM(u8 speed)` (sound.c:285-288). */
export function FadeInBGM(speed: number): void {
  if (!M4A_NATIVE) { legacyFadeInBgm(speed); return; }
  m4aMPlayFadeIn(gMPlayInfo_BGM, speed);
}

/** 1:1 décomp `void FadeOutBGM(u8 speed)` (sound.c:290-293). */
export function FadeOutBGM(speed: number): void {
  if (!M4A_NATIVE) { legacyFadeOutBgm(speed); return; }
  m4aMPlayFadeOut(gMPlayInfo_BGM, speed);
}

/** 1:1 décomp `bool8 IsBGMStopped(void)` (sound.c:295-300). */
export function IsBGMStopped(): boolean {
  if (!M4A_NATIVE) return !legacyIsPlaying('bgm');
  if (!(gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_TRACK)) return true;
  return false;
}

// ─── Cris Pokémon (1:1 sound.c:302-561) ─────────────────────────────────────

/** 1:1 décomp `void PlayCry_Normal(u16 species, s8 pan)` (sound.c:302-308). */
export function PlayCry_Normal(species: number, pan: number): void {
  m4aMPlayVolumeControl(gMPlayInfo_BGM, TRACKS_ALL, 85);
  PlayCryInternal(species, pan, CRY_VOLUME, CRY_PRIORITY_NORMAL, CRY_MODE_NORMAL);
  gPokemonCryBGMDuckingCounter = 2;
  RestoreBGMVolumeAfterPokemonCry();
}

/** 1:1 décomp `void PlayCry_NormalNoDucking(u16, s8, s8, u8)` (sound.c:310-313). */
export function PlayCry_NormalNoDucking(species: number, pan: number, volume: number, priority: number): void {
  PlayCryInternal(species, pan, volume, priority, CRY_MODE_NORMAL);
}

/** 1:1 décomp `void PlayCry_ByMode(u16 species, s8 pan, u8 mode)` (sound.c:316-329). */
export function PlayCry_ByMode(species: number, pan: number, mode: number): void {
  if (mode === CRY_MODE_DOUBLES) {
    PlayCryInternal(species, pan, CRY_VOLUME, CRY_PRIORITY_NORMAL, mode);
  } else {
    m4aMPlayVolumeControl(gMPlayInfo_BGM, TRACKS_ALL, 85);
    PlayCryInternal(species, pan, CRY_VOLUME, CRY_PRIORITY_NORMAL, mode);
    gPokemonCryBGMDuckingCounter = 2;
    RestoreBGMVolumeAfterPokemonCry();
  }
}

/** 1:1 décomp `void PlayCry_ReleaseDouble(u16, s8, u8)` (sound.c:332-344). */
export function PlayCry_ReleaseDouble(species: number, pan: number, mode: number): void {
  if (mode === CRY_MODE_DOUBLES) {
    PlayCryInternal(species, pan, CRY_VOLUME, CRY_PRIORITY_NORMAL, mode);
  } else {
    if (!(gBattleTypeFlags & BATTLE_TYPE_MULTI))
      m4aMPlayVolumeControl(gMPlayInfo_BGM, TRACKS_ALL, 85);
    PlayCryInternal(species, pan, CRY_VOLUME, CRY_PRIORITY_NORMAL, mode);
  }
}

/** 1:1 décomp `void PlayCry_DuckNoRestore(u16, s8, u8)` (sound.c:347-359). */
export function PlayCry_DuckNoRestore(species: number, pan: number, mode: number): void {
  if (mode === CRY_MODE_DOUBLES) {
    PlayCryInternal(species, pan, CRY_VOLUME, CRY_PRIORITY_NORMAL, mode);
  } else {
    m4aMPlayVolumeControl(gMPlayInfo_BGM, TRACKS_ALL, 85);
    PlayCryInternal(species, pan, CRY_VOLUME, CRY_PRIORITY_NORMAL, mode);
    gPokemonCryBGMDuckingCounter = 2;
  }
}

/** 1:1 décomp `void PlayCry_Script(u16 species, u8 mode)` (sound.c:361-367). */
export function PlayCry_Script(species: number, mode: number): void {
  m4aMPlayVolumeControl(gMPlayInfo_BGM, TRACKS_ALL, 85);
  PlayCryInternal(species, 0, CRY_VOLUME, CRY_PRIORITY_NORMAL, mode);
  gPokemonCryBGMDuckingCounter = 2;
  RestoreBGMVolumeAfterPokemonCry();
}

/** 1:1 décomp `void PlayCryInternal(u16 species, s8 pan, s8 volume, u8 priority,
 *  u8 mode)` (sound.c:369-495). */
export function PlayCryInternal(species: number, pan: number, volume: number, priority: number, mode: number): void {
  species--;

  // Set default values
  // May be overridden depending on mode.
  let length = 140;
  let reverse = false;
  let release = 0;
  let pitch = 15360;
  let chorus = 0;

  switch (mode) {
    case CRY_MODE_NORMAL:
      break;
    case CRY_MODE_DOUBLES:
      length = 20;
      release = 225;
      break;
    case CRY_MODE_ENCOUNTER:
      release = 225;
      pitch = 15600;
      chorus = 20;
      volume = 90;
      break;
    case CRY_MODE_HIGH_PITCH:
      length = 50;
      release = 200;
      pitch = 15800;
      chorus = 20;
      volume = 90;
      break;
    case CRY_MODE_ECHO_START:
      length = 25;
      reverse = true;
      release = 100;
      pitch = 15600;
      chorus = 192;
      volume = 90;
      break;
    case CRY_MODE_FAINT:
      release = 200;
      pitch = 14440;
      break;
    case CRY_MODE_ECHO_END:
      release = 220;
      pitch = 15555;
      chorus = 192;
      volume = 70;
      break;
    case CRY_MODE_ROAR_1:
      length = 10;
      release = 100;
      pitch = 14848;
      break;
    case CRY_MODE_ROAR_2:
      length = 60;
      release = 225;
      pitch = 15616;
      break;
    case CRY_MODE_GROWL_1:
      length = 15;
      reverse = true;
      release = 125;
      pitch = 15200;
      break;
    case CRY_MODE_GROWL_2:
      length = 100;
      release = 225;
      pitch = 15200;
      break;
    case CRY_MODE_WEAK_DOUBLES:
      length = 20;
      release = 225;
      // fallthrough
    case CRY_MODE_WEAK:
      pitch = 15000;
      break;
  }

  SetPokemonCryVolume(volume);
  SetPokemonCryPanpot(pan);
  SetPokemonCryPitch(pitch);
  SetPokemonCryLength(length);
  SetPokemonCryProgress(0);
  SetPokemonCryRelease(release);
  SetPokemonCryChorus(chorus);
  SetPokemonCryPriority(priority);

  // This is a fancy way to get a cry of a Pokémon.
  // It creates 4 sets of 128 mini cry tables.
  species = SpeciesToCryId(species);
  const index = species % 128;
  const table = Math.trunc(species / 128);

  // GET_CRY(speciesIndex, tableId, reversed) : &gCryTable[_Reverse]
  // [(128 * tableId) + speciesIndex] — ToneData = 12 octets (adresse blob).
  const GET_CRY = (speciesIndex: number, tableId: number, reversed: boolean): number =>
    (reversed ? gCryTable_Reverse : gCryTable) + 12 * ((128 * tableId) + speciesIndex);

  switch (table) {
    case 0:
      gMPlay_PokemonCry = SetPokemonCryTone(GET_CRY(index, 0, reverse));
      break;
    case 1:
      gMPlay_PokemonCry = SetPokemonCryTone(GET_CRY(index, 1, reverse));
      break;
    case 2:
      gMPlay_PokemonCry = SetPokemonCryTone(GET_CRY(index, 2, reverse));
      break;
    case 3:
      gMPlay_PokemonCry = SetPokemonCryTone(GET_CRY(index, 3, reverse));
      break;
  }
}

/** 1:1 décomp `bool8 IsCryFinished(void)` (sound.c:497-508). */
export function IsCryFinished(): boolean {
  if (FuncIsActiveTask(Task_DuckBGMForPokemonCry) === true) {
    return false;
  } else {
    ClearPokemonCrySongs();
    return true;
  }
}

/** 1:1 décomp `void StopCryAndClearCrySongs(void)` (sound.c:510-514).
 *  (gMPlay_PokemonCry NULL = déréférence 0 sur GBA, no-op de fait → garde.) */
export function StopCryAndClearCrySongs(): void {
  if (gMPlay_PokemonCry) m4aMPlayStop(gMPlay_PokemonCry);
  ClearPokemonCrySongs();
}

/** 1:1 décomp `void StopCry(void)` (sound.c:516-519). */
export function StopCry(): void {
  if (gMPlay_PokemonCry) m4aMPlayStop(gMPlay_PokemonCry);
}

/** 1:1 décomp `bool8 IsCryPlayingOrClearCrySongs(void)` (sound.c:521-532). */
export function IsCryPlayingOrClearCrySongs(): boolean {
  if (gMPlay_PokemonCry && IsPokemonCryPlaying(gMPlay_PokemonCry)) {
    return true;
  } else {
    ClearPokemonCrySongs();
    return false;
  }
}

/** 1:1 décomp `bool8 IsCryPlaying(void)` (sound.c:534-540). */
export function IsCryPlaying(): boolean {
  if (gMPlay_PokemonCry && IsPokemonCryPlaying(gMPlay_PokemonCry))
    return true;
  else
    return false;
}

/** 1:1 décomp `static void Task_DuckBGMForPokemonCry(u8 taskId)` (sound.c:542-555). */
function Task_DuckBGMForPokemonCry(task: { taskId: number }): void {
  if (gPokemonCryBGMDuckingCounter) {
    gPokemonCryBGMDuckingCounter--;
    return;
  }

  if (!(gMPlay_PokemonCry && IsPokemonCryPlaying(gMPlay_PokemonCry))) {
    m4aMPlayVolumeControl(gMPlayInfo_BGM, TRACKS_ALL, 256);
    DestroyTask(task.taskId);
  }
}

/** 1:1 décomp `static void RestoreBGMVolumeAfterPokemonCry(void)` (sound.c:557-561). */
function RestoreBGMVolumeAfterPokemonCry(): void {
  if (FuncIsActiveTask(Task_DuckBGMForPokemonCry) !== true)
    CreateTask(Task_DuckBGMForPokemonCry, 80);
}

// ─── BGM / SE (1:1 sound.c:563-631) ─────────────────────────────────────────

/** 1:1 décomp `void PlayBGM(u16 songNum)` (sound.c:563-570).
 *  [legacy] : m4aSongNumStart(0) shim = « not mapped, skip » → stop explicite
 *  du slot (fix bug 4 évolution 2026-07-02). En natif, jouer MUS_DUMMY (0)
 *  EST le silence 1:1. */
export function PlayBGM(songNum: number): void {
  if (gDisableMusic) songNum = 0;
  if (songNum === MUS_NONE) songNum = 0;
  if (!M4A_NATIVE && songNum === 0) { legacyStopSong('bgm'); return; }
  m4aSongNumStart(songNum);
}

/** 1:1 décomp `void PlaySE(u16 songNum)` (sound.c:572-575). */
export function PlaySE(songNum: number): void {
  m4aSongNumStart(songNum);
}

/** 1:1 décomp `void PlaySE12WithPanning(u16 songNum, s8 pan)` (sound.c:577-584). */
export function PlaySE12WithPanning(songNum: number, pan: number): void {
  m4aSongNumStart(songNum);
  m4aMPlayImmInit(gMPlayInfo_SE1);
  m4aMPlayImmInit(gMPlayInfo_SE2);
  m4aMPlayPanpotControl(gMPlayInfo_SE1, TRACKS_ALL, pan);
  m4aMPlayPanpotControl(gMPlayInfo_SE2, TRACKS_ALL, pan);
}

/** 1:1 décomp `void PlaySE1WithPanning(u16 songNum, s8 pan)` (sound.c:586-591). */
export function PlaySE1WithPanning(songNum: number, pan: number): void {
  m4aSongNumStart(songNum);
  m4aMPlayImmInit(gMPlayInfo_SE1);
  m4aMPlayPanpotControl(gMPlayInfo_SE1, TRACKS_ALL, pan);
}

/** 1:1 décomp `void PlaySE2WithPanning(u16 songNum, s8 pan)` (sound.c:593-598). */
export function PlaySE2WithPanning(songNum: number, pan: number): void {
  m4aSongNumStart(songNum);
  m4aMPlayImmInit(gMPlayInfo_SE2);
  m4aMPlayPanpotControl(gMPlayInfo_SE2, TRACKS_ALL, pan);
}

/** 1:1 décomp `void SE12PanpotControl(s8 pan)` (sound.c:600-604). */
export function SE12PanpotControl(pan: number): void {
  m4aMPlayPanpotControl(gMPlayInfo_SE1, TRACKS_ALL, pan);
  m4aMPlayPanpotControl(gMPlayInfo_SE2, TRACKS_ALL, pan);
}

/** 1:1 décomp `bool8 IsSEPlaying(void)` (sound.c:606-613). */
export function IsSEPlaying(): boolean {
  if ((gMPlayInfo_SE1.status & MUSICPLAYER_STATUS_PAUSE) && (gMPlayInfo_SE2.status & MUSICPLAYER_STATUS_PAUSE))
    return false;
  if (!(gMPlayInfo_SE1.status & MUSICPLAYER_STATUS_TRACK) && !(gMPlayInfo_SE2.status & MUSICPLAYER_STATUS_TRACK))
    return false;
  return true;
}

/** 1:1 décomp `bool8 IsBGMPlaying(void)` (sound.c:615-622). */
export function IsBGMPlaying(): boolean {
  if (gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_PAUSE) return false;
  if (!(gMPlayInfo_BGM.status & MUSICPLAYER_STATUS_TRACK)) return false;
  return true;
}

/** 1:1 décomp `bool8 IsSpecialSEPlaying(void)` (sound.c:624-631). */
export function IsSpecialSEPlaying(): boolean {
  if (gMPlayInfo_SE3.status & MUSICPLAYER_STATUS_PAUSE) return false;
  if (!(gMPlayInfo_SE3.status & MUSICPLAYER_STATUS_TRACK)) return false;
  return true;
}

// ─── Helpers harness (hors sound.c) ─────────────────────────────────────────

/** [harness] true si STEREO (gSaveBlock2Ptr.optionsSound) — consommé par le
 *  shim legacy ; le natif passe par SetPokemonCryStereo/soundInfo.mode. */
export function IsStereoSound(): boolean {
  return ((gSaveBlock2Ptr.optionsSound ?? OPTIONS_SOUND_MONO) | 0) === OPTIONS_SOUND_STEREO;
}

/** 1:1 m4a.c `SetPokemonCryStereo(u32 val)` — natif : soundInfo.mode ;
 *  [legacy] : miroir des options save lu par IsStereoSound (shim). */
export function SetPokemonCryStereo(selection: number): void {
  gSaveBlock2Ptr.optionsSound = selection | 0;
  if (M4A_NATIVE) m4aSetPokemonCryStereo(selection);
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
// Délégation decomp-globals → FOYER (anti-cycle : sound.ts importe
// decomp-globals, l'inverse passe par globalThis).
(globalThis as Record<string, unknown>).__soundPlayBGM = PlayBGM;
(globalThis as Record<string, unknown>).__soundSetDisableMusic = (v: boolean) => { gDisableMusic = v; };
(globalThis as Record<string, unknown>).__soundPlayFanfare = PlayFanfare;
(globalThis as Record<string, unknown>).__soundPlayFanfareByFanfareNum = PlayFanfareByFanfareNum;
(globalThis as Record<string, unknown>).__soundWaitFanfare = WaitFanfare;
(globalThis as Record<string, unknown>).__soundIsFanfareTaskInactive = IsFanfareTaskInactive;
(globalThis as Record<string, unknown>).__soundPlaySE = PlaySE;
(globalThis as Record<string, unknown>).__soundPlayCryInternal = PlayCryInternal;
(globalThis as Record<string, unknown>).__soundIsSEPlaying = IsSEPlaying;
(globalThis as Record<string, unknown>).__soundIsCryPlaying = IsCryPlaying;
(globalThis as Record<string, unknown>).__soundIsCryFinished = IsCryFinished;
