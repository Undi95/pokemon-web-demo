// AUTO-GENERATED from src/sound.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 2 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_Fanfare": {
    callsTo: ["DestroyTask","m4aMPlayContinue"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 9,
    bodyC: "if (sFanfareCounter)\n    {\n        sFanfareCounter--;\n    }\n    else\n    {\n        m4aMPlayContinue(&gMPlayInfo_BGM);\n        DestroyTask(taskId);\n    }",
  },
  "Task_DuckBGMForPokemonCry": {
    callsTo: ["DestroyTask","IsPokemonCryPlaying","m4aMPlayVolumeControl"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 10,
    bodyC: "if (gPokemonCryBGMDuckingCounter)\n    {\n        gPokemonCryBGMDuckingCounter--;\n        return;\n    }\n\n    if (!IsPokemonCryPlaying(gMPlay_PokemonCry))\n    {\n        m4aMPlayVolumeControl(&gMPlayInfo_BGM, TRACKS_ALL, 256);\n        DestroyTask(taskId);\n    }",
  },
} as const;
