// AUTO-GENERATED from src/item.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/item.c
// Generated: 2026-04-26

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct BagPocket", name: 'gBagPockets', isArray: true, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CheckPyramidBagHasItem', ret: "bool8", arity: 2, params: "u16 itemId, u16 count" },
  { name: 'CheckPyramidBagHasSpace', ret: "bool8", arity: 2, params: "u16 itemId, u16 count" },
  { name: 'GetBagItemQuantity', ret: "u16", arity: 1, params: "u16 *quantity" },
  { name: 'SetBagItemQuantity', ret: "void", arity: 2, params: "u16 *quantity, u16 newValue" },
  { name: 'GetPCItemQuantity', ret: "u16", arity: 1, params: "u16 *quantity" },
  { name: 'SetPCItemQuantity', ret: "void", arity: 2, params: "u16 *quantity, u16 newValue" },
  { name: 'ApplyNewEncryptionKeyToBagItems', ret: "void", arity: 1, params: "u32 newKey" },
  { name: 'ApplyNewEncryptionKeyToBagItems_', ret: "void", arity: 1, params: "u32 newKey" },
  { name: 'SetBagItemsPointers', ret: "void", arity: 0, params: "void" },
  { name: 'CopyItemName', ret: "void", arity: 2, params: "u16 itemId, u8 *dst" },
  { name: 'CopyItemNameHandlePlural', ret: "void", arity: 3, params: "u16 itemId, u8 *dst, u32 quantity" },
  { name: 'StringCopy', ret: "else", arity: 2, params: "dst, gText_PokeBalls" },
  { name: 'GetBerryCountString', ret: "void", arity: 3, params: "u8 *dst, const u8 *berryName, u32 quantity" },
  { name: 'IsBagPocketNonEmpty', ret: "bool8", arity: 1, params: "u8 pocket" },
  { name: 'CheckBagHasItem', ret: "bool8", arity: 2, params: "u16 itemId, u16 count" },
  { name: 'HasAtLeastOneBerry', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckBagHasSpace', ret: "bool8", arity: 2, params: "u16 itemId, u16 count" },
  { name: 'AddBagItem', ret: "bool8", arity: 2, params: "u16 itemId, u16 count" },
  { name: 'RemoveBagItem', ret: "bool8", arity: 2, params: "u16 itemId, u16 count" },
  { name: 'GetPocketByItemId', ret: "u8", arity: 1, params: "u16 itemId" },
  { name: 'ClearItemSlots', ret: "void", arity: 2, params: "struct ItemSlot *itemSlots, u8 itemCount" },
  { name: 'FindFreePCItemSlot', ret: "s32", arity: 0, params: "void" },
  { name: 'CountUsedPCItemSlots', ret: "u8", arity: 0, params: "void" },
  { name: 'CheckPCHasItem', ret: "bool8", arity: 2, params: "u16 itemId, u16 count" },
  { name: 'AddPCItem', ret: "bool8", arity: 2, params: "u16 itemId, u16 count" },
  { name: 'RemovePCItem', ret: "void", arity: 2, params: "u8 index, u16 count" },
  { name: 'CompactPCItems', ret: "void", arity: 0, params: "void" },
  { name: 'SwapRegisteredBike', ret: "void", arity: 0, params: "void" },
  { name: 'BagGetItemIdByPocketPosition', ret: "u16", arity: 2, params: "u8 pocketId, u16 pocketPos" },
  { name: 'BagGetQuantityByPocketPosition', ret: "u16", arity: 2, params: "u8 pocketId, u16 pocketPos" },
  { name: 'SwapItemSlots', ret: "void", arity: 2, params: "struct ItemSlot *a, struct ItemSlot *b" },
  { name: 'CompactItemsInBagPocket', ret: "void", arity: 1, params: "struct BagPocket *bagPocket" },
  { name: 'SortBerriesOrTMHMs', ret: "void", arity: 1, params: "struct BagPocket *bagPocket" },
  { name: 'MoveItemSlotInList', ret: "void", arity: 3, params: "struct ItemSlot *itemSlots_, u32 from, u32 to_" },
  { name: 'ClearBag', ret: "void", arity: 0, params: "void" },
  { name: 'CountTotalItemQuantityInBag', ret: "u16", arity: 1, params: "u16 itemId" },
  { name: 'AddPyramidBagItem', ret: "bool8", arity: 2, params: "u16 itemId, u16 count" },
  { name: 'RemovePyramidBagItem', ret: "bool8", arity: 2, params: "u16 itemId, u16 count" },
  { name: 'SanitizeItemId', ret: "u16", arity: 1, params: "u16 itemId" },
  { name: 'GetItemId', ret: "u16", arity: 1, params: "u16 itemId" },
  { name: 'GetItemPrice', ret: "u16", arity: 1, params: "u16 itemId" },
  { name: 'GetItemHoldEffect', ret: "u8", arity: 1, params: "u16 itemId" },
  { name: 'GetItemHoldEffectParam', ret: "u8", arity: 1, params: "u16 itemId" },
  { name: 'GetItemImportance', ret: "u8", arity: 1, params: "u16 itemId" },
  { name: 'GetItemRegistrability', ret: "u8", arity: 1, params: "u16 itemId" },
  { name: 'GetItemPocket', ret: "u8", arity: 1, params: "u16 itemId" },
  { name: 'GetItemType', ret: "u8", arity: 1, params: "u16 itemId" },
  { name: 'GetItemFieldFunc', ret: "ItemUseFunc", arity: 1, params: "u16 itemId" },
  { name: 'GetItemBattleUsage', ret: "u8", arity: 1, params: "u16 itemId" },
  { name: 'GetItemBattleFunc', ret: "ItemUseFunc", arity: 1, params: "u16 itemId" },
  { name: 'GetItemSecondaryId', ret: "u8", arity: 1, params: "u16 itemId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'item.h',
  'berry.h',
  'string_util.h',
  'text.h',
  'event_data.h',
  'malloc.h',
  'secret_base.h',
  'item_menu.h',
  'strings.h',
  'load_save.h',
  'item_use.h',
  'battle_pyramid.h',
  'battle_pyramid_bag.h',
  'constants/items.h',
  'constants/hold_effects.h',
  'data/text/item_descriptions.h',
  'data/items.h',
] as const;
