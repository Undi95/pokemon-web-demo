// AUTO-GENERATED from include/item_menu.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/item_menu.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const ITEMMENU_SWAP_LINE_LENGTH = 8;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_ITEMMENULOCATION_0 = {
  ITEMMENULOCATION_FIELD: 0,
  ITEMMENULOCATION_BATTLE: 1,
  ITEMMENULOCATION_PARTY: 2,
  ITEMMENULOCATION_SHOP: 3,
  ITEMMENULOCATION_BERRY_TREE: 4,
  ITEMMENULOCATION_BERRY_BLENDER_CRUSH: 5,
  ITEMMENULOCATION_ITEMPC: 6,
  ITEMMENULOCATION_FAVOR_LADY: 7,
  ITEMMENULOCATION_QUIZ_LADY: 8,
  ITEMMENULOCATION_APPRENTICE: 9,
  ITEMMENULOCATION_WALLY: 10,
  ITEMMENULOCATION_PCBOX: 11,
  ITEMMENULOCATION_LAST: 12,
} as const;
export const ENUM_ITEMWIN_1 = {
  ITEMWIN_1x1: 0,
  ITEMWIN_1x2: 1,
  ITEMWIN_2x2: 2,
  ITEMWIN_2x3: 3,
  ITEMWIN_MESSAGE: 4,
  ITEMWIN_YESNO_LOW: 5,
  ITEMWIN_YESNO_HIGH: 6,
  ITEMWIN_QUANTITY: 7,
  ITEMWIN_QUANTITY_WIDE: 8,
  ITEMWIN_MONEY: 9,
  ITEMWIN_COUNT: 10,
} as const;
export const ENUM_ITEMMENUSPRITE_2 = {
  ITEMMENUSPRITE_BAG: 0,
  ITEMMENUSPRITE_BALL: 1,
  ITEMMENUSPRITE_ITEM: 2,
  ITEMMENUSPRITE_ITEM_ALT: 3,
  ITEMMENUSPRITE_SWAP_LINE: 4,
  ITEMMENUSPRITE_COUNT: 5,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_GoToItemDepositMenu', ret: "void", arity: 0, params: "void" },
  { name: 'FavorLadyOpenBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'QuizLadyOpenBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ApprenticeOpenBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_BagMenuFromBattle', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePocketListPosition', ret: "void", arity: 1, params: "u8 pocketId" },
  { name: 'CB2_ReturnToBagMenuPocket', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_BagMenuFromStartMenu', ret: "void", arity: 0, params: "void" },
  { name: 'GetItemListPosition', ret: "u8", arity: 1, params: "u8 pocketId" },
  { name: 'UseRegisteredKeyItemOnField', ret: "bool8", arity: 0, params: "void" },
  { name: 'CB2_GoToSellMenu', ret: "void", arity: 0, params: "void" },
  { name: 'GoToBagMenu', ret: "void", arity: 3, params: "u8 location, u8 pocket, MainCallback exitCallback" },
  { name: 'DoWallyTutorialBagMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ResetBagScrollPositions', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseBerryForMachine', ret: "void", arity: 1, params: "MainCallback exitCallback" },
  { name: 'CB2_ChooseBerry', ret: "void", arity: 0, params: "void" },
  { name: 'Task_FadeAndCloseBagMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'BagMenu_YesNo', ret: "void", arity: 3, params: "u8 taskId, u8 windowType, const struct YesNoFuncTable *funcTable" },
  { name: 'UpdatePocketItemList', ret: "void", arity: 1, params: "u8 pocketId" },
  { name: 'DisplayItemMessage', ret: "void", arity: 4, params: "u8 taskId, u8 fontId, const u8 *str, TaskFunc callback" },
  { name: 'DisplayItemMessageOnField', ret: "void", arity: 3, params: "u8 taskId, const u8 *string, TaskFunc callback" },
  { name: 'CloseItemMessage', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_FadeAndCloseBagMenu',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_BagMenuFromBattle',
  'CB2_BagMenuFromStartMenu',
  'CB2_ChooseBerry',
  'CB2_GoToItemDepositMenu',
  'CB2_GoToSellMenu',
  'CB2_ReturnToBagMenuPocket',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'item.h',
  'main.h',
  'menu_helpers.h',
] as const;
