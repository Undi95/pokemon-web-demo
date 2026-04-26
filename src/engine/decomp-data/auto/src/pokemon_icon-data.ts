// AUTO-GENERATED from src/pokemon_icon.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokemon_icon.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
/** Raw expr: `SPECIES_OLD_UNOWN_J` */
export const INVALID_ICON_SPECIES_EXPR = "SPECIES_OLD_UNOWN_J";

// ─── OamData ─────────────────────────────────────────────────────────────
export const sMonIconOamData = { y: 0, affineMode: "ST_OAM_AFFINE_OFF", objMode: "ST_OAM_OBJ_NORMAL", bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(32x32)", x: 0, size: "SPRITE_SIZE(32x32)", tileNum: 0, priority: 1, paletteNum: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const spriteTemplate = { tileTag: "TAG_NONE", paletteTag: "iconTemplate->paletteTag", oam: "iconTemplate->oam", anims: "iconTemplate->anims", images: "&image", affineAnims: "iconTemplate->affineAnims", callback: "iconTemplate->callback" } as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'CreateMonIconSprite', ret: "u8", arity: 4, params: "struct MonIconSpriteTemplate *, s16, s16, u8" },
  { name: 'FreeAndDestroyMonIconSprite_', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'GetIconSpecies', ret: "u16", arity: 2, params: "u16 species, u32 personality" },
  { name: 'GetUnownLetterByPersonality', ret: "u16", arity: 1, params: "u32 personality" },
  { name: 'GetIconSpeciesNoPersonality', ret: "u16", arity: 1, params: "u16 species" },
  { name: 'FreeAndDestroyMonIconSprite', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'LoadMonIconPalettes', ret: "void", arity: 0, params: "void" },
  { name: 'SafeLoadMonIconPalette', ret: "void", arity: 1, params: "u16 species" },
  { name: 'LoadMonIconPalette', ret: "void", arity: 1, params: "u16 species" },
  { name: 'FreeMonIconPalettes', ret: "void", arity: 0, params: "void" },
  { name: 'SafeFreeMonIconPalette', ret: "void", arity: 1, params: "u16 species" },
  { name: 'FreeMonIconPalette', ret: "void", arity: 1, params: "u16 species" },
  { name: 'SpriteCB_MonIcon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'TryLoadAllMonIconPalettesAtOffset', ret: "void", arity: 1, params: "u16 offset" },
  { name: 'GetValidMonIconPalIndex', ret: "u8", arity: 1, params: "u16 species" },
  { name: 'GetMonIconPaletteIndexFromSpecies', ret: "u8", arity: 1, params: "u16 species" },
  { name: 'UpdateMonIconFrame', ret: "u8", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SetPartyHPBarSprite', ret: "void", arity: 2, params: "struct Sprite *sprite, u8 animNum" },
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'graphics.h',
  'mail.h',
  'palette.h',
  'pokemon_icon.h',
  'sprite.h',
  'constants/pokemon_icon.h',
] as const;
