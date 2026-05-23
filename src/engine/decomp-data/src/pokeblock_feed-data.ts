// AUTO-GENERATED from src/pokeblock_feed.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokeblock_feed.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MON_X = 48;
export const MON_Y = 80;
export const ANIM_HARDY = 0;
/** Raw expr: `(ANIM_HARDY + 3)` */
export const ANIM_LONELY_EXPR = "(ANIM_HARDY + 3)";
/** Raw expr: `(ANIM_LONELY + 1)` */
export const ANIM_BRAVE_EXPR = "(ANIM_LONELY + 1)";
/** Raw expr: `(ANIM_BRAVE + 1)` */
export const ANIM_ADAMANT_EXPR = "(ANIM_BRAVE + 1)";
/** Raw expr: `(ANIM_ADAMANT + 5)` */
export const ANIM_NAUGHTY_EXPR = "(ANIM_ADAMANT + 5)";
/** Raw expr: `(ANIM_NAUGHTY + 3)` */
export const ANIM_BOLD_EXPR = "(ANIM_NAUGHTY + 3)";
/** Raw expr: `(ANIM_BOLD + 2)` */
export const ANIM_DOCILE_EXPR = "(ANIM_BOLD + 2)";
/** Raw expr: `(ANIM_DOCILE + 1)` */
export const ANIM_RELAXED_EXPR = "(ANIM_DOCILE + 1)";
/** Raw expr: `(ANIM_RELAXED + 2)` */
export const ANIM_IMPISH_EXPR = "(ANIM_RELAXED + 2)";
/** Raw expr: `(ANIM_IMPISH + 1)` */
export const ANIM_LAX_EXPR = "(ANIM_IMPISH + 1)";
/** Raw expr: `(ANIM_LAX + 1)` */
export const ANIM_TIMID_EXPR = "(ANIM_LAX + 1)";
/** Raw expr: `(ANIM_TIMID + 5)` */
export const ANIM_HASTY_EXPR = "(ANIM_TIMID + 5)";
/** Raw expr: `(ANIM_HASTY + 2)` */
export const ANIM_SERIOUS_EXPR = "(ANIM_HASTY + 2)";
/** Raw expr: `(ANIM_SERIOUS + 1)` */
export const ANIM_JOLLY_EXPR = "(ANIM_SERIOUS + 1)";
/** Raw expr: `(ANIM_JOLLY + 1)` */
export const ANIM_NAIVE_EXPR = "(ANIM_JOLLY + 1)";
/** Raw expr: `(ANIM_NAIVE + 4)` */
export const ANIM_MODEST_EXPR = "(ANIM_NAIVE + 4)";
/** Raw expr: `(ANIM_MODEST + 3)` */
export const ANIM_MILD_EXPR = "(ANIM_MODEST + 3)";
/** Raw expr: `(ANIM_MILD + 1)` */
export const ANIM_QUIET_EXPR = "(ANIM_MILD + 1)";
/** Raw expr: `(ANIM_QUIET + 2)` */
export const ANIM_BASHFUL_EXPR = "(ANIM_QUIET + 2)";
/** Raw expr: `(ANIM_BASHFUL + 3)` */
export const ANIM_RASH_EXPR = "(ANIM_BASHFUL + 3)";
/** Raw expr: `(ANIM_RASH + 3)` */
export const ANIM_CALM_EXPR = "(ANIM_RASH + 3)";
/** Raw expr: `(ANIM_CALM + 1)` */
export const ANIM_GENTLE_EXPR = "(ANIM_CALM + 1)";
/** Raw expr: `(ANIM_GENTLE + 1)` */
export const ANIM_SASSY_EXPR = "(ANIM_GENTLE + 1)";
/** Raw expr: `(ANIM_SASSY + 1)` */
export const ANIM_CAREFUL_EXPR = "(ANIM_SASSY + 1)";
/** Raw expr: `(ANIM_CAREFUL + 5)` */
export const ANIM_QUIRKY_EXPR = "(ANIM_CAREFUL + 5)";
/** Raw expr: `data[0]` */
export const tState_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tHorizontalThrow_EXPR = "data[1]";
export const STATE_START_THROW = 255;
/** Raw expr: `(STATE_START_THROW + 14)` */
export const STATE_SPAWN_PBLOCK_EXPR = "(STATE_START_THROW + 14)";
/** Raw expr: `(STATE_SPAWN_PBLOCK + 12)` */
export const STATE_START_JUMP_EXPR = "(STATE_SPAWN_PBLOCK + 12)";
/** Raw expr: `(STATE_START_JUMP + 16)` */
export const STATE_PRINT_MSG_EXPR = "(STATE_START_JUMP + 16)";
/** Raw expr: `data[0]` */
export const sSpeed_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sAccel_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sSpecies_EXPR = "data[2]";

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_ANIMDATA_0 = {
  ANIMDATA_ROT_IDX: 0,
  ANIMDATA_ROT_SPEED: 1,
  ANIMDATA_SIN_AMPLITUDE: 2,
  ANIMDATA_COS_AMPLITUDE: 3,
  ANIMDATA_TIME: 4,
  ANIMDATA_ROT_ACCEL: 5,
  ANIMDATA_TARGET_X: 6,
  ANIMDATA_TARGET_Y: 7,
  ANIMDATA_APPR_TIME: 8,
  ANIMDATA_IS_LAST: 9,
  NUM_ANIMDATA: 10,
} as const;
export const ENUM_AFFINE_1 = {
  AFFINE_NONE: 0,
  AFFINE_TURN_UP: 1,
  AFFINE_TURN_UP_AND_DOWN: 2,
  AFFINE_TURN_DOWN: 3,
  AFFINE_TURN_DOWN_SLOW: 4,
  AFFINE_TURN_DOWN_SLIGHT: 5,
  AFFINE_TURN_UP_HIGH: 6,
  AFFINE_UNUSED_1: 7,
  AFFINE_UNUSED_2: 8,
  AFFINE_UNUSED_3: 9,
  NUM_MON_AFFINES: 10,
} as const;

