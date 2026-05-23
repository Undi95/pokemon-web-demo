// AUTO-GENERATED from src/pokenav_main_menu.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokenav_main_menu.c
// Generated: 2026-04-26

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sHelpBarWindowTemplate = { bg: 0, tilemapLeft: 1, tilemapTop: 22, width: 16, height: 2, paletteNum: 0, baseBlock: 54 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const gPokenavMainMenuBgTemplates = { bg: 0, charBaseIndex: 0, mapBaseIndex: 5, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 } as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sSpinningPokenavSpriteOam = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 0, paletteNum: 0 } as const;
export const sOamData_LeftHeader = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x32)", x: 0, size: "SPRITE_SIZE(64x32)", tileNum: 0, priority: 1, paletteNum: 0 } as const;
export const sOamData_SubmenuLeftHeader = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x16)", tileNum: 0, priority: 1, paletteNum: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpinningPokenavSpriteTemplate = { tileTag: 0, paletteTag: 0, oam: "&sSpinningPokenavSpriteOam", anims: "sSpinningPokenavAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_SpinningPokenav" } as const;
export const sLeftHeaderSpriteTemplate = { tileTag: 2, paletteTag: 1, oam: "&sOamData_LeftHeader", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;
export const sSubmenuLeftHeaderSpriteTemplate = { tileTag: 2, paletteTag: 2, oam: "&sOamData_SubmenuLeftHeader", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCallbackDummy" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpinningPokenavSpriteSheet = { data: "sSpinningPokenav_Gfx", size: 4096, tag: 0 } as const;
export const sMenuLeftHeaderSpriteSheet = { data: "gPokenavLeftHeaderHoennMap_Gfx", size: 3072, tag: 2 } as const;
export const sMenuLeftHeaderSpriteSheets = [
  { data: "gPokenavLeftHeaderMainMenu_Gfx", size: 32, tag: 3 },
  { data: "gPokenavLeftHeaderCondition_Gfx", size: 32, tag: 1 },
  { data: "gPokenavLeftHeaderRibbons_Gfx", size: 32, tag: 2 },
  { data: "gPokenavLeftHeaderMatchCall_Gfx", size: 32, tag: 4 },
  { data: "gPokenavLeftHeaderHoennMap_Gfx", size: 32, tag: 0 },
  { data: "gPokenavLeftHeaderHoennMap_Gfx", size: 64, tag: 0 },
] as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSpinningNavgearPalettes = { data: "sSpinningPokenav_Pal", tag: 0 } as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'sSpinningPokenav_Pal': { path: 'graphics/pokenav/nav_icon.png', ext: '.gbapal', type: 'u16' },
  'sSpinningPokenav_Gfx': { path: 'graphics/pokenav/nav_icon.png', ext: '.4bpp.lz', type: 'u32' },
  'sBlueLightCopy': { path: 'graphics/pokenav/blue_light.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Text pointer arrays (gText_*) ──────────────────────────────────────────
export const sHelpBarTexts = ['gText_Pokenav_ClearButtonList', 'gText_PokenavMap_ZoomedOutButtons', 'gText_PokenavMap_ZoomedInButtons', 'gText_PokenavCondition_MonListButtons', 'gText_PokenavCondition_MonStatusButtons', 'gText_PokenavCondition_MarkingButtons', 'gText_PokenavMatchCall_TrainerListButtons', 'gText_PokenavMatchCall_CallMenuButtons', 'gText_PokenavMatchCall_CheckTrainerButtons', 'gText_PokenavRibbons_MonListButtons', 'gText_PokenavRibbons_RibbonListButtons', 'gText_PokenavRibbons_RibbonCheckButtons'] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CleanupPokenavMainMenuResources', ret: "void", arity: 0, params: "void" },
  { name: 'LoadLeftHeaderGfxForSubMenu', ret: "void", arity: 1, params: "u32" },
  { name: 'LoadLeftHeaderGfxForMenu', ret: "void", arity: 1, params: "u32" },
  { name: 'HideLeftHeaderSubmenuSprites', ret: "void", arity: 1, params: "bool32" },
  { name: 'HideLeftHeaderSprites', ret: "void", arity: 1, params: "bool32" },
  { name: 'ShowLeftHeaderSprites', ret: "void", arity: 2, params: "u32, bool32" },
  { name: 'ShowLeftHeaderSubmenuSprites', ret: "void", arity: 2, params: "u32, bool32" },
  { name: 'MoveLeftHeader', ret: "void", arity: 4, params: "struct Sprite *, s32, s32, s32" },
  { name: 'SpriteCB_MoveLeftHeader', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'InitPokenavMainMenuResources', ret: "void", arity: 0, params: "void" },
  { name: 'CreateLeftHeaderSprites', ret: "void", arity: 0, params: "void" },
  { name: 'InitHelpBar', ret: "void", arity: 0, params: "void" },
  { name: 'LoopedTask_SlideMenuHeaderUp', ret: "u32", arity: 1, params: "s32" },
  { name: 'LoopedTask_SlideMenuHeaderDown', ret: "u32", arity: 1, params: "s32" },
  { name: 'DrawHelpBar', ret: "void", arity: 1, params: "u32" },
  { name: 'SpriteCB_SpinningPokenav', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'LoopedTask_InitPokenavMenu', ret: "u32", arity: 1, params: "s32" },
  { name: 'InitPokenavMainMenu', ret: "bool32", arity: 0, params: "void" },
  { name: 'PokenavMainMenuLoopedTaskIsActive', ret: "u32", arity: 0, params: "void" },
  { name: 'ShutdownPokenav', ret: "void", arity: 0, params: "void" },
  { name: 'WaitForPokenavShutdownFade', ret: "bool32", arity: 0, params: "void" },
  { name: 'SetActiveMenuLoopTasks', ret: "void", arity: 2, params: "void *createLoopTask, void *isLoopTaskActive" },
  { name: 'RunMainMenuLoopedTask', ret: "void", arity: 1, params: "u32 state" },
  { name: 'IsActiveMenuLoopTaskActive', ret: "u32", arity: 0, params: "void" },
  { name: 'SlideMenuHeaderUp', ret: "void", arity: 0, params: "void" },
  { name: 'SlideMenuHeaderDown', ret: "void", arity: 0, params: "void" },
  { name: 'MainMenuLoopedTaskIsBusy', ret: "bool32", arity: 0, params: "void" },
  { name: 'CopyPaletteIntoBufferUnfaded', ret: "void", arity: 3, params: "const u16 *palette, u32 bufferOffset, u32 size" },
  { name: 'Pokenav_AllocAndLoadPalettes', ret: "void", arity: 1, params: "const struct SpritePalette *palettes" },
  { name: 'PokenavFillPalette', ret: "void", arity: 2, params: "u32 palIndex, u16 fillValue" },
  { name: 'PokenavCopyPalette', ret: "void", arity: 6, params: "const u16 *src, const u16 *dest, int size, int a3, int a4, u16 *palette" },
  { name: 'PokenavFadeScreen', ret: "void", arity: 1, params: "s32 fadeType" },
  { name: 'IsPaletteFadeActive', ret: "bool32", arity: 0, params: "void" },
  { name: 'FadeToBlackExceptPrimary', ret: "void", arity: 0, params: "void" },
  { name: 'InitBgTemplates', ret: "void", arity: 2, params: "const struct BgTemplate *templates, int count" },
  { name: 'PrintHelpBarText', ret: "void", arity: 1, params: "u32 textId" },
  { name: 'WaitForHelpBar', ret: "bool32", arity: 0, params: "void" },
  { name: 'HideSpinningPokenavSprite', ret: "void", arity: 0, params: "void" },
  { name: 'LoadLeftHeaderGfxForIndex', ret: "void", arity: 1, params: "u32 menuGfxId" },
  { name: 'UpdateRegionMapRightHeaderTiles', ret: "void", arity: 1, params: "u32 menuGfxId" },
  { name: 'ShowLeftHeaderGfx', ret: "void", arity: 3, params: "u32 menuGfxId, bool32 isMain, bool32 isOnRightSide" },
  { name: 'HideMainOrSubMenuLeftHeader', ret: "void", arity: 2, params: "u32 id, bool32 onRightSide" },
  { name: 'SetLeftHeaderSpritesInvisibility', ret: "void", arity: 0, params: "void" },
  { name: 'AreLeftHeaderSpritesMoving', ret: "bool32", arity: 0, params: "void" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'pokenav.h',
  'constants/songs.h',
  'sound.h',
  'constants/rgb.h',
  'palette.h',
  'bg.h',
  'window.h',
  'strings.h',
  'graphics.h',
  'decompress.h',
  'gpu_regs.h',
  'menu.h',
  'dma3.h',
] as const;
