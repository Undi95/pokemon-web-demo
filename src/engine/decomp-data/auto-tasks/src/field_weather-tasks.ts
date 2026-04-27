// AUTO-GENERATED from src/field_weather.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 2 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_WeatherInit": {
    callsTo: ["initAll"],
    taskTransitions: ["Task_WeatherMain"],
    lineCount: 5,
    bodyC: "if (gWeatherPtr->readyForInit)\n    {\n        sWeatherFuncs[gWeatherPtr->currWeather].initAll();\n        gTasks[taskId].func = Task_WeatherMain;\n    }",
  },
  "Task_WeatherMain": {
    callsTo: ["finish","initVars","main"],
    lineCount: 17,
    bodyC: "if (gWeatherPtr->currWeather != gWeatherPtr->nextWeather)\n    {\n        if (!sWeatherFuncs[gWeatherPtr->currWeather].finish()\n            && gWeatherPtr->palProcessingState != WEATHER_PAL_STATE_SCREEN_FADING_OUT)\n        {\n             \n            sWeatherFuncs[gWeatherPtr->nextWeather].initVars();\n            gWeatherPtr->colorMapStepCounter = 0;\n            gWeatherPtr->palProcessingState = WEATHER_PAL_STATE_CHANGING_WEATHER;\n            gWeatherPtr->currWeather = gWeatherPtr->nextWeather;\n            gWeatherPtr->weatherChangeComplete = TRUE;\n        }\n    }\n    else\n    {\n        sWeatherFuncs[gWeatherPtr->currWeather].main();\n    }\n\n    gWeatherPalStateFuncs[gWeatherPtr->palProcessingState]();",
  },
} as const;
