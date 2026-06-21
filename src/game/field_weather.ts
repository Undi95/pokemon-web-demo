/**
 * field_weather.ts — Port 1:1 STRICT (MIROIR) de `src/field_weather.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/field_weather.c` (1105 l)
 * + `include/field_weather.h` (struct Weather) + `include/constants/field_weather.h`.
 *
 * Ce fichier = le FRAMEWORK météo overworld :
 *   - `gWeather` / `gWeatherPtr` (struct Weather, l'état global de la météo).
 *   - `StartWeather` : crée la task `Task_WeatherInit` (prio 80) + alloue la palette
 *     météo + `BuildColorMaps`. Appelé à l'init de map (overworld.c:2146 ResumeMap).
 *   - `Task_WeatherInit` → `Task_WeatherMain` : la state-machine qui tick chaque
 *     frame (via RunTasks) et dispatch `sWeatherFuncs[currWeather].{initVars,main,
 *     initAll,finish}` + `gWeatherPalStateFuncs[palProcessingState]()`.
 *   - Le MOTEUR de COLOR MAP : `BuildColorMaps` (calcule 2×19 LUT brightness/
 *     contraste), `ApplyColorMap` (mappe gPlttBufferUnfaded → gPlttBufferFaded via
 *     la LUT), `UpdateWeatherColorMap` (transition graduelle), `FadeInScreenWithWeather`.
 *   - Le BLEND coeffs (BLDALPHA hardware) : `Weather_SetBlendCoeffs` /
 *     `Weather_SetTargetBlendCoeffs` / `Weather_UpdateBlend`.
 *
 * Les EFFETS par-météo (Ash_*, Rain_*, etc.) + les fonctions control (SetWeather,
 * DoCurrentWeather, ResumePausedWeather…) vivent dans `field_weather_effect.ts`
 * (miroir de field_weather_effect.c). La table `sWeatherFuncs` les référence.
 *
 * ⚠️ AUDIO SKIP (exception projet) : `SetRainStrengthFromSoundEffect` /
 * `PlayRainStoppingSoundEffect` portent leur logique d'état mais omettent les
 * `PlaySE`/`IsSpecialSEPlaying` (comme PlaySE partout).
 *
 * État staged (1 mécanisme = 1 commit, A/B chacun) :
 *   ✅ C1 (ce commit) : framework + moteur color-map. sWeatherFuncs = NONE seul
 *      (les autres météos s'ajoutent à la table au fur et à mesure de leur port).
 *   ⏳ C2 : effet Ash (field_weather_effect.ts) + A/B Route 113.
 *   ⏳ C3+ : autres météos. C-final : câblage StartWeather/doweather global.
 */

import type { DecompTask } from '../engine/system/decomp-runtime';
import {
  getRuntime,
  FuncIsActiveTask,
  BlendPalette,
  BLDALPHA_BLEND,
  PALETTES_ALL,
  PLTT_SIZE,
} from '../engine/system/decomp-globals';
import { CreateTask, SetGpuReg, BeginNormalPaletteFade, PLTT_ID, RGB2 } from '../engine/system/decomp-bridge';
import { OBJ_PLTT_ID, BG_PLTT_ID, REG_OFFSET_BLDALPHA, DISPLAY_WIDTH } from '../engine/system/decomp-runtime';
import { RGB, RGB_BLACK, RGB_WHITEALPHA, PLTT_SIZE_4BPP } from '../engine/system/decomp-helpers';
import { AllocSpritePalette, sSpritePaletteTags } from './sprite';
import { gSineTable } from './trig';
import { loadGbaPal } from '../engine/gba/png-loader';

// ════════════════════════════════════════════════════════════════════════════
//  Constantes (include/field_weather.h + include/constants/field_weather.h)
// ════════════════════════════════════════════════════════════════════════════

// constants/weather.h — id des météos (référencés par la table sWeatherFuncs).
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

// constants/field_weather.h
export const NUM_WEATHER_COLOR_MAPS = 19;
export const WEATHER_PAL_STATE_CHANGING_WEATHER = 0;
export const WEATHER_PAL_STATE_SCREEN_FADING_IN = 1;
export const WEATHER_PAL_STATE_SCREEN_FADING_OUT = 2;
export const WEATHER_PAL_STATE_IDLE = 3;
export const FADE_FROM_BLACK = 0;
export const FADE_TO_BLACK = 1;
export const FADE_FROM_WHITE = 2;
export const FADE_TO_WHITE = 3;

// field_weather.h — tags GFX/PAL des sprites météo (TAG_WEATHER_START = 0x1200).
const TAG_WEATHER_START = 0x1200;
export const GFXTAG_CLOUD = TAG_WEATHER_START + 0;
export const GFXTAG_FOG_H = TAG_WEATHER_START + 1;
export const GFXTAG_ASH = TAG_WEATHER_START + 2;
export const GFXTAG_FOG_D = TAG_WEATHER_START + 3;
export const GFXTAG_SANDSTORM = TAG_WEATHER_START + 4;
export const GFXTAG_BUBBLE = TAG_WEATHER_START + 5;
export const GFXTAG_RAIN = TAG_WEATHER_START + 6;
export const PALTAG_WEATHER = TAG_WEATHER_START + 0;
export const PALTAG_WEATHER_2 = TAG_WEATHER_START + 1;

// field_weather.c — enum local des types de color map.
const COLOR_MAP_NONE = 0;
const COLOR_MAP_DARK_CONTRAST = 1;
const COLOR_MAP_CONTRAST = 2;

// ════════════════════════════════════════════════════════════════════════════
//  Accès palette 1:1 (= rt().gPlttBuffer{Faded,Unfaded}, comme BlendPalette).
//  Le décomp fait `gPlttBufferFaded[i] = v` / `gPlttBufferUnfaded[i]` ; nos buffers
//  exposent .get/.set (PaletteBuffer). On wrappe pour rester lisible.
// ════════════════════════════════════════════════════════════════════════════

const _rt = () => getRuntime();
const gPlttBufferUnfaded = {
  get: (i: number): number => _rt().gPlttBufferUnfaded.get(i),
};
const gPlttBufferFaded = {
  get: (i: number): number => _rt().gPlttBufferFaded.get(i),
  set: (i: number, v: number): void => _rt().gPlttBufferFaded.set(i, v & 0xFFFF),
};

// ════════════════════════════════════════════════════════════════════════════
//  struct Weather (field_weather.h:24) — état global de la météo.
//  Tous les champs 1:1 (init 0 / arrays). Les pools de sprites de l'union sprites
//  sont modélisés à plat (s1/s2) pour matcher `gWeatherPtr->sprites.s2.ashSprites[i]`.
// ════════════════════════════════════════════════════════════════════════════

