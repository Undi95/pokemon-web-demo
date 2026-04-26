// AUTO-GENERATED from include/mystery_gift_view.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/mystery_gift_view.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_NEWS_0 = {
  NEWS_INPUT_A: 0,
  NEWS_INPUT_B: 1,
  NEWS_INPUT_SCROLL_UP: 2,
  NEWS_INPUT_SCROLL_DOWN: 3,
  NEWS_INPUT_NONE: 255,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'WonderCard_Init', ret: "bool32", arity: 2, params: "struct WonderCard *card, struct WonderCardMetadata *metadata" },
  { name: 'WonderNews_Init', ret: "bool32", arity: 1, params: "const struct WonderNews *news" },
  { name: 'WonderCard_Enter', ret: "s32", arity: 0, params: "void" },
  { name: 'WonderNews_Enter', ret: "s32", arity: 0, params: "void" },
  { name: 'WonderCard_Exit', ret: "s32", arity: 1, params: "bool32 useCancel" },
  { name: 'WonderNews_Exit', ret: "s32", arity: 1, params: "bool32 useCancel" },
  { name: 'WonderCard_Destroy', ret: "void", arity: 0, params: "void" },
  { name: 'WonderNews_Destroy', ret: "void", arity: 0, params: "void" },
  { name: 'WonderNews_GetInput', ret: "u32", arity: 1, params: "u16 input" },
  { name: 'WonderNews_AddScrollIndicatorArrowPair', ret: "void", arity: 0, params: "void" },
  { name: 'WonderNews_RemoveScrollIndicatorArrowPair', ret: "void", arity: 0, params: "void" },
] as const;
