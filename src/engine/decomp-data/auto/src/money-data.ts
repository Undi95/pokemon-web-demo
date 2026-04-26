// AUTO-GENERATED from src/money.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/money.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MAX_MONEY = 999999;
export const MONEY_LABEL_TAG = 10018;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_MoneyLabel = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_MoneyLabel = { tileTag: "MONEY_LABEL_TAG", paletteTag: "MONEY_LABEL_TAG", oam: "&sOamData_MoneyLabel", anims: "sSpriteAnimTable_MoneyLabel", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheet_MoneyLabel = { data: "gShopMenuMoney_Gfx", size: 256, tag: "MONEY_LABEL_TAG" } as const;

// ─── CompressedSpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalette_MoneyLabel = { data: "gShopMenu_Pal", tag: "MONEY_LABEL_TAG" } as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sMoneyBoxWindowId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sMoneyLabelSpriteId', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'GetMoney', ret: "u32", arity: 1, params: "u32 *moneyPtr" },
  { name: 'SetMoney', ret: "void", arity: 2, params: "u32 *moneyPtr, u32 newValue" },
  { name: 'IsEnoughMoney', ret: "bool8", arity: 2, params: "u32 *moneyPtr, u32 cost" },
  { name: 'AddMoney', ret: "void", arity: 2, params: "u32 *moneyPtr, u32 toAdd" },
  { name: 'RemoveMoney', ret: "void", arity: 2, params: "u32 *moneyPtr, u32 toSub" },
  { name: 'IsEnoughForCostInVar0x8005', ret: "bool8", arity: 0, params: "void" },
  { name: 'SubtractMoneyFromVar0x8005', ret: "void", arity: 0, params: "void" },
  { name: 'PrintMoneyAmountInMoneyBox', ret: "void", arity: 3, params: "u8 windowId, int amount, u8 speed" },
  { name: 'PrintMoneyAmount', ret: "void", arity: 5, params: "u8 windowId, u8 x, u8 y, int amount, u8 speed" },
  { name: 'PrintMoneyAmountInMoneyBoxWithBorder', ret: "void", arity: 4, params: "u8 windowId, u16 tileStart, u8 pallete, int amount" },
  { name: 'ChangeAmountInMoneyBox', ret: "void", arity: 1, params: "int amount" },
  { name: 'DrawMoneyBox', ret: "void", arity: 3, params: "int amount, u8 x, u8 y" },
  { name: 'HideMoneyBox', ret: "void", arity: 0, params: "void" },
  { name: 'AddMoneyLabelObject', ret: "void", arity: 2, params: "u16 x, u16 y" },
  { name: 'RemoveMoneyLabelObject', ret: "void", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'money.h',
  'graphics.h',
  'event_data.h',
  'string_util.h',
  'text.h',
  'menu.h',
  'window.h',
  'sprite.h',
  'strings.h',
  'decompress.h',
] as const;
