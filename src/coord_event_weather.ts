/**
 * coord_event_weather.ts — Port 1:1 STRICT (MIROIR) de `src/coord_event_weather.c`.
 *
 * Source de vérité : `D:/Projet 1/decomps/pokeemeraude/src/coord_event_weather.c`.
 *
 * Quand le joueur marche sur une coord event de type « weather » (script == NULL côté
 * décomp), `field_control_avatar.c:TryRunCoordEventScript` appelle `DoCoordEventWeather(
 * coordEvent->trigger)`. Cette fonction mappe l'id COORD_EVENT_WEATHER_* vers `SetWeather
 * (WEATHER_*)` → SetSavedWeather + SetNextWeather → transition météo.
 *
 * C'est le déclencheur NATUREL de la cendre Route 113 (header = SUNNY, mais des coord
 * events COORD_EVENT_WEATHER_VOLCANIC_ASH posent la météo en marchant dans la zone).
 */

import { SetWeather } from './field_weather_effect';
import { setDoCoordEventWeatherHook } from './script';
import * as WeatherConstants from './engine/decomp-data/include/constants/weather-data';
import {
  WEATHER_SUNNY_CLOUDS, WEATHER_SUNNY, WEATHER_RAIN, WEATHER_SNOW, WEATHER_RAIN_THUNDERSTORM,
  WEATHER_FOG_HORIZONTAL, WEATHER_FOG_DIAGONAL, WEATHER_VOLCANIC_ASH, WEATHER_SANDSTORM,
  WEATHER_SHADE, WEATHER_DROUGHT, WEATHER_ROUTE119_CYCLE, WEATHER_ROUTE123_CYCLE,
  COORD_EVENT_WEATHER_SUNNY_CLOUDS, COORD_EVENT_WEATHER_SUNNY, COORD_EVENT_WEATHER_RAIN,
  COORD_EVENT_WEATHER_SNOW, COORD_EVENT_WEATHER_RAIN_THUNDERSTORM, COORD_EVENT_WEATHER_FOG_HORIZONTAL,
  COORD_EVENT_WEATHER_FOG_DIAGONAL, COORD_EVENT_WEATHER_VOLCANIC_ASH, COORD_EVENT_WEATHER_SANDSTORM,
  COORD_EVENT_WEATHER_SHADE, COORD_EVENT_WEATHER_DROUGHT, COORD_EVENT_WEATHER_ROUTE119_CYCLE,
  COORD_EVENT_WEATHER_ROUTE123_CYCLE,
} from './engine/decomp-data/include/constants/weather-data';

interface CoordEventWeather {
  coordEventWeather: number;
  func: () => void;
}

/** 1:1 décomp `CoordEventWeather_Clouds` (coord_event_weather.c:43). */
function CoordEventWeather_Clouds(): void { SetWeather(WEATHER_SUNNY_CLOUDS); }
/** 1:1 décomp `CoordEventWeather_Sunny`. */
function CoordEventWeather_Sunny(): void { SetWeather(WEATHER_SUNNY); }
/** 1:1 décomp `CoordEventWeather_Rain`. */
function CoordEventWeather_Rain(): void { SetWeather(WEATHER_RAIN); }
/** 1:1 décomp `CoordEventWeather_Snow`. */
function CoordEventWeather_Snow(): void { SetWeather(WEATHER_SNOW); }
/** 1:1 décomp `CoordEventWeather_Thunderstorm`. */
function CoordEventWeather_Thunderstorm(): void { SetWeather(WEATHER_RAIN_THUNDERSTORM); }
/** 1:1 décomp `CoordEventWeather_HorizontalFog`. */
function CoordEventWeather_HorizontalFog(): void { SetWeather(WEATHER_FOG_HORIZONTAL); }
/** 1:1 décomp `CoordEventWeather_DiagonalFog`. */
function CoordEventWeather_DiagonalFog(): void { SetWeather(WEATHER_FOG_DIAGONAL); }
/** 1:1 décomp `CoordEventWeather_Ash`. */
function CoordEventWeather_Ash(): void { SetWeather(WEATHER_VOLCANIC_ASH); }
/** 1:1 décomp `CoordEventWeather_Sandstorm`. */
function CoordEventWeather_Sandstorm(): void { SetWeather(WEATHER_SANDSTORM); }
/** 1:1 décomp `CoordEventWeather_Shade`. */
function CoordEventWeather_Shade(): void { SetWeather(WEATHER_SHADE); }
/** 1:1 décomp `CoordEventWeather_Drought`. */
function CoordEventWeather_Drought(): void { SetWeather(WEATHER_DROUGHT); }
/** 1:1 décomp `CoordEventWeather_Route119Cycle`. */
function CoordEventWeather_Route119Cycle(): void { SetWeather(WEATHER_ROUTE119_CYCLE); }
/** 1:1 décomp `CoordEventWeather_Route123Cycle`. */
function CoordEventWeather_Route123Cycle(): void { SetWeather(WEATHER_ROUTE123_CYCLE); }