// ─── WindowTemplate ─────────────────────────────────────────────────────────────
export const sWindowTemplates = { bg: 0, tilemapLeft: 1, tilemapTop: 15, width: 28, height: 4, paletteNum: 15, baseBlock: 10 } as const;

// ─── BgTemplate ─────────────────────────────────────────────────────────────
export const sBackgroundTemplates = [
  { bg: 0, charBaseIndex: 0, mapBaseIndex: 31, screenSize: 0, paletteMode: 0, priority: 0, baseTile: 0 },
  { bg: 1, charBaseIndex: 2, mapBaseIndex: 30, screenSize: 0, paletteMode: 0, priority: 3, baseTile: 0 },
] as const;

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_Pokeblock = { y: 0, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(8x8)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(8x8)", tileNum: 0, priority: 1, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const sSpriteTemplate_Pokeblock = { tileTag: "TAG_POKEBLOCK", paletteTag: "TAG_POKEBLOCK", oam: "&sOamData_Pokeblock", anims: "sAnims_Pokeblock", images: 0, affineAnims: "sAffineAnims_Pokeblock", callback: "SpriteCB_ThrownPokeblock" } as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct CompressedSpritePalette", name: 'sPokeblockSpritePal', isArray: false, init: "{0}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'HandleInitBackgrounds', ret: "void", arity: 0, params: "void" },
  { name: 'HandleInitWindows', ret: "void", arity: 0, params: "void" },
  { name: 'LaunchPokeblockFeedTask', ret: "void", arity: 0, params: "void" },
  { name: 'SetPokeblockSpritePal', ret: "void", arity: 1, params: "u8" },
  { name: 'CalculateMonAnimLength', ret: "void", arity: 0, params: "void" },
  { name: 'DoPokeblockCaseThrowEffect', ret: "void", arity: 2, params: "u8, bool8" },
  { name: 'StartMonJumpForPokeblock', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_PrintAtePokeblockMessage', ret: "void", arity: 1, params: "u8" },
  { name: 'Task_FadeOutPokeblockFeed', ret: "void", arity: 1, params: "u8" },
  { name: 'UpdateMonAnim', ret: "void", arity: 0, params: "void" },
  { name: 'SpriteCB_MonJumpForPokeblock', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CalculateMonAnimMovement', ret: "void", arity: 0, params: "void" },
  { name: 'CalculateMonAnimMovementEnd', ret: "void", arity: 0, params: "void" },
  { name: 'InitMonAnimStage', ret: "bool8", arity: 0, params: "void" },
  { name: 'FreeMonSpriteOamMatrix', ret: "bool8", arity: 0, params: "void" },
  { name: 'DoMonAnimStep', ret: "bool8", arity: 0, params: "void" },
  { name: 'LoadMonAndSceneGfx', ret: "bool8", arity: 1, params: "struct Pokemon *" },
  { name: 'CreatePokeblockSprite', ret: "u8", arity: 0, params: "void" },
  { name: 'CreatePokeblockCaseSpriteForFeeding', ret: "u8", arity: 0, params: "void" },
  { name: 'CreateMonSprite', ret: "u8", arity: 1, params: "struct Pokemon *" },
  { name: 'SpriteCB_ThrownPokeblock', ret: "void", arity: 1, params: "struct Sprite *" },
  { name: 'CB2_PokeblockFeed', ret: "void", arity: 0, params: "void" },
  { name: 'VBlankCB_PokeblockFeed', ret: "void", arity: 0, params: "void" },
  { name: 'LoadPokeblockFeedScene', ret: "bool8", arity: 0, params: "void" },
  { name: 'PreparePokeblockFeedScene', ret: "void", arity: 0, params: "void" },
  { name: 'Task_HandlePokeblockFeed', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'Task_WaitForAtePokeblockMessage', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'StringExpandPlaceholders', ret: "else", arity: 2, params: "gStringVar4, gText_Var1DisdainfullyAteVar2" },
  { name: 'Task_ExitPokeblockFeed', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'StartSpriteAffineAnim', ret: "else", arity: 2, params: "pokeblockFeed->monSpritePtr, sNatureToMonPokeblockAnim[pokeblockFeed->nature][1]" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_ExitPokeblockFeed',
  'Task_FadeOutPokeblockFeed',
  'Task_HandlePokeblockFeed',
  'Task_PrintAtePokeblockMessage',
  'Task_WaitForAtePokeblockMessage',
] as const;

// ─── CB2_* (callback / scene entry points) ──────────────────────────────────
export const CB2_NAMES = [
  'CB2_PokeblockFeed',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'malloc.h',
  'battle.h',
  'bg.h',
  'data.h',
  'decompress.h',
  'event_data.h',
  'gpu_regs.h',
  'graphics.h',
  'item_menu.h',
  'main.h',
  'menu.h',
  'menu_helpers.h',
  'm4a.h',
  'palette.h',
  'party_menu.h',
  'pokeblock.h',
  'pokemon.h',
  'sprite.h',
  'string_util.h',
  'strings.h',
  'sound.h',
  'task.h',
  'text_window.h',
  'trig.h',
  'util.h',
  'constants/rgb.h',
] as const;