export interface Weather {
  sprites: {
    s1: { rainSprites: unknown[]; snowflakeSprites: unknown[]; cloudSprites: unknown[] };
    s2: {
      fogHSprites: unknown[]; ashSprites: unknown[]; fogDSprites: unknown[];
      sandstormSprites1: unknown[]; sandstormSprites2: unknown[];
    };
  };
  darkenedContrastColorMaps: Uint8Array[]; // [NUM_WEATHER_COLOR_MAPS][32]
  contrastColorMaps: Uint8Array[];         // [NUM_WEATHER_COLOR_MAPS][32]
  colorMapIndex: number;                   // s8
  targetColorMapIndex: number;             // s8
  colorMapStepDelay: number;
  colorMapStepCounter: number;
  fadeDestColor: number;
  palProcessingState: number;
  fadeScreenCounter: number;
  readyForInit: boolean;
  taskId: number;
  fadeInFirstFrame: number;
  fadeInTimer: number;
  initStep: number;
  finishStep: number;
  currWeather: number;
  nextWeather: number;
  weatherGfxLoaded: number;
  weatherChangeComplete: boolean;
  weatherPicSpritePalIndex: number;
  contrastColorMapSpritePalIndex: number;
  // Rain
  rainSpriteVisibleCounter: number;
  curRainSpriteIndex: number;
  targetRainSpriteCount: number;
  rainSpriteCount: number;
  rainSpriteVisibleDelay: number;
  isDownpour: number;
  rainStrength: number;
  cloudSpritesCreated: number;
  // Snow
  snowflakeVisibleCounter: number;
  snowflakeTimer: number;
  snowflakeSpriteCount: number;
  targetSnowflakeSpriteCount: number;
  // Thunderstorm
  thunderTimer: number;
  thunderSETimer: number;
  thunderAllowEnd: boolean;
  thunderLongBolt: boolean;
  thunderShortBolts: number;
  thunderEnqueued: boolean;
  // Horizontal fog
  fogHScrollPosX: number;
  fogHScrollCounter: number;
  fogHScrollOffset: number;
  lightenedFogSpritePals: number[];
  lightenedFogSpritePalsCount: number;
  fogHSpritesCreated: number;
  // Ash
  ashBaseSpritesX: number;
  ashUnused: number;
  ashSpritesCreated: number;
  // Sandstorm
  sandstormXOffset: number;
  sandstormYOffset: number;
  sandstormUnused: number;
  sandstormBaseSpritesX: number;
  sandstormPosY: number;
  sandstormWaveIndex: number;
  sandstormWaveCounter: number;
  sandstormSpritesCreated: number;
  sandstormSwirlSpritesCreated: number;
  // Diagonal fog
  fogDBaseSpritesX: number;
  fogDPosY: number;
  fogDScrollXCounter: number;
  fogDScrollYCounter: number;
  fogDXOffset: number;
  fogDYOffset: number;
  fogDSpritesCreated: number;
  // Bubbles
  bubblesDelayCounter: number;
  bubblesDelayIndex: number;
  bubblesCoordsIndex: number;
  bubblesSpriteCount: number;
  bubblesSpritesCreated: number;
  // Blend
  currBlendEVA: number;
  currBlendEVB: number;
  targetBlendEVA: number;
  targetBlendEVB: number;
  blendUpdateCounter: number;
  blendFrameCounter: number;
  blendDelay: number;
  // Drought
  droughtBrightnessStage: number;
  droughtLastBrightnessStage: number;
  droughtTimer: number;
  droughtState: number;
  loadDroughtPalsIndex: number;
  loadDroughtPalsOffset: number;
}

function _makeWeather(): Weather {
  return {
    sprites: {
      s1: { rainSprites: [], snowflakeSprites: [], cloudSprites: [] },
      s2: { fogHSprites: [], ashSprites: [], fogDSprites: [], sandstormSprites1: [], sandstormSprites2: [] },
    },
    darkenedContrastColorMaps: Array.from({ length: NUM_WEATHER_COLOR_MAPS }, () => new Uint8Array(32)),
    contrastColorMaps: Array.from({ length: NUM_WEATHER_COLOR_MAPS }, () => new Uint8Array(32)),
    colorMapIndex: 0, targetColorMapIndex: 0, colorMapStepDelay: 0, colorMapStepCounter: 0,
    fadeDestColor: 0, palProcessingState: 0, fadeScreenCounter: 0, readyForInit: false, taskId: 0,
    fadeInFirstFrame: 0, fadeInTimer: 0, initStep: 0, finishStep: 0, currWeather: 0, nextWeather: 0,
    weatherGfxLoaded: 0, weatherChangeComplete: false, weatherPicSpritePalIndex: 0, contrastColorMapSpritePalIndex: 0,
    rainSpriteVisibleCounter: 0, curRainSpriteIndex: 0, targetRainSpriteCount: 0, rainSpriteCount: 0,
    rainSpriteVisibleDelay: 0, isDownpour: 0, rainStrength: 0, cloudSpritesCreated: 0,
    snowflakeVisibleCounter: 0, snowflakeTimer: 0, snowflakeSpriteCount: 0, targetSnowflakeSpriteCount: 0,
    thunderTimer: 0, thunderSETimer: 0, thunderAllowEnd: false, thunderLongBolt: false, thunderShortBolts: 0, thunderEnqueued: false,
    fogHScrollPosX: 0, fogHScrollCounter: 0, fogHScrollOffset: 0, lightenedFogSpritePals: [0, 0, 0, 0, 0, 0], lightenedFogSpritePalsCount: 0, fogHSpritesCreated: 0,
    ashBaseSpritesX: 0, ashUnused: 0, ashSpritesCreated: 0,
    sandstormXOffset: 0, sandstormYOffset: 0, sandstormUnused: 0, sandstormBaseSpritesX: 0, sandstormPosY: 0, sandstormWaveIndex: 0, sandstormWaveCounter: 0, sandstormSpritesCreated: 0, sandstormSwirlSpritesCreated: 0,
    fogDBaseSpritesX: 0, fogDPosY: 0, fogDScrollXCounter: 0, fogDScrollYCounter: 0, fogDXOffset: 0, fogDYOffset: 0, fogDSpritesCreated: 0,
    bubblesDelayCounter: 0, bubblesDelayIndex: 0, bubblesCoordsIndex: 0, bubblesSpriteCount: 0, bubblesSpritesCreated: 0,
    currBlendEVA: 0, currBlendEVB: 0, targetBlendEVA: 0, targetBlendEVB: 0, blendUpdateCounter: 0, blendFrameCounter: 0, blendDelay: 0,
    droughtBrightnessStage: 0, droughtLastBrightnessStage: 0, droughtTimer: 0, droughtState: 0, loadDroughtPalsIndex: 0, loadDroughtPalsOffset: 0,
  };
}

/** 1:1 décomp `EWRAM_DATA struct Weather gWeather = {0}` (field_weather.c:63). */
export const gWeather: Weather = _makeWeather();
/** 1:1 décomp `struct Weather *const gWeatherPtr = &gWeather` (field_weather.c:83).
 *  En JS : même référence d'objet (pas de pointeur séparé). */
export const gWeatherPtr: Weather = gWeather;

// field_weather.c:64-66 — tables de type de color map par palette.
let sPaletteColorMapTypes: ReadonlyArray<number>;
const sFieldEffectPaletteColorMapTypes = new Uint8Array(32);

/** 1:1 décomp `sDroughtWeatherColors[6][0x1000]` (field_weather.c:70) — LUT précalculées
 *  pour la météo Drought (INCBIN colors_0..5.bin). Chargées paresseusement quand l'effet
 *  Drought est porté (C3+) ; non exercé en C1/C2. */
const sDroughtWeatherColors: Uint16Array[] = [];

/** 1:1 macro `DROUGHT_COLOR_INDEX(color)` (field_weather.c:20). */
function DROUGHT_COLOR_INDEX(color: number): number {
  return (((color >> 1) & 0xF) | ((color >> 2) & 0xF0) | ((color >> 3) & 0xF00));
}

// ════════════════════════════════════════════════════════════════════════════
//  Tables de dispatch (field_weather.c:85-150)
// ════════════════════════════════════════════════════════════════════════════

interface WeatherCallbacks {
  initVars: () => void;
  main: () => void;
  initAll: () => void;
  finish: () => boolean | number;
}

