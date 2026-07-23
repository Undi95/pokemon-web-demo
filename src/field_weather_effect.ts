/**
 * field_weather_effect.ts — Port 1:1 STRICT (MIROIR) de `src/field_weather_effect.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/field_weather_effect.c`.
 *
 * Ce fichier = les EFFETS par-météo (sprites/particules) + les fonctions CONTROL
 * (SetWeather/DoCurrentWeather/ResumePausedWeather…) qui pilotent le framework de
 * `field_weather.ts`. Chaque effet enregistre ses 4 callbacks dans la table
 * `sWeatherFuncs` (field_weather.ts) via `_registerWeatherFuncs`.
 *
 * État staged (1 effet = 1 commit, A/B chacun) :
 *   ✅ C2 (ce commit) : CONTROL (SetSavedWeather/Get/FromCurrMapHeader/SetWeather/
 *      DoCurrentWeather/ResumePausedWeather/TranslateWeatherNum/UpdateWeatherPerDay/
 *      UpdateRainCounter/Task_DoAbnormalWeather/CreateAbnormalWeatherTask) + l'effet
 *      ASH (WEATHER_VOLCANIC_ASH : nuages de cendre dérivants, Route 113).
 *   ✅ C3 : WEATHER_SUNNY + WEATHER_SHADE (color-map only) + WEATHER_FOG_HORIZONTAL
 *      (= aussi WEATHER_UNDERWATER, mêmes callbacks) + WEATHER_SUNNY_CLOUDS (3 nuages
 *      map-positionnés, palette custom).
 *   ⏳ C3+ : Rain/Snow/Thunderstorm/Downpour/FogDiagonal/Sandstorm/Bubbles/Drought.
 *
 * ⚠️ AUDIO SKIP (exception projet) : aucun PlaySE.
 */

import { DestroySprite, CalcCenterToCornerVec, CreateSprite, TAG_NONE } from './sprite';
import type { DecompTask, DecompSprite, DecompRuntime } from '../harness/runtime/decomp-runtime';
import {
  getRuntime,
  FuncIsActiveTask,
  FindTaskIdByFunc,
  BLDALPHA_BLEND,
  FreeSpriteTilesByTag,
  REG_OFFSET_WININ,
  REG_OFFSET_BLDCNT,
  REG_OFFSET_BLDY,
  BLDCNT_TGT1_BG1,
  BLDCNT_TGT1_BG2,
  BLDCNT_TGT1_BG3,
  BLDCNT_TGT1_OBJ,
  BLDCNT_EFFECT_LIGHTEN,
} from '../harness/runtime/decomp-globals';

import { SetGpuReg, GetGpuReg } from './gpu_regs';
import { gSineTable } from './trig';
import { ScriptContext_Enable } from './script';
import { CreateTask, DestroyTask } from './task';
import { REG_OFFSET_BLDALPHA, DISPLAY_WIDTH, DISPLAY_HEIGHT } from '../harness/runtime/decomp-runtime';
import { Random } from './random';
import { ISO_RANDOMIZE2 } from '../include/random';
import { IsSEPlaying } from '../harness/runtime/decomp-globals';
import { SE_RAIN, SE_THUNDERSTORM, SE_DOWNPOUR } from '../include/constants/songs';
import { LoadSpriteSheet } from './sprite';
import { loadIndexedPngStrict } from '../harness/gba/png-loader';
import { setFieldEffectAnims } from './field_effect_helpers';
import { ANIMCMD_FRAME, ANIMCMD_JUMP, ANIMCMD_END, type AnimCmd } from './sprite';
import { gSaveBlock1Ptr } from './engine/save/save-block-state';
import { gMapHeader } from './fieldmap';
import * as WeatherConstants from '../include/constants/weather';
import { IncrementGameStat } from './field_player_avatar';
import { GAME_STAT_GOT_RAINED_ON } from '../include/constants/game_stat';
import {
  gWeatherPtr,
  GFXTAG_ASH,
  GFXTAG_FOG_H,
  GFXTAG_CLOUD,
  GFXTAG_RAIN,
  GFXTAG_SANDSTORM,
  GFXTAG_FOG_D,
  GFXTAG_BUBBLE,
  PALTAG_WEATHER,
  ResetDroughtWeatherPaletteLoading,
  LoadDroughtWeatherPalettes,
  DroughtStateInit,
  DroughtStateRun,
  LoadCustomWeatherSpritePalette,
  Weather_SetBlendCoeffs,
  Weather_SetTargetBlendCoeffs,
  Weather_UpdateBlend,
  SetNextWeather,
  SetCurrentAndNextWeather,
  SetRainStrengthFromSoundEffect,
  ApplyWeatherColorMapIfIdle,
  ApplyWeatherColorMapIfIdle_Gradual,
  WEATHER_PAL_STATE_CHANGING_WEATHER,
  WEATHER_PAL_STATE_IDLE,
  _registerWeatherFuncs,
} from './field_weather';
import { MAP_OFFSET } from './fieldmap';
import { SetSpritePosToMapCoords } from './field_camera';

const _rt = (): DecompRuntime => getRuntime();

// ════════════════════════════════════════════════════════════════════════════
//  Constantes (constants/weather.h + constants/field_weather.h)
// ════════════════════════════════════════════════════════════════════════════

const WEATHER_NONE = 0;
const WEATHER_SUNNY_CLOUDS = 1;
const WEATHER_SUNNY = 2;
const WEATHER_RAIN = 3;
const WEATHER_SNOW = 4;
const WEATHER_RAIN_THUNDERSTORM = 5;
const WEATHER_FOG_HORIZONTAL = 6;
const WEATHER_VOLCANIC_ASH = 7;
const WEATHER_SANDSTORM = 8;
const WEATHER_FOG_DIAGONAL = 9;
const WEATHER_UNDERWATER = 10;
const WEATHER_SHADE = 11;
const WEATHER_DROUGHT = 12;
const WEATHER_DOWNPOUR = 13;
const WEATHER_UNDERWATER_BUBBLES = 14;
const WEATHER_ABNORMAL = 15;
const WEATHER_ROUTE119_CYCLE = 20;
const WEATHER_ROUTE123_CYCLE = 21;

const NUM_ASH_SPRITES = 20;
const MAX_SPRITES = 64;
const MAX_RAIN_SPRITES = 24; // constants/field_weather.h

// ════════════════════════════════════════════════════════════════════════════
//  Abnormal weather (field_weather_effect.c:2437-2505)
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `EWRAM_DATA static u8 sCurrentAbnormalWeather` (field_weather_effect.c:17). */
let sCurrentAbnormalWeather = 0;
/** 1:1 décomp `EWRAM_DATA static u16 sUnusedWeatherRelated` (field_weather_effect.c:18). */
let sUnusedWeatherRelated = 0;

/** 1:1 décomp `UnusedSetCurrentAbnormalWeather(u32 weather, u32 unknown)` (field_weather_effect.c:2437). */
function UnusedSetCurrentAbnormalWeather(weather: number, unknown: number): void {
  sCurrentAbnormalWeather = weather;
  sUnusedWeatherRelated = unknown;
}
void UnusedSetCurrentAbnormalWeather;

// data: tState=data[0], tWeatherA=data[1], tWeatherB=data[2], tDelay=data[15].
/** 1:1 décomp `Task_DoAbnormalWeather(u8 taskId)` (field_weather_effect.c:2448). */
function Task_DoAbnormalWeather(task: DecompTask): void {
  const data = task.data;
  switch (data[0]) {
    case 0:
      if (data[15]-- <= 0) {
        SetNextWeather(data[1]);
        sCurrentAbnormalWeather = data[1];
        data[15] = 600;
        data[0]++;
      }
      break;
    case 1:
      if (data[15]-- <= 0) {
        SetNextWeather(data[2]);
        sCurrentAbnormalWeather = data[2];
        data[15] = 600;
        data[0] = 0;
      }
      break;
  }
}

/** 1:1 décomp `CreateAbnormalWeatherTask(void)` (field_weather_effect.c:2475). */
function CreateAbnormalWeatherTask(): void {
  const taskId = CreateTask(Task_DoAbnormalWeather, 0);
  const data = _rt().gTasks[taskId]!.data;

  data[15] = 600;
  if (sCurrentAbnormalWeather === WEATHER_DOWNPOUR) {
    // Currently Downpour, next will be Drought
    data[1] = WEATHER_DROUGHT;
    data[2] = WEATHER_DOWNPOUR;
  } else if (sCurrentAbnormalWeather === WEATHER_DROUGHT) {
    // Currently Drought, next will be Downpour
    data[1] = WEATHER_DOWNPOUR;
    data[2] = WEATHER_DROUGHT;
  } else {
    // Default to starting with Downpour
    sCurrentAbnormalWeather = WEATHER_DOWNPOUR;
    data[1] = WEATHER_DROUGHT;
    data[2] = WEATHER_DOWNPOUR;
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  Control (field_weather_effect.c:2510-2634)
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `SetSavedWeather(u32 weather)` (field_weather_effect.c:2510). */
export function SetSavedWeather(weather: number): void {
  const oldWeather = gSaveBlock1Ptr.weather;
  gSaveBlock1Ptr.weather = TranslateWeatherNum(weather);
  UpdateRainCounter(gSaveBlock1Ptr.weather, oldWeather);
}

/** 1:1 décomp `GetSavedWeather(void)` (field_weather_effect.c:2517). */
export function GetSavedWeather(): number {
  return gSaveBlock1Ptr.weather;
}

/** 1:1 décomp `SetSavedWeatherFromCurrMapHeader(void)` (field_weather_effect.c:2522). */
export function SetSavedWeatherFromCurrMapHeader(): void {
  const oldWeather = gSaveBlock1Ptr.weather;
  gSaveBlock1Ptr.weather = TranslateWeatherNum(_mapHeaderWeatherId());
  UpdateRainCounter(gSaveBlock1Ptr.weather, oldWeather);
}

/** 1:1 décomp `SetWeather(u32 weather)` (field_weather_effect.c:2529). */
export function SetWeather(weather: number): void {
  SetSavedWeather(weather);
  SetNextWeather(GetSavedWeather());
}

/** 1:1 décomp `SetWeather_Unused(u32 weather)` (field_weather_effect.c:2535). */
export function SetWeather_Unused(weather: number): void {
  SetSavedWeather(weather);
  SetCurrentAndNextWeather(GetSavedWeather());
}

/** 1:1 décomp `DoCurrentWeather(void)` (field_weather_effect.c:2541). */
export function DoCurrentWeather(): void {
  let weather = GetSavedWeather();

  if (weather === WEATHER_ABNORMAL) {
    if (!FuncIsActiveTask(Task_DoAbnormalWeather)) CreateAbnormalWeatherTask();
    weather = sCurrentAbnormalWeather;
  } else {
    if (FuncIsActiveTask(Task_DoAbnormalWeather)) DestroyTask(FindTaskIdByFunc(Task_DoAbnormalWeather));
    sCurrentAbnormalWeather = WEATHER_DOWNPOUR;
  }
  SetNextWeather(weather);
}

/** 1:1 décomp `ResumePausedWeather(void)` (field_weather_effect.c:2560). */
export function ResumePausedWeather(): void {
  let weather = GetSavedWeather();

  if (weather === WEATHER_ABNORMAL) {
    if (!FuncIsActiveTask(Task_DoAbnormalWeather)) CreateAbnormalWeatherTask();
    weather = sCurrentAbnormalWeather;
  } else {
    if (FuncIsActiveTask(Task_DoAbnormalWeather)) DestroyTask(FindTaskIdByFunc(Task_DoAbnormalWeather));
    sCurrentAbnormalWeather = WEATHER_DOWNPOUR;
  }
  SetCurrentAndNextWeather(weather);
}

const WEATHER_CYCLE_LENGTH = 4;

/** 1:1 décomp `sWeatherCycleRoute119[]` (field_weather_effect.c:2581). */
const sWeatherCycleRoute119: ReadonlyArray<number> = [
  WEATHER_SUNNY, WEATHER_RAIN, WEATHER_RAIN_THUNDERSTORM, WEATHER_RAIN,
];
/** 1:1 décomp `sWeatherCycleRoute123[]` (field_weather_effect.c:2588). */
const sWeatherCycleRoute123: ReadonlyArray<number> = [
  WEATHER_SUNNY, WEATHER_SUNNY, WEATHER_RAIN, WEATHER_SUNNY,
];

/** 1:1 décomp `TranslateWeatherNum(u8 weather)` (field_weather_effect.c:2596). */
function TranslateWeatherNum(weather: number): number {
  switch (weather) {
    case WEATHER_NONE: return WEATHER_NONE;
    case WEATHER_SUNNY_CLOUDS: return WEATHER_SUNNY_CLOUDS;
    case WEATHER_SUNNY: return WEATHER_SUNNY;
    case WEATHER_RAIN: return WEATHER_RAIN;
    case WEATHER_SNOW: return WEATHER_SNOW;
    case WEATHER_RAIN_THUNDERSTORM: return WEATHER_RAIN_THUNDERSTORM;
    case WEATHER_FOG_HORIZONTAL: return WEATHER_FOG_HORIZONTAL;
    case WEATHER_VOLCANIC_ASH: return WEATHER_VOLCANIC_ASH;
    case WEATHER_SANDSTORM: return WEATHER_SANDSTORM;
    case WEATHER_FOG_DIAGONAL: return WEATHER_FOG_DIAGONAL;
    case WEATHER_UNDERWATER: return WEATHER_UNDERWATER;
    case WEATHER_SHADE: return WEATHER_SHADE;
    case WEATHER_DROUGHT: return WEATHER_DROUGHT;
    case WEATHER_DOWNPOUR: return WEATHER_DOWNPOUR;
    case WEATHER_UNDERWATER_BUBBLES: return WEATHER_UNDERWATER_BUBBLES;
    case WEATHER_ABNORMAL: return WEATHER_ABNORMAL;
    case WEATHER_ROUTE119_CYCLE: return sWeatherCycleRoute119[gSaveBlock1Ptr.weatherCycleStage];
    case WEATHER_ROUTE123_CYCLE: return sWeatherCycleRoute123[gSaveBlock1Ptr.weatherCycleStage];
    default: return WEATHER_NONE;
  }
}

/** 1:1 décomp `UpdateWeatherPerDay(u16 increment)` (field_weather_effect.c:2622). */
export function UpdateWeatherPerDay(increment: number): void {
  let weatherStage = gSaveBlock1Ptr.weatherCycleStage + increment;
  weatherStage %= WEATHER_CYCLE_LENGTH;
  gSaveBlock1Ptr.weatherCycleStage = weatherStage;
}

/** 1:1 décomp `UpdateRainCounter(u8 newWeather, u8 oldWeather)` (field_weather_effect.c:2629). */
function UpdateRainCounter(newWeather: number, oldWeather: number): void {
  if (newWeather !== oldWeather
   && (newWeather === WEATHER_RAIN || newWeather === WEATHER_RAIN_THUNDERSTORM))
    IncrementGameStat(GAME_STAT_GOT_RAINED_ON);
}

/** Concern plateforme : `gMapHeader.weather` peut être string "WEATHER_*" ou numérique.
 *  TranslateWeatherNum attend un id numérique → on résout via weather-data (⚠️
 *  resolveDecompConstant ne connaît PAS les WEATHER_* → renvoyait 0). */
function _mapHeaderWeatherId(): number {
  const w = gMapHeader?.weather;
  if (typeof w === 'number') return w;
  if (typeof w === 'string') {
    const id = (WeatherConstants as unknown as Record<string, number>)[w];
    return typeof id === 'number' ? id : 0;
  }
  return 0;
}

// ════════════════════════════════════════════════════════════════════════════
//  WEATHER_SUNNY_CLOUDS (field_weather_effect.c:33-226)
//  3 nuages 64×64 OBJ_BLEND positionnés en coords MAP (bas de la Route 120) via
//  SetSpritePosToMapCoords + coordOffsetEnabled → ils SUIVENT la map (caméra, géré
//  1:1 par UpdateOamCoords). Dérivent 1px vers la gauche toutes les 2 frames. Palette
//  = cloud (PALTAG_WEATHER_2, chargée par LoadCustomWeatherSpritePalette depuis
//  gCloudsWeatherPalette = palette de cloud.png).
// ════════════════════════════════════════════════════════════════════════════

const CLOUD_PNG = '/decomp/em/weather/cloud.png';
const NUM_CLOUD_SPRITES = 3; // constants/field_weather.h

/** 1:1 décomp `sCloudSpriteMapCoords[]` (field_weather_effect.c:42) : coords MAP du
 *  bas de la Route 120 (avant +MAP_OFFSET). */
const sCloudSpriteMapCoords: ReadonlyArray<{ x: number; y: number }> = [
  { x: 0, y: 66 },
  { x: 5, y: 73 },
  { x: 10, y: 78 },
];

/** 1:1 décomp `sCloudSpriteAnimCmds` (field_weather_effect.c:73-82) : 1 anim 1-frame. */
const sCloudSpriteAnimCmds: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 16), ANIMCMD_END],
];

