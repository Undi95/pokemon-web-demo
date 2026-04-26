// AUTO-GENERATED from src/field_poison.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 1 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_TryFieldPoisonWhiteOut": {
    callsTo: ["AllMonsFainted","CurrentBattlePyramidLocation","DestroyTask","FaintFromFieldPoison","InBattlePike","InTrainerHillChallenge","IsFieldMessageBoxHidden","MonFaintedFromPoison","ScriptContext_Enable","ShowFieldMessage"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 40,
    bodyC: "s16 *data = gTasks[taskId].data;\n    switch (tState)\n    {\n    case 0:\n        for (; tPartyIdx < PARTY_SIZE; tPartyIdx++)\n        {\n            if (MonFaintedFromPoison(tPartyIdx))\n            {\n                FaintFromFieldPoison(tPartyIdx);\n                ShowFieldMessage(gText_PkmnFainted_FldPsn);\n                tState++;\n                return;\n            }\n        }\n        tState = 2;  \n        break;\n    case 1:\n         \n        if (IsFieldMessageBoxHidden())\n            tState--;\n        break;\n    case 2:\n        if (AllMonsFainted())\n        {\n             \n#ifdef BUGFIX\n            if (CurrentBattlePyramidLocation() || InBattlePike() || InTrainerHillChallenge())\n#else\n            if (CurrentBattlePyramidLocation() | InBattlePike() || InTrainerHillChallenge())\n#endif\n                gSpecialVar_Result = FLDPSN_FRONTIER_WHITEOUT;\n            else\n                gSpecialVar_Result = FLDPSN_WHITEOUT;\n        }\n        else\n        {\n            gSpecialVar_Result = FLDPSN_NO_WHITEOUT;\n        }\n        ScriptContext_Enable();\n        DestroyTask(taskId);\n        break;\n    }",
  },
} as const;