/** 1:1 décomp `sWeatherFuncs[]` (field_weather.c:85). Référence les callbacks par-météo.
 *  ⚠️ STAGED : seules les météos PORTÉES sont présentes (table dense visée en fin de
 *  chantier). En C1 : WEATHER_NONE seul. Chaque port de météo ajoute son entrée.
 *  (Pas de Dummy : une météo absente = pas encore portée ET pas encore atteignable —
 *  le câblage global StartWeather/doweather est différé à C-final.) */
const sWeatherFuncs: Record<number, WeatherCallbacks> = {
  [WEATHER_NONE]: { initVars: None_Init, main: None_Main, initAll: None_Init, finish: None_Finish },
};

/** Enregistre les callbacks d'une météo dans `sWeatherFuncs` (utilisé par
 *  field_weather_effect.ts pour brancher chaque météo au fur et à mesure de son port).
 *  Recompose 1:1 la table dense de la décomp à mesure que les effets sont portés. */
export function _registerWeatherFuncs(weather: number, cb: WeatherCallbacks): void {
  sWeatherFuncs[weather] = cb;
}

/** 1:1 décomp `gWeatherPalStateFuncs[]` (field_weather.c:104). */
const gWeatherPalStateFuncs: Array<() => void> = [];
gWeatherPalStateFuncs[WEATHER_PAL_STATE_CHANGING_WEATHER] = UpdateWeatherColorMap;
gWeatherPalStateFuncs[WEATHER_PAL_STATE_SCREEN_FADING_IN] = FadeInScreenWithWeather;
gWeatherPalStateFuncs[WEATHER_PAL_STATE_SCREEN_FADING_OUT] = DoNothing;
gWeatherPalStateFuncs[WEATHER_PAL_STATE_IDLE] = DoNothing;

/** 1:1 décomp `IsFirstFrameOfWeatherFadeIn` (field_weather.c:853-859).
 *  `static UNUSED` — dead-code non référencé ; porté pour le miroir intégral. */
function IsFirstFrameOfWeatherFadeIn(): boolean {
  if (gWeatherPtr.palProcessingState === WEATHER_PAL_STATE_SCREEN_FADING_IN)
    return gWeatherPtr.fadeInFirstFrame !== 0;
  else
    return false;
}

/** 1:1 décomp `sBasePaletteColorMapTypes[32]` (field_weather.c:114) — quel color map
 *  appliquer à chaque palette BG (0-15) et OBJ (16-31). */
const sBasePaletteColorMapTypes: ReadonlyArray<number> = [
  // background palettes
  COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST,
  COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST,
  COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST,
  COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST, COLOR_MAP_NONE, COLOR_MAP_NONE,
  // sprite palettes
  COLOR_MAP_CONTRAST, COLOR_MAP_DARK_CONTRAST, COLOR_MAP_CONTRAST, COLOR_MAP_CONTRAST,
  COLOR_MAP_CONTRAST, COLOR_MAP_CONTRAST, COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST,
  COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST, COLOR_MAP_CONTRAST, COLOR_MAP_DARK_CONTRAST,
  COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST, COLOR_MAP_DARK_CONTRAST,
];

/** 1:1 décomp `gFogPalette[]` (field_weather.c:152, INCGFX fog.pal). Chargé async. */
let gFogPalette: Uint16Array = new Uint16Array(16);
let _fogPaletteLoaded = false;
const FOG_PAL = '/decomp/em/weather/fog.pal';

/** Préchargement plateforme de la palette fog (le décomp l'a en INCBIN compile-time).
 *  À appeler avant StartWeather (sinon la palette météo est noire jusqu'au load). */
export async function preloadWeatherFogPalette(): Promise<void> {
  if (_fogPaletteLoaded) return;
  try {
    gFogPalette = await loadGbaPal(FOG_PAL);
    _fogPaletteLoaded = true;
  } catch (e) {
    console.warn('[field_weather] fog.pal load failed', e);
  }
}

// ════════════════════════════════════════════════════════════════════════════
//  StartWeather + state-machine (field_weather.c:154-263)
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `StartWeather(void)` (field_weather.c:154). */
export function StartWeather(): void {
  if (!FuncIsActiveTask(Task_WeatherMain)) {
    const index = AllocSpritePalette(PALTAG_WEATHER);
    // 1:1 : CpuCopy32(gFogPalette, &gPlttBufferUnfaded[OBJ_PLTT_ID(index)], PLTT_SIZE_4BPP).
    const dst = OBJ_PLTT_ID(index);
    for (let i = 0; i < 16; i++) _rt().gPlttBufferUnfaded.set(dst + i, gFogPalette[i] ?? 0);
    BuildColorMaps();
    gWeatherPtr.contrastColorMapSpritePalIndex = index;
    gWeatherPtr.weatherPicSpritePalIndex = AllocSpritePalette(PALTAG_WEATHER_2);
    gWeatherPtr.rainSpriteCount = 0;
    gWeatherPtr.curRainSpriteIndex = 0;
    gWeatherPtr.cloudSpritesCreated = 0;
    gWeatherPtr.snowflakeSpriteCount = 0;
    gWeatherPtr.ashSpritesCreated = 0;
    gWeatherPtr.fogHSpritesCreated = 0;
    gWeatherPtr.fogDSpritesCreated = 0;
    gWeatherPtr.sandstormSpritesCreated = 0;
    gWeatherPtr.sandstormSwirlSpritesCreated = 0;
    gWeatherPtr.bubblesSpritesCreated = 0;
    gWeatherPtr.lightenedFogSpritePalsCount = 0;
    Weather_SetBlendCoeffs(16, 0);
    gWeatherPtr.currWeather = 0;
    gWeatherPtr.palProcessingState = WEATHER_PAL_STATE_IDLE;
    gWeatherPtr.readyForInit = false;
    gWeatherPtr.weatherChangeComplete = true;
    gWeatherPtr.taskId = CreateTask(Task_WeatherInit, 80);
  } else {
    // WARP / re-load de map (la task météo PERSISTE → le bloc d'init ci-dessus est skippé,
    // 1:1 décomp). MAIS le map-load (InitPlayerAvatar → FreeAllSpritePalettes) a libéré le slot
    // palette météo → il faut le RÉ-ÉTABLIR : re-copie gFogPalette dans le slot (contrast
    // ColorMapSpritePalIndex, persistant) + RE-MARQUE son tag pour que les object events /
    // field-effects ne le reprennent pas. Sans ça, la météo pointe une palette d'objet/herbe
    // résiduelle → fog rend ROSE sur les warps (le 1er load marche). Adaptation 1:1 du
    // mécanisme PreservePalettesInWeather décomp (palette météo préservée entre maps).
    const index = gWeatherPtr.contrastColorMapSpritePalIndex;
    const dst = OBJ_PLTT_ID(index);
    for (let i = 0; i < 16; i++) _rt().gPlttBufferUnfaded.set(dst + i, gFogPalette[i] ?? 0);
    sSpritePaletteTags[index] = PALTAG_WEATHER & 0xFFFF;
    const idx2 = gWeatherPtr.weatherPicSpritePalIndex;
    if (idx2 >= 0 && idx2 < 16) sSpritePaletteTags[idx2] = PALTAG_WEATHER_2 & 0xFFFF;
  }
}