let _cloudTileStart = -1;
let _cloudCharData: Uint8Array | null = null;
let _cloudPalette: Uint16Array | null = null;
let _cloudInit = false;
let _cloudInitPromise: Promise<void> | null = null;

/** Préchargement plateforme du sprite sheet + palette cloud (le décomp les a en
 *  INCBIN/INCGFX compile-time : gWeatherCloudTiles + gCloudsWeatherPalette, tous deux
 *  depuis cloud.png). cloud.png = 64×64 → OBJ 1D 64×64 direct. À appeler avant StartWeather. */
export async function preloadWeatherCloudSprites(): Promise<void> {
  if (_cloudInit) return;
  if (_cloudInitPromise) return _cloudInitPromise;
  _cloudInitPromise = (async () => {
    const png = await loadIndexedPngStrict(CLOUD_PNG, 4);
    _cloudCharData = png.charData;
    _cloudPalette = png.palette;
    _cloudInit = true;
  })();
  return _cloudInitPromise;
}

/** 1:1 décomp `Clouds_InitVars(void)` (field_weather_effect.c:95). */
function Clouds_InitVars(): void {
  gWeatherPtr.targetColorMapIndex = 0;
  gWeatherPtr.colorMapStepDelay = 20;
  gWeatherPtr.weatherGfxLoaded = 0;
  gWeatherPtr.initStep = 0;
  if (gWeatherPtr.cloudSpritesCreated === 0) Weather_SetBlendCoeffs(0, 16);
}

/** 1:1 décomp `Clouds_InitAll(void)` (field_weather_effect.c:105). */
function Clouds_InitAll(): void {
  Clouds_InitVars();
  while (gWeatherPtr.weatherGfxLoaded === 0) Clouds_Main();
}

/** 1:1 décomp `Clouds_Main(void)` (field_weather_effect.c:112). */
function Clouds_Main(): void {
  switch (gWeatherPtr.initStep) {
    case 0:
      CreateCloudSprites();
      gWeatherPtr.initStep++;
      break;
    case 1:
      Weather_SetTargetBlendCoeffs(12, 8, 1);
      gWeatherPtr.initStep++;
      break;
    case 2:
      if (Weather_UpdateBlend()) {
        gWeatherPtr.weatherGfxLoaded = 1;
        gWeatherPtr.initStep++;
      }
      break;
  }
}

/** 1:1 décomp `Clouds_Finish(void)` (field_weather_effect.c:134). */
function Clouds_Finish(): boolean {
  switch (gWeatherPtr.finishStep) {
    case 0:
      Weather_SetTargetBlendCoeffs(0, 16, 1);
      gWeatherPtr.finishStep++;
      return true;
    case 1:
      if (Weather_UpdateBlend()) {
        DestroyCloudSprites();
        gWeatherPtr.finishStep++;
      }
      return true;
  }
  return false;
}

/** 1:1 décomp `CreateCloudSprites(void)` (field_weather_effect.c:173). */
function CreateCloudSprites(): void {
  const rt = _rt();

  if (gWeatherPtr.cloudSpritesCreated) return;

  // 1:1 : LoadSpriteSheet(&sCloudSpriteSheet) + LoadCustomWeatherSpritePalette(gCloudsWeatherPalette).
  if (_cloudCharData === null) {
    console.error('[field_weather_effect] cloud.png non préchargé — appeler preloadWeatherCloudSprites() avant StartWeather.');
    _cloudTileStart = 0;
  } else {
    _cloudTileStart = LoadSpriteSheet({ data: _cloudCharData, size: _cloudCharData.length, tag: GFXTAG_CLOUD });
  }
  if (_cloudPalette !== null) LoadCustomWeatherSpritePalette(_cloudPalette);

  for (let i = 0; i < NUM_CLOUD_SPRITES; i++) {
    // 1:1 : CreateSprite(&sCloudSpriteTemplate, 0, 0, 0xFF) — CreateSprite (PAS AtEnd).
    const { spriteId } = rt.CreateSpriteAtOam({
      tileId: _cloudTileStart,
      paletteBank: gWeatherPtr.weatherPicSpritePalIndex,
      x: 0, y: 0,
      shape: 0, size: 3,           // SPRITE_SHAPE/SIZE(64x64)
      priority: 3,                 // 1:1 oam.priority = 3
      paletteMode: 0, affineMode: 0,
      subpriority: 0xFF,
      fromEnd: false,
    });
    if (spriteId !== MAX_SPRITES) {
      const sprite = rt.gSprites[spriteId]!;
      // 1:1 : oam.objMode = ST_OAM_OBJ_BLEND.
      sprite.objMode = 1;
      sprite.callback = UpdateCloudSprite;
      setFieldEffectAnims(sprite, sCloudSpriteAnimCmds, _cloudTileStart);
      // 1:1 : SetSpritePosToMapCoords(mapX+MAP_OFFSET, mapY+MAP_OFFSET, &sprite->x, &sprite->y).
      const pos = SetSpritePosToMapCoords(sCloudSpriteMapCoords[i].x + MAP_OFFSET, sCloudSpriteMapCoords[i].y + MAP_OFFSET);
      sprite.x = pos.x;
      sprite.y = pos.y;
      // 1:1 : sprite->coordOffsetEnabled = TRUE → suit la caméra (UpdateOamCoords).
      sprite.coordOffsetEnabled = true;
      gWeatherPtr.sprites.s1.cloudSprites[i] = sprite;
    } else {
      gWeatherPtr.sprites.s1.cloudSprites[i] = null;
    }
  }

  gWeatherPtr.cloudSpritesCreated = 1;
}

/** 1:1 décomp `DestroyCloudSprites(void)` (field_weather_effect.c:203). */
function DestroyCloudSprites(): void {
  if (!gWeatherPtr.cloudSpritesCreated) return;

  for (let i = 0; i < NUM_CLOUD_SPRITES; i++) {
    const s = gWeatherPtr.sprites.s1.cloudSprites[i] as DecompSprite | null;
    if (s !== null) DestroySprite(s.spriteId);
  }

  FreeSpriteTilesByTag(GFXTAG_CLOUD);
  gWeatherPtr.cloudSpritesCreated = 0;
}

/** 1:1 décomp `UpdateCloudSprite(struct Sprite *sprite)` (field_weather_effect.c:220). */
function UpdateCloudSprite(sprite: DecompSprite): void {
  // Move 1 pixel left every 2 frames.
  sprite.data[0] = (sprite.data[0] + 1) & 1;
  if (sprite.data[0]) sprite.x--;
}

_registerWeatherFuncs(WEATHER_SUNNY_CLOUDS, {
  initVars: Clouds_InitVars,
  main: Clouds_Main,
  initAll: Clouds_InitAll,
  finish: Clouds_Finish,
});

// ════════════════════════════════════════════════════════════════════════════
//  WEATHER_SUNNY (field_weather_effect.c:153-171)
//  Météo « par défaut » de la plupart des maps extérieures : AUCUN sprite, juste
//  color map index 0 (pas de teinte). Sunny_Main est vide ; la transition de la
//  color map vers 0 est gérée par le framework (UpdateWeatherColorMap).
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `Sunny_InitVars(void)` (field_weather_effect.c:153). */
function Sunny_InitVars(): void {
  gWeatherPtr.targetColorMapIndex = 0;
  gWeatherPtr.colorMapStepDelay = 20;
}

/** 1:1 décomp `Sunny_InitAll(void)` (field_weather_effect.c:159). */
function Sunny_InitAll(): void {
  Sunny_InitVars();
}

/** 1:1 décomp `Sunny_Main(void)` (field_weather_effect.c:164) — corps vide. */
function Sunny_Main(): void {
}

/** 1:1 décomp `Sunny_Finish(void)` (field_weather_effect.c:168) — return FALSE. */
function Sunny_Finish(): boolean {
  return false;
}

_registerWeatherFuncs(WEATHER_SUNNY, {
  initVars: Sunny_InitVars,
  main: Sunny_Main,
  initAll: Sunny_InitAll,
  finish: Sunny_Finish,
});

// ════════════════════════════════════════════════════════════════════════════
//  WEATHER_SHADE (field_weather_effect.c:2247-2266)
//  Comme Sunny mais color map index 3 (teinte sombre/ombragée) — AUCUN sprite.
//  La transition de color map vers 3 est gérée par le framework.
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `Shade_InitVars(void)` (field_weather_effect.c:2247). */
function Shade_InitVars(): void {
  gWeatherPtr.initStep = 0;
  gWeatherPtr.targetColorMapIndex = 3;
  gWeatherPtr.colorMapStepDelay = 20;
}

/** 1:1 décomp `Shade_InitAll(void)` (field_weather_effect.c:2254). */
function Shade_InitAll(): void {
  Shade_InitVars();
}

/** 1:1 décomp `Shade_Main(void)` (field_weather_effect.c:2259) — corps vide. */
function Shade_Main(): void {
}

/** 1:1 décomp `Shade_Finish(void)` (field_weather_effect.c:2263) — return FALSE. */
function Shade_Finish(): boolean {
  return false;
}

_registerWeatherFuncs(WEATHER_SHADE, {
  initVars: Shade_InitVars,
  main: Shade_Main,
  initAll: Shade_InitAll,
  finish: Shade_Finish,
});

// ════════════════════════════════════════════════════════════════════════════
//  WEATHER_FOG_HORIZONTAL (field_weather_effect.c:1280-1514)
//  Brouillard : 20 sprites 64×64 OBJ_BLEND (grille 5×4) couvrant l'écran, défilant
//  horizontalement (fogHScrollPosX) + suivant la caméra en Y (y2 = coordOffsetY 8-bit).
//  Palette = fog (PALTAG_WEATHER, allouée par StartWeather). Aussi utilisé tel quel par
//  WEATHER_UNDERWATER (table sWeatherFuncs : mêmes 4 callbacks ; blend coeffs différents
//  selon currWeather dans FogHorizontal_Main).
// ════════════════════════════════════════════════════════════════════════════

const FOG_H_PNG = '/decomp/em/weather/fog_horizontal.png';
const NUM_FOG_HORIZONTAL_SPRITES = 20; // constants/field_weather.h

/** 1:1 décomp `sAnims_FogH` (field_weather_effect.c:1297-1341) : 6 anims 1-frame (offsets
 *  tile 0/32/64/96/128/160). CreateFogHorizontalSprites ne fait PAS StartSpriteAnim → tous
 *  les sprites utilisent l'anim 0 (offset 0). fog_horizontal.png = 64×64 = uniquement le
 *  frame 0 (tiles 0-63) ; les 5 autres anims sont des data mortes (jamais sélectionnées). */
const sAnims_FogH: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 16), ANIMCMD_END],
  [ANIMCMD_FRAME(32, 16), ANIMCMD_END],
  [ANIMCMD_FRAME(64, 16), ANIMCMD_END],
  [ANIMCMD_FRAME(96, 16), ANIMCMD_END],
  [ANIMCMD_FRAME(128, 16), ANIMCMD_END],
  [ANIMCMD_FRAME(160, 16), ANIMCMD_END],
];

let _fogHTileStart = -1;
let _fogHCharData: Uint8Array | null = null;
let _fogHInit = false;
let _fogHInitPromise: Promise<void> | null = null;

/** Préchargement plateforme du sprite sheet fog horizontal (le décomp l'a en INCBIN
 *  compile-time). fog_horizontal.png = 64×64 (8 tiles de large) → layout PNG row-major =
 *  OBJ 1D 64×64 direct. À appeler avant StartWeather (comme preloadWeatherAshSprites). */
export async function preloadWeatherFogHorizontalSprites(): Promise<void> {
  if (_fogHInit) return;
  if (_fogHInitPromise) return _fogHInitPromise;
  _fogHInitPromise = (async () => {
    const png = await loadIndexedPngStrict(FOG_H_PNG, 4);
    _fogHCharData = png.charData;
    _fogHInit = true;
  })();
  return _fogHInitPromise;
}

/** 1:1 décomp `FogHorizontalSpriteCallback(struct Sprite *sprite)` (field_weather_effect.c:1451).
 *  tSpriteColumn = data[0]. */
function FogHorizontalSpriteCallback(sprite: DecompSprite): void {
  sprite.y2 = _rt().gSpriteCoordOffsetY & 0xFF;  // 1:1 (u8) cast
  sprite.x = gWeatherPtr.fogHScrollPosX + 32 + sprite.data[0] * 64;
  if (sprite.x > DISPLAY_WIDTH + 31) {
    sprite.x = (DISPLAY_WIDTH * 2) + gWeatherPtr.fogHScrollPosX - (4 - sprite.data[0]) * 64;
    sprite.x &= 0x1FF;
  }
}

/** 1:1 décomp `CreateFogHorizontalSprites(void)` (field_weather_effect.c:1462). */
function CreateFogHorizontalSprites(): void {
  const rt = _rt();

  if (!gWeatherPtr.fogHSpritesCreated) {
    // 1:1 : LoadSpriteSheet({gWeatherFogHorizontalTiles, sizeof, GFXTAG_FOG_H}).
    if (_fogHCharData === null) {
      console.error('[field_weather_effect] fog_horizontal.png non préchargé — appeler preloadWeatherFogHorizontalSprites() avant StartWeather.');
      _fogHTileStart = 0;
    } else {
      _fogHTileStart = LoadSpriteSheet({ data: _fogHCharData, size: _fogHCharData.length, tag: GFXTAG_FOG_H });
    }
    for (let i = 0; i < NUM_FOG_HORIZONTAL_SPRITES; i++) {
      // 1:1 : CreateSpriteAtEnd(&sFogHorizontalSpriteTemplate, 0, 0, 0xFF).
      const { spriteId } = rt.CreateSpriteAtOam({
        tileId: _fogHTileStart,
        paletteBank: gWeatherPtr.contrastColorMapSpritePalIndex,
        x: 0, y: 0,
        shape: 0, size: 3,           // SPRITE_SHAPE/SIZE(64x64)
        priority: 2,                 // 1:1 oam.priority = 2
        paletteMode: 0, affineMode: 0,
        subpriority: 0xFF,
        fromEnd: true,               // CreateSpriteAtEnd
      });
      if (spriteId !== MAX_SPRITES) {
        const sprite = rt.gSprites[spriteId]!;
        // 1:1 : oam.objMode = ST_OAM_OBJ_BLEND.
        sprite.objMode = 1;
        sprite.callback = FogHorizontalSpriteCallback;
        setFieldEffectAnims(sprite, sAnims_FogH, _fogHTileStart);
        sprite.data[0] = (i % 5) & 0xFF;          // tSpriteColumn
        sprite.x = (i % 5) * 64 + 32;
        sprite.y = ((i / 5) | 0) * 64 + 32;
        gWeatherPtr.sprites.s2.fogHSprites[i] = sprite;
      } else {
        gWeatherPtr.sprites.s2.fogHSprites[i] = null;
      }
    }

    gWeatherPtr.fogHSpritesCreated = 1;
  }
}

