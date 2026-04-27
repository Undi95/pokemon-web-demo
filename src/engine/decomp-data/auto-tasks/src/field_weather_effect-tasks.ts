// AUTO-GENERATED from src/field_weather_effect.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_DoAbnormalWeather": {
    callsTo: ["SetNextWeather"],
    lineCount: 22,
    bodyC: "s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        if (tDelay-- <= 0)\n        {\n            SetNextWeather(tWeatherA);\n            sCurrentAbnormalWeather = tWeatherA;\n            tDelay = 600;\n            tState++;\n        }\n        break;\n    case 1:\n        if (tDelay-- <= 0)\n        {\n            SetNextWeather(tWeatherB);\n            sCurrentAbnormalWeather = tWeatherB;\n            tDelay = 600;\n            tState = 0;\n        }\n        break;\n    }",
  },
} as const;