/** 1:1 décomp `SetNextWeather(u8 weather)` (field_weather.c:183). */
export function SetNextWeather(weather: number): void {
  if (weather !== WEATHER_RAIN && weather !== WEATHER_RAIN_THUNDERSTORM && weather !== WEATHER_DOWNPOUR) {
    PlayRainStoppingSoundEffect();
  }

  if (gWeatherPtr.nextWeather !== weather && gWeatherPtr.currWeather === weather) {
    sWeatherFuncs[weather]?.initVars();
  }

  gWeatherPtr.weatherChangeComplete = false;
  gWeatherPtr.nextWeather = weather;
  gWeatherPtr.finishStep = 0;
}

/** 1:1 décomp `SetCurrentAndNextWeather(u8 weather)` (field_weather.c:200). */
export function SetCurrentAndNextWeather(weather: number): void {
  PlayRainStoppingSoundEffect();
  gWeatherPtr.currWeather = weather;
  gWeatherPtr.nextWeather = weather;
}

/** 1:1 décomp `SetCurrentAndNextWeatherNoDelay(u8 weather)` (field_weather.c:207). */
export function SetCurrentAndNextWeatherNoDelay(weather: number): void {
  PlayRainStoppingSoundEffect();
  gWeatherPtr.currWeather = weather;
  gWeatherPtr.nextWeather = weather;
  // Overrides the normal delay during screen fading.
  gWeatherPtr.readyForInit = true;
}

/** 1:1 décomp `Task_WeatherInit(u8 taskId)` (field_weather.c:216). */
function Task_WeatherInit(task: DecompTask): void {
  // Waits until it's ok to initialize weather.
  // When the screen fades in, this is set to TRUE.
  if (gWeatherPtr.readyForInit) {
    sWeatherFuncs[gWeatherPtr.currWeather]?.initAll();
    _rt().gTasks.get(task.taskId)!.func = Task_WeatherMain;
  }
}

/** 1:1 décomp `Task_WeatherMain(u8 taskId)` (field_weather.c:227). */
function Task_WeatherMain(_task: DecompTask): void {
  if (gWeatherPtr.currWeather !== gWeatherPtr.nextWeather) {
    if (!sWeatherFuncs[gWeatherPtr.currWeather]?.finish()
        && gWeatherPtr.palProcessingState !== WEATHER_PAL_STATE_SCREEN_FADING_OUT) {
      // Finished cleaning up previous weather. Now transition to next weather.
      sWeatherFuncs[gWeatherPtr.nextWeather]?.initVars();
      gWeatherPtr.colorMapStepCounter = 0;
      gWeatherPtr.palProcessingState = WEATHER_PAL_STATE_CHANGING_WEATHER;
      gWeatherPtr.currWeather = gWeatherPtr.nextWeather;
      gWeatherPtr.weatherChangeComplete = true;
    }
  } else {
    sWeatherFuncs[gWeatherPtr.currWeather]?.main();
  }

  gWeatherPalStateFuncs[gWeatherPtr.palProcessingState]();
}

/** 1:1 décomp `None_Init(void)` (field_weather.c:250). */
function None_Init(): void {
  gWeatherPtr.targetColorMapIndex = 0;
  gWeatherPtr.colorMapStepDelay = 0;
}

/** 1:1 décomp `None_Main(void)` (field_weather.c:256). */
function None_Main(): void {
}

/** 1:1 décomp `None_Finish(void)` (field_weather.c:260). */
function None_Finish(): number {
  return 0;
}

// ════════════════════════════════════════════════════════════════════════════
//  Color maps (field_weather.c:271-451)
// ════════════════════════════════════════════════════════════════════════════

/** 1:1 décomp `BuildColorMaps(void)` (field_weather.c:271). Calcule les 2×19 LUT
 *  brightness/contraste utilisées pour transformer les palettes (color map). */
function BuildColorMaps(): void {
  let colorMaps: Uint8Array[];

  sPaletteColorMapTypes = sBasePaletteColorMapTypes;
  for (let i = 0; i < 2; i++) {
    if (i === 0) colorMaps = gWeatherPtr.darkenedContrastColorMaps;
    else colorMaps = gWeatherPtr.contrastColorMaps;

    for (let colorVal = 0; colorVal < 32; colorVal++) {
      let curBrightness = colorVal << 8;
      let brightnessDelta: number;
      if (i === 0) brightnessDelta = (colorVal << 8) / 16;
      else brightnessDelta = 0;

      // First three color mappings are simple brightness modifiers which are
      // progressively darker, according to brightnessDelta.
      let colorMapIndex: number;
      for (colorMapIndex = 0; colorMapIndex < 3; colorMapIndex++) {
        curBrightness -= brightnessDelta;
        colorMaps[colorMapIndex][colorVal] = curBrightness >> 8;
      }

      const baseBrightness = curBrightness;
      brightnessDelta = ((0x1f00 - curBrightness) / (NUM_WEATHER_COLOR_MAPS - 3)) | 0;
      if (colorVal < 12) {
        // For shadows (color values < 12), the remaining color mappings are
        // brightness modifiers, increased at a significantly lower rate than the
        // midtones and highlights. This creates a high contrast effect (thunderstorm).
        for (; colorMapIndex < NUM_WEATHER_COLOR_MAPS; colorMapIndex++) {
          curBrightness += brightnessDelta;
          const diff = curBrightness - baseBrightness;
          if (diff > 0) curBrightness -= (diff / 2) | 0;
          colorMaps[colorMapIndex][colorVal] = curBrightness >> 8;
          if (colorMaps[colorMapIndex][colorVal] > 31) colorMaps[colorMapIndex][colorVal] = 31;
        }
      } else {
        // For midtones and highlights (>= 12), simple brightness modifiers,
        // progressively brighter, hitting exactly 31 at the last mapping.
        for (; colorMapIndex < NUM_WEATHER_COLOR_MAPS; colorMapIndex++) {
          curBrightness += brightnessDelta;
          colorMaps[colorMapIndex][colorVal] = curBrightness >> 8;
          if (colorMaps[colorMapIndex][colorVal] > 31) colorMaps[colorMapIndex][colorVal] = 31;
        }
      }
    }
  }
}

/** 1:1 décomp `UpdateWeatherColorMap(void)` (field_weather.c:344). */
function UpdateWeatherColorMap(): void {
  if (gWeatherPtr.palProcessingState !== WEATHER_PAL_STATE_SCREEN_FADING_OUT) {
    if (gWeatherPtr.colorMapIndex === gWeatherPtr.targetColorMapIndex) {
      gWeatherPtr.palProcessingState = WEATHER_PAL_STATE_IDLE;
    } else {
      if (++gWeatherPtr.colorMapStepCounter >= gWeatherPtr.colorMapStepDelay) {
        gWeatherPtr.colorMapStepCounter = 0;
        if (gWeatherPtr.colorMapIndex < gWeatherPtr.targetColorMapIndex) gWeatherPtr.colorMapIndex++;
        else gWeatherPtr.colorMapIndex--;

        ApplyColorMap(0, 32, gWeatherPtr.colorMapIndex);
      }
    }
  }
}

