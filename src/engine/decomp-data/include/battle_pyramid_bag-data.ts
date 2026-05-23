// AUTO-GENERATED from include/battle_pyramid_bag.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/battle_pyramid_bag.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `(1 + PBAG_SPRITE_SWAP_LINE_END - PBAG_SPRITE_SWAP_LINE_START)` */
export const NUM_SWAP_LINE_SPRITES_EXPR = "(1 + PBAG_SPRITE_SWAP_LINE_END - PBAG_SPRITE_SWAP_LINE_START)";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_PYRAMIDBAG_0 = {
  PYRAMIDBAG_LOC_FIELD: 0,
  PYRAMIDBAG_LOC_BATTLE: 1,
  PYRAMIDBAG_LOC_PARTY: 2,
  PYRAMIDBAG_LOC_CHOOSE_TOSS: 3,
  PYRAMIDBAG_LOC_PREV: 4,
} as const;
export const ENUM_PBAG_1 = {
  PBAG_SPRITE_BAG: 0,
  PBAG_SPRITE_ITEM_ICON: 1,
  PBAG_SPRITE_ITEM_ICON_ALT: 2,
  PBAG_SPRITE_SWAP_LINE_START: 3,
  PBAG_SPRITE_SWAP_LINE_2: 4,
  PBAG_SPRITE_SWAP_LINE_3: 5,
  PBAG_SPRITE_SWAP_LINE_4: 6,
  PBAG_SPRITE_SWAP_LINE_5: 7,
  PBAG_SPRITE_SWAP_LINE_6: 8,
  PBAG_SPRITE_SWAP_LINE_7: 9,
  PBAG_SPRITE_SWAP_LINE_END: 10,
  PBAG_SPRITE_COUNT: 11,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitBattlePyramidBagCursorPosition', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_PyramidBagMenuFromStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToPyramidBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePyramidBagList', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePyramidBagCursorPos', ret: "void", arity: 0, params: "void" },
  { name: 'GoToBattlePyramidBagMenu', ret: "void", arity: 2, params: "u8 location, MainCallback exitCallback" },
  { name: 'Task_CloseBattlePyramidBagMessage', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'TryStoreHeldItemsInPyramidBag', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseItemsToTossFromPyramidBag', ret: "void", arity: 0, params: "void" },
  { name: 'CloseBattlePyramidBag', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DisplayItemMessageInBattlePyramid', ret: "void", arity: 3, params: "u8 taskId, const u8 *str, TaskFunc callback" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_CloseBattlePyramidBagMessage',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_PyramidBagMenuFromStartMenu',
  'CB2_ReturnToPyramidBagMenu',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'list_menu.h',
  'main.h',
  'task.h',
] as const;
