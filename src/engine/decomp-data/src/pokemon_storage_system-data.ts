// AUTO-GENERATED from src/pokemon_storage_system.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokemon_storage_system.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `MENU_SCENERY_1` */
export const MENU_WALLPAPER_SETS_START_EXPR = "MENU_SCENERY_1";
/** Raw expr: `MENU_FOREST` */
export const MENU_WALLPAPERS_START_EXPR = "MENU_FOREST";
/** Raw expr: `CURSOR_AREA_BOX_TITLE` */
export const CURSOR_AREA_IN_HAND_EXPR = "CURSOR_AREA_BOX_TITLE";
export const BOXID_NONE_CHOSEN = 200;
export const BOXID_CANCELED = 201;
/** Raw expr: `max(IN_BOX_COUNT + PARTY_SIZE + 1, 40)` */
export const MAX_MON_ICONS_EXPR = "max(IN_BOX_COUNT + PARTY_SIZE + 1, 40)";
export const MAX_ITEM_ICONS = 3;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tSelectedOption_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tInput_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tNextOption_EXPR = "data[3]";
/** Raw expr: `data[15]` */
export const tWindowId_EXPR = "data[15]";
/** Raw expr: `data[1]` */
export const sDistance_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sSpeed_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sScrollInDestX_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sDelay_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sScrollOutX_EXPR = "data[5]";
/** Raw expr: `data[1]` */
export const sPartyId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sMonX_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sMonY_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sSpeedX_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sSpeedY_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sMoveSteps_EXPR = "data[6]";
/** Raw expr: `data[1]` */
export const tDmaIdx_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tBoxId_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const sIncomingX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sIncomingDelay_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const sOutgoingDelay_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sOutgoingX_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sTimer_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sItemIconId_EXPR = "data[0]";
/** Raw expr: `data[6]` */
export const sCursorArea_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sCursorPos_EXPR = "data[7]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_OPTION_0 = {
  OPTION_WITHDRAW: 0,
  OPTION_DEPOSIT: 1,
  OPTION_MOVE_MONS: 2,
  OPTION_MOVE_ITEMS: 3,
  OPTION_EXIT: 4,
  OPTIONS_COUNT: 5,
} as const;
export const ENUM_MSG_1 = {
  MSG_EXIT_BOX: 0,
  MSG_WHAT_YOU_DO: 1,
  MSG_PICK_A_THEME: 2,
  MSG_PICK_A_WALLPAPER: 3,
  MSG_IS_SELECTED: 4,
  MSG_JUMP_TO_WHICH_BOX: 5,
  MSG_DEPOSIT_IN_WHICH_BOX: 6,
  MSG_WAS_DEPOSITED: 7,
  MSG_BOX_IS_FULL: 8,
  MSG_RELEASE_POKE: 9,
  MSG_WAS_RELEASED: 10,
  MSG_BYE_BYE: 11,
  MSG_MARK_POKE: 12,
  MSG_LAST_POKE: 13,
  MSG_PARTY_FULL: 14,
  MSG_HOLDING_POKE: 15,
  MSG_WHICH_ONE_WILL_TAKE: 16,
  MSG_CANT_RELEASE_EGG: 17,
  MSG_CONTINUE_BOX: 18,
  MSG_CAME_BACK: 19,
  MSG_WORRIED: 20,
  MSG_SURPRISE: 21,
  MSG_PLEASE_REMOVE_MAIL: 22,
  MSG_IS_SELECTED2: 23,
  MSG_GIVE_TO_MON: 24,
  MSG_PLACED_IN_BAG: 25,
  MSG_BAG_FULL: 26,
  MSG_PUT_IN_BAG: 27,
  MSG_ITEM_IS_HELD: 28,
  MSG_CHANGED_TO_ITEM: 29,
  MSG_CANT_STORE_MAIL: 30,
} as const;
export const ENUM_MSG_2 = {
  MSG_VAR_NONE: 0,
  MSG_VAR_MON_NAME_1: 1,
  MSG_VAR_MON_NAME_2: 2,
  MSG_VAR_MON_NAME_3: 3,
  MSG_VAR_RELEASE_MON_1: 4,
  MSG_VAR_RELEASE_MON_2: 5,
  MSG_VAR_RELEASE_MON_3: 6,
  MSG_VAR_ITEM_NAME: 7,
} as const;
export const ENUM_MENU_3 = {
  MENU_CANCEL: 0,
  MENU_STORE: 1,
  MENU_WITHDRAW: 2,
  MENU_MOVE: 3,
  MENU_SHIFT: 4,
  MENU_PLACE: 5,
  MENU_SUMMARY: 6,
  MENU_RELEASE: 7,
  MENU_MARK: 8,
  MENU_JUMP: 9,
  MENU_WALLPAPER: 10,
  MENU_NAME: 11,
  MENU_TAKE: 12,
  MENU_GIVE: 13,
  MENU_GIVE_2: 14,
  MENU_SWITCH: 15,
  MENU_BAG: 16,
  MENU_INFO: 17,
  MENU_SCENERY_1: 18,
  MENU_SCENERY_2: 19,
  MENU_SCENERY_3: 20,
  MENU_ETCETERA: 21,
  MENU_FRIENDS: 22,
  MENU_FOREST: 23,
  MENU_CITY: 24,
  MENU_DESERT: 25,
  MENU_SAVANNA: 26,
  MENU_CRAG: 27,
  MENU_VOLCANO: 28,
  MENU_SNOW: 29,
  MENU_CAVE: 30,
  MENU_BEACH: 31,
  MENU_SEAFLOOR: 32,
  MENU_RIVER: 33,
  MENU_SKY: 34,
  MENU_POLKADOT: 35,
  MENU_POKECENTER: 36,
  MENU_MACHINE: 37,
  MENU_SIMPLE: 38,
} as const;
export const ENUM_INPUT_4 = {
  INPUT_NONE: 0,
  INPUT_MOVE_CURSOR: 1,
  INPUT_2: 2,
  INPUT_3: 3,
  INPUT_CLOSE_BOX: 4,
  INPUT_SHOW_PARTY: 5,
  INPUT_HIDE_PARTY: 6,
  INPUT_BOX_OPTIONS: 7,
  INPUT_IN_MENU: 8,
  INPUT_SCROLL_RIGHT: 9,
  INPUT_SCROLL_LEFT: 10,
  INPUT_DEPOSIT: 11,
  INPUT_WITHDRAW: 12,
  INPUT_MOVE_MON: 13,
  INPUT_SHIFT_MON: 14,
  INPUT_PLACE_MON: 15,
  INPUT_TAKE_ITEM: 16,
  INPUT_GIVE_ITEM: 17,
  INPUT_SWITCH_ITEMS: 18,
  INPUT_PRESSED_B: 19,
  INPUT_MULTIMOVE_START: 20,
  INPUT_MULTIMOVE_CHANGE_SELECTION: 21,
  INPUT_MULTIMOVE_SINGLE: 22,
  INPUT_MULTIMOVE_GRAB_SELECTION: 23,
  INPUT_MULTIMOVE_UNABLE: 24,
  INPUT_MULTIMOVE_MOVE_MONS: 25,
  INPUT_MULTIMOVE_PLACE_MONS: 26,
} as const;
export const ENUM_SCREEN_5 = {
  SCREEN_CHANGE_EXIT_BOX: 0,
  SCREEN_CHANGE_SUMMARY_SCREEN: 1,
  SCREEN_CHANGE_NAME_BOX: 2,
  SCREEN_CHANGE_ITEM_FROM_BAG: 3,
} as const;
export const ENUM_MODE_6 = {
  MODE_PARTY: 0,
  MODE_BOX: 1,
  MODE_MOVE: 2,
} as const;
export const ENUM_CURSOR_7 = {
  CURSOR_AREA_IN_BOX: 0,
  CURSOR_AREA_IN_PARTY: 1,
  CURSOR_AREA_BOX_TITLE: 2,
  CURSOR_AREA_BUTTONS: 3,
} as const;
export const ENUM_CURSOR_8 = {
  CURSOR_ANIM_BOUNCE: 0,
  CURSOR_ANIM_STILL: 1,
  CURSOR_ANIM_OPEN: 2,
  CURSOR_ANIM_FIST: 3,
} as const;
export const ENUM_PALTAG_9 = {
  PALTAG_MON_ICON_0: 0,
  PALTAG_MON_ICON_1: 1,
  PALTAG_MON_ICON_2: 2,
  PALTAG_3: 3,
  PALTAG_4: 4,
  PALTAG_5: 5,
  PALTAG_DISPLAY_MON: 6,
  PALTAG_MISC_1: 7,
  PALTAG_MARKING_COMBO: 8,
  PALTAG_BOX_TITLE: 9,
  PALTAG_MISC_2: 10,
  PALTAG_ITEM_ICON_0: 11,
  PALTAG_ITEM_ICON_1: 12,
  PALTAG_ITEM_ICON_2: 13,
  PALTAG_MARKING_MENU: 14,
} as const;
export const ENUM_GFXTAG_10 = {
  GFXTAG_CURSOR: 0,
  GFXTAG_CURSOR_SHADOW: 1,
  GFXTAG_DISPLAY_MON: 2,
  GFXTAG_BOX_TITLE: 3,
  GFXTAG_BOX_TITLE_ALT: 4,
  GFXTAG_WAVEFORM: 5,
  GFXTAG_ARROW: 6,
  GFXTAG_ITEM_ICON_0: 7,
  GFXTAG_ITEM_ICON_1: 8,
  GFXTAG_ITEM_ICON_2: 9,
  GFXTAG_CHOOSE_BOX_MENU: 10,
  GFXTAG_CHOOSE_BOX_MENU_SIDES: 11,
  GFXTAG_12: 12,
  GFXTAG_MARKING_MENU: 13,
  GFXTAG_14: 14,
  GFXTAG_15: 15,
  GFXTAG_MARKING_COMBO: 16,
  GFXTAG_17: 17,
  GFXTAG_MON_ICON: 18,
} as const;
export const ENUM_ITEM_11 = {
  ITEM_ANIM_NONE: 0,
  ITEM_ANIM_APPEAR: 1,
  ITEM_ANIM_DISAPPEAR: 2,
  ITEM_ANIM_PICK_UP: 3,
  ITEM_ANIM_PUT_DOWN: 4,
  ITEM_ANIM_PUT_AWAY: 5,
  ITEM_ANIM_LARGE: 6,
} as const;
export const ENUM_ITEM_12 = {
  ITEM_CB_WAIT_ANIM: 0,
  ITEM_CB_TO_HAND: 1,
  ITEM_CB_TO_MON: 2,
  ITEM_CB_SWAP_TO_HAND: 3,
  ITEM_CB_SWAP_TO_MON: 4,
  ITEM_CB_UNUSED_1: 5,
  ITEM_CB_UNUSED_2: 6,
  ITEM_CB_HIDE_PARTY: 7,
} as const;
export const ENUM_RELEASE_13 = {
  RELEASE_ANIM_RELEASE: 0,
  RELEASE_ANIM_CAME_BACK: 1,
} as const;
export const ENUM_CHANGE_14 = {
  CHANGE_GRAB: 0,
  CHANGE_PLACE: 1,
  CHANGE_SHIFT: 2,
} as const;
export const ENUM_MOVE_15 = {
  MOVE_MODE_NORMAL: 0,
  MOVE_MODE_MULTIPLE_SELECTING: 1,
  MOVE_MODE_MULTIPLE_MOVING: 2,
} as const;
export const ENUM_MULTIMOVE_16 = {
  MULTIMOVE_START: 0,
  MULTIMOVE_CANCEL: 1,
  MULTIMOVE_CHANGE_SELECTION: 2,
  MULTIMOVE_GRAB_SELECTION: 3,
  MULTIMOVE_MOVE_MONS: 4,
  MULTIMOVE_PLACE_MONS: 5,
} as const;
export const ENUM_TILEMAPID_17 = {
  TILEMAPID_PKMN_DATA: 0,
  TILEMAPID_PARTY_MENU: 1,
  TILEMAPID_CLOSE_BUTTON: 2,
  TILEMAPID_COUNT: 3,
} as const;
export const ENUM_WIN_18 = {
  WIN_DISPLAY_INFO: 0,
  WIN_MESSAGE: 1,
  WIN_ITEM_DESC: 2,
} as const;
export const ENUM_STATE_19 = {
  STATE_LOAD: 0,
  STATE_FADE_IN: 1,
  STATE_HANDLE_INPUT: 2,
  STATE_ERROR_MSG: 3,
  STATE_ENTER_PC: 4,
} as const;
export const ENUM_MSTATE_20 = {
  MSTATE_HANDLE_INPUT: 0,
  MSTATE_MOVE_CURSOR: 1,
  MSTATE_SCROLL_BOX: 2,
  MSTATE_WAIT_MSG: 3,
  MSTATE_ERROR_LAST_PARTY_MON: 4,
  MSTATE_ERROR_HAS_MAIL: 5,
  MSTATE_WAIT_ERROR_MSG: 6,
  MSTATE_MULTIMOVE_RUN: 7,
  MSTATE_MULTIMOVE_RUN_CANCEL: 8,
  MSTATE_MULTIMOVE_RUN_MOVED: 9,
  MSTATE_SCROLL_BOX_ITEM: 10,
  MSTATE_WAIT_ITEM_ANIM: 11,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplate_MainMenu = { bg: 0, tilemapLeft: 1, tilemapTop: 1, width: 17, height: 10, paletteNum: 15, baseBlock: 1 } as const;
export const sWindowTemplates = [
  { bg: 1, tilemapLeft: 0, tilemapTop: 11, width: 9, height: 7, paletteNum: 3, baseBlock: 192 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 17, width: 18, height: 2, paletteNum: 15, baseBlock: 20 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 13, width: 21, height: 7, paletteNum: 15, baseBlock: 20 },
] as const;
export const sYesNoWindowTemplate = { bg: 0, tilemapLeft: 24, tilemapTop: 11, width: 5, height: 4, paletteNum: 15, baseBlock: 92 } as const;
export const sWindowTemplate_MultiMove = { bg: 0, tilemapLeft: 10, tilemapTop: 3, width: 20, height: 18, paletteNum: 9, baseBlock: 10 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 29, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 256 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 27, screenSize: 1, paletteMode: 0, priority: 2, baseTile: 0 },
  { bg: 3, charBaseIndex: 3, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_DisplayMon = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_Waveform = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x8)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_MonIcon = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sOamData_BoxTitle = { shape: "SPRITE_SHAPE(32x16)", size: "SPRITE_SIZE(32x16)", priority: 2 } as const;
export const sOamData_Arrow = { shape: "SPRITE_SHAPE(8x16)", size: "SPRITE_SIZE(8x16)", priority: 2 } as const;
export const sOamData_Cursor = { shape: "SPRITE_SHAPE(32x32)", size: "SPRITE_SIZE(32x32)", priority: 1 } as const;
export const sOamData_CursorShadow = { shape: "SPRITE_SHAPE(16x16)", size: "SPRITE_SIZE(16x16)", priority: 1 } as const;
export const sOamData_ItemIcon = { y: 0, affineMode: "ST_OAM_AFFINE_NORMAL", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_DisplayMon = { tileTag: "GFXTAG_DISPLAY_MON", paletteTag: "PALTAG_DISPLAY_MON", oam: "&sOamData_DisplayMon", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Waveform = { tileTag: "GFXTAG_WAVEFORM", paletteTag: "PALTAG_MISC_2", oam: "&sOamData_Waveform", anims: "sAnims_Waveform", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_MonIcon = { tileTag: "GFXTAG_MON_ICON", paletteTag: "PALTAG_MON_ICON_0", oam: "&sOamData_MonIcon", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_BoxTitle = { tileTag: "GFXTAG_BOX_TITLE", paletteTag: "PALTAG_BOX_TITLE", oam: "&sOamData_BoxTitle", anims: "sAnims_BoxTitle", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Arrow = { tileTag: "GFXTAG_ARROW", paletteTag: "PALTAG_MISC_2", oam: "&sOamData_Arrow", anims: "sAnims_Arrow", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Arrow" } as const;
export const sSpriteTemplate_Cursor = { tileTag: "GFXTAG_CURSOR", paletteTag: "PALTAG_MISC_2", oam: "&sOamData_Cursor", anims: "sAnims_Cursor", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_CursorShadow = { tileTag: "GFXTAG_CURSOR_SHADOW", paletteTag: "PALTAG_MISC_2", oam: "&sOamData_CursorShadow", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_CursorShadow" } as const;
export const sSpriteTemplate_ItemIcon = { tileTag: "GFXTAG_ITEM_ICON_0", paletteTag: "PALTAG_ITEM_ICON_0", oam: "&sOamData_ItemIcon", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sAffineAnims_ItemIcon", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sChooseBoxMenu_Pal': { path: 'graphics/pokemon_storage/box_selection_popup.pal', ext: '.gbapal', type: 'u16' },
  'sChooseBoxMenuCenter_Gfx': { path: 'graphics/pokemon_storage/box_selection_popup_center.png', ext: '.4bpp', type: 'u8' },
  'sChooseBoxMenuSides_Gfx': { path: 'graphics/pokemon_storage/box_selection_popup_sides.png', ext: '.4bpp', type: 'u8' },
  'sScrollingBg_Gfx': { path: 'graphics/pokemon_storage/scrolling_bg.png', ext: '.4bpp.lz', type: 'u32' },
  'sScrollingBg_Tilemap': { path: 'graphics/pokemon_storage/scrolling_bg.bin', ext: '.lz', type: 'u32' },
  'sDisplayMenu_Pal': { path: 'graphics/pokemon_storage/display_menu.pal', ext: '.gbapal', type: 'u16' },
  'sDisplayMenu_Tilemap': { path: 'graphics/pokemon_storage/display_menu.bin', ext: '.lz', type: 'u32' },
  'sInterface_Pal': { path: 'graphics/pokemon_storage/interface.pal', ext: '.gbapal', type: 'u16' },
  'sPkmnDataGray_Pal': { path: 'graphics/pokemon_storage/pkmn_data_gray.pal', ext: '.gbapal', type: 'u16' },
  'sScrollingBg_Pal': { path: 'graphics/pokemon_storage/scrolling_bg.pal', ext: '.gbapal', type: 'u16' },
  'sScrollingBgMoveItems_Pal': { path: 'graphics/pokemon_storage/scrolling_bg_move_items.pal', ext: '.gbapal', type: 'u16' },
  'sWaveform_Pal': { path: 'graphics/pokemon_storage/waveform.png', ext: '.gbapal', type: 'u16' },
  'sWaveform_Gfx': { path: 'graphics/pokemon_storage/waveform.png', ext: '.4bpp', type: 'u32' },
  'sUnused_Pal': { path: 'graphics/pokemon_storage/unused.pal', ext: '.gbapal', type: 'u16' },
  'sTextWindows_Pal': { path: 'graphics/pokemon_storage/text_windows.pal', ext: '.gbapal', type: 'u16' },
  'sHandCursor_Pal': { path: 'graphics/pokemon_storage/hand_cursor.png', ext: '.gbapal', type: 'u16' },
  'sHandCursor_Gfx': { path: 'graphics/pokemon_storage/hand_cursor.png', ext: '.4bpp', type: 'u8' },
  'sHandCursorShadow_Gfx': { path: 'graphics/pokemon_storage/hand_cursor_shadow.png', ext: '.4bpp', type: 'u8' },
  'sItemInfoFrame_Gfx': { path: 'graphics/pokemon_storage/item_info_frame.png', ext: '.4bpp', type: 'u32' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sPkmnData_Tilemap': { path: 'graphics/pokemon_storage/pkmn_data.bin', type: 'u16' },
  'sCloseBoxButton_Tilemap': { path: 'graphics/pokemon_storage/close_box_button.bin', type: 'u16' },
  'sPartySlotFilled_Tilemap': { path: 'graphics/pokemon_storage/party_slot_filled.bin', type: 'u16' },
  'sPartySlotEmpty_Tilemap': { path: 'graphics/pokemon_storage/party_slot_empty.bin', type: 'u16' },
};

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const placeChangeFuncs = ['MonPlaceChange_Grab', 'MonPlaceChange_Place', 'MonPlaceChange_Shift'] as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "u8", name: 'sPreviousBoxOption', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'sInPartyMenu', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sCurrentBoxOption', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sDepositBoxId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sWhichToReshow', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sLastUsedBox', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sMovingItemId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "struct Pokemon", name: 'sSavedMovingMon', isArray: false, init: "{0}" },
  { segment: 'EWRAM_DATA', type: "s8", name: 'sCursorArea', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "s8", name: 'sCursorPosition', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'sIsMonBeingMoved', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sMovingMonOrigBoxId', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sMovingMonOrigBoxPos', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "bool8", name: 'sAutoActionOn', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u8", name: 'sSavedCursorPosition', isArray: false, init: "0" },
  { segment: 'EWRAM_DATA', type: "u16", name: 'sNumTilemapUtilIds', isArray: false, init: "0" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'EnterPokeStorage', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_InitPokeStorage', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PlaceMon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ChangeScreen', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShowPokeStorage', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_OnBPressed', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleBoxOptions', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_OnSelectedMon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_OnCloseBoxPressed', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HidePartyPokemon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_DepositMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_MoveMon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_GiveMovingItemToMon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_SwitchSelectedItem', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_TakeItemForMoving', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WithdrawMon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShiftMon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShowPartyPokemon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShowItemInfo', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_GiveItemFromBag', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ItemToBag', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShowMarkMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShowMonSummary', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ReleaseMon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ReshowPokeStorage', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PokeStorageMain', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_JumpBox', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleWallpapers', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_NameBox', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PrintCantStoreMail', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_HandleMovingMonFromParty', ret: "void", arity: 1, params: "u8" },
  { name: 'InBoxInput_Normal', ret: "u8", arity: 0, params: "void" },
  { name: 'InBoxInput_MovingMultiple', ret: "u8", arity: 0, params: "void" },
  { name: 'InBoxInput_SelectingMultiple', ret: "u8", arity: 0, params: "void" },
  { name: 'HandleInput', ret: "u8", arity: 0, params: "void" },
  { name: 'AddBoxOptionsMenu', ret: "void", arity: 0, params: "void" },
  { name: 'SetSelectionMenuTexts', ret: "u8", arity: 0, params: "void" },
  { name: 'SetMenuTexts_Mon', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetMenuTexts_Item', ret: "bool8", arity: 0, params: "void" },
  { name: 'ChooseBoxMenu_CreateSprites', ret: "void", arity: 1, params: "u8" },
  { name: 'ChooseBoxMenu_DestroySprites', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseBoxMenu_MoveLeft', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseBoxMenu_MoveRight', ret: "void", arity: 0, params: "void" },
  { name: 'ChooseBoxMenu_PrintInfo', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_ChooseBoxArrow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'InitMenu', ret: "void", arity: 0, params: "void" },
  { name: 'SetMenuText', ret: "void", arity: 1, params: "u8" },
  { name: 'GetMenuItemTextId', ret: "s8", arity: 1, params: "u8" },
  { name: 'AddMenu', ret: "void", arity: 0, params: "void" },
  { name: 'IsMenuLoading', ret: "bool8", arity: 0, params: "void" },
  { name: 'HandleMenuInput', ret: "s16", arity: 0, params: "void" },
  { name: 'RemoveMenu', ret: "void", arity: 0, params: "void" },
  { name: 'InitMonIconFields', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_BoxMonIconScrollOut', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'GetIncomingBoxMonData', ret: "void", arity: 1, params: "u8" },
  { name: 'CreatePartyMonsSprites', ret: "void", arity: 1, params: "bool8" },
  { name: 'CompactPartySprites', ret: "void", arity: 0, params: "void" },
  { name: 'GetNumPartySpritesCompacting', ret: "u8", arity: 0, params: "void" },
  { name: 'MovePartySpriteToNextSlot', ret: "void", arity: 2, params: "struct Sprite *, u16" },
  { name: 'SpriteCB_MovePartyMonToNextSlot', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'MovePartySprites', ret: "void", arity: 1, params: "s16" },
  { name: 'DestroyAllPartyMonIcons', ret: "void", arity: 0, params: "void" },
  { name: 'ReshowReleaseMon', ret: "void", arity: 0, params: "void" },
  { name: 'ResetReleaseMonSpritePtr', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetMovingMonPriority', ret: "void", arity: 1, params: "u8" },
  { name: 'SpriteCB_HeldMon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'DestroyBoxMonIcon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'MoveMon', ret: "void", arity: 0, params: "void" },
  { name: 'PlaceMon', ret: "void", arity: 0, params: "void" },
  { name: 'RefreshDisplayMon', ret: "void", arity: 0, params: "void" },
  { name: 'SetMovingMonData', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'SetPlacedMonData', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'PurgeMonOrBoxMon', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'SetShiftedMonData', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'TryStorePartyMonInBox', ret: "bool8", arity: 1, params: "u8" },
  { name: 'ResetSelectionAfterDeposit', ret: "void", arity: 0, params: "void" },
  { name: 'InitReleaseMon', ret: "void", arity: 0, params: "void" },
  { name: 'TryHideReleaseMon', ret: "bool8", arity: 0, params: "void" },
  { name: 'InitCanReleaseMonVars', ret: "void", arity: 0, params: "void" },
  { name: 'ReleaseMon', ret: "void", arity: 0, params: "void" },
  { name: 'AtLeastThreeUsableMons', ret: "bool32", arity: 0, params: "void" },
  { name: 'RunCanReleaseMon', ret: "s8", arity: 0, params: "void" },
  { name: 'SaveMovingMon', ret: "void", arity: 0, params: "void" },
  { name: 'LoadSavedMovingMon', ret: "void", arity: 0, params: "void" },
  { name: 'InitSummaryScreenData', ret: "void", arity: 0, params: "void" },
  { name: 'SetSelectionAfterSummaryScreen', ret: "void", arity: 0, params: "void" },
  { name: 'SetMonMarkings', ret: "void", arity: 1, params: "u8" },
  { name: 'IsRemovingLastPartyMon', ret: "bool8", arity: 0, params: "void" },
  { name: 'CanShiftMon', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsMonBeingMoved', ret: "bool8", arity: 0, params: "void" },
  { name: 'TryRefreshDisplayMon', ret: "void", arity: 0, params: "void" },
  { name: 'ReshowDisplayMon', ret: "void", arity: 0, params: "void" },
  { name: 'SetDisplayMonData', ret: "void", arity: 2, params: "void *, u8" },
  { name: 'MultiMove_Free', ret: "void", arity: 0, params: "void" },
  { name: 'MultiMove_Init', ret: "bool8", arity: 0, params: "void" },
  { name: 'MultiMove_RunFunction', ret: "bool8", arity: 0, params: "void" },
  { name: 'MultiMove_TryMoveGroup', ret: "bool8", arity: 1, params: "u8" },
  { name: 'MultiMove_CanPlaceSelection', ret: "bool8", arity: 0, params: "void" },
  { name: 'MultiMove_SetFunction', ret: "void", arity: 1, params: "u8" },
  { name: 'MultiMove_GetOrigin', ret: "u8", arity: 0, params: "void" },
  { name: 'MultiMove_Start', ret: "bool8", arity: 0, params: "void" },
  { name: 'MultiMove_Cancel', ret: "bool8", arity: 0, params: "void" },
  { name: 'MultiMove_ChangeSelection', ret: "bool8", arity: 0, params: "void" },
  { name: 'MultiMove_GrabSelection', ret: "bool8", arity: 0, params: "void" },
  { name: 'MultiMove_MoveMons', ret: "bool8", arity: 0, params: "void" },
  { name: 'MultiMove_PlaceMons', ret: "bool8", arity: 0, params: "void" },
  { name: 'MultiMove_SetIconToBg', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'MultiMove_ClearIconFromBg', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'MultiMove_ResetBg', ret: "void", arity: 0, params: "void" },
  { name: 'MultiMove_UpdateSelectedIcons', ret: "void", arity: 0, params: "void" },
  { name: 'MultiMove_InitMove', ret: "void", arity: 3, params: "u16, u16, u16" },
  { name: 'MultiMove_GetMonsFromSelection', ret: "void", arity: 0, params: "void" },
  { name: 'MultiMove_RemoveMonsFromBox', ret: "void", arity: 0, params: "void" },
  { name: 'MultiMove_CreatePlacedMonIcons', ret: "void", arity: 0, params: "void" },
  { name: 'MultiMove_SetPlacedMonData', ret: "void", arity: 0, params: "void" },
  { name: 'MultiMove_UpdateMove', ret: "u8", arity: 0, params: "void" },
  { name: 'MultiMove_DeselectRow', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'MultiMove_SelectRow', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'MultiMove_SelectColumn', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'MultiMove_DeselectColumn', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'IsItemIconAtPosition', ret: "bool32", arity: 2, params: "u8, u8" },
  { name: 'GetNewItemIconIdx', ret: "u8", arity: 0, params: "void" },
  { name: 'SetItemIconPosition', ret: "void", arity: 3, params: "u8, u8, u8" },
  { name: 'LoadItemIconGfx', ret: "void", arity: 3, params: "u8, const u32 *, const u32 *" },
  { name: 'SetItemIconAffineAnim', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'SetItemIconActive', ret: "void", arity: 2, params: "u8, bool8" },
  { name: 'GetItemIconIdxByPosition', ret: "u8", arity: 2, params: "u8, u8" },
  { name: 'CreateItemIconSprites', ret: "void", arity: 0, params: "void" },
  { name: 'TryLoadItemIconAtPos', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'TryHideItemIconAtPos', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'TakeItemFromMon', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'InitItemIconInCursor', ret: "void", arity: 1, params: "u16" },
  { name: 'SwapItemsWithMon', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'GiveItemToMon', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'MoveItemFromMonToBag', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'MoveItemFromCursorToBag', ret: "void", arity: 0, params: "void" },
  { name: 'MoveHeldItemWithPartyMenu', ret: "void", arity: 0, params: "void" },
  { name: 'IsItemIconAnimActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsMovingItem', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetMovingItemId', ret: "u16", arity: 0, params: "void" },
  { name: 'PrintItemDescription', ret: "void", arity: 0, params: "void" },
  { name: 'InitItemInfoWindow', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateItemInfoWindowSlideIn', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateItemInfoWindowSlideOut', ret: "bool8", arity: 0, params: "void" },
  { name: 'DrawItemInfoWindow', ret: "void", arity: 1, params: "u32" },
  { name: 'SetItemIconCallback', ret: "void", arity: 4, params: "u8, u8, u8, u8" },
  { name: 'SpriteCB_ItemIcon_SetPosToCursor', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ItemIcon_WaitAnim', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ItemIcon_ToHand', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ItemIcon_ToMon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ItemIcon_SwapToHand', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ItemIcon_HideParty', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_ItemIcon_SwapToMon', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CreateCursorSprites', ret: "void", arity: 0, params: "void" },
  { name: 'ToggleCursorAutoAction', ret: "void", arity: 0, params: "void" },
  { name: 'GetCursorPosition', ret: "u8", arity: 0, params: "void" },
  { name: 'StartCursorAnim', ret: "void", arity: 1, params: "u8" },
  { name: 'TryHideItemAtCursor', ret: "void", arity: 0, params: "void" },
  { name: 'TryShowItemAtCursor', ret: "void", arity: 0, params: "void" },
  { name: 'InitCursor', ret: "void", arity: 0, params: "void" },
  { name: 'InitCursorOnReopen', ret: "void", arity: 0, params: "void" },
  { name: 'GetCursorCoordsByPos', ret: "void", arity: 4, params: "u8, u8, u16 *, u16 *" },
  { name: 'UpdateCursorPos', ret: "bool8", arity: 0, params: "void" },
  { name: 'DoCursorNewPosUpdate', ret: "void", arity: 0, params: "void" },
  { name: 'SetCursorInParty', ret: "void", arity: 0, params: "void" },
  { name: 'SetCursorBoxPosition', ret: "void", arity: 1, params: "u8" },
  { name: 'ClearSavedCursorPos', ret: "void", arity: 0, params: "void" },
  { name: 'SaveCursorPos', ret: "void", arity: 0, params: "void" },
  { name: 'GetSavedCursorPos', ret: "u8", arity: 0, params: "void" },
  { name: 'InitMonPlaceChange', ret: "void", arity: 1, params: "u8" },
  { name: 'DoMonPlaceChange', ret: "bool8", arity: 0, params: "void" },
  { name: 'MonPlaceChange_Shift', ret: "bool8", arity: 0, params: "void" },
  { name: 'MonPlaceChange_Grab', ret: "bool8", arity: 0, params: "void" },
  { name: 'MonPlaceChange_Place', ret: "bool8", arity: 0, params: "void" },
  { name: 'MultiMonPlaceChange_Up', ret: "bool8", arity: 0, params: "void" },
  { name: 'MultiMonPlaceChange_Down', ret: "bool8", arity: 0, params: "void" },
  { name: 'MonPlaceChange_CursorDown', ret: "bool8", arity: 0, params: "void" },
  { name: 'MonPlaceChange_CursorUp', ret: "bool8", arity: 0, params: "void" },
  { name: 'TrySetCursorFistAnim', ret: "void", arity: 0, params: "void" },
  { name: 'IsCursorOnCloseBox', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsCursorOnBoxTitle', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsCursorInBox', ret: "bool8", arity: 0, params: "void" },
  { name: 'CreateBoxScrollArrows', ret: "void", arity: 0, params: "void" },
  { name: 'StartBoxScrollArrowsSlide', ret: "void", arity: 1, params: "s8" },
  { name: 'StopBoxScrollArrowsSlide', ret: "void", arity: 0, params: "void" },
  { name: 'AnimateBoxScrollArrows', ret: "void", arity: 1, params: "bool8" },
  { name: 'SpriteCB_Arrow', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'InitBoxTitle', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateIncomingBoxTitle', ret: "void", arity: 2, params: "u8, s8" },
  { name: 'CycleBoxTitleSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_IncomingBoxTitle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_OutgoingBoxTitle', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CycleBoxTitleColor', ret: "void", arity: 0, params: "void" },
  { name: 'GetBoxTitleBaseX', ret: "s16", arity: 1, params: "const u8 *" },
  { name: 'SetWallpaperForCurrentBox', ret: "void", arity: 1, params: "u8" },
  { name: 'DoWallpaperGfxChange', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadWallpaperGfx', ret: "void", arity: 2, params: "u8, s8" },
  { name: 'WaitForWallpaperGfxLoad', ret: "bool32", arity: 0, params: "void" },
  { name: 'DrawWallpaper', ret: "void", arity: 3, params: "const void *, s8, u8" },
  { name: 'TrimOldWallpaper', ret: "void", arity: 1, params: "void *" },
  { name: 'AddWallpaperSetsMenu', ret: "void", arity: 0, params: "void" },
  { name: 'AddWallpapersMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'GetBoxWallpaper', ret: "u8", arity: 1, params: "u8" },
  { name: 'SetBoxWallpaper', ret: "void", arity: 2, params: "u8, u8" },
  { name: 'CreateInitBoxTask', ret: "void", arity: 1, params: "u8" },
  { name: 'IsInitBoxActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_InitBox', ret: "void", arity: 1, params: "u8" },
  { name: 'SetUpScrollToBox', ret: "void", arity: 1, params: "u8" },
  { name: 'ScrollToBox', ret: "bool8", arity: 0, params: "void" },
  { name: 'DetermineBoxScrollDirection', ret: "s8", arity: 1, params: "u8" },
  { name: 'SetCurrentBox', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateMainMenu', ret: "void", arity: 2, params: "u8, s16 *" },
  { name: 'GetCurrentBoxOption', ret: "u8", arity: 0, params: "void" },
  { name: 'ScrollBackground', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateCloseBoxButtonFlash', ret: "void", arity: 0, params: "void" },
  { name: 'GiveChosenBagItem', ret: "void", arity: 0, params: "void" },
  { name: 'SetUpHidePartyMenu', ret: "void", arity: 0, params: "void" },
  { name: 'LoadPokeStorageMenuGfx', ret: "void", arity: 0, params: "void" },
  { name: 'LoadWaveformSpritePalette', ret: "void", arity: 0, params: "void" },
  { name: 'InitPokeStorageBg0', ret: "void", arity: 0, params: "void" },
  { name: 'SetScrollingBackground', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateBoxToSendMons', ret: "void", arity: 0, params: "void" },
  { name: 'InitCursorItemIcon', ret: "void", arity: 0, params: "void" },
  { name: 'InitPalettesAndSprites', ret: "void", arity: 0, params: "void" },
  { name: 'RefreshDisplayMonData', ret: "void", arity: 0, params: "void" },
  { name: 'CreateDisplayMonSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateMarkingComboSprite', ret: "void", arity: 0, params: "void" },
  { name: 'CreateWaveformSprites', ret: "void", arity: 0, params: "void" },
  { name: 'ClearBottomWindow', ret: "void", arity: 0, params: "void" },
  { name: 'InitSupplementalTilemaps', ret: "void", arity: 0, params: "void" },
  { name: 'PrintDisplayMonInfo', ret: "void", arity: 0, params: "void" },
  { name: 'UpdateWaveformAnimation', ret: "void", arity: 0, params: "void" },
  { name: 'SetPartySlotTilemaps', ret: "void", arity: 0, params: "void" },
  { name: 'StopFlashingCloseBoxButton', ret: "void", arity: 0, params: "void" },
  { name: 'FreePokeStorageData', ret: "void", arity: 0, params: "void" },
  { name: 'UpdatePartySlotColors', ret: "void", arity: 0, params: "void" },
  { name: 'StartFlashingCloseBoxButton', ret: "void", arity: 0, params: "void" },
  { name: 'SetUpDoShowPartyMenu', ret: "void", arity: 0, params: "void" },
  { name: 'StartDisplayMonMosaicEffect', ret: "void", arity: 0, params: "void" },
  { name: 'InitPokeStorageWindows', ret: "bool8", arity: 0, params: "void" },
  { name: 'DoShowPartyMenu', ret: "bool8", arity: 0, params: "void" },
  { name: 'HidePartyMenu', ret: "bool8", arity: 0, params: "void" },
  { name: 'IsDisplayMosaicActive', ret: "bool8", arity: 0, params: "void" },
  { name: 'ShowYesNoWindow', ret: "void", arity: 1, params: "s8" },
  { name: 'UpdateCloseBoxButtonTilemap', ret: "void", arity: 1, params: "bool8" },
  { name: 'PrintMessage', ret: "void", arity: 1, params: "u8 id" },
  { name: 'LoadDisplayMonGfx', ret: "void", arity: 2, params: "u16, u32" },
  { name: 'SpriteCB_DisplayMonMosaic', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SetPartySlotTilemap', ret: "void", arity: 2, params: "u8, bool8" },
  { name: 'TilemapUtil_SetRect', ret: "void", arity: 5, params: "u8, u16, u16, u16, u16" },
  { name: 'TilemapUtil_Move', ret: "void", arity: 3, params: "u8, u8, s8" },
  { name: 'TilemapUtil_SetMap', ret: "void", arity: 5, params: "u8, u8, const void *, u16, u16" },
  { name: 'TilemapUtil_SetPos', ret: "void", arity: 3, params: "u8, u16, u16" },
  { name: 'TilemapUtil_Init', ret: "void", arity: 1, params: "u8" },
  { name: 'TilemapUtil_Free', ret: "void", arity: 0, params: "void" },
  { name: 'TilemapUtil_Update', ret: "void", arity: 1, params: "u8" },
  { name: 'TilemapUtil_DrawPrev', ret: "void", arity: 1, params: "u8" },
  { name: 'TilemapUtil_Draw', ret: "void", arity: 1, params: "u8" },
  { name: 'UnkUtil_Init', ret: "void", arity: 3, params: "struct UnkUtil *, struct UnkUtilData *, u32" },
  { name: 'UnkUtil_Run', ret: "void", arity: 0, params: "void" },
  { name: 'UnkUtil_CpuRun', ret: "void", arity: 1, params: "struct UnkUtilData *" },
  { name: 'UnkUtil_DmaRun', ret: "void", arity: 1, params: "struct UnkUtilData *" },
  { name: 'DrawTextWindowAndBufferTiles', ret: "void", arity: 5, params: "const u8 *string, void *dst, u8 zero1, u8 zero2, s32 bytesToBuffer" },
  { name: 'UnusedDrawTextWindow', ret: "UNUSED", arity: 6, params: "const u8 *string, void *dst, u16 offset, u8 bgColor, u8 fgColor, u8 shadowColor" },
  { name: 'CountMonsInBox', ret: "u8", arity: 1, params: "u8 boxId" },
  { name: 'GetFirstFreeBoxSpot', ret: "s16", arity: 1, params: "u8 boxId" },
  { name: 'CountPartyNonEggMons', ret: "u8", arity: 0, params: "void" },
  { name: 'CountPartyAliveNonEggMonsExcept', ret: "u8", arity: 1, params: "u8 slotToIgnore" },
  { name: 'CountPartyAliveNonEggMons_IgnoreVar0x8004Slot', ret: "u16", arity: 0, params: "void" },
  { name: 'CountPartyMons', ret: "u8", arity: 0, params: "void" },
  { name: 'UnusedWriteRectCpu', ret: "UNUSED", arity: 9, params: "u16 *dest, u16 dest_left, u16 dest_top, const u16 *src, u16 src_left, u16 src_top, u16 dest_width, u16 dest_height, u16 src_width" },
  { name: 'UnusedWriteRectDma', ret: "UNUSED", arity: 5, params: "u16 *dest, u16 dest_left, u16 dest_top, u16 width, u16 height" },
  { name: 'Task_PCMainMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowPokemonStorageSystemPC', ret: "void", arity: 0, params: "void" },
  { name: 'FieldTask_ReturnToPcMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ExitPokeStorage', ret: "void", arity: 0, params: "void" },
  { name: 'StorageSystemGetNextMonIndex', ret: "UNUSED", arity: 4, params: "struct BoxPokemon *box, s8 startIdx, u8 stopIdx, u8 mode" },
  { name: 'ResetPokemonStorageSystem', ret: "void", arity: 0, params: "void" },
  { name: 'LoadChooseBoxMenuGfx', ret: "void", arity: 5, params: "struct ChooseBoxMenu *menu, u16 tileTag, u16 palTag, u8 subpriority, bool32 loadPal" },
  { name: 'FreeChooseBoxMenu', ret: "void", arity: 0, params: "void" },
  { name: 'CreateChooseBoxMenuSprites', ret: "void", arity: 1, params: "u8 curBox" },
  { name: 'DestroyChooseBoxMenuSprites', ret: "void", arity: 0, params: "void" },
  { name: 'HandleChooseBoxMenuInput', ret: "u8", arity: 0, params: "void" },
  { name: 'VBlankCB_PokeStorage', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_PokeStorage', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ReturnToPokeStorage', ret: "void", arity: 0, params: "void" },
  { name: 'ResetAllBgCoords', ret: "void", arity: 0, params: "void" },
  { name: 'ResetForPokeStorage', ret: "void", arity: 0, params: "void" },
  { name: 'InitStartingPosData', ret: "void", arity: 0, params: "void" },
  { name: 'SetMonIconTransparency', ret: "void", arity: 0, params: "void" },
  { name: 'SetPokeStorageTask', ret: "void", arity: 1, params: "TaskFunc newFunc" },
  { name: 'Task_CloseBoxWhileHoldingItem', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowPokemonSummaryScreen', ret: "else", arity: 5, params: "mode, boxMons, monIndex, maxMonIndex, CB2_ReturnToPokeStorage" },
  { name: 'SetCurrentBoxMonData', ret: "else", arity: 3, params: "pos, MON_DATA_HELD_ITEM, &itemId" },
  { name: 'SetUpShowPartyMenu', ret: "void", arity: 0, params: "void" },
  { name: 'ShowPartyMenu', ret: "bool8", arity: 0, params: "void" },
  { name: 'GetMonIconPriorityByCursorPos', ret: "u8", arity: 0, params: "void" },
  { name: 'CreateMovingMonIcon', ret: "void", arity: 0, params: "void" },
  { name: 'InitBoxMonSprites', ret: "void", arity: 1, params: "u8 boxId" },
  { name: 'CreateBoxMonIconAtPos', ret: "void", arity: 1, params: "u8 boxPosition" },
  { name: 'StartBoxMonIconsScrollOut', ret: "void", arity: 1, params: "s16 speed" },
  { name: 'SpriteCB_BoxMonIconScrollIn', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'DestroyBoxMonIconsInColumn', ret: "void", arity: 1, params: "u8 column" },
  { name: 'CreateBoxMonIconsInColumn', ret: "u8", arity: 3, params: "u8 column, u16 distance, s16 speed" },
  { name: 'InitBoxMonIconScroll', ret: "void", arity: 2, params: "u8 boxId, s8 direction" },
  { name: 'UpdateBoxMonIconScroll', ret: "bool8", arity: 0, params: "void" },
  { name: 'DestroyBoxMonIconAtPosition', ret: "void", arity: 1, params: "u8 boxPosition" },
  { name: 'SetBoxMonIconObjMode', ret: "void", arity: 2, params: "u8 boxPosition, u8 objMode" },
  { name: 'DestroyMovingMonIcon', ret: "void", arity: 0, params: "void" },
  { name: 'DestroyPartyMonIcon', ret: "void", arity: 1, params: "u8 partyId" },
  { name: 'SetPartyMonIconObjMode', ret: "void", arity: 2, params: "u8 partyId, u8 objMode" },
  { name: 'SetMovingMonSprite', ret: "void", arity: 2, params: "u8 mode, u8 id" },
  { name: 'SetPlacedMonSprite', ret: "void", arity: 2, params: "u8 boxId, u8 position" },
  { name: 'SaveMonSpriteAtPos', ret: "void", arity: 2, params: "u8 boxId, u8 position" },
  { name: 'MoveShiftingMons', ret: "bool8", arity: 0, params: "void" },
  { name: 'SetReleaseMon', ret: "void", arity: 2, params: "u8 mode, u8 position" },
  { name: 'TryHideReleaseMonSprite', ret: "bool8", arity: 0, params: "void" },
  { name: 'DestroyReleaseMonIcon', ret: "void", arity: 0, params: "void" },
  { name: 'TryLoadMonIconTiles', ret: "u16", arity: 1, params: "u16 species" },
  { name: 'RemoveSpeciesFromIconList', ret: "void", arity: 1, params: "u16 species" },
  { name: 'FreeSpriteTilesByTag', ret: "else", arity: 1, params: "GFXTAG_BOX_TITLE" },
  { name: 'GetSpeciesAtCursorPosition', ret: "u16", arity: 0, params: "void" },
  { name: 'InitNewCursorPos', ret: "void", arity: 2, params: "u8 newCursorArea, u8 newCursorPosition" },
  { name: 'InitCursorMove', ret: "void", arity: 0, params: "void" },
  { name: 'SetCursorPosition', ret: "void", arity: 2, params: "u8 newCursorArea, u8 newCursorPosition" },
  { name: 'InitMultiMonPlaceChange', ret: "void", arity: 1, params: "bool8 up" },
  { name: 'BoxMonAtToMon', ret: "else", arity: 3, params: "boxId, position, &sStorage->movingMon" },
  { name: 'ZeroBoxMonAt', ret: "else", arity: 2, params: "boxId, position" },
  { name: 'GetRestrictedReleaseMoves', ret: "void", arity: 1, params: "u16 *moves" },
  { name: 'CompactPartySlots', ret: "s16", arity: 0, params: "void" },
  { name: 'StringCopyPadded', ret: "else", arity: 4, params: "sStorage->displayMonNameText, gText_EggNickname, CHAR_SPACE, 8" },
  { name: 'StringFill', ret: "else", arity: 3, params: "sStorage->displayMonItemName, CHAR_SPACE, 8" },
  { name: 'HandleInput_InBox', ret: "u8", arity: 0, params: "void" },
  { name: 'HandleInput_InParty', ret: "u8", arity: 0, params: "void" },
  { name: 'HandleInput_OnBox', ret: "u8", arity: 0, params: "void" },
  { name: 'HandleInput_OnButtons', ret: "u8", arity: 0, params: "void" },
  { name: 'SpriteCB_CursorShadow', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'GetCursorBoxColumnAndRow', ret: "void", arity: 2, params: "u8 *column, u8 *row" },
  { name: 'GetMovingMonOriginalBoxId', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'SetCursorPriorityTo1', ret: "void", arity: 0, params: "void" },
  { name: 'GetItemIconIdxBySprite', ret: "u8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'BackupPokemonStorage', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'StorageGetCurrentBox', ret: "u8", arity: 0, params: "void" },
  { name: 'GetBoxMonDataAt', ret: "u32", arity: 3, params: "u8 boxId, u8 boxPosition, s32 request" },
  { name: 'SetBoxMonDataAt', ret: "void", arity: 4, params: "u8 boxId, u8 boxPosition, s32 request, const void *value" },
  { name: 'GetCurrentBoxMonData', ret: "u32", arity: 2, params: "u8 boxPosition, s32 request" },
  { name: 'GetBoxMonNickAt', ret: "void", arity: 3, params: "u8 boxId, u8 boxPosition, u8 *dst" },
  { name: 'GetBoxMonLevelAt', ret: "u32", arity: 2, params: "u8 boxId, u8 boxPosition" },
  { name: 'SetBoxMonNickAt', ret: "void", arity: 3, params: "u8 boxId, u8 boxPosition, const u8 *nick" },
  { name: 'GetAndCopyBoxMonDataAt', ret: "u32", arity: 4, params: "u8 boxId, u8 boxPosition, s32 request, void *dst" },
  { name: 'SetBoxMonAt', ret: "void", arity: 3, params: "u8 boxId, u8 boxPosition, struct BoxPokemon *src" },
  { name: 'CopyBoxMonAt', ret: "void", arity: 3, params: "u8 boxId, u8 boxPosition, struct BoxPokemon *dst" },
  { name: 'CreateBoxMonAt', ret: "void", arity: 9, params: "u8 boxId, u8 boxPosition, u16 species, u8 level, u8 fixedIV, u8 hasFixedPersonality, u32 personality, u8 otIDType, u32 otID" },
  { name: 'AdvanceStorageMonIndex', ret: "s16", arity: 4, params: "struct BoxPokemon *boxMons, u8 currIndex, u8 maxIndex, u8 mode" },
  { name: 'CheckFreePokemonStorageSpace', ret: "bool8", arity: 0, params: "void" },
  { name: 'CheckBoxMonSanityAt', ret: "bool32", arity: 2, params: "u32 boxId, u32 boxPosition" },
  { name: 'CountStorageNonEggMons', ret: "u32", arity: 0, params: "void" },
  { name: 'CountAllStorageMons', ret: "u32", arity: 0, params: "void" },
  { name: 'AnyStorageMonWithMove', ret: "bool32", arity: 1, params: "u16 move" },
  { name: 'ResetWaldaWallpaper', ret: "void", arity: 0, params: "void" },
  { name: 'SetWaldaWallpaperLockedOrUnlocked', ret: "void", arity: 1, params: "bool32 unlocked" },
  { name: 'IsWaldaWallpaperUnlocked', ret: "bool32", arity: 0, params: "void" },
  { name: 'GetWaldaWallpaperPatternId', ret: "u32", arity: 0, params: "void" },
  { name: 'SetWaldaWallpaperPatternId', ret: "void", arity: 1, params: "u8 id" },
  { name: 'GetWaldaWallpaperIconId', ret: "u32", arity: 0, params: "void" },
  { name: 'SetWaldaWallpaperIconId', ret: "void", arity: 1, params: "u8 id" },
  { name: 'SetWaldaWallpaperColors', ret: "void", arity: 2, params: "u16 color1, u16 color2" },
  { name: 'SetWaldaPhrase', ret: "void", arity: 1, params: "const u8 *src" },
  { name: 'IsWaldaPhraseEmpty', ret: "bool32", arity: 0, params: "void" },
  { name: 'TilemapUtil_UpdateAll', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'TilemapUtil_SetSavedMap', ret: "UNUSED", arity: 2, params: "u8 id, const void *tilemap" },
  { name: 'UnkUtil_CpuAdd', ret: "UNUSED", arity: 9, params: "u8 *dest, u16 dLeft, u16 dTop, const u8 *src, u16 sLeft, u16 sTop, u16 width, u16 height, u16 unkArg" },
  { name: 'UnkUtil_DmaAdd', ret: "UNUSED", arity: 5, params: "void *dest, u16 dLeft, u16 dTop, u16 width, u16 height" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ChangeScreen',
  'Task_CloseBoxWhileHoldingItem',
  'Task_DepositMenu',
  'Task_GiveItemFromBag',
  'Task_GiveMovingItemToMon',
  'Task_HandleBoxOptions',
  'Task_HandleMovingMonFromParty',
  'Task_HandleWallpapers',
  'Task_HidePartyPokemon',
  'Task_InitBox',
  'Task_InitPokeStorage',
  'Task_ItemToBag',
  'Task_JumpBox',
  'Task_MoveMon',
  'Task_NameBox',
  'Task_OnBPressed',
  'Task_OnCloseBoxPressed',
  'Task_OnSelectedMon',
  'Task_PCMainMenu',
  'Task_PlaceMon',
  'Task_PokeStorageMain',
  'Task_PrintCantStoreMail',
  'Task_ReleaseMon',
  'Task_ReshowPokeStorage',
  'Task_ShiftMon',
  'Task_ShowItemInfo',
  'Task_ShowMarkMenu',
  'Task_ShowMonSummary',
  'Task_ShowPartyPokemon',
  'Task_ShowPokeStorage',
  'Task_SwitchSelectedItem',
  'Task_TakeItemForMoving',
  'Task_WithdrawMon',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ExitPokeStorage',
  'CB2_PokeStorage',
  'CB2_ReturnToPokeStorage',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'bg.h',
  'data.h',
  'decompress.h',
  'dma3.h',
  'dynamic_placeholder_text_util.h',
  'event_data.h',
  'field_screen_effect.h',
  'field_weather.h',
  'fldeff_misc.h',
  'gpu_regs.h',
  'graphics.h',
  'international_string_util.h',
  'item.h',
  'item_icon.h',
  'item_menu.h',
  'mail.h',
  'main.h',
  'menu.h',
  'mon_markings.h',
  'naming_screen.h',
  'overworld.h',
  'palette.h',
  'pc_screen_effect.h',
  'pokemon.h',
  'pokemon_icon.h',
  'pokemon_summary_screen.h',
  'pokemon_storage_system.h',
  'script.h',
  'sound.h',
  'string_util.h',
  'strings.h',
  'text.h',
  'text_window.h',
  'trig.h',
  'walda_phrase.h',
  'window.h',
  'constants/items.h',
  'constants/moves.h',
  'constants/rgb.h',
  'constants/songs.h',
  'constants/pokemon_icon.h',
  'data/wallpapers.h',
] as const;
