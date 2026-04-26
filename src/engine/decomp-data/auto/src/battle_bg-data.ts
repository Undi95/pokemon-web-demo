// AUTO-GENERATED from src/battle_bg.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/battle_bg.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const TAG_VS_LETTERS = 10000;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sStandardBattleWindowTemplates = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 0, baseBlock: 144 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 35, width: 14, height: 4, paletteNum: 0, baseBlock: 448 },
  { bg: 0, tilemapLeft: 17, tilemapTop: 35, width: 12, height: 4, paletteNum: 5, baseBlock: 400 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 55, width: 8, height: 2, paletteNum: 5, baseBlock: 768 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 55, width: 8, height: 2, paletteNum: 5, baseBlock: 784 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 800 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 816 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 55, width: 4, height: 2, paletteNum: 5, baseBlock: 656 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 57, width: 0, height: 0, paletteNum: 5, baseBlock: 664 },
  { bg: 0, tilemapLeft: 25, tilemapTop: 55, width: 4, height: 2, paletteNum: 5, baseBlock: 664 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 672 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 55, width: 8, height: 4, paletteNum: 5, baseBlock: 688 },
  { bg: 0, tilemapLeft: 25, tilemapTop: 9, width: 4, height: 4, paletteNum: 5, baseBlock: 256 },
  { bg: 1, tilemapLeft: 19, tilemapTop: 8, width: 10, height: 11, paletteNum: 5, baseBlock: 256 },
  { bg: 2, tilemapLeft: 18, tilemapTop: 0, width: 12, height: 3, paletteNum: 6, baseBlock: 366 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 3, width: 6, height: 2, paletteNum: 5, baseBlock: 32 },
  { bg: 2, tilemapLeft: 2, tilemapTop: 3, width: 6, height: 2, paletteNum: 5, baseBlock: 64 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 2, width: 6, height: 2, paletteNum: 5, baseBlock: 32 },
  { bg: 2, tilemapLeft: 2, tilemapTop: 2, width: 6, height: 2, paletteNum: 5, baseBlock: 64 },
  { bg: 1, tilemapLeft: 2, tilemapTop: 6, width: 6, height: 2, paletteNum: 5, baseBlock: 96 },
  { bg: 2, tilemapLeft: 2, tilemapTop: 6, width: 6, height: 2, paletteNum: 5, baseBlock: 128 },
  { bg: 0, tilemapLeft: 12, tilemapTop: 2, width: 6, height: 2, paletteNum: 0, baseBlock: 160 },
  { bg: 0, tilemapLeft: 4, tilemapTop: 2, width: 7, height: 2, paletteNum: 0, baseBlock: 160 },
  { bg: 0, tilemapLeft: 19, tilemapTop: 2, width: 7, height: 2, paletteNum: 0, baseBlock: 176 },
] as const;
export const sBattleArenaWindowTemplates = [
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 0, baseBlock: 144 },
  { bg: 0, tilemapLeft: 1, tilemapTop: 35, width: 14, height: 4, paletteNum: 0, baseBlock: 448 },
  { bg: 0, tilemapLeft: 17, tilemapTop: 35, width: 12, height: 4, paletteNum: 5, baseBlock: 400 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 55, width: 8, height: 2, paletteNum: 5, baseBlock: 768 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 55, width: 8, height: 2, paletteNum: 5, baseBlock: 784 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 800 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 816 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 55, width: 4, height: 2, paletteNum: 5, baseBlock: 656 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 57, width: 0, height: 0, paletteNum: 5, baseBlock: 664 },
  { bg: 0, tilemapLeft: 25, tilemapTop: 55, width: 4, height: 2, paletteNum: 5, baseBlock: 664 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 57, width: 8, height: 2, paletteNum: 5, baseBlock: 672 },
  { bg: 0, tilemapLeft: 21, tilemapTop: 55, width: 8, height: 4, paletteNum: 5, baseBlock: 688 },
  { bg: 0, tilemapLeft: 25, tilemapTop: 9, width: 4, height: 4, paletteNum: 5, baseBlock: 256 },
  { bg: 1, tilemapLeft: 19, tilemapTop: 8, width: 10, height: 11, paletteNum: 5, baseBlock: 256 },
  { bg: 2, tilemapLeft: 18, tilemapTop: 0, width: 12, height: 3, paletteNum: 6, baseBlock: 366 },
  { bg: 0, tilemapLeft: 6, tilemapTop: 1, width: 8, height: 2, paletteNum: 5, baseBlock: 256 },
  { bg: 0, tilemapLeft: 14, tilemapTop: 1, width: 2, height: 2, paletteNum: 5, baseBlock: 272 },
  { bg: 0, tilemapLeft: 16, tilemapTop: 1, width: 8, height: 2, paletteNum: 5, baseBlock: 276 },
  { bg: 0, tilemapLeft: 12, tilemapTop: 4, width: 6, height: 2, paletteNum: 5, baseBlock: 292 },
  { bg: 0, tilemapLeft: 11, tilemapTop: 6, width: 8, height: 2, paletteNum: 5, baseBlock: 304 },
  { bg: 0, tilemapLeft: 12, tilemapTop: 8, width: 6, height: 2, paletteNum: 5, baseBlock: 320 },
  { bg: 0, tilemapLeft: 8, tilemapTop: 11, width: 14, height: 2, paletteNum: 5, baseBlock: 332 },
  { bg: 0, tilemapLeft: 2, tilemapTop: 15, width: 27, height: 4, paletteNum: 7, baseBlock: 144 },
] as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const gBattleBgTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 24, screenSize: 2, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 1, mapBaseIndex: 28, screenSize: 2, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 1, mapBaseIndex: 30, screenSize: 1, paletteMode: 0, priority: 1, baseTile: 0 },
  { bg: 3, charBaseIndex: 2, mapBaseIndex: 26, screenSize: 1, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sVsLetter_V_OamData = { y: 0, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 0, paletteNum: 0, affineParam: 0 } as const;
export const sVsLetter_S_OamData = { y: 0, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 64, priority: 0, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sVsLetter_V_SpriteTemplate = { tileTag: "TAG_VS_LETTERS", paletteTag: "TAG_VS_LETTERS", oam: "&sVsLetter_V_OamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sVsLetterAffineAnimTable", callback: "SpriteCB_VsLetterDummy" } as const;
export const sVsLetter_S_SpriteTemplate = { tileTag: "TAG_VS_LETTERS", paletteTag: "TAG_VS_LETTERS", oam: "&sVsLetter_S_OamData", anims: "gDummySpriteAnimTable", images: 0, affineAnims: "sVsLetterAffineAnimTable", callback: "SpriteCB_VsLetterDummy" } as const;

// ─── Numeric arrays (raw data tables) ───────────────────────────────────────
export const sUnrefArray: readonly number[] = [768,0] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_UnusedBattleInit', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'UnusedBattleInit', ret: "UNUSED", arity: 0, params: "void" },
  { name: 'BattleInitBgsAndWindows', ret: "void", arity: 0, params: "void" },
  { name: 'InitBattleBgsVideo', ret: "void", arity: 0, params: "void" },
  { name: 'LoadBattleMenuWindowGfx', ret: "void", arity: 0, params: "void" },
  { name: 'DrawMainBattleBackground', ret: "void", arity: 0, params: "void" },
  { name: 'LoadBattleTextboxAndBackground', ret: "void", arity: 0, params: "void" },
  { name: 'DrawLinkBattleParticipantPokeballs', ret: "void", arity: 5, params: "u8 taskId, u8 multiplayerId, u8 bgId, u8 destX, u8 destY" },
  { name: 'DrawLinkBattleVsScreenOutcomeText', ret: "void", arity: 0, params: "void" },
  { name: 'InitLinkBattleVsScreen', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'DrawBattleEntryBackground', ret: "void", arity: 0, params: "void" },
  { name: 'LoadChosenBattleElement', ret: "bool8", arity: 1, params: "u8 caseId" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_bg.h',
  'battle_main.h',
  'battle_message.h',
  'battle_setup.h',
  'bg.h',
  'data.h',
  'decompress.h',
  'gpu_regs.h',
  'graphics.h',
  'link.h',
  'main.h',
  'menu.h',
  'overworld.h',
  'palette.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'text_window.h',
  'trig.h',
  'window.h',
  'constants/map_types.h',
  'constants/rgb.h',
  'constants/songs.h',
  'constants/trainers.h',
] as const;
