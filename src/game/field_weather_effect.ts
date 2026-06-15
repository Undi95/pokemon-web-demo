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
 *   ✅ C3 : WEATHER_SUNNY + WEATHER_SHADE (color-map only).
 *   ⏳ C3+ : Clouds/Rain/Snow/Thunderstorm/FogHorizontal/FogDiagonal/Sandstorm/
 *      Bubbles/Drought.
 *
 * ⚠️ AUDIO SKIP (exception projet) : aucun PlaySE.
 */

import type { DecompTask, DecompSprite, DecompRuntime } from '../engine/system/decomp-runtime';
import {
  getRuntime,
  FuncIsActiveTask,
  FindTaskIdByFunc,
  BLDALPHA_BLEND,
  FreeSpriteTilesByTag,
} from '../engine/system/decomp-globals';
import { CreateTask, DestroyTask, SetGpuReg, DestroySprite } from '../engine/system/decomp-bridge';
import { REG_OFFSET_BLDALPHA, DISPLAY_WIDTH } from '../engine/system/decomp-runtime';
import { LoadSpriteSheet } from '../engine/system/sprite';
import { loadIndexedPngStrict } from '../engine/gba/png-loader';
import { setFieldEffectAnims } from './field_effect_helpers';
import { ANIMCMD_FRAME, ANIMCMD_JUMP, type AnimCmd } from '../engine/system/sprite-animation';
import { gSaveBlock1Ptr } from '../engine/save/save-block-state';
import { gMapHeader } from '../engine/field/map-loader';
import * as WeatherConstants from '../engine/decomp-data/include/constants/weather-data';
import { IncrementGameStat } from '../engine/field/player-avatar';
import { GAME_STAT_GOT_RAINED_ON } from '../engine/decomp-data/include/constants/game_stat-data';
import {
  gWeatherPtr,
  GFXTAG_ASH,
  Weather_SetBlendCoeffs,
  Weather_SetTargetBlendCoeffs,
  Weather_UpdateBlend,
  SetNextWeather,
  SetCurrentAndNextWeather,
  _registerWeatherFuncs,
} from './field_weather';

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
  const data = _rt().gTasks.get(taskId)!.data;

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
        const sprite = rt.gSprites.get(spriteId)!;
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
      if (s !== null) DestroySprite(s);
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