/** 1:1 décomp `FadeInScreenWithWeather(void)` (field_weather.c:368). */
function FadeInScreenWithWeather(): void {
  if (++gWeatherPtr.fadeInTimer > 1) gWeatherPtr.fadeInFirstFrame = 0;

  switch (gWeatherPtr.currWeather) {
    case WEATHER_RAIN:
    case WEATHER_RAIN_THUNDERSTORM:
    case WEATHER_DOWNPOUR:
    case WEATHER_SNOW:
    case WEATHER_SHADE:
      if (FadeInScreen_RainShowShade() === false) {
        gWeatherPtr.colorMapIndex = 3;
        gWeatherPtr.palProcessingState = WEATHER_PAL_STATE_IDLE;
      }
      break;
    case WEATHER_DROUGHT:
      if (FadeInScreen_Drought() === false) {
        gWeatherPtr.colorMapIndex = -6;
        gWeatherPtr.palProcessingState = WEATHER_PAL_STATE_IDLE;
      }
      break;
    case WEATHER_FOG_HORIZONTAL:
      if (FadeInScreen_FogHorizontal() === false) {
        gWeatherPtr.colorMapIndex = 0;
        gWeatherPtr.palProcessingState = WEATHER_PAL_STATE_IDLE;
      }
      break;
    case WEATHER_VOLCANIC_ASH:
    case WEATHER_SANDSTORM:
    case WEATHER_FOG_DIAGONAL:
    case WEATHER_UNDERWATER:
    default:
      if (!_rt().gPaletteFade.active) {
        gWeatherPtr.colorMapIndex = gWeatherPtr.targetColorMapIndex;
        gWeatherPtr.palProcessingState = WEATHER_PAL_STATE_IDLE;
      }
      break;
  }
}

/** 1:1 décomp `FadeInScreen_RainShowShade(void)` (field_weather.c:414). */
function FadeInScreen_RainShowShade(): boolean {
  if (gWeatherPtr.fadeScreenCounter === 16) return false;

  if (++gWeatherPtr.fadeScreenCounter >= 16) {
    ApplyColorMap(0, 32, 3);
    gWeatherPtr.fadeScreenCounter = 16;
    return false;
  }

  ApplyColorMapWithBlend(0, 32, 3, 16 - gWeatherPtr.fadeScreenCounter, gWeatherPtr.fadeDestColor);
  return true;
}

/** 1:1 décomp `FadeInScreen_Drought(void)` (field_weather.c:430). */
function FadeInScreen_Drought(): boolean {
  if (gWeatherPtr.fadeScreenCounter === 16) return false;

  if (++gWeatherPtr.fadeScreenCounter >= 16) {
    ApplyColorMap(0, 32, -6);
    gWeatherPtr.fadeScreenCounter = 16;
    return false;
  }

  ApplyDroughtColorMapWithBlend(-6, 16 - gWeatherPtr.fadeScreenCounter, gWeatherPtr.fadeDestColor);
  return true;
}

/** 1:1 décomp `FadeInScreen_FogHorizontal(void)` (field_weather.c:446). */
function FadeInScreen_FogHorizontal(): boolean {
  if (gWeatherPtr.fadeScreenCounter === 16) return false;

  gWeatherPtr.fadeScreenCounter++;
  ApplyFogBlend(16 - gWeatherPtr.fadeScreenCounter, gWeatherPtr.fadeDestColor);
  return true;
}

/** 1:1 décomp `DoNothing(void)` (field_weather.c:456). */
function DoNothing(): void { }

/** 1:1 décomp `ApplyColorMap(u8 startPalIndex, u8 numPalettes, s8 colorMapIndex)`
 *  (field_weather.c:459). Mappe gPlttBufferUnfaded → gPlttBufferFaded via la LUT. */
function ApplyColorMap(startPalIndex: number, numPalettes: number, colorMapIndex: number): void {
  let curPalIndex: number;
  let palOffset: number;
  let colorMap: Uint8Array;
  let i: number;

  if (colorMapIndex > 0) {
    colorMapIndex--;
    palOffset = PLTT_ID(startPalIndex);
    numPalettes += startPalIndex;
    curPalIndex = startPalIndex;

    // Loop through the specified palette range and apply necessary color maps.
    while (curPalIndex < numPalettes) {
      if (sPaletteColorMapTypes[curPalIndex] === COLOR_MAP_NONE) {
        // No palette change.
        for (i = 0; i < 16; i++) gPlttBufferFaded.set(palOffset + i, gPlttBufferUnfaded.get(palOffset + i));
        palOffset += 16;
      } else {
        if (sPaletteColorMapTypes[curPalIndex] === COLOR_MAP_CONTRAST || curPalIndex - 16 === gWeatherPtr.contrastColorMapSpritePalIndex)
          colorMap = gWeatherPtr.contrastColorMaps[colorMapIndex];
        else
          colorMap = gWeatherPtr.darkenedContrastColorMaps[colorMapIndex];

        for (i = 0; i < 16; i++) {
          // Apply color map to the original color.
          const baseColor = gPlttBufferUnfaded.get(palOffset);
          const r = colorMap[baseColor & 0x1F];
          const g = colorMap[(baseColor >> 5) & 0x1F];
          const b = colorMap[(baseColor >> 10) & 0x1F];
          gPlttBufferFaded.set(palOffset, RGB2(r, g, b));
          palOffset++;
        }
      }
      curPalIndex++;
    }
  } else if (colorMapIndex < 0) {
    // A negative colorMapIndex means the blending comes from the Drought weather tables.
    colorMapIndex = -colorMapIndex - 1;
    palOffset = PLTT_ID(startPalIndex);
    numPalettes += startPalIndex;
    curPalIndex = startPalIndex;

    while (curPalIndex < numPalettes) {
      if (sPaletteColorMapTypes[curPalIndex] === COLOR_MAP_NONE) {
        for (i = 0; i < 16; i++) gPlttBufferFaded.set(palOffset + i, gPlttBufferUnfaded.get(palOffset + i));
        palOffset += 16;
      } else {
        for (i = 0; i < 16; i++) {
          gPlttBufferFaded.set(palOffset, sDroughtWeatherColors[colorMapIndex][DROUGHT_COLOR_INDEX(gPlttBufferUnfaded.get(palOffset))]);
          palOffset++;
        }
      }
      curPalIndex++;
    }
  } else {
    // No palette blending.
    const start = PLTT_ID(startPalIndex);
    for (i = 0; i < numPalettes * 16; i++) gPlttBufferFaded.set(start + i, gPlttBufferUnfaded.get(start + i));
  }
}

/** 1:1 décomp `ApplyColorMapWithBlend(u8, u8, s8, u8, u16)` (field_weather.c:540). */
function ApplyColorMapWithBlend(startPalIndex: number, numPalettes: number, colorMapIndex: number, blendCoeff: number, blendColor: number): void {
  let palOffset: number;
  let curPalIndex: number;
  let i: number;
  const rBlend = blendColor & 0x1F;
  const gBlend = (blendColor >> 5) & 0x1F;
  const bBlend = (blendColor >> 10) & 0x1F;

  palOffset = PLTT_ID(startPalIndex);
  numPalettes += startPalIndex;
  colorMapIndex--;
  curPalIndex = startPalIndex;

  while (curPalIndex < numPalettes) {
    if (sPaletteColorMapTypes[curPalIndex] === COLOR_MAP_NONE) {
      // No color map. Simply blend the colors.
      BlendPalette(palOffset, 16, blendCoeff, blendColor);
      palOffset += 16;
    } else {
      let colorMap: Uint8Array;
      if (sPaletteColorMapTypes[curPalIndex] === COLOR_MAP_DARK_CONTRAST)
        colorMap = gWeatherPtr.darkenedContrastColorMaps[colorMapIndex];
      else
        colorMap = gWeatherPtr.contrastColorMaps[colorMapIndex];

      for (i = 0; i < 16; i++) {
        const baseColor = gPlttBufferUnfaded.get(palOffset);
        let r = colorMap[baseColor & 0x1F];
        let g = colorMap[(baseColor >> 5) & 0x1F];
        let b = colorMap[(baseColor >> 10) & 0x1F];

        // Apply color map and target blend color to the original color.
        r += ((rBlend - r) * blendCoeff) >> 4;
        g += ((gBlend - g) * blendCoeff) >> 4;
        b += ((bBlend - b) * blendCoeff) >> 4;
        gPlttBufferFaded.set(palOffset, RGB2(r, g, b));
        palOffset++;
      }
    }
    curPalIndex++;
  }
}