/** 1:1 décomp `DestroyFogHorizontalSprites(void)` (field_weather_effect.c:1497). */
function DestroyFogHorizontalSprites(): void {
  if (gWeatherPtr.fogHSpritesCreated) {
    for (let i = 0; i < NUM_FOG_HORIZONTAL_SPRITES; i++) {
      const s = gWeatherPtr.sprites.s2.fogHSprites[i] as DecompSprite | null;
      if (s !== null) DestroySprite(s.spriteId);
    }

    FreeSpriteTilesByTag(GFXTAG_FOG_H);
    gWeatherPtr.fogHSpritesCreated = 0;
  }
}

/** 1:1 décomp `FogHorizontal_InitVars(void)` (field_weather_effect.c:1370). */
function FogHorizontal_InitVars(): void {
  gWeatherPtr.initStep = 0;
  gWeatherPtr.weatherGfxLoaded = 0;
  gWeatherPtr.targetColorMapIndex = 0;
  gWeatherPtr.colorMapStepDelay = 20;
  if (gWeatherPtr.fogHSpritesCreated === 0) {
    gWeatherPtr.fogHScrollCounter = 0;
    gWeatherPtr.fogHScrollOffset = 0;
    gWeatherPtr.fogHScrollPosX = 0;
    Weather_SetBlendCoeffs(0, 16);
  }
}

/** 1:1 décomp `FogHorizontal_InitAll(void)` (field_weather_effect.c:1385). */
function FogHorizontal_InitAll(): void {
  FogHorizontal_InitVars();
  while (gWeatherPtr.weatherGfxLoaded === 0) FogHorizontal_Main();
}

/** 1:1 décomp `FogHorizontal_Main(void)` (field_weather_effect.c:1392). */
function FogHorizontal_Main(): void {
  gWeatherPtr.fogHScrollPosX = (_rt().gSpriteCoordOffsetX - gWeatherPtr.fogHScrollOffset) & 0xFF;
  if (++gWeatherPtr.fogHScrollCounter > 3) {
    gWeatherPtr.fogHScrollCounter = 0;
    gWeatherPtr.fogHScrollOffset++;
  }
  switch (gWeatherPtr.initStep) {
    case 0:
      CreateFogHorizontalSprites();
      if (gWeatherPtr.currWeather === WEATHER_FOG_HORIZONTAL) {
        Weather_SetTargetBlendCoeffs(12, 8, 3);
      } else {
        Weather_SetTargetBlendCoeffs(4, 16, 0);
      }
      gWeatherPtr.initStep++;
      break;
    case 1:
      if (Weather_UpdateBlend()) {
        gWeatherPtr.weatherGfxLoaded = 1;
        gWeatherPtr.initStep++;
      }
      break;
  }
}

/** 1:1 décomp `FogHorizontal_Finish(void)` (field_weather_effect.c:1420). */
function FogHorizontal_Finish(): boolean {
  gWeatherPtr.fogHScrollPosX = (_rt().gSpriteCoordOffsetX - gWeatherPtr.fogHScrollOffset) & 0xFF;
  if (++gWeatherPtr.fogHScrollCounter > 3) {
    gWeatherPtr.fogHScrollCounter = 0;
    gWeatherPtr.fogHScrollOffset++;
  }

  switch (gWeatherPtr.finishStep) {
    case 0:
      Weather_SetTargetBlendCoeffs(0, 16, 3);
      gWeatherPtr.finishStep++;
      break;
    case 1:
      if (Weather_UpdateBlend()) gWeatherPtr.finishStep++;
      break;
    case 2:
      DestroyFogHorizontalSprites();
      gWeatherPtr.finishStep++;
      break;
    default:
      return false;
  }
  return true;
}

// 1:1 décomp sWeatherFuncs (field_weather.c:93,97) :
//   [WEATHER_FOG_HORIZONTAL] = {FogHorizontal_InitVars, FogHorizontal_Main, FogHorizontal_InitAll, FogHorizontal_Finish}
//   [WEATHER_UNDERWATER]     = {FogHorizontal_InitVars, FogHorizontal_Main, FogHorizontal_InitAll, FogHorizontal_Finish}  (mêmes callbacks)
_registerWeatherFuncs(WEATHER_FOG_HORIZONTAL, {
  initVars: FogHorizontal_InitVars,
  main: FogHorizontal_Main,
  initAll: FogHorizontal_InitAll,
  finish: FogHorizontal_Finish,
});
_registerWeatherFuncs(WEATHER_UNDERWATER, {
  initVars: FogHorizontal_InitVars,
  main: FogHorizontal_Main,
  initAll: FogHorizontal_InitAll,
  finish: FogHorizontal_Finish,
});

// ════════════════════════════════════════════════════════════════════════════
//  WEATHER_VOLCANIC_ASH (field_weather_effect.c:1520-1724)
//  Nuages de cendre (64×64, OBJ_BLEND) tilés sur l'écran (grille 5×4 = 20 sprites)
//  qui dérivent lentement vers le bas. La palette = fog (allouée par StartWeather).
// ════════════════════════════════════════════════════════════════════════════

const ASH_PNG = '/decomp/em/weather/ash.png';
const ASH_TILES_PER_FRAME = 64; // 64×64 = 8×8 tiles 4bpp

/** 1:1 décomp `sAshSpriteAnimCmd0` (field_weather_effect.c:1629) : 2 frames @60 + JUMP(0).
 *  imageValue = offset TILE (frame 0 = tile 0, frame 1 = tile 64). */
const sAshSpriteAnimCmds: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 60), ANIMCMD_FRAME(64, 60), ANIMCMD_JUMP(0)],
];

let _ashTileStart = -1;
let _ashCharData: Uint8Array | null = null;
let _ashInit = false;
let _ashInitPromise: Promise<void> | null = null;

/** Préchargement plateforme du sprite sheet ash (le décomp l'a en INCBIN compile-time).
 *  ash.png = 64×128 (8 tiles de large) → layout PNG row-major = OBJ 1D 64×64 direct (pas
 *  de reorder : frame 0 = tiles 0-63, frame 1 = tiles 64-127). À appeler avant StartWeather. */
export async function preloadWeatherAshSprites(): Promise<void> {
  if (_ashInit) return;
  if (_ashInitPromise) return _ashInitPromise;
  _ashInitPromise = (async () => {
    const png = await loadIndexedPngStrict(ASH_PNG, 4);
    _ashCharData = png.charData;
    _ashInit = true;
  })();
  return _ashInitPromise;
}

/** 1:1 décomp `Ash_InitVars(void)` (field_weather_effect.c:1525). */
function Ash_InitVars(): void {
  gWeatherPtr.initStep = 0;
  gWeatherPtr.weatherGfxLoaded = 0;
  gWeatherPtr.targetColorMapIndex = 0;
  gWeatherPtr.colorMapStepDelay = 20;
  gWeatherPtr.ashUnused = 20; // Never read
  if (!gWeatherPtr.ashSpritesCreated) {
    Weather_SetBlendCoeffs(0, 16);
    // 1:1 : SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(64, 63)); // "aren't valid blend coefficients!"
    SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(64, 63));
  }
}

/** 1:1 décomp `Ash_InitAll(void)` (field_weather_effect.c:1539). */
function Ash_InitAll(): void {
  Ash_InitVars();
  while (gWeatherPtr.weatherGfxLoaded === 0) Ash_Main();
}

/** 1:1 décomp `Ash_Main(void)` (field_weather_effect.c:1546). */
function Ash_Main(): void {
  gWeatherPtr.ashBaseSpritesX = _rt().gSpriteCoordOffsetX & 0x1FF;
  while (gWeatherPtr.ashBaseSpritesX >= DISPLAY_WIDTH) gWeatherPtr.ashBaseSpritesX -= DISPLAY_WIDTH;

  switch (gWeatherPtr.initStep) {
    case 0:
      LoadAshSpriteSheet();
      gWeatherPtr.initStep++;
      break;
    case 1:
      if (!gWeatherPtr.ashSpritesCreated) CreateAshSprites();

      Weather_SetTargetBlendCoeffs(16, 0, 1);
      gWeatherPtr.initStep++;
      break;
    case 2:
      if (Weather_UpdateBlend()) {
        gWeatherPtr.weatherGfxLoaded = 1;
        gWeatherPtr.initStep++;
      }
      break;
    default:
      Weather_UpdateBlend();
      break;
  }
}

/** 1:1 décomp `Ash_Finish(void)` (field_weather_effect.c:1578). */
function Ash_Finish(): boolean {
  switch (gWeatherPtr.finishStep) {
    case 0:
      Weather_SetTargetBlendCoeffs(0, 16, 1);
      gWeatherPtr.finishStep++;
      break;
    case 1:
      if (Weather_UpdateBlend()) {
        DestroyAshSprites();
        gWeatherPtr.finishStep++;
      }
      break;
    case 2:
      SetGpuReg(REG_OFFSET_BLDALPHA, 0);
      gWeatherPtr.finishStep++;
      return false;
    default:
      return false;
  }
  return true;
}

/** 1:1 décomp `LoadAshSpriteSheet(void)` (field_weather_effect.c:1610).
 *  `sAshSpriteSheet = {gWeatherAshTiles, sizeof, GFXTAG_ASH}` → LoadSpriteSheet. */
function LoadAshSpriteSheet(): void {
  if (!_ashCharData) {
    // Asset pas préchargé : ne devrait pas arriver (preloadWeatherAshSprites avant StartWeather).
    // ⚠️ sans ça Ash_InitAll boucle à l'infini (while !weatherGfxLoaded).
    console.error('[field_weather_effect] ash.png non préchargé — appeler preloadWeatherAshSprites() avant StartWeather.');
    _ashTileStart = 0;
    return;
  }
  _ashTileStart = LoadSpriteSheet({ data: _ashCharData, size: _ashCharData.length, tag: GFXTAG_ASH });
}

// data: tOffsetY=data[0], tCounterY=data[1], tSpriteColumn=data[2], tSpriteRow=data[3].
/** 1:1 décomp `CreateAshSprites(void)` (field_weather_effect.c:1657). */
function CreateAshSprites(): void {
  const rt = _rt();

  if (!gWeatherPtr.ashSpritesCreated) {
    for (let i = 0; i < NUM_ASH_SPRITES; i++) {
      // 1:1 : CreateSpriteAtEnd(&sAshSpriteTemplate, 0, 0, 0x4E).
      const { spriteId } = rt.CreateSpriteAtOam({
        tileId: _ashTileStart,
        paletteBank: gWeatherPtr.contrastColorMapSpritePalIndex,
        x: 0, y: 0,
        shape: 0, size: 3,           // SPRITE_SHAPE/SIZE(64x64)
        priority: 1,                 // 1:1 oam.priority = 1
        paletteMode: 0, affineMode: 0,
        subpriority: 0x4E,
        fromEnd: true,               // CreateSpriteAtEnd
      });
      if (spriteId !== MAX_SPRITES) {
        const sprite = rt.gSprites[spriteId]!;
        // 1:1 : oam.objMode = ST_OAM_OBJ_BLEND (semi-transparent → blend BLDALPHA sur la map).
        sprite.objMode = 1;
        sprite.callback = UpdateAshSprite;
        setFieldEffectAnims(sprite, sAshSpriteAnimCmds, _ashTileStart);
        sprite.data[1] = 0;                  // tCounterY = 0
        sprite.data[2] = (i % 5) & 0xFF;     // tSpriteColumn
        sprite.data[3] = ((i / 5) | 0) & 0xFF; // tSpriteRow
        sprite.data[0] = sprite.data[3] * 64 + 32; // tOffsetY
        gWeatherPtr.sprites.s2.ashSprites[i] = sprite;
      } else {
        gWeatherPtr.sprites.s2.ashSprites[i] = null;
      }
    }

    gWeatherPtr.ashSpritesCreated = 1;
  }
}

/** 1:1 décomp `DestroyAshSprites(void)` (field_weather_effect.c:1687). */
function DestroyAshSprites(): void {
  if (gWeatherPtr.ashSpritesCreated) {
    for (let i = 0; i < NUM_ASH_SPRITES; i++) {
      const s = gWeatherPtr.sprites.s2.ashSprites[i] as DecompSprite | null;
      if (s !== null) DestroySprite(s.spriteId);
    }

    FreeSpriteTilesByTag(GFXTAG_ASH);
    gWeatherPtr.ashSpritesCreated = 0;
  }
}

