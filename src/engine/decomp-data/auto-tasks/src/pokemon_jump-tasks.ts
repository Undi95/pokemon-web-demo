// AUTO-GENERATED from src/pokemon_jump.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-27
// Stats: 7 Task_, 1 CB2_, 4 SpriteCB_

export const TASKS = {
  "Task_StartPokemonJump": {
    callsTo: ["BeginNormalPaletteFade","BlendPalettes","CreateWirelessStatusIndicatorSprite","DestroyTask","FadeOutAndPlayNewMapMusic","FadeOutMapMusic","FreeAllSpritePalettes","FuncIsActiveTask","InitVineState","IsLinkTaskFinished","IsNotWaitingForBGMStop","IsPokeJumpGfxFuncFinished","LoadWirelessStatusIndicatorSpriteGfx","ResetSpriteData","SetPokeJumpTask","SetTaskWithPokeJumpStruct","SetVBlankCallback","StartPokeJumpGfx","UpdatePaletteFade"],
    terminalMarkers: ["DestroyTask"],
    externalChecks: { paletteFade: true },
    lineCount: 56,
    bodyC: "switch (sPokemonJump->mainState)\n    {\n    case 0:\n        SetVBlankCallback(NULL);\n        ResetSpriteData();\n        FreeAllSpritePalettes();\n        SetTaskWithPokeJumpStruct(Task_CommunicateMonInfo, 5);\n        FadeOutMapMusic(4);\n        sPokemonJump->mainState++;\n        break;\n    case 1:\n        if (!FuncIsActiveTask(Task_CommunicateMonInfo))\n        {\n            StartPokeJumpGfx(&sPokemonJump->jumpGfx);\n            LoadWirelessStatusIndicatorSpriteGfx();\n            CreateWirelessStatusIndicatorSprite(0, 0);\n            sPokemonJump->mainState++;\n        }\n        break;\n    case 2:\n        if (!IsPokeJumpGfxFuncFinished() && IsNotWaitingForBGMStop() == TRUE)\n        {\n            FadeOutAndPlayNewMapMusic(MUS_RG_POKE_JUMP, 8);\n            sPokemonJump->mainState++;\n        }\n        break;\n    case 3:\n        if (IsLinkTaskFinished())\n        {\n            BlendPalettes(PALETTES_ALL, 16, RGB_BLACK);\n            BeginNormalPaletteFade(PALETTES_ALL, -1, 16, 0, RGB_BLACK);\n            SetVBlankCallback(VBlankCB_PokemonJump);\n            sPokemonJump->mainState++;\n        }\n        break;\n    case 4:\n        UpdatePaletteFade();\n        if (!gPaletteFade.active)\n        {\n            sPokemonJump->startDelayTimer = 0;\n            sPokemonJump->mainState++;\n        }\n        break;\n    case 5:\n        sPokemonJump->startDelayTimer++;\n        if (sPokemonJump->startDelayTimer >= 20)\n        {\n            if (sPokemonJump->isLeader)\n                SetPokeJumpTask(Task_PokemonJump_Leader);\n            else\n                SetPokeJumpTask(Task_PokemonJump_Member);\n\n            InitVineState();\n            DestroyTask(taskId);\n        }\n        break;\n    }",
  },
  "Task_PokemonJump_Leader": {
    callsTo: ["RecvLinkData_Leader","SendLinkData_Leader","SetFunc_Leader","SetLinkTimeInterval","TryUpdateScore","UpdateGame"],
    lineCount: 17,
    bodyC: "RecvLinkData_Leader();\n    TryUpdateScore();\n    if (!sPokemonJump->funcActive && sPokemonJump->allPlayersReady)\n    {\n        SetFunc_Leader(sPokemonJump->nextFuncId);\n        SetLinkTimeInterval(LINK_INTERVAL_SHORT);\n    }\n\n    if (sPokemonJump->funcActive == TRUE)\n    {\n        if (!sPokeJumpLeaderFuncs[sPokemonJump->comm.funcId]())\n        {\n            sPokemonJump->funcActive = FALSE;\n            sPokemonJump->players[sPokemonJump->multiplayerId].funcFinished = TRUE;\n        }\n    }\n\n    UpdateGame();\n    SendLinkData_Leader();",
  },
  "Task_PokemonJump_Member": {
    callsTo: ["RecvLinkData_Member","SendLinkData_Member","SetLinkTimeInterval","UpdateGame"],
    lineCount: 12,
    bodyC: "RecvLinkData_Member();\n    if (sPokemonJump->funcActive)\n    {\n        if (!sPokeJumpMemberFuncs[sPokemonJump->comm.funcId]())\n        {\n            sPokemonJump->funcActive = FALSE;\n            sPokemonJump->players[sPokemonJump->multiplayerId].funcFinished = TRUE;\n            SetLinkTimeInterval(LINK_INTERVAL_SHORT);\n        }\n    }\n\n    UpdateGame();\n    SendLinkData_Member();",
  },
  "Task_CommunicateMonInfo": {
    callsTo: ["DestroyTask","GetWordTaskArg","InitPlayerAndJumpTypes","RecvPacket_MonInfo","SendPacket_MonInfo","StringCopy","tReceivedPacket"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 28,
    bodyC: "int i;\n    s16 *data = gTasks[taskId].data;\n    struct PokemonJump *jump = (struct PokemonJump *)GetWordTaskArg(taskId, DATAIDX_GAME_STRUCT);\n\n    switch (tState)\n    {\n    case 0:\n        for (i = 0; i < MAX_RFU_PLAYERS; i++)\n            tReceivedPacket(i) = FALSE;\n\n        tState++;\n         \n    case 1:\n        SendPacket_MonInfo(&jump->monInfo[jump->multiplayerId]);\n        for (i = 0; i < MAX_RFU_PLAYERS; i++)\n        {\n            if (!tReceivedPacket(i) && RecvPacket_MonInfo(i, &jump->monInfo[i]))\n            {\n                StringCopy(jump->players[i].name, gLinkPlayers[i].name);\n                tReceivedPacket(i) = TRUE;\n                tNumReceived++;\n                if (tNumReceived == jump->numPlayers)\n                {\n                    InitPlayerAndJumpTypes();\n                    DestroyTask(taskId);\n                    break;\n                }\n            }\n        }\n        break;\n    }",
  },
  "Task_RunPokeJumpGfxFunc": {
    callsTo: ["GetWordTaskArg","func"],
    lineCount: 5,
    bodyC: "if (!sPokemonJumpGfx->funcFinished)\n    {\n         \n        void (*func)(void) = (void *)(GetWordTaskArg(taskId, 0));\n\n        func();\n    }",
  },
  "Task_UpdateBonus": {
    callsTo: ["DestroyTask","UpdateBonus"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 2,
    bodyC: "if (!UpdateBonus())\n        DestroyTask(taskId);",
  },
  "Task_ShowPokemonJumpRecords": {
    callsTo: ["ARRAY_COUNT","AddWindow","CopyWindowToVram","DestroyTask","GetStringWidth","IsDma3ManagerBusyWithBgCopy","JOY_NEW","PrintRecordsText","RemoveWindow","ScriptContext_Enable","rbox_fill_rectangle"],
    terminalMarkers: ["DestroyTask"],
    lineCount: 45,
    bodyC: "struct WindowTemplate window;\n    int i, width, widthCurr;\n    s16 *data = gTasks[taskId].data;\n\n    switch (tState)\n    {\n    case 0:\n        window = sWindowTemplate_Records;\n        width = GetStringWidth(FONT_NORMAL, gText_PkmnJumpRecords, 0);\n        for (i = 0; i < ARRAY_COUNT(sRecordsTexts); i++)\n        {\n            widthCurr = GetStringWidth(FONT_NORMAL, sRecordsTexts[i], 0) + 38;\n            if (widthCurr > width)\n                width = widthCurr;\n        }\n        width = (width + 7) / 8;\n        if (width & 1)\n            width++;\n        window.tilemapLeft = (30 - width) / 2;\n        window.width = width;\n        tWindowId = AddWindow(&window);\n        PrintRecordsText(tWindowId, width);\n        CopyWindowToVram(tWindowId, COPYWIN_FULL);\n        tState++;\n        break;\n    case 1:\n        if (!IsDma3ManagerBusyWithBgCopy())\n            tState++;\n        break;\n    case 2:\n        if (JOY_NEW(A_BUTTON | B_BUTTON))\n        {\n            rbox_fill_rectangle(tWindowId);\n            CopyWindowToVram(tWindowId, COPYWIN_MAP);\n            tState++;\n        }\n        break;\n    case 3:\n        if (!IsDma3ManagerBusyWithBgCopy())\n        {\n            RemoveWindow(tWindowId);\n            DestroyTask(taskId);\n            ScriptContext_Enable();\n        }\n        break;\n    }",
  },
} as const;

export const CB2S = {
  "CB2_PokemonJump": {
    callsTo: ["AnimateSprites","BuildOamBuffer","RunTasks","UpdatePaletteFade"],
    externalChecks: { waitForVBlank: true },
    lineCount: 4,
    bodyC: "RunTasks();\n    AnimateSprites();\n    BuildOamBuffer();\n    UpdatePaletteFade();",
  },
} as const;

export const SPRITE_CBS = {
  "SpriteCB_Star": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 26,
    bodyC: "switch (sprite->sState)\n    {\n    case 0:\n        if (sprite->animEnded)\n        {\n            sprite->invisible = TRUE;\n            sprite->callback = SpriteCallbackDummy;\n        }\n        break;\n    case 1:\n        sprite->y--;\n        sprite->sTimer++;\n        if (sprite->y <= 72)\n        {\n            sprite->y = 72;\n            sprite->sState++;\n        }\n        break;\n    case 2:\n        if (++sprite->sTimer >= 48)\n        {\n            sprite->invisible = TRUE;\n            sprite->callback = SpriteCallbackDummy;\n        }\n        break;\n    }",
  },
  "SpriteCB_MonHitShake": {
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 13,
    bodyC: "if (++sprite->sTimer > 1)\n    {\n        if (++sprite->sNumShakes & 1)\n            sprite->y2 = 2;\n        else\n            sprite->y2 = -2;\n\n        sprite->sTimer = 0;\n    }\n\n    if (sprite->sNumShakes > 12)\n    {\n        sprite->y2 = 0;\n        sprite->callback = SpriteCallbackDummy;\n    }",
  },
  "SpriteCB_MonHitFlash": {
    lineCount: 5,
    bodyC: "if (++sprite->sTimer > 3)\n    {\n        sprite->sTimer = 0;\n        sprite->invisible ^= 1;\n    }",
  },
  "SpriteCB_MonIntroBounce": {
    callsTo: ["PlaySE"],
    spriteTransitions: ["SpriteCallbackDummy"],
    lineCount: 20,
    bodyC: "switch (sprite->sState)\n    {\n    case 0:\n        PlaySE(SE_BIKE_HOP);\n        sprite->sHopPos = 0;\n        sprite->sState++;\n         \n    case 1:\n        sprite->sHopPos += 4;\n        if (sprite->sHopPos > 127)\n            sprite->sHopPos = 0;\n\n        sprite->y2 = -(gSineTable[sprite->sHopPos] >> 3);\n        if (sprite->sHopPos == 0)\n        {\n            if (++sprite->sNumHops < 2)\n                sprite->sState = 0;\n            else\n                sprite->callback = SpriteCallbackDummy;\n        }\n        break;\n    }",
  },
} as const;
