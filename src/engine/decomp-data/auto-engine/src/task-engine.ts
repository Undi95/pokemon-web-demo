// AUTO-GENERATED from src/task.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 14

export const ENGINE_FUNCTIONS = {
  "CreateTask": {
    returnType: "u8",
    params: "TaskFunc func, u8 priority",
    callsTo: ["InsertTask","memset"],
    lineCount: 14,
    bodyC: "u8 i;\n\n    for (i = 0; i < NUM_TASKS; i++)\n    {\n        if (!gTasks[i].isActive)\n        {\n            gTasks[i].func = func;\n            gTasks[i].priority = priority;\n            InsertTask(i);\n            memset(gTasks[i].data, 0, sizeof(gTasks[i].data));\n            gTasks[i].isActive = TRUE;\n            return i;\n        }\n    }\n\n    return 0;",
  },
  "DestroyTask": {
    returnType: "void",
    params: "u8 taskId",
    lineCount: 21,
    bodyC: "if (gTasks[taskId].isActive)\n    {\n        gTasks[taskId].isActive = FALSE;\n\n        if (gTasks[taskId].prev == HEAD_SENTINEL)\n        {\n            if (gTasks[taskId].next != TAIL_SENTINEL)\n                gTasks[gTasks[taskId].next].prev = HEAD_SENTINEL;\n        }\n        else\n        {\n            if (gTasks[taskId].next == TAIL_SENTINEL)\n            {\n                gTasks[gTasks[taskId].prev].next = TAIL_SENTINEL;\n            }\n            else\n            {\n                gTasks[gTasks[taskId].prev].next = gTasks[taskId].next;\n                gTasks[gTasks[taskId].next].prev = gTasks[taskId].prev;\n            }\n        }\n    }",
  },
  "FindFirstActiveTask": {
    returnType: "static u8",
    params: "void",
    lineCount: 5,
    bodyC: "u8 taskId;\n\n    for (taskId = 0; taskId < NUM_TASKS; taskId++)\n        if (gTasks[taskId].isActive == TRUE && gTasks[taskId].prev == HEAD_SENTINEL)\n            break;\n\n    return taskId;",
  },
  "FindTaskIdByFunc": {
    returnType: "u8",
    params: "TaskFunc func",
    lineCount: 5,
    bodyC: "s32 i;\n\n    for (i = 0; i < NUM_TASKS; i++)\n        if (gTasks[i].isActive == TRUE && gTasks[i].func == func)\n            return (u8)i;\n\n    return TASK_NONE;",
  },
  "FuncIsActiveTask": {
    returnType: "bool8",
    params: "TaskFunc func",
    lineCount: 5,
    bodyC: "u8 i;\n\n    for (i = 0; i < NUM_TASKS; i++)\n        if (gTasks[i].isActive == TRUE && gTasks[i].func == func)\n            return TRUE;\n\n    return FALSE;",
  },
  "GetTaskCount": {
    returnType: "u8",
    params: "void",
    lineCount: 6,
    bodyC: "u8 i;\n    u8 count = 0;\n\n    for (i = 0; i < NUM_TASKS; i++)\n        if (gTasks[i].isActive == TRUE)\n            count++;\n\n    return count;",
  },
  "GetWordTaskArg": {
    returnType: "u32",
    params: "u8 taskId, u8 dataElem",
    lineCount: 4,
    bodyC: "if (dataElem < NUM_TASK_DATA - 1)\n        return (u16)gTasks[taskId].data[dataElem] | (gTasks[taskId].data[dataElem + 1] << 16);\n    else\n        return 0;",
  },
  "InsertTask": {
    returnType: "static void",
    params: "u8 newTaskId",
    callsTo: ["FindFirstActiveTask"],
    lineCount: 27,
    bodyC: "u8 taskId = FindFirstActiveTask();\n\n    if (taskId == NUM_TASKS)\n    {\n         \n        gTasks[newTaskId].prev = HEAD_SENTINEL;\n        gTasks[newTaskId].next = TAIL_SENTINEL;\n        return;\n    }\n\n    while (1)\n    {\n        if (gTasks[newTaskId].priority < gTasks[taskId].priority)\n        {\n             \n             \n            gTasks[newTaskId].prev = gTasks[taskId].prev;\n            gTasks[newTaskId].next = taskId;\n            if (gTasks[taskId].prev != HEAD_SENTINEL)\n                gTasks[gTasks[taskId].prev].next = newTaskId;\n            gTasks[taskId].prev = newTaskId;\n            return;\n        }\n        if (gTasks[taskId].next == TAIL_SENTINEL)\n        {\n             \n            gTasks[newTaskId].prev = taskId;\n            gTasks[newTaskId].next = gTasks[taskId].next;\n            gTasks[taskId].next = newTaskId;\n            return;\n        }\n        taskId = gTasks[taskId].next;\n    }",
  },
  "ResetTasks": {
    returnType: "void",
    params: "void",
    callsTo: ["memset"],
    lineCount: 12,
    bodyC: "u8 i;\n\n    for (i = 0; i < NUM_TASKS; i++)\n    {\n        gTasks[i].isActive = FALSE;\n        gTasks[i].func = TaskDummy;\n        gTasks[i].prev = i;\n        gTasks[i].next = i + 1;\n        gTasks[i].priority = -1;\n        memset(gTasks[i].data, 0, sizeof(gTasks[i].data));\n    }\n\n    gTasks[0].prev = HEAD_SENTINEL;\n    gTasks[NUM_TASKS - 1].next = TAIL_SENTINEL;",
  },
  "RunTasks": {
    returnType: "void",
    params: "void",
    callsTo: ["FindFirstActiveTask","func"],
    lineCount: 9,
    bodyC: "u8 taskId = FindFirstActiveTask();\n\n    if (taskId != NUM_TASKS)\n    {\n        do\n        {\n            gTasks[taskId].func(taskId);\n            taskId = gTasks[taskId].next;\n        } while (taskId != TAIL_SENTINEL);\n    }",
  },
  "SetTaskFuncWithFollowupFunc": {
    returnType: "void",
    params: "u8 taskId, TaskFunc func, TaskFunc followupFunc",
    lineCount: 4,
    bodyC: "u8 followupFuncIndex = NUM_TASK_DATA - 2;  \n\n    gTasks[taskId].data[followupFuncIndex] = (s16)((u32)followupFunc);\n    gTasks[taskId].data[followupFuncIndex + 1] = (s16)((u32)followupFunc >> 16);  \n    gTasks[taskId].func = func;",
  },
  "SetWordTaskArg": {
    returnType: "void",
    params: "u8 taskId, u8 dataElem, u32 value",
    lineCount: 5,
    bodyC: "if (dataElem < NUM_TASK_DATA - 1)\n    {\n        gTasks[taskId].data[dataElem] = value;\n        gTasks[taskId].data[dataElem + 1] = value >> 16;\n    }",
  },
  "SwitchTaskToFollowupFunc": {
    returnType: "void",
    params: "u8 taskId",
    lineCount: 2,
    bodyC: "u8 followupFuncIndex = NUM_TASK_DATA - 2;  \n\n    gTasks[taskId].func = (TaskFunc)((u16)(gTasks[taskId].data[followupFuncIndex]) | (gTasks[taskId].data[followupFuncIndex + 1] << 16));",
  },
  "TaskDummy": {
    returnType: "void",
    params: "u8 taskId",
    lineCount: 0,
    bodyC: "",
  },
} as const;
