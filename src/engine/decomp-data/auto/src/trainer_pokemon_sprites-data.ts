// AUTO-GENERATED from src/trainer_pokemon_sprites.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/trainer_pokemon_sprites.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const PICS_COUNT = 8;
/** Raw expr: `max(MON_PIC_SIZE, TRAINER_PIC_SIZE)` */
export const PIC_SPRITE_SIZE_EXPR = "max(MON_PIC_SIZE, TRAINER_PIC_SIZE)";
/** Raw expr: `max(MAX_MON_PIC_FRAMES, MAX_TRAINER_PIC_FRAMES)` */
export const MAX_PIC_FRAMES_EXPR = "max(MAX_MON_PIC_FRAMES, MAX_TRAINER_PIC_FRAMES)";

// ─── OamData ─────────────────────────────────────────────────────────────
export const sOamData_Normal = { shape: "SPRITE_SHAPE(64x64)", size: "SPRITE_SIZE(64x64)" } as const;
export const sOamData_Affine = { affineMode: "ST_OAM_AFFINE_NORMAL", shape: "SPRITE_SHAPE(64x64)", size: "SPRITE_SIZE(64x64)" } as const;

// ─── EWRAM/IWRAM/COMMON_DATA globals (initial values) ──────────────────────
export const SEGMENT_VARS = [
  { segment: 'EWRAM_DATA', type: "struct SpriteTemplate", name: 'sCreatingSpriteTemplate', isArray: false, init: "{}" },
  { segment: 'EWRAM_DATA', type: "struct PicData", name: 'sSpritePics', isArray: true, init: "{}" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DummyPicSpriteCallback', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'ResetAllPicSprites', ret: "bool16", arity: 0, params: "void" },
  { name: 'DecompressPic', ret: "bool16", arity: 6, params: "u16 picId, u32 personality, bool8 isFrontPic, u8 *dest, bool8 isTrainer, bool8 ignoreDeoxys" },
  { name: 'LoadSpecialPokePic_DontHandleDeoxys', ret: "else", arity: 5, params: "&gMonFrontPicTable[species], dest, species, personality, isFrontPic" },
  { name: 'DecompressPic_HandleDeoxys', ret: "bool16", arity: 5, params: "u16 species, u32 personality, bool8 isFrontPic, u8 *dest, bool8 isTrainer" },
  { name: 'LoadPicPaletteByTagOrSlot', ret: "void", arity: 6, params: "u16 species, u32 otId, u32 personality, u8 paletteSlot, u16 paletteTag, bool8 isTrainer" },
  { name: 'LoadPicPaletteBySlot', ret: "void", arity: 5, params: "u16 species, u32 otId, u32 personality, u8 paletteSlot, bool8 isTrainer" },
  { name: 'AssignSpriteAnimsTable', ret: "void", arity: 1, params: "bool8 isTrainer" },
  { name: 'CreatePicSprite', ret: "u16", arity: 10, params: "u16 species, u32 otId, u32 personality, bool8 isFrontPic, s16 x, s16 y, u8 paletteSlot, u16 paletteTag, bool8 isTrainer, bool8 ignoreDeoxys" },
  { name: 'CreatePicSprite_HandleDeoxys', ret: "u16", arity: 9, params: "u16 species, u32 otId, u32 personality, bool8 isFrontPic, s16 x, s16 y, u8 paletteSlot, u16 paletteTag, bool8 isTrainer" },
  { name: 'CreateMonPicSprite_Affine', ret: "u16", arity: 8, params: "u16 species, u32 otId, u32 personality, u8 flags, s16 x, s16 y, u8 paletteSlot, u16 paletteTag" },
  { name: 'FreeAndDestroyPicSpriteInternal', ret: "u16", arity: 1, params: "u16 spriteId" },
  { name: 'LoadPicSpriteInWindow', ret: "u16", arity: 7, params: "u16 species, u32 otId, u32 personality, bool8 isFrontPic, u8 paletteSlot, u8 windowId, bool8 isTrainer" },
  { name: 'CreateTrainerCardSprite', ret: "u16", arity: 9, params: "u16 species, u32 otId, u32 personality, bool8 isFrontPic, u16 destX, u16 destY, u8 paletteSlot, u8 windowId, bool8 isTrainer" },
  { name: 'CreateMonPicSprite', ret: "u16", arity: 9, params: "u16 species, u32 otId, u32 personality, bool8 isFrontPic, s16 x, s16 y, u8 paletteSlot, u16 paletteTag, bool8 ignoreDeoxys" },
  { name: 'CreateMonPicSprite_HandleDeoxys', ret: "u16", arity: 8, params: "u16 species, u32 otId, u32 personality, bool8 isFrontPic, s16 x, s16 y, u8 paletteSlot, u16 paletteTag" },
  { name: 'FreeAndDestroyMonPicSprite', ret: "u16", arity: 1, params: "u16 spriteId" },
  { name: 'LoadMonPicInWindow', ret: "UNUSED", arity: 6, params: "u16 species, u32 otId, u32 personality, bool8 isFrontPic, u8 paletteSlot, u8 windowId" },
  { name: 'CreateTrainerCardMonIconSprite', ret: "u16", arity: 8, params: "u16 species, u32 otId, u32 personality, bool8 isFrontPic, u16 destX, u16 destY, u8 paletteSlot, u8 windowId" },
  { name: 'CreateTrainerPicSprite', ret: "u16", arity: 6, params: "u16 species, bool8 isFrontPic, s16 x, s16 y, u8 paletteSlot, u16 paletteTag" },
  { name: 'FreeAndDestroyTrainerPicSprite', ret: "u16", arity: 1, params: "u16 spriteId" },
  { name: 'LoadTrainerPicInWindow', ret: "UNUSED", arity: 4, params: "u16 species, bool8 isFrontPic, u8 paletteSlot, u8 windowId" },
  { name: 'CreateTrainerCardTrainerPicSprite', ret: "u16", arity: 6, params: "u16 species, bool8 isFrontPic, u16 destX, u16 destY, u8 paletteSlot, u8 windowId" },
  { name: 'PlayerGenderToFrontTrainerPicId_Debug', ret: "u16", arity: 2, params: "u8 gender, bool8 getClass" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'sprite.h',
  'window.h',
  'malloc.h',
  'palette.h',
  'decompress.h',
  'trainer_pokemon_sprites.h',
  'data.h',
  'pokemon.h',
  'constants/trainers.h',
] as const;
