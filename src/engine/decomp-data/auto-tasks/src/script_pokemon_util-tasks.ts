// AUTO-GENERATED from src/script_pokemon_util.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 0 Task_, 2 CB2_, 0 SpriteCB_

export const CB2S = {
  "CB2_ReturnFromChooseHalfParty": {
    callsTo: ["SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToFieldContinueScriptPlayMapMusic"],
    lineCount: 10,
    bodyC: "switch (gSelectedOrderFromParty[0])\n    {\n    case 0:\n        gSpecialVar_Result = FALSE;\n        break;\n    default:\n        gSpecialVar_Result = TRUE;\n        break;\n    }\n\n    SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);",
  },
  "CB2_ReturnFromChooseBattleFrontierParty": {
    callsTo: ["SetMainCallback2"],
    cb2Transitions: ["CB2_ReturnToFieldContinueScriptPlayMapMusic"],
    lineCount: 10,
    bodyC: "switch (gSelectedOrderFromParty[0])\n    {\n    case 0:\n        gSpecialVar_Result = FALSE;\n        break;\n    default:\n        gSpecialVar_Result = TRUE;\n        break;\n    }\n\n    SetMainCallback2(CB2_ReturnToFieldContinueScriptPlayMapMusic);",
  },
} as const;