/** 1:1 décomp `sCoordEventWeatherFuncs[]` (coord_event_weather.c:26). */
const sCoordEventWeatherFuncs: ReadonlyArray<CoordEventWeather> = [
  { coordEventWeather: COORD_EVENT_WEATHER_SUNNY_CLOUDS, func: CoordEventWeather_Clouds },
  { coordEventWeather: COORD_EVENT_WEATHER_SUNNY, func: CoordEventWeather_Sunny },
  { coordEventWeather: COORD_EVENT_WEATHER_RAIN, func: CoordEventWeather_Rain },
  { coordEventWeather: COORD_EVENT_WEATHER_SNOW, func: CoordEventWeather_Snow },
  { coordEventWeather: COORD_EVENT_WEATHER_RAIN_THUNDERSTORM, func: CoordEventWeather_Thunderstorm },
  { coordEventWeather: COORD_EVENT_WEATHER_FOG_HORIZONTAL, func: CoordEventWeather_HorizontalFog },
  { coordEventWeather: COORD_EVENT_WEATHER_FOG_DIAGONAL, func: CoordEventWeather_DiagonalFog },
  { coordEventWeather: COORD_EVENT_WEATHER_VOLCANIC_ASH, func: CoordEventWeather_Ash },
  { coordEventWeather: COORD_EVENT_WEATHER_SANDSTORM, func: CoordEventWeather_Sandstorm },
  { coordEventWeather: COORD_EVENT_WEATHER_SHADE, func: CoordEventWeather_Shade },
  { coordEventWeather: COORD_EVENT_WEATHER_DROUGHT, func: CoordEventWeather_Drought },
  { coordEventWeather: COORD_EVENT_WEATHER_ROUTE119_CYCLE, func: CoordEventWeather_Route119Cycle },
  { coordEventWeather: COORD_EVENT_WEATHER_ROUTE123_CYCLE, func: CoordEventWeather_Route123Cycle },
];

/** 1:1 décomp `DoCoordEventWeather(u8 coordEventWeather)` (coord_event_weather.c:108). */
export function DoCoordEventWeather(coordEventWeather: number): void {
  for (let i = 0; i < sCoordEventWeatherFuncs.length; i++) {
    if (sCoordEventWeatherFuncs[i].coordEventWeather === coordEventWeather) {
      sCoordEventWeatherFuncs[i].func();
      return;
    }
  }
}

// Enregistre le dispatcher auprès de script-runtime (TryRunCoordEventScript). Le coord
// event météo arrive avec `trigger` = string "COORD_EVENT_WEATHER_*" → on résout en id
// via le module weather-data (resolveDecompConstant ne connaît PAS ces constantes).
setDoCoordEventWeatherHook((coordEventWeather) => {
  const id = typeof coordEventWeather === 'number'
    ? coordEventWeather
    : ((WeatherConstants as unknown as Record<string, number>)[coordEventWeather] ?? 0);
  DoCoordEventWeather(id);
});
