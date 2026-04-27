// AUTO-GENERATED from src/mail.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 0 Task_, 5 CB2_, 0 SpriteCB_

export const CB2S = {
  "CB2_InitMailRead": {
    callsTo: ["MailReadBuildGraphics","MenuHelpers_IsLinkActive","SetMainCallback2"],
    cb2Transitions: ["CB2_MailRead"],
    lineCount: 8,
    bodyC: "do\n    {\n        if (MailReadBuildGraphics() == TRUE)\n        {\n            SetMainCallback2(CB2_MailRead);\n            break;\n        }\n    } while (MenuHelpers_IsLinkActive() != TRUE);",
  },
  "CB2_MailRead": {
    callsTo: ["AnimateSprites","BuildOamBuffer","callback"],
    externalChecks: { waitForVBlank: true },
    lineCount: 6,
    bodyC: "if (sMailRead->iconType != ICON_TYPE_NONE)\n    {\n        AnimateSprites();\n        BuildOamBuffer();\n    }\n    sMailRead->callback();",
  },
  "CB2_WaitForPaletteExitOnKeyPress": {
    callsTo: ["UpdatePaletteFade"],
    lineCount: 4,
    bodyC: "if (!UpdatePaletteFade())\n    {\n        sMailRead->callback = CB2_ExitOnKeyPress;\n    }",
  },
  "CB2_ExitOnKeyPress": {
    callsTo: ["BeginNormalPaletteFade","JOY_NEW"],
    lineCount: 5,
    bodyC: "if (JOY_NEW(A_BUTTON | B_BUTTON))\n    {\n        BeginNormalPaletteFade(PALETTES_ALL, 0, 0, 16, RGB_BLACK);\n        sMailRead->callback = CB2_ExitMailReadFreeVars;\n    }",
  },
  "CB2_ExitMailReadFreeVars": {
    callsTo: ["FREE_AND_SET_NULL","FreeAllWindowBuffers","FreeAndDestroyMonIconSprite","FreeMonIconPalette","GetIconSpeciesNoPersonality","ResetBgsAndClearDma3BusyFlags","ResetPaletteFade","SetMainCallback2","UnsetBgTilemapBuffer","UpdatePaletteFade","memset"],
    lineCount: 18,
    bodyC: "if (!UpdatePaletteFade())\n    {\n        SetMainCallback2(sMailRead->exitCallback);\n        switch (sMailRead->iconType)\n        {\n        case ICON_TYPE_BEAD:\n        case ICON_TYPE_DREAM:\n            FreeMonIconPalette(GetIconSpeciesNoPersonality(sMailRead->mail->species));\n            FreeAndDestroyMonIconSprite(&gSprites[sMailRead->monIconSpriteId]);\n        }\n        memset(sMailRead, 0, sizeof(*sMailRead));\n        ResetPaletteFade();\n        UnsetBgTilemapBuffer(0);\n        UnsetBgTilemapBuffer(1);\n        ResetBgsAndClearDma3BusyFlags(0);\n        FreeAllWindowBuffers();\n        FREE_AND_SET_NULL(sMailRead);\n    }",
  },
} as const;
