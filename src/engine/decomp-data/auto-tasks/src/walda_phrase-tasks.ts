// AUTO-GENERATED from src/walda_phrase.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 1 CB2_, 0 SpriteCB_

export const CB2S = {
  "CB2_HandleGivenWaldaPhrase": {
    callsTo: ["GetWaldaPhraseInputCase","GetWaldaPhrasePtr","IsWaldaPhraseEmpty","SetMainCallback2","SetWaldaPhrase","StringCopy"],
    cb2Transitions: ["CB2_ReturnToField"],
    lineCount: 18,
    bodyC: "gSpecialVar_0x8004 = GetWaldaPhraseInputCase(gStringVar2);\n\n    switch (gSpecialVar_0x8004)\n    {\n    case PHRASE_EMPTY:\n         \n         \n        if (IsWaldaPhraseEmpty())\n            SetWaldaPhrase(gText_Peekaboo);\n        else\n            gSpecialVar_0x8004 = PHRASE_NO_CHANGE;\n        break;\n    case PHRASE_CHANGED:\n        SetWaldaPhrase(gStringVar2);\n        break;\n    case PHRASE_NO_CHANGE:\n        break;\n    }\n\n    StringCopy(gStringVar1, GetWaldaPhrasePtr());\n    gFieldCallback = FieldCB_ContinueScriptHandleMusic;\n    SetMainCallback2(CB2_ReturnToField);",
  },
} as const;
