// AUTO-GENERATED from src/field_message_box.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 15

export const ENGINE_FUNCTIONS = {
  "CreateTask_DrawFieldMessage": {
    returnType: "static void",
    params: "void",
    callsTo: ["CreateTask"],
    lineCount: 1,
    bodyC: "CreateTask(Task_DrawFieldMessage, 0x50);",
  },
  "DestroyTask_DrawFieldMessage": {
    returnType: "static void",
    params: "void",
    callsTo: ["DestroyTask","FindTaskIdByFunc"],
    lineCount: 3,
    bodyC: "u8 taskId = FindTaskIdByFunc(Task_DrawFieldMessage);\n    if (taskId != TASK_NONE)\n        DestroyTask(taskId);",
  },
  "ExpandStringAndStartDrawFieldMessage": {
    returnType: "static void",
    params: "const u8 *str, bool32 allowSkippingDelayWithButtonPress",
    callsTo: ["AddTextPrinterForMessage","CreateTask_DrawFieldMessage","StringExpandPlaceholders"],
    lineCount: 3,
    bodyC: "StringExpandPlaceholders(gStringVar4, str);\n    AddTextPrinterForMessage(allowSkippingDelayWithButtonPress);\n    CreateTask_DrawFieldMessage();",
  },
  "GetFieldMessageBoxMode": {
    returnType: "u8",
    params: "void",
    lineCount: 1,
    bodyC: "return sFieldMessageBoxMode;",
  },
  "HideFieldMessageBox": {
    returnType: "void",
    params: "void",
    callsTo: ["ClearDialogWindowAndFrame","DestroyTask_DrawFieldMessage"],
    lineCount: 3,
    bodyC: "DestroyTask_DrawFieldMessage();\n    ClearDialogWindowAndFrame(0, TRUE);\n    sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;",
  },
  "InitFieldMessageBox": {
    returnType: "void",
    params: "void",
    lineCount: 5,
    bodyC: "sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;\n    gTextFlags.canABSpeedUpPrint = FALSE;\n    gTextFlags.useAlternateDownArrow = FALSE;\n    gTextFlags.autoScroll = FALSE;\n    gTextFlags.forceMidTextSpeed = FALSE;",
  },
  "IsFieldMessageBoxHidden": {
    returnType: "bool8",
    params: "void",
    lineCount: 3,
    bodyC: "if (sFieldMessageBoxMode == FIELD_MESSAGE_BOX_HIDDEN)\n        return TRUE;\n    return FALSE;",
  },
  "ShowFieldAutoScrollMessage": {
    returnType: "bool8",
    params: "const u8 *str",
    callsTo: ["ExpandStringAndStartDrawFieldMessage"],
    lineCount: 5,
    bodyC: "if (sFieldMessageBoxMode != FIELD_MESSAGE_BOX_HIDDEN)\n        return FALSE;\n    sFieldMessageBoxMode = FIELD_MESSAGE_BOX_AUTO_SCROLL;\n    ExpandStringAndStartDrawFieldMessage(str, FALSE);\n    return TRUE;",
  },
  "ShowFieldMessage": {
    returnType: "bool8",
    params: "const u8 *str",
    callsTo: ["ExpandStringAndStartDrawFieldMessage"],
    lineCount: 5,
    bodyC: "if (sFieldMessageBoxMode != FIELD_MESSAGE_BOX_HIDDEN)\n        return FALSE;\n    ExpandStringAndStartDrawFieldMessage(str, TRUE);\n    sFieldMessageBoxMode = FIELD_MESSAGE_BOX_NORMAL;\n    return TRUE;",
  },
  "ShowFieldMessageFromBuffer": {
    returnType: "bool8",
    params: "void",
    callsTo: ["StartDrawFieldMessage"],
    lineCount: 5,
    bodyC: "if (sFieldMessageBoxMode != FIELD_MESSAGE_BOX_HIDDEN)\n        return FALSE;\n    sFieldMessageBoxMode = FIELD_MESSAGE_BOX_NORMAL;\n    StartDrawFieldMessage();\n    return TRUE;",
  },
  "ShowPokenavFieldMessage": {
    returnType: "bool8",
    params: "const u8 *str",
    callsTo: ["CreateTask","StartMatchCallFromScript","StringExpandPlaceholders"],
    lineCount: 7,
    bodyC: "if (sFieldMessageBoxMode != FIELD_MESSAGE_BOX_HIDDEN)\n        return FALSE;\n    StringExpandPlaceholders(gStringVar4, str);\n    CreateTask(Task_HidePokenavMessageWhenDone, 0);\n    StartMatchCallFromScript(str);\n    sFieldMessageBoxMode = FIELD_MESSAGE_BOX_NORMAL;\n    return TRUE;",
  },
  "StartDrawFieldMessage": {
    returnType: "static void",
    params: "void",
    callsTo: ["AddTextPrinterForMessage","CreateTask_DrawFieldMessage"],
    lineCount: 2,
    bodyC: "AddTextPrinterForMessage(TRUE);\n    CreateTask_DrawFieldMessage();",
  },
  "StopFieldMessage": {
    returnType: "void",
    params: "void",
    callsTo: ["DestroyTask_DrawFieldMessage"],
    lineCount: 2,
    bodyC: "DestroyTask_DrawFieldMessage();\n    sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;",
  },
  "Task_DrawFieldMessage": {
    returnType: "static void",
    params: "u8 taskId",
    callsTo: ["DestroyTask","DrawDialogueFrame","LoadMessageBoxAndBorderGfx","RunTextPrintersAndIsPrinter0Active"],
    lineCount: 18,
    bodyC: "struct Task *task = &gTasks[taskId];\n\n    switch (task->tState)\n    {\n        case 0:\n            LoadMessageBoxAndBorderGfx();\n            task->tState++;\n            break;\n        case 1:\n            DrawDialogueFrame(0, TRUE);\n            task->tState++;\n            break;\n        case 2:\n            if (RunTextPrintersAndIsPrinter0Active() != TRUE)\n            {\n                sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;\n                DestroyTask(taskId);\n            }\n    }",
  },
  "Task_HidePokenavMessageWhenDone": {
    returnType: "static void",
    params: "u8 taskId",
    callsTo: ["DestroyTask","IsMatchCallTaskActive"],
    lineCount: 5,
    bodyC: "if (!IsMatchCallTaskActive())\n    {\n        sFieldMessageBoxMode = FIELD_MESSAGE_BOX_HIDDEN;\n        DestroyTask(taskId);\n    }",
  },
} as const;