/** 1:1 décomp `UpdateAshSprite(struct Sprite *sprite)` (field_weather_effect.c:1704). */
function UpdateAshSprite(sprite: DecompSprite): void {
  // tCounterY=data[1], tOffsetY=data[0], tSpriteColumn=data[2].
  if (++sprite.data[1] > 5) {
    sprite.data[1] = 0;
    sprite.data[0]++;
  }

  // 1:1 décomp `sprite->y = gSpriteCoordOffsetY + sprite->tOffsetY`. tOffsetY croît sans
  // borne ; le HW GBA tronque oam.y à 8 bits ET fait le TOP-WRAP → la cendre BOUCLE (les 4
  // rangées espacées 64px défilent et réapparaissent en haut, champ continu). Modélisé 1:1
  // par le compositor (renderOamSpriteNormal : `objY = oam.y & 0xFF`, top-wrap) → ici on
  // garde le calcul décomp PUR, sans masque.
  sprite.y = _rt().gSpriteCoordOffsetY + sprite.data[0];
  sprite.x = gWeatherPtr.ashBaseSpritesX + 32 + sprite.data[2] * 64;
  if (sprite.x > DISPLAY_WIDTH + 31) {
    sprite.x = gWeatherPtr.ashBaseSpritesX + (DISPLAY_WIDTH * 2) - (4 - sprite.data[2]) * 64;
    sprite.x &= 0x1FF;
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  Enregistrement de l'effet Ash dans sWeatherFuncs (field_weather.c:94)
//  [WEATHER_VOLCANIC_ASH] = {Ash_InitVars, Ash_Main, Ash_InitAll, Ash_Finish}.
// ════════════════════════════════════════════════════════════════════════════
_registerWeatherFuncs(WEATHER_VOLCANIC_ASH, {
  initVars: Ash_InitVars,
  main: Ash_Main,
  initAll: Ash_InitAll,
  finish: Ash_Finish,
});

// ════════════════════════════════════════════════════════════════════════════
//  WEATHER_RAIN (field_weather_effect.c:353-755)
//  Gouttes 16×32 (OBJ_NORMAL) en Q28.4 fixed-point : chute diagonale (mouvement
//  sRainSpriteMovement) puis anim de splash au sol, boucle. targetRainSpriteCount
//  gouttes visibles (10 pour la pluie, 16 thunderstorm, 24 downpour). Palette =
//  fog (PALTAG_WEATHER = contrastColorMapSpritePalIndex, comme fog/ash).
//  ⚠️ AUDIO SKIP : SetRainStrengthFromSoundEffect n'émet aucun son (rainStrength only).
// ════════════════════════════════════════════════════════════════════════════

const RAIN_PNG = '/decomp/em/weather/rain.png';

/** 1:1 décomp `sRainSpriteCoords[]` (field_weather_effect.c:363). */
const sRainSpriteCoords: ReadonlyArray<{ x: number; y: number }> = [
  { x: 0, y: 0 }, { x: 0, y: 160 }, { x: 0, y: 64 }, { x: 144, y: 224 },
  { x: 144, y: 128 }, { x: 32, y: 32 }, { x: 32, y: 192 }, { x: 32, y: 96 },
  { x: 72, y: 128 }, { x: 72, y: 32 }, { x: 72, y: 192 }, { x: 216, y: 96 },
  { x: 216, y: 0 }, { x: 104, y: 160 }, { x: 104, y: 64 }, { x: 104, y: 224 },
  { x: 144, y: 0 }, { x: 144, y: 160 }, { x: 144, y: 64 }, { x: 32, y: 224 },
  { x: 32, y: 128 }, { x: 72, y: 32 }, { x: 72, y: 192 }, { x: 48, y: 96 },
];

/** 1:1 décomp `sRainSpriteAnimCmds[]` (field_weather_effect.c:408-435) : 3 anims
 *  (fall boucle, splash normal, splash lourd). imageValue = offset TILE. */
const sRainSpriteAnimCmds: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  // sRainSpriteFallAnimCmd
  [ANIMCMD_FRAME(0, 16), ANIMCMD_JUMP(0)],
  // sRainSpriteSplashAnimCmd
  [ANIMCMD_FRAME(8, 3), ANIMCMD_FRAME(32, 2), ANIMCMD_FRAME(40, 2), ANIMCMD_END],
  // sRainSpriteHeavySplashAnimCmd
  [ANIMCMD_FRAME(8, 3), ANIMCMD_FRAME(16, 3), ANIMCMD_FRAME(24, 4), ANIMCMD_END],
];

/** 1:1 décomp `sRainSpriteMovement[][2]` (field_weather_effect.c:449) — Q28.4 fixed-point. */
const sRainSpriteMovement: ReadonlyArray<ReadonlyArray<number>> = [
  [-0x68, 0xD0],
  [-0xA0, 0x140],
];

/** 1:1 décomp `sRainSpriteFallingDurations[][2]` (field_weather_effect.c:458) :
 *  [0] = frames de chute avant splash ; [1] = attente max initiale. */
const sRainSpriteFallingDurations: ReadonlyArray<ReadonlyArray<number>> = [
  [18, 7],
  [12, 10],
];

let _rainTileStart = -1;
let _rainCharData: Uint8Array | null = null;
let _rainInit = false;
let _rainInitPromise: Promise<void> | null = null;

/** Préchargement plateforme du sprite sheet rain (le décomp l'a en INCBIN compile-time :
 *  gWeatherRainTiles). rain.png = 16×192 (2 tiles de large) → layout PNG row-major = OBJ 1D
 *  16×32 direct (chaque sprite = 2×4 tiles empilés). Palette = fog (chargée par StartWeather,
 *  comme ash/fog). À appeler avant StartWeather (comme preloadWeatherAshSprites). */
export async function preloadWeatherRainSprites(): Promise<void> {
  if (_rainInit) return;
  if (_rainInitPromise) return _rainInitPromise;
  _rainInitPromise = (async () => {
    const png = await loadIndexedPngStrict(RAIN_PNG, 4);
    _rainCharData = png.charData;
    _rainInit = true;
  })();
  return _rainInitPromise;
}

/** 1:1 décomp `Rain_InitVars(void)` (field_weather_effect.c:471). */
function Rain_InitVars(): void {
  gWeatherPtr.initStep = 0;
  gWeatherPtr.weatherGfxLoaded = 0;
  gWeatherPtr.rainSpriteVisibleCounter = 0;
  gWeatherPtr.rainSpriteVisibleDelay = 8;
  gWeatherPtr.isDownpour = 0;
  gWeatherPtr.targetRainSpriteCount = 10;
  gWeatherPtr.targetColorMapIndex = 3;
  gWeatherPtr.colorMapStepDelay = 20;
  SetRainStrengthFromSoundEffect(SE_RAIN);
}

/** 1:1 décomp `Rain_InitAll(void)` (field_weather_effect.c:484). */
function Rain_InitAll(): void {
  Rain_InitVars();
  while (!gWeatherPtr.weatherGfxLoaded) Rain_Main();
}

/** 1:1 décomp `Rain_Main(void)` (field_weather_effect.c:491). */
function Rain_Main(): void {
  switch (gWeatherPtr.initStep) {
    case 0:
      LoadRainSpriteSheet();
      gWeatherPtr.initStep++;
      break;
    case 1:
      if (!CreateRainSprite()) gWeatherPtr.initStep++;
      break;
    case 2:
      if (!UpdateVisibleRainSprites()) {
        gWeatherPtr.weatherGfxLoaded = 1;
        gWeatherPtr.initStep++;
      }
      break;
  }
}

/** 1:1 décomp `Rain_Finish(void)` (field_weather_effect.c:513). */
function Rain_Finish(): boolean {
  switch (gWeatherPtr.finishStep) {
    case 0:
      if (gWeatherPtr.nextWeather === WEATHER_RAIN
       || gWeatherPtr.nextWeather === WEATHER_RAIN_THUNDERSTORM
       || gWeatherPtr.nextWeather === WEATHER_DOWNPOUR) {
        gWeatherPtr.finishStep = 0xFF;
        return false;
      } else {
        gWeatherPtr.targetRainSpriteCount = 0;
        gWeatherPtr.finishStep++;
      }
    // fall through
    case 1:
      if (!UpdateVisibleRainSprites()) {
        DestroyRainSprites();
        gWeatherPtr.finishStep++;
        return false;
      }
      return true;
  }
  return false;
}

// data: tCounter=data[0], tRandom=data[1], tPosX=data[2], tPosY=data[3],
//       tState=data[4], tActive=data[5], tWaiting=data[6].

/** 1:1 décomp `StartRainSpriteFall(struct Sprite *sprite)` (field_weather_effect.c:551). */
function StartRainSpriteFall(sprite: DecompSprite): void {
  let rand: number;
  let numFallingFrames: number;
  let tileX: number;
  let tileY: number;

  if (sprite.data[1] === 0) sprite.data[1] = 361;

  rand = ISO_RANDOMIZE2(sprite.data[1]);
  sprite.data[1] = ((rand & 0x7FFF0000) >> 16) % 600;

  numFallingFrames = sRainSpriteFallingDurations[gWeatherPtr.isDownpour][0];

  tileX = sprite.data[1] % 30;
  sprite.data[2] = tileX * 8; // Useless assignment, leftover from before fixed-point values were used

  tileY = (sprite.data[1] / 30) | 0;
  sprite.data[3] = tileY * 8; // Useless assignment, leftover from before fixed-point values were used

  sprite.data[2] = tileX;
  sprite.data[2] <<= 7; // This is tileX * 8, using a fixed-point value with 4 decimal places

  sprite.data[3] = tileY;
  sprite.data[3] <<= 7; // This is tileX * 8, using a fixed-point value with 4 decimal places

  // "Rewind" the rain sprites, from their ending position.
  sprite.data[2] -= sRainSpriteMovement[gWeatherPtr.isDownpour][0] * numFallingFrames;
  sprite.data[3] -= sRainSpriteMovement[gWeatherPtr.isDownpour][1] * numFallingFrames;

  _rt().StartSpriteAnim(sprite.spriteId, 0);
  sprite.data[4] = 0;
  sprite.coordOffsetEnabled = false;
  sprite.data[0] = numFallingFrames;
}

/** 1:1 décomp `UpdateRainSprite(struct Sprite *sprite)` (field_weather_effect.c:588). */
function UpdateRainSprite(sprite: DecompSprite): void {
  const rt = _rt();
  if (sprite.data[4] === 0) {
    // Raindrop is in its "falling" motion.
    sprite.data[2] += sRainSpriteMovement[gWeatherPtr.isDownpour][0];
    sprite.data[3] += sRainSpriteMovement[gWeatherPtr.isDownpour][1];
    sprite.x = sprite.data[2] >> 4;
    sprite.y = sprite.data[3] >> 4;

    if (sprite.data[5]
     && (sprite.x >= -8 && sprite.x <= DISPLAY_WIDTH + 8)
     && sprite.y >= -16 && sprite.y <= DISPLAY_HEIGHT + 16)
      sprite.invisible = false;
    else
      sprite.invisible = true;

    if (--sprite.data[0] === 0) {
      // Make raindrop splash on the ground
      rt.StartSpriteAnim(sprite.spriteId, gWeatherPtr.isDownpour + 1);
      sprite.data[4] = 1;
      sprite.x -= rt.gSpriteCoordOffsetX;
      sprite.y -= rt.gSpriteCoordOffsetY;
      sprite.coordOffsetEnabled = true;
    }
  } else if (sprite.animEnded) {
    // The splashing animation ended.
    sprite.invisible = true;
    StartRainSpriteFall(sprite);
  }
}

/** 1:1 décomp `WaitRainSprite(struct Sprite *sprite)` (field_weather_effect.c:623). */
function WaitRainSprite(sprite: DecompSprite): void {
  if (sprite.data[0] === 0) {
    StartRainSpriteFall(sprite);
    sprite.callback = UpdateRainSprite;
  } else {
    sprite.data[0]--;
  }
}

/** 1:1 décomp `InitRainSpriteMovement(struct Sprite *sprite, u16 val)` (field_weather_effect.c:636). */
function InitRainSpriteMovement(sprite: DecompSprite, val: number): void {
  const numFallingFrames = sRainSpriteFallingDurations[gWeatherPtr.isDownpour][0];
  let numAdvanceRng = (val / (sRainSpriteFallingDurations[gWeatherPtr.isDownpour][1] + numFallingFrames)) | 0;
  let frameVal = val % (sRainSpriteFallingDurations[gWeatherPtr.isDownpour][1] + numFallingFrames);

  // 1:1 : while (--numAdvanceRng != 0xFFFF) — u16 underflow.
  for (;;) {
    numAdvanceRng = (numAdvanceRng - 1) & 0xFFFF;
    if (numAdvanceRng === 0xFFFF) break;
    StartRainSpriteFall(sprite);
  }

  if (frameVal < numFallingFrames) {
    // 1:1 : while (--frameVal != 0xFFFF) — u16 underflow.
    for (;;) {
      frameVal = (frameVal - 1) & 0xFFFF;
      if (frameVal === 0xFFFF) break;
      UpdateRainSprite(sprite);
    }

    sprite.data[6] = 0;
  } else {
    sprite.data[0] = frameVal - numFallingFrames;
    sprite.invisible = true;
    sprite.data[6] = 1;
  }
}

/** 1:1 décomp `LoadRainSpriteSheet(void)` (field_weather_effect.c:660). */
function LoadRainSpriteSheet(): void {
  if (!_rainCharData) {
    // Asset pas préchargé : sans ça Rain_InitAll boucle à l'infini (while !weatherGfxLoaded).
    console.error('[field_weather_effect] rain.png non préchargé — appeler preloadWeatherRainSprites() avant StartWeather.');
    _rainTileStart = 0;
    return;
  }
  _rainTileStart = LoadSpriteSheet({ data: _rainCharData, size: _rainCharData.length, tag: GFXTAG_RAIN });
}

/** 1:1 décomp `CreateRainSprite(void)` (field_weather_effect.c:665). */
function CreateRainSprite(): boolean {
  const rt = _rt();
  let spriteIndex: number;

  if (gWeatherPtr.rainSpriteCount === MAX_RAIN_SPRITES) return false;

  spriteIndex = gWeatherPtr.rainSpriteCount;
  // 1:1 : CreateSpriteAtEnd(&sRainSpriteTemplate, coords.x, coords.y, 78).
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: _rainTileStart,
    paletteBank: gWeatherPtr.contrastColorMapSpritePalIndex,
    x: sRainSpriteCoords[spriteIndex].x, y: sRainSpriteCoords[spriteIndex].y,
    shape: 2, size: 2,           // SPRITE_SHAPE/SIZE(16x32)
    priority: 1,                 // 1:1 oam.priority = 1
    paletteMode: 0, affineMode: 0,
    subpriority: 78,
    fromEnd: true,               // CreateSpriteAtEnd
  });

  if (spriteId !== MAX_SPRITES) {
    const sprite = rt.gSprites[spriteId]!;
    sprite.callback = UpdateRainSprite;
    setFieldEffectAnims(sprite, sRainSpriteAnimCmds, _rainTileStart);
    sprite.data[5] = 0;                        // tActive = FALSE
    sprite.data[1] = spriteIndex * 145;        // tRandom
    while (sprite.data[1] >= 600) sprite.data[1] -= 600;

    StartRainSpriteFall(sprite);
    InitRainSpriteMovement(sprite, spriteIndex * 9);
    sprite.invisible = true;
    gWeatherPtr.sprites.s1.rainSprites[spriteIndex] = sprite;
  } else {
    gWeatherPtr.sprites.s1.rainSprites[spriteIndex] = null;
  }

  if (++gWeatherPtr.rainSpriteCount === MAX_RAIN_SPRITES) {
    for (let i = 0; i < MAX_RAIN_SPRITES; i++) {
      const s = gWeatherPtr.sprites.s1.rainSprites[i] as DecompSprite | null;
      if (s) {
        if (!s.data[6]) s.callback = UpdateRainSprite;
        else s.callback = WaitRainSprite;
      }
    }

    return false;
  }

  return true;
}

/** 1:1 décomp `UpdateVisibleRainSprites(void)` (field_weather_effect.c:714). */
function UpdateVisibleRainSprites(): boolean {
  if (gWeatherPtr.curRainSpriteIndex === gWeatherPtr.targetRainSpriteCount) return false;

  if (++gWeatherPtr.rainSpriteVisibleCounter > gWeatherPtr.rainSpriteVisibleDelay) {
    gWeatherPtr.rainSpriteVisibleCounter = 0;
    if (gWeatherPtr.curRainSpriteIndex < gWeatherPtr.targetRainSpriteCount) {
      (gWeatherPtr.sprites.s1.rainSprites[gWeatherPtr.curRainSpriteIndex++] as DecompSprite).data[5] = 1;
    } else {
      gWeatherPtr.curRainSpriteIndex--;
      (gWeatherPtr.sprites.s1.rainSprites[gWeatherPtr.curRainSpriteIndex] as DecompSprite).data[5] = 0;
      (gWeatherPtr.sprites.s1.rainSprites[gWeatherPtr.curRainSpriteIndex] as DecompSprite).invisible = true;
    }
  }
  return true;
}

/** 1:1 décomp `DestroyRainSprites(void)` (field_weather_effect.c:736). */
function DestroyRainSprites(): void {
  for (let i = 0; i < gWeatherPtr.rainSpriteCount; i++) {
    const s = gWeatherPtr.sprites.s1.rainSprites[i] as DecompSprite | null;
    if (s !== null) DestroySprite(s.spriteId);
  }
  gWeatherPtr.rainSpriteCount = 0;
  FreeSpriteTilesByTag(GFXTAG_RAIN);
}

// 1:1 décomp sWeatherFuncs (field_weather.c) :
//   [WEATHER_RAIN] = {Rain_InitVars, Rain_Main, Rain_InitAll, Rain_Finish}
_registerWeatherFuncs(WEATHER_RAIN, {
  initVars: Rain_InitVars,
  main: Rain_Main,
  initAll: Rain_InitAll,
  finish: Rain_Finish,
});

// ════════════════════════════════════════════════════════════════════════════
//  WEATHER_RAIN_THUNDERSTORM + WEATHER_DOWNPOUR (field_weather_effect.c:1010-1272)
//  Réutilisent tout le système Rain (sprites/gfx) + une state-machine d'éclairs qui
//  flashe la color map (ApplyWeatherColorMapIfIdle) et enfile le tonnerre.
//  ⚠️ AUDIO SKIP : EnqueueThunder/UpdateThunderSound gardent la logique d'état (RNG 1:1)
//  mais n'émettent aucun son (PlaySE remplacé par no-op commenté).
// ════════════════════════════════════════════════════════════════════════════

// 1:1 décomp enum THUNDER_STATE_* (field_weather_effect.c:1014).
const THUNDER_STATE_LOAD_RAIN = 0;
const THUNDER_STATE_CREATE_RAIN = 1;
const THUNDER_STATE_INIT_RAIN = 2;
const THUNDER_STATE_WAIT_CHANGE = 3;
const THUNDER_STATE_NEW_CYCLE = 4;
const THUNDER_STATE_NEW_CYCLE_WAIT = 5;
const THUNDER_STATE_INIT_CYCLE_1 = 6;
const THUNDER_STATE_INIT_CYCLE_2 = 7;
const THUNDER_STATE_SHORT_BOLT = 8;
const THUNDER_STATE_TRY_NEW_BOLT = 9;
const THUNDER_STATE_WAIT_BOLT_SHORT = 10;
const THUNDER_STATE_INIT_BOLT_LONG = 11;
const THUNDER_STATE_WAIT_BOLT_LONG = 12;
const THUNDER_STATE_FADE_BOLT_LONG = 13;
const THUNDER_STATE_END_BOLT_LONG = 14;

