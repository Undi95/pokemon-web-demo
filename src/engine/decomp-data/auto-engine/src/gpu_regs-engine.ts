// AUTO-GENERATED from src/gpu_regs.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 12

export const ENGINE_FUNCTIONS = {
  "ClearGpuRegBits": {
    returnType: "void",
    params: "u8 regOffset, u16 mask",
    callsTo: ["GPU_REG_BUF","SetGpuReg"],
    lineCount: 2,
    bodyC: "u16 regValue = GPU_REG_BUF(regOffset);\n    SetGpuReg(regOffset, regValue & ~mask);",
  },
  "CopyBufferedValueToGpuReg": {
    returnType: "static void",
    params: "u8 regOffset",
    callsTo: ["GPU_REG","GPU_REG_BUF"],
    lineCount: 9,
    bodyC: "if (regOffset == REG_OFFSET_DISPSTAT)\n    {\n        REG_DISPSTAT &= ~(DISPSTAT_HBLANK_INTR | DISPSTAT_VBLANK_INTR);\n        REG_DISPSTAT |= GPU_REG_BUF(REG_OFFSET_DISPSTAT);\n    }\n    else\n    {\n        GPU_REG(regOffset) = GPU_REG_BUF(regOffset);\n    }",
  },
  "CopyBufferedValuesToGpuRegs": {
    returnType: "void",
    params: "void",
    callsTo: ["CopyBufferedValueToGpuReg"],
    lineCount: 12,
    bodyC: "if (!sGpuRegBufferLocked)\n    {\n        s32 i;\n\n        for (i = 0; i < GPU_REG_BUF_SIZE; i++)\n        {\n            u8 regOffset = sGpuRegWaitingList[i];\n            if (regOffset == EMPTY_SLOT)\n                return;\n            CopyBufferedValueToGpuReg(regOffset);\n            sGpuRegWaitingList[i] = EMPTY_SLOT;\n        }\n    }",
  },
  "DisableInterrupts": {
    returnType: "void",
    params: "u16 mask",
    callsTo: ["SyncRegIE","UpdateRegDispstatIntrBits"],
    lineCount: 4,
    bodyC: "sRegIE &= ~mask;\n    sShouldSyncRegIE = TRUE;\n    SyncRegIE();\n    UpdateRegDispstatIntrBits(sRegIE);",
  },
  "EnableInterrupts": {
    returnType: "void",
    params: "u16 mask",
    callsTo: ["SyncRegIE","UpdateRegDispstatIntrBits"],
    lineCount: 4,
    bodyC: "sRegIE |= mask;\n    sShouldSyncRegIE = TRUE;\n    SyncRegIE();\n    UpdateRegDispstatIntrBits(sRegIE);",
  },
  "GetGpuReg": {
    returnType: "u16",
    params: "u8 regOffset",
    callsTo: ["GPU_REG_BUF"],
    lineCount: 5,
    bodyC: "if (regOffset == REG_OFFSET_DISPSTAT)\n        return REG_DISPSTAT;\n\n    if (regOffset == REG_OFFSET_VCOUNT)\n        return REG_VCOUNT;\n\n    return GPU_REG_BUF(regOffset);",
  },
  "InitGpuRegManager": {
    returnType: "void",
    params: "void",
    lineCount: 9,
    bodyC: "s32 i;\n\n    for (i = 0; i < GPU_REG_BUF_SIZE; i++)\n    {\n        sGpuRegBuffer[i] = 0;\n        sGpuRegWaitingList[i] = EMPTY_SLOT;\n    }\n\n    sGpuRegBufferLocked = FALSE;\n    sShouldSyncRegIE = FALSE;\n    sRegIE = 0;",
  },
  "SetGpuReg": {
    returnType: "void",
    params: "u8 regOffset, u16 value",
    callsTo: ["CopyBufferedValueToGpuReg","GPU_REG_BUF"],
    lineCount: 25,
    bodyC: "if (regOffset < GPU_REG_BUF_SIZE)\n    {\n        u16 vcount;\n\n        GPU_REG_BUF(regOffset) = value;\n        vcount = REG_VCOUNT & 0xFF;\n\n        if ((vcount >= 161 && vcount <= 225) || (REG_DISPCNT & DISPCNT_FORCED_BLANK))\n        {\n            CopyBufferedValueToGpuReg(regOffset);\n        }\n        else\n        {\n            s32 i;\n\n            sGpuRegBufferLocked = TRUE;\n\n            for (i = 0; i < GPU_REG_BUF_SIZE && sGpuRegWaitingList[i] != EMPTY_SLOT; i++)\n            {\n                if (sGpuRegWaitingList[i] == regOffset)\n                {\n                    sGpuRegBufferLocked = FALSE;\n                    return;\n                }\n            }\n\n            sGpuRegWaitingList[i] = regOffset;\n            sGpuRegBufferLocked = FALSE;\n        }\n    }",
  },
  "SetGpuRegBits": {
    returnType: "void",
    params: "u8 regOffset, u16 mask",
    callsTo: ["GPU_REG_BUF","SetGpuReg"],
    lineCount: 2,
    bodyC: "u16 regValue = GPU_REG_BUF(regOffset);\n    SetGpuReg(regOffset, regValue | mask);",
  },
  "SetGpuReg_ForcedBlank": {
    returnType: "void",
    params: "u8 regOffset, u16 value",
    callsTo: ["CopyBufferedValueToGpuReg","GPU_REG_BUF"],
    lineCount: 23,
    bodyC: "if (regOffset < GPU_REG_BUF_SIZE)\n    {\n        GPU_REG_BUF(regOffset) = value;\n\n        if (REG_DISPCNT & DISPCNT_FORCED_BLANK)\n        {\n            CopyBufferedValueToGpuReg(regOffset);\n        }\n        else\n        {\n            s32 i;\n\n            sGpuRegBufferLocked = TRUE;\n\n            for (i = 0; i < GPU_REG_BUF_SIZE && sGpuRegWaitingList[i] != EMPTY_SLOT; i++)\n            {\n                if (sGpuRegWaitingList[i] == regOffset)\n                {\n                    sGpuRegBufferLocked = FALSE;\n                    return;\n                }\n            }\n\n            sGpuRegWaitingList[i] = regOffset;\n            sGpuRegBufferLocked = FALSE;\n        }\n    }",
  },
  "SyncRegIE": {
    returnType: "static void",
    params: "void",
    lineCount: 8,
    bodyC: "if (sShouldSyncRegIE)\n    {\n        u16 temp = REG_IME;\n        REG_IME = 0;\n        REG_IE = sRegIE;\n        REG_IME = temp;\n        sShouldSyncRegIE = FALSE;\n    }",
  },
  "UpdateRegDispstatIntrBits": {
    returnType: "static void",
    params: "u16 regIE",
    callsTo: ["GetGpuReg","SetGpuReg"],
    lineCount: 8,
    bodyC: "u16 oldValue = GetGpuReg(REG_OFFSET_DISPSTAT) & (DISPSTAT_HBLANK_INTR | DISPSTAT_VBLANK_INTR);\n    u16 newValue = 0;\n\n    if (regIE & INTR_FLAG_VBLANK)\n        newValue |= DISPSTAT_VBLANK_INTR;\n\n    if (regIE & INTR_FLAG_HBLANK)\n        newValue |= DISPSTAT_HBLANK_INTR;\n\n    if (oldValue != newValue)\n        SetGpuReg(REG_OFFSET_DISPSTAT, newValue);",
  },
} as const;
