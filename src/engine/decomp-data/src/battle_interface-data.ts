// AUTO-GENERATED from src/battle_interface.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_interface.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `data[5]` */
export const hMain_HealthBarSpriteId_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const hMain_Battler_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const hMain_Data7_EXPR = "data[7]";
/** Raw expr: `data[5]` */
export const hOther_HealthBoxSpriteId_EXPR = "data[5]";
/** Raw expr: `data[5]` */
export const hBar_HealthBoxSpriteId_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const hBar_Data6_EXPR = "data[6]";
/** Raw expr: `data[0]` */
export const tBattler_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tSummaryBarSpriteId_EXPR = "data[1]";
/** Raw expr: `data[10]` */
export const tIsBattleStart_EXPR = "data[10]";
/** Raw expr: `data[15]` */
export const tBlend_EXPR = "data[15]";
export const B_EXPBAR_PIXELS = 64;
export const B_HEALTHBAR_PIXELS = 48;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_HEALTHBOX_0 = {
  HEALTHBOX_GFX_0: 0,
  HEALTHBOX_GFX_1: 1,
  HEALTHBOX_GFX_2: 2,
  HEALTHBOX_GFX_HP_BAR_GREEN: 3,
  HEALTHBOX_GFX_4: 4,
  HEALTHBOX_GFX_5: 5,
  HEALTHBOX_GFX_6: 6,
  HEALTHBOX_GFX_7: 7,
  HEALTHBOX_GFX_8: 8,
  HEALTHBOX_GFX_9: 9,
  HEALTHBOX_GFX_10: 10,
  HEALTHBOX_GFX_11: 11,
  HEALTHBOX_GFX_12: 12,
  HEALTHBOX_GFX_13: 13,
  HEALTHBOX_GFX_14: 14,
  HEALTHBOX_GFX_15: 15,
  HEALTHBOX_GFX_16: 16,
  HEALTHBOX_GFX_17: 17,
  HEALTHBOX_GFX_18: 18,
  HEALTHBOX_GFX_19: 19,
  HEALTHBOX_GFX_20: 20,
  HEALTHBOX_GFX_STATUS_PSN_BATTLER0: 21,
  HEALTHBOX_GFX_22: 22,
  HEALTHBOX_GFX_23: 23,
  HEALTHBOX_GFX_STATUS_PRZ_BATTLER0: 24,
  HEALTHBOX_GFX_25: 25,
  HEALTHBOX_GFX_26: 26,
  HEALTHBOX_GFX_STATUS_SLP_BATTLER0: 27,
  HEALTHBOX_GFX_28: 28,
  HEALTHBOX_GFX_29: 29,
  HEALTHBOX_GFX_STATUS_FRZ_BATTLER0: 30,
  HEALTHBOX_GFX_31: 31,
  HEALTHBOX_GFX_32: 32,
  HEALTHBOX_GFX_STATUS_BRN_BATTLER0: 33,
  HEALTHBOX_GFX_34: 34,
  HEALTHBOX_GFX_35: 35,
  HEALTHBOX_GFX_36: 36,
  HEALTHBOX_GFX_37: 37,
  HEALTHBOX_GFX_38: 38,
  HEALTHBOX_GFX_39: 39,
  HEALTHBOX_GFX_40: 40,
  HEALTHBOX_GFX_41: 41,
  HEALTHBOX_GFX_42: 42,
  HEALTHBOX_GFX_43: 43,
  HEALTHBOX_GFX_44: 44,
  HEALTHBOX_GFX_45: 45,
  HEALTHBOX_GFX_46: 46,
  HEALTHBOX_GFX_HP_BAR_YELLOW: 47,
  HEALTHBOX_GFX_48: 48,
  HEALTHBOX_GFX_49: 49,
  HEALTHBOX_GFX_50: 50,
  HEALTHBOX_GFX_51: 51,
  HEALTHBOX_GFX_52: 52,
  HEALTHBOX_GFX_53: 53,
  HEALTHBOX_GFX_54: 54,
  HEALTHBOX_GFX_55: 55,
  HEALTHBOX_GFX_HP_BAR_RED: 56,
  HEALTHBOX_GFX_57: 57,
  HEALTHBOX_GFX_58: 58,
  HEALTHBOX_GFX_59: 59,
  HEALTHBOX_GFX_60: 60,
  HEALTHBOX_GFX_61: 61,
  HEALTHBOX_GFX_62: 62,
  HEALTHBOX_GFX_63: 63,
  HEALTHBOX_GFX_64: 64,
  HEALTHBOX_GFX_65: 65,
  HEALTHBOX_GFX_STATUS_BALL: 66,
  HEALTHBOX_GFX_STATUS_BALL_EMPTY: 67,
  HEALTHBOX_GFX_STATUS_BALL_FAINTED: 68,
  HEALTHBOX_GFX_STATUS_BALL_STATUSED: 69,
  HEALTHBOX_GFX_STATUS_BALL_CAUGHT: 70,
  HEALTHBOX_GFX_STATUS_PSN_BATTLER1: 71,
  HEALTHBOX_GFX_72: 72,
  HEALTHBOX_GFX_73: 73,
  HEALTHBOX_GFX_STATUS_PRZ_BATTLER1: 74,
  HEALTHBOX_GFX_75: 75,
  HEALTHBOX_GFX_76: 76,
  HEALTHBOX_GFX_STATUS_SLP_BATTLER1: 77,
  HEALTHBOX_GFX_78: 78,
  HEALTHBOX_GFX_79: 79,
  HEALTHBOX_GFX_STATUS_FRZ_BATTLER1: 80,
  HEALTHBOX_GFX_81: 81,
  HEALTHBOX_GFX_82: 82,
  HEALTHBOX_GFX_STATUS_BRN_BATTLER1: 83,
  HEALTHBOX_GFX_84: 84,
  HEALTHBOX_GFX_85: 85,
  HEALTHBOX_GFX_STATUS_PSN_BATTLER2: 86,
  HEALTHBOX_GFX_87: 87,
  HEALTHBOX_GFX_88: 88,
  HEALTHBOX_GFX_STATUS_PRZ_BATTLER2: 89,
  HEALTHBOX_GFX_90: 90,
  HEALTHBOX_GFX_91: 91,
  HEALTHBOX_GFX_STATUS_SLP_BATTLER2: 92,
  HEALTHBOX_GFX_93: 93,
  HEALTHBOX_GFX_94: 94,
  HEALTHBOX_GFX_STATUS_FRZ_BATTLER2: 95,
  HEALTHBOX_GFX_96: 96,
  HEALTHBOX_GFX_97: 97,
  HEALTHBOX_GFX_STATUS_BRN_BATTLER2: 98,
  HEALTHBOX_GFX_99: 99,
  HEALTHBOX_GFX_100: 100,
  HEALTHBOX_GFX_STATUS_PSN_BATTLER3: 101,
  HEALTHBOX_GFX_102: 102,
  HEALTHBOX_GFX_103: 103,
  HEALTHBOX_GFX_STATUS_PRZ_BATTLER3: 104,
  HEALTHBOX_GFX_105: 105,
  HEALTHBOX_GFX_106: 106,
  HEALTHBOX_GFX_STATUS_SLP_BATTLER3: 107,
  HEALTHBOX_GFX_108: 108,
  HEALTHBOX_GFX_109: 109,
  HEALTHBOX_GFX_STATUS_FRZ_BATTLER3: 110,
  HEALTHBOX_GFX_111: 111,
  HEALTHBOX_GFX_112: 112,
  HEALTHBOX_GFX_STATUS_BRN_BATTLER3: 113,
  HEALTHBOX_GFX_114: 114,
  HEALTHBOX_GFX_115: 115,
  HEALTHBOX_GFX_FRAME_END: 116,
  HEALTHBOX_GFX_FRAME_END_BAR: 117,
} as const;
export const ENUM_PAL_1 = {
  PAL_STATUS_PSN: 0,
  PAL_STATUS_PAR: 1,
  PAL_STATUS_SLP: 2,
  PAL_STATUS_FRZ: 3,
  PAL_STATUS_BRN: 4,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sHealthboxWindowTemplate = { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 8, height: 2, paletteNum: 0, baseBlock: 0 } as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_64x32 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Healthbar = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x8)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Unused64x32 = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_StatusSummaryBalls = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sHealthboxPlayerSpriteTemplates = [
  { tileTag: "TAG_HEALTHBOX_PLAYER1_TILE", paletteTag: "TAG_HEALTHBOX_PAL", oam: "&sOamData_64x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_HEALTHBOX_PLAYER2_TILE", paletteTag: "TAG_HEALTHBOX_PAL", oam: "&sOamData_64x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
] as const;
export const sHealthboxOpponentSpriteTemplates = [
  { tileTag: "TAG_HEALTHBOX_OPPONENT1_TILE", paletteTag: "TAG_HEALTHBOX_PAL", oam: "&sOamData_64x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
  { tileTag: "TAG_HEALTHBOX_OPPONENT2_TILE", paletteTag: "TAG_HEALTHBOX_PAL", oam: "&sOamData_64x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" },
] as const;
export const sHealthboxSafariSpriteTemplate = { tileTag: "TAG_HEALTHBOX_SAFARI_TILE", paletteTag: "TAG_HEALTHBOX_PAL", oam: "&sOamData_64x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sHealthbarSpriteTemplates = [
  { tileTag: "TAG_HEALTHBAR_PLAYER1_TILE", paletteTag: "TAG_HEALTHBAR_PAL", oam: "&sOamData_Healthbar", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_HealthBar" },
  { tileTag: "TAG_HEALTHBAR_OPPONENT1_TILE", paletteTag: "TAG_HEALTHBAR_PAL", oam: "&sOamData_Healthbar", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_HealthBar" },
  { tileTag: "TAG_HEALTHBAR_PLAYER2_TILE", paletteTag: "TAG_HEALTHBAR_PAL", oam: "&sOamData_Healthbar", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_HealthBar" },
  { tileTag: "TAG_HEALTHBAR_OPPONENT2_TILE", paletteTag: "TAG_HEALTHBAR_PAL", oam: "&sOamData_Healthbar", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_HealthBar" },
] as const;
export const sStatusSummaryBarSpriteTemplates = [
  { tileTag: "TAG_STATUS_SUMMARY_BAR_TILE", paletteTag: "TAG_STATUS_SUMMARY_BAR_PAL", oam: "&sOamData_64x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_StatusSummaryBar_Enter" },
  { tileTag: "TAG_STATUS_SUMMARY_BAR_TILE", paletteTag: "TAG_STATUS_SUMMARY_BAR_PAL", oam: "&sOamData_64x32", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_StatusSummaryBar_Enter" },
] as const;
export const sStatusSummaryBallsSpriteTemplates = [
  { tileTag: "TAG_STATUS_SUMMARY_BALLS_TILE", paletteTag: "TAG_STATUS_SUMMARY_BALLS_PAL", oam: "&sOamData_StatusSummaryBalls", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_StatusSummaryBalls_Enter" },
  { tileTag: "TAG_STATUS_SUMMARY_BALLS_TILE", paletteTag: "TAG_STATUS_SUMMARY_BALLS_PAL", oam: "&sOamData_StatusSummaryBalls", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_StatusSummaryBalls_Enter" },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sUnusedStatusSummary': { path: 'graphics/battle_interface/unused_status_summary.png', ext: '.4bpp', type: 'u8' },
};

// ─── Inline palettes (RGB(r,g,b) → RGB888 ×8) ───────────────────────────────
export const sStatusIconColors_COLORS = [{r:192,g:96,b:192}, {r:184,g:184,b:24}, {r:160,g:160,b:136}, {r:136,g:176,b:224}, {r:224,g:112,b:80}] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'RemoveWindowOnHealthbox', ret: "void", arity: 1, params: "u32 windowId" },
  { name: 'UpdateHpTextInHealthboxInDoubles', ret: "void", arity: 3, params: "u8, s16, u8" },
  { name: 'UpdateStatusIconInHealthbox', ret: "void", arity: 1, params: "u8" },
  { name: 'TextIntoHealthboxObject', ret: "void", arity: 3, params: "void *, u8 *, s32" },
  { name: 'SafariTextIntoHealthboxObject', ret: "void", arity: 3, params: "void *, u8 *, u32" },
  { name: 'HpTextIntoHealthboxObject', ret: "void", arity: 3, params: "void *, u8 *, u32" },
  { name: 'FillHealthboxObject', ret: "void", arity: 3, params: "void *, u32, u32" },
  { name: 'Task_HidePartyStatusSummary_BattleStart_1', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HidePartyStatusSummary_BattleStart_2', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HidePartyStatusSummary_DuringBattle', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_HealthBoxOther', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_HealthBar', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_StatusSummaryBar_Enter', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_StatusSummaryBar_Exit', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_StatusSummaryBalls_Enter', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_StatusSummaryBalls_Exit', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_StatusSummaryBalls_OnSwitchout', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'GetStatusIconForBattlerId', ret: "u8", arity: 2, params: "u8, u8" },
  { name: 'CalcNewBarValue', ret: "s32", arity: 6, params: "s32, s32, s32, s32 *, u8, u16" },
  { name: 'GetScaledExpFraction', ret: "u8", arity: 4, params: "s32, s32, s32, u8" },
  { name: 'MoveBattleBarGraphically', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'CalcBarFilledPixels', ret: "u8", arity: 6, params: "s32, s32, s32, s32 *, u8 *, u8" },
  { name: 'Debug_TestHealthBar_Helper', ret: "void", arity: 3, params: "struct TestingBar *, s32 *, u16 *" },
  { name: 'DummiedOutFunction', ret: "s32", arity: 3, params: "s16 unused1, s16 unused2, s32 unused3" },
  { name: 'Debug_DrawNumber', ret: "void", arity: 3, params: "s16 number, u16 *dest, bool8 unk" },
  { name: 'Debug_DrawNumberPair', ret: "UNUSED", arity: 3, params: "s16 number1, s16 number2, u16 *dest" },
  { name: 'CreateBattlerHealthboxSprites', ret: "u8", arity: 1, params: "u8 battler" },
  { name: 'CreateSafariPlayerHealthboxSprites', ret: "u8", arity: 0, params: "void" },
  { name: 'SetBattleBarStruct', ret: "void", arity: 5, params: "u8 battler, u8 healthboxSpriteId, s32 maxVal, s32 oldVal, s32 receivedValue" },
  { name: 'SetHealthboxSpriteInvisible', ret: "void", arity: 1, params: "u8 healthboxSpriteId" },
  { name: 'SetHealthboxSpriteVisible', ret: "void", arity: 1, params: "u8 healthboxSpriteId" },
  { name: 'UpdateSpritePos', ret: "void", arity: 3, params: "u8 spriteId, s16 x, s16 y" },
  { name: 'DestoryHealthboxSprite', ret: "void", arity: 1, params: "u8 healthboxSpriteId" },
  { name: 'DummyBattleInterfaceFunc', ret: "void", arity: 2, params: "u8 healthboxSpriteId, bool8 isDoubleBattleBattlerOnly" },
  { name: 'UpdateOamPriorityInAllHealthboxes', ret: "void", arity: 1, params: "u8 priority" },
  { name: 'InitBattlerHealthboxCoords', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'UpdateLvlInHealthbox', ret: "void", arity: 2, params: "u8 healthboxSpriteId, u8 lvl" },
  { name: 'UpdateHpTextInHealthbox', ret: "void", arity: 3, params: "u8 healthboxSpriteId, s16 value, u8 maxOrCurrent" },
  { name: 'PrintSafariMonInfo', ret: "void", arity: 2, params: "u8 healthboxSpriteId, struct Pokemon *mon" },
  { name: 'SwapHpBarsWithHpText', ret: "void", arity: 0, params: "void" },
  { name: 'CreatePartyStatusSummarySprites', ret: "u8", arity: 4, params: "u8 battler, struct HpAndStatus *partyInfo, bool8 skipPlayer, bool8 isBattleStart" },
  { name: 'Task_HidePartyStatusSummary', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PlaySE1WithPanning', ret: "else", arity: 2, params: "SE_BALL_TRAY_BALL, pan" },
  { name: 'UpdateNickInHealthbox', ret: "void", arity: 2, params: "u8 healthboxSpriteId, struct Pokemon *mon" },
  { name: 'TryAddPokeballIconToHealthbox', ret: "void", arity: 2, params: "u8 healthboxSpriteId, bool8 noStatus" },
  { name: 'UpdateSafariBallsTextOnHealthbox', ret: "void", arity: 1, params: "u8 healthboxSpriteId" },
  { name: 'UpdateLeftNoOfBallsTextOnHealthbox', ret: "void", arity: 1, params: "u8 healthboxSpriteId" },
  { name: 'UpdateHealthboxAttribute', ret: "void", arity: 3, params: "u8 healthboxSpriteId, struct Pokemon *mon, u8 elementId" },
  { name: 'MoveBattleBar', ret: "s32", arity: 4, params: "u8 battler, u8 healthboxSpriteId, u8 whichBar, u8 unused" },
  { name: 'Debug_TestHealthBar', ret: "UNUSED", arity: 4, params: "struct TestingBar *barInfo, s32 *currValue, u16 *dest, s32 unused" },
  { name: 'GetScaledHPFraction', ret: "u8", arity: 3, params: "s16 hp, s16 maxhp, u8 scale" },
  { name: 'GetHPBarLevel', ret: "u8", arity: 2, params: "s16 hp, s16 maxhp" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_HidePartyStatusSummary',
  'Task_HidePartyStatusSummary_BattleStart_1',
  'Task_HidePartyStatusSummary_BattleStart_2',
  'Task_HidePartyStatusSummary_DuringBattle',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'pokemon.h',
  'battle_controllers.h',
  'battle_interface.h',
  'graphics.h',
  'sprite.h',
  'window.h',
  'string_util.h',
  'text.h',
  'sound.h',
  'decompress.h',
  'task.h',
  'util.h',
  'gpu_regs.h',
  'battle_message.h',
  'pokedex.h',
  'palette.h',
  'international_string_util.h',
  'safari_zone.h',
  'battle_anim.h',
  'data.h',
  'pokemon_summary_screen.h',
  'strings.h',
  'constants/battle_anim.h',
  'constants/rgb.h',
  'constants/songs.h',
] as const;
