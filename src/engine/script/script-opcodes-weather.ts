/**
 * script-opcodes-weather.ts — opcodes `setweather` / `resetweather` / `doweather`
 * 1:1 décomp `field_weather.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/scrcmd.c:705-723` :
 *   `ScrCmd_setweather`     : SetSavedWeather(VarGet(weather)).
 *   `ScrCmd_resetweather`   : SetSavedWeatherFromCurrMapHeader().
 *   `ScrCmd_doweather`      : DoCurrentWeather().
 */

import { registerOpcode } from './script-runtime';
import { VarGet } from './script-vars';
import { gMapHeader } from '../field/map-loader';
import { gSaveBlock1Ptr } from '../save/save-block-state';
import { resolveDecompConstant } from '../system/decomp-constants';
import * as WeatherConstants from '../decomp-data/include/constants/weather-data';

/** Résout un argument météo : valeur numérique, constante `WEATHER_*`/`COORD_EVENT_WEATHER_*`
 *  (via weather-data), ou nom de VAR (`VarGet`). ⚠️ `VarGet`/`resolveDecompConstant` ne
 *  connaissent PAS les `WEATHER_*` → sans ça `setweather WEATHER_VOLCANIC_ASH` posait 0
 *  (la météo Route 113 ne s'activait pas en entrant dans la zone). */
function _resolveWeatherArg(arg: string): number {
  if (/^-?\d+$/.test(arg)) return parseInt(arg, 10);
  const c = (WeatherConstants as unknown as Record<string, number>)[arg];
  if (typeof c === 'number') return c;
  return VarGet(arg);
}

/** 1:1 décomp `ScrCmd_setweather` (scrcmd.c) :
 *    SetSavedWeather(VarGet(weather));
 *  Stocke dans gSaveBlock1Ptr.weather (sync). Effet visuel appliqué par ResumePausedWeather
 *  (map-init) / doweather. ⚠️ dette mineure : TranslateWeatherNum (cycles Route119/123) +
 *  UpdateRainCounter de SetSavedWeather non appliqués ici (set direct) — cf. C-final. */
registerOpcode('setweather', (_ctx, args) => {
  const weather = _resolveWeatherArg(args[0] ?? '0');
  if (gSaveBlock1Ptr) gSaveBlock1Ptr.weather = weather;
  return false;
});

/** 1:1 décomp `ScrCmd_resetweather` (scrcmd.c) :
 *    SetSavedWeatherFromCurrMapHeader();
 *  = `SetSavedWeather(gMapHeader.weather)` = `gSaveBlock1Ptr.weather =
 *  gMapHeader.weather`. Restaure la météo SAUVEGARDÉE à celle PAR
 *  DÉFAUT de la map courante (= 1:1 field_weather.c). gMapHeader.weather
 *  est une string "WEATHER_*" → résolue en id numérique. Était MANQUANT
 *  (audit scrcmd) → la météo ne se reset pas en sortie de zone spéciale. */
registerOpcode('resetweather', (_ctx) => {
  const mhWeather = gMapHeader?.weather;
  const weatherId = typeof mhWeather === 'string'
    ? (resolveDecompConstant(mhWeather) ?? 0)
    : (typeof mhWeather === 'number' ? mhWeather : 0);
  if (gSaveBlock1Ptr) gSaveBlock1Ptr.weather = typeof weatherId === 'number' ? weatherId : 0;
  return false;
});

/** 1:1 décomp `ScrCmd_doweather` (scrcmd.c) :
 *    DoCurrentWeather();  // active le weather sauvegardé
 *
 *  Dette R3 documentée : DoCurrentWeather (field_weather_effect.c:2541) demande
 *  cascade weather subsystem entier non porté :
 *   - GetSavedWeather (lit gSaveBlock1Ptr.weather)
 *   - Task_DoAbnormalWeather + CreateAbnormalWeatherTask (= alternance random
 *     downpour/sandstorm pour WEATHER_ABNORMAL)
 *   - SetNextWeather (transition fade vers le weather state)
 *   - sCurrentAbnormalWeather global static
 *
 *  Notre engine n'affiche aucun weather VFX runtime (= rain/snow/sandstorm
 *  particles). doweather est donc un no-op honnête tant que ce subsystem
 *  reste U-tier. Le var gSaveBlock1Ptr.weather est synchronisé par
 *  setweather/resetweather opcodes pour persistance state. */
registerOpcode('doweather', (_ctx, _args) => {
  return false;
});
