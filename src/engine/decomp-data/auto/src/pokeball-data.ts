// AUTO-GENERATED from src/pokeball.c by extract-decomp-all.mjs
// Do not edit manually — re-run `npm run extract:decomp-all` to refresh.
//
// Source: D:/Projet 1/decomps/pokeemeraude/src/pokeball.c
// Generated: 2026-04-26

// ─── #define constants ──────────────────────────────────────────────────────
export const GFX_TAG_POKE_BALL = 55000;
export const GFX_TAG_GREAT_BALL = 55001;
export const GFX_TAG_SAFARI_BALL = 55002;
export const GFX_TAG_ULTRA_BALL = 55003;
export const GFX_TAG_MASTER_BALL = 55004;
export const GFX_TAG_NET_BALL = 55005;
export const GFX_TAG_DIVE_BALL = 55006;
export const GFX_TAG_NEST_BALL = 55007;
export const GFX_TAG_REPEAT_BALL = 55008;
export const GFX_TAG_TIMER_BALL = 55009;
export const GFX_TAG_LUXURY_BALL = 55010;
export const GFX_TAG_PREMIER_BALL = 55011;
/** Raw expr: `data[0]` */
export const tFrames_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tPan_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tThrowId_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tBattler_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tOpponentBattler_EXPR = "data[4]";
/** Raw expr: `data[6]` */
export const sBattler_EXPR = "data[6]";
/** Raw expr: `data[0]` */
export const tCryTaskSpecies_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const tCryTaskPan_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const tCryTaskWantedCry_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const tCryTaskBattler_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const tCryTaskMonSpriteId_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const tCryTaskMonPtr1_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const tCryTaskMonPtr2_EXPR = "data[6]";
/** Raw expr: `data[10]` */
export const tCryTaskFrames_EXPR = "data[10]";
/** Raw expr: `data[15]` */
export const tCryTaskState_EXPR = "data[15]";
/** Raw expr: `data[7]` */
export const sSpecies_EXPR = "data[7]";
/** Raw expr: `data[0]` */
export const sMonSpriteId_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sDelay_EXPR = "data[1]";
/** Raw expr: `data[2]` */
export const sMonPalNum_EXPR = "data[2]";
/** Raw expr: `data[3]` */
export const sFadePalsLo_EXPR = "data[3]";
/** Raw expr: `data[4]` */
export const sFadePalsHi_EXPR = "data[4]";
/** Raw expr: `data[5]` */
export const sFinalMonX_EXPR = "data[5]";
/** Raw expr: `data[6]` */
export const sFinalMonY_EXPR = "data[6]";
/** Raw expr: `data[7]` */
export const sTrigIdx_EXPR = "data[7]";
/** Raw expr: `data[5]` */
export const sTimer_EXPR = "data[5]";
/** Raw expr: `data[0]` */
export const sSpeedX_EXPR = "data[0]";
/** Raw expr: `data[1]` */
export const sSpeedY_EXPR = "data[1]";
/** Raw expr: `data[1]` */
export const sDelayTimer_EXPR = "data[1]";

// ─── OamData ─────────────────────────────────────────────────────────────
export const sBallOamData = { y: 0, affineMode: "ST_OAM_AFFINE_DOUBLE", objMode: "ST_OAM_OBJ_NORMAL", mosaic: 0, bpp: "ST_OAM_4BPP", shape: "SPRITE_SHAPE(16x16)", x: 0, matrixNum: 0, size: "SPRITE_SIZE(16x16)", tileNum: 0, priority: 2, paletteNum: 0, affineParam: 0 } as const;

// ─── SpriteTemplate ─────────────────────────────────────────────────────────────
export const gBallSpriteTemplates = [
  { tileTag: "GFX_TAG_POKE_BALL", paletteTag: "GFX_TAG_POKE_BALL", oam: "&sBallOamData", anims: "sBallAnimSequences", images: 0, affineAnims: "sAffineAnim_BallRotate", callback: "SpriteCB_BallThrow" },
  { tileTag: "GFX_TAG_GREAT_BALL", paletteTag: "GFX_TAG_GREAT_BALL", oam: "&sBallOamData", anims: "sBallAnimSequences", images: 0, affineAnims: "sAffineAnim_BallRotate", callback: "SpriteCB_BallThrow" },
  { tileTag: "GFX_TAG_SAFARI_BALL", paletteTag: "GFX_TAG_SAFARI_BALL", oam: "&sBallOamData", anims: "sBallAnimSequences", images: 0, affineAnims: "sAffineAnim_BallRotate", callback: "SpriteCB_BallThrow" },
  { tileTag: "GFX_TAG_ULTRA_BALL", paletteTag: "GFX_TAG_ULTRA_BALL", oam: "&sBallOamData", anims: "sBallAnimSequences", images: 0, affineAnims: "sAffineAnim_BallRotate", callback: "SpriteCB_BallThrow" },
  { tileTag: "GFX_TAG_MASTER_BALL", paletteTag: "GFX_TAG_MASTER_BALL", oam: "&sBallOamData", anims: "sBallAnimSequences", images: 0, affineAnims: "sAffineAnim_BallRotate", callback: "SpriteCB_BallThrow" },
  { tileTag: "GFX_TAG_NET_BALL", paletteTag: "GFX_TAG_NET_BALL", oam: "&sBallOamData", anims: "sBallAnimSequences", images: 0, affineAnims: "sAffineAnim_BallRotate", callback: "SpriteCB_BallThrow" },
  { tileTag: "GFX_TAG_DIVE_BALL", paletteTag: "GFX_TAG_DIVE_BALL", oam: "&sBallOamData", anims: "sBallAnimSequences", images: 0, affineAnims: "sAffineAnim_BallRotate", callback: "SpriteCB_BallThrow" },
  { tileTag: "GFX_TAG_NEST_BALL", paletteTag: "GFX_TAG_NEST_BALL", oam: "&sBallOamData", anims: "sBallAnimSequences", images: 0, affineAnims: "sAffineAnim_BallRotate", callback: "SpriteCB_BallThrow" },
  { tileTag: "GFX_TAG_REPEAT_BALL", paletteTag: "GFX_TAG_REPEAT_BALL", oam: "&sBallOamData", anims: "sBallAnimSequences", images: 0, affineAnims: "sAffineAnim_BallRotate", callback: "SpriteCB_BallThrow" },
  { tileTag: "GFX_TAG_TIMER_BALL", paletteTag: "GFX_TAG_TIMER_BALL", oam: "&sBallOamData", anims: "sBallAnimSequences", images: 0, affineAnims: "sAffineAnim_BallRotate", callback: "SpriteCB_BallThrow" },
  { tileTag: "GFX_TAG_LUXURY_BALL", paletteTag: "GFX_TAG_LUXURY_BALL", oam: "&sBallOamData", anims: "sBallAnimSequences", images: 0, affineAnims: "sAffineAnim_BallRotate", callback: "SpriteCB_BallThrow" },
  { tileTag: "GFX_TAG_PREMIER_BALL", paletteTag: "GFX_TAG_PREMIER_BALL", oam: "&sBallOamData", anims: "sBallAnimSequences", images: 0, affineAnims: "sAffineAnim_BallRotate", callback: "SpriteCB_BallThrow" },
] as const;