/** 1:1 décomp `ApplyDroughtColorMapWithBlend(s8, u8, u16)` (field_weather.c:591). */
function ApplyDroughtColorMapWithBlend(colorMapIndex: number, blendCoeff: number, blendColor: number): void {
  let curPalIndex: number;
  let palOffset: number;
  let i: number;

  colorMapIndex = -colorMapIndex - 1;
  const rBlend = blendColor & 0x1F;
  const gBlend = (blendColor >> 5) & 0x1F;
  const bBlend = (blendColor >> 10) & 0x1F;
  palOffset = 0;
  for (curPalIndex = 0; curPalIndex < 32; curPalIndex++) {
    if (sPaletteColorMapTypes[curPalIndex] === COLOR_MAP_NONE) {
      // No color map. Simply blend the colors.
      BlendPalette(palOffset, 16, blendCoeff, blendColor);
      palOffset += 16;
    } else {
      for (i = 0; i < 16; i++) {
        const color1 = gPlttBufferUnfaded.get(palOffset);
        const r1 = color1 & 0x1F;
        const g1 = (color1 >> 5) & 0x1F;
        const b1 = (color1 >> 10) & 0x1F;

        const offset = ((b1 & 0x1E) << 7) | ((g1 & 0x1E) << 3) | ((r1 & 0x1E) >> 1);
        const color2 = sDroughtWeatherColors[colorMapIndex][offset];
        let r2 = color2 & 0x1F;
        let g2 = (color2 >> 5) & 0x1F;
        let b2 = (color2 >> 10) & 0x1F;

        r2 += ((rBlend - r2) * blendCoeff) >> 4;
        g2 += ((gBlend - g2) * blendCoeff) >> 4;
        b2 += ((bBlend - b2) * blendCoeff) >> 4;

        gPlttBufferFaded.set(palOffset, RGB2(r2, g2, b2));
        palOffset++;
      }
    }
  }
}

/** 1:1 décomp `ApplyFogBlend(u8 blendCoeff, u16 blendColor)` (field_weather.c:646). */
function ApplyFogBlend(blendCoeff: number, blendColor: number): void {
  let curPalIndex: number;

  BlendPalette(BG_PLTT_ID(0), 16 * 16, blendCoeff, blendColor);
  const rBlend = blendColor & 0x1F;
  const gBlend = (blendColor >> 5) & 0x1F;
  const bBlend = (blendColor >> 10) & 0x1F;

  for (curPalIndex = 16; curPalIndex < 32; curPalIndex++) {
    if (LightenSpritePaletteInFog(curPalIndex)) {
      const palEnd = PLTT_ID(curPalIndex + 1);
      let palOffset = PLTT_ID(curPalIndex);

      while (palOffset < palEnd) {
        const color = gPlttBufferUnfaded.get(palOffset);
        let r = color & 0x1F;
        let g = (color >> 5) & 0x1F;
        let b = (color >> 10) & 0x1F;

        r += ((28 - r) * 3) >> 2;
        g += ((31 - g) * 3) >> 2;
        b += ((28 - b) * 3) >> 2;

        r += ((rBlend - r) * blendCoeff) >> 4;
        g += ((gBlend - g) * blendCoeff) >> 4;
        b += ((bBlend - b) * blendCoeff) >> 4;

        gPlttBufferFaded.set(palOffset, RGB2(r, g, b));
        palOffset++;
      }
    } else {
      BlendPalette(PLTT_ID(curPalIndex), 16, blendCoeff, blendColor);
    }
  }
}

/** 1:1 décomp `MarkFogSpritePalToLighten(u8 paletteIndex)` (field_weather.c:693). */
function MarkFogSpritePalToLighten(paletteIndex: number): void {
  if (gWeatherPtr.lightenedFogSpritePalsCount < 6) {
    gWeatherPtr.lightenedFogSpritePals[gWeatherPtr.lightenedFogSpritePalsCount] = paletteIndex;
    gWeatherPtr.lightenedFogSpritePalsCount++;
  }
}

/** 1:1 décomp `LightenSpritePaletteInFog(u8 paletteIndex)` (field_weather.c:702). */
function LightenSpritePaletteInFog(paletteIndex: number): boolean {
  for (let i = 0; i < gWeatherPtr.lightenedFogSpritePalsCount; i++) {
    if (gWeatherPtr.lightenedFogSpritePals[i] === paletteIndex) return true;
  }
  return false;
}

/** 1:1 décomp `ApplyWeatherColorMapIfIdle(s8 colorMapIndex)` (field_weather.c:715). */
export function ApplyWeatherColorMapIfIdle(colorMapIndex: number): void {
  if (gWeatherPtr.palProcessingState === WEATHER_PAL_STATE_IDLE) {
    ApplyColorMap(0, 32, colorMapIndex);
    gWeatherPtr.colorMapIndex = colorMapIndex;
  }
}

/** 1:1 décomp `ApplyWeatherColorMapIfIdle_Gradual(u8, u8, u8)` (field_weather.c:724). */
export function ApplyWeatherColorMapIfIdle_Gradual(colorMapIndex: number, targetColorMapIndex: number, colorMapStepDelay: number): void {
  if (gWeatherPtr.palProcessingState === WEATHER_PAL_STATE_IDLE) {
    gWeatherPtr.palProcessingState = WEATHER_PAL_STATE_CHANGING_WEATHER;
    gWeatherPtr.colorMapIndex = colorMapIndex;
    gWeatherPtr.targetColorMapIndex = targetColorMapIndex;
    gWeatherPtr.colorMapStepCounter = 0;
    gWeatherPtr.colorMapStepDelay = colorMapStepDelay;
    ApplyWeatherColorMapIfIdle(colorMapIndex);
  }
}

/** 1:1 décomp `FadeScreen(u8 mode, s8 delay)` (field_weather.c:737).
 *  ⚠️ Le décomp a une version simplifiée historique dans engine/system/fade-screen.ts
 *  (mauvais emplacement = dette placement à consolider en C-final). Celle-ci est la
 *  vraie, weather-aware (branche useWeatherPal). */