/** 1:1 décomp `Thunderstorm_InitVars(void)` (field_weather_effect.c:1037). */
function Thunderstorm_InitVars(): void {
  gWeatherPtr.initStep = THUNDER_STATE_LOAD_RAIN;
  gWeatherPtr.weatherGfxLoaded = 0;
  gWeatherPtr.rainSpriteVisibleCounter = 0;
  gWeatherPtr.rainSpriteVisibleDelay = 4;
  gWeatherPtr.isDownpour = 0;
  gWeatherPtr.targetRainSpriteCount = 16;
  gWeatherPtr.targetColorMapIndex = 3;
  gWeatherPtr.colorMapStepDelay = 20;
  gWeatherPtr.weatherGfxLoaded = 0;  // duplicate assignment
  gWeatherPtr.thunderEnqueued = false;
  SetRainStrengthFromSoundEffect(SE_THUNDERSTORM);
}

/** 1:1 décomp `Thunderstorm_InitAll(void)` (field_weather_effect.c:1052). */
function Thunderstorm_InitAll(): void {
  Thunderstorm_InitVars();
  while (gWeatherPtr.weatherGfxLoaded === 0) Thunderstorm_Main();
}

/** 1:1 décomp `Downpour_InitVars(void)` (field_weather_effect.c:1066). */
function Downpour_InitVars(): void {
  gWeatherPtr.initStep = THUNDER_STATE_LOAD_RAIN;
  gWeatherPtr.weatherGfxLoaded = 0;
  gWeatherPtr.rainSpriteVisibleCounter = 0;
  gWeatherPtr.rainSpriteVisibleDelay = 4;
  gWeatherPtr.isDownpour = 1;
  gWeatherPtr.targetRainSpriteCount = 24;
  gWeatherPtr.targetColorMapIndex = 3;
  gWeatherPtr.colorMapStepDelay = 20;
  gWeatherPtr.weatherGfxLoaded = 0;  // duplicate assignment
  SetRainStrengthFromSoundEffect(SE_DOWNPOUR);
}

/** 1:1 décomp `Downpour_InitAll(void)` (field_weather_effect.c:1080). */
function Downpour_InitAll(): void {
  Downpour_InitVars();
  while (gWeatherPtr.weatherGfxLoaded === 0) Thunderstorm_Main();
}

/** 1:1 décomp `Thunderstorm_Main(void)` (field_weather_effect.c:1092).
 *  Pattern d'un cycle : (SHORT_BOLT){1,2}(LONG_BOLT)? ; tonnerre au dernier éclair. */
function Thunderstorm_Main(): void {
  UpdateThunderSound();
  switch (gWeatherPtr.initStep) {
    case THUNDER_STATE_LOAD_RAIN:
      LoadRainSpriteSheet();
      gWeatherPtr.initStep++;
      break;
    case THUNDER_STATE_CREATE_RAIN:
      if (!CreateRainSprite()) gWeatherPtr.initStep++;
      break;
    case THUNDER_STATE_INIT_RAIN:
      if (!UpdateVisibleRainSprites()) {
        gWeatherPtr.weatherGfxLoaded = 1;
        gWeatherPtr.initStep++;
      }
      break;
    case THUNDER_STATE_WAIT_CHANGE:
      if (gWeatherPtr.palProcessingState !== WEATHER_PAL_STATE_CHANGING_WEATHER)
        gWeatherPtr.initStep = THUNDER_STATE_INIT_CYCLE_1;
      break;
    case THUNDER_STATE_NEW_CYCLE:
      gWeatherPtr.thunderAllowEnd = true;
      gWeatherPtr.thunderTimer = (Random() % 360) + 360;
      gWeatherPtr.initStep++;
    // fall through
    case THUNDER_STATE_NEW_CYCLE_WAIT:
      // Wait between 360-720 frames before starting a new cycle.
      if (--gWeatherPtr.thunderTimer === 0) gWeatherPtr.initStep++;
      break;
    case THUNDER_STATE_INIT_CYCLE_1:
      gWeatherPtr.thunderAllowEnd = true;
      gWeatherPtr.thunderLongBolt = (Random() % 2) !== 0;
      gWeatherPtr.initStep++;
      break;
    case THUNDER_STATE_INIT_CYCLE_2:
      gWeatherPtr.thunderShortBolts = (Random() & 1) + 1;
      gWeatherPtr.initStep++;
    // fall through
    case THUNDER_STATE_SHORT_BOLT:
      // Short bolt of lightning strikes.
      ApplyWeatherColorMapIfIdle(19);
      // If final lightning bolt, enqueue thunder.
      if (!gWeatherPtr.thunderLongBolt && gWeatherPtr.thunderShortBolts === 1)
        EnqueueThunder(20);

      gWeatherPtr.thunderTimer = (Random() % 3) + 6;
      gWeatherPtr.initStep++;
      break;
    case THUNDER_STATE_TRY_NEW_BOLT:
      if (--gWeatherPtr.thunderTimer === 0) {
        // Short bolt of lightning ends.
        ApplyWeatherColorMapIfIdle(3);
        gWeatherPtr.thunderAllowEnd = true;
        if (--gWeatherPtr.thunderShortBolts !== 0) {
          // Wait a little, then do another short bolt.
          gWeatherPtr.thunderTimer = (Random() % 16) + 60;
          gWeatherPtr.initStep = THUNDER_STATE_WAIT_BOLT_SHORT;
        } else if (!gWeatherPtr.thunderLongBolt) {
          // No more bolts, restart loop.
          gWeatherPtr.initStep = THUNDER_STATE_NEW_CYCLE;
        } else {
          // Set up long bolt.
          gWeatherPtr.initStep = THUNDER_STATE_INIT_BOLT_LONG;
        }
      }
      break;
    case THUNDER_STATE_WAIT_BOLT_SHORT:
      if (--gWeatherPtr.thunderTimer === 0) gWeatherPtr.initStep = THUNDER_STATE_SHORT_BOLT;
      break;
    case THUNDER_STATE_INIT_BOLT_LONG:
      gWeatherPtr.thunderTimer = (Random() % 16) + 60;
      gWeatherPtr.initStep++;
      break;
    case THUNDER_STATE_WAIT_BOLT_LONG:
      if (--gWeatherPtr.thunderTimer === 0) {
        // Do long bolt. Enqueue thunder with a potentially longer delay.
        EnqueueThunder(100);
        ApplyWeatherColorMapIfIdle(19);
        gWeatherPtr.thunderTimer = (Random() & 0xF) + 30;
        gWeatherPtr.initStep++;
      }
      break;
    case THUNDER_STATE_FADE_BOLT_LONG:
      if (--gWeatherPtr.thunderTimer === 0) {
        // Fade long bolt out over time.
        ApplyWeatherColorMapIfIdle_Gradual(19, 3, 5);
        gWeatherPtr.initStep++;
      }
      break;
    case THUNDER_STATE_END_BOLT_LONG:
      if (gWeatherPtr.palProcessingState === WEATHER_PAL_STATE_IDLE) {
        gWeatherPtr.thunderAllowEnd = true;
        gWeatherPtr.initStep = THUNDER_STATE_NEW_CYCLE;
      }
      break;
  }
}

/** 1:1 décomp `Thunderstorm_Finish(void)` (field_weather_effect.c:1205). */
function Thunderstorm_Finish(): boolean {
  switch (gWeatherPtr.finishStep) {
    case 0:
      gWeatherPtr.thunderAllowEnd = false;
      gWeatherPtr.finishStep++;
    // fall through
    case 1:
      Thunderstorm_Main();
      if (gWeatherPtr.thunderAllowEnd) {
        if (gWeatherPtr.nextWeather === WEATHER_RAIN
         || gWeatherPtr.nextWeather === WEATHER_RAIN_THUNDERSTORM
         || gWeatherPtr.nextWeather === WEATHER_DOWNPOUR)
          return false;

        gWeatherPtr.targetRainSpriteCount = 0;
        gWeatherPtr.finishStep++;
      }
      break;
    case 2:
      if (!UpdateVisibleRainSprites()) {
        DestroyRainSprites();
        gWeatherPtr.thunderEnqueued = false;
        gWeatherPtr.finishStep++;
        return false;
      }
      break;
    default:
      return false;
  }
  return true;
}

/** 1:1 décomp `EnqueueThunder(u16 waitFrames)` (field_weather_effect.c:1242).
 *  Enqueue a thunder sound effect for at most `waitFrames` frames from now. */
function EnqueueThunder(waitFrames: number): void {
  if (!gWeatherPtr.thunderEnqueued) {
    gWeatherPtr.thunderSETimer = Random() % waitFrames;
    gWeatherPtr.thunderEnqueued = true;
  }
}

/** 1:1 décomp `UpdateThunderSound(void)` (field_weather_effect.c:1251).
 *  ⚠️ AUDIO SKIP : les 2 PlaySE(SE_THUNDER/SE_THUNDER2) sont retirés, mais le Random()
 *  qui les sélectionne est CONSERVÉ (déterminisme RNG 1:1) ainsi que la logique d'état. */
function UpdateThunderSound(): void {
  if (gWeatherPtr.thunderEnqueued === true) {
    if (gWeatherPtr.thunderSETimer === 0) {
      if (IsSEPlaying()) return;

      if (Random() & 1) {
        // AUDIO SKIP : PlaySE(SE_THUNDER)
      } else {
        // AUDIO SKIP : PlaySE(SE_THUNDER2)
      }

      gWeatherPtr.thunderEnqueued = false;
    } else {
      gWeatherPtr.thunderSETimer--;
    }
  }
}

// 1:1 décomp sWeatherFuncs (field_weather.c) :
//   [WEATHER_RAIN_THUNDERSTORM] = {Thunderstorm_InitVars, Thunderstorm_Main, Thunderstorm_InitAll, Thunderstorm_Finish}
//   [WEATHER_DOWNPOUR]          = {Downpour_InitVars,     Thunderstorm_Main, Downpour_InitAll,     Thunderstorm_Finish}
_registerWeatherFuncs(WEATHER_RAIN_THUNDERSTORM, {
  initVars: Thunderstorm_InitVars,
  main: Thunderstorm_Main,
  initAll: Thunderstorm_InitAll,
  finish: Thunderstorm_Finish,
});
_registerWeatherFuncs(WEATHER_DOWNPOUR, {
  initVars: Downpour_InitVars,
  main: Thunderstorm_Main,
  initAll: Downpour_InitAll,
  finish: Thunderstorm_Finish,
});

// ════════════════════════════════════════════════════════════════════════════
//  WEATHER_SANDSTORM (field_weather_effect.c:1934-2241)
//  Désert (Route 111) : 20 nuages de sable 64×64 OBJ_BLEND tilés (grille 5×4) qui
//  dérivent selon une ONDE sinusoïdale (sandstormWaveIndex), + 5 « tourbillons »
//  32×32 qui montent en spirale. Palette custom = sandstorm (PALTAG_WEATHER_2 =
//  weatherPicSpritePalIndex, chargée par LoadCustomWeatherSpritePalette comme cloud).
// ════════════════════════════════════════════════════════════════════════════

const SANDSTORM_PNG = '/decomp/em/weather/sandstorm.png';
const NUM_SANDSTORM_SPRITES = 20;       // constants/field_weather.h
const NUM_SWIRL_SANDSTORM_SPRITES = 5;  // constants/field_weather.h
const MIN_SANDSTORM_WAVE_INDEX = 0x20;  // field_weather_effect.c:1947

/** 1:1 décomp `sSandstormSpriteAnimCmds` (field_weather_effect.c:2087-2103) : anim 0 =
 *  le nuage 64×64 (tile 0), anim 1 = le tourbillon 32×32 (tile 64). imageValue = offset TILE. */
const sSandstormSpriteAnimCmds: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 3), ANIMCMD_END],
  [ANIMCMD_FRAME(64, 3), ANIMCMD_END],
];

/** 1:1 décomp `sSwirlEntranceDelays[]` (field_weather_effect.c:2161). */
const sSwirlEntranceDelays: ReadonlyArray<number> = [0, 120, 80, 160, 40, 0];

let _sandstormTileStart = -1;
let _sandstormCharData: Uint8Array | null = null;
let _sandstormPalette: Uint16Array | null = null;
let _sandstormInit = false;
let _sandstormInitPromise: Promise<void> | null = null;

/** Préchargement plateforme du sprite sheet + palette sandstorm (le décomp les a en
 *  INCBIN/INCGFX compile-time : gWeatherSandstormTiles + gSandstormWeatherPalette, tous deux
 *  depuis sandstorm.png). sandstorm.png = 64×80 (8 tiles large) → layout PNG row-major =
 *  OBJ 1D direct (tiles 0-63 = nuage 64×64 ; 64-79 = tourbillon 32×32 lu en 1D). À appeler
 *  avant StartWeather (pattern preloadWeatherCloudSprites). */
export async function preloadWeatherSandstormSprites(): Promise<void> {
  if (_sandstormInit) return;
  if (_sandstormInitPromise) return _sandstormInitPromise;
  _sandstormInitPromise = (async () => {
    const png = await loadIndexedPngStrict(SANDSTORM_PNG, 4);
    _sandstormCharData = png.charData;
    _sandstormPalette = png.palette;
    _sandstormInit = true;
  })();
  return _sandstormInitPromise;
}

/** 1:1 décomp `Sandstorm_InitVars(void)` (field_weather_effect.c:1949). */
function Sandstorm_InitVars(): void {
  gWeatherPtr.initStep = 0;
  gWeatherPtr.weatherGfxLoaded = 0;
  gWeatherPtr.targetColorMapIndex = 0;
  gWeatherPtr.colorMapStepDelay = 20;
  if (!gWeatherPtr.sandstormSpritesCreated) {
    gWeatherPtr.sandstormXOffset = gWeatherPtr.sandstormYOffset = 0;
    gWeatherPtr.sandstormWaveIndex = 8;
    gWeatherPtr.sandstormWaveCounter = 0;
    // Dead code. How does the compiler not optimize this out?
    if (gWeatherPtr.sandstormWaveIndex >= 0x80 - MIN_SANDSTORM_WAVE_INDEX)
      gWeatherPtr.sandstormWaveIndex = 0x80 - gWeatherPtr.sandstormWaveIndex;

    Weather_SetBlendCoeffs(0, 16);
  }
}

/** 1:1 décomp `Sandstorm_InitAll(void)` (field_weather_effect.c:1968). */
function Sandstorm_InitAll(): void {
  Sandstorm_InitVars();
  while (!gWeatherPtr.weatherGfxLoaded) Sandstorm_Main();
}

/** 1:1 décomp `Sandstorm_Main(void)` (field_weather_effect.c:1975). */
function Sandstorm_Main(): void {
  UpdateSandstormMovement();
  UpdateSandstormWaveIndex();
  if (gWeatherPtr.sandstormWaveIndex >= 0x80 - MIN_SANDSTORM_WAVE_INDEX)
    gWeatherPtr.sandstormWaveIndex = MIN_SANDSTORM_WAVE_INDEX;

  switch (gWeatherPtr.initStep) {
    case 0:
      CreateSandstormSprites();
      CreateSwirlSandstormSprites();
      gWeatherPtr.initStep++;
      break;
    case 1:
      Weather_SetTargetBlendCoeffs(16, 0, 0);
      gWeatherPtr.initStep++;
      break;
    case 2:
      if (Weather_UpdateBlend()) {
        gWeatherPtr.weatherGfxLoaded = 1;
        gWeatherPtr.initStep++;
      }
      break;
  }
}

