// AUTO-GENERATED from include/trainer_pokemon_sprites.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/trainer_pokemon_sprites.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const MON_PIC_AFFINE_BACK = 0;
export const MON_PIC_AFFINE_FRONT = 1;
export const MON_PIC_AFFINE_NONE = 3;
/** Raw expr: `(1 << 7)` */
export const F_MON_PIC_NO_AFFINE_EXPR = "(1 << 7)";

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'ResetAllPicSprites', ret: "bool16", arity: 0, params: "void" },
  { name: 'CreateMonPicSprite_Affine', ret: "u16", arity: 8, params: "u16 species, u32 otId, u32 personality, u8 flags, s16 x, s16 y, u8 paletteSlot, u16 paletteTag" },
  { name: 'CreateMonPicSprite_HandleDeoxys', ret: "u16", arity: 8, params: "u16 species, u32 otId, u32 personality, bool8 isFrontPic, s16 x, s16 y, u8 paletteSlot, u16 paletteTag" },
  { name: 'FreeAndDestroyMonPicSprite', ret: "u16", arity: 1, params: "u16 spriteId" },
  { name: 'CreateTrainerPicSprite', ret: "u16", arity: 6, params: "u16 species, bool8 isFrontPic, s16 x, s16 y, u8 paletteSlot, u16 paletteTag" },
  { name: 'FreeAndDestroyTrainerPicSprite', ret: "u16", arity: 1, params: "u16 spriteId" },
  { name: 'CreateTrainerCardTrainerPicSprite', ret: "u16", arity: 6, params: "u16 species, bool8 isFrontPic, u16 destX, u16 destY, u8 paletteSlot, u8 windowId" },
  { name: 'PlayerGenderToFrontTrainerPicId_Debug', ret: "u16", arity: 2, params: "u8 gender, bool8 getClass" },
] as const;