export function FadeScreen(mode: number, delay: number): void {
  let fadeColor: number;
  let fadeOut: boolean;
  let useWeatherPal: boolean;

  switch (mode) {
    case FADE_FROM_BLACK: fadeColor = RGB_BLACK; fadeOut = false; break;
    case FADE_FROM_WHITE: fadeColor = RGB_WHITEALPHA; fadeOut = false; break;
    case FADE_TO_BLACK: fadeColor = RGB_BLACK; fadeOut = true; break;
    case FADE_TO_WHITE: fadeColor = RGB_WHITEALPHA; fadeOut = true; break;
    default: return;
  }

  switch (gWeatherPtr.currWeather) {
    case WEATHER_RAIN:
    case WEATHER_RAIN_THUNDERSTORM:
    case WEATHER_DOWNPOUR:
    case WEATHER_SNOW:
    case WEATHER_FOG_HORIZONTAL:
    case WEATHER_SHADE:
    case WEATHER_DROUGHT:
      useWeatherPal = true;
      break;
    default:
      useWeatherPal = false;
      break;
  }

  if (fadeOut) {
    if (useWeatherPal) {
      // 1:1 : CpuFastCopy(gPlttBufferFaded, gPlttBufferUnfaded, PLTT_SIZE).
      const r = _rt();
      for (let i = 0; i < PLTT_SIZE / 2; i++) r.gPlttBufferUnfaded.set(i, r.gPlttBufferFaded.get(i));
    }

    BeginNormalPaletteFade(PALETTES_ALL, delay, 0, 16, fadeColor);
    gWeatherPtr.palProcessingState = WEATHER_PAL_STATE_SCREEN_FADING_OUT;
  } else {
    gWeatherPtr.fadeDestColor = fadeColor;
    if (useWeatherPal) gWeatherPtr.fadeScreenCounter = 0;
    else BeginNormalPaletteFade(PALETTES_ALL, delay, 16, 0, fadeColor);

    gWeatherPtr.palProcessingState = WEATHER_PAL_STATE_SCREEN_FADING_IN;
    gWeatherPtr.fadeInFirstFrame = 1;
    gWeatherPtr.fadeInTimer = 0;
    Weather_SetBlendCoeffs(gWeatherPtr.currBlendEVA, gWeatherPtr.currBlendEVB);
    gWeatherPtr.readyForInit = true;
  }
}

/** 1:1 décomp `IsWeatherNotFadingIn(void)` (field_weather.c:805). */
export function IsWeatherNotFadingIn(): boolean {
  return (gWeatherPtr.palProcessingState !== WEATHER_PAL_STATE_SCREEN_FADING_IN);
}

/** 1:1 décomp `UpdateSpritePaletteWithWeather(u8 spritePaletteIndex)` (field_weather.c:810). */
export function UpdateSpritePaletteWithWeather(spritePaletteIndex: number): void {
  let paletteIndex = 16 + spritePaletteIndex;
  let i: number;

  switch (gWeatherPtr.palProcessingState) {
    case WEATHER_PAL_STATE_SCREEN_FADING_IN:
      if (gWeatherPtr.fadeInFirstFrame) {
        if (gWeatherPtr.currWeather === WEATHER_FOG_HORIZONTAL) MarkFogSpritePalToLighten(paletteIndex);
        paletteIndex = PLTT_ID(paletteIndex);
        for (i = 0; i < 16; i++) gPlttBufferFaded.set(paletteIndex + i, gWeatherPtr.fadeDestColor);
      }
      break;
    case WEATHER_PAL_STATE_SCREEN_FADING_OUT: {
      paletteIndex = PLTT_ID(paletteIndex);
      const r = _rt();
      for (i = 0; i < 16; i++) r.gPlttBufferFaded.set(paletteIndex + i, r.gPlttBufferUnfaded.get(paletteIndex + i));
      // 1:1 : BlendPalette(paletteIndex, 16, gPaletteFade.y, gPaletteFade.blendColor).
      // Notre PaletteFade : `y` = `brightness` ; `blendColor` = RGB(targetR,targetG,targetB).
      const fadeBlendColor = RGB(r.gPaletteFade.targetR, r.gPaletteFade.targetG, r.gPaletteFade.targetB);
      BlendPalette(paletteIndex, 16, r.gPaletteFade.brightness, fadeBlendColor);
      break;
    }
    // WEATHER_PAL_STATE_CHANGING_WEATHER / WEATHER_PAL_STATE_IDLE
    default:
      if (gWeatherPtr.currWeather !== WEATHER_FOG_HORIZONTAL) {
        ApplyColorMap(paletteIndex, 1, gWeatherPtr.colorMapIndex);
      } else {
        paletteIndex = PLTT_ID(paletteIndex);
        BlendPalette(paletteIndex, 16, 12, RGB(28, 31, 28));
      }
      break;
  }
}

/** 1:1 décomp `ApplyWeatherColorMapToPal(u8 paletteIndex)` (field_weather.c:848). */
export function ApplyWeatherColorMapToPal(paletteIndex: number): void {
  ApplyColorMap(paletteIndex, 1, gWeatherPtr.colorMapIndex);
}

/** 1:1 décomp `LoadCustomWeatherSpritePalette(const u16 *palette)` (field_weather.c:861). */
export function LoadCustomWeatherSpritePalette(palette: ArrayLike<number>): void {
  const r = _rt();
  const dst = OBJ_PLTT_ID(gWeatherPtr.weatherPicSpritePalIndex);
  for (let i = 0; i < 16; i++) { r.gPlttBufferFaded.set(dst + i, palette[i] ?? 0); r.gPlttBufferUnfaded.set(dst + i, palette[i] ?? 0); }
  UpdateSpritePaletteWithWeather(gWeatherPtr.weatherPicSpritePalIndex);
}

// ─── Drought palette loading (field_weather.c:867-936) ───────────────────────

/** 1:1 décomp `LoadDroughtWeatherPalette(u8 *palsIndex, u8 *palsOffset)` (field_weather.c:867). */
function LoadDroughtWeatherPalette(): { palsIndex: number; palsOffset: number } {
  return { palsIndex: 0x20, palsOffset: 0x20 };
}

/** 1:1 décomp `ResetDroughtWeatherPaletteLoading(void)` (field_weather.c:873). */
export function ResetDroughtWeatherPaletteLoading(): void {
  gWeatherPtr.loadDroughtPalsIndex = 1;
  gWeatherPtr.loadDroughtPalsOffset = 1;
}

/** 1:1 décomp `LoadDroughtWeatherPalettes(void)` (field_weather.c:879). */
export function LoadDroughtWeatherPalettes(): boolean {
  if (gWeatherPtr.loadDroughtPalsIndex < 32) {
    const res = LoadDroughtWeatherPalette();
    gWeatherPtr.loadDroughtPalsIndex = res.palsIndex;
    gWeatherPtr.loadDroughtPalsOffset = res.palsOffset;
    if (gWeatherPtr.loadDroughtPalsIndex < 32) return true;
  }
  return false;
}

/** 1:1 décomp `SetDroughtColorMap(s8 colorMapIndex)` (field_weather.c:890). */
function SetDroughtColorMap(colorMapIndex: number): void {
  ApplyWeatherColorMapIfIdle(-colorMapIndex - 1);
}

/** 1:1 décomp `DroughtStateInit(void)` (field_weather.c:895). */
export function DroughtStateInit(): void {
  gWeatherPtr.droughtBrightnessStage = 0;
  gWeatherPtr.droughtTimer = 0;
  gWeatherPtr.droughtState = 0;
  gWeatherPtr.droughtLastBrightnessStage = 0;
}

/** 1:1 décomp `DroughtStateRun(void)` (field_weather.c:903). */
export function DroughtStateRun(): void {
  switch (gWeatherPtr.droughtState) {
    case 0:
      if (++gWeatherPtr.droughtTimer > 5) {
        gWeatherPtr.droughtTimer = 0;
        SetDroughtColorMap(gWeatherPtr.droughtBrightnessStage++);
        if (gWeatherPtr.droughtBrightnessStage > 5) {
          gWeatherPtr.droughtLastBrightnessStage = gWeatherPtr.droughtBrightnessStage;
          gWeatherPtr.droughtState = 1;
          gWeatherPtr.droughtTimer = 60;
        }
      }
      break;
    case 1:
      gWeatherPtr.droughtTimer = (gWeatherPtr.droughtTimer + 3) & 0x7F;
      gWeatherPtr.droughtBrightnessStage = ((gSineTable[gWeatherPtr.droughtTimer] - 1) >> 6) + 2;
      if (gWeatherPtr.droughtBrightnessStage !== gWeatherPtr.droughtLastBrightnessStage)
        SetDroughtColorMap(gWeatherPtr.droughtBrightnessStage);
      gWeatherPtr.droughtLastBrightnessStage = gWeatherPtr.droughtBrightnessStage;
      break;
    case 2:
      if (++gWeatherPtr.droughtTimer > 5) {
        gWeatherPtr.droughtTimer = 0;
        SetDroughtColorMap(--gWeatherPtr.droughtBrightnessStage);
        if (gWeatherPtr.droughtBrightnessStage === 3) gWeatherPtr.droughtState = 0;
      }
      break;
  }
}