/** 1:1 décomp `Sandstorm_Finish(void)` (field_weather_effect.c:2003). */
function Sandstorm_Finish(): boolean {
  UpdateSandstormMovement();
  UpdateSandstormWaveIndex();
  switch (gWeatherPtr.finishStep) {
    case 0:
      Weather_SetTargetBlendCoeffs(0, 16, 0);
      gWeatherPtr.finishStep++;
      break;
    case 1:
      if (Weather_UpdateBlend()) gWeatherPtr.finishStep++;
      break;
    case 2:
      DestroySandstormSprites();
      gWeatherPtr.finishStep++;
      break;
    default:
      return false;
  }
  return true;
}

/** 1:1 décomp `UpdateSandstormWaveIndex(void)` (field_weather_effect.c:2028). */
function UpdateSandstormWaveIndex(): void {
  if (gWeatherPtr.sandstormWaveCounter++ > 4) {
    gWeatherPtr.sandstormWaveIndex++;
    gWeatherPtr.sandstormWaveCounter = 0;
  }
}

/** 1:1 décomp `UpdateSandstormMovement(void)` (field_weather_effect.c:2037).
 *  sandstormXOffset/YOffset = u32 (accumulateurs signés qui wrappent) → `>>> 0` maintient
 *  la largeur u32 ; `>>> 8` = shift LOGIQUE 1:1. sandstormPosY (u16) réinterprété s16 pour
 *  sprite->y2 comme le fait le compilo. */
function UpdateSandstormMovement(): void {
  const rt = _rt();
  gWeatherPtr.sandstormXOffset = (gWeatherPtr.sandstormXOffset - gSineTable[gWeatherPtr.sandstormWaveIndex] * 4) >>> 0;
  gWeatherPtr.sandstormYOffset = (gWeatherPtr.sandstormYOffset - gSineTable[gWeatherPtr.sandstormWaveIndex]) >>> 0;
  gWeatherPtr.sandstormBaseSpritesX = (rt.gSpriteCoordOffsetX + (gWeatherPtr.sandstormXOffset >>> 8)) & 0xFF;
  gWeatherPtr.sandstormPosY = (rt.gSpriteCoordOffsetY + (gWeatherPtr.sandstormYOffset >>> 8)) & 0xFFFF;
}

/** 1:1 décomp `DestroySandstormSprites(void)` (field_weather_effect.c:2045). */
function DestroySandstormSprites(): void {
  if (gWeatherPtr.sandstormSpritesCreated) {
    for (let i = 0; i < NUM_SANDSTORM_SPRITES; i++) {
      const s = gWeatherPtr.sprites.s2.sandstormSprites1[i] as DecompSprite | null;
      if (s) DestroySprite(s.spriteId);
    }

    gWeatherPtr.sandstormSpritesCreated = 0;
    FreeSpriteTilesByTag(GFXTAG_SANDSTORM);
  }

  if (gWeatherPtr.sandstormSwirlSpritesCreated) {
    for (let i = 0; i < NUM_SWIRL_SANDSTORM_SPRITES; i++) {
      const s = gWeatherPtr.sprites.s2.sandstormSprites2[i] as DecompSprite | null;
      if (s !== null) DestroySprite(s.spriteId);
    }

    gWeatherPtr.sandstormSwirlSpritesCreated = 0;
  }
}

// Regular sandstorm sprites : tSpriteColumn=data[0], tSpriteRow=data[1].
// Swirly sandstorm sprites  : tRadius=data[0], tWaveIndex=data[1], tRadiusCounter=data[2], tEntranceDelay=data[3].
/** 1:1 décomp `CreateSandstormSprites(void)` (field_weather_effect.c:2133). */
function CreateSandstormSprites(): void {
  const rt = _rt();

  if (!gWeatherPtr.sandstormSpritesCreated) {
    // 1:1 : LoadSpriteSheet(&sSandstormSpriteSheet) + LoadCustomWeatherSpritePalette(gSandstormWeatherPalette).
    if (_sandstormCharData === null) {
      console.error('[field_weather_effect] sandstorm.png non préchargé — appeler preloadWeatherSandstormSprites() avant StartWeather.');
      _sandstormTileStart = 0;
    } else {
      _sandstormTileStart = LoadSpriteSheet({ data: _sandstormCharData, size: _sandstormCharData.length, tag: GFXTAG_SANDSTORM });
    }
    if (_sandstormPalette !== null) LoadCustomWeatherSpritePalette(_sandstormPalette);

    for (let i = 0; i < NUM_SANDSTORM_SPRITES; i++) {
      // 1:1 : CreateSpriteAtEnd(&sSandstormSpriteTemplate, 0, (i / 5) * 64, 1).
      const { spriteId } = rt.CreateSpriteAtOam({
        tileId: _sandstormTileStart,
        paletteBank: gWeatherPtr.weatherPicSpritePalIndex,
        x: 0, y: ((i / 5) | 0) * 64,
        shape: 0, size: 3,           // SPRITE_SHAPE/SIZE(64x64)
        priority: 1,                 // 1:1 oam.priority = 1
        paletteMode: 0, affineMode: 0,
        subpriority: 1,
        fromEnd: true,               // CreateSpriteAtEnd
      });
      if (spriteId !== MAX_SPRITES) {
        const sprite = rt.gSprites[spriteId]!;
        // 1:1 : oam.objMode = ST_OAM_OBJ_BLEND.
        sprite.objMode = 1;
        sprite.callback = UpdateSandstormSprite;
        setFieldEffectAnims(sprite, sSandstormSpriteAnimCmds, _sandstormTileStart);
        sprite.data[0] = (i % 5) & 0xFF;          // tSpriteColumn
        sprite.data[1] = ((i / 5) | 0) & 0xFF;    // tSpriteRow
        gWeatherPtr.sprites.s2.sandstormSprites1[i] = sprite;
      } else {
        gWeatherPtr.sprites.s2.sandstormSprites1[i] = null;
      }
    }

    gWeatherPtr.sandstormSpritesCreated = 1;
  }
}

/** 1:1 décomp `CreateSwirlSandstormSprites(void)` (field_weather_effect.c:2163). */
function CreateSwirlSandstormSprites(): void {
  const rt = _rt();

  if (!gWeatherPtr.sandstormSwirlSpritesCreated) {
    for (let i = 0; i < NUM_SWIRL_SANDSTORM_SPRITES; i++) {
      // 1:1 : CreateSpriteAtEnd(&sSandstormSpriteTemplate, i * 48 + 24, 208, 1).
      const { spriteId } = rt.CreateSpriteAtOam({
        tileId: _sandstormTileStart,
        paletteBank: gWeatherPtr.weatherPicSpritePalIndex,
        x: i * 48 + 24, y: 208,
        shape: 0, size: 3,           // template = 64x64 ; resized to 32x32 juste après
        priority: 1,
        paletteMode: 0, affineMode: 0,
        subpriority: 1,
        fromEnd: true,
      });
      if (spriteId !== MAX_SPRITES) {
        const sprite = rt.gSprites[spriteId]!;
        sprite.objMode = 1;
        gWeatherPtr.sprites.s2.sandstormSprites2[i] = sprite;
        // 1:1 : oam.size = ST_OAM_SIZE_2 (= 32×32 pour shape carrée). syncSpritesToOam ne
        // recopie PAS shape/size (posés à la création) → on écrit l'OAM directement + le
        // champ sprite.size (précédent : aucun ; adaptation renderer documentée).
        rt.gba.oam[sprite.oamIndex].size = 2;
        sprite.size = 2;
        sprite.data[1] = i * 51;      // tSpriteRow alias tWaveIndex (quirk décomp)
        sprite.data[0] = 8;           // tRadius
        sprite.data[2] = 0;           // tRadiusCounter
        sprite.data[4] = 0x6730;      // unused value
        sprite.data[3] = sSwirlEntranceDelays[i]; // tEntranceDelay
        setFieldEffectAnims(sprite, sSandstormSpriteAnimCmds, _sandstormTileStart);
        rt.StartSpriteAnim(sprite.spriteId, 1);
        // 1:1 : CalcCenterToCornerVec(sprite, SPRITE_SHAPE(32x32), SPRITE_SIZE(32x32), ST_OAM_AFFINE_OFF).
        const ctcv = CalcCenterToCornerVec(0, 2, 0);
        sprite.centerToCornerVecX = ctcv.centerToCornerVecX;
        sprite.centerToCornerVecY = ctcv.centerToCornerVecY;
        sprite.callback = WaitSandSwirlSpriteEntrance;
      } else {
        gWeatherPtr.sprites.s2.sandstormSprites2[i] = null;
      }

      gWeatherPtr.sandstormSwirlSpritesCreated = 1;
    }
  }
}

/** 1:1 décomp `UpdateSandstormSprite(struct Sprite *sprite)` (field_weather_effect.c:2196).
 *  tSpriteColumn=data[0]. sandstormPosY (u16) réinterprété s16 pour y2. */
function UpdateSandstormSprite(sprite: DecompSprite): void {
  sprite.y2 = (gWeatherPtr.sandstormPosY << 16) >> 16;
  sprite.x = gWeatherPtr.sandstormBaseSpritesX + 32 + sprite.data[0] * 64;
  if (sprite.x > DISPLAY_WIDTH + 31) {
    sprite.x = gWeatherPtr.sandstormBaseSpritesX + (DISPLAY_WIDTH * 2) - (4 - sprite.data[0]) * 64;
    sprite.x &= 0x1FF;
  }
}

/** 1:1 décomp `WaitSandSwirlSpriteEntrance(struct Sprite *sprite)` (field_weather_effect.c:2207).
 *  tEntranceDelay=data[3]. */
function WaitSandSwirlSpriteEntrance(sprite: DecompSprite): void {
  if (--sprite.data[3] === -1) sprite.callback = UpdateSandstormSwirlSprite;
}

/** 1:1 décomp `UpdateSandstormSwirlSprite(struct Sprite *sprite)` (field_weather_effect.c:2213).
 *  tRadius=data[0], tWaveIndex=data[1], tRadiusCounter=data[2].
 *  `u32 x = tRadius * gSineTable[...]` puis `x2 = x >> 8` : produit s32 → u32 (wrap) → shift
 *  LOGIQUE → s16 (low 16 bits) ; 1:1 avec l'arithmétique du compilo. */
function UpdateSandstormSwirlSprite(sprite: DecompSprite): void {
  if (--sprite.y < -48) {
    sprite.y = DISPLAY_HEIGHT + 48;
    sprite.data[0] = 4;  // tRadius
  }

  const x = (sprite.data[0] * gSineTable[sprite.data[1]]) >>> 0;
  const y = (sprite.data[0] * gSineTable[sprite.data[1] + 0x40]) >>> 0;
  sprite.x2 = ((x >>> 8) << 16) >> 16;
  sprite.y2 = ((y >>> 8) << 16) >> 16;
  sprite.data[1] = (sprite.data[1] + 10) & 0xFF;  // tWaveIndex
  if (++sprite.data[2] > 8) {                       // tRadiusCounter
    sprite.data[2] = 0;
    sprite.data[0]++;                               // tRadius
  }
}

// 1:1 décomp sWeatherFuncs (field_weather.c) :
//   [WEATHER_SANDSTORM] = {Sandstorm_InitVars, Sandstorm_Main, Sandstorm_InitAll, Sandstorm_Finish}
_registerWeatherFuncs(WEATHER_SANDSTORM, {
  initVars: Sandstorm_InitVars,
  main: Sandstorm_Main,
  initAll: Sandstorm_InitAll,
  finish: Sandstorm_Finish,
});

// ════════════════════════════════════════════════════════════════════════════
//  WEATHER_FOG_DIAGONAL (field_weather_effect.c:1726-1932)
//  Brouillard en diagonale (grottes/tunnels) : 20 sprites 64×64 OBJ_BLEND (grille 5×4)
//  défilant en X (fogDBaseSpritesX) ET Y (fogDPosY). Palette = fog (PALTAG_WEATHER =
//  contrastColorMapSpritePalIndex, allouée par StartWeather).
// ════════════════════════════════════════════════════════════════════════════

const FOG_D_PNG = '/decomp/em/weather/fog_diagonal.png';
const NUM_FOG_DIAGONAL_SPRITES = 20; // constants/field_weather.h

/** 1:1 décomp `sFogDiagonalSpriteAnimCmds` (field_weather_effect.c:1847-1856) : 1 anim 1-frame. */
const sFogDiagonalSpriteAnimCmds: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 16), ANIMCMD_END],
];

let _fogDTileStart = -1;
let _fogDCharData: Uint8Array | null = null;
let _fogDInit = false;
let _fogDInitPromise: Promise<void> | null = null;

/** Préchargement plateforme du sprite sheet fog diagonal (le décomp l'a en INCBIN
 *  compile-time : gWeatherFogDiagonalTiles). fog_diagonal.png = 64×64 (8 tiles large) →
 *  layout PNG row-major = OBJ 1D 64×64 direct. Palette = fog (PALTAG_WEATHER, StartWeather).
 *  À appeler avant StartWeather (pattern preloadWeatherFogHorizontalSprites). */
export async function preloadWeatherFogDiagonalSprites(): Promise<void> {
  if (_fogDInit) return;
  if (_fogDInitPromise) return _fogDInitPromise;
  _fogDInitPromise = (async () => {
    const png = await loadIndexedPngStrict(FOG_D_PNG, 4);
    _fogDCharData = png.charData;
    _fogDInit = true;
  })();
  return _fogDInitPromise;
}

/** 1:1 décomp `FogDiagonal_InitVars(void)` (field_weather_effect.c:1735). */
function FogDiagonal_InitVars(): void {
  gWeatherPtr.initStep = 0;
  gWeatherPtr.weatherGfxLoaded = 0;
  gWeatherPtr.targetColorMapIndex = 0;
  gWeatherPtr.colorMapStepDelay = 20;
  gWeatherPtr.fogHScrollCounter = 0;
  gWeatherPtr.fogHScrollOffset = 1;
  if (!gWeatherPtr.fogDSpritesCreated) {
    gWeatherPtr.fogDScrollXCounter = 0;
    gWeatherPtr.fogDScrollYCounter = 0;
    gWeatherPtr.fogDXOffset = 0;
    gWeatherPtr.fogDYOffset = 0;
    gWeatherPtr.fogDBaseSpritesX = 0;
    gWeatherPtr.fogDPosY = 0;
    Weather_SetBlendCoeffs(0, 16);
  }
}

/** 1:1 décomp `FogDiagonal_InitAll(void)` (field_weather_effect.c:1755). */
function FogDiagonal_InitAll(): void {
  FogDiagonal_InitVars();
  while (gWeatherPtr.weatherGfxLoaded === 0) FogDiagonal_Main();
}

/** 1:1 décomp `FogDiagonal_Main(void)` (field_weather_effect.c:1762). */
function FogDiagonal_Main(): void {
  UpdateFogDiagonalMovement();
  switch (gWeatherPtr.initStep) {
    case 0:
      CreateFogDiagonalSprites();
      gWeatherPtr.initStep++;
      break;
    case 1:
      Weather_SetTargetBlendCoeffs(12, 8, 8);
      gWeatherPtr.initStep++;
      break;
    case 2:
      if (!Weather_UpdateBlend()) break;
      gWeatherPtr.weatherGfxLoaded = 1;
      gWeatherPtr.initStep++;
      break;
  }
}

/** 1:1 décomp `FogDiagonal_Finish(void)` (field_weather_effect.c:1784). */
function FogDiagonal_Finish(): boolean {
  UpdateFogDiagonalMovement();
  switch (gWeatherPtr.finishStep) {
    case 0:
      Weather_SetTargetBlendCoeffs(0, 16, 1);
      gWeatherPtr.finishStep++;
      break;
    case 1:
      if (!Weather_UpdateBlend()) break;
      gWeatherPtr.finishStep++;
      break;
    case 2:
      DestroyFogDiagonalSprites();
      gWeatherPtr.finishStep++;
      break;
    default:
      return false;
  }
  return true;
}

/** 1:1 décomp `UpdateFogDiagonalMovement(void)` (field_weather_effect.c:1808).
 *  fogDPosY (u16) laissé masqué u16 ; réinterprété s16 pour y2 dans le sprite callback. */
