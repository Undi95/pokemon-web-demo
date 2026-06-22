// AUTO-GENERATED from include/decoration.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/decoration.h
// Generated: 2026-04-26

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_DecorationPermission = {
  DECORPERM_SOLID_FLOOR: 0,
  DECORPERM_PASS_FLOOR: 1,
  DECORPERM_BEHIND_FLOOR: 2,
  DECORPERM_NA_WALL: 3,
  DECORPERM_SPRITE: 4,
} as const;
export const ENUM_DecorationShape = {
  DECORSHAPE_1x1: 0,
  DECORSHAPE_2x1: 1,
  DECORSHAPE_3x1: 2,
  DECORSHAPE_4x2: 3,
  DECORSHAPE_2x2: 4,
  DECORSHAPE_1x2: 5,
  DECORSHAPE_1x3: 6,
  DECORSHAPE_2x4: 7,
  DECORSHAPE_3x3: 8,
  DECORSHAPE_3x2: 9,
} as const;
export const ENUM_DecorationCategory = {
  DECORCAT_DESK: 0,
  DECORCAT_CHAIR: 1,
  DECORCAT_PLANT: 2,
  DECORCAT_ORNAMENT: 3,
  DECORCAT_MAT: 4,
  DECORCAT_POSTER: 5,
  DECORCAT_DOLL: 6,
  DECORCAT_CUSHION: 7,
  DECORCAT_COUNT: 8,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'InitDecorationContextItems', ret: "void", arity: 0, params: "void" },
  { name: 'DoSecretBaseDecorationMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowDecorationOnMap', ret: "void", arity: 3, params: "u16 mapX, u16 mapY, u16 decoration" },
  { name: 'DoPlayerRoomDecorationMenu', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'ShowDecorationCategoriesWindow', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'CopyDecorationCategoryName', ret: "void", arity: 2, params: "u8 *dest, u8 category" },
  { name: 'IsSelectedDecorInThePC', ret: "bool8", arity: 0, params: "void" },
  { name: 'AddDecorationIconObject', ret: "u8", arity: 6, params: "u8 decor, s16 x, s16 y, u8 priority, u16 tilesTag, u16 paletteTag" },
] as const;
