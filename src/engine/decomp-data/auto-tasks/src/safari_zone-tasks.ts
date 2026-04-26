// AUTO-GENERATED from src/safari_zone.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 0 Task_, 1 CB2_, 0 SpriteCB_

export const CB2S = {
  "CB2_EndSafariBattle": {
    callsTo: ["RunScriptImmediately","ScriptContext_SetupScript","ScriptContext_Stop","SetMainCallback2","WarpIntoMap"],
    cb2Transitions: ["CB2_LoadMap","CB2_ReturnToField","CB2_ReturnToFieldContinueScriptPlayMapMusic"],
    lineCount: 20,
    bodyC: "sSafariZonePkblkUses += gBattleResults.pokeblockThrows;\n    if (gBattleOutcome == B_OUTCOME_CAUGHT)\n        sSafariZoneCaughtMons++;\n    if (gNumSafariBalls != 0)\n    {\n        SetMainCallback2(CB2_ReturnToField);\n    }\n    else if (gBattleOutcome == B_OUTCOME_NO_SAFARI_BALLS)\n    {\n        RunScriptImmediately(SafariZone_EventScript_OutOfBallsMidBattle);\n        WarpIntoMap();\n        gFieldCallback = FieldCB_ReturnToFieldNoScriptCheckMusic;\n        SetMainCallback2(CB2_LoadMap);\n    }\n    else if (gBattleOutcome == B_OUTCOME_CAUGHT)\n    {\n        ScriptContext_SetupScript(SafariZone_EventScript_OutOfBalls);\n        ScriptContext_Stop();\n        SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);\n    }",
  },
} as const;
