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
import { gMapHeader } from './map-loader';
import { gSaveBlock1Ptr } from './save-block-state';
import { resolveDecompConstant } from './decomp-constants';

/** 1:1 décomp `ScrCmd_setweather` (scrcmd.c) :
 *    SetSavedWeather(VarGet(weather));
 *  Stocke dans gSaveBlock1Ptr.weather. Effet visuel applied au prochain doweather. */
registerOpcode('setweather', (_ctx, args) => {
  const weather = VarGet(args[0] ?? '0');
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
 *  Pour MVP on log + no-op (= sans repro live d'un cas qui en a besoin). */
registerOpcode('doweather', (_ctx, _args) => {
  // TODO : appeler le système weather pour appliquer la weather courante.
  return false;
});
