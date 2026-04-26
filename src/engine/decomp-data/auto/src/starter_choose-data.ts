// AUTO-GENERATED from src/starter_choose.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/starter_choose.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const STARTER_MON_COUNT = 3;
/** Raw expr: `(DISPLAY_WIDTH / 2)` */
export const STARTER_PKMN_POS_X_EXPR = "(DISPLAY_WIDTH / 2)";
export const STARTER_PKMN_POS_Y = 64;
export const TAG_POKEBALL_SELECT = 4096;
export const TAG_STARTER_CIRCLE = 4097;
/** Raw expr: `data[0]` */
export const tStarterSelection_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tPkmnSpriteId_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tCircleSpriteId_EXPR = "data[2]";
/** Raw expr: `data[0]` */
export const sTaskId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sBallId_EXPR = "data[1]";

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = { bg: 0, tilemapLeft: 3, tilemapTop: 15, width: 24, height: 4, paletteNum: 14, baseBlock: 512 } as const;
export const sWindowTemplate_ConfirmStarter = { bg: 0, tilemapLeft: 24, tilemapTop: 9, width: 5, height: 4, paletteNum: 14, baseBlock: 608 } as const;
export const sWindowTemplate_StarterLabel = { bg: 0, tilemapLeft: 0, tilemapTop: 0, width: 13, height: 4, paletteNum: 14, baseBlock: 628 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBgTemplates = [
  { bg: 0, charBaseIndex: 2, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 2, charBaseIndex: 0, mapBaseIndex: 7, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
  { bg: 3, charBaseIndex: 0, mapBaseIndex: 6, screenSize: 0, paletteMode: 0, priority: 1, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOam_Hand = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOam_Pokeball = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;
export const sOam_StarterCircle = { y: "DISPLAY_HEIGHT", affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(64x64)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(64x64)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_Hand = { tileTag: "TAG_POKEBALL_SELECT", paletteTag: "TAG_POKEBALL_SELECT", oam: "&sOam_Hand", anims: "sAnims_Hand", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_SelectionHand" } as const;
export const sSpriteTemplate_Pokeball = { tileTag: "TAG_POKEBALL_SELECT", paletteTag: "TAG_POKEBALL_SELECT", oam: "&sOam_Pokeball", anims: "sAnims_Pokeball", images: 0, affineAnims: "gDummySpriteAffineAnimTable", callback: "SpriteCB_Pokeball" } as const;
export const sSpriteTemplate_StarterCircle = { tileTag: "TAG_STARTER_CIRCLE", paletteTag: "TAG_STARTER_CIRCLE", oam: "&sOam_StarterCircle", anims: "sAnims_StarterCircle", images: 0, affineAnims: "sAffineAnims_StarterCircle", callback: "SpriteCB_StarterPokemon" } as const;

// ─── CompressedSpriteSheet ─────────────────────────────────────────────────────────────
export const sSpriteSheet_PokeballSelect = { data: "gPokeballSelection_Gfx", size: 2048, tag: "TAG_POKEBALL_SELECT" } as const;
export const sSpriteSheet_StarterCircle = { data: "sStarterCircle_Gfx", size: 2048, tag: "TAG_STARTER_CIRCLE" } as const;

// ─── SpritePalette ─────────────────────────────────────────────────────────────
export const sSpritePalettes_StarterChoose = [
  { data: "sPokeballSelection_Pal", tag: "TAG_POKEBALL_SELECT" },
  { data: "sStarterCircle_Pal", tag: "TAG_STARTER_CIRCLE" },
] as const;

// ─── GFX/PAL paths (INCGFX) ─────────────────────────────────────────────────
export const GFX_SOURCES: Record<string, { path: string; ext: string; type: string }> = {
  'gBirchBagGrass_Pal': { path: 'graphics/starter_choose/tiles.png', ext: '.gbapal', type: 'u16' },
  'sPokeballSelection_Pal': { path: 'graphics/starter_choose/pokeball_selection.png', ext: '.gbapal', type: 'u16' },
  'sStarterCircle_Pal': { path: 'graphics/starter_choose/starter_circle.png', ext: '.gbapal', type: 'u16' },
  'gBirchBagTilemap': { path: 'graphics/starter_choose/birch_bag.bin', ext: '.lz', type: 'u32' },
  'gBirchGrassTilemap': { path: 'graphics/starter_choose/birch_grass.bin', ext: '.lz', type: 'u32' },
  'gBirchBagGrass_Gfx': { path: 'graphics/starter_choose/tiles.png', ext: '.4bpp.lz', type: 'u32' },
  'gPokeballSelection_Gfx': { path: 'graphics/starter_choose/pokeball_selection.png', ext: '.4bpp.lz', type: 'u32' },
  'sStarterCircle_Gfx': { path: 'graphics/starter_choose/starter_circle.png', ext: '.4bpp.lz', type: 'u32' },
};

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CB2_StarterChoose', ret: "void", arity: 0, params: "void" },
  { name: 'ClearStarterLabel', ret: "void", arity: 0, params: "void" },
  { name: 'Task_StarterChoose', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HandleStarterChooseInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_WaitForStarterSprite', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_AskConfirmStarter', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_HandleConfirmStarterInput', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_DeclineStarter', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_MoveStarterChooseCursor', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_CreateStarterLabel', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CreateStarterPokemonLabel', ret: "void", arity: 1, params: "u8 selection" },
  { name: 'CreatePokemonFrontSprite', ret: "u8", arity: 3, params: "u16 species, u8 x, u8 y" },
  { name: 'SpriteCB_SelectionHand', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_Pokeball', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_StarterPokemon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'GetStarterPokemon', ret: "u16", arity: 1, params: "u16 chosenStarterId" },
  { name: 'VblankCB_StarterChoose', ret: "void", arity: 0, params: "void" },
  { name: 'CB2_ChooseStarter', ret: "void", arity: 0, params: "void" },
  { name: 'StartSpriteAnimIfDifferent', ret: "else", arity: 2, params: "sprite, 0" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_AskConfirmStarter',
  'Task_CreateStarterLabel',
  'Task_DeclineStarter',
  'Task_HandleConfirmStarterInput',
  'Task_HandleStarterChooseInput',
  'Task_MoveStarterChooseCursor',
  'Task_StarterChoose',
  'Task_WaitForStarterSprite',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_ChooseStarter',
  'CB2_StarterChoose',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'bg.h',
  'data.h',
  'decompress.h',
  'event_data.h',
  'gpu_regs.h',
  'international_string_util.h',
  'main.h',
  'menu.h',
  'palette.h',
  'pokedex.h',
  'pokemon.h',
  'scanline_effect.h',
  'sound.h',
  'sprite.h',
  'starter_choose.h',
  'strings.h',
  'task.h',
  'text.h',
  'text_window.h',
  'trainer_pokemon_sprites.h',
  'trig.h',
  'window.h',
  'constants/songs.h',
  'constants/rgb.h',
] as const;