function UpdateFogDiagonalMovement(): void {
  const rt = _rt();
  if (++gWeatherPtr.fogDScrollXCounter > 2) {
    gWeatherPtr.fogDXOffset++;
    gWeatherPtr.fogDScrollXCounter = 0;
  }

  if (++gWeatherPtr.fogDScrollYCounter > 4) {
    gWeatherPtr.fogDYOffset++;
    gWeatherPtr.fogDScrollYCounter = 0;
  }

  gWeatherPtr.fogDBaseSpritesX = (rt.gSpriteCoordOffsetX - gWeatherPtr.fogDXOffset) & 0xFF;
  gWeatherPtr.fogDPosY = (rt.gSpriteCoordOffsetY + gWeatherPtr.fogDYOffset) & 0xFFFF;
}

// tSpriteColumn=data[0], tSpriteRow=data[1].
/** 1:1 décomp `CreateFogDiagonalSprites(void)` (field_weather_effect.c:1872). */
function CreateFogDiagonalSprites(): void {
  const rt = _rt();

  if (!gWeatherPtr.fogDSpritesCreated) {
    // 1:1 : LoadSpriteSheet(&fogDiagonalSpriteSheet).
    if (_fogDCharData === null) {
      console.error('[field_weather_effect] fog_diagonal.png non préchargé — appeler preloadWeatherFogDiagonalSprites() avant StartWeather.');
      _fogDTileStart = 0;
    } else {
      _fogDTileStart = LoadSpriteSheet({ data: _fogDCharData, size: _fogDCharData.length, tag: GFXTAG_FOG_D });
    }
    for (let i = 0; i < NUM_FOG_DIAGONAL_SPRITES; i++) {
      // 1:1 : CreateSpriteAtEnd(&sFogDiagonalSpriteTemplate, 0, (i / 5) * 64, 0xFF).
      const { spriteId } = rt.CreateSpriteAtOam({
        tileId: _fogDTileStart,
        paletteBank: gWeatherPtr.contrastColorMapSpritePalIndex,
        x: 0, y: ((i / 5) | 0) * 64,
        shape: 0, size: 3,           // SPRITE_SHAPE/SIZE(64x64)
        priority: 2,                 // 1:1 oam.priority = 2
        paletteMode: 0, affineMode: 0,
        subpriority: 0xFF,
        fromEnd: true,               // CreateSpriteAtEnd
      });
      if (spriteId !== MAX_SPRITES) {
        const sprite = rt.gSprites[spriteId]!;
        // 1:1 : oam.objMode = ST_OAM_OBJ_BLEND.
        sprite.objMode = 1;
        sprite.callback = UpdateFogDiagonalSprite;
        setFieldEffectAnims(sprite, sFogDiagonalSpriteAnimCmds, _fogDTileStart);
        sprite.data[0] = (i % 5) & 0xFF;          // tSpriteColumn
        sprite.data[1] = ((i / 5) | 0) & 0xFF;    // tSpriteRow
        gWeatherPtr.sprites.s2.fogDSprites[i] = sprite;
      } else {
        gWeatherPtr.sprites.s2.fogDSprites[i] = null;
      }
    }

    gWeatherPtr.fogDSpritesCreated = 1;
  }
}

/** 1:1 décomp `DestroyFogDiagonalSprites(void)` (field_weather_effect.c:1903). */
function DestroyFogDiagonalSprites(): void {
  if (gWeatherPtr.fogDSpritesCreated) {
    for (let i = 0; i < NUM_FOG_DIAGONAL_SPRITES; i++) {
      const s = gWeatherPtr.sprites.s2.fogDSprites[i] as DecompSprite | null;
      if (s) DestroySprite(s.spriteId);
    }

    FreeSpriteTilesByTag(GFXTAG_FOG_D);
    gWeatherPtr.fogDSpritesCreated = 0;
  }
}

/** 1:1 décomp `UpdateFogDiagonalSprite(struct Sprite *sprite)` (field_weather_effect.c:1920).
 *  tSpriteColumn=data[0]. fogDPosY (u16) réinterprété s16 pour y2. */
function UpdateFogDiagonalSprite(sprite: DecompSprite): void {
  sprite.y2 = (gWeatherPtr.fogDPosY << 16) >> 16;
  sprite.x = gWeatherPtr.fogDBaseSpritesX + 32 + sprite.data[0] * 64;
  if (sprite.x > DISPLAY_WIDTH + 31) {
    sprite.x = gWeatherPtr.fogDBaseSpritesX + (DISPLAY_WIDTH * 2) - (4 - sprite.data[0]) * 64;
    sprite.x &= 0x1FF;
  }
}

// 1:1 décomp sWeatherFuncs (field_weather.c) :
//   [WEATHER_FOG_DIAGONAL] = {FogDiagonal_InitVars, FogDiagonal_Main, FogDiagonal_InitAll, FogDiagonal_Finish}
_registerWeatherFuncs(WEATHER_FOG_DIAGONAL, {
  initVars: FogDiagonal_InitVars,
  main: FogDiagonal_Main,
  initAll: FogDiagonal_InitAll,
  finish: FogDiagonal_Finish,
});

// ════════════════════════════════════════════════════════════════════════════
//  WEATHER_SNOW (field_weather_effect.c:757-1008)
//  Flocons 8×8 OBJ_NORMAL : chaque flocon = un sprite AVEC ses PROPRES tuiles (images
//  SpriteFrameImage, tileTag == TAG_NONE) ; 2 frames (snow0/snow1). Chute Q7 fixed-point
//  + oscillation sinusoïdale, wrap haut/bas/gauche/droite. Palette = fog (PALTAG_WEATHER).
//  ⚠️ ADAPTATION RENDERER : le décomp fait CreateSpriteAtEnd(&sSnowflakeSpriteTemplate,…) ;
//  ici on route par `CreateSprite(template, …)` (sprite.ts) = la voie inline TAG_NONE
//  (AllocSpriteTiles + copie images[0]/[1] via l'anim). La seule différence est le SENS de
//  scan des slots (0→N au lieu de N→0) ; sans impact visuel (subpriority 78 identique pour
//  tous, cf. précédent fromEnd sur Rain/CreateRainSprite). preloadWeatherSnowSprites OBLIGATOIRE
//  (sinon Snow_InitAll boucle : UpdateVisibleSnowflakeSprites ne converge jamais). */
// ════════════════════════════════════════════════════════════════════════════

const SNOW0_PNG = '/decomp/em/weather/snow0.png';
const SNOW1_PNG = '/decomp/em/weather/snow1.png';
const NUM_SNOWFLAKE_SPRITES = 16; // constants/field_weather.h

/** 1:1 décomp `sSnowflakeSpriteImages[]` (field_weather_effect.c:854-858) : {gWeatherSnow1Tiles},
 *  {gWeatherSnow2Tiles} — 2 tuiles 8×8 4bpp. Peuplé par preloadWeatherSnowSprites (INCBIN
 *  compile-time côté décomp). */
const sSnowflakeSpriteImages: { data: Uint8Array; size: number }[] = [];

/** 1:1 décomp `sSnowflakeAnimCmds[]` (field_weather_effect.c:860-876) : anim 0 = frame image 0,
 *  anim 1 = frame image 1 (imageValue = index dans images[]). */
const sSnowflakeAnimCmds: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 16), ANIMCMD_END],
  [ANIMCMD_FRAME(1, 16), ANIMCMD_END],
];

/** 1:1 décomp `sSnowflakeSpriteTemplate` (field_weather_effect.c:878-887) : tileTag TAG_NONE
 *  (tuiles inline via images), paletteTag PALTAG_WEATHER, OAM 8×8 OBJ_NORMAL priority 1. */
const sSnowflakeSpriteTemplate = {
  tileTag: TAG_NONE,
  paletteTag: PALTAG_WEATHER,
  oam: { shape: 0 as const, size: 0 as const, priority: 1, objMode: 0, affineMode: 0, paletteNum: 0 },
  anims: sSnowflakeAnimCmds,
  images: sSnowflakeSpriteImages,
  callback: UpdateSnowflakeSprite,
};

let _snowInit = false;
let _snowInitPromise: Promise<void> | null = null;

/** Préchargement plateforme des 2 frames de flocon (INCBIN compile-time côté décomp :
 *  gWeatherSnow1Tiles/gWeatherSnow2Tiles). snow0/snow1.png = 8×8 (1 tuile chacun). Peuple
 *  sSnowflakeSpriteImages. OBLIGATOIRE avant StartWeather (cf. note famille). */
export async function preloadWeatherSnowSprites(): Promise<void> {
  if (_snowInit) return;
  if (_snowInitPromise) return _snowInitPromise;
  _snowInitPromise = (async () => {
    const png0 = await loadIndexedPngStrict(SNOW0_PNG, 4);
    const png1 = await loadIndexedPngStrict(SNOW1_PNG, 4);
    sSnowflakeSpriteImages.length = 0;
    sSnowflakeSpriteImages.push({ data: png0.charData, size: png0.charData.length });
    sSnowflakeSpriteImages.push({ data: png1.charData, size: png1.charData.length });
    _snowInit = true;
  })();
  return _snowInitPromise;
}

/** 1:1 décomp `Snow_InitVars(void)` (field_weather_effect.c:767). */
function Snow_InitVars(): void {
  gWeatherPtr.initStep = 0;
  gWeatherPtr.weatherGfxLoaded = 0;
  gWeatherPtr.targetColorMapIndex = 3;
  gWeatherPtr.colorMapStepDelay = 20;
  gWeatherPtr.targetSnowflakeSpriteCount = NUM_SNOWFLAKE_SPRITES;
  gWeatherPtr.snowflakeVisibleCounter = 0;
}

/** 1:1 décomp `Snow_InitAll(void)` (field_weather_effect.c:777). */
function Snow_InitAll(): void {
  Snow_InitVars();
  while (gWeatherPtr.weatherGfxLoaded === 0) {
    Snow_Main();
    for (let i = 0; i < gWeatherPtr.snowflakeSpriteCount; i++)
      UpdateSnowflakeSprite(gWeatherPtr.sprites.s1.snowflakeSprites[i] as DecompSprite);
  }
}

/** 1:1 décomp `Snow_Main(void)` (field_weather_effect.c:790). */
function Snow_Main(): void {
  if (gWeatherPtr.initStep === 0 && !UpdateVisibleSnowflakeSprites()) {
    gWeatherPtr.weatherGfxLoaded = 1;
    gWeatherPtr.initStep++;
  }
}

/** 1:1 décomp `Snow_Finish(void)` (field_weather_effect.c:799). */
function Snow_Finish(): boolean {
  switch (gWeatherPtr.finishStep) {
    case 0:
      gWeatherPtr.targetSnowflakeSpriteCount = 0;
      gWeatherPtr.snowflakeVisibleCounter = 0;
      gWeatherPtr.finishStep++;
    // fall through
    case 1:
      if (!UpdateVisibleSnowflakeSprites()) {
        gWeatherPtr.finishStep++;
        return false;
      }
      return true;
  }

  return false;
}

/** 1:1 décomp `UpdateVisibleSnowflakeSprites(void)` (field_weather_effect.c:820). */
function UpdateVisibleSnowflakeSprites(): boolean {
  if (gWeatherPtr.snowflakeSpriteCount === gWeatherPtr.targetSnowflakeSpriteCount) return false;

  if (++gWeatherPtr.snowflakeVisibleCounter > 36) {
    gWeatherPtr.snowflakeVisibleCounter = 0;
    if (gWeatherPtr.snowflakeSpriteCount < gWeatherPtr.targetSnowflakeSpriteCount)
      CreateSnowflakeSprite();
    else
      DestroySnowflakeSprite();
  }

  return gWeatherPtr.snowflakeSpriteCount !== gWeatherPtr.targetSnowflakeSpriteCount;
}

// tPosY=data[0], tDeltaY=data[1], tWaveDelta=data[2], tWaveIndex=data[3], tSnowflakeId=data[4],
// tFallCounter=data[5], tFallDuration=data[6], tDeltaY2=data[7].

/** 1:1 décomp `CreateSnowflakeSprite(void)` (field_weather_effect.c:898). */
function CreateSnowflakeSprite(): boolean {
  const rt = _rt();
  if (sSnowflakeSpriteImages.length === 0) {
    console.error('[field_weather_effect] snow0/snow1.png non préchargés — appeler preloadWeatherSnowSprites() avant StartWeather.');
    return false;
  }
  // 1:1 : CreateSpriteAtEnd(&sSnowflakeSpriteTemplate, 0, 0, 78) — voie inline TAG_NONE.
  const spriteId = CreateSprite(sSnowflakeSpriteTemplate as never, 0, 0, 78);
  if (spriteId === MAX_SPRITES) return false;

  const sprite = rt.gSprites[spriteId]!;
  sprite.data[4] = gWeatherPtr.snowflakeSpriteCount;   // tSnowflakeId
  InitSnowflakeSpriteMovement(sprite);
  sprite.coordOffsetEnabled = true;
  gWeatherPtr.sprites.s1.snowflakeSprites[gWeatherPtr.snowflakeSpriteCount++] = sprite;
  return true;
}

/** 1:1 décomp `DestroySnowflakeSprite(void)` (field_weather_effect.c:911). */
function DestroySnowflakeSprite(): boolean {
  if (gWeatherPtr.snowflakeSpriteCount) {
    const s = gWeatherPtr.sprites.s1.snowflakeSprites[--gWeatherPtr.snowflakeSpriteCount] as DecompSprite;
    DestroySprite(s.spriteId);
    return true;
  }

  return false;
}

/** 1:1 décomp `InitSnowflakeSpriteMovement(struct Sprite *sprite)` (field_weather_effect.c:922).
 *  tSnowflakeId=data[4], tPosY=data[0], tDeltaY=data[1], tDeltaY2=data[7], tWaveIndex=data[3],
 *  tWaveDelta=data[2], tFallDuration=data[6], tFallCounter=data[5]. */
function InitSnowflakeSpriteMovement(sprite: DecompSprite): void {
  const rt = _rt();
  const x = ((sprite.data[4] * 5) & 7) * 30 + (Random() % 30);

  sprite.y = -3 - (rt.gSpriteCoordOffsetY + sprite.centerToCornerVecY);
  sprite.x = x - (rt.gSpriteCoordOffsetX + sprite.centerToCornerVecX);
  sprite.data[0] = sprite.y * 128;
  sprite.x2 = 0;
  const rand = Random();
  sprite.data[1] = (rand & 3) * 5 + 64;
  sprite.data[7] = sprite.data[1];
  rt.StartSpriteAnim(sprite.spriteId, (rand & 1) ? 0 : 1);
  sprite.data[3] = 0;
  sprite.data[2] = ((rand & 3) === 0) ? 2 : 1;
  sprite.data[6] = (rand & 0x1F) + 210;
  sprite.data[5] = 0;
}

/** 1:1 décomp `WaitSnowflakeSprite(struct Sprite *sprite)` (field_weather_effect.c:941).
 *  Timer jamais incrémenté (quirk décomp) → réactivation de fait inerte. */
function WaitSnowflakeSprite(sprite: DecompSprite): void {
  const rt = _rt();
  if (gWeatherPtr.snowflakeTimer > 18) {
    sprite.invisible = false;
    sprite.callback = UpdateSnowflakeSprite;
    sprite.y = 250 - (rt.gSpriteCoordOffsetY + sprite.centerToCornerVecY);
    sprite.data[0] = sprite.y * 128;
    gWeatherPtr.snowflakeTimer = 0;
  }
}

/** 1:1 décomp `UpdateSnowflakeSprite(struct Sprite *sprite)` (field_weather_effect.c:954).
 *  Le sign-extend 9-bit (`if (x & 0x100) x |= -0x100`) est reproduit 1:1. */
