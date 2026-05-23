// AUTO-GENERATED from include/pokeball.h by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/include/pokeball.h
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const POKEBALL_PLAYER_SENDOUT = 255;
export const POKEBALL_OPPONENT_SENDOUT = 254;

// ─── Enums ───────────────────────────────────────────────────────────────────
export const ENUM_BALL_0 = {
  BALL_POKE: 0,
  BALL_GREAT: 1,
  BALL_SAFARI: 2,
  BALL_ULTRA: 3,
  BALL_MASTER: 4,
  BALL_NET: 5,
  BALL_DIVE: 6,
  BALL_NEST: 7,
  BALL_REPEAT: 8,
  BALL_TIMER: 9,
  BALL_LUXURY: 10,
  BALL_PREMIER: 11,
  POKEBALL_COUNT: 12,
} as const;
export const ENUM_BALL_1 = {
  BALL_AFFINE_ANIM_0: 0,
  BALL_ROTATE_RIGHT: 1,
  BALL_ROTATE_LEFT: 2,
  BALL_AFFINE_ANIM_3: 3,
  BALL_AFFINE_ANIM_4: 4,
} as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'DoPokeballSendOutAnimation', ret: "u8", arity: 2, params: "s16 pan, u8 kindOfThrow" },
  { name: 'CreatePokeballSpriteToReleaseMon', ret: "void", arity: 9, params: "u8 monSpriteId, u8 monPalNum, u8 x, u8 y, u8 oamPriority, u8 subpriority, u8 delay, u32 fadePalettes, u16 species" },
  { name: 'CreateTradePokeballSprite', ret: "u8", arity: 8, params: "u8 monSpriteId, u8 monPalNum, u8 x, u8 y, u8 oamPriority, u8 subPriority, u8 delay, u32 fadePalettes" },
  { name: 'StartHealthboxSlideIn', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'DoHitAnimHealthboxEffect', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'LoadBallGfx', ret: "void", arity: 1, params: "u8 ballId" },
  { name: 'FreeBallGfx', ret: "void", arity: 1, params: "u8 ballId" },
] as const;
