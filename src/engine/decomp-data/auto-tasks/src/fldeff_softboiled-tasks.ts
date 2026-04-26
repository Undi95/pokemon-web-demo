// AUTO-GENERATED from src/fldeff_softboiled.c by extract-decomp-task-machines.mjs
// Do not edit manually — re-run `npm run extract:task-machines` to refresh.
//
// Generated: 2026-04-26
// Stats: 5 Task_, 0 CB2_, 0 SpriteCB_

export const TASKS = {
  "Task_TryUseSoftboiledOnPartyMon": {
    callsTo: ["CantUseSoftboiledOnMon","DisplayPartyMenuStdMessage","GetMonData","PartyMenuModifyHP","PlaySE"],
    taskTransitions: ["Task_HandleChooseMonInput"],
    lineCount: 18,
    bodyC: "u16 hp;\n\n    u8 userPartyId = gPartyMenu.slotId;\n    u8 recipientPartyId = gPartyMenu.slotId2;\n    if(recipientPartyId > PARTY_SIZE)\n    {\n        gPartyMenu.action = 0;\n        DisplayPartyMenuStdMessage(PARTY_MSG_CHOOSE_MON);\n        gTasks[taskId].func = Task_HandleChooseMonInput;\n        return;\n    }\n\n    hp = GetMonData(&gPlayerParty[recipientPartyId], MON_DATA_HP);\n    if(hp == 0 || userPartyId == recipientPartyId || GetMonData(&gPlayerParty[recipientPartyId], MON_DATA_MAX_HP) == hp)\n    {\n        CantUseSoftboiledOnMon(taskId);\n        return;\n    }\n\n     \n    PlaySE(SE_USE_ITEM);\n    PartyMenuModifyHP(taskId, userPartyId, -1, GetMonData(&gPlayerParty[userPartyId], MON_DATA_MAX_HP)/5, Task_SoftboiledRestoreHealth);",
  },
  "Task_SoftboiledRestoreHealth": {
    callsTo: ["GetMonData","PartyMenuModifyHP","PlaySE"],
    lineCount: 2,
    bodyC: "PlaySE(SE_USE_ITEM);\n    PartyMenuModifyHP(taskId, gPartyMenu.slotId2, 1, GetMonData(&gPlayerParty[gPartyMenu.slotId], MON_DATA_MAX_HP)/5, Task_DisplayHPRestoredMessage);",
  },
  "Task_DisplayHPRestoredMessage": {
    callsTo: ["DisplayPartyMenuMessage","GetMonNickname","ScheduleBgCopyTilemapToVram","StringExpandPlaceholders"],
    taskTransitions: ["Task_FinishSoftboiled"],
    lineCount: 5,
    bodyC: "GetMonNickname(&gPlayerParty[gPartyMenu.slotId2], gStringVar1);\n    StringExpandPlaceholders(gStringVar4, gText_PkmnHPRestoredByVar2);\n    DisplayPartyMenuMessage(gStringVar4, FALSE);\n    ScheduleBgCopyTilemapToVram(2);\n    gTasks[taskId].func = Task_FinishSoftboiled;",
  },
  "Task_FinishSoftboiled": {
    callsTo: ["AnimatePartySlot","ClearStdWindowAndFrameToTransparent","ClearWindowTilemap","DisplayPartyMenuStdMessage","IsPartyMenuTextPrinterActive"],
    taskTransitions: ["Task_HandleChooseMonInput"],
    lineCount: 10,
    bodyC: "if(IsPartyMenuTextPrinterActive() == TRUE)\n        return;\n    gPartyMenu.action = 0;\n    AnimatePartySlot(gPartyMenu.slotId, 0);\n    gPartyMenu.slotId = gPartyMenu.slotId2;\n    AnimatePartySlot(gPartyMenu.slotId2, 1);\n    ClearStdWindowAndFrameToTransparent(6, FALSE);\n    ClearWindowTilemap(6);\n    DisplayPartyMenuStdMessage(PARTY_MSG_CHOOSE_MON);\n    gTasks[taskId].func = Task_HandleChooseMonInput;",
  },
  "Task_ChooseNewMonForSoftboiled": {
    callsTo: ["DisplayPartyMenuStdMessage","IsPartyMenuTextPrinterActive"],
    taskTransitions: ["Task_HandleChooseMonInput"],
    lineCount: 4,
    bodyC: "if(IsPartyMenuTextPrinterActive() == TRUE)\n        return;\n    DisplayPartyMenuStdMessage(PARTY_MSG_USE_ON_WHICH_MON);\n    gTasks[taskId].func = Task_HandleChooseMonInput;",
  },
} as const;