// ─── Functions (declarations + definitions) ─────────────────────────────────
export const FUNCTIONS = [
  { name: 'Task_DoPokeballSendOutAnim', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'SpriteCB_PlayerMonSendOut_1', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_PlayerMonSendOut_2', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_OpponentMonSendOut', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BallThrow', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BallThrow_ReachMon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BallThrow_StartShrinkMon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BallThrow_ShrinkMon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BallThrow_Close', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BallThrow_FallToGround', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BallThrow_StartShakes', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BallThrow_Shake', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BallThrow_StartCaptureMon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_BallThrow_CaptureMon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_ReleaseMonFromBall', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_ReleaseMon2FromBall', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'HandleBallAnimEnd', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_PokeballReleaseMon', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_ReleasedMonFlyOut', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_TradePokeball', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_TradePokeballSendOff', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_TradePokeballEnd', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_HealthboxSlideInDelayed', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_HealthboxSlideIn', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'SpriteCB_HitAnimHealthoxEffect', ret: "void", arity: 1, params: "struct Sprite *sprite" },
  { name: 'GetBattlerPokeballItemId', ret: "u16", arity: 1, params: "u8 battler" },
  { name: 'DoPokeballSendOutAnimation', ret: "u8", arity: 2, params: "s16 pan, u8 kindOfThrow" },
  { name: 'ChangeSpriteAffineAnim', ret: "else", arity: 2, params: "sprite, 1" },
  { name: 'StartSpriteAffineAnim', ret: "else", arity: 2, params: "sprite, 1" },
  { name: 'Task_PlayCryWhenReleasedFromBall', ret: "void", arity: 1, params: "u8 taskId" },
  { name: 'PlayCry_ByMode', ret: "else", arity: 3, params: "species, pan, CRY_MODE_WEAK" },
  { name: 'PlayCry_ReleaseDouble', ret: "else", arity: 3, params: "species, pan, CRY_MODE_WEAK_DOUBLES" },
  { name: 'AnimateBallOpenParticlesForPokeball', ret: "u8", arity: 4, params: "u8 x, u8 y, u8 kindOfStars, u8 subpriority" },
  { name: 'LaunchBallFadeMonTaskForPokeball', ret: "u8", arity: 3, params: "bool8 unFadeLater, u8 spritePalNum, u32 selectedPalettes" },
  { name: 'CreatePokeballSpriteToReleaseMon', ret: "void", arity: 9, params: "u8 monSpriteId, u8 monPalNum, u8 x, u8 y, u8 oamPriority, u8 subpriority, u8 delay, u32 fadePalettes, u16 species" },
  { name: 'DoMonFrontSpriteAnimation', ret: "else", arity: 4, params: "&gSprites[monSpriteId], gSprites[monSpriteId].sSpecies, FALSE, 0" },
  { name: 'CreateTradePokeballSprite', ret: "u8", arity: 8, params: "u8 monSpriteId, u8 monPalNum, u8 x, u8 y, u8 oamPriority, u8 subPriority, u8 delay, u32 fadePalettes" },
  { name: 'DestroySpriteAndFreeResources_Ball', ret: "UNUSED", arity: 1, params: "struct Sprite *sprite" },
  { name: 'StartHealthboxSlideIn', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'DoHitAnimHealthboxEffect', ret: "void", arity: 1, params: "u8 battler" },
  { name: 'LoadBallGfx', ret: "void", arity: 1, params: "u8 ballId" },
  { name: 'FreeBallGfx', ret: "void", arity: 1, params: "u8 ballId" },
] as const;

// ─── Task_* (state machine entry points) ────────────────────────────────────
export const TASK_NAMES = [
  'Task_DoPokeballSendOutAnim',
  'Task_PlayCryWhenReleasedFromBall',
] as const;

// ─── #include directives (dependency graph) ─────────────────────────────────
export const INCLUDES = [
  'global.h',
  'battle.h',
  'battle_anim.h',
  'decompress.h',
  'graphics.h',
  'main.h',
  'm4a.h',
  'pokeball.h',
  'pokemon.h',
  'sound.h',
  'sprite.h',
  'task.h',
  'trig.h',
  'util.h',
  'data.h',
  'constants/songs.h',
] as const;
