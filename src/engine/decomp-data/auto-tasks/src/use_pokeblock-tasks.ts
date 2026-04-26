// AUTO-GENERATED from src/use_pokeblock.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 0 Task_, 4 CB2_, 5 SpriteCB_

export const CB2S = {
  "CB2_ReturnAndChooseMonToGivePokeblock": {
    callsTo: ["AllocZeroed","GetSelectionIdFromPartyId","SetMainCallback2","SetUsePokeblockCallback"],
    cb2Transitions: ["CB2_ReturnToUsePokeblockMenu"],
    lineCount: 8,
    bodyC: "sMenu = AllocZeroed(sizeof(*sMenu));\n    sInfo = &sMenu->info;\n    sInfo->pokeblock = sPokeblock;\n    sInfo->exitCallback = sExitCallback;\n    gPokeblockMonId = GetSelectionIdFromPartyId(gPokeblockMonId);\n    sInfo->monInTopHalf = (gPokeblockMonId <= PARTY_SIZE / 2) ? FALSE : TRUE;\n    SetUsePokeblockCallback(LoadUsePokeblockMenu);\n    SetMainCallback2(CB2_ReturnToUsePokeblockMenu);",
  },
  "CB2_ReturnToUsePokeblockMenu": {
    callsTo: ["AnimateSprites","BuildOamBuffer","SetMainCallback2","UpdatePaletteFade","callback"],
    cb2Transitions: ["CB2_ShowUsePokeblockMenuForResults"],
    externalChecks: { waitForVBlank: true },
    lineCount: 9,
    bodyC: "sInfo->callback();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();\n    if (sInfo->callback == ShowUsePokeblockMenu)\n    {\n        sInfo->mainState = 0;\n        SetMainCallback2(CB2_ShowUsePokeblockMenuForResults);\n    }",
  },
  "CB2_ShowUsePokeblockMenuForResults": {
    callsTo: ["AnimateSprites","BuildOamBuffer","ShowUsePokeblockMenuForResults","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 4,
    bodyC: "ShowUsePokeblockMenuForResults();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
  "CB2_UsePokeblockMenu": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunTextPrinters","UpdatePaletteFade","callback"],
    externalChecks: { waitForVBlank: true },
    lineCount: 5,
    bodyC: "sInfo->callback();\n    AnimateSprites();\n    BuildOamBuffer();\n    RunTextPrinters();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_UpDown": {
    callsTo: ["DestroySprite"],
    terminalMarkers: ["DestroySprite"],
    lineCount: 9,
    bodyC: "if (sprite->tTimer < 6)\n        sprite->y2 -= 2;\n    else if (sprite->tTimer < 12)\n        sprite->y2 += 2;\n\n    if (++sprite->tTimer > 60)\n    {\n        DestroySprite(sprite);\n        sInfo->numEnhancements--;\n    }",
  },
  "SpriteCB_MonPic": {
    lineCount: 1,
    bodyC: "sprite->x = sMenu->curMonXOffset + 38;",
  },
  "SpriteCB_SelectionIconPokeball": {
    callsTo: ["StartSpriteAnim"],
    lineCount: 4,
    bodyC: "if (sprite->data[0] == sMenu->info.curSelection)\n        StartSpriteAnim(sprite, CONDITION_ICON_SELECTED);\n    else\n        StartSpriteAnim(sprite, CONDITION_ICON_UNSELECTED);",
  },
  "SpriteCB_SelectionIconCancel": {
    callsTo: ["IndexOfSpritePaletteTag"],
    lineCount: 4,
    bodyC: "if (sMenu->info.curSelection == sMenu->info.numSelections - 1)\n        sprite->oam.paletteNum = IndexOfSpritePaletteTag(TAG_CONDITION_BALL);\n    else\n        sprite->oam.paletteNum = IndexOfSpritePaletteTag(TAG_CONDITION_CANCEL);",
  },
  "SpriteCB_Condition": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 8,
    bodyC: "s16 prevX = sprite->x;\n\n     \n    sprite->x += sprite->sSpeed;\n\n     \n    if ((prevX <= sprite->sTargetX && sprite->x >= sprite->sTargetX)\n     || (prevX >= sprite->sTargetX && sprite->x <= sprite->sTargetX))\n    {\n         \n        sprite->x = sprite->sTargetX;\n        sprite->callback = SpriteCallbackDummy;\n    }",
  },
} as const;
