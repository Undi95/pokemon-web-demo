// AUTO-GENERATED from include/mystery_gift_menu.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/mystery_gift_menu.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetMysteryGiftBaseBlock', ret: "u16", arity: 0, params: "void" },
  { name: 'CB2_MysteryGiftEReader', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMysteryGiftOrEReaderHeader', ret: "void", arity: 2, params: "bool8 isEReader, bool32 useCancel" },
  { name: 'MG_DrawCheckerboardPattern', ret: "void", arity: 1, params: "u32 bg" },
  { name: 'MainCB_FreeAllBuffersAndReturnToInitTitleScreen', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMysteryGiftMenuMessage', ret: "bool32", arity: 2, params: "u8 *textState, const u8 *str" },
  { name: 'MG_AddMessageTextPrinter', ret: "void", arity: 1, params: "const u8 *str" },
  { name: 'CB2_InitEReader', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_InitMysteryGift', ret: "void", arity: 0, params: "void" },
  { name: 'MG_DrawTextBorder', ret: "void", arity: 1, params: "u8 windowId" },
  { name: 'DoMysteryGiftYesNo', ret: "s8", arity: 4, params: "u8 *textState, u16 *windowId, bool8 yesNoBoxPlacement, const u8 *str" },
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitEReader',
  'CB2_InitMysteryGift',
  'CB2_MysteryGiftEReader',
] as const;
