// AUTO-GENERATED from include/item_menu_icons.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/item_menu_icons.h
// Generated: 2026-04-26

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'RemoveBagSprite', ret: "void", arity: 1, params: "u8 id" },
  { name: 'AddBagVisualSprite', ret: "void", arity: 1, params: "u8 bagPocketId" },
  { name: 'SetBagVisualPocketId', ret: "void", arity: 2, params: "u8 bagPocketId, bool8 isSwitchingPockets" },
  { name: 'ShakeBagSprite', ret: "void", arity: 0, params: "void" },
  { name: 'AddSwitchPocketRotatingBallSprite', ret: "void", arity: 1, params: "s16 rotationDirection" },
  { name: 'AddBagItemIconSprite', ret: "void", arity: 2, params: "u16 itemId, u8 id" },
  { name: 'RemoveBagItemIconSprite', ret: "void", arity: 1, params: "u8 id" },
  { name: 'CreateItemMenuSwapLine', ret: "void", arity: 0, params: "void" },
  { name: 'SetItemMenuSwapLineInvisibility', ret: "void", arity: 1, params: "bool8 invisible" },
  { name: 'UpdateItemMenuSwapLinePos', ret: "void", arity: 1, params: "u8 y" },
  { name: 'CreateBerryTagSprite', ret: "u8", arity: 3, params: "u8 id, s16 x, s16 y" },
  { name: 'FreeBerryTagSpritePalette', ret: "void", arity: 0, params: "void" },
  { name: 'CreateSpinningBerrySprite', ret: "u8", arity: 4, params: "u8 berryId, u8 x, u8 y, bool8 startAffine" },
  { name: 'CreateBerryFlavorCircleSprite', ret: "u8", arity: 1, params: "s16 x" },
] as const;
