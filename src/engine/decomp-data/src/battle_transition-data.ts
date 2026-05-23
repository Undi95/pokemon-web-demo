// AUTO-GENERATED from src/battle_transition.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_transition.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const PALTAG_UNUSED_MUGSHOT = 4106;
/** Raw expr: `(1 | ((DMA_SRC_INC | DMA_DEST_FIXED | DMA_REPEAT | DMA_16BIT | DMA_START_HBLANK | DMA_ENABLE) << 16))` */
export const B_TRANS_DMA_FLAGS_EXPR = "(1 | ((DMA_SRC_INC | DMA_DEST_FIXED | DMA_REPEAT | DMA_16BIT | DMA_START_HBLANK | DMA_ENABLE) << 16))";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[0]` */
export const tWipeStartX_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tWipeStartY_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tWipeCurrX_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tWipeCurrY_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tWipeEndX_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tWipeEndY_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tWipeXMove_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tWipeYMove_EXPR = "data[7]";
/** Raw expr: `data[8]` */
export const tWipeXDist_EXPR = "data[8]";
/** Raw expr: `data[9]` */
export const tWipeYDist_EXPR = "data[9]";
/** Raw expr: `data[10]` */
export const tWipeTemp_EXPR = "data[10]";
export const NUM_POKEBALL_TRAILS = 5;
export const SPIRAL_END = -1;
export const SPIRAL_REBOUND = -2;
export const SPIRAL_INWARD_START = 0;
export const SPIRAL_INWARD_END = 3;
export const SPIRAL_OUTWARD_START = 4;
export const SPIRAL_OUTWARD_END = 7;
export const NUM_WHITE_BARS = 8;
export const NUM_ANGLED_WIPES = 7;
export const SQUARE_SIZE = 4;
export const MARGIN_SIZE = 1;
/** Raw expr: `((DISPLAY_WIDTH - (MARGIN_SIZE * 8 * 2)) / (SQUARE_SIZE * 8))` */
export const NUM_SQUARES_PER_ROW_EXPR = "((DISPLAY_WIDTH - (MARGIN_SIZE * 8 * 2)) / (SQUARE_SIZE * 8))";
/** Raw expr: `(DISPLAY_HEIGHT / (SQUARE_SIZE * 8))` */
export const NUM_SQUARES_PER_COL_EXPR = "(DISPLAY_HEIGHT / (SQUARE_SIZE * 8))";
/** Raw expr: `(NUM_SQUARES_PER_ROW * NUM_SQUARES_PER_COL)` */
export const NUM_SQUARES_EXPR = "(NUM_SQUARES_PER_ROW * NUM_SQUARES_PER_COL)";
/** Raw expr: `data[1]` */
export const tTransitionId_EXPR = "data[1]";
/** Raw expr: `data[15]` */
export const tTransitionDone_EXPR = "data[15]";
/** Raw expr: `data[1]` */
export const tDelay_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tCounter_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const tSinIndex_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tAmplitude_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const tSinVal_EXPR = "data[1]";
/** Raw expr: `data[1]` */
export const tBlendTarget1_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tBlendTarget2_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tBlendDelay_EXPR = "data[3]";
/** Raw expr: `data[1]` */
export const tRadius_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tRadiusDelta_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tVBlankSet_EXPR = "data[3]";
/** Raw expr: `data[8]` */
export const tEndDelay_EXPR = "data[8]";
/** Raw expr: `data[1]` */
export const tTimer_EXPR = "data[1]";
/** Raw expr: `data[0]` */
export const sSide_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sDelay_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sPrevX_EXPR = "data[2]";
/** Raw expr: `data[2]` */
export const tAmplitudeVal_EXPR = "data[2]";
/** Raw expr: `data[4]` */
export const tFadeStarted_EXPR = "data[4]";
/** Raw expr: `data[1]` */
export const tX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tTopBannerX_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tBottomBannerX_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tFadeSpread_EXPR = "data[4]";
/** Raw expr: `data[13]` */
export const tOpponentSpriteId_EXPR = "data[13]";
/** Raw expr: `data[14]` */
export const tPlayerSpriteId_EXPR = "data[14]";
/** Raw expr: `data[15]` */
export const tMugshotId_EXPR = "data[15]";
/** Raw expr: `data[0]` */
export const sState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sSlideSpeed_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sSlideAccel_EXPR = "data[2]";
/** Raw expr: `data[6]` */
export const sDone_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sSlideDir_EXPR = "data[7]";
/** Raw expr: `data[1]` */
export const tEffectX_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tSpeed_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tAccel_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tDelayTimer_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tExtent_EXPR = "data[5]";
/** Raw expr: `data[2]` */
export const tGrowSpeed_EXPR = "data[2]";
/** Raw expr: `data[6]` */
export const tVibrateId_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tFlag_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sFade_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sFinished_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sDestroyAttempts_EXPR = "data[2]";
/** Raw expr: `data[6]` */
export const sIsMainSprite_EXPR = "data[6]";
/** Raw expr: `(16 << 8)` */
export const FADE_TARGET_EXPR = "(16 << 8)";
/** Raw expr: `data[2]` */
export const tShrinkStage_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const tWipeId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tDir_EXPR = "data[2]";
/** Raw expr: `data[1]` */
export const tFadeToGrayDelay_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tFadeFromGrayDelay_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tNumFades_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tFadeToGrayIncrement_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tFadeFromGrayIncrement_EXPR = "data[5]";
/** Raw expr: `data[7]` */
export const tBlend_EXPR = "data[7]";
/** Raw expr: `data[4]` */
export const tStartedFade_EXPR = "data[4]";
/** Raw expr: `data[7]` */
export const tSinDecrement_EXPR = "data[7]";
/** Raw expr: `data[2]` */
export const tPosX_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tPosY_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tRowPos_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tShrinkState_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tShrinkDelayTimer_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const tShrinkDelay_EXPR = "data[7]";
/** Raw expr: `data[2]` */
export const tSquareNum_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tFadeFlag_EXPR = "data[3]";
/** Raw expr: `data[0]` */
export const tScrollXDir_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tScrollYDir_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tScrollUpdateFlag_EXPR = "data[2]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_MOVE_0 = {
  MOVE_RIGHT: 1,
  MOVE_LEFT: 2,
  MOVE_UP: 3,
  MOVE_DOWN: 4,
} as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_UnusedBrendanLass = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_Pokeball = { tileTag: "TAG_NONE", paletteTag: "FLDEFF_PAL_TAG_POKEBALL_TRAIL", oam: "&gObjectEventBaseOam_32x32", anims: "sSpriteAnimTable_Pokeball", images: "sSpriteImage_Pokeball", affineAnims: "sSpriteAffineAnimTable_Pokeball", callback: "SpriteCB_FldEffPokeballTrail" } as const;
export const sSpriteTemplate_UnusedBrendan = { tileTag: "TAG_NONE", paletteTag: "PALTAG_UNUSED_MUGSHOT", oam: "&sOam_UnusedBrendanLass", anims: "sSpriteAnimTable_UnusedBrendanLass", images: "sImageTable_UnusedBrendan", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_MugshotTrainerPic" } as const;
export const sSpriteTemplate_UnusedLass = { tileTag: "TAG_NONE", paletteTag: "PALTAG_UNUSED_MUGSHOT", oam: "&sOam_UnusedBrendanLass", anims: "sSpriteAnimTable_UnusedBrendanLass", images: "sImageTable_UnusedLass", affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_MugshotTrainerPic" } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sBigPokeball_Tileset': { path: 'graphics/battle_transitions/big_pokeball.png', ext: '.4bpp', type: 'u32' },
  'sPokeballTrail_Tileset': { path: 'graphics/battle_transitions/pokeball_trail.png', ext: '.4bpp', type: 'u32' },
  'sPokeball_Gfx': { path: 'graphics/battle_transitions/pokeball.png', ext: '.4bpp', type: 'u8' },
  'sEliteFour_Tileset': { path: 'graphics/battle_transitions/elite_four_bg.png', ext: '.4bpp', type: 'u32' },
  'sUnusedBrendan_Gfx': { path: 'graphics/battle_transitions/unused_brendan.png', ext: '.4bpp', type: 'u8' },
  'sUnusedLass_Gfx': { path: 'graphics/battle_transitions/unused_lass.png', ext: '.4bpp', type: 'u8' },
  'sShrinkingBoxTileset': { path: 'graphics/battle_transitions/shrinking_box.png', ext: '.4bpp', type: 'u32' },
  'sEvilTeam_Palette': { path: 'graphics/battle_transitions/evil_team.pal', ext: '.gbapal', type: 'u16' },
  'sTeamAqua_Tileset': { path: 'graphics/battle_transitions/team_aqua.png', ext: '.4bpp.lz', type: 'u32' },
  'sTeamAqua_Tilemap': { path: 'graphics/battle_transitions/team_aqua.bin', ext: '.lz', type: 'u32' },
  'sTeamMagma_Tileset': { path: 'graphics/battle_transitions/team_magma.png', ext: '.4bpp.lz', type: 'u32' },
  'sTeamMagma_Tilemap': { path: 'graphics/battle_transitions/team_magma.bin', ext: '.lz', type: 'u32' },
  'sRegice_Palette': { path: 'graphics/battle_transitions/regice.pal', ext: '.gbapal', type: 'u16' },
  'sRegisteel_Palette': { path: 'graphics/battle_transitions/registeel.pal', ext: '.gbapal', type: 'u16' },
  'sRegirock_Palette': { path: 'graphics/battle_transitions/regirock.pal', ext: '.gbapal', type: 'u16' },
  'sUnused_Palette': { path: 'graphics/battle_transitions/unused.pal', ext: '.gbapal', type: 'u16' },
  'sKyogre_Tileset': { path: 'graphics/battle_transitions/kyogre.png', ext: '.4bpp.lz', type: 'u32' },
  'sKyogre_Tilemap': { path: 'graphics/battle_transitions/kyogre.bin', ext: '.lz', type: 'u32' },
  'sGroudon_Tileset': { path: 'graphics/battle_transitions/groudon.png', ext: '.4bpp.lz', type: 'u32' },
  'sGroudon_Tilemap': { path: 'graphics/battle_transitions/groudon.bin', ext: '.lz', type: 'u32' },
  'sKyogre1_Palette': { path: 'graphics/battle_transitions/kyogre_pt1.pal', ext: '.gbapal', type: 'u16' },
  'sKyogre2_Palette': { path: 'graphics/battle_transitions/kyogre_pt2.pal', ext: '.gbapal', type: 'u16' },
  'sGroudon1_Palette': { path: 'graphics/battle_transitions/groudon_pt1.pal', ext: '.gbapal', type: 'u16' },
  'sGroudon2_Palette': { path: 'graphics/battle_transitions/groudon_pt2.pal', ext: '.gbapal', type: 'u16' },
  'sRayquaza_Palette': { path: 'graphics/battle_transitions/rayquaza.pal', ext: '.gbapal', type: 'u16' },
  'sFrontierLogo_Palette': { path: 'graphics/battle_transitions/frontier_logo.png', ext: '.gbapal', type: 'u16' },
  'sFrontierLogo_Tileset': { path: 'graphics/battle_transitions/frontier_logo.png', ext: '.4bpp.lz', type: 'u32' },
  'sFrontierLogo_Tilemap': { path: 'graphics/battle_transitions/frontier_logo.bin', ext: '.lz', type: 'u32' },
  'sFrontierSquares_Palette': { path: 'graphics/battle_transitions/frontier_squares_blanktiles.png', ext: '.gbapal', type: 'u16' },
  'sFrontierSquares_FilledBg_Tileset': { path: 'graphics/battle_transitions/frontier_square_1.4bpp', ext: '.lz', type: 'u32' },
  'sFrontierSquares_EmptyBg_Tileset': { path: 'graphics/battle_transitions/frontier_square_2.4bpp', ext: '.lz', type: 'u32' },
  'sFrontierSquares_Shrink1_Tileset': { path: 'graphics/battle_transitions/frontier_square_3.4bpp', ext: '.lz', type: 'u32' },
  'sFrontierSquares_Shrink2_Tileset': { path: 'graphics/battle_transitions/frontier_square_4.4bpp', ext: '.lz', type: 'u32' },
  'sFieldEffectPal_Pokeball': { path: 'graphics/field_effects/palettes/pokeball.pal', ext: '.gbapal', type: 'u16' },
  'sMugshotPal_Sidney': { path: 'graphics/battle_transitions/sidney_bg.pal', ext: '.gbapal', type: 'u16' },
  'sMugshotPal_Phoebe': { path: 'graphics/battle_transitions/phoebe_bg.pal', ext: '.gbapal', type: 'u16' },
  'sMugshotPal_Glacia': { path: 'graphics/battle_transitions/glacia_bg.pal', ext: '.gbapal', type: 'u16' },
  'sMugshotPal_Drake': { path: 'graphics/battle_transitions/drake_bg.pal', ext: '.gbapal', type: 'u16' },
  'sMugshotPal_Champion': { path: 'graphics/battle_transitions/wallace_bg.pal', ext: '.gbapal', type: 'u16' },
  'sMugshotPal_Brendan': { path: 'graphics/battle_transitions/brendan_bg.pal', ext: '.gbapal', type: 'u16' },
  'sMugshotPal_May': { path: 'graphics/battle_transitions/may_bg.pal', ext: '.gbapal', type: 'u16' },
  'sUnusedTrainerPalette': { path: 'graphics/battle_transitions/unused_trainer.pal', ext: '.gbapal', type: 'u16' },
};

// ─── INCBIN paths (raw binary includes) ─────────────────────────────────────
export const INCBIN_SOURCES: Record<string, { path: string; type: string }> = {
  'sRegice_Tilemap': { path: 'graphics/battle_transitions/regice.bin', type: 'u32' },
  'sRegisteel_Tilemap': { path: 'graphics/battle_transitions/registeel.bin', type: 'u32' },
  'sRegirock_Tilemap': { path: 'graphics/battle_transitions/regirock.bin', type: 'u32' },
  'sRayquaza_Tilemap': { path: 'graphics/battle_transitions/rayquaza.bin', type: 'u32' },
  'sFrontierSquares_Tilemap': { path: 'graphics/battle_transitions/frontier_squares.bin', type: 'u32' },
  'sBigPokeball_Tilemap': { path: 'graphics/battle_transitions/big_pokeball_map.bin', type: 'u16' },
  'sMugshotsTilemap': { path: 'graphics/battle_transitions/elite_four_bg_map.bin', type: 'u16' },
};

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sShredSplit_SectionMoveDirs: readonly number[] = [1,-1] as const;
export const sBlackhole_Vibrations: readonly number[] = [-6,4] as const;
export const sFrontierSquaresScroll_Positions: readonly number[] = [0,16,41,22,44,2,43,21,46,27,9,48,38,5,57,59,12,63,35,28,10,53,7,49,39,23,55,1,62,17,61,30,6,34,15,51,32,58,13,45,37,52,11,24,60,19,56,33,29,50,40,54,14,3,47,20,18,25,4,36,26,42,31,8] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Transition_StartIntro', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Transition_WaitForIntro', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Transition_StartMain', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Transition_WaitForMain', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'LaunchBattleTransitionTask', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_BattleTransition', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Intro', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Blur', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Swirl', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Shuffle', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_BigPokeball', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PokeballsTrail', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ClockwiseWipe', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Ripple', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Wave', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Slice', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_WhiteBarsFade', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_GridSquares', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_AngledWipes', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Sidney', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Phoebe', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Glacia', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Drake', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Champion', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Aqua', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Magma', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Regice', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Registeel', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Regirock', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Kyogre', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Groudon', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Rayquaza', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_ShredSplit', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_Blackhole', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_BlackholePulsate', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_RectangularSpiral', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_FrontierLogoWiggle', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_FrontierLogoWave', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_FrontierSquares', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_FrontierSquaresScroll', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_FrontierSquaresSpiral', ret: "void", arity: 1, params: "u8" },
  { name: 'VBlankCB_BattleTransition', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_Swirl', ret: "void", arity: 0, params: "void" },
  { name: 'HBlankCB_Swirl', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_Shuffle', ret: "void", arity: 0, params: "void" },
  { name: 'HBlankCB_Shuffle', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_PatternWeave', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_CircularMask', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_ClockwiseWipe', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_Ripple', ret: "void", arity: 0, params: "void" },
  { name: 'HBlankCB_Ripple', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_FrontierLogoWave', ret: "void", arity: 0, params: "void" },
  { name: 'HBlankCB_FrontierLogoWave', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_Wave', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_Slice', ret: "void", arity: 0, params: "void" },
  { name: 'HBlankCB_Slice', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_WhiteBarsFade', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_WhiteBarsFade_Blend', ret: "void", arity: 0, params: "void" },
  { name: 'HBlankCB_WhiteBarsFade', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_AngledWipes', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_Rayquaza', ret: "void", arity: 0, params: "void" },
  { name: 'Blur_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Blur_Main', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Blur_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Swirl_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Swirl_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Shuffle_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Shuffle_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Aqua_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Aqua_SetGfx', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Magma_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Magma_SetGfx', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FramesCountdown', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Regi_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Regice_SetGfx', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Registeel_SetGfx', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Regirock_SetGfx', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'WeatherTrio_BgFadeBlack', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'WeatherTrio_WaitFade', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Kyogre_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Kyogre_PaletteFlash', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Kyogre_PaletteBrighten', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Groudon_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Groudon_PaletteFlash', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Groudon_PaletteBrighten', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'WeatherDuo_FadeOut', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'WeatherDuo_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'BigPokeball_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'BigPokeball_SetGfx', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'PatternWeave_Blend1', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'PatternWeave_Blend2', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'PatternWeave_FinishAppear', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'PatternWeave_CircularMask', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'PokeballsTrail_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'PokeballsTrail_Main', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'PokeballsTrail_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ClockwiseWipe_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ClockwiseWipe_TopRight', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ClockwiseWipe_Right', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ClockwiseWipe_Bottom', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ClockwiseWipe_Left', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ClockwiseWipe_TopLeft', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ClockwiseWipe_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Ripple_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Ripple_Main', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Wave_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Wave_Main', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Wave_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Slice_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Slice_Main', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Slice_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'WhiteBarsFade_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'WhiteBarsFade_StartBars', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'WhiteBarsFade_WaitBars', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'WhiteBarsFade_BlendToBlack', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'WhiteBarsFade_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'GridSquares_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'GridSquares_Main', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'GridSquares_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'AngledWipes_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'AngledWipes_SetWipeData', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'AngledWipes_DoWipe', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'AngledWipes_TryEnd', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'AngledWipes_StartNext', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ShredSplit_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ShredSplit_Main', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ShredSplit_BrokenCheck', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'ShredSplit_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Blackhole_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Blackhole_Vibrate', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Blackhole_GrowEnd', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'BlackholePulsate_Main', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'RectangularSpiral_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'RectangularSpiral_Main', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'RectangularSpiral_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierLogoWiggle_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierLogoWiggle_SetGfx', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierLogoWave_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierLogoWave_SetGfx', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierLogoWave_InitScanline', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierLogoWave_Main', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Rayquaza_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Rayquaza_SetGfx', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Rayquaza_PaletteFlash', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Rayquaza_FadeToBlack', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Rayquaza_WaitFade', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Rayquaza_SetBlack', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Rayquaza_TriRing', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquares_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquares_Draw', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquares_Shrink', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquares_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquaresSpiral_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquaresSpiral_Outward', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquaresSpiral_SetBlack', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquaresSpiral_Inward', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquaresScroll_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquaresScroll_Draw', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquaresScroll_SetBlack', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquaresScroll_Erase', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'FrontierSquaresScroll_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Mugshot_Init', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Mugshot_SetGfx', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Mugshot_ShowBanner', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Mugshot_StartOpponentSlide', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Mugshot_WaitStartPlayerSlide', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Mugshot_WaitPlayerSlide', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Mugshot_GradualWhiteFade', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Mugshot_InitFadeWhiteToBlack', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Mugshot_FadeToBlack', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'Mugshot_End', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'DoMugshotTransition', ret: "void", arity: 1, params: "u8" },
  { name: 'Mugshots_CreateTrainerPics', ret: "void", arity: 1, params: "struct Task *" },
  { name: 'VBlankCB_Mugshots', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_MugshotsFadeOut', ret: "void", arity: 0, params: "void" },
  { name: 'HBlankCB_Mugshots', ret: "void", arity: 0, params: "void" },
  { name: 'InitTransitionData', ret: "void", arity: 0, params: "void" },
  { name: 'FadeScreenBlack', ret: "void", arity: 0, params: "void" },
  { name: 'CreateIntroTask', ret: "void", arity: 5, params: "s16, s16, s16, s16, s16" },
  { name: 'SetCircularMask', ret: "void", arity: 4, params: "u16 *, s16, s16, s16" },
  { name: 'SetSinWave', ret: "void", arity: 6, params: "s16 *, s16, s16, s16, s16, s16" },
  { name: 'GetBg0TilemapDst', ret: "void", arity: 1, params: "u16 **" },
  { name: 'InitBlackWipe', ret: "void", arity: 7, params: "s16 *, s16, s16, s16, s16, s16, s16" },
  { name: 'UpdateBlackWipe', ret: "bool8", arity: 3, params: "s16 *, bool8, bool8" },
  { name: 'SetTrainerPicSlideDirection', ret: "void", arity: 2, params: "s16, s16" },
  { name: 'IncrementTrainerPicState', ret: "void", arity: 1, params: "s16" },
  { name: 'IsTrainerPicSlideDone', ret: "s16", arity: 1, params: "s16" },
  { name: 'TransitionIntro_FadeToGray', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'TransitionIntro_FadeFromGray', ret: "bool8", arity: 1, params: "struct Task *" },
  { name: 'IsIntroTaskDone', ret: "bool8", arity: 0, params: "void" },
  { name: 'UpdateRectangularSpiralLine', ret: "bool16", arity: 2, params: "const s16 *const *, struct RectangularSpiralLine *" },
  { name: 'SpriteCB_FldEffPokeballTrail', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_MugshotTrainerPic', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'SpriteCB_WhiteBarFade', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'MugshotTrainerPic_Pause', ret: "bool8", arity: 1, params: "struct Sprite *" },
  { name: 'MugshotTrainerPic_Init', ret: "bool8", arity: 1, params: "struct Sprite *" },
  { name: 'MugshotTrainerPic_Slide', ret: "bool8", arity: 1, params: "struct Sprite *" },
  { name: 'MugshotTrainerPic_SlideSlow', ret: "bool8", arity: 1, params: "struct Sprite *" },
  { name: 'MugshotTrainerPic_SlideOffscreen', ret: "bool8", arity: 1, params: "struct Sprite *" },
  { name: 'CB2_TestBattleTransition', ret: "void", arity: 0, params: "void" },
  { name: 'TestBattleTransition', ret: "UNUSED", arity: 1, params: "u8 transitionId" },
  { name: 'BattleTransition_StartOnField', ret: "void", arity: 1, params: "u8 transitionId" },
  { name: 'BattleTransition_Start', ret: "void", arity: 1, params: "u8 transitionId" },
  { name: 'IsBattleTransitionDone', ret: "bool8", arity: 0, params: "void" },
  { name: 'InitPatternWeaveTransition', ret: "void", arity: 1, params: "struct Task *task" },
  { name: 'VBlankCB_SetWinAndBlend', ret: "void", arity: 0, params: "void" },
  { name: 'FldEff_PokeballTrail', ret: "bool8", arity: 0, params: "void" },
  { name: 'Task_BattleTransition_Intro', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'GetBg0TilesDst', ret: "void", arity: 2, params: "u16 **tilemap, u16 **tileset" },
  { name: 'Task_ScrollBg', ret: "void", arity: 1, params: "u8 taskId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_AngledWipes',
  'Task_Aqua',
  'Task_BattleTransition',
  'Task_BattleTransition_Intro',
  'Task_BigPokeball',
  'Task_Blackhole',
  'Task_BlackholePulsate',
  'Task_Blur',
  'Task_Champion',
  'Task_ClockwiseWipe',
  'Task_Drake',
  'Task_FrontierLogoWave',
  'Task_FrontierLogoWiggle',
  'Task_FrontierSquares',
  'Task_FrontierSquaresScroll',
  'Task_FrontierSquaresSpiral',
  'Task_Glacia',
  'Task_GridSquares',
  'Task_Groudon',
  'Task_Intro',
  'Task_Kyogre',
  'Task_Magma',
  'Task_Phoebe',
  'Task_PokeballsTrail',
  'Task_Rayquaza',
  'Task_RectangularSpiral',
  'Task_Regice',
  'Task_Regirock',
  'Task_Registeel',
  'Task_Ripple',
  'Task_ScrollBg',
  'Task_ShredSplit',
  'Task_Shuffle',
  'Task_Sidney',
  'Task_Slice',
  'Task_Swirl',
  'Task_Wave',
  'Task_WhiteBarsFade',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_TestBattleTransition',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_transition.h',
  'battle_transition_frontier.h',
  'bg.h',
  'decompress.h',
  'event_object_movement.h',
  'field_camera.h',
  'field_effect.h',
  'field_weather.h',
  'gpu_regs.h',
  'main.h',
  'malloc.h',
  'overworld.h',
  'palette.h',
  'random.h',
  'scanline_effect.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'trig.h',
  'util.h',
  'constants/field_effects.h',
  'constants/songs.h',
  'constants/trainers.h',
  'constants/rgb.h',
] as const;
