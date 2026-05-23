// AUTO-GENERATED from src/battle_factory_screen.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_factory_screen.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const SWAP_PLAYER_SCREEN = 0;
export const SWAP_ENEMY_SCREEN = 1;
export const SELECTABLE_MONS_COUNT = 6;
export const PALNUM_FADE_TEXT = 14;
export const PALNUM_TEXT = 15;
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
export const SWAPACTION_MON = 1;
export const SWAPACTION_PKMN_FOR_SWAP = 2;
export const SWAPACTION_CANCEL = 3;
export const STATE_CHOOSE_MONS_INIT = 0;
export const STATE_CHOOSE_MONS_HANDLE_INPUT = 1;
export const STATE_MENU_INIT = 2;
export const STATE_MENU_HANDLE_INPUT = 3;
export const STATE_YESNO_SHOW_OPTIONS = 4;
export const STATE_YESNO_HANDLE_INPUT = 5;
export const STATE_SUMMARY_FADE = 6;
export const STATE_SUMMARY_CLEAN = 7;
export const STATE_SUMMARY_SHOW = 8;
export const STATE_MENU_SHOW_OPTIONS = 9;
export const STATE_YESNO_SHOW_MONS = 10;
export const STATE_CHOOSE_MONS_INVALID = 11;
export const STATE_MENU_REINIT = 12;
export const STATE_MENU_RESHOW = 13;
/** Raw expr: `data[3]` */
export const tWinLeft_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tWinRight_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tWinTop_EXPR = "data[5]";
/** Raw expr: `data[8]` */
export const tWinBottom_EXPR = "data[8]";
/** Raw expr: `data[6]` */
export const tSpriteId_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tIsSwapScreen_EXPR = "data[7]";
export const STATE_YESNO_SHOW = 4;
/** Raw expr: `data[1]` */
export const tSaidYes_EXPR = "data[1]";
/** Raw expr: `data[5]` */
export const tFollowUpTaskState_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tFollowUpTaskPtrHi_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tFollowUpTaskPtrLo_EXPR = "data[7]";
/** Raw expr: `data[4]` */
export const tFadeOutFinished_EXPR = "data[4]";
export const SLIDE_BUTTON_PKMN = 0;
export const SLIDE_BUTTON_CANCEL = 1;
/** Raw expr: `data[1]` */
export const tTaskId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tSlidingOn_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tXIncrement_EXPR = "data[3]";
/** Raw expr: `data[2]` */
export const tSecondSlideDelay_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tSlideFinishedPkmn_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tSlideFinishedCancel_EXPR = "data[4]";
/** Raw expr: `data[7]` */
export const sIsSwapScreen_EXPR = "data[7]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_PALTAG_0 = {
  PALTAG_BALL_GRAY: 100,
  PALTAG_BALL_SELECTED: 101,
  PALTAG_INTERFACE: 102,
  PALTAG_MON_PIC_BG: 103,
} as const;
export const ENUM_GFXTAG_1 = {
  GFXTAG_BALL: 100,
  GFXTAG_ARROW: 101,
  GFXTAG_MENU_HIGHLIGHT_LEFT: 102,
  GFXTAG_MENU_HIGHLIGHT_RIGHT: 103,
  GFXTAG_ACTION_BOX_LEFT: 104,
  GFXTAG_ACTION_BOX_RIGHT: 105,
  GFXTAG_ACTION_HIGHLIGHT_LEFT: 106,
  GFXTAG_ACTION_HIGHLIGHT_MIDDLE: 107,
  GFXTAG_ACTION_HIGHLIGHT_RIGHT: 108,
  GFXTAG_MON_PIC_BG_ANIM: 109,
} as const;
export const ENUM_FADESTATE_2 = {
  FADESTATE_INIT: 0,
  FADESTATE_RUN: 1,
  FADESTATE_DELAY: 2,
} as const;
export const ENUM_SELECT_3 = {
  SELECT_SUMMARY: 0,
  SELECT_CONTINUE_CHOOSING: 1,
  SELECT_CONFIRM_MONS: 2,
  SELECT_INVALID_MON: 3,
} as const;
export const ENUM_SELECT_4 = {
  SELECT_WIN_TITLE: 0,
  SELECT_WIN_SPECIES: 1,
  SELECT_WIN_INFO: 2,
  SELECT_WIN_OPTIONS: 3,
  SELECT_WIN_YES_NO: 4,
  SELECT_WIN_MON_CATEGORY: 5,
} as const;
export const ENUM_SWAP_5 = {
  SWAP_WIN_TITLE: 0,
  SWAP_WIN_SPECIES: 1,
  SWAP_WIN_INFO: 2,
  SWAP_WIN_OPTIONS: 3,
  SWAP_WIN_YES_NO: 4,
  SWAP_WIN_ACTION_FADE: 5,
  SWAP_WIN_UNUSED: 6,
  SWAP_WIN_SPECIES_AT_FADE: 7,
  SWAP_WIN_MON_CATEGORY: 8,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sSelect_WindowTemplates = [
  { bg: 0, tilemapLeft: 0, tilemapTop: 2, width: 12, height: 2, paletteNum: "PALNUM_TEXT", baseBlock: 1 },
  { bg: 0, tilemapLeft: 19, tilemapTop: 2, width: 11, height: 2, paletteNum: "PALNUM_FADE_TEXT", baseBlock: 25 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 15, width: 20, height: 3, paletteNum: "PALNUM_TEXT", baseBlock: 47 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 14, width: 8, height: 6, paletteNum: "PALNUM_TEXT", baseBlock: 107 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 14, width: 8, height: 4, paletteNum: "PALNUM_TEXT", baseBlock: 155 },
  { bg: 0, tilemapLeft: 15, tilemapTop: 0, width: 15, height: 2, paletteNum: "PALNUM_TEXT", baseBlock: 187 },
] as const;
export const sSwap_WindowTemplates = [
  { bg: 0, tilemapLeft: 0, tilemapTop: 2, width: 12, height: 2, paletteNum: "PALNUM_TEXT", baseBlock: 1 },
  { bg: 2, tilemapLeft: 19, tilemapTop: 2, width: 11, height: 2, paletteNum: "PALNUM_FADE_TEXT", baseBlock: 25 },
  { bg: 0, tilemapLeft: 0, tilemapTop: 15, width: 20, height: 3, paletteNum: "PALNUM_TEXT", baseBlock: 47 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 14, width: 9, height: 6, paletteNum: "PALNUM_TEXT", baseBlock: 107 },
  { bg: 0, tilemapLeft: 22, tilemapTop: 14, width: 8, height: 4, paletteNum: "PALNUM_TEXT", baseBlock: 161 },
  { bg: 2, tilemapLeft: 21, tilemapTop: 15, width: 9, height: 5, paletteNum: "PALNUM_FADE_TEXT", baseBlock: 107 },
  { bg: 2, tilemapLeft: 10, tilemapTop: 2, width: 4, height: 2, paletteNum: "PALNUM_FADE_TEXT", baseBlock: 193 },
  { bg: 0, tilemapLeft: 19, tilemapTop: 2, width: 11, height: 2, paletteNum: "PALNUM_TEXT", baseBlock: 201 },
  { bg: 0, tilemapLeft: 15, tilemapTop: 0, width: 15, height: 2, paletteNum: "PALNUM_TEXT", baseBlock: 223 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sSelect_BgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 24, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 25, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
  { bg: 3, charBaseIndex: 2, mapBaseIndex: 27, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
] as const;
export const sSwap_BgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 24, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 25, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
  { bg: 2, charBaseIndex: 2, mapBaseIndex: 26, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 3, charBaseIndex: 2, mapBaseIndex: 27, screenSize: 0, paletteMode: 0, priority: 2, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_Select_Pokeball = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0 } as const;
export const sOam_Select_Arrow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0 } as const;
export const sOam_Select_MenuHighlight = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOam_Select_MonPicBgAnim = { y: 0, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_BLEND", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 1 } as const;
export const sOam_Swap_Pokeball = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0 } as const;
export const sOam_Swap_Arrow = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 3, paletteNum: 0, affineParam: 0 } as const;
export const sOam_Swap_MenuHighlight = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;
export const sOam_Swap_MonPicBgAnim = { y: 0, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_BLEND", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 1 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_Select_Pokeball = { tileTag: "GFXTAG_BALL", paletteTag: "PALTAG_BALL_GRAY", oam: "&sOam_Select_Pokeball", anims: "sAnims_Select_Pokeball", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Pokeball" } as const;
export const sSpriteTemplate_Select_Arrow = { tileTag: "GFXTAG_ARROW", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_Select_Arrow", anims: "sAnims_Select_Interface", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Select_MenuHighlightLeft = { tileTag: "GFXTAG_MENU_HIGHLIGHT_LEFT", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_Select_MenuHighlight", anims: "sAnims_Select_Interface", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Select_MenuHighlightRight = { tileTag: "GFXTAG_MENU_HIGHLIGHT_RIGHT", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_Select_MenuHighlight", anims: "sAnims_Select_Interface", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Select_MonPicBgAnim = { tileTag: "GFXTAG_MON_PIC_BG_ANIM", paletteTag: "PALTAG_MON_PIC_BG", oam: "&sOam_Select_MonPicBgAnim", anims: "sAnims_Select_MonPicBgAnim", images: 0, affineAnims: "sAffineAnims_Select_MonPicBgAnim", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Swap_Pokeball = { tileTag: "GFXTAG_BALL", paletteTag: "PALTAG_BALL_GRAY", oam: "&sOam_Swap_Pokeball", anims: "sAnims_Swap_Pokeball", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Pokeball" } as const;
export const sSpriteTemplate_Swap_Arrow = { tileTag: "GFXTAG_ARROW", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_Swap_Arrow", anims: "sAnims_Swap_Interface", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Swap_MenuHighlightLeft = { tileTag: "GFXTAG_MENU_HIGHLIGHT_LEFT", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_Swap_MenuHighlight", anims: "sAnims_Swap_Interface", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Swap_MenuHighlightRight = { tileTag: "GFXTAG_MENU_HIGHLIGHT_RIGHT", paletteTag: "PALTAG_INTERFACE", oam: "&sOam_Swap_MenuHighlight", anims: "sAnims_Swap_Interface", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSpriteTemplate_Swap_MonPicBgAnim = { tileTag: "GFXTAG_MON_PIC_BG_ANIM", paletteTag: "PALTAG_MON_PIC_BG", oam: "&sOam_Swap_MonPicBgAnim", anims: "sAnims_Swap_MonPicBgAnim", images: 0, affineAnims: "sAffineAnims_Swap_MonPicBgAnim", callback: "SpriteCallbackDummy" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sPokeballGray_Pal': { path: 'graphics/battle_frontier/factory_screen/pokeball_gray.pal', ext: '.gbapal', type: 'u16' },
  'sPokeballSelected_Pal': { path: 'graphics/battle_frontier/factory_screen/pokeball_selected.pal', ext: '.gbapal', type: 'u16' },
  'sInterface_Pal': { path: 'graphics/battle_frontier/factory_screen/interface.pal', ext: '.gbapal', type: 'u16' },
  'sPokeball_Gfx': { path: 'graphics/battle_frontier/factory_screen/pokeball.png', ext: '.4bpp', type: 'u8' },
  'sArrow_Gfx': { path: 'graphics/battle_frontier/factory_screen/arrow.png', ext: '.4bpp', type: 'u8' },
  'sMenuHighlightLeft_Gfx': { path: 'graphics/battle_frontier/factory_screen/menu_highlight_left.png', ext: '.4bpp', type: 'u8' },
  'sMenuHighlightRight_Gfx': { path: 'graphics/battle_frontier/factory_screen/menu_highlight_right.png', ext: '.4bpp', type: 'u8' },
  'sActionBoxLeft_Gfx': { path: 'graphics/battle_frontier/factory_screen/action_box_left.png', ext: '.4bpp', type: 'u8' },
  'sActionBoxRight_Gfx': { path: 'graphics/battle_frontier/factory_screen/action_box_right.png', ext: '.4bpp', type: 'u8' },
  'sActionHighlightLeft_Gfx': { path: 'graphics/battle_frontier/factory_screen/action_highlight_left.png', ext: '.4bpp', type: 'u8' },
  'sActionHighlightMiddle_Gfx': { path: 'graphics/battle_frontier/factory_screen/action_highlight_middle.png', ext: '.4bpp', type: 'u8' },
  'sActionHighlightRight_Gfx': { path: 'graphics/battle_frontier/factory_screen/action_highlight_right.png', ext: '.4bpp', type: 'u8' },
  'sMonPicBgAnim_Gfx': { path: 'graphics/battle_frontier/factory_screen/mon_pic_bg_anim.png', ext: '.4bpp', type: 'u8' },
  'sMonPicBg_Gfx': { path: 'graphics/battle_frontier/factory_screen/mon_pic_bg.png', ext: '.4bpp', type: 'u16' },
  'sMonPicBg_Pal': { path: 'graphics/battle_frontier/factory_screen/mon_pic_bg.png', ext: '.gbapal', type: 'u16' },
  'sSelectText_Pal': { path: 'graphics/battle_frontier/factory_screen/text.pal', ext: '.gbapal', type: 'u16' },
  'sSwapText_Pal': { path: 'graphics/battle_frontier/factory_screen/text.pal', ext: '.gbapal', type: 'u16' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sMonPicBg_Tilemap': { path: 'graphics/battle_frontier/factory_screen/mon_pic_bg.bin', type: 'u8' },
};

// ─── Function pointer tables (opcode dispatch) ──────────────────────────────
export const sSelect_MenuOptionFuncs = ['Select_OptionSummary', 'Select_OptionRentDeselect', 'Select_OptionOthers'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'SpriteCB_Pokeball', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_OpenMonPic', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'OpenMonPic', ret: "void", arity: 3, params: "u8 *, bool8 *, bool8" },
  { name: 'HideMonPic', ret: "void", arity: 2, params: "struct FactoryMonPic, bool8 *" },
  { name: 'CloseMonPic', ret: "void", arity: 3, params: "struct FactoryMonPic, bool8 *, bool8" },
  { name: 'Task_OpenMonPic', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_CloseMonPic', ret: "void", arity: 1, params: "u8" },
  { name: 'CB2_InitSelectScreen', ret: "void", arity: 0, params: "void" },
  { name: 'Select_SetWinRegs', ret: "void", arity: 4, params: "s16, s16, s16, s16" },
  { name: 'Select_InitMonsData', ret: "void", arity: 0, params: "void" },
  { name: 'Select_InitAllSprites', ret: "void", arity: 0, params: "void" },
  { name: 'Select_ReshowMonSprite', ret: "void", arity: 0, params: "void" },
  { name: 'Select_PrintSelectMonString', ret: "void", arity: 0, params: "void" },
  { name: 'Select_PrintMonSpecies', ret: "void", arity: 0, params: "void" },
  { name: 'Select_PrintMonCategory', ret: "void", arity: 0, params: "void" },
  { name: 'Select_PrintRentalPkmnString', ret: "void", arity: 0, params: "void" },
  { name: 'Select_CopyMonsToPlayerParty', ret: "void", arity: 0, params: "void" },
  { name: 'Select_ShowChosenMons', ret: "void", arity: 0, params: "void" },
  { name: 'Select_ShowYesNoOptions', ret: "void", arity: 0, params: "void" },
  { name: 'Select_HideChosenMons', ret: "void", arity: 0, params: "void" },
  { name: 'Select_ShowMenuOptions', ret: "void", arity: 0, params: "void" },
  { name: 'Select_PrintMenuOptions', ret: "void", arity: 0, params: "void" },
  { name: 'Select_PrintYesNoOptions', ret: "void", arity: 0, params: "void" },
  { name: 'Select_Task_FadeSpeciesName', ret: "void", arity: 1, params: "u8" },
  { name: 'Select_Task_OpenChosenMonPics', ret: "void", arity: 1, params: "u8" },
  { name: 'Select_Task_HandleChooseMons', ret: "void", arity: 1, params: "u8" },
  { name: 'Select_Task_HandleMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateFrontierFactorySelectableMons', ret: "void", arity: 1, params: "u8" },
  { name: 'CreateSlateportTentSelectableMons', ret: "void", arity: 1, params: "u8" },
  { name: 'Select_SetBallSpritePaletteNum', ret: "void", arity: 1, params: "u8" },
  { name: 'Select_ErasePopupMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'Select_RunMenuOptionFunc', ret: "u8", arity: 0, params: "void" },
  { name: 'Select_DeclineChosenMons', ret: "u8", arity: 0, params: "void" },
  { name: 'Select_OptionSummary', ret: "u8", arity: 0, params: "void" },
  { name: 'Select_OptionOthers', ret: "u8", arity: 0, params: "void" },
  { name: 'Select_OptionRentDeselect', ret: "u8", arity: 0, params: "void" },
  { name: 'Select_AreSpeciesValid', ret: "bool32", arity: 1, params: "u16" },
  { name: 'CB2_InitSwapScreen', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_DestroyAllSprites', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_ShowYesNoOptions', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_HideActionButtonHighlights', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_EraseSpeciesWindow', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_UpdateYesNoCursorPosition', ret: "void", arity: 1, params: "s8" },
  { name: 'Swap_UpdateMenuCursorPosition', ret: "void", arity: 1, params: "s8" },
  { name: 'Swap_ErasePopupMenu', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_Task_ScreenInfoTransitionIn', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_Task_HandleChooseMons', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_Task_ScreenInfoTransitionOut', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_PrintOnInfoWindow', ret: "void", arity: 1, params: "const u8 *" },
  { name: 'Swap_ShowMenuOptions', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_PrintMenuOptions', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_PrintYesNoOptions', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_PrintMonSpecies', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_PrintMonSpeciesAtFade', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_PrintMonSpeciesForTransition', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_PrintMonCategory', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_InitAllSprites', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_PrintPkmnSwap', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_EraseSpeciesAtFadeWindow', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_EraseActionFadeWindow', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_ShowSummaryMonSprite', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_UpdateActionCursorPosition', ret: "void", arity: 1, params: "s8" },
  { name: 'Swap_UpdateBallCursorPosition', ret: "void", arity: 1, params: "s8" },
  { name: 'Swap_RunMenuOptionFunc', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_OptionSwap', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_OptionSummary', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_OptionRechoose', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_RunActionFunc', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_TaskCantHaveSameMons', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_CreateMonSprite', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_PrintActionStrings', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_PrintActionStrings2', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_PrintOneActionString', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_InitActions', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_HighlightActionButton', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_AlreadyHasSameSpecies', ret: "bool8", arity: 1, params: "u8" },
  { name: 'Swap_ActionMon', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_ActionCancel', ret: "void", arity: 1, params: "u8" },
  { name: 'Swap_ActionPkmnForSwap', ret: "void", arity: 1, params: "u8" },
  { name: 'CB2_SelectScreen', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_SelectScreen', ret: "void", arity: 0, params: "void" },
  { name: 'DoBattleFactorySelectScreen', ret: "void", arity: 0, params: "void" },
  { name: 'Select_DestroyAllSprites', ret: "void", arity: 0, params: "void" },
  { name: 'Select_UpdateBallCursorPosition', ret: "void", arity: 1, params: "s8 direction" },
  { name: 'Select_UpdateMenuCursorPosition', ret: "void", arity: 1, params: "s8 direction" },
  { name: 'Select_UpdateYesNoCursorPosition', ret: "void", arity: 1, params: "s8 direction" },
  { name: 'Select_HandleMonSelectionChange', ret: "void", arity: 0, params: "void" },
  { name: 'Select_Task_OpenSummaryScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Select_Task_Exit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Select_Task_HandleYesNo', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Select_PrintCantSelectSameMon', ret: "void", arity: 0, params: "void" },
  { name: 'AddTextPrinterParameterized3', ret: "else", arity: 7, params: "SELECT_WIN_OPTIONS, FONT_NORMAL, 7, 17, sMenuOptionTextColors, 0, gText_Rent" },
  { name: 'Select_CreateMonSprite', ret: "void", arity: 0, params: "void" },
  { name: 'Select_SetMonPicAnimating', ret: "void", arity: 1, params: "bool8 animating" },
  { name: 'Select_CreateChosenMonsSprites', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_OpenChosenMonPics', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_CloseChosenMonPics', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'Select_Task_CloseChosenMonPics', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_CB2', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_VblankCb', ret: "void", arity: 0, params: "void" },
  { name: 'CopySwappedMonData', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_Task_OpenSummaryScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_Task_Exit', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_Task_HandleYesNo', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_HandleQuitSwappingResponse', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_AskQuitSwapping', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_HandleAcceptMonResponse', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_AskAcceptMon', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_Task_HandleMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_Task_FadeSpeciesName', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_Task_FadeOutSpeciesName', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_Task_SlideCycleBalls', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_Task_SlideButtonOnOffScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_Task_SwitchPartyScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Swap_InitStruct', ret: "void", arity: 0, params: "void" },
  { name: 'DoBattleFactorySwapScreen', ret: "void", arity: 0, params: "void" },
  { name: 'Swap_HandleActionCursorChange', ret: "void", arity: 1, params: "u8 cursorId" },
  { name: 'Swap_PrintActionString', ret: "void", arity: 3, params: "const u8 *str, u32 y, u32 windowId" },
  { name: 'SpriteCB_CloseMonPic', ret: "void", arity: 1, params: "struct Sprite *sprite" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_CloseMonPic',
  'Task_OpenMonPic',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_InitSelectScreen',
  'CB2_InitSwapScreen',
  'CB2_SelectScreen',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_factory_screen.h',
  'battle_factory.h',
  'sprite.h',
  'event_data.h',
  'overworld.h',
  'random.h',
  'battle_tower.h',
  'text.h',
  'palette.h',
  'task.h',
  'main.h',
  'malloc.h',
  'bg.h',
  'gpu_regs.h',
  'string_util.h',
  'international_string_util.h',
  'window.h',
  'data.h',
  'decompress.h',
  'pokemon_summary_screen.h',
  'sound.h',
  'pokedex.h',
  'util.h',
  'trainer_pokemon_sprites.h',
  'starter_choose.h',
  'strings.h',
  'graphics.h',
  'constants/battle_frontier.h',
  'constants/battle_tent.h',
  'constants/songs.h',
  'constants/rgb.h',
] as const;