// ─── Blend coeffs (field_weather.c:939-992) ──────────────────────────────────

/** 1:1 décomp `Weather_SetBlendCoeffs(u8 eva, u8 evb)` (field_weather.c:939). */
export function Weather_SetBlendCoeffs(eva: number, evb: number): void {
  gWeatherPtr.currBlendEVA = eva;
  gWeatherPtr.currBlendEVB = evb;
  gWeatherPtr.targetBlendEVA = eva;
  gWeatherPtr.targetBlendEVB = evb;
  SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(eva, evb));
}

/** 1:1 décomp `Weather_SetTargetBlendCoeffs(u8 eva, u8 evb, int delay)` (field_weather.c:948). */
export function Weather_SetTargetBlendCoeffs(eva: number, evb: number, delay: number): void {
  gWeatherPtr.targetBlendEVA = eva;
  gWeatherPtr.targetBlendEVB = evb;
  gWeatherPtr.blendDelay = delay;
  gWeatherPtr.blendFrameCounter = 0;
  gWeatherPtr.blendUpdateCounter = 0;
}

/** 1:1 décomp `Weather_UpdateBlend(void)` (field_weather.c:957). */
export function Weather_UpdateBlend(): boolean {
  if (gWeatherPtr.currBlendEVA === gWeatherPtr.targetBlendEVA
   && gWeatherPtr.currBlendEVB === gWeatherPtr.targetBlendEVB)
    return true;

  if (++gWeatherPtr.blendFrameCounter > gWeatherPtr.blendDelay) {
    gWeatherPtr.blendFrameCounter = 0;
    gWeatherPtr.blendUpdateCounter++;

    // Update currBlendEVA and currBlendEVB on alternate frames
    if (gWeatherPtr.blendUpdateCounter & 1) {
      if (gWeatherPtr.currBlendEVA < gWeatherPtr.targetBlendEVA) gWeatherPtr.currBlendEVA++;
      else if (gWeatherPtr.currBlendEVA > gWeatherPtr.targetBlendEVA) gWeatherPtr.currBlendEVA--;
    } else {
      if (gWeatherPtr.currBlendEVB < gWeatherPtr.targetBlendEVB) gWeatherPtr.currBlendEVB++;
      else if (gWeatherPtr.currBlendEVB > gWeatherPtr.targetBlendEVB) gWeatherPtr.currBlendEVB--;
    }
  }

  SetGpuReg(REG_OFFSET_BLDALPHA, BLDALPHA_BLEND(gWeatherPtr.currBlendEVA, gWeatherPtr.currBlendEVB));

  if (gWeatherPtr.currBlendEVA === gWeatherPtr.targetBlendEVA
   && gWeatherPtr.currBlendEVB === gWeatherPtr.targetBlendEVB)
    return true;

  return false;
}

// ─── API publique restante (field_weather.c:1032-1105) ───────────────────────

/** 1:1 décomp `GetCurrentWeather(void)` (field_weather.c:1032). */
export function GetCurrentWeather(): number {
  return gWeatherPtr.currWeather;
}

/** 1:1 décomp `SetRainStrengthFromSoundEffect(u16 soundEffect)` (field_weather.c:1037).
 *  ⚠️ AUDIO SKIP : le PlaySE final est omis (exception projet). On garde la maj d'état
 *  rainStrength (lue par la logique météo) ; soundEffect = id SE_RAIN/DOWNPOUR/THUNDERSTORM. */
export function SetRainStrengthFromSoundEffect(soundEffect: number): void {
  // SE_RAIN / SE_DOWNPOUR / SE_THUNDERSTORM (constants/songs.h). Valeurs non importées
  // ici (audio skip) → on ne route que via les 3 cas connus par leur sémantique.
  if (gWeatherPtr.palProcessingState !== WEATHER_PAL_STATE_SCREEN_FADING_OUT) {
    switch (soundEffect) {
      case SE_RAIN: gWeatherPtr.rainStrength = 0; break;
      case SE_DOWNPOUR: gWeatherPtr.rainStrength = 1; break;
      case SE_THUNDERSTORM: gWeatherPtr.rainStrength = 2; break;
      default: return;
    }
    // PlaySE(soundEffect);  // AUDIO SKIP
  }
}

/** 1:1 décomp `PlayRainStoppingSoundEffect(void)` (field_weather.c:1060).
 *  ⚠️ AUDIO SKIP : tout le corps est du son (PlaySE/IsSpecialSEPlaying) → no-op. */
export function PlayRainStoppingSoundEffect(): void {
  // if (IsSpecialSEPlaying()) { switch (rainStrength) { ... PlaySE(...) } }  // AUDIO SKIP
}

/** 1:1 décomp `IsWeatherChangeComplete(void)` (field_weather.c:1080). */
export function IsWeatherChangeComplete(): boolean {
  return gWeatherPtr.weatherChangeComplete;
}

/** 1:1 décomp `SetWeatherScreenFadeOut(void)` (field_weather.c:1085). */
export function SetWeatherScreenFadeOut(): void {
  gWeatherPtr.palProcessingState = WEATHER_PAL_STATE_SCREEN_FADING_OUT;
}

/** 1:1 décomp `SetWeatherPalStateIdle(void)` (field_weather.c:1090). */
export function SetWeatherPalStateIdle(): void {
  gWeatherPtr.palProcessingState = WEATHER_PAL_STATE_IDLE;
}

/** 1:1 décomp `PreservePaletteInWeather(u8 preservedPalIndex)` (field_weather.c:1095). */
export function PreservePaletteInWeather(preservedPalIndex: number): void {
  for (let i = 0; i < 32; i++) sFieldEffectPaletteColorMapTypes[i] = sBasePaletteColorMapTypes[i];
  sFieldEffectPaletteColorMapTypes[preservedPalIndex] = COLOR_MAP_NONE;
  sPaletteColorMapTypes = sFieldEffectPaletteColorMapTypes as unknown as ReadonlyArray<number>;
}

/** 1:1 décomp `ResetPreservedPalettesInWeather(void)` (field_weather.c:1102). */
export function ResetPreservedPalettesInWeather(): void {
  sPaletteColorMapTypes = sBasePaletteColorMapTypes;
}

// ─── AUDIO SKIP : constantes SE_* référencées par SetRainStrengthFromSoundEffect.
//     Valeurs 1:1 constants/songs.h, gardées locales (l'audio n'est jamais joué).
const SE_RAIN = 0x53;
const SE_THUNDERSTORM = 0x55;
const SE_DOWNPOUR = 0x54;

// ════════════════════════════════════════════════════════════════════════════
//  Init du module : sPaletteColorMapTypes par défaut (avant BuildColorMaps).
// ════════════════════════════════════════════════════════════════════════════
sPaletteColorMapTypes = sBasePaletteColorMapTypes;
