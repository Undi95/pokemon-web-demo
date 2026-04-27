// AUTO-GENERATED from src/dynamic_placeholder_text_util.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 4

export const ENGINE_FUNCTIONS = {
  "DynamicPlaceholderTextUtil_ExpandPlaceholders": {
    returnType: "u8 *",
    params: "u8 *dest, const u8 *src",
    callsTo: ["StringCopy"],
    lineCount: 18,
    bodyC: "while (*src != EOS)\n    {\n        if (*src != CHAR_DYNAMIC)\n        {\n            *dest++ = *src++;\n        }\n        else\n        {\n            src++;\n            if (sStringPointers[*src] != NULL)\n            {\n                dest = StringCopy(dest, sStringPointers[*src]);\n            }\n            src++;\n        }\n    }\n    *dest = EOS;\n    return dest;",
  },
  "DynamicPlaceholderTextUtil_GetPlaceholderPtr": {
    returnType: "const u8 *",
    params: "u8 idx",
    lineCount: 1,
    bodyC: "return sStringPointers[idx];",
  },
  "DynamicPlaceholderTextUtil_Reset": {
    returnType: "void",
    params: "void",
    callsTo: ["ARRAY_COUNT"],
    lineCount: 3,
    bodyC: "int i;\n    for (i = 0; i < (int)ARRAY_COUNT(sStringPointers); i++)\n        sStringPointers[i] = NULL;",
  },
  "DynamicPlaceholderTextUtil_SetPlaceholderPtr": {
    returnType: "void",
    params: "u8 idx, const u8 *ptr",
    callsTo: ["ARRAY_COUNT"],
    lineCount: 4,
    bodyC: "if (idx < ARRAY_COUNT(sStringPointers))\n    {\n        sStringPointers[idx] = ptr;\n    }",
  },
} as const;
