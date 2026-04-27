// AUTO-GENERATED from src/random.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 4

export const ENGINE_FUNCTIONS = {
  "Random": {
    returnType: "u16",
    params: "void",
    callsTo: ["ISO_RANDOMIZE1"],
    lineCount: 3,
    bodyC: "gRngValue = ISO_RANDOMIZE1(gRngValue);\n    sRandCount++;\n    return gRngValue >> 16;",
  },
  "Random2": {
    returnType: "u16",
    params: "void",
    callsTo: ["ISO_RANDOMIZE1"],
    lineCount: 2,
    bodyC: "gRng2Value = ISO_RANDOMIZE1(gRng2Value);\n    return gRng2Value >> 16;",
  },
  "SeedRng": {
    returnType: "void",
    params: "u16 seed",
    lineCount: 2,
    bodyC: "gRngValue = seed;\n    sUnknown = 0;",
  },
  "SeedRng2": {
    returnType: "void",
    params: "u16 seed",
    lineCount: 1,
    bodyC: "gRng2Value = seed;",
  },
} as const;