function UpdateSnowflakeSprite(sprite: DecompSprite): void {
  const rt = _rt();
  let x: number;
  let y: number;

  sprite.data[0] += sprite.data[1];       // tPosY += tDeltaY
  sprite.y = sprite.data[0] >> 7;
  sprite.data[3] += sprite.data[2];       // tWaveIndex += tWaveDelta
  sprite.data[3] &= 0xFF;
  sprite.x2 = (gSineTable[sprite.data[3]] / 64) | 0;

  x = (sprite.x + sprite.centerToCornerVecX + rt.gSpriteCoordOffsetX) & 0x1FF;
  if (x & 0x100) x |= -0x100;

  if (x < -3)
    sprite.x = 242 - (rt.gSpriteCoordOffsetX + sprite.centerToCornerVecX);
  else if (x > 242)
    sprite.x = -3 - (rt.gSpriteCoordOffsetX + sprite.centerToCornerVecX);

  y = (sprite.y + sprite.centerToCornerVecY + rt.gSpriteCoordOffsetY) & 0xFF;
  if (y > 163 && y < 171) {
    sprite.y = 250 - (rt.gSpriteCoordOffsetY + sprite.centerToCornerVecY);
    sprite.data[0] = sprite.y * 128;
    sprite.data[5] = 0;                   // tFallCounter
    sprite.data[6] = 220;                 // tFallDuration
  } else if (y > 242 && y < 250) {
    sprite.y = 163;
    sprite.data[0] = sprite.y * 128;
    sprite.data[5] = 0;
    sprite.data[6] = 220;
    sprite.invisible = true;
    sprite.callback = WaitSnowflakeSprite;
  }

  if (++sprite.data[5] === sprite.data[6]) {   // ++tFallCounter == tFallDuration
    InitSnowflakeSpriteMovement(sprite);
    sprite.y = 250;
    sprite.invisible = true;
    sprite.callback = WaitSnowflakeSprite;
  }
}

// 1:1 décomp sWeatherFuncs (field_weather.c) :
//   [WEATHER_SNOW] = {Snow_InitVars, Snow_Main, Snow_InitAll, Snow_Finish}
_registerWeatherFuncs(WEATHER_SNOW, {
  initVars: Snow_InitVars,
  main: Snow_Main,
  initAll: Snow_InitAll,
  finish: Snow_Finish,
});

// ════════════════════════════════════════════════════════════════════════════
//  WEATHER_UNDERWATER_BUBBLES (field_weather_effect.c:2268-2433)
//  Bulles sous-marines : réutilise TOUT le brouillard horizontal (FogHorizontal_*) +
//  émet périodiquement des bulles 8×8 qui remontent en zigzag. Palette = fog
//  (PALTAG_WEATHER = contrastColorMapSpritePalIndex, allouée par StartWeather).
// ════════════════════════════════════════════════════════════════════════════

const BUBBLE_PNG = '/decomp/em/weather/bubble.png';

/** 1:1 décomp `sBubbleStartDelays[]` (field_weather_effect.c:2276). */
const sBubbleStartDelays: ReadonlyArray<number> = [40, 90, 60, 90, 2, 60, 40, 30];

/** 1:1 décomp `sBubbleStartCoords[][2]` (field_weather_effect.c:2285-2300). */
const sBubbleStartCoords: ReadonlyArray<{ x: number; y: number }> = [
  { x: 120, y: 160 }, { x: 376, y: 160 }, { x: 40, y: 140 }, { x: 296, y: 140 },
  { x: 180, y: 130 }, { x: 436, y: 130 }, { x: 60, y: 160 }, { x: 436, y: 160 },
  { x: 220, y: 180 }, { x: 476, y: 180 }, { x: 10, y: 90 }, { x: 266, y: 90 },
  { x: 256, y: 160 },
];

/** 1:1 décomp `sBubbleSpriteAnimCmds` (field_weather_effect.c:2348-2358) : 2 frames 8×8. */
const sBubbleSpriteAnimCmds: ReadonlyArray<ReadonlyArray<AnimCmd>> = [
  [ANIMCMD_FRAME(0, 16), ANIMCMD_FRAME(1, 16), ANIMCMD_END],
];

let _bubbleTileStart = -1;
let _bubbleCharData: Uint8Array | null = null;
let _bubbleInit = false;
let _bubbleInitPromise: Promise<void> | null = null;
/** ADAPTATION SUBSTRAT : le décomp détruit les bulles via `gSprites[i].template ==
 *  &sBubbleSpriteTemplate` (les sprites ne portent pas de ref template en TS) → on suit
 *  les bulles créées dans ce set et on détruit celles encore `inUse` (UpdateBubbleSprite
 *  auto-détruit après 120 frames → inUse=false, ignorées). Équivalent fonctionnel 1:1. */
const _bubbleSprites = new Set<DecompSprite>();

/** Préchargement plateforme du sprite sheet bubble (INCBIN compile-time : gWeatherBubbleTiles).
 *  bubble.png = 8×16 (2 tuiles empilées = 2 frames 8×8). Palette = fog (PALTAG_WEATHER). À appeler
 *  avant StartWeather (pattern preloadWeatherFogHorizontalSprites). */
export async function preloadWeatherBubbleSprites(): Promise<void> {
  if (_bubbleInit) return;
  if (_bubbleInitPromise) return _bubbleInitPromise;
  _bubbleInitPromise = (async () => {
    const png = await loadIndexedPngStrict(BUBBLE_PNG, 4);
    _bubbleCharData = png.charData;
    _bubbleInit = true;
  })();
  return _bubbleInitPromise;
}

/** 1:1 décomp `Bubbles_InitVars(void)` (field_weather_effect.c:2302). */
function Bubbles_InitVars(): void {
  FogHorizontal_InitVars();
  if (!gWeatherPtr.bubblesSpritesCreated) {
    // 1:1 : LoadSpriteSheet(&sWeatherBubbleSpriteSheet).
    if (_bubbleCharData === null) {
      console.error('[field_weather_effect] bubble.png non préchargé — appeler preloadWeatherBubbleSprites() avant StartWeather.');
      _bubbleTileStart = 0;
    } else {
      _bubbleTileStart = LoadSpriteSheet({ data: _bubbleCharData, size: _bubbleCharData.length, tag: GFXTAG_BUBBLE });
    }
    gWeatherPtr.bubblesDelayIndex = 0;
    gWeatherPtr.bubblesDelayCounter = sBubbleStartDelays[0];
    gWeatherPtr.bubblesCoordsIndex = 0;
    gWeatherPtr.bubblesSpriteCount = 0;
  }
}

/** 1:1 décomp `Bubbles_InitAll(void)` (field_weather_effect.c:2315). */
function Bubbles_InitAll(): void {
  Bubbles_InitVars();
  while (!gWeatherPtr.weatherGfxLoaded) Bubbles_Main();
}

/** 1:1 décomp `Bubbles_Main(void)` (field_weather_effect.c:2322). */
function Bubbles_Main(): void {
  FogHorizontal_Main();
  if (++gWeatherPtr.bubblesDelayCounter > sBubbleStartDelays[gWeatherPtr.bubblesDelayIndex]) {
    gWeatherPtr.bubblesDelayCounter = 0;
    if (++gWeatherPtr.bubblesDelayIndex > sBubbleStartDelays.length - 1)
      gWeatherPtr.bubblesDelayIndex = 0;

    CreateBubbleSprite(gWeatherPtr.bubblesCoordsIndex);
    if (++gWeatherPtr.bubblesCoordsIndex > sBubbleStartCoords.length - 1)
      gWeatherPtr.bubblesCoordsIndex = 0;
  }
}

/** 1:1 décomp `Bubbles_Finish(void)` (field_weather_effect.c:2337). */
function Bubbles_Finish(): boolean {
  if (!FogHorizontal_Finish()) {
    DestroyBubbleSprites();
    return false;
  }

  return true;
}

// tScrollXCounter=data[0], tScrollXDir=data[1], tCounter=data[2].
/** 1:1 décomp `CreateBubbleSprite(u16 coordsIndex)` (field_weather_effect.c:2375). */
function CreateBubbleSprite(coordsIndex: number): void {
  const rt = _rt();
  const x = sBubbleStartCoords[coordsIndex].x;
  const y = sBubbleStartCoords[coordsIndex].y - rt.gSpriteCoordOffsetY;
  // 1:1 : CreateSpriteAtEnd(&sBubbleSpriteTemplate, x, y, 0).
  const { spriteId } = rt.CreateSpriteAtOam({
    tileId: _bubbleTileStart,
    paletteBank: gWeatherPtr.contrastColorMapSpritePalIndex,
    x, y,
    shape: 0, size: 0,           // SPRITE_SHAPE/SIZE(8x8)
    priority: 1,                 // 1:1 : gSprites[spriteId].oam.priority = 1
    paletteMode: 0, affineMode: 0,
    subpriority: 0,
    fromEnd: true,               // CreateSpriteAtEnd
  });
  if (spriteId !== MAX_SPRITES) {
    const sprite = rt.gSprites[spriteId]!;
    sprite.callback = UpdateBubbleSprite;
    setFieldEffectAnims(sprite, sBubbleSpriteAnimCmds, _bubbleTileStart);
    sprite.coordOffsetEnabled = true;
    sprite.data[0] = 0;   // tScrollXCounter
    sprite.data[1] = 0;   // tScrollXDir
    sprite.data[2] = 0;   // tCounter
    _bubbleSprites.add(sprite);
    gWeatherPtr.bubblesSpriteCount++;
  }
}

/** 1:1 décomp `DestroyBubbleSprites(void)` (field_weather_effect.c:2391). */
function DestroyBubbleSprites(): void {
  if (gWeatherPtr.bubblesSpriteCount) {
    for (const sprite of _bubbleSprites) {
      if (sprite.inUse) DestroySprite(sprite.spriteId);
    }
    _bubbleSprites.clear();

    FreeSpriteTilesByTag(GFXTAG_BUBBLE);
    gWeatherPtr.bubblesSpriteCount = 0;
  }
}

/** 1:1 décomp `UpdateBubbleSprite(struct Sprite *sprite)` (field_weather_effect.c:2408).
 *  tScrollXCounter=data[0] (double-incrément, quirk décomp), tScrollXDir=data[1], tCounter=data[2]. */
function UpdateBubbleSprite(sprite: DecompSprite): void {
  ++sprite.data[0];
  if (++sprite.data[0] > 8) { // double increment
    sprite.data[0] = 0;
    if (sprite.data[1] === 0) {
      if (++sprite.x2 > 4) sprite.data[1] = 1;
    } else {
      if (--sprite.x2 <= 0) sprite.data[1] = 0;
    }
  }

  sprite.y -= 3;
  if (++sprite.data[2] >= 120) {
    _bubbleSprites.delete(sprite);
    DestroySprite(sprite.spriteId);
  }
}

// 1:1 décomp sWeatherFuncs (field_weather.c) :
//   [WEATHER_UNDERWATER_BUBBLES] = {Bubbles_InitVars, Bubbles_Main, Bubbles_InitAll, Bubbles_Finish}
_registerWeatherFuncs(WEATHER_UNDERWATER_BUBBLES, {
  initVars: Bubbles_InitVars,
  main: Bubbles_Main,
  initAll: Bubbles_InitAll,
  finish: Bubbles_Finish,
});

// ════════════════════════════════════════════════════════════════════════════
//  WEATHER_DROUGHT (field_weather_effect.c:228-352)
//  Sécheresse de Groudon : AUCUN sprite. Cycle de LUMINOSITÉ des palettes (drought0-5.bin)
//  piloté par le framework (Reset/LoadDroughtWeatherPalettes + DroughtState* de
//  field_weather.ts). StartDroughtWeatherBlend = flash BLDY (éclaircissement) via une Task.
// ════════════════════════════════════════════════════════════════════════════

// WININ (io_reg.h) — mêmes valeurs que battle_intro.ts (constantes _EXPR non matérialisées).
const WININ_WIN0_ALL = 0x3F;   // WININ_WIN0_BG_ALL | WININ_WIN0_OBJ | WININ_WIN0_CLR
const WININ_WIN1_ALL = 0x3F00; // (WININ_WIN0_BG_ALL << 8) | WININ_WIN1_OBJ | WININ_WIN1_CLR

/** 1:1 décomp `Drought_InitVars(void)` (field_weather_effect.c:234). */
function Drought_InitVars(): void {
  gWeatherPtr.initStep = 0;
  gWeatherPtr.weatherGfxLoaded = 0;
  gWeatherPtr.targetColorMapIndex = 0;
  gWeatherPtr.colorMapStepDelay = 0;
}

/** 1:1 décomp `Drought_InitAll(void)` (field_weather_effect.c:242). */
function Drought_InitAll(): void {
  Drought_InitVars();
  while (gWeatherPtr.weatherGfxLoaded === 0) Drought_Main();
}

/** 1:1 décomp `Drought_Main(void)` (field_weather_effect.c:249). */
function Drought_Main(): void {
  switch (gWeatherPtr.initStep) {
    case 0:
      if (gWeatherPtr.palProcessingState !== WEATHER_PAL_STATE_CHANGING_WEATHER)
        gWeatherPtr.initStep++;
      break;
    case 1:
      ResetDroughtWeatherPaletteLoading();
      gWeatherPtr.initStep++;
      break;
    case 2:
      if (LoadDroughtWeatherPalettes() === false) gWeatherPtr.initStep++;
      break;
    case 3:
      DroughtStateInit();
      gWeatherPtr.initStep++;
      break;
    case 4:
      DroughtStateRun();
      if (gWeatherPtr.droughtBrightnessStage === 6) {
        gWeatherPtr.weatherGfxLoaded = 1;
        gWeatherPtr.initStep++;
      }
      break;
    default:
      DroughtStateRun();
      break;
  }
}

/** 1:1 décomp `Drought_Finish(void)` (field_weather_effect.c:283). */
function Drought_Finish(): boolean {
  return false;
}

/** 1:1 décomp `StartDroughtWeatherBlend(void)` (field_weather_effect.c:288). */
export function StartDroughtWeatherBlend(): void {
  CreateTask(UpdateDroughtBlend, 80);
}

// tState=data[0], tBlendY=data[1], tBlendDelay=data[2], tWinRange=data[3].
/** 1:1 décomp `UpdateDroughtBlend(u8 taskId)` (field_weather_effect.c:298). */
function UpdateDroughtBlend(task: DecompTask): void {
  const data = task.data;

  switch (data[0]) {
    case 0:
      data[1] = 0;
      data[2] = 0;
      data[3] = GetGpuReg(REG_OFFSET_WININ);
      SetGpuReg(REG_OFFSET_WININ, WININ_WIN0_ALL | WININ_WIN1_ALL);
      SetGpuReg(REG_OFFSET_BLDCNT, BLDCNT_TGT1_BG1 | BLDCNT_TGT1_BG2 | BLDCNT_TGT1_BG3 | BLDCNT_TGT1_OBJ | BLDCNT_EFFECT_LIGHTEN);
      SetGpuReg(REG_OFFSET_BLDY, 0);
      data[0]++;
    // fall through
    case 1:
      data[1] += 3;
      if (data[1] > 16) data[1] = 16;
      SetGpuReg(REG_OFFSET_BLDY, data[1]);
      if (data[1] >= 16) data[0]++;
      break;
    case 2:
      data[2]++;
      if (data[2] > 9) {
        data[2] = 0;
        data[1]--;
        if (data[1] <= 0) {
          data[1] = 0;
          data[0]++;
        }
        SetGpuReg(REG_OFFSET_BLDY, data[1]);
      }
      break;
    case 3:
      SetGpuReg(REG_OFFSET_BLDCNT, 0);
      SetGpuReg(REG_OFFSET_BLDY, 0);
      SetGpuReg(REG_OFFSET_WININ, data[3]);
      data[0]++;
      break;
    case 4:
      ScriptContext_Enable();
      DestroyTask(task.taskId);
      break;
  }
}

// 1:1 décomp sWeatherFuncs (field_weather.c) :
//   [WEATHER_DROUGHT] = {Drought_InitVars, Drought_Main, Drought_InitAll, Drought_Finish}
_registerWeatherFuncs(WEATHER_DROUGHT, {
  initVars: Drought_InitVars,
  main: Drought_Main,
  initAll: Drought_InitAll,
  finish: Drought_Finish,
});
